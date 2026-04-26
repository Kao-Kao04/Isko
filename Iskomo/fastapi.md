IskoMo — FastAPI Backend Plan
1. Feature Breakdown
Auth & Identity

Student registration with PUP academic profile (college, program, year level)
OSFA Staff login (seeded/admin-created accounts)
JWT access + refresh token pair
Role-based access control: student | osfa_staff
Scholarship Management (OSFA)

Full CRUD for scholarships
Status lifecycle: Draft → Active → Closed → Archived
Per-scholarship document requirements checklist
College/program eligibility restrictions
Duplicate scholarship
Auto-close on deadline (background task)
Application Management (Student + OSFA)

Student submits application with document uploads
Student resubmits after Incomplete decision
Student withdraws Pending/Incomplete application
OSFA reviews: Approve / Reject / Mark Incomplete with flagged docs
Bulk approve/reject from applicant list
Eligibility guard on submission
Document Management

Per-application file uploads (PDF, JPG, PNG — max 5 MB)
Upload stored in Supabase Storage / S3
OSFA flags specific docs as missing/invalid (rejectedDocs)
Document status tracked per applicant
Audit Trail

Every status change appended to audit_entries table
Immutable — insert-only, never updated
Notifications

System-generated on: apply, approve, reject, incomplete, resubmit, deadline
Student reads own notifications
Mark read / mark all read / dismiss
Scholar Lifecycle (OSFA)

Approve transitions applicant to scholars state
Semester records: GWA, enrollment verification, notes
Scholar status: Active → Probationary → Terminated / Graduated
Graduating flag + expected graduation date
Appeal System

Student files appeal on Rejected application (text reason)
OSFA reviews: Approve / Deny with review note
Reports (OSFA)

Overview stats: totals per status, fill rates, active scholars
Per-scholarship breakdown
Application trends over time
2. API Design
Auth

POST   /api/auth/register        Register new student account
POST   /api/auth/login           Login (student or OSFA), returns JWT pair
POST   /api/auth/refresh         Exchange refresh token for new access token
POST   /api/auth/logout          Invalidate refresh token
GET    /api/auth/me              Get current user profile
Users

GET    /api/users/me             Get own full profile
PUT    /api/users/me             Update own profile
GET    /api/users                [OSFA] List all users (paginated + search)
GET    /api/users/{id}           [OSFA] Get single user profile
Scholarships

GET    /api/scholarships                   List scholarships (student: Active only; OSFA: all)
GET    /api/scholarships/{id}              Get scholarship detail (includes requirements)
POST   /api/scholarships                   [OSFA] Create new scholarship (starts as Draft)
PUT    /api/scholarships/{id}              [OSFA] Update scholarship fields
DELETE /api/scholarships/{id}             [OSFA] Permanently delete
PATCH  /api/scholarships/{id}/status      [OSFA] Publish / Close / Archive / Reopen
POST   /api/scholarships/{id}/duplicate   [OSFA] Clone as new Draft
Applications

GET    /api/applications                          Student: own list; OSFA: all (filtered + paginated)
GET    /api/applications/{id}                     Get application detail
POST   /api/applications                          [Student] Submit new application
PUT    /api/applications/{id}                     [Student] Resubmit (only when Incomplete)
DELETE /api/applications/{id}                    [Student] Withdraw (Pending/Incomplete only)
PATCH  /api/applications/{id}/status             [OSFA] Approve / Reject / Mark Incomplete
PATCH  /api/applications/{id}/eval-status        [OSFA] Update evaluation status
POST   /api/applications/{id}/appeal             [Student] File appeal (only on Rejected)
PATCH  /api/applications/{id}/appeal             [OSFA] Review appeal (Approve / Deny)
GET    /api/applications/{id}/audit              Get full audit trail for application
Documents

POST   /api/applications/{id}/documents           Upload document file
GET    /api/applications/{id}/documents           List documents for an application
DELETE /api/applications/{id}/documents/{doc_id}  Delete a document
PATCH  /api/applications/{id}/documents/flag      [OSFA] Set rejectedDocs list
Notifications

GET    /api/notifications                List own notifications (paginated)
PATCH  /api/notifications/{id}/read     Mark single notification as read
PATCH  /api/notifications/read-all      Mark all as read
DELETE /api/notifications/{id}          Dismiss notification
Scholars

GET    /api/scholars                             [OSFA] List all active scholars (paginated)
GET    /api/scholars/{id}                        Get scholar detail + semester records
PATCH  /api/scholars/{id}/status                [OSFA] Update scholar status
POST   /api/scholars/{id}/semester-records      [OSFA] Add semester record
PUT    /api/scholars/{id}/semester-records/{rid} [OSFA] Edit semester record
Reports

GET    /api/reports/overview           [OSFA] Dashboard stats (counts by status, fill rates)
GET    /api/reports/scholarships       [OSFA] Per-scholarship applicant breakdown
GET    /api/reports/applications       [OSFA] Application trends (by date, status)
3. Project Structure

backend/
├── app/
│   ├── main.py                  # FastAPI app init, middleware, router inclusion
│   ├── config.py                # Pydantic Settings (reads .env)
│   ├── database.py              # Async SQLAlchemy engine + session factory
│   ├── dependencies.py          # get_db, get_current_user, require_osfa, require_student
│   │
│   ├── models/                  # SQLAlchemy ORM table definitions
│   │   ├── user.py              # users, student_profiles
│   │   ├── scholarship.py       # scholarships, scholarship_requirements
│   │   ├── application.py       # applications
│   │   ├── document.py          # application_documents
│   │   ├── audit.py             # audit_entries
│   │   ├── notification.py      # notifications
│   │   ├── scholar.py           # semester_records
│   │   └── appeal.py            # appeals
│   │
│   ├── schemas/                 # Pydantic v2 request + response models
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── scholarship.py
│   │   ├── application.py
│   │   ├── document.py
│   │   ├── notification.py
│   │   ├── scholar.py
│   │   └── common.py            # PaginatedResponse, ErrorResponse
│   │
│   ├── routers/                 # Thin route handlers — delegate to services
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── scholarships.py
│   │   ├── applications.py
│   │   ├── documents.py
│   │   ├── notifications.py
│   │   ├── scholars.py
│   │   └── reports.py
│   │
│   ├── services/                # All business logic lives here
│   │   ├── auth_service.py      # Token creation, password verify, register logic
│   │   ├── scholarship_service.py
│   │   ├── application_service.py  # Eligibility check, status transitions
│   │   ├── document_service.py  # Upload to storage, flag logic
│   │   ├── notification_service.py # Create + dispatch notifications
│   │   ├── scholar_service.py
│   │   └── report_service.py
│   │
│   └── utils/
│       ├── security.py          # JWT encode/decode, bcrypt hashing
│       ├── storage.py           # Supabase Storage / S3 presigned URL helpers
│       ├── pagination.py        # Reusable offset/limit pagination helper
│       └── audit.py             # append_audit() helper
│
├── alembic/
│   ├── env.py
│   └── versions/                # Auto-generated migration files
│
├── tests/
│   ├── conftest.py              # Pytest fixtures, test DB setup
│   ├── test_auth.py
│   ├── test_scholarships.py
│   ├── test_applications.py
│   └── test_documents.py
│
├── .env
├── .env.example
├── alembic.ini
├── requirements.txt
└── README.md
4. Tech Decisions
Framework Setup
FastAPI with Uvicorn (ASGI). All routes are async. The app is structured as a factory in main.py — router modules are registered there, keeping the entry point clean.

Database
PostgreSQL via SQLAlchemy 2.0 async (asyncpg driver). Alembic handles all schema migrations. No raw SQL — all queries go through the ORM or SQLAlchemy core expressions in service files.

Middleware

CORSMiddleware — allows the Next.js frontend origin (localhost:3000 in dev, production domain in prod)
TrustedHostMiddleware — production hardening
Custom request logging middleware for audit/debug
Auth
JWT with two tokens: short-lived access token (15 min) and long-lived refresh token (7 days, stored in httpOnly cookie). Roles encoded in the JWT payload. dependencies.py exports get_current_user, require_student, and require_osfa — injected into routes via FastAPI's Depends().

Validation
Pydantic v2 for all request bodies and response models. Separate CreateSchema / UpdateSchema / ResponseSchema per resource. Common PaginatedResponse[T] generic wrapper for list endpoints.

Error Handling
Centralized exception handlers registered in main.py:

RequestValidationError → 422 with field-level detail
Custom AppException base class → structured { code, message, detail } JSON for all 4xx/5xx
Unhandled exceptions → 500 with sanitized message (no stack trace in production)
File Storage
Documents uploaded via multipart form to /documents. Files are validated (type + size) in document_service.py, then streamed to Supabase Storage (or S3). Only the storage path/URL is saved to the database — never the file binary.
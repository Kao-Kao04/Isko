IskoMo — Supabase Database Schema Plan
1. Tables
Table	Purpose
profiles	Extends auth.users — base identity for all users
student_profiles	PUP academic + family details for students
scholarships	Scholarship programs managed by OSFA
scholarship_requirements	Document checklist per scholarship
scholarship_colleges	Eligible colleges per scholarship (junction)
scholarship_programs	Eligible programs per scholarship (junction)
applications	A student's application to a scholarship
application_documents	Uploaded files per application
audit_entries	Immutable event log per application
notifications	Per-user system notifications
semester_records	GWA/enrollment tracking per scholar per semester
appeals	One appeal per rejected application
2. Columns Per Table
profiles
Linked 1:1 with auth.users. Created automatically via trigger on signup.

Column	Type	Constraints
id	uuid	PK, FK → auth.users(id) ON DELETE CASCADE
role	text	NOT NULL, CHECK (student | osfa_staff)
full_name	text	NOT NULL
email	text	NOT NULL, UNIQUE
contact	text	
avatar_url	text	
created_at	timestamptz	NOT NULL, DEFAULT now()
updated_at	timestamptz	NOT NULL, DEFAULT now()
student_profiles
One-to-one extension of profiles for students only.

Column	Type	Constraints
id	uuid	PK, DEFAULT gen_random_uuid()
user_id	uuid	NOT NULL, UNIQUE, FK → profiles(id) ON DELETE CASCADE
student_number	text	NOT NULL, UNIQUE
campus	text	NOT NULL, DEFAULT 'PUP Sta. Mesa'
college	text	NOT NULL (e.g. 'CCIS')
program	text	NOT NULL (e.g. 'BS Computer Science (BSCS)')
year_level	text	NOT NULL
section_block	text	
academic_year	text	(e.g. '2025–2026')
semester	text	CHECK (1st Semester | 2nd Semester | Summer)
applicant_type	text	NOT NULL, CHECK (incoming | continuing)
gwa	numeric(4,2)	nullable — NULL for incoming students
hs_grade	numeric(5,2)	nullable — HS final grade % for incoming only
gender	text	
date_of_birth	date	
annual_income_bracket	text	(e.g. 'Below 120,000')
father_name	text	
father_occupation	text	
mother_name	text	
mother_occupation	text	
guardian_name	text	
guardian_contact	text	
number_of_siblings	smallint	DEFAULT 0
created_at	timestamptz	NOT NULL, DEFAULT now()
updated_at	timestamptz	NOT NULL, DEFAULT now()
scholarships
Column	Type	Constraints
id	uuid	PK, DEFAULT gen_random_uuid()
title	text	NOT NULL
description	text	
amount_raw	integer	NOT NULL (in PHP, whole number)
period	text	NOT NULL, CHECK (per semester | per year | one-time | monthly)
deadline	date	nullable — NULL means no set deadline
slots	integer	NOT NULL, CHECK (> 0)
applicants_count	integer	NOT NULL, DEFAULT 0
status	text	NOT NULL, DEFAULT 'Draft', CHECK (Draft | Active | Closed | Archived)
type	text	NOT NULL (e.g. 'Merit-Based')
eligibility	text	
cover_image_url	text	
created_by	uuid	FK → profiles(id) SET NULL
created_at	timestamptz	NOT NULL, DEFAULT now()
updated_at	timestamptz	NOT NULL, DEFAULT now()
scholarship_requirements
Column	Type	Constraints
id	uuid	PK, DEFAULT gen_random_uuid()
scholarship_id	uuid	NOT NULL, FK → scholarships(id) ON DELETE CASCADE
label	text	NOT NULL
required	boolean	NOT NULL, DEFAULT true
hint	text	
order_index	smallint	NOT NULL, DEFAULT 0
scholarship_colleges
Junction — eligible colleges per scholarship. Empty = open to all.

Column	Type	Constraints
scholarship_id	uuid	NOT NULL, FK → scholarships(id) ON DELETE CASCADE
college_code	text	NOT NULL (e.g. 'CCIS')
PRIMARY KEY (scholarship_id, college_code)
scholarship_programs
Junction — eligible programs per scholarship. Empty = open to all programs in allowed colleges.

Column	Type	Constraints
scholarship_id	uuid	NOT NULL, FK → scholarships(id) ON DELETE CASCADE
program_name	text	NOT NULL
PRIMARY KEY (scholarship_id, program_name)
applications
Column	Type	Constraints
id	uuid	PK, DEFAULT gen_random_uuid()
student_id	uuid	NOT NULL, FK → profiles(id) ON DELETE RESTRICT
scholarship_id	uuid	NOT NULL, FK → scholarships(id) ON DELETE RESTRICT
status	text	NOT NULL, DEFAULT 'Pending', CHECK (Pending | Under Review | Approved | Rejected | Incomplete | Duplicate)
eval_status	text	NOT NULL, DEFAULT 'Pending Review', CHECK (Pending Review | In Progress | Completed)
applicant_type	text	NOT NULL, CHECK (incoming | continuing)
gwa_at_submission	numeric(4,2)	nullable
hs_grade_at_submission	numeric(5,2)	nullable
income_at_submission	text	
scholar_status	text	nullable, CHECK (Active | Probationary | Terminated | Graduated)
rejected_docs	text[]	DEFAULT '{}'
is_graduating	boolean	DEFAULT false
expected_graduation	text	nullable
applied_at	timestamptz	NOT NULL, DEFAULT now()
updated_at	timestamptz	NOT NULL, DEFAULT now()
UNIQUE (student_id, scholarship_id)
application_documents
Column	Type	Constraints
id	uuid	PK, DEFAULT gen_random_uuid()
application_id	uuid	NOT NULL, FK → applications(id) ON DELETE CASCADE
requirement_id	uuid	nullable, FK → scholarship_requirements(id) SET NULL
label	text	NOT NULL
storage_path	text	NOT NULL (path inside Supabase Storage bucket)
file_name	text	NOT NULL
file_size_bytes	integer	
mime_type	text	
submitted	boolean	NOT NULL, DEFAULT true
uploaded_at	timestamptz	NOT NULL, DEFAULT now()
audit_entries
Insert-only. Never updated or deleted.

Column	Type	Constraints
id	uuid	PK, DEFAULT gen_random_uuid()
application_id	uuid	NOT NULL, FK → applications(id) ON DELETE CASCADE
action	text	NOT NULL
performed_by	uuid	nullable, FK → profiles(id) SET NULL
performed_by_label	text	NOT NULL (denormalized: 'Student' | 'OSFA Staff' | 'System')
created_at	timestamptz	NOT NULL, DEFAULT now()
notifications
Column	Type	Constraints
id	uuid	PK, DEFAULT gen_random_uuid()
user_id	uuid	NOT NULL, FK → profiles(id) ON DELETE CASCADE
type	text	NOT NULL, CHECK (status | deadline | info | approved | rejected | incomplete | resubmit)
message	text	NOT NULL
scholarship_id	uuid	nullable, FK → scholarships(id) SET NULL
application_id	uuid	nullable, FK → applications(id) SET NULL
read	boolean	NOT NULL, DEFAULT false
created_at	timestamptz	NOT NULL, DEFAULT now()
semester_records
Column	Type	Constraints
id	uuid	PK, DEFAULT gen_random_uuid()
application_id	uuid	NOT NULL, FK → applications(id) ON DELETE CASCADE
semester	text	NOT NULL, CHECK (1st Sem | 2nd Sem | Summer)
academic_year	text	NOT NULL (e.g. 'AY 2024–2025')
gwa	numeric(4,2)	NOT NULL
status	text	NOT NULL, CHECK (Active | Probationary | Terminated | Graduated)
enrollment_verified	boolean	NOT NULL, DEFAULT false
notes	text	
verified_by	uuid	nullable, FK → profiles(id) SET NULL
verified_at	timestamptz	
created_at	timestamptz	NOT NULL, DEFAULT now()
appeals
One per application maximum — enforced by UNIQUE constraint.

Column	Type	Constraints
id	uuid	PK, DEFAULT gen_random_uuid()
application_id	uuid	NOT NULL, UNIQUE, FK → applications(id) ON DELETE CASCADE
status	text	NOT NULL, DEFAULT 'Pending', CHECK (Pending | Approved | Denied)
reason	text	NOT NULL
submitted_at	timestamptz	NOT NULL, DEFAULT now()
review_note	text	nullable
reviewed_by	uuid	nullable, FK → profiles(id) SET NULL
reviewed_at	timestamptz	nullable
3. Relationships
One-to-One
Relationship	Description
profiles → student_profiles	Every student has exactly one academic profile. OSFA staff have no student_profiles row.
applications → appeals	Each application may have at most one appeal (UNIQUE on application_id).
One-to-Many
Parent	Child	Description
profiles	applications	One student submits many applications (to different scholarships).
profiles	notifications	One user receives many notifications over time.
scholarships	applications	One scholarship receives many student applications.
scholarships	scholarship_requirements	One scholarship defines many required documents.
scholarships	scholarship_colleges	One scholarship targets many eligible colleges.
scholarships	scholarship_programs	One scholarship targets many eligible programs.
applications	application_documents	One application holds many uploaded files.
applications	audit_entries	One application accumulates many audit events.
applications	semester_records	One approved application tracks many semester GWA records.
Many-to-Many
Entities	Bridge Table	Description
scholarships ↔ colleges	scholarship_colleges	A scholarship can target multiple colleges; a college can be targeted by multiple scholarships.
scholarships ↔ programs	scholarship_programs	Same pattern for specific degree programs.
4. Indexing Strategy
Index	Table	Column(s)	Reason
idx_applications_student_id	applications	student_id	Student portal: "show my applications" on every page load
idx_applications_scholarship_id	applications	scholarship_id	OSFA: filter applicants by scholarship
idx_applications_status	applications	status	OSFA: filter by Pending / Under Review / etc.
idx_applications_student_scholarship	applications	(student_id, scholarship_id)	Duplicate check on new submission (already covered by UNIQUE)
idx_notifications_user_unread	notifications	(user_id, read)	Notification bell unread count — runs on every page
idx_notifications_user_created	notifications	(user_id, created_at DESC)	Paginated notification list, newest first
idx_audit_entries_application_id	audit_entries	application_id	Always fetched together with application detail
idx_scholarships_status	scholarships	status	Student iskolarships list only shows Active
idx_scholarships_deadline	scholarships	deadline	Background task: find scholarships to auto-close
idx_semester_records_application_id	semester_records	application_id	Scholar detail page
idx_documents_application_id	application_documents	application_id	Documents tab on applicant detail
idx_student_profiles_user_id	student_profiles	user_id	Already UNIQUE but explicit index improves JOIN speed
5. Optional Features
Row Level Security (RLS)
All tables have RLS enabled. Policies per table:

Table	Student Policy	OSFA Policy
profiles	SELECT/UPDATE own row only	SELECT all; no UPDATE others
student_profiles	SELECT/UPDATE own row only	SELECT all
scholarships	SELECT where status = 'Active'	Full CRUD
scholarship_requirements	SELECT only	Full CRUD
scholarship_colleges	SELECT only	Full CRUD
scholarship_programs	SELECT only	Full CRUD
applications	SELECT/INSERT/UPDATE/DELETE own rows only	SELECT/UPDATE all
application_documents	SELECT/INSERT/DELETE own application's docs	SELECT all; no DELETE
audit_entries	SELECT own application's entries; no INSERT (service layer only)	SELECT all
notifications	SELECT/UPDATE/DELETE own rows only	No direct access
semester_records	SELECT own application's records	Full CRUD
appeals	SELECT/INSERT own application's appeal; no UPDATE after submit	SELECT/UPDATE all
Role is determined via auth.jwt() ->> 'role' stored in the JWT metadata — no extra JOIN to profiles needed inside RLS policies.

Supabase Auth Integration
auth.users is fully managed by Supabase — stores email + hashed password
On signup, a database trigger (on_auth_user_created) auto-inserts a row into profiles with role = 'student' by default
OSFA staff accounts are created by a super-admin and have their role set to 'osfa_staff' manually or via a seeded migration
role is written into auth.users.user_metadata at registration so RLS policies can read it from the JWT without a table lookup
Supabase Realtime enabled on notifications — the frontend notification bell subscribes to INSERT events filtered by user_id = auth.uid() for live updates
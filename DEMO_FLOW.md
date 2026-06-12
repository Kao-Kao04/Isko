# IskoMo — Demo Flow (10–15 minutes)

A walkthrough script for the thesis/capstone defense. Follows real applications
through the system across all three portals: **Student → OSFA Staff → Super
Admin**. Timings are guides — adjust live depending on panel questions.

> **What's new in this version:** the OSFA "Activity History" tab now shows a
> single, unified timeline of an application's *entire* journey (Application →
> Screening → Verification → Interview → Decision → Completion), not just the
> submission event. This is the centerpiece of Part 2 below.

---

## Before you start (prep checklist)

- [ ] Have 3 browser tabs ready, logged into each role:
  - Student account (verified, with at least 1 existing application)
  - OSFA staff account (note their department — Public or Private — since
    staff only manage applications in their own department)
  - Super Admin account
- [ ] Confirm at least 1 **Public** and 1 **Private** scholarship exist, so the
  visibility distinction is visible on both sides
- [ ] **For the Activity History highlight**, have ready an application that's
  reached the **Completion** stage (full history = most impressive). As of
  now, examples that work:
  - App **#30** — Sophia Nicole Burgos, *IskoMo Public Scholarship Raffle
    Grant* (Public) — 13-step history from Submitted to Requirements
    Submitted
  - App **#29** — Mariel Abreu, *Private Scholarship Raffle Grant* (Private) —
    includes an interview reschedule in its history
- [ ] **For a live workflow action**, have ready an application sitting at a
  stage where the *next* step is a single click, e.g.:
  - App **#45** (Marcus Cedric Pedrosa, Public, currently *Screening Passed*)
    → next click moves it into Verification
  - App **#28** (Viena Marie Velasquez, Private, currently *Waitlisted*) →
    next click is Approve or Reject, triggering a student notification
  - (Application IDs are illustrative — verify current status on
    `/osfa/applicants` before the defense, since data may have moved on.)

---

## Part 1 — Student Portal (~4 min)

**Goal:** show the student's journey from registration to tracking a decision.

1. **Login → Dashboard** (`/student/dashboard`)
   - Point out the quick stats and the notification bell.
2. **Registration / Verification** (`/student/registration`)
   - Show the document upload step new students go through before they can
     apply. (Skip re-uploading if the account is already verified — just
     mention it.)
3. **Browse Scholarships** (`/student/iskolarships`)
   - Highlight the **Public vs Private** badges on scholarship cards — Public
     = open to all registered students; Private = OSFA-managed/department
     grants.
4. **Scholarship Details → Apply** (`/student/iskolarships/[id]` → `/apply`)
   - Open one scholarship, walk through the detail page, click **"Apply for
     this Scholarship"**, briefly show the application form.
5. **My Applications** (`/student/applications`)
   - Open an existing application; show the **status stepper** (Application →
     Verification → Interview → Decision → Completion) and the current status
     badge.
   - Scroll to **Activity Timeline** on this page — note this is the
     student's own view of the same history OSFA sees (read-only, plain
     language).
6. **Notifications** (bell icon)
   - Click a notification (e.g. a scholarship announcement) and show it opens
     correctly **within the student portal** — students never get redirected
     into OSFA-only pages.

---

## Part 2 — OSFA Staff Portal (~7 min)

**Goal:** show how staff review, decide on, and track applications — and
highlight the new unified audit trail.

1. **Login → Dashboard** (`/osfa/dashboard`)
   - Point out system stats, upcoming interview calendar, and recent
     notifications.
2. **Applicants page** (`/osfa/applicants`)
   - Show the **status filter tiles**: All / Pending / Approved / Rejected /
     Incomplete / Withdrawn / Waitlisted.
   - Open the **Completion-stage application** prepared earlier (e.g. App
     #30).
3. ⭐ **Activity History — the full audit trail** (Activity History tab, or
   jump straight there with `?tab=history`)
   - This is one continuous, timestamped timeline:
     *Application Submitted → Under Screening → Screening Passed → Pending
     Document Validation → Documents Validated → Interview Scheduled →
     Interview Completed → Interview Evaluated → Under Review → Approved →
     Pending Requirements → Requirements Submitted.*
   - Emphasize: **every stage transition is logged with who made it and
     when** — this is the accountability/audit trail required for a
     scholarship management system, and it now reflects the complete
     Application-to-Completion lifecycle in one place for OSFA staff in
     **both Public and Private** departments.
4. **Workflow tab — live action**
   - Open the application prepared for a live click (e.g. App #45 or #28).
   - Walk through the applicant's submitted info, then perform the next
     workflow step live — e.g. **Approve** (or **Waitlist → Approve**) —
     show the resulting status change and the auto-notification sent to the
     student.
   - Switch back to **Activity History** for this application — show the new
     action just appeared at the bottom of the timeline in real time.
5. **Generate Documents** (on an approved applicant)
   - Show **"Generate Documents"** — Confirmation Letter, Terms & Conditions,
     Scholarship Agreement, Acceptance Form, Bank Details Form, Maintaining
     Conditions Form — open one to show the generated PUP-letterhead HTML
     document.
6. **Compliance Documents → Mark Received**
   - Show OSFA marking a submitted compliance document as *Received* once the
     student turns it in.
7. **Registrations page** (`/osfa/registrations`)
   - Show pending student registrations awaiting verification, and the
     **"Email Verified Students"** bulk reminder button.
8. **Send Announcement** (`/osfa/notifications` → "Broadcast" composer)
   - Compose a quick announcement (e.g. "New scholarship now open"); mention
     the safeguard that prevents staff from linking students into OSFA-only
     pages.

---

## Part 3 — Super Admin Portal (~3 min)

**Goal:** show system-wide oversight and scholarship program management.

1. **Login → Dashboard** (`/admin/dashboard`)
   - Point out system-wide totals: students, applications, scholars.
2. **Scholarships** (`/osfa/scholarships`, super admin view)
   - Open **Create New Scholarship** and show the **Visibility toggle** (🌐
     Public / 🔒 Private) — only super admin chooses this; OSFA staff are
     locked to their own department's scholarships.
3. **Applications** (`/admin/applications`)
   - Show the system-wide applications list with the **All / Public /
     Private** category filter.
4. **Students / Scholars / Reports** (quick pass)
   - `/admin/students` — account verification overview.
   - `/admin/scholars` — active scholars across all programs.
   - `/admin/reports` — generated reports/analytics.

---

## Closing & Q&A talking points (~1 min)

Recap: one application moved from **submission → OSFA review/decision →
compliance documents → completion**, with **role-based access** (Student /
OSFA / Super Admin), **public vs private scholarship programs**, and a
**unified, end-to-end audit trail** visible to OSFA staff in both departments.

If asked about data integrity / business rules, mention:
- **One application per category**: a student can have at most one active
  application per Public/Private category at submission time.
- **One active scholarship per student**: even if a student independently
  reaches the decision stage on two applications, OSFA cannot approve a
  second one while the student already holds an active scholarship — the
  system blocks it with a clear error explaining why.

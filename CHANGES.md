# Feature Update Summary

This document explains what was already present in the project vs. what was added,
so nothing existing was duplicated or broken.

## Already implemented (verified, left untouched)
- **Reallowing submission** — `resetFinalSubmission` (backend) + the "Reset Final
  Submission" button in `ViewRegistrations.jsx` / `ReviewerComments.jsx` already let
  an admin allow a participant to resubmit their final paper.
- **Viewing pending paper assignments** — `getUnassignedPapers` already existed;
  it is now also surfaced in the new "Pending Reviews & Reminders" admin page.
- **Dashboard analytics** (total papers, region-wise, decision-wise, month-wise
  submissions) — fully implemented already in `Analytics.jsx` using
  `getDashboardStats` / `getRegistrationAnalytics`.
- **Reviewer Google OAuth login** — the "Login with Google" button already existed
  on the login page and the backend Google strategy already links to existing
  accounts by email. The only real gap was that the OAuth callback always sent the
  user to `/paper-status`, which then bounced non-"user" roles back to `/auth`.
  Fixed in `PaperStatus.jsx` so reviewers/chairpersons/admins now land on their
  correct dashboard after a Google sign-in instead of being logged back out.

## New backend additions
- `models/settingsModel.js` — new key/value `system_settings` table used for the
  global submission lock.
- `users` table: new `reviewerType` (`internal`/`external`) and
  `submissionLocked` columns.
- `paper_assignments` table: new `lastReminderSentAt` column (throttles reminder
  emails to once every few days per assignment).
- `services/reviewReminderScheduler.js` — background job (runs on startup and
  every 12h) that emails reviewers whose assigned papers have been pending for
  5+ days and haven't been reminded in the last 3 days.
- `services/emailServices.js` — new `sendReviewReminderEmail`.
- New admin endpoints (all under `/icodses/admin`, admin-only):
  - `POST /reset-user-password` — admin-triggered password reset email.
  - `GET/POST /submission-lock` — global submission lock status/toggle.
  - `GET /submission-lock/users`, `PUT /submission-lock/users/:id` — per-user lock.
  - `GET /conference-participants/export` — real `.xlsx` export (via `xlsx` /
    SheetJS, added as a new dependency).
  - `GET /pending-reviews`, `POST /pending-reviews/remind` — pending review status
    + manual/bulk reminder emails.
  - `GET /reviewer-status-report` — reviewer-wise papers + status.
- `createReviewer` / `updateReviewer` / `getReviewers` /
  `getReviewersWithAssignments` now accept and return `reviewerType`
  (internal/external), used when assigning reviewers.
- `registerPaper` now checks the global lock and the submitting user's lock
  before accepting a submission (returns HTTP 423 if locked).

## New / updated frontend
- `SubmissionControl.jsx` (new) — global lock toggle, per-user lock list with
  search, and an admin "Reset Password" action per user.
- `PendingReviews.jsx` (new) — pending paper assignments + pending review status
  (paper ID, reviewer name) with per-row and "remind all" reminder buttons.
- `ReviewerStatusReport.jsx` (new) — expandable reviewer-wise list of assigned
  papers with status.
- `Admin.jsx` — reviewer create/update forms and table now include an
  Internal/External type selector and column; three new sidebar sections wired
  to the components above.
- `AssignReviewer.jsx` — reviewer dropdowns now show Internal/External next to
  the track.
- `ConferenceParticipants.jsx` — added a real "Download Excel" button (calls the
  new `.xlsx` export endpoint) alongside the existing CSV export.
- `ReviewerDashboard.jsx` — replaced the "filter by review" dropdown with
  explicit **Pending** / **Completed** tabs (with counts).

All existing functionality (registration, payments, chairperson flow, existing
reviewer/admin screens, deployment `.env` switching, etc.) is unchanged.

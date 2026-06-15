# Phase 3 Main Changes

## Overview

Phase 3 adds advanced role capabilities for Quizzle:

- Students can submit proposed questions for teacher review.
- Teachers can review, edit, approve, or reject student-submitted questions.
- Test attempts can enter a manual grading workflow when open-ended answers require teacher scoring.
- Teachers can view pending submissions, inspect student answers, assign manual scores, and save feedback.

## Step 1: Backend Preparation

### Question Schema Updates

Updated `Backend/Models/questions.models.js` with review and authorship metadata:

- Added `authorRole` to track whether a question came from a student, teacher, user, or admin.
- Added `pending_teacher_review` and `rejected` to the `status` enum.
- Added `isApproved` for explicit approval state.
- Added `reviewedBy` to store the teacher/admin account that reviewed the question.
- Added `reviewedAt` to store review time.
- Added `reviewNotes` for teacher feedback during review.

### Test Attempt Schema Updates

Updated `Backend/Models/testAttempts.models.js` for manual grading:

- Per-answer fields:
  - `maxPoints`
  - `needsManualGrading`
  - `manualScore`
  - `teacherFeedback`
  - `gradedBy`
  - `gradedAt`

- Attempt-level fields:
  - `needsManualGrading`
  - `manualGradingStatus`
  - `totalAutoScore`
  - `teacherScore`
  - `gradedBy`
  - `gradedAt`
  - `teacherFeedback`

- Added `needs_manual_grading` to the attempt `status` enum.

### Question Controller Updates

Updated `Backend/Controllers/questions.controllers.js`:

- Student/user-created questions now save as `pending_teacher_review`.
- Teacher/admin-created questions continue to save as drafts.
- Question review now supports:
  - approval/rejection
  - answer updates
  - option updates
  - difficulty updates
  - review notes
  - reviewer metadata

### Test Controller Updates

Updated `Backend/Controllers/tests.controllers.js`:

- Added score recalculation helper for auto and manual grades.
- Prevented `pending_teacher_review` and `rejected` questions from being selected into tests.
- Updated `submitTest` so open-ended short-answer questions without an exact stored answer are flagged for manual grading.
- Added teacher ownership filtering for grading queues.

### New Backend API Endpoints

Added to `Backend/Routes/tests.routes.js`:

- `GET /api/tests/test-attempts/pending-grading`
  - Teacher/admin endpoint.
  - Returns attempts that require manual grading.
  - Teachers only see attempts for their own tests.

- `PUT /api/tests/test-attempts/:testAttemptId/grade`
  - Teacher/admin endpoint.
  - Saves manual scores and feedback.
  - Recalculates total score, total points, percentage, and grading status.

### Middleware Fix

Updated `Backend/Middlewares/auth.middlewares.js`:

- Fixed `checkTeacher` so it calls `next()` after a successful role check.
- This unblocks teacher-only routes such as question review and manual grading.

## Step 2: Student Question Creation

Updated `Frontend/src/pages/QuestionPage/CreateQuestion.jsx`:

- The page now detects student/user role through auth context.
- Student UI text changes to a proposal workflow:
  - heading: `Submit a question for teacher review`
  - button: `Submit for Teacher Review`
  - toast: `Question submitted for review!`
- Student submissions omit `testId`.
- After submission, students return to `/student`.
- Teacher behavior remains unchanged.

Updated `Frontend/src/routes/AppRoutes.jsx`:

- `/questions/new` is now available to:
  - `teacher`
  - `student`
  - `user`

Updated `Frontend/src/pages/Student/StudentDashboard.jsx`:

- Added a `Submit Question` action that links students to `/questions/new`.

## Step 3: Teacher Review And Manual Grading

### Student Question Review UI

Added `Frontend/src/pages/Teacher/TeacherQuestionReview.jsx`:

- Displays questions with `pending_teacher_review` status.
- Allows teachers to inspect student-submitted prompts.
- Allows inline editing of:
  - stored answer
  - difficulty
  - multiple-choice options
  - correct option flags
  - review notes
- Provides actions:
  - `Approve`
  - `Reject`
  - `Edit`
- Uses the existing question review endpoint.

### Manual Grading UI

Added `Frontend/src/pages/Teacher/TeacherGrading.jsx`:

- Displays test attempts requiring manual grading.
- Lets teachers select a pending submission.
- Shows each manually graded answer with:
  - question content
  - student answer
  - score input
  - max points input
  - answer feedback input
- Includes overall teacher feedback.
- Saves grades through `PUT /api/tests/test-attempts/:testAttemptId/grade`.

### Frontend API Context Updates

Updated `Frontend/src/context/QuestionContext.jsx`:

- `reviewQuestion` now accepts either a boolean or a full review payload.

Updated `Frontend/src/context/TestContext.jsx`:

- Added `getPendingGradingAttempts`.
- Added `manualGradeAttempt`.

### Teacher Routing And Navigation

Updated `Frontend/src/routes/AppRoutes.jsx`:

- Added `/teacher/review`.
- Added `/teacher/grading`.

Updated `Frontend/src/components/Header.jsx`:

- Added teacher navigation links:
  - `Review`
  - `Grading`

Updated `Frontend/src/pages/Home.jsx`:

- Teacher dashboard now shows review queue cards for:
  - pending question proposals
  - pending manual grading submissions
- Teacher dashboard stats now include pending review and pending grading counts.

### Styling

Updated `Frontend/src/index.css`:

- Added styles for:
  - danger buttons
  - teacher queue links
  - review cards
  - grading layout
  - submission list rows
  - manual answer cards
  - student answer display blocks

## Verification

Backend syntax checks passed for touched backend files:

```bash
node --check Backend/Controllers/tests.controllers.js
node --check Backend/Controllers/questions.controllers.js
node --check Backend/Models/testAttempts.models.js
node --check Backend/Models/questions.models.js
node --check Backend/Routes/tests.routes.js
node --check Backend/Middlewares/auth.middlewares.js
```

Frontend production build passed:

```bash
npm run build
```

Known non-blocking output:

- Shell startup warning: `fnm: command not found`
- Vite chunk-size warning for large bundled assets

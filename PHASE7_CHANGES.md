# Phase 7 Changes

## 1. CreateQuestion Textarea/OCR Upload Bug Fix
- Fixed the UI bug where clicking inside the question editor opened the OCR file picker.
- Root cause was improper nesting between the OCR upload label and the editor area.
- Refactored `Frontend/src/pages/QuestionPage/CreateQuestion.jsx` so:
  - OCR upload label is bound only to the hidden file input.
  - Rich text editor is rendered in a separate container.
  - Editor clicks no longer trigger file selection.

## 2. Rejected Question Filter in CreateTest
- Updated `Frontend/src/pages/TestPage/CreateTest.jsx` to exclude rejected questions from the selectable list.
- Added:
  - `selectableQuestions = questions.filter((question) => question.status !== 'rejected')`
  - Rendering and empty-state checks now use `selectableQuestions`.

## 3. Profile Page Revamp
- Refactored `Frontend/src/pages/Profile.jsx` with a read-first UX:
  - Default **Read-Only** profile display.
  - **Edit Profile** button toggles editable form mode.
  - **Cancel** restores values using snapshot-based rollback logic.
- Added avatar experience improvements:
  - Avatar display now uses current user avatar with fallback to `/images/default-avatar.jpg`.
  - Added **Change avatar** upload action wired to existing `updateAvatar` flow.
- Improved account/security layout:
  - Password form remains available in parallel with profile panel.
  - Security area preserved and clarified as a dedicated panel.

## 4. Teacher Grading Workflow Verification
- Verified teacher grading navigation and data flow are correctly wired:
  - Route exists: `/teacher/grading` (`AppRoutes.jsx`).
  - Navigation access exists in teacher header (`Header.jsx`).
  - Teacher home queue links to grading page (`Home.jsx`).
  - Grading page fetches pending attempts via `getPendingGradingAttempts` (`TestContext.jsx` and `TeacherGrading.jsx`).
  - Backend pending/manual grading endpoints are aligned with this workflow.

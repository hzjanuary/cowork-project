# PHASE 7: BUG FIXES & UX/UI POLISH (TODOLIST RESOLUTION)

## 1. Context
We need to resolve a critical UI bug introduced during the OCR rollback and complete several UX improvements outlined in the project's todolist.

## 2. Tasks & Implementation Details

### Task 1: Fix `CreateQuestion` Textarea Bug
* **Bug:** Clicking inside the question text area triggers the file upload dialog.
* **Root Cause:** The rich text editor or textarea is likely nested inside the `<label>` tag intended for the file upload input.
* **Fix:** Open `Frontend/src/pages/QuestionPage/CreateQuestion.jsx`. Separate the OCR file upload input UI from the text input UI. Ensure the `<label>` for the file input strictly wraps only its own button/icon, NOT the `RichTextEditor` or textarea.

### Task 2: Filter Rejected Questions in Test Creation
* **Goal:** Teachers should not see "rejected" questions when creating a test.
* **Fix:** Check `Frontend/src/pages/TestPage/CreateTest.jsx` and the backend question fetch logic. Ensure that any question with `status === 'rejected'` is filtered out from the selection list.

### Task 3: Profile Page Revamp
* **Goal:** Improve the User Profile experience (`Frontend/src/pages/Profile.jsx`).
* **Feature 3.1 (Avatar):** Add an Avatar display. If the user doesn't have one, show a default avatar (`/images/default-avatar.jpg`). Add a feature/button to allow users to upload and change their avatar (utilizing existing upload logic or `avatarUpload.middlewares.js` if applicable).
* **Feature 3.2 (Read/Edit Mode):** Rebuild the profile information layout. It should default to a "Read-Only" view displaying User and Account info. Add an "Edit Profile" button that toggles the form inputs for editing.
* **Feature 3.3 (Password Reset):** Review the password change section within the profile page to ensure the UI is clean and matches the new layout.

### Task 4: Verify Teacher Grading Workflow
* **Goal:** Ensure test attempts seamlessly route to the Teacher Grading page.
* **Fix:** Verify the routing and navigation buttons from the Test/Attempt lists. Ensure that when a student finishes a test requiring manual grading, the Teacher can correctly see it in `TeacherGrading.jsx` and click into it to grade.
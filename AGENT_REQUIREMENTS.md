# PHASE 3: ADVANCED ROLE CAPABILITIES & GRADING WORKFLOW

## 1. Context & Safety Rules for AI Agent
* **CRITICAL:** The codebase has been updated in previous sessions (specifically `CreateTest.jsx` and `DoTest.jsx`). The AI MUST scan and read the latest codebase (Frontend pages and Backend controllers/models) to sync context before making any changes.
* **Rule:** DO NOT delete, refactor, or overwrite existing functional code unless specifically instructed to do so to fulfill the new requirements.

## 2. Updated Role Capabilities

### Role: Teacher (Enhancements)
* **Test Management:** Continue to create tests (already implemented).
* **Question Management:** * Can review, edit, and provide answers to questions (including those submitted by students).
* **Grading System (New):**
    * **Manual Grading Workflow:** If a test contains open-ended questions or questions without predefined exact answers, the Teacher needs a UI to view student submissions (`testAttempts`) and manually assign scores.
    * **Dashboard Update:** Add a "Pending Grading" or "Submissions" section in the Teacher Dashboard to track tests that require manual review.

### Role: Student (Enhancements)
* **Test Execution:** Take tests and submit answers (already implemented with timer).
* **Question Management (New):**
    * **Propose/Create Questions:** Students can now create questions (e.g., submitting a question to the system/teacher).
    * **Answer Standalone Questions:** Students can answer standalone questions outside of a formal test environment (if applicable).
    * **Data Isolation:** When a student creates a question, it should be tagged with their `userId` and perhaps a status like `pending_teacher_review` or similar, ensuring they don't mess up the official Teacher question bank without approval.

## 3. Implementation Steps for Agent
1.  **Codebase Sync:** Analyze current `questions.models.js`, `tests.models.js`, `testAttempts.models.js` and their corresponding controllers/routes. Analyze `Question.jsx`, `CreateQuestion.jsx`, and `DoTest.jsx`.
2.  **Database/Backend Adjustments:** Update schemas if necessary to support manual grading (e.g., `isGraded` flag in `testAttempts`) and student-created questions (e.g., `authorRole` or `status` in `questions`).
3.  **Student Question Workflow:** Enable the `CreateQuestion` feature for students, routing their created questions appropriately.
4.  **Teacher Grading Workflow:** Create a UI for teachers to view `testAttempts` of their students, review the answers, and input a score for questions that require manual grading.
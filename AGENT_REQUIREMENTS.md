# PHASE 2: TEST CREATION & EXECUTION WORKFLOWS

## 1. Teacher Workflow: Enhanced Test Creation
* **Current State:** The `CreateTest.jsx` UI only captures `title` and `timeLimit`.
* **New Requirement:** Teachers must be able to select existing questions from their Question Bank to add to the Test.
* **Implementation Details:**
    * **UI:** Add a "Question Selector" component within `CreateTest.jsx`. This should display a list of the Teacher's created questions (fetching from `/questions` endpoint) with checkboxes or an "Add" button.
    * **Data Structure:** The selected question IDs must be stored in an array (e.g., `questions: [questionId1, questionId2]`) and sent in the payload when submitting the new Test to the backend.
    * **Backend:** Ensure the backend `tests.controllers.js` and `tests.models.js` correctly accept, validate, and save the array of ObjectIds referencing the `questions` collection.

## 2. Student Workflow: Test Execution & Timer
* **Current State:** Students need a dedicated UI to actually take the test once they click "Start Test".
* **New Requirement:** Implement the functional test-taking interface in `DoTest.jsx`.
* **Implementation Details:**
    * **Data Fetching:** When entering `/test/:id/do`, fetch the test details AND populate the associated questions.
    * **UI Layout:** Display questions one by one or in a scrollable list. Provide radio buttons/checkboxes for answer selection.
    * **Countdown Timer:** * Implement a real-time countdown timer based on the test's `timeLimit`.
        * Display the timer prominently (e.g., fixed at the top of the screen).
    * **Warning System:** Trigger a visual notification (toast/alert) exactly **5 minutes** before the timer reaches 00:00 (e.g., "Warning: 5 minutes remaining. Please review your answers!").
    * **Submission:** * Allow manual submission via a "Submit Test" button.
        * Implement auto-submission when the timer hits 00:00.
        * Save the results via the `testAttempts` endpoint.
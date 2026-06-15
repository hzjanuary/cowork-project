# PHASE 4: STUDENT PRACTICE MODE (DUOLINGO-STYLE), FORGOT PASSWORD UI INTEGRATION, AND PROFILE GENDER UPDATE

## 1. Safety & Context Alignment Rules
* **CRITICAL:** Do NOT modify, delete, or break any existing features from previous phases (Admin dashboard, Teacher exam creation with question selection, Teacher grading workspace, Student test-taking with countdown timer).
* **Rule:** Read the entire codebase first (`Frontend/src/pages/`, `Backend/Models/`, `Backend/Controllers/`) before writing code to maintain deep architecture compatibility.

## 2. Detailed Feature Requirements

### Feature 1: Student Continuous Practice Mode (Duolingo-style)
* **Goal:** Allow students to browse the public/approved question bank, sort by difficulty, and practice infinitely in a continuous flow.
* **UI Implementation (`StudentDashboard.jsx` or separate tab):**
    * Add a new Tab or Table section named **"Question Bank Practice"**.
    * Fetch all approved public questions from the backend.
    * Implement a sorting/filter dropdown based on question level/difficulty (`easy`, `medium`, `hard`).
* **Interactive Quiz Flow:**
    * When a student clicks on any question in the list, it initiates a **"Practice Session"** starting from that question.
    * Display the question with its options. Once the student selects an answer and clicks **"Continue" (Tiếp tục)**:
        * Provide immediate subtle visual feedback (green for correct, red for incorrect if applicable, or simply transition).
        * Instantly load the next question in the sorted list.
        * This continuous cycle repeats seamlessly until all questions in the active queue are completed.
    * *Note:* Unlike formal tests (`DoTest.jsx`), this practice mode has NO time limit countdown and does not record strict `testAttempts` unless storing basic practice metrics is required.

### Feature 2: Forgot Password Flow Integration
* **Current State:** The backend already contains helper utilities and routes for OTP/Reset Password (`PIN.js`, `resetPassword.js`, `otp.models.js`). The frontend pages (`ForgotPassword.jsx`, `OTPVerify.jsx`, `ResetPassword.jsx`) exist but are disconnected from the main login screen.
* **Requirements:**
    * **Login Page Link:** Open `Frontend/src/pages/Authentication/Login.jsx` and add a **"Forgot Password?"** clickable link below the password input field, routing users to `/forgot-password`.
    * **Wiring UI Pages:** Ensure the complete visual flow is fully wired up via `AppRoutes.jsx`:
        1. `/forgot-password` (`ForgotPassword.jsx`) -> Input email -> Request OTP from backend.
        2. `/verify-otp` (`OTPVerify.jsx`) -> Input OTP received -> Verify with backend.
        3. `/reset-password` (`ResetPassword.jsx`) -> Input new password -> Submit to reset.
    * Ensure error/success toasts are gracefully handled during the entire transaction.

### Feature 3: User Profile Gender Update
* **Backend Adjustments:**
    * **Model:** Update `Backend/Models/users.models.js` to include a `gender` field (Type: String, Enum: `['Male', 'Female', 'Other']` or optional text, default: `''`).
    * **Controller:** Ensure `users.controllers.js` allows the `gender` field to be accepted and updated inside the profile modification endpoint.
* **Frontend Adjustments:**
    * **Profile Page (`Profile.jsx` / `CreateProfile.jsx`):** Add a form input field (Dropdown `<select>` or Radio Buttons) for **Gender** (Nam / Nữ / Khác hoặc Male / Female / Other) matching the application's overall design system.
    * Ensure the profile update payload includes the selected gender value and correctly syncs upon clicking save.
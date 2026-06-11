# QUIZZLE - ROLE-BASED WORKFLOW REQUIREMENTS

## 1. Project Overview
Quizzle is a quiz creation and management application. The current state features a fully functional Backend (Node.js/Express/MongoDB) and a robust Frontend for the "Teacher" role. 
The goal of this phase is to implement Role-Based Access Control (RBAC) and separate the UI/UX workflows for three distinct roles: **Admin**, **Teacher**, and **Student**.

## 2. Current Architecture & Context
*   **Database:** MongoDB. Existing collections include: `accounts`, `users`, `questions`, `tests`, `testAttempts`, `answers`, `fileuploads`, `otps`.
*   **Design System:** Dark theme with purple accents (Reference: Current Teacher Dashboard).
*   **Backend:** Modular structure (Controllers, Models, Routes, Services, Middlewares). Authentication and file upload middlewares are already present.

## 3. Role-Specific Requirements

### Role 1: Teacher (Current UI)
*   **Status:** Keep the UI/UX EXACTLY as it is currently implemented.
*   **Permissions:** Create questions, create timed tests, upload OCR sources, view recent questions/tests, and monitor their own question banks.

### Role 2: Admin (New Workflow)
*   **Goal:** A simplified, high-level management dashboard.
*   **Design Style:** Consistent with the current dark/purple theme.
*   **Tabs/Navigation:**
    1.  **User Manager:**
        *   Display a list of all users.
        *   Filter functionality: Filter by `Teacher` or `Student`.
        *   Actions: CRUD operations for users, and a specific action to **Lock/Unlock accounts**.
        *   Analytics: A mini-dashboard showing total users, new sign-ups, ratio of teachers vs. students.
    2.  **System Performance:**
        *   Analytics dashboard showing basic system metrics (e.g., API latency, error rates, database size, or active sessions).

### Role 3: Student (New Workflow)
*   **Goal:** A clean, focused interface for taking tests.
*   **Design Style:** Reference the Teacher's UI components (cards, buttons, tables) but adapt them for a student's context.
*   **Features:**
    *   **Dashboard:** View available tests or questions created by Teachers.
    *   **Action:** Enter/Join a test using a code or directly from the list.
    *   **History:** View past `testAttempts` and scores.
    *   *Constraint:* Students CANNOT see question creation tools or OCR upload features.

## 4. Developer/Agent Tasks
1.  **Frontend Routing:** Implement role-based routing (e.g., `/admin/dashboard`, `/teacher/dashboard`, `/student/dashboard`).
2.  **UI Implementation:** 
    *   Build the Admin layout with the 2 specified tabs.
    *   Build the Student layout referencing the existing Teacher components.
3.  **Backend Integration:** Ensure API endpoints check for the correct role (Admin/Teacher/Student) using existing middlewares.
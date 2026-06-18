# PHASE 5: AI INTEGRATION FOR AUTOMATED QUESTION GENERATION

## 1. Feature Context & Goal
*   **Goal:** Replace the existing OCR system with a modern Large Language Model (LLM) integration. Specifically, we will use **Google's Gemini API** to process uploaded files (images or text) and extract questions directly into the Quizzle question schema format.
*   **Target User:** Teachers.
*   **Workflow:**
    1.  Teacher uploads a file (document or image).
    2.  Backend sends the file to the Gemini API with a strict prompt to extract questions.
    3.  Gemini returns a structured JSON array matching the MongoDB `Questions` schema.
    4.  Frontend displays these parsed questions in a preview UI.
    5.  Teacher selects which questions to save and pushes them to the Question Bank.

## 2. Implementation Requirements

### 2.1 Backend Adaptations
*   **Gemini Service Integration:**
    *   Create or update a service file (e.g., `Backend/Utils/AI/gemini.utils.js` or modify an existing AI utility).
    *   Implement a function that calls the Gemini API (`gemini-2.5-flash` or `gemini-2.5-pro` depending on file type).
    *   **Crucial Prompting:** The AI prompt must strictly enforce the output format to match the Mongoose `questions.models.js` schema (Title, content, options array with `text` and `isCorrect`, difficulty, etc.). It MUST return raw JSON.
*   **Controller (`questions.controllers.js` or `processing.services.js`):**
    *   Create an endpoint (e.g., `POST /api/questions/extract-from-file`) that accepts a file upload, passes it to the Gemini service, and returns the parsed JSON array to the frontend. *Do not save them to the DB yet.*

### 2.2 Frontend Adaptations
*   **Teacher Settings Tab:**
    *   Add a new section or modal in the Teacher Dashboard (or Settings) labeled **"AI Configuration"**.
    *   Allow the teacher to input and save their own **Google Gemini API Key**.
    *   *Security Note:* Decide whether to store this key in `localStorage` for frontend-only calls or save it securely in the backend `Users` model (prefer backend storage for security if the server makes the call).
*   **AI Question Generation UI:**
    *   Create a component (e.g., `GenerateQuestions.jsx`).
    *   Provide a drag-and-drop file upload zone.
    *   Upon receiving the JSON response from the backend, render a "Preview List" of the extracted questions.
    *   Include checkboxes next to each question.
    *   Provide a "Save Selected to Question Bank" button that calls the existing question creation endpoint (`POST /api/questions`) for the selected items.
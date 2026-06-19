# Phase 5 Main Changes

## Backend

- Added the Gemini-based file extraction flow for question generation.
- Updated the backend question extraction schema/output handling to return structured question JSON.
- Added the file-processing endpoint used by the frontend AI generation page.

## Frontend

- Updated `Profile.jsx` and `UserContext.jsx` to support storing the teacher's Gemini API key.
- Added `Frontend/src/pages/Teacher/GenerateQuestionsAI.jsx` for uploading a file, previewing extracted questions, and saving selected items to the question bank.
- Added routing for `/questions/generate-ai` and exposed it only to teachers.
- Added a `Generate via AI` navigation action from the question bank page.

## Notes

- Phase 5 connects the teacher-facing UI to the Gemini extraction pipeline without auto-saving extracted questions.

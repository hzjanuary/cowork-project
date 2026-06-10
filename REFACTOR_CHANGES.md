# Quizzle Refactor Changes

This document summarizes the main changes from the original project state to the refactored Quizzle version.

## Branding

- Renamed the frontend product experience from the previous RikiLab direction to `Quizzle`.
- Updated visible brand labels in the header, landing page, login page, and footer.
- Reframed the app as a quiz/test workspace rather than a narrow Japanese-only test studio.

## Visual System

- Replaced the mint/teal palette with a purple-gradient identity.
- Added CSS variables for the main purple colors, gradient, focus ring, accent color, dark mode surfaces, borders, and shadows.
- Updated primary buttons, brand mark, auth artwork, interactive highlights, upload accents, and badges to use the new purple system.
- Kept compact 8px-radius controls and dense workspace layouts for a practical dashboard feel.

## Frontend Architecture

- Added provider wiring for auth, user, question, test, and theme state.
- Added protected routes for profile, questions, and tests.
- Replaced placeholder pages with complete feature screens:
  - Home dashboard
  - Login
  - Register
  - OTP verification
  - Profile
  - FAQ
  - Question list
  - Create question
  - Test list
  - Create test
- Added authenticated OCR/file upload entry point on the dashboard.

## Backend Integration

- Aligned frontend API calls with the backend route definitions:
  - Questions use `/api/questions`
  - Tests use `/api/tests`
  - OTP resend uses `/api/accounts/sent-otp`
  - User profile creation uses `/api/users`
  - Password change uses `/api/users/change-password`
  - File upload uses `/api/fileuploads/upload`
- Kept backend source code unchanged during the frontend refactor.

## UX Improvements

- Added a responsive app shell with authenticated navigation.
- Added dashboard statistics for questions, tests, verified questions, and public tests.
- Added filtering/search for questions and tests.
- Added empty states, loading copy, toast feedback, and clear create/delete actions.
- Added dark mode support through existing theme context.

## Verification

The refactored frontend was verified with:

```bash
cd Frontend
npm run lint
npm run build
```

Both commands pass. Vite may still report a large bundle warning because the app currently ships as a single main chunk.

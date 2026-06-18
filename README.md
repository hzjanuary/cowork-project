# Quizzle

Quizzle is a full-stack quiz and test management app for teachers, students, and admins. It includes authentication, role-based dashboards, question and test workflows, file uploads for learning materials, and Gemini-powered question extraction on the backend.

## Repository layout

```text
.
├── Backend
│   ├── Configs
│   ├── Controllers
│   ├── Middlewares
│   ├── Models
│   ├── Routes
│   ├── Services
│   ├── Tests
│   ├── Utils
│   ├── postman
│   └── server.js
├── Frontend
│   ├── public
│   └── src
│       ├── components
│       ├── config
│       ├── context
│       ├── hooks
│       ├── pages
│       └── routes
└── README.md
```

## What it does

- Account registration, OTP verification, password reset, and login.
- Role-aware navigation for admin, teacher, student, and user accounts.
- Question creation, answering, review, editing, and deletion.
- AI-assisted question generation from uploaded files for teachers.
- Test creation, test taking, grading, and result viewing.
- User profile management and avatar upload.
- Teacher Gemini API key storage in the profile settings flow.
- File upload support for source material used by the app.

## Tech stack

| Area | Stack |
|---|---|
| Backend | Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Nodemailer, Multer, Cloudinary, Gemini helpers |
| Frontend | React 19, Vite, React Router, Axios, Ant Design, MUI, React Toastify, Tailwind CSS |

## Getting started

### Backend

```bash
cd Backend
npm install
npm start
```

The backend starts from `server.js`, mounts routes under `/api`, and listens on `PORT` or `5000`. It also expects `MONGO_URI` and the other environment values used by the auth, upload, mail, and AI/OCR helpers.

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

The Vite app runs at `http://localhost:5173/`.

### Frontend checks

```bash
cd Frontend
npm run build
npm run lint
```

## Implemented backend routes

### Accounts

- `POST /api/accounts/register`
- `POST /api/accounts/sent-otp`
- `POST /api/accounts/verify-otp`
- `POST /api/accounts/forgot-password`
- `POST /api/accounts/verify-reset-otp`
- `POST /api/accounts/reset-password`
- `POST /api/accounts/login`
- `PUT /api/accounts/change-password`
- `GET /api/accounts/profile`
- `GET /api/accounts/admin/accounts`
- `POST /api/accounts/admin/accounts/:accountId/activate`
- `POST /api/accounts/admin/accounts/:accountId/deactivate`
- `DELETE /api/accounts/admin/accounts/:accountId`
- `POST /api/accounts/update-role`
- `POST /api/accounts/activate`
- `POST /api/accounts/deactivate`
- `DELETE /api/accounts/delete`

### Users

- `POST /api/users`
- `GET /api/users/me`
- `GET /api/users`
- `PUT /api/users/:id`
- `POST /api/users/upload-avatar`

### Questions

- `POST /api/questions`
- `GET /api/questions`
- `POST /api/questions/extract-from-file`
- `POST /api/questions/answer/:id`
- `PUT /api/questions/review/:id`
- `PUT /api/questions/edit/:id`
- `DELETE /api/questions/delete/:id`
- `GET /api/questions/test/:testId`
- `GET /api/questions/user/:userId`
- `GET /api/questions/:id`

### Tests

- `POST /api/tests`
- `GET /api/tests`
- `GET /api/tests/user/:userId`
- `GET /api/tests/test-attempts/me`
- `GET /api/tests/test-attempts/pending-grading`
- `POST /api/tests/tests/:testId/start`
- `POST /api/tests/test-attempts/submit`
- `PUT /api/tests/test-attempts/:testAttemptId/grade`
- `GET /api/tests/test-attempts/:testAttemptId/results`
- `GET /api/tests/:id`
- `PUT /api/tests/:id`
- `DELETE /api/tests/:id`

### File uploads

- `POST /api/fileuploads/upload`

## Frontend routes and pages

The React app is organized around auth screens, role landing pages, dashboards, profile management, question workflows, test workflows, and a FAQ page.

Main route groups include:

- Public: `/`, `/login`, `/register`, `/verify-otp`, `/forgot-password`, `/reset-password`, `/faq`
- Admin: `/admin`
- Teacher: `/teacher`, `/teacher/review`, `/teacher/grading`, `/questions/generate-ai`
- Student/user: `/student`, `/questions/new`, `/tests/:id/do`
- Shared protected pages: `/profile`, `/questions`, `/tests`, `/tests/new`

## Phase 5: AI integration

- Teachers can save a Gemini API key from the profile flow.
- Teachers can upload a file, preview extracted questions, and save selected items to the question bank.
- The AI generation page is available at `/questions/generate-ai`.

## Notes

- The frontend uses a role-based landing redirect from `/` to the correct dashboard.
- See `Backend/README.md` for the detailed backend API reference.

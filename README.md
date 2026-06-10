# Quizzle

Quizzle is a quiz and test management web app for creating question banks, building timed tests, uploading learning source files, and managing authenticated user workflows.

The project is split into two applications:

- `Backend`: Express, MongoDB/Mongoose, JWT authentication, Cloudinary upload support, OCR/AI utilities, and API routes.
- `Frontend`: React/Vite app with a refactored Quizzle UI, protected routes, auth screens, dashboards, question management, test management, upload entry point, profile, and FAQ.

## Main Features

- Account registration, email OTP verification, login, and JWT-protected access.
- Question bank for multiple choice, true/false, and short answer questions.
- Test studio for creating, listing, filtering, and deleting timed tests.
- Authenticated file upload entry point for image/PDF source material.
- Profile creation and password change forms.
- Purple-gradient Quizzle design system with responsive layout and dark mode support.

## Tech Stack

Backend:

- Node.js
- Express
- MongoDB with Mongoose
- JWT
- bcrypt / bcryptjs
- multer and Cloudinary
- Tesseract/OpenAI-related utilities

Frontend:

- React 19
- Vite
- React Router
- Axios
- Ant Design icons/components
- React Toastify
- CSS custom properties

## Project Structure

```text
.
├── Backend
│   ├── Configs
│   ├── Controllers
│   ├── Middlewares
│   ├── Models
│   ├── Routes
│   ├── Services
│   ├── Utils
│   └── server.js
├── Frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── config
│   │   ├── context
│   │   ├── hooks
│   │   ├── pages
│   │   └── routes
│   └── vite.config.js
└── README.md
```

## Backend Setup

```bash
cd Backend
npm install
npm start
```

The backend mounts routes under `/api` and expects environment values in `Backend/.env`, including MongoDB, JWT, Cloudinary, mail, and AI/OCR-related configuration as needed by the existing code.

Default server behavior:

- Root route: `GET /`
- API base: `/api`
- CORS origin: `http://localhost:5173`

## Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

Default frontend URL:

```text
http://localhost:5173/
```

Production build:

```bash
cd Frontend
npm run build
```

Lint:

```bash
cd Frontend
npm run lint
```

## Important API Areas

- `POST /api/accounts/register`
- `POST /api/accounts/sent-otp`
- `POST /api/accounts/verify-otp`
- `POST /api/accounts/login`
- `POST /api/users`
- `PUT /api/users/:id`
- `PUT /api/users/change-password`
- `POST /api/fileuploads/upload`
- `GET /api/questions`
- `POST /api/questions`
- `PUT /api/questions/:id`
- `DELETE /api/questions/:id`
- `GET /api/tests`
- `POST /api/tests`
- `PUT /api/tests/:id`
- `DELETE /api/tests/:id`

## Notes

The frontend refactor intentionally avoids backend source changes. Some backend routes and role guards still have implementation inconsistencies, so the current UI focuses on stable workflows that map directly to available API behavior.

See [REFACTOR_CHANGES.md](./REFACTOR_CHANGES.md) for a summary of the main changes from the original project to the Quizzle refactor.

# Quizzle Backend API Documentation

Welcome to the backend of **Quizzle**, a quiz and test management application. This backend is built using Node.js, Express, MongoDB with Mongoose, JWT authentication, and Cloudinary for file and avatar uploads.

---

## Table of Contents
1. [Setup and Installation](#setup-and-installation)
2. [Environment Variables](#environment-variables)
3. [Project Structure](#project-structure)
4. [Authentication & Authorization Middlewares](#authentication--authorization-middlewares)
5. [API Routes Overview Table](#api-routes-overview-table)
6. [Detailed API Endpoint Specifications](#detailed-api-endpoint-specifications)
   - [Accounts API (`/api/accounts`)](#accounts-api-apiaccounts)
   - [Users API (`/api/users`)](#users-api-apiusers)
   - [Questions API (`/api/questions`)](#questions-api-apiquestions)
   - [Tests API (`/api/tests`)](#tests-api-apitests)
   - [File Uploads API (`/api/fileuploads`)](#file-uploads-api-apifileuploads)
7. [Database Schemas (Models)](#database-schemas-models)
8. [Known Issues & Codebase Health Notes](#known-issues--codebase-health-notes)

---

## Setup and Installation

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB running locally or a MongoDB Atlas connection URI

### Installation
From the backend directory, run:
```bash
npm install
```

### Running the Server
To start the server in development mode:
```bash
npm start
```
By default, the server runs on the port specified in the `.env` file (e.g. `http://localhost:5000`) and the API is prefix-routed under `/api`.

---

## Environment Variables
Create a `.env` file in the `Backend/` root. The application expects the following configuration keys:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/quizzle
JWT_SECRET_KEY=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Cloudinary Config (for avatar and file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Verification (for OTP)
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
```

---

## Project Structure
The backend codebase uses the MVC (Model-View-Controller) structure:
```text
Backend/
├── Configs/         # External service configuration (Cloudinary, Database, etc.)
├── Controllers/     # Logic controllers for processing requests/responses
├── Middlewares/     # Express authentication, authorization, and upload guards
├── Models/          # Mongoose database schemas
├── Routes/          # Express route definitions mapped to controllers
├── Services/        # Business logic abstraction (OTP, file processing)
├── Utils/           # Utility functions (AI, OCR, PIN generators, email templates)
├── server.js        # Express application entrypoint
└── package.json     # Project dependencies and startup scripts
```

---

## Authentication & Authorization Middlewares

Most API endpoints require authentication or role guards, implemented in [auth.middlewares.js](file:///d:/Individual%20Project/Backend/Middlewares/auth.middlewares.js):

- **JWT Authentication (`authToken`)**: Checks the `Authorization` header for `Bearer <JWT_TOKEN>`. Decodes the token to obtain the `accountId`, fetches the corresponding account from the database, and attaches it to `req.account` and `req.user`.
- **Admin Guard (`checkAdmin`)**: Verifies that `req.account.role === 'admin'`. Returns `403 Forbidden` if the role is not admin.
- **Teacher Guard (`checkTeacher`)**: Verifies that `req.account.role === 'teacher'` or `req.account.role === 'admin'`.
- **Moderator Guard (`checkModerator`)**: Verifies that `req.account.role === 'moderator'` or `req.account.role === 'admin'`.
- **Verification Guard (`checkVerify`)**: Verifies that the logged-in account has been verified via OTP (`req.account.isVerified === true`).

---

## API Routes Overview Table

All routes are prefixed with `/api`.

| Route | HTTP Method | Authentication | Role Required | Description |
|---|---|---|---|---|
| **/accounts/register** | POST | Public | None | Registers a new user account and sends a verification OTP. |
| **/accounts/sent-otp** | POST | Public | None | Resends a verification OTP to the user's email. |
| **/accounts/verify-otp** | POST | Public | None | Verifies the OTP and activates the account. |
| **/accounts/forgot-password** | POST | Public | None | Sends a password reset OTP to the user's email. |
| **/accounts/login** | POST | Public | None | Authenticates credentials and returns a JWT token. |
| **/accounts/profile** | GET | JWT Required | Any | Fetches account profile details by account ID. |
| **/accounts/admin/accounts** | GET | JWT Required | `admin` | Retrieves a list of all user accounts (excluding passwords). |
| **/accounts/update-role** | POST | JWT Required | `admin` (or first admin setup) | Updates the role of a specified account. |
| **/users** | POST | JWT Required | Any | Creates a user profile containing personal information. |
| **/users/me** | GET | JWT Required | Any | Fetches the profile of the currently logged-in user. |
| **/users** | GET | JWT Required | `admin` | Fetches a list of all user profiles. |
| **/users/:id** | PUT | JWT Required | Any | Updates user profile details (supports optional avatar file). |
| **/users/change-password** | PUT | JWT Required | Any | Changes account password. |
| **/users/upload-avatar** | POST | JWT Required | Any | Uploads a new user avatar to Cloudinary. |
| **/fileuploads/upload** | POST | JWT Required | Any | Uploads a PDF or image file to Cloudinary and saves metadata. |
| **/questions** | POST | JWT Required | Any | Creates a new question draft. |
| **/questions** | GET | JWT Required | Any | Fetches questions. Students only see verified, teachers see all. |
| **/questions/:id** | GET | JWT Required | Any | Fetches detailed info of a single question, including user answer status. |
| **/questions/answer/:id** | POST | JWT Required | Any | Submits a single question answer and checks if it's correct. |
| **/questions/review/:id** | PUT | JWT Required | `teacher` or `admin` | Approves (verifies) or rejects (drafts) a question. |
| **/questions/edit/:id** | PUT | JWT Required | Any | Edits the details of an existing question. |
| **/questions/delete/:id** | DELETE | JWT Required | Any | Deletes a question. |
| **/questions/test/:testId** | GET | JWT Required | Any | Fetches all questions associated with a specific test ID. |
| **/questions/user/:userId** | GET | JWT Required | Any | Fetches all questions created by a specific user ID. |
| **/tests** | POST | JWT Required | Any | Creates a new test. |
| **/tests** | GET | JWT Required | Any | Fetches all tests. |
| **/tests/:id** | GET | JWT Required | Any | Fetches a specific test by ID. |
| **/tests/:id** | PUT | JWT Required | Any | Updates test title, timeLimit, or visibility. |
| **/tests/:id** | DELETE | JWT Required | Any | Deletes a test. |
| **/tests/tests/:testId/start** | POST | JWT Required | Any | Initiates a test attempt, returning questions (hiding correct answers). |
| **/tests/test-attempts/submit** | POST | JWT Required | Any | Submits answers for a test attempt and auto-grades objective questions. |
| **/tests/test-attempts/:testAttemptId/results** | GET | JWT Required | Any | Fetches full results and scores for a specific test attempt. |

---

## Detailed API Endpoint Specifications

### Accounts API (`/api/accounts`)

Defined in [accounts.routes.js](file:///d:/Individual%20Project/Backend/Routes/accounts.routes.js) and [accounts.controllers.js](file:///d:/Individual%20Project/Backend/Controllers/accounts.controllers.js).

#### 1. Register Account
* **Route:** `POST /api/accounts/register`
* **Auth:** None (Public)
* **Request Body:**
  ```json
  {
    "username": "johndoe",
    "email": "johndoe@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "message": "Account created successfully! Please check your email for verification",
    "email": "johndoe@example.com"
  }
  ```

#### 2. Send OTP
* **Route:** `POST /api/accounts/sent-otp`
* **Auth:** None (Public)
* **Request Body:**
  ```json
  {
    "email": "johndoe@example.com"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "message": "verify OTP send successfully"
  }
  ```

#### 3. Verify OTP
* **Route:** `POST /api/accounts/verify-otp`
* **Auth:** None (Public)
* **Request Body:**
  ```json
  {
    "email": "johndoe@example.com",
    "pin": "1234"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "message": "verify OTP verification successfully!"
  }
  ```

#### 4. Forgot Password
* **Route:** `POST /api/accounts/forgot-password`
* **Auth:** None (Public)
* **Request Body:**
  ```json
  {
    "email": "johndoe@example.com"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "message": "Reset password OTP has been sent to email!"
  }
  ```

#### 5. Login
* **Route:** `POST /api/accounts/login`
* **Auth:** None (Public)
* **Request Body:**
  ```json
  {
    "username": "johndoe",
    "password": "Password123!"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "message": "Login successfully!",
    "token": "eyJhbGciOiJIUzI1NiIsInR5...",
    "account": {
      "_id": "60d0fe4f5311236168a109ca",
      "email": "johndoe@example.com",
      "role": "user"
    }
  }
  ```

#### 6. Get Account Profile
* **Route:** `GET /api/accounts/profile`
* **Auth:** JWT Required (`Authorization: Bearer <token>`)
* **Response (200 OK):**
  ```json
  {
    "_id": "60d0fe4f5311236168a109ca",
    "username": "johndoe",
    "email": "johndoe@example.com",
    "role": "user",
    "isVerified": true,
    "createdAt": "2026-06-10T10:00:00.000Z"
  }
  ```
  *(See Known Issues regarding params inside this controller)*

#### 7. Get All Accounts
* **Route:** `GET /api/accounts/admin/accounts`
* **Auth:** JWT Required, Admin Role Required
* **Response (200 OK):**
  ```json
  [
    {
      "_id": "60d0fe4f5311236168a109ca",
      "username": "johndoe",
      "email": "johndoe@example.com",
      "role": "user",
      "isVerified": true
    }
  ]
  ```

#### 8. Update Role
* **Route:** `POST /api/accounts/update-role`
* **Auth:** JWT Required, Admin Role Required (except when no admins exist in DB yet)
* **Request Body:**
  ```json
  {
    "accountId": "60d0fe4f5311236168a109ca",
    "role": "teacher"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "message": "Role updated successfully!",
    "account": {
      "_id": "60d0fe4f5311236168a109ca",
      "username": "johndoe",
      "email": "johndoe@example.com",
      "role": "teacher"
    }
  }
  ```

---

### Users API (`/api/users`)

Defined in [users.routes.js](file:///d:/Individual%20Project/Backend/Routes/users.routes.js) and [users.controllers.js](file:///d:/Individual%20Project/Backend/Controllers/users.controllers.js).

#### 1. Create User Profile
* **Route:** `POST /api/users`
* **Auth:** JWT Required
* **Request Body:**
  ```json
  {
    "fullName": "John Doe",
    "phoneNumber": "0987654321",
    "dateOfBirth": "1995-12-17"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "message": "User created successfully",
    "user": {
      "_id": "60d0ff4a5311236168a109d0",
      "accountId": "60d0fe4f5311236168a109ca",
      "fullName": "John Doe",
      "phoneNumber": "0987654321",
      "dateOfBirth": "1995-12-17T00:00:00.000Z",
      "age": 30,
      "avatar": "http://localhost:5174/images/default-avatar.jpg"
    }
  }
  ```

#### 2. Get Current User Profile
* **Route:** `GET /api/users/me`
* **Auth:** JWT Required
* **Response (200 OK):**
  ```json
  {
    "user": {
      "_id": "60d0ff4a5311236168a109d0",
      "accountId": {
        "_id": "60d0fe4f5311236168a109ca",
        "username": "johndoe",
        "email": "johndoe@example.com",
        "role": "user"
      },
      "fullName": "John Doe",
      "phoneNumber": "0987654321",
      "dateOfBirth": "1995-12-17T00:00:00.000Z",
      "age": 30,
      "avatar": "https://res.cloudinary.com/..."
    }
  }
  ```

#### 3. Get All User Profiles
* **Route:** `GET /api/users`
* **Auth:** JWT Required, Admin Role Required
* **Response (200 OK):**
  ```json
  {
    "users": [
      {
        "_id": "60d0ff4a5311236168a109d0",
        "accountId": {
          "_id": "60d0fe4f5311236168a109ca",
          "username": "johndoe",
          "role": "user"
        },
        "fullName": "John Doe",
        "phoneNumber": "0987654321"
      }
    ]
  }
  ```

#### 4. Update User Profile
* **Route:** `PUT /api/users/:id`
* **Auth:** JWT Required
* **Headers:** `Content-Type: multipart/form-data` or `application/json`
* **Request Body (or form fields):**
  * `fullName` (Optional string)
  * `phoneNumber` (Optional string)
  * `dateOfBirth` (Optional ISO string date)
  * `avatar` (Optional file upload)
* **Response (200 OK):**
  ```json
  {
    "message": "User updated successfully",
    "user": {
      "_id": "60d0ff4a5311236168a109d0",
      "fullName": "John Updated Doe",
      "phoneNumber": "0987654321",
      "dateOfBirth": "1995-12-17T00:00:00.000Z",
      "age": 30,
      "avatar": "https://res.cloudinary.com/..."
    }
  }
  ```

#### 5. Change Password
* **Route:** `PUT /api/users/change-password`
* **Auth:** JWT Required
* **Request Body:**
  ```json
  {
    "currentPassword": "Password123!",
    "newPassword": "NewPassword456!",
    "confirmNewPassword": "NewPassword456!"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "message": "Password changed successfully!"
  }
  ```

#### 6. Upload Avatar
* **Route:** `POST /api/users/upload-avatar`
* **Auth:** JWT Required
* **Headers:** `Content-Type: multipart/form-data`
* **Multipart Form Data:**
  * Key: `avatar` (File - jpg, jpeg, png, max 5MB)
* **Response (200 OK):**
  ```json
  {
    "message": "Avatar updated successfully",
    "user": {
      "_id": "60d0ff4a5311236168a109d0",
      "fullName": "John Doe",
      "avatar": "https://res.cloudinary.com/cloud_name/image/upload/v1234567/user_avatars/..."
    }
  }
  ```

---

### Questions API (`/api/questions`)

Defined in [questions.routes.js](file:///d:/Individual%20Project/Backend/Routes/questions.routes.js) and [questions.controllers.js](file:///d:/Individual%20Project/Backend/Controllers/questions.controllers.js).

#### 1. Create Question
* **Route:** `POST /api/questions`
* **Auth:** JWT Required
* **Request Body:**
  ```json
  {
    "questionText": "What is the capital of France?",
    "type": "multiple_choice",
    "options": [
      { "label": "A", "text": "London", "isCorrect": false },
      { "label": "B", "text": "Paris", "isCorrect": true },
      { "label": "C", "text": "Berlin", "isCorrect": false }
    ],
    "difficulty": "easy",
    "testId": "60d1000f5311236168a109d5",
    "sourceFile": "60d1001f5311236168a109d8"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Question created successfully",
    "data": {
      "_id": "60d1007a5311236168a109e0",
      "userId": "60d0fe4f5311236168a109ca",
      "questionText": "What is the capital of France?",
      "type": "multiple_choice",
      "options": [...],
      "difficulty": "easy",
      "status": "draft",
      "verified": false
    }
  }
  ```

#### 2. Get All Questions
* **Route:** `GET /api/questions`
* **Auth:** JWT Required
* **Filtering Behavior:** Teachers see all questions; students/other roles only see questions with status `verified`.
* **Response (200 OK):** Includes whether the requesting user has answered the question.
  ```json
  {
    "success": true,
    "message": "Questions fetched successfully",
    "data": [
      {
        "_id": "60d1007a5311236168a109e0",
        "questionText": "What is the capital of France?",
        "type": "multiple_choice",
        "options": [...],
        "difficulty": "easy",
        "status": "verified",
        "hasAnswered": true,
        "userAnswer": "B",
        "isUserAnswerCorrect": true
      }
    ]
  }
  ```

#### 3. Get Question by ID
* **Route:** `GET /api/questions/:id`
* **Auth:** JWT Required
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Question fetched successfully",
    "data": {
      "_id": "60d1007a5311236168a109e0",
      "questionText": "What is the capital of France?",
      "type": "multiple_choice",
      "options": [...],
      "hasAnswered": false,
      "userAnswer": null,
      "isUserAnswerCorrect": null
    }
  }
  ```

#### 4. Answer Question
* **Route:** `POST /api/questions/answer/:id`
* **Auth:** JWT Required
* **Request Body:**
  ```json
  {
    "answer": "B"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Question answered successfully",
    "data": {
      "isCorrect": true,
      "correctAnswer": "B",
      "correctLabel": "B"
    }
  }
  ```

#### 5. Review Question
* **Route:** `PUT /api/questions/review/:id`
* **Auth:** JWT Required, Teacher or Admin Role Required
* **Request Body:**
  ```json
  {
    "approved": true
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Question approved successfully",
    "data": {
      "_id": "60d1007a5311236168a109e0",
      "status": "verified",
      "verified": true
    }
  }
  ```
  *(See Known Issues regarding `checkTeacher` middleware)*

#### 6. Edit Question
* **Route:** `PUT /api/questions/edit/:id`
* **Auth:** JWT Required
* **Request Body:**
  ```json
  {
    "questionText": "What is the capital city of France?",
    "difficulty": "medium"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Question updated successfully",
    "data": {
      "_id": "60d1007a5311236168a109e0",
      "questionText": "What is the capital city of France?",
      "difficulty": "medium"
    }
  }
  ```

#### 7. Delete Question
* **Route:** `DELETE /api/questions/delete/:id`
* **Auth:** JWT Required
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Question deleted successfully",
    "data": {
      "_id": "60d1007a5311236168a109e0"
    }
  }
  ```

#### 8. Get Questions by Test ID
* **Route:** `GET /api/questions/test/:testId`
* **Auth:** JWT Required
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Questions fetched successfully",
    "data": [
      {
        "_id": "60d1007a5311236168a109e0",
        "questionText": "What is the capital city of France?",
        "testId": "60d1000f5311236168a109d5"
      }
    ]
  }
  ```

#### 9. Get Questions by Creator User ID
* **Route:** `GET /api/questions/user/:userId`
* **Auth:** JWT Required
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Questions fetched successfully",
    "data": [...]
  }
  ```

---

### Tests API (`/api/tests`)

Defined in [tests.routes.js](file:///d:/Individual%20Project/Backend/Routes/tests.routes.js) and [tests.controllers.js](file:///d:/Individual%20Project/Backend/Controllers/tests.controllers.js).

#### 1. Create Test
* **Route:** `POST /api/tests`
* **Auth:** JWT Required
* **Request Body:**
  ```json
  {
    "title": "General Knowledge Quiz",
    "userId": "60d0ff4a5311236168a109d0",
    "timeLimit": 30,
    "visibility": "public"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Test created successfully",
    "data": {
      "_id": "60d1000f5311236168a109d5",
      "title": "General Knowledge Quiz",
      "userId": "60d0ff4a5311236168a109d0",
      "timeLimit": 30,
      "visibility": "public"
    }
  }
  ```

#### 2. Get All Tests
* **Route:** `GET /api/tests`
* **Auth:** JWT Required
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Tests fetched successfully",
    "data": [
      {
        "_id": "60d1000f5311236168a109d5",
        "title": "General Knowledge Quiz",
        "timeLimit": 30,
        "visibility": "public"
      }
    ]
  }
  ```

#### 3. Get Test by ID
* **Route:** `GET /api/tests/:id`
* **Auth:** JWT Required
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Test fetched successfully",
    "data": {
      "_id": "60d1000f5311236168a109d5",
      "title": "General Knowledge Quiz",
      "timeLimit": 30,
      "visibility": "public",
      "questions": []
    }
  }
  ```

#### 4. Update Test
* **Route:** `PUT /api/tests/:id`
* **Auth:** JWT Required
* **Request Body:**
  ```json
  {
    "title": "Updated Quiz Title",
    "timeLimit": 45,
    "visibility": "private"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Test updated successfully",
    "data": {
      "_id": "60d1000f5311236168a109d5",
      "title": "Updated Quiz Title",
      "timeLimit": 45,
      "visibility": "private"
    }
  }
  ```

#### 5. Delete Test
* **Route:** `DELETE /api/tests/:id`
* **Auth:** JWT Required
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Test deleted successfully",
    "data": {
      "_id": "60d1000f5311236168a109d5"
    }
  }
  ```

#### 6. Start Test Attempt
* **Route:** `POST /api/tests/tests/:testId/start`
* **Auth:** JWT Required
* **Response (200 OK):** Creates a test attempt. Returns details of the test and list of questions, omitting answers to prevent cheating.
  ```json
  {
    "success": true,
    "testAttemptId": "60d102ab5311236168a109f0",
    "test": {
      "_id": "60d1000f5311236168a109d5",
      "title": "General Knowledge Quiz",
      "timeLimit": 45,
      "questions": [
        {
          "_id": "60d1007a5311236168a109e0",
          "questionText": "What is the capital of France?",
          "type": "multiple_choice",
          "options": [
            { "label": "A", "text": "London" },
            { "label": "B", "text": "Paris" }
          ],
          "difficulty": "easy"
        }
      ]
    }
  }
  ```
  *(See Known Issues regarding `testAttemptModel` import)*

#### 7. Submit Test Attempt
* **Route:** `POST /api/tests/test-attempts/submit`
* **Auth:** JWT Required
* **Request Body:**
  ```json
  {
    "testAttemptId": "60d102ab5311236168a109f0",
    "answers": [
      {
        "questionId": "60d1007a5311236168a109e0",
        "studentAnswer": "B"
      }
    ]
  }
  ```
* **Response (200 OK):** Auto-grades objective questions (multiple choice, true/false) and calculates scores.
  ```json
  {
    "success": true,
    "message": "Test submitted successfully",
    "score": 1,
    "percentage": "100.00"
  }
  ```

#### 8. Get Test Attempt Results
* **Route:** `GET /api/tests/test-attempts/:testAttemptId/results`
* **Auth:** JWT Required
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "60d102ab5311236168a109f0",
      "testId": "60d1000f5311236168a109d5",
      "studentId": "60d0fe4f5311236168a109ca",
      "status": "graded",
      "totalScore": 1,
      "totalPoints": 1,
      "percentage": 100,
      "answers": [
        {
          "questionId": {
            "_id": "60d1007a5311236168a109e0",
            "questionText": "What is the capital of France?",
            "type": "multiple_choice",
            "answer": "B"
          },
          "studentAnswer": "B",
          "isCorrect": true,
          "points": 1
        }
      ]
    }
  }
  ```

---

### File Uploads API (`/api/fileuploads`)

Defined in [fileUpload.routes.js](file:///d:/Individual%20Project/Backend/Routes/fileUpload.routes.js) and [fileUpload.controllers.js](file:///d:/Individual%20Project/Backend/Controllers/fileUpload.controllers.js).

#### 1. Upload File
* **Route:** `POST /api/fileuploads/upload`
* **Auth:** JWT Required
* **Headers:** `Content-Type: multipart/form-data`
* **Multipart Form Data:**
  * Key: `file` (File - jpg, jpeg, png, pdf)
* **Response (201 Created):**
  ```json
  {
    "message": "File uploaded successfully",
    "file": {
      "_id": "60d1045a5311236168a10a01",
      "userId": "60d0fe4f5311236168a109ca",
      "originalName": "lecture_notes.pdf",
      "fileUrl": "https://res.cloudinary.com/...",
      "publicId": "ocr_uploads/...",
      "fileType": "pdf",
      "status": "uploaded"
    }
  }
  ```

---

## Database Schemas (Models)

The application uses the following MongoDB collections via Mongoose:

### 1. Accounts (`accounts`)
* **`username`**: String, required
* **`email`**: String, required, unique
* **`password`**: String (bcrypt hashed), required
* **`role`**: String, enum `['user', 'teacher', 'moderator', 'admin']`, default `'user'`
* **`isVerified`**: Boolean, default `false`
* **`resetAllowed`**: Boolean, default `false`

### 2. Users (`Users`)
* **`accountId`**: ObjectId ref `accounts`
* **`fullName`**: String, required
* **`phoneNumber`**: String, required
* **`dateOfBirth`**: Date, required
* **`age`**: Number, required
* **`avatar`**: String, default placeholder avatar URL

### 3. Questions (`Questions`)
* **`userId`**: ObjectId ref `Users`, required
* **`sourceFile`**: ObjectId ref `FileUploads`
* **`testId`**: ObjectId ref `Tests`
* **`questionText`**: String, required
* **`type`**: String, enum `['multiple_choice', 'true_false', 'short_answer']`, required
* **`options`**: Array of `{ label: String, text: String, isCorrect: Boolean }`
* **`answer`**: String
* **`difficulty`**: String, enum `['easy', 'medium', 'hard']`
* **`status`**: String, enum `['draft', 'pending_verification', 'verified']`, default `'draft'`
* **`verified`**: Boolean, default `false`

### 4. Tests (`Test`)
* **`title`**: String, required
* **`userId`**: ObjectId ref `Users`, required
* **`questions`**: Array of ObjectId ref `Questions`
* **`timeLimit`**: Number (in minutes)
* **`visibility`**: String, enum `['private', 'public']`, default `'private'`

### 5. Test Attempts (`TestAttempt`)
* **`testId`**: ObjectId ref `Test`, required
* **`studentId`**: ObjectId ref `accounts`, required
* **`answers`**: Array of `{ questionId: ref Questions, studentAnswer: String, isCorrect: Boolean, points: Number }`
* **`startedAt`**: Date, default `Date.now`
* **`submittedAt`**: Date
* **`status`**: String, enum `['in_progress', 'submitted', 'graded']`, default `'in_progress'`
* **`totalScore`**: Number
* **`totalPoints`**: Number
* **`percentage`**: Number

### 6. Answers (`Answer`)
*(For tracking individual questions answered outside of full tests)*
* **`questionId`**: ObjectId ref `Questions`, required
* **`userId`**: ObjectId ref `accounts`, required
* **`userAnswer`**: String
* **`isCorrect`**: Boolean

### 7. File Uploads (`FileUploads`)
* **`userId`**: ObjectId ref `accounts`, required
* **`originalName`**: String, required
* **`fileUrl`**: String, required
* **`publicId`**: String, required
* **`fileType`**: String, enum `['image', 'pdf']`, required
* **`status`**: String, enum `['uploaded', 'processing', 'ocr_done', 'ai_done', 'failed']`
* **`ocrText`**: String
* **`aiRawResponse`**: String
* **`extractedQuestions`**: Array of ObjectId ref `Questions`
* **`errorMessage`**: String

---

## Known Issues & Codebase Health Notes

While generating this documentation, several code mismatches and potential bugs were identified in the backend:

1. **Missing Password Reset Route:** The route `POST /api/accounts/reset-password` is never declared in [accounts.routes.js](file:///d:/Individual%20Project/Backend/Routes/accounts.routes.js), although `resetPassword` is fully implemented in [accounts.controllers.js](file:///d:/Individual%20Project/Backend/Controllers/accounts.controllers.js).
2. **Missing `testAttemptModel` Import:** In [tests.controllers.js](file:///d:/Individual%20Project/Backend/Controllers/tests.controllers.js), `testAttemptModel` is used in functions `startTest` and `submitTest` but is never imported at the top of the file, which will cause runtime reference errors.
3. **Broken Imports in `processing.services.js`:** The file [processing.services.js](file:///d:/Individual%20Project/Backend/Services/processing.services.js) tries to import `FileUpload` and `Question` models using lowercase folder paths (`../models/FileUpload.js` instead of `../Models/fileUpload.models.js`), which fails due to case sensitivity. Additionally, the service is never invoked from any controller.
4. **Missing `next()` in `checkTeacher`:** The middleware function `checkTeacher` in [auth.middlewares.js](file:///d:/Individual%20Project/Backend/Middlewares/auth.middlewares.js) checks if the role is teacher/admin but does not call `next()` on success, meaning requests passing this middleware will hang indefinitely.
5. **Params mismatch in `getAccountById`:** The `/profile` route uses `authToken` and calls `getAccountById`. However, `getAccountById` expects `req.params.accountId` to be set, which is not populated on `/profile` unless it was structured as `/profile/:accountId`.

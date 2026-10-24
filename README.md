# TaskFlow — To-Do List Management System Using MERN Stack

> **A simple, modern, and responsive full-stack web application designed for task organization, built with MongoDB, Express.js, React.js, and Node.js.**

---

## 📌 1. Project Overview

**TaskFlow** is a complete, genuine MERN stack to-do list web application. It enables users to create, view, filter, edit, complete, and delete tasks with real-time UI updates and persistent database storage.

Unlike simple client-only to-do apps that store data in the browser's temporary `localStorage`, TaskFlow implements a proper **Three-Tier Architecture**:
1. **Frontend Presentation Tier**: React.js SPA built with Vite for fast performance and clean, accessible CSS.
2. **Backend Application Tier**: Node.js and Express.js REST API handling routing, server-side data validation, and HTTP error handling.
3. **Database Tier**: MongoDB with Mongoose ODM (Object Data Modeling) providing schema validation and persistent cloud or local storage.

> **Project Scope Note**: TaskFlow features a multi-user authentication system using **JSON Web Tokens (JWT)** and **bcryptjs** password hashing. Each registered user has their own private workspace with isolated task storage.

---

## 🚀 2. Key Features

- **User Authentication (Login & Signup)**:
  - **Register**: Secure user onboarding with full name, email, password validation (min 6 characters), and password confirmation.
  - **Login**: Token-based authentication using JSON Web Tokens (JWT) and bcrypt password comparison.
  - **Session Persistence**: Automatic token caching and profile hydration via `/api/auth/me`.
  - **User Isolation**: All tasks are strictly private and bound to the authenticated user's ID.
  - **Interactive Modal**: Smooth tabbed Login / Register modal with show/hide password visibility toggle and instant error alerts.
  - **Header Profile Pill**: Displays user initials avatar, user name, email, and one-click logout.
- **Dashboard Summary**:
  - Live statistics displaying total tasks, pending tasks, and completed tasks.
  - Dynamic completion rate progress bar.
- **Task Management (Full CRUD)**:
  - **Create**: Add tasks with title (required), description (optional), due date (optional), and priority level (Low, Medium, High).
  - **Read**: Fetch all tasks sorted chronologically (newest first).
  - **Update**: Edit task details with pre-populated form values.
  - **Toggle Status**: Instantly toggle tasks between Completed and Pending states.
  - **Delete**: Remove tasks with an interactive confirmation modal.
- **Filtering & Organization**:
  - Filter by **All Tasks**, **Pending Tasks**, and **Completed Tasks**.
  - Visual badges showing task count per category.
  - Visual priority indicators and overdue alerts for tasks past due date.
- **Resilient UI States**:
  - Animated loading spinners during network requests.
  - Friendly empty-state illustrations when no tasks are found.
  - Error alert banners with a one-click **Retry** button if the backend or database is unreachable.
  - Non-intrusive floating toast notifications for user feedback.
- **Responsive & Accessible Design**:
  - Optimized for mobile phones, tablets, and widescreen desktop monitors.
  - High-contrast color palette, visible focus rings, and semantic HTML5 markup.

---

## 🛠️ 3. Technologies Used

| Technology | Purpose | Version |
| :--- | :--- | :--- |
| **React.js** | Frontend UI Library | `^18.3.1` |
| **Vite** | Frontend Development Server & Bundler | `^5.4.11` |
| **JSON Web Token (jsonwebtoken)** | Stateless User Authentication & Route Guarding | `^9.0.3` |
| **bcryptjs** | Salted Password Hashing | `^3.0.3` |
| **JavaScript (ES6+)** | Frontend & Backend Programming Language | Modern |
| **CSS3** | Responsive UI styling (pure CSS, no heavy dependencies) | Native |
| **Node.js** | Server-side JavaScript Runtime | `v20+` / `v24+` |
| **Express.js** | Fast, unopinionated Web Framework for Node.js | `^4.21.1` |
| **MongoDB** | NoSQL Document Database | Cloud Atlas / Local Community |
| **Mongoose** | MongoDB Object Data Modeling (ODM) | `^8.8.0` |
| **CORS** | Cross-Origin Resource Sharing Middleware | `^2.8.5` |
| **dotenv** | Environment Variable Management | `^16.4.5` |
| **concurrently** | Multi-process development runner | `^9.1.0` |

---

## 📂 4. Project Folder Structure

```text
finalproject3/
├── client/                     # Frontend Application (React + Vite)
│   ├── public/                 # Static assets & favicon
│   ├── src/
│   │   ├── components/         # Reusable React UI Components
│   │   │   ├── AuthBanner.jsx       # Welcome guest call-to-action hero card
│   │   │   ├── AuthModal.jsx        # Login & Sign Up tabbed dialog modal
│   │   │   ├── DashboardSummary.jsx # Stats cards & progress bar
│   │   │   ├── Footer.jsx           # App footer & project credits
│   │   │   ├── Header.jsx           # App navbar & user profile / login buttons
│   │   │   ├── TaskFilter.jsx       # All / Pending / Completed tab controls
│   │   │   ├── TaskForm.jsx         # Add & Edit task input panel
│   │   │   ├── TaskItem.jsx         # Individual task card & modal
│   │   │   └── TaskList.jsx         # Task list container & empty/loading states
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global authentication state & user context
│   │   ├── services/
│   │   │   └── api.js          # Centralized fetch API client with JWT bearer handling
│   │   ├── App.jsx             # Main application state orchestrator
│   │   ├── index.css           # Global responsive stylesheet
│   │   └── main.jsx            # React root mounting point
│   ├── .env.example            # Example frontend environment variables
│   ├── index.html              # HTML5 entry template
│   ├── package.json            # Client dependencies and build scripts
│   └── vite.config.js          # Vite configuration
│
├── server/                     # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # Mongoose MongoDB connection module
│   │   ├── controllers/
│   │   │   ├── authController.js # Register, login, & user profile logic
│   │   │   └── taskController.js # Business logic for task operations
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js # JWT token verification & route protection
│   │   │   └── errorHandler.js   # 404 & Centralized error handling
│   │   ├── models/
│   │   │   ├── Task.js         # Mongoose Task schema definition
│   │   │   └── User.js         # Mongoose User schema with bcrypt password hashing
│   │   ├── routes/
│   │   │   ├── authRoutes.js   # Express REST routes for /api/auth
│   │   │   └── taskRoutes.js   # Express REST routes for /api/tasks (protected)
│   │   └── server.js           # Express app initialization & server entry
│   ├── .env.example            # Example backend environment variables
│   ├── package.json            # Server dependencies and scripts
│   └── test-api.js             # Automated API test script
│
├── .gitignore                  # Git ignore rules (node_modules, .env, dist)
├── package.json                # Root package.json for one-command execution
└── README.md                   # Comprehensive project documentation
```

---

## ⚙️ 5. Step-by-Step Setup Instructions (Windows)

### Step 1: Open Terminal in the Project Directory
Open **PowerShell** or **Command Prompt** and navigate to your project directory:
```powershell
cd C:\Users\HP\OneDrive\Desktop\finalproject3
```

### Step 2: Configure Environment Variables

1. **Backend Environment**:
   Navigate into `server/` and create a `.env` file (copy from `.env.example`):
   ```powershell
   copy server\.env.example server\.env
   ```
   Open `server/.env` in Notepad or your code editor and enter your MongoDB connection string:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/taskflow?retryWrites=true&w=majority
   CLIENT_ORIGIN=http://localhost:5173
   ```

2. **Frontend Environment**:
   Navigate into `client/` and create `.env`:
   ```powershell
   copy client\.env.example client\.env
   ```
   Content of `client/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

---

## 🍃 6. Configuring MongoDB

### Option A: MongoDB Atlas (Cloud - Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and register for a free account.
2. Create an **M0 Free** cluster in your preferred region.
3. Under **Database Access**, create a user (e.g. `taskflow_admin`) and a password.
4. Under **Network Access**, click **Add IP Address** and choose **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** -> **Drivers** -> Copy the connection string.
6. Paste it into `server/.env` as `MONGODB_URI`, replacing `<password>` with your user password and appending `/taskflow` before the `?`.

### Option B: Local MongoDB
1. Download and install **MongoDB Community Server** from [mongodb.com](https://www.mongodb.com/try/download/community).
2. Ensure the MongoDB Windows Service is running.
3. In `server/.env`, set:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
   ```

---

## ▶️ 7. Running the Application

### Single-Command Start (Root Directory)
From the project root (`finalproject3`), run:
```powershell
npm run dev
```
This runs both the Express backend and React Vite frontend concurrently in the same terminal window!

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Running Separately (Optional)
If you prefer running frontend and backend in separate terminal windows:
- **Terminal 1 (Backend)**:
  ```powershell
  cd server
  npm run dev
  ```
- **Terminal 2 (Frontend)**:
  ```powershell
  cd client
  npm run dev
  ```

---

## 📡 8. REST API Reference

All backend endpoints are prefixed with `/api`.

| Method | Endpoint | Description | Request Body | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health check & DB status | None | `200 OK` |
| `GET` | `/api/tasks` | Get all tasks (supports `?status=all\|pending\|completed`) | None | `200 OK` |
### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Request Body | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | `{ name, email, password, confirmPassword }` | `201 Created` / `400 Bad Request` |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT | `{ email, password }` | `200 OK` / `401 Unauthorized` |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | None (`Bearer <token>` in header) | `200 OK` / `401 Unauthorized` |

### Task Endpoints (`/api/tasks` — Protected with JWT)

| Method | Endpoint | Description | Request Body | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | Get all tasks for current user | Query params: `?status=pending\|completed` | `200 OK` |
| `GET` | `/api/tasks/:id` | Get single task by MongoDB ID | None | `200 OK` / `404 Not Found` |
| `POST` | `/api/tasks` | Create a new task | `{ title, description?, dueDate?, priority? }` | `201 Created` / `400 Bad Request` |
| `PUT` | `/api/tasks/:id` | Update an existing task | `{ title?, description?, dueDate?, priority?, completed? }` | `200 OK` / `400` / `404` |
| `PATCH` | `/api/tasks/:id` | Toggle or set task completion | `{ completed: boolean }` | `200 OK` / `404 Not Found` |
| `DELETE` | `/api/tasks/:id` | Permanently delete a task | None | `200 OK` / `404 Not Found` |

### Sample `POST /api/tasks` Payload
```json
{
  "title": "Complete Final Year Project Report",
  "description": "Document system architecture, schema designs, and test cases.",
  "dueDate": "2026-11-01T00:00:00.000Z",
  "priority": "High"
}
```

---

## 🧪 9. Testing the Backend API

An automated test script is included in the `server` directory. To run it:
```powershell
cd server
node test-api.js
```
The script validates:
1. Health check response.
2. Server-side validation rejecting empty titles (`400 Bad Request`).
3. Task creation (`201 Created`).
4. Task retrieval (`200 OK`).
5. Status toggling (`200 OK`).
6. Task editing (`200 OK`).
7. Task deletion (`200 OK`).
8. Invalid MongoDB ObjectId handling (`400 Bad Request`).

---

## 🎓 10. College Evaluation / Viva Q&A Guide

Be prepared to answer these common oral evaluation questions:

1. **Q: What is the MERN stack?**
   * *A*: MERN stands for MongoDB (database), Express.js (backend web framework), React.js (frontend user interface library), and Node.js (JavaScript runtime environment). It enables building full-stack applications entirely in JavaScript.

2. **Q: Why use Mongoose instead of the native MongoDB driver?**
   * *A*: Mongoose provides Object Data Modeling (ODM). It allows us to define rigid schemas with built-in validation (e.g. required fields, character limits, enums for priorities), default values, and timestamps on top of schema-less MongoDB.

3. **Q: What is CORS and why is it needed?**
   * *A*: CORS stands for Cross-Origin Resource Sharing. Because the React frontend runs on port `5173` and the Express backend runs on port `5000`, browsers block cross-origin HTTP requests by default for security. The `cors` middleware on Express explicitly permits requests from the frontend origin.

4. **Q: How does Vite differ from Create React App (CRA)?**
   * *A*: Vite uses native ES modules in the browser and esbuild (written in Go) for pre-bundling dependencies. This makes the local development server start almost instantly and provides hot module replacement (HMR) significantly faster than Webpack-based CRA.

5. **Q: How does data persistence work?**
   * *A*: When a user interacts with the UI, React calls the functions in `services/api.js` which issue asynchronous `fetch()` HTTP requests to Express endpoints. Express runs controllers that perform CRUD operations via Mongoose queries on the MongoDB database. Data persists in MongoDB even if the browser or computer restarts.

---

## ☁️ 11. Deployment Guide

### Database (MongoDB Atlas)
Already hosted in the cloud via MongoDB Atlas!

### Backend (Render / Railway)
1. Push your repository to GitHub.
2. Create an account on [Render.com](https://render.com).
3. Create a **New Web Service** pointing to your GitHub repo.
4. Set **Root Directory** to `server`.
5. Set **Build Command** to `npm install`.
6. Set **Start Command** to `node src/server.js`.
7. In the **Environment Variables** section, add `PORT=5000`, `MONGODB_URI=<your_atlas_uri>`, and `CLIENT_ORIGIN=<your_frontend_url>`.

### Frontend (Vercel / Netlify)
1. Create an account on [Vercel.com](https://vercel.com).
2. Import your GitHub repository.
3. Set **Root Directory** to `client`.
4. Framework preset: **Vite**.
5. In Environment Variables, set `VITE_API_URL=https://<your-render-backend-url>/api`.
6. Click **Deploy**.

---

## 📄 License
This project was developed for educational and academic project submission purposes.

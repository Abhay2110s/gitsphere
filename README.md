# GitSphere 🌐

> **Centralized intelligence & real-time collaboration platform for modern engineering teams.**

GitSphere bridges the gap between project management, version-controlled code contributions, and team communication in an uncompromising monochrome developer environment. Designed for **Engineering Managers** and **Developers**, GitSphere unifies sprint workflows, code reviews, in-browser editing, and real-time messaging into one streamlined platform.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [Manager Console](#1-manager-console)
  - [Developer Console](#2-developer-console)
  - [Collaborative Workspace & Code Editor](#3-collaborative-workspace--code-editor)
  - [Real-Time Messaging & Notifications](#4-real-time-messaging--notifications)
  - [Authentication & Access Control](#5-authentication--security)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [License](#-license)

---

## 🌟 Overview

Engineering teams often juggle disparate tools for project tracking, code review, communication, and development. **GitSphere** centralizes these capabilities:
- **Managers** can orchestrate projects, assign tasks to active developers, review code contributions, monitor sprint activity, and communicate directly with individual developers.
- **Developers** can view assigned tasks, write and edit code in an embedded multi-language editor, submit contributions, receive review feedback, and chat in real-time.
- **Landing Experience** features a floating pill navigation bar with smart bi-directional scroll synchronization that dynamically highlights **Workspace**, **Features**, and **Workflow** sections.

---

## 🚀 Key Features

### 1. Manager Console
- **Project Lifecycle Management**: Create, update, archive, and manage engineering repositories and projects.
- **Developer Assignment**: Select from a dynamic list of registered and active developers without manual email entry.
- **Task & Sprint Delegation**: Assign prioritized tasks with 7-day deadlines, tags, and progress tracking.
- **Code Review Pipeline**: Inspect code contributions, review diffs, approve or request revisions with comments.
- **Team Oversight**: Monitor contributor throughput, commit metrics, and individual performance.
- **Account Control**: Dedicated settings panel with permanent account deletion that cleans up all associated records.

### 2. Developer Console
- **Task Hub**: Real-time view of assigned tasks, status breakdown (To Do, In Progress, Review, Completed), and deadlines.
- **Contribution Submission**: Draft pull requests and code submissions directly linked to assigned tasks and projects.
- **Workspace Navigation**: Quick access to project files, version histories, and repository trees.
- **Individual Communication**: Dedicated 1-on-1 channels with the project manager and fellow team developers.
- **Account Management**: Profile configuration and permanent account termination.

### 3. Collaborative Workspace & Code Editor
- **Embedded CodeMirror Editor**: Syntax highlighting and indentation support for JavaScript, TypeScript, Python, C++, Go, Java, Rust, HTML, CSS, SQL, JSON, YAML, Markdown, and XML.
- **File Management**: Create, view, update, and manage project files and directory structures.
- **Version History & Diffs**: Inspect commit logs and code change diffs across versions.
- **Telemetry & Activity**: Complete audit logs of all actions taken across the workspace.

### 4. Real-Time Messaging & Notifications
- **Project & 1-on-1 Channels**: Project-wide broadcasts or isolated 1-on-1 discussions between manager and developer.
- **Unread Indicators**: Glowing blue notification dot on the left sidebar that alerts the user when a new message arrives and automatically vanishes once opened.
- **Automatic 10-Day Retention**: Scheduled message maintenance keeping chat performant and clutter-free.
- **Socket.IO Integration**: Instant real-time updates for messages, tasks, and system notifications.

### 5. Authentication & Security
- **Role-Based Access Control (RBAC)**: Strict segregation between `MANAGER` and `DEVELOPER` roles.
- **Email OTP Verification**: Secure two-factor account registration and password reset workflows via Nodemailer.
- **JWT & HTTP-Only Cookies**: Secure session management with encrypted authentication tokens.
- **Rate Limiting & Security Headers**: Integrated Helmet protection, CORS configuration, and rate-limiting middleware.

---

## 🛠 Architecture & Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 + Custom Monochrome Design System
- **Animation**: Framer Motion (floating pill navbar, spring-based scroll-spy indicators, layout transitions)
- **Editor**: `@uiw/react-codemirror` with language extensions
- **Icons**: Handcrafted lightweight SVG icon system

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-Time**: Socket.IO
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) + `bcryptjs`
- **Emailing**: Nodemailer (SMTP / Gmail)
- **API Documentation**: Swagger UI Express (`/api/docs`)

---

## 📁 Project Structure

```plaintext
gitsphere/
├── Backend/
│   ├── src/
│   │   ├── app.js               # Express application configuration & middleware
│   │   ├── server.js            # Server entry point & HTTP/Socket.IO bootstrap
│   │   ├── config/              # Database, Swagger, and environment configs
│   │   ├── controllers/         # Request handlers (auth, project, task, message, etc.)
│   │   ├── middleware/          # Auth guard, RBAC, access control, error handlers
│   │   ├── models/              # Mongoose schemas (User, Project, Task, Contribution, Message, etc.)
│   │   ├── routes/              # REST API route definitions
│   │   ├── scripts/             # Database seeders, migrations, and test scripts
│   │   ├── services/            # Core business logic & database queries
│   │   ├── sockets/             # Socket.IO handlers for chat and room orchestration
│   │   ├── utils/               # Helpers, token generator, email sender, response wrappers
│   │   └── validators/          # Input validation schemas
│   ├── .env.example             # Backend environment template
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── api/                 # API client & endpoint service modules
│   │   ├── assets/              # Static assets & brand logos
│   │   ├── components/
│   │   │   ├── common/          # Reusable UI (Navbar, Footer, Modal, StatCard, Icons)
│   │   │   ├── developer/       # Developer sidebar, headers, task & message cards
│   │   │   ├── landing/         # Hero, DashboardPreview, HorizontalFeatures, HowItWorks
│   │   │   ├── manager/         # Manager sidebar, project modals, empty states
│   │   │   └── workspace/       # Workspace layout, file explorer, code editor
│   │   ├── hooks/               # Custom hooks (useAuth, useMessages, useUnreadMessages, etc.)
│   │   ├── pages/
│   │   │   ├── Developer/       # Developer console screens (Dashboard, Tasks, Messages, etc.)
│   │   │   ├── Manager/         # Manager console screens (Dashboard, Projects, Team, etc.)
│   │   │   ├── Workspace/       # Workspace screens (Overview, CodeEditor, Reviews, etc.)
│   │   │   ├── public/          # LandingPage, LoginPage, RegisterPage, OtpVerification
│   │   │   └── System/          # 404, Unauthorized, and Error screens
│   │   ├── App.jsx              # Client-side router & navigation state
│   │   ├── index.css            # Global typography, scrollbar styling & design tokens
│   │   └── main.jsx             # React DOM entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 📋 Prerequisites

Before running the application locally, ensure you have:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas connection string

---

## 🚀 Getting Started

### 1. Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   *(Review and update `.env` values as described in the [Environment Variables](#-environment-variables) section).*

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server runs by default on `http://localhost:5000`.*

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client runs by default on `http://localhost:5173`.*

4. Build for production:
   ```bash
   npm run build
   ```

---

## 🔐 Environment Variables

Create a `.env` file in `Backend/` based on `.env.example`:

```ini
PORT=5000
SERVER_URL=http://localhost:5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/gitsphere

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRE_DAYS=7

# Email / Nodemailer (OTP Verification)
EMAIL_SERVICE=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
EMAIL_FROM="GitSphere Security" <no-reply@gitsphere.com>

# Notification & Chat Settings
NOTIFICATION_TTL_DAYS=30
```

---

## 📡 API Reference

When the backend is running, complete interactive OpenAPI/Swagger documentation is available at:
👉 **`http://localhost:5000/api/docs`**

### Key REST Endpoints

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | `POST` | `/api/v1/auth/register` | Register new account (Manager or Developer) |
| | `POST` | `/api/v1/auth/verify-otp` | Verify registration OTP code |
| | `POST` | `/api/v1/auth/login` | Authenticate user & issue JWT |
| | `POST` | `/api/v1/auth/logout` | Clear session cookie |
| | `GET` | `/api/v1/auth/me` | Fetch authenticated user profile |
| **Projects** | `GET` | `/api/v1/projects` | List accessible projects |
| | `POST` | `/api/v1/projects` | Create a new project (Manager only) |
| | `GET` | `/api/v1/projects/:id` | Fetch project details, members, & files |
| | `POST` | `/api/v1/projects/:id/members` | Add developer to project from active roster |
| **Tasks** | `GET` | `/api/v1/tasks` | List tasks (filtered by project/assignee) |
| | `POST` | `/api/v1/tasks` | Create task with priority & deadline |
| | `PATCH` | `/api/v1/tasks/:id/status` | Update task progress state |
| **Contributions**| `GET` | `/api/v1/contributions` | List pull requests / code submissions |
| | `POST` | `/api/v1/contributions` | Submit code review request |
| | `PATCH` | `/api/v1/contributions/:id/review` | Approve or request changes on contribution |
| **Messages** | `GET` | `/api/v1/messages/unread` | Global unread message count |
| | `PATCH` | `/api/v1/messages/read` | Mark messages as read |
| | `GET` | `/api/v1/projects/:id/messages` | Fetch messages (project or 1-on-1 developer) |
| | `POST` | `/api/v1/messages` | Send message to channel or recipient |
| **Users** | `GET` | `/api/v1/users/developers` | Get list of active registered developers |
| | `DELETE`| `/api/v1/users/account` | Permanently delete account & associated data |

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
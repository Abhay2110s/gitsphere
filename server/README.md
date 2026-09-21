# GitSphere Backend

GitSphere is a real-time collaborative coding and code review platform where Managers assign coding tasks to Users who collaborate within a Monaco Code Editor, stream real-time code changes via Socket.IO, and manage code review cycles.

## Phase 1: Backend Foundation

This phase initializes the backend foundation following the specified clean modular architecture.

### Directory Structure

```text
server/
├── src/
│   ├── config/
│   │   └── db.js                  # MongoDB Mongoose connection
│   ├── middleware/
│   │   └── error.middleware.js    # Centralized error handler & 404 catcher
│   ├── utils/
│   │   ├── asyncHandler.js        # Controller wrapper for async errors
│   │   └── response.js            # Standardized API response helpers & AppError
│   ├── app.js                     # Express app configuration & middleware
│   └── server.js                  # HTTP server bootstrap & graceful shutdown
├── .env                           # Environment variables
├── .env.example                   # Template environment variables
├── package.json                   # Dependencies and scripts
└── README.md                      # Backend documentation
```

### Setup & Installation

1. Navigate to the server folder:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure MongoDB is running locally (default: `mongodb://127.0.0.1:27017/gitsphere`).

4. Start the development server:
   ```bash
   npm run dev
   ```
   Or run standard start:
   ```bash
   npm start
   ```

### Verifying Endpoints

- **Root Endpoint**:
  ```http
  GET http://localhost:5000/
  ```

- **Health Check Endpoint**:
  ```http
  GET http://localhost:5000/api/v1/health
  ```
  Returns:
  ```json
  {
    "success": true,
    "message": "GitSphere API health check passed",
    "data": {
      "status": "healthy",
      "uptime": 1.25,
      "timestamp": "2026-09-21T16:50:00.000Z",
      "environment": "development",
      "database": {
        "status": "connected",
        "readyState": 1
      }
    }
  }
  ```

- **404 / Error Middleware Test**:
  ```http
  GET http://localhost:5000/api/v1/unknown-route
  ```
  Returns:
  ```json
  {
    "success": false,
    "message": "Route not found: GET /api/v1/unknown-route",
    "errorCode": "NOT_FOUND"
  }
  ```

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'GitSphere (CodeCollab) API Documentation',
    version: '1.0.0',
    description:
      'Real-Time Collaborative Coding & Code Review Platform REST API. Built specifically for software development collaboration with exactly two roles: MANAGER and USER.',
    contact: {
      name: 'GitSphere Team',
      url: 'https://github.com/Abhay2110s/gitsphere'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server (v1)'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Authorization header using Bearer scheme. Example: "Bearer {token}"'
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'HTTP-only authentication cookie'
      }
    },
    schemas: {
      StandardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object' },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 20 },
              total: { type: 'integer', example: 45 },
              totalPages: { type: 'integer', example: 3 }
            }
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errorCode: { type: 'string', example: 'VALIDATION_ERROR' },
          details: { type: 'array', items: { type: 'string' } }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
          name: { type: 'string', example: 'Rahul Sharma' },
          email: { type: 'string', format: 'email', example: 'rahul@example.com' },
          role: { type: 'string', enum: ['MANAGER', 'USER'], example: 'USER' },
          avatar: { type: 'string', example: 'https://api.dicebear.com/7.x/identicon/svg?seed=rahul' },
          bio: { type: 'string', example: 'Frontend developer' },
          isActive: { type: 'boolean', example: true },
          lastSeen: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Project: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d2' },
          name: { type: 'string', example: 'E-Commerce Platform' },
          description: { type: 'string', example: 'Full-stack online shop' },
          status: { type: 'string', enum: ['PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED'], example: 'ACTIVE' },
          createdBy: { $ref: '#/components/schemas/User' },
          members: { type: 'array', items: { $ref: '#/components/schemas/User' } },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d3' },
          title: { type: 'string', example: 'Implement Authentication API' },
          description: { type: 'string', example: 'Add JWT login and register' },
          project: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d2' },
          assignedTo: { $ref: '#/components/schemas/User' },
          createdBy: { $ref: '#/components/schemas/User' },
          status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'CHANGES_REQUESTED', 'COMPLETED'], example: 'IN_PROGRESS' },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'], example: 'HIGH' },
          deadline: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Contribution: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d4' },
          project: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d2' },
          task: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d3' },
          developer: { $ref: '#/components/schemas/User' },
          version: { type: 'integer', example: 1 },
          files: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string', example: 'src/index.js' },
                content: { type: 'string', example: 'console.log("hello");' },
                language: { type: 'string', example: 'javascript' }
              }
            }
          },
          status: { type: 'string', enum: ['DRAFT', 'IN_REVIEW', 'APPROVED', 'CHANGES_REQUESTED'], example: 'IN_REVIEW' },
          reviewComment: { type: 'string', example: 'Great work, approved.' },
          submittedAt: { type: 'string', format: 'date-time' },
          reviewedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  tags: [
    { name: 'Auth', description: 'Authentication & Session Management' },
    { name: 'Users', description: 'User Profile & Directory' },
    { name: 'Projects', description: 'Project Management & Membership' },
    { name: 'Tasks', description: 'Coding Tasks Management' },
    { name: 'Code', description: 'Code Files, Versions & Workspace' },
    { name: 'Reviews', description: 'Code Review Workflow (Approve / Request Changes)' },
    { name: 'Contributions', description: 'Code Contributions, Approval & Version History' },
    { name: 'Comments', description: 'Code File Line Comments' },
    { name: 'Messages', description: 'Project & Task Chat' },
    { name: 'Notifications', description: 'Real-Time Notifications' },
    { name: 'Activity', description: 'Project Activity & Audit Logs' },
    { name: 'Attachments', description: 'File Attachments' },
    { name: 'Dashboard', description: 'Manager & User Metrics Dashboards' }
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Public User Registration (creates USER role)',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Alex Developer' },
                  email: { type: 'string', format: 'email', example: 'alex@example.com' },
                  password: { type: 'string', minLength: 8, example: 'Password123' },
                  bio: { type: 'string', example: 'Backend engineer' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'User registered successfully' },
          400: { description: 'Validation error' },
          409: { description: 'Email already registered' }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'User & Manager Login',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'manager@gitsphere.com' },
                  password: { type: 'string', example: 'ManagerPassword123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout current user',
        responses: { 200: { description: 'Logged out successfully' } }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user profile',
        responses: { 200: { description: 'Profile retrieved' }, 401: { description: 'Unauthorized' } }
      }
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'List users in the system (Manager only)',
        parameters: [
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['MANAGER', 'USER'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
        ],
        responses: { 200: { description: 'Users list' }, 403: { description: 'Forbidden (Manager only)' } }
      }
    },
    '/projects': {
      get: {
        tags: ['Projects'],
        summary: 'Get all accessible projects (Manager sees created, User sees memberships)',
        responses: { 200: { description: 'Projects list' } }
      },
      post: {
        tags: ['Projects'],
        summary: 'Create project (Manager only)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'GitSphere Core' },
                  description: { type: 'string', example: 'Real-time collaborative IDE' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Project created' }, 403: { description: 'Forbidden' } }
      }
    },
    '/projects/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Get project details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Project details' }, 403: { description: 'Forbidden' } }
      },
      patch: {
        tags: ['Projects'],
        summary: 'Update project (Manager only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Project updated' } }
      },
      delete: {
        tags: ['Projects'],
        summary: 'Delete project (Manager only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Project deleted' } }
      }
    },
    '/projects/{id}/members': {
      get: {
        tags: ['Projects'],
        summary: 'Get project members list',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Members list' } }
      },
      post: {
        tags: ['Projects'],
        summary: 'Add User to project members (Manager only, User role only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId'],
                properties: { userId: { type: 'string' } }
              }
            }
          }
        },
        responses: { 200: { description: 'Member added' } }
      }
    },
    '/projects/{id}/members/{userId}': {
      delete: {
        tags: ['Projects'],
        summary: 'Remove User from project members (Manager only)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'userId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Member removed' } }
      }
    },
    '/projects/{projectId}/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'Get tasks in project',
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Tasks list' } }
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create coding task (Manager only)',
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', example: 'Build Monaco Editor Component' },
                  description: { type: 'string', example: 'Configure editor options and syntax themes' },
                  assignedTo: { type: 'string' },
                  priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
                  deadline: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Task created' } }
      }
    },
    '/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Get task by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Task details' } }
      },
      patch: {
        tags: ['Tasks'],
        summary: 'Update task details (Manager only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Task updated' } }
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete task (Manager only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Task deleted' } }
      }
    },
    '/tasks/{id}/status': {
      patch: {
        tags: ['Tasks'],
        summary: 'Update task status (strictly enforces state transitions)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'CHANGES_REQUESTED', 'COMPLETED'] }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Status updated' }, 403: { description: 'Forbidden (Rule 11: Self-approval prohibited)' } }
      }
    },
    '/tasks/{id}/assign': {
      patch: {
        tags: ['Tasks'],
        summary: 'Assign task to project member (Manager only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { assignedTo: { type: 'string' } }
              }
            }
          }
        },
        responses: { 200: { description: 'Task assigned' } }
      }
    },
    '/tasks/my-tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'Get tasks assigned to current user',
        responses: { 200: { description: 'Assigned tasks list' } }
      }
    },
    '/tasks/{taskId}/files': {
      get: {
        tags: ['Code'],
        summary: 'Get all code files for a task',
        parameters: [{ name: 'taskId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Files list' } }
      },
      post: {
        tags: ['Code'],
        summary: 'Create code file inside task (Assigned User or Manager)',
        parameters: [{ name: 'taskId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fileName', 'language'],
                properties: {
                  fileName: { type: 'string', example: 'index.js' },
                  language: { type: 'string', example: 'javascript' },
                  content: { type: 'string', example: 'console.log("Hello World");' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Code file created' } }
      }
    },
    '/code/files/{id}': {
      get: {
        tags: ['Code'],
        summary: 'Get file content by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'File content' } }
      },
      put: {
        tags: ['Code'],
        summary: 'Save file content (Assigned User only, creates CodeVersion)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: {
                  content: { type: 'string' },
                  commitMessage: { type: 'string', example: 'Added error handling' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'File saved and version created' } }
      }
    },
    '/code/files/{fileId}/versions': {
      get: {
        tags: ['Code'],
        summary: 'Get version history for a file',
        parameters: [{ name: 'fileId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Version history' } }
      }
    },
    '/code/files/{fileId}/versions/{versionNumber}/restore': {
      post: {
        tags: ['Code'],
        summary: 'Restore a previous file version',
        parameters: [
          { name: 'fileId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'versionNumber', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Version restored' } }
      }
    },
    '/tasks/{taskId}/reviews': {
      post: {
        tags: ['Reviews'],
        summary: 'Submit code for review (Assigned User only)',
        parameters: [{ name: 'taskId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { summary: { type: 'string', example: 'Completed authentication logic' } }
              }
            }
          }
        },
        responses: { 201: { description: 'Review submitted' } }
      },
      get: {
        tags: ['Reviews'],
        summary: 'Get all reviews for a task',
        parameters: [{ name: 'taskId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Reviews list' } }
      }
    },
    '/reviews/{reviewId}': {
      get: {
        tags: ['Reviews'],
        summary: 'Get code review details',
        parameters: [{ name: 'reviewId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Review details' } }
      },
      patch: {
        tags: ['Reviews'],
        summary: 'Evaluate code review: Approve or Request Changes (Manager only)',
        parameters: [{ name: 'reviewId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['APPROVED', 'CHANGES_REQUESTED'] },
                  summary: { type: 'string', example: 'Looks good! Approved.' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Review evaluated' } }
      }
    },
    '/code/files/{fileId}/comments': {
      get: {
        tags: ['Comments'],
        summary: 'Get line comments for a file',
        parameters: [{ name: 'fileId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Comments list' } }
      },
      post: {
        tags: ['Comments'],
        summary: 'Add inline code comment',
        parameters: [{ name: 'fileId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['lineNumber', 'content'],
                properties: {
                  lineNumber: { type: 'integer', example: 42 },
                  content: { type: 'string', example: 'Consider optimizing this loop.' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Comment created' } }
      }
    },
    '/code/comments/{commentId}/resolve': {
      patch: {
        tags: ['Comments'],
        summary: 'Resolve or unresolve a code comment',
        parameters: [{ name: 'commentId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Comment resolution toggled' } }
      }
    },
    '/projects/{projectId}/messages': {
      get: {
        tags: ['Messages'],
        summary: 'Get project chat messages',
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Messages list' } }
      }
    },
    '/tasks/{taskId}/messages': {
      get: {
        tags: ['Messages'],
        summary: 'Get task-scoped chat messages',
        parameters: [{ name: 'taskId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Task messages' } }
      }
    },
    '/messages': {
      post: {
        tags: ['Messages'],
        summary: 'Send chat message',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['projectId', 'content'],
                properties: {
                  projectId: { type: 'string' },
                  taskId: { type: 'string' },
                  content: { type: 'string', example: 'Hello team!' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Message sent' } }
      }
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get notifications for authenticated user',
        parameters: [
          { name: 'isRead', in: 'query', schema: { type: 'boolean' } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
        ],
        responses: { 200: { description: 'Notifications list with unreadCount' } }
      }
    },
    '/notifications/read-all': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        responses: { 200: { description: 'All notifications marked as read' } }
      }
    },
    '/notifications/{id}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark single notification as read',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Notification marked read' } }
      }
    },
    '/activity': {
      get: {
        tags: ['Activity'],
        summary: 'Get activity logs',
        parameters: [
          { name: 'projectId', in: 'query', schema: { type: 'string' } },
          { name: 'taskId', in: 'query', schema: { type: 'string' } },
          { name: 'action', in: 'query', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Activity logs' } }
      }
    },
    '/attachments/upload': {
      post: {
        tags: ['Attachments'],
        summary: 'Upload file attachment (multipart/form-data, max 10MB, no executables)',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: { type: 'string', format: 'binary' },
                  projectId: { type: 'string' },
                  taskId: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'File uploaded' }, 400: { description: 'Disallowed file type' } }
      }
    },
    '/attachments': {
      get: {
        tags: ['Attachments'],
        summary: 'List attachments',
        parameters: [
          { name: 'projectId', in: 'query', schema: { type: 'string' } },
          { name: 'taskId', in: 'query', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Attachments list' } }
      }
    },
    '/contributions': {
      post: {
        tags: ['Contributions'],
        summary: 'Submit code contribution for review (Developer/User)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['projectId', 'taskId', 'files'],
                properties: {
                  projectId: { type: 'string' },
                  taskId: { type: 'string' },
                  files: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['path', 'content'],
                      properties: {
                        path: { type: 'string', example: 'src/app.js' },
                        content: { type: 'string', example: 'console.log("GitSphere");' },
                        language: { type: 'string', example: 'javascript' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Contribution submitted' }, 400: { description: 'Validation error' } }
      },
      get: {
        tags: ['Contributions'],
        summary: 'List contributions for project (filterable by status, taskId, developerId)',
        parameters: [
          { name: 'projectId', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'IN_REVIEW', 'APPROVED', 'CHANGES_REQUESTED'] } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Contributions list' } }
      }
    },
    '/contributions/pending': {
      get: {
        tags: ['Contributions'],
        summary: 'Get all pending (IN_REVIEW) contributions across Manager projects (Manager only)',
        responses: { 200: { description: 'Pending contributions' }, 403: { description: 'Forbidden' } }
      }
    },
    '/contributions/{contributionId}': {
      get: {
        tags: ['Contributions'],
        summary: 'Get single contribution details',
        parameters: [{ name: 'contributionId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Contribution details' }, 404: { description: 'Not found' } }
      }
    },
    '/contributions/{contributionId}/approve': {
      patch: {
        tags: ['Contributions'],
        summary: 'Approve contribution and merge code into project (Manager only)',
        parameters: [{ name: 'contributionId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Contribution approved' }, 403: { description: 'Forbidden' } }
      }
    },
    '/contributions/{contributionId}/request-changes': {
      patch: {
        tags: ['Contributions'],
        summary: 'Request changes on contribution (Manager only)',
        parameters: [{ name: 'contributionId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['comment'],
                properties: { comment: { type: 'string', example: 'Please fix edge cases in error handling.' } }
              }
            }
          }
        },
        responses: { 200: { description: 'Changes requested' }, 403: { description: 'Forbidden' } }
      }
    },
    '/projects/{projectId}/code': {
      get: {
        tags: ['Contributions'],
        summary: 'Get latest approved shared code for project',
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Latest project code files and version' } }
      }
    },
    '/projects/{projectId}/versions': {
      get: {
        tags: ['Contributions'],
        summary: 'Get version history for project',
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Version history' } }
      }
    },
    '/projects/{projectId}/versions/{version}': {
      get: {
        tags: ['Contributions'],
        summary: 'Get immutable code snapshot for specific version number',
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'version', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Historical version snapshot' } }
      }
    },
    '/dashboard/manager': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get Manager Dashboard metrics (Manager only)',
        responses: { 200: { description: 'Manager metrics' }, 403: { description: 'Forbidden' } }
      }
    },
    '/dashboard/user': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get User Dashboard metrics (User and Manager)',
        responses: { 200: { description: 'User metrics' } }
      }
    }
  }
};

# Task Management API Documentation

## Table of Contents
- [Base URL](#base-url)
- [Data Model](#data-model)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Get All Tasks](#1-get-all-tasks)
  - [Get Task by ID](#2-get-task-by-id)
  - [Create Task](#3-create-task)
  - [Update Task](#4-update-task)
  - [Delete Task](#5-delete-task)
- [Error Handling](#error-handling)
- [Architecture](#architecture)
- [Testing](#testing)
- [Production Considerations](#production-considerations)

---

## Base URL
```
http://localhost:3000
```

All task endpoints are prefixed with `/api`.

---

## Data Model

### Task Object
```typescript
{
  id: string;                              // UUID v4, auto-generated
  title: string;                           // Max 100 characters
  description: string;                     // Max 500 characters
  status: 'todo' | 'in-progress' | 'done'; // Defaults to 'todo'
  priority: 'high' | 'medium' | 'low';
  dueDate: string;                         // ISO 8601 datetime string
  createdAt: string;                       // ISO 8601 datetime, auto-generated
  updatedAt: string;                       // ISO 8601 datetime, auto-updated
}
```

**Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation for the task management service",
  "status": "in-progress",
  "priority": "high",
  "dueDate": "2026-04-05T17:00:00.000Z",
  "createdAt": "2026-04-01T10:00:00.000Z",
  "updatedAt": "2026-04-01T10:00:00.000Z"
}
```

---

## Endpoints

### Health Check
**GET** `/health`

Returns the health status of the server.

**Response:** `200 OK`
```json
{
  "status": "ok"
}
```

**Example:**
```bash
curl http://localhost:3000/health
```

---

### 1. Get All Tasks
**GET** `/api/tasks`

Retrieve all tasks, sorted by `dueDate` ascending. Optionally filter by status.

**Query Parameters:**
| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `status`  | string | No       | Filter tasks by status: `todo`, `in-progress`, or `done` |

**Response:** `200 OK`
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Fix login bug",
    "description": "Resolve authentication issue on the login page",
    "status": "todo",
    "priority": "high",
    "dueDate": "2026-04-05T17:00:00.000Z",
    "createdAt": "2026-04-01T08:00:00.000Z",
    "updatedAt": "2026-04-01T08:00:00.000Z"
  },
  {
    "id": "661f9511-f30c-52e5-b827-557766551111",
    "title": "Write unit tests",
    "description": "Add unit tests for the task service layer",
    "status": "in-progress",
    "priority": "medium",
    "dueDate": "2026-04-10T17:00:00.000Z",
    "createdAt": "2026-04-01T09:00:00.000Z",
    "updatedAt": "2026-04-01T09:30:00.000Z"
  }
]
```

**Error Response:** `400 Bad Request` (invalid status query parameter)
```json
{
  "error": {
    "message": "Status must be one of: todo, in-progress, done",
    "statusCode": 400
  }
}
```

**Examples:**
```bash
# Get all tasks
curl http://localhost:3000/api/tasks

# Filter by status
curl http://localhost:3000/api/tasks?status=todo
curl http://localhost:3000/api/tasks?status=in-progress
curl http://localhost:3000/api/tasks?status=done
```

---

### 2. Get Task by ID
**GET** `/api/tasks/:id`

Retrieve a single task by its UUID.

**URL Parameters:**
| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| `id`      | string | Yes      | The task UUID   |

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Fix login bug",
  "description": "Resolve authentication issue on the login page",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-04-05T17:00:00.000Z",
  "createdAt": "2026-04-01T08:00:00.000Z",
  "updatedAt": "2026-04-01T08:00:00.000Z"
}
```

**Error Responses:**

`400 Bad Request` (invalid or empty ID)
```json
{
  "error": {
    "message": "Invalid task ID",
    "statusCode": 400
  }
}
```

`404 Not Found`
```json
{
  "error": {
    "message": "Task with ID 550e8400-e29b-41d4-a716-446655440000 not found",
    "statusCode": 404
  }
}
```

**Example:**
```bash
curl http://localhost:3000/api/tasks/550e8400-e29b-41d4-a716-446655440000
```

---

### 3. Create Task
**POST** `/api/tasks`

Create a new task.

**Request Body:**
| Field         | Type   | Required | Description |
|---------------|--------|----------|-------------|
| `title`       | string | Yes      | Task title, max 100 characters |
| `description` | string | Yes      | Task description, max 500 characters |
| `status`      | string | No       | `todo`, `in-progress`, or `done`. Defaults to `todo` |
| `priority`    | string | Yes      | `high`, `medium`, or `low` |
| `dueDate`     | string | Yes      | Due date in ISO 8601 format |

**Business Rules:**
- `high` priority tasks must have a `dueDate` within the next 7 days.

**Request Example:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation for the task management service",
  "status": "in-progress",
  "priority": "high",
  "dueDate": "2026-04-05T17:00:00.000Z"
}
```

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation for the task management service",
  "status": "in-progress",
  "priority": "high",
  "dueDate": "2026-04-05T17:00:00.000Z",
  "createdAt": "2026-04-01T10:05:00.000Z",
  "updatedAt": "2026-04-01T10:05:00.000Z"
}
```

**Error Responses:**

`400 Bad Request` — missing or invalid `title`
```json
{
  "error": {
    "message": "Title is required and must be a non-empty string",
    "statusCode": 400
  }
}
```

`400 Bad Request` — missing or invalid `priority`
```json
{
  "error": {
    "message": "Priority must be one of: high, medium, low",
    "statusCode": 400
  }
}
```

`400 Bad Request` — `high` priority with `dueDate` more than 7 days away
```json
{
  "error": {
    "message": "High priority tasks must have a due date within the next 7 days",
    "statusCode": 400
  }
}
```

**curl Example:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation for the task management service",
    "status": "in-progress",
    "priority": "high",
    "dueDate": "2026-04-05T17:00:00.000Z"
  }'
```

---

### 4. Update Task
**PATCH** `/api/tasks/:id`

Partially update an existing task. All body fields are optional, but at least one must be provided.

**URL Parameters:**
| Parameter | Type   | Required | Description   |
|-----------|--------|----------|---------------|
| `id`      | string | Yes      | The task UUID |

**Request Body (all fields optional):**
| Field         | Type   | Description |
|---------------|--------|-------------|
| `title`       | string | New title, max 100 characters |
| `description` | string | New description, max 500 characters |
| `status`      | string | `todo`, `in-progress`, or `done` |
| `priority`    | string | `high`, `medium`, or `low` |
| `dueDate`     | string | New due date in ISO 8601 format |

**Business Rules:**
- Tasks with status `done` cannot be updated. To modify a completed task, first change its status back to `todo` or `in-progress`.
- `high` priority tasks must have a `dueDate` within the next 7 days.

**Request Example:**
```json
{
  "status": "done"
}
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation for the task management service",
  "status": "done",
  "priority": "high",
  "dueDate": "2026-04-05T17:00:00.000Z",
  "createdAt": "2026-04-01T10:05:00.000Z",
  "updatedAt": "2026-04-01T11:00:00.000Z"
}
```

**Error Responses:**

`400 Bad Request` — empty request body
```json
{
  "error": {
    "message": "At least one field (title, description, status, priority, or dueDate) must be provided",
    "statusCode": 400
  }
}
```

`400 Bad Request` — attempting to update a completed task
```json
{
  "error": {
    "message": "Cannot update a completed task. Please change the status to 'todo' or 'in-progress' first.",
    "statusCode": 400
  }
}
```

`400 Bad Request` — invalid ID
```json
{
  "error": {
    "message": "Invalid task ID",
    "statusCode": 400
  }
}
```

`404 Not Found`
```json
{
  "error": {
    "message": "Task with ID 550e8400-e29b-41d4-a716-446655440000 not found",
    "statusCode": 404
  }
}
```

**curl Examples:**
```bash
# Mark a task as done
curl -X PATCH http://localhost:3000/api/tasks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'

# Update multiple fields at once
curl -X PATCH http://localhost:3000/api/tasks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated task title",
    "priority": "medium",
    "dueDate": "2026-04-15T17:00:00.000Z"
  }'
```

---

### 5. Delete Task
**DELETE** `/api/tasks/:id`

Permanently delete a task by its UUID.

**URL Parameters:**
| Parameter | Type   | Required | Description   |
|-----------|--------|----------|---------------|
| `id`      | string | Yes      | The task UUID |

**Response:** `204 No Content` — empty response body

**Error Responses:**

`400 Bad Request` — invalid or empty ID
```json
{
  "error": {
    "message": "Invalid task ID",
    "statusCode": 400
  }
}
```

`404 Not Found`
```json
{
  "error": {
    "message": "Task with ID 550e8400-e29b-41d4-a716-446655440000 not found",
    "statusCode": 404
  }
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/tasks/550e8400-e29b-41d4-a716-446655440000
```

---

## Error Handling

All error responses follow a consistent format:

```json
{
  "error": {
    "message": "Descriptive error message",
    "statusCode": 400
  }
}
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| `200 OK` | Success | Successful GET or PATCH |
| `201 Created` | Resource created | Successful POST |
| `204 No Content` | Success, no body | Successful DELETE |
| `400 Bad Request` | Validation error | Invalid input or business rule violation |
| `404 Not Found` | Resource missing | Task ID does not exist |
| `500 Internal Server Error` | Server fault | Unexpected server error |

### Validation Error Reference

| Field | Rule | Error Message |
|-------|------|---------------|
| `title` | Required, non-empty | `"Title is required and must be a non-empty string"` |
| `title` | Max 100 characters | `"Title must not exceed 100 characters"` |
| `description` | Required, non-empty | `"Description is required and must be a non-empty string"` |
| `description` | Max 500 characters | `"Description must not exceed 500 characters"` |
| `status` | Valid enum value | `"Status must be one of: todo, in-progress, done"` |
| `priority` | Required, valid enum | `"Priority must be one of: high, medium, low"` |
| `dueDate` | Required, valid ISO 8601 | `"Due date must be a valid ISO 8601 date"` |
| `priority` + `dueDate` | High priority within 7 days | `"High priority tasks must have a due date within the next 7 days"` |
| Update body | At least one field | `"At least one field (title, description, status, priority, or dueDate) must be provided"` |
| Completed task update | Task not in `done` state | `"Cannot update a completed task. Please change the status to 'todo' or 'in-progress' first."` |
| `id` param | Non-empty, valid format | `"Invalid task ID"` |
| `id` param | Must exist | `"Task with ID {id} not found"` |

---

## Architecture

The backend follows a layered architecture:

```
Client Request
     │
     ▼
Routes Layer         (routes/task.routes.ts)      – maps URLs to handlers
     │
     ▼
Middleware Layer     (middleware/validation.ts)    – validates request inputs
     │
     ▼
Controllers Layer    (controllers/task.controller.ts) – handles HTTP req/res
     │
     ▼
Services Layer       (services/task.service.ts)   – business logic & storage
     │
     ▼
Models Layer         (models/task.model.ts)        – TypeScript interfaces
```

### Design Patterns
- **Singleton Service** — A single `TaskService` instance manages all in-memory task data
- **Middleware Pattern** — Validation and error handling are applied as middleware
- **DTO Pattern** — `CreateTaskDto` and `UpdateTaskDto` separate input shapes from the domain model
- **Repository Pattern** — `TaskService` acts as the data access layer

### Storage
Tasks are stored in-memory using a `Map<string, Task>` and persisted to a local `tasks.json` file on every write operation.

---

## Testing

Run the included test script to verify all endpoints:

```bash
# Start the server
npm run dev

# In a separate terminal, run the test script
./test-api.sh
```

The test script covers:
- All CRUD operations
- Validation rules
- Error handling
- Status filtering
- Business rule enforcement (high priority + due date constraint)
- Edge cases

A Postman collection is also available at `postman_collection.json`.

---

## Production Considerations

The current implementation uses in-memory storage. Before deploying to production:

- Replace the in-memory `Map` with a persistent database (MongoDB, PostgreSQL, etc.)
- Add authentication and authorization (e.g., JWT)
- Implement rate limiting
- Configure CORS for specific allowed origins
- Add structured request logging
- Add pagination for large task lists
- Add full-text search and advanced filtering

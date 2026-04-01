# Task Management API Documentation

> **OpenAPI Specification:** A machine-readable OpenAPI 3.0 spec covering the core Task API endpoints is available at [`docs/openapi.yaml`](docs/openapi.yaml).

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### 1. Get All Tasks
**GET** `/tasks`

Retrieve all tasks with optional filtering by status.

**Query Parameters:**
- `status` (optional): Filter tasks by status (`todo`, `in-progress`, or `done`)

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "Sample Task",
    "description": "This is a sample task",
    "status": "todo",
    "priority": "medium",
    "dueDate": "2026-04-07T00:00:00.000Z",
    "createdAt": "2026-02-20T10:00:00.000Z",
    "updatedAt": "2026-02-20T10:00:00.000Z"
  }
]
```

**Example:**
```bash
curl http://localhost:3000/api/tasks
curl http://localhost:3000/api/tasks?status=todo
```

---

### 2. Get Task by ID
**GET** `/tasks/:id`

Retrieve a single task by its ID.

**URL Parameters:**
- `id` (required): The task ID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Sample Task",
  "description": "This is a sample task",
  "status": "todo",
  "priority": "medium",
  "dueDate": "2026-04-07T00:00:00.000Z",
  "createdAt": "2026-02-20T10:00:00.000Z",
  "updatedAt": "2026-02-20T10:00:00.000Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": {
    "message": "Task with ID {id} not found",
    "statusCode": 404
  }
}
```

**Example:**
```bash
curl http://localhost:3000/api/tasks/123e4567-e89b-12d3-a456-426614174000
```

---

### 3. Create Task
**POST** `/tasks`

Create a new task.

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-04-07T00:00:00.000Z"
}
```

**Validation Rules:**
- `title`: Required, non-empty string, max 100 characters
- `description`: Required, non-empty string, max 500 characters
- `status`: Optional, must be one of: `todo`, `in-progress`, `done` (defaults to `todo`)
- `priority`: Required, must be one of: `high`, `medium`, `low`
- `dueDate`: Required, must be a valid ISO 8601 date; high priority tasks must have a due date within the next 7 days

**Response:** `201 Created`
```json
{
  "id": "generated-uuid",
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-04-07T00:00:00.000Z",
  "createdAt": "2026-02-20T10:05:00.000Z",
  "updatedAt": "2026-02-20T10:05:00.000Z"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "error": {
    "message": "Title is required and must be a non-empty string",
    "statusCode": 400
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "status": "in-progress",
    "priority": "high",
    "dueDate": "2026-04-07T00:00:00.000Z"
  }'
```

---

### 4. Update Task
**PATCH** `/tasks/:id`

Update an existing task. You can update one or more fields.

**URL Parameters:**
- `id` (required): The task ID

**Request Body:**
```json
{
  "title": "Updated Title",        // optional
  "description": "Updated desc",   // optional
  "status": "in-progress",         // optional
  "priority": "medium",            // optional
  "dueDate": "2026-04-10T00:00:00.000Z"  // optional
}
```

**Validation Rules:**
- At least one field must be provided
- `title`: Non-empty string, max 100 characters (if provided)
- `description`: Non-empty string, max 500 characters (if provided)
- `status`: Must be one of: `todo`, `in-progress`, `done` (if provided)
- `priority`: Must be one of: `high`, `medium`, `low` (if provided)
- `dueDate`: Must be a valid ISO 8601 date (if provided); if `priority` is `high`, must be within the next 7 days

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Updated Title",
  "description": "Updated desc",
  "status": "in-progress",
  "priority": "medium",
  "dueDate": "2026-04-10T00:00:00.000Z",
  "createdAt": "2026-02-20T10:00:00.000Z",
  "updatedAt": "2026-02-20T10:10:00.000Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": {
    "message": "Task with ID {id} not found",
    "statusCode": 404
  }
}
```

**Example:**
```bash
curl -X PATCH http://localhost:3000/api/tasks/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "done"
  }'
```

---

### 5. Delete Task
**DELETE** `/tasks/:id`

Delete a task by its ID.

**URL Parameters:**
- `id` (required): The task ID

**Response:** `204 No Content`

**Error Response:** `404 Not Found`
```json
{
  "error": {
    "message": "Task with ID {id} not found",
    "statusCode": 404
  }
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/tasks/123e4567-e89b-12d3-a456-426614174000
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

### Common HTTP Status Codes:
- `200 OK` - Successful GET/PATCH request
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Validation error or malformed request
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Data Model

### Task Object
```typescript
{
  id: string;              // UUID v4
  title: string;           // Max 100 characters
  description: string;     // Max 500 characters
  status: 'todo' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;         // ISO 8601 datetime
  createdAt: string;       // ISO 8601 datetime
  updatedAt: string;       // ISO 8601 datetime
}
```

---

## Testing

Run the provided test script to verify all endpoints:

```bash
# Make sure the server is running first
npm run dev

# In a new terminal, run the test script
./test-api.sh
```

The test script will verify:
- All CRUD operations
- Validation rules
- Error handling
- Status filtering
- Edge cases

---

## Architecture

### Layered Architecture:
1. **Routes** (`routes/task.routes.ts`) - Endpoint definitions
2. **Middleware** (`middleware/validation.ts`) - Request validation
3. **Controllers** (`controllers/task.controller.ts`) - Request/response handling
4. **Services** (`services/task.service.ts`) - Business logic
5. **Models** (`models/task.model.ts`) - TypeScript interfaces

### Design Patterns:
- **Singleton Service** - Single instance of TaskService for in-memory storage
- **Middleware Pattern** - Validation and error handling
- **DTO Pattern** - CreateTaskDto and UpdateTaskDto for data transfer
- **Repository Pattern** - TaskService acts as data repository

---

## Production Considerations

Current implementation uses in-memory storage. For production:
- Replace in-memory Map with database (MongoDB, PostgreSQL, etc.)
- Add authentication and authorization
- Implement rate limiting
- Add request logging
- Set up CORS properly for specific origins
- Add comprehensive error logging
- Implement data persistence
- Add pagination for large datasets
- Add search and advanced filtering

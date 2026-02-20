#!/bin/bash

echo "=== Testing Task Management API ==="
echo ""

# Base URL
BASE_URL="http://localhost:3000/api"

# Function to pretty print JSON (simple alternative to jq)
print_json() {
  python3 -m json.tool 2>/dev/null || cat
}

echo "1. Testing Health Endpoint"
echo "GET /health"
curl -s http://localhost:3000/health | print_json
echo -e "\n"

echo "2. Get All Tasks"
echo "GET /api/tasks"
curl -s $BASE_URL/tasks | print_json
echo -e "\n"

echo "3. Create a New Task"
echo "POST /api/tasks"
TASK_RESPONSE=$(curl -s -X POST $BASE_URL/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "This is a test task created via API",
    "status": "todo",
    "priority": "high",
    "dueDate": "'$(date -d '+2 days' -I)'T12:00:00.000Z"
  }')
echo "$TASK_RESPONSE" | print_json

# Extract ID using grep and sed (works without jq)
TASK_ID=$(echo "$TASK_RESPONSE" | grep -o '"id":"[^"]*' | sed 's/"id":"//')
echo "Created Task ID: $TASK_ID"
echo -e "\n"

echo "4. Get Task by ID"
echo "GET /api/tasks/$TASK_ID"
curl -s $BASE_URL/tasks/$TASK_ID | print_json
echo -e "\n"

echo "5. Update Task"
echo "PATCH /api/tasks/$TASK_ID"
curl -s -X PATCH $BASE_URL/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress",
    "title": "Updated Test Task"
  }' | print_json
echo -e "\n"

echo "6. Get All Tasks (should show updated task)"
echo "GET /api/tasks"
curl -s $BASE_URL/tasks | print_json
echo -e "\n"

echo "7. Filter Tasks by Status"
echo "GET /api/tasks?status=in-progress"
curl -s "$BASE_URL/tasks?status=in-progress" | print_json
echo -e "\n"

echo "8. Test Validation - Create Task with Missing Title"
echo "POST /api/tasks (should fail)"
curl -s -X POST $BASE_URL/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Missing title",
    "priority": "low",
    "dueDate": "'$(date -d '+5 days' -I)'T12:00:00.000Z"
  }' | print_json
echo -e "\n"

echo "9. Test Validation - Invalid Status"
echo "POST /api/tasks (should fail)"
curl -s -X POST $BASE_URL/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "description": "Invalid status test",
    "status": "invalid-status",
    "priority": "medium",
    "du1. Delete Task"
echo "DELETE /api/tasks/$TASK_ID"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE $BASE_URL/tasks/$TASK_ID)
echo "HTTP Status: $HTTP_CODE"
echo -e "\n"

echo "12-X POST $BASE_URL/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "High Priority Task",
    "description": "This should fail - high priority with due date > 7 days",
    "priority": "high",
    "dueDate": "'$(date -d '+10 days' -I)'T12:00:00.000Z"
  }' | print_json
echo -e "\n"

echo "10. Delete Task"
echo "DELETE /api/tasks/$TASK_ID"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE $BASE_URL/tasks/$TASK_ID)
echo "HTTP Status: $HTTP_CODE"
echo -e "\n"

echo "11. Verify Task Deleted"
echo "GET /api/tasks/$TASK_ID (should return 404)"
curl -s $BASE_URL/tasks/$TASK_ID | print_json
echo -e "\n"

echo "=== All Tests Complete ==="

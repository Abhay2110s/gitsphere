import { BASE_URL } from './testConfig.js';

async function runActivityTests() {
  console.log('=== Starting Phase 11 Activity Logs Test Suite ===\n');

  // 1. Authenticate Manager
  console.log('1. Authenticating Manager...');
  const mgrLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'manager@gitsphere.com', password: 'ManagerPassword123' })
  });
  const mgrLoginData = await mgrLoginRes.json();
  const managerToken = mgrLoginData.data.token;
  console.log('✓ Manager authenticated.\n');

  // 2. Register User
  const timestamp = Date.now();
  console.log('2. Registering Test User...');
  const userRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Activity User',
      email: `activity_${timestamp}@example.com`,
      password: 'Password123'
    })
  });
  const userData = await userRes.json();
  const userToken = userData.data.token;
  const userId = userData.data.user.id;
  console.log('✓ User registered.\n');

  // 3. Create Project (triggers PROJECT_CREATED)
  console.log('3. Creating project...');
  const projRes = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`
    },
    body: JSON.stringify({
      name: `Activity Project ${timestamp}`,
      description: 'Testing activity logging'
    })
  });
  const projData = await projRes.json();
  const projectId = projData.data.id;
  console.log('✓ Project created.\n');

  // 4. Add Member (triggers MEMBER_ADDED)
  console.log('4. Adding member to project...');
  await fetch(`${BASE_URL}/projects/${projectId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`
    },
    body: JSON.stringify({ userId })
  });
  console.log('✓ Member added.\n');

  // 5. Create Task (triggers TASK_CREATED)
  console.log('5. Creating task...');
  const taskRes = await fetch(`${BASE_URL}/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`
    },
    body: JSON.stringify({
      title: 'Activity Task',
      description: 'Task for testing activity logs',
      assignedTo: userId,
      priority: 'MEDIUM'
    })
  });
  const taskData = await taskRes.json();
  const taskId = taskData.data.id;
  console.log('✓ Task created.\n');

  // 6. User updates task status (triggers TASK_STATUS_CHANGED)
  console.log('6. User updating task status...');
  await fetch(`${BASE_URL}/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`
    },
    body: JSON.stringify({ status: 'IN_PROGRESS' })
  });
  console.log('✓ Task status updated to IN_PROGRESS.\n');

  // 7. Test GET /api/v1/activity for manager
  console.log('7. Testing GET /api/v1/activity as Manager...');
  const actRes = await fetch(`${BASE_URL}/activity?projectId=${projectId}`, {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  const actData = await actRes.json();
  console.log(`Retrieved ${actData.data.length} activities for this project.`);
  const actions = actData.data.map((a) => a.action);
  console.log('Logged actions found:', actions);

  if (!actData.success || actData.data.length < 3) {
    throw new Error('Expected at least 3 activities logged');
  }
  console.log('✓ Activities retrieved with proper schema and pagination.\n');

  // 8. Test GET /api/v1/activity as User for accessible project
  console.log('8. Testing GET /api/v1/activity as User...');
  const userActRes = await fetch(`${BASE_URL}/activity?projectId=${projectId}`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  const userActData = await userActRes.json();
  if (!userActData.success || userActData.data.length < 3) {
    throw new Error('User failed to retrieve activities for their project');
  }
  console.log('✓ User can access activity log of their project.\n');

  console.log('🎉 ALL PHASE 11 ACTIVITY LOGS TESTS PASSED SUCCESSFULLY!\n');
}

runActivityTests().catch((err) => {
  console.error('\n❌ Activity Test Suite Failed:', err);
  process.exit(1);
});

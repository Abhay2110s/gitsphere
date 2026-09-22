import { BASE_URL } from './testConfig.js';

async function runDashboardTests() {
  console.log('=== Starting Phase 13 Dashboards Test Suite ===\n');

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

  // 2. Register Test User
  const timestamp = Date.now();
  console.log('2. Registering Test User...');
  const userRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dashboard User',
      email: `dashuser_${timestamp}@example.com`,
      password: 'Password123'
    })
  });
  const userData = await userRes.json();
  const userToken = userData.data.token;
  console.log('✓ User registered.\n');

  // 3. Test Manager Dashboard
  console.log('3. Testing GET /api/v1/dashboard/manager...');
  const mgrDashRes = await fetch(`${BASE_URL}/dashboard/manager`, {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  const mgrDashData = await mgrDashRes.json();
  if (!mgrDashData.success) {
    throw new Error(`Failed to fetch manager dashboard: ${mgrDashData.message}`);
  }

  const mData = mgrDashData.data;
  console.log('Manager Dashboard Metrics:');
  console.log(`- Total Projects: ${mData.totalProjects}`);
  console.log(`- Active Projects: ${mData.activeProjects}`);
  console.log(`- Total Users: ${mData.totalUsers}`);
  console.log(`- Total Tasks: ${mData.totalTasks}`);
  console.log(`- Completed Tasks: ${mData.completedTasks}`);
  console.log(`- Tasks in Review: ${mData.tasksInReview}`);
  console.log(`- Overdue Tasks: ${mData.overdueTasks}`);
  console.log(`- Recent Activity entries: ${mData.recentActivity.length}`);

  const requiredManagerFields = [
    'totalProjects',
    'activeProjects',
    'totalUsers',
    'totalTasks',
    'completedTasks',
    'pendingTasks',
    'tasksInReview',
    'overdueTasks',
    'activeUsers',
    'recentActivity'
  ];

  for (const field of requiredManagerFields) {
    if (mData[field] === undefined) {
      throw new Error(`Missing expected manager dashboard field: ${field}`);
    }
  }
  console.log('✓ All required Manager Dashboard fields present.\n');

  // 4. Test User Dashboard
  console.log('4. Testing GET /api/v1/dashboard/user...');
  const userDashRes = await fetch(`${BASE_URL}/dashboard/user`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  const userDashData = await userDashRes.json();
  if (!userDashData.success) {
    throw new Error(`Failed to fetch user dashboard: ${userDashData.message}`);
  }

  const uData = userDashData.data;
  console.log('User Dashboard Metrics:');
  console.log(`- Assigned Tasks: ${uData.assignedTasks}`);
  console.log(`- In Progress: ${uData.inProgress}`);
  console.log(`- In Review: ${uData.inReview}`);
  console.log(`- Completed: ${uData.completed}`);
  console.log(`- Overdue: ${uData.overdue}`);
  console.log(`- Recent Projects: ${uData.recentProjects.length}`);
  console.log(`- Recent Notifications: ${uData.recentNotifications.length}`);
  console.log(`- Recent Activity: ${uData.recentActivity.length}`);

  const requiredUserFields = [
    'assignedTasks',
    'inProgress',
    'inReview',
    'completed',
    'overdue',
    'recentProjects',
    'recentNotifications',
    'recentActivity'
  ];

  for (const field of requiredUserFields) {
    if (uData[field] === undefined) {
      throw new Error(`Missing expected user dashboard field: ${field}`);
    }
  }
  console.log('✓ All required User Dashboard fields present.\n');

  // 5. Test Role-Based Security: Standard User cannot access Manager Dashboard
  console.log('5. Testing Security: Standard User cannot access Manager Dashboard...');
  const forbiddenRes = await fetch(`${BASE_URL}/dashboard/manager`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  if (forbiddenRes.status === 403) {
    console.log('✓ Security enforced: 403 Forbidden for User trying to access Manager dashboard.\n');
  } else {
    throw new Error(`Expected status 403 but received ${forbiddenRes.status}`);
  }

  console.log('🎉 ALL PHASE 13 DASHBOARD TESTS PASSED SUCCESSFULLY!\n');
}

runDashboardTests().catch((err) => {
  console.error('\n❌ Dashboard Test Suite Failed:', err);
  process.exit(1);
});

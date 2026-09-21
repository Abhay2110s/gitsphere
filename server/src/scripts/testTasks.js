import 'dotenv/config';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runTaskTests() {
  console.log('=== Starting Phase 4 Tasks Test Suite ===\n');

  // 1. Authenticate Manager
  console.log('Authenticating Manager...');
  const mgrLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'manager@gitsphere.com',
      password: 'ManagerPassword123'
    })
  });
  const mgrLoginData = await mgrLoginRes.json();
  const managerToken = mgrLoginData.data.token;
  const managerId = mgrLoginData.data.user.id;
  console.log('✓ Manager authenticated.\n');

  // 2. Register User 1 & User 2
  const timestamp = Date.now();
  console.log('Registering Test Users...');
  const u1Res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Assigned User', email: `assigned_${timestamp}@example.com`, password: 'Password123' })
  });
  const u1Data = await u1Res.json();
  const user1Token = u1Data.data.token;
  const user1Id = u1Data.data.user.id;

  const u2Res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Outsider User', email: `outsider_task_${timestamp}@example.com`, password: 'Password123' })
  });
  const u2Data = await u2Res.json();
  const user2Token = u2Data.data.token;
  const user2Id = u2Data.data.user.id;
  console.log('✓ Users registered.\n');

  // 3. Manager Creates Project & Adds User 1
  console.log('Creating Project and Enrolling Member...');
  const projRes = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`
    },
    body: JSON.stringify({ name: `Task Project ${timestamp}`, status: 'ACTIVE' })
  });
  const projData = await projRes.json();
  const projectId = projData.data.id;

  await fetch(`${BASE_URL}/projects/${projectId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`
    },
    body: JSON.stringify({ userId: user1Id })
  });
  console.log('✓ Project ready with User 1 as enrolled member.\n');

  // 4. Test Invariant: Assigning Task to Outsider (User 2) Should Fail
  console.log('Test 1: Attempt creating task assigned to non-member (Expect 400)...');
  const invalidTaskRes = await fetch(`${BASE_URL}/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`
    },
    body: JSON.stringify({
      title: 'Invalid Task Assignment',
      assignedTo: user2Id,
      priority: 'HIGH'
    })
  });
  const invalidTaskData = await invalidTaskRes.json();
  console.log('Status:', invalidTaskRes.status, 'ErrorCode:', invalidTaskData.errorCode);
  if (invalidTaskRes.status !== 400 || invalidTaskData.errorCode !== 'INVALID_ASSIGNEE') {
    throw new Error('Task was incorrectly allowed to be assigned to a non-member!');
  }
  console.log('✓ Outsider assignment correctly blocked with 400.\n');

  // 5. Test Manager Creates Task Assigned to User 1
  console.log('Test 2: Manager creates task assigned to User 1...');
  const validTaskRes = await fetch(`${BASE_URL}/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`
    },
    body: JSON.stringify({
      title: 'Implement Authentication Middleware',
      description: 'Build robust JWT validation and role checking',
      assignedTo: user1Id,
      priority: 'HIGH',
      deadline: '2026-10-15T00:00:00.000Z',
      labels: ['auth', 'backend', 'security']
    })
  });
  const validTaskData = await validTaskRes.json();
  console.log('Status:', validTaskRes.status, 'Task ID:', validTaskData.data?.id, 'Status:', validTaskData.data?.status);
  if (validTaskRes.status !== 201 || validTaskData.data?.status !== 'TODO') {
    throw new Error('Task creation failed!');
  }
  const taskId = validTaskData.data.id;
  console.log('✓ Task successfully created with status TODO.\n');

  // 6. Test User Status Progression: TODO -> IN_PROGRESS
  console.log('Test 3: User 1 starts working on task (TODO -> IN_PROGRESS)...');
  const startRes = await fetch(`${BASE_URL}/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user1Token}`
    },
    body: JSON.stringify({ status: 'IN_PROGRESS' })
  });
  const startData = await startRes.json();
  console.log('Status:', startRes.status, 'New Task Status:', startData.data?.status);
  if (startRes.status !== 200 || startData.data?.status !== 'IN_PROGRESS') {
    throw new Error('User failed to transition task to IN_PROGRESS!');
  }
  console.log('✓ Task moved to IN_PROGRESS.\n');

  // 7. Test User Status Progression: IN_PROGRESS -> IN_REVIEW
  console.log('Test 4: User 1 submits task for review (IN_PROGRESS -> IN_REVIEW)...');
  const submitRes = await fetch(`${BASE_URL}/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user1Token}`
    },
    body: JSON.stringify({ status: 'IN_REVIEW' })
  });
  const submitData = await submitRes.json();
  console.log('Status:', submitRes.status, 'New Task Status:', submitData.data?.status);
  if (submitRes.status !== 200 || submitData.data?.status !== 'IN_REVIEW') {
    throw new Error('User failed to submit task for review!');
  }
  console.log('✓ Task moved to IN_REVIEW.\n');

  // 8. Test Rule 11: User Cannot Approve Own Task to COMPLETED
  console.log('Test 5: User 1 attempts self-approval to COMPLETED (Expect 403)...');
  const selfApproveRes = await fetch(`${BASE_URL}/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user1Token}`
    },
    body: JSON.stringify({ status: 'COMPLETED' })
  });
  const selfApproveData = await selfApproveRes.json();
  console.log('Status:', selfApproveRes.status, 'ErrorCode:', selfApproveData.errorCode);
  if (selfApproveRes.status !== 403 || selfApproveData.errorCode !== 'FORBIDDEN') {
    throw new Error('User was incorrectly allowed to approve their own task!');
  }
  console.log('✓ Self-approval correctly blocked with 403.\n');

  // 9. Test Unauthorized User Cannot Update Task Status
  console.log('Test 6: Outsider (User 2) attempts status update (Expect 403)...');
  const unauthStatusRes = await fetch(`${BASE_URL}/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user2Token}`
    },
    body: JSON.stringify({ status: 'IN_PROGRESS' })
  });
  const unauthStatusData = await unauthStatusRes.json();
  console.log('Status:', unauthStatusRes.status, 'ErrorCode:', unauthStatusData.errorCode);
  if (unauthStatusRes.status !== 403 || unauthStatusData.errorCode !== 'FORBIDDEN') {
    throw new Error('Outsider was allowed to update task status!');
  }
  console.log('✓ Unauthorized task status modification blocked with 403.\n');

  // 10. Manager Requests Changes
  console.log('Test 7: Manager requests changes (IN_REVIEW -> CHANGES_REQUESTED)...');
  const changeReqRes = await fetch(`${BASE_URL}/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`
    },
    body: JSON.stringify({ status: 'CHANGES_REQUESTED' })
  });
  const changeReqData = await changeReqRes.json();
  console.log('Status:', changeReqRes.status, 'New Task Status:', changeReqData.data?.status);
  if (changeReqRes.status !== 200 || changeReqData.data?.status !== 'CHANGES_REQUESTED') {
    throw new Error('Manager failed to request changes!');
  }
  console.log('✓ Task moved to CHANGES_REQUESTED.\n');

  // 11. User Modifies Code and Resubmits: CHANGES_REQUESTED -> IN_PROGRESS -> IN_REVIEW
  console.log('Test 8: User resumes work and resubmits...');
  await fetch(`${BASE_URL}/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user1Token}`
    },
    body: JSON.stringify({ status: 'IN_PROGRESS' })
  });
  const resubmitRes = await fetch(`${BASE_URL}/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user1Token}`
    },
    body: JSON.stringify({ status: 'IN_REVIEW' })
  });
  const resubmitData = await resubmitRes.json();
  console.log('Status:', resubmitRes.status, 'Task Status After Resubmission:', resubmitData.data?.status);
  if (resubmitRes.status !== 200 || resubmitData.data?.status !== 'IN_REVIEW') {
    throw new Error('User failed to resubmit task!');
  }
  console.log('✓ Resubmission cycle verified.\n');

  // 12. Manager Approves Code: IN_REVIEW -> COMPLETED
  console.log('Test 9: Manager approves code (IN_REVIEW -> COMPLETED)...');
  const approveRes = await fetch(`${BASE_URL}/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`
    },
    body: JSON.stringify({ status: 'COMPLETED' })
  });
  const approveData = await approveRes.json();
  console.log('Status:', approveRes.status, 'Final Task Status:', approveData.data?.status);
  if (approveRes.status !== 200 || approveData.data?.status !== 'COMPLETED') {
    throw new Error('Manager approval failed!');
  }
  console.log('✓ Task approved and marked COMPLETED.\n');

  // 13. My Tasks Endpoint Verification
  console.log('Test 10: User 1 fetches assigned tasks (/my-tasks)...');
  const myTasksRes = await fetch(`${BASE_URL}/tasks/my-tasks`, {
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  const myTasksData = await myTasksRes.json();
  console.log('Status:', myTasksRes.status, 'Assigned Tasks Count:', myTasksData.data?.length);
  if (myTasksRes.status !== 200 || myTasksData.data?.length === 0) {
    throw new Error('/my-tasks failed to return assigned task!');
  }
  console.log('✓ /my-tasks returns assigned task.\n');

  // 14. Project Task Filtering
  console.log('Test 11: Manager filters project tasks (status=COMPLETED&priority=HIGH)...');
  const filterRes = await fetch(
    `${BASE_URL}/projects/${projectId}/tasks?status=COMPLETED&priority=HIGH`,
    {
      headers: { Authorization: `Bearer ${managerToken}` }
    }
  );
  const filterData = await filterRes.json();
  console.log('Filter Status:', filterRes.status, 'Matched Tasks:', filterData.data?.length);
  if (filterRes.status !== 200 || filterData.data?.length !== 1) {
    throw new Error('Task filtering failed!');
  }
  console.log('✓ Task filtering and pagination verified.\n');

  // 15. Task Deletion (Regular user forbidden, Manager allowed)
  console.log('Test 12: User 1 attempts task deletion (Expect 403)...');
  const unauthDelRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  console.log('Status:', unauthDelRes.status);
  if (unauthDelRes.status !== 403) {
    throw new Error('Regular user was allowed to delete task!');
  }

  console.log('Test 13: Manager deletes task...');
  const delRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  console.log('Status:', delRes.status);
  if (delRes.status !== 200) {
    throw new Error('Manager task deletion failed!');
  }
  console.log('✓ Task deletion permissions verified.\n');

  console.log('=== All Phase 4 Tasks Tests Passed Successfully! ===');
}

runTaskTests().catch((err) => {
  console.error('\n❌ Tasks Test Suite Failed:', err.message);
  process.exit(1);
});

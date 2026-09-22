import { BASE_URL } from './testConfig.js';

async function runProjectTests() {
  console.log('=== Starting Phase 3 Projects Test Suite ===\n');

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
  const user1Email = `member_${timestamp}@example.com`;
  const user2Email = `outsider_${timestamp}@example.com`;

  const u1Res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Member User', email: user1Email, password: 'Password123' })
  });
  const u1Data = await u1Res.json();
  const user1Token = u1Data.data.token;
  const user1Id = u1Data.data.user.id;

  const u2Res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Outsider User', email: user2Email, password: 'Password123' })
  });
  const u2Data = await u2Res.json();
  const user2Token = u2Data.data.token;
  const user2Id = u2Data.data.user.id;
  console.log('✓ Test users registered (User 1 ID:', user1Id, ', User 2 ID:', user2Id, ')\n');

  // 3. Manager Creates Project
  console.log('Test 1: Manager creates project...');
  const createProjRes = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`
    },
    body: JSON.stringify({
      name: `GitSphere Core ${timestamp}`,
      description: 'The core repository for GitSphere collaborative platform',
      status: 'PLANNING',
      deadline: '2026-12-31T00:00:00.000Z'
    })
  });
  const createProjData = await createProjRes.json();
  console.log('Status:', createProjRes.status, 'Project ID:', createProjData.data?.id);
  if (createProjRes.status !== 201 || !createProjData.data?.id) {
    throw new Error('Project creation failed!');
  }
  const projectId = createProjData.data.id;
  console.log('✓ Project successfully created by Manager.\n');

  // 4. Regular User Attempts Project Creation (Should Fail)
  console.log('Test 2: Regular User attempts project creation (Expect 403)...');
  const userCreateRes = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      name: 'Unauthorized Project',
      description: 'Should be rejected'
    })
  });
  const userCreateData = await userCreateRes.json();
  console.log('Status:', userCreateRes.status, 'ErrorCode:', userCreateData.errorCode);
  if (userCreateRes.status !== 403 || userCreateData.errorCode !== 'FORBIDDEN') {
    throw new Error('Regular user was able to create a project!');
  }
  console.log('✓ Project creation by regular user correctly rejected with 403.\n');

  // 5. Manager Adds User 1 as Member
  console.log('Test 3: Manager adds User 1 as project member...');
  const addMemRes = await fetch(`${BASE_URL}/projects/${projectId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`
    },
    body: JSON.stringify({ userId: user1Id })
  });
  const addMemData = await addMemRes.json();
  console.log('Status:', addMemRes.status, 'Members Count:', addMemData.data?.members?.length);
  if (addMemRes.status !== 200 || addMemData.data?.members?.length !== 1) {
    throw new Error('Failed to add User 1 as member!');
  }
  console.log('✓ User 1 successfully enrolled in project.\n');

  // 6. Duplicate Member Rejection
  console.log('Test 4: Attempt adding duplicate member (Expect 409)...');
  const dupMemRes = await fetch(`${BASE_URL}/projects/${projectId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`
    },
    body: JSON.stringify({ userId: user1Id })
  });
  const dupMemData = await dupMemRes.json();
  console.log('Status:', dupMemRes.status, 'ErrorCode:', dupMemData.errorCode);
  if (dupMemRes.status !== 409 || dupMemData.errorCode !== 'ALREADY_MEMBER') {
    throw new Error('Duplicate member was allowed!');
  }
  console.log('✓ Duplicate member rejected with 409.\n');

  // 7. Manager Role Rejection for Membership
  console.log('Test 5: Attempt adding a Manager as project member (Expect 400)...');
  const addMgrMemRes = await fetch(`${BASE_URL}/projects/${projectId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`
    },
    body: JSON.stringify({ userId: managerId })
  });
  const addMgrMemData = await addMgrMemRes.json();
  console.log('Status:', addMgrMemRes.status, 'ErrorCode:', addMgrMemData.errorCode);
  if (addMgrMemRes.status !== 400 || addMgrMemData.errorCode !== 'INVALID_MEMBER_ROLE') {
    throw new Error('Manager was incorrectly allowed as member!');
  }
  console.log('✓ Manager addition as project member correctly prevented.\n');

  // 8. Access Isolation: Member vs Outsider
  console.log('Test 6: Member (User 1) accesses project...');
  const u1AccessRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  const u1AccessData = await u1AccessRes.json();
  console.log('Member Access Status:', u1AccessRes.status, 'Project Name:', u1AccessData.data?.name);
  if (u1AccessRes.status !== 200) {
    throw new Error('Member was denied access to their project!');
  }

  console.log('Test 7: Outsider (User 2) accesses project (Expect 403)...');
  const u2AccessRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${user2Token}` }
  });
  const u2AccessData = await u2AccessRes.json();
  console.log('Outsider Access Status:', u2AccessRes.status, 'ErrorCode:', u2AccessData.errorCode);
  if (u2AccessRes.status !== 403 || u2AccessData.errorCode !== 'FORBIDDEN') {
    throw new Error('Outsider was allowed to access project!');
  }
  console.log('✓ Access isolation between members and non-members verified.\n');

  // 9. Project Listing Visibility
  console.log('Test 8: Project Listing Visibility...');
  const mgrListRes = await fetch(`${BASE_URL}/projects`, {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  const mgrListData = await mgrListRes.json();

  const u1ListRes = await fetch(`${BASE_URL}/projects`, {
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  const u1ListData = await u1ListRes.json();

  const u2ListRes = await fetch(`${BASE_URL}/projects`, {
    headers: { Authorization: `Bearer ${user2Token}` }
  });
  const u2ListData = await u2ListRes.json();

  console.log('Manager sees projects count:', mgrListData.data?.length);
  console.log('User 1 (Member) sees projects count:', u1ListData.data?.length);
  console.log('User 2 (Outsider) sees projects count:', u2ListData.data?.length);

  if (u1ListData.data?.length === 0 || u2ListData.data?.length !== 0) {
    throw new Error('Project listing filter isolation failed!');
  }
  console.log('✓ Project listing query strictly respects user memberships.\n');

  // 10. Update Project (Manager only)
  console.log('Test 9: Manager updates project status to ACTIVE...');
  const updateRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`
    },
    body: JSON.stringify({ status: 'ACTIVE' })
  });
  const updateData = await updateRes.json();
  console.log('Status:', updateRes.status, 'Updated Project Status:', updateData.data?.status);
  if (updateRes.status !== 200 || updateData.data?.status !== 'ACTIVE') {
    throw new Error('Project update failed!');
  }
  console.log('✓ Project update succeeded.\n');

  // 11. Remove Member
  console.log('Test 10: Manager removes User 1 from members...');
  const remMemRes = await fetch(`${BASE_URL}/projects/${projectId}/members/${user1Id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  const remMemData = await remMemRes.json();
  console.log('Status:', remMemRes.status, 'Members Remaining:', remMemData.data?.members?.length);
  if (remMemRes.status !== 200 || remMemData.data?.members?.length !== 0) {
    throw new Error('Failed to remove member!');
  }

  // Verify User 1 now receives 403
  const u1RevokedRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  console.log('User 1 Post-Removal Access Status (Expect 403):', u1RevokedRes.status);
  if (u1RevokedRes.status !== 403) {
    throw new Error('Removed user retained access to project!');
  }
  console.log('✓ Member removal successfully revoked access.\n');

  // 12. Delete Project
  console.log('Test 11: Manager deletes project...');
  const delProjRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  console.log('Delete Status:', delProjRes.status);
  if (delProjRes.status !== 200) {
    throw new Error('Project deletion failed!');
  }

  const postDelRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  console.log('Post-Delete Status (Expect 404):', postDelRes.status);
  if (postDelRes.status !== 404) {
    throw new Error('Project was not deleted!');
  }
  console.log('✓ Project deletion verified.\n');

  console.log('=== All Phase 3 Projects Tests Passed Successfully! ===');
}

runProjectTests().catch((err) => {
  console.error('\n❌ Projects Test Suite Failed:', err.message);
  process.exit(1);
});

import { BASE_URL } from './testConfig.js';

async function runTests() {
  console.log('=== Starting Phase 2 Authentication Tests ===\n');

  let testUserToken = '';
  let managerToken = '';

  const testUserEmail = `user_${Date.now()}@example.com`;

  // 1. Test Registration
  console.log('Test 1: Public Registration (Must be USER role)...');
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Rahul Sharma',
      email: testUserEmail,
      password: 'Password123',
      role: 'MANAGER' // Attacking role field, must be ignored or defaulted to USER
    })
  });
  const regData = await regRes.json();
  console.log('Status:', regRes.status);
  console.log('Registered User Role:', regData.data?.user?.role);
  if (regRes.status !== 201 || regData.data?.user?.role !== 'USER') {
    throw new Error('Registration failed or role escalation occurred!');
  }
  if (regData.data?.user?.password) {
    throw new Error('Password hash leaked in registration response!');
  }
  testUserToken = regData.data.token;
  console.log('✓ Public registration verified as USER role with no password leak.\n');

  // 2. Test Duplicate Registration
  console.log('Test 2: Duplicate Registration Prevention...');
  const dupRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Duplicate User',
      email: testUserEmail,
      password: 'Password123'
    })
  });
  const dupData = await dupRes.json();
  console.log('Status:', dupRes.status, 'ErrorCode:', dupData.errorCode);
  if (dupRes.status !== 409 || dupData.errorCode !== 'DUPLICATE_RESOURCE') {
    throw new Error('Duplicate email allowed or wrong error code!');
  }
  console.log('✓ Duplicate registration successfully blocked with 409.\n');

  // 3. Test Invalid Login
  console.log('Test 3: Invalid Login Handling...');
  const invRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testUserEmail,
      password: 'WrongPassword'
    })
  });
  const invData = await invRes.json();
  console.log('Status:', invRes.status, 'ErrorCode:', invData.errorCode);
  if (invRes.status !== 401 || invData.errorCode !== 'INVALID_CREDENTIALS') {
    throw new Error('Invalid login check failed!');
  }
  console.log('✓ Invalid login properly rejected with 401.\n');

  // 4. Test Valid Login
  console.log('Test 4: Valid Login...');
  const logRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testUserEmail,
      password: 'Password123'
    })
  });
  const logData = await logRes.json();
  console.log('Status:', logRes.status, 'Success:', logData.success);
  if (logRes.status !== 200 || !logData.data?.token) {
    throw new Error('Login failed!');
  }
  console.log('✓ Login verified.\n');

  // 5. Test Current User Profile (GET /me)
  console.log('Test 5: Get Current User Profile (/me)...');
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${testUserToken}` }
  });
  const meData = await meRes.json();
  console.log('Status:', meRes.status, 'User Name:', meData.data?.name);
  if (meRes.status !== 200 || meData.data?.email !== testUserEmail) {
    throw new Error('/me endpoint failed!');
  }
  console.log('✓ /me endpoint verified.\n');

  // 6. Test Role Protection (User accessing Manager-only route)
  console.log('Test 6: Role Restriction (User attempting GET /users)...');
  const forbiddenRes = await fetch(`${BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${testUserToken}` }
  });
  const forbiddenData = await forbiddenRes.json();
  console.log('Status:', forbiddenRes.status, 'ErrorCode:', forbiddenData.errorCode);
  if (forbiddenRes.status !== 403 || forbiddenData.errorCode !== 'FORBIDDEN') {
    throw new Error('Role restriction failed! User was allowed to access manager endpoint.');
  }
  console.log('✓ Manager endpoint successfully blocked for USER role.\n');

  // 7. Test Manager Login & Access
  console.log('Test 7: Manager Login & Access...');
  const mgrRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'manager@gitsphere.com',
      password: 'ManagerPassword123'
    })
  });
  const mgrData = await mgrRes.json();
  console.log('Manager Login Status:', mgrRes.status, 'Role:', mgrData.data?.user?.role);
  if (mgrRes.status !== 200 || mgrData.data?.user?.role !== 'MANAGER') {
    throw new Error('Manager login failed!');
  }
  managerToken = mgrData.data.token;

  // Manager accessing GET /users
  const usersListRes = await fetch(`${BASE_URL}/users?limit=5`, {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  const usersListData = await usersListRes.json();
  console.log('Users List Status:', usersListRes.status, 'Users Found:', usersListData.data?.length, 'Pagination:', usersListData.pagination);
  if (usersListRes.status !== 200 || !usersListData.pagination) {
    throw new Error('Manager GET /users failed!');
  }
  console.log('✓ Manager authorized access to user directory verified.\n');

  // 8. Test Profile Update
  console.log('Test 8: User Profile Update...');
  const updateRes = await fetch(`${BASE_URL}/users/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${testUserToken}`
    },
    body: JSON.stringify({
      bio: 'Full-stack developer working on GitSphere',
      role: 'MANAGER' // Privilege escalation attempt
    })
  });
  const updateData = await updateRes.json();
  console.log('Updated Bio:', updateData.data?.bio, 'Role After Update:', updateData.data?.role);
  if (updateData.data?.role !== 'USER' || updateData.data?.bio !== 'Full-stack developer working on GitSphere') {
    throw new Error('Profile update failed or role escalation permitted!');
  }
  console.log('✓ Profile update verified with secure role preservation.\n');

  // 9. Test Logout
  console.log('Test 9: User Logout...');
  const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${testUserToken}` }
  });
  const logoutData = await logoutRes.json();
  console.log('Logout Status:', logoutRes.status, 'Message:', logoutData.message);
  if (logoutRes.status !== 200) {
    throw new Error('Logout failed!');
  }
  console.log('✓ Logout endpoint verified.\n');

  console.log('=== All Phase 2 Authentication Tests Passed Successfully! ===');
}

runTests().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err.message);
  process.exit(1);
});

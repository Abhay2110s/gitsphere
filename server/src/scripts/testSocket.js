import 'dotenv/config';
import { io as Client } from 'socket.io-client';

const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/v1`;

async function runSocketTests() {
  console.log('=== Starting Phase 7 Real-Time Collaboration (Socket.IO) Test Suite ===\n');

  // 1. Authenticate Manager
  console.log('Authenticating Manager...');
  const mgrLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'manager@gitsphere.com', password: 'ManagerPassword123' })
  });
  const mgrLoginData = await mgrLoginRes.json();
  const managerToken = mgrLoginData.data.token;
  console.log('✓ Manager authenticated.\n');

  // 2. Register Users
  const timestamp = Date.now();
  console.log('Registering Test Users...');
  const u1Res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Realtime Dev', email: `socket_dev_${timestamp}@example.com`, password: 'Password123' })
  });
  const u1Data = await u1Res.json();
  const user1Token = u1Data.data.token;
  const user1Id = u1Data.data.user.id;

  const u2Res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Socket Outsider', email: `socket_outsider_${timestamp}@example.com`, password: 'Password123' })
  });
  const u2Data = await u2Res.json();
  const user2Token = u2Data.data.token;
  console.log('✓ Users registered.\n');

  // 3. Manager Sets Up Project & Task
  console.log('Setting up project and task...');
  const projRes = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ name: `Socket Project ${timestamp}` })
  });
  const projData = await projRes.json();
  const projectId = projData.data.id;

  await fetch(`${API_URL}/projects/${projectId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ userId: user1Id })
  });

  const taskRes = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ title: 'Socket Coding Task', assignedTo: user1Id })
  });
  const taskData = await taskRes.json();
  const taskId = taskData.data.id;
  console.log('✓ Project and Task ready (ID:', taskId, ')\n');

  // 4. Test Unauthenticated Socket Connection Rejection
  console.log('Test 1: Unauthenticated socket connection (Expect failure)...');
  await new Promise((resolve, reject) => {
    const unauthSocket = Client(BASE_URL, {
      transports: ['websocket'],
      autoConnect: true
    });

    unauthSocket.on('connect', () => {
      unauthSocket.disconnect();
      reject(new Error('Unauthenticated socket connected unexpectedly!'));
    });

    unauthSocket.on('connect_error', (err) => {
      console.log('Rejected error message:', err.message);
      if (err.message.includes('Authentication required')) {
        unauthSocket.disconnect();
        console.log('✓ Unauthenticated connection successfully rejected.\n');
        resolve();
      } else {
        unauthSocket.disconnect();
        reject(new Error(`Unexpected error message: ${err.message}`));
      }
    });
  });

  // 5. Test Authenticated Socket Connection
  console.log('Test 2: Authenticated socket connections for Manager and User 1...');
  const userSocket = Client(BASE_URL, {
    auth: { token: user1Token },
    transports: ['websocket']
  });

  const mgrSocket = Client(BASE_URL, {
    auth: { token: managerToken },
    transports: ['websocket']
  });

  await Promise.all([
    new Promise((resolve) => userSocket.on('connect', resolve)),
    new Promise((resolve) => mgrSocket.on('connect', resolve))
  ]);
  console.log('✓ Both User and Manager sockets connected successfully.\n');

  // 6. Test Unauthorized Room Join Blocked
  console.log('Test 3: Outsider attempts joining task room (Expect error)...');
  const outsiderSocket = Client(BASE_URL, {
    auth: { token: user2Token },
    transports: ['websocket']
  });
  await new Promise((resolve) => outsiderSocket.on('connect', resolve));

  await new Promise((resolve, reject) => {
    outsiderSocket.emit('code:join', { taskId });
    outsiderSocket.on('code:error', (err) => {
      console.log('Outsider received error:', err.message);
      if (err.message.includes('Access denied')) {
        console.log('✓ Unauthorized room join blocked.\n');
        outsiderSocket.disconnect();
        resolve();
      } else {
        reject(new Error(`Unexpected error: ${err.message}`));
      }
    });
  });

  // 7. Test Authorized Room Join and Presence
  console.log('Test 4: User 1 joins task room and receives presence...');
  await new Promise((resolve, reject) => {
    userSocket.emit('code:join', { taskId, currentFile: 'server.js' });
    userSocket.on('code:joined', (data) => {
      console.log('Joined taskId:', data.taskId, 'Presence count:', data.presence.length);
      if (data.presence.length >= 1 && data.presence[0].name === 'Realtime Dev') {
        console.log('✓ User 1 presence registered.\n');
        resolve();
      } else {
        reject(new Error('Presence data invalid'));
      }
    });
  });

  console.log('Test 5: Manager joins room and both see updated presence...');
  await new Promise((resolve, reject) => {
    userSocket.on('code:presence', (data) => {
      if (data.users.length === 2) {
        console.log('User socket received updated presence list of 2 users (Manager joined).');
        resolve();
      }
    });
    mgrSocket.emit('code:join', { taskId, currentFile: 'server.js' });
  });
  console.log('✓ Real-time presence synchronization confirmed.\n');

  // 8. Test Real-Time Code Synchronization
  console.log('Test 6: User 1 emits code:update; Manager receives code:updated in real time...');
  const testCode = 'console.log("Real-time collaborative typing!");';
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('code:updated event timed out')), 5000);

    mgrSocket.on('code:updated', (payload) => {
      clearTimeout(timeout);
      console.log('Manager received code update:');
      console.log('  Content:', payload.content);
      console.log('  UpdatedBy:', payload.updatedBy.name);
      if (payload.content === testCode && payload.updatedBy.name === 'Realtime Dev') {
        console.log('✓ Code change broadcast in real time across clients.\n');
        resolve();
      } else {
        reject(new Error('Payload content mismatch!'));
      }
    });

    userSocket.emit('code:update', {
      taskId,
      fileId: '6ab165467ea568bd7ca2b9fb',
      content: testCode,
      cursor: { lineNumber: 1, column: 46 }
    });
  });

  // 9. Test Cursor & Typing Indicator
  console.log('Test 7: User 1 emits cursor position and typing indicator...');
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('code:cursor event timed out')), 5000);

    mgrSocket.on('code:cursor', (payload) => {
      clearTimeout(timeout);
      console.log('Manager received cursor position:', payload.position);
      resolve();
    });

    userSocket.emit('code:cursor', {
      taskId,
      fileId: '6ab165467ea568bd7ca2b9fb',
      position: { lineNumber: 2, column: 15 }
    });
  });
  console.log('✓ Cursor tracking verified.\n');

  // 10. Test Disconnect Presence Cleanup
  console.log('Test 8: User 1 disconnects; Manager receives updated presence...');
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Disconnect presence update timed out')), 5000);

    mgrSocket.on('code:presence', (data) => {
      clearTimeout(timeout);
      console.log('Manager received presence update after disconnect. Remaining users:', data.users.length);
      if (data.users.length === 1 && data.users[0].role === 'MANAGER') {
        console.log('✓ User presence cleaned up cleanly on disconnect.\n');
        resolve();
      }
    });

    userSocket.disconnect();
  });

  mgrSocket.disconnect();

  console.log('=== All Phase 7 Socket.IO Tests Passed Successfully! ===');
}

runSocketTests().catch((err) => {
  console.error('\n❌ Socket Test Suite Failed:', err.message);
  process.exit(1);
});

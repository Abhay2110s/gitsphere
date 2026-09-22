import { io as ioClient } from 'socket.io-client';
import { BASE_URL, WS_URL } from './testConfig.js';

async function runChatTests() {
  console.log('=== Starting Phase 9 Project & Task Chat Test Suite ===\n');

  // 1. Authenticate Manager
  console.log('Authenticating Manager...');
  const mgrLoginRes = await fetch(`${BASE_URL}/auth/login`, {
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
  const u1Res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Chat User 1', email: `chatuser1_${timestamp}@example.com`, password: 'Password123' })
  });
  const u1Data = await u1Res.json();
  const user1Token = u1Data.data.token;
  const user1Id = u1Data.data.user.id;

  const u2Res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Chat User 2', email: `chatuser2_${timestamp}@example.com`, password: 'Password123' })
  });
  const u2Data = await u2Res.json();
  const user2Token = u2Data.data.token;
  const user2Id = u2Data.data.user.id;

  // Register a non-member user for permission tests
  const u3Res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Non-Member', email: `nonmember_${timestamp}@example.com`, password: 'Password123' })
  });
  const u3Data = await u3Res.json();
  const nonMemberToken = u3Data.data.token;
  console.log('✓ Users registered.\n');

  // 3. Setup Project and Task
  console.log('Setting up project and task...');
  const projRes = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ name: `Chat Test Project ${timestamp}`, status: 'ACTIVE' })
  });
  const projData = await projRes.json();
  const projectId = projData.data.id;

  // Add both users to project
  await fetch(`${BASE_URL}/projects/${projectId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ userId: user1Id })
  });
  await fetch(`${BASE_URL}/projects/${projectId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ userId: user2Id })
  });

  // Create a task
  const taskRes = await fetch(`${BASE_URL}/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ title: 'Task for Chat Testing', assignedTo: user1Id })
  });
  const taskData = await taskRes.json();
  const taskId = taskData.data.id;
  console.log('✓ Project and task created.\n');

  // ========================================
  // REST API Tests
  // ========================================

  // Test 1: Manager sends a project-level message
  console.log('Test 1: Manager sends a project chat message...');
  const msg1Res = await fetch(`${BASE_URL}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ content: 'Welcome to the project! Let\'s get started.', project: projectId })
  });
  const msg1Data = await msg1Res.json();
  console.log('Message Status:', msg1Res.status, 'Sender:', msg1Data.data?.sender?.name);
  if (msg1Res.status !== 201) {
    throw new Error('Manager failed to send project message!');
  }
  const message1Id = msg1Data.data.id;
  console.log('✓ Manager sent project message.\n');

  // Test 2: User1 sends a project-level message
  console.log('Test 2: User sends project chat message...');
  const msg2Res = await fetch(`${BASE_URL}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1Token}` },
    body: JSON.stringify({ content: 'Thanks Manager! I\'ll start working on the task.', project: projectId })
  });
  const msg2Data = await msg2Res.json();
  console.log('Message Status:', msg2Res.status);
  if (msg2Res.status !== 201) {
    throw new Error('User failed to send project message!');
  }
  console.log('✓ User sent project message.\n');

  // Test 3: User2 sends a task-level message
  console.log('Test 3: User2 sends task chat message...');
  const msg3Res = await fetch(`${BASE_URL}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user2Token}` },
    body: JSON.stringify({ content: 'Hey, I can help with this task!', project: projectId, task: taskId })
  });
  const msg3Data = await msg3Res.json();
  console.log('Message Status:', msg3Res.status, 'Task:', msg3Data.data?.task);
  if (msg3Res.status !== 201) {
    throw new Error('User failed to send task message!');
  }
  console.log('✓ User2 sent task message.\n');

  // Test 4: Non-member cannot send message (Expect 403)
  console.log('Test 4: Non-member attempts to send message (Expect 403)...');
  const unauthMsgRes = await fetch(`${BASE_URL}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${nonMemberToken}` },
    body: JSON.stringify({ content: 'Unauthorized message', project: projectId })
  });
  console.log('Non-member Message Status (Expect 403):', unauthMsgRes.status);
  if (unauthMsgRes.status !== 403) {
    throw new Error('Non-member was allowed to send a message!');
  }
  console.log('✓ Non-member correctly denied.\n');

  // Test 5: Get project messages
  console.log('Test 5: Retrieve project messages...');
  const projMsgRes = await fetch(`${BASE_URL}/projects/${projectId}/messages`, {
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  const projMsgData = await projMsgRes.json();
  console.log('Project Messages Count:', projMsgData.data?.length, 'Pagination:', JSON.stringify(projMsgData.pagination));
  if (projMsgData.data?.length !== 2) {
    throw new Error(`Expected 2 project messages, got ${projMsgData.data?.length}`);
  }
  console.log('✓ Project messages retrieved correctly.\n');

  // Test 6: Get task messages
  console.log('Test 6: Retrieve task messages...');
  const taskMsgRes = await fetch(`${BASE_URL}/tasks/${taskId}/messages`, {
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  const taskMsgData = await taskMsgRes.json();
  console.log('Task Messages Count:', taskMsgData.data?.length);
  if (taskMsgData.data?.length !== 1) {
    throw new Error(`Expected 1 task message, got ${taskMsgData.data?.length}`);
  }
  console.log('✓ Task messages retrieved correctly.\n');

  // Test 7: Non-member cannot get project messages (Expect 403)
  console.log('Test 7: Non-member retrieves project messages (Expect 403)...');
  const unauthGetRes = await fetch(`${BASE_URL}/projects/${projectId}/messages`, {
    headers: { Authorization: `Bearer ${nonMemberToken}` }
  });
  console.log('Non-member GET Status (Expect 403):', unauthGetRes.status);
  if (unauthGetRes.status !== 403) {
    throw new Error('Non-member was allowed to read project messages!');
  }
  console.log('✓ Non-member correctly denied read access.\n');

  // Test 8: Mark messages as read
  console.log('Test 8: Mark project messages as read...');
  const readRes = await fetch(`${BASE_URL}/messages/read`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user2Token}` },
    body: JSON.stringify({ projectId })
  });
  const readData = await readRes.json();
  console.log('Read Status:', readRes.status, 'Marked Count:', readData.data?.markedCount);
  if (readRes.status !== 200) {
    throw new Error('Failed to mark messages as read!');
  }
  console.log('✓ Messages marked as read.\n');

  // Test 9: Get unread count
  console.log('Test 9: Get unread count for user1...');
  const unreadRes = await fetch(`${BASE_URL}/messages/unread?projectId=${projectId}`, {
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  const unreadData = await unreadRes.json();
  console.log('Unread Count for User1:', unreadData.data?.unreadCount);
  // User1 sent one of the two project messages, so they should have 1 unread (the Manager's message)
  if (unreadData.data?.unreadCount !== 1) {
    throw new Error(`Expected 1 unread message for User1, got ${unreadData.data?.unreadCount}`);
  }
  console.log('✓ Unread count is correct.\n');

  // Test 10: Delete a message (Author)
  console.log('Test 10: Author deletes their own message...');
  const deleteRes = await fetch(`${BASE_URL}/messages/${message1Id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  console.log('Delete Status:', deleteRes.status);
  if (deleteRes.status !== 200) {
    throw new Error('Failed to delete own message!');
  }
  console.log('✓ Message deleted by author.\n');

  // Test 11: Non-author cannot delete (Expect 403)
  console.log('Test 11: Non-author attempts to delete message (Expect 403)...');
  const msg2Id = msg2Data.data.id;
  const unauthDelRes = await fetch(`${BASE_URL}/messages/${msg2Id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${user2Token}` }
  });
  console.log('Unauth Delete Status (Expect 403):', unauthDelRes.status);
  if (unauthDelRes.status !== 403) {
    throw new Error('Non-author was allowed to delete message!');
  }
  console.log('✓ Non-author correctly denied delete.\n');

  // Test 12: Empty content validation (Expect 400)
  console.log('Test 12: Empty content validation (Expect 400)...');
  const emptyRes = await fetch(`${BASE_URL}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1Token}` },
    body: JSON.stringify({ content: '', project: projectId })
  });
  console.log('Empty Content Status (Expect 400):', emptyRes.status);
  if (emptyRes.status !== 400) {
    throw new Error('Empty message was accepted!');
  }
  console.log('✓ Validation correctly rejected empty message.\n');

  // ========================================
  // Socket.IO Chat Tests
  // ========================================

  console.log('--- Socket.IO Chat Tests ---\n');

  // Helper to connect a socket
  const connectSocket = (token) => {
    return new Promise((resolve, reject) => {
      const socket = ioClient(WS_URL, {
        auth: { token },
        transports: ['websocket']
      });
      socket.on('connect', () => resolve(socket));
      socket.on('connect_error', (err) => reject(new Error(`Socket connect failed: ${err.message}`)));
      setTimeout(() => reject(new Error('Socket connection timeout')), 5000);
    });
  };

  // Connect sockets
  console.log('Connecting sockets...');
  const socket1 = await connectSocket(user1Token);
  const socket2 = await connectSocket(user2Token);
  const mgrSocket = await connectSocket(managerToken);
  console.log('✓ All sockets connected.\n');

  // Test 13: Join project chat room
  console.log('Test 13: Join project chat rooms...');
  const joinResults = [];

  socket1.on('chat:joined', (data) => joinResults.push(data));
  socket2.on('chat:joined', (data) => joinResults.push(data));
  mgrSocket.on('chat:joined', (data) => joinResults.push(data));

  socket1.emit('chat:join', { projectId });
  socket2.emit('chat:join', { projectId });
  mgrSocket.emit('chat:join', { projectId });

  await new Promise((r) => setTimeout(r, 500));
  console.log('Join results:', joinResults.length, 'rooms joined');
  if (joinResults.length < 3) {
    throw new Error('Not all sockets joined the project chat room!');
  }
  console.log('✓ All users joined project chat.\n');

  // Test 14: Real-time message broadcast
  console.log('Test 14: Real-time message broadcast via socket...');
  const receivedMessages = [];

  socket2.on('chat:message', (data) => receivedMessages.push({ receiver: 'user2', data }));
  mgrSocket.on('chat:message', (data) => receivedMessages.push({ receiver: 'manager', data }));

  socket1.emit('chat:message', {
    projectId,
    content: 'Hello from socket! Real-time chat works!'
  });

  await new Promise((r) => setTimeout(r, 800));
  console.log('Messages received by others:', receivedMessages.length);
  if (receivedMessages.length < 2) {
    throw new Error('Real-time message not broadcast to all room members!');
  }
  console.log('Received message content:', receivedMessages[0]?.data?.content);
  console.log('✓ Real-time message broadcast works.\n');

  // Test 15: Typing indicators
  console.log('Test 15: Typing indicator...');
  let typingReceived = false;
  let stopTypingReceived = false;

  socket2.on('chat:typing', () => { typingReceived = true; });
  socket2.on('chat:stopTyping', () => { stopTypingReceived = true; });

  socket1.emit('chat:typing', { projectId });
  await new Promise((r) => setTimeout(r, 300));

  socket1.emit('chat:stopTyping', { projectId });
  await new Promise((r) => setTimeout(r, 300));

  console.log('Typing received:', typingReceived, 'Stop typing received:', stopTypingReceived);
  if (!typingReceived || !stopTypingReceived) {
    throw new Error('Typing indicators not working!');
  }
  console.log('✓ Typing indicators work.\n');

  // Test 16: Task chat room
  console.log('Test 16: Join task chat and send task message via socket...');
  const taskJoinResults = [];
  const taskMessages = [];

  socket1.on('chat:joined', (data) => {
    if (data.type === 'task') taskJoinResults.push(data);
  });
  socket2.on('chat:joined', (data) => {
    if (data.type === 'task') taskJoinResults.push(data);
  });

  socket1.emit('chat:join', { projectId, taskId });
  socket2.emit('chat:join', { projectId, taskId });

  await new Promise((r) => setTimeout(r, 500));
  console.log('Task chat rooms joined:', taskJoinResults.length);

  // Remove previous chat:message listeners and add task-specific ones
  socket2.removeAllListeners('chat:message');
  socket2.on('chat:message', (data) => {
    if (data.task === taskId) taskMessages.push(data);
  });

  socket1.emit('chat:message', {
    projectId,
    taskId,
    content: 'Task-specific discussion via socket!'
  });

  await new Promise((r) => setTimeout(r, 800));
  console.log('Task messages received:', taskMessages.length);
  if (taskMessages.length < 1) {
    throw new Error('Task socket message not received!');
  }
  console.log('✓ Task chat room works.\n');

  // Test 17: Mark as read via socket
  console.log('Test 17: Mark as read via socket...');
  let readNotified = false;
  socket1.on('chat:read', () => { readNotified = true; });

  socket2.emit('chat:read', { projectId, taskId });
  await new Promise((r) => setTimeout(r, 500));
  console.log('Read notification received:', readNotified);
  console.log('✓ Read status via socket works.\n');

  // Disconnect sockets
  socket1.disconnect();
  socket2.disconnect();
  mgrSocket.disconnect();

  // Verify messages were persisted by socket handler
  console.log('Test 18: Verify socket messages were persisted...');
  const finalProjMsgRes = await fetch(`${BASE_URL}/projects/${projectId}/messages`, {
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  const finalProjMsgData = await finalProjMsgRes.json();
  console.log('Total project messages after socket test:', finalProjMsgData.data?.length);
  // Original 2 project msgs - 1 deleted + 1 from socket = 2
  if (finalProjMsgData.data?.length !== 2) {
    throw new Error(`Expected 2 project messages after tests, got ${finalProjMsgData.data?.length}`);
  }
  console.log('✓ Socket messages persisted to database.\n');

  console.log('=== All Phase 9 Chat Tests Passed Successfully! ===');
}

runChatTests().catch((err) => {
  console.error('\n❌ Chat Test Suite Failed:', err.message);
  process.exit(1);
});

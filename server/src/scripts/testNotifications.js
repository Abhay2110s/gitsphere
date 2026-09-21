import 'dotenv/config';
import { io as ioClient } from 'socket.io-client';

const BASE_URL = 'http://localhost:5000/api/v1';
const WS_URL = 'http://localhost:5000';

async function runNotificationTests() {
  console.log('=== Starting Phase 10 Notifications Test Suite ===\n');

  // 1. Authenticate Manager
  console.log('1. Authenticating Manager...');
  const mgrLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'manager@gitsphere.com', password: 'ManagerPassword123' })
  });
  const mgrLoginData = await mgrLoginRes.json();
  const managerToken = mgrLoginData.data.token;
  const managerId = mgrLoginData.data.user.id;
  console.log('✓ Manager authenticated.\n');

  // 2. Register Test User
  const timestamp = Date.now();
  console.log('2. Registering Test User...');
  const userRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Notif Test User',
      email: `notifuser_${timestamp}@example.com`,
      password: 'Password123'
    })
  });
  const userData = await userRes.json();
  const userToken = userData.data.token;
  const userId = userData.data.user.id;
  console.log(`✓ User registered (ID: ${userId}).\n`);

  // 3. Connect User via Socket.IO and listen for notifications
  console.log('3. Connecting User via Socket.IO...');
  const userSocket = ioClient(WS_URL, {
    auth: { token: userToken }
  });

  const receivedSocketNotifications = [];
  userSocket.on('notification:new', (notif) => {
    console.log(`  [Socket Event] Received real-time notification: "${notif.title}" - ${notif.message}`);
    receivedSocketNotifications.push(notif);
  });

  await new Promise((resolve) => {
    userSocket.on('connect', () => {
      console.log('✓ User connected to Socket.IO server.\n');
      resolve();
    });
  });

  // 4. Create Project and add member (should trigger MEMBER_ADDED notification!)
  console.log('4. Creating project and adding member...');
  const projRes = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`
    },
    body: JSON.stringify({
      name: `Notif Test Project ${timestamp}`,
      description: 'Testing real-time notifications'
    })
  });
  const projData = await projRes.json();
  const projectId = projData.data.id;

  const addMemberRes = await fetch(`${BASE_URL}/projects/${projectId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`
    },
    body: JSON.stringify({ userId })
  });
  const addMemberData = await addMemberRes.json();
  if (!addMemberData.success) {
    throw new Error(`Failed to add member: ${addMemberData.message}`);
  }
  console.log('✓ Member added to project.\n');

  // 5. Create Task assigned to user (triggers TASK_ASSIGNED notification!)
  console.log('5. Creating task assigned to user...');
  const taskRes = await fetch(`${BASE_URL}/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`
    },
    body: JSON.stringify({
      title: 'Build Notification Feature',
      description: 'Implement real-time notification system',
      assignedTo: userId,
      priority: 'HIGH'
    })
  });
  const taskData = await taskRes.json();
  const taskId = taskData.data.id;
  console.log(`✓ Task created and assigned (ID: ${taskId}).\n`);

  // Wait a moment for socket notifications to arrive
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 6. Verify real-time socket delivery
  console.log('6. Verifying socket delivery...');
  console.log(`Total notifications received over socket: ${receivedSocketNotifications.length}`);
  if (receivedSocketNotifications.length >= 2) {
    console.log('✓ Both MEMBER_ADDED and TASK_ASSIGNED notifications received in real time!\n');
  } else {
    console.log(`⚠️ Received ${receivedSocketNotifications.length} socket notifications.\n`);
  }

  // 7. Test GET /api/v1/notifications
  console.log('7. Testing GET /api/v1/notifications...');
  const notifsRes = await fetch(`${BASE_URL}/notifications`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  const notifsData = await notifsRes.json();
  console.log(`Unread count: ${notifsData.unreadCount}`);
  console.log(`Retrieved count: ${notifsData.data.length}`);
  if (!notifsData.success || notifsData.data.length < 2) {
    throw new Error('Failed to retrieve expected notifications');
  }
  console.log('✓ Notifications retrieved with pagination and unreadCount.\n');

  const firstNotifId = notifsData.data[0].id;

  // 8. Test PATCH /api/v1/notifications/:id/read
  console.log('8. Testing PATCH /api/v1/notifications/:id/read...');
  const readRes = await fetch(`${BASE_URL}/notifications/${firstNotifId}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${userToken}` }
  });
  const readData = await readRes.json();
  if (!readData.success || !readData.data.isRead) {
    throw new Error('Failed to mark notification as read');
  }
  console.log('✓ Notification marked as read.\n');

  // 9. Test PATCH /api/v1/notifications/read-all
  console.log('9. Testing PATCH /api/v1/notifications/read-all...');
  const readAllRes = await fetch(`${BASE_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${userToken}` }
  });
  const readAllData = await readAllRes.json();
  if (!readAllData.success) {
    throw new Error('Failed to mark all as read');
  }
  console.log(`✓ All notifications marked as read (Modified: ${readAllData.data.markedCount}).\n`);

  // 10. Test DELETE /api/v1/notifications/:id
  console.log('10. Testing DELETE /api/v1/notifications/:id...');
  const delRes = await fetch(`${BASE_URL}/notifications/${firstNotifId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${userToken}` }
  });
  const delData = await delRes.json();
  if (!delData.success) {
    throw new Error('Failed to delete notification');
  }
  console.log('✓ Notification deleted successfully.\n');

  // 11. Test Security: Manager cannot delete User's notification
  console.log('11. Testing Security: Manager cannot delete User notification...');
  const remainingNotifId = notifsData.data[1].id;
  const secDelRes = await fetch(`${BASE_URL}/notifications/${remainingNotifId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  const secDelData = await secDelRes.json();
  if (secDelRes.status === 403) {
    console.log('✓ Security enforced: 403 Forbidden when deleting another user\'s notification.\n');
  } else {
    throw new Error(`Expected 403 but got ${secDelRes.status}`);
  }

  userSocket.disconnect();
  console.log('🎉 ALL PHASE 10 NOTIFICATION TESTS PASSED SUCCESSFULLY!\n');
}

runNotificationTests().catch((err) => {
  console.error('\n❌ Notification Test Suite Failed:', err);
  process.exit(1);
});

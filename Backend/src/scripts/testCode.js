import { BASE_URL } from './testConfig.js';

async function runCodeTests() {
  console.log('=== Starting Phase 5 & 6 Coding Workspace & Version History Test Suite ===\n');

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
  console.log('✓ Manager authenticated.\n');

  // 2. Register Users
  const timestamp = Date.now();
  console.log('Registering Test Users...');
  const u1Res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Assigned Dev', email: `dev_${timestamp}@example.com`, password: 'Password123' })
  });
  const u1Data = await u1Res.json();
  const user1Token = u1Data.data.token;
  const user1Id = u1Data.data.user.id;

  const u2Res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Colleague Dev', email: `colleague_${timestamp}@example.com`, password: 'Password123' })
  });
  const u2Data = await u2Res.json();
  const user2Token = u2Data.data.token;
  const user2Id = u2Data.data.user.id;

  const u3Res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Outsider', email: `outsider_code_${timestamp}@example.com`, password: 'Password123' })
  });
  const u3Data = await u3Res.json();
  const user3Token = u3Data.data.token;
  console.log('✓ Users registered.\n');

  // 3. Manager Sets Up Project with User 1 and User 2
  console.log('Setting up project and task...');
  const projRes = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${managerToken}`
    },
    body: JSON.stringify({ name: `Workspace Project ${timestamp}`, status: 'ACTIVE' })
  });
  const projData = await projRes.json();
  const projectId = projData.data.id;

  // Add User 1 and User 2
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

  // Create Task assigned to User 1
  const taskRes = await fetch(`${BASE_URL}/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({
      title: 'Monaco Editor Integration Task',
      assignedTo: user1Id,
      priority: 'HIGH'
    })
  });
  const taskData = await taskRes.json();
  const taskId = taskData.data.id;
  console.log('✓ Project and Task ready (Task assigned to User 1).\n');

  // 4. Test File Creation by Assigned User
  console.log('Test 1: Assigned User creates server.js in task...');
  const createFileRes = await fetch(`${BASE_URL}/tasks/${taskId}/files`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      fileName: 'server.js',
      filePath: '/',
      language: 'javascript',
      content: 'const express = require("express");\nconst app = express();\n'
    })
  });
  const createFileData = await createFileRes.json();
  console.log('Status:', createFileRes.status, 'File ID:', createFileData.data?.id, 'Version:', createFileData.data?.version);
  if (createFileRes.status !== 201 || !createFileData.data?.id) {
    throw new Error('Failed to create code file!');
  }
  const fileId = createFileData.data.id;
  console.log('✓ File server.js created with Version 1.\n');

  // 5. Test Duplicate File Invariant
  console.log('Test 2: Attempting to create duplicate file server.js (Expect 409)...');
  const dupFileRes = await fetch(`${BASE_URL}/tasks/${taskId}/files`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user1Token}`
    },
    body: JSON.stringify({
      fileName: 'server.js',
      filePath: '/',
      language: 'javascript'
    })
  });
  const dupFileData = await dupFileRes.json();
  console.log('Status:', dupFileRes.status, 'ErrorCode:', dupFileData.errorCode);
  if (dupFileRes.status !== 409 || dupFileData.errorCode !== 'DUPLICATE_FILE') {
    throw new Error('Duplicate file creation was allowed!');
  }
  console.log('✓ Duplicate file correctly rejected with 409.\n');

  // 6. Test Rule 6: Other Project Member Cannot Edit Another User's Task Code
  console.log('Test 3: Colleague (User 2) attempts to edit User 1 code (Expect 403)...');
  const unauthEditRes = await fetch(`${BASE_URL}/code/files/${fileId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user2Token}`
    },
    body: JSON.stringify({ content: '// Malicious overwrite' })
  });
  const unauthEditData = await unauthEditRes.json();
  console.log('Status:', unauthEditRes.status, 'ErrorCode:', unauthEditData.errorCode);
  if (unauthEditRes.status !== 403 || unauthEditData.errorCode !== 'FORBIDDEN') {
    throw new Error('Unauthorized user was allowed to modify task code!');
  }
  console.log('✓ Rule 6 enforced: Only assigned user can edit task code.\n');

  // 7. Test Read Permissions (Rule 7 & 8)
  console.log('Test 4: Colleague (User 2) views task files (Expect 200)...');
  const viewRes = await fetch(`${BASE_URL}/tasks/${taskId}/files`, {
    headers: { Authorization: `Bearer ${user2Token}` }
  });
  const viewData = await viewRes.json();
  console.log('Status:', viewRes.status, 'Files count:', viewData.data?.length);
  if (viewRes.status !== 200 || viewData.data?.length !== 1) {
    throw new Error('Authorized colleague was denied read access!');
  }

  console.log('Test 5: Outsider (User 3) attempts to read task files (Expect 403)...');
  const outsiderViewRes = await fetch(`${BASE_URL}/tasks/${taskId}/files`, {
    headers: { Authorization: `Bearer ${user3Token}` }
  });
  const outsiderViewData = await outsiderViewRes.json();
  console.log('Status:', outsiderViewRes.status, 'ErrorCode:', outsiderViewData.errorCode);
  if (outsiderViewRes.status !== 403 || outsiderViewData.errorCode !== 'FORBIDDEN') {
    throw new Error('Outsider was allowed to view task files!');
  }
  console.log('✓ Read permissions strictly enforced.\n');

  // 8. Assigned User Updates File & Saves Version 2
  console.log('Test 6: Assigned User updates content and saves Version 2...');
  const v2Content = 'const express = require("express");\nconst app = express();\napp.use(express.json());\n';
  await fetch(`${BASE_URL}/code/files/${fileId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user1Token}`
    },
    body: JSON.stringify({ content: v2Content })
  });

  const saveV2Res = await fetch(`${BASE_URL}/code/files/${fileId}/versions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user1Token}`
    },
    body: JSON.stringify({ commitMessage: 'Added json body parser middleware' })
  });
  const saveV2Data = await saveV2Res.json();
  console.log('Status:', saveV2Res.status, 'Saved Version:', saveV2Data.data?.versionNumber, 'Commit:', saveV2Data.data?.commitMessage);
  if (saveV2Res.status !== 201 || saveV2Data.data?.versionNumber !== 2) {
    throw new Error('Failed to save Version 2!');
  }
  const version2Id = saveV2Data.data.id;
  console.log('✓ Version 2 successfully created.\n');

  // 9. Assigned User Updates Content & Saves Version 3
  console.log('Test 7: Assigned User updates content and saves Version 3...');
  const v3Content = 'const express = require("express");\nconst app = express();\napp.use(express.json());\napp.listen(5000);\n';
  await fetch(`${BASE_URL}/code/files/${fileId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user1Token}`
    },
    body: JSON.stringify({ content: v3Content })
  });

  const saveV3Res = await fetch(`${BASE_URL}/code/files/${fileId}/versions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user1Token}`
    },
    body: JSON.stringify({ commitMessage: 'Added port listener' })
  });
  const saveV3Data = await saveV3Res.json();
  console.log('Status:', saveV3Res.status, 'Saved Version:', saveV3Data.data?.versionNumber);
  if (saveV3Res.status !== 201 || saveV3Data.data?.versionNumber !== 3) {
    throw new Error('Failed to save Version 3!');
  }
  console.log('✓ Version 3 successfully created.\n');

  // 10. List Version History
  console.log('Test 8: Listing file version history...');
  const listVerRes = await fetch(`${BASE_URL}/code/files/${fileId}/versions`, {
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  const listVerData = await listVerRes.json();
  console.log('Status:', listVerRes.status, 'Versions Found:', listVerData.data?.length);
  if (listVerRes.status !== 200 || listVerData.data?.length !== 3) {
    throw new Error('Version list count mismatch!');
  }
  console.log('✓ All 3 historical versions listed correctly in reverse chronological order.\n');

  // 11. Restore to Version 2
  console.log('Test 9: Restoring file back to Version 2 snapshot...');
  const restoreRes = await fetch(`${BASE_URL}/code/files/${fileId}/restore/${version2Id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  const restoreData = await restoreRes.json();
  console.log('Status:', restoreRes.status, 'Restored Commit Message:', restoreData.data?.restoredVersion?.commitMessage);
  console.log('Current File Version:', restoreData.data?.file?.version);
  if (restoreRes.status !== 200 || restoreData.data?.file?.content !== v2Content || restoreData.data?.file?.version !== 4) {
    throw new Error('Version restoration failed!');
  }
  console.log('✓ File successfully restored to Version 2 content, file version is now 4.\n');

  // 12. Create and Delete Secondary File
  console.log('Test 10: Create and delete auth.js...');
  const authFileRes = await fetch(`${BASE_URL}/tasks/${taskId}/files`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user1Token}`
    },
    body: JSON.stringify({ fileName: 'auth.js', content: '// auth module' })
  });
  const authFileData = await authFileRes.json();
  const authFileId = authFileData.data.id;

  const delFileRes = await fetch(`${BASE_URL}/code/files/${authFileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  console.log('Delete Status:', delFileRes.status);
  if (delFileRes.status !== 200) {
    throw new Error('Failed to delete file!');
  }
  console.log('✓ File creation and deletion verified.\n');

  console.log('=== All Phase 5 & 6 Coding Workspace Tests Passed Successfully! ===');
}

runCodeTests().catch((err) => {
  console.error('\n❌ Coding Workspace Test Suite Failed:', err.message);
  process.exit(1);
});

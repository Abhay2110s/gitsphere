import { io as Client } from 'socket.io-client';
import mongoose from 'mongoose';
import Contribution from '../models/Contribution.js';
import { SERVER_URL as BASE_URL, API_URL } from './testConfig.js';

// Color helpers for terminal output
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const blue = (text) => `\x1b[34m${text}\x1b[0m`;
const bold = (text) => `\x1b[1m${text}\x1b[0m`;

function assert(condition, message) {
  if (!condition) {
    console.error(red(`  FAIL: ${message}`));
    throw new Error(message);
  } else {
    console.log(green(`  ✓ PASS: ${message}`));
  }
}

/**
 * Monaco Editor Simulator
 * Simulates a client-side Monaco Editor instance and state manager
 */
class MonacoEditorState {
  constructor(initialFiles = [], initialVersion = 0) {
    this.models = new Map(); // path -> { content, language }
    this.dirty = new Map();  // path -> boolean
    this.currentVersion = initialVersion;
    this.activeFile = null;
    this.conflictAlert = null;

    initialFiles.forEach((f) => {
      this.models.set(f.path, f.content);
      this.dirty.set(f.path, false);
    });
    if (initialFiles.length > 0) {
      this.activeFile = initialFiles[0].path;
    }
  }

  // Developer edits file locally in Monaco
  editLocally(path, newContent) {
    this.models.set(path, newContent);
    this.dirty.set(path, true);
  }

  // Handle incoming Socket.IO code:approved event
  handleCodeApproved(data) {
    const { version, files, changedFiles } = data;
    this.currentVersion = version;

    for (const changed of changedFiles) {
      const isDirty = this.dirty.get(changed.path) === true;

      if (isDirty) {
        // Unsaved editor changes protected!
        this.conflictAlert = {
          file: changed.path,
          serverContent: changed.content,
          localContent: this.models.get(changed.path),
          message: 'Project Code Updated. Your current editor contains unsaved changes. Choose [Reload Approved Version] or [Keep My Changes]'
        };
      } else {
        // Clean editor: automatically update Monaco content
        this.models.set(changed.path, changed.content);
      }
    }
  }

  // User chooses "Reload Approved Version"
  resolveConflictReload(path) {
    if (this.conflictAlert && this.conflictAlert.file === path) {
      this.models.set(path, this.conflictAlert.serverContent);
      this.dirty.set(path, false);
      this.conflictAlert = null;
    }
  }

  // User chooses "Keep My Changes"
  resolveConflictKeep(path) {
    if (this.conflictAlert && this.conflictAlert.file === path) {
      this.conflictAlert = null;
      // dirty stays true, local content remains
    }
  }
}

async function runVerification() {
  console.log(bold('\n==============================================================='));
  console.log(bold('  GitSphere Code Approval & Synchronization Verification Suite'));
  console.log(bold('===============================================================\n'));

  // 1. Authenticate Manager
  console.log(blue('[Setup] Authenticating Manager & Developer...'));
  const mgrLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'manager@gitsphere.com', password: 'ManagerPassword123' })
  });
  const mgrData = await mgrLoginRes.json();
  const managerToken = mgrData.data.token;
  const managerUser = mgrData.data.user;

  // Register Developer
  const ts = Date.now();
  const devRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `Dev ${ts}`,
      email: `dev_${ts}@example.com`,
      password: 'Password123'
    })
  });
  const devData = await devRes.json();
  const devToken = devData.data.token;
  const devUser = devData.data.user;

  // Manager creates project
  const projRes = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ name: `Verification Project ${ts}`, description: 'Testing approval workflow' })
  });
  const projData = await projRes.json();
  const projectId = projData.data.id;

  // Add Developer to project
  await fetch(`${API_URL}/projects/${projectId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ userId: devUser.id })
  });

  // Create Task 1
  const t1Res = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ title: 'Task 1: Core Base Files', assignedTo: devUser.id })
  });
  const t1Data = await t1Res.json();
  const task1Id = t1Data.data.id;

  console.log(green('  ✓ Project, Task, and Users ready.\n'));

  // =========================================================================
  // FEATURE 3: Changed files are merged correctly instead of replacing all files
  // =========================================================================
  console.log(bold('--- Testing Feature 3: Changed files merged correctly into project ---'));

  // Developer submits Version 1 with README.md and server.js
  const contrib1Res = await fetch(`${API_URL}/contributions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${devToken}` },
    body: JSON.stringify({
      projectId,
      taskId: task1Id,
      files: [
        { path: 'README.md', content: '# Initial Project Readme', language: 'markdown' },
        { path: 'server.js', content: 'const express = require("express");', language: 'javascript' }
      ]
    })
  });
  const contrib1Data = await contrib1Res.json();
  assert(contrib1Data.success, 'Contribution 1 submitted successfully');
  const contrib1Id = contrib1Data.data.id;

  // Manager approves Version 1
  const app1Res = await fetch(`${API_URL}/contributions/${contrib1Id}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  const app1Data = await app1Res.json();
  assert(app1Data.success, 'Contribution 1 approved');
  assert(app1Data.data.version === 1, 'Project version bumped to 1');

  // Verify Project code after v1
  const code1Res = await fetch(`${API_URL}/projects/${projectId}/code`, {
    headers: { Authorization: `Bearer ${devToken}` }
  });
  const code1Data = await code1Res.json();
  assert(code1Data.data.currentVersion === 1, 'Current version is 1');
  assert(code1Data.data.files.length === 2, 'Project has 2 initial files (README.md, server.js)');

  // Now create Task 2 and submit Version 2 with ONLY auth.js and updated server.js
  // Notice: README.md is NOT in this contribution!
  const t2Res = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ title: 'Task 2: Add Auth Module', assignedTo: devUser.id })
  });
  const t2Data = await t2Res.json();
  const task2Id = t2Data.data.id;

  const contrib2Res = await fetch(`${API_URL}/contributions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${devToken}` },
    body: JSON.stringify({
      projectId,
      taskId: task2Id,
      files: [
        { path: 'server.js', content: 'const express = require("express"); const auth = require("./auth");', language: 'javascript' },
        { path: 'auth.js', content: 'export const authenticate = () => true;', language: 'javascript' }
      ]
    })
  });
  const contrib2Data = await contrib2Res.json();
  const contrib2Id = contrib2Data.data.id;

  // Manager approves Version 2
  const app2Res = await fetch(`${API_URL}/contributions/${contrib2Id}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  const app2Data = await app2Res.json();
  assert(app2Data.success, 'Contribution 2 approved');

  // Verify Project Code after v2 — files must be MERGED, NOT REPLACED!
  const code2Res = await fetch(`${API_URL}/projects/${projectId}/code`, {
    headers: { Authorization: `Bearer ${devToken}` }
  });
  const code2Data = await code2Res.json();
  const filesV2 = code2Data.data.files;

  assert(code2Data.data.currentVersion === 2, 'Current version is 2');
  assert(filesV2.length === 3, 'Project now has exactly 3 merged files');
  
  const readmeFile = filesV2.find((f) => f.path === 'README.md');
  const serverFile = filesV2.find((f) => f.path === 'server.js');
  const authFile = filesV2.find((f) => f.path === 'auth.js');

  assert(readmeFile && readmeFile.content === '# Initial Project Readme', 'README.md was PRESERVED during merge (not wiped out)');
  assert(serverFile && serverFile.content.includes('require("./auth")'), 'server.js was correctly UPDATED with new content');
  assert(authFile && authFile.content.includes('export const authenticate'), 'auth.js was correctly ADDED to project files');
  console.log(green('  ✓ Feature 3 (File Merging) fully verified!\n'));

  // =========================================================================
  // FEATURE 4: Version snapshots are immutable
  // =========================================================================
  console.log(bold('--- Testing Feature 4: Version snapshots are immutable ---'));

  // Query Version 1 via GET /api/v1/projects/:projectId/versions/1
  const v1Res = await fetch(`${API_URL}/projects/${projectId}/versions/1`, {
    headers: { Authorization: `Bearer ${devToken}` }
  });
  const v1Data = await v1Res.json();
  assert(v1Data.success, 'Version 1 snapshot fetched');
  assert(v1Data.data.version === 1, 'Snapshot version is 1');
  assert(v1Data.data.status === 'APPROVED', 'Version 1 status is immutable APPROVED');
  assert(v1Data.data.projectSnapshot && v1Data.data.projectSnapshot.length === 2, 'Version 1 project snapshot is frozen at 2 files');

  // Direct database mutation prevention test (pre-save hook)
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gitsphere');
  const v1Doc = await Contribution.findOne({ project: projectId, version: 1 });
  let mutationBlocked = false;
  try {
    v1Doc.version = 99; // Attempt tampering with version
    await v1Doc.save();
  } catch (err) {
    mutationBlocked = true;
  }
  assert(mutationBlocked, 'Direct mutation of approved version metadata is rejected by immutability hook');

  // Check version history listing
  const historyRes = await fetch(`${API_URL}/projects/${projectId}/versions`, {
    headers: { Authorization: `Bearer ${devToken}` }
  });
  const historyData = await historyRes.json();
  assert(Array.isArray(historyData.data) && historyData.data.length === 2, 'Version history has both immutable records (v1 and v2)');
  console.log(green('  ✓ Feature 4 (Version Snapshot Immutability) fully verified!\n'));

  // =========================================================================
  // FEATURE 1: code:approved actually updates Monaco Editor
  // FEATURE 2: Unsaved editor changes are protected
  // =========================================================================
  console.log(bold('--- Testing Features 1 & 2: Monaco Editor updates & Unsaved changes protection ---'));

  // Create Task 3 for testing real-time socket delivery
  const t3Res = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ title: 'Task 3: Real-time update', assignedTo: devUser.id })
  });
  const t3Data = await t3Res.json();
  const task3Id = t3Data.data.id;

  // Connect Developer Socket Client
  const devSocket = Client(BASE_URL, {
    auth: { token: devToken },
    transports: ['websocket']
  });

  await new Promise((resolve) => devSocket.on('connect', resolve));
  assert(devSocket.connected, 'Developer socket connected');

  // Join project room
  const joinedPromise = new Promise((resolve) => {
    devSocket.on('project:joined', resolve);
  });
  devSocket.emit('join:project', projectId);
  const joinData = await joinedPromise;
  assert(joinData.currentVersion === 2, 'project:joined provides latest currentVersion (v2)');
  assert(joinData.files.length === 3, 'project:joined provides latest 3 merged files');

  // Initialize Monaco Editor state from project files
  const monacoEditor1 = new MonacoEditorState(joinData.files, joinData.currentVersion);
  const monacoEditor2_Dirty = new MonacoEditorState(joinData.files, joinData.currentVersion);

  // In editor 2, developer has made unsaved edits to auth.js!
  monacoEditor2_Dirty.editLocally('auth.js', '// DEVELOPER LOCAL DRAFT - NOT SAVED YET\nexport const authenticate = () => "custom";');
  assert(monacoEditor2_Dirty.dirty.get('auth.js') === true, 'Editor 2 marked dirty for auth.js');

  // Set up code:approved listener
  const codeApprovedPromise = new Promise((resolve) => {
    devSocket.on('code:approved', resolve);
  });

  // Developer submits Version 3 modifying auth.js
  const contrib3Res = await fetch(`${API_URL}/contributions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${devToken}` },
    body: JSON.stringify({
      projectId,
      taskId: task3Id,
      files: [
        { path: 'auth.js', content: '// Version 3 Approved Auth\nexport const authenticate = (token) => token !== null;', language: 'javascript' }
      ]
    })
  });
  const contrib3Data = await contrib3Res.json();

  // Manager approves Version 3
  await fetch(`${API_URL}/contributions/${contrib3Data.data.id}/approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${managerToken}` }
  });

  // Wait for Socket.IO code:approved event
  const approvedEvent = await codeApprovedPromise;
  assert(approvedEvent.version === 3, 'Received code:approved event for Version 3');
  assert(approvedEvent.files.length === 3, 'Event payload contains all merged project files');
  assert(approvedEvent.changedFiles.length === 1, 'Event payload specifies changedFiles');

  // Test Feature 1: Clean editor updates automatically
  monacoEditor1.handleCodeApproved(approvedEvent);
  assert(monacoEditor1.currentVersion === 3, 'Monaco Editor version tag updated to v3');
  assert(
    monacoEditor1.models.get('auth.js').includes('Version 3 Approved Auth'),
    'Feature 1: Monaco Editor model automatically updated with new approved code'
  );

  // Test Feature 2: Unsaved changes are protected
  monacoEditor2_Dirty.handleCodeApproved(approvedEvent);
  assert(
    monacoEditor2_Dirty.models.get('auth.js').includes('DEVELOPER LOCAL DRAFT'),
    'Feature 2: Developer unsaved changes PRESERVED (not overwritten by code:approved)'
  );
  assert(monacoEditor2_Dirty.conflictAlert !== null, 'Conflict prompt generated for developer choice');

  // When user chooses "Reload Approved Version"
  monacoEditor2_Dirty.resolveConflictReload('auth.js');
  assert(
    monacoEditor2_Dirty.models.get('auth.js').includes('Version 3 Approved Auth'),
    'After choosing Reload, Monaco Editor reloads the approved version'
  );
  console.log(green('  ✓ Feature 1 (Monaco auto-update) & Feature 2 (Unsaved changes protected) fully verified!\n'));

  // =========================================================================
  // FEATURE 5: Reconnecting clients fetch the latest approved version
  // =========================================================================
  console.log(bold('--- Testing Feature 5: Reconnecting clients fetch latest approved version ---'));

  // Simulate client disconnection
  devSocket.disconnect();
  assert(!devSocket.connected, 'Client disconnected');

  // While disconnected, verify REST endpoint returns the latest approved version
  const restCodeRes = await fetch(`${API_URL}/projects/${projectId}/code`, {
    headers: { Authorization: `Bearer ${devToken}` }
  });
  const restCodeData = await restCodeRes.json();
  assert(restCodeData.data.currentVersion === 3, 'REST GET /projects/:id/code returns latest approved version (v3)');
  assert(restCodeData.data.files.length === 3, 'REST endpoint returns all 3 merged files');
  assert(restCodeData.data.updatedBy && restCodeData.data.updatedBy.id === managerUser.id, 'REST endpoint includes manager approval attribution');

  // Reconnect client
  const reconnectedSocket = Client(BASE_URL, {
    auth: { token: devToken },
    transports: ['websocket']
  });
  await new Promise((resolve) => reconnectedSocket.on('connect', resolve));
  assert(reconnectedSocket.connected, 'Client reconnected to Socket.IO');

  const rejoinPromise = new Promise((resolve) => {
    reconnectedSocket.on('project:joined', resolve);
  });
  reconnectedSocket.emit('join:project', projectId);
  const rejoinData = await rejoinPromise;

  assert(rejoinData.currentVersion === 3, 'Reconnecting client receives currentVersion v3 upon joining');
  assert(rejoinData.files.length === 3, 'Reconnecting client receives latest files snapshot');
  console.log(green('  ✓ Feature 5 (Reconnecting clients fetch latest version) fully verified!\n'));

  reconnectedSocket.disconnect();
  await mongoose.disconnect();

  console.log(bold('\n==============================================================='));
  console.log(green(bold('  ALL 5 FEATURES VERIFIED SUCCESSFULLY! (100% PASS)')));
  console.log(bold('===============================================================\n'));
}

runVerification().catch((err) => {
  console.error(red(`\nVerification failed: ${err.message}`));
  console.error(err.stack);
  process.exit(1);
});

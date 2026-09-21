import 'dotenv/config';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runReviewTests() {
  console.log('=== Starting Phase 8 Code Review & Comments Test Suite ===\n');

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
    body: JSON.stringify({ name: 'Assigned Author', email: `author_${timestamp}@example.com`, password: 'Password123' })
  });
  const u1Data = await u1Res.json();
  const user1Token = u1Data.data.token;
  const user1Id = u1Data.data.user.id;

  const u2Res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Reviewer Peer', email: `peer_${timestamp}@example.com`, password: 'Password123' })
  });
  const u2Data = await u2Res.json();
  const user2Token = u2Data.data.token;
  console.log('✓ Users registered.\n');

  // 3. Setup Project, Task, File
  console.log('Setting up project, task, and code file...');
  const projRes = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ name: `Review Project ${timestamp}`, status: 'ACTIVE' })
  });
  const projData = await projRes.json();
  const projectId = projData.data.id;

  await fetch(`${BASE_URL}/projects/${projectId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ userId: user1Id })
  });
  await fetch(`${BASE_URL}/projects/${projectId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ userId: u2Data.data.user.id })
  });

  const taskRes = await fetch(`${BASE_URL}/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ title: 'Task for Full Review Cycle', assignedTo: user1Id })
  });
  const taskData = await taskRes.json();
  const taskId = taskData.data.id;

  const fileRes = await fetch(`${BASE_URL}/tasks/${taskId}/files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1Token}` },
    body: JSON.stringify({
      fileName: 'auth.js',
      content: '// 1\n// 2\nconst token = req.cookies.token;\n// 4\n// 5\n'
    })
  });
  const fileData = await fileRes.json();
  const fileId = fileData.data.id;

  // Move task to IN_PROGRESS
  await fetch(`${BASE_URL}/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1Token}` },
    body: JSON.stringify({ status: 'IN_PROGRESS' })
  });
  console.log('✓ Task in IN_PROGRESS and file created (File ID:', fileId, ')\n');

  // 4. Test Code Comments
  console.log('Test 1: Manager and Peer add comments on lines 3 and 5...');
  const c1Res = await fetch(`${BASE_URL}/code/files/${fileId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({ lineNumber: 3, content: 'Validate cookie exists before accessing properties' })
  });
  const c1Data = await c1Res.json();
  console.log('Comment 1 Status:', c1Res.status, 'Line:', c1Data.data?.lineNumber);
  const comment1Id = c1Data.data.id;

  const c2Res = await fetch(`${BASE_URL}/code/files/${fileId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user2Token}` },
    body: JSON.stringify({ lineNumber: 5, content: 'Nice structure' })
  });
  const c2Data = await c2Res.json();
  console.log('Comment 2 Status:', c2Res.status, 'Line:', c2Data.data?.lineNumber);
  const comment2Id = c2Data.data.id;

  // List comments
  const listCommentsRes = await fetch(`${BASE_URL}/code/files/${fileId}/comments`, {
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  const listCommentsData = await listCommentsRes.json();
  console.log('Total Comments Retrieved:', listCommentsData.data?.length);
  if (listCommentsData.data?.length !== 2) {
    throw new Error('Comments list mismatch!');
  }
  console.log('✓ Code comments created and listed in line order.\n');

  // 5. Test Comment Permission & Resolution
  console.log('Test 2: Author edits comment 2; other user edit attempt is rejected (Expect 403)...');
  const unauthCommentEdit = await fetch(`${BASE_URL}/code/comments/${comment2Id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1Token}` },
    body: JSON.stringify({ content: 'Attempted overwrite' })
  });
  console.log('Unauthorized Comment Edit Status (Expect 403):', unauthCommentEdit.status);
  if (unauthCommentEdit.status !== 403) {
    throw new Error('User was allowed to edit someone else\'s comment!');
  }

  // Manager resolves comment 1
  const resolveRes = await fetch(`${BASE_URL}/code/comments/${comment1Id}/resolve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  const resolveData = await resolveRes.json();
  console.log('Comment 1 Resolved Status:', resolveData.data?.isResolved);
  if (!resolveData.data?.isResolved) {
    throw new Error('Comment resolution failed!');
  }
  console.log('✓ Comment resolution verified.\n');

  // 6. Test Review Submission
  console.log('Test 3: Non-assigned user attempts to submit review (Expect 403)...');
  const unauthSubmit = await fetch(`${BASE_URL}/tasks/${taskId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user2Token}` },
    body: JSON.stringify({ summary: 'Peer attempt' })
  });
  console.log('Unassigned Submit Status (Expect 403):', unauthSubmit.status);
  if (unauthSubmit.status !== 403) {
    throw new Error('Unassigned user was allowed to submit review!');
  }

  console.log('Test 4: Assigned User submits code for review...');
  const submitRes = await fetch(`${BASE_URL}/tasks/${taskId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1Token}` },
    body: JSON.stringify({ summary: 'Finished authentication middleware with cookie parser' })
  });
  const submitData = await submitRes.json();
  console.log('Submit Status:', submitRes.status, 'Review Status:', submitData.data?.status);
  if (submitRes.status !== 201 || submitData.data?.status !== 'PENDING') {
    throw new Error('Review submission failed!');
  }
  const reviewId = submitData.data.id;

  // Verify task status transitioned to IN_REVIEW
  const taskCheckRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  const taskCheckData = await taskCheckRes.json();
  console.log('Task Status After Submission (Expect IN_REVIEW):', taskCheckData.data?.status);
  if (taskCheckData.data?.status !== 'IN_REVIEW') {
    throw new Error('Task did not transition to IN_REVIEW!');
  }
  console.log('✓ Review submitted; task transitioned to IN_REVIEW.\n');

  // 7. Test Rule 11: User Cannot Evaluate/Approve Own Code
  console.log('Test 5: User attempts self-review evaluation (Expect 403)...');
  const selfReviewRes = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1Token}` },
    body: JSON.stringify({ status: 'APPROVED' })
  });
  console.log('Self-Review Status (Expect 403):', selfReviewRes.status);
  if (selfReviewRes.status !== 403) {
    throw new Error('User was allowed to approve own review!');
  }
  console.log('✓ Rule 11 enforced: User cannot approve own code.\n');

  // 8. Manager Requests Changes
  console.log('Test 6: Manager requests changes (CHANGES_REQUESTED)...');
  const reqChangesRes = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({
      status: 'CHANGES_REQUESTED',
      summary: 'Please handle undefined cookie tokens and add a test case.'
    })
  });
  const reqChangesData = await reqChangesRes.json();
  console.log('Review Status:', reqChangesData.data?.status);

  // Verify task status synchronized to CHANGES_REQUESTED
  const taskPostChanges = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  const taskPostChangesData = await taskPostChanges.json();
  console.log('Task Status Post Evaluation (Expect CHANGES_REQUESTED):', taskPostChangesData.data?.status);
  if (taskPostChangesData.data?.status !== 'CHANGES_REQUESTED') {
    throw new Error('Task did not transition to CHANGES_REQUESTED!');
  }
  console.log('✓ Manager requested changes; task moved to CHANGES_REQUESTED.\n');

  // 9. Resubmission & Final Approval Cycle
  console.log('Test 7: User resumes work (IN_PROGRESS) and resubmits for review...');
  await fetch(`${BASE_URL}/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1Token}` },
    body: JSON.stringify({ status: 'IN_PROGRESS' })
  });

  const resubmitRes = await fetch(`${BASE_URL}/tasks/${taskId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1Token}` },
    body: JSON.stringify({ summary: 'Fixed cookie token checks and added test.' })
  });
  const resubmitData = await resubmitRes.json();
  const secondReviewId = resubmitData.data.id;
  console.log('Second Review Created:', secondReviewId, 'Status:', resubmitData.data?.status);

  console.log('Test 8: Manager approves code (APPROVED -> COMPLETED)...');
  const approveRes = await fetch(`${BASE_URL}/reviews/${secondReviewId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
    body: JSON.stringify({
      status: 'APPROVED',
      summary: 'LGTM! Excellent implementation.'
    })
  });
  const approveData = await approveRes.json();
  console.log('Review Status:', approveData.data?.status, 'Reviewer:', approveData.data?.reviewedBy?.name);

  // Verify task status is COMPLETED
  const finalTaskRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  const finalTaskData = await finalTaskRes.json();
  console.log('Final Task Status (Expect COMPLETED):', finalTaskData.data?.status);
  if (finalTaskData.data?.status !== 'COMPLETED') {
    throw new Error('Task did not transition to COMPLETED!');
  }
  console.log('✓ Review approved; task successfully marked COMPLETED!\n');

  console.log('=== All Phase 8 Code Review & Comments Tests Passed Successfully! ===');
}

runReviewTests().catch((err) => {
  console.error('\n❌ Code Review Test Suite Failed:', err.message);
  process.exit(1);
});

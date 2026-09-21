import 'dotenv/config';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runAttachmentTests() {
  console.log('=== Starting Phase 12 File Attachments Test Suite ===\n');

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

  // 2. Register User
  const timestamp = Date.now();
  console.log('2. Registering Test User...');
  const userRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Attachment User',
      email: `attach_${timestamp}@example.com`,
      password: 'Password123'
    })
  });
  const userData = await userRes.json();
  const userToken = userData.data.token;
  console.log('✓ User registered.\n');

  // 3. Test valid file upload (e.g., text/plain document or markdown)
  console.log('3. Uploading valid text attachment...');
  const formData = new FormData();
  const validFileContent = new Blob(['# README Documentation\nProject specs and code guidelines.'], {
    type: 'text/markdown'
  });
  formData.append('file', validFileContent, 'README.md');

  const uploadRes = await fetch(`${BASE_URL}/attachments/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: formData
  });
  const uploadData = await uploadRes.json();
  if (!uploadData.success) {
    throw new Error(`Failed to upload valid attachment: ${uploadData.message}`);
  }
  const attachmentId = uploadData.data.id;
  console.log(`✓ Attachment uploaded successfully (ID: ${attachmentId}, URL: ${uploadData.data.url}).\n`);

  // 4. Test security rejection: Disallow executable upload (.exe)
  console.log('4. Testing security: Attempting to upload dangerous executable file (.exe)...');
  const exeFormData = new FormData();
  const exeFileContent = new Blob(['MZ\x90\x00\x03\x00\x00\x00'], { type: 'application/octet-stream' });
  exeFormData.append('file', exeFileContent, 'malicious_program.exe');

  const exeUploadRes = await fetch(`${BASE_URL}/attachments/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: exeFormData
  });
  const exeUploadData = await exeUploadRes.json();
  if (exeUploadRes.status === 400 && exeUploadData.errorCode === 'DISALLOWED_FILE_TYPE') {
    console.log('✓ Security enforced: Executable file upload was strictly rejected with 400 DISALLOWED_FILE_TYPE.\n');
  } else {
    throw new Error(`Expected 400 rejection for .exe but got status: ${exeUploadRes.status}`);
  }

  // 5. Test GET /api/v1/attachments
  console.log('5. Testing GET /api/v1/attachments...');
  const getRes = await fetch(`${BASE_URL}/attachments`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  const getData = await getRes.json();
  if (!getData.success || getData.data.length === 0) {
    throw new Error('Failed to retrieve uploaded attachments');
  }
  console.log(`✓ Retrieved ${getData.data.length} attachments.\n`);

  // 6. Test DELETE /api/v1/attachments/:id
  console.log('6. Testing DELETE /api/v1/attachments/:id...');
  const delRes = await fetch(`${BASE_URL}/attachments/${attachmentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${userToken}` }
  });
  const delData = await delRes.json();
  if (!delData.success) {
    throw new Error(`Failed to delete attachment: ${delData.message}`);
  }
  console.log('✓ Attachment deleted successfully.\n');

  console.log('🎉 ALL PHASE 12 ATTACHMENT TESTS PASSED SUCCESSFULLY!\n');
}

runAttachmentTests().catch((err) => {
  console.error('\n❌ Attachment Test Suite Failed:', err);
  process.exit(1);
});

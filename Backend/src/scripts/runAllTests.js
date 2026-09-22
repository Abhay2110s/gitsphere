import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { SERVER_URL, API_URL } from './testConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptsDir = __dirname;
const serverRoot = path.join(__dirname, '../..');

const testSuites = [
  { name: 'Phase 2: Authentication', script: 'testAuth.js' },
  { name: 'Phase 3: Projects & Membership', script: 'testProjects.js' },
  { name: 'Phase 4: Tasks & State Machine', script: 'testTasks.js' },
  { name: 'Phase 5 & 6: Code Workspace & Versions', script: 'testCode.js' },
  { name: 'Phase 7: Real-Time Sockets & Collab', script: 'testSocket.js' },
  { name: 'Phase 8: Code Reviews & Line Comments', script: 'testReviews.js' },
  { name: 'Phase 9: Project & Task Chat', script: 'testChat.js' },
  { name: 'Phase 10: Real-Time Notifications', script: 'testNotifications.js' },
  { name: 'Phase 11: Activity & Audit Logs', script: 'testActivity.js' },
  { name: 'Phase 12: File Attachments', script: 'testAttachments.js' },
  { name: 'Phase 13: Manager & User Dashboards', script: 'testDashboards.js' },
  { name: 'Phase 14: Manager Approval & Code Sync', script: 'verifyFeatures.js' }
];

async function isServerRunning() {
  try {
    const res = await fetch(`${API_URL}/health`);
    return res.status === 200;
  } catch {
    return false;
  }
}

function runScript(scriptPath) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const child = spawn('node', [scriptPath], {
      cwd: serverRoot,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'test' }
    });

    child.on('close', (code) => {
      const durationMs = Date.now() - startTime;
      resolve({
        success: code === 0,
        code,
        duration: (durationMs / 1000).toFixed(2)
      });
    });

    child.on('error', (err) => {
      resolve({
        success: false,
        error: err.message,
        duration: '0.00'
      });
    });
  });
}

async function main() {
  console.log('===============================================================');
  console.log('🧪 GitSphere (CodeCollab) Complete Backend Test Runner');
  console.log('===============================================================\n');

  let serverProcess = null;
  const running = await isServerRunning();

  if (!running) {
    console.log('Starting local background server instance for testing...');
    serverProcess = spawn('node', ['src/server.js'], {
      cwd: serverRoot,
      stdio: 'ignore'
    });

    // Wait for server health endpoint to become ready
    let retries = 20;
    while (retries > 0) {
      await new Promise((r) => setTimeout(r, 500));
      if (await isServerRunning()) break;
      retries--;
    }

    if (!(await isServerRunning())) {
      console.error('❌ Failed to start test server. Ensure MongoDB is running on port 27017.');
      if (serverProcess) serverProcess.kill();
      process.exit(1);
    }
    console.log(`✓ Test server is healthy and ready on ${SERVER_URL}\n`);
  } else {
    console.log(`✓ Connected to active server on ${SERVER_URL}\n`);
  }

  const results = [];

  for (const suite of testSuites) {
    const scriptPath = path.join(scriptsDir, suite.script);
    console.log(`\n▶ Running: ${suite.name} (${suite.script})...`);
    console.log('---------------------------------------------------------------');
    const res = await runScript(scriptPath);
    results.push({ ...suite, ...res });
  }

  if (serverProcess) {
    console.log('\nShutting down background test server process...');
    serverProcess.kill();
  }

  // Print Summary Table
  console.log('\n===============================================================');
  console.log('📊 TEST EXECUTION SCORECARD');
  console.log('===============================================================');

  let allPassed = true;
  for (const res of results) {
    const statusIcon = res.success ? '✅ PASS' : '❌ FAIL';
    if (!res.success) allPassed = false;
    console.log(
      `${statusIcon.padEnd(8)} | ${res.name.padEnd(42)} | ${res.duration}s`
    );
  }

  console.log('===============================================================');

  if (allPassed) {
    console.log(`🎉 ALL ${testSuites.length} TEST SUITES PASSED CLEANLY! (100% SUCCESS)`);
    process.exit(0);
  } else {
    console.error('💥 Some test suites failed. Review the console logs above.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});

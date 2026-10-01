/**
 * GitSphere Serverless-Safe Background Task Dispatcher
 * Allows API routes to respond instantly to the user while keeping
 * the serverless container alive until the background task (e.g. sending email) settles.
 */

let vercelWaitUntil = null;

try {
  const mod = await import('@vercel/functions');
  vercelWaitUntil = mod.waitUntil;
} catch {
  // Not available locally or before installation
}

export const dispatchBackgroundTask = (taskPromise) => {
  // 1. Check runtime symbol injected by Vercel
  const runtimeWaitUntil = globalThis[Symbol.for('vercel.waitUntil')];
  if (typeof runtimeWaitUntil === 'function') {
    runtimeWaitUntil(taskPromise);
    return;
  }

  // 2. Check @vercel/functions waitUntil
  if (typeof vercelWaitUntil === 'function') {
    try {
      vercelWaitUntil(taskPromise);
      return;
    } catch {
      // fallback
    }
  }

  // 3. Standard fallback: local Node.js keeps running in background
  taskPromise.catch((err) => {
    console.error('[Background Task Error]:', err.message);
  });
};

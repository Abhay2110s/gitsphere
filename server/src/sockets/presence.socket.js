/**
 * In-Memory Presence Store (Section 26)
 * Single-instance presence tracker designed without Redis dependency.
 * Structure: Map<taskId, Map<socketId, PresenceUser>>
 */
const taskPresence = new Map();

// Map<socketId, Set<taskId>> to track which task rooms a socket is registered in
const socketTaskMap = new Map();

/**
 * Register user presence in a task room
 */
export const addPresence = (taskId, socketId, user, currentFile = null, status = 'ONLINE') => {
  const tId = taskId.toString();

  if (!taskPresence.has(tId)) {
    taskPresence.set(tId, new Map());
  }

  const roomMap = taskPresence.get(tId);
  roomMap.set(socketId, {
    socketId,
    userId: user._id ? user._id.toString() : user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || '',
    role: user.role,
    status, // 'ONLINE' | 'IDLE' | 'OFFLINE'
    currentFile: currentFile || null,
    lastActive: new Date().toISOString()
  });

  if (!socketTaskMap.has(socketId)) {
    socketTaskMap.set(socketId, new Set());
  }
  socketTaskMap.get(socketId).add(tId);
};

/**
 * Update user's current working file or status in a task
 */
export const updatePresence = (taskId, socketId, updates = {}) => {
  const tId = taskId.toString();
  const roomMap = taskPresence.get(tId);
  if (roomMap && roomMap.has(socketId)) {
    const existing = roomMap.get(socketId);
    roomMap.set(socketId, {
      ...existing,
      ...updates,
      lastActive: new Date().toISOString()
    });
  }
};

/**
 * Remove socket presence from a specific task room
 */
export const removePresence = (taskId, socketId) => {
  const tId = taskId.toString();
  const roomMap = taskPresence.get(tId);
  if (roomMap) {
    roomMap.delete(socketId);
    if (roomMap.size === 0) {
      taskPresence.delete(tId);
    }
  }

  if (socketTaskMap.has(socketId)) {
    const tasks = socketTaskMap.get(socketId);
    tasks.delete(tId);
    if (tasks.size === 0) {
      socketTaskMap.delete(socketId);
    }
  }
};

/**
 * Remove socket presence from all task rooms on disconnect
 * @returns {Array<string>} List of taskIds affected
 */
export const clearSocketPresence = (socketId) => {
  const affectedTasks = [];
  if (socketTaskMap.has(socketId)) {
    const tasks = socketTaskMap.get(socketId);
    for (const tId of tasks) {
      const roomMap = taskPresence.get(tId);
      if (roomMap) {
        roomMap.delete(socketId);
        if (roomMap.size === 0) {
          taskPresence.delete(tId);
        }
      }
      affectedTasks.push(tId);
    }
    socketTaskMap.delete(socketId);
  }
  return affectedTasks;
};

/**
 * Get active presence list for a task room
 */
export const getTaskPresence = (taskId) => {
  const tId = taskId.toString();
  const roomMap = taskPresence.get(tId);
  if (!roomMap) return [];

  // Deduplicate by userId so multiple tabs from same user show aggregated status
  const userMap = new Map();
  for (const item of roomMap.values()) {
    userMap.set(item.userId, item);
  }

  return Array.from(userMap.values());
};

/**
 * Broadcast presence list to all members in task room
 */
export const broadcastPresence = (io, taskId) => {
  const tId = taskId.toString();
  const presenceList = getTaskPresence(tId);
  io.to(`task:${tId}`).emit('code:presence', {
    taskId: tId,
    users: presenceList
  });
};

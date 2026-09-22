import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { hasProjectAccess } from '../middleware/projectAccess.middleware.js';
import {
  addPresence,
  updatePresence,
  removePresence,
  clearSocketPresence,
  broadcastPresence,
  getTaskPresence
} from './presence.socket.js';

/**
 * Verify task room authorization
 */
const verifyRoomAccess = async (taskId, user) => {
  if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
    return { authorized: false, message: 'Invalid Task ID format' };
  }

  const task = await Task.findById(taskId).populate('project');
  if (!task) {
    return { authorized: false, message: 'Task not found' };
  }

  const project = task.project;

  if (!hasProjectAccess(project, user)) {
    const message =
      user.role === 'MANAGER'
        ? 'Access denied to tasks outside your projects'
        : 'Access denied. You are not a member of this project.';
    return { authorized: false, message };
  }

  return { authorized: true, task, project };
};

/**
 * Register code collaboration socket handlers
 */
export const registerCodeHandlers = (io, socket) => {
  const user = socket.user;

  /**
   * 0a. Join Project Room (for real-time contribution sync)
   * Developers and Managers join project:${projectId} to receive
   * code:submitted, code:approved, code:changes-requested events.
   */
  socket.on('join:project', async (projectId) => {
    try {
      if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
        return socket.emit('code:error', { message: 'Invalid Project ID format' });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return socket.emit('code:error', { message: 'Project not found' });
      }

      // Verify access
      if (!hasProjectAccess(project, user)) {
        const message =
          user.role === 'MANAGER'
            ? 'Access denied to this project'
            : 'Access denied. You are not a member of this project.';
        return socket.emit('code:error', { message });
      }

      const roomName = `project:${projectId}`;
      socket.join(roomName);
      socket.emit('project:joined', {
        projectId,
        room: roomName,
        currentVersion: project.currentVersion,
        files: project.currentFiles || []
      });
      console.log(`[Socket] User ${user.name} (${user.role}) joined ${roomName}`);
    } catch (error) {
      socket.emit('code:error', { message: error.message });
    }
  });

  /**
   * 0b. Leave Project Room
   */
  socket.on('leave:project', (projectId) => {
    if (!projectId) return;
    const roomName = `project:${projectId}`;
    socket.leave(roomName);
    console.log(`[Socket] User ${user.name} left ${roomName}`);
  });

  /**
   * 1. Join Task Coding Room (Authenticated & Authorized)
   */
  socket.on('code:join', async ({ taskId, currentFile }) => {
    try {
      const { authorized, message, task } = await verifyRoomAccess(taskId, user);
      if (!authorized) {
        return socket.emit('code:error', { message });
      }

      const roomName = `task:${taskId}`;
      socket.join(roomName);

      // Register live presence
      addPresence(taskId, socket.id, user, currentFile, 'ONLINE');

      // Acknowledge joining to sender
      socket.emit('code:joined', {
        taskId,
        presence: getTaskPresence(taskId)
      });

      // Broadcast updated presence to all room participants
      broadcastPresence(io, taskId);
      console.log(`[Socket] User ${user.name} (${user.role}) joined ${roomName}`);
    } catch (error) {
      socket.emit('code:error', { message: error.message });
    }
  });

  /**
   * 2. Leave Task Coding Room
   */
  socket.on('code:leave', ({ taskId }) => {
    if (!taskId) return;
    const roomName = `task:${taskId}`;
    socket.leave(roomName);
    removePresence(taskId, socket.id);
    broadcastPresence(io, taskId);
    console.log(`[Socket] User ${user.name} left ${roomName}`);
  });

  /**
   * 3. Real-Time Code Synchronization
   * Broadcasts Monaco editor content changes to all participants in the task room
   */
  socket.on('code:update', async ({ taskId, fileId, content, cursor }) => {
    try {
      const { authorized, message, task } = await verifyRoomAccess(taskId, user);
      if (!authorized) {
        return socket.emit('code:error', { message });
      }

      // Rule 6: Only assigned User (or project Manager) can emit code updates
      if (user.role === 'USER') {
        if (!task.assignedTo || !task.assignedTo.equals(user._id)) {
          return socket.emit('code:error', {
            message: 'Permission denied. You can only edit code in tasks assigned to you.'
          });
        }
      }

      const roomName = `task:${taskId}`;
      socket.to(roomName).emit('code:updated', {
        taskId,
        fileId,
        content,
        cursor,
        updatedBy: {
          id: user._id,
          name: user.name,
          role: user.role
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      socket.emit('code:error', { message: error.message });
    }
  });

  /**
   * 4. Cursor Movement Tracking
   */
  socket.on('code:cursor', ({ taskId, fileId, position }) => {
    if (!taskId) return;
    socket.to(`task:${taskId}`).emit('code:cursor', {
      fileId,
      position,
      user: {
        id: user._id,
        name: user.name,
        avatar: user.avatar
      }
    });
  });

  /**
   * 5. Active File Switch in Workspace
   */
  socket.on('code:fileChange', ({ taskId, currentFile }) => {
    if (!taskId) return;
    updatePresence(taskId, socket.id, { currentFile });
    broadcastPresence(io, taskId);
  });

  /**
   * 6. Typing Indicators
   */
  socket.on('code:typing', ({ taskId, fileId }) => {
    if (!taskId) return;
    socket.to(`task:${taskId}`).emit('code:typing', {
      fileId,
      user: {
        id: user._id,
        name: user.name
      }
    });
  });

  socket.on('code:stopTyping', ({ taskId, fileId }) => {
    if (!taskId) return;
    socket.to(`task:${taskId}`).emit('code:stopTyping', {
      fileId,
      user: {
        id: user._id
      }
    });
  });

  /**
   * 7. Handle Disconnect
   */
  socket.on('disconnect', () => {
    const affectedTasks = clearSocketPresence(socket.id);
    for (const tId of affectedTasks) {
      broadcastPresence(io, tId);
    }
    console.log(`[Socket] User ${user.name} disconnected (Socket ID: ${socket.id})`);
  });
};

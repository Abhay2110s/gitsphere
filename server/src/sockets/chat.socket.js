import mongoose from 'mongoose';
import Message from '../models/Message.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

/**
 * Verify the user can access the project chat room
 * Rule 12: Only project members can participate in project chat
 */
const verifyChatAccess = async (projectId, user) => {
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    return { authorized: false, message: 'Invalid Project ID format' };
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return { authorized: false, message: 'Project not found' };
  }

  if (user.role === 'MANAGER') {
    if (!project.createdBy.equals(user._id)) {
      return { authorized: false, message: 'Access denied to chat in projects you did not create' };
    }
  } else {
    const isMember = project.members.some((m) => m.equals(user._id));
    if (!isMember) {
      return { authorized: false, message: 'Access denied. You are not a member of this project.' };
    }
  }

  return { authorized: true, project };
};

/**
 * Register chat socket event handlers
 *
 * Chat rooms use the naming convention:
 *   Project chat: chat:project:<projectId>
 *   Task chat:    chat:task:<taskId>
 */
export const registerChatHandlers = (io, socket) => {
  const user = socket.user;

  /**
   * 1. Join project or task chat room
   * Event: chat:join
   * Payload: { projectId, taskId? }
   */
  socket.on('chat:join', async ({ projectId, taskId }) => {
    try {
      const { authorized, message } = await verifyChatAccess(projectId, user);
      if (!authorized) {
        return socket.emit('chat:error', { message });
      }

      if (taskId) {
        // Verify task belongs to this project
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
          return socket.emit('chat:error', { message: 'Invalid Task ID format' });
        }
        const task = await Task.findById(taskId);
        if (!task || !task.project.equals(projectId)) {
          return socket.emit('chat:error', { message: 'Task not found in this project' });
        }

        const roomName = `chat:task:${taskId}`;
        socket.join(roomName);
        socket.emit('chat:joined', { room: roomName, type: 'task', taskId });
        console.log(`[Chat] ${user.name} joined task chat room: ${roomName}`);
      } else {
        const roomName = `chat:project:${projectId}`;
        socket.join(roomName);
        socket.emit('chat:joined', { room: roomName, type: 'project', projectId });
        console.log(`[Chat] ${user.name} joined project chat room: ${roomName}`);
      }
    } catch (error) {
      socket.emit('chat:error', { message: error.message });
    }
  });

  /**
   * 2. Leave chat room
   * Event: chat:leave
   * Payload: { projectId, taskId? }
   */
  socket.on('chat:leave', ({ projectId, taskId }) => {
    if (taskId) {
      const roomName = `chat:task:${taskId}`;
      socket.leave(roomName);
      console.log(`[Chat] ${user.name} left task chat room: ${roomName}`);
    } else if (projectId) {
      const roomName = `chat:project:${projectId}`;
      socket.leave(roomName);
      console.log(`[Chat] ${user.name} left project chat room: ${roomName}`);
    }
  });

  /**
   * 3. Send chat message (real-time broadcast)
   * Event: chat:message
   * Payload: { projectId, taskId?, content }
   *
   * This event persists the message to MongoDB and broadcasts to the room.
   * The REST API (POST /api/v1/messages) can also be used; this socket
   * event provides real-time delivery.
   */
  socket.on('chat:message', async ({ projectId, taskId, content }) => {
    try {
      if (!content || !content.trim()) {
        return socket.emit('chat:error', { message: 'Message content cannot be empty' });
      }
      if (content.length > 2000) {
        return socket.emit('chat:error', { message: 'Message cannot exceed 2000 characters' });
      }

      const { authorized, message: errMsg } = await verifyChatAccess(projectId, user);
      if (!authorized) {
        return socket.emit('chat:error', { message: errMsg });
      }

      // Verify task if task-scoped
      if (taskId) {
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
          return socket.emit('chat:error', { message: 'Invalid Task ID format' });
        }
        const task = await Task.findById(taskId);
        if (!task || !task.project.equals(projectId)) {
          return socket.emit('chat:error', { message: 'Task not found in this project' });
        }
      }

      // Persist message
      const newMessage = await Message.create({
        sender: user._id,
        project: projectId,
        task: taskId || null,
        content: content.trim(),
        readBy: [user._id]
      });

      // Populate sender for broadcast
      await newMessage.populate('sender', 'name email avatar role');

      // Determine room and broadcast
      const roomName = taskId
        ? `chat:task:${taskId}`
        : `chat:project:${projectId}`;

      // Broadcast to all room members including sender
      io.to(roomName).emit('chat:message', {
        id: newMessage._id,
        sender: newMessage.sender,
        project: newMessage.project,
        task: newMessage.task,
        content: newMessage.content,
        readBy: newMessage.readBy,
        createdAt: newMessage.createdAt
      });
    } catch (error) {
      socket.emit('chat:error', { message: error.message });
    }
  });

  /**
   * 4. Typing indicator
   * Event: chat:typing
   * Payload: { projectId, taskId? }
   */
  socket.on('chat:typing', ({ projectId, taskId }) => {
    const roomName = taskId
      ? `chat:task:${taskId}`
      : `chat:project:${projectId}`;

    socket.to(roomName).emit('chat:typing', {
      user: {
        id: user._id,
        name: user.name
      }
    });
  });

  /**
   * 5. Stop typing indicator
   * Event: chat:stopTyping
   * Payload: { projectId, taskId? }
   */
  socket.on('chat:stopTyping', ({ projectId, taskId }) => {
    const roomName = taskId
      ? `chat:task:${taskId}`
      : `chat:project:${projectId}`;

    socket.to(roomName).emit('chat:stopTyping', {
      user: {
        id: user._id
      }
    });
  });

  /**
   * 6. Mark messages as read via socket
   * Event: chat:read
   * Payload: { projectId, taskId? }
   */
  socket.on('chat:read', async ({ projectId, taskId }) => {
    try {
      const query = {
        readBy: { $ne: user._id }
      };

      if (taskId) {
        query.task = taskId;
      } else if (projectId) {
        query.project = projectId;
        query.task = null;
      } else {
        return;
      }

      await Message.updateMany(query, {
        $addToSet: { readBy: user._id }
      });

      const roomName = taskId
        ? `chat:task:${taskId}`
        : `chat:project:${projectId}`;

      // Notify room that this user has read messages
      socket.to(roomName).emit('chat:read', {
        user: {
          id: user._id,
          name: user.name
        }
      });
    } catch (error) {
      socket.emit('chat:error', { message: error.message });
    }
  });
};

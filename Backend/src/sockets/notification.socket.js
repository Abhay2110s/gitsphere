/**
 * Notification Socket Handler
 *
 * Each authenticated user automatically joins their personal notification room
 * on socket connection: `user:<userId>`
 *
 * The notification service emits to this room when new notifications are created,
 * enabling real-time delivery without polling.
 *
 * Events emitted TO the client:
 *   notification:new    — A new notification has been created
 *
 * Events received FROM the client:
 *   notification:read   — Client marks a notification as read (optional real-time sync)
 */
export const registerNotificationHandlers = (io, socket) => {
  const user = socket.user;

  // Automatically join the user's personal notification room
  const userRoom = `user:${user._id}`;
  socket.join(userRoom);
  console.log(`[Notification] ${user.name} joined notification room: ${userRoom}`);

  /**
   * Client can notify the server that a notification was read
   * This is optional — the REST API also handles this
   */
  socket.on('notification:read', ({ notificationId }) => {
    // The actual DB update happens via REST API (PATCH /notifications/:id/read)
    // This event just broadcasts to other connected tabs of the same user
    socket.to(userRoom).emit('notification:read', { notificationId });
  });
};

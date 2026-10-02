import { useState, useEffect, useCallback, useRef } from 'react';
import { messagesApi } from '../api/messages.api';

export function useUnreadMessages(isMessagesRouteActive = false) {
  const [unreadCount, setUnreadCount] = useState(0);
  const activeRef = useRef(isMessagesRouteActive);
  activeRef.current = isMessagesRouteActive;

  const fetchUnread = useCallback(async () => {
    if (activeRef.current) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await messagesApi.getUnreadCount();
      const count = typeof res === 'number' ? res : (res?.unreadCount ?? 0);
      if (!activeRef.current) {
        setUnreadCount(count);
      }
    } catch {
      // Ignore background fetch errors
    }
  }, []);

  useEffect(() => {
    if (isMessagesRouteActive) {
      setUnreadCount(0);
      messagesApi.markAsRead().catch(() => {});
      return;
    }

    fetchUnread();

    // Poll every 3.5 seconds for new incoming messages while not on messages page
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !activeRef.current) {
        fetchUnread();
      }
    }, 3500);

    const handleMessagesRead = () => {
      setUnreadCount(0);
    };

    const handleNewMessage = () => {
      if (!activeRef.current) {
        fetchUnread();
      }
    };

    window.addEventListener('gitsphere:messages-read', handleMessagesRead);
    window.addEventListener('gitsphere:new-message', handleNewMessage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('gitsphere:messages-read', handleMessagesRead);
      window.removeEventListener('gitsphere:new-message', handleNewMessage);
    };
  }, [fetchUnread, isMessagesRouteActive]);

  const markAllRead = useCallback(async () => {
    setUnreadCount(0);
    window.dispatchEvent(new CustomEvent('gitsphere:messages-read'));
    try {
      await messagesApi.markAsRead();
    } catch {
      // ignore
    }
  }, []);

  return {
    unreadCount: isMessagesRouteActive ? 0 : unreadCount,
    hasUnread: !isMessagesRouteActive && unreadCount > 0,
    markAllRead,
    refetch: fetchUnread,
  };
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { messagesApi } from '../api/messages.api';

export function useMessages(channelType = 'project', channelId = null) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollTimerRef = useRef(null);

  const fetchMessages = useCallback(async (id = channelId, isBackground = false) => {
    const targetId = id || channelId;
    if (!targetId) {
      setMessages([]);
      return;
    }
    if (!isBackground) {
      setLoading(true);
      setError(null);
    }
    try {
      let res;
      if (channelType === 'project') {
        res = await messagesApi.getProjectMessages(targetId);
      } else {
        res = await messagesApi.getTaskMessages(targetId);
      }
      const newMessages = Array.isArray(res) ? res : res?.messages || [];
      setMessages(newMessages);

      // Auto-mark unread messages as read
      const unreadIds = newMessages.map((m) => m._id || m.id).filter(Boolean);
      if (unreadIds.length > 0) {
        messagesApi.markAsRead(unreadIds).catch(() => {});
      }
    } catch (err) {
      if (!isBackground) {
        setError(err);
        setMessages([]);
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  }, [channelType, channelId]);

  useEffect(() => {
    if (!channelId) {
      setMessages([]);
      return;
    }

    fetchMessages(channelId, false);

    // Background polling every 4 seconds for real-time manager-developer chat updates
    pollTimerRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchMessages(channelId, true);
      }
    }, 4000);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [channelId, channelType, fetchMessages]);

  const sendMessage = async (content) => {
    if (!channelId || !content.trim()) return;
    const payload = {
      content: content.trim(),
      ...(channelType === 'project' ? { projectId: channelId } : { taskId: channelId }),
    };

    const newMsg = await messagesApi.sendMessage(payload);
    if (newMsg) {
      setMessages((prev) => {
        // Prevent duplicate append if poll already grabbed it
        const id = newMsg._id || newMsg.id;
        if (prev.some((m) => (m._id || m.id) === id)) return prev;
        return [...prev, newMsg];
      });
    }
    return newMsg;
  };

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages,
    sendMessage,
  };
}

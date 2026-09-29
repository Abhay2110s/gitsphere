import { useState, useEffect, useCallback } from 'react';
import { messagesApi } from '../api/messages.api';

export function useMessages(channelType = 'project', channelId = null) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async (id = channelId) => {
    if (!id) {
      setMessages([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      let res;
      if (channelType === 'project') {
        res = await messagesApi.getProjectMessages(id);
      } else {
        res = await messagesApi.getTaskMessages(id);
      }
      setMessages(Array.isArray(res) ? res : res?.messages || []);
    } catch (err) {
      setError(err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [channelType, channelId]);

  useEffect(() => {
    if (channelId) {
      fetchMessages(channelId);
    }
  }, [channelId, fetchMessages]);

  const sendMessage = async (content) => {
    if (!channelId || !content.trim()) return;
    const payload = {
      content: content.trim(),
      ...(channelType === 'project' ? { projectId: channelId } : { taskId: channelId }),
    };

    const newMsg = await messagesApi.sendMessage(payload);
    // Append to conversation only after successful backend response
    if (newMsg) {
      setMessages((prev) => [...prev, newMsg]);
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

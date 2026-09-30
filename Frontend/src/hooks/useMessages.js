import { useState, useEffect, useCallback } from 'react';
import { messagesApi } from '../api/messages.api';

export function useMessages(channelType = 'project', channelId = null) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async (id = channelId) => {
    const targetId = id || channelId;
    if (!targetId) {
      setMessages([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let res;
      if (channelType === 'project') {
        res = await messagesApi.getProjectMessages(targetId);
      } else {
        res = await messagesApi.getTaskMessages(targetId);
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
    if (!channelId) {
      return;
    }
    let ignore = false;
    const fetcher = channelType === 'project'
      ? messagesApi.getProjectMessages(channelId)
      : messagesApi.getTaskMessages(channelId);

    fetcher
      .then((res) => {
        if (!ignore) {
          setMessages(Array.isArray(res) ? res : res?.messages || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err);
          setMessages([]);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [channelId, channelType]);

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

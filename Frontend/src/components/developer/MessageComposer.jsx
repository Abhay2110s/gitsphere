import React, { useState } from 'react';
import { ArrowRightIcon } from '../common/Icons';

export default function MessageComposer({ onSend, disabled = false }) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || sending || disabled) return;

    try {
      setSending(true);
      setError(null);
      await onSend(content.trim());
      setContent('');
    } catch (err) {
      setError(err?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-[#1C1C1C] bg-[#0A0A0A]">
      {error && (
        <div className="text-[10px] font-mono text-red-400 mb-2 px-2">
          {error}
        </div>
      )}
      <div className="flex items-center gap-2">
        <textarea
          rows={1}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || sending}
          placeholder={disabled ? 'Select a channel to chat' : 'Write a message... (Press Enter to send)'}
          className="flex-1 bg-[#141414] border border-[#262626] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#555555] outline-none focus:border-white transition-colors resize-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || sending || !content.trim()}
          className="p-2.5 rounded-xl bg-white text-black hover:bg-[#E5E5E5] disabled:opacity-30 disabled:hover:bg-white transition-all cursor-pointer shrink-0"
        >
          {sending ? (
            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin block" />
          ) : (
            <ArrowRightIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </form>
  );
}

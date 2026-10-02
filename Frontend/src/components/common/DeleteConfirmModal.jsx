import React from 'react';
import { CloseIcon, TrashIcon, AlertTriangleIcon } from './Icons';

export default function DeleteConfirmModal({
  isOpen,
  title = 'Delete Task',
  message = 'Are you sure you want to delete this task? This action cannot be undone.',
  itemName,
  confirmLabel = 'Delete Task',
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md rounded-2xl border border-[#262626] bg-[#0E0E0E] shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-[#1C1C1C]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
              <TrashIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {title}
              </h3>
              <p className="text-[11px] font-mono text-[#777777]">
                Permanent action warning
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-1 rounded-lg text-[#666666] hover:text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer disabled:opacity-50"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3.5">
          <div className="flex items-start gap-2.5 text-xs text-[#CCCCCC] leading-relaxed">
            <AlertTriangleIcon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p>{message}</p>
              {itemName && (
                <div className="mt-2 p-2.5 rounded-lg border border-[#222222] bg-[#141414] font-mono text-xs text-white font-semibold truncate">
                  {itemName}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-[#1C1C1C] bg-[#0A0A0A]">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-lg border border-[#2A2A2A] text-xs font-mono text-[#CCCCCC] hover:text-white hover:bg-[#161616] transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <TrashIcon className="w-3.5 h-3.5" />
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

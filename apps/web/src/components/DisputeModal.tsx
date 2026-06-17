"use client";

import { useEffect, useState } from "react";

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (disputeType: string, disputeComment: string) => void;
  title: string;
  description: string;
}

export function DisputeModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description
}: DisputeModalProps) {
  const [disputeType, setDisputeType] = useState("NOT_RECEIVED");
  const [disputeComment, setDisputeComment] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDisputeType("NOT_RECEIVED");
      setDisputeComment("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-danger-bg text-danger">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h3 className="text-lg font-bold text-ink leading-tight">{title}</h3>
              <p className="mt-2 text-sm text-muted">{description}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Dispute Reason</label>
              <select 
                value={disputeType}
                onChange={(e) => setDisputeType(e.target.value)}
                className="cp-input w-full bg-surface"
              >
                <option value="NOT_RECEIVED">Payment Not Received</option>
                <option value="LESS_AMOUNT">Amount is Less than Expected</option>
                <option value="MORE_AMOUNT">Amount is More than Expected</option>
                <option value="OTHER">Other Reason</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Additional Comments (Optional)</label>
              <textarea 
                value={disputeComment}
                onChange={(e) => setDisputeComment(e.target.value)}
                placeholder="Provide more details about the dispute..."
                className="cp-input w-full resize-none bg-surface"
                rows={3}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-surface-2 px-6 py-4 flex items-center justify-end gap-3 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate hover:text-ink transition-colors rounded-lg hover:bg-surface-3"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(disputeType, disputeComment);
              onClose();
            }}
            className="px-4 py-2 text-sm font-bold text-white bg-danger hover:bg-red-700 rounded-lg shadow-sm transition-colors"
          >
            Submit Dispute
          </button>
        </div>
      </div>
    </div>
  );
}

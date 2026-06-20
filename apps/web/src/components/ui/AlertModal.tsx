import React from 'react';

export type AlertType = 'success' | 'error';

interface AlertModalProps {
  isOpen: boolean;
  message: string;
  type?: AlertType;
  onClose: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({ isOpen, message, type = 'error', onClose }) => {
  if (!isOpen) return null;

  const isError = type === 'error';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-surface rounded-xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200 border border-border">
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 border ${isError ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
          {isError ? (
            <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <h3 className="text-lg font-bold text-ink mb-2">
          {isError ? 'Action Failed' : 'Success'}
        </h3>
        <p className="text-sm text-slate mb-6">{message}</p>
        <button onClick={onClose} className="w-full bg-ink hover:bg-ink/90 text-surface font-bold rounded-lg text-sm py-3 transition-colors shadow-sm">
          Acknowledge
        </button>
      </div>
    </div>
  );
};

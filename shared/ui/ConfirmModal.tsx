import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onConfirm, onCancel, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100]" aria-modal="true" role="dialog">
      <div className="bg-black/10 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-purple-500/10 p-6 sm:p-8 w-full max-w-md m-4 transform transition-all duration-300">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">{title}</h2>
        <p className="text-slate-300 text-sm sm:text-base mb-8">{message}</p>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
          <button
            onClick={onCancel}
            className="border border-slate-700 text-slate-300 font-semibold py-2 px-5 rounded-lg hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-colors duration-300"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white font-semibold py-2 px-5 rounded-lg shadow-lg shadow-red-900/30 hover:bg-red-700 hover:shadow-red-800/40 transition-all duration-300"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

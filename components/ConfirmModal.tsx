import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onConfirm, onCancel, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100]" aria-modal="true" role="dialog">
      {/* Inspired by landing page cards */}
      <div className="bg-gradient-to-br from-slate-900/80 via-black/60 to-indigo-900/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-purple-500/10 p-6 sm:p-8 w-full max-w-md m-4 transform transition-all">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{title}</h2>
        <p className="text-slate-300 text-base sm:text-lg mb-8">{message}</p>
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <button
            onClick={onCancel}
            className="font-semibold py-2 px-5 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors duration-300"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold py-2 px-5 rounded-lg shadow-md shadow-red-500/30 hover:shadow-lg hover:shadow-red-500/40 hover:scale-105 transition-all duration-300"
          >
            Sair Mesmo Assim
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

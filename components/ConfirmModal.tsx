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
      <div className="bg-slate-900/90 border border-white/20 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md m-4 transform transition-all">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">{title}</h2>
        <p className="text-slate-300 text-sm sm:text-base mb-6 sm:mb-8">{message}</p>
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <button
            onClick={onCancel}
            className="border border-slate-600 text-slate-300 font-semibold py-2 px-5 rounded-lg hover:bg-slate-700/50 hover:text-white hover:border-slate-500 transition-colors duration-300"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-red-700 transition-colors duration-300"
          >
            Sair Mesmo Assim
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

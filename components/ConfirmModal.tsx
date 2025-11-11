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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md m-4 transform transition-all">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">{title}</h2>
        <p className="text-slate-600 mb-8">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="border-2 border-slate-300 text-slate-700 font-semibold py-2 px-5 rounded-lg hover:bg-slate-100 transition-colors duration-300"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-red-600 transition-colors duration-300"
          >
            Sair Mesmo Assim
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

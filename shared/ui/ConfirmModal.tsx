import React from 'react';
import EliteModal from './EliteModal';
import EliteButton from '@/shared/ui/EliteButton';


interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
    isOpen, 
    onConfirm, 
    onCancel, 
    title, 
    message, 
    confirmText = 'Confirmar', 
    cancelText = 'Cancelar' 
}) => {
  return (
    <EliteModal
      isOpen={isOpen}
      title={title}
      subtitle={message}
      orbColor="primary"
      footer={
        <div className="flex flex-col gap-3">
          <EliteButton variant="primary" onClick={onConfirm} fullWidth title={confirmText} />
          <EliteButton variant="secondary" onClick={onCancel} fullWidth title={cancelText} />
        </div>
      }
    >
      {null}
    </EliteModal>
  );
};

export default ConfirmModal;

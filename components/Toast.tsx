import React, { useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';

const style = `
@keyframes toastIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes toastOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}
.animate-toastIn { animation: toastIn 0.3s ease-out forwards; }
.animate-toastOut { animation: toastOut 0.3s ease-in forwards; }
`;

interface ToastMessageProps {
  id: string;
  message: string;
  type: 'success' | 'error';
  onDismiss: (id: string) => void;
}

const ToastMessage: React.FC<ToastMessageProps> = ({ id, message, type, onDismiss }) => {
  const [isExiting, setIsExiting] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(id), 300); // Wait for animation to finish
    }, 3000);

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const handleDismiss = () => {
     setIsExiting(true);
     setTimeout(() => onDismiss(id), 300);
  }

  const baseClasses = 'relative w-full max-w-sm p-4 rounded-xl shadow-lg flex items-center gap-4 text-white';
  const typeClasses = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`${baseClasses} ${typeClasses} ${isExiting ? 'animate-toastOut' : 'animate-toastIn'}`}>
        <div className="flex-shrink-0">
            {type === 'success' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            )}
        </div>
        <p className="flex-grow font-medium">{message}</p>
        <button onClick={handleDismiss} className="p-1 rounded-full hover:bg-white/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
    </div>
  );
};


const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useNotification();
    if (toasts.length === 0) return null;

    return (
        <>
        <style>{style}</style>
        <div className="fixed top-20 right-4 z-[200] space-y-3">
            {toasts.map((toast) => (
                <ToastMessage
                    key={toast.id}
                    id={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onDismiss={removeToast}
                />
            ))}
        </div>
        </>
    );
};

export default ToastContainer;

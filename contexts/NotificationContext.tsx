import React, { createContext, useState, useCallback, useContext } from 'react';

const simpleUuid = () => 'id-' + Math.random().toString(36).substr(2, 9);

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface NotificationContextType {
  addToast: (message: string, type: 'success' | 'error') => void;
  removeToast: (id: string) => void;
  toasts: ToastMessage[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = simpleUuid();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addToast, removeToast, toasts }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

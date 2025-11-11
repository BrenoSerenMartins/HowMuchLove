import React, { Suspense } from 'react';
import { NavigationProvider } from './contexts/NavigationContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useAuth } from './hooks/useAuth';
import { useNavigate } from './hooks/useNavigate';

import ConfirmModal from './components/ConfirmModal';
import LoadingSpinner from './components/LoadingSpinner';
import ToastContainer from './components/Toast';

// Lazy load pages
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const StoryPage = React.lazy(() => import('./pages/StoryPage'));
const PaymentSuccessPage = React.lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentFailurePage = React.lazy(() => import('./pages/PaymentFailurePage'));
const PaymentPendingPage = React.lazy(() => import('./pages/PaymentPendingPage'));

const App: React.FC = () => {
  return (
    <NavigationProvider>
      <AuthProvider>
        <NotificationProvider>
          <Main />
        </NotificationProvider>
      </AuthProvider>
    </NavigationProvider>
  );
};

const Main: React.FC = () => {
  const {
    route,
    navigate,
    isConfirmationModalOpen,
    confirmNavigation,
    cancelNavigation
  } = useNavigate();
  const { user, isLoading } = useAuth(); // Use isLoading from AuthContext

  React.useEffect(() => {
    if (isLoading) return; // Wait for auth loading to complete

    const protectedRoutes = ['/dashboard', '/settings'];
    const isProtectedRoute = protectedRoutes.some(pr => route.startsWith(pr));
    const publicOnlyRoutes = ['/login', '/register'];
    const isPublicOnlyRoute = publicOnlyRoutes.includes(route);

    if (!user && isProtectedRoute) {
      navigate('/');
    } else if (user && isPublicOnlyRoute) {
      navigate('/dashboard');
    }
  }, [route, user, isLoading, navigate]);

  const loadingFallback = (
    <div className="min-h-screen flex items-center justify-center bg-animated-lights">
      <LoadingSpinner />
    </div>
  );

  if (isLoading) { // Use isLoading from AuthContext
    return loadingFallback;
  }

  let pageComponent;
  
  if (route.startsWith('/story/')) {
    pageComponent = <StoryPage />;
  } else {
    switch (route) {
      case '/login': pageComponent = <LoginPage />; break;
      case '/register': pageComponent = <RegisterPage />; break;
      case '/dashboard': pageComponent = user ? <DashboardPage /> : <HomePage />; break;
      case '/settings': pageComponent = user ? <SettingsPage /> : <HomePage />; break;
      case '/payment-success': pageComponent = <PaymentSuccessPage />; break;
      case '/payment-failure': pageComponent = <PaymentFailurePage />; break;
      case '/payment-pending': pageComponent = <PaymentPendingPage />; break;
      case '/':
      default: pageComponent = <HomePage />; break;
    }
  }

  return (
    <>
      <ToastContainer />
      <ConfirmModal
        isOpen={isConfirmationModalOpen}
        onConfirm={confirmNavigation}
        onCancel={cancelNavigation}
        title="Sair sem salvar?"
        message="Você tem alterações não salvas. Se sair agora, perderá todo o seu progresso. Deseja continuar?"
      />
      <Suspense fallback={loadingFallback}>
        {pageComponent}
      </Suspense>
    </>
  );
};

export default App;

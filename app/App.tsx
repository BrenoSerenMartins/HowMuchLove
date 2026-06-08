import React, { Suspense } from 'react';
import { NavigationProvider } from './providers/NavigationProvider';
import { AuthProvider } from './providers/AuthProvider';
import { NotificationProvider } from './providers/NotificationProvider';
import { useAuth } from './hooks/useAuth';
import { useNavigate } from './hooks/useNavigate';

import ConfirmModal from '../shared/ui/ConfirmModal';
import LoadingSpinner from '../shared/ui/LoadingSpinner';
import ToastContainer from '../shared/ui/Toast';
import Header from '../shared/ui/Header';
import Footer from '../shared/ui/Footer';
import BottomNavBar from '../shared/ui/BottomNavBar';

const HomePage = React.lazy(() => import('../marketing/landing/Page'));
const LoginPage = React.lazy(() => import('../auth/login/Page'));
const RegisterPage = React.lazy(() => import('../auth/register/Page'));
const DashboardPage = React.lazy(() => import('../customer/dashboard/Page'));
const SettingsPage = React.lazy(() => import('../customer/settings/Page'));
const StoryPage = React.lazy(() => import('../story/public/Page'));
const PaymentSuccessPage = React.lazy(() => import('../customer/billing/success/Page'));
const PaymentFailurePage = React.lazy(() => import('../customer/billing/failure/Page'));
const PaymentPendingPage = React.lazy(() => import('../customer/billing/pending/Page'));

const shellBackgroundImage = '/images/main-background.avif';

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
    cancelNavigation,
    isPreviewMode,
  } = useNavigate();
  const { user, isLoading, logout, performLogout, showLogoutConfirm, setShowLogoutConfirm } = useAuth();

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  React.useEffect(() => {
    if (isLoading) return;

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
    <div className="min-h-screen flex flex-col text-white relative">
      <div className="fixed inset-0 z-[-2]">
        <img
          src={shellBackgroundImage}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
          style={{
            filter: 'blur(15px) brightness(0.7)',
            transform: 'scale(1.1)',
          }}
        />
      </div>
      <div className="fixed inset-0 z-[-1] lights-container"></div>
      <main className="flex-grow flex items-center justify-center">
        <LoadingSpinner />
      </main>
    </div>
  );

  if (isLoading) {
    return loadingFallback;
  }

  if (route.startsWith('/story/')) {
    return (
      <Suspense fallback={loadingFallback}>
        <StoryPage />
      </Suspense>
    );
  }

  let pageComponent;
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

  const showHeaderFooter = !isPreviewMode;
  const isProtected = user && (route === '/dashboard' || route === '/settings');
  const isPublicHome = !user && route === '/';
  const showBottomNavBar = (isProtected || isPublicHome) && !isPreviewMode;

  return (
    <div className="min-h-screen flex flex-col text-white relative">
      <style>{`
          @keyframes fade-in-slide-up {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-slide-up {
              animation: fade-in-slide-up 0.7s ease-out forwards;
              opacity: 0;
          }
          .hide-scrollbar::-webkit-scrollbar {
              display: none;
          }
          .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
          }
      `}</style>

      <div className="fixed inset-0 z-[-2]">
        <img
          src={shellBackgroundImage}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
          style={{
            filter: 'blur(15px) brightness(0.7)',
            transform: 'scale(1.1)',
          }}
        />
      </div>
      <div className="fixed inset-0 z-[-1] lights-container"></div>

      {showHeaderFooter && <Header onLogoutRequest={logout} handleScrollTo={handleScrollTo} />}

      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 pb-20 md:pb-12">
        <ConfirmModal
          isOpen={isConfirmationModalOpen}
          onConfirm={confirmNavigation}
          onCancel={cancelNavigation}
          title="Sair sem salvar?"
          message="Você tem alterações não salvas. Se sair agora, perderá todo o seu progresso. Deseja continuar?"
        />
        <ConfirmModal
          isOpen={showLogoutConfirm}
          onConfirm={performLogout}
          onCancel={() => setShowLogoutConfirm(false)}
          title="Confirmar Saída"
          message="Tem certeza que deseja sair da sua conta?"
        />
        <Suspense fallback={loadingFallback}>
          {pageComponent}
        </Suspense>
      </main>

      {showHeaderFooter && <Footer />}
      {showBottomNavBar && <BottomNavBar onMenuOpen={() => {}} onLogoutRequest={logout} />}
      <ToastContainer className="z-50" />
    </div>
  );
};

export default App;

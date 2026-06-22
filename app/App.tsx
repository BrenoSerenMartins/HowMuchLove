import React, { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
const ForgotPasswordPage = React.lazy(() => import('../auth/forgot-password/Page'));
const ResetPasswordPage = React.lazy(() => import('../auth/reset-password/Page'));
const TermsPage = React.lazy(() => import('../marketing/legal/terms/Page'));
const PrivacyPage = React.lazy(() => import('../marketing/legal/privacy/Page'));
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
          <div className="bg-grain" />
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
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const isHeroPage = route === '/' || route === '/dashboard';
    if (!isHeroPage) {
        setScrolled(true);
        return;
    }

    const handleScroll = () => {
      const shouldBeScrolled = window.scrollY > 50; // Reveal very early but not at top
      if (shouldBeScrolled !== scrolled) {
        setScrolled(shouldBeScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [route, scrolled]);

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
    const publicOnlyRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    const isPublicOnlyRoute = publicOnlyRoutes.includes(route);

    if (!user && isProtectedRoute) {
      navigate('/');
    } else if (user && isPublicOnlyRoute) {
      navigate('/dashboard');
    }
  }, [route, user, isLoading, navigate]);

  const loadingFallback = (
    <div className="min-h-screen flex flex-col text-white relative bg-[#050505]">
      <div className="fixed inset-0 z-[-2] bg-[#050505]">
        <img
          src={shellBackgroundImage}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center opacity-20"
          style={{
            filter: 'blur(40px) brightness(0.3)',
            transform: 'scale(1.2)',
          }}
        />
      </div>
      <div className="fixed inset-0 z-[-1] lights-container opacity-40"></div>
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
    case '/forgot-password': pageComponent = <ForgotPasswordPage />; break;
    case '/reset-password': pageComponent = <ResetPasswordPage />; break;
    case '/terms': pageComponent = <TermsPage />; break;
    case '/privacy': pageComponent = <PrivacyPage />; break;
    case '/dashboard': pageComponent = user ? <DashboardPage /> : <HomePage />; break;
    case '/settings': pageComponent = user ? <SettingsPage /> : <HomePage />; break;
    case '/payment-success': pageComponent = <PaymentSuccessPage />; break;
    case '/payment-failure': pageComponent = <PaymentFailurePage />; break;
    case '/payment-pending': pageComponent = <PaymentPendingPage />; break;
    case '/':
    default: pageComponent = <HomePage />; break;
  }

  const showHeaderFooter = !isPreviewMode && !['/login', '/register', '/forgot-password', '/reset-password'].includes(route);
  const isProtected = user && (route === '/dashboard' || route === '/settings');
  const isPublicHome = !user && route === '/';
  const showBottomNavBar = (isProtected || isPublicHome) && !isPreviewMode;
  const isHomePage = route === '/';

  return (
    <div className="min-h-screen flex flex-col text-white relative selection:bg-primary selection:text-white overflow-x-hidden">
      <div className="fixed inset-0 z-[-2] bg-[#050505]">
        <img
          src={shellBackgroundImage}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center opacity-30"
          style={{
            filter: 'blur(50px) brightness(0.4)',
            transform: 'scale(1.3)',
          }}
        />
      </div>
      <div className="fixed inset-0 z-[-1] lights-container opacity-50"></div>

      <AnimatePresence>
        {showHeaderFooter && ((isHomePage || route === '/dashboard') ? scrolled : true) && (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="fixed top-0 left-0 right-0 z-[100] bg-transparent pointer-events-none"
            >
                <Header onLogoutRequest={logout} handleScrollTo={handleScrollTo} />
            </motion.div>
        )}
      </AnimatePresence>

      <main className={`flex-grow relative z-10 ${isHomePage ? '' : ''}`}>
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
        
        <AnimatePresence mode="wait">
          <motion.div
            key={route}
            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Suspense fallback={loadingFallback}>
              {pageComponent}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {showHeaderFooter && <Footer />}
      {showBottomNavBar && <BottomNavBar onMenuOpen={() => {}} onLogoutRequest={logout} />}
      <ToastContainer className="z-50" />
    </div>
  );
};

export default App;

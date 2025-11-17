import React, { Suspense } from 'react';
import { NavigationProvider } from './contexts/NavigationContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useAuth } from './hooks/useAuth';
import { useNavigate } from './hooks/useNavigate';

import ConfirmModal from './components/ConfirmModal';
import LoadingSpinner from './components/LoadingSpinner';
import ToastContainer from './components/Toast';
import Header from './components/Header'; // Import Header
import Footer from './components/Footer'; // Import Footer
import BottomNavBar from './components/BottomNavBar'; // Import BottomNavBar

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
    cancelNavigation,
    isPreviewMode // Destructure new state
  } = useNavigate();
  const { user, isLoading, logout, performLogout, showLogoutConfirm, setShowLogoutConfirm } = useAuth(); // Destructure new logout states and functions

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
    <div className="min-h-screen flex flex-col text-white relative">
      {/* Render the same global background as the main layout */}
      <div 
          className="fixed inset-0 z-[-2]"
          style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(15px) brightness(0.7)',
              transform: 'scale(1.1)',
          }}
      />
      <div className="fixed inset-0 z-[-1] lights-container"></div>
      <main className="flex-grow flex items-center justify-center">
        <LoadingSpinner />
      </main>
    </div>
  );

  if (isLoading) { // Use isLoading from AuthContext
    return loadingFallback;
  }

  // Special case for StoryPage to have a completely custom layout
  if (route.startsWith('/story/')) {
    return (
      <Suspense fallback={loadingFallback}>
        <StoryPage />
      </Suspense>
    );
  }

  // Determine the page component for the main layout
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

  // Determine if the bottom nav should be shown
  const showHeaderFooter = !isPreviewMode; // Hide header/footer in preview mode
  const isProtected = user && (route === '/dashboard' || route === '/settings');
  const isPublicHome = !user && route === '/';
  const showBottomNavBar = (isProtected || isPublicHome) && !isPreviewMode; // Hide bottom nav in preview mode
  const backgroundImageUrl = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Default background

  return (
    <div className="min-h-screen flex flex-col text-white relative">
      {/* Global Styles */}
      <style>{`
          @keyframes fade-in-slide-up {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-slide-up {
              animation: fade-in-slide-up 0.7s ease-out forwards;
              opacity: 0; /* Start hidden */
          }
          /* Hide scrollbar for Chrome, Safari and Opera */
          .hide-scrollbar::-webkit-scrollbar {
              display: none;
          }
          /* Hide scrollbar for IE, Edge and Firefox */
          .hide-scrollbar {
              -ms-overflow-style: none;  /* IE and Edge */
              scrollbar-width: none;  /* Firefox */
          }
      `}</style>
      
      {/* Global Background */}
      <div 
          className="fixed inset-0 z-[-2]"
          style={{
              backgroundImage: `url(${backgroundImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(15px) brightness(0.7)',
              transform: 'scale(1.1)',
          }}
      />
      <div className="fixed inset-0 z-[-1] lights-container"></div>

      {showHeaderFooter && <Header onLogoutRequest={logout} handleScrollTo={handleScrollTo} />}
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 pb-20 md:pb-12"> {/* Added pb-20 for bottom nav */}
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
      <ToastContainer className="z-50" /> {/* Moved ToastContainer here with high z-index */}
    </div>
  );
};

export default App;
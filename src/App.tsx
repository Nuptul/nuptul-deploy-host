import { useState, useEffect, Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import PerformanceMonitor from "./components/PerformanceMonitor";
import { ErrorBoundary, RouteErrorBoundary } from "./components/error/ErrorBoundary";
import { logger } from "./utils/logger";
import { useGlobalBackground } from "./hooks/useGlobalBackground";
import RSVPAutoPrompt from "./components/guest/RSVPAutoPrompt";
import { PresenceProvider } from "./hooks/usePresence";
import BackgroundOverlay from "./components/BackgroundOverlay";

// Lazy load heavy components
const VenuePage = lazy(() => import("./pages/VenuePage"));
const VenueDetail = lazy(() => import("./pages/VenueDetail"));
const Social = lazy(() => import("./pages/social/SocialPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const Accommodation = lazy(() => import("./pages/Accommodation"));
const TransportPage = lazy(() => import("./pages/TransportPage"));
const FAQ = lazy(() => import("./pages/FAQ"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const HelpPage = lazy(() => import("./pages/HelpPage"));
const RSVPPage = lazy(() => import("./pages/RSVPPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const CarpoolingPage = lazy(() => import("./pages/CarpoolingPage"));
const AccommodationSharePage = lazy(() => import("./pages/AccommodationSharePage"));

// Lazy load venue pages
const BenEan = lazy(() => import("./pages/venues/BenEan"));
const PrinceOfMereweather = lazy(() => import("./pages/venues/PrinceOfMereweather"));
const NewcastleBeach = lazy(() => import("./pages/venues/NewcastleBeach"));

// Lazy load dashboard components
const DashboardRouter = lazy(() => import("./components/dashboard/DashboardRouter"));
const AdminUsers = lazy(() => import("./pages/dashboard/AdminUsers"));
const AdminPhotos = lazy(() => import("./pages/dashboard/AdminPhotos"));
const AdminRSVPs = lazy(() => import("./pages/dashboard/AdminRSVPs"));
const AdminPhotosDetail = lazy(() => import("./pages/dashboard/AdminPhotosDetail"));
const AdminUserRoles = lazy(() => import("./pages/dashboard/AdminUserRoles"));
const DashboardRedirect = lazy(() => import("./components/DashboardRedirect"));
const AdminEvents = lazy(() => import("./pages/dashboard/AdminEvents"));
const AdminMessages = lazy(() => import("./pages/dashboard/AdminMessages"));
const AdminAnalytics = lazy(() => import("./pages/dashboard/AdminAnalytics"));
const AdminContent = lazy(() => import("./pages/dashboard/AdminContent"));
const AdminBusBooking = lazy(() => import("./pages/dashboard/AdminBusBooking"));
const AdminSystem = lazy(() => import("./pages/dashboard/AdminSystem"));
const GuestDashboard = lazy(() => import("./pages/dashboard/GuestDashboard"));

// Lazy load email confirmation page
const EmailConfirmation = lazy(() => import("./pages/EmailConfirmation"));

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // Initialize global background on app load
  const { loading: backgroundLoading, reloadBackground } = useGlobalBackground();
  
  // Force reload background on mount to ensure proper display
  useEffect(() => {
    reloadBackground();
  }, []);
  
  // Extract current route from pathname
  const currentRoute = location.pathname === '/' || location.pathname === '/home' ? 'home' : location.pathname.slice(1);
  
  const handleNavigate = (route: string) => {
    const path = route === 'home' ? '/home' : `/${route}`;
    navigate(path);
  };

  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/home', '/venue', '/venue/ben-ean', '/venue/prince-of-mereweather', '/venue/newcastle-beach', '/accommodation', '/transport', '/faq', '/help', '/rsvp'];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard');

  useEffect(() => {
    // Only redirect to auth for admin routes or if user is trying to access protected content
    if (!loading && !user && isAdminRoute) {
      navigate('/auth');
    } else if (!loading && user && location.pathname === '/auth') {
      navigate('/');
    }
  }, [user, loading, location.pathname, navigate, isAdminRoute]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy"></div>
      </div>
    );
  }

  // Block access to admin routes without authentication
  if (!user && isAdminRoute) {
    return <AuthPage />;
  }

  if (location.pathname === '/auth') {
    return <AuthPage />;
  }

  // Loading component for suspense fallback
  const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wedding-navy"></div>
    </div>
  );

  return (
    <>
      <BackgroundOverlay />
      <Layout activeRoute={currentRoute} onNavigate={handleNavigate}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/venue" element={<VenuePage />} />
            <Route path="/venue/detail/:venueId" element={<VenueDetail />} />
            <Route path="/venue/ben-ean" element={<BenEan />} />
            <Route path="/venue/prince-of-mereweather" element={<PrinceOfMereweather />} />
            <Route path="/venue/newcastle-beach" element={<NewcastleBeach />} />
            
            <Route path="/events" element={<AdminEvents />} />
            <Route path="/social" element={<Social />} />
            <Route path="/gallery" element={<GalleryPage />} />
            {/* Gift Registry route removed - now redirects externally */}
            <Route path="/accommodation" element={<Accommodation />} />
            <Route path="/transport" element={<TransportPage />} />
            <Route path="/carpooling" element={<CarpoolingPage />} />
            <Route path="/accommodation-share" element={<AccommodationSharePage />} />
            <Route path="/rsvp" element={<RSVPPage />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/confirm" element={<EmailConfirmation />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/chat" element={<ChatPage />} />
            
            {/* Dashboard Admin Routes */}
            <Route path="/admin/dashboard" element={<DashboardRouter />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/dashboard/users" element={<AdminUsers />} />
            <Route path="/dashboard/users/roles" element={<AdminUserRoles />} />
            <Route path="/dashboard/photos" element={<AdminPhotos />} />
            <Route path="/dashboard/photos/:status" element={<AdminPhotosDetail />} />
            <Route path="/dashboard/events" element={<AdminEvents />} />
            <Route path="/dashboard/messages" element={<AdminMessages />} />
            <Route path="/dashboard/analytics" element={<AdminAnalytics />} />
            <Route path="/dashboard/content" element={<AdminContent />} />
            {/* Gift management routes removed - now handled externally */}
            <Route path="/dashboard/rsvps" element={<AdminRSVPs />} />
            <Route path="/dashboard/bus-booking" element={<AdminBusBooking />} />
            <Route path="/dashboard/system" element={<AdminSystem />} />
            
            {/* Guest Dashboard Routes */}
            <Route path="/guest-dashboard" element={<GuestDashboard />} />
            
            {/* Social Routes - now integrated into main social page */}
            
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
      
      {/* RSVP Auto Prompt - shows for logged-in users who haven't RSVPed */}
      {user && !loading && !isAdminRoute && <RSVPAutoPrompt />}
    </>
  );
};

const App = () => (
  <ErrorBoundary 
    onError={(error, errorInfo) => {
      logger.error('Application error', { error: error.message, errorInfo }, 'APP_ERROR');
    }}
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <AuthProvider>
              <PresenceProvider>
                <RouteErrorBoundary>
                  <AppContent />
                </RouteErrorBoundary>
                <PerformanceMonitor />
              </PresenceProvider>
            </AuthProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

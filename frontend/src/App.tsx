import React from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

import Splash from './pages/Splash';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import ProducerDiscovery from './pages/ProducerDiscovery';
import ProducerProfile from './pages/ProducerProfile';
import ProducerDashboard from './pages/ProducerDashboard';
import ProducerBrandSetup from './pages/ProducerBrandSetup';
import OrderHistory from './pages/OrderHistory';
import OrderConfirmation from './pages/OrderConfirmation';
import LiveSessions from './pages/LiveSessions';
import ProductListing from './pages/ProductListing';
import ProfileSetupModal from './components/ProfileSetupModal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
});

// Root layout
const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <ProfileSetupModal />
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </ThemeProvider>
  ),
});

// Splash
const splashRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/splash',
  component: Splash,
});

// Home
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
  beforeLoad: () => {
    if (!sessionStorage.getItem('splashShown')) {
      throw redirect({ to: '/splash' });
    }
  },
});

// Products listing
const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  component: ProductListing,
});

// Product detail - keep old param name for compatibility
const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products/$productId',
  component: ProductDetail,
});

// Discover producers
const discoverRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/discover',
  component: ProducerDiscovery,
});

// Producer public profile
const producerProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/producers/$producerId',
  component: ProducerProfile,
});

// Producer Dashboard
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: ProducerDashboard,
});

// Legacy dashboard path
const legacyDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/producer/dashboard',
  component: ProducerDashboard,
});

// Brand Setup
const brandSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/brand-setup',
  component: ProducerBrandSetup,
});

// Orders / My Collection
const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  component: OrderHistory,
});

// Collection alias
const collectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/collection',
  component: OrderHistory,
});

// Order Confirmation - keep old param name for compatibility
const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order-confirmation/$orderId',
  component: OrderConfirmation,
});

// Live Sessions
const liveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/live',
  component: LiveSessions,
});

// Legacy live-sessions path
const liveSessionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/live-sessions',
  component: LiveSessions,
});

const routeTree = rootRoute.addChildren([
  splashRoute,
  homeRoute,
  productsRoute,
  productDetailRoute,
  discoverRoute,
  producerProfileRoute,
  dashboardRoute,
  legacyDashboardRoute,
  brandSetupRoute,
  ordersRoute,
  collectionRoute,
  orderConfirmationRoute,
  liveRoute,
  liveSessionsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}

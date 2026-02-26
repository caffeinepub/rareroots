import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import Splash from "./pages/Splash";
import Home from "./pages/Home";
import ProducerDiscovery from "./pages/ProducerDiscovery";
import ProducerProfile from "./pages/ProducerProfile";
import ProductDetail from "./pages/ProductDetail";
import ProductListing from "./pages/ProductListing";
import ProducerDashboard from "./pages/ProducerDashboard";
import ProducerBrandSetup from "./pages/ProducerBrandSetup";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderHistory from "./pages/OrderHistory";
import Admin from "./pages/Admin";
import LiveSessions from "./pages/LiveSessions";
import ProfileSetupModal from "./components/ProfileSetupModal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function RootLayout() {
  return (
    <>
      <ProfileSetupModal />
      <Outlet />
      <Toaster />
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const splashRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Splash,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/home",
  component: Home,
});

const discoveryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/discover",
  component: ProducerDiscovery,
});

const producerProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/producers/$producerId",
  component: ProducerProfile,
});

const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products/$productId",
  component: ProductDetail,
});

const productListingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products",
  component: ProductListing,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: ProducerDashboard,
});

const brandSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/brand-setup",
  component: ProducerBrandSetup,
});

const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/order-confirmation/$orderId",
  component: OrderConfirmation,
});

const orderHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders",
  component: OrderHistory,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: Admin,
});

const liveSessionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/live-sessions",
  component: LiveSessions,
});

const routeTree = rootRoute.addChildren([
  splashRoute,
  homeRoute,
  discoveryRoute,
  producerProfileRoute,
  productDetailRoute,
  productListingRoute,
  dashboardRoute,
  brandSetupRoute,
  orderConfirmationRoute,
  orderHistoryRoute,
  adminRoute,
  liveSessionsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

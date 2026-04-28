import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import AppLayout from './components/AppLayout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TransactionsPage from './pages/TransactionsPage';
import ExpenseLogPage from './pages/ExpenseLogPage';
import AIInsightsPage from './pages/AIInsightsPage';
import GoalTrackerPage from './pages/GoalTrackerPage';
import FinanceBlogPage from './pages/FinanceBlogPage';
import SettingsPage from './pages/SettingsPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import LoginPage from './pages/LoginPage';

const rootRoute = createRootRoute({
  component: AppLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics',
  component: AnalyticsPage,
});

const transactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transactions',
  component: TransactionsPage,
});

const expenseLogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/expense-log',
  component: ExpenseLogPage,
});

const aiInsightsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ai-insights',
  component: AIInsightsPage,
});

const goalTrackerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/goal-tracker',
  component: GoalTrackerPage,
});

const financeBlogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/finance-blog',
  component: FinanceBlogPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  dashboardRoute,
  analyticsRoute,
  transactionsRoute,
  expenseLogRoute,
  aiInsightsRoute,
  goalTrackerRoute,
  financeBlogRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <RouterProvider router={router} />
      {showProfileSetup && <ProfileSetupModal />}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AppContent />
      <Toaster />
    </ThemeProvider>
  );
}

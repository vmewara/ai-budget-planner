import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Home,
  LayoutDashboard,
  TrendingUp,
  Receipt,
  FileText,
  Lightbulb,
  Target,
  BookOpen,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
  { icon: Receipt, label: 'Transactions', path: '/transactions' },
  { icon: FileText, label: 'Expense Log', path: '/expense-log' },
  { icon: Lightbulb, label: 'AI Insights', path: '/ai-insights' },
  { icon: Target, label: 'Goal Tracker', path: '/goal-tracker' },
  { icon: BookOpen, label: 'Finance Blog', path: '/finance-blog' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isHomePage = currentPath === '/';

  if (isHomePage) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
            <h1 className="text-xl font-bold text-primary">FinanceWise AI</h1>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate({ to: item.path });
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

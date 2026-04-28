import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Shield, TrendingUp, Target, Lightbulb } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold text-primary">FinanceWise AI</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              About
            </Button>
            <Button variant="ghost" size="sm">
              Blog
            </Button>
            <Button onClick={() => navigate({ to: '/dashboard' })} className="bg-primary hover:bg-primary/90">
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
              <TrendingUp className="h-4 w-4" />
              Smart Financial Management
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight lg:text-6xl">
              Take Control of Your Finances with{' '}
              <span className="text-primary">AI-Powered Insights</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              FinanceWise AI helps you track expenses, manage budgets, and achieve your financial goals
              with intelligent automation and real-time analytics.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button onClick={() => navigate({ to: '/dashboard' })} size="lg" className="bg-primary hover:bg-primary/90">
                Go to Dashboard
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Everything You Need to Manage Your Money</h2>
            <p className="text-muted-foreground">
              Powerful features designed to make financial management simple and effective
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8 text-primary" />}
              title="Real-Time Expense Tracking"
              description="Track your expenses in real-time and get a clear picture of your spending habits instantly."
            />
            <FeatureCard
              icon={<Lightbulb className="h-8 w-8 text-primary" />}
              title="AI-Powered Budgeting"
              description="Receive automated budget suggestions and insights to help you manage your money more effectively."
            />
            <FeatureCard
              icon={<Target className="h-8 w-8 text-primary" />}
              title="Goal-Based Savings"
              description="Set, track, and achieve your financial goals with our intuitive progress tracking system."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-primary" />}
              title="Secure & Private"
              description="Your data is encrypted and protected. We prioritize your privacy and security."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Transform Your Financial Future?</h2>
          <p className="mb-8 text-muted-foreground">
            Join thousands of users who are already managing their finances smarter with FinanceWise AI
          </p>
          <Button onClick={() => navigate({ to: '/dashboard' })} size="lg" className="bg-primary hover:bg-primary/90">
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                © 2025. Built with love using{' '}
                <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  caffeine.ai
                </a>
              </span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Terms & Conditions
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

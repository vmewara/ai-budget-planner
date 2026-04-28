import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetTransactions } from '../hooks/useQueries';
import { TransactionType } from '../backend';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AIInsightsPage() {
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const { data: transactions = [] } = useGetTransactions();

  const spendingData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date;
    });

    return last30Days.map((date) => {
      const dayStart = new Date(date).setHours(0, 0, 0, 0);
      const dayEnd = new Date(date).setHours(23, 59, 59, 999);

      const dayExpenses = transactions
        .filter((t) => {
          const txDate = Number(t.date) / 1_000_000;
          return txDate >= dayStart && txDate <= dayEnd && t.transactionType === TransactionType.expense;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        date: date.getDate().toString(),
        spending: dayExpenses,
      };
    });
  }, [transactions]);

  const totalSpending = useMemo(() => {
    return transactions
      .filter((t) => t.transactionType === TransactionType.expense)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const averageDaily = useMemo(() => {
    if (spendingData.length === 0) return 0;
    const total = spendingData.reduce((sum, d) => sum + d.spending, 0);
    return total / spendingData.length;
  }, [spendingData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">AI Insights & Predictions</h1>
        <p className="text-muted-foreground">Get smart recommendations from your AI-powered financial advisor.</p>
      </div>

      {/* Time Filter */}
      <div className="flex gap-2">
        {(['daily', 'weekly', 'monthly'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              timeFilter === filter
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Current Spending */}
      <Card>
        <CardHeader>
          <CardTitle>Current Spending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-4xl font-bold">{formatCurrency(totalSpending)}</div>
            <div className="text-sm text-muted-foreground">Average daily: {formatCurrency(averageDaily)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Spending Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Trend</CardTitle>
          <p className="text-sm text-muted-foreground">Your spending pattern over the last 30 days</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={spendingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
              <XAxis dataKey="date" stroke="oklch(var(--muted-foreground))" />
              <YAxis stroke="oklch(var(--muted-foreground))" />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Line type="monotone" dataKey="spending" stroke="oklch(0.696 0.17 162.48)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>AI Risk Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Confidence: Medium</span>
            </div>
            <Badge className="bg-primary hover:bg-primary/90">Risk: Low Spending</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Financial Report */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Financial Report</CardTitle>
          <p className="text-sm text-muted-foreground">Add some expenses or goals to get your first AI-powered insight.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <InsightCard
            icon={<Lightbulb className="h-5 w-5 text-yellow-500" />}
            title="Good spending habits"
            description="Your spending is well-distributed across categories. Keep maintaining this balance."
          />
          <InsightCard
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
            title="Savings opportunity"
            description="Consider setting aside 20% of your income for emergency savings and long-term goals."
          />
          <InsightCard
            icon={<AlertTriangle className="h-5 w-5 text-chart-2" />}
            title="Budget recommendation"
            description="Based on your spending patterns, we recommend a monthly budget of ₹18,755 to maintain financial flexibility."
          />
        </CardContent>
      </Card>
    </div>
  );
}

function InsightCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4 rounded-lg border border-border bg-card p-4">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

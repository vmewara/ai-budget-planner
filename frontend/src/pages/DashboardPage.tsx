import { useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetTransactions, useGetCategoryTotals } from '../hooks/useQueries';
import { TransactionType, Category } from '../backend';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import AddTransactionDialog from '../components/AddTransactionDialog';

const COLORS = {
  [Category.travel]: 'oklch(0.488 0.243 264.376)',
  [Category.food]: 'oklch(0.556 0.15 150)',
  [Category.investment]: 'oklch(0.704 0.191 22.216)',
  [Category.shopping]: 'oklch(0.696 0.17 162.48)',
  [Category.rent]: 'oklch(0.627 0.265 303.9)',
  [Category.utilities]: 'oklch(0.645 0.246 16.439)',
  [Category.health]: 'oklch(0.769 0.188 70.08)',
  [Category.entertainment]: 'oklch(0.488 0.243 264.376)',
  [Category.salary]: 'oklch(0.696 0.17 162.48)',
  [Category.freelance]: 'oklch(0.769 0.188 70.08)',
  [Category.other]: 'oklch(0.556 0 0)',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const { data: transactions = [] } = useGetTransactions();
  const { data: categoryTotals = [] } = useGetCategoryTotals();

  const stats = useMemo(() => {
    const income = transactions
      .filter((t) => t.transactionType === TransactionType.income)
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.transactionType === TransactionType.expense)
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;

    const expensesByCategory = transactions
      .filter((t) => t.transactionType === TransactionType.expense)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<Category, number>);

    const topCategory = Object.entries(expensesByCategory).sort(([, a], [, b]) => b - a)[0];

    return { income, expenses, balance, topCategory: topCategory?.[0] as Category | undefined };
  }, [transactions]);

  const expenseChartData = useMemo(() => {
    const expensesByCategory = transactions
      .filter((t) => t.transactionType === TransactionType.expense)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<Category, number>);

    return Object.entries(expensesByCategory).map(([category, amount]) => ({
      name: category,
      value: amount,
    }));
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const now = Date.now();
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const filtered = transactions.filter((t) => {
      const date = Number(t.date) / 1_000_000;
      return date >= monthAgo;
    });

    const income = filtered
      .filter((t) => t.transactionType === TransactionType.income)
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filtered
      .filter((t) => t.transactionType === TransactionType.expense)
      .reduce((sum, t) => sum + t.amount, 0);
    const savings = income - expenses;

    return [
      { name: 'Expenses', value: expenses, fill: 'oklch(0.704 0.191 22.216)' },
      { name: 'Income', value: income, fill: 'oklch(0.769 0.188 70.08)' },
      { name: 'Savings', value: Math.max(0, savings), fill: 'oklch(0.696 0.17 162.48)' },
    ];
  }, [transactions]);

  const trendData = useMemo(() => {
    const sortedTransactions = [...transactions].sort((a, b) => Number(a.date) - Number(b.date));
    
    const dailyData: Record<string, { balance: number; income: number; expenses: number }> = {};
    let runningBalance = 0;

    sortedTransactions.forEach((t) => {
      const date = new Date(Number(t.date) / 1_000_000);
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { balance: runningBalance, income: 0, expenses: 0 };
      }

      if (t.transactionType === TransactionType.income) {
        runningBalance += t.amount;
        dailyData[dateKey].income += t.amount;
      } else {
        runningBalance -= t.amount;
        dailyData[dateKey].expenses += t.amount;
      }

      dailyData[dateKey].balance = runningBalance;
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      Balance: data.balance,
      Income: data.income,
      Expenses: data.expenses,
    }));
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const categoryName = (cat: string) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Your financial overview at a glance.</p>
        </div>
        <Button onClick={() => setShowAddTransaction(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Current Balance */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Wallet className="h-4 w-4" />
            Current Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="text-4xl font-bold text-primary">{formatCurrency(stats.balance)}</p>
            <p className="text-sm text-muted-foreground">Positive balance • Updates in real-time</p>
          </div>
        </CardContent>
      </Card>

      {/* Time Filter */}
      <div className="flex gap-2">
        {(['daily', 'weekly', 'monthly'] as const).map((filter) => (
          <Button
            key={filter}
            variant={timeFilter === filter ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter(filter)}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.expenses)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.income)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Spending Category</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.topCategory ? categoryName(stats.topCategory) : 'None'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses vs Income by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses vs Income by Category</CardTitle>
          <p className="text-sm text-muted-foreground">Distribution of your transactions across categories</p>
        </CardHeader>
        <CardContent>
          {expenseChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${categoryName(name)}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as Category] || COLORS[Category.other]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              No expense data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Spending & Savings */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Spending & Savings</CardTitle>
          <p className="text-sm text-muted-foreground">Compare your income, expenses, and savings over time</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
              <XAxis dataKey="name" stroke="oklch(var(--muted-foreground))" />
              <YAxis stroke="oklch(var(--muted-foreground))" />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="value" fill="oklch(0.488 0.243 264.376)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Financial Trends Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Trends Over Time</CardTitle>
          <p className="text-sm text-muted-foreground">Track your balance growth and spending patterns</p>
        </CardHeader>
        <CardContent>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
                <XAxis dataKey="date" stroke="oklch(var(--muted-foreground))" />
                <YAxis stroke="oklch(var(--muted-foreground))" />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="Balance" stroke="oklch(0.696 0.17 162.48)" strokeWidth={2} />
                <Line type="monotone" dataKey="Income" stroke="oklch(0.769 0.188 70.08)" strokeWidth={2} />
                <Line type="monotone" dataKey="Expenses" stroke="oklch(0.704 0.191 22.216)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              No transaction data available
            </div>
          )}
        </CardContent>
      </Card>

      <AddTransactionDialog open={showAddTransaction} onOpenChange={setShowAddTransaction} />
    </div>
  );
}

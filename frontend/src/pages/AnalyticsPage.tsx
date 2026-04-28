import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetTransactions } from '../hooks/useQueries';
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

export default function AnalyticsPage() {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const { data: transactions = [] } = useGetTransactions();

  const stats = useMemo(() => {
    const income = transactions
      .filter((t) => t.transactionType === TransactionType.income)
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.transactionType === TransactionType.expense)
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;

    return { income, expenses, balance };
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

  const incomeChartData = useMemo(() => {
    const incomeByCategory = transactions
      .filter((t) => t.transactionType === TransactionType.income)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<Category, number>);

    return Object.entries(incomeByCategory).map(([category, amount]) => ({
      name: category,
      value: amount,
    }));
  }, [transactions]);

  const trendData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date;
    });

    return last30Days.map((date) => {
      const dayStart = new Date(date).setHours(0, 0, 0, 0);
      const dayEnd = new Date(date).setHours(23, 59, 59, 999);

      const dayTransactions = transactions.filter((t) => {
        const txDate = Number(t.date) / 1_000_000;
        return txDate >= dayStart && txDate <= dayEnd;
      });

      const income = dayTransactions
        .filter((t) => t.transactionType === TransactionType.income)
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = dayTransactions
        .filter((t) => t.transactionType === TransactionType.expense)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        date: date.getDate().toString(),
        Expenses: expenses,
        Income: income,
      };
    });
  }, [transactions]);

  const categoryInsights = useMemo(() => {
    const categoryData = transactions
      .filter((t) => t.transactionType === TransactionType.expense)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<Category, number>);

    return Object.entries(categoryData)
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
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
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track and manage your income and expenses with detailed insights.</p>
        </div>
      </div>

      {/* Add Transaction Forms */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add Expense</CardTitle>
            <p className="text-sm text-muted-foreground">Record a new expense transaction</p>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowAddTransaction(true)} className="w-full bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Income</CardTitle>
            <p className="text-sm text-muted-foreground">Record earned income and view your balance</p>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowAddTransaction(true)} className="w-full bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Income
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(stats.income)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: stats.balance >= 0 ? 'oklch(0.769 0.188 70.08)' : 'oklch(0.704 0.191 22.216)' }}>
              {formatCurrency(stats.balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Category Breakdown</CardTitle>
          <p className="text-sm text-muted-foreground">Distribution of your expenses by category</p>
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

      {/* Income Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Income Category Breakdown</CardTitle>
          <p className="text-sm text-muted-foreground">Distribution of your income by category</p>
        </CardHeader>
        <CardContent>
          {incomeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${categoryName(name)}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incomeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as Category] || COLORS[Category.other]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              No income data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Income vs Expenses Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses Trend</CardTitle>
          <p className="text-sm text-muted-foreground">Daily comparison of your income and expenses over the last 30 days</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
              <XAxis dataKey="date" stroke="oklch(var(--muted-foreground))" />
              <YAxis stroke="oklch(var(--muted-foreground))" />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="Expenses" stroke="oklch(0.704 0.191 22.216)" strokeWidth={2} />
              <Line type="monotone" dataKey="Income" stroke="oklch(0.769 0.188 70.08)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category-Based Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Category-Based Insights</CardTitle>
          <p className="text-sm text-muted-foreground">Compare spending across different categories.</p>
        </CardHeader>
        <CardContent>
          {categoryInsights.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryInsights}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
                <XAxis dataKey="category" stroke="oklch(var(--muted-foreground))" tickFormatter={categoryName} />
                <YAxis stroke="oklch(var(--muted-foreground))" />
                <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={categoryName} />
                <Bar dataKey="amount" fill="oklch(0.488 0.243 264.376)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              No category data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.expenses)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.income)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Today's Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹0.00</div>
          </CardContent>
        </Card>
      </div>

      <AddTransactionDialog open={showAddTransaction} onOpenChange={setShowAddTransaction} />
    </div>
  );
}

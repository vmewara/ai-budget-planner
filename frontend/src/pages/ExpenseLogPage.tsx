import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetTransactions } from '../hooks/useQueries';
import { TransactionType } from '../backend';

export default function ExpenseLogPage() {
  const { data: transactions = [] } = useGetTransactions();

  const groupedExpenses = useMemo(() => {
    const expenses = transactions.filter((t) => t.transactionType === TransactionType.expense);

    const grouped: Record<string, typeof expenses> = {};

    expenses.forEach((expense) => {
      const date = new Date(Number(expense.date) / 1_000_000);
      const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(expense);
    });

    return Object.entries(grouped)
      .map(([month, expenses]) => ({
        month,
        expenses: expenses.sort((a, b) => Number(b.date) - Number(a.date)),
        total: expenses.reduce((sum, e) => sum + e.amount, 0),
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateB.getTime() - dateA.getTime();
      });
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const categoryName = (cat: string) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const paymentMethodName = (method: string) => {
    const names: Record<string, string> = {
      cash: 'Cash',
      creditCard: 'Credit Card',
      debitCard: 'Debit Card',
      bankTransfer: 'Bank Transfer',
      upi: 'UPI',
      other: 'Other',
    };
    return names[method] || method;
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Expense Log</h1>
        <p className="text-muted-foreground">Detailed record of all your expenses organized by month.</p>
      </div>

      {/* Monthly Expense Groups */}
      {groupedExpenses.length > 0 ? (
        <div className="space-y-6">
          {groupedExpenses.map(({ month, expenses, total }) => (
            <Card key={month}>
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-primary">📅</span>
                    {month}
                  </CardTitle>
                  <div className="text-lg font-bold">{formatCurrency(total)}</div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          {expense.notes.charAt(0).toUpperCase() || 'E'}
                        </div>
                        <div>
                          <div className="font-medium">{expense.notes || 'No description'}</div>
                          <div className="text-sm text-muted-foreground">{formatDate(expense.date)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(expense.amount)}</div>
                        <div className="flex items-center justify-end gap-2 text-sm">
                          <Badge variant="outline" className="text-xs">
                            {categoryName(expense.category)}
                          </Badge>
                          <span className="text-muted-foreground">{paymentMethodName(expense.paymentMethod)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">No expenses recorded yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

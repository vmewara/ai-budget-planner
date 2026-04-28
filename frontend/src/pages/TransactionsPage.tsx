import { useMemo, useState } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetTransactions, useDeleteTransaction } from '../hooks/useQueries';
import { TransactionType } from '../backend';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: transactions = [] } = useGetTransactions();
  const deleteTransaction = useDeleteTransaction();

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const query = searchQuery.toLowerCase();
        return (
          t.notes.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => Number(b.date) - Number(a.date));
  }, [transactions, searchQuery]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

  const handleDelete = async () => {
    if (deleteId) {
      await deleteTransaction.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">All Transactions</h1>
        <p className="text-muted-foreground">A complete history of your financial activity.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by note or category..."
          className="pl-10"
        />
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <p className="text-sm text-muted-foreground">View and manage all your transactions</p>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category/Type</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{formatDate(transaction.date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            {transaction.notes.charAt(0).toUpperCase() || 'T'}
                          </div>
                          <span>{transaction.notes || 'No description'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{categoryName(transaction.category)}</div>
                          <div className="text-xs text-muted-foreground">{paymentMethodName(transaction.paymentMethod)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={transaction.transactionType === TransactionType.income ? 'default' : 'destructive'}
                          className={
                            transaction.transactionType === TransactionType.income
                              ? 'bg-primary hover:bg-primary/90'
                              : ''
                          }
                        >
                          {transaction.transactionType === TransactionType.income ? 'Income' : 'Expense'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span
                          style={{
                            color:
                              transaction.transactionType === TransactionType.income
                                ? 'oklch(0.769 0.188 70.08)'
                                : 'oklch(0.704 0.191 22.216)',
                          }}
                        >
                          {transaction.transactionType === TransactionType.income ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(transaction.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              {searchQuery ? 'No transactions found matching your search' : 'No transactions yet'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAddTransaction, useGetImmutableCategories, useGetImmutablePaymentMethods } from '../hooks/useQueries';
import { TransactionType, Category, PaymentMethod } from '../backend';

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddTransactionDialog({ open, onOpenChange }: AddTransactionDialogProps) {
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.expense);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<Category | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [notes, setNotes] = useState('');

  const addTransaction = useAddTransaction();
  const { data: categories = [] } = useGetImmutableCategories();
  const { data: paymentMethods = [] } = useGetImmutablePaymentMethods();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !paymentMethod) return;

    const dateTime = new Date(date).getTime();
    const nanoTime = BigInt(dateTime) * BigInt(1_000_000);

    await addTransaction.mutateAsync({
      amount: parseFloat(amount),
      date: nanoTime,
      category: category as Category,
      paymentMethod: paymentMethod as PaymentMethod,
      notes,
      transactionType,
    });

    // Reset form
    setAmount('');
    setCategory('');
    setPaymentMethod('');
    setNotes('');
    onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <Tabs value={transactionType} onValueChange={(v) => setTransactionType(v as TransactionType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={TransactionType.expense}>Expense</TabsTrigger>
            <TabsTrigger value={TransactionType.income}>Income</TabsTrigger>
          </TabsList>
          <TabsContent value={TransactionType.expense}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount Spent *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="₹0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Note</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a note (optional)..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {categoryName(cat)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Type *</Label>
                  <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {paymentMethodName(method)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={addTransaction.isPending}>
                {addTransaction.isPending ? 'Adding...' : 'Add Expense'}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value={TransactionType.income}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount-income">Amount Earned *</Label>
                  <Input
                    id="amount-income"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="₹0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-income">Date *</Label>
                  <Input
                    id="date-income"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes-income">Note</Label>
                <Textarea
                  id="notes-income"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Monthly salary, Freelance project..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category-income">Category *</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {categoryName(cat)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod-income">Payment Type *</Label>
                  <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {paymentMethodName(method)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={addTransaction.isPending}>
                {addTransaction.isPending ? 'Adding...' : 'Add Income'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

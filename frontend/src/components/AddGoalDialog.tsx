import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAddGoal } from '../hooks/useQueries';

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddGoalDialog({ open, onOpenChange }: AddGoalDialogProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [endDate, setEndDate] = useState('');

  const addGoal = useAddGoal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;

    const startDateTime = Date.now();
    const startNanoTime = BigInt(startDateTime) * BigInt(1_000_000);

    let endNanoTime: bigint | null = null;
    if (endDate) {
      const endDateTime = new Date(endDate).getTime();
      endNanoTime = BigInt(endDateTime) * BigInt(1_000_000);
    }

    await addGoal.mutateAsync({
      name,
      targetAmount: parseFloat(targetAmount),
      startDate: startNanoTime,
      endDate: endNanoTime,
    });

    // Reset form
    setName('');
    setTargetAmount('');
    setEndDate('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Emergency Fund, Vacation"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Amount *</Label>
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="₹0.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Target Date (Optional)</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={addGoal.isPending}>
            {addGoal.isPending ? 'Creating...' : 'Create Goal'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { Plus, Edit, Trash2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGetGoals, useDeleteGoal } from '../hooks/useQueries';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import AddGoalDialog from '../components/AddGoalDialog';

export default function GoalTrackerPage() {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: goals = [] } = useGetGoals();
  const deleteGoal = useDeleteGoal();

  const stats = {
    total: goals.length,
    completed: goals.filter((g) => g.isCompleted).length,
    inProgress: goals.filter((g) => !g.isCompleted).length,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteGoal.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goal Tracker</h1>
          <p className="text-muted-foreground">Track and manage your savings goals.</p>
        </div>
        <Button onClick={() => setShowAddGoal(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Goal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Goals</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      {goals.length > 0 ? (
        <div className="space-y-4">
          {goals.map((goal) => (
            <Card key={goal.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{goal.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(goal.targetAmount - goal.currentAmount)} remaining
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(goal.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Progress</span>
                      <span className="text-muted-foreground">{Math.round(goal.progressPercentage)}%</span>
                    </div>
                    <Progress value={goal.progressPercentage} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">Current</span>
                      <p className="text-muted-foreground">{formatCurrency(goal.currentAmount)}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">Target</span>
                      <p className="text-muted-foreground">{formatCurrency(goal.targetAmount)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex h-[300px] items-center justify-center">
            <div className="text-center">
              <p className="mb-4 text-muted-foreground">No goals yet. Create your first savings goal!</p>
              <Button onClick={() => setShowAddGoal(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Goal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <AddGoalDialog open={showAddGoal} onOpenChange={setShowAddGoal} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the goal.
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

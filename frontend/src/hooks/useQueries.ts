import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  Transaction,
  Goal,
  UserSettings,
  FinancialInsight,
  CategoryTotal,
  PaymentMethodTotal,
  UserProfile,
  Category,
  PaymentMethod,
  TransactionType,
  Time,
} from '../backend';
import { toast } from 'sonner';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

// Transaction Queries
export function useGetTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      amount: number;
      date: Time;
      category: Category;
      paymentMethod: PaymentMethod;
      notes: string;
      transactionType: TransactionType;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTransaction(
        params.amount,
        params.date,
        params.category,
        params.paymentMethod,
        params.notes,
        params.transactionType
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['categoryTotals'] });
      queryClient.invalidateQueries({ queryKey: ['paymentMethodTotals'] });
      toast.success('Transaction added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add transaction: ${error.message}`);
    },
  });
}

export function useUpdateTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      amount: number;
      date: Time;
      category: Category;
      paymentMethod: PaymentMethod;
      notes: string;
      transactionType: TransactionType;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTransaction(
        params.id,
        params.amount,
        params.date,
        params.category,
        params.paymentMethod,
        params.notes,
        params.transactionType
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['categoryTotals'] });
      queryClient.invalidateQueries({ queryKey: ['paymentMethodTotals'] });
      toast.success('Transaction updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update transaction: ${error.message}`);
    },
  });
}

export function useDeleteTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTransaction(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['categoryTotals'] });
      queryClient.invalidateQueries({ queryKey: ['paymentMethodTotals'] });
      toast.success('Transaction deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete transaction: ${error.message}`);
    },
  });
}

// Goal Queries
export function useGetGoals() {
  const { actor, isFetching } = useActor();

  return useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGoals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      targetAmount: number;
      startDate: Time;
      endDate: Time | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addGoal(params.name, params.targetAmount, params.startDate, params.endDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add goal: ${error.message}`);
    },
  });
}

export function useUpdateGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      name: string;
      targetAmount: number;
      currentAmount: number;
      endDate: Time | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateGoal(
        params.id,
        params.name,
        params.targetAmount,
        params.currentAmount,
        params.endDate
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update goal: ${error.message}`);
    },
  });
}

export function useDeleteGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteGoal(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete goal: ${error.message}`);
    },
  });
}

// Category and Payment Method Totals
export function useGetCategoryTotals() {
  const { actor, isFetching } = useActor();

  return useQuery<CategoryTotal[]>({
    queryKey: ['categoryTotals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategoryTotals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPaymentMethodTotals() {
  const { actor, isFetching } = useActor();

  return useQuery<PaymentMethodTotal[]>({
    queryKey: ['paymentMethodTotals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPaymentMethodTotals();
    },
    enabled: !!actor && !isFetching,
  });
}

// User Settings
export function useGetUserSettings() {
  const { actor, isFetching } = useActor();

  return useQuery<UserSettings | null>({
    queryKey: ['userSettings'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveUserSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: UserSettings) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveUserSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      toast.success('Settings saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save settings: ${error.message}`);
    },
  });
}

// Financial Insights
export function useGetFinancialInsight() {
  const { actor, isFetching } = useActor();

  return useQuery<FinancialInsight | null>({
    queryKey: ['financialInsight'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getFinancialInsight();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveFinancialInsight() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (insight: FinancialInsight) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveFinancialInsight(insight);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialInsight'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to save insight: ${error.message}`);
    },
  });
}

// Immutable data
export function useGetImmutableCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<Category[]>({
    queryKey: ['immutableCategories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getImmutableCategoryTypes();
    },
    enabled: !!actor && !isFetching,
    staleTime: Infinity,
  });
}

export function useGetImmutablePaymentMethods() {
  const { actor, isFetching } = useActor();

  return useQuery<PaymentMethod[]>({
    queryKey: ['immutablePaymentMethods'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getImmutablePaymentMethods();
    },
    enabled: !!actor && !isFetching,
    staleTime: Infinity,
  });
}

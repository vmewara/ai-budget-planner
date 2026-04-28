import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Goal {
    id: string;
    endDate?: Time;
    isCompleted: boolean;
    progressPercentage: number;
    name: string;
    targetAmount: number;
    currentAmount: number;
    startDate: Time;
}
export type Time = bigint;
export interface PaymentMethodTotal {
    paymentMethod: PaymentMethod;
    amount: number;
}
export interface UserSettings {
    theme: Variant_dark_light;
    showNotifications: boolean;
    showAnalytics: boolean;
    enableAIInsights: boolean;
    showBudgetWarnings: boolean;
    showSavingsTips: boolean;
}
export interface FinancialInsight {
    savingsPotential: number;
    totalIncome: number;
    incomeExpenseRatio: number;
    totalExpenses: number;
    topSpendingCategory?: Category;
    spendingTrends: Array<number>;
}
export interface CategoryTotal {
    category: Category;
    amount: number;
}
export interface UserProfile {
    name: string;
    email: string;
    memberSince: Time;
}
export interface Transaction {
    id: string;
    paymentMethod: PaymentMethod;
    transactionType: TransactionType;
    date: Time;
    notes: string;
    category: Category;
    amount: number;
}
export enum Category {
    salary = "salary",
    other = "other",
    entertainment = "entertainment",
    food = "food",
    travel = "travel",
    rent = "rent",
    utilities = "utilities",
    investment = "investment",
    freelance = "freelance",
    shopping = "shopping",
    health = "health"
}
export enum PaymentMethod {
    upi = "upi",
    creditCard = "creditCard",
    other = "other",
    cash = "cash",
    bankTransfer = "bankTransfer",
    debitCard = "debitCard"
}
export enum TransactionType {
    expense = "expense",
    income = "income"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_dark_light {
    dark = "dark",
    light = "light"
}
export interface backendInterface {
    addGoal(name: string, targetAmount: number, startDate: Time, endDate: Time | null): Promise<string>;
    addTransaction(amount: number, date: Time, category: Category, paymentMethod: PaymentMethod, notes: string, transactionType: TransactionType): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeGoal(id: string): Promise<void>;
    deleteGoal(id: string): Promise<void>;
    deleteTransaction(id: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategoryTotals(): Promise<Array<CategoryTotal>>;
    getFinancialInsight(): Promise<FinancialInsight | null>;
    getGoals(): Promise<Array<Goal>>;
    getImmutableCategoryTypes(): Promise<Array<Category>>;
    getImmutablePaymentMethods(): Promise<Array<PaymentMethod>>;
    getPaymentMethodTotals(): Promise<Array<PaymentMethodTotal>>;
    getTransactions(): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserSettings(): Promise<UserSettings | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveFinancialInsight(insight: FinancialInsight): Promise<void>;
    saveUserSettings(settings: UserSettings): Promise<void>;
    updateGoal(id: string, name: string, targetAmount: number, currentAmount: number, endDate: Time | null): Promise<void>;
    updateTransaction(id: string, amount: number, date: Time, category: Category, paymentMethod: PaymentMethod, notes: string, transactionType: TransactionType): Promise<void>;
}

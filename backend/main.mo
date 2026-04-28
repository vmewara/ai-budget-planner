import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";

actor {
  // User-specific data structures
  let userTransactions = Map.empty<Principal, Map.Map<Text, Transaction>>();
  let userGoals = Map.empty<Principal, Map.Map<Text, Goal>>();
  let userSettings = Map.empty<Principal, UserSettings>();
  let userInsights = Map.empty<Principal, FinancialInsight>();
  let userCategoryTotals = Map.empty<Principal, Map.Map<Text, CategoryTotal>>();
  let userPaymentMethodTotals = Map.empty<Principal, Map.Map<Text, PaymentMethodTotal>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  public type TransactionType = {
    #income;
    #expense;
  };

  public type Category = {
    #salary;
    #freelance;
    #investment;
    #shopping;
    #food;
    #rent;
    #utilities;
    #travel;
    #health;
    #entertainment;
    #other;
  };

  public type PaymentMethod = {
    #cash;
    #creditCard;
    #debitCard;
    #bankTransfer;
    #upi;
    #other;
  };

  public type Transaction = {
    id : Text;
    amount : Float;
    date : Time.Time;
    category : Category;
    paymentMethod : PaymentMethod;
    notes : Text;
    transactionType : TransactionType;
  };

  public type Goal = {
    id : Text;
    name : Text;
    targetAmount : Float;
    currentAmount : Float;
    startDate : Time.Time;
    endDate : ?Time.Time;
    isCompleted : Bool;
    progressPercentage : Float;
  };

  public type UserSettings = {
    theme : {
      #light;
      #dark;
    };
    showNotifications : Bool;
    showAnalytics : Bool;
    showBudgetWarnings : Bool;
    showSavingsTips : Bool;
    enableAIInsights : Bool;
  };

  public type FinancialInsight = {
    totalIncome : Float;
    totalExpenses : Float;
    incomeExpenseRatio : Float;
    savingsPotential : Float;
    topSpendingCategory : ?Category;
    spendingTrends : [Float];
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    memberSince : Time.Time;
  };

  public type CategoryTotal = {
    category : Category;
    amount : Float;
  };

  public type PaymentMethodTotal = {
    paymentMethod : PaymentMethod;
    amount : Float;
  };

  let accessControlState = AccessControl.initState();

  // Required Authentication Functions
  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper functions
  func getUserTransactionMap(user : Principal) : Map.Map<Text, Transaction> {
    switch (userTransactions.get(user)) {
      case (?map) { map };
      case (null) {
        let newMap = Map.empty<Text, Transaction>();
        userTransactions.add(user, newMap);
        newMap;
      };
    };
  };

  func getUserGoalMap(user : Principal) : Map.Map<Text, Goal> {
    switch (userGoals.get(user)) {
      case (?map) { map };
      case (null) {
        let newMap = Map.empty<Text, Goal>();
        userGoals.add(user, newMap);
        newMap;
      };
    };
  };

  func getUserCategoryTotalMap(user : Principal) : Map.Map<Text, CategoryTotal> {
    switch (userCategoryTotals.get(user)) {
      case (?map) { map };
      case (null) {
        let newMap = Map.empty<Text, CategoryTotal>();
        userCategoryTotals.add(user, newMap);
        newMap;
      };
    };
  };

  func getUserPaymentMethodTotalMap(user : Principal) : Map.Map<Text, PaymentMethodTotal> {
    switch (userPaymentMethodTotals.get(user)) {
      case (?map) { map };
      case (null) {
        let newMap = Map.empty<Text, PaymentMethodTotal>();
        userPaymentMethodTotals.add(user, newMap);
        newMap;
      };
    };
  };

  func categoryToText(c : Category) : Text {
    switch (c) {
      case (#salary) { "Salary" };
      case (#freelance) { "Freelance" };
      case (#investment) { "Investment" };
      case (#shopping) { "Shopping" };
      case (#food) { "Food" };
      case (#rent) { "Rent" };
      case (#utilities) { "Utilities" };
      case (#travel) { "Travel" };
      case (#health) { "Health" };
      case (#entertainment) { "Entertainment" };
      case (#other) { "Other" };
    };
  };

  func paymentMethodToText(p : PaymentMethod) : Text {
    switch (p) {
      case (#cash) { "Cash" };
      case (#creditCard) { "Credit Card" };
      case (#debitCard) { "Debit Card" };
      case (#bankTransfer) { "Bank Transfer" };
      case (#upi) { "UPI" };
      case (#other) { "Other" };
    };
  };

  func updateCategoryTotal(user : Principal, category : Category, amount : Float, transactionType : TransactionType) {
    let categoryMap = getUserCategoryTotalMap(user);
    let categoryKey = categoryToText(category);

    let currentTotal = switch (categoryMap.get(categoryKey)) {
      case (?total) { total.amount };
      case (null) { 0.0 };
    };

    let newTotal = switch (transactionType) {
      case (#income) { currentTotal + amount };
      case (#expense) { currentTotal - amount };
    };

    let updatedTotal : CategoryTotal = {
      category;
      amount = newTotal;
    };

    categoryMap.add(categoryKey, updatedTotal);
  };

  func updatePaymentMethodTotal(user : Principal, paymentMethod : PaymentMethod, amount : Float, transactionType : TransactionType) {
    let methodMap = getUserPaymentMethodTotalMap(user);
    let methodKey = paymentMethodToText(paymentMethod);

    let currentTotal = switch (methodMap.get(methodKey)) {
      case (?total) { total.amount };
      case (null) { 0.0 };
    };

    let newTotal = switch (transactionType) {
      case (#income) { currentTotal + amount };
      case (#expense) { currentTotal - amount };
    };

    let updatedTotal : PaymentMethodTotal = {
      paymentMethod;
      amount = newTotal;
    };

    methodMap.add(methodKey, updatedTotal);
  };

  // Transaction Management
  public shared ({ caller }) func addTransaction(amount : Float, date : Time.Time, category : Category, paymentMethod : PaymentMethod, notes : Text, transactionType : TransactionType) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add transactions");
    };

    let transactions = getUserTransactionMap(caller);
    let id = "txn_" # caller.toText() # "_" # Int.toText(Time.now());

    let transaction : Transaction = {
      id;
      amount;
      date;
      category;
      paymentMethod;
      notes;
      transactionType;
    };

    transactions.add(id, transaction);
    updateCategoryTotal(caller, category, amount, transactionType);
    updatePaymentMethodTotal(caller, paymentMethod, amount, transactionType);

    id;
  };

  public shared ({ caller }) func updateTransaction(id : Text, amount : Float, date : Time.Time, category : Category, paymentMethod : PaymentMethod, notes : Text, transactionType : TransactionType) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update transactions");
    };

    let transactions = getUserTransactionMap(caller);

    if (not transactions.containsKey(id)) {
      Runtime.trap("Transaction does not exist");
    };

    let updatedTransaction : Transaction = {
      id;
      amount;
      date;
      category;
      paymentMethod;
      notes;
      transactionType;
    };

    transactions.add(id, updatedTransaction);
    updateCategoryTotal(caller, category, amount, transactionType);
    updatePaymentMethodTotal(caller, paymentMethod, amount, transactionType);
  };

  public shared ({ caller }) func deleteTransaction(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete transactions");
    };

    let transactions = getUserTransactionMap(caller);

    if (not transactions.containsKey(id)) {
      Runtime.trap("Transaction does not exist");
    };

    transactions.remove(id);
  };

  public query ({ caller }) func getTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };

    let transactions = getUserTransactionMap(caller);
    transactions.values().toArray();
  };

  // Goal Management
  public shared ({ caller }) func addGoal(name : Text, targetAmount : Float, startDate : Time.Time, endDate : ?Time.Time) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add goals");
    };

    let goals = getUserGoalMap(caller);
    let id = "goal_" # caller.toText() # "_" # Int.toText(Time.now());

    let goal : Goal = {
      id;
      name;
      targetAmount;
      currentAmount = 0;
      startDate;
      endDate;
      isCompleted = false;
      progressPercentage = 0;
    };

    goals.add(id, goal);
    id;
  };

  public shared ({ caller }) func updateGoal(id : Text, name : Text, targetAmount : Float, currentAmount : Float, endDate : ?Time.Time) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update goals");
    };

    let goals = getUserGoalMap(caller);

    switch (goals.get(id)) {
      case (null) { Runtime.trap("Goal does not exist") };
      case (?existingGoal) {
        let updatedGoal : Goal = {
          id;
          name;
          targetAmount;
          currentAmount;
          startDate = existingGoal.startDate;
          endDate;
          isCompleted = currentAmount >= targetAmount;
          progressPercentage = if (targetAmount > 0) { (currentAmount / targetAmount) * 100 } else { 0 };
        };
        goals.add(id, updatedGoal);
      };
    };
  };

  public shared ({ caller }) func completeGoal(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete goals");
    };

    let goals = getUserGoalMap(caller);

    switch (goals.get(id)) {
      case (null) { Runtime.trap("Goal does not exist") };
      case (?goal) {
        let completedGoal : Goal = {
          id = goal.id;
          name = goal.name;
          targetAmount = goal.targetAmount;
          currentAmount = goal.currentAmount;
          startDate = goal.startDate;
          endDate = goal.endDate;
          isCompleted = true;
          progressPercentage = 100;
        };
        goals.add(id, completedGoal);
      };
    };
  };

  public shared ({ caller }) func deleteGoal(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete goals");
    };

    let goals = getUserGoalMap(caller);

    if (not goals.containsKey(id)) {
      Runtime.trap("Goal does not exist");
    };

    goals.remove(id);
  };

  public query ({ caller }) func getGoals() : async [Goal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view goals");
    };

    let goals = getUserGoalMap(caller);
    goals.values().toArray();
  };

  // Category and Payment Method Totals
  public query ({ caller }) func getCategoryTotals() : async [CategoryTotal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view category totals");
    };

    let categoryMap = getUserCategoryTotalMap(caller);
    categoryMap.values().toArray();
  };

  public query ({ caller }) func getPaymentMethodTotals() : async [PaymentMethodTotal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payment method totals");
    };

    let methodMap = getUserPaymentMethodTotalMap(caller);
    methodMap.values().toArray();
  };

  // User Settings
  public shared ({ caller }) func saveUserSettings(settings : UserSettings) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save settings");
    };

    userSettings.add(caller, settings);
  };

  public query ({ caller }) func getUserSettings() : async ?UserSettings {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view settings");
    };

    userSettings.get(caller);
  };

  // Financial Insights
  public shared ({ caller }) func saveFinancialInsight(insight : FinancialInsight) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save insights");
    };

    userInsights.add(caller, insight);
  };

  public query ({ caller }) func getFinancialInsight() : async ?FinancialInsight {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view insights");
    };

    userInsights.get(caller);
  };

  // Immutable defaults (for UI) - accessible to all
  public query func getImmutableCategoryTypes() : async [Category] {
    [#salary, #freelance, #investment, #shopping, #food, #rent, #utilities, #travel, #health, #entertainment, #other];
  };

  public query func getImmutablePaymentMethods() : async [PaymentMethod] {
    [#cash, #creditCard, #debitCard, #bankTransfer, #upi, #other];
  };
};

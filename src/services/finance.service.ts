import { axiosAppInstance } from "@/lib/axiosAppInstance";

export interface Transaction {
  _id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  tags: string[];
  recurring: boolean;
  recurringFrequency?: "daily" | "weekly" | "monthly" | "yearly";
  recurringEndDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionData {
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date?: string;
  tags?: string[];
  recurring?: boolean;
  recurringFrequency?: "daily" | "weekly" | "monthly" | "yearly";
  recurringEndDate?: string;
  notes?: string;
}

export interface UpdateTransactionData extends Partial<CreateTransactionData> {}

export interface TransactionFilters {
  type?: "income" | "expense";
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
}

export interface FinancialSummary {
  summary: {
    totalIncome: number;
    totalExpense: number;
    netIncome: number;
    transactionCount: number;
  };
  categoryBreakdown: Array<{
    _id: { type: string; category: string };
    total: number;
    count: number;
  }>;
  recentTransactions: Transaction[];
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  pagination: {
    current: number;
    total: number;
    count: number;
  };
}

export const financeService = {
  // Get all transactions with optional filters
  getTransactions: async (filters: TransactionFilters = {}): Promise<PaginatedTransactions> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await axiosAppInstance.get(`/finance?${params.toString()}`);
    return response.data;
  },

  // Get a single transaction by ID
  getTransaction: async (id: string): Promise<Transaction> => {
    const response = await axiosAppInstance.get(`/finance/${id}`);
    return response.data;
  },

  // Create a new transaction
  createTransaction: async (data: CreateTransactionData): Promise<Transaction> => {
    const response = await axiosAppInstance.post("/finance", data);
    return response.data;
  },

  // Update an existing transaction
  updateTransaction: async (id: string, data: UpdateTransactionData): Promise<Transaction> => {
    const response = await axiosAppInstance.put(`/finance/${id}`, data);
    return response.data;
  },

  // Delete a transaction
  deleteTransaction: async (id: string): Promise<void> => {
    await axiosAppInstance.delete(`/finance/${id}`);
  },

  // Get financial summary and statistics
  getFinancialSummary: async (startDate?: string, endDate?: string): Promise<FinancialSummary> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await axiosAppInstance.get(`/finance/summary?${params.toString()}`);
    return response.data;
  },
};

// Category options for the UI
export const INCOME_CATEGORIES = [
  { value: "salary", label: "Salary" },
  { value: "freelance", label: "Freelance" },
  { value: "investment", label: "Investment" },
  { value: "business", label: "Business" },
  { value: "gift", label: "Gift" },
  { value: "other_income", label: "Other Income" },
];

export const EXPENSE_CATEGORIES = [
  { value: "food", label: "Food & Dining" },
  { value: "transportation", label: "Transportation" },
  { value: "entertainment", label: "Entertainment" },
  { value: "shopping", label: "Shopping" },
  { value: "bills", label: "Bills & Utilities" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "travel", label: "Travel" },
  { value: "subscriptions", label: "Subscriptions" },
  { value: "other_expense", label: "Other Expense" },
];

export const ALL_CATEGORIES = {
  income: INCOME_CATEGORIES,
  expense: EXPENSE_CATEGORIES,
};

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

export const getCategoryLabel = (category: string, type: "income" | "expense"): string => {
  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const found = categories.find(cat => cat.value === category);
  return found ? found.label : category;
};

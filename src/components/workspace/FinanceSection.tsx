"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Filter,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  financeService,
  Transaction,
  TransactionFilters,
  formatCurrency,
  getCategoryLabel,
  ALL_CATEGORIES,
} from "@/services/finance.service";
import TransactionForm from "./TransactionForm";
import FinanceDashboard from "./FinanceDashboard";
import toast from "react-hot-toast";

interface FinanceSectionProps {
  viewMode: "list" | "dashboard";
  showTransactionForm: boolean;
  setShowTransactionForm: (show: boolean) => void;
}

export default function FinanceSection({ 
  viewMode, 
  showTransactionForm, 
  setShowTransactionForm 
}: FinanceSectionProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({
    limit: 20,
    page: 1,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
  });

  // Load transactions
  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await financeService.getTransactions(filters);
      setTransactions(response.transactions);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error("Error loading transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  // Handle transaction deletion
  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      await financeService.deleteTransaction(id);
      toast.success("Transaction deleted successfully");
      loadTransactions();
    } catch (error: any) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // For now, we'll filter client-side. In a real app, you'd want server-side search
    if (term.trim()) {
      const filtered = transactions.filter(transaction =>
        transaction.description.toLowerCase().includes(term.toLowerCase()) ||
        transaction.category.toLowerCase().includes(term.toLowerCase())
      );
      setTransactions(filtered);
    } else {
      loadTransactions();
    }
  };

  // Get filtered transactions for display
  const filteredTransactions = searchTerm.trim()
    ? transactions.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : transactions;

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    // Create date in local timezone to avoid timezone issues
    const transactionDate = new Date(transaction.date);
    const localDate = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());
    const date = localDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  // Calculate totals
  const totals = filteredTransactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "income") {
        acc.income += transaction.amount;
      } else {
        acc.expense += transaction.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const netIncome = totals.income - totals.expense;

  return (
    <div className="h-full flex flex-col">
      {/* Content Area */}
      {viewMode === "dashboard" ? (
        <div className="flex-1 overflow-y-auto">
          <FinanceDashboard />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
       <div className="grid grid-cols-3 gap-1 mb-4">
         <div className="border border-gray-200 rounded-lg p-2">
           <div className="flex items-center gap-1 mb-1">
             <TrendingUp className="h-3 w-3 text-green-600" />
             <span className="text-xs text-gray-600">Income</span>
           </div>
           <div className="text-sm font-bold text-green-600">
             {formatCurrency(totals.income)}
           </div>
         </div>

         <div className="border border-gray-200 rounded-lg p-2">
           <div className="flex items-center gap-1 mb-1">
             <TrendingDown className="h-3 w-3 text-red-600" />
             <span className="text-xs text-gray-600">Expenses</span>
           </div>
           <div className="text-sm font-bold text-red-600">
             {formatCurrency(totals.expense)}
           </div>
         </div>

         <div className="border border-gray-200 rounded-lg p-2">
           <div className="flex items-center gap-1 mb-1">
             <DollarSign className="h-3 w-3 text-blue-600" />
             <span className="text-xs text-gray-600">Net</span>
           </div>
           <div className={`text-sm font-bold ${netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
             {formatCurrency(netIncome)}
           </div>
         </div>
       </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-7 h-8 text-sm border border-gray-200 shadow-none bg-gray-50 focus:border-gray-200 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        
        <div className="flex gap-2">
          <Select
            value={filters.type || "all"}
            onValueChange={(value) => handleFilterChange("type", value === "all" ? undefined : value)}
          >
            <SelectTrigger className="flex-1 h-8 text-sm border border-gray-200 shadow-none bg-gray-50">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.category || "all"}
            onValueChange={(value) => handleFilterChange("category", value === "all" ? undefined : value)}
          >
            <SelectTrigger className="flex-1 h-8 text-sm border border-gray-200 shadow-none bg-gray-50">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {ALL_CATEGORIES.income.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
              {ALL_CATEGORIES.expense.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        </div>
      ) : filteredTransactions.length > 0 ? (
        <div className="flex-1 overflow-y-auto space-y-6">
          {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
            <div key={date} className="space-y-3">
              {/* Date Header */}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-700">{date}</h3>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Transactions for this date */}
              <div className="space-y-2">
                {dateTransactions.map((transaction) => (
                  <Card key={transaction._id} className="border border-gray-200 shadow-none transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`p-2 rounded-full ${
                            transaction.type === "income" 
                              ? "bg-green-100 text-green-600" 
                              : "bg-red-100 text-red-600"
                          }`}>
                            {transaction.type === "income" ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {transaction.description}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {getCategoryLabel(transaction.category, transaction.type)}
                              </Badge>
                              {transaction.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {transaction.tags.slice(0, 2).map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {transaction.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{transaction.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className={`font-semibold ${
                              transaction.type === "income" ? "text-green-600" : "text-red-600"
                            }`}>
                              {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(transaction.date).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                              })}
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingTransaction(transaction);
                                  setShowTransactionForm(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteTransaction(transaction._id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full flex-1 min-h-0 grid place-items-center">
          <div className="text-center">
            <DollarSign className="h-12 w-12 text-gray-300 mb-3 mx-auto" />
            <h3 className="text-base font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600 max-w-md text-sm mx-auto">
              {searchTerm.trim() || filters.type || filters.category
                ? "No transactions match your current filters. Try adjusting your search or filters."
                : "Start by adding your first transaction to track your finances."}
            </p>
          </div>
        </div>
      )}
        </>
      )}

      {/* Transaction Form */}
      <TransactionForm
        isOpen={showTransactionForm}
        onClose={() => {
          setShowTransactionForm(false);
          setEditingTransaction(null);
        }}
        transaction={editingTransaction}
        onSuccess={loadTransactions}
      />
    </div>
  );
}
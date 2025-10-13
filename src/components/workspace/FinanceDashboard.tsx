"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  financeService,
  FinancialSummary,
  formatCurrency,
  getCategoryLabel,
} from "@/services/finance.service";
import toast from "react-hot-toast";

interface FinanceDashboardProps {
  className?: string;
  timeRange: string;
}

export default function FinanceDashboard({ className, timeRange }: FinanceDashboardProps) {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(0); // 0 = current week, -1 = previous week, 1 = next week

  // Generate week data based on current week offset using real transaction data
  const getWeekData = (weekOffset: number) => {
    if (!summary?.recentTransactions) return [];
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7)); // Start of week (Sunday)
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dayString = day.toISOString().split('T')[0];
      
      // Calculate total expenses for this day
      const dayExpenses = summary.recentTransactions
        .filter(transaction => {
          const transactionDate = new Date(transaction.date).toISOString().split('T')[0];
          return transactionDate === dayString && transaction.type === 'expense';
        })
        .reduce((total, transaction) => total + transaction.amount, 0);
      
      weekDays.push({
        day: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: dayExpenses,
      });
    }
    return weekDays;
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(prev => prev - 1);
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => prev + 1);
  };

  // Load financial summary
  const loadSummary = async () => {
    try {
      setLoading(true);
      
      let response;
      
      // Always load all-time data for dashboard to show complete picture
      console.log("Loading all-time financial summary for dashboard...");
      response = await financeService.getFinancialSummary();
      
      console.log("Financial summary response:", response);
      setSummary(response);
    } catch (error: any) {
      console.error("Error loading financial summary:", error);
      toast.error("Failed to load financial summary");
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Financial Data</h3>
        <p className="text-gray-600">Start adding transactions to see your financial dashboard.</p>
      </div>
    );
  }

  // Prepare data for charts
  const incomeExpenseData = [
    {
      name: "Income",
      value: summary.summary.totalIncome || 0,
      color: "#10b981",
    },
    {
      name: "Expenses",
      value: summary.summary.totalExpense || 0,
      color: "#ef4444",
    },
  ];

  // Category breakdown data
  console.log("Category breakdown raw data:", summary.categoryBreakdown);
  
  const categoryData = (summary.categoryBreakdown || [])
    .slice(0, 8) // Top 8 categories
    .map((item) => {
      console.log("Processing category item:", item);
      return {
        name: getCategoryLabel(item._id.category, item._id.type as "income" | "expense"),
        value: item.total || 0,
        count: item.count || 0,
        type: item._id.type,
        fill: item._id.type === "income" ? "#10b981" : "#ef4444", // Green for income, red for expense
      };
    });
    
  console.log("Processed category data:", categoryData);
  
  // Use only real data; no demo fallback
  const finalCategoryData = categoryData;
  console.log("Final category data for chart:", finalCategoryData);

  // Recent transactions for mini list
  const recentTransactions = (summary.recentTransactions || []).slice(0, 5);

  // Calculate percentage changes (mock data for now)
  const incomeChange = 12.5; // This would come from comparing with previous period
  const expenseChange = -8.2;
  const netChange = 15.7;

  return (
    <div className={`space-y-6 scrollbar-hide ${className}`}>
      {/* Summary Cards */}
      <div className="flex gap-1 mb-1 lg:gap-4 lg:mb-6">
        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-2 lg:p-4">
          <div className="flex items-center gap-2 mb-1 lg:mb-2">
            <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-green-600" />
            <span className="text-xs lg:text-sm font-bold text-gray-700">Income</span>
          </div>
          <div className="text-sm lg:text-lg font-bold text-green-600">
            {formatCurrency(summary.summary.totalIncome)}
          </div>
        </div>

        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-2 lg:p-4">
          <div className="flex items-center gap-2 mb-1 lg:mb-2">
            <TrendingDown className="h-3 w-3 lg:h-4 lg:w-4 text-red-600" />
            <span className="text-xs lg:text-sm font-bold text-gray-700">Expenses</span>
          </div>
          <div className="text-sm lg:text-lg font-bold text-red-600">
            {formatCurrency(summary.summary.totalExpense)}
          </div>
        </div>

        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-2 lg:p-4">
          <div className="flex items-center gap-2 mb-1 lg:mb-2">
            <DollarSign className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600" />
            <span className="text-xs lg:text-sm font-bold text-gray-700">Net</span>
          </div>
          <div className="text-sm lg:text-lg font-bold text-blue-600">
            {formatCurrency(summary.summary.netIncome)}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Weekly Expenses Line Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-gray-600" />
              <h3 className="text-base font-semibold text-gray-900">Weekly Expenses</h3>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={handlePreviousWeek}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <button 
                onClick={handleNextWeek}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart key={currentWeek} data={getWeekData(currentWeek)} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `$${value}`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  cursor={false}
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income vs Expenses Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 lg:p-4">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Income vs Expenses</h3>
          </div>
          <div className="h-64">
            {incomeExpenseData.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={incomeExpenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {incomeExpenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
                    iconType="circle"
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <PieChart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No data to display</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 hover:!bg-white md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-gray-600" />
            <h3 className="text-base font-semibold text-gray-900">Top Categories</h3>
          </div>
          <div className="h-72 hover:!bg-transparent">
            {finalCategoryData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%" className="hover:bg-transparent">
                 <BarChart data={finalCategoryData} margin={{ top: 15, right: 20, left: 10, bottom: 35 }}>
                   <XAxis 
                     dataKey="name" 
                     tick={{ fontSize: 10 }}
                     tickLine={false}
                     axisLine={false}
                     angle={-45}
                     textAnchor="end"
                     height={35}
                   />
                   <YAxis 
                     type="number" 
                     tick={{ fontSize: 10 }}
                     tickFormatter={(value) => `$${value}`}
                     domain={[0, 'dataMax']}
                     width={50}
                   />
                   <Tooltip 
                     cursor={false}
                     formatter={(value) => formatCurrency(Number(value))}
                     contentStyle={{
                       backgroundColor: 'white',
                       border: '1px solid #e5e7eb',
                       borderRadius: '8px',
                       fontSize: '12px'
                     }}
                   />
                   <Bar 
                     dataKey="value" 
                     radius={[2, 2, 0, 0]}
                     maxBarSize={30}
                   >
                     {finalCategoryData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.fill} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No category data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 lg:p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
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
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {transaction.description}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {getCategoryLabel(transaction.category, transaction.type)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`font-semibold ${
                  transaction.type === "income" ? "text-green-600" : "text-red-600"
                }`}>
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600">No recent transactions</p>
          </div>
        )}
      </div>
    </div>
  );
}

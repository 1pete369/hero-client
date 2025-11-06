"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  PiggyBank,
  Shield,
  Home,
  Coffee,
  Edit,
  RefreshCw,
  Calendar,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  financeService,
  PlannerDashboard,
  PlannerProfile,
  formatCurrency,
} from "@/services/finance.service";
import toast from "react-hot-toast";

interface FinancePlannerProps {
  className?: string;
}

export default function FinancePlanner({ className }: FinancePlannerProps) {
  const [dashboard, setDashboard] = useState<PlannerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<string>("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [weeklyCheckLoading, setWeeklyCheckLoading] = useState(false);
  const [monthlyResetLoading, setMonthlyResetLoading] = useState(false);
  
  // Form state for profile editing
  const [profileForm, setProfileForm] = useState({
    incomeUsd: 0,
    plannedInvestUsd: 0,
    plannedSinkingUsd: 0,
    emergencyFundUsd: 0,
  });

  useEffect(() => {
    // Initialize to current month
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    setCurrentMonth(monthStr);
    loadDashboard(monthStr);
  }, []);

  const loadDashboard = async (month: string) => {
    try {
      setLoading(true);
      const data = await financeService.getPlannerDashboard(month);
      setDashboard(data);
      
      // Update form state
      setProfileForm({
        incomeUsd: data.profile.incomeUsd,
        plannedInvestUsd: data.profile.plannedInvestUsd,
        plannedSinkingUsd: data.profile.plannedSinkingUsd,
        emergencyFundUsd: data.profile.emergencyFundUsd,
      });
    } catch (error: any) {
      console.error("Error loading planner dashboard:", error);
      if (error.response?.status === 404) {
        toast.error("Set up your planner profile first");
        setEditingProfile(true);
      } else {
        toast.error("Failed to load planner dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await financeService.updatePlannerProfile(profileForm);
      toast.success("Profile updated successfully");
      setEditingProfile(false);
      loadDashboard(currentMonth);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleWeeklyCheck = async () => {
    try {
      setWeeklyCheckLoading(true);
      const result = await financeService.weeklyCheck(currentMonth);
      toast.success(result.suggestion, { duration: 6000 });
      loadDashboard(currentMonth);
    } catch (error: any) {
      console.error("Error running weekly check:", error);
      toast.error("Failed to run weekly check");
    } finally {
      setWeeklyCheckLoading(false);
    }
  };

  const handleMonthlyReset = async () => {
    try {
      setMonthlyResetLoading(true);
      const result = await financeService.monthlyReset(currentMonth);
      
      // Show checklist
      const checklistHtml = result.checklist.map((item, idx) => `${idx + 1}. ${item}`).join("\n");
      toast.success(`Monthly Reset Complete!\n\nNext Month: ${result.nextMonth}\n\nChecklist:\n${checklistHtml}`, {
        duration: 10000,
      });
      
      // Move to next month
      setCurrentMonth(result.nextMonth);
      loadDashboard(result.nextMonth);
    } catch (error: any) {
      console.error("Error running monthly reset:", error);
      toast.error("Failed to run monthly reset");
    } finally {
      setMonthlyResetLoading(false);
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const [year, month] = currentMonth.split("-").map(Number);
    let newYear = year;
    let newMonth = month;
    
    if (direction === "prev") {
      newMonth -= 1;
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
    } else {
      newMonth += 1;
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
    }
    
    const newMonthStr = `${newYear}-${String(newMonth).padStart(2, "0")}`;
    setCurrentMonth(newMonthStr);
    loadDashboard(newMonthStr);
  };

  const getIndicatorColor = (indicator: string) => {
    switch (indicator) {
      case "green": return "text-green-600 bg-green-50";
      case "yellow": return "text-yellow-600 bg-yellow-50";
      case "red": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getBarColor = (indicator: string) => {
    switch (indicator) {
      case "green": return "bg-green-500";
      case "yellow": return "bg-yellow-500";
      case "red": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading planner...</p>
          </div>
        </div>
      </div>
    );
  }

  if (editingProfile || !dashboard) {
    return (
      <div className={`space-y-6 p-4 ${className}`}>
        <Card className="rounded border-3 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Setup Your Budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="income">Monthly Income ($)</Label>
              <Input
                id="income"
                type="number"
                value={profileForm.incomeUsd}
                onChange={(e) => setProfileForm({ ...profileForm, incomeUsd: Number(e.target.value) })}
                className="mt-1 border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              />
            </div>
            
            <div>
              <Label htmlFor="plannedInvest">Planned Investment Transfer ($/month)</Label>
              <Input
                id="plannedInvest"
                type="number"
                value={profileForm.plannedInvestUsd}
                onChange={(e) => setProfileForm({ ...profileForm, plannedInvestUsd: Number(e.target.value) })}
                className="mt-1 border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              />
            </div>
            
            <div>
              <Label htmlFor="plannedSinking">Planned Sinking Fund Transfer ($/month)</Label>
              <Input
                id="plannedSinking"
                type="number"
                value={profileForm.plannedSinkingUsd}
                onChange={(e) => setProfileForm({ ...profileForm, plannedSinkingUsd: Number(e.target.value) })}
                className="mt-1 border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              />
            </div>
            
            <div>
              <Label htmlFor="emergencyFund">Emergency Fund Balance ($)</Label>
              <Input
                id="emergencyFund"
                type="number"
                value={profileForm.emergencyFundUsd}
                onChange={(e) => setProfileForm({ ...profileForm, emergencyFundUsd: Number(e.target.value) })}
                className="mt-1 border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleSaveProfile}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              >
                Save Profile
              </Button>
              {dashboard && (
                <Button
                  onClick={() => setEditingProfile(false)}
                  variant="outline"
                  className="flex-1 border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 overflow-y-auto scrollbar-hide p-4 ${className}`}>
      {/* Top Bar */}
      <div className="bg-white rounded border-3 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 border-3 border-black rounded shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <span className="text-lg font-bold">
                {new Date(currentMonth + "-01").toLocaleDateString("en-US", { 
                  month: "long", 
                  year: "numeric" 
                })}
              </span>
            </div>
            
            <button
              onClick={() => navigateMonth("next")}
              className="p-2 border-3 border-black rounded shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(dashboard.profile.incomeUsd)}
            </span>
            <button
              onClick={() => setEditingProfile(true)}
              className="ml-2 p-2 border-3 border-black rounded shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Status Pills */}
        <div className="flex gap-2 flex-wrap">
          <Badge className={`${getIndicatorColor(dashboard.kpis.savingsRate.indicator)} border-2 border-black px-3 py-1`}>
            Savings: {formatPercent(dashboard.kpis.savingsRate.value)}
          </Badge>
          <Badge className={`${getIndicatorColor(dashboard.kpis.essentialsShare.indicator)} border-2 border-black px-3 py-1`}>
            Essentials: {formatPercent(dashboard.kpis.essentialsShare.value)}
          </Badge>
          <Badge className="bg-blue-50 text-blue-600 border-2 border-black px-3 py-1">
            Runway: {dashboard.kpis.runway.value !== null 
              ? `${dashboard.kpis.runway.value.toFixed(1)} mo` 
              : "—"}
          </Badge>
        </div>
      </div>

      {/* KPIs Card */}
      <Card className="rounded border-3 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            Key Performance Indicators
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded border-2 border-black">
            <div>
              <p className="text-sm font-medium text-gray-700">Savings Rate</p>
              <p className="text-xs text-gray-500">Target: ≥35%</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">{formatPercent(dashboard.kpis.savingsRate.value)}</span>
              <span className={`px-2 py-1 rounded text-sm font-medium ${getIndicatorColor(dashboard.kpis.savingsRate.indicator)}`}>
                {dashboard.kpis.savingsRate.indicator === "green" ? "✓" : dashboard.kpis.savingsRate.indicator === "yellow" ? "!" : "✗"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded border-2 border-black">
            <div>
              <p className="text-sm font-medium text-gray-700">Essentials Share</p>
              <p className="text-xs text-gray-500">Target: ≤55%</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">{formatPercent(dashboard.kpis.essentialsShare.value)}</span>
              <span className={`px-2 py-1 rounded text-sm font-medium ${getIndicatorColor(dashboard.kpis.essentialsShare.indicator)}`}>
                {dashboard.kpis.essentialsShare.indicator === "green" ? "✓" : dashboard.kpis.essentialsShare.indicator === "yellow" ? "!" : "✗"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded border-2 border-black">
            <div>
              <p className="text-sm font-medium text-gray-700">Runway (Emergency Fund)</p>
              <p className="text-xs text-gray-500">Target: 6-12 months</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">
                {dashboard.kpis.runway.value !== null 
                  ? `${dashboard.kpis.runway.value.toFixed(1)} mo` 
                  : "—"}
              </span>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 text-center pt-2">
            Targets: Savings ≥35%, Essentials ≤55%
          </p>
        </CardContent>
      </Card>

      {/* Caps vs Actuals Card */}
      <Card className="rounded border-3 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-indigo-600" />
            Budget Caps vs Actuals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dashboard.drifts.map((drift) => {
            const percentage = drift.cap > 0 ? (drift.actual / drift.cap) * 100 : 0;
            const icon = drift.bucket === "INVEST" ? TrendingUp 
              : drift.bucket === "SINKING" ? Shield 
              : drift.bucket === "ESSENTIALS" ? Home 
              : Coffee;
            const Icon = icon;
            
            return (
              <div key={drift.bucket} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">{drift.bucket}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold">
                      {formatCurrency(drift.actual)} / {formatCurrency(drift.cap)}
                    </span>
                    {drift.delta !== 0 && (
                      <span className={`ml-2 text-xs ${drift.breached ? 'text-red-600' : 'text-green-600'}`}>
                        {drift.breached ? '+' : ''}{formatCurrency(drift.delta)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="relative h-6 bg-gray-200 rounded border-2 border-black overflow-hidden">
                  <div
                    className={`h-full ${getBarColor(drift.indicator)} transition-all duration-300`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                  {percentage > 100 && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                      {percentage.toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Coach/Nudge Card */}
      <Card className="rounded border-3 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Smart Coach
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-white rounded border-2 border-black">
            {dashboard.drifts.some(d => d.breached) ? (
              <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                {dashboard.drifts.some(d => d.breached)
                  ? "Some buckets are over budget. Run a weekly check for specific suggestions."
                  : "✨ On track! Roll any surplus to Investments ('No Zero Days')."}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleWeeklyCheck}
              disabled={weeklyCheckLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
            >
              {weeklyCheckLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Weekly Check
            </Button>
            
            <Button
              onClick={handleMonthlyReset}
              disabled={monthlyResetLoading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
            >
              {monthlyResetLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Calendar className="h-4 w-4 mr-2" />
              )}
              Monthly Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


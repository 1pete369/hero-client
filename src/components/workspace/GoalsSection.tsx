"use client"

import { useState, useEffect } from "react"
import { Target, Plus, Edit, Trash2, Calendar, ArrowRight, Crown } from "lucide-react"
import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  type Goal as ApiGoal,
  type CreateGoalData,
} from "@/services"

type Goal = ApiGoal

interface GoalsSectionProps {
  showAddForm: boolean
  setShowAddForm: (show: boolean) => void
}

export default function GoalsSection({ showAddForm, setShowAddForm }: GoalsSectionProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetDate: "",
    category: "personal",
    priority: "medium" as "low" | "medium" | "high",
  })

  // Load goals on mount
  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      setLoading(true)
      const data = await getGoals()
      setGoals(data)
    } catch (err) {
      console.error("Failed to load goals", err)
      toast.error("Failed to load goals")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingGoal) {
      try {
        const updated = await updateGoal(editingGoal._id, {
          title: formData.title,
          description: formData.description,
          targetDate: formData.targetDate,
          category: formData.category,
          priority: formData.priority,
        })
        setGoals(goals.map((g) => (g._id === updated._id ? updated : g)))
        setEditingGoal(null)
        toast.success("Goal updated successfully!")
      } catch (err) {
        console.error("Failed to update goal", err)
        toast.error("Failed to update goal")
      }
    } else {
      try {
        const payload: CreateGoalData = {
          title: formData.title,
          description: formData.description,
          targetDate: formData.targetDate,
          category: formData.category,
          priority: formData.priority,
        }
        const created = await createGoal(payload)
        setGoals([...goals, created])
        toast.success("Goal created successfully!")
      } catch (err: unknown) {
        console.error("Failed to create goal", err)
        
        // Check if it's a quota exceeded error
        if (err && typeof err === 'object' && 'response' in err) {
          const error = err as { response?: { status?: number; data?: { error?: string } } }
          if (error.response?.status === 403 && error.response?.data?.error?.includes("Quota exceeded")) {
            toast.error("Goal limit reached!")
            setShowUpgradeDialog(true)
          } else {
            toast.error("Failed to create goal. Please try again.")
          }
        } else {
          toast.error("Failed to create goal. Please try again.")
        }
      }
    }

    setFormData({
      title: "",
      description: "",
      targetDate: "",
      category: "personal",
      priority: "medium",
    })
    setShowAddForm(false)
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title,
      description: goal.description,
      targetDate: goal.targetDate,
      category: goal.category,
      priority: goal.priority || "medium",
    })
    setShowAddForm(true)
  }

  const handleDelete = async (goalId: string) => {
    try {
      await deleteGoal(goalId)
      setGoals(goals.filter((goal) => goal._id !== goalId))
      toast.success("Goal deleted successfully!")
    } catch (err) {
      console.error("Failed to delete goal", err)
      toast.error("Failed to delete goal")
    }
  }

  const getStatusColor = (status: Goal["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "business":
        return "bg-purple-100 text-purple-800"
      case "personal":
        return "bg-indigo-100 text-indigo-800"
      case "learning":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Urgency levels based on days to target date
  // high: overdue or <=3 days, medium: 4-7 days, low: 8-14 days, none: >14 days
  const getUrgencyLevel = (targetDateISO: string): "none" | "low" | "medium" | "high" => {
    if (!targetDateISO) return "none"
    const today = new Date()
    const target = new Date(targetDateISO)
    const utcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    const utcTarget = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate())
    const diffDays = Math.ceil((utcTarget - utcToday) / (1000 * 60 * 60 * 24))
    if (diffDays <= 3) return "high"
    if (diffDays <= 7) return "medium"
    if (diffDays <= 14) return "low"
    return "none"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add/Edit Form Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingGoal ? "Edit Goal" : "Create New Goal"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Goal Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter your goal"
                required
              />
            </div>

            {/* Category and Target Date Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Date</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) =>
                    setFormData({ ...formData, targetDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your goal in detail"
                rows={3}
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {editingGoal ? "Update Goal" : "Create Goal"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingGoal(null)
                  setFormData({
                    title: "",
                    description: "",
                    targetDate: "",
                    category: "personal",
                    priority: "medium",
                  })
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-start">
        {goals.map((goal) => {
          const urgency = getUrgencyLevel(goal.targetDate)
          const textClass =
            urgency === "high"
              ? "text-red-600"
              : urgency === "medium"
              ? "text-orange-600"
              : urgency === "low"
              ? "text-amber-600"
              : "text-gray-600"
          const iconClass =
            urgency === "high"
              ? "text-red-600"
              : urgency === "medium"
              ? "text-orange-500"
              : urgency === "low"
              ? "text-amber-500"
              : "text-gray-400"

          return (
            <div
              key={goal._id}
              className={`bg-white p-4 rounded-lg border border-gray-200 transition-shadow w-full`}
            >
              {/* Dates Row */}
              <div className={`flex items-center justify-between text-xs ${textClass} mb-2`}>
                <div className="flex items-center gap-2">
                  <Calendar className={`h-3.5 w-3.5 ${textClass}`} />
                  <span>{new Date(goal.createdAt).toLocaleDateString()}</span>
                </div>
                <ArrowRight className={`h-3.5 w-3.5 ${iconClass}`} />
                <div className="flex items-center gap-2">
                  <Calendar className={`h-3.5 w-3.5 ${textClass}`} />
                  <span>{new Date(goal.targetDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={`text-base font-semibold mb-1.5 ${
                    goal.status === "completed" && goal.targetDate && new Date(goal.targetDate) < new Date() 
                      ? "text-gray-500 line-through" 
                      : "text-gray-900"
                  }`}>
                    {goal.title}
                  </h3>
                  <p className={`text-sm mb-2 line-clamp-2 overflow-hidden text-ellipsis h-10 ${
                    goal.status === "completed" && goal.targetDate && new Date(goal.targetDate) < new Date() 
                      ? "text-gray-400" 
                      : "text-gray-600"
                  }`}>
                    {goal.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-6 w-6 hover:bg-gray-100"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => handleEdit(goal)}
                        disabled={goal.status === "completed" && !!goal.targetDate && new Date(goal.targetDate) < new Date()}
                        className={goal.status === "completed" && goal.targetDate && new Date(goal.targetDate) < new Date() ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        {goal.status === "completed" && goal.targetDate && new Date(goal.targetDate) < new Date() ? "Edit (Expired)" : "Edit"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(goal._id)}
                        className="text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Status and Category */}
              <div className="flex items-center justify-between mt-1 mb-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    goal.status
                  )}`}
                >
                  {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                    goal.category
                  )}`}
                >
                  {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="w-full bg-gray-200 h-8 relative overflow-hidden">
                  <div
                    className="bg-indigo-600 h-8 transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                  <div className={`absolute inset-0 flex items-center justify-center text-sm md:text-base font-semibold ${goal.progress > 50 ? "text-white" : "text-gray-800"}`}>
                    {goal.progress}%
                  </div>
                </div>
              </div>

              {/* Linked Habits */}
              <Accordion type="single" collapsible>
                <AccordionItem value={`habits-${goal._id}`} className="px-3 border-b-0">
                  <AccordionTrigger className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Linked Habits</span>
                      <span className="text-xs text-gray-500">({goal.linkedHabits?.length || 0})</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {goal.linkedHabits && goal.linkedHabits.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                        {goal.linkedHabits.map((h: unknown) => {
                          const habit = h as { _id?: string; name?: string; title?: string } | string
                          const key = typeof habit === "string" ? habit : habit._id || (habit.name || habit.title || "unknown")
                          const label = typeof habit === "string" ? habit : habit.name || habit.title || habit._id || "Habit"
                          return (
                            <li key={key}>
                              {label}
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <button
                        type="button"
                        className="text-sm text-indigo-600 hover:underline"
                        onClick={() => {/* TODO: open habits linking flow */}}
                      >
                        Add habits
                      </button>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Meta Info (reserved for future stats) */}
              <div className="space-y-2 text-sm text-gray-600"></div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {goals.length === 0 && !showAddForm && (
        <div className="text-center flex-1 min-h-0 grid place-items-center">
          <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No goals yet
          </h3>
          <p className="text-gray-600">
            Start by creating your first goal to track your progress
          </p>
        </div>
      )}

      {/* Plan Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <DialogTitle className="text-lg font-semibold">Upgrade Your Plan</DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-2">
                You&apos;ve reached the limit of 3 goals on the free plan.
              </p>
              <p className="text-sm text-gray-500">
                Upgrade to create unlimited goals and unlock more features!
              </p>
            </div>

            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Personal Plan</h4>
                    <p className="text-sm text-gray-500">10 goals • $9.99/month</p>
                  </div>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    Upgrade
                  </Button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Community Plan</h4>
                    <p className="text-sm text-gray-500">50 goals • $19.99/month</p>
                  </div>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    Upgrade
                  </Button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Premium Plan</h4>
                    <p className="text-sm text-gray-500">Unlimited goals • $29.99/month</p>
                  </div>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    Upgrade
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowUpgradeDialog(false)}
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button 
                onClick={() => {
                  // TODO: Implement upgrade flow
                  toast("Upgrade feature coming soon!", { icon: "ℹ️" })
                  setShowUpgradeDialog(false)
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                View Plans
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Plus, Edit, Trash2, Crown, Check, Link, MoreVertical } from "lucide-react"
import { ArrowPathIcon, CalendarIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { habitsService, type Habit, type CreateHabitData, getGoals, type Goal } from "@/services"
import toast from "react-hot-toast"
import { formatLocalDateYYYYMMDD, addDaysLocal, todayLocalISO, isoDateOnly } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface HabitsSectionProps {
  showAddForm: boolean
  setShowAddForm: (show: boolean) => void
}

export default function HabitsSection({ showAddForm, setShowAddForm }: HabitsSectionProps) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [openFreqTips, setOpenFreqTips] = useState<Record<string, boolean>>({})
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const getTomorrowISO = () => formatLocalDateYYYYMMDD(addDaysLocal(new Date(), 1))

  const [formData, setFormData] = useState<CreateHabitData>({
    title: "",
    frequency: "daily",
    days: [],
    startDate: getTomorrowISO(), // default to tomorrow for non-linked habits
    category: "personal",
    linkedGoalId: undefined,
  })

  // Load habits and goals on component mount
  useEffect(() => {
    loadHabits()
    loadGoals()
  }, [])

  const loadHabits = async () => {
    try {
      setLoading(true)
      const data = await habitsService.getHabits()
      setHabits(data)
    } catch (error) {
      console.error("Failed to load habits", error)
      toast.error("Failed to load habits")
    } finally {
      setLoading(false)
    }
  }

  const loadGoals = async () => {
    try {
      const data = await getGoals()
      setGoals(data)
    } catch (error) {
      console.error("Failed to load goals", error)
      // goals are optional for habits; do not toast here
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      if (editingHabit) {
        // Update existing habit
        const updatedHabit = await habitsService.updateHabit({
          _id: editingHabit._id,
          ...formData
        })
        setHabits(habits.map(habit => 
          habit._id === editingHabit._id ? updatedHabit : habit
        ))
        setEditingHabit(null)
        toast.success("Habit updated successfully!")
      } else {
        // Create new habit
        const newHabit = await habitsService.createHabit(formData)
        setHabits([...habits, newHabit])
        toast.success("Habit created successfully!")
      }
      
      resetForm()
    } catch (err: unknown) {
      console.error("Failed to save habit", err)
      
      // Check if it's a quota exceeded error
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { status?: number; data?: { error?: string } } }
        if (error.response?.status === 403 && error.response?.data?.error?.includes("Quota exceeded")) {
          toast.error("Habit limit reached!")
          setShowUpgradeDialog(true)
        } else {
          toast.error("Failed to save habit. Please try again.")
        }
      } else {
        toast.error("Failed to save habit. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit)
    // Normalize linkedGoalId for the form (string id or "none")
    let goalId = "none"
    if (habit.linkedGoalId) {
      if (typeof habit.linkedGoalId === 'string') {
        goalId = habit.linkedGoalId
      } else if (typeof habit.linkedGoalId === 'object' && habit.linkedGoalId && '_id' in habit.linkedGoalId) {
        goalId = (habit.linkedGoalId as { _id: string })._id
      }
    }

    setFormData({
      title: habit.title,
      frequency: habit.frequency,
      days: habit.days,
      startDate: isoDateOnly(habit.startDate),
      category: habit.category,
      linkedGoalId: goalId === "none" ? undefined : goalId,
    })
    setShowAddForm(true)
  }

  // When switching to weekly, default the weekday to today's (single-select)
  useEffect(() => {
    if (formData.frequency === 'weekly' && (!(formData.days && formData.days.length > 0))) {
      const map = ['sun','mon','tue','wed','thu','fri','sat']
      const todayKey = map[new Date().getDay()]
      setFormData((prev) => ({ ...prev, days: [todayKey] }))
    }
    if (formData.frequency !== 'weekly' && ((formData.days?.length ?? 0) > 0)) {
      setFormData((prev) => ({ ...prev, days: [] }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.frequency])

  const handleDelete = async (habitId: string) => {
    try {
      setDeletingId(habitId)
      await habitsService.deleteHabit(habitId)
      setHabits(habits.filter(habit => habit._id !== habitId))
      toast.success("Habit deleted successfully!")
    } catch (error) {
      console.error("Failed to delete habit", error)
      toast.error("Failed to delete habit")
    } finally {
      setDeletingId(null)
      setDeleteConfirmId(null)
    }
  }

  const toggleTodayCompletion = async (habitId: string) => {
    try {
      const updatedHabit = await habitsService.toggleTodayCompletion(habitId)
      setHabits(habits.map(habit => 
        habit._id === habitId ? updatedHabit : habit
      ))
      const isCompleted = isCompletedToday(updatedHabit)
      toast.success(isCompleted ? "Habit completed!" : "Habit marked incomplete")
    } catch (error) {
      console.error("Failed to toggle habit completion", error)
      // Surface backend message (e.g., weekly rule violations)
      const msg = (error as any)?.response?.data?.error || "Failed to update habit"
      toast.error(msg)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      frequency: "daily",
      days: [],
      startDate: todayLocalISO(),
      category: "personal",
      linkedGoalId: undefined,
    })
    setShowAddForm(false)
    setEditingHabit(null)
  }

  const toggleFreqTooltip = (habitId: string) => {
    setOpenFreqTips((prev) => ({ ...prev, [habitId]: !prev[habitId] }))
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "personal": return "bg-blue-100 text-blue-800"
      case "health": return "bg-green-100 text-green-800"
      case "learning": return "bg-purple-100 text-purple-800"
      case "business": return "bg-indigo-100 text-indigo-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case "daily": return "Daily"
      case "weekly": return "Weekly"
      case "monthly": return "Monthly"
      default: return frequency
    }
  }

  const isCompletedToday = (habit: Habit) => {
    const today = todayLocalISO()
    return habit.completedDates.some(date => 
      formatLocalDateYYYYMMDD(new Date(date)) === today
    )
  }

  return (
    <div className="space-y-6">

      {/* Add/Edit Form Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-lg border-solid border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingHabit ? "Edit Habit" : "Create New Habit"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Habit Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Habit Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter your habit"
                required
                className="border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none"
              />
            </div>

            {/* Category and Start Date Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger className="w-full" disabled={Boolean(formData.linkedGoalId)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
                {formData.linkedGoalId && (
                  <span className="text-[10px] text-gray-500">Locked by linked goal</span>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                  disabled={Boolean(formData.linkedGoalId)}
                  className="w-full border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus-visible:ring-0 focus:ring-0 focus-visible:outline-none focus:outline-none disabled:bg-gray-50"
                />
                {!formData.linkedGoalId && (
                  <span className="text-[10px] text-gray-500">Defaults to tomorrow</span>
                )}
              </div>
            </div>

            {/* Frequency Row */}
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => {
                  const nextFreq = value as 'daily' | 'weekly' | 'monthly'
                  if (nextFreq === 'weekly') {
                    const map = ['sun','mon','tue','wed','thu','fri','sat']
                    const todayKey = map[new Date().getDay()]
                    setFormData({ ...formData, frequency: nextFreq, days: [todayKey] })
                  } else {
                    setFormData({ ...formData, frequency: nextFreq, days: [] })
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              {formData.frequency === 'weekly' && (
                <div className="mt-2">
                  <Label className="mb-1 block text-xs text-gray-600">Pick a weekday</Label>
                  <div className="grid grid-cols-7 gap-1">
                    {['sun','mon','tue','wed','thu','fri','sat'].map((d) => {
                      const active = (formData.days?.[0] === d)
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setFormData({ ...formData, days: [d] })}
                          className={`text-xs py-1.5 rounded border transition-colors ${
                            active
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {d.toUpperCase()}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">Weekly habits can be marked once per week, on the selected weekday.</p>
                </div>
              )}
            </div>

            {/* Goal Linking Row */}
            <div className="space-y-2">
              <Label>Link to Goal (Optional)</Label>
              <Select
                value={(formData.linkedGoalId as string | undefined) || "none"}
                onValueChange={(value) => {
                  if (value === "none") {
                    // unlink → restore editable fields and default start date to tomorrow
                    setFormData({
                      ...formData,
                      linkedGoalId: undefined,
                      startDate: getTomorrowISO(),
                    })
                    return
                  }
                  // Link to goal → lock category; set startDate to today (not goal end date)
                  const g = goals.find(g => g._id === value)
                  const todayISO = todayLocalISO()
                  setFormData({
                    ...formData,
                    linkedGoalId: value,
                    category: g?.category || formData.category,
                    startDate: todayISO,
                  })
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No goal</SelectItem>
                  {goals.map((goal) => (
                    <SelectItem key={goal._id} value={goal._id}>
                      {goal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              >
                {loading ? "Saving..." : editingHabit ? "Update Habit" : "Create Habit"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={loading}
                className="flex-1 border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-start px-2">
        {habits.map((habit) => (
          <div
            key={habit._id}
            className="transition-all bg-white h-auto min-h-[96px] w-full rounded border-solid border-3 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
          >
            {/* Top Section - Title and Actions */}
            <div className="flex items-center justify-between px-3 pt-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {(() => {
                  const toggleId = `habit-${habit._id}-toggle`
                  const map = ['sun','mon','tue','wed','thu','fri','sat']
                  const todayKey = map[new Date().getUTCDay()]
                  const weeklyLocked = habit.frequency === 'weekly' && (!habit.days || habit.days.length === 0 || !habit.days.includes(todayKey))
                  const disabledToggle = habit.status === "completed" || weeklyLocked
                  const checked = isCompletedToday(habit)
                  return (
                    <input
                      id={toggleId}
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => !disabledToggle && toggleTodayCompletion(habit._id)}
                      disabled={disabledToggle}
                    />
                  )
                })()}
                <Button
                  onClick={() => {
                    const map = ['sun','mon','tue','wed','thu','fri','sat']
                    const todayKey = map[new Date().getUTCDay()]
                    if (habit.frequency === 'weekly' && (!habit.days || habit.days.length === 0 || !habit.days.includes(todayKey))) {
                      toast.error(`This weekly habit can only be completed on ${habit.days?.join(', ').toUpperCase() || 'its selected day'}.`)
                      return
                    }
                    toggleTodayCompletion(habit._id)
                  }}
                  disabled={(() => {
                    const map = ['sun','mon','tue','wed','thu','fri','sat']
                    const todayKey = map[new Date().getUTCDay()]
                    const weeklyLocked = habit.frequency === 'weekly' && (!habit.days || habit.days.length === 0 || !habit.days.includes(todayKey))
                    return habit.status === "completed" || weeklyLocked
                  })()}
                  className={`h-8 w-8 rounded-full border-1 border-green-500 p-0 shrink-0 ${
                    (() => {
                      const map = ['sun','mon','tue','wed','thu','fri','sat']
                      const todayKey = map[new Date().getUTCDay()]
                      const weeklyLocked = habit.frequency === 'weekly' && (!habit.days || habit.days.length === 0 || !habit.days.includes(todayKey))
                      if (habit.status === "completed" || weeklyLocked) return "bg-gray-100 text-gray-400 cursor-not-allowed"
                      return isCompletedToday(habit)
                        ? "bg-green-500 text-white hover:bg-green-600 hover:text-white"
                        : "bg-white hover:bg-green-50 text-gray-600 hover:text-gray-700"
                    })()
                  }`}
                >
                  {isCompletedToday(habit) && <Check className="h-4 w-4" />}
                </Button>
                <div className="flex flex-col justify-between gap-1 flex-1 min-w-0">
                  <label
                    htmlFor={`habit-${habit._id}-toggle`}
                    className={`text-sm font-semibold truncate cursor-pointer ${
                    isCompletedToday(habit) || (habit.status === "completed" && habit.endDate && new Date(habit.endDate) < new Date())
                      ? "line-through text-gray-400"
                      : "text-gray-900"
                  }`}
                  >
                    {habit.title}
                  </label>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-6 w-6 hover:bg-gray-100"
                        aria-label="Habit actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36 rounded border-solid border-3 border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                      <DropdownMenuItem
                        onClick={() => handleEdit(habit)}
                        className={`${(habit.status === "completed" && habit.endDate && new Date(habit.endDate) < new Date()) ? "pointer-events-none opacity-50" : "hover:bg-indigo-50"}`}
                      >
                        <Edit className="mr-2 h-4 w-4 text-gray-700" />
                        <span className="text-gray-700">Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteConfirmId(habit._id)}
                        className="flex items-center gap-3 cursor-pointer text-red-600 hover:bg-red-100 focus:bg-red-100"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span className="text-red-600">Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Weekly Progress Section */}
            <div className="px-3 py-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">This week</span>
                <div className="flex items-center gap-1">
                  <span className="text-orange-500 text-sm">🔥</span>
                  <span className="text-gray-700 font-semibold text-sm">
                    {habit.streak}
                  </span>
                </div>
              </div>
              
              {/* 7-day progress boxes */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {(() => {
                  const today = new Date();
                  const days = [];
                  
                  // Generate last 7 days
                  for (let i = 6; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    const dateStr = formatLocalDateYYYYMMDD(date);
                    
                    // Check if habit was completed on this date
                    const isCompleted = habit.completedDates.some(completedDate => 
                      formatLocalDateYYYYMMDD(new Date(completedDate)) === dateStr
                    );
                    
                    // Check if it's today
                    const isToday = i === 0;
                    
                    const tooltipText = `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}${isCompleted ? ' ✓' : ''}`
                    days.push(
                      <div key={dateStr} className="relative group">
                        <div
                          className={`w-4 h-4 rounded ${
                            isCompleted
                              ? 'bg-green-500'
                              : isToday
                              ? 'bg-gray-300'
                              : 'bg-gray-200'
                          }`}
                        />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          {tooltipText}
                        </div>
                      </div>
                    );
                  }
                  
                  return days;
                })()}
                </div>
                {habit.status === 'completed' && (
                  <span className="ml-3 text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">Completed</span>
                )}
              </div>
            </div>

            {/* Bottom Section - Category and Goal Link */}
            <div className="flex items-center justify-between px-3 py-2 text-xs text-gray-600 border-t border-gray-100">
              {/* Left: Category */}
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(habit.category)}`}>
                  {habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
                </span>
                <span className="text-gray-500">
                  {getFrequencyText(habit.frequency)}
                </span>
              </div>
              {/* Right: Frequency (Heroicons) icon + Goal Link with mobile-friendly tooltips */}
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => toggleFreqTooltip(habit._id)}
                    className="text-gray-600 inline-flex items-center gap-1"
                    aria-label="Frequency"
                  >
                    {habit.frequency === 'daily' && <ArrowPathIcon className="h-4 w-4" />}
                    {habit.frequency === 'weekly' && (
                      <span className="relative inline-flex items-center">
                        <ArrowPathIcon className="h-4 w-4" />
                        <span className="absolute -top-1 -right-1 text-[9px] bg-gray-100 text-gray-600 border border-gray-200 rounded px-0.5 leading-none">7</span>
                      </span>
                    )}
                    {habit.frequency === 'monthly' && <CalendarIcon className="h-4 w-4" />}
                  </button>
                  <div
                    className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-10 ${
                      openFreqTips[habit._id] ? 'opacity-100' : 'opacity-0'
                    } group-hover:opacity-100 transition-opacity duration-200`}
                  >
                    {getFrequencyText(habit.frequency)}
                  </div>
                </div>
                {habit.linkedGoalId && (
                <div className="relative group">
                  <div className="text-indigo-600 cursor-help">
                    <Link className="h-3 w-3" />
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    {(() => {
                      if (typeof habit.linkedGoalId === 'object' && habit.linkedGoalId && 'title' in habit.linkedGoalId) {
                        const goal = habit.linkedGoalId as { title: string; isCompleted?: boolean };
                        return `${goal.title}${goal.isCompleted ? ' ✓' : ''}`;
                      }
                      const goalId = typeof habit.linkedGoalId === 'string'
                        ? habit.linkedGoalId
                        : (habit.linkedGoalId as { _id: string })?._id;
                      const linkedGoal = goals.find(g => g._id === goalId);
                      return linkedGoal ? `${linkedGoal.title}${(linkedGoal as any).isCompleted ? ' ✓' : ''}` : 'Unknown Goal';
                    })()}
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {habits.length === 0 && !loading && (
        <div className="text-center flex-1 min-h-0 grid place-items-center">
          <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
          <p className="text-gray-600">Start building your first habit to create lasting change</p>
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
                You&apos;ve reached the limit of 5 habits on the free plan.
              </p>
              <p className="text-sm text-gray-500">
                Upgrade to create unlimited habits and unlock more features!
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="font-medium text-gray-900">Free Plan</div>
                <div className="text-sm text-gray-600">5 habits limit</div>
              </div>
              <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                <div className="font-medium text-green-900">Pro Plan</div>
                <div className="text-sm text-green-700">Unlimited habits + analytics</div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowUpgradeDialog(false)}
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button
                onClick={() => {
                  setShowUpgradeDialog(false)
                  // TODO: Navigate to pricing page
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                View Plans
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteConfirmId)} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null) }}>
        <DialogContent className="max-w-sm border-solid border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Delete Habit?</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-700">
            This action cannot be undone. Do you really want to delete this habit?
          </div>
          <div className="flex gap-3 pt-3">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              className="flex-1 border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={Boolean(deletingId)}
              className="flex-1 bg-red-600 hover:bg-red-700 border-3 border-black rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
            >
              {deletingId ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}



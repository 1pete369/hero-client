"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Plus, Edit, Trash2, Crown, Check, Link, MoreVertical } from "lucide-react"
import { ArrowPathIcon, CalendarIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { habitsService, type Habit, type CreateHabitData, getGoals, type Goal } from "@/services"
import toast from "react-hot-toast"
import { formatLocalDateYYYYMMDD, addDaysLocal, todayLocalISO, isoDateOnly } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import confetti from "canvas-confetti"
import { triggerCompletionCelebration } from "@/lib/utils"

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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [streakPulse, setStreakPulse] = useState<string | null>(null) // Track which habit's streak is pulsing
  const getTomorrowISO = () => formatLocalDateYYYYMMDD(addDaysLocal(new Date(), 1))

  const getRandomColor = () => {
    const colors = ["blue", "green", "purple", "orange", "red", "pink", "indigo", "teal", "yellow", "gray"] as const
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const [formData, setFormData] = useState<CreateHabitData>({
    title: "",
    frequency: "daily",
    days: [],
    startDate: getTomorrowISO(), // default to tomorrow for non-linked habits
    category: "personal",
    linkedGoalId: undefined,
    color: getRandomColor(),
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
      color: habit.color || "blue",
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
      const oldHabit = habits.find(h => h._id === habitId)
      const oldStreak = oldHabit?.streak || 0
      
      const updatedHabit = await habitsService.toggleTodayCompletion(habitId)
      setHabits(habits.map(habit => 
        habit._id === habitId ? updatedHabit : habit
      ))
      const isCompleted = isCompletedToday(updatedHabit)
      
      // Trigger confetti and sound when marking as complete
      if (isCompleted) {
        triggerCompletionCelebration(`habit-toggle-${habitId}`, { angle: 70, spread: 40, startVelocity: 40 })

        // Trigger flame pulse animation if streak increased
        if (updatedHabit.streak > oldStreak) {
          setStreakPulse(habitId)
          setTimeout(() => setStreakPulse(null), 800)
        }
      }
      
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
      color: getRandomColor(),
    })
    setShowAddForm(false)
    setEditingHabit(null)
  }

  // Auto-update color when linkedGoalId changes (inherit from goal)
  useEffect(() => {
    if (formData.linkedGoalId) {
      const linkedGoal = goals.find(g => g._id === formData.linkedGoalId)
      if (linkedGoal && linkedGoal.color) {
        setFormData(prev => ({ ...prev, color: linkedGoal.color }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.linkedGoalId, goals])

  // Randomize color when opening a fresh create form (not editing)
  useEffect(() => {
    if (showAddForm && !editingHabit) {
      setFormData((prev) => ({ ...prev, color: getRandomColor() }))
    }
  }, [showAddForm, editingHabit])

  const getHabitColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-400 text-black",
      green: "bg-green-400 text-black",
      purple: "bg-purple-400 text-black",
      orange: "bg-orange-400 text-black",
      red: "bg-red-400 text-black",
      pink: "bg-pink-400 text-black",
      indigo: "bg-indigo-400 text-black",
      teal: "bg-teal-400 text-black",
      yellow: "bg-yellow-300 text-black",
      gray: "bg-gray-400 text-black",
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  const getCompletedDayColor = (color: string) => {
    const colorMap = {
      blue: "bg-blue-400 border-2 border-white",
      green: "bg-green-400 border-2 border-white",
      purple: "bg-purple-400 border-2 border-white",
      orange: "bg-orange-400 border-2 border-white",
      red: "bg-red-400 border-2 border-white",
      pink: "bg-pink-400 border-2 border-white",
      indigo: "bg-indigo-400 border-2 border-white",
      teal: "bg-teal-400 border-2 border-white",
      yellow: "bg-yellow-300 border-2 border-white",
      gray: "bg-gray-400 border-2 border-white",
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  const getCategoryColor = (category: string) => {
    return "bg-white text-black border-2 border-black font-semibold"
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
    <TooltipProvider>
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
                  <Label className="mb-1 block text-xs text-gray-600">Pick weekdays</Label>
                  <div className="grid grid-cols-7 gap-1">
                    {[
                      { key: 'sun', label: 'SUN' },
                      { key: 'mon', label: 'MON' },
                      { key: 'tue', label: 'TUE' },
                      { key: 'wed', label: 'WED' },
                      { key: 'thu', label: 'THU' },
                      { key: 'fri', label: 'FRI' },
                      { key: 'sat', label: 'SAT' },
                    ].map((day) => {
                      const active = Array.isArray(formData.days) && formData.days.includes(day.key)
                      return (
                        <button
                          key={day.key}
                          type="button"
                          onClick={() => {
                            const current = Array.isArray(formData.days) ? formData.days : []
                            const next = active
                              ? current.filter((d) => d !== day.key)
                              : [...current, day.key]
                            setFormData({ ...formData, days: next })
                          }}
                          className={`text-xs py-1.5 rounded border transition-colors font-semibold ${
                            active
                              ? "bg-black border-black text-white"
                              : "bg-white border-gray-300 text-black hover:bg-gray-50"
                          }`}
                        >
                          {day.label}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">Weekly habits can be marked on any selected weekdays.</p>
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

            {/* Color */}
            <div className="space-y-2">
              <Label>Color {formData.linkedGoalId && <span className="text-[10px] text-gray-500">(Inherited from goal)</span>}</Label>
              <div className="grid grid-cols-10 gap-2 w-full">
                {[
                  { value: "blue", color: "bg-blue-500", borderColor: "border-blue-600" },
                  { value: "green", color: "bg-green-500", borderColor: "border-green-600" },
                  { value: "purple", color: "bg-purple-500", borderColor: "border-purple-600" },
                  { value: "orange", color: "bg-orange-500", borderColor: "border-orange-600" },
                  { value: "red", color: "bg-red-500", borderColor: "border-red-600" },
                  { value: "pink", color: "bg-pink-500", borderColor: "border-pink-600" },
                  { value: "indigo", color: "bg-indigo-500", borderColor: "border-indigo-600" },
                  { value: "teal", color: "bg-teal-500", borderColor: "border-teal-600" },
                  { value: "yellow", color: "bg-yellow-500", borderColor: "border-yellow-600" },
                  { value: "gray", color: "bg-gray-500", borderColor: "border-gray-600" },
                ].map((colorOption) => (
                  <label
                    key={colorOption.value}
                    className="cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="habit-color"
                      value={colorOption.value}
                      checked={formData.color === colorOption.value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          color: e.target.value as "blue" | "green" | "purple" | "orange" | "red" | "pink" | "indigo" | "teal" | "yellow" | "gray",
                        })
                      }
                      disabled={Boolean(formData.linkedGoalId)}
                      className="sr-only"
                    />
                    <div
                      className={`w-7 h-7 rounded-full ${colorOption.color} transition-transform ${
                        formData.color === colorOption.value
                          ? "border-3 border-black"
                          : "border-0"
                      } ${formData.linkedGoalId ? "opacity-50 cursor-not-allowed" : ""}`}
                    />
                  </label>
                ))}
              </div>
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
            className={`transition-all h-auto min-h-[96px] w-full rounded border-solid border-3 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1),0_0_6px_rgba(0,0,0,0.1)] ${getHabitColorClasses(habit.color || "blue")}`}
          >
            {/* Top Section - Title and Actions */}
            <div className="flex items-center justify-between px-3 pt-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Checkbox
                  id={`habit-toggle-${habit._id}`}
                  checked={isCompletedToday(habit)}
                  onCheckedChange={(checked) => {
                    const map = ['sun','mon','tue','wed','thu','fri','sat']
                    const todayKey = map[new Date().getDay()]
                    if (habit.frequency === 'weekly' && (!habit.days || habit.days.length === 0 || !habit.days.includes(todayKey))) {
                      toast.error(`This weekly habit can only be completed on ${habit.days?.join(', ').toUpperCase() || 'its selected day'}.`)
                      return
                    }
                    toggleTodayCompletion(habit._id)
                  }}
                  disabled={(() => {
                    const map = ['sun','mon','tue','wed','thu','fri','sat']
                    const todayKey = map[new Date().getDay()]
                    const weeklyLocked = habit.frequency === 'weekly' && (!habit.days || habit.days.length === 0 || !habit.days.includes(todayKey))
                    return habit.status === "completed" || weeklyLocked
                  })()}
                  className={`h-8 w-8 rounded-full border-2 border-black checkbox-bouncy data-[state=checked]:bg-black data-[state=checked]:border-black data-[state=checked]:text-white shrink-0 ${
                    (() => {
                      const map = ['sun','mon','tue','wed','thu','fri','sat']
                      const todayKey = map[new Date().getDay()]
                      const weeklyLocked = habit.frequency === 'weekly' && (!habit.days || habit.days.length === 0 || !habit.days.includes(todayKey))
                      if (habit.status === "completed" || weeklyLocked) return "opacity-50 cursor-not-allowed"
                      return ""
                    })()
                  }`}
                />
                <div className="flex flex-col justify-between gap-1 flex-1 min-w-0">
                  <label
                    htmlFor={`habit-toggle-${habit._id}`}
                    className={`text-sm font-semibold truncate ${
                    (() => {
                      const map = ['sun','mon','tue','wed','thu','fri','sat']
                      const todayKey = map[new Date().getDay()]
                      const weeklyLocked = habit.frequency === 'weekly' && (!habit.days || habit.days.length === 0 || !habit.days.includes(todayKey))
                      const isDisabled = habit.status === "completed" || weeklyLocked
                      const isStrikethrough = isCompletedToday(habit) || (habit.status === "completed" && habit.endDate && new Date(habit.endDate) < new Date())
                    
                    if (isStrikethrough) return "line-through text-black/70 " + (isDisabled ? "cursor-not-allowed" : "cursor-pointer")
                    return "text-black font-semibold " + (isDisabled ? "cursor-not-allowed" : "cursor-pointer")
                  })()
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
              {/* 7-day progress boxes (Sunday to Saturday) + Streak */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {(() => {
                  const today = new Date();
                  const todayDay = today.getDay(); // 0 = Sunday, 6 = Saturday
                  const days = [];
                  
                  // Calculate the start of the week (Sunday)
                  const startOfWeek = new Date(today);
                  startOfWeek.setDate(today.getDate() - todayDay);
                  
                  // Generate Sunday to Saturday
                  for (let i = 0; i < 7; i++) {
                    const date = new Date(startOfWeek);
                    date.setDate(startOfWeek.getDate() + i);
                    const dateStr = formatLocalDateYYYYMMDD(date);
                    
                    // Check if habit was completed on this date
                    const isCompleted = habit.completedDates.some(completedDate => 
                      formatLocalDateYYYYMMDD(new Date(completedDate)) === dateStr
                    );
                    
                    // Check if it's today
                    const isToday = i === todayDay;
                    
                    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                    const tooltipText = `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}${isCompleted ? ' ✓' : ''}`
                    
                    days.push(
                      <Tooltip key={dateStr}>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[9px] font-bold text-black/60">{dayNames[i]}</span>
                            <div
                              className={`w-5 h-5 rounded cursor-pointer transition-all ${
                                isCompleted
                                  ? getCompletedDayColor(habit.color || 'blue')
                                  : isToday
                                  ? 'bg-white border-2 border-black'
                                  : 'bg-white/50'
                              }`}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{tooltipText}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }
                  
                  return days;
                })()}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="relative">
                      <img 
                        src="/flames.png" 
                        alt="Streak" 
                        className={`w-6 h-6 drop-shadow-md transition-all ${
                          streakPulse === habit._id 
                            ? 'animate-[pulse_0.8s_ease-in-out] scale-125' 
                            : ''
                        }`}
                        style={{
                          filter: 'drop-shadow(0 0 8px rgba(255,100,0,0.4))'
                        }}
                      />
                    </div>
                    <span className="text-black font-semibold text-sm">
                      {habit.streak}
                    </span>
                  </div>
                  {habit.status === 'completed' && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white text-black border-2 border-black font-semibold">Completed</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Section - Category and Goal Link */}
            <div className="flex items-center justify-between px-3 py-2 text-xs text-black font-semibold border-t-2 border-black/30">
              {/* Left: Category */}
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(habit.category)}`}>
                  {habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
                </span>
                <span className="text-black/70 font-semibold">
                  {getFrequencyText(habit.frequency)}
                </span>
              </div>
              {/* Right: Frequency (Heroicons) icon + Goal Link with tooltips */}
              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-black inline-flex items-center gap-1"
                      aria-label="Frequency"
                    >
                      {habit.frequency === 'daily' && <ArrowPathIcon className="h-4 w-4" />}
                      {habit.frequency === 'weekly' && (
                        <span className="relative inline-flex items-center">
                          <ArrowPathIcon className="h-4 w-4" />
                          <span className="absolute -top-1 -right-1 text-[9px] bg-white text-black border-2 border-black rounded px-0.5 leading-none font-bold">{habit.days?.length ?? 0}</span>
                        </span>
                      )}
                      {habit.frequency === 'monthly' && <CalendarIcon className="h-4 w-4" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getFrequencyText(habit.frequency)}</p>
                  </TooltipContent>
                </Tooltip>
                {habit.linkedGoalId && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-indigo-600 cursor-help">
                        <Link className="h-3 w-3" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
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
                      </p>
                    </TooltipContent>
                  </Tooltip>
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
    </TooltipProvider>
  )
}



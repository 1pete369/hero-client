"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Plus, Edit, Trash2, Crown, Check, Link } from "lucide-react"
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
  const [formData, setFormData] = useState<CreateHabitData>({
    title: "",
    frequency: "daily",
    days: [],
    startDate: new Date().toISOString().split('T')[0],
    category: "personal"
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
      // Don't show error toast for goals as it's not critical
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
    
    // Handle linkedGoalId - it might be an object (populated) or string (ID)
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
      startDate: habit.startDate.split('T')[0], // Convert to YYYY-MM-DD format
      category: habit.category,
      linkedGoalId: goalId
    })
    setShowAddForm(true)
  }

  const handleDelete = async (habitId: string) => {
    if (!confirm("Are you sure you want to delete this habit?")) return
    
    try {
      await habitsService.deleteHabit(habitId)
      setHabits(habits.filter(habit => habit._id !== habitId))
      toast.success("Habit deleted successfully!")
    } catch (error) {
      console.error("Failed to delete habit", error)
      toast.error("Failed to delete habit")
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
      toast.error("Failed to update habit")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      frequency: "daily",
      days: [],
      startDate: new Date().toISOString().split('T')[0],
      category: "personal",
      linkedGoalId: "none"
    })
    setShowAddForm(false)
    setEditingHabit(null)
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
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    return habit.completedDates.some(date => 
      new Date(date).toISOString().split('T')[0] === today
    )
  }

  return (
    <div className="space-y-6">

      {/* Add/Edit Form Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-lg">
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
              />
            </div>

            {/* Category, Frequency and Start Date Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => setFormData({...formData, frequency: value as 'daily' | 'weekly' | 'monthly'})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Goal Linking Row */}
            <div className="space-y-2">
              <Label>Link to Goal (Optional)</Label>
              <Select
                value={formData.linkedGoalId || "none"}
                onValueChange={(value) => setFormData({...formData, linkedGoalId: value === "none" ? undefined : value})}
              >
                <SelectTrigger>
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
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? "Saving..." : editingHabit ? "Update Habit" : "Create Habit"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Habits Grid */}
      <div className="flex flex-wrap gap-4">
        {habits.map((habit) => (
          <div
            key={habit._id}
            className="transition-all bg-white h-auto min-h-[96px] w-[320px] rounded-lg border border-gray-200"
          >
            {/* Top Section - Title and Actions */}
            <div className="flex items-center justify-between px-3 pt-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Button
                  onClick={() => toggleTodayCompletion(habit._id)}
                  className={`h-8 w-8 rounded-full border-1 border-green-500 p-0 shrink-0 ${
                    isCompletedToday(habit)
                      ? "bg-green-500 text-white hover:bg-green-600 hover:text-white"
                      : "bg-white hover:bg-green-50 text-gray-600 hover:text-gray-700"
                  }`}
                >
                  {isCompletedToday(habit) && <Check className="h-4 w-4" />}
                </Button>
                <div className="flex flex-col justify-between gap-1 flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold truncate ${
                    isCompletedToday(habit)
                      ? "line-through text-gray-400"
                      : "text-gray-900"
                  }`}>
                    {habit.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(habit)}
                    className="p-1 h-6 w-6 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(habit._id)}
                    className="p-1 h-6 w-6 hover:bg-gray-100 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
              <div className="flex gap-1">
                {(() => {
                  const today = new Date();
                  const days = [];
                  
                  // Generate last 7 days
                  for (let i = 6; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    
                    // Check if habit was completed on this date
                    const isCompleted = habit.completedDates.some(completedDate => 
                      new Date(completedDate).toISOString().split('T')[0] === dateStr
                    );
                    
                    // Check if it's today
                    const isToday = i === 0;
                    
                    days.push(
                      <div
                        key={dateStr}
                        className={`w-4 h-4 rounded ${
                          isCompleted
                            ? 'bg-green-500'
                            : isToday
                            ? 'bg-gray-300'
                            : 'bg-gray-200'
                        }`}
                        title={`${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}${isCompleted ? ' ✓' : ''}`}
                      />
                    );
                  }
                  
                  return days;
                })()}
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
              
              {/* Right: Goal Link */}
              {habit.linkedGoalId && (
                <div className="relative group">
                  <div className="text-indigo-600 cursor-help">
                    <Link className="h-3 w-3" />
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    {(() => {
                      // If linkedGoalId is already a populated object, use it directly
                      if (typeof habit.linkedGoalId === 'object' && habit.linkedGoalId && 'title' in habit.linkedGoalId) {
                        const goal = habit.linkedGoalId as { title: string; isCompleted: boolean };
                        return `${goal.title}${goal.isCompleted ? ' ✓' : ''}`;
                      }
                      
                      // Otherwise, find the goal by ID
                      const goalId = typeof habit.linkedGoalId === 'string' 
                        ? habit.linkedGoalId 
                        : (habit.linkedGoalId as { _id: string })?._id;
                      
                      const linkedGoal = goals.find(g => g._id === goalId);
                      return linkedGoal ? `${linkedGoal.title}${linkedGoal.isCompleted ? ' ✓' : ''}` : 'Unknown Goal';
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {habits.length === 0 && !loading && (
        <div className="text-center py-12">
          <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
          <p className="text-gray-600 mb-4">Start building your first habit to create lasting change</p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Habit
          </Button>
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
    </div>
  )
}



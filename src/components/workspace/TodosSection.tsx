"use client"

import { useState, useEffect } from "react"
import {
  CheckCircle,
  Edit,
  Trash2,
  Clock,
  MoreVertical,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoStatus,
  type Todo,
} from "@/services"
import ConflictWarningDialog from "@/components/ui/ConflictWarningDialog"
import { detectTimeConflicts, type TimeConflict } from "@/utils/timeConflict"

// Time formatting helper
const formatTo12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
}

// Color utility function
const getTodoColorClasses = (color: string) => {
  const colorMap = {
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    green: "bg-green-50 border-green-200 text-green-900",
    purple: "bg-purple-50 border-purple-200 text-purple-900",
    orange: "bg-orange-50 border-orange-200 text-orange-900",
    red: "bg-red-50 border-red-200 text-red-900",
    pink: "bg-pink-50 border-pink-200 text-pink-900",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-900",
    teal: "bg-teal-50 border-teal-200 text-teal-900",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-900",
    gray: "bg-gray-50 border-gray-200 text-gray-900",
  }
  return colorMap[color as keyof typeof colorMap] || colorMap.blue
}

// Checkbox color utility to match todo color
const getCheckboxColorClasses = (color: string) => {
  const map: Record<string, string> = {
    blue: "border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500",
    green: "border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500",
    purple: "border-purple-500 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500",
    orange: "border-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500",
    red: "border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500",
    pink: "border-pink-500 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500",
    indigo: "border-indigo-500 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500",
    teal: "border-teal-500 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500",
    yellow: "border-yellow-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500",
    gray: "border-gray-500 data-[state=checked]:bg-gray-500 data-[state=checked]:border-gray-500",
  }
  return map[color] || map.blue
}


interface TodosSectionProps {
  showTodoForm: boolean
  setShowTodoForm: (show: boolean) => void
  filter: "all" | "pending" | "completed" | "upcoming" | "past"
  priorityFilter?: "all" | "high" | "medium" | "low"
  categoryFilter?:
    | "all"
    | "personal"
    | "work"
    | "learning"
    | "health"
    | "shopping"
    | "finance"
  onCountsUpdate?: (counts: {
    all: number
    pending: number
    completed: number
    upcoming: number
    past: number
  }) => void
  onTodosUpdate?: (todos: Todo[]) => void
  onShowTimeline?: () => void
}

export default function TodosSection({
  showTodoForm,
  setShowTodoForm,
  filter,
  priorityFilter = "all",
  categoryFilter = "all",
  onCountsUpdate,
  onTodosUpdate,
  onShowTimeline,
}: TodosSectionProps) {
  // Get today's date in local timezone to avoid UTC conversion issues
  const getTodayISO = () => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  }

  // Helper function to convert time string to minutes
  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number)
    return h * 60 + (m || 0)
  }

  // Get tomorrow's date
  const getTomorrowISO = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
  }
  
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [, setCurrentTime] = useState(new Date())
  const [showConflictDialog, setShowConflictDialog] = useState(false)
  const [conflicts, setConflicts] = useState<TimeConflict[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: getTodayISO(),
    category: "personal",
    startTime: "09:00",
    endTime: "10:00",
    icon: "⚙️",
    recurring: "none" as "none" | "daily" | "weekly" | "monthly",
    days: [] as string[],
    color: "blue" as "blue" | "green" | "purple" | "orange" | "red" | "pink" | "indigo" | "teal" | "yellow" | "gray",
  })
  

   // Helper function to capitalize first letter only
   const capitalizeFirst = (str: string) => {
     if (!str) return str
     return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
   }

   // Helper function to check if todo toggle should be disabled
   const isToggleDisabled = (scheduledDate: string) => {
     const d = new Date(scheduledDate)
     const y = d.getUTCFullYear()
     const m = String(d.getUTCMonth() + 1).padStart(2, "0")
     const da = String(d.getUTCDate()).padStart(2, "0")
     const iso = `${y}-${m}-${da}`
     
     // Disable toggle for past and future todos (only allow today)
     return iso !== getTodayISO()
   }

   // Helper function to check if current time is within todo's time block
   const isCurrentlyActive = (scheduledDate: string, startTime: string, endTime: string) => {
     const todoDate = new Date(scheduledDate).toISOString().split('T')[0]
     const today = new Date().toISOString().split('T')[0]
     
     // Only check if it's today's todo
     if (todoDate !== today) return false
     
     const now = new Date()
     const currentTime = now.getHours() * 60 + now.getMinutes() // Current time in minutes
     
     // Parse start and end times
     const [startHour, startMin] = startTime.split(':').map(Number)
     const [endHour, endMin] = endTime.split(':').map(Number)
     
     const startMinutes = startHour * 60 + startMin
     const endMinutes = endHour * 60 + endMin
     
     return currentTime >= startMinutes && currentTime <= endMinutes
   }

  
  
  // Removed left border accent by date to simplify UI
  const getTodoCardStyling = () => {
    return ""
  }

  // Load todos from API
  const loadTodos = async () => {
    try {
      setLoading(true)
      const fetchedTodos = await getTodos()
      setTodos(fetchedTodos)
    } catch (error) {
      console.error("Failed to load todos:", error)
      // You might want to show a toast notification here
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTodos()
  }, [])

  // Update parent component with todos data
  useEffect(() => {
    if (onTodosUpdate) {
      onTodosUpdate(todos)
    }
  }, [todos, onTodosUpdate])

  // Smart timer that updates exactly when todos start/end
  useEffect(() => {
    const updateTimer = () => {
      setCurrentTime(new Date())
      
      // Calculate when the next update should happen
      const now = new Date()
      const currentMinutes = now.getHours() * 60 + now.getMinutes()
      
      // Get today's todos to check their start/end times
      const today = now.toISOString().split('T')[0]
      const todayTodos = todos.filter(todo => {
        const todoDateStr = new Date(todo.scheduledDate).toISOString().split('T')[0]
        return todoDateStr === today
      })
      
      // Collect all start and end times for today's todos
      const allTimes: number[] = []
      todayTodos.forEach(todo => {
        const [startHour, startMin] = todo.startTime.split(':').map(Number)
        const [endHour, endMin] = todo.endTime.split(':').map(Number)
        
        const startMinutes = startHour * 60 + startMin
        const endMinutes = endHour * 60 + endMin
        
        // Only add future times
        if (startMinutes > currentMinutes) allTimes.push(startMinutes)
        if (endMinutes > currentMinutes) allTimes.push(endMinutes)
      })
      
      // Find the next time when a todo starts or ends
      const nextTime = allTimes.length > 0 ? Math.min(...allTimes) : null
      
      let nextUpdateMs: number
      if (nextTime !== null) {
        // Update exactly when the next todo starts or ends
        const minutesUntilNext = nextTime - currentMinutes
        nextUpdateMs = minutesUntilNext * 60 * 1000
        
        // Add a small buffer (1 second) to ensure we're past the transition
        nextUpdateMs += 1000
      } else {
        // No more todos today, update at the next minute boundary
        const secondsUntilNextMinute = 60 - now.getSeconds()
        nextUpdateMs = secondsUntilNextMinute * 1000
      }
      
      // Set timeout for the calculated time
      return setTimeout(updateTimer, Math.max(1000, nextUpdateMs))
    }
    
    // Initial update
    const timer = updateTimer()
    
    return () => clearTimeout(timer)
  }, [todos]) // Re-run when todos change

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("handleSubmit called with formData:", formData)

    // Validate time range
    if (formData.startTime >= formData.endTime) {
      toast.error("End time must be after start time")
      return
    }

    try {
      if (!formData.dueDate || formData.dueDate < getTodayISO()) {
        toast.error("Date must be today or a future date.")
        return
      }

      // Check for time conflicts before proceeding
      const slot = { date: formData.dueDate, start: formData.startTime, end: formData.endTime }
      // Only check conflicts against today's todos
      const todayISO = getTodayISO()
      const existing = todos.filter(t => (t.scheduledDate.split('T')[0] === todayISO)).map(t => ({
        _id: t._id,
        title: t.title,
        scheduledDate: t.scheduledDate,
        startTime: t.startTime,
        endTime: t.endTime,
        priority: t.priority,
      }))
      const found = detectTimeConflicts(slot, existing, editingTodo?._id)
      if (found.length > 0) {
        setConflicts(found)
        setShowConflictDialog(true)
        return
      }

      await proceedWithTodoSubmission()
    } catch (error) {
      console.error("Failed to save todo:", error)
      toast.error("Failed to save todo")
    }
  }

  const proceedWithTodoSubmission = async () => {
    console.log("proceedWithTodoSubmission called")
    try {
      setIsSaving(true)
      if (editingTodo) {
        // Update existing todo
        const updatedTodo =         await updateTodo({
          _id: editingTodo._id,
          title: formData.title,
          description: "",
          priority: formData.priority,
          dueDate: formData.dueDate,
          category: formData.category,
          startTime: formData.startTime,
          endTime: formData.endTime,
          icon: formData.icon,
          recurring: formData.recurring,
          days: formData.days,
          color: formData.color,
        })
        
        setTodos(prevTodos =>
          prevTodos.map((todo) =>
            todo._id === editingTodo._id ? updatedTodo : todo
          )
        )
        setEditingTodo(null)
      } else {
        // Add new todo
        const newTodo = await createTodo({
          title: formData.title,
          description: "",
          priority: formData.priority,
          dueDate: formData.dueDate,
          category: formData.category,
          startTime: formData.startTime,
          endTime: formData.endTime,
          icon: formData.icon,
          recurring: formData.recurring,
          days: formData.days,
          color: formData.color,
        })
        
        // Immediately update the local state
        setTodos(prevTodos => [...prevTodos, newTodo])
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        priority: "medium" as "low" | "medium" | "high",
        dueDate: getTodayISO(),
        category: "personal",
        startTime: "09:00",
        endTime: "10:00",
        icon: "⚙️",
        recurring: "none" as "none" | "daily" | "weekly" | "monthly",
        days: [],
        color: "blue" as "blue" | "green" | "purple" | "orange" | "red" | "pink" | "indigo" | "teal" | "yellow" | "gray",
      })
      setShowTodoForm(false)
      toast.success(editingTodo ? "Todo updated" : "Todo created")
    } catch (error) {
      console.error("Failed to save todo:", error)
      toast.error("Failed to save todo")
    } finally {
      setIsSaving(false)
    }
  }


  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo)
    
    // Close any existing dialogs
    
    // Convert UTC date properly for form input
    const date = new Date(todo.scheduledDate)
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, "0")
    const day = String(date.getUTCDate()).padStart(2, "0")
    const formattedDate = `${year}-${month}-${day}`
    
    setFormData({
      title: todo.title,
      description: "",
      priority: todo.priority,
      dueDate: formattedDate,
      category: todo.category,
      startTime: todo.startTime,
      endTime: todo.endTime,
      icon: todo.icon,
      recurring: todo.recurring,
      days: todo.days,
      color: todo.color || "blue",
    })
    setShowTodoForm(true)
  }

  const handleDelete = async (todoId: string) => {
    try {
      setDeletingId(todoId)
      await deleteTodo(todoId)
      setTodos(prevTodos => prevTodos.filter((todo) => todo._id !== todoId))
      toast.success("Todo deleted successfully")
    } catch (error) {
      console.error("Failed to delete todo:", error)
      toast.error("Failed to delete todo")
    } finally {
      setDeletingId(null)
    }
  }

  const handleStatusChange = async (todoId: string, isCompleted: boolean) => {
    try {
      setTogglingId(todoId)
      const updatedTodo = await toggleTodoStatus(todoId)
      setTodos(prevTodos => prevTodos.map((todo) => (todo._id === todoId ? updatedTodo : todo)))
      toast.success(isCompleted ? "Todo marked as completed" : "Todo marked as pending")
    } catch (error) {
      console.error("Failed to update todo status:", error)
      toast.error("Failed to update todo status")
    } finally {
      setTogglingId(null)
    }
  }

  // removed usage in cards; helper not needed right now
  
  const filteredTodos = todos.filter((todo) => {
    // Get today's date in YYYY-MM-DD format (local timezone)
    const today = getTodayISO()
    
    // Get todo's date in YYYY-MM-DD format (no timezone conversion)
    const todoDateStr = todo.scheduledDate.split('T')[0]
    
    // Check if todo is scheduled for today
    const isToday = todoDateStr === today
    const isPast = todoDateStr < today
    const isFuture = todoDateStr > today
    
    // Extra filters
    const matchesPriority =
      priorityFilter === "all" || todo.priority === priorityFilter
    const matchesCategory =
      categoryFilter === "all" || todo.category === categoryFilter
    
    if (filter === "all") {
      // Show only today's todos (both completed and pending)
      return isToday && matchesPriority && matchesCategory
    }
    if (filter === "pending") {
      // Show only today's incomplete todos
      return !todo.isCompleted && isToday && matchesPriority && matchesCategory
    }
    if (filter === "completed") {
      // Show only today's completed todos
      return todo.isCompleted && isToday && matchesPriority && matchesCategory
    }
    if (filter === "upcoming") {
      // Show future incomplete todos
      return isFuture && !todo.isCompleted && matchesPriority && matchesCategory
    }
    if (filter === "past") {
      // Show past todos (completed and incomplete)
      return isPast && matchesPriority && matchesCategory
    }
    return matchesPriority && matchesCategory
  })

  // (Removed date display in cards) left helper unused previously
  
  // Group todos by date
  const groupTodosByDate = (todos: Todo[]) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }
    const todayStr = formatDate(today)
    const tomorrowStr = formatDate(tomorrow)
    const yesterdayStr = formatDate(yesterday)

    const grouped: { [key: string]: Todo[] } = {}

    todos.forEach((todo) => {
      // Extract date part without timezone conversion
      const todoDate = todo.scheduledDate.split('T')[0] // Get just YYYY-MM-DD
      if (!grouped[todoDate]) {
        grouped[todoDate] = []
      }
      grouped[todoDate].push(todo)
    })

    // Sort dates in reverse chronological order (newest first)
    const sortedDates = Object.keys(grouped).sort().reverse()

    const getDateLabel = (dateStr: string) => {
      if (dateStr === todayStr) return "Today"
      if (dateStr === tomorrowStr) return "Tomorrow"
      if (dateStr === yesterdayStr) return "Yesterday"

      const date = new Date(dateStr)
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    }

    return sortedDates.map((dateStr) => ({
      date: dateStr,
      label: getDateLabel(dateStr),
      todos: grouped[dateStr].sort((a, b) => {
        // For past todos, sort by scheduled time (reverse chronological order)
        if (dateStr < getTodayISO()) {
          const aTime = timeToMinutes(a.startTime)
          const bTime = timeToMinutes(b.startTime)
          return bTime - aTime // Newest first
        }
        
        // For today and future todos, sort by creation date (newest first)
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        // Fallback to _id comparison (newer MongoDB ObjectIds are greater)
        return b._id.localeCompare(a._id)
      }),
    }))
  }

  const groupedTodos = groupTodosByDate(filteredTodos)
  
  
  // Update counts whenever todos change
  useEffect(() => {
    if (onCountsUpdate) {
      const today = getTodayISO()
      
      // Filter todos by date categories
      const todayTodos = todos.filter((todo) => {
        const todoDateStr = todo.scheduledDate.split('T')[0]
        return todoDateStr === today
      })
      
      const pastTodos = todos.filter((todo) => {
        const todoDateStr = todo.scheduledDate.split('T')[0]
        return todoDateStr < today
      })
      
      const upcomingTodos = todos.filter((todo) => {
        const todoDateStr = todo.scheduledDate.split('T')[0]
        return todoDateStr > today && !todo.isCompleted
      })

      const counts = {
        all: todayTodos.length, // Today's todos (completed + pending)
        pending: todayTodos.filter((todo) => !todo.isCompleted).length, // Today's pending
        completed: todayTodos.filter((todo) => todo.isCompleted).length, // Today's completed
        upcoming: upcomingTodos.length, // Future incomplete todos
        past: pastTodos.length, // All past todos
      }
      onCountsUpdate(counts)
    }
  }, [todos, onCountsUpdate])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading todos...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col space-y-6 overflow-hidden">
      <ConflictWarningDialog
        isOpen={showConflictDialog}
        onClose={() => setShowConflictDialog(false)}
        onConfirm={async () => {
          setShowConflictDialog(false)
          await proceedWithTodoSubmission()
          setConflicts([])
        }}
        conflicts={conflicts}
        newTodoTitle={formData.title}
        newTimeSlot={`${formatTo12Hour(formData.startTime)} - ${formatTo12Hour(formData.endTime)} on ${formData.dueDate}`}
      />
      {/* Add/Edit Form */}
      <Dialog open={showTodoForm} onOpenChange={setShowTodoForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingTodo ? "Edit Todo" : "Create New Todo"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Todo Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter your todo title"
                required
              />
            </div>


            {/* Priority and Category Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      priority: value as "low" | "medium" | "high",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      category: value as
                        | "personal"
                        | "work"
                        | "learning"
                        | "health"
                        | "shopping"
                        | "finance",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
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
                        name="color"
                        value={colorOption.value}
                        checked={formData.color === colorOption.value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            color: e.target.value as "blue" | "green" | "purple" | "orange" | "red" | "pink" | "indigo" | "teal" | "yellow" | "gray",
                          })
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-6 h-6 rounded-full ${colorOption.color} transition-all group-hover:scale-110 ${
                          formData.color === colorOption.value
                            ? `border-4 ${colorOption.borderColor}`
                            : "border-0"
                        }`}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Date and Time Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 h-6">
                  <Label htmlFor="dueDate">Date</Label>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 ${
                      formData.dueDate && formData.dueDate > getTodayISO()
                        ? ""
                        : "invisible"
                    }`}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Scheduled
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    required
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, dueDate: getTodayISO() })}
                      className={`text-xs ${formData.dueDate === getTodayISO() ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : ''}`}
                    >
                      Today
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, dueDate: getTomorrowISO() })}
                      className={`text-xs ${formData.dueDate === getTomorrowISO() ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : ''}`}
                    >
                      Tomorrow
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 h-6">
                  <Label htmlFor="startTime">Start</Label>
                </div>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 h-6">
                  <Label htmlFor="endTime">End</Label>
                </div>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  required
                  className="w-full"
                />
              </div>
            </div>


            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {editingTodo ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  editingTodo ? "Update Todo" : "Create Todo"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowTodoForm(false)
                  setEditingTodo(null)
                  setFormData({
                    title: "",
                    description: "",
                    priority: "medium" as "low" | "medium" | "high",
                    dueDate: getTodayISO(),
                    category: "personal",
                    startTime: "09:00",
                    endTime: "10:00",
                    icon: "⚙️",
                    recurring: "none" as
                      | "none"
                      | "daily"
                      | "weekly"
                      | "monthly",
                    days: [],
                    color: "blue" as "blue" | "green" | "purple" | "orange" | "red" | "pink" | "indigo" | "teal" | "yellow" | "gray",
                  })
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>


      {/* Todos List */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
        {groupedTodos.map((group) => (
          <div key={group.date} className="space-y-3">
            {/* Date Section Header */}
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
              <h3 className="text-sm font-medium text-gray-700">
                {group.label}
              </h3>
              <div className="flex-1 h-px bg-gray-200"></div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {group.todos.length} tasks
                </span>
                {onShowTimeline && group.label === "Today" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onShowTimeline}
                    className="text-xs h-7 px-3 bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow-md lg:hidden"
                  >
                    <Clock className="h-3 w-3 mr-1.5" />
                    Timeline
                  </Button>
                )}
              </div>
            </div>

            {/* Tasks for this date */}
            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
              {group.todos.map((todo) => (
                 <div
                   key={todo._id}
                   className={`transition-all h-auto min-h-[96px] w-full rounded-lg border ${getTodoColorClasses(todo.color || 'blue')} ${getTodoCardStyling()}`}
                 >
                  {/* Top Section - Title and Actions */}
                  <div className="flex items-center justify-between  px-3 pt-3 ">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Checkbox
                        checked={todo.isCompleted}
                        onCheckedChange={(checked) =>
                          handleStatusChange(todo._id, checked as boolean)
                        }
                        disabled={isToggleDisabled(todo.scheduledDate) || togglingId === todo._id}
                        className={`h-8 w-8 rounded-full border-1 ${getCheckboxColorClasses(todo.color || 'blue')} data-[state=checked]:text-white shrink-0 ${
                          isToggleDisabled(todo.scheduledDate) || togglingId === todo._id
                            ? "opacity-50 cursor-not-allowed" 
                            : ""
                        }`}
                        id={`todo-${todo._id}`}
                      />
                      <div className="flex flex-col justify-between gap-1 flex-1 min-w-0">
                        <Label
                          htmlFor={`todo-${todo._id}`}
                          className={`text font-semibold truncate cursor-pointer block ${
                            todo.isCompleted
                              ? "line-through text-gray-400"
                              : "text-gray-900"
                          }`}
                        >
                          {capitalizeFirst(todo.title)}
                        </Label>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-6 w-6 hover:bg-gray-100"
                              disabled={deletingId === todo._id}
                            >
                              {deletingId === todo._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreVertical className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => deletingId ? null : handleEdit(todo)} className={deletingId ? "pointer-events-none opacity-50" : ""}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deletingId ? null : handleDelete(todo._id)}
                              className={`text-red-600 hover:bg-red-100 ${deletingId === todo._id ? "pointer-events-none opacity-60" : ""}`}
                            >
                              {deletingId === todo._id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Section - Time (left) and Live/Scheduled (right) */}
                  <div className="flex items-center justify-between mt-2 px-3 py-2 text-xs text-gray-600">
                    {/* Left: time */}
                    <div className="flex items-center gap-2  ">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700 font-medium">
                        {formatTo12Hour(todo.startTime)} - {formatTo12Hour(todo.endTime)}
                      </span>
                    </div>
                    {/* Right: live + scheduled */}
                    <div className="flex items-center gap-3 ">
                      {isCurrentlyActive(todo.scheduledDate, todo.startTime, todo.endTime) && (
                        <span className="flex items-center gap-1 text-purple-600" title="Happening now">
                          <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                          Live
                        </span>
                      )}
                      {(() => {
                      const d = new Date(todo.scheduledDate)
                      const y = d.getUTCFullYear()
                      const m = String(d.getUTCMonth() + 1).padStart(2, "0")
                      const da = String(d.getUTCDate()).padStart(2, "0")
                      const iso = `${y}-${m}-${da}`
                      const isFuture = iso > getTodayISO()
                      return (
                        <Badge
                          variant="secondary"
                          className={`text-xs px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 ${
                            isFuture ? "" : "hidden"
                          }`}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Scheduled
                        </Badge>
                      )
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTodos.length === 0 && !showTodoForm && (
        <div className="w-full flex items-center justify-center py-24">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-gray-300 mb-3 mx-auto" />
            <h3 className="text-base font-medium text-gray-900 mb-2">
              No todos found
            </h3>
            <p className="text-gray-600 mb-4 max-w-md text-sm mx-auto">
              {filter === "all"
                ? "Start by creating your first todo to organize your day"
                : filter === "upcoming"
                ? "No upcoming todos found. Schedule some tasks for the future!"
                : `No ${filter} todos found. Try changing the filter or add new todos.`}
            </p>
            <Button
              onClick={() => {
                setShowTodoForm(true)
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2"
            >
              Create Your First Todo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}


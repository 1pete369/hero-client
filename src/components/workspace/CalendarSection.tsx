"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getTodos, type Todo } from "@/services"

export default function CalendarSection() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showDateModal, setShowDateModal] = useState(false)

  // Load todos from API
  const loadTodos = async () => {
    try {
      setLoading(true)
      const fetchedTodos = await getTodos()
      setTodos(fetchedTodos)
    } catch (error) {
      console.error("Failed to load todos:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTodos()
  }, [])

  // Get todos for a specific date
  const getTodosForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return todos.filter(todo => {
      const todoDate = new Date(todo.scheduledDate).toISOString().split("T")[0]
      return todoDate === dateStr
    })
  }


  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Handle date click to open time block modal
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    // Desktop: show side panel; Mobile: use modal bottom sheet
    if (typeof window !== "undefined" && window.matchMedia('(min-width: 1024px)').matches) {
      setShowDateModal(false)
    } else {
      setShowDateModal(true)
    }
  }

  // Get todos for selected date, sorted by time
  const getSelectedDateTodos = () => {
    if (!selectedDate) return []
    
    const dateStr = selectedDate.toISOString().split("T")[0]
    const dateTodos = todos.filter(todo => {
      const todoDate = new Date(todo.scheduledDate).toISOString().split("T")[0]
      return todoDate === dateStr
    })
    
    // Sort by start time
    return dateTodos.sort((a, b) => {
      const [aHour, aMin] = a.startTime.split(':').map(Number)
      const [bHour, bMin] = b.startTime.split(':').map(Number)
      const aMinutes = aHour * 60 + aMin
      const bMinutes = bHour * 60 + bMin
      return aMinutes - bMinutes
    })
  }

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Start from the Sunday before (or equal to) the first of the month
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    // End at the Saturday after (or equal to) the last of the month
    const lastDay = new Date(year, month + 1, 0)
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))

    const days: Array<{
      date: Date
      isCurrentMonth: boolean
      isToday: boolean
      todos: Todo[]
      isWeekend: boolean
    }> = []
    const today = new Date()

    const MS_DAY = 24 * 60 * 60 * 1000
    const total = Math.round((endDate.getTime() - startDate.getTime()) / MS_DAY) + 1

    for (let i = 0; i < total; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      const isCurrentMonth = date.getMonth() === month
      const isToday = date.toDateString() === today.toDateString()
      const dayTodos = getTodosForDate(date)

      days.push({
        date,
        isCurrentMonth,
        isToday,
        todos: dayTodos,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
      })
    }

    return days
  }

  const getPriorityColor = (priority: Todo["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  // Soft color classes for todo pills by todo.color
  const getTodoColorClasses = (color?: string) => {
    const map: Record<string, string> = {
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
    return map[color || "blue"] || map.blue
  }

  // Accent rail color by todo.color
  const getTodoRailColor = (color?: string) => {
    const map: Record<string, string> = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
      red: "bg-red-500",
      pink: "bg-pink-500",
      indigo: "bg-indigo-500",
      teal: "bg-teal-500",
      yellow: "bg-yellow-500",
      gray: "bg-gray-500",
    }
    return map[color || "blue"] || map.blue
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const calendarDays = getCalendarDays()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button onClick={goToToday} variant="outline" size="sm" className="h-8 px-2 text-[11px] sm:text-xs">
            Today
          </Button>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 mr-1 sm:mr-2">
          <Button onClick={goToPreviousMonth} variant="outline" size="sm" className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button onClick={goToNextMonth} variant="outline" size="sm" className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar + Side Panel Layout */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <CardContent className="p-0">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b bg-white">
                {dayNames.map(day => (
                  <div key={day} className="px-2 sm:px-3 py-1.5 sm:py-2 text-center text-[11px] sm:text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 p-1 sm:p-2">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    onClick={() => handleDateClick(day.date)}
                    className={`
                      rounded-lg border p-1.5 sm:p-2 cursor-pointer min-h-[72px] sm:min-h-[90px] lg:min-h-[110px]
                      ${!day.isCurrentMonth ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}
                      ${day.isToday ? 'ring-1 ring-indigo-300' : ''}
                      hover:shadow-sm transition-shadow
                    `}
                  >
                    {/* Date Number & count */}
                    <div className="flex items-center justify-between mb-1">
                      <span className={`${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'} text-[13px] sm:text-sm font-medium`}>
                        {day.date.getDate()}
                      </span>
                      {day.todos.length > 0 && (
                        <span className="hidden sm:inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-1 py-0.5 text-[9px] sm:text-[10px] font-medium">
                          {day.todos.length}
                        </span>
                      )}
                    </div>

                    {/* Todos for this day (hidden on mobile, show only count) */}
                    <div className="hidden sm:block space-y-1">
                      {day.todos.slice(0, 3).map(todo => (
                        <div
                          key={todo._id}
                          title={`${todo.title} - ${formatTime(todo.startTime)}`}
                          className={`group relative rounded-md border text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-1 pr-2 overflow-hidden ${getTodoColorClasses(todo.color)} ${
                            todo.isCompleted ? 'opacity-60' : ''
                          }`}
                        >
                          <span className={`absolute left-0 top-0 h-full w-0.5 sm:w-1 ${getTodoRailColor(todo.color)}`} />
                          <div className="flex items-center gap-1">
                            <span className="truncate font-medium flex-1 min-w-0">{todo.title}</span>
                            <span className="text-[9px] sm:text-[10px] text-gray-600">{formatTime(todo.startTime)}</span>
                          </div>
                        </div>
                      ))}
                      {day.todos.length > 3 && (
                        <div className="text-[9px] sm:text-[10px] text-gray-600 text-center py-0.5">+{day.todos.length - 3} more</div>
                      )}
                    </div>
                    {/* Mobile-only total count in the center bottom */}
                    {day.todos.length > 0 && (
                      <div className="sm:hidden mt-1 flex justify-center">
                        <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5 text-[10px] font-medium">
                          {day.todos.length}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel (Desktop) */}
        <div className="hidden lg:block">
          <Card className="h-full">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900">
                  {selectedDate
                    ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                    : 'Select a date'}
                </h3>
              </div>

              {selectedDate && getSelectedDateTodos().length > 0 ? (
                <div className="space-y-2">
                  {getSelectedDateTodos().map((todo) => (
                    <div
                      key={todo._id}
                      className={`p-3 rounded-lg border ${
                        todo.isCompleted ? 'bg-slate-50 border-slate-200' : 'bg-white border-gray-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">{formatTime(todo.startTime)} - {formatTime(todo.endTime)}</span>
                        <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${
                          todo.priority === 'high' ? 'bg-red-100 text-red-700' : todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>{todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}</span>
                      </div>
                      <div className="mt-1 text-sm font-semibold text-gray-900">{todo.title}</div>
                      <div className="mt-1 text-xs inline-flex px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {todo.category.charAt(0).toUpperCase() + todo.category.slice(1)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500">No tasks for the selected date.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Time Block Modal */}
      <Dialog open={showDateModal} onOpenChange={setShowDateModal} >
         <DialogContent className="max-w-2xl min-h-[400px] max-h-[70vh] overflow-y-auto flex flex-col scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              Time Blocks for {selectedDate?.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </DialogTitle>
          </DialogHeader>
          
           <div className="space-y-3 flex flex-col justify-start flex-1">
            {getSelectedDateTodos().length > 0 ? (
              getSelectedDateTodos().map((todo) => (
                <div
                  key={todo._id}
                    className={`
                     p-4 rounded-lg border transition-all
                     ${todo.isCompleted 
                       ? 'bg-slate-50 border-slate-200' 
                       : 'bg-white border-gray-200 shadow-sm'
                     }
                     hover:shadow-md
                   `}
                >
                  <div className="flex items-start justify-start">
                    <div className="flex-1">
                      <h3 className={`font-semibold text-gray-900 mb-1 ${
                        todo.isCompleted ? 'line-through text-gray-500' : ''
                      }`}>
                        {todo.title}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">
                            {formatTime(todo.startTime)} - {formatTime(todo.endTime)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            todo.priority === 'high' ? 'bg-red-100 text-red-800' :
                            todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                          </span>
                          
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            {todo.category.charAt(0).toUpperCase() + todo.category.slice(1)}
                          </span>
                        </div>
                       </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">No tasks scheduled</p>
                <p className="text-sm">This date has no todos planned.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}



 



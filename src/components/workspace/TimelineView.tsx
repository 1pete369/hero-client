"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { Clock, Dot, ChevronLeft, ChevronRight } from "lucide-react"
import ConflictWarningDialog from "@/components/ui/ConflictWarningDialog"
import { detectTimeConflicts, type TimeConflict } from "@/utils/timeConflict"
import type { Todo } from "@/services"
import GradientBlobs from "@/components/ui/GradientBlobs"
import { updateTodo } from "@/services"
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useDraggable } from '@dnd-kit/core'

// Simple Draggable Timeline Block Component
function DraggableTimelineBlock({ 
  todo, 
  top, 
  height, 
  width, 
  left, 
  start, 
  end, 
  duration, 
  onEditTodo,
  isToday,
  currentMinute,
  COLOR_LEFT,
  COLOR_BLOCK,
  isPressing,
  onPressStart,
  onPressEnd,
  disabled
}: {
  todo: Todo
  top: number
  height: number
  width: string
  left: string
  start: number
  end: number
  duration: number
  onEditTodo?: (todo: Todo) => void
  isToday: boolean
  currentMinute: () => number
  COLOR_LEFT: Record<string, string>
  COLOR_BLOCK: Record<string, string>
  isPressing: boolean
  onPressStart: () => void
  onPressEnd: () => void
  disabled: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: todo._id,
    disabled,
  })


  // Completely disable transform on the hidden original element when dragging
  const style = {
    top,
    height,
    width,
    left,
    touchAction: 'none' as const, // Critical for mobile drag functionality
    visibility: isDragging ? ('hidden' as const) : ('visible' as const), // Completely hide when dragging
  }

  const live = isToday && currentMinute() >= start && currentMinute() < end
  const colorKey = (todo.color ?? "blue") as string
  const leftColor = COLOR_LEFT[colorKey] ?? COLOR_LEFT.blue
  const blockColor = COLOR_BLOCK[colorKey] ?? COLOR_BLOCK.blue

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "absolute rounded border shadow-sm",
        "hover:shadow-md",
        todo.isCompleted ? "opacity-60" : "",
        "before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:rounded",
        leftColor,
        blockColor,
        disabled ? "cursor-not-allowed" : (isDragging ? "pointer-events-none" : "cursor-grab"),
        isPressing ? "scale-105 shadow-lg z-40" : "",
      ].join(" ")}
      aria-label={`Press and hold to drag ${todo.title}`}
      onTouchStart={disabled ? undefined : onPressStart}
      onTouchEnd={disabled ? undefined : onPressEnd}
      onTouchCancel={disabled ? undefined : onPressEnd}
      {...(disabled ? {} as any : listeners)}
      {...(disabled ? {} as any : attributes)}
    >
      <div className="flex h-full flex-col px-2.5 py-1.5">
        <div className="flex items-center justify-between">
          <span className="truncate text-[12px] font-semibold text-black">{todo.title}</span>
          <div className="flex items-center gap-1">
            {live && (
              <span className="inline-flex items-center gap-0.5 rounded bg-white border-2 border-black px-1 py-0.5 text-[10px] text-emerald-700 font-semibold">
                <Dot className="h-3 w-3 animate-pulse text-emerald-600" />
                Live
              </span>
            )}
          </div>
        </div>
        <div className="mt-0.5 text-[10px] font-mono text-black/90">
          {todo.startTime && todo.endTime ? `${formatTo12Hour(todo.startTime)} – ${formatTo12Hour(todo.endTime)} • ${duration < 60 ? `${duration}m` : `${Math.floor(duration / 60)}h ${duration % 60}m`}` : 'Unscheduled'}
        </div>
      </div>
    </div>
  )
}

interface TimelineViewProps {
  todos: Todo[]
  selectedDate?: string
  onEditTodo?: (todo: Todo) => void
  showHeader?: boolean
  onDeleteTodo?: (todoId: string) => void
  onToggleStatus?: (todoId: string, isCompleted: boolean) => void
  onTodoUpdate?: () => void
}

/* ------------ Compact design constants (right panel) ------------ */
// Better heights for visibility
const HOUR_HEIGHT = 80;                    // px per hour → total 24*80 = 1920px
const MINUTE_TO_PX = HOUR_HEIGHT / 60;
const COLUMN_GAP = 6;                      // px between overlap columns
const RAIL_WIDTH = 40;                     // left time rail width (px)

/* ------------ Time formatting helpers ------------ */
const formatTo12Hour = (time24: string): string => {
  let [hours, minutes] = time24.split(':').map(Number)
  // Normalize 24:00 to 00:00 (midnight)
  if (hours >= 24) {
    hours = hours % 24
  }
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
}

// Color maps for timeline blocks (match card colors)
const COLOR_LEFT: Record<string, string> = {
  blue: "before:bg-blue-500",
  green: "before:bg-green-500",
  purple: "before:bg-purple-500",
  orange: "before:bg-orange-500",
  red: "before:bg-red-500",
  pink: "before:bg-pink-500",
  indigo: "before:bg-indigo-500",
  teal: "before:bg-teal-500",
  yellow: "before:bg-yellow-500",
  gray: "before:bg-gray-500",
}
const COLOR_BLOCK: Record<string, string> = {
  blue: "bg-blue-400 border-black border-2",
  green: "bg-green-400 border-black border-2",
  purple: "bg-purple-400 border-black border-2",
  orange: "bg-orange-400 border-black border-2",
  red: "bg-red-400 border-black border-2",
  pink: "bg-pink-400 border-black border-2",
  indigo: "bg-indigo-400 border-black border-2",
  teal: "bg-teal-400 border-black border-2",
  yellow: "bg-yellow-300 border-black border-2",
  gray: "bg-gray-400 border-black border-2",
}

// 30-minute default duration for newly scheduled items
const DEFAULT_DURATION_MINUTES = 30

/* ------------ Helpers ------------ */
const timeToMinutes = (t: string | null | undefined) => {
  if (!t) return 0
  const [h, m] = t.split(":").map(Number)
  return h * 60 + (m || 0)
}
const currentMinute = () => {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

const timeLabels = Array.from({ length: 24 }, (_, hour) => {
  const label =
    hour === 0 ? "12AM" :
    hour < 12 ? `${hour}AM` :
    hour === 12 ? "12PM" : `${hour - 12}PM`
  return { hour, label, minutes: hour * 60 }
})

function computeBlock(startTime: string, endTime: string) {
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  const duration = Math.max(0, end - start)
  // Minimum 26px height so tiny tasks are still tappable
  return {
    start,
    end,
    duration,
    top: start * MINUTE_TO_PX,
    height: Math.max(26, duration * MINUTE_TO_PX), // Remove height cap for all-day tasks
  }
}

/** Greedy column layout for overlaps (kept simple + fast). */
function assignColumns(items: { id: string; start: number; end: number }[]) {
  const sorted = [...items].sort((a, b) => a.start - b.start || a.end - b.end)
  type Active = { id: string; end: number; col: number }
  const active: Active[] = []
  const taken = new Set<number>()
  const result = new Map<string, { col: number; widthCols: number }>()

  for (const it of sorted) {
    for (let i = active.length - 1; i >= 0; i--) {
      if (active[i].end <= it.start) {
        taken.delete(active[i].col)
        active.splice(i, 1)
      }
    }
    let col = 0
    while (taken.has(col)) col++
    taken.add(col)
    active.push({ id: it.id, end: it.end, col })
    result.set(it.id, { col, widthCols: taken.size })
  }

  // Expand widthCols to max concurrency intersecting each item (compact but good enough)
  for (const a of sorted) {
    let maxCols = 1
    for (const b of sorted) {
      if (a === b) continue
      if (Math.max(a.start, b.start) < Math.min(a.end, b.end)) {
        maxCols = Math.max(maxCols, (result.get(b.id)?.col ?? 0) + 1)
      }
    }
    const cur = result.get(a.id)!
    result.set(a.id, { ...cur, widthCols: Math.max(cur.widthCols, maxCols) })
  }
  return result
}


/* ------------ Main component (boxed, compact) ------------ */
export default function TimelineView({
  todos,
  selectedDate: propSelectedDate,
  onEditTodo,
  showHeader = true,
  onDeleteTodo,
  onToggleStatus,
  onTodoUpdate,
}: TimelineViewProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const update = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 640)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  const railWidth = isMobile ? 32 : RAIL_WIDTH
  // Prevent auto-scroll jumping right after a drag/drop update
  const suppressAutoScrollRef = useRef(false)
  // Get today's date in local timezone to avoid UTC conversion issues
  const getLocalDateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
  
  // Use prop selectedDate if provided, otherwise use today
  const selectedDate = propSelectedDate || getLocalDateString(new Date())
  const [internalSelectedDate, setInternalSelectedDate] = useState(selectedDate)

  // DndKit drag state
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null)
  const [isPressing, setIsPressing] = useState<string | null>(null)
  
  // Memoize overlay content to avoid recalculating on every mousemove
  const overlayContent = useMemo(() => {
    if (!activeTodo) return null
    
    const colorKey = (activeTodo.color ?? 'blue') as string
    const leftColor = COLOR_LEFT[colorKey] ?? COLOR_LEFT.blue
    const blockColor = COLOR_BLOCK[colorKey] ?? COLOR_BLOCK.blue
    
    // If it has time (scheduled on timeline), render as timeline block
    if (activeTodo.startTime && activeTodo.endTime) {
      const start = timeToMinutes(activeTodo.startTime)
      const end = timeToMinutes(activeTodo.endTime)
      const duration = end - start
      
      return (
        <div className={[
          'relative rounded border shadow-lg px-2 py-1.5 text-[12px] min-h-[40px] w-[200px]',
          'before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:rounded',
          leftColor,
          blockColor,
          'opacity-90',
        ].join(' ')}>
          <div className="font-medium truncate leading-tight text-black">{activeTodo.title}</div>
          <div className="text-[10px] opacity-75 mt-0.5 font-mono text-black">
            {formatTo12Hour(activeTodo.startTime)} – {formatTo12Hour(activeTodo.endTime)} • {duration < 60 ? `${duration}m` : `${Math.floor(duration / 60)}h ${duration % 60}m`}
          </div>
        </div>
      )
    }
    
    // Otherwise render as inbox item (unscheduled)
    return (
      <div className={[
        'relative inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[12px] text-gray-900 bg-white',
        'shadow-md',
        'before:absolute before:left-0.5 before:top-1/2 before:-translate-y-1/2 before:h-3.5 before:w-1.5 before:rounded before:content-[""]',
        leftColor.replace('before:bg-', 'before:bg-'),
        'border-gray-200',
        'opacity-90',
      ].join(' ')}>
        <span className="truncate max-w-[200px]">{activeTodo.title}</span>
      </div>
    )
  }, [activeTodo])
  // Temporarily hide items from Inbox once user drops them to schedule,
  // until the backend refresh arrives, to avoid duplicate chip + block.
  const [pendingScheduleIds, setPendingScheduleIds] = useState<Set<string>>(new Set())
  const [showConflictDialog, setShowConflictDialog] = useState(false)
  const [conflicts, setConflicts] = useState<TimeConflict[]>([])
  const [pendingSchedule, setPendingSchedule] = useState<null | { todoId: string; title: string; startTime: string; endTime: string; dateISO: string }>(null)
  
  // Configure sensors for smooth drag experience with minimal delay
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2, // Reduced from 8px - starts drag almost immediately
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100, // Reduced from 250ms - faster response
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Returns true if a todo occurs on the given YYYY-MM-DD date considering recurrence
  const occursOn = (todo: Todo, dateISO: string) => {
    if (!todo.scheduledDate) return false
    const baseISO = (todo.scheduledDate.includes('T') ? todo.scheduledDate.split('T')[0] : todo.scheduledDate)
    if (baseISO === dateISO) return true
    // Do not show occurrences before the scheduled (start) date
    if (dateISO < baseISO) return false
    const recurring: any = (todo as any).recurring
    if (!recurring || recurring === 'none') return false
    const d = new Date(dateISO + 'T00:00:00')
    if (recurring === 'daily') return true
    if (recurring === 'weekly') {
      const map = ['sun','mon','tue','wed','thu','fri','sat']
      const daysArr: string[] = Array.isArray((todo as any).days) ? (todo as any).days : []
      return daysArr.includes(map[d.getDay()])
    }
    if (recurring === 'monthly') {
      const baseDay = new Date(baseISO + 'T00:00:00').getDate()
      return d.getDate() === baseDay
    }
    return false
  }

  // Filter tasks for selected date
  const filtered = useMemo(() => {
    const currentSelectedDate = internalSelectedDate
    
    const result = todos
      .filter((t) => {
        return occursOn(t, currentSelectedDate)
      })
      .sort((a, b) => {
        if (!a.startTime && !b.startTime) return 0
        if (!a.startTime) return 1
        if (!b.startTime) return -1
        return timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      })
    
    return result
  }, [todos, internalSelectedDate])

  const metas = useMemo(() => {
    const sched = filtered.filter(t => t.startTime && t.endTime)
    const m = sched.map((t) => ({ todo: t, ...computeBlock(t.startTime as string, t.endTime as string) }))
    const cols = assignColumns(m.map(({ todo, start, end }) => ({ id: todo._id, start, end })))
    return m.map((x) => ({
      ...x,
      col: cols.get(x.todo._id)!.col,
      widthCols: Math.min(3, cols.get(x.todo._id)!.widthCols), // limit to 3 cols in narrow box
    }))
  }, [filtered])

  // Date navigation functions
  const goToPreviousDay = () => {
    const [year, month, day] = internalSelectedDate.split('-').map(Number)
    const date = new Date(year, month - 1, day) // month is 0-indexed
    date.setDate(date.getDate() - 1)
    setInternalSelectedDate(getLocalDateString(date))
  }

  const goToNextDay = () => {
    const [year, month, day] = internalSelectedDate.split('-').map(Number)
    const date = new Date(year, month - 1, day) // month is 0-indexed
    date.setDate(date.getDate() + 1)
    const newDate = getLocalDateString(date)
    setInternalSelectedDate(newDate)
  }

  const goToToday = () => {
    setInternalSelectedDate(getLocalDateString(new Date()))
  }

  // DndKit drag handlers
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const handleDragStart = (event: DragStartEvent) => {
    // Drag started
    const { active } = event
    setActiveId(active.id as string)
    
    // Find the todo being dragged
    const todo = todos.find(t => t._id === active.id)
    if (todo) {
      setActiveTodo(todo)
      // dragging todo
    }
  }

  const handlePressStart = (todoId: string) => {
    setIsPressing(todoId)
  }

  const handlePressEnd = () => {
    setIsPressing(null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, delta, over } = event
    
    // Reset pressing state when drag ends
    setIsPressing(null)
    
    // If dropped onto a timeline slot AND the task has no time blocks yet, create schedule with default duration
    if (activeTodo && (!activeTodo.startTime || !activeTodo.endTime) && over && typeof over.id === 'string' && over.id.toString().startsWith('slot-')) {
      suppressAutoScrollRef.current = true
      const minute = parseInt(over.id.toString().replace('slot-',''), 10)
      const rounded = Math.max(0, Math.min(1440 - DEFAULT_DURATION_MINUTES, Math.round(minute / 5) * 5))
      const newStartTime = minutesToTime(rounded)
      const newEndTime = minutesToTime(rounded + DEFAULT_DURATION_MINUTES)
      // Optimistically hide this chip from Inbox
      setPendingScheduleIds((prev) => new Set(prev).add(activeTodo._id))
      // Check conflicts
      const todayTasks = todos
        .filter(t => t.scheduledDate && (t.scheduledDate.split('T')[0] === internalSelectedDate) && t.startTime && t.endTime)
        .map(t => ({ _id: t._id, title: t.title, scheduledDate: t.scheduledDate as string, startTime: t.startTime as string, endTime: t.endTime as string, priority: (t as any).priority }))
      const slot = { date: internalSelectedDate, start: newStartTime, end: newEndTime }
      const found = detectTimeConflicts(slot, todayTasks)
      if (found.length > 0) {
        setConflicts(found)
        setPendingSchedule({ todoId: activeTodo._id, title: activeTodo.title, startTime: newStartTime, endTime: newEndTime, dateISO: internalSelectedDate })
        setShowConflictDialog(true)
      } else {
        try {
          await updateTodo({ _id: activeTodo._id, dueDate: internalSelectedDate, startTime: newStartTime, endTime: newEndTime })
          onTodoUpdate?.()
        } catch (error) {
          console.error('Failed to schedule todo:', error)
          // Re-show in Inbox if failed
          setPendingScheduleIds((prev) => {
            const next = new Set(prev); next.delete(activeTodo._id); return next
          })
        }
      }
      setActiveId(null)
      setActiveTodo(null)
      // Re-enable auto-scroll shortly after state settles
      setTimeout(() => { suppressAutoScrollRef.current = false }, 800)
      return
    }

    if (!activeTodo || !delta.y) {
      setActiveId(null)
      setActiveTodo(null)
      return
    }

    suppressAutoScrollRef.current = true
    // Calculate new time based on drag distance
    const deltaMinutes = Math.round(delta.y / MINUTE_TO_PX)
    
    // If todo doesn't have time blocks yet (from inbox), use default values
    const originalStartMinutes = activeTodo.startTime ? timeToMinutes(activeTodo.startTime) : 0
    const originalEndMinutes = activeTodo.endTime ? timeToMinutes(activeTodo.endTime) : DEFAULT_DURATION_MINUTES
    const duration = originalEndMinutes - originalStartMinutes

    // Snap to 5-minute grid, but preserve duration near day end by clamping start
    const proposedStart = Math.round((originalStartMinutes + deltaMinutes) / 5) * 5
    const boundedStart = Math.max(0, Math.min(1440 - duration, proposedStart))
    const newStartMinutes = boundedStart
    const newEndMinutes = newStartMinutes + duration
    
    const newStartTime = minutesToTime(newStartMinutes)
    const newEndTime = minutesToTime(newEndMinutes)

    try {
      // Update the todo in the backend
      await updateTodo({
        _id: activeTodo._id,
        startTime: newStartTime,
        endTime: newEndTime
      })
      
      // Refresh the todos list to show the updated position
      onTodoUpdate?.()
    } catch (error) {
      console.error('Failed to update todo time:', error)
    }

    setActiveId(null)
    setActiveTodo(null)
    // Re-enable auto-scroll shortly after state settles
    setTimeout(() => { suppressAutoScrollRef.current = false }, 800)
  }


  // Auto-scroll to first task or current time
  useEffect(() => {
    if (!scrollRef.current) return
    if (suppressAutoScrollRef.current) return
    
    const today = getLocalDateString(new Date())
    
    if (filtered.length > 0) {
      // If there are tasks, scroll to the first task
      const firstTask = filtered.find(t => t.startTime) || filtered[0]
      const firstTaskStartMinutes = firstTask.startTime ? timeToMinutes(firstTask.startTime) : 0
      const y = Math.max(0, firstTaskStartMinutes * MINUTE_TO_PX - 160)
      scrollRef.current.scrollTop = y
    } else if (internalSelectedDate === today) {
      // If it's today and no tasks, scroll to current time
      const y = Math.max(0, currentMinute() * MINUTE_TO_PX - 160)
      scrollRef.current.scrollTop = y
    } else {
      // For other dates with no tasks, scroll to top
      scrollRef.current.scrollTop = 0
    }
  }, [internalSelectedDate, filtered])

  return (
    <div className="flex h-full flex-col rounded border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden box-border relative">
      <GradientBlobs density="low" />
      {/* Header (compact) - only show if showHeader is true */}
      {showHeader && (
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-600" />
            <h3 className="text-[13px] font-semibold text-gray-900">Timeline</h3>
          </div>
          
          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousDay}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Previous day"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            
            <button
              onClick={goToToday}
              className="px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors"
              title="Go to today"
            >
              {(() => {
                const [year, month, day] = internalSelectedDate.split('-').map(Number)
                const date = new Date(year, month - 1, day) // month is 0-indexed
                return date.toLocaleDateString("en-US", { 
                  weekday: "short", 
                  month: "short", 
                  day: "numeric" 
                })
              })()}
            </button>
            
            <button
              onClick={goToNextDay}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Next day"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gray-200 p-1 text-[11px] text-gray-700">
              {filtered.length}
            </span>
            {/* <span className="text-[10px] text-gray-500 font-mono">
              {internalSelectedDate}
            </span> */}
          </div>
        </div>
      )}

      {/* Compact date navigation when header is hidden (mobile/tablet/modal) */}
      {!showHeader && (
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-3 py-2">
          <button onClick={goToPreviousDay} className="p-1 hover:bg-gray-200 rounded" aria-label="Previous day">
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <button onClick={goToToday} className="px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-200 rounded" aria-label="Today">
            {(() => {
              const [year, month, day] = internalSelectedDate.split('-').map(Number)
              const date = new Date(year, month - 1, day)
              return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
            })()}
          </button>
          <button onClick={goToNextDay} className="p-1 hover:bg-gray-200 rounded" aria-label="Next day">
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      )}

       {/* Body — fills parent card neatly */}
       <div className="relative flex-1 overflow-hidden">
         <DndContext
           sensors={sensors}
           onDragStart={handleDragStart}
           onDragEnd={handleDragEnd}
           autoScroll={{ threshold: { x: 0.2, y: 0.2 }, acceleration: 10 }}
         >
          {/* Global drag overlay - Optimized with memoized content */}
          <DragOverlay 
            dropAnimation={null}
            adjustScale={false}
          >
            {overlayContent}
          </DragOverlay>
           {/* Inbox of unscheduled todos and todos for selected date WITHOUT time blocks */}
           {(() => {
             // Show:
             // 1. Unscheduled todos (no date)
             // 2. Todos for selected date WITHOUT time blocks (not on timeline yet)
             const inboxTodos = todos.filter((t) => {
               if (pendingScheduleIds.has(t._id)) return false
               
               // Unscheduled todos always in inbox
               if (!t.scheduledDate) return true
               
               // If todo has time blocks, it's on the timeline - DON'T show in inbox
               if (t.startTime && t.endTime) return false
               
               // Todos with date but NO time blocks - show in inbox for that date
               const todoDate = new Date(t.scheduledDate).toISOString().split('T')[0]
               return todoDate === internalSelectedDate
             })
             
            if (inboxTodos.length === 0) return null
            const isPastDate = internalSelectedDate < getLocalDateString(new Date())
            return (
               <div className="border-b-3 border-black bg-white/90 px-3 py-2.5">
                 <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-2">
                     <span className="text-[12px] font-semibold text-gray-900">Inbox</span>
                     <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 text-[10px]">
                       {inboxTodos.length}
                     </span>
                   </div>
                   <span className="text-[10px] text-gray-500">Drag onto the timeline</span>
                 </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {inboxTodos.map((t) => (
                    <InboxDraggable key={t._id} todo={t} colorMap={COLOR_BLOCK} onPressStart={() => handlePressStart(t._id)} onPressEnd={handlePressEnd} isPressing={isPressing === t._id} disabled={isPastDate} />
                  ))}
                 </div>
               </div>
             )
           })()}

           <div ref={scrollRef} className="relative h-full w-full overflow-y-auto scrollbar-hide">
          {/* Full-day canvas */}
          <div className={showHeader ? "relative pt-6" : "relative pt-2"} style={{ height: 24 * HOUR_HEIGHT }}>
            {/* Hour lines */}
            {timeLabels.map(({ minutes }, i) => (
              <div key={`h-${i}`} className="absolute inset-x-0 border-t border-gray-100" style={{ top: minutes * MINUTE_TO_PX }} />
            ))}
            {/* Quarter lines (extra light) - every 15 min across full 24h (00:15..23:45) */}
            {Array.from({ length: 24 }, (_, h) => (
              [15, 30, 45].map((q) => {
                const minutes = h * 60 + q
                return (
                  <div
                    key={`q-${h}-${q}`}
                    className="absolute inset-x-0 border-t border-gray-50"
                    style={{ top: minutes * MINUTE_TO_PX }}
                  />
                )
              })
            ))}

            {/* Left time rail (tight) */}
            <div className="pointer-events-none absolute left-0 top-0" style={{ width: railWidth }}>
              {timeLabels.map(({ label, minutes }, i) => (
                <div
                  key={`lbl-${i}`}
                  className="absolute -translate-y-1/2 px-2 text-[10px] font-mono text-gray-500"
                  style={{ top: (minutes * MINUTE_TO_PX) + 24 }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Grid area (tasks) */}
            <div className="absolute top-0" style={{ left: railWidth, right: 8 }}>
              {/* Droppable time slots (every 5 minutes) */}
              {Array.from({ length: 288 }, (_, i) => i * 5).map((m) => (
                <DroppableSlot key={m} id={`slot-${m}`} top={m * MINUTE_TO_PX} height={5 * MINUTE_TO_PX} />
              ))}

              {/* Tasks */}
              {metas.map(({ todo, top, height, start, end, duration, col, widthCols }) => {
                const today = getLocalDateString(new Date())
                const isToday = internalSelectedDate === today
                const isPastDate = internalSelectedDate < today
                const occurrenceCompleted = (() => {
                  // For recurring todos, check if selected date is in completedDates; otherwise use isCompleted
                  const rec: any = (todo as any).recurring
                  if (rec && rec !== 'none') {
                    const dates = Array.isArray((todo as any).completedDates) ? (todo as any).completedDates : []
                    return dates.includes(internalSelectedDate)
                  }
                  return Boolean(todo.isCompleted)
                })()
                const dragDisabled = isPastDate || occurrenceCompleted

                // width/left for columns inside a narrow box (max 3)
                const mobilePad = isMobile ? 6 : 0
                const totalWidth = `calc(100% - ${(widthCols - 1) * COLUMN_GAP + mobilePad}px)`
                const width = `calc(${totalWidth} / ${widthCols})`
                const left = `calc((${width} + ${COLUMN_GAP}px) * ${col} + ${mobilePad}px)`

                return (
                  <DraggableTimelineBlock
                    key={todo._id}
                    todo={todo}
                    top={top}
                    height={height}
                    width={width}
                    left={left}
                    start={start}
                    end={end}
                    duration={duration}
                    onEditTodo={onEditTodo}
                    isToday={isToday}
                    currentMinute={currentMinute}
                    COLOR_LEFT={COLOR_LEFT}
                    COLOR_BLOCK={COLOR_BLOCK}
                    isPressing={isPressing === todo._id}
                    onPressStart={() => handlePressStart(todo._id)}
                    onPressEnd={handlePressEnd}
                    disabled={dragDisabled}
                  />
                )
              })}
            </div>
          </div>


        </div>
        </DndContext>
        {/* Conflict dialog for drag-scheduling */}
        <ConflictWarningDialog
          isOpen={showConflictDialog}
          onClose={() => { setShowConflictDialog(false); setConflicts([]); setPendingSchedule(null) }}
          onConfirm={async () => {
            if (pendingSchedule) {
              try {
                await updateTodo({ _id: pendingSchedule.todoId, dueDate: pendingSchedule.dateISO, startTime: pendingSchedule.startTime, endTime: pendingSchedule.endTime })
                onTodoUpdate?.()
              } catch (err) {
                console.error('Failed to schedule after confirm:', err)
              }
            }
            setShowConflictDialog(false)
            setConflicts([])
            setPendingSchedule(null)
          }}
          conflicts={conflicts}
          newTodoTitle={pendingSchedule?.title || ''}
          newTimeSlot={`${formatTo12Hour(pendingSchedule?.startTime || '00:00')} - ${formatTo12Hour(pendingSchedule?.endTime || '00:00')} on ${internalSelectedDate}`}
        />
      </div>
    </div>
  )
}

// Draggable chip for Inbox items
function InboxDraggable({ todo, colorMap, onPressStart, onPressEnd, isPressing, disabled }: { todo: Todo, colorMap: Record<string,string>, onPressStart: () => void, onPressEnd: () => void, isPressing: boolean, disabled: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: todo._id, disabled })
  const style = { transform: transform ? `translate3d(${transform.x ?? 0}px, ${transform.y ?? 0}px, 0)` : undefined, touchAction: 'none' as const }
  const baseColor = (todo.color ?? 'blue') as string
  const leftAccent = COLOR_LEFT[baseColor] ?? COLOR_LEFT.blue
  const classes = [
    'relative shrink-0 inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[12px] text-gray-900 bg-white',
    'shadow-sm hover:shadow transition',
    'before:absolute before:left-0.5 before:top-1/2 before:-translate-y-1/2 before:h-3.5 before:w-1.5 before:rounded before:content-[""]',
    leftAccent.replace('before:bg-', 'before:bg-'),
    'border-gray-200',
    disabled ? 'cursor-not-allowed opacity-60' : (isDragging ? 'cursor-grabbing shadow-md opacity-0' : 'cursor-grab'),
    isPressing ? 'scale-105 shadow-md' : '',
  ].join(' ')
  return (
    <div ref={setNodeRef} style={style} className={classes} onTouchStart={disabled ? undefined : onPressStart} onTouchEnd={disabled ? undefined : onPressEnd} onTouchCancel={disabled ? undefined : onPressEnd} {...(disabled ? {} as any : listeners)} {...(disabled ? {} as any : attributes)}>
      <span className="truncate max-w-[160px]">{todo.title}</span>
      
    </div>
  )
}

// Invisible droppable slot covering 15-min interval row
function DroppableSlot({ id, top, height }: { id: string; top: number; height: number }) {
  const { setNodeRef } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className="absolute inset-x-0" style={{ top, height }} aria-hidden="true" />
  )
}
"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { Clock, Dot, ChevronLeft, ChevronRight } from "lucide-react"
import type { Todo } from "@/services"
import { updateTodo } from "@/services"
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
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
  COLOR_BLOCK
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
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: todo._id,
  })


  const style = {
    transform: CSS.Translate.toString(transform),
    top,
    height,
    width,
    left,
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
        "absolute rounded-md border shadow-sm transition",
        "hover:shadow-md",
        todo.isCompleted ? "opacity-60" : "",
        "before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:rounded-l-md",
        leftColor,
        blockColor,
        isDragging ? "cursor-grabbing shadow-lg z-50 opacity-80" : "cursor-grab",
      ].join(" ")}
      aria-label={`Drag ${todo.title}`}
      {...listeners}
      {...attributes}
    >
      <div className="flex h-full flex-col px-2.5 py-1.5">
        <div className="flex items-center justify-between">
          <span className="truncate text-[12px] font-semibold text-gray-900">{todo.title}</span>
          <div className="flex items-center gap-1">
            {live && (
              <span className="inline-flex items-center gap-0.5 rounded border border-emerald-200 px-1 py-0.5 text-[10px] text-emerald-700">
                <Dot className="h-3 w-3 animate-pulse text-emerald-600" />
                Live
              </span>
            )}
          </div>
        </div>
        <div className="mt-0.5 text-[10px] font-mono text-gray-500">
          {formatTo12Hour(todo.startTime)} – {formatTo12Hour(todo.endTime)} • {duration < 60 ? `${duration}m` : `${Math.floor(duration / 60)}h ${duration % 60}m`}
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
  const [hours, minutes] = time24.split(':').map(Number)
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
  blue: "bg-blue-50 border-blue-200",
  green: "bg-green-50 border-green-200",
  purple: "bg-purple-50 border-purple-200",
  orange: "bg-orange-50 border-orange-200",
  red: "bg-red-50 border-red-200",
  pink: "bg-pink-50 border-pink-200",
  indigo: "bg-indigo-50 border-indigo-200",
  teal: "bg-teal-50 border-teal-200",
  yellow: "bg-yellow-50 border-yellow-200",
  gray: "bg-gray-50 border-gray-200",
}

/* ------------ Helpers ------------ */
const timeToMinutes = (t: string) => {
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
  
  // Configure sensors for better drag experience (including touch)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 0, // No delay for immediate touch response
        tolerance: 3, // Very small tolerance for immediate drag start
      },
    })
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
    const d = new Date(dateISO + 'T00:00:00Z')
    if (recurring === 'daily') return true
    if (recurring === 'weekly') {
      const map = ['sun','mon','tue','wed','thu','fri','sat']
      const daysArr: string[] = Array.isArray((todo as any).days) ? (todo as any).days : []
      return daysArr.includes(map[d.getUTCDay()])
    }
    if (recurring === 'monthly') {
      const baseDay = new Date(baseISO + 'T00:00:00Z').getUTCDate()
      return d.getUTCDate() === baseDay
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
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
    
    return result
  }, [todos, internalSelectedDate])

  const metas = useMemo(() => {
    const m = filtered.map((t) => ({ todo: t, ...computeBlock(t.startTime, t.endTime) }))
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
    console.log('Drag started!', event)
    const { active } = event
    setActiveId(active.id as string)
    
    // Find the todo being dragged
    const todo = todos.find(t => t._id === active.id)
    if (todo) {
      setActiveTodo(todo)
      console.log('Dragging todo:', todo.title)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, delta } = event
    
    if (!activeTodo || !delta.y) {
      setActiveId(null)
      setActiveTodo(null)
      return
    }

    // Calculate new time based on drag distance
    const deltaMinutes = Math.round(delta.y / MINUTE_TO_PX)
    const originalStartMinutes = timeToMinutes(activeTodo.startTime)
    const originalEndMinutes = timeToMinutes(activeTodo.endTime)
    const duration = originalEndMinutes - originalStartMinutes
    
    // Round to nearest 5-minute interval
    const newStartMinutes = Math.max(0, Math.min(1435, Math.round((originalStartMinutes + deltaMinutes) / 5) * 5)) // 1435 = 23:55 (last 5-min slot)
    const newEndMinutes = Math.max(5, Math.min(1440, newStartMinutes + duration)) // 1440 = 24:00
    
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
  }


  // Auto-scroll to first task or current time
  useEffect(() => {
    if (!scrollRef.current) return
    
    const today = getLocalDateString(new Date())
    
    if (filtered.length > 0) {
      // If there are tasks, scroll to the first task
      const firstTask = filtered[0]
      const firstTaskStartMinutes = timeToMinutes(firstTask.startTime)
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
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white">
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
            <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[11px] text-gray-700">
              {filtered.length}
            </span>
            <span className="text-[10px] text-gray-500 font-mono">
              {internalSelectedDate}
            </span>
          </div>
        </div>
      )}

       {/* Body — fills parent card neatly */}
       <div className="relative flex-1 overflow-hidden">
         <DndContext
           sensors={sensors}
           collisionDetection={closestCenter}
           onDragStart={handleDragStart}
           onDragEnd={handleDragEnd}
         >
           <div ref={scrollRef} className="relative h-full w-full overflow-y-auto scrollbar-hide">
          {/* Full-day canvas */}
          <div className="relative pt-6" style={{ height: 24 * HOUR_HEIGHT }}>
            {/* Hour lines */}
            {timeLabels.map(({ minutes }, i) => (
              <div key={`h-${i}`} className="absolute inset-x-0 border-t border-gray-100" style={{ top: minutes * MINUTE_TO_PX }} />
            ))}
            {/* Quarter lines (extra light) */}
            {Array.from({ length: 24 * 3 }, (_, i) => {
              const minutes = (i + 1) * 15
              return <div key={`q-${i}`} className="absolute inset-x-0 border-t border-gray-50" style={{ top: minutes * MINUTE_TO_PX }} />
            })}

            {/* Left time rail (tight) */}
            <div className="pointer-events-none absolute left-0 top-0" style={{ width: RAIL_WIDTH }}>
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
            <div className="absolute top-0" style={{ left: RAIL_WIDTH, right: 8 }}>

              {/* Tasks */}
              {metas.map(({ todo, top, height, start, end, duration, col, widthCols }) => {
                const today = getLocalDateString(new Date())
                const isToday = internalSelectedDate === today

                // width/left for columns inside a narrow box (max 3)
                const totalWidth = `calc(100% - ${(widthCols - 1) * COLUMN_GAP}px)`
                const width = `calc(${totalWidth} / ${widthCols})`
                const left = `calc((${width} + ${COLUMN_GAP}px) * ${col})`

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
                  />
                )
              })}
            </div>
          </div>


        </div>
        </DndContext>
      </div>
    </div>
  )
}
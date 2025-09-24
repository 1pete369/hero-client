export type TimeSlot = {
  date: string
  start: string
  end: string
}

export type TimeConflict = {
  todo: {
    _id: string
    title: string
    scheduledDate: string
    startTime: string
    endTime: string
    priority?: string
  }
  conflictType?: 'overlap' | 'adjacent' | 'contains'
}

const isYMD = (s: unknown) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s)
const toLocalYMD = (input: string | Date) => {
  const d = typeof input === "string" ? new Date(input) : input
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}
const normDate = (v: unknown) => (isYMD(v) ? v as string : toLocalYMD(v instanceof Date ? v : new Date()))
const timeToMin = (t: string) => {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + (m || 0)
}
const overlap = (aS: number, aE: number, bS: number, bE: number) => aS < bE && bS < aE

export const formatConflictMessage = (conflict: TimeConflict): string => {
  const { todo } = conflict
  return `${todo.title} (${todo.startTime} - ${todo.endTime})`
}

export function detectTimeConflicts(
  slot: TimeSlot,
  todos: Array<{ _id: string; title: string; scheduledDate: string; startTime: string; endTime: string; priority?: string }>,
  excludeId?: string
): TimeConflict[] {
  const slotDate = normDate(slot.date)
  const s1 = timeToMin(slot.start)
  const e1 = timeToMin(slot.end)

  const conflicts: TimeConflict[] = []
  for (const t of todos) {
    if (excludeId && t._id === excludeId) continue
    const tDate = normDate(t.scheduledDate)
    if (tDate !== slotDate) continue
    const s2 = timeToMin(t.startTime)
    const e2 = timeToMin(t.endTime)
    if (overlap(s1, e1, s2, e2)) {
      conflicts.push({
        todo: {
          _id: t._id,
          title: t.title,
          scheduledDate: tDate,
          startTime: t.startTime,
          endTime: t.endTime,
          priority: t.priority || 'medium'
        },
        conflictType: 'overlap'
      })
    }
  }
  return conflicts
}



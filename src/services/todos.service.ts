import { axiosAppInstance } from "@/lib/axiosAppInstance"

export interface Todo {
  _id: string
  title: string
  description: string
  isCompleted: boolean
  startTime: string | null
  endTime: string | null
  category: string
  icon: string
  recurring: "none" | "daily" | "weekly" | "monthly"
  days: string[]
  priority: "low" | "medium" | "high"
  completedDates: string[]
  scheduledDate: string | null
  color: "blue" | "green" | "purple" | "orange" | "red" | "pink" | "indigo" | "teal" | "yellow" | "gray"
  googleCalendarEventId?: string | null
  syncedToCalendar?: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTodoData {
  title: string
  description: string
  priority: "low" | "medium" | "high"
  dueDate?: string | null
  category: string
  startTime?: string | null
  endTime?: string | null
  icon: string
  recurring: "none" | "daily" | "weekly" | "monthly"
  days: string[]
  color: "blue" | "green" | "purple" | "orange" | "red" | "pink" | "indigo" | "teal" | "yellow" | "gray"
}

export interface UpdateTodoData extends Partial<CreateTodoData> {
  _id: string
}

// Use absolute path when NEXT_PUBLIC_MAIN_API_URL is set; otherwise rely on axios baseURL
const baseUrl = "/task"

export const getTodos = async (): Promise<Todo[]> => {
  const response = await axiosAppInstance.get(baseUrl)
  return response.data
}

export const createTodo = async (todoData: CreateTodoData): Promise<Todo> => {
  const { dueDate, ...rest } = todoData
  const payload: any = {
    ...rest,
    isCompleted: false,
    completedDates: [],
  }
  if (typeof dueDate !== 'undefined') {
    payload.scheduledDate = dueDate
  }
  // Remove undefined keys to avoid sending them
  Object.keys(payload).forEach((k) => (payload[k] === undefined ? delete payload[k] : null))
  const response = await axiosAppInstance.post(baseUrl, payload)
  return response.data
}

export const updateTodo = async (todoData: UpdateTodoData): Promise<Todo> => {
  const { _id, ...updateData } = todoData
  const { dueDate, ...rest } = updateData
  const payload: any = {
    ...rest,
  }
  if ('dueDate' in updateData) {
    // Allow null to unschedule
    payload.scheduledDate = dueDate ?? null
  }
  Object.keys(payload).forEach((k) => (payload[k] === undefined ? delete payload[k] : null))
  const response = await axiosAppInstance.patch(`${baseUrl}/${_id}`, payload)
  return response.data
}

export const deleteTodo = async (todoId: string): Promise<void> => {
  await axiosAppInstance.delete(`${baseUrl}/${todoId}`)
}

export const toggleTodoStatus = async (todoId: string): Promise<Todo> => {
  const response = await axiosAppInstance.patch(`${baseUrl}/${todoId}/toggle`)
  return response.data
}

// Calendar sync functions
export interface CalendarSyncStatus {
  syncEnabled: boolean
  hasGoogleAccount: boolean
  hasRefreshToken: boolean
}

export const getCalendarSyncStatus = async (): Promise<CalendarSyncStatus> => {
  const response = await axiosAppInstance.get("/calendar/status")
  return response.data
}

export const toggleCalendarSync = async (enabled: boolean): Promise<{ syncEnabled: boolean; message: string }> => {
  const response = await axiosAppInstance.post("/calendar/toggle", { enabled })
  return response.data
}

export const syncTodoToCalendar = async (todoId: string): Promise<{ success: boolean; task: Todo; message: string }> => {
  const response = await axiosAppInstance.post(`/calendar/sync/${todoId}`)
  return response.data
}

export const syncAllTodosToCalendar = async (): Promise<{ 
  success: boolean
  syncedCount: number
  failedCount: number
  totalTasks: number
  message: string 
}> => {
  const response = await axiosAppInstance.post("/calendar/sync-all")
  return response.data
}

export const unsyncTodoFromCalendar = async (todoId: string): Promise<{ success: boolean; task: Todo; message: string }> => {
  const response = await axiosAppInstance.delete(`/calendar/sync/${todoId}`)
  return response.data
}


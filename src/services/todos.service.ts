import { axiosAppInstance } from "@/lib/axiosAppInstance"

export interface Todo {
  _id: string
  title: string
  description: string
  isCompleted: boolean
  startTime: string
  endTime: string
  category: string
  icon: string
  recurring: "none" | "daily" | "weekly" | "monthly"
  days: string[]
  priority: "low" | "medium" | "high"
  completedDates: string[]
  scheduledDate: string
  color: "blue" | "green" | "purple" | "orange" | "red" | "pink" | "indigo" | "teal" | "yellow" | "gray"
  createdAt: string
  updatedAt: string
}

export interface CreateTodoData {
  title: string
  description: string
  priority: "low" | "medium" | "high"
  dueDate: string
  category: string
  startTime: string
  endTime: string
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
  const response = await axiosAppInstance.post(baseUrl, {
    ...todoData,
    scheduledDate: todoData.dueDate,
    isCompleted: false,
    completedDates: [],
  })
  return response.data
}

export const updateTodo = async (todoData: UpdateTodoData): Promise<Todo> => {
  const { _id, ...updateData } = todoData
  const response = await axiosAppInstance.patch(`${baseUrl}/${_id}`, {
    ...updateData,
    scheduledDate: updateData.dueDate,
  })
  return response.data
}

export const deleteTodo = async (todoId: string): Promise<void> => {
  await axiosAppInstance.delete(`${baseUrl}/${todoId}`)
}

export const toggleTodoStatus = async (todoId: string): Promise<Todo> => {
  const response = await axiosAppInstance.patch(`${baseUrl}/${todoId}/toggle`)
  return response.data
}



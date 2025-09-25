import { axiosAppInstance } from "@/lib/axiosAppInstance"

export interface Goal {
  _id: string
  userId: string
  title: string
  description: string
  targetDate: string
  status: "active" | "completed" | "cancelled"
  isCompleted: boolean
  progress: number
  linkedHabits: string[]
  priority: "low" | "medium" | "high"
  category: string
  missedDays: number
  currentStreak: number
  longestStreak: number
  createdAt: string
  updatedAt: string
}

export interface CreateGoalData {
  title: string
  description?: string
  targetDate: string
  priority?: "low" | "medium" | "high"
  category?: string
  linkedHabits?: string[]
}

export interface UpdateGoalData {
  title?: string
  description?: string
  targetDate?: string
  status?: "active" | "completed" | "cancelled"
  isCompleted?: boolean
  progress?: number
  priority?: "low" | "medium" | "high"
  category?: string
  linkedHabits?: string[]
}

const baseUrl = "/goal"

export const getGoals = async (): Promise<Goal[]> => {
  const response = await axiosAppInstance.get(baseUrl)
  return response.data
}

export const getGoalById = async (id: string): Promise<Goal> => {
  const response = await axiosAppInstance.get(`${baseUrl}/${id}`)
  return response.data
}

export const createGoal = async (goalData: CreateGoalData): Promise<Goal> => {
  const response = await axiosAppInstance.post(baseUrl, goalData)
  return response.data
}

export const updateGoal = async (id: string, goalData: UpdateGoalData): Promise<Goal> => {
  const response = await axiosAppInstance.patch(`${baseUrl}/${id}`, goalData)
  return response.data
}

export const deleteGoal = async (id: string): Promise<void> => {
  await axiosAppInstance.delete(`${baseUrl}/${id}`)
}

export const toggleGoalStatus = async (id: string, isCompleted: boolean): Promise<Goal> => {
  return updateGoal(id, { isCompleted })
}

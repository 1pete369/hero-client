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
  description: string
  targetDate: string
  priority?: "low" | "medium" | "high"
  category?: string
  linkedHabits?: string[]
}

export interface UpdateGoalData extends Partial<CreateGoalData> {
  _id: string
  status?: "active" | "completed" | "cancelled"
  progress?: number
}

const baseUrl = "/goal"

export const getGoals = async (): Promise<Goal[]> => {
  const response = await axiosAppInstance.get(baseUrl)
  return response.data
}

export const createGoal = async (goalData: CreateGoalData): Promise<Goal> => {
  const response = await axiosAppInstance.post(baseUrl, goalData)
  return response.data
}

export const updateGoal = async (goalData: UpdateGoalData): Promise<Goal> => {
  const { _id, ...updates } = goalData
  const response = await axiosAppInstance.patch(`${baseUrl}/${_id}`, updates)
  return response.data
}

export const deleteGoal = async (_id: string): Promise<void> => {
  await axiosAppInstance.delete(`${baseUrl}/${_id}`)
}



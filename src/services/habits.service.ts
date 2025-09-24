import { axiosAppInstance } from '@/lib/axiosAppInstance'

export interface Habit {
  _id: string
  title: string
  description: string
  frequency: 'daily' | 'weekly' | 'monthly'
  days: string[]
  startDate: string
  completedDates: string[]
  streak: number
  longestStreak: number
  lastCompletedAt: string | null
  linkedGoalId: string | null | { _id: string; title?: string; isCompleted?: boolean }
  icon: string
  category: string
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateHabitData {
  title: string
  frequency: 'daily' | 'weekly' | 'monthly'
  days?: string[]
  startDate: string
  icon?: string
  category: string
  linkedGoalId?: string
}

export interface UpdateHabitData extends Partial<CreateHabitData> {
  _id: string
}

export const habitsService = {
  getHabits: async (): Promise<Habit[]> => {
    const response = await axiosAppInstance.get('/habit')
    return response.data
  },

  createHabit: async (data: CreateHabitData): Promise<Habit> => {
    const response = await axiosAppInstance.post('/habit', data)
    return response.data
  },

  updateHabit: async (data: UpdateHabitData): Promise<Habit> => {
    const { _id, ...updateData } = data
    const response = await axiosAppInstance.patch(`/habit/${_id}`, updateData)
    return response.data
  },

  deleteHabit: async (id: string): Promise<void> => {
    await axiosAppInstance.delete(`/habit/${id}`)
  },

  toggleTodayCompletion: async (id: string): Promise<Habit> => {
    const response = await axiosAppInstance.patch(`/habit/${id}/complete`)
    return response.data.habit
  }
}



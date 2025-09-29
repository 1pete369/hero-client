// Mock notes service - no API calls
import { axiosAppInstance } from '@/lib/axiosAppInstance'

const baseUrl = '/note'

export interface Note {
  _id: string
  title: string
  content: string
  category: 'personal' | 'work' | 'learning' | 'ideas'
  tags: string[]
  isPinned: boolean
  linkedGoalId?: string
  linkedHabitId?: string
  linkedTodoId?: string
  createdAt: string
  updatedAt: string
}

export interface CreateNoteData {
  title: string
  content: string
  category: 'personal' | 'work' | 'learning' | 'ideas'
  tags?: string[]
  isPinned?: boolean
  linkedGoalId?: string
  linkedHabitId?: string
  linkedTodoId?: string
}

export interface UpdateNoteData extends Partial<CreateNoteData> {
  _id: string
}

export interface NoteFilters {
  category?: string
  search?: string
  tags?: string
  isPinned?: boolean
}

export interface NoteStats {
  totalNotes: number
  pinnedNotes: number
  categoryBreakdown: Record<string, number>
}

// Live service functions (backend API)
export const createNote = async (noteData: CreateNoteData): Promise<Note> => {
  const response = await axiosAppInstance.post(baseUrl, noteData)
  return response.data
}

export const getNotes = async (filters?: NoteFilters): Promise<Note[]> => {
  const params = new URLSearchParams()
  if (filters?.category && filters.category !== 'all') params.append('category', filters.category)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.tags) params.append('tags', filters.tags)
  if (filters?.isPinned !== undefined) params.append('isPinned', String(filters.isPinned))
  const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl
  const response = await axiosAppInstance.get(url)
  return response.data
}

export const getNoteById = async (id: string): Promise<Note> => {
  const response = await axiosAppInstance.get(`${baseUrl}/${id}`)
  return response.data
}

export const updateNote = async (noteData: UpdateNoteData): Promise<Note> => {
  const { _id, ...updateData } = noteData
  const response = await axiosAppInstance.put(`${baseUrl}/${_id}`, updateData)
  return response.data
}

export const deleteNote = async (id: string): Promise<void> => {
  await axiosAppInstance.delete(`${baseUrl}/${id}`)
}

export const togglePinNote = async (id: string): Promise<Note> => {
  const response = await axiosAppInstance.patch(`${baseUrl}/${id}/toggle-pin`)
  return response.data
}

export const getNoteStats = async (): Promise<NoteStats> => {
  // Optional endpoint; fallback to simple counts if not supported
  try {
    const response = await axiosAppInstance.get(`${baseUrl}/stats`)
    return response.data
  } catch {
    const all = await getNotes()
    return {
      totalNotes: all.length,
      pinnedNotes: all.filter(n => n.isPinned).length,
      categoryBreakdown: all.reduce((acc, n) => {
        acc[n.category] = (acc[n.category] || 0) + 1
        return acc
      }, {} as Record<string, number>),
    }
  }
}

// Utility functions
export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    personal: 'Personal',
    work: 'Work',
    learning: 'Learning',
    ideas: 'Ideas'
  }
  return labels[category] || category
}

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    personal: 'bg-purple-100 text-purple-800',
    work: 'bg-blue-100 text-blue-800',
    learning: 'bg-green-100 text-green-800',
    ideas: 'bg-yellow-100 text-yellow-800'
  }
  return colors[category] || 'bg-gray-100 text-gray-800'
}

export const ALL_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'personal', label: 'Personal' },
  { value: 'work', label: 'Work' },
  { value: 'learning', label: 'Learning' },
  { value: 'ideas', label: 'Ideas' }
]

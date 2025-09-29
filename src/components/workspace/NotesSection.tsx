"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Pin, Tag, Calendar, Edit, Trash2, Eye, EllipsisVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  getNotes, 
  deleteNote, 
  togglePinNote, 
  createNote,
  updateNote,
  type Note, 
  type NoteFilters,
  getCategoryColor,
  ALL_CATEGORIES
} from "@/services/notes.service"
import { useAuth } from "@/context/useAuthContext"
import toast from "react-hot-toast"

export default function NotesSection() {
  const router = useRouter()
  const { authUser, isCheckingAuth } = useAuth()
  const [allNotes, setAllNotes] = useState<Note[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [filters, setFilters] = useState<NoteFilters>({
    category: "all",
    search: "",
    isPinned: undefined
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "personal",
    tags: "",
    isPinned: false,
  })

  const getPlainText = (html: string) => {
    try {
      if (typeof window !== 'undefined') {
        const div = document.createElement('div')
        div.innerHTML = html || ''
        return div.textContent || div.innerText || ''
      }
    } catch {}
    return (html || '').replace(/<[^>]+>/g, '')
  }

  // Load notes
  const loadNotes = async () => {
    try {
      if (hasLoaded) setIsRefreshing(true); else setLoading(true)
      console.log('Loading notes with filters:', filters)
      console.log('Auth user status:', { authUser, isCheckingAuth })
      
      // Check if user is authenticated before making the request
      if (!authUser && !isCheckingAuth) {
        console.log('User not authenticated, redirecting to login')
        toast.error('Please log in to view notes')
        router.push('/login')
        return
      }
      
      // Fetch once from backend (unfiltered) and filter on client
      const notesData = await getNotes()
      console.log('Notes loaded successfully:', notesData)
      setAllNotes(notesData)
    } catch (error) {
      console.error('Failed to load notes:', error)
      const err = error as any
      console.error('Error details:', err?.response?.data || err?.message)
      
      // Handle specific error types
      if (typeof err?.message === 'string' && err.message.includes('Authentication required')) {
        toast.error('Please log in to view notes')
        router.push('/login')
      } else if (typeof err?.message === 'string' && err.message.includes('Server error')) {
        toast.error('Server error. Please try again later.')
      } else if (typeof err?.message === 'string' && err.message.includes('API endpoint not found')) {
        toast.error('Backend server is not running. Please check the server status.')
      } else {
        const msg = err?.response?.data?.message || err?.message || 'Unknown error'
        toast.error(`Failed to load notes: ${msg}`)
      }
    } finally {
      setLoading(false)
      setIsRefreshing(false)
      setHasLoaded(true)
    }
  }

  // Fetch only once on page load (when auth ready)
  useEffect(() => {
    if (!isCheckingAuth && authUser && !hasLoaded) {
      loadNotes()
    }
    if (!isCheckingAuth && !authUser) {
      setLoading(false)
      toast.error('Please log in to view notes')
    }
  }, [authUser, isCheckingAuth, hasLoaded])

  // Recompute visible notes when filters or data change
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...allNotes]
      if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter(n => n.category === filters.category)
      }
      if (filters.search) {
        const s = filters.search.toLowerCase()
        filtered = filtered.filter(n =>
          (n.title || '').toLowerCase().includes(s) ||
          (n.content || '').toLowerCase().includes(s) ||
          (n.tags || []).some(t => t.toLowerCase().includes(s))
        )
      }
      if (filters.isPinned !== undefined) {
        filtered = filtered.filter(n => !!n.isPinned === !!filters.isPinned)
      }
      // Sort: pinned first then newest
      filtered.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      setNotes(filtered)
    }
    applyFilters()
  }, [filters, allNotes])

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      await deleteNote(noteId)
      toast.success('Note deleted successfully')
      setAllNotes(prev => prev.filter(n => n._id !== noteId))
    } catch (error) {
      console.error('Failed to delete note:', error)
      toast.error('Failed to delete note. Please try again.')
    }
  }

  const handleTogglePin = async (noteId: string) => {
    try {
      const updated = await togglePinNote(noteId)
      toast.success('Note pin status updated')
      setAllNotes(prev => prev.map(n => n._id === noteId ? updated : n))
    } catch (error) {
      console.error('Failed to toggle pin:', error)
      toast.error('Failed to update note. Please try again.')
    }
  }

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }

  const handleCategoryChange = (value: string) => {
    setFilters(prev => ({ ...prev, category: value }))
  }

  const handlePinnedFilter = (value: string) => {
    const isPinned = value === 'all' ? undefined : value === 'pinned'
    setFilters(prev => ({ ...prev, isPinned }))
  }

  const resetForm = () => {
    setEditingNote(null)
    setFormData({ title: "", content: "", category: "personal", tags: "", isPinned: false })
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
      tags: (note.tags || []).join(', '),
      isPinned: !!note.isPinned,
    })
    setShowAddForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields')
      return
    }
    try {
      const tagsArray = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)

      if (editingNote) {
        const updated = await updateNote({
          _id: editingNote._id,
          title: formData.title,
          content: formData.content,
          category: formData.category as any,
          tags: tagsArray,
          isPinned: formData.isPinned,
        })
        toast.success('Note updated')
        setAllNotes(prev => prev.map(n => n._id === editingNote._id ? updated : n))
      } else {
        const created = await createNote({
          title: formData.title,
          content: formData.content,
          category: formData.category as any,
          tags: tagsArray,
          isPinned: formData.isPinned,
        })
        toast.success('Note created')
        setAllNotes(prev => [created, ...prev])
      }
      resetForm()
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to save note:', error)
      toast.error('Failed to save note. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls (no header) */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={filters.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Category Filter */}
        <Select value={filters.category || 'all'} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {ALL_CATEGORIES.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Pinned Filter */}
        <Select value={filters.isPinned === undefined ? 'all' : filters.isPinned ? 'pinned' : 'unpinned'} onValueChange={handlePinnedFilter}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pinned">Pinned</SelectItem>
            <SelectItem value="unpinned">Unpinned</SelectItem>
          </SelectContent>
        </Select>

        {/* Global header has the Add button; local New Note button removed */}
      </div>

      {/* Inline Create / Edit Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingNote ? 'Edit Note' : 'Add New Note'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter note title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="ideas">Ideas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={6}
                placeholder="Write your note content here..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="productivity, habits, goals"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPinned"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="isPinned" className="text-sm font-medium text-gray-700">
                Pin this note to the top
              </label>
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {editingNote ? 'Update Note' : 'Add Note'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { resetForm(); setShowAddForm(false) }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {notes.map((note) => (
          <div key={note._id} className="group relative bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200 transition-all">
            {note.isPinned && (
              <span className="absolute left-0 top-0 h-full w-[3px] rounded-l-xl bg-purple-600" />
            )}
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold tracking-tight text-gray-900 mb-1 line-clamp-1 truncate">{note.title}</h3>
                <div className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {getPlainText(note.content)}
                </div>
              </div>
              <div className="flex gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTogglePin(note._id)}
                  className="p-1 hover:bg-gray-100"
                >
                  <Pin className={`h-4 w-4 ${note.isPinned ? 'fill-current text-purple-600' : 'text-gray-600'}`} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-100">
                      <EllipsisVertical className="h-4 w-4 text-gray-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={4} className="w-32 p-1 text-xs">
                    <DropdownMenuItem onClick={() => handleEdit(note)} className="flex items-center gap-2 py-1.5">
                      <Edit className="h-3 w-3" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(note._id)} className="flex items-center gap-2 py-1.5 text-red-600 focus:text-red-700">
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {note.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px]">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Meta Info */}
            <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
              <div className="flex items-center gap-2">
                <Badge className={getCategoryColor(note.category)}>
                  {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* View Full Note Button */}
            <div className="mt-3">
              <Button
                variant="ghost"
                className="w-full justify-center text-purple-600 hover:bg-purple-50"
                onClick={() => router.push(`/workspace?section=notes&noteAction=view&noteId=${note._id}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Full Note
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {notes.length === 0 && (
        <div className="py-24">
          <div className="flex items-center justify-center">
            <div className="text-center max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
              <p className="text-gray-600">
                {filters.search || filters.category !== "all" || filters.isPinned !== undefined
                  ? "Try adjusting your search or filters"
                  : "You don't have any notes yet"
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

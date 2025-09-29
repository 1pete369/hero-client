"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Edit, Trash2, Pin, Calendar, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getNoteById, deleteNote, togglePinNote, getCategoryColor } from "@/services/notes.service"
import toast from "react-hot-toast"

export default function ViewNotePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const noteId = searchParams.get('noteId')
  
  const [note, setNote] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingPin, setIsTogglingPin] = useState(false)

  useEffect(() => {
    if (!noteId) {
      toast.error("Note ID not provided")
      router.push("/workspace?section=notes")
      return
    }

    const loadNote = async () => {
      try {
        setIsLoading(true)
        const noteData = await getNoteById(noteId)
        setNote(noteData)
      } catch (error) {
        console.error("Failed to load note:", error)
        toast.error("Failed to load note")
        router.push("/workspace?section=notes")
      } finally {
        setIsLoading(false)
      }
    }

    loadNote()
  }, [noteId, router])

  const handleDelete = async () => {
    if (!note) return
    
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return
    }

    try {
      setIsDeleting(true)
      await deleteNote(note._id)
      toast.success("Note deleted successfully")
      router.push("/workspace?section=notes")
    } catch (error) {
      console.error("Failed to delete note:", error)
      toast.error("Failed to delete note. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTogglePin = async () => {
    if (!note) return

    try {
      setIsTogglingPin(true)
      const updatedNote = await togglePinNote(note._id)
      setNote(updatedNote)
      toast.success(updatedNote.isPinned ? "Note pinned" : "Note unpinned")
    } catch (error) {
      console.error("Failed to toggle pin:", error)
      toast.error("Failed to update note. Please try again.")
    } finally {
      setIsTogglingPin(false)
    }
  }

  const handleEdit = () => {
    router.push(`/workspace?section=notes&noteAction=edit&noteId=${noteId}`)
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading note...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Note not found</h3>
          <p className="text-gray-600 mb-4">The note you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => router.push("/workspace?section=notes")}>
            Back to Notes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Actions (no back button or header) */}
      <div className="flex items-center justify-between mb-6">
        <div />

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleTogglePin}
            disabled={isTogglingPin}
            className="flex items-center gap-2"
          >
            <Pin className={`h-4 w-4 ${note.isPinned ? 'fill-current' : ''}`} />
            {isTogglingPin ? "Updating..." : note.isPinned ? "Unpin" : "Pin"}
          </Button>
          <Button
            variant="outline"
            onClick={handleEdit}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Note Content */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Meta Information */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(note.category)}`}>
                {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
            </div>
            
            {note.updatedAt !== note.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
              </div>
            )}

            {note.isPinned && (
              <div className="flex items-center gap-2 text-purple-600">
                <Pin className="h-4 w-4 fill-current" />
                <span className="font-medium">Pinned</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex items-center gap-1"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content (scrollable) */}
        <div className="px-6 py-6">
          <div className="prose max-w-none max-h-[60vh] overflow-y-auto scrollbar-hide">
            <div className="text-gray-900 leading-relaxed" dangerouslySetInnerHTML={{ __html: note.content }} />
          </div>
        </div>
      </div>

      {/* Linked Items */}
      {(note.linkedGoalId || note.linkedHabitId || note.linkedTodoId) && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Linked Items</h3>
          <div className="space-y-2 text-sm text-blue-800">
            {note.linkedGoalId && (
              <div>• Linked to Goal: {note.linkedGoalId}</div>
            )}
            {note.linkedHabitId && (
              <div>• Linked to Habit: {note.linkedHabitId}</div>
            )}
            {note.linkedTodoId && (
              <div>• Linked to Todo: {note.linkedTodoId}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { X, Tag, Pin, PinOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { createNote, updateNote, type Note, type CreateNoteData, type UpdateNoteData } from "@/services/notes.service"
import toast from "react-hot-toast"

interface NoteFormProps {
  note?: Note | null
  onClose: () => void
  onSuccess: () => void
}

export default function NoteForm({ note, onClose, onSuccess }: NoteFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "personal" as "personal" | "work" | "learning" | "ideas",
    tags: "",
    isPinned: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with note data if editing
  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        category: note.category,
        tags: note.tags.join(", "),
        isPinned: note.isPinned
      })
    }
  }, [note])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error("Please enter a title")
      return
    }
    
    if (!formData.content.trim()) {
      toast.error("Please enter some content")
      return
    }

    setIsSubmitting(true)

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const noteData = {
        title: formData.title.trim(),
        content: formData.content,
        category: formData.category,
        tags: tagsArray,
        isPinned: formData.isPinned
      }

      if (note) {
        // Update existing note
        await updateNote({ _id: note._id, ...noteData })
        toast.success("Note updated successfully")
      } else {
        // Create new note
        await createNote(noteData)
        toast.success("Note created successfully")
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving note:', error)
      toast.error(note ? "Failed to update note" : "Failed to create note")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {note ? "Edit Note" : "Create New Note"}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter note title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
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

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <RichTextEditor
              content={formData.content}
              onChange={handleContentChange}
              placeholder="Start writing your note..."
            />
          </div>

          {/* Tags and Pin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="productivity, ideas, meeting"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">Separate tags with commas</p>
            </div>
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant={formData.isPinned ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, isPinned: !prev.isPinned }))}
                  className="flex items-center gap-2"
                >
                  {formData.isPinned ? (
                    <>
                      <Pin className="h-4 w-4" />
                      Pinned
                    </>
                  ) : (
                    <>
                      <PinOff className="h-4 w-4" />
                      Pin Note
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? "Saving..." : note ? "Update Note" : "Create Note"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

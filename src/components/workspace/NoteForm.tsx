"use client"

import { useState, useEffect } from "react"
import { X, Pin, PinOff, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { createNote, updateNote, type Note } from "@/services/notes.service"
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
    color: "yellow" as 'yellow' | 'pink' | 'blue' | 'green' | 'purple' | 'orange' | 'gray' | 'white' | 'black',
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
        color: (note as any).color || 'yellow',
        isPinned: note.isPinned
      })
    }
  }, [note])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) { toast.error("Please enter a title"); return }
    if (!formData.content.trim()) { toast.error("Please enter some content"); return }

    setIsSubmitting(true)
    try {
      const noteData = {
        title: formData.title.trim(),
        content: formData.content,
        category: formData.category,
        color: formData.color,
        isPinned: formData.isPinned
      }

      if (note) {
        await updateNote({ _id: note._id, ...noteData })
        toast.success("Note updated successfully")
      } else {
        await createNote(noteData as any)
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

  const bgForColor = (c: string) => (
    c === 'yellow' ? '#FEF3C7' :
    c === 'pink' ? '#FDE2E7' :
    c === 'blue' ? '#DBEAFE' :
    c === 'green' ? '#DCFCE7' :
    c === 'purple' ? '#EDE9FE' :
    c === 'orange' ? '#FFE4CC' :
    c === 'gray' ? '#F3F4F6' :
    c === 'white' ? '#FFFFFF' : '#111827'
  )

  const swatch = (c: string) => (
    <button
      key={c}
      type="button"
      onClick={() => setFormData(prev => ({ ...prev, color: c as any }))}
      className={`h-6 w-6 rounded-full border ${formData.color===c ? 'ring-2 ring-black' : ''}`}
      style={{ backgroundColor: (
        c==='yellow'?'#FACC15': c==='pink'?'#F472B6': c==='blue'?'#60A5FA': c==='green'?'#34D399': c==='purple'?'#A78BFA': c==='orange'?'#FB923C': c==='gray'?'#9CA3AF': c==='white'?'#FFFFFF':'#111827'
      ) }}
      aria-label={`Set color ${c}`}
    />
  )

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-stretch p-0" style={{ backgroundColor: bgForColor(formData.color) }}>
      <div className="w-full h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0" aria-label="Back to notes">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold text-gray-900">
              {note ? "Edit Note" : "Create New Note"}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="h-[calc(100%-64px)] overflow-auto">
          {/* Sticky Note Canvas */}
          <div className="min-h-full w-full">
            <div className="min-h-full w-full flex justify-center">
              <div className="w-full max-w-4xl min-h-full mx-auto p-6 md:p-10">
                {/* Title / Controls */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter note title"
                    required
                    className="w-full bg-transparent text-2xl font-semibold placeholder-gray-500 focus:outline-none"
                  />
                  <div className="flex gap-3 items-center">
                    <Select
                      value={formData.category}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="bg-white/60 backdrop-blur border-0 focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="learning">Learning</SelectItem>
                        <SelectItem value="ideas">Ideas</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      {['yellow','pink','blue','green','purple','orange','gray','white','black'].map(swatch)}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="mt-6">
                  <div className="max-w-4xl">
                    <RichTextEditor
                      content={formData.content}
                      onChange={handleContentChange}
                      placeholder="Write your note..."
                      borderless
                      backgroundColor={bgForColor(formData.color)}
                      minHeight={240}
                      maxHeight={500}
                    />
                  </div>
                </div>

                {/* Pin only */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center">
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

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6">
                  <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
                    {isSubmitting ? "Saving..." : note ? "Update Note" : "Create Note"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

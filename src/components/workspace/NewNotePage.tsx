"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createNote, type CreateNoteData } from "@/services/notes.service"
import { Checkbox } from "@/components/ui/checkbox"
import toast from "react-hot-toast"

export default function NewNotePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<CreateNoteData>({
    title: "",
    content: "",
    category: "personal",
    tags: [],
    isPinned: false
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsLoading(true)
      await createNote(formData)
      toast.success("Note created successfully")
      router.push("/workspace?section=notes")
    } catch (error) {
      console.error("Failed to create note:", error)
      toast.error("Failed to create note. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    setFormData({ ...formData, tags })
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* No header/back button */}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter note title"
              className="text-lg"
              required
            />
          </div>

          {/* Category and Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <Input
                value={(formData.tags ?? []).join(', ')}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="productivity, habits, goals"
              />
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your note content here..."
              rows={12}
              className="resize-none scrollbar-hide"
              required
            />
          </div>

          {/* Pin Option */}
          <div className="flex items-center gap-2 mb-6">
            <Checkbox
              id="isPinned"
              checked={formData.isPinned}
              onCheckedChange={(val) => setFormData({ ...formData, isPinned: Boolean(val) })}
            />
            <label htmlFor="isPinned" className="text-sm font-medium text-gray-700">
              Pin this note to the top
            </label>
          </div>
          {/* Actions (inside the form card) */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Creating..." : "Create Note"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

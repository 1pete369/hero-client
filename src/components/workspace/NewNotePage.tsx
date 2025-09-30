"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, X, Pin, PinOff } from "lucide-react"
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

  // Tags feature removed from form UI

  return (
    <div className="max-w-4xl mx-auto">
      {/* No header/back button */}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-0 rounded-lg border border-gray-200">
          <div className="p-4 md:p-6">
          {/* Title + Category + Pin (inline) */}
          <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-4 mb-6">
            <div className="md:col-span-2">
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Note Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter note title"
                className="h-10 text-sm md:text-base"
                required
              />
            </div>
            <div className="flex items-end gap-3 justify-start md:justify-end">
              <div className="min-w-[160px]">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="h-10">
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
              <Button
                type="button"
                variant={formData.isPinned ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, isPinned: !formData.isPinned })}
                className={`h-10 inline-flex items-center gap-2 ${formData.isPinned ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "text-gray-700"}`}
                aria-pressed={formData.isPinned}
                aria-label={formData.isPinned ? "Unpin note" : "Pin note"}
              >
                {formData.isPinned ? <Pin className="h-4 w-4 fill-current" /> : <PinOff className="h-4 w-4" />}
                <span className="hidden sm:inline">{formData.isPinned ? "Pinned" : "Pin"}</span>
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your note content here..."
              rows={14}
              className="resize-none scrollbar-hide text-xs md:text-sm min-h-[220px] md:min-h-[340px] lg:min-h-[400px]"
              required
            />
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
        </div>
      </form>
    </div>
  )
}

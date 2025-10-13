"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, X, Pin, PinOff, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createNote, type CreateNoteData } from "@/services/notes.service"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import toast from "react-hot-toast"

export default function NewNotePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<CreateNoteData>({
    title: "",
    content: "",
    category: "personal",
    color: "yellow" as any,
    isPinned: false
  })
  const [isLoading, setIsLoading] = useState(false)

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
    } catch (error: any) {
      const status = error?.response?.status
      const message = error?.response?.data?.error || error?.message
      if (status === 403 && typeof message === 'string' && message.toLowerCase().includes('quota')) {
        toast.error(`${message} — Upgrade your plan to add more.`)
      } else {
        console.error("Failed to create note:", error)
        toast.error("Failed to create note. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] -mx-4 sm:mx-0" style={{ backgroundColor: bgForColor(formData.color as any) }}>
      <form onSubmit={handleSubmit} className="h-full">
        <div className="w-full max-w-4xl mx-auto p-6 md:p-10">
          {/* Back */}
          <div className="flex items-center justify-between mb-4">
            <Button type="button" variant="ghost" size="sm" onClick={() => router.push('/workspace?section=notes')} className="h-8 w-8 p-0" aria-label="Back to notes">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          {/* Title / Category / Pin / Color */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter note title"
              className="w-full bg-transparent text-2xl font-semibold placeholder-gray-500 focus:outline-none"
              required
            />
            <div className="flex items-center gap-3">
              <div className="min-w[160px]">
                <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
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
              <div className="flex items-center gap-2">
                {['yellow','pink','blue','green','purple','orange','gray','white','black'].map(swatch)}
              </div>
            </div>
          </div>

          {/* Content (TipTap) */}
          <div className="mt-6">
            <RichTextEditor
              content={formData.content}
              onChange={(html) => setFormData({ ...formData, content: html })}
              placeholder="Write your note..."
              borderless
              backgroundColor={bgForColor(formData.color as any)}
              minHeight={240}
              maxHeight={500}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Creating..." : "Create Note"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/workspace?section=notes')} disabled={isLoading}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

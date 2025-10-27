"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Note, getNotes, deleteNote, togglePinNote } from "@/services/notes.service"
import { EllipsisVertical, Pin, PinOff, Trash2, Pencil } from "lucide-react"

const COLOR_HEX: Record<Note["color"], string> = {
  yellow: "#FEF3C7",
  pink: "#FCE7F3",
  blue: "#DBEAFE",
  green: "#DCFCE7",
  purple: "#EDE9FE",
  orange: "#FFEDD5",
  gray: "#F3F4F6",
  white: "#FFFFFF",
  black: "#111827",
}

export default function NotesFeature() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      const data = await getNotes()
      if (mounted) setNotes(data)
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [])

  const onDelete = async (id: string) => {
    await deleteNote(id)
    setNotes(prev => prev.filter(n => n._id !== id))
    setConfirmDeleteId(null)
  }

  const onTogglePin = async (id: string) => {
    const updated = await togglePinNote(id)
    setNotes(prev => prev.map(n => (n._id === id ? updated : n)))
  }

  return (
    <div className="w-full px-2 sm:px-3 pb-3">
      <div className="grid grid-cols-1 gap-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 border-3 border-black shadow-[6px_6px_0_0_#000] bg-gray-50 animate-pulse" />
          ))
        ) : notes.length === 0 ? (
          <div className="col-span-full text-center text-gray-600">No notes yet. Use Add to create one.</div>
        ) : (
          notes.map(note => (
            <Card key={note._id} style={{ backgroundColor: COLOR_HEX[note.color] }} className={`border-3 border-black shadow-[6px_6px_0_0_#000] ${note.color === 'black' ? 'text-white' : ''}`}>
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="text-base font-semibold truncate">{note.title}</div>
                    <div className="text-xs opacity-70 capitalize">{note.category}</div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" className="h-8 w-8 p-0 border-2 border-black shadow-[3px_3px_0_0_#000]">
                        <EllipsisVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-2 border-black">
                      <DropdownMenuItem onClick={() => onTogglePin(note._id)} className="gap-2">{note.isPinned ? <><PinOff className="h-4 w-4" /> Unpin</> : <><Pin className="h-4 w-4" /> Pin</>}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setConfirmDeleteId(note._id)} className="gap-2 text-red-600"><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-2 text-sm line-clamp-3" dangerouslySetInnerHTML={{ __html: note.content }} />
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete confirm */}
      <Dialog open={!!confirmDeleteId} onOpenChange={open => !open && setConfirmDeleteId(null)}>
        <DialogContent className="border-3 border-black shadow-[6px_6px_0_0_#000]">
          <div className="space-y-2">
            <div className="text-lg font-semibold">Delete note?</div>
            <div className="text-sm text-gray-600">This action cannot be undone.</div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" onClick={() => setConfirmDeleteId(null)} className="border-2 border-black shadow-[3px_3px_0_0_#000] bg-white">Cancel</Button>
              <Button type="button" onClick={() => confirmDeleteId && onDelete(confirmDeleteId)} className="border-2 border-black shadow-[3px_3px_0_0_#000] bg-black text-white">Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inline form replaces popup */}
    </div>
  )
}



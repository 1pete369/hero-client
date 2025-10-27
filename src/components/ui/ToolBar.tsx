"use client"

import { Button } from "./button"
import {
  Heading1,
  Heading2,
  Heading3,
  Code,
  Bold,
  Italic,
  Strikethrough,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Highlighter,
  Upload,
  Underline,
} from "lucide-react"
import { ListOrdered, List } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "./dialog"
import { Input } from "./input"
import { Label } from "./label"
import { ChangeEvent, useState } from "react"

type ToolBarProps = {
  editor: any
  className?: string
}

export default function ToolBar({ editor, className }: ToolBarProps) {
  const [open, setOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  if (!editor) return null

  const Action = ({ icon, pressed, onClick, ariaLabel }: { icon: React.ReactNode; pressed?: boolean; onClick: () => void; ariaLabel: string }) => (
    <Button
      type="button"
      variant="ghost"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`shrink-0 h-8 w-8 p-0 border-2 ${pressed ? "bg-black text-white" : "bg-white"} border-black shadow-[3px_3px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]`}
    >
      {icon}
    </Button>
  )

  const AddImage = () => {
    const handleAdd = () => {
      const url = imageUrl.trim()
      if (url) {
        editor.chain().focus().insertContent(`<img src="${url}" alt="Image" /><br />`).run()
      }
      setImageUrl("")
      setOpen(false)
    }

    const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") handleAdd()
    }

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" className="shrink-0 h-8 w-8 p-0 border-2 border-black shadow-[3px_3px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]" aria-label="Add Image">
            <Upload className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="border-3 border-black shadow-[6px_6px_0_0_#000]">
          <div className="space-y-2">
            <Label htmlFor="image-url">Image URL</Label>
            <Input id="image-url" value={imageUrl} onChange={(e: ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)} onKeyDown={handleKey} />
            <Button onClick={handleAdd} className="border-2 border-black shadow-[3px_3px_0_0_#000]">Insert</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className={`w-full -mx-2 px-2 overflow-x-auto scrollbar-hide overscroll-x-contain touch-pan-x ${className || ""}`}>
      <div className="inline-flex gap-1 pr-4 flex-nowrap min-w-max">
        <Action icon={<Heading1 className="h-4 w-4" />} pressed={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} ariaLabel="H1" />
        <Action icon={<Heading2 className="h-4 w-4" />} pressed={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} ariaLabel="H2" />
        <Action icon={<Heading3 className="h-4 w-4" />} pressed={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} ariaLabel="H3" />
        <Action icon={<Bold className="h-4 w-4" />} pressed={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} ariaLabel="Bold" />
        <Action icon={<Italic className="h-4 w-4" />} pressed={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} ariaLabel="Italic" />
        <Action icon={<Strikethrough className="h-4 w-4" />} pressed={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} ariaLabel="Strike" />
        <Action icon={<Underline className="h-4 w-4" />} pressed={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} ariaLabel="Underline" />
        <Action icon={<AlignLeft className="h-4 w-4" />} pressed={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} ariaLabel="Left" />
        <Action icon={<AlignCenter className="h-4 w-4" />} pressed={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} ariaLabel="Center" />
        <Action icon={<AlignRight className="h-4 w-4" />} pressed={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} ariaLabel="Right" />
        <Action icon={<List className="h-4 w-4" />} pressed={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} ariaLabel="Bullet List" />
        <Action icon={<ListOrdered className="h-4 w-4" />} pressed={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} ariaLabel="Ordered List" />
        <Action icon={<Code className="h-4 w-4" />} pressed={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} ariaLabel="Code" />
        <Action icon={<Highlighter className="h-4 w-4" />} pressed={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()} ariaLabel="Highlight" />
        <AddImage />
      </div>
    </div>
  )
}



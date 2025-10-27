"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TextAlign from "@tiptap/extension-text-align"
import Heading from "@tiptap/extension-heading"
import Highlight from "@tiptap/extension-highlight"
import Image from "@tiptap/extension-image"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import Underline from "@tiptap/extension-underline"
import ToolBar from "@/components/ui/ToolBar"
import { useEffect, useState } from "react"

type TextEditorProps = {
  content: string
  onChange: (html: string) => void
  belowToolbar?: React.ReactNode
}

export default function TextEditor({ content, onChange, belowToolbar }: TextEditorProps) {
  const [isFocused, setIsFocused] = useState(false)
  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Heading.configure({ levels: [1, 2, 3] }),
      OrderedList.configure({ HTMLAttributes: { class: "list-decimal ml-3" } }),
      BulletList.configure({ HTMLAttributes: { class: "list-disc ml-3" } }),
      Highlight,
      Image.configure({ inline: true, allowBase64: true, HTMLAttributes: { style: "max-width:100%; height:auto;" } }),
      Underline,
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose w-full min-h-[320px] dark:text-white max-w-none py-2 px-3 overflow-y-auto focus:outline-none whitespace-pre-wrap break-words",
      },
    },
    onUpdate: ({ editor }) => {
      if (!isFocused) {
        const html = editor.getHTML()
        onChange(html)
      }
    },
    onFocus: () => setIsFocused(true),
    onBlur: ({ editor }) => {
      onChange(editor.getHTML())
      setIsFocused(false)
    },
  })

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  return (
    <div className="relative w-full flex flex-col items-center px-2">
      {editor && (
        <div className="w-full max-w-5xl space-y-3">
          <ToolBar editor={editor} />
          {belowToolbar}
          <div className="w-full border-3 border-black rounded-md shadow-[6px_6px_0_0_#000] overflow-hidden">
            <EditorContent editor={editor} className="w-full h-[320px] sm:h-[380px] md:h-[460px]" />
          </div>
        </div>
      )}
    </div>
  )
}



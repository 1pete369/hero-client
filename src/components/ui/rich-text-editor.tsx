"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from './button'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  borderless?: boolean
  backgroundColor?: string
  minHeight?: string | number
  maxHeight?: string | number
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing...",
  className = "",
  borderless = false,
  backgroundColor,
  minHeight = 200,
  maxHeight
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [, forceUpdate] = useState({})

  const contentMinHeight = useMemo(() => typeof minHeight === 'number' ? `${minHeight}px` : String(minHeight), [minHeight])
  const contentMaxHeight = useMemo(() => maxHeight ? (typeof maxHeight === 'number' ? `${maxHeight}px` : String(maxHeight)) : undefined, [maxHeight])

  const editor = useEditor({
    extensions: [StarterKit, Image.configure({ inline: false }), Placeholder.configure({ placeholder })],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
      forceUpdate({})
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none ${borderless ? '' : 'p-4'}`
      },
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || !editor) {
    return (
      <div className={`${borderless ? '' : 'border border-gray-200 rounded-lg bg-white'} w-full ${className}`}>
        <div className={`${borderless ? '' : 'flex items-center gap-1 p-1 sm:p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg'} overflow-x-auto scrollbar-hide min-w-0`}></div>
        <div className="min-h-[200px]" />
      </div>
    )
  }

  const toolbarBase = "flex items-center gap-1 p-1 sm:p-2 overflow-x-auto scrollbar-hide min-w-0";
  const toolbarDecor = borderless ? "" : "border-b border-gray-200 bg-gray-50 rounded-t-lg";

  const placeholderStyle: React.CSSProperties = borderless
    ? { top: 0, left: 0 }
    : { top: 16, left: 16 } // 1rem offset when padded

  return (
    <div className={`${borderless ? '' : 'border border-gray-200 rounded-lg bg-white'} w-full ${className}`} style={{ background: borderless ? backgroundColor : undefined }}>
      {/* Toolbar */}
      <div className={`${toolbarBase} ${toolbarDecor}`}>
        <Button
          type="button"
          variant={editor.isActive('bold') ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            editor.chain().focus().toggleBold().run()
            forceUpdate({})
          }}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
          title="Bold"
        >
          <Bold className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        
        <Button
          type="button"
          variant={editor.isActive('italic') ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            editor.chain().focus().toggleItalic().run()
            forceUpdate({})
          }}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
          title="Italic"
        >
          <Italic className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        
        <div className="w-px h-5 sm:h-6 bg-gray-300 mx-1 flex-shrink-0" />
        
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 1 }) ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            editor.chain().focus().toggleHeading({ level: 1 }).run()
            forceUpdate({})
          }}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
          title="Heading 1"
        >
          <Heading1 className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 2 }) ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            editor.chain().focus().toggleHeading({ level: 2 }).run()
            forceUpdate({})
          }}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
          title="Heading 2"
        >
          <Heading2 className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 3 }) ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            editor.chain().focus().toggleHeading({ level: 3 }).run()
            forceUpdate({})
          }}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
          title="Heading 3"
        >
          <Heading3 className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        
        <div className="w-px h-5 sm:h-6 bg-gray-300 mx-1 flex-shrink-0" />
        
        <Button
          type="button"
          variant={editor.isActive('bulletList') ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            editor.chain().focus().toggleBulletList().run()
            forceUpdate({})
          }}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
          title="Bullet List"
        >
          <List className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        
        <Button
          type="button"
          variant={editor.isActive('orderedList') ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            editor.chain().focus().toggleOrderedList().run()
            forceUpdate({})
          }}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
          title="Numbered List"
        >
          <ListOrdered className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        
        <Button
          type="button"
          variant={editor.isActive('blockquote') ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            editor.chain().focus().toggleBlockquote().run()
            forceUpdate({})
          }}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
          title="Quote"
        >
          <Quote className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        
        <div className="w-px h-5 sm:h-6 bg-gray-300 mx-1 flex-shrink-0" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
          title="Undo"
        >
          <Undo className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
          title="Redo"
        >
          <Redo className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        
        <div className="w-px h-5 sm:h-6 bg-gray-300 mx-1 flex-shrink-0" />
        
        <label className="h-7 w-auto sm:h-8 px-2 inline-flex items-center justify-center text-xs sm:text-sm cursor-pointer bg-white hover:bg-gray-100 border rounded-md">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const inputEl = e.currentTarget
              const file = inputEl?.files?.[0]
              if (!file) return
              try {
                const form = new FormData()
                form.append('image', file)
                const res = await fetch('/api/upload/image', { method: 'POST', body: form })
                const data = await res.json()
                if (data?.imageUrl) {
                  editor.chain().focus().setImage({ src: data.imageUrl }).run()
                }
              } catch (err) {
                console.error('Image upload failed', err)
              } finally {
                if (inputEl) inputEl.value = ''
              }
            }}
          />
          <span>Image</span>
        </label>
      </div>
      
      {/* Editor Content */}
      <div className="relative" style={{ background: backgroundColor || 'transparent', minHeight: contentMinHeight, maxHeight: contentMaxHeight, overflow: contentMaxHeight ? 'auto' : undefined }}>
        <EditorContent 
          editor={editor} 
          className="focus-within:outline-none"
        />
        {!content && (
          <div className="absolute text-gray-400 pointer-events-none" style={placeholderStyle}>
            {placeholder}
          </div>
        )}
      </div>
    </div>
  )
}

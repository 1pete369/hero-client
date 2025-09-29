"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
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
import { useEffect, useState } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing...",
  className = ""
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [, forceUpdate] = useState({})

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
      forceUpdate({})
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || !editor) {
    return (
      <div className={`border border-gray-200 rounded-lg bg-white w-full ${className}`}>
        <div className="flex items-center gap-1 p-1 sm:p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg overflow-x-auto scrollbar-hide min-w-0">
          <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gray-200 rounded animate-pulse flex-shrink-0"></div>
          <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gray-200 rounded animate-pulse flex-shrink-0"></div>
          <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gray-200 rounded animate-pulse flex-shrink-0"></div>
        </div>
        <div className="min-h-[200px] p-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`border border-gray-200 rounded-lg bg-white w-full ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-1 sm:p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg overflow-x-auto scrollbar-hide min-w-0">
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
      </div>
      
      {/* Editor Content */}
      <div className="min-h-[200px] relative">
        <EditorContent 
          editor={editor} 
          className="focus-within:outline-none"
        />
        {!content && (
          <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  )
}

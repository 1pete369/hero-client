"use client"

import { useState, useEffect } from "react"
import { FileText, Plus, Edit, Trash2, Calendar, Tag, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Note {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  linkedGoal?: string
  linkedHabit?: string
  createdAt: string
  updatedAt: string
}

export default function NotesSection() {
  const [notes, setNotes] = useState<Note[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "personal",
    tags: ""
  })

  // Mock data for now - will be replaced with API calls
  useEffect(() => {
    const mockNotes: Note[] = [
      {
        id: "1",
        title: "Productivity System Ideas",
        content: "Key insights from reading Atomic Habits:\n- Make habits obvious\n- Make them attractive\n- Make them easy\n- Make them satisfying\n\nNeed to implement these in GrindFlow.",
        category: "learning",
        tags: ["productivity", "habits", "books"],
        createdAt: "2024-01-15",
        updatedAt: "2024-01-18"
      },
      {
        id: "2",
        title: "Meeting Notes - Team Sync",
        content: "Discussed Q1 goals:\n- Launch MVP by March\n- Get 100 beta users\n- Improve onboarding flow\n\nNext steps: Design review on Friday",
        category: "work",
        tags: ["meeting", "goals", "team"],
        createdAt: "2024-01-17",
        updatedAt: "2024-01-17"
      },
      {
        id: "3",
        title: "Personal Development Plan",
        content: "2024 Focus Areas:\n1. Technical Skills - React, Node.js\n2. Leadership - Team management\n3. Health - Daily exercise routine\n4. Learning - Read 24 books",
        category: "personal",
        tags: ["development", "goals", "planning"],
        createdAt: "2024-01-01",
        updatedAt: "2024-01-15"
      }
    ]
    setNotes(mockNotes)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    
    if (editingNote) {
      // Update existing note
      setNotes(notes.map(note => 
        note.id === editingNote.id 
          ? { 
              ...note, 
              ...formData, 
              tags: tagsArray,
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : note
      ))
      setEditingNote(null)
    } else {
      // Add new note
      const newNote: Note = {
        id: Date.now().toString(),
        ...formData,
        tags: tagsArray,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }
      setNotes([...notes, newNote])
    }
    
    setFormData({ title: "", content: "", category: "personal", tags: "" })
    setShowAddForm(false)
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
      tags: note.tags.join(', ')
    })
    setShowAddForm(true)
  }

  const handleDelete = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId))
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "work": return "bg-blue-100 text-blue-800"
      case "personal": return "bg-purple-100 text-purple-800"
      case "learning": return "bg-green-100 text-green-800"
      case "ideas": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === "all" || note.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const categories = ["all", "work", "personal", "learning", "ideas"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="h-8 w-8 text-purple-600" />
            Notes
          </h1>
          <p className="text-gray-600 mt-2">
            Capture ideas, insights, and important information
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingNote ? "Edit Note" : "Add New Note"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter note title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="learning">Learning</option>
                  <option value="ideas">Ideas</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={6}
                placeholder="Write your note content here..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="productivity, habits, goals"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {editingNote ? "Update Note" : "Add Note"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingNote(null)
                  setFormData({ title: "", content: "", category: "personal", tags: "" })
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <div key={note.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{note.title}</h3>
                <div className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {note.content}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(note)}
                  className="p-1 hover:bg-gray-100"
                >
                  <Edit className="h-4 w-4 text-gray-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(note.id)}
                  className="p-1 hover:bg-gray-100 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tags */}
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {note.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex items-center gap-1"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Meta Info */}
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(note.category)}`}>
                  {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
              {note.updatedAt !== note.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* View Full Note Button */}
            <Button
              variant="outline"
              className="w-full text-purple-600 border-purple-600 hover:bg-purple-50"
              onClick={() => {
                // In a real app, this would open a modal or navigate to a full note view
                alert(`Full note content:\n\n${note.content}`)
              }}
            >
              View Full Note
            </Button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredNotes.length === 0 && !showAddForm && (
        <div className="text-center flex-1 min-h-0 grid place-items-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory !== "all"
              ? "Try adjusting your search or filters"
              : "Start by creating your first note to capture your ideas"
            }
          </p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Note
          </Button>
        </div>
      )}
    </div>
  )
}



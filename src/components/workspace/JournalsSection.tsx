"use client"

import { useState, useEffect } from "react"
import { BookOpen, Plus, Edit, Trash2, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

interface JournalEntry {
  id: string
  title: string
  content: string
  mood: "excellent" | "good" | "neutral" | "bad" | "terrible"
  moodScore: number
  tags: string[]
  linkedGoal?: string
  linkedHabit?: string
  createdAt: string
  updatedAt: string
}

export default function JournalsSection() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [selectedMood, setSelectedMood] = useState<JournalEntry["mood"]>("good")
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: ""
  })

  // Mock data for now - will be replaced with API calls
  useEffect(() => {
    const mockEntries: JournalEntry[] = [
      {
        id: "1",
        title: "Productive Day Reflection",
        content: "Today was incredibly productive! Completed the React component ahead of schedule and made significant progress on the GrindFlow MVP. The morning exercise routine is really helping with focus and energy levels. Feeling motivated about the project's direction.",
        mood: "excellent",
        moodScore: 9,
        tags: ["productivity", "coding", "exercise"],
        createdAt: "2024-01-18",
        updatedAt: "2024-01-18"
      },
      {
        id: "2",
        title: "Learning from Setbacks",
        content: "Had a challenging day with some technical issues. The build kept failing and I spent hours debugging. However, I learned a lot about error handling and debugging techniques. Sometimes setbacks are the best teachers.",
        mood: "neutral",
        moodScore: 5,
        tags: ["learning", "challenges", "growth"],
        createdAt: "2024-01-17",
        updatedAt: "2024-01-17"
      },
      {
        id: "3",
        title: "Weekend Planning",
        content: "Planning for the weekend ahead. Want to focus on reading, some light coding practice, and spending time with family. Need to balance work and personal life better. Setting intention for a relaxing but productive weekend.",
        mood: "good",
        moodScore: 7,
        tags: ["planning", "balance", "family"],
        createdAt: "2024-01-16",
        updatedAt: "2024-01-16"
      }
    ]
    setEntries(mockEntries)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    const moodScore = getMoodScore(selectedMood)
    
    if (editingEntry) {
      // Update existing entry
      setEntries(entries.map(entry => 
        entry.id === editingEntry.id 
          ? { 
              ...entry, 
              ...formData, 
              tags: tagsArray,
              mood: selectedMood,
              moodScore,
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : entry
      ))
      setEditingEntry(null)
    } else {
      // Add new entry
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        ...formData,
        tags: tagsArray,
        mood: selectedMood,
        moodScore,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }
      setEntries([...entries, newEntry])
    }
    
    setFormData({ title: "", content: "", tags: "" })
    setSelectedMood("good")
    setShowAddForm(false)
  }

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry)
    setFormData({
      title: entry.title,
      content: entry.content,
      tags: entry.tags.join(', ')
    })
    setSelectedMood(entry.mood)
    setShowAddForm(true)
  }

  const handleDelete = (entryId: string) => {
    setEntries(entries.filter(entry => entry.id !== entryId))
  }

  const getMoodScore = (mood: JournalEntry["mood"]) => {
    switch (mood) {
      case "excellent": return 9
      case "good": return 7
      case "neutral": return 5
      case "bad": return 3
      case "terrible": return 1
      default: return 5
    }
  }

  const getMoodColor = (mood: JournalEntry["mood"]) => {
    switch (mood) {
      case "excellent": return "bg-green-100 text-green-800"
      case "good": return "bg-blue-100 text-blue-800"
      case "neutral": return "bg-yellow-100 text-yellow-800"
      case "bad": return "bg-orange-100 text-orange-800"
      case "terrible": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getMoodIcon = (mood: JournalEntry["mood"]) => {
    switch (mood) {
      case "excellent": return "😄"
      case "good": return "🙂"
      case "neutral": return "😐"
      case "bad": return "😕"
      case "terrible": return "😢"
      default: return "😐"
    }
  }

  const averageMood = entries.length > 0 
    ? entries.reduce((sum, entry) => sum + entry.moodScore, 0) / entries.length 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-orange-600" />
            Journals
          </h1>
          <p className="text-gray-600 mt-2">
            Reflect on your progress and track your emotional journey
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Mood Overview */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Mood Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {entries.length}
            </div>
            <div className="text-sm text-gray-600">Total Entries</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {averageMood.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Average Mood Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {entries.filter(e => e.mood === "excellent" || e.mood === "good").length}
            </div>
            <div className="text-sm text-gray-600">Positive Days</div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingEntry ? "Edit Journal Entry" : "Add New Journal Entry"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entry Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Give your entry a title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How are you feeling today?
              </label>
              <div className="grid grid-cols-5 gap-2">
                {( ["excellent", "good", "neutral", "bad", "terrible"] as const).map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setSelectedMood(mood)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedMood === mood
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{getMoodIcon(mood)}</div>
                    <div className="text-xs font-medium capitalize">{mood}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Journal Entry
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={8}
                placeholder="Write about your day, thoughts, feelings, achievements, challenges..."
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="productivity, learning, challenges, achievements"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                {editingEntry ? "Update Entry" : "Save Entry"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingEntry(null)
                  setFormData({ title: "", content: "", tags: "" })
                  setSelectedMood("good")
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Journal Entries */}
      <div className="space-y-6">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getMoodIcon(entry.mood)}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{entry.title}</h3>
                </div>
                <div className="text-sm text-gray-600 mb-3 line-clamp-4">
                  {entry.content}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(entry)}
                  className="p-1 hover:bg-gray-100"
                >
                  <Edit className="h-4 w-4 text-gray-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(entry.id)}
                  className="p-1 hover:bg-gray-100 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tags */}
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {entry.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Meta Info */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(entry.mood)}`}>
                  {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)} ({entry.moodScore}/10)
                </span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {entry.updatedAt !== entry.createdAt && (
                <div className="text-xs text-gray-500">
                  Edited: {new Date(entry.updatedAt).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* View Full Entry Button */}
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full text-orange-600 border-orange-600 hover:bg-orange-50"
                onClick={() => {
                  // In a real app, this would open a modal or navigate to a full entry view
                  alert(`Full journal entry:\n\n${entry.content}`)
                }}
              >
                Read Full Entry
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {entries.length === 0 && !showAddForm && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No journal entries yet</h3>
          <p className="text-gray-600 mb-4">Start journaling to reflect on your progress and track your emotional journey</p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Write Your First Entry
          </Button>
        </div>
      )}
    </div>
  )
}



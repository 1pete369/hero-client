import {
  Target,
  TrendingUp,
  CheckCircle,
  FileText,
  BookOpen,
  Users,
} from "lucide-react"

export default function Features() {
  return (
    <div className="mt-20 px-10">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Build Your Success System
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          GrindFlow isn&apos;t just another productivity app. It&apos;s a
          complete system for building the life you want.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="bg-white border-2 border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
            <Target className="h-6 w-6 text-indigo-700" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Goals</h3>
          <p className="text-gray-600 mb-4">
            Set clear, measurable goals and break them down into actionable
            steps. Track progress and celebrate milestones.
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
              Create SMART goals with deadlines
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
              Break down into sub-goals and tasks
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
              Visual progress tracking and milestones
            </li>
          </ul>
        </div>

        <div className="bg-white border-2 border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
            <TrendingUp className="h-6 w-6 text-green-700" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Habits</h3>
          <p className="text-gray-600 mb-4">
            Build powerful daily habits that compound over time. Track streaks,
            visualize patterns, and stay consistent.
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              Daily habit tracking and streak building
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              Link habits to specific goals
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              Habit analytics and insights
            </li>
          </ul>
        </div>

        <div className="bg-white border-2 border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
            <CheckCircle className="h-6 w-6 text-blue-700" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Todos</h3>
          <p className="text-gray-600 mb-4">
            Organize your daily tasks with priority levels, due dates, and goal
            alignment. Never miss important actions.
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              Priority-based task organization
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              Due dates and reminders
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              Link todos to goals and habits
            </li>
          </ul>
        </div>

        <div className="bg-white border-2 border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
            <FileText className="h-6 w-6 text-purple-700" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Notes</h3>
          <p className="text-gray-600 mb-4">
            Capture ideas, insights, and important information. Organize notes
            by topics and link them to your goals.
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              Quick note capture and organization
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              Tag and categorize notes
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              Link notes to goals and habits
            </li>
          </ul>
        </div>

        <div className="bg-white border-2 border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
            <BookOpen className="h-6 w-6 text-orange-700" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Journals</h3>
          <p className="text-gray-600 mb-4">
            Reflect on your progress, track mood, and document your journey.
            Build self-awareness and growth mindset.
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              Daily reflection and mood tracking
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              Progress journaling and insights
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              Habit and goal reflection
            </li>
          </ul>
        </div>

        <div className="bg-white border-2 border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
            <Users className="h-6 w-6 text-red-700" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Community & Accountability
          </h3>
          <p className="text-gray-600 mb-4">
            Share progress, join challenges, and stay accountable with others.
            Build momentum through community support.
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              Progress sharing and charts
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              Community challenges and groups
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              Accountability partners and support
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}



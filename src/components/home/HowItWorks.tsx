"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/useAuthContext"
import { ArrowRight, CheckCircle } from "lucide-react"

export default function HowItWorks() {
  const { authUser } = useAuth()

  return (
    <div className="mt-24 px-10">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          How GrindFlow Works
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Simple 3-step system that transforms your goals into daily wins
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-8 max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 text-white text-2xl font-bold rounded-full mb-6">
              1
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Set Your Goals
            </h3>
            <p className="text-gray-600 mb-6">
              Start with your big vision. Break down ambitious goals into SMART,
              measurable targets with clear deadlines.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                <span>Define your main objective</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                <span>Set specific milestones</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                <span>Choose your deadline</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center mb-20">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8 max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white text-2xl font-bold rounded-full mb-6">
              2
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Build Daily Habits
            </h3>
            <p className="text-gray-600 mb-6">
              Create habits that directly support your goals. Track daily
              progress and build momentum through consistency.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span>Link habits to goals</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span>Track daily streaks</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span>Visualize progress</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white text-2xl font-bold rounded-full mb-6">
              3
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Execute Daily Todos
            </h3>
            <p className="text-gray-600 mb-6">
              Turn your habits into specific daily actions. Every completed task
              moves you closer to your goals.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span>Plan your day</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span>Track completion</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span>Celebrate wins</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center mt-16">
        <p className="text-lg text-gray-600 mb-6">
          Ready to build your success system?
        </p>
        {authUser ? (
          <Button
            asChild
            className="bg-indigo-700 hover:bg-indigo-800 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Link href="/workspace" aria-label="Go to your GrindFlow workspace">
              Go to Workspace
              <ArrowRight size={20} className="ml-2" aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <Button
            asChild
            className="bg-indigo-700 hover:bg-indigo-800 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Link href="/signup" aria-label="Start your free trial">
              Start Your Free Trial
              <ArrowRight size={20} className="ml-2" aria-hidden="true" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}



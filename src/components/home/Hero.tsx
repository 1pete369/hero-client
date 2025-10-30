"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/useAuthContext"
import toast from "react-hot-toast"
import { ArrowRight, CheckCircle, PlayCircle } from "lucide-react"

export default function Hero() {
  const { authUser } = useAuth()

  return (
    <section className="relative z-10 pt-28 pb-8 px-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">

          <h1 className="text-5xl lg:text-7xl font-bold text-gray-950 mb-6 leading-tight tracking-tight">
            <span className="relative inline-block group">
              <span className="relative z-10">Own Your Day</span>
              <span
                className="
                  pointer-events-none
                  absolute inset-x-0 bottom-[0.12em]
                  h-[0.40em]
                  -z-10
                  rounded
                  -skew-x-6
                  bg-gradient-to-r from-indigo-100 via-indigo-200 to-indigo-300
                  transition-transform duration-200 ease-out
                  group-hover:scale-x-105
                "
                aria-hidden="true"
              />
            </span>
            <span className="block bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              Master Your Life
            </span>
          </h1>

          <p className="text-xl lg:text-2xl text-gray-600 mb-9 max-w-3xl mx-auto leading-relaxed">
            GrindFlowClub is the {" "}
            <span className="font-semibold text-gray-900">
              accountability-first productivity system, habit tracker, and calendar
            </span>{" "}
            that turns goals into daily wins. Plan your day, track habits, and stay consistent with real accountability and clean analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            {authUser ? (
              <Button
                asChild
                className="bg-indigo-700 hover:bg-indigo-800 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Link href="/workspace" aria-label="Go to your GrindFlowClub workspace">
                  Go to Workspace
                  <ArrowRight size={20} className="ml-2" aria-hidden="true" />
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  className="bg-indigo-700 hover:bg-indigo-800 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Link href="/signup" aria-label="Start your free trial">
                    Start Free Trial
                    <ArrowRight size={20} className="ml-2" aria-hidden="true" />
                  </Link>
                </Button>

                {/* Demo removed */}
              </>
            )}
          </div>

          
        </div>

      </div>
    </section>
  )
}



"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/useAuthContext"
import toast from "react-hot-toast"
import { ArrowRight, CheckCircle, PlayCircle } from "lucide-react"

export default function Hero() {
  const { authUser } = useAuth()

  return (
    <section className="relative z-10 pt-28 pb-16 px-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-4 py-2 mb-7">
            <span className="text-indigo-700 text-sm font-medium">
              🚀 Launch Week Special
            </span>
            <span className="text-indigo-600 text-xs">7-day free trial</span>
          </div>

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
            GrindFlow is the {" "}
            <span className="font-semibold text-gray-900">
              accountability-first productivity system
            </span>{" "}
            that turns goals into daily wins. Plan your day, track habits, and
            stay consistent with real accountability and clean analytics.
            <span className="block mt-3 text-lg text-indigo-700 font-semibold">
              Join 10,000+ builders & students leveling up their routine.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            {authUser ? (
              <Button
                asChild
                className="bg-indigo-700 hover:bg-indigo-800 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Link href="/app" aria-label="Go to your GrindFlow workspace">
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

                <Button
                  asChild
                  variant="outline"
                  className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 hover:border-gray-400 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Link
                    href="/demo"
                    onClick={() => toast.success("Playing demo…")}
                    aria-label="Watch a short GrindFlow demo"
                  >
                    <PlayCircle size={18} className="mr-2" aria-hidden="true" />
                    Watch Demo
                  </Link>
                </Button>
              </>
            )}
          </div>

          <p className="text-sm text-gray-500">
            No credit card required. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-sm">
          <div className="flex items-center justify-center gap-2 rounded-xl border bg-white/70 backdrop-blur p-3">
            <div className="flex -space-x-1" aria-hidden="true">
              <div className="w-6 h-6 bg-indigo-200 rounded-full border-2 border-white" />
              <div className="w-6 h-6 bg-indigo-300 rounded-full border-2 border-white" />
              <div className="w-6 h-6 bg-indigo-400 rounded-full border-2 border-white" />
            </div>
            <span className="text-gray-600">10,000+ builders & students</span>
          </div>

          <div className="flex items-center justify-center gap-2 rounded-xl border bg-white/70 backdrop-blur p-3">
            <span className="text-yellow-500" aria-hidden="true">
              ⭐⭐⭐⭐⭐
            </span>
            <span className="text-gray-600">4.9/5 rating</span>
          </div>

          <div className="flex items-center justify-center gap-2 rounded-xl border bg-white/70 backdrop-blur p-3">
            <CheckCircle
              size={16}
              className="text-green-600"
              aria-hidden="true"
            />
            <span className="text-gray-600">7-day free trial</span>
          </div>
        </div>
      </div>
    </section>
  )
}



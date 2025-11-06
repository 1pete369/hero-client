"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/useAuthContext"
import { ArrowRight, CheckCircle } from "lucide-react"

export default function Pricing() {
  const { authUser } = useAuth()

  return (
    <div className=" px-10">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Start free. Upgrade for accountability and advanced analytics.
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Free Plan */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-center mb-6">
              <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full mb-3">
                FREE
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Free Plan
              </h3>
              <div className="mb-4">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold text-gray-700">
                    $0
                  </span>
                  <span className="text-lg text-gray-600">/month</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Experience the core flow</p>
            </div>

            <div className="mb-6">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">
                    Unlimited to-dos
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">
                    Up to 3 goals
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">
                    Up to 3 habits linked to goals
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">
                    Timeline view for daily tracking
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">
                    Basic analytics (7-day insights)
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              {authUser ? (
                <Button
                  asChild
                  className="w-full bg-gray-700 hover:bg-gray-800 text-white px-6 py-2.5 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Link href="/workspace" aria-label="Go to workspace">
                    Go to Workspace
                    <ArrowRight size={16} className="ml-2" aria-hidden="true" />
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="w-full bg-gray-700 hover:bg-gray-800 text-white px-6 py-2.5 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Link href="/signup" aria-label="Get started free">
                    Get Started Free
                    <ArrowRight size={16} className="ml-2" aria-hidden="true" />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-white border-2 border-indigo-500 rounded-lg p-6 lg:p-8 shadow-xl relative overflow-hidden transform lg:scale-105">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white px-6 py-2 text-xs font-semibold transform rotate-45 translate-x-8 -translate-y-2">
              POPULAR
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-full -translate-y-16 translate-x-16"></div>

            <div className="relative z-10 text-center mb-6">
              <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full mb-3">
                BEST VALUE
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Pro Plan
              </h3>
              <div className="mb-4">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold text-indigo-700">
                    $19
                  </span>
                  <span className="text-lg text-gray-600">/month</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Accountability & analytics</p>
            </div>

            <div className="mb-6">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm font-medium">
                    Everything in Free
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">
                    Unlimited goals, habits & timelines
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">
                    Advanced analytics & streak tracking
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">
                    Dynamic Duo (Buddy) feature
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">
                    Custom reminders & notifications
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              {authUser ? (
                <Button
                  asChild
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Link href="/workspace" aria-label="Go to workspace">
                    Go to Workspace
                    <ArrowRight size={16} className="ml-2" aria-hidden="true" />
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Link href="/signup" aria-label="Go Pro">
                    Go Pro
                    <ArrowRight size={16} className="ml-2" aria-hidden="true" />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Premium Plan */}
          <div className="bg-white border-2 border-purple-200 rounded-lg p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-center mb-6">
              <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mb-3">
                PREMIUM
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Premium Plan
              </h3>
              <div className="mb-4">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold text-purple-700">
                    $29
                  </span>
                  <span className="text-lg text-gray-600">/month</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">For accountability groups</p>
            </div>

            <div className="mb-6">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm font-medium">
                    Everything in Pro
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">
                    Multiple buddies (up to 3)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">
                    Shared analytics for duo/group
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">
                    Priority feature access + early updates
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">
                    Export data (CSV / PDF)
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              {authUser ? (
                <Button
                  asChild
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Link href="/workspace" aria-label="Go to workspace">
                    Go to Workspace
                    <ArrowRight size={16} className="ml-2" aria-hidden="true" />
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Link href="/signup" aria-label="Unlock Premium">
                    Unlock Premium
                    <ArrowRight size={16} className="ml-2" aria-hidden="true" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="text-sm text-gray-500 space-y-2">
            <p>✓ No credit card required</p>
            <p>✓ Cancel anytime • 30-day money-back guarantee</p>
          </div>
        </div>
      </div>
    </div>
  )
}



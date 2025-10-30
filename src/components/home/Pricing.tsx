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
          Start building your success system today. No hidden fees, no
          surprises.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-center mb-8">
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                GrindFlow Basic
              </h3>
              <div className="mb-6">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl lg:text-5xl font-bold text-gray-700">
                    ₹749
                  </span>
                  <span className="text-lg text-gray-600">/month</span>
                </div>
                <p className="text-gray-500 mt-2">After 7-day free trial</p>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="font-semibold text-gray-900 text-lg mb-4 text-center">
                Core Features
              </h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm font-medium">
                    Goals, habits & todos
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm font-medium">
                    Progress tracking
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm font-medium">
                    Notes & journals
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              {authUser ? (
                <Button
                  asChild
                  className="w-full bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Link
                    href="/workspace"
                    aria-label="Go to your GrindFlow workspace"
                  >
                    Go to Workspace
                    <ArrowRight size={18} className="ml-2" aria-hidden="true" />
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="w-full bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Link href="/signup" aria-label="Start your free trial">
                    Start Free Trial
                    <ArrowRight size={18} className="ml-2" aria-hidden="true" />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="bg-white border-2 border-indigo-200 rounded-lg p-8 lg:p-10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white px-6 py-2 text-sm font-semibold transform rotate-45 translate-x-8 -translate-y-2">
              MOST POPULAR
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-full -translate-y-16 translate-x-16"></div>

            <div className="relative z-10 text-center mb-8">
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                GrindFlow Pro
              </h3>
              <div className="mb-6">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl lg:text-5xl font-bold text-indigo-700">
                    ₹1,599
                  </span>
                  <span className="text-lg text-gray-600">/month</span>
                </div>
                <p className="text-gray-500 mt-2">After 7-day free trial</p>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="font-semibold text-gray-900 text-lg mb-4 text-center">
                Everything in Basic +
              </h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm font-medium">
                    Community challenges
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm font-medium">
                    Progress sharing
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm font-medium">
                    Accountability groups
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm font-medium">
                    Community support
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              {authUser ? (
                <Button
                  asChild
                  className="w-full bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Link
                    href="/workspace"
                    aria-label="Go to your GrindFlow workspace"
                  >
                    Go to Workspace
                    <ArrowRight size={18} className="ml-2" aria-hidden="true" />
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="w-full bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Link href="/signup" aria-label="Start your free trial">
                    Start Free Trial
                    <ArrowRight size={18} className="ml-2" aria-hidden="true" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="text-sm text-gray-500 space-y-2">
            <p>✓ No credit card required for trial</p>
            <p>✓ Cancel anytime • 30-day money-back guarantee</p>
          </div>
        </div>
      </div>
    </div>
  )
}



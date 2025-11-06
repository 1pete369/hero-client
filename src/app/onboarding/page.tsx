"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, Loader2, Sparkles, TrendingUp, Users, Target, Clock, Zap, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"
import { axiosInstance } from "@/lib/axiosInstance"
import { useAuth } from "@/context/useAuthContext"

const TOTAL_STEPS = 8

export default function OnboardingPage() {
  const router = useRouter()
  const { authUser, checkAuth } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    primaryGoal: "",
    biggestChallenge: "",
    workStyle: "",
    focusArea: "",
    firstGoal: "",
    wantsBuddy: false,
    buddyEmail: "",
  })

  // Step 1: Primary Goal
  const primaryGoalOptions = [
    { value: "build_habits", icon: "📚", label: "Build better habits", desc: "Exercise, reading, meditation" },
    { value: "achieve_goals", icon: "🎯", label: "Achieve specific goals", desc: "Learn a skill, side project" },
    { value: "get_organized", icon: "✅", label: "Get more organized", desc: "Manage daily tasks & to-dos" },
    { value: "stay_accountable", icon: "💪", label: "Stay accountable", desc: "Need someone to check on me" },
    { value: "level_up", icon: "🚀", label: "Level up my life", desc: "All of the above!" },
  ]

  // Step 2: Biggest Challenge
  const challengeOptions = [
    { value: "lack_clarity", icon: "🤷", label: "Lack of clarity", desc: "I don't know where to start" },
    { value: "time_management", icon: "⏰", label: "Poor time management", desc: "I always run out of time" },
    { value: "no_motivation", icon: "😴", label: "No motivation", desc: "I start strong but lose steam" },
    { value: "no_accountability", icon: "👻", label: "No accountability", desc: "Nobody's checking on me" },
    { value: "cant_track", icon: "📊", label: "Can't track progress", desc: "I don't know if I'm improving" },
  ]

  // Step 3: Work Style
  const workStyleOptions = [
    { value: "solo", icon: "🏃", label: "Solo grinder", desc: "I work best alone" },
    { value: "team", icon: "👥", label: "Team player", desc: "I thrive with accountability partners" },
    { value: "planner", icon: "📅", label: "Planner", desc: "I like detailed schedules" },
    { value: "flexible", icon: "🎨", label: "Flexible", desc: "I go with the flow" },
    { value: "streak_lover", icon: "🔥", label: "Streak lover", desc: "Gamification motivates me" },
  ]

  // Step 4: Focus Area
  const focusAreaOptions = [
    { value: "career", icon: "💼", label: "Career & Work" },
    { value: "health", icon: "🏋️", label: "Health & Fitness" },
    { value: "learning", icon: "📖", label: "Learning & Skills" },
    { value: "finance", icon: "💰", label: "Finance & Business" },
    { value: "personal", icon: "🧘", label: "Personal Growth" },
    { value: "creative", icon: "🎨", label: "Creative Projects" },
  ]

  const handleSelect = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    // Validation
    if (currentStep === 1 && !formData.primaryGoal) {
      toast.error("Please select an option to continue")
      return
    }
    if (currentStep === 2 && !formData.biggestChallenge) {
      toast.error("Please select an option to continue")
      return
    }
    if (currentStep === 3 && !formData.workStyle) {
      toast.error("Please select an option to continue")
      return
    }
    if (currentStep === 4 && !formData.focusArea) {
      toast.error("Please select a focus area")
      return
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    console.log("🚀 Submit clicked, formData:", formData)
    
    // Validate required fields first
    if (!formData.primaryGoal || !formData.biggestChallenge || !formData.workStyle || !formData.focusArea) {
      console.error("❌ Validation failed")
      toast.error("Please complete all required steps")
      return
    }

    try {
      setIsSubmitting(true)
      console.log("✅ Validation passed, submitting...")

      const payload = {
        primaryGoal: formData.primaryGoal,
        biggestChallenge: formData.biggestChallenge,
        workStyle: formData.workStyle,
        focusArea: formData.focusArea,
        firstGoal: formData.firstGoal || null,
        wantsBuddy: formData.wantsBuddy,
        buddyEmail: formData.buddyEmail || null,
      }

      console.log("📤 Sending payload:", payload)
      const response = await axiosInstance.post("/onboarding/complete", payload)
      console.log("📥 Response:", response.data)
      
      // Refresh auth to get updated onboardingCompleted status
      console.log("🔄 Refreshing auth...")
      await checkAuth()
      
      toast.success("🎉 Welcome to GrindFlow! Let's build something great!")
      console.log("🏠 Redirecting to workspace...")
      router.push("/workspace")
    } catch (error: any) {
      console.error("❌ Onboarding error:", error)
      console.error("Error response:", error.response)
      toast.error(error.response?.data?.message || "Failed to complete onboarding")
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (currentStep / TOTAL_STEPS) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg">
        {/* Progress Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-600">Step {currentStep} of {TOTAL_STEPS}</span>
            <span className="text-xs sm:text-sm font-medium text-indigo-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content Card */}
        <motion.div
          className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 flex flex-col"
          style={{ height: 'calc(100vh - 120px)', maxHeight: '650px', minHeight: '450px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Content Area */}
          <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 overflow-hidden">
            <AnimatePresence mode="wait">
            {/* Step 1: Primary Goal */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full"
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">What brings you here?</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Let's understand your main goal with GrindFlow</p>
                
                <div className="space-y-2 sm:space-y-3 overflow-y-auto scrollbar-hide flex-1">
                  {primaryGoalOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSelect("primaryGoal", option.value)}
                      className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all text-left ${
                        formData.primaryGoal === option.value
                          ? "border-indigo-600 bg-indigo-50 shadow-md"
                          : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <span className="text-2xl sm:text-3xl">{option.icon}</span>
                        <div className="flex-1">
                          <div className="text-sm sm:text-base font-semibold text-gray-900">{option.label}</div>
                          <div className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">{option.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Biggest Challenge */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full"
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">What's your biggest challenge?</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Help us understand what usually stops you</p>
                
                <div className="space-y-2 sm:space-y-3 overflow-y-auto scrollbar-hide flex-1">
                  {challengeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSelect("biggestChallenge", option.value)}
                      className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all text-left ${
                        formData.biggestChallenge === option.value
                          ? "border-indigo-600 bg-indigo-50 shadow-md"
                          : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <span className="text-2xl sm:text-3xl">{option.icon}</span>
                        <div className="flex-1">
                          <div className="text-sm sm:text-base font-semibold text-gray-900">{option.label}</div>
                          <div className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">{option.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Work Style */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full"
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">How do you prefer to work?</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">This helps us tailor your experience</p>
                
                <div className="space-y-2 sm:space-y-3 overflow-y-auto scrollbar-hide flex-1">
                  {workStyleOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSelect("workStyle", option.value)}
                      className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all text-left ${
                        formData.workStyle === option.value
                          ? "border-indigo-600 bg-indigo-50 shadow-md"
                          : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <span className="text-2xl sm:text-3xl">{option.icon}</span>
                        <div className="flex-1">
                          <div className="text-sm sm:text-base font-semibold text-gray-900">{option.label}</div>
                          <div className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">{option.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Focus Area + First Goal */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full"
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">What area do you want to focus on first?</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Let's set up your first goal</p>
                
                <div className="overflow-y-auto scrollbar-hide flex-1">
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                  {focusAreaOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSelect("focusArea", option.value)}
                      className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all text-center ${
                        formData.focusArea === option.value
                          ? "border-indigo-600 bg-indigo-50 shadow-md"
                          : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">{option.icon}</div>
                      <div className="font-semibold text-gray-900 text-xs sm:text-sm">{option.label}</div>
                    </button>
                  ))}
                </div>

                {formData.focusArea && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 sm:mt-6"
                  >
                    <Label htmlFor="firstGoal" className="text-sm sm:text-base font-semibold text-gray-900 mb-2 block">
                      What's one specific goal in this area?
                    </Label>
                    <Input
                      id="firstGoal"
                      placeholder={
                        formData.focusArea === "health"
                          ? "e.g., Run 3 times a week"
                          : formData.focusArea === "finance"
                          ? "e.g., Save $5000 by December"
                          : formData.focusArea === "learning"
                          ? "e.g., Learn Spanish in 6 months"
                          : "e.g., Your specific goal here"
                      }
                      value={formData.firstGoal}
                      onChange={(e) => setFormData({ ...formData, firstGoal: e.target.value })}
                      className="border-2 border-gray-300 focus:border-indigo-600 focus-visible:ring-0 text-sm sm:text-base"
                    />
                    <p className="text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2">Optional, but helps us get you started!</p>
                  </motion.div>
                )}
                </div>
              </motion.div>
            )}

            {/* Step 5: Success Stats */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full"
              >
                <div className="text-center mb-4 sm:mb-6 flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-3 sm:mb-4">
                    <span className="text-2xl sm:text-3xl">📈</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">You're not alone in this journey 💪</h2>
                  <p className="text-sm sm:text-base text-gray-600">Join a community that's winning every day ✨</p>
                </div>

                <div className="overflow-y-auto scrollbar-hide flex-1">
                  <div className="space-y-3 sm:space-y-4">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 sm:p-4 rounded-xl border border-indigo-200">
                        <div className="text-xl sm:text-2xl mb-1">👥</div>
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-600 mb-1">10K+</div>
                        <div className="text-xs sm:text-sm text-indigo-900 font-medium">Active Grinders</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-4 rounded-xl border border-purple-200">
                        <div className="text-xl sm:text-2xl mb-1">🎯</div>
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 mb-1">50K+</div>
                        <div className="text-xs sm:text-sm text-purple-900 font-medium">Dreams Achieved</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 rounded-xl border border-green-200">
                        <div className="text-xl sm:text-2xl mb-1">🔥</div>
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 mb-1">87%</div>
                        <div className="text-xs sm:text-sm text-green-900 font-medium">Success Rate</div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 sm:p-4 rounded-xl border border-orange-200">
                        <div className="text-xl sm:text-2xl mb-1">⚡</div>
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-600 mb-1">2.5x</div>
                        <div className="text-xs sm:text-sm text-orange-900 font-medium">More Productive</div>
                      </div>
                    </div>

                    {/* Impact Stats */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 sm:p-6 rounded-xl text-white">
                      <div className="text-center mb-3 sm:mb-4">
                        <div className="text-sm sm:text-base font-semibold mb-1">What happens in 30 days? 🚀</div>
                        <div className="text-xs sm:text-sm opacity-90">Real averages from our community</div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 sm:gap-4">
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl font-bold mb-1">82%</div>
                          <div className="text-[10px] sm:text-xs opacity-90">Goals Hit 🎯</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl font-bold mb-1">76%</div>
                          <div className="text-[10px] sm:text-xs opacity-90">Stay Consistent 🔥</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl font-bold mb-1">91%</div>
                          <div className="text-[10px] sm:text-xs opacity-90">Daily Active 💪</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 6: Comparison - With vs Without */}
            {currentStep === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full"
              >
                <div className="text-center mb-4 sm:mb-6 flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-3 sm:mb-4">
                    <span className="text-2xl sm:text-3xl">⚡</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">The GrindFlow Difference 💯</h2>
                  <p className="text-sm sm:text-base text-gray-600">See the transformation in just 30 days 🎯</p>
                </div>

                <div className="overflow-y-auto scrollbar-hide flex-1">
                  <div className="space-y-3">
                    {/* Comparison Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Without GrindFlow */}
                      <div className="text-center">
                        <div className="text-xs sm:text-sm font-semibold text-red-600 mb-2">😔 Without GrindFlow</div>
                        <div className="space-y-2">
                          <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3">
                            <div className="text-base sm:text-xl mb-0.5">😞</div>
                            <div className="text-lg sm:text-2xl font-bold text-red-600">12%</div>
                            <div className="text-[10px] sm:text-xs text-red-800">Goals Completed</div>
                          </div>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3">
                            <div className="text-base sm:text-xl mb-0.5">😓</div>
                            <div className="text-lg sm:text-2xl font-bold text-red-600">3/10</div>
                            <div className="text-[10px] sm:text-xs text-red-800">Productivity</div>
                          </div>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3">
                            <div className="text-base sm:text-xl mb-0.5">😴</div>
                            <div className="text-lg sm:text-2xl font-bold text-red-600">Low</div>
                            <div className="text-[10px] sm:text-xs text-red-800">Motivation</div>
                          </div>
                        </div>
                      </div>

                      {/* With GrindFlow */}
                      <div className="text-center">
                        <div className="text-xs sm:text-sm font-semibold text-green-600 mb-2">😍 With GrindFlow</div>
                        <div className="space-y-2">
                          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500 rounded-lg p-2 sm:p-3 shadow-md">
                            <div className="text-base sm:text-xl mb-0.5">🎉</div>
                            <div className="text-lg sm:text-2xl font-bold text-green-600">87%</div>
                            <div className="text-[10px] sm:text-xs text-green-800 font-medium">Goals Completed</div>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500 rounded-lg p-2 sm:p-3 shadow-md">
                            <div className="text-base sm:text-xl mb-0.5">🚀</div>
                            <div className="text-lg sm:text-2xl font-bold text-green-600">9/10</div>
                            <div className="text-[10px] sm:text-xs text-green-800 font-medium">Productivity</div>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500 rounded-lg p-2 sm:p-3 shadow-md">
                            <div className="text-base sm:text-xl mb-0.5">💪</div>
                            <div className="text-lg sm:text-2xl font-bold text-green-600">High</div>
                            <div className="text-[10px] sm:text-xs text-green-800 font-medium">Motivation</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Key Benefits */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4 sm:p-5">
                      <div className="text-sm sm:text-base font-bold text-indigo-900 mb-3">Why Users Love GrindFlow 💜:</div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-base">🎯</span>
                          <div className="text-xs sm:text-sm text-gray-700">
                            <span className="font-semibold">7x more likely</span> to crush your goals
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-base">⏰</span>
                          <div className="text-xs sm:text-sm text-gray-700">
                            Save <span className="font-semibold">8+ hours/week</span> with smart scheduling
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-base">🏆</span>
                          <div className="text-xs sm:text-sm text-gray-700">
                            <span className="font-semibold">92% stay motivated</span> after 90 days
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 7: Social Proof */}
            {currentStep === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full"
              >
                <div className="text-center mb-4 sm:mb-6 flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full mb-3 sm:mb-4">
                    <span className="text-2xl sm:text-3xl">❤️</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">Real People, Real Wins 🎉</h2>
                  <p className="text-sm sm:text-base text-gray-600">Their success stories could be yours 💫</p>
                </div>

                <div className="overflow-y-auto scrollbar-hide flex-1">
                  <div className="space-y-3">
                    {/* Testimonials */}
                    <div className="bg-white border-2 border-indigo-200 rounded-xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                          SK
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm sm:text-base">Sarah Kim</div>
                          <div className="text-[10px] sm:text-xs text-gray-500">Software Engineer</div>
                        </div>
                      </div>
                      <div className="text-yellow-500 mb-2">⭐⭐⭐⭐⭐</div>
                      <p className="text-xs sm:text-sm text-gray-700 italic">
                        "I was stuck for years 😞 Now I've completed <span className="font-bold text-indigo-600">12 goals in 6 months</span>! The timeline feature changed my life 🙌"
                      </p>
                    </div>

                    <div className="bg-white border-2 border-purple-200 rounded-xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                          MC
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm sm:text-base">Mike Chen</div>
                          <div className="text-[10px] sm:text-xs text-gray-500">Entrepreneur</div>
                        </div>
                      </div>
                      <div className="text-yellow-500 mb-2">⭐⭐⭐⭐⭐</div>
                      <p className="text-xs sm:text-sm text-gray-700 italic">
                        "Never thought I'd stick to anything 😅 Built a <span className="font-bold text-purple-600">90-day streak</span> and finally launched my dream project! 🔥"
                      </p>
                    </div>

                    <div className="bg-white border-2 border-green-200 rounded-xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                          AP
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm sm:text-base">Aisha Patel</div>
                          <div className="text-[10px] sm:text-xs text-gray-500">Fitness Coach</div>
                        </div>
                      </div>
                      <div className="text-yellow-500 mb-2">⭐⭐⭐⭐⭐</div>
                      <p className="text-xs sm:text-sm text-gray-700 italic">
                        "I tried everything but always gave up 😢 Now I've <span className="font-bold text-green-600">lost 15 lbs</span> and feel unstoppable! This actually works 💪✨"
                      </p>
                    </div>

                    {/* Final CTA */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 sm:p-5 text-center text-white">
                      <div className="text-base sm:text-lg font-bold mb-1 sm:mb-2">You're one step away from joining them! 🚀</div>
                      <div className="text-xs sm:text-sm opacity-90">Let's find you an accountability buddy</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 8: Accountability Buddy */}
            {currentStep === 8 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full"
              >
                <div className="text-center mb-4 sm:mb-6 flex-shrink-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full mb-3 sm:mb-4">
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">Find your accountability buddy?</h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Stay on track together!</p>
                  <div className="inline-block bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 sm:px-4 mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm text-purple-900 font-medium">
                      📊 65% more likely to achieve goals with a partner!
                    </p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 overflow-y-auto scrollbar-hide flex-1">
                  <button
                    onClick={() => setFormData({ ...formData, wantsBuddy: true })}
                    className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${
                      formData.wantsBuddy
                        ? "border-indigo-600 bg-indigo-50 shadow-md"
                        : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-indigo-600 flex items-center justify-center shrink-0">
                        {formData.wantsBuddy && <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-indigo-600" />}
                      </div>
                      <span className="text-sm sm:text-base font-semibold text-gray-900">Yes, invite a buddy now</span>
                    </div>
                    
                    {formData.wantsBuddy && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Input
                          type="email"
                          placeholder="buddy@email.com"
                          value={formData.buddyEmail}
                          onChange={(e) => setFormData({ ...formData, buddyEmail: e.target.value })}
                          className="border-2 border-gray-300 focus:border-indigo-600 focus-visible:ring-0 text-sm sm:text-base"
                        />
                      </motion.div>
                    )}
                  </button>

                  <button
                    onClick={() => setFormData({ ...formData, wantsBuddy: false })}
                    className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${
                      !formData.wantsBuddy
                        ? "border-indigo-600 bg-indigo-50 shadow-md"
                        : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-indigo-600 flex items-center justify-center shrink-0">
                        {!formData.wantsBuddy && <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-indigo-600" />}
                      </div>
                      <span className="text-sm sm:text-base font-semibold text-gray-900">Skip for now (can do later)</span>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>

          {/* Navigation Buttons - Fixed at bottom */}
          <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-t border-gray-200 bg-white rounded-b-xl sm:rounded-b-2xl">
            <Button
              onClick={handleBack}
              variant="ghost"
              disabled={currentStep === 1}
              className="gap-1 sm:gap-2 text-sm sm:text-base px-2 sm:px-4"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              Back
            </Button>

            {currentStep < TOTAL_STEPS ? (
              <Button
                onClick={handleNext}
                className="bg-indigo-600 hover:bg-indigo-700 gap-1 sm:gap-2 text-sm sm:text-base px-3 sm:px-4"
              >
                Continue
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-1 sm:gap-2 text-sm sm:text-base px-3 sm:px-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    <span className="hidden sm:inline">Completing...</span>
                    <span className="sm:hidden">Done</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Complete Setup</span>
                    <span className="sm:hidden">Complete</span>
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}


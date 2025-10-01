"use client"

import { useAuth } from "@/context/useAuthContext"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ChangeEvent, FormEvent, useState } from "react"
import toast from "react-hot-toast"

export default function SignUpPage() {
  const { authUser, isSigningUp, signup } = useAuth()

  if (authUser) {
    redirect("/")
  }

  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const handleName = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setName(name)
  }

  const handleUsername = (e: ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value.trim()
    setUsername(username)
  }

  const handleEmail = (e: ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value.trim()
    setEmail(email)
  }

  const handlePassword = (e: ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value.trim()
    setPassword(password)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password || !name || !username) {
      toast.error("Please fill in all required fields!")
      return
    }
    
    try {
      await signup({ fullName: name.trim(), username: username.trim(), email, password })
      toast.success("Account created successfully! Welcome to GrindFlowClub!")
    } catch (error: any) {
      console.error("Signup error:", error)
      
      // Handle specific API error messages
      if (error.response?.data?.message) {
        const message = error.response.data.message
        if (message.includes("Email already in use")) {
          toast.error("This email is already registered. Please use a different email or try logging in.")
        } else if (message.includes("Username already taken")) {
          toast.error("This username is already taken. Please choose a different username.")
        } else if (message.includes("Password must be at least 6 characters")) {
          toast.error("Password must be at least 6 characters long.")
        } else if (message.includes("All fields are required")) {
          toast.error("Please fill in all required fields.")
        } else {
          toast.error(message)
        }
      } else if (error.message === "Network Error") {
        toast.error("Network error. Please check your connection and try again.")
      } else {
        toast.error("Failed to create account. Please try again.")
      }
    }
  }

  return (
    <div className="min-h-screen pt-20 lg:pt-0 grid lg:grid-cols-2 items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-indigo-300 transform rotate-45"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-indigo-200 transform -rotate-12"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-indigo-100 transform rotate-90"></div>
      </div>

      <div className="relative z-10 flex justify-center items-center w-full px-4 lg:px-0 py-2 lg:py-0">
        <form className="w-full max-w-sm sm:max-w-md lg:max-w-md flex flex-col items-center gap-2 lg:gap-2 border-2 border-gray-800 px-5 sm:px-8 lg:px-10 py-8 lg:py-14 bg-white shadow-2xl relative">
          <div className="text-center mb-4 lg:mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2 lg:mb-3 text-gray-900">
              Create account
            </h1>
            <p className="text-gray-600 text-sm lg:text-base">
              Start your decisive daily flow
            </p>
          </div>

          <div className="w-full">
            <label
              htmlFor="name"
              className="block text-sm lg:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2"
            >
              Full Name
            </label>
            <input
              required
              type="text"
              id="name"
              className="w-full border-2 border-gray-300 focus:border-indigo-600 outline-none px-4 py-3 lg:py-3 placeholder:text-gray-400 bg-white text-gray-900 transition-all duration-200 hover:border-gray-400 text-base"
              placeholder="Enter your full name"
              autoComplete="off"
              value={name}
              onChange={handleName}
            />
          </div>

          <div className="w-full">
            <label
              htmlFor="username"
              className="block text-sm lg:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2"
            >
              Username
            </label>
            <input
              required
              type="text"
              id="username"
              className="w-full border-2 border-gray-300 focus:border-indigo-600 outline-none px-4 py-3 lg:py-3 placeholder:text-gray-400 bg-white text-gray-900 transition-all duration-200 hover:border-gray-400 text-base"
              placeholder="Choose a username"
              autoComplete="off"
              value={username}
              onChange={handleUsername}
            />
          </div>

          <div className="w-full">
            <label
              htmlFor="email"
              className="block text-sm lg:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2"
            >
              Email
            </label>
            <input
              required
              type="email"
              id="email"
              className="w-full border-2 border-gray-300 focus:border-indigo-600 outline-none px-4 py-3 lg:py-3 placeholder:text-gray-400 bg-white text-gray-900 transition-all duration-200 hover:border-gray-400 text-base"
              placeholder="Enter your email"
              autoComplete="off"
              value={email}
              onChange={handleEmail}
            />
          </div>

          <div className="w-full">
            <label
              htmlFor="password"
              className="block text-sm lg:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2"
            >
              Password
            </label>
            <input
              required
              type="password"
              id="password"
              className="w-full border-2 border-gray-300 focus:border-indigo-600 outline-none px-4 py-3 lg:py-3 placeholder:text-gray-400 bg-white text-gray-900 transition-all duration-200 hover:border-gray-400 text-base"
              placeholder="Create a password"
              autoComplete="off"
              value={password}
              onChange={handlePassword}
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 lg:px-8 py-3 lg:py-3 bg-indigo-700 text-white hover:bg-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-600 focus:ring-offset-2 transition-all duration-200 flex justify-center items-center gap-2 font-semibold text-base lg:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-indigo-500 disabled:transform-none disabled:shadow-none"
            onClick={handleSubmit}
            disabled={isSigningUp}
          >
            {isSigningUp ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              "Get started free"
            )}
          </button>


          <div className="text-center text-gray-600 pt-4 lg:pt-4 border-t border-gray-200 w-full">
            <span className="text-gray-500 text-sm lg:text-sm">
              Already have an account?{" "}
            </span>
            <Link
              href="/login"
              className="text-indigo-600 hover:text-indigo-700 font-semibold underline hover:no-underline transition-all duration-200 text-sm lg:text-sm"
            >
              Sign in here
            </Link>
          </div>
        </form>
      </div>

      <div className="hidden lg:flex flex-col items-center justify-center gap-6 px-10 relative z-10">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-2xl">
          <span className="text-white font-bold text-3xl">GF</span>
        </div>

        <div className="text-center max-w-lg">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Start building today
          </h2>
          <p className="text-gray-600 text-lg mb-6 leading-relaxed">
            Create your first goal, link habits to it, and start building the
            system that will compound your success over time.
          </p>
        </div>

        <div className="space-y-4 text-left w-full max-w-md">
          <div className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 shadow-sm">
            <div className="w-2.5 h-2.5 bg-indigo-600 flex-shrink-0"></div>
            <span className="text-gray-800 font-medium text-sm">
              1% better every day
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 shadow-sm">
            <div className="w-2.5 h-2.5 bg-indigo-600 flex-shrink-0"></div>
            <span className="text-gray-800 font-medium text-sm">
              Habit-goal linking
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 shadow-sm">
            <div className="w-2.5 h-2.5 bg-indigo-600 flex-shrink-0"></div>
            <span className="text-gray-800 font-medium text-sm">
              Progress compounds
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-2 border-indigo-300 px-6 py-4 text-center shadow-lg">
          <p className="text-indigo-800 font-semibold text-base italic">
            &quot;Tiny changes, remarkable results&quot;
          </p>
        </div>

        <div className="text-center pt-4">
          <p className="text-gray-500 text-xs mb-2">
            Join 10,000+ builders & students
          </p>
          <div className="flex items-center justify-center gap-3 text-gray-400">
            <span className="text-xs">🚀 7-day free trial</span>
            <span className="text-xs">•</span>
            <span className="text-xs">Then $9/mo</span>
            <span className="text-xs">•</span>
            <span className="text-xs">Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  )
}



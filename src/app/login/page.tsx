"use client"
import { useAuth } from "@/context/useAuthContext"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ChangeEvent, FormEvent, useState } from "react"
import toast from "react-hot-toast"

export default function LoginPage() {
  const { authUser, login, isLoggingIn } = useAuth()

  if (authUser) {
    redirect("/")
  }

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleEmail = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const email = e.target.value
    setEmail(email)
  }

  const handlePassword = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const password = e.target.value.trim()
    setPassword(password)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (email === "" || password === "") {
      toast.error("Please fill in all required fields!")
      return
    }
    
    try {
      await login({ email, password })
      toast.success("Welcome back to GrindFlowClub!")
    } catch (error: any) {
      console.error("Login error:", error)
      
      // Handle specific API error messages
      if (error.response?.data?.message) {
        const message = error.response.data.message
        if (message.includes("Invalid email or password")) {
          toast.error("Invalid email or password. Please check your credentials and try again.")
        } else if (message.includes("User not found")) {
          toast.error("No account found with this email. Please check your email or create a new account.")
        } else if (message.includes("Invalid credentials")) {
          toast.error("Invalid email or password. Please check your credentials and try again.")
        } else {
          toast.error(message)
        }
      } else if (error.message === "Network Error") {
        toast.error("Network error. Please check your connection and try again.")
      } else {
        toast.error("Failed to sign in. Please try again.")
      }
    }
  }

  return (
    <div className="min-h-screen pt-20 lg:pt-0 grid grid-cols-1 lg:grid-cols-2 items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100 text-black px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-indigo-300 transform rotate-45"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-indigo-200 transform -rotate-12"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-indigo-100 transform rotate-90"></div>
      </div>

      <div className="relative z-10 flex justify-center items-center w-full py-4 lg:py-0">
        <form className="w-full max-w-sm sm:max-w-md lg:max-w-md flex flex-col items-center gap-4 lg:gap-4 border-2 border-gray-800 px-5 sm:px-8 lg:px-12 py-8 lg:py-16 bg-white shadow-2xl relative">
          <div className="text-center mb-4 lg:mb-6">
            <h1 className="text-2xl lg:text-4xl font-bold mb-2 lg:mb-3 text-gray-900">
              Welcome back
            </h1>
            <p className="text-gray-600 text-sm lg:text-lg">
              Sign in to continue your flow
            </p>
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
              className="w-full border-2 border-gray-300 focus:border-indigo-600 outline-none px-4 py-3 lg:py-3 placeholder:text-gray-400 bg-white text-black transition-all duration-200 hover:border-gray-400 text-base"
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
              className="w-full border-2 border-gray-300 focus:border-indigo-600 outline-none px-4 py-3 lg:py-3 placeholder:text-gray-400 bg-white text-black transition-all duration-200 hover:border-gray-400 text-base"
              placeholder="Enter your password"
              autoComplete="off"
              value={password}
              onChange={handlePassword}
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 lg:px-8 py-3 lg:py-3 bg-indigo-700 text-white hover:bg-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-600 focus:ring-offset-2 transition-all duration-200 flex justify-center items-center gap-2 font-semibold text-base lg:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-indigo-500 disabled:transform-none disabled:shadow-none"
            onClick={handleSubmit}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              "Sign in to GrindFlow"
            )}
          </button>


          <div className="text-center text-gray-600 pt-4 lg:pt-4 border-t border-gray-200 w-full">
            <span className="text-gray-500 text-sm lg:text-sm">
              Don&apos;t have an account?{" "}
            </span>
            <Link
              href={"/signup"}
              className="text-indigo-600 hover:text-indigo-700 font-semibold underline hover:no-underline transition-all duration-200 text-sm lg:text-sm"
            >
              Create one now
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
            Build your system
          </h2>
          <p className="text-gray-600 text-lg mb-6 leading-relaxed">
            GrindFlow links habits to goals, tracks daily progress, and builds
            systems that compound over time.
          </p>
        </div>

        <div className="space-y-4 text-left w-full max-w-md">
          <div className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 shadow-sm">
            <div className="w-2.5 h-2.5 bg-indigo-600 flex-shrink-0"></div>
            <span className="text-gray-800 font-medium text-sm">
              Goals → Habits → Todos
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 shadow-sm">
            <div className="w-2.5 h-2.5 bg-indigo-600 flex-shrink-0"></div>
            <span className="text-gray-800 font-medium text-sm">
              Atomic habit tracking
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 shadow-sm">
            <div className="w-2.5 h-2.5 bg-indigo-600 flex-shrink-0"></div>
            <span className="text-gray-800 font-medium text-sm">
              System over goals
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-2 border-indigo-300 px-6 py-4 text-center shadow-lg">
          <p className="text-indigo-800 font-semibold text-base italic">
            &quot;You don&apos;t rise to the level of your goals, you fall to
            the level of your systems&quot;
          </p>
        </div>

        <div className="text-center pt-4">
          <p className="text-gray-500 text-xs mb-2">Trusted by builders & students</p>
          <div className="flex items-center justify-center gap-3 text-gray-400">
            <span className="text-xs">⭐ 4.9/5</span>
            <span className="text-xs">•</span>
            <span className="text-xs">10,000+ users</span>
            <span className="text-xs">•</span>
            <span className="text-xs">7-day trial</span>
          </div>
        </div>
      </div>
    </div>
  )
}



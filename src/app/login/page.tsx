"use client"
import { useAuth } from "@/context/useAuthContext"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ChangeEvent, FormEvent, useState } from "react"
import toast from "react-hot-toast"
import GoogleSignInButton from "@/components/GoogleSignInButton"

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
      // Handle error quietly (toast below); avoid console.error to prevent dev overlay
      
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100 text-black px-4">
      <div className="relative z-10 flex justify-center items-center w-full py-10">
        <form className="w-full max-w-sm sm:max-w-md lg:max-w-md flex flex-col items-center gap-4 border-2 border-gray-800 px-6 sm:px-8 lg:px-10 py-10 bg-white shadow-2xl">
          <div className="text-center mb-2">
            <h1 className="text-2xl lg:text-3xl font-bold mb-1 text-gray-900">
              Welcome back
            </h1>
            <p className="text-gray-600 text-sm lg:text-base">
              Sign in to continue your flow
            </p>
          </div>

          <div className="w-full">
            <input
              required
              type="email"
              id="email"
              aria-label="Email"
              className="w-full border-2 border-gray-300 focus:border-indigo-600 outline-none px-4 py-3 placeholder:text-gray-400 bg-white text-black transition-all duration-200 hover:border-gray-400 text-base"
              placeholder="Email"
              autoComplete="off"
              value={email}
              onChange={handleEmail}
            />
          </div>

          <div className="w-full">
            <input
              required
              type="password"
              id="password"
              aria-label="Password"
              className="w-full border-2 border-gray-300 focus:border-indigo-600 outline-none px-4 py-3 placeholder:text-gray-400 bg-white text-black transition-all duration-200 hover:border-gray-400 text-base"
              placeholder="Password"
              autoComplete="off"
              value={password}
              onChange={handlePassword}
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-indigo-700 text-white hover:bg-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-600 focus:ring-offset-2 transition-all duration-200 flex justify-center items-center gap-2 font-semibold text-base shadow-lg hover:shadow-xl disabled:bg-indigo-500"
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

          <div className="w-full flex items-center gap-2 py-2">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-gray-400 text-xs">or</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <GoogleSignInButton onSuccessRedirect="/workspace" />

          <div className="text-center text-gray-600 w-full">
            <span className="text-gray-500 text-sm">
            Don&apos;t have an account?{" "}
            </span>
            <Link
              href={"/signup"}
              className="text-indigo-600 hover:text-indigo-700 font-semibold underline hover:no-underline transition-all duration-200 text-sm"
            >
              Create one now
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}



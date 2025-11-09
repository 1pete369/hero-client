"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/context/useAuthContext"
import { LogOut, User, UserCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  isMobileMenuOpen: boolean
  onCloseMobileMenu?: () => void
}

export default function Sidebar({
  activeSection,
  onSectionChange,
  isMobileMenuOpen,
  onCloseMobileMenu,
}: SidebarProps) {
  const { authUser, logout } = useAuth()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }
  const menuItems = [
    { id: "todos", title: "Todos", icon: "📝", description: "Manage your daily tasks and priorities" },
    { id: "goals", title: "Goals", icon: "🎯", description: "Set and track your long-term objectives" },
    { id: "habits", title: "Habits", icon: "🔄", description: "Build and maintain positive routines" },
    // { id: "finance", title: "Finance", icon: "💰", description: "Track income, expenses, and financial goals" },
    // { id: "notes", title: "Notes", icon: "📒", description: "Capture ideas and information" },
  ]

  return (
    <>
      <aside
        className={`
          fixed lg:static top-0 left-0 z-30
          w-64 h-screen lg:h-full bg-white border-r-3 border-black  
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col relative
          ${!isMobileMenuOpen ? "pointer-events-none lg:pointer-events-auto" : "pointer-events-auto"}
        `}
      >
        <div className="p-4 border-b-3 border-black ">
          <div className="flex items-center justify-between">
            <Link href={"/"}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg  flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">GF</span>
              </div>
              <span className="text-lg font-bold text-gray-900">GrindFlowClub</span>
            </div>
            </Link>
            {onCloseMobileMenu && (
              
              <button
                onClick={onCloseMobileMenu}
                className="lg:hidden p-1 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm transition-all duration-150 ${
                  activeSection === item.id
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 bg-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-white"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="font-medium">{item.title}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <div className="relative" ref={userMenuRef}>
            <Button
              variant="ghost"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center justify-start gap-3 px-3 py-2 text-left rounded border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm transition-all duration-150 text-gray-700 bg-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-white"
            >
              <div className="">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={authUser?.profilePic || ""} alt={authUser?.fullName || "User"} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                    {(authUser?.fullName?.[0] || authUser?.username?.[0] || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="text-sm font-medium text-gray-700 truncate">
                {authUser?.username || authUser?.email?.split("@")[0] || "User"}
              </span>
            </Button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded border-3 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] py-2 z-50">
                <button 
                  onClick={() => { router.push("/dashboard"); setShowUserMenu(false) }} 
                  className="w-full text-left px-4 py-2 border-b border-gray-200 hover:bg-indigo-50"
                >
                  <p className="text-sm font-medium text-gray-900">{authUser?.email || "user@example.com"}</p>
                  <p className="text-xs text-gray-500">Free Trial</p>
                </button>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 flex items-center space-x-2">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}



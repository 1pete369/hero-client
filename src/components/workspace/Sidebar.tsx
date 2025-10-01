"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/context/useAuthContext"
import { Bell, Settings, LogOut, User, UserCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

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
    { id: "calendar", title: "Calendar", icon: "📅", description: "View your tasks on a calendar" },
    { id: "goals", title: "Goals", icon: "🎯", description: "Set and track your long-term objectives" },
    { id: "habits", title: "Habits", icon: "🔄", description: "Build and maintain positive routines" },
    { id: "finance", title: "Finance", icon: "💰", description: "Track income, expenses, and financial goals" },
    { id: "notes", title: "Notes", icon: "📔", description: "Capture ideas and important information" },
  ]

  return (
    <>
      <aside
        className={`
          fixed lg:static top-0 left-0 z-30
          w-64 bg-white border-r border-gray-200 
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          flex flex-col h-full
        `}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">GF</span>
              </div>
              <span className="text-lg font-bold text-gray-900">GrindFlow</span>
            </div>
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
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors text-sm ${
                  activeSection === item.id
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="font-medium">{item.title}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start p-2 hover:bg-gray-100">
            <Bell className="h-4 w-4 text-gray-600 mr-3" />
            <span className="text-sm text-gray-700">Notifications</span>
            <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
          </Button>

          <Button variant="ghost" size="sm" className="w-full justify-start p-2 hover:bg-gray-100">
            <Settings className="h-4 w-4 text-gray-600 mr-3" />
            <span className="text-sm text-gray-700">Settings</span>
          </Button>

          <div className="relative" ref={userMenuRef}>
            <Button
              variant="ghost"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full justify-start p-2 hover:bg-gray-100"
            >
              <div className="mr-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={authUser?.profilePic || ""} alt={authUser?.fullName || "User"} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                    {(authUser?.fullName?.[0] || authUser?.username?.[0] || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="text-sm text-gray-700 font-medium truncate">
                {authUser?.username || authUser?.email?.split("@")[0] || "User"}
              </span>
            </Button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button 
                  onClick={() => { router.push("/profile"); setShowUserMenu(false) }} 
                  className="w-full text-left px-4 py-2 border-b border-gray-100 hover:bg-gray-50"
                >
                  <p className="text-sm font-medium text-gray-900">{authUser?.email || "user@example.com"}</p>
                  <p className="text-xs text-gray-500">Free Trial</p>
                </button>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
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



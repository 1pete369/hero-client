"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/context/useAuthContext"
import { redirect, useRouter } from "next/navigation"
import { Menu, List, Clock, CheckCircle, Calendar, ChevronDown, History, Tag, SlidersHorizontal, Briefcase, Heart, BookOpen, ShoppingCart, Wallet, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Sidebar from "@/components/workspace/Sidebar"

import TodosSection from "@/components/workspace/TodosSection"
import type { Todo } from "@/services"
import CalendarSection from "@/components/workspace/CalendarSection"
import GoalsSection from "@/components/workspace/GoalsSection"
import HabitsSection from "@/components/workspace/HabitsSection"
import NotesSection from "@/components/workspace/NotesSection"
import JournalsSection from "@/components/workspace/JournalsSection"
import FinanceSection from "@/components/workspace/FinanceSection"
import TimelineView from "@/components/workspace/TimelineView"

type FilterKey = "all" | "pending" | "completed" | "upcoming" | "past"

export default function WorkspacePage() {
  const { authUser, isCheckingAuth } = useAuth()
  // We'll parse query params client-side to avoid Suspense requirement
  const router = useRouter()

  const [activeSection, setActiveSection] = useState("todos")
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showTodoForm, setShowTodoForm] = useState(false)
  const [showFinanceForm, setShowFinanceForm] = useState(false)
  const [showGoalsForm, setShowGoalsForm] = useState(false)
  const [showHabitsForm, setShowHabitsForm] = useState(false)
  const [showTimelineModal, setShowTimelineModal] = useState(false)
  const [filter, setFilter] = useState<FilterKey>("all")
  const [priorityFilter, setPriorityFilter] = useState<"all" | "high" | "medium" | "low">("all")
  const [categoryFilter, setCategoryFilter] = useState<
    | "all"
    | "personal"
    | "work"
    | "learning"
    | "health"
    | "shopping"
    | "finance"
  >("all")
  const [todoCounts, setTodoCounts] = useState({
    all: 0,
    pending: 0,
    completed: 0,
    upcoming: 0,
    past: 0,
  })
  const [todos, setTodos] = useState<Todo[]>([])
  const getLocalISODate = () => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  }
  const [selectedDate] = useState(getLocalISODate())

  useEffect(() => {
    if (typeof window === "undefined") return
    const urlSection = new URLSearchParams(window.location.search).get("section")
    if (
      urlSection &&
      ["todos", "calendar", "goals", "habits", "notes", "journals", "finance"].includes(urlSection)
    ) {
      setActiveSection(urlSection)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(`/workspace?section=${activeSection}`, { scroll: false })
    }, 100)
    return () => clearTimeout(timer)
  }, [activeSection, router])

  const handleSectionChange = (section: string) => setActiveSection(section)

  useEffect(() => {
    if (isCheckingAuth) return
    if (!authUser) {
      redirect("/login")
      return
    }
    setIsLoading(false)
  }, [authUser, isCheckingAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "todos":
        return (
          <div className="h-full min-h-0 overflow-hidden">
            <div className="grid lg:grid-cols-3 gap-6 h-full min-h-0 overflow-hidden">
              <div className="lg:col-span-2 h-full overflow-hidden">
                <TodosSection
                  showTodoForm={showTodoForm}
                  setShowTodoForm={setShowTodoForm}
                  filter={filter}
                  priorityFilter={priorityFilter}
                  categoryFilter={categoryFilter}
                  onCountsUpdate={setTodoCounts}
                  onTodosUpdate={setTodos}
                  onShowTimeline={() => setShowTimelineModal(true)}
                />
              </div>
              <div className="hidden lg:block lg:col-span-1 h-full overflow-hidden">
                <TimelineView
                  todos={todos}
                  selectedDate={selectedDate}
                  onEditTodo={(todo) => {
                    console.log('Edit todo:', todo)
                  }}
                  onDeleteTodo={(todoId) => {
                    console.log('Delete todo:', todoId)
                  }}
                  onToggleStatus={(todoId, isCompleted) => {
                    console.log('Toggle todo:', todoId, isCompleted)
                  }}
                />
              </div>
            </div>

            {showTimelineModal && (
              <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300 ease-out">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTimelineModal(false)}
                      className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <TimelineView
                      todos={todos}
                      selectedDate={selectedDate}
                      onEditTodo={(todo) => {
                        console.log('Edit todo:', todo)
                        setShowTimelineModal(false)
                      }}
                      showHeader={false}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      case "calendar":
        return <CalendarSection />
      case "goals":
        return <GoalsSection showAddForm={showGoalsForm} setShowAddForm={setShowGoalsForm} />
      case "habits":
        return <HabitsSection showAddForm={showHabitsForm} setShowAddForm={setShowHabitsForm} />
      case "notes":
        return <NotesSection />
      case "journals":
        return <JournalsSection />
      case "finance":
        return (
          <FinanceSection
            showFinanceForm={showFinanceForm}
            setShowFinanceForm={setShowFinanceForm}
          />
        )
      default:
        return null
    }
  }

  const greeting =
    new Date().getHours() < 12
      ? "Morning"
      : new Date().getHours() < 18
      ? "Afternoon"
      : "Evening"

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <div className="flex flex-1 min-h-0">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        <main className="flex-1 p-3 sm:p-4 lg:p-4 h-full overflow-hidden">
          <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
            <div className="mb-4 pr-2 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between w-full flex-shrink-0">
              <div className="flex items-center justify-between gap-2 lg:w-auto w-full min-w-0">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-gray-900 mb-1 truncate">
                    Good {greeting}!
                  </h1>
                  <p className="text-gray-600 text-xs truncate">
                    Manage your daily tasks and priorities
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden p-2 hover:bg-gray-100 shrink-0"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <Menu className="h-5 w-5 text-gray-600" />
                </Button>
              </div>

              <div className="flex items-start justify-between  sm:items-center gap-2 lg:gap-4 w-full lg:w-auto lg:justify-end">
                 {/* Filter Dropdown */}
                 {activeSection === "todos" && (
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <Button
                         variant="outline"
                         className="flex items-center gap-2 text-sm font-medium min-w-fit"
                       >
                         {(() => {
                           const filterOptions = {
                             all: { icon: List, label: "All", count: todoCounts.all, color: "text-blue-600", bgColor: "bg-blue-50", countBg: "bg-blue-100 text-blue-700" },
                             pending: { icon: Clock, label: "Pending", count: todoCounts.pending, color: "text-orange-600", bgColor: "bg-orange-50", countBg: "bg-orange-100 text-orange-700" },
                             completed: { icon: CheckCircle, label: "Completed", count: todoCounts.completed, color: "text-green-600", bgColor: "bg-green-50", countBg: "bg-green-100 text-green-700" },
                             upcoming: { icon: Calendar, label: "Upcoming", count: todoCounts.upcoming, color: "text-purple-600", bgColor: "bg-purple-50", countBg: "bg-purple-100 text-purple-700" },
                             past: { icon: History, label: "Past", count: todoCounts.past, color: "text-gray-600", bgColor: "bg-gray-50", countBg: "bg-gray-100 text-gray-700" },
                           }
                           const current = filterOptions[filter]
                           const Icon = current.icon
                           return (
                             <>
                               <Icon className={`h-4 w-4 ${current.color}`} />
                               <span className={current.color}>{current.label}</span>
                               <span className={`text-xs min-w-[20px] h-[20px] flex items-center justify-center rounded-full ${current.countBg}`}>
                                 {current.count}
                               </span>
                               <ChevronDown className="h-4 w-4 text-gray-400" />
                             </>
                           )
                         })()}
                       </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="start" className="w-48">
                       {([
                         { key: "all", icon: List, count: todoCounts.all, label: "All", color: "text-blue-600", bgColor: "bg-blue-50", countBg: "bg-blue-100 text-blue-700" },
                         { key: "pending", icon: Clock, count: todoCounts.pending, label: "Pending", color: "text-orange-600", bgColor: "bg-orange-50", countBg: "bg-orange-100 text-orange-700" },
                         { key: "completed", icon: CheckCircle, count: todoCounts.completed, label: "Completed", color: "text-green-600", bgColor: "bg-green-50", countBg: "bg-green-100 text-green-700" },
                         { key: "upcoming", icon: Calendar, count: todoCounts.upcoming, label: "Upcoming", color: "text-purple-600", bgColor: "bg-purple-50", countBg: "bg-purple-100 text-purple-700" },
                       ] as const).map(({ key, icon: Icon, count, label, color, bgColor, countBg }) => (
                         <DropdownMenuItem
                           key={key}
                           onClick={() => setFilter(key as FilterKey)}
                           className={`flex items-center gap-3 cursor-pointer hover:${bgColor} focus:${bgColor}`}
                         >
                           <Icon className={`h-4 w-4 ${color}`} />
                           <span className={`flex-1 ${color}`}>{label}</span>
                           <span className={`text-xs min-w-[20px] h-[20px] flex items-center justify-center rounded-full ${countBg}`}>
                             {count}
                           </span>
                         </DropdownMenuItem>
                       ))}
                       <DropdownMenuSeparator />
                       <DropdownMenuItem
                         onClick={() => setFilter("past" as FilterKey)}
                         className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
                       >
                         <History className="h-4 w-4 text-gray-600" />
                         <span className="flex-1 text-gray-600">Past</span>
                         <span className="text-xs min-w-[20px] h-[20px] flex items-center justify-center rounded-full bg-gray-100 text-gray-700">
                           {todoCounts.past}
                         </span>
                       </DropdownMenuItem>
                     </DropdownMenuContent>
                   </DropdownMenu>
                 )}

                {activeSection === "todos" && (
                  <>
                    {/* Priority Filter */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="text-sm gap-2">
                          <SlidersHorizontal className="h-4 w-4" />
                          {(() => {
                            const colorMap: Record<string, string> = {
                              high: "text-red-600",
                              medium: "text-orange-600",
                              low: "text-green-600",
                              all: "text-blue-600",
                            }
                            const dotMap: Record<string, string> = {
                              high: "bg-red-500",
                              medium: "bg-yellow-500",
                              low: "bg-green-500",
                              all: "bg-blue-500",
                            }
                            const label = priorityFilter.charAt(0).toUpperCase() + priorityFilter.slice(1)
                            return (
                              <span className={`flex items-center gap-2 ${colorMap[priorityFilter]}`}>
                                <span className={`w-2 h-2 rounded-full ${dotMap[priorityFilter]}`}></span>
                                {label}
                              </span>
                            )
                          })()}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-44">
                        {(() => {
                          const renderItem = (p: "all" | "high" | "medium" | "low") => {
                            const textColor = p === "high" ? "text-red-600" : p === "medium" ? "text-orange-600" : p === "low" ? "text-green-600" : "text-blue-600"
                            const dotColor = p === "high" ? "bg-red-500" : p === "medium" ? "bg-yellow-500" : p === "low" ? "bg-green-500" : "bg-blue-500"
                            return (
                              <DropdownMenuItem
                                key={p}
                                onClick={() => setPriorityFilter(p)}
                                className={`capitalize ${priorityFilter===p ? "bg-blue-50" : ""}`}
                              >
                                <span className={`w-2 h-2 rounded-full mr-2 ${dotColor}`}></span>
                                <span className={textColor}>{p}</span>
                              </DropdownMenuItem>
                            )
                          }
                          return (
                            <>
                              {renderItem("all")}
                              <DropdownMenuSeparator />
                              {(["high","medium","low"] as const).map(renderItem)}
                            </>
                          )
                        })()}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Category Filter */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="text-sm gap-2">
                          {(() => {
                            const iconMap: Record<string, React.ReactNode> = {
                              personal: <User className="h-4 w-4 text-purple-600" />,
                              work: <Briefcase className="h-4 w-4 text-blue-600" />,
                              learning: <BookOpen className="h-4 w-4 text-indigo-600" />,
                              health: <Heart className="h-4 w-4 text-rose-600" />,
                              shopping: <ShoppingCart className="h-4 w-4 text-emerald-600" />,
                              finance: <Wallet className="h-4 w-4 text-amber-600" />,
                              all: <Tag className="h-4 w-4 text-gray-600" />,
                            }
                            const colorMap: Record<string, string> = {
                              personal: "text-purple-700",
                              work: "text-blue-700",
                              learning: "text-indigo-700",
                              health: "text-rose-700",
                              shopping: "text-emerald-700",
                              finance: "text-amber-700",
                              all: "text-gray-700",
                            }
                            const label = categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)
                            return (
                              <span className={`flex items-center gap-2 ${colorMap[categoryFilter]}`}>
                                {iconMap[categoryFilter]}
                                {label}
                              </span>
                            )
                          })()}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        {[
                          { key: "all", icon: Tag, label: "All Categories", color: "text-gray-700" },
                          { key: "personal", icon: User, label: "Personal", color: "text-purple-700" },
                          { key: "work", icon: Briefcase, label: "Work", color: "text-blue-700" },
                          { key: "learning", icon: BookOpen, label: "Learning", color: "text-indigo-700" },
                          { key: "health", icon: Heart, label: "Health", color: "text-rose-700" },
                          { key: "shopping", icon: ShoppingCart, label: "Shopping", color: "text-emerald-700" },
                          { key: "finance", icon: Wallet, label: "Finance", color: "text-amber-700" },
                        ].map(({ key, icon: Icon, label, color }) => (
                          <DropdownMenuItem
                            key={key}
                            onClick={() => setCategoryFilter(key as any)}
                            className={`flex items-center gap-3 cursor-pointer ${categoryFilter === key ? "bg-blue-50" : ""}`}
                          >
                            <Icon className={`h-4 w-4 ${color.replace("text-", "text-")}`} />
                            <span className={color}>{label}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}

                {activeSection !== "calendar" && (
                  <button
                    onClick={() => {
                      if (activeSection === "todos") {
                        setShowTodoForm(true)
                      } else if (activeSection === "finance") setShowFinanceForm(true)
                      else if (activeSection === "goals") setShowGoalsForm(true)
                      else if (activeSection === "habits") setShowHabitsForm(true)
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 w-fit text-sm rounded-lg font-medium flex items-center gap-2 shadow-sm shrink-0"
                  >
                    <span className="text-base leading-none">+</span>
                    <span className=" sm:inline lg:inline-block">Add</span>
                    <span className="hidden sm:inline lg:inline-block">
                      {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              {renderActiveSection()}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}



"use client"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAuth } from "@/context/useAuthContext"
import { ArrowLeft, Menu, PowerOff, XIcon, Sparkles } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function Navbar() {
  const { authUser, logout } = useAuth()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Debug logging
  console.log('Navbar pathname:', pathname)
  
  if (pathname.startsWith("/chat") || pathname.startsWith("/workspace")) {
    console.log('Hiding Navbar for workspace page')
    return <div className="hidden"></div>
  }

  if (["/login", "/signup"].some((route) => pathname.startsWith(route))) {
    return (
      <nav className="flex justify-between items-center fixed top-0 z-50 bg-white backdrop-blur-md border-b border-gray-200/50 w-full px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">GF</span>
          </div>
          <span className="text-gray-900 font-bold text-xl">GrindFlowClub</span>
        </div>
        <Link href={"/"}>
          <Button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-full px-4 py-2">
            <ArrowLeft size={18} />
          </Button>
        </Link>
      </nav>
    )
  }

  return (
    <div className="sticky top-0 z-50 bg-white backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="flex justify-between items-center h-20 w-full px-6 py-4">
        {/* Left Section - Branding and Offer */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">GF</span>
          </div>
          <span className="text-gray-900 font-bold text-xl">GrindFlow</span>
          <div className="bg-indigo-100 border border-indigo-300 rounded-full px-3 py-1 flex items-center gap-2">
            <span className="text-indigo-700 text-sm font-medium">
              Launch week special
            </span>
            <Sparkles size={14} className="text-indigo-600" />
          </div>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button className="md:hidden outline-none bg-transparent hover:bg-gray-100 p-2 rounded-full">
              <Menu className="text-gray-700" />
            </Button>
          </SheetTrigger>
          <SheetContent className="border-transparent border-none">
            <SheetHeader className="h-screen bg-white border-none border-transparent outline-none outline-transparent">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Navigation menu
              </SheetDescription>
              <nav className="md:hidden h-screen relative mt-20">
                <ul className="flex flex-col items-center gap-8 text-lg">
                  <li>
                    <Link
                      href={"/"}
                      className="hover:text-indigo-600 px-2 text-gray-700 font-medium"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={"/workspace"}
                      className="hover:text-indigo-600 px-2 text-gray-700 font-medium"
                    >
                      Workspace
                    </Link>
                  </li>
                  {authUser ? (
                    <li>
                      <Button
                        variant={"outline"}
                        className="bg-indigo-700 hover:bg-indigo-800 text-white hover:text-white border-indigo-700 rounded-full px-6 py-2"
                        onClick={logout}
                      >
                        <PowerOff size={18} className="mr-2" /> Logout
                      </Button>
                    </li>
                  ) : (
                    <li>
                      <Link href={"/login"} className="">
                        <Button
                          variant={"outline"}
                          className="bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-800 border-gray-300 rounded-full px-6 py-2"
                        >
                          Sign in
                        </Button>
                      </Link>
                    </li>
                  )}
                  {!authUser && (
                    <li>
                      <Link href={"/signup"} className="">
                        <Button className="bg-indigo-700 hover:bg-indigo-800 text-white hover:text-white rounded-full px-6 py-2">
                          Get started free
                        </Button>
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
              <SheetClose asChild>
                <button className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg">
                  <XIcon size={20} className="text-gray-700" />
                </button>
              </SheetClose>
            </SheetHeader>
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex">
          <ul className="flex flex-row items-center gap-8">
            <li>
              <Link
                href={"/"}
                className="hover:text-indigo-600 px-2 text-gray-700 font-medium"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href={"/workspace"}
                className="hover:text-indigo-600 px-2 text-gray-700 font-medium"
              >
                Workspace
              </Link>
            </li>
            {authUser ? (
              <li>
                <Button
                  variant={"outline"}
                  className="bg-indigo-700 hover:bg-indigo-800 text-white hover:text-white border-indigo-700 rounded-full px-6 py-2"
                  onClick={logout}
                >
                  <PowerOff size={18} className="mr-2" /> Logout
                </Button>
              </li>
            ) : (
              <li>
                <Link href={"/login"} className="">
                  <Button
                    variant={"outline"}
                    className="bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-800 border-gray-300 rounded-full px-6 py-2"
                  >
                    Sign in
                  </Button>
                </Link>
              </li>
            )}
            {!authUser && (
              <li>
                <Link href={"/signup"} className="">
                  <Button className="bg-indigo-700 hover:bg-indigo-800 text-white hover:text-white rounded-full px-6 py-2">
                    Get started free
                  </Button>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </div>
  )
}



import Link from "next/link"
import { Mail, Twitter, Instagram, Linkedin, Github } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-24 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-10 px-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">GF</span>
          </div>
          <span className="text-xl font-bold">GrindFlowClub</span>
        </div>
        <div className="border-t border-gray-800 mt-6 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">© {currentYear} GrindFlowClub. All rights reserved.</div>
            <div className="text-gray-400 text-sm">
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/privacy" className="hover:text-white">Privacy</Link>
                <Link href="/terms-and-conditions" className="hover:text-white">Terms</Link>
                <Link href="/refund" className="hover:text-white">Cancellation & Refunds</Link>
                <Link href="/contact" className="hover:text-white">Contact</Link>
                <Link href="/shipping" className="hover:text-white">Shipping</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}



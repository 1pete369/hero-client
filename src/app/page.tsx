"use client"
import Hero from "@/components/home/Hero"
import Features from "@/components/home/Features"
import SocialProof from "@/components/home/SocialProof"
import HowItWorks from "@/components/home/HowItWorks"
import Pricing from "@/components/home/Pricing"
import Footer from "@/components/home/Footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-fuchsia-300/20 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-32 w-32 rotate-45 bg-indigo-200/30" />
      </div>

      <Hero />
      <Features />
      <SocialProof />
      <HowItWorks />
      <Pricing />
      <Footer />
    </div>
  )
}



"use client"

import React from "react"

type GradientBlobsProps = {
  className?: string
  density?: "low" | "medium" | "high"
  palette?: string[] // tailwind bg-* classes with opacity
}

// Subtle blurred gradient blobs for gamified background feel
export default function GradientBlobs({ className = "", density = "medium", palette }: GradientBlobsProps) {
  const count = density === "high" ? 7 : density === "low" ? 2 : 4
  const colors =
    palette && palette.length > 0
      ? palette
      : [
          "bg-rose-300/30",
          "bg-fuchsia-300/30",
          "bg-indigo-300/25",
          "bg-sky-300/25",
          "bg-amber-300/25",
          "bg-lime-300/25",
          "bg-teal-300/25",
        ]
  const positions: React.CSSProperties[] = [
    { top: "-40px", left: "-40px" },
    { top: "15%", right: "-60px" },
    { bottom: "-60px", left: "25%" },
    { top: "40%", left: "-70px" },
    { bottom: "10%", right: "-50px" },
    { top: "-50px", right: "35%" },
    { bottom: "35%", right: "30%" },
  ]
  const blobs = Array.from({ length: count }).map((_, i) => ({
    className: colors[i % colors.length],
    style: positions[i % positions.length],
  }))

  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`} aria-hidden>
      {blobs.map((b, i) => (
        <div
          key={i}
          className={`absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full blur-3xl mix-blend-multiply ${b.className}`}
          style={b.style as React.CSSProperties}
        />
      ))}
    </div>
  )
}



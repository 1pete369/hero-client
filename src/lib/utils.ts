import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Returns YYYY-MM-DD in the user's local timezone
export function formatLocalDateYYYYMMDD(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function addDaysLocal(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function todayLocalISO(): string {
  return formatLocalDateYYYYMMDD(new Date())
}

// Extract YYYY-MM-DD from an ISO string without timezone shifts
export function isoDateOnly(isoString: string): string {
  if (!isoString) return ""
  const idx = isoString.indexOf("T")
  return idx === -1 ? isoString : isoString.slice(0, idx)
}

// Celebration helper: plays a sound and fires confetti from an element's position
// Usage: triggerCompletionCelebration(`todo-${id}`)
export function triggerCompletionCelebration(
  anchorElementId: string,
  opts?: {
    angle?: number
    spread?: number
    startVelocity?: number
    particleCount?: number
    colors?: string[]
    soundSrc?: string
    volume?: number
  }
) {
  // Lazy import confetti to avoid SSR issues
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import("canvas-confetti").then((mod: any) => {
    const confetti = mod.default || mod
    const {
      angle = 70,
      spread = 40,
      startVelocity = 40,
      particleCount = 50,
      colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
      soundSrc = '/complete sound.wav',
      volume = 0.5,
    } = opts || {}

    try {
      const audio = new Audio(soundSrc)
      audio.volume = volume
      audio.play().catch(() => {})
    } catch {}

    const el = document.getElementById(anchorElementId)
    if (!el) {
      // Fallback: center of screen
      confetti({ particleCount, spread, angle, startVelocity, colors })
      return
    }
    const rect = el.getBoundingClientRect()
    const x = (rect.left + rect.width / 2) / window.innerWidth
    const y = (rect.top + rect.height / 2) / window.innerHeight
    confetti({
      particleCount,
      spread,
      angle,
      origin: { x, y },
      colors,
      startVelocity,
      gravity: 1.2,
      scalar: 0.8,
      ticks: 100,
    })
  })
}


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


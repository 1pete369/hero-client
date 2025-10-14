"use client"

import { useEffect, useRef, useState } from "react"
import { axiosAppInstance } from "@/lib/axiosAppInstance"
import { useAuth } from "@/context/useAuthContext"
import toast from "react-hot-toast"
import Image from "next/image"
import GoogleIcon from "../../google.png"

function FallbackRedirectButton() {
  // In production, you can set NEXT_PUBLIC_BACKEND_AUTH_URL to your backend base
  const base = (process.env.NEXT_PUBLIC_BACKEND_AUTH_URL || "").replace(/\/+$/, "");
  const href = base ? `${base}/api/auth/google/oauth` : "/api/auth/google/oauth";
  return (
    <button
      type="button"
      onClick={() => { window.location.href = href }}
      className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-white border border-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-50 shadow-sm"
    >
      <Image src={GoogleIcon} alt="Google" width={18} height={18} className="h-[18px] w-[18px]" />
      <span>Continue with Google</span>
    </button>
  )
}

type GoogleBtnProps = {
  onSuccessRedirect?: string
  text?: "signin_with" | "signup_with" | "continue_with" | "signup" | "signin"
  theme?: "outline" | "filled_blue" | "filled_black"
  size?: "small" | "medium" | "large"
  shape?: "rectangular" | "pill" | "circle" | "square"
  width?: number
}

export default function GoogleSignInButton({
  onSuccessRedirect = "/",
  text = "continue_with",
  theme = "filled_blue",
  size = "large",
  shape = "rectangular",
  width = 320,
}: GoogleBtnProps) {
  const { setAuthUser } = useAuth() as any
  const divRef = useRef<HTMLDivElement | null>(null)
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    if (!clientId) return
    if (typeof window === "undefined") return
    if (!window.google) return

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            const credential = response?.credential
            if (!credential) return
            const r = await axiosAppInstance.post("/auth/google", { credential })
            setAuthUser?.(r.data)
            toast.success("Signed in with Google")
            window.location.href = onSuccessRedirect
          } catch (err: any) {
            console.error("Google sign-in failed", err)
            const msg = err?.response?.data?.error || err?.message || "Failed to sign in with Google"
            toast.error(String(msg))
          }
        },
      })

      if (divRef.current) {
        window.google.accounts.id.renderButton(divRef.current, {
          theme,
          size,
          text,
          shape,
          width,
        })
        setRendered(true)
      }
    } catch (e) {
      console.error("Failed to init Google", e)
    }
  }, [clientId, onSuccessRedirect, text, theme, size, shape, width])

  // SSR or not yet mounted: show fallback
  if (typeof window === "undefined" || !clientId || !(window as any).google || !rendered) {
    return <FallbackRedirectButton />
  }

  return (
    <div className="w-full flex items-center justify-center">
      <div ref={divRef} />
    </div>
  )
}

declare global {
  interface Window { google: any }
}

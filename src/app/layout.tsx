import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "../context/useAuthContext";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

export const metadata: Metadata = { title: "Auth App", description: "Minimal auth demo" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Identity Services */}
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        {/* LaunchList referral tracking */}
        <Script src="https://getlaunchlist.com/js/widget-diy.js" strategy="afterInteractive" />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}


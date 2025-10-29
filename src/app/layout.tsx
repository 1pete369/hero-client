import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "../context/useAuthContext";
import { Toaster } from "react-hot-toast";
import Script from "next/script";
import { Comic_Neue } from "next/font/google";

const comicNeue = Comic_Neue({ 
  weight: ['300', '400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial', 'sans-serif']
});

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
      <body className={comicNeue.className}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}


import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/useAuthContext";

export const metadata: Metadata = { title: "Auth App", description: "Minimal auth demo" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}



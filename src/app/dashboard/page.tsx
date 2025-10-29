"use client";

import { useAuth } from "@/context/useAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, Mail, Calendar, Shield, Cog, Pencil, CreditCard, BarChart2, Settings, Home } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import GoogleIcon from "../../../google.png";
import Link from "next/link";

export default function DashboardPage() {
  const { authUser, checkAuth } = useAuth();

  useEffect(() => { checkAuth(); }, []);

  const joined = authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString() : "—";
  const provider = (authUser as any)?.provider || ((authUser as any)?.googleId ? "google" : "email");
  const emailPrefix = authUser?.email ? String(authUser.email).split("@")[0] : "user";
  const displayFullName = authUser?.fullName || authUser?.username || emailPrefix;
  const displayUsername = authUser?.username || emailPrefix;
  // Define hooks before any conditional return to preserve order
  const [section, setSection] = useState<"overview" | "settings" | "usage" | "billing">("overview");

  if (!authUser) {      // TODO: Add a loading state
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        {/* Left sidebar */}
        <aside className="rounded bg-white border-3 border-black p-2 h-fit md:sticky md:top-6 md:self-start shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <div className="px-3 py-3 border-b-3 border-black flex items-center gap-3">
            <Avatar className="h-8 w-8 ring-2 ring-black">
              <AvatarImage src={authUser?.profilePic || ""} alt={displayFullName || "User"} />
              <AvatarFallback>{(displayFullName?.[0] || displayUsername?.[0] || "U").toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-gray-900 text-sm font-semibold">{displayFullName}</div>
              <div className="text-gray-600 text-xs">{authUser?.email}</div>
            </div>
          </div>
          <nav className="py-2">
            {[
              { id: "overview", label: "Overview", icon: Home },
              { id: "settings", label: "Settings", icon: Settings },
              { id: "usage", label: "Usage", icon: BarChart2 },
              { id: "billing", label: "Billing & Invoices", icon: CreditCard },
            ].map((item) => {
              const Icon = item.icon as any
              const active = section === (item.id as any)
              return (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id as any)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left mb-1 transition-transform border-3 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${
                    active ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Right content */}
        <section className="space-y-6">

          {section === "overview" && (
            <div className="grid grid-cols-1 gap-6">
              <div className="rounded bg-white border-3 border-black p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <div className="text-gray-900 text-lg font-semibold">Pro</div>
                <div className="text-gray-700 mt-1">$20/mo.</div>
                <p className="text-gray-700 mt-3 text-sm">Your current plan with premium access and more.</p>
                <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white border-3 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">Manage Subscription</Button>
              </div>
              <div className="rounded bg-white border-3 border-black p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <div className="text-gray-900 text-lg font-semibold">On-Demand Usage</div>
                <p className="text-gray-700 mt-3 text-sm">Go beyond your plan's included quota.</p>
                <Button className="mt-4 bg-white text-gray-800 border-3 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">Enable</Button>
              </div>
            </div>
          )}

          {section === "settings" && (
            <Card className="bg-white border-3 border-black text-gray-900 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>General account preferences</CardDescription>
              </CardHeader>
              <CardContent>Coming soon…</CardContent>
            </Card>
          )}

          {section === "usage" && (
            <Card className="bg-white border-3 border-black text-gray-900 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <CardHeader>
                <CardTitle>Usage</CardTitle>
                <CardDescription>Your analytics and quotas</CardDescription>
              </CardHeader>
              <CardContent>Usage charts coming soon…</CardContent>
            </Card>
          )}

          {section === "billing" && (
            <Card className="bg-white border-3 border-black text-gray-900 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <CardHeader>
                <CardTitle>Billing & Invoices</CardTitle>
                <CardDescription>Manage payment methods and invoices</CardDescription>
              </CardHeader>
              <CardContent>Billing portal link coming soon…</CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}



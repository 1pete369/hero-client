"use client";

import { useAuth } from "@/context/useAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, Mail, Calendar, Shield, Cog, Pencil } from "lucide-react";
import { useEffect } from "react";
import Image from "next/image";
import GoogleIcon from "../../../google.png";
import Link from "next/link";

export default function ProfilePage() {
  const { authUser, checkAuth } = useAuth();

  useEffect(() => { checkAuth(); }, []);

  const joined = authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString() : "—";
  const provider = (authUser as any)?.provider || ((authUser as any)?.googleId ? "google" : "email");

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={authUser?.profilePic || ""} alt={authUser?.fullName || "User"} />
              <AvatarFallback>{(authUser?.fullName?.[0] || authUser?.username?.[0] || "U").toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{authUser?.fullName}</h1>
              <p className="text-gray-600">@{authUser?.username}</p>
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-1"><Calendar className="h-4 w-4" /> Joined {joined}</p>
              <div className="mt-2">
                {provider === "google" ? (
                  <span className="inline-flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                    <Image src={GoogleIcon} alt="Google" width={14} height={14} className="h-[14px] w-[14px]" />
                    Signed in with Google
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200">
                    <Mail className="h-3 w-3" />
                    Email/password
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button asChild>
            <Link href="/profile/edit" className="flex items-center gap-2"><Pencil className="h-4 w-4" /> Edit Profile</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-4 w-4" /> Account</CardTitle>
              <CardDescription>Your public profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm"><span className="text-gray-500">Full name:</span> <span className="font-medium">{authUser?.fullName}</span></div>
              <div className="text-sm"><span className="text-gray-500">Username:</span> <span className="font-medium">@{authUser?.username}</span></div>
              <div className="text-sm flex items-center gap-2"><Mail className="h-4 w-4 text-gray-500" /> <span className="font-medium">{authUser?.email}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4" /> Security</CardTitle>
              <CardDescription>Security overview</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <div>Two-factor authentication: <span className="font-medium">Not enabled</span></div>
              <div>Active sessions: <span className="font-medium">1</span></div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Cog className="h-4 w-4" /> Preferences</CardTitle>
              <CardDescription>Personalization settings</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">Timezone, locale, theme preferences will appear here.</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

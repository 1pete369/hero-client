"use client"
import React, { createContext, useContext, useEffect, useState } from "react";
import { axiosInstance } from "../lib/axiosInstance";

type Signup = { fullName: string; username: string; email: string; password: string };
type Login = { email: string; password: string };
type User = { _id: string; fullName: string; username: string; email: string; profilePic?: string } | null;

type Ctx = {
  authUser: User;
  isCheckingAuth: boolean;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  checkAuth: () => Promise<void>;
  signup: (d: Signup) => Promise<void>;
  login: (d: Login) => Promise<void>;
  logout: () => Promise<void>;
};

const C = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<User>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const checkAuth = async () => {
    try {
      const r = await axiosInstance.get("/auth/check");
      setAuthUser(r.data);
    } catch {
      setAuthUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const signup = async (d: Signup) => {
    setIsSigningUp(true);
    try {
      const r = await axiosInstance.post("/auth/signup", d);
      setAuthUser(r.data);
    } finally {
      setIsSigningUp(false);
    }
  };

  const login = async (d: Login) => {
    setIsLoggingIn(true);
    try {
      const r = await axiosInstance.post("/auth/login", d);
      setAuthUser(r.data);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    await axiosInstance.post("/auth/logout");
    setAuthUser(null);
  };

  useEffect(() => { checkAuth(); }, []);

  return (
    <C.Provider value={{ authUser, isCheckingAuth, isSigningUp, isLoggingIn, checkAuth, signup, login, logout }}>
      {children}
    </C.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}



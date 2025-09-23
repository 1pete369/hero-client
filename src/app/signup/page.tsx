"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/useAuthContext";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const { signup, authUser, isSigningUp } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authUser) router.replace("/");
  }, [authUser, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName || !username || !email || !password) return setError("Fill all fields");
    try {
      await signup({ fullName, username, email, password });
      router.replace("/");
    } catch (e) {
      setError("Signup failed");
    }
  };

  if (authUser) return null;

  return (
    <main className="container">
      <h2>Signup</h2>
      <form onSubmit={onSubmit}>
        <label htmlFor="name">Full name</label>
        <input id="name" value={fullName} onChange={(e)=>setFullName(e.target.value)} />
        <label htmlFor="username">Username</label>
        <input id="username" value={username} onChange={(e)=>setUsername(e.target.value)} />
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        {error && <p style={{ color: "crimson" }}>{error}</p>}
        <button disabled={isSigningUp} type="submit">{isSigningUp ? "Creating..." : "Create account"}</button>
      </form>
      <p>Already have an account? <Link href="/login">Login</Link></p>
    </main>
  );
}



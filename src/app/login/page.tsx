"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/useAuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, authUser, isLoggingIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authUser) router.replace("/");
  }, [authUser, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Fill all fields");
    try {
      await login({ email, password });
      router.replace("/");
    } catch (e) {
      setError("Login failed");
    }
  };

  if (authUser) return null;

  return (
    <main className="container">
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        {error && <p style={{ color: "crimson" }}>{error}</p>}
        <button disabled={isLoggingIn} type="submit">{isLoggingIn ? "Signing in..." : "Login"}</button>
      </form>
      <p>Don&apos;t have an account? <Link href="/signup">Signup</Link></p>
    </main>
  );
}



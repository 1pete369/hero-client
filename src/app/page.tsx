"use client";
import Link from "next/link";
import { useAuth } from "../context/useAuthContext";

export default function Home() {
  const { authUser, logout } = useAuth();
  return (
    <main className="container">
      <h1>Auth Demo</h1>
      {authUser ? (
        <>
          <p>Signed in as {authUser.fullName} ({authUser.email})</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <p>Please login or signup.</p>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/login">Login</Link>
            <Link href="/signup">Signup</Link>
          </div>
        </>
      )}
    </main>
  );
}



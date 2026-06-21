"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:3001`}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password, role: "ADMIN" }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("admin_session", data.access_token);
        router.push("/dashboard/admin");
      } else {
        const err = await res.json();
        alert(err.message || "Login failed");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during login.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo-compact.png" alt="Corpass" className="h-10 mx-auto mb-6" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold mb-4">
            <Shield className="w-3.5 h-3.5" />
            Admin Portal
          </div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Sign in to Admin</h1>
          <p className="text-sm text-slate mt-2">Manage users, orders, and platform operations.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-paper border border-border rounded-lg p-6 shadow-sm space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
              Login ID or Email
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@corpass.in"
              className="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-paper focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-paper focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-2.5 text-sm font-semibold text-paper bg-brand rounded-md hover:bg-brand-700 transition-colors"
          >
            Sign In
          </button>
          <p className="text-xs text-center text-slate">
            Use system admin credentials to sign in.
          </p>
        </form>
      </div>
    </div>
  );
}

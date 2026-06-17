"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import LogoLink from "@/components/ui/LogoLink";

export default function LoginPage() {
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [error, setError] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.has("password") || params.has("identifier")) {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const apiUrl = `http://${window.location.hostname}:3001/auth/login`;
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, role })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      
      // Route based on the role returned by the backend
      if (data.user.role === 'SELLER') {
        router.push("/dashboard/seller");
      } else {
        router.push("/dashboard/buyer");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center w-full mb-8">
            <LogoLink src="/logo.png" className="w-56 sm:w-72 h-auto object-contain mx-auto" priority={true} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-ink tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate">
            Sign in to your Corpass workspace.
          </p>
        </div>

        {/* Role Switch Bar */}
        <div className="flex p-1 bg-paper-2 mb-8 border border-border">
          <button
            onClick={() => setRole('BUYER')}
            className={`flex-1 py-2.5 text-sm font-medium transition-all duration-300 ${
              role === 'BUYER' 
                ? 'bg-ink text-paper shadow-sm' 
                : 'text-slate hover:text-ink'
            }`}
          >
            I am a Company
          </button>
          <button
            onClick={() => setRole('SELLER')}
            className={`flex-1 py-2.5 text-sm font-medium transition-all duration-300 ${
              role === 'SELLER' 
                ? 'bg-ink text-paper shadow-sm' 
                : 'text-slate hover:text-ink'
            }`}
          >
            I am a Seller
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && <div className="p-3 bg-copper-bg text-copper text-sm border border-copper">{error}</div>}
          
          <div>
            <Input
              label="Login ID or Mobile"
              type="text"
              id="identifier"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your ID or Mobile"
              required
            />
          </div>

          <div>
            <Input
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-3 text-sm mt-2"
          >
            Sign In as {role === 'BUYER' ? 'Company' : 'Seller'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-slate">Don't have an account? </span>
          <a href="/register" className="font-medium text-ink hover:text-copper transition-colors">
            Register your company or store
          </a>
        </div>
      </div>
    </div>
  );
}

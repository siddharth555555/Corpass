import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';

export function LoginModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [error, setError] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:3001`}/auth/login`;
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
      
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-paper rounded-xl shadow-2xl w-full max-w-md p-6 md:p-8 animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate hover:text-ink transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-ink">Sign in to continue</h2>
          <p className="mt-1 text-sm text-slate">Please log in to your account to complete this action.</p>
        </div>

        <div className="flex p-1 bg-paper-2 mb-6 border border-border rounded-lg shadow-sm">
          <button
            type="button"
            onClick={() => setRole('BUYER')}
            className={`flex-1 py-2 text-sm font-medium transition-all duration-300 rounded-md ${
              role === 'BUYER' ? 'bg-ink text-canvas shadow-sm' : 'text-slate hover:text-ink'
            }`}
          >
            Company
          </button>
          <button
            type="button"
            onClick={() => setRole('SELLER')}
            className={`flex-1 py-2 text-sm font-medium transition-all duration-300 rounded-md ${
              role === 'SELLER' ? 'bg-ink text-canvas shadow-sm' : 'text-slate hover:text-ink'
            }`}
          >
            Seller
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && <div className="p-3 bg-copper-bg text-copper text-sm border border-copper rounded">{error}</div>}
          
          <Input
            label="Login ID or Mobile"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Enter your ID or Mobile"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-sm mt-2">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

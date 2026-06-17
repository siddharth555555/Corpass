"use client";

import { useState, useEffect } from "react";
import LogoLink from "@/components/ui/LogoLink";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "", loginId: "", password: "", email: "", mobile: "",
    address: "", city: "", pincode: "",
    companyName: "", companyAddress: "", companyType: "LLC", employeeCount: "1-10",
    gstin: "", deliveryRange: "HYPER_LOCAL_20KM"
  });
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.has("password") || params.has("loginId") || params.has("email")) {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, []);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Inject the role
    data.role = role;

    try {
      const apiUrl = `http://${window.location.hostname}:3001/auth/register`;
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const resData = await res.json();
      localStorage.setItem("access_token", resData.access_token);
      
      if (resData.user.role === 'SELLER') {
        router.push("/dashboard/seller");
      } else {
        router.push("/dashboard/buyer");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-8 left-8 sm:top-12 sm:left-12">
        <LogoLink className="h-16 w-auto object-contain border border-border bg-paper" priority={true} />
      </div>

      <div className="w-full max-w-2xl bg-paper shadow-sm border border-border p-8 sm:p-10 relative z-10 mt-12 sm:mt-0">
        <div className="text-left mb-8">
          <h2 className="text-3xl tracking-tight text-ink font-serif">Create your Account</h2>
          <p className="mt-2 text-sm text-slate font-sans">
            {role === 'BUYER' ? "Enterprise procurement starts here. Register your company." : "Join our marketplace. Register as a seller."}
          </p>
        </div>

        {/* Role Switch Bar */}
        <div className="flex p-1 bg-paper-2 mb-10 border border-border max-w-sm mx-auto">
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

        <form onSubmit={handleRegister} className="space-y-8">
          {error && <div className="p-3 bg-copper-bg text-copper text-sm border border-copper">{error}</div>}
          
          {/* User Details Section (Shared) */}
          <div className="space-y-5">
            <h3 className="text-lg text-ink border-b border-border pb-3 font-serif font-semibold">1. Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Input label="Full Name" name="name" type="text" placeholder="John Doe" required />
              </div>
              <div>
                <Input label="Login ID" name="loginId" type="text" placeholder="johndoe123" required />
              </div>
              <div>
                <Input label="Email" name="email" type="email" pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}" title="Please enter a valid email address" placeholder="john@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate mb-1.5">Mobile <span className="text-copper">*</span></label>
                <div className="flex relative">
                  <select name="dialCode" className="flex-shrink-0 w-24 px-2 py-2.5 bg-paper border border-r-0 border-border text-sm text-ink focus:outline-none" defaultValue="+91">
                    <option value="+1">US (+1)</option>
                    <option value="+44">UK (+44)</option>
                    <option value="+91">IN (+91)</option>
                    <option value="+61">AU (+61)</option>
                    <option value="+971">UAE (+971)</option>
                    <option value="+65">SG (+65)</option>
                  </select>
                  <input name="mobile" type="tel" pattern="[0-9]{7,15}" title="Please enter a valid phone number" className="flex-1 w-full px-4 py-2.5 bg-paper border border-border text-sm text-ink placeholder:text-slate focus:outline-none focus:border-border-focus" placeholder="9876543210" required />
                </div>
              </div>
              <div className="md:col-span-2">
                <Input label="Password" name="password" type="password" placeholder="Create a strong password" required />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="md:col-span-2">
                <Input label="Address" name="address" type="text" placeholder="123 Business Avenue" required />
              </div>
              <div className="grid grid-cols-2 gap-4 col-span-2">
                <div>
                  <label className="block text-sm font-medium text-slate mb-1.5">City</label>
                  <input name="city" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-paper border border-border text-sm text-ink focus:outline-none focus:border-border-focus" placeholder="New Delhi" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate mb-1.5">Pincode</label>
                  <input name="pincode" required value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-paper border border-border text-sm text-ink focus:outline-none focus:border-border-focus" placeholder="110001" />
                </div>
              </div>
            </div>
          </div>

          {/* Conditional Details Section */}
          <div className="space-y-5 pt-6">
            <h3 className="text-lg text-ink border-b border-border pb-3 font-serif font-semibold">
              {role === 'BUYER' ? "2. Company Information" : "2. Seller Configuration"}
            </h3>

            {role === 'BUYER' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <Input label="Company Name" name="companyName" type="text" placeholder="Acme Corporation" required />
                </div>
                <div className="md:col-span-2">
                  <Input label="Company Address" name="companyAddress" type="text" placeholder="Corporate HQ Address" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate mb-1.5">Company Type</label>
                  <select name="companyType" className="w-full px-4 py-2.5 bg-paper border border-border text-sm text-ink focus:outline-none focus:border-border-focus" required defaultValue="">
                    <option value="" disabled>Select Type</option>
                    <option value="LLC">LLC</option>
                    <option value="Corporation">Corporation</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate mb-1.5">Number of Employees</label>
                  <select name="employeeCount" className="w-full px-4 py-2.5 bg-paper border border-border text-sm text-ink focus:outline-none focus:border-border-focus" required defaultValue="">
                    <option value="" disabled>Select Range</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value="500+">500+</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <Input label="GSTIN (Mandatory)" name="gstin" type="text" placeholder="22AAAAA0000A1Z5" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate mb-1.5">Delivery Range Options</label>
                  <select name="deliveryRange" className="w-full px-4 py-2.5 bg-paper border border-border text-sm text-ink focus:outline-none focus:border-border-focus" required defaultValue="">
                    <option value="" disabled>Select Delivery Capability</option>
                    <option value="HYPER_LOCAL_20KM">Hyper Local (Within 20 km)</option>
                    <option value="LOCAL_100KM">Local (Within 100 km)</option>
                    <option value="SHIPPING_AVAILABLE">Shipping Available (Pan-region)</option>
                  </select>
                  <p className="mt-2 text-xs text-slate">This helps buyers discover vendors that can deliver to their pincode efficiently.</p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6">
            <button 
              type="submit"
              className="w-full btn-primary py-3 text-sm"
            >
              Complete {role === 'BUYER' ? 'Company' : 'Seller'} Registration
            </button>
          </div>
        </form>
        
        <div className="mt-8 text-center text-sm">
          <span className="text-slate">Already have an account? </span>
          <a href="/login" className="font-medium text-ink hover:text-copper transition-colors">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}

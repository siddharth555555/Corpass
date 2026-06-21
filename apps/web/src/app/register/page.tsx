"use client";

import { useState, useEffect } from "react";
import LogoLink from "@/components/ui/LogoLink";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Select } from "@/components/ui/Select";

export default function RegisterPage() {
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [error, setError] = useState<string | string[] | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [formData, setFormData] = useState({
    name: "", loginId: "", password: "", email: "", mobile: "", dialCode: "+91",
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

  useEffect(() => {
    if (formData.pincode.length === 6) {
      fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`)
        .then(res => res.json())
        .then(data => {
          if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const city = data[0].PostOffice[0].District || data[0].PostOffice[0].Division;
            if (city) {
              setFormData(prev => ({ ...prev, city }));
            }
          }
        })
        .catch(() => {});
    }
  }, [formData.pincode]);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!acceptedTerms) {
      setError("You must agree to the Terms & Conditions to register.");
      return;
    }
    const formDataObj = new FormData(e.currentTarget);
    const data = Object.fromEntries(formDataObj.entries());
    
    // Basic frontend validation for required fields
    const requiredFields = ['name', 'loginId', 'password', 'email', 'mobile', 'address', 'city', 'pincode'];
    if (role === 'BUYER') {
      requiredFields.push('companyName', 'companyAddress', 'companyType', 'employeeCount');
    } else {
      requiredFields.push('gstin', 'deliveryRange');
    }
    
    const missing = requiredFields.filter(f => !data[f] || String(data[f]).trim() === "");
    if (missing.length > 0) {
      setError("Please fill in all required fields.");
      return;
    }
    
    // Combine dial code and mobile number, then remove non-DTO fields
    if (data.dialCode && data.mobile) {
      data.mobile = `${data.dialCode}${data.mobile}`;
    }
    delete data.dialCode;
    delete data.terms;
    
    // Inject the role
    data.role = role;

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:3001`}/auth/register`;
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw errorData;
      }

      const resData = await res.json();
      localStorage.setItem("access_token", resData.access_token);
      
      if (resData.user.role === 'SELLER') {
        router.push("/dashboard/seller");
      } else {
        router.push("/dashboard/buyer");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative selection:bg-brand-500 selection:text-white animate-fade-up">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 z-50">
        <ThemeToggle />
      </div>
      <div className="flex justify-center items-center w-full mb-8 relative z-10">
        <LogoLink src="/logo.png" className="w-56 sm:w-72 h-auto object-contain mx-auto" priority={true} />
      </div>

      <div className="w-full max-w-2xl bg-paper shadow-sm border border-border p-8 sm:p-10 relative z-10">
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
                ? 'bg-ink text-canvas shadow-sm' 
                : 'text-slate hover:text-ink'
            }`}
          >
            I am a Company
          </button>
          <button
            onClick={() => setRole('SELLER')}
            className={`flex-1 py-2.5 text-sm font-medium transition-all duration-300 ${
              role === 'SELLER' 
                ? 'bg-ink text-canvas shadow-sm' 
                : 'text-slate hover:text-ink'
            }`}
          >
            I am a Seller
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-8" noValidate>
          {error && (
            <div className="p-4 bg-copper-bg/50 text-copper text-sm border border-copper/30 rounded-md shadow-sm">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  {Array.isArray(error) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {error.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{error}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
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
                  <Select
                    name="dialCode"
                    value={formData.dialCode}
                    onChange={val => setFormData({...formData, dialCode: val})}
                    options={[
                      {value: "+1", label: "🇺🇸 US (+1)"},
                      {value: "+44", label: "🇬🇧 UK (+44)"},
                      {value: "+91", label: "🇮🇳 IN (+91)"},
                      {value: "+61", label: "🇦🇺 AU (+61)"},
                      {value: "+971", label: "🇦🇪 UAE (+971)"},
                      {value: "+65", label: "🇸🇬 SG (+65)"}
                    ]}
                    className="w-28"
                  />
                  <input name="mobile" type="tel" pattern="[0-9]{7,15}" title="Please enter a valid phone number" className="flex-1 w-full px-4 py-2.5 bg-paper border border-border-strong text-sm text-ink placeholder:text-slate focus:outline-none focus:border-brand-600" placeholder="9876543210" required />
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
                  <label className="block text-sm font-medium text-slate mb-1.5">City <span className="text-copper">*</span></label>
                  <input name="city" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-paper border border-border text-sm text-ink focus:outline-none focus:border-border-focus" placeholder="New Delhi" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate mb-1.5">Pincode <span className="text-copper">*</span></label>
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
                  <label className="block text-sm font-medium text-slate mb-1.5">Company Type <span className="text-copper">*</span></label>
                  <Select
                    name="companyType"
                    value={formData.companyType}
                    onChange={val => setFormData({...formData, companyType: val})}
                    options={[
                      {value: "LLC", label: "LLC"},
                      {value: "Corporation", label: "Corporation"},
                      {value: "Partnership", label: "Partnership"},
                      {value: "Sole Proprietorship", label: "Sole Proprietorship"}
                    ]}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate mb-1.5">Number of Employees <span className="text-copper">*</span></label>
                  <Select
                    name="employeeCount"
                    value={formData.employeeCount}
                    onChange={val => setFormData({...formData, employeeCount: val})}
                    options={[
                      {value: "1-10", label: "1-10"},
                      {value: "11-50", label: "11-50"},
                      {value: "51-200", label: "51-200"},
                      {value: "201-500", label: "201-500"},
                      {value: "500+", label: "500+"}
                    ]}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <Input label="GSTIN (Mandatory)" name="gstin" type="text" placeholder="22AAAAA0000A1Z5" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate mb-1.5">Delivery Range Options <span className="text-copper">*</span></label>
                  <Select
                    name="deliveryRange"
                    value={formData.deliveryRange}
                    onChange={val => setFormData({...formData, deliveryRange: val})}
                    options={[
                      {value: "HYPER_LOCAL_20KM", label: "Hyper Local"},
                      {value: "LOCAL_100KM", label: "Local"},
                      {value: "SHIPPING_AVAILABLE", label: "Pan India"}
                    ]}
                    required
                  />
                  <p className="mt-2 text-xs text-slate">This helps buyers discover vendors that can deliver to their pincode efficiently.</p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border mt-8 flex flex-col gap-5">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-ink focus:ring-ink"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-slate">
                  I agree to the{" "}
                  <button type="button" onClick={() => setShowTerms(true)} className="text-copper hover:underline focus:outline-none">
                    Terms & Conditions
                  </button>
                </label>
              </div>
            </div>

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

      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTerms(false)}></div>
          <div className="relative bg-paper rounded shadow-2xl w-full max-w-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif font-bold text-ink">Terms & Conditions</h2>
              <button onClick={() => setShowTerms(false)} className="h-8 w-8 rounded-full bg-paper-2 flex items-center justify-center text-slate hover:text-ink hover:bg-border transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-sm text-slate">
              <p>Welcome to Corpass. By registering an account, you agree to these terms.</p>
              <h3 className="font-bold text-ink text-base mt-4">1. Account Responsibilities</h3>
              <p>You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</p>
              <h3 className="font-bold text-ink text-base mt-4">2. Marketplace Transactions</h3>
              <p>Corpass facilitates transactions between buyers and sellers but is not a party to the actual contract of sale. Vendors are responsible for fulfilling orders and ensuring product quality.</p>
              <h3 className="font-bold text-ink text-base mt-4">3. Prohibited Content</h3>
              <p>You agree not to list or sell any illegal, counterfeit, or otherwise prohibited items on the platform. Violation will result in immediate account termination.</p>
            </div>
            <div className="mt-6 pt-4 border-t border-border flex justify-end">
              <button onClick={() => { setAcceptedTerms(true); setShowTerms(false); }} className="btn-primary py-2 px-6 text-sm">
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

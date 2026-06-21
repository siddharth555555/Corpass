"use client";

import LogoLink from "@/components/ui/LogoLink";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-paper animate-fade-up">
      {/* Navigation */}
      <nav className="border-b border-border bg-paper/80 backdrop-blur-sm relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex-shrink-0 flex items-center">
              <LogoLink className="w-32 md:w-40 h-auto object-contain" priority={true} />
            </div>
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              <ThemeToggle />
              <Link href="/dashboard/buyer/catalog" className="text-sm font-medium text-slate hover:text-ink transition-colors">
                Marketplace
              </Link>
              <Link href="/login" className="text-sm font-medium text-slate hover:text-ink transition-colors">
                Sign in
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                Create Account
              </Link>
            </div>
            {/* Mobile Nav Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate hover:text-ink">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-paper px-4 py-4 space-y-4">
            <Link href="/dashboard/buyer/catalog" className="block text-base font-medium text-slate hover:text-ink transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Marketplace
            </Link>
            <Link href="/login" className="block text-base font-medium text-slate hover:text-ink transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Sign in
            </Link>
            <Link href="/register" className="block btn-primary text-center text-sm w-full" onClick={() => setMobileMenuOpen(false)}>
              Create Account
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center border border-copper bg-copper-bg px-3 py-1 text-sm font-medium text-copper">
            <span className="flex h-2 w-2 bg-copper mr-2"></span>
            Enterprise-grade procurement
          </div>

          {/* Headline */}
          <h1 className="text-5xl tracking-tight text-ink sm:text-6xl font-serif">
            Everything your business needs, <span className="text-copper">managed in one place.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg leading-8 text-slate font-sans">
            A modern B2B corporate procurement and asset management platform. Discover, purchase, bundle, and track your assets with marketplace convenience and operational control.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
            <div className="bg-paper p-6 border border-border card-hover">
              <div className="h-10 w-10 bg-paper-2 flex items-center justify-center mb-4">
                <svg className="h-5 w-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-ink mb-2 font-serif">Curated Marketplace</h3>
              <p className="text-sm text-slate">Procure office supplies, employee kits, furniture, and bulk orders from verified vendors.</p>
            </div>
            
            <div className="bg-paper p-6 border border-border card-hover">
              <div className="h-10 w-10 bg-copper-bg flex items-center justify-center mb-4">
                <svg className="h-5 w-5 text-copper" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-ink mb-2 font-serif">Workflow & Approvals</h3>
              <p className="text-sm text-slate">Manage centralized quotations, structured approvals, and corporate purchasing workflows.</p>
            </div>

            <div className="bg-paper p-6 border border-border card-hover">
              <div className="h-10 w-10 bg-money-bg flex items-center justify-center mb-4">
                <svg className="h-5 w-5 text-money" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-ink mb-2 font-serif">Asset Lifecycle</h3>
              <p className="text-sm text-slate">Track inventory visibility, employee assignments, and asset lifecycle monitoring across teams.</p>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="mt-10 flex items-center justify-center gap-x-6 pt-6">
            <Link
              href="/dashboard/buyer/catalog"
              className="btn-cta text-sm"
            >
              Browse Marketplace
            </Link>
            <Link href="/login" className="text-sm font-medium leading-6 text-ink hover:text-copper transition-colors">
              Log in to portal <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

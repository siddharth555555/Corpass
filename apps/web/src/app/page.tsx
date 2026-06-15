"use client";

import LogoLink from "@/components/ui/LogoLink";
import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-canvas selection:bg-primary-500 selection:text-white">
      {/* Navigation */}
      <nav className="border-b border-border-subtle bg-canvas/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex-shrink-0 flex items-center">
              <LogoLink className="h-20 w-auto object-contain rounded-2xl shadow-sm border border-border-subtle bg-white" priority={true} />
            </div>
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                Sign in
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                Create Account
              </Link>
            </div>
            {/* Mobile Nav Toggle */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-text-secondary">
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
          <div className="md:hidden border-t border-border-subtle bg-canvas px-4 py-4 space-y-4">
            <Link href="/login" className="block text-base font-medium text-text-secondary hover:text-text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
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
          <div className="inline-flex items-center rounded-full border border-accent-100 bg-accent-50 px-3 py-1 text-sm font-medium text-accent-500">
            <span className="flex h-2 w-2 rounded-full bg-accent-500 mr-2"></span>
            Enterprise-grade procurement
          </div>

          {/* Headline */}
          <h1 className="text-5xl tracking-tight text-text-primary sm:text-6xl">
            Everything your business needs, <span className="text-primary-500">managed in one place.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg leading-8 text-text-secondary font-sans">
            A modern B2B corporate procurement and asset management platform. Discover, purchase, bundle, and track your assets with marketplace convenience and operational control.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
            <div className="bg-surface p-6 rounded-xl border border-border-subtle card-hover">
              <div className="h-10 w-10 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-text-primary mb-2 font-sans">Curated Marketplace</h3>
              <p className="text-sm text-text-secondary">Procure office supplies, employee kits, furniture, and bulk orders from verified vendors.</p>
            </div>
            
            <div className="bg-surface p-6 rounded-xl border border-border-subtle card-hover">
              <div className="h-10 w-10 bg-accent-50 rounded-xl flex items-center justify-center mb-4">
                <svg className="h-5 w-5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-text-primary mb-2 font-sans">Workflow & Approvals</h3>
              <p className="text-sm text-text-secondary">Manage centralized quotations, structured approvals, and corporate purchasing workflows.</p>
            </div>

            <div className="bg-surface p-6 rounded-xl border border-border-subtle card-hover">
              <div className="h-10 w-10 bg-highlight-50 rounded-xl flex items-center justify-center mb-4">
                <svg className="h-5 w-5 text-highlight-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-text-primary mb-2 font-sans">Asset Lifecycle</h3>
              <p className="text-sm text-text-secondary">Track inventory visibility, employee assignments, and asset lifecycle monitoring across teams.</p>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="mt-10 flex items-center justify-center gap-x-6 pt-6">
            <Link
              href="/register"
              className="btn-cta text-sm"
            >
              Get started for free
            </Link>
            <Link href="/login" className="text-sm font-medium leading-6 text-text-primary hover:text-primary-500 transition-colors">
              Log in to portal <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

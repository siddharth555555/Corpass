"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useState, useEffect } from "react";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useNotifications } from "@/hooks/useNotifications";

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { unreadMessagesCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) { setUserLoaded(true); return; }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:3001`}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setUser(await res.json());
        }
      } catch (e) {
        console.error("Failed to fetch user", e);
      } finally {
        setUserLoaded(true);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  const navItems = [
    { name: "Overview", href: "/dashboard/seller", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { name: "Product Catalog", href: "/dashboard/seller/catalog", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zm-10 10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
    { name: "Messages", href: "/dashboard/seller/messages", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
    { name: "Orders", href: "/dashboard/seller/orders", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { name: "Stock", href: "/dashboard/seller/stock", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
    { name: "Profile", href: "/dashboard/seller/profile", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { name: "Support", href: "/dashboard/seller/support", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ];

  return (
    <div className="h-screen overflow-hidden bg-paper flex font-sans">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-primary-950/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 cp-sidebar flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex pt-6 px-4 ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex justify-center items-center w-full py-4 relative">
          <Link href="/dashboard/seller" className="block flex items-center">
            <img src="/logo-compact.png" alt="Corpass Logo" style={{ width: '160px' }} className="w-full h-auto object-contain scale-[1.35]" />
          </Link>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate hover:text-ink p-1 absolute right-2 top-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--cp-border)' }}>
          <div className="truncate" style={{ color: 'var(--cp-text)', fontSize: '15px', fontWeight: 600 }}>{userLoaded ? (user?.name || "—") : "Loading..."}</div>
          <div className="truncate" style={{ color: 'var(--cp-text-muted)', fontSize: '13px' }}>Seller</div>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 space-y-1.5 pb-4 mt-4">
            {navItems.filter(item => user?.isVerified || ['Support', 'Profile', 'Product Catalog'].includes(item.name)).map((item) => {
              const isActive = (item.href === '/dashboard/seller') 
                ? pathname === item.href 
                : (pathname === item.href || pathname.startsWith(item.href + '/'));
              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`cp-nav-item ${isActive ? 'cp-nav-item--active' : ''}`}
                >
                  <div className="cp-icon">
                    {item.icon}
                  </div>
                  <span className="flex-1">{item.name}</span>
                  {/* Messages Count Badge Example */}
                  {item.name === "Messages" && unreadMessagesCount > 0 && (
                    <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold text-white bg-danger rounded-full">
                      {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="pb-6 pt-4 border-t mt-auto" style={{ borderColor: 'var(--cp-border)' }}>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 border border-transparent" style={{ color: 'var(--cp-danger)' }}>
            <svg className="flex-shrink-0 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-0">
        <header className="h-[56px] flex items-center justify-between px-4 md:px-6 bg-transparent shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate hover:bg-paper-2 rounded transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <ThemeToggle />
            <NotificationBell href="/dashboard/seller/notifications" />
            <Link href="/dashboard/seller/profile" className="cp-avatar w-9 h-9 transition-all duration-300" style={{ backgroundColor: 'var(--cp-surface)', border: '1px solid var(--cp-border)' }}>
              <svg className="h-4 w-4" style={{ color: 'var(--cp-text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {!userLoaded ? (
            <div className="flex h-full items-center justify-center text-slate">Loading...</div>
          ) : user && !user.isVerified && !['/dashboard/seller/support', '/dashboard/seller/profile', '/dashboard/seller/catalog'].some(p => pathname.startsWith(p)) ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto">
               <div className="bg-paper p-8 border" style={{ borderColor: 'var(--cp-danger)' }}>
                 <div className="w-16 h-16 mx-auto mb-4 bg-danger/10 text-danger flex items-center justify-center rounded-full">
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                   </svg>
                 </div>
                 <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--cp-text)' }}>Account Pending Verification</h2>
                 <p style={{ color: 'var(--cp-text-secondary)' }} className="mb-6 leading-relaxed">Your seller account is currently under review by our administration team. You can only access Support, Profile, and Product Catalog until your account is approved.</p>
                 <div className="flex gap-4 w-full">
                   <Link href="/dashboard/seller/profile" className="cp-btn cp-btn--primary flex-1 justify-center">View Profile</Link>
                   <button onClick={handleLogout} className="cp-btn cp-btn-outline flex-1 justify-center">Sign Out</button>
                 </div>
               </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

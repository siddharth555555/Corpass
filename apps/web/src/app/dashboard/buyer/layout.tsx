"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useState, useEffect } from "react";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useNotifications } from "@/hooks/useNotifications";

export default function BuyerDashboardLayout({ children }: { children: React.ReactNode }) {
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
    { name: "Overview", href: "/dashboard/buyer", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { name: "Marketplace", href: "/dashboard/buyer/catalog", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
    { name: "Messages", href: "/dashboard/buyer/messages", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
    { name: "Orders", href: "/dashboard/buyer/orders", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { name: "Assets", href: "/dashboard/buyer/assets", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
    { name: "Profile", href: "/dashboard/buyer/profile", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { name: "Support", href: "/dashboard/buyer/support", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ];

  return (
    <div className="h-screen overflow-hidden bg-canvas flex font-sans">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 cp-sidebar flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex pt-6 px-4 ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex justify-center items-center w-full py-4 relative">
          <Link href="/dashboard/buyer" className="block flex items-center">
            <img src="/logo-compact.png" alt="Corpass Logo" style={{ width: '160px' }} className="w-full h-auto object-contain scale-[1.35]" />
          </Link>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-muted hover:text-ink p-1 absolute right-2 top-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Workspace Identifier */}
          <div className="px-5 mb-4 mt-6">
            <h2 className="w-full text-lg font-bold text-ink truncate">
              {userLoaded ? (user?.company?.name || "—") : "Loading..."}
            </h2>
          </div>

          <nav className="flex-1 space-y-1 pb-4 px-2">
            {navItems.map((item) => {
              const isActive = (item.href === '/dashboard/buyer') 
                ? pathname === item.href 
                : (pathname === item.href || pathname.startsWith(item.href + '/'));
              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`cp-nav-item ${isActive ? 'cp-nav-item--active' : ''}`}
                >
                  <div className="cp-icon shrink-0">
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
        
        <div className="pb-6 pt-4 border-t border-border mt-auto px-2">
          <Link href="/dashboard/buyer/profile" className="flex items-center gap-3 px-2 py-2 mb-2 rounded-md hover:bg-surface-2 transition-colors">
             <div className="cp-avatar shrink-0">{user?.name?.substring(0, 2).toUpperCase() || "SJ"}</div>
             <div className="min-w-0 flex-1">
               <div className="text-sm font-semibold text-ink truncate">{userLoaded ? (user?.name || "—") : "Loading..."}</div>
               <div className="text-xs text-muted truncate">Buyer</div>
             </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-0">
        <header className="h-[64px] flex items-center px-4 md:px-8 bg-canvas shrink-0 z-20">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 -ml-2 mr-4 text-muted hover:bg-surface-2 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Global Search Removed for now */}

          <div className="flex items-center gap-4 ml-auto">
            <ThemeToggle />
            <NotificationBell href="/dashboard/buyer/notifications" />
            <button onClick={handleLogout} className="text-sm font-medium text-danger hover:text-danger-700 transition-colors">
              Sign Out
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}


"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  HeadphonesIcon,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { NotificationBell } from "./NotificationBell";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Support", href: "/dashboard/support", icon: HeadphonesIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    router.push("/login");
  };

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-paper border-r border-border flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo-compact.png" alt="Corpass" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <NotificationBell href="/dashboard/notifications" />
            <button onClick={() => setMobileOpen(false)} className="md:hidden p-1 text-slate hover:text-ink">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-brand" />
            </div>
            <div>
              <div className="text-sm font-semibold text-ink">Admin Panel</div>
              <div className="text-xs text-slate">Corpass Platform</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded transition-all ${
                  active
                    ? "bg-ink text-paper shadow-sm"
                    : "text-slate hover:bg-paper-2 hover:text-ink"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-paper" : ""}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-danger rounded hover:bg-danger-bg transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-paper border-b border-border flex items-center justify-between px-4 z-30">
        <div className="flex items-center">
          <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 text-slate hover:text-ink">
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-2 text-sm font-semibold text-ink">Corpass Admin</span>
        </div>
        <NotificationBell href="/dashboard/notifications" />
      </header>
    </>
  );
}

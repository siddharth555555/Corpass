"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    if (!session) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="h-screen overflow-hidden bg-canvas flex font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0">
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

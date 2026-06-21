"use client";

import { StatCard } from "@/components/StatCard";
import { formatCurrency, statusColor } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardOverview() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_session");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [statsRes, ordersRes, activityRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:3001`}/admin/stats`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:3001`}/admin/orders`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:3001`}/admin/activity`, { headers })
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (ordersRes.ok) setOrders(await ordersRes.json());
        if (activityRes.ok) setActivity(await activityRes.json());
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) {
    return <div className="p-8 text-center text-slate">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-ink tracking-tight font-semibold">Platform Overview</h2>
        <p className="text-sm text-slate mt-1">Monitor marketplace health and recent activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats?.totalUsers || 0} subtext={`${stats?.activeBuyers || 0} buyers · ${stats?.activeSellers || 0} sellers`} accent className="opacity-0 animate-fade-up" />
        <StatCard label="Total Orders" value={(stats?.totalOrders || 0).toLocaleString("en-IN")} subtext={`${stats?.pendingOrders || 0} pending`} className="opacity-0 animate-fade-up-1" />
        <StatCard label="Platform Revenue" value={formatCurrency(stats?.totalRevenue || 0)} subtext="All-time GMV" className="opacity-0 animate-fade-up-1" />
        <StatCard label="Open Tickets" value={stats?.openTickets || 0} subtext={`${stats?.activeProducts || 0} active products`} className="opacity-0 animate-fade-up-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-0 animate-fade-up-2">
        <div className="bg-paper border border-border rounded overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h3 className="text-sm font-semibold text-ink">Recent Orders</h3>
            <Link href="/dashboard/orders" className="text-xs font-semibold text-brand hover:text-brand-700">
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {orders.slice(0, 4).map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-paper-2 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-ink">{order.product}</p>
                  <p className="text-xs text-slate mt-0.5">
                    {order.orderNumber} · {order.buyer}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink">{formatCurrency(order.amount)}</p>
                  <span className={`status-badge mt-1 ${statusColor(order.status)}`}>{order.status}</span>
                </div>
              </div>
            ))}
            {orders.length === 0 && <div className="px-6 py-4 text-sm text-slate text-center">No orders yet</div>}
          </div>
        </div>

        <div className="bg-paper border border-border rounded overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-ink">Recent Activity</h3>
          </div>
          <div className="divide-y divide-border">
            {activity.map((item) => {
              const d = new Date(item.time);
              const timeString = isNaN(d.getTime()) ? item.time : d.toLocaleString();
              return (
                <div key={item.id} className="px-6 py-4 hover:bg-paper-2 transition-colors">
                  <p className="text-sm font-medium text-ink">{item.action}</p>
                  <p className="text-xs text-slate mt-0.5">{item.detail}</p>
                  <p className="text-xs text-slate mt-1">{timeString}</p>
                </div>
              );
            })}
            {activity.length === 0 && <div className="px-6 py-4 text-sm text-slate text-center">No recent activity</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

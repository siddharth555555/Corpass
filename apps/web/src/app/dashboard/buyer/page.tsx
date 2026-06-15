"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BuyerDashboardOverview() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSpend: 0,
    activeOrders: 0,
    pendingApprovals: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [oRes, iRes] = await Promise.all([
          fetch(`http://${window.location.hostname}:3001/orders`, { headers }),
          fetch(`http://${window.location.hostname}:3001/invoices`, { headers })
        ]);

        let orders = [];
        let invoices = [];
        if (oRes.ok) orders = await oRes.json();
        if (iRes.ok) invoices = await iRes.json();

        const totalSpend = orders.filter((o: any) => o.status !== 'CANCELLED').reduce((acc: number, o: any) => acc + Number(o.totalAmount), 0);
        const activeOrders = orders.filter((o: any) => ['PLACED', 'CONFIRMED', 'SHIPPED'].includes(o.status)).length;
        const pendingApprovals = orders.filter((o: any) => o.status === 'COUNTER_OFFERED').length +
          invoices.filter((i: any) => i.status === 'PENDING' && !i.buyerAcknowledged).length;

        setStats({ totalSpend, activeOrders, pendingApprovals });
        setRecentOrders(orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-text-primary tracking-tight">Overview</h2>
        <p className="text-sm text-text-secondary mt-1">Here's what's happening with your procurement today.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border-subtle rounded-xl py-5 px-6 relative overflow-hidden card-hover opacity-0 animate-fade-up">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="section-label mb-2">Total Spend (YTD)</h3>
              <p className="text-3xl font-semibold text-text-primary font-sans">
                {loading ? "..." : `₹${stats.totalSpend.toLocaleString('en-IN')}`}
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary-500"></div>
        </div>

        <div className="bg-surface border border-border-subtle rounded-xl py-5 px-6 card-hover opacity-0 animate-fade-up-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="section-label mb-2">Active Orders</h3>
              <p className="text-3xl font-semibold text-text-primary font-sans">
                {loading ? "..." : stats.activeOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border-subtle rounded-xl py-5 px-6 card-hover opacity-0 animate-fade-up-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="section-label mb-2">Pending Approvals</h3>
              <p className="text-3xl font-semibold text-text-primary font-sans">
                {loading ? "..." : stats.pendingApprovals}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center">
          <h3 className="text-sm font-semibold text-text-primary font-sans">Recent Procurement Requests</h3>
          <Link href="/dashboard/buyer/orders" className="text-xs font-semibold text-primary-500 hover:text-accent-500 transition-colors">View All</Link>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center"><div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full"></div></div>
        ) : recentOrders.length > 0 ? (
          <div className="divide-y divide-border-subtle">
            {recentOrders.map(order => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-surface-raised transition-colors">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{order.productName}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{order.orderNumber} • {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-text-primary">₹{Number(order.totalAmount).toLocaleString('en-IN')}</p>
                  <p className="text-xs font-semibold text-primary-500 mt-0.5">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="h-10 w-10 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center mb-3">
              <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-text-primary font-sans">No requests found</h3>
            <p className="mt-1 text-sm text-text-secondary max-w-sm mx-auto">
              You haven't made any procurement requests yet. Ready to source products for your company?
            </p>
            <Link href="/dashboard/buyer/catalog" className="mt-4 btn-primary text-sm inline-block">
              Browse Marketplace
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

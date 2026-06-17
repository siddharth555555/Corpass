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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            Overview <span className="text-xl">👋</span>
          </h1>
          <p className="text-sm text-slate mt-1">Here's what's happening with your procurement today.</p>
        </div>
        <div className="hidden sm:block text-sm font-medium text-muted">
          {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="cp-card opacity-0 animate-fade-up">
          <h3 className="cp-stat__label">Total Spend (YTD)</h3>
          <p className="cp-stat__value">
            {loading ? "..." : `₹${stats.totalSpend.toLocaleString('en-IN')}`}
          </p>
        </div>

        <div className="cp-card opacity-0 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <h3 className="cp-stat__label">Active Orders</h3>
          <p className="cp-stat__value">
            {loading ? "..." : stats.activeOrders}
          </p>
        </div>

        <div className="cp-card opacity-0 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <h3 className="cp-stat__label">Pending Approvals</h3>
          <p className="cp-stat__value">
            {loading ? "..." : stats.pendingApprovals}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity Section */}
          <div className="cp-card cp-card--flush">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="cp-card-title !mb-0">Recent Orders</h3>
              <Link href="/dashboard/buyer/orders" className="text-[13px] font-semibold text-brand-600 hover:text-brand-700 transition-colors">View all orders</Link>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center"><div className="animate-spin h-6 w-6 border-2 border-brand-600 border-t-transparent rounded-full"></div></div>
            ) : recentOrders.length > 0 ? (
              <div>
                {recentOrders.map(order => {
                  let badgeClass = "cp-badge--neutral";
                  if (['DELIVERED', 'SHIPPED', 'CONFIRMED', 'PLACED'].includes(order.status)) badgeClass = "cp-badge--success";
                  if (['PENDING', 'COUNTER_OFFERED'].includes(order.status)) badgeClass = "cp-badge--warning";
                  if (['CANCELLED', 'REJECTED'].includes(order.status)) badgeClass = "cp-badge--danger";
                  if (order.status === 'NEW') badgeClass = "cp-badge--info";

                  return (
                    <div key={order.id} className="cp-row justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{order.productName}</p>
                        <p className="text-xs text-muted mt-0.5">{order.orderNumber} • {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right ml-4 flex flex-col items-end gap-1.5">
                        <p className="text-sm font-bold text-ink">₹{Number(order.totalAmount).toLocaleString('en-IN')}</p>
                        <span className={`cp-badge ${badgeClass}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-surface">
                <div className="h-10 w-10 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center mb-3">
                  <svg className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-[15px] font-semibold text-ink">No requests found</h3>
                <p className="mt-1 text-[13px] text-muted max-w-sm mx-auto">
                  You haven't made any procurement requests yet. Ready to source products?
                </p>
                <Link href="/dashboard/buyer/catalog" className="mt-4 cp-btn cp-btn--primary">
                  Browse Marketplace
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="space-y-6">
          <div className="cp-card">
            <h3 className="cp-card-title">Quick Actions</h3>
            <div className="space-y-3 mt-4">
              <Link href="/dashboard/buyer/catalog" className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-surface-2 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
                  <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-ink">New Order</h4>
                  <p className="text-[13px] text-muted mt-0.5">Place a new order</p>
                </div>
              </Link>
              <Link href="/dashboard/buyer/messages" className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-surface-2 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-warning-bg flex items-center justify-center shrink-0 group-hover:bg-warning-bg/80 transition-colors">
                  <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-ink">Create Inquiry</h4>
                  <p className="text-[13px] text-muted mt-0.5">Ask vendor for info</p>
                </div>
              </Link>
              <Link href="/dashboard/buyer/assets" className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-surface-2 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-info-bg flex items-center justify-center shrink-0 group-hover:bg-info-bg/80 transition-colors">
                  <svg className="w-5 h-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-ink">Add New Asset</h4>
                  <p className="text-[13px] text-muted mt-0.5">Track company asset</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

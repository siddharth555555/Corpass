"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SellerDashboardOverview() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    pendingOrders: 0,
    totalSales: 0,
    avgRating: 0,
    reviewCount: 0
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return router.push("/login");

      const [resProducts, resProfile, resOrders, resMe] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:3001`}/products`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:3001`}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:3001`}/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:3001`}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (resProducts.ok) { const pData = await resProducts.json(); setProducts(Array.isArray(pData) ? pData : pData.data || []); }
      if (resProfile.ok) setProfile(await resProfile.json());
      
      let reviewStats = { averageRating: 0, totalReviews: 0 };
      if (resMe.ok) {
        const me = await resMe.json();
        const meData = me.data || me;
        if (meData.id) {
          const resReviews = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:3001`}/reviews/stats/${meData.id}`);
          if (resReviews.ok) { const rData = await resReviews.json(); reviewStats = rData.data || rData; }
        }
      }
      
      if (resOrders.ok) {
        const oResData = await resOrders.json();
        const orders = Array.isArray(oResData) ? oResData : oResData.data || [];
        const pendingOrders = orders.filter((o: any) => o.status === 'PLACED').length;
        const totalSales = orders.filter((o: any) => o.status !== 'CANCELLED').reduce((acc: number, o: any) => acc + Number(o.totalAmount), 0);
        setStats({ pendingOrders, totalSales, avgRating: reviewStats.averageRating, reviewCount: reviewStats.totalReviews });
        setRecentOrders(orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Dashboard Overview</h1>
        <p className="text-sm text-slate mt-1">High-level view of your business performance.</p>
      </div>

      {!profile?.sellerProfile?.deliveryRange && !loading && (
        <div className="rounded bg-copper-bg border border-copper p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-copper shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-copper">Delivery Configuration Required</h3>
              <p className="text-sm text-copper mt-1">Your delivery range is currently unconfigured. Update your profile to appear in local buyer searches.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link href="/dashboard/seller/orders" className="cp-card relative overflow-hidden card-hover opacity-0 animate-fade-up block">
          <h3 className="cp-stat__label mb-2">Pending Orders</h3>
          <p className="cp-stat__value">{loading ? "..." : stats.pendingOrders}</p>
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[var(--cp-brand-600)]"></div>
        </Link>
        <Link href="/dashboard/seller/orders" className="cp-card card-hover opacity-0 animate-fade-up-1 block">
          <h3 className="cp-stat__label mb-2">Total Sales (YTD)</h3>
          <p className="cp-stat__value">{loading ? "..." : `₹${stats.totalSales.toLocaleString('en-IN')}`}</p>
        </Link>
        <Link href="/dashboard/seller/catalog" className="cp-card card-hover opacity-0 animate-fade-up-2 block">
          <h3 className="cp-stat__label mb-2">Active Items</h3>
          <p className="cp-stat__value">{loading ? "..." : products.length}</p>
        </Link>
        <Link href="/dashboard/seller/profile" className="cp-card card-hover opacity-0 animate-fade-up-2 block">
          <h3 className="cp-stat__label mb-2">Review Rating</h3>
          <div className="flex items-end gap-2">
            <p className="cp-stat__value">{loading ? "..." : stats.avgRating}</p>
            <span className="text-[var(--cp-text-muted)] text-[13px] mb-1">({loading ? "..." : stats.reviewCount} reviews)</span>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 opacity-0 animate-fade-up-3">
        {/* Recent Orders */}
        <div className="cp-card cp-card--flush">
          <div className="px-6 py-4 border-b border-[var(--cp-border)] flex justify-between items-center">
            <h3 className="text-[16px] font-[600] text-[var(--cp-text)]">Recent Orders</h3>
            <button onClick={() => router.push("/dashboard/seller/orders")} className="text-[13px] font-semibold text-[var(--cp-brand-600)] transition-colors hover:text-[var(--cp-brand-700)]">View All</button>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center"><div className="animate-spin h-6 w-6 border-2 border-[var(--cp-brand-600)] border-t-transparent rounded-full"></div></div>
          ) : recentOrders.length > 0 ? (
            <div className="divide-y divide-[var(--cp-border)]">
              {recentOrders.map(order => (
                <Link href="/dashboard/seller/orders" key={order.id} className="cp-row justify-between hover:bg-surface-2 transition-colors block">
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <p className="text-[14px] font-[600] text-[var(--cp-text)] truncate max-w-[200px]">{order.productName}</p>
                      <p className="text-[13px] text-[var(--cp-text-muted)] mt-0.5">{order.orderNumber} • {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-[15px] font-[700] text-[var(--cp-text)]">₹{Number(order.totalAmount).toLocaleString('en-IN')}</p>
                      <div className="mt-1 flex justify-end">
                        <span className={`cp-badge ${order.status === 'PLACED' ? 'cp-badge--info' : order.status === 'CONFIRMED' ? 'cp-badge--neutral' : order.status === 'SHIPPED' ? 'cp-badge--info' : order.status === 'DELIVERED' ? 'cp-badge--success' : order.status === 'CANCELLED' ? 'cp-badge--danger' : 'cp-badge--warning'}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="h-10 w-10 rounded-full bg-paper-2 border border-border flex items-center justify-center mb-3">
                <svg className="h-5 w-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-ink font-sans">No orders yet</h3>
              <p className="mt-1 text-sm text-slate max-w-sm mx-auto">
                Once buyers start placing orders from your catalog, they will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Top Active Items */}
        <div className="cp-card cp-card--flush">
          <div className="px-6 py-4 border-b border-[var(--cp-border)] flex justify-between items-center">
            <h3 className="text-[16px] font-[600] text-[var(--cp-text)]">Top Active Items</h3>
            <button onClick={() => router.push("/dashboard/seller/catalog")} className="text-[13px] font-semibold text-[var(--cp-brand-600)] transition-colors hover:text-[var(--cp-brand-700)]">View Catalog</button>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center"><div className="animate-spin h-6 w-6 border-2 border-[var(--cp-brand-600)] border-t-transparent rounded-full"></div></div>
          ) : products.length > 0 ? (
            <div className="divide-y divide-[var(--cp-border)]">
              {products.slice(0, 4).map(product => (
                <Link href="/dashboard/seller/catalog" key={product.id} className="cp-row justify-between hover:bg-surface-2 transition-colors block">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-4">
                      <div className="cp-thumb flex items-center justify-center shrink-0 overflow-hidden">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-5 h-5 text-[var(--cp-text-disabled)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-[14px] font-[600] text-[var(--cp-text)] truncate max-w-[150px] md:max-w-[180px]">{product.name}</p>
                        <p className="text-[13px] text-[var(--cp-text-muted)] mt-0.5">{product.category} • {product.stockQuantity} in stock</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[15px] font-[700] text-[var(--cp-text)]">
                        {product.price ? `₹${Number(product.price).toLocaleString('en-IN')}` : 'Ask Quote'}
                      </p>
                      <p className="text-[11px] uppercase text-[var(--cp-text-muted)] mt-0.5 tracking-wider">Per {product.pricingUnit.toLowerCase()}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="h-10 w-10 rounded-full bg-paper-2 border border-border flex items-center justify-center mb-3">
                <svg className="h-5 w-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zm-10 10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-ink font-sans">No products listed</h3>
              <p className="mt-1 text-sm text-slate max-w-sm mx-auto">
                Add items to your catalog to start selling.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

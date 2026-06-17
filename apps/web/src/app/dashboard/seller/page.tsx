"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
        fetch(`http://${window.location.hostname}:3001/products`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://${window.location.hostname}:3001/auth/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://${window.location.hostname}:3001/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://${window.location.hostname}:3001/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (resProducts.ok) setProducts(await resProducts.json());
      if (resProfile.ok) setProfile(await resProfile.json());
      
      let reviewStats = { averageRating: 0, totalReviews: 0 };
      if (resMe.ok) {
        const me = await resMe.json();
        if (me.id) {
          const resReviews = await fetch(`http://${window.location.hostname}:3001/reviews/stats/${me.id}`);
          if (resReviews.ok) reviewStats = await resReviews.json();
        }
      }
      
      if (resOrders.ok) {
        const orders = await resOrders.json();
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-ink tracking-tight">Dashboard Overview</h2>
          <p className="text-sm text-slate mt-1">High-level view of your business performance.</p>
        </div>
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
        <div className="bg-paper border border-border rounded py-5 px-6 relative overflow-hidden card-hover opacity-0 animate-fade-up">
          <h3 className="section-label mb-2">Pending Orders</h3>
          <p className="text-3xl font-semibold text-ink font-sans">{loading ? "..." : stats.pendingOrders}</p>
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-ink"></div>
        </div>
        <div className="bg-paper border border-border rounded py-5 px-6 card-hover opacity-0 animate-fade-up-1">
          <h3 className="section-label mb-2">Total Sales (YTD)</h3>
          <p className="text-3xl font-semibold text-ink font-sans">{loading ? "..." : `₹${stats.totalSales.toLocaleString('en-IN')}`}</p>
        </div>
        <div className="bg-paper border border-border rounded py-5 px-6 card-hover opacity-0 animate-fade-up-2">
          <h3 className="section-label mb-2">Active Items</h3>
          <p className="text-3xl font-semibold text-ink font-sans">{loading ? "..." : products.length}</p>
        </div>
        <div className="bg-paper border border-border rounded py-5 px-6 card-hover opacity-0 animate-fade-up-2">
          <h3 className="section-label mb-2">Review Rating</h3>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-semibold text-ink font-sans">{loading ? "..." : stats.avgRating}</p>
            <span className="text-sm text-slate mb-1">({loading ? "..." : stats.reviewCount} reviews)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 opacity-0 animate-fade-up-3">
        {/* Recent Orders */}
        <div className="bg-paper border border-border rounded overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h3 className="text-sm font-semibold text-ink font-sans">Recent Orders</h3>
            <button onClick={() => router.push("/dashboard/seller/orders")} className="text-xs font-semibold text-ink hover:text-copper transition-colors">View All</button>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center"><div className="animate-spin h-6 w-6 border-2 border-ink border-t-transparent rounded-full"></div></div>
          ) : recentOrders.length > 0 ? (
            <div className="divide-y divide-border">
              {recentOrders.map(order => (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-paper-2 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-ink truncate max-w-[200px]">{order.productName}</p>
                    <p className="text-xs text-slate mt-0.5">{order.orderNumber} • {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-ink">₹{Number(order.totalAmount).toLocaleString('en-IN')}</p>
                    <p className="text-xs font-semibold text-money mt-0.5">{order.status}</p>
                  </div>
                </div>
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
        <div className="bg-paper border border-border rounded overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h3 className="text-sm font-semibold text-ink font-sans">Top Active Items</h3>
            <button onClick={() => router.push("/dashboard/seller/catalog")} className="text-xs font-semibold text-ink hover:text-copper transition-colors">View Catalog</button>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center"><div className="animate-spin h-6 w-6 border-2 border-ink border-t-transparent rounded-full"></div></div>
          ) : products.length > 0 ? (
            <div className="divide-y divide-border">
              {products.slice(0, 4).map(product => (
                <div key={product.id} className="px-6 py-4 flex items-center justify-between hover:bg-paper-2 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded border border-border flex items-center justify-center shrink-0 overflow-hidden bg-paper">
                      {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-5 h-5 text-slate" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink truncate max-w-[150px] md:max-w-[180px]">{product.name}</p>
                      <p className="text-xs text-slate mt-0.5">{product.category} • {product.stockQuantity} in stock</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-ink">
                      {product.price ? `₹${Number(product.price).toLocaleString('en-IN')}` : 'Ask Quote'}
                    </p>
                    <p className="text-[10px] uppercase font-semibold text-slate mt-0.5 tracking-wider">Per {product.pricingUnit.toLowerCase()}</p>
                  </div>
                </div>
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

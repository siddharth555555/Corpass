"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PLACED: { label: "New Order", color: "text-amber-700", bg: "bg-amber-50" },
  COUNTER_OFFERED: { label: "Counter Sent", color: "text-orange-700", bg: "bg-orange-50" },
  CONFIRMED: { label: "Confirmed", color: "text-primary-500", bg: "bg-primary-50" },
  SHIPPED: { label: "Shipped", color: "text-violet-700", bg: "bg-violet-50" },
  DELIVERED: { label: "Delivered", color: "text-emerald-700", bg: "bg-emerald-50" },
  CANCELLED: { label: "Cancelled", color: "text-red-700", bg: "bg-red-50" },
};

const INV_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50" },
  ACKNOWLEDGED: { label: "Acknowledged", color: "text-emerald-700", bg: "bg-emerald-50" },
  DISPUTED: { label: "Disputed", color: "text-red-700", bg: "bg-red-50" },
};

const UOM: Record<string, string> = {
  PIECE: "Piece", PAIR: "Pair", SET: "Set", DOZEN: "Dozen", PACK: "Pack", BUNDLE: "Bundle",
  BOX: "Box", CARTON: "Carton", CASE: "Case", GRAM: "g", KILOGRAM: "Kg", QUINTAL: "Quintal",
  TONNE: "Tonne", MILLILITRE: "ml", LITRE: "L", METRE: "m", FOOT: "ft", ROLL: "Roll",
  SQ_FOOT: "sq.ft", SQ_METRE: "sq.m", HOUR: "Hour", DAY: "Day", MONTH: "Month",
  YEAR: "Year", PROJECT: "Project",
};

export default function SellerOrdersPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"orders" | "invoices">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Filters
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "highest_amount" | "lowest_amount">("newest");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Counter Offer Modal
  const [counterOrder, setCounterOrder] = useState<any>(null);
  const [counterForm, setCounterForm] = useState({ counterPrice: "", counterQuantity: "", counterNote: "" });

  // Manual Invoice Modal
  const [showInvModal, setShowInvModal] = useState(false);
  const [invForm, setInvForm] = useState({ buyerId: "", productName: "", unitPrice: "", quantity: "1", pricingUnit: "PIECE", notes: "" });
  const [buyers, setBuyers] = useState<any[]>([]);

  // Review Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const token = () => localStorage.getItem("access_token");
  const api = (path: string, opts?: any) => fetch(`http://${window.location.hostname}:3001${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [oRes, iRes] = await Promise.all([api("/orders"), api("/invoices")]);
      if (oRes.ok) setOrders(await oRes.json());
      if (iRes.ok) setInvoices(await iRes.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const orderAction = async (orderId: number, action: string, body?: any) => {
    setActionLoading(orderId);
    try {
      await api(`/orders/${orderId}/${action}`, { method: "PATCH", body: body ? JSON.stringify(body) : undefined });
      setCounterOrder(null);
      fetchData();
    } catch (e) { console.error(e); } finally { setActionLoading(null); }
  };

  const invoiceAction = async (invoiceId: number, action: string) => {
    setActionLoading(invoiceId);
    try {
      await api(`/invoices/${invoiceId}/${action}`, { method: "PATCH" });
      fetchData();
    } catch (e) { console.error(e); } finally { setActionLoading(null); }
  };

  const handleCreateInvoice = async (e: any) => {
    e.preventDefault();
    try {
      await api("/invoices", { method: "POST", body: JSON.stringify(invForm) });
      setShowInvModal(false);
      setInvForm({ buyerId: "", productName: "", unitPrice: "", quantity: "1", pricingUnit: "PIECE", notes: "" });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleReviewSubmit = async (e: any) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      const res = await api('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          orderId: reviewOrder.id,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });
      if (res.ok) {
        setShowReviewModal(false);
        setReviewOrder(null);
        alert('Review submitted successfully!');
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to submit review');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const openCounter = (o: any) => {
    setCounterOrder(o);
    setCounterForm({ counterPrice: o.unitPrice.toString(), counterQuantity: o.quantity.toString(), counterNote: "" });
  };

  const submitCounter = (e: any) => {
    e.preventDefault();
    if (counterOrder) orderAction(counterOrder.id, 'counter', counterForm);
  };

  // Extract unique buyers from orders for manual invoice
  const fetchBuyers = () => {
    const map = new Map();
    orders.forEach((o: any) => {
      if (o.buyer && !map.has(o.buyerId)) map.set(o.buyerId, { id: o.buyerId, name: o.buyer.company?.name || o.buyer.name });
    });
    setBuyers(Array.from(map.values()));
  };

  const processedOrders = orders
    .filter(o => {
      if (!dateRange.start && !dateRange.end) return true;
      const d = new Date(o.createdAt);
      const start = dateRange.start ? new Date(dateRange.start) : null;
      const end = dateRange.end ? new Date(dateRange.end) : null;
      if (start && end) end.setHours(23, 59, 59, 999);
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortOrder === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortOrder === "highest_amount") return Number(b.totalAmount) - Number(a.totalAmount);
      if (sortOrder === "lowest_amount") return Number(a.totalAmount) - Number(b.totalAmount);
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Orders & Invoices</h2>
          <p className="text-sm text-text-secondary mt-0.5">Manage incoming orders and generate invoices.</p>
        </div>
        {tab === "invoices" && (
          <button onClick={() => { setShowInvModal(true); fetchBuyers(); }}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Create Invoice
          </button>
        )}
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-1 bg-surface-raised rounded-xl p-1 w-fit">
          <button onClick={() => setTab("orders")} className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all ${tab === "orders" ? "bg-surface text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}>
            Orders {orders.length > 0 && <span className="ml-1.5 text-xs bg-surface-raised text-text-secondary px-1.5 py-0.5 rounded-full">{orders.length}</span>}
          </button>
          <button onClick={() => setTab("invoices")} className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all ${tab === "invoices" ? "bg-surface text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}>
            Invoices {invoices.length > 0 && <span className="ml-1.5 text-xs bg-surface-raised text-text-secondary px-1.5 py-0.5 rounded-full">{invoices.length}</span>}
          </button>
        </div>

        {tab === "orders" && (
          <div className="flex gap-3 items-center">
            <div className="flex gap-2 items-center bg-surface border border-border-subtle rounded-xl px-3 py-1.5 shadow-sm">
              <span className="text-xs font-semibold text-text-secondary">From</span>
              <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="text-xs text-text-primary outline-none" />
              <span className="text-xs font-semibold text-text-secondary ml-1">To</span>
              <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="text-xs text-text-primary outline-none" />
            </div>
            <select value={sortOrder} onChange={e => setSortOrder(e.target.value as any)} className="bg-surface border border-border-subtle rounded-xl px-3 py-1.5 text-xs font-semibold text-text-primary shadow-sm outline-none">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_amount">Highest Amount</option>
              <option value="lowest_amount">Lowest Amount</option>
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-16 flex items-center justify-center bg-surface border border-border-subtle rounded-xl">
          <svg className="animate-spin h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
      ) : tab === "orders" ? (
        processedOrders.length > 0 ? (
          <div className="space-y-3">
            {processedOrders.map(o => {
              const st = STATUS_CONFIG[o.status] || STATUS_CONFIG.PLACED;
              const buyerName = o.buyer?.company?.name || o.buyer?.name || '--';
              return (
                <div key={o.id} className="bg-surface border border-border-subtle rounded-xl p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-text-tertiary font-mono">{o.orderNumber}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${st.color} ${st.bg}`}>{st.label}</span>
                      </div>
                      <h3 className="text-sm font-bold text-text-primary">{o.productName}</h3>
                      <p className="text-xs text-text-secondary mt-0.5">Buyer: <b className="text-text-secondary">{buyerName}</b> • {o.buyer?.city}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-extrabold text-text-primary">₹{Number(o.totalAmount).toLocaleString('en-IN')}</p>
                      <p className="text-[11px] text-text-tertiary">{o.quantity} × ₹{Number(o.unitPrice).toLocaleString('en-IN')} / {UOM[o.pricingUnit] || o.pricingUnit}</p>
                    </div>
                  </div>

                  {o.buyerNote && (
                    <div className="p-2.5 bg-surface-raised border border-border-subtle rounded-xl mb-3 text-xs text-text-secondary">
                      <b className="text-text-primary">Buyer Note:</b> {o.buyerNote}
                    </div>
                  )}

                  {o.status === 'COUNTER_OFFERED' && (
                    <div className="p-2.5 bg-orange-50 border border-orange-100 rounded-xl mb-3 text-xs text-orange-700">
                      <b>Your counter-offer:</b> ₹{Number(o.counterPrice).toLocaleString('en-IN')} / {UOM[o.pricingUnit] || o.pricingUnit}
                      {o.counterNote && <span> — "{o.counterNote}"</span>}
                      <span className="block mt-0.5 text-orange-500">Waiting for buyer response...</span>
                    </div>
                  )}

                  {/* Reviews Display */}
                  {o.reviews?.length > 0 && (
                    <div className="flex flex-col gap-2 mb-3 mt-1">
                      {o.reviews.map((r: any) => (
                        <div key={r.id} className="p-2.5 bg-surface-raised border border-border-subtle rounded-xl text-xs">
                          <p className="font-semibold text-text-primary mb-1 flex items-center gap-1">
                            {r.reviewerRole === 'SELLER' ? 'Your Review' : 'Buyer\'s Review'}
                            <span className="text-amber-500 flex ml-1">
                              {Array.from({length: r.rating}).map((_, i) => <svg key={i} className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                            </span>
                          </p>
                          {r.comment && <p className="text-text-secondary">"{r.comment}"</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-subtle">
                    <span className="text-[11px] text-text-tertiary mr-auto">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>

                    {o.status === 'PLACED' && (
                      <>
                        <button disabled={actionLoading === o.id} onClick={() => orderAction(o.id, 'confirm')} className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50">Confirm</button>
                        <button onClick={() => router.push(`/dashboard/seller/messages?threadId=order-${o.id}`)} className="px-3 py-1.5 text-xs font-semibold bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-xl transition-colors">Negotiate / View Messages</button>
                        <button disabled={actionLoading === o.id} onClick={() => orderAction(o.id, 'cancel')} className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50">Reject</button>
                      </>
                    )}
                    {o.status === 'COUNTER_OFFERED' && (
                      <button onClick={() => router.push(`/dashboard/seller/messages?threadId=order-${o.id}`)} className="px-3 py-1.5 text-xs font-semibold bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-xl transition-colors">View Offer / Messages</button>
                    )}
                    {o.status === 'CONFIRMED' && (
                      <button disabled={actionLoading === o.id} onClick={() => orderAction(o.id, 'ship')} className="px-3 py-1.5 text-xs font-semibold bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50">Mark Shipped</button>
                    )}
                    {o.status === 'SHIPPED' && (
                      <button disabled={actionLoading === o.id} onClick={() => orderAction(o.id, 'deliver')} className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50">Mark Delivered</button>
                    )}
                    {o.status === 'DELIVERED' && !o.reviews?.some((r: any) => r.reviewerRole === 'SELLER') && (
                      <button onClick={() => { setReviewOrder(o); setReviewForm({ rating: 5, comment: "" }); setShowReviewModal(true); }} className="px-3 py-1.5 text-xs font-semibold bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-colors">Rate Buyer</button>
                    )}
                    {o.invoice && (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        {o.invoice.invoiceNumber}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center bg-surface border border-border-subtle rounded-xl">
            <div className="h-12 w-12 rounded-full bg-surface-raised flex items-center justify-center mx-auto mb-3">
              <svg className="h-6 w-6 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <h3 className="text-sm font-bold text-text-primary">No orders received yet</h3>
            <p className="text-xs text-text-secondary mt-1">Orders from buyers will appear here.</p>
          </div>
        )
      ) : (
        /* INVOICES TAB */
        invoices.length > 0 ? (
          <div className="space-y-3">
            {invoices.map(inv => {
              const st = INV_STATUS[inv.status] || INV_STATUS.PENDING;
              const buyerName = inv.buyer?.company?.name || inv.buyer?.name || '--';
              return (
                <div key={inv.id} className="bg-surface border border-border-subtle rounded-xl p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-text-tertiary font-mono">{inv.invoiceNumber}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${st.color} ${st.bg}`}>{st.label}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${inv.type === 'AUTO' ? 'bg-primary-50 text-primary-500' : 'bg-surface-raised text-text-secondary'}`}>{inv.type === 'AUTO' ? 'Auto' : 'Manual'}</span>
                      </div>
                      <h3 className="text-sm font-bold text-text-primary">{inv.productName}</h3>
                      <p className="text-xs text-text-secondary mt-0.5">Buyer: <b className="text-text-secondary">{buyerName}</b></p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-extrabold text-text-primary">₹{Number(inv.totalAmount).toLocaleString('en-IN')}</p>
                      <p className="text-[11px] text-text-tertiary">{inv.quantity} × ₹{Number(inv.unitPrice).toLocaleString('en-IN')} / {UOM[inv.pricingUnit] || inv.pricingUnit}</p>
                    </div>
                  </div>

                  {/* Dual Acknowledgement Status */}
                  {inv.status !== 'DISPUTED' && (
                    <div className="flex items-center gap-3 mb-3 p-2.5 bg-surface-raised border border-border-subtle rounded-xl">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center justify-center h-4 w-4 rounded-full text-[9px] ${inv.sellerAcknowledged ? 'bg-emerald-100 text-emerald-600' : 'bg-surface-raised text-text-tertiary'}`}>
                          {inv.sellerAcknowledged ? '✓' : '—'}
                        </span>
                        <span className="text-[11px] text-text-secondary">You</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center justify-center h-4 w-4 rounded-full text-[9px] ${inv.buyerAcknowledged ? 'bg-emerald-100 text-emerald-600' : 'bg-surface-raised text-text-tertiary'}`}>
                          {inv.buyerAcknowledged ? '✓' : '—'}
                        </span>
                        <span className="text-[11px] text-text-secondary">Buyer</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-subtle">
                    <span className="text-[11px] text-text-tertiary mr-auto">{new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    {inv.status === 'PENDING' && !inv.sellerAcknowledged && (
                      <button disabled={actionLoading === inv.id} onClick={() => invoiceAction(inv.id, 'acknowledge')} className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50">Acknowledge</button>
                    )}
                    {inv.status === 'PENDING' && !inv.sellerAcknowledged && (
                      <button disabled={actionLoading === inv.id} onClick={() => invoiceAction(inv.id, 'dispute')} className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50">Dispute</button>
                    )}
                    {inv.status === 'PENDING' && inv.sellerAcknowledged && !inv.buyerAcknowledged && (
                      <span className="text-[11px] text-amber-600 font-medium">Waiting for buyer acknowledgement</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center bg-surface border border-border-subtle rounded-xl">
            <div className="h-12 w-12 rounded-full bg-surface-raised flex items-center justify-center mx-auto mb-3">
              <svg className="h-6 w-6 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-sm font-bold text-text-primary">No invoices yet</h3>
            <p className="text-xs text-text-secondary mt-1">Invoices are auto-generated when orders are delivered, or create one manually.</p>
          </div>
        )
      )}

      {/* Counter Offer Modal */}
      {counterOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setCounterOrder(null)}></div>
          <div className="relative bg-surface rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-text-primary mb-1">Counter Offer</h2>
            <p className="text-xs text-text-secondary mb-4">Order: {counterOrder.orderNumber} — {counterOrder.productName}</p>
            <div className="p-3 bg-surface-raised border border-border-subtle rounded-xl mb-4 text-xs">
              <span className="text-text-secondary">Original: </span>
              <b className="text-text-primary">₹{Number(counterOrder.unitPrice).toLocaleString('en-IN')} × {counterOrder.quantity} = ₹{Number(counterOrder.totalAmount).toLocaleString('en-IN')}</b>
            </div>
            <form onSubmit={submitCounter} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Your Price (₹)</label>
                  <input required type="number" min="0" value={counterForm.counterPrice} onChange={e => setCounterForm({...counterForm, counterPrice: e.target.value})}
                    className="w-full px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-sm focus:border-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Quantity</label>
                  <input required type="number" min="1" value={counterForm.counterQuantity} onChange={e => setCounterForm({...counterForm, counterQuantity: e.target.value})}
                    className="w-full px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-sm focus:border-primary-500 outline-none" />
                </div>
              </div>
              {counterForm.counterPrice && counterForm.counterQuantity && (
                <div className="p-2 bg-orange-50 border border-orange-100 rounded-xl text-xs text-orange-700">
                  New Total: <b>₹{(parseFloat(counterForm.counterPrice) * parseInt(counterForm.counterQuantity)).toLocaleString('en-IN')}</b>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Note to Buyer (optional)</label>
                <textarea value={counterForm.counterNote} onChange={e => setCounterForm({...counterForm, counterNote: e.target.value})} rows={2}
                  className="w-full px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-sm focus:border-primary-500 outline-none resize-none" placeholder="e.g. Bulk discount applied..." />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setCounterOrder(null)} className="px-4 py-2 text-sm font-semibold text-text-secondary bg-surface border border-border-subtle rounded-xl hover:bg-surface-raised">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-600 shadow-sm">Send Counter Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Invoice Modal */}
      {showInvModal && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowInvModal(false)}></div>
          <div className="relative w-full max-w-md bg-surface h-full shadow-2xl flex flex-col">
            <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-text-primary">Create Manual Invoice</h2>
                <p className="text-xs text-text-secondary mt-0.5">For offline / onsite deals</p>
              </div>
              <button onClick={() => setShowInvModal(false)} className="h-8 w-8 rounded-full bg-surface-raised flex items-center justify-center text-text-tertiary hover:text-text-secondary hover:bg-surface-raised transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form id="sinv-form" onSubmit={handleCreateInvoice} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Buyer</label>
                  <select required value={invForm.buyerId} onChange={e => setInvForm({...invForm, buyerId: e.target.value})}
                    className="w-full px-3 py-2.5 bg-surface-raised border border-border-subtle rounded-xl text-sm text-text-primary focus:border-primary-500 outline-none">
                    <option value="">Select buyer...</option>
                    {buyers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  {buyers.length === 0 && <p className="text-[11px] text-text-tertiary mt-1">No buyers found. Buyers appear after they place at least one order.</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Product / Service Name</label>
                  <input required value={invForm.productName} onChange={e => setInvForm({...invForm, productName: e.target.value})} type="text"
                    className="w-full px-3 py-2.5 bg-surface-raised border border-border-subtle rounded-xl text-sm text-text-primary focus:border-primary-500 outline-none" placeholder="Enter product or service name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">Unit Price (₹)</label>
                    <input required value={invForm.unitPrice} onChange={e => setInvForm({...invForm, unitPrice: e.target.value})} type="number" min="0"
                      className="w-full px-3 py-2.5 bg-surface-raised border border-border-subtle rounded-xl text-sm text-text-primary focus:border-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">Quantity</label>
                    <input required value={invForm.quantity} onChange={e => setInvForm({...invForm, quantity: e.target.value})} type="number" min="1"
                      className="w-full px-3 py-2.5 bg-surface-raised border border-border-subtle rounded-xl text-sm text-text-primary focus:border-primary-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Unit</label>
                  <select value={invForm.pricingUnit} onChange={e => setInvForm({...invForm, pricingUnit: e.target.value})}
                    className="w-full px-3 py-2.5 bg-surface-raised border border-border-subtle rounded-xl text-sm text-text-primary focus:border-primary-500 outline-none">
                    {Object.entries(UOM).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                {invForm.unitPrice && invForm.quantity && (
                  <div className="p-3 bg-surface-raised border border-border-subtle rounded-xl">
                    <p className="text-sm text-text-secondary">Total: <b className="text-text-primary text-base">₹{(parseFloat(invForm.unitPrice || '0') * parseInt(invForm.quantity || '1')).toLocaleString('en-IN')}</b></p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Notes (optional)</label>
                  <textarea value={invForm.notes} onChange={e => setInvForm({...invForm, notes: e.target.value})} rows={3}
                    className="w-full px-3 py-2.5 bg-surface-raised border border-border-subtle rounded-xl text-sm text-text-primary focus:border-primary-500 outline-none resize-none" placeholder="Reference number, delivery details..." />
                </div>
              </form>
            </div>
            <div className="p-5 border-t border-border-subtle flex justify-end gap-3 bg-surface-raised/50">
              <button onClick={() => setShowInvModal(false)} className="px-5 py-2.5 text-sm font-semibold text-text-secondary bg-surface border border-border-subtle rounded-xl hover:bg-surface-raised transition-colors">Cancel</button>
              <button type="submit" form="sinv-form" className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-xl hover:bg-primary-600 transition-colors shadow-sm">Create Invoice</button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowReviewModal(false)}></div>
          <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-text-primary mb-1">Rate Buyer</h2>
            <p className="text-xs text-text-secondary mb-4">{reviewOrder.buyer?.company?.name || reviewOrder.buyer?.name || 'Buyer'}</p>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(star => (
                    <button type="button" key={star} onClick={() => setReviewForm({...reviewForm, rating: star})}
                      className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${reviewForm.rating >= star ? 'bg-amber-100 text-amber-500' : 'bg-surface-raised text-text-tertiary hover:bg-surface-raised'}`}>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Comment (Optional)</label>
                <textarea value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} rows={3}
                  className="w-full px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-sm outline-none resize-none" placeholder="Share your experience with this buyer..." />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowReviewModal(false)} className="btn-outline text-sm py-2">Cancel</button>
                <button type="submit" disabled={reviewSubmitting} className="btn-primary text-sm py-2 disabled:opacity-50">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PLACED: { label: "New Order", color: "text-amber-700", bg: "bg-amber-50" },
  COUNTER_OFFERED: { label: "Negotiating", color: "text-orange-700", bg: "bg-orange-50" },
  CONFIRMED: { label: "Confirmed", color: "text-ink", bg: "bg-paper-2" },
  SHIPPED: { label: "Shipped", color: "text-violet-700", bg: "bg-violet-50" },
  DELIVERED: { label: "Delivered", color: "text-money", bg: "bg-paper-2 border border-money text-money" },
  CANCELLED: { label: "Cancelled", color: "text-red-700", bg: "bg-red-50" },
};

const INV_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50" },
  ACKNOWLEDGED: { label: "Acknowledged", color: "text-money", bg: "bg-paper-2 border border-money text-money" },
  DISPUTED: { label: "Disputed", color: "text-red-700", bg: "bg-red-50" },
};

const PAY_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING_ACKNOWLEDGEMENT: { label: "Pending Ack", color: "text-amber-700", bg: "bg-amber-50" },
  ACKNOWLEDGED: { label: "Acknowledged", color: "text-money", bg: "bg-money/10" },
  DISPUTED: { label: "Disputed", color: "text-red-700", bg: "bg-red-50" },
};

const UOM: Record<string, string> = {
  PIECE: "Piece", PAIR: "Pair", SET: "Set", DOZEN: "Dozen", PACK: "Pack", BUNDLE: "Bundle",
  BOX: "Box", CARTON: "Carton", CASE: "Case", GRAM: "g", KILOGRAM: "Kg", QUINTAL: "Quintal",
  TONNE: "Tonne", MILLILITRE: "ml", LITRE: "L", METRE: "m", FOOT: "ft", ROLL: "Roll",
  SQ_FOOT: "sq.ft", SQ_METRE: "sq.m", HOUR: "Hour", DAY: "Day", MONTH: "Month",
  YEAR: "Year", PROJECT: "Project",
};

export default function BuyerOrdersPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"orders" | "invoices">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Split view state
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [detailTab, setDetailTab] = useState<"overview" | "journey" | "payments" | "reviews">("overview");

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "highest_amount" | "lowest_amount">("newest");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Manual Invoice Modal
  const [showInvModal, setShowInvModal] = useState(false);
  const [invForm, setInvForm] = useState({ sellerProfileId: "", productName: "", unitPrice: "", quantity: "1", pricingUnit: "PIECE", notes: "" });
  const [sellers, setSellers] = useState<any[]>([]);

  // Review Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Payment Form
  const [paymentForm, setPaymentForm] = useState({ amount: "", paymentDate: new Date().toISOString().slice(0,10), utr: "" });

  const token = () => localStorage.getItem("access_token");
  const api = (path: string, opts?: any) => fetch(`http://${window.location.hostname}:3001${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [oRes, iRes] = await Promise.all([api("/orders"), api("/invoices")]);
      if (oRes.ok) {
        const oData = await oRes.json();
        setOrders(oData);
        if (selectedOrder) {
          const updated = oData.find((o: any) => o.id === selectedOrder.id);
          if (updated) setSelectedOrder(updated);
        }
      }
      if (iRes.ok) {
        const iData = await iRes.json();
        setInvoices(iData);
        if (selectedInvoice) {
          const updatedInv = iData.find((i: any) => i.id === selectedInvoice.id);
          if (updatedInv) setSelectedInvoice(updatedInv);
        }
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchSellers = async () => {
    try {
      const res = await api("/products/marketplace");
      if (res.ok) {
        const products = await res.json();
        const map = new Map();
        products.forEach((p: any) => {
          const sp = p.sellerProfile;
          if (sp && !map.has(sp.id)) map.set(sp.id, { id: sp.id, name: sp.user?.company?.name || sp.user?.name || 'Supplier' });
        });
        setSellers(Array.from(map.values()));
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, []);

  const orderAction = async (orderId: number, action: string) => {
    setActionLoading(orderId);
    try {
      await api(`/orders/${orderId}/${action}`, { method: "PATCH" });
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
      setInvForm({ sellerProfileId: "", productName: "", unitPrice: "", quantity: "1", pricingUnit: "PIECE", notes: "" });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleReviewSubmit = async (e: any) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      const res = await api('/reviews', { method: 'POST', body: JSON.stringify({ orderId: reviewOrder.id, rating: reviewForm.rating, comment: reviewForm.comment }) });
      if (res.ok) { setShowReviewModal(false); setReviewOrder(null); alert('Review submitted successfully!'); fetchData(); }
      else { const err = await res.json(); alert(err.message || 'Failed to submit review'); }
    } catch (e) { console.error(e); } finally { setReviewSubmitting(false); }
  };

  const handleRecordPayment = async (e: any) => {
    e.preventDefault();
    if (selectedOrder) {
      setActionLoading(selectedOrder.id);
      try {
        const res = await api(`/orders/${selectedOrder.id}/payments`, { method: "POST", body: JSON.stringify(paymentForm) });
        if (res.ok) {
          setPaymentForm({ amount: "", paymentDate: new Date().toISOString().slice(0,10), utr: "" });
          fetchData();
        } else {
          const err = await res.json(); alert(err.message || 'Failed to record payment');
        }
      } catch (e) { console.error(e); } finally { setActionLoading(null); }
    } else if (selectedInvoice) {
      setActionLoading(selectedInvoice.id);
      try {
        const res = await api(`/invoices/${selectedInvoice.id}/payments`, { method: "POST", body: JSON.stringify(paymentForm) });
        if (res.ok) {
          setPaymentForm({ amount: "", paymentDate: new Date().toISOString().slice(0,10), utr: "" });
          fetchData();
        } else {
          const err = await res.json(); alert(err.message || 'Failed to record payment');
        }
      } catch (e) { console.error(e); } finally { setActionLoading(null); }
    }
  };

  const processedOrders = orders
    .filter(o => statusFilter === "ALL" || o.status === statusFilter)
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

  // Calculate stats for tabs
  const stats = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    acc.ALL = (acc.ALL || 0) + 1;
    return acc;
  }, { ALL: 0 } as Record<string, number>);

  return (
    <div className="flex h-full gap-4 relative max-w-7xl mx-auto pb-10">
      {/* LEFT PANE: Orders List */}
      <div className={`flex flex-col h-[calc(100vh-100px)] overflow-y-auto pr-2 pb-10 space-y-4 ${selectedOrder || selectedInvoice ? 'w-[55%] hidden md:flex' : 'w-full'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-ink tracking-tight">Orders</h2>
            <p className="text-sm text-slate mt-0.5">Track your purchases and manage invoices.</p>
          </div>
          {tab === "invoices" && (
            <button onClick={() => { setShowInvModal(true); fetchSellers(); }} className="bg-ink hover:bg-ink text-white px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Create Invoice
            </button>
          )}
        </div>

        <div className="flex gap-2 bg-paper-2 rounded-lg p-1 w-fit shadow-inner">
          <button onClick={() => setTab("orders")} className={`px-5 py-2 text-sm font-bold rounded-md transition-all duration-300 ease-out transform ${tab === "orders" ? "bg-white text-ink shadow-sm scale-105" : "text-slate hover:bg-slate-200/50 hover:text-ink active:scale-95"}`}>Orders</button>
          <button onClick={() => setTab("invoices")} className={`px-5 py-2 text-sm font-bold rounded-md transition-all duration-300 ease-out transform flex items-center ${tab === "invoices" ? "bg-white text-ink shadow-sm scale-105" : "text-slate hover:bg-slate-200/50 hover:text-ink active:scale-95"}`}>
            Invoices {invoices.length > 0 && <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{invoices.length}</span>}
          </button>
        </div>

        {tab === "orders" && (
          <div className="bg-surface border border-border rounded-lg overflow-hidden flex flex-col h-[calc(100vh-220px)] shadow-sm">
            {/* Filters Header */}
            <div className="p-3 border-b border-border bg-paper flex flex-wrap gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {['ALL', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${statusFilter === s ? 'bg-ink text-white' : 'bg-paper-2 text-slate hover:text-ink'}`}>
                    {s === 'ALL' ? 'All' : STATUS_CONFIG[s]?.label || s} <span className="opacity-70 ml-1">{stats[s] || 0}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="px-2 py-1.5 bg-paper-2 border border-border rounded text-xs outline-none text-ink" />
                <select value={sortOrder} onChange={e => setSortOrder(e.target.value as any)} className="px-2 py-1.5 bg-paper-2 border border-border rounded text-xs outline-none text-ink font-semibold">
                  <option value="newest">Newest First</option>
                  <option value="highest_amount">Highest Amt</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto bg-paper-2/30 p-2 space-y-1.5">
              {loading ? (
                <div className="p-8 text-center text-slate text-sm">Loading orders...</div>
              ) : processedOrders.length === 0 ? (
                <div className="p-8 text-center text-slate text-sm">No orders found.</div>
              ) : processedOrders.map(o => {
                const st = STATUS_CONFIG[o.status] || STATUS_CONFIG.PLACED;
                const isSelected = selectedOrder?.id === o.id;
                const supplier = o.sellerProfile?.user?.company?.name || o.sellerProfile?.user?.name || '--';
                return (
                  <button key={o.id} onClick={() => { setSelectedOrder(o); setDetailTab("overview"); }} className={`w-full text-left p-3 rounded border transition-all flex items-center justify-between gap-3 ${isSelected ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' : 'bg-surface border-border hover:border-slate-300'}`}>
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${st.color} ${st.bg}`}>{st.label}</span>
                        <span className="text-[11px] font-mono text-slate bg-paper-2 px-1 rounded border border-border">{o.orderNumber}</span>
                        <span className="text-[10px] text-slate ml-auto">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="truncate pr-4">
                          <p className="text-sm font-semibold text-ink truncate">{o.productName}</p>
                          <p className="text-[11px] text-slate truncate">Supplier: <b className="text-ink">{supplier}</b></p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-ink tabular-nums">₹{Number(o.totalAmount).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-slate">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* INVOICES TAB LIST */}
        {tab === "invoices" && (
          <div className="space-y-3">
             {invoices.length > 0 ? invoices.map(inv => {
              const st = INV_STATUS[inv.status] || INV_STATUS.PENDING;
              const supplier = inv.sellerProfile?.user?.company?.name || inv.sellerProfile?.user?.name || '--';
              return (
                <button key={inv.id} onClick={() => setSelectedInvoice(inv)} className={`w-full text-left bg-surface border rounded p-4 transition-all flex flex-col ${selectedInvoice?.id === inv.id ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' : 'border-border hover:border-slate-300'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate font-mono">{inv.invoiceNumber}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${st.color} ${st.bg}`}>{st.label}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${inv.type === 'AUTO' ? 'bg-paper-2 text-ink' : 'bg-paper-2 text-slate'}`}>{inv.type === 'AUTO' ? 'Auto' : 'Manual'}</span>
                      </div>
                      <h3 className="text-sm font-bold text-ink">{inv.productName}</h3>
                      <p className="text-xs text-slate mt-0.5">Supplier: <b className="text-slate">{supplier}</b></p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-extrabold text-ink">₹{Number(inv.totalAmount).toLocaleString('en-IN')}</p>
                      <p className="text-[11px] text-slate">{inv.quantity} × ₹{Number(inv.unitPrice).toLocaleString('en-IN')} / {UOM[inv.pricingUnit] || inv.pricingUnit}</p>
                    </div>
                  </div>
                  {inv.status !== 'DISPUTED' && (
                    <div className="flex items-center gap-3 mb-3 p-2.5 bg-paper-2 border border-border rounded">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center justify-center h-4 w-4 rounded-full text-[9px] ${inv.buyerAcknowledged ? 'bg-emerald-100 text-money' : 'bg-paper-2 text-slate'}`}>{inv.buyerAcknowledged ? '✓' : '—'}</span>
                        <span className="text-[11px] text-slate">You</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center justify-center h-4 w-4 rounded-full text-[9px] ${inv.sellerAcknowledged ? 'bg-emerald-100 text-money' : 'bg-paper-2 text-slate'}`}>{inv.sellerAcknowledged ? '✓' : '—'}</span>
                        <span className="text-[11px] text-slate">Supplier</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <span className="text-[11px] text-slate mr-auto">{new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    {inv.status === 'PENDING' && !inv.buyerAcknowledged && (
                      <>
                        <button disabled={actionLoading === inv.id} onClick={() => invoiceAction(inv.id, 'acknowledge')} className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors">Acknowledge</button>
                        <button disabled={actionLoading === inv.id} onClick={() => invoiceAction(inv.id, 'dispute')} className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors">Dispute</button>
                      </>
                    )}
                  </div>
                </button>
              );
            }) : (
              <div className="py-16 text-center bg-paper border border-border rounded"><p className="text-sm text-slate">No invoices yet</p></div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT PANE: Detail View */}
      {selectedOrder && tab === "orders" && (
        <div className="w-full md:w-[45%] h-[calc(100vh-100px)] sticky top-[80px] bg-surface border border-border rounded-xl shadow-lg flex flex-col overflow-hidden animate-in slide-in-from-right-4">
          {/* Header */}
          <div className="p-5 border-b border-border bg-paper relative">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 h-8 w-8 bg-paper-2 rounded-full flex items-center justify-center text-slate hover:text-ink transition-colors md:hidden">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${STATUS_CONFIG[selectedOrder.status]?.color} ${STATUS_CONFIG[selectedOrder.status]?.bg}`}>{STATUS_CONFIG[selectedOrder.status]?.label}</span>
              <span className="text-xs font-mono text-slate">{selectedOrder.orderNumber}</span>
            </div>
            <h2 className="text-lg font-bold text-ink leading-tight">{selectedOrder.productName}</h2>
            <p className="text-xs text-slate mt-1">Supplier: <b className="text-ink">{selectedOrder.sellerProfile?.user?.company?.name || selectedOrder.sellerProfile?.user?.name}</b></p>
            
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-end">
              <div>
                <p className="text-2xl font-extrabold text-ink tabular-nums leading-none">₹{Number(selectedOrder.totalAmount).toLocaleString('en-IN')}</p>
                <p className="text-[11px] text-slate mt-1">{selectedOrder.quantity} × ₹{Number(selectedOrder.unitPrice).toLocaleString('en-IN')} / {UOM[selectedOrder.pricingUnit] || selectedOrder.pricingUnit}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate">Placed on</p>
                <p className="text-xs font-semibold text-ink">{new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border bg-paper-2/50 px-2">
            {['overview', 'journey', 'payments', 'reviews'].map(t => (
              <button key={t} onClick={() => setDetailTab(t as any)} className={`px-4 py-3 text-xs font-bold capitalize border-b-2 transition-colors ${detailTab === t ? 'border-ink text-ink' : 'border-transparent text-slate hover:text-ink'}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 bg-paper-2/30">
            {detailTab === 'overview' && (
              <div className="space-y-4">
                <div className="bg-surface border border-border rounded p-4">
                  <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-3">Order Details</h4>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-3 gap-2"><span className="text-slate">Product</span><span className="col-span-2 font-medium text-ink">{selectedOrder.productName}</span></div>
                    <div className="grid grid-cols-3 gap-2"><span className="text-slate">Shipping To</span><span className="col-span-2 font-medium text-ink whitespace-pre-wrap leading-snug">{selectedOrder.shippingAddress}</span></div>
                    <div className="grid grid-cols-3 gap-2"><span className="text-slate">Contact Email</span><span className="col-span-2 font-medium text-ink">{selectedOrder.sellerProfile?.user?.email || '--'}</span></div>
                    <div className="grid grid-cols-3 gap-2"><span className="text-slate">Contact Phone</span><span className="col-span-2 font-medium text-ink">{selectedOrder.sellerProfile?.user?.mobile || '--'}</span></div>
                  </div>
                </div>
                {selectedOrder.buyerNote && (
                  <div className="bg-surface border border-border rounded p-4">
                    <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-2">Your Note</h4>
                    <p className="text-sm text-ink italic">"{selectedOrder.buyerNote}"</p>
                  </div>
                )}
                {selectedOrder.invoice && (
                   <div className="bg-surface border border-border rounded p-4 flex items-center justify-between">
                     <div>
                       <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-1">Invoice Attached</h4>
                       <p className="text-sm font-mono text-ink">{selectedOrder.invoice.invoiceNumber}</p>
                     </div>
                     <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${INV_STATUS[selectedOrder.invoice.status]?.bg} ${INV_STATUS[selectedOrder.invoice.status]?.color}`}>{INV_STATUS[selectedOrder.invoice.status]?.label}</span>
                   </div>
                )}
              </div>
            )}

            {detailTab === 'journey' && (
              <div className="py-4">
                <div className="relative">
                  {/* Stepper logic */}
                  {['PLACED', ...(selectedOrder.status === 'COUNTER_OFFERED' ? ['COUNTER_OFFERED'] : []), 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map((step, idx, arr) => {
                    const isCompleted = arr.indexOf(selectedOrder.status) >= idx;
                    const isActive = selectedOrder.status === step;
                    const isCancelled = selectedOrder.status === 'CANCELLED';
                    return (
                      <div key={step} className="flex gap-4 mb-8 relative">
                        {idx !== arr.length - 1 && <div className={`absolute left-3 top-8 bottom-[-24px] w-0.5 ${isCompleted && !isCancelled ? 'bg-indigo-500' : 'bg-border'}`}></div>}
                        <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 border-2 ${isCompleted && !isCancelled ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-paper border-border text-transparent'}`}>
                          {isCompleted && !isCancelled && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <div>
                          <h4 className={`text-sm font-bold ${isActive && !isCancelled ? 'text-indigo-600' : isCompleted && !isCancelled ? 'text-ink' : 'text-slate'}`}>{STATUS_CONFIG[step]?.label || step}</h4>
                          <p className="text-xs text-slate mt-0.5">
                            {idx === 0 ? new Date(selectedOrder.createdAt).toLocaleDateString() : 
                             isActive ? new Date(selectedOrder.updatedAt).toLocaleDateString() : 
                             isCompleted ? '--' : 'Pending'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {selectedOrder.status === 'CANCELLED' && (
                     <div className="flex gap-4 relative">
                       <div className="relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 border-2 bg-red-500 border-red-500 text-white">
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                       </div>
                       <div>
                         <h4 className="text-sm font-bold text-red-600">Cancelled</h4>
                         <p className="text-xs text-slate mt-0.5">{new Date(selectedOrder.updatedAt).toLocaleDateString()}</p>
                       </div>
                     </div>
                  )}
                </div>
              </div>
            )}

            {detailTab === 'payments' && (
              <div className="space-y-4">
                <div className="bg-surface border border-border rounded p-4">
                  <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-3">Payment Summary</h4>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2"><span className="text-slate">Mode</span><span className="font-semibold text-ink text-right">{selectedOrder.paymentMode || 'Not Specified'}</span></div>
                    <div className="grid grid-cols-2 gap-2"><span className="text-slate">Total Amount</span><span className="font-bold text-ink text-right">₹{Number(selectedOrder.totalAmount).toLocaleString('en-IN')}</span></div>
                    {selectedOrder.advanceRequested && (
                      <div className="grid grid-cols-2 gap-2"><span className="text-slate">Advance Requested</span><span className="font-semibold text-orange-600 text-right">₹{Number(selectedOrder.advanceRequested).toLocaleString('en-IN')}</span></div>
                    )}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                      <span className="text-slate font-bold">Total Paid (Ack'd)</span>
                      <span className="font-extrabold text-money text-right">
                        ₹{selectedOrder.payments?.filter((p:any)=>p.status==='ACKNOWLEDGED').reduce((sum:number, p:any)=>sum+Number(p.amount), 0).toLocaleString('en-IN') || '0'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface border border-border rounded p-4">
                  <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-3">Payment History</h4>
                  {selectedOrder.payments?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedOrder.payments.map((p: any) => (
                        <div key={p.id} className="p-2.5 bg-paper-2 rounded border border-border text-sm flex items-center justify-between">
                          <div>
                            <p className="font-bold text-ink">₹{Number(p.amount).toLocaleString('en-IN')}</p>
                            <p className="text-[11px] text-slate">{new Date(p.paymentDate).toLocaleDateString()} {p.utr ? `• UTR: ${p.utr}` : ''}</p>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${PAY_STATUS_CONFIG[p.status]?.bg} ${PAY_STATUS_CONFIG[p.status]?.color}`}>{PAY_STATUS_CONFIG[p.status]?.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate italic">No payments recorded yet.</p>
                  )}
                </div>

                {/* Record Payment Form */}
                {['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(selectedOrder.status) && (
                  <form onSubmit={handleRecordPayment} className="bg-surface border border-border rounded p-4">
                    <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-3">Record Payment Sent</h4>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate mb-1">Amount (₹)</label>
                        <input required type="number" min="1" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} className="w-full px-2 py-1.5 bg-paper-2 border border-border rounded text-sm outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate mb-1">Date Sent</label>
                        <input required type="date" value={paymentForm.paymentDate} onChange={e => setPaymentForm({...paymentForm, paymentDate: e.target.value})} className="w-full px-2 py-1.5 bg-paper-2 border border-border rounded text-sm outline-none" />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-[11px] font-semibold text-slate mb-1">UTR / Ref Number (Optional)</label>
                      <input type="text" value={paymentForm.utr} onChange={e => setPaymentForm({...paymentForm, utr: e.target.value})} className="w-full px-2 py-1.5 bg-paper-2 border border-border rounded text-sm outline-none" placeholder="e.g. 1234567890" />
                    </div>
                    <button type="submit" disabled={actionLoading === selectedOrder.id} className="w-full py-2 bg-ink text-white rounded text-sm font-semibold hover:bg-ink/90 disabled:opacity-50">Submit Record</button>
                  </form>
                )}
              </div>
            )}

            {detailTab === 'reviews' && (
              <div className="space-y-3">
                {selectedOrder.reviews?.length > 0 ? selectedOrder.reviews.map((r: any) => (
                  <div key={r.id} className="bg-surface border border-border rounded p-4 text-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-ink">{r.reviewerRole === 'BUYER' ? 'Your Review' : "Supplier's Review"}</span>
                      <span className="text-amber-500 flex">{Array.from({length: r.rating}).map((_, i) => <svg key={i} className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}</span>
                    </div>
                    {r.comment && <p className="text-slate mt-1">"{r.comment}"</p>}
                  </div>
                )) : (
                  <div className="text-center py-8 text-slate text-sm">No reviews yet.</div>
                )}
                {selectedOrder.status === 'DELIVERED' && !selectedOrder.reviews?.some((r: any) => r.reviewerRole === 'BUYER') && (
                  <button onClick={() => { setReviewOrder(selectedOrder); setShowReviewModal(true); }} className="w-full py-2 bg-paper-2 text-ink border border-border rounded text-sm font-semibold hover:bg-slate-50 transition-colors">Write a Review</button>
                )}
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="p-4 border-t border-border bg-paper flex items-center justify-end gap-2 shrink-0">
            {selectedOrder.status === 'PLACED' && (
              <button disabled={actionLoading === selectedOrder.id} onClick={() => orderAction(selectedOrder.id, 'cancel')} className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors mr-auto">Cancel Order</button>
            )}
            {selectedOrder.status === 'COUNTER_OFFERED' && (
              <button onClick={() => router.push(`/dashboard/buyer/messages?threadId=order-${selectedOrder.id}`)} className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded transition-colors">Review Counter Offer</button>
            )}
            {selectedOrder.status !== 'COUNTER_OFFERED' && (
              <button onClick={() => router.push(`/dashboard/buyer/messages?threadId=order-${selectedOrder.id}`)} className="px-4 py-2 text-sm font-semibold bg-paper-2 hover:bg-slate-100 text-ink border border-border rounded transition-colors">Message Supplier</button>
            )}
          </div>
        </div>
      )}

      {/* RIGHT PANE: Invoice Detail View */}
      {selectedInvoice && tab === "invoices" && (
        <div className="w-full md:w-[45%] h-[calc(100vh-100px)] sticky top-[80px] bg-surface border border-border rounded-xl shadow-lg flex flex-col overflow-hidden animate-in slide-in-from-right-4">
          {/* Header */}
          <div className="p-5 border-b border-border bg-paper relative">
            <button onClick={() => setSelectedInvoice(null)} className="absolute top-4 right-4 h-8 w-8 bg-paper-2 rounded-full flex items-center justify-center text-slate hover:text-ink transition-colors md:hidden">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${INV_STATUS[selectedInvoice.status]?.color} ${INV_STATUS[selectedInvoice.status]?.bg}`}>{INV_STATUS[selectedInvoice.status]?.label}</span>
              <span className="text-xs font-mono text-slate">{selectedInvoice.invoiceNumber}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${selectedInvoice.type === 'AUTO' ? 'bg-paper-2 text-ink' : 'bg-paper-2 text-slate'}`}>{selectedInvoice.type === 'AUTO' ? 'Auto' : 'Manual'}</span>
            </div>
            <h2 className="text-lg font-bold text-ink leading-tight">{selectedInvoice.productName}</h2>
            <p className="text-xs text-slate mt-1">Supplier: <b className="text-ink">{selectedInvoice.sellerProfile?.user?.company?.name || selectedInvoice.sellerProfile?.user?.name}</b></p>
            
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-end">
              <div>
                <p className="text-2xl font-extrabold text-ink tabular-nums leading-none">₹{Number(selectedInvoice.totalAmount).toLocaleString('en-IN')}</p>
                <p className="text-[11px] text-slate mt-1">{selectedInvoice.quantity} × ₹{Number(selectedInvoice.unitPrice).toLocaleString('en-IN')} / {UOM[selectedInvoice.pricingUnit] || selectedInvoice.pricingUnit}</p>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 bg-paper-2/30 space-y-4">
            <div className="bg-surface border border-border rounded p-4">
              <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-3">Payment Summary</h4>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  <span className="text-slate font-bold">Total Paid (Ack'd)</span>
                  <span className="font-extrabold text-money text-right">
                    ₹{((selectedInvoice.order?.payments || selectedInvoice.payments || []).filter((p:any)=>p.status==='ACKNOWLEDGED').reduce((sum:number, p:any)=>sum+Number(p.amount), 0)).toLocaleString('en-IN') || '0'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded p-4">
              <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-3">Payment History</h4>
              {(selectedInvoice.order?.payments || selectedInvoice.payments || []).length > 0 ? (
                <div className="space-y-2">
                  {(selectedInvoice.order?.payments || selectedInvoice.payments || []).map((p: any) => (
                    <div key={p.id} className="p-2.5 bg-paper-2 rounded border border-border text-sm flex items-center justify-between">
                      <div>
                        <p className="font-bold text-ink">₹{Number(p.amount).toLocaleString('en-IN')}</p>
                        <p className="text-[11px] text-slate">{new Date(p.paymentDate).toLocaleDateString()} {p.utr ? `• UTR: ${p.utr}` : ''}</p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${PAY_STATUS_CONFIG[p.status]?.bg} ${PAY_STATUS_CONFIG[p.status]?.color}`}>{PAY_STATUS_CONFIG[p.status]?.label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate italic">No payments recorded yet.</p>
              )}
            </div>

            {/* Record Payment Form for Manual Invoices */}
            {selectedInvoice.type === 'MANUAL' && (
              <form onSubmit={handleRecordPayment} className="bg-surface border border-border rounded p-4">
                <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-3">Record Payment Sent</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate mb-1">Amount (₹)</label>
                    <input required type="number" min="1" max={selectedInvoice.totalAmount} value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} className="w-full px-2 py-1.5 bg-paper-2 border border-border rounded text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate mb-1">Date Sent</label>
                    <input required type="date" value={paymentForm.paymentDate} onChange={e => setPaymentForm({...paymentForm, paymentDate: e.target.value})} className="w-full px-2 py-1.5 bg-paper-2 border border-border rounded text-sm outline-none" />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-[11px] font-semibold text-slate mb-1">UTR / Ref Number (Optional)</label>
                  <input type="text" value={paymentForm.utr} onChange={e => setPaymentForm({...paymentForm, utr: e.target.value})} className="w-full px-2 py-1.5 bg-paper-2 border border-border rounded text-sm outline-none" placeholder="e.g. 1234567890" />
                </div>
                <button type="submit" disabled={actionLoading === selectedInvoice.id} className="w-full py-2 bg-ink text-white rounded text-sm font-semibold hover:bg-ink/90 disabled:opacity-50 transition-colors">Submit Record</button>
              </form>
            )}

            {selectedInvoice.type === 'AUTO' && selectedInvoice.order && (
              <div className="bg-indigo-50 border border-indigo-200 rounded p-4 text-center">
                <p className="text-sm text-indigo-800 mb-3 font-medium">This invoice was automatically generated from an order.</p>
                <button onClick={() => { setTab("orders"); setSelectedInvoice(null); setSelectedOrder(orders.find(o => o.id === selectedInvoice.orderId)); setDetailTab("payments"); }} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-semibold hover:bg-indigo-700 w-full transition-colors shadow-sm">View Full Order</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Invoice Modal */}
      {showInvModal && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowInvModal(false)}></div>
          <div className="relative w-full max-w-md bg-paper h-full shadow-2xl flex flex-col">
            <div className="px-6 py-5 border-b border-border flex justify-between items-center">
              <div><h2 className="text-lg font-bold text-ink">Create Manual Invoice</h2><p className="text-xs text-slate mt-0.5">For offline / onsite purchases</p></div>
              <button onClick={() => setShowInvModal(false)} className="h-8 w-8 rounded-full bg-paper-2 flex items-center justify-center text-slate hover:text-ink"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form id="inv-form" onSubmit={handleCreateInvoice} className="space-y-5">
                <div><label className="block text-sm font-semibold mb-2">Supplier</label><select required value={invForm.sellerProfileId} onChange={e => setInvForm({...invForm, sellerProfileId: e.target.value})} className="w-full px-3 py-2 bg-paper-2 border border-border rounded text-sm"><option value="">Select supplier...</option>{sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div><label className="block text-sm font-semibold mb-2">Product Name</label><input required value={invForm.productName} onChange={e => setInvForm({...invForm, productName: e.target.value})} className="w-full px-3 py-2 bg-paper-2 border border-border rounded text-sm" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm font-semibold mb-2">Price (₹)</label><input required type="number" min="0" value={invForm.unitPrice} onChange={e => setInvForm({...invForm, unitPrice: e.target.value})} className="w-full px-3 py-2 bg-paper-2 border border-border rounded text-sm" /></div>
                  <div><label className="block text-sm font-semibold mb-2">Quantity</label><input required type="number" min="1" value={invForm.quantity} onChange={e => setInvForm({...invForm, quantity: e.target.value})} className="w-full px-3 py-2 bg-paper-2 border border-border rounded text-sm" /></div>
                </div>
              </form>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-3 bg-paper-2/50">
              <button onClick={() => setShowInvModal(false)} className="px-5 py-2 text-sm font-semibold border rounded">Cancel</button>
              <button type="submit" form="inv-form" className="px-5 py-2 text-sm font-semibold text-white bg-ink rounded">Create Invoice</button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowReviewModal(false)}></div>
          <div className="relative bg-paper rounded shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-1">Rate Supplier</h2>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(star => (
                    <button type="button" key={star} onClick={() => setReviewForm({...reviewForm, rating: star})} className={`h-10 w-10 rounded-full flex items-center justify-center ${reviewForm.rating >= star ? 'bg-amber-100 text-amber-500' : 'bg-paper-2 text-slate'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg></button>
                  ))}
                </div>
              </div>
              <div><label className="block text-sm font-semibold mb-2">Comment</label><textarea value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} rows={3} className="w-full px-3 py-2 bg-paper-2 border border-border rounded text-sm" /></div>
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowReviewModal(false)} className="px-4 py-2 border rounded text-sm">Cancel</button><button type="submit" disabled={reviewSubmitting} className="px-4 py-2 bg-ink text-white rounded text-sm">Submit</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

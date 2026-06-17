"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ConfirmModal";
import { DisputeModal } from "@/components/DisputeModal";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; cpBadge?: string }> = {
  PLACED: { label: "New Order", color: "text-amber-700", bg: "bg-amber-50", cpBadge: "cp-badge--info" },
  COUNTER_OFFERED: { label: "Counter Offer", color: "text-orange-700", bg: "bg-orange-50", cpBadge: "cp-badge--warning" },
  CONFIRMED: { label: "Confirmed", color: "text-ink", bg: "bg-paper-2", cpBadge: "cp-badge--neutral" },
  SHIPPED: { label: "Shipped", color: "text-violet-700", bg: "bg-violet-50", cpBadge: "cp-badge--info" },
  DELIVERED: { label: "Delivered", color: "text-money", bg: "bg-paper-2 border border-money text-money", cpBadge: "cp-badge--success" },
  CANCELLED: { label: "Cancelled", color: "text-red-700", bg: "bg-red-50", cpBadge: "cp-badge--danger" },
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

export default function SellerOrdersPage() {
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

  // Modals
  const [showInvModal, setShowInvModal] = useState(false);
  const [invForm, setInvForm] = useState({ buyerId: "", productName: "", unitPrice: "", quantity: "1", pricingUnit: "PIECE", notes: "" });
  const [buyers, setBuyers] = useState<any[]>([]);

  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterOrder, setCounterOrder] = useState<any>(null);
  const [counterForm, setCounterForm] = useState({ price: "", quantity: "", note: "" });

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  // Advance Form
  const [advanceAmount, setAdvanceAmount] = useState("");

  // Modals
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean, title: string, desc: string, isDanger?: boolean, action: () => void }>({ isOpen: false, title: "", desc: "", action: () => {} });
  const [disputeConfig, setDisputeConfig] = useState<{ isOpen: boolean, title: string, desc: string, action: (type: string, comment: string) => void }>({ isOpen: false, title: "", desc: "", action: () => {} });

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

  const fetchBuyers = async () => {
    try {
      const res = await api("/orders");
      if (res.ok) {
        const oData = await res.json();
        const map = new Map();
        oData.forEach((o: any) => { if (o.buyer) map.set(o.buyer.id, { id: o.buyer.id, name: o.buyer.company?.name || o.buyer.name }); });
        setBuyers(Array.from(map.values()));
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); fetchBuyers(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderIdParam = params.get('orderId');
    if (orders.length > 0 && orderIdParam && !selectedOrder) {
      const order = orders.find(o => o.id.toString() === orderIdParam);
      if (order) {
        setTab("orders");
        setSelectedOrder(order);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [orders, selectedOrder]);

  const orderAction = async (orderId: number, action: string) => {
    setActionLoading(orderId);
    try {
      const res = await api(`/orders/${orderId}/${action}`, { method: "PATCH" });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Action failed");
      }
      fetchData();
    } catch (e) { console.error(e); } finally { setActionLoading(null); }
  };

  const invoiceAction = async (invoiceId: number, action: string, data?: any) => {
    setActionLoading(invoiceId);
    try {
      await api(`/invoices/${invoiceId}/${action}`, { method: "PATCH", body: data ? JSON.stringify(data) : undefined });
      fetchData();
    } catch (e) { console.error(e); } finally { setActionLoading(null); }
  };

  const paymentAction = async (paymentId: number, action: string, isInvoicePayment: boolean = false, extraData?: any) => {
    setActionLoading(paymentId);
    try {
      const endpoint = isInvoicePayment ? `/invoices/payments/${paymentId}/${action}` : `/orders/payments/${paymentId}/${action}`;
      const res = await api(endpoint, { 
        method: "PATCH", 
        ...(extraData && { body: JSON.stringify(extraData) }) 
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Action failed");
      }
      fetchData();
    } catch (e) { console.error(e); } finally { setActionLoading(null); }
  };

  const handleRequestAdvance = async (e: any) => {
    e.preventDefault();
    if (!selectedOrder || !advanceAmount) return;
    setActionLoading(selectedOrder.id);
    try {
      const res = await api(`/orders/${selectedOrder.id}/request-advance`, { method: "PATCH", body: JSON.stringify({ amount: Number(advanceAmount) }) });
      if (res.ok) {
        setAdvanceAmount("");
        fetchData();
      } else {
        const err = await res.json(); alert(err.message || "Failed to request advance");
      }
    } catch (e) { console.error(e); } finally { setActionLoading(null); }
  };

  const handleCounterOffer = async (e: any) => {
    e.preventDefault();
    setActionLoading(counterOrder.id);
    try {
      await api(`/orders/${counterOrder.id}/counter`, { method: "PATCH", body: JSON.stringify(counterForm) });
      setShowCounterModal(false); setCounterOrder(null); setCounterForm({ price: "", quantity: "", note: "" }); fetchData();
    } catch (e) { console.error(e); } finally { setActionLoading(null); }
  };

  const handleCreateInvoice = async (e: any) => {
    e.preventDefault();
    try {
      await api("/invoices", { method: "POST", body: JSON.stringify(invForm) });
      setShowInvModal(false); setInvForm({ buyerId: "", productName: "", unitPrice: "", quantity: "1", pricingUnit: "PIECE", notes: "" }); fetchData();
    } catch (e) { console.error(e); }
  };

  const handleReviewSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const res = await api('/reviews', { method: 'POST', body: JSON.stringify({ orderId: reviewOrder.id, rating: reviewForm.rating, comment: reviewForm.comment }) });
      if (res.ok) { setShowReviewModal(false); setReviewOrder(null); alert('Review submitted successfully!'); fetchData(); }
      else { const err = await res.json(); alert(err.message || 'Failed to submit review'); }
    } catch (e) { console.error(e); }
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

  const stats = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    acc.ALL = (acc.ALL || 0) + 1;
    return acc;
  }, { ALL: 0 } as Record<string, number>);

  return (
    <div className="flex h-full gap-6 relative max-w-6xl mx-auto pb-10">
      {/* LEFT PANE: Orders List */}
      <div className={`flex flex-col h-[calc(100vh-100px)] overflow-y-auto pr-2 pb-10 space-y-4 ${selectedOrder || selectedInvoice ? 'w-[55%] hidden md:flex' : 'w-full'}`}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-ink">Sales & Orders</h1>
            <p className="text-sm text-slate mt-1">Manage incoming orders and invoices.</p>
          </div>
          {tab === "invoices" && (
            <button onClick={() => { setShowInvModal(true); fetchBuyers(); }} className="bg-ink hover:bg-ink text-white px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Create Invoice
            </button>
          )}
        </div>

        <div className="flex gap-2 p-1 w-fit rounded-lg shadow-inner" style={{ backgroundColor: 'var(--cp-surface-2)' }}>
          <button onClick={() => setTab("orders")} className={`px-5 py-2 text-[14px] font-[600] rounded-md transition-all duration-300 ease-out transform ${tab === "orders" ? "shadow-sm scale-105" : "hover:scale-105"}`} style={tab === "orders" ? { backgroundColor: 'var(--cp-surface)', color: 'var(--cp-text)', border: '1px solid var(--cp-border)' } : { color: 'var(--cp-text-muted)' }}>Orders</button>
          <button onClick={() => setTab("invoices")} className={`px-5 py-2 text-[14px] font-[600] rounded-md transition-all duration-300 ease-out transform flex items-center ${tab === "invoices" ? "shadow-sm scale-105" : "hover:scale-105"}`} style={tab === "invoices" ? { backgroundColor: 'var(--cp-surface)', color: 'var(--cp-text)', border: '1px solid var(--cp-border)' } : { color: 'var(--cp-text-muted)' }}>
            Invoices {invoices.length > 0 && <span className="ml-2 cp-badge cp-badge--info">{invoices.length}</span>}
          </button>
        </div>

        {tab === "orders" && (
          <div className="bg-surface border border-border rounded-lg overflow-hidden flex flex-col h-[calc(100vh-220px)] shadow-sm">
            {/* Filters Header */}
            <div className="p-3 border-b border-[var(--cp-border)] flex flex-wrap gap-2 items-center justify-between" style={{ backgroundColor: 'var(--cp-surface-2)' }}>
              <div className="flex flex-wrap gap-1">
                {['ALL', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-full text-[12px] font-[600] transition-colors ${statusFilter === s ? 'text-white shadow-sm' : 'hover:bg-[var(--cp-surface)]'}`} style={statusFilter === s ? { backgroundColor: 'var(--cp-brand-600)' } : { backgroundColor: 'var(--cp-surface-3)', color: 'var(--cp-text-secondary)' }}>
                    {s === 'ALL' ? 'All' : STATUS_CONFIG[s]?.label || s} <span className="opacity-70 ml-1">{stats[s] || 0}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="cp-input" style={{ padding: '6px 10px', fontSize: '13px' }} />
                <select value={sortOrder} onChange={e => setSortOrder(e.target.value as any)} className="cp-input font-[600]" style={{ padding: '6px 10px', fontSize: '13px', width: 'auto' }}>
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
                const buyerName = o.buyer?.company?.name || o.buyer?.name || '--';
                return (
                  <button key={o.id} onClick={() => { setSelectedOrder(o); setDetailTab("overview"); }} className={`w-full text-left cp-card transition-all flex items-center justify-between gap-3 ${isSelected ? 'ring-2 ring-[var(--cp-brand-300)] bg-[var(--cp-brand-50)]' : 'hover:shadow-md'}`} style={{ padding: '16px' }}>
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`cp-badge uppercase tracking-wider ${st.cpBadge}`}>{st.label}</span>
                        <span className="text-[11px] font-[500] font-mono border rounded px-1.5" style={{ backgroundColor: 'var(--cp-surface-3)', color: 'var(--cp-text-muted)', borderColor: 'var(--cp-border)' }}>{o.orderNumber}</span>
                        <span className="text-[11px] ml-auto" style={{ color: 'var(--cp-text-muted)' }}>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex justify-between items-end mt-2">
                        <div className="truncate pr-4">
                          <p className="text-[15px] font-[600] truncate" style={{ color: 'var(--cp-text)' }}>{o.productName}</p>
                          <p className="text-[12px] truncate mt-0.5" style={{ color: 'var(--cp-text-secondary)' }}>Buyer: <b style={{ color: 'var(--cp-text)' }}>{buyerName}</b></p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[18px] font-[700] tabular-nums" style={{ color: 'var(--cp-text)' }}>₹{Number(o.totalAmount).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0" style={{ color: 'var(--cp-text-disabled)' }}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tab === "invoices" && (
          <div className="space-y-3">
             {invoices.length > 0 ? invoices.map(inv => {
              const st = INV_STATUS[inv.status] || INV_STATUS.PENDING;
              const buyerName = inv.buyer?.company?.name || inv.buyer?.name || '--';
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
                      <p className="text-xs text-slate mt-0.5">Buyer: <b className="text-slate">{buyerName}</b></p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-extrabold text-ink">₹{Number(inv.totalAmount).toLocaleString('en-IN')}</p>
                      <p className="text-[11px] text-slate">{inv.quantity} × ₹{Number(inv.unitPrice).toLocaleString('en-IN')} / {UOM[inv.pricingUnit] || inv.pricingUnit}</p>
                    </div>
                  </div>
                  {inv.status !== 'DISPUTED' && (
                    <div className="flex items-center gap-3 mb-3 p-2.5 bg-paper-2 border border-border rounded">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center justify-center h-4 w-4 rounded-full text-[9px] ${inv.sellerAcknowledged ? 'bg-emerald-100 text-money' : 'bg-paper-2 text-slate'}`}>{inv.sellerAcknowledged ? '✓' : '—'}</span>
                        <span className="text-[11px] text-slate">You</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center justify-center h-4 w-4 rounded-full text-[9px] ${inv.buyerAcknowledged ? 'bg-emerald-100 text-money' : 'bg-paper-2 text-slate'}`}>{inv.buyerAcknowledged ? '✓' : '—'}</span>
                        <span className="text-[11px] text-slate">Buyer</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <span className="text-[11px] text-slate mr-auto">{new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    {inv.status === 'PENDING' && !inv.sellerAcknowledged && (
                      <>
                        <button disabled={actionLoading === inv.id} onClick={(e) => { e.stopPropagation(); setConfirmConfig({ isOpen: true, title: "Acknowledge Invoice", desc: "Are you sure you want to acknowledge this invoice?", action: () => invoiceAction(inv.id, 'acknowledge') }); }} className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors">Acknowledge</button>
                        <button disabled={actionLoading === inv.id} onClick={(e) => { e.stopPropagation(); setDisputeConfig({ isOpen: true, title: "Dispute Invoice", desc: "Please select a reason and describe the issue with this invoice.", action: (type, comment) => invoiceAction(inv.id, 'dispute', { disputeReason: type, disputeComment: comment }) }); }} className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors">Dispute</button>
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
            <p className="text-xs text-slate mt-1">Buyer: <b className="text-ink">{selectedOrder.buyer?.company?.name || selectedOrder.buyer?.name}</b></p>
            
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
                    <div className="grid grid-cols-3 gap-2"><span className="text-slate">Contact Email</span><span className="col-span-2 font-medium text-ink">{selectedOrder.buyer?.email || '--'}</span></div>
                    <div className="grid grid-cols-3 gap-2"><span className="text-slate">Contact Phone</span><span className="col-span-2 font-medium text-ink">{selectedOrder.buyer?.mobile || '--'}</span></div>
                  </div>
                </div>
                {selectedOrder.buyerNote && (
                  <div className="bg-surface border border-border rounded p-4">
                    <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-2">Buyer's Note</h4>
                    <p className="text-sm text-ink italic">"{selectedOrder.buyerNote}"</p>
                  </div>
                )}
                {selectedOrder.invoice && (
                   <div className="bg-surface border border-border rounded-t-xl p-4 flex items-center justify-between">
                     <div>
                       <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Invoice Attached</h4>
                       <p className="text-[13px] font-mono font-bold text-ink">{selectedOrder.invoice.invoiceNumber}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-sm font-bold text-ink">₹{Number(selectedOrder.invoice.totalAmount).toLocaleString('en-IN')}</p>
                       <p className={`text-[11px] font-semibold uppercase mt-1 ${selectedOrder.invoice.status === 'ACKNOWLEDGED' ? 'text-emerald-600' : selectedOrder.invoice.status === 'DISPUTED' ? 'text-red-600' : 'text-amber-600'}`}>{selectedOrder.invoice.status}</p>
                     </div>
                   </div>
                )}
                {selectedOrder.invoice?.status === 'DISPUTED' && (
                  <div className="p-3 bg-red-50 border-x border-b border-red-200 rounded-b-xl -mt-4 pt-5">
                    <div className="grid grid-cols-3 gap-2 text-[12px] mb-1"><span className="text-red-700 font-medium">Disputed By</span><span className="col-span-2 font-semibold text-red-900">{selectedOrder.invoice.disputedById === selectedOrder.invoice.sellerProfileId ? 'You' : 'Buyer'}</span></div>
                    <div className="grid grid-cols-3 gap-2 text-[12px] mb-1"><span className="text-red-700 font-medium">Reason</span><span className="col-span-2 font-semibold text-red-900">{selectedOrder.invoice.disputeReason}</span></div>
                    {selectedOrder.invoice.disputeComment && (
                      <div className="grid grid-cols-3 gap-2 text-[12px]"><span className="text-red-700 font-medium">Comment</span><span className="col-span-2 text-red-900">{selectedOrder.invoice.disputeComment}</span></div>
                    )}
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
                          <div className="flex items-center gap-2">
                            {p.status === 'PENDING_ACKNOWLEDGEMENT' ? (
                              <div className="flex gap-1">
                                <button disabled={actionLoading === p.id} onClick={() => setConfirmConfig({ isOpen: true, title: "Acknowledge Payment", desc: "Are you sure you want to acknowledge receiving this payment?", action: () => paymentAction(p.id, 'acknowledge', false) })} className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700">ACK</button>
                                <button disabled={actionLoading === p.id} onClick={() => setDisputeConfig({ isOpen: true, title: "Dispute Payment", desc: "Please select a reason and provide details to dispute this payment.", action: (disputeType, disputeComment) => paymentAction(p.id, 'dispute', false, { disputeType, disputeComment }) })} className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700">DISPUTE</button>
                              </div>
                            ) : (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${PAY_STATUS_CONFIG[p.status]?.bg} ${PAY_STATUS_CONFIG[p.status]?.color}`}>{PAY_STATUS_CONFIG[p.status]?.label}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate italic">No payments recorded yet.</p>
                  )}
                </div>

                {/* Demand Advance Form */}
                {['PLACED', 'COUNTER_OFFERED', 'CONFIRMED'].includes(selectedOrder.status) && (
                  <form onSubmit={handleRequestAdvance} className="bg-surface border border-border rounded p-4">
                    <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-3">Demand Advance</h4>
                    <p className="text-[11px] text-slate mb-3">Require a partial payment before shipping. This will be shown to the buyer.</p>
                    <div className="flex gap-2">
                      <input required type="number" min="1" max={selectedOrder.totalAmount} value={advanceAmount} onChange={e => setAdvanceAmount(e.target.value)} className="flex-1 px-3 py-1.5 bg-paper-2 border border-border rounded text-sm outline-none" placeholder="Amount (₹)" />
                      <button type="submit" disabled={actionLoading === selectedOrder.id} className="px-4 py-1.5 bg-ink text-white rounded text-sm font-semibold hover:bg-ink/90 disabled:opacity-50">Request</button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {detailTab === 'reviews' && (
              <div className="space-y-3">
                {selectedOrder.reviews?.length > 0 ? selectedOrder.reviews.map((r: any) => (
                  <div key={r.id} className="bg-surface border border-border rounded p-4 text-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-ink">{r.reviewerRole === 'SELLER' ? 'Your Review' : "Buyer's Review"}</span>
                      <span className="text-amber-500 flex">{Array.from({length: r.rating}).map((_, i) => <svg key={i} className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}</span>
                    </div>
                    {r.comment && <p className="text-slate mt-1">"{r.comment}"</p>}
                  </div>
                )) : (
                  <div className="text-center py-8 text-slate text-sm">No reviews yet.</div>
                )}
                {selectedOrder.status === 'DELIVERED' && !selectedOrder.reviews?.some((r: any) => r.reviewerRole === 'SELLER') && (
                  <button onClick={() => { setReviewOrder(selectedOrder); setShowReviewModal(true); }} className="w-full py-2 bg-paper-2 text-ink border border-border rounded text-sm font-semibold hover:bg-slate-50 transition-colors">Rate Buyer</button>
                )}
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="p-4 border-t border-border bg-paper flex flex-wrap items-center justify-end gap-2 shrink-0">
            {selectedOrder.status === 'PLACED' && (
              <>
                <button disabled={actionLoading === selectedOrder.id} onClick={() => setConfirmConfig({ isOpen: true, title: "Reject Order", desc: "Are you sure you want to reject this order?", isDanger: true, action: () => orderAction(selectedOrder.id, 'reject') })} className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors mr-auto">Reject Order</button>
                <button disabled={actionLoading === selectedOrder.id} onClick={() => { setCounterOrder(selectedOrder); setCounterForm({ ...counterForm, price: selectedOrder.unitPrice || "", quantity: selectedOrder.quantity || "" }); setShowCounterModal(true); }} className="px-4 py-2 text-sm font-semibold bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 rounded transition-colors">Counter Offer</button>
                <button disabled={actionLoading === selectedOrder.id} onClick={() => setConfirmConfig({ isOpen: true, title: "Confirm Order", desc: "Are you sure you want to confirm this order?", action: () => orderAction(selectedOrder.id, 'confirm') })} className="px-4 py-2 text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded transition-colors">Confirm Order</button>
              </>
            )}
            {selectedOrder.status === 'CONFIRMED' && (
              <>
                <button disabled={actionLoading === selectedOrder.id} onClick={() => router.push(`/dashboard/seller/messages?threadId=order-${selectedOrder.id}`)} className="px-4 py-2 text-sm font-semibold bg-paper-2 hover:bg-slate-100 text-ink border border-border rounded transition-colors mr-auto">Message</button>
                <button disabled={actionLoading === selectedOrder.id} onClick={() => setConfirmConfig({ isOpen: true, title: "Mark Shipped", desc: "Are you sure you have shipped this order?", action: () => orderAction(selectedOrder.id, 'ship') })} className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded transition-colors">Mark Shipped</button>
              </>
            )}
            {selectedOrder.status === 'SHIPPED' && (
              <>
                <button disabled={actionLoading === selectedOrder.id} onClick={() => router.push(`/dashboard/seller/messages?threadId=order-${selectedOrder.id}`)} className="px-4 py-2 text-sm font-semibold bg-paper-2 hover:bg-slate-100 text-ink border border-border rounded transition-colors mr-auto">Message</button>
                <button disabled={actionLoading === selectedOrder.id} onClick={() => setConfirmConfig({ isOpen: true, title: "Mark Delivered", desc: "Are you sure this order has been delivered to the buyer?", action: () => orderAction(selectedOrder.id, 'deliver') })} className="px-4 py-2 text-sm font-semibold bg-money text-white hover:bg-emerald-600 rounded transition-colors">Mark Delivered</button>
              </>
            )}
            {['COUNTER_OFFERED', 'DELIVERED', 'CANCELLED'].includes(selectedOrder.status) && (
              <button onClick={() => router.push(`/dashboard/seller/messages?threadId=order-${selectedOrder.id}`)} className="px-4 py-2 text-sm font-semibold bg-paper-2 hover:bg-slate-100 text-ink border border-border rounded transition-colors ml-auto">Message Buyer</button>
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
            <p className="text-xs text-slate mt-1">Buyer: <b className="text-ink">{selectedInvoice.buyer?.company?.name || selectedInvoice.buyer?.name}</b></p>
            
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
                      <div className="flex items-center gap-2">
                        {p.status === 'PENDING_ACKNOWLEDGEMENT' ? (
                          <div className="flex gap-1">
                            <button disabled={actionLoading === p.id} onClick={() => setConfirmConfig({ isOpen: true, title: "Acknowledge Payment", desc: "Are you sure you want to acknowledge receiving this payment?", action: () => paymentAction(p.id, 'acknowledge', selectedInvoice.type === 'MANUAL') })} className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700">ACK</button>
                            <button disabled={actionLoading === p.id} onClick={() => setDisputeConfig({ isOpen: true, title: "Dispute Payment", desc: "Please select a reason and provide details to dispute this payment.", action: (disputeType, disputeComment) => paymentAction(p.id, 'dispute', selectedInvoice.type === 'MANUAL', { disputeType, disputeComment }) })} className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700">DISPUTE</button>
                          </div>
                        ) : (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${PAY_STATUS_CONFIG[p.status]?.bg} ${PAY_STATUS_CONFIG[p.status]?.color}`}>{PAY_STATUS_CONFIG[p.status]?.label}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate italic">No payments recorded yet.</p>
              )}
            </div>

            {selectedInvoice.type === 'AUTO' && selectedInvoice.order && (
              <div className="bg-indigo-50 border border-indigo-200 rounded p-4 text-center">
                <p className="text-sm text-indigo-800 mb-3 font-medium">This invoice was automatically generated from an order.</p>
                <button onClick={() => { setTab("orders"); setSelectedInvoice(null); setSelectedOrder(orders.find(o => o.id === selectedInvoice.orderId)); setDetailTab("payments"); }} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-semibold hover:bg-indigo-700 w-full transition-colors shadow-sm">View Full Order</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Counter Offer Modal */}
      {showCounterModal && counterOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowCounterModal(false)}></div>
          <div className="relative bg-paper rounded shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-ink mb-1">Counter Offer</h2>
            <p className="text-xs text-slate mb-4">Original: ₹{Number(counterOrder.unitPrice).toLocaleString('en-IN')} / {counterOrder.pricingUnit} x {counterOrder.quantity}</p>
            <form onSubmit={handleCounterOffer} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-semibold text-ink mb-1">New Unit Price (₹)</label><input required type="number" min="0" value={counterForm.price} onChange={e => setCounterForm({...counterForm, price: e.target.value})} className="w-full px-3 py-2 bg-paper-2 border border-border rounded text-sm outline-none" /></div>
                <div><label className="block text-sm font-semibold text-ink mb-1">New Quantity</label><input required type="number" min="1" value={counterForm.quantity} onChange={e => setCounterForm({...counterForm, quantity: e.target.value})} className="w-full px-3 py-2 bg-paper-2 border border-border rounded text-sm outline-none" /></div>
              </div>
              <div><label className="block text-sm font-semibold text-ink mb-1">Note to Buyer</label><textarea value={counterForm.note} onChange={e => setCounterForm({...counterForm, note: e.target.value})} rows={2} className="w-full px-3 py-2 bg-paper-2 border border-border rounded text-sm outline-none resize-none" placeholder="Reason for counter offer..." /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCounterModal(false)} className="px-4 py-2 bg-paper border border-border text-slate rounded text-sm font-semibold hover:bg-paper-2 transition-colors">Cancel</button>
                <button type="submit" disabled={actionLoading === counterOrder.id} className="px-4 py-2 bg-orange-600 text-white rounded text-sm font-semibold hover:bg-orange-700 disabled:opacity-50 transition-colors">Send Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Invoice Modal */}
      {showInvModal && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowInvModal(false)}></div>
          <div className="relative w-full max-w-md bg-paper h-full shadow-2xl flex flex-col">
            <div className="px-6 py-5 border-b border-border flex justify-between items-center">
              <div><h2 className="text-lg font-bold text-ink">Create Manual Invoice</h2><p className="text-xs text-slate mt-0.5">For offline / onsite sales</p></div>
              <button onClick={() => setShowInvModal(false)} className="h-8 w-8 rounded-full bg-paper-2 flex items-center justify-center text-slate hover:text-ink"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form id="inv-form" onSubmit={handleCreateInvoice} className="space-y-5">
                <div><label className="block text-sm font-semibold mb-2">Buyer</label><select required value={invForm.buyerId} onChange={e => setInvForm({...invForm, buyerId: e.target.value})} className="w-full px-3 py-2 bg-paper-2 border border-border rounded text-sm"><option value="">Select buyer...</option>{buyers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
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
            <h2 className="text-lg font-bold mb-1">Rate Buyer</h2>
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
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowReviewModal(false)} className="px-4 py-2 border rounded text-sm">Cancel</button><button type="submit" className="px-4 py-2 bg-ink text-white rounded text-sm">Submit</button></div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.action}
        title={confirmConfig.title}
        description={confirmConfig.desc}
        isDanger={confirmConfig.isDanger}
      />

      <DisputeModal
        isOpen={disputeConfig.isOpen}
        onClose={() => setDisputeConfig({ ...disputeConfig, isOpen: false })}
        onConfirm={disputeConfig.action}
        title={disputeConfig.title}
        description={disputeConfig.desc}
      />
    </div>
  );
}

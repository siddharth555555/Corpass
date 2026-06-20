"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LogoLink from "@/components/ui/LogoLink";
import { Select } from "@/components/ui/Select";
import { ConfirmModal } from "@/components/ConfirmModal";
import { DisputeModal } from "@/components/DisputeModal";
import { AlertModal, AlertType } from "@/components/ui/AlertModal";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PLACED: { label: "New Order", color: "text-amber-700", bg: "bg-amber-50" },
  COUNTER_OFFERED: { label: "Negotiating", color: "text-orange-700", bg: "bg-orange-50" },
  CONFIRMED: { label: "Confirmed", color: "text-ink", bg: "bg-surface-2" },
  SHIPPED: { label: "Shipped", color: "text-violet-700", bg: "bg-violet-50" },
  DELIVERED: { label: "Delivered", color: "text-money", bg: "bg-surface-2 border border-money text-money" },
  CANCELLED: { label: "Cancelled", color: "text-red-700", bg: "bg-red-50" },
};

const INV_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50" },
  ACKNOWLEDGED: { label: "Acknowledged", color: "text-money", bg: "bg-surface-2 border border-money text-money" },
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

import { Suspense } from 'react';

function BuyerOrdersContent() {
  const router = useRouter();
  const [alertConfig, setAlertConfig] = useState<{message: string, type: AlertType} | null>(null);
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"orders" | "invoices">((searchParams.get("tab") as "orders" | "invoices") || "orders");
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
        const ordersArray = Array.isArray(oData) ? oData : oData.data || [];
        setOrders(ordersArray);
        if (selectedOrder) {
          const updated = ordersArray.find((o: any) => o.id === selectedOrder.id);
          if (updated) setSelectedOrder(updated);
        }
      }
      if (iRes.ok) {
        const iData = await iRes.json();
        const invoicesArray = Array.isArray(iData) ? iData : iData.data || [];
        setInvoices(invoicesArray);
        if (selectedInvoice) {
          const updatedInv = invoicesArray.find((i: any) => i.id === selectedInvoice.id);
          if (updatedInv) setSelectedInvoice(updatedInv);
        }
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchSellers = async () => {
    try {
      const res = await api("/products/marketplace");
      if (res.ok) {
        const resData = await res.json();
        const products = Array.isArray(resData) ? resData : resData.data || [];
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
      await api(`/orders/${orderId}/${action}`, { method: "PATCH" });
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
      if (res.ok) { setShowReviewModal(false); setReviewOrder(null); setAlertConfig({ message: 'Review submitted successfully!', type: 'success' }); fetchData(); }
      else { const err = await res.json(); const msg = Array.isArray(err.message) ? err.message.join(', ') : err.message; setAlertConfig({ message: msg || 'Failed to submit review', type: 'error' }); }
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
          const err = await res.json(); 
          const msg = Array.isArray(err.message) ? err.message.join(', ') : err.message;
          setAlertConfig({ message: msg || 'Failed to record payment', type: 'error' });
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
          const err = await res.json(); 
          const msg = Array.isArray(err.message) ? err.message.join(', ') : err.message;
          setAlertConfig({ message: msg || 'Failed to record payment', type: 'error' });
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
    <div className="flex h-full gap-6 relative max-w-6xl mx-auto pb-10">
      {/* LEFT PANE: Orders List */}
      <div className={`flex flex-col h-[calc(100vh-100px)] overflow-hidden space-y-4 ${selectedOrder || selectedInvoice ? 'w-[45%] hidden lg:flex' : 'w-full'}`}>
        <div className="flex items-center justify-between shrink-0 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-ink">Orders & Invoices</h1>
            <p className="text-sm text-slate mt-1">Track your purchases and manage payments.</p>
          </div>
          {tab === "invoices" && (
            <button onClick={() => { setShowInvModal(true); fetchSellers(); }} className="cp-btn cp-btn--primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Create Invoice
            </button>
          )}
        </div>

        <div className="flex gap-1 bg-surface-3 rounded-lg p-1 w-fit border border-border shrink-0">
          <button onClick={() => setTab("orders")} className={`px-5 py-2 text-[13px] font-bold rounded-md transition-all duration-300 ${tab === "orders" ? "bg-surface text-ink shadow-sm border border-border" : "text-muted hover:text-ink"}`}>Orders</button>
          <button onClick={() => setTab("invoices")} className={`px-5 py-2 text-[13px] font-bold rounded-md transition-all duration-300 flex items-center ${tab === "invoices" ? "bg-surface text-ink shadow-sm border border-border" : "text-muted hover:text-ink"}`}>
            Invoices {invoices.length > 0 && <span className="ml-2 text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">{invoices.length}</span>}
          </button>
        </div>

        {tab === "orders" && (
          <div className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col h-full shadow-sm">
            {/* Filters Header */}
            <div className="p-3 border-b border-border bg-surface-2 flex flex-wrap gap-2 items-center justify-between shrink-0">
              <div className="flex flex-wrap gap-1">
                {['ALL', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${statusFilter === s ? 'bg-ink text-canvas shadow-sm' : 'bg-surface border border-border text-muted hover:text-ink'}`}>
                    {s === 'ALL' ? 'All' : STATUS_CONFIG[s]?.label || s} <span className="opacity-70 ml-1">{stats[s] || 0}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="cp-input py-1.5 px-2 text-xs" />
                <Select
                  value={sortOrder}
                  onChange={val => setSortOrder(val as any)}
                  className="min-w-[130px]"
                  options={[
                    {value: "newest", label: "Newest First"},
                    {value: "highest_amount", label: "Highest Amt"}
                  ]}
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-canvas">
              {loading ? (
                <div className="p-8 text-center text-muted text-sm">Loading orders...</div>
              ) : processedOrders.length === 0 ? (
                <div className="p-8 text-center text-muted text-sm">No orders found.</div>
              ) : processedOrders.map(o => {
                const st = STATUS_CONFIG[o.status] || STATUS_CONFIG.PLACED;
                const isSelected = selectedOrder?.id === o.id;
                const supplier = o.sellerProfile?.user?.company?.name || o.sellerProfile?.user?.name || '--';
                return (
                  <button key={o.id} onClick={() => { setSelectedOrder(o); setDetailTab("overview"); }} className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${isSelected ? 'bg-brand-50 border-brand-300 shadow-sm ring-1 ring-brand-500/10' : 'bg-surface border-border hover:border-brand-200 hover:shadow-sm'}`}>
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-transparent ${st.color} ${st.bg}`}>{st.label}</span>
                        <span className="text-[11px] font-mono text-muted bg-surface-3 px-1.5 py-0.5 rounded border border-border">{o.orderNumber}</span>
                        <span className="text-[11px] font-medium text-muted ml-auto">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="truncate pr-4">
                          <p className="text-[15px] font-semibold text-ink truncate">{o.productName}</p>
                          <p className="text-[12px] text-muted truncate mt-0.5">Supplier: <span className="font-medium text-ink">{supplier}</span></p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[15px] font-bold text-ink tabular-nums">₹{Number(o.totalAmount).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>
                    <div className={`shrink-0 transition-transform ${isSelected ? 'text-brand-600' : 'text-muted'}`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* INVOICES TAB LIST */}
        {tab === "invoices" && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
             {invoices.length > 0 ? invoices.map(inv => {
              const st = INV_STATUS[inv.status] || INV_STATUS.PENDING;
              const supplier = inv.sellerProfile?.user?.company?.name || inv.sellerProfile?.user?.name || '--';
              return (
                <div key={inv.id} onClick={() => setSelectedInvoice(inv)} className={`w-full text-left bg-surface border rounded-xl p-5 transition-all flex flex-col cursor-pointer ${selectedInvoice?.id === inv.id ? 'bg-brand-50 border-brand-300 shadow-sm ring-1 ring-brand-500/10' : 'border-border hover:border-brand-200 hover:shadow-sm'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-muted font-mono bg-surface-3 px-1.5 py-0.5 rounded border border-border">{inv.invoiceNumber}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border border-transparent ${st.color} ${st.bg}`}>{st.label}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${inv.type === 'AUTO' ? 'bg-brand-50 text-brand-700 border-brand-200' : 'bg-surface-2 text-muted border-border'}`}>{inv.type === 'AUTO' ? 'Auto' : 'Manual'}</span>
                      </div>
                      <h3 className="text-[15px] font-bold text-ink">{inv.productName}</h3>
                      <p className="text-[12px] text-muted mt-1">Supplier: <span className="font-medium text-ink">{supplier}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-extrabold text-ink tabular-nums">₹{Number(inv.totalAmount).toLocaleString('en-IN')}</p>
                      <p className="text-[11px] text-muted mt-0.5">{inv.quantity} × ₹{Number(inv.unitPrice).toLocaleString('en-IN')} / {UOM[inv.pricingUnit] || inv.pricingUnit}</p>
                    </div>
                  </div>
                  {inv.status !== 'DISPUTED' && (
                    <div className="flex items-center gap-4 mb-4 p-3 bg-surface-3 border border-border rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] ${inv.buyerAcknowledged ? 'bg-success-bg text-success' : 'bg-surface border border-border text-muted'}`}>{inv.buyerAcknowledged ? '✓' : '—'}</span>
                        <span className="text-xs font-medium text-ink">You</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] ${inv.sellerAcknowledged ? 'bg-success-bg text-success' : 'bg-surface border border-border text-muted'}`}>{inv.sellerAcknowledged ? '✓' : '—'}</span>
                        <span className="text-xs font-medium text-ink">Supplier</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border">
                    <span className="text-xs font-medium text-muted mr-auto">{new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    {inv.status === 'PENDING' && !inv.buyerAcknowledged && (
                      <>
                        <button disabled={actionLoading === inv.id} onClick={(e) => { e.stopPropagation(); setConfirmConfig({ isOpen: true, title: "Acknowledge Invoice", desc: "Are you sure you want to acknowledge this invoice? This means you agree to the terms.", action: () => invoiceAction(inv.id, 'acknowledge') }); }} className="cp-btn cp-btn--success py-1.5 px-3 text-xs">Acknowledge</button>
                        <button disabled={actionLoading === inv.id} onClick={(e) => { e.stopPropagation(); setDisputeConfig({ isOpen: true, title: "Dispute Invoice", desc: "Please select a reason and describe the issue with this invoice.", action: (type, comment) => invoiceAction(inv.id, 'dispute', { disputeReason: type, disputeComment: comment }) }); }} className="cp-btn cp-btn--danger-outline py-1.5 px-3 text-xs">Dispute</button>
                      </>
                    )}
                  </div>
                </div>
              );
            }) : (
              <div className="py-16 text-center bg-surface border border-border rounded-xl"><p className="text-sm text-muted">No invoices yet</p></div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT PANE: Detail View */}
      {selectedOrder && tab === "orders" && (
        <div className="flex-1 h-[calc(100vh-100px)] sticky top-[80px] bg-surface border border-border rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden animate-in slide-in-from-right-8 duration-300">
          {/* Header */}
          <div className="p-6 border-b border-border bg-surface relative">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 h-8 w-8 bg-surface-2 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-border transition-colors lg:hidden">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border border-transparent ${STATUS_CONFIG[selectedOrder.status]?.color} ${STATUS_CONFIG[selectedOrder.status]?.bg}`}>{STATUS_CONFIG[selectedOrder.status]?.label}</span>
              <span className="text-xs font-mono font-medium text-muted bg-surface-3 px-2 py-0.5 rounded-md border border-border">{selectedOrder.orderNumber}</span>
            </div>
            <h2 className="text-2xl font-bold text-ink leading-tight">{selectedOrder.productName}</h2>
            <p className="text-sm text-muted mt-1.5">Supplier: <span className="font-medium text-ink">{selectedOrder.sellerProfile?.user?.company?.name || selectedOrder.sellerProfile?.user?.name}</span></p>
            
            <div className="mt-6 pt-6 border-t border-border flex justify-between items-end">
              <div>
                <p className="text-3xl font-extrabold text-ink tabular-nums leading-none">₹{Number(selectedOrder.totalAmount).toLocaleString('en-IN')}</p>
                <p className="text-xs font-medium text-muted mt-2">{selectedOrder.quantity} × ₹{Number(selectedOrder.unitPrice).toLocaleString('en-IN')} / {UOM[selectedOrder.pricingUnit] || selectedOrder.pricingUnit}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-muted">Placed on</p>
                <p className="text-sm font-bold text-ink mt-0.5">{new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border bg-surface px-4">
            {['overview', 'journey', 'payments', 'reviews'].map(t => (
              <button key={t} onClick={() => setDetailTab(t as any)} className={`px-5 py-3.5 text-[13px] font-bold capitalize border-b-2 transition-colors ${detailTab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-muted hover:text-ink hover:border-border-strong'}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-canvas">
            {detailTab === 'overview' && (
              <div className="space-y-5">
                <div className="cp-card">
                  <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Order Details</h4>
                  <div className="space-y-4 text-[13px]">
                    <div className="grid grid-cols-3 gap-2"><span className="text-muted font-medium">Product</span><span className="col-span-2 font-semibold text-ink">{selectedOrder.productName}</span></div>
                    <div className="grid grid-cols-3 gap-2"><span className="text-muted font-medium">Shipping To</span><span className="col-span-2 font-semibold text-ink whitespace-pre-wrap leading-relaxed">{selectedOrder.shippingAddress}</span></div>
                    <div className="grid grid-cols-3 gap-2"><span className="text-muted font-medium">Contact Email</span><span className="col-span-2 font-semibold text-ink">{selectedOrder.sellerProfile?.user?.email || '--'}</span></div>
                    <div className="grid grid-cols-3 gap-2"><span className="text-muted font-medium">Contact Phone</span><span className="col-span-2 font-semibold text-ink">{selectedOrder.sellerProfile?.user?.mobile || '--'}</span></div>
                  </div>
                </div>
                {selectedOrder.buyerNote && (
                  <div className="cp-card">
                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Your Note</h4>
                    <p className="text-sm text-ink italic leading-relaxed border-l-2 border-brand-300 pl-3">"{selectedOrder.buyerNote}"</p>
                  </div>
                )}
                {selectedOrder.invoice && (
                   <div className="cp-card flex items-center justify-between">
                     <div>
                       <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Invoice Attached</h4>
                       <p className="text-[13px] font-mono font-bold text-ink">{selectedOrder.invoice.invoiceNumber}</p>
                     </div>
                     <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border border-transparent ${INV_STATUS[selectedOrder.invoice.status]?.bg} ${INV_STATUS[selectedOrder.invoice.status]?.color}`}>{INV_STATUS[selectedOrder.invoice.status]?.label}</span>
                   </div>
                )}
              </div>
            )}

            {detailTab === 'journey' && (
              <div className="py-4 px-2">
                <div className="relative">
                  {/* Stepper logic */}
                  {['PLACED', ...(selectedOrder.status === 'COUNTER_OFFERED' ? ['COUNTER_OFFERED'] : []), 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map((step, idx, arr) => {
                    const isCompleted = arr.indexOf(selectedOrder.status) >= idx;
                    const isActive = selectedOrder.status === step;
                    const isCancelled = selectedOrder.status === 'CANCELLED';
                    return (
                      <div key={step} className="flex gap-5 mb-8 relative group">
                        {idx !== arr.length - 1 && <div className={`absolute left-3.5 top-8 bottom-[-24px] w-[2px] rounded-full ${isCompleted && !isCancelled ? 'bg-brand-500' : 'bg-border'}`}></div>}
                        <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-[2px] transition-colors ${isCompleted && !isCancelled ? 'bg-brand-600 border-brand-600 text-white shadow-sm ring-4 ring-brand-50' : 'bg-surface border-border text-transparent'}`}>
                          {isCompleted && !isCancelled && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <div>
                          <h4 className={`text-[15px] font-bold ${isActive && !isCancelled ? 'text-brand-700' : isCompleted && !isCancelled ? 'text-ink' : 'text-muted'}`}>{STATUS_CONFIG[step]?.label || step}</h4>
                          <p className="text-[13px] font-medium text-muted mt-1">
                            {idx === 0 ? new Date(selectedOrder.createdAt).toLocaleDateString() : 
                             isActive ? new Date(selectedOrder.updatedAt).toLocaleDateString() : 
                             isCompleted ? '--' : 'Pending'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {selectedOrder.status === 'CANCELLED' && (
                     <div className="flex gap-5 relative">
                       <div className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 bg-danger border-danger text-white ring-4 ring-danger-bg">
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                       </div>
                       <div>
                         <h4 className="text-[15px] font-bold text-danger">Cancelled</h4>
                         <p className="text-[13px] font-medium text-muted mt-1">{new Date(selectedOrder.updatedAt).toLocaleDateString()}</p>
                       </div>
                     </div>
                  )}
                  {selectedOrder.invoice && selectedOrder.invoice.status === 'DISPUTED' && (
                  <div className="cp-card border-danger-200 bg-danger-50">
                    <h4 className="text-xs font-bold text-danger uppercase tracking-wider mb-2">Dispute Details</h4>
                    <div className="grid grid-cols-3 gap-2 text-[13px] mb-2"><span className="text-danger-700 font-medium">Disputed By</span><span className="col-span-2 font-semibold text-danger-900">{selectedOrder.invoice.disputedById === selectedOrder.invoice.buyerId ? 'You' : 'Supplier'}</span></div>
                    <div className="grid grid-cols-3 gap-2 text-[13px] mb-2"><span className="text-danger-700 font-medium">Reason</span><span className="col-span-2 font-semibold text-danger-900">{selectedOrder.invoice.disputeReason}</span></div>
                    {selectedOrder.invoice.disputeComment && (
                      <div className="grid grid-cols-3 gap-2 text-[13px]"><span className="text-danger-700 font-medium">Comment</span><span className="col-span-2 text-danger-900">{selectedOrder.invoice.disputeComment}</span></div>
                    )}
                  </div>
                )}
                </div>
              </div>
            )}

            {detailTab === 'payments' && (
              <div className="space-y-5">
                <div className="cp-card">
                  <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Payment Summary</h4>
                  <div className="space-y-4 text-[13px]">
                    <div className="grid grid-cols-2 gap-2"><span className="text-muted font-medium">Mode</span><span className="font-semibold text-ink text-right">{selectedOrder.paymentMode || 'Not Specified'}</span></div>
                    <div className="grid grid-cols-2 gap-2"><span className="text-muted font-medium">Total Amount</span><span className="font-bold text-ink text-right tabular-nums">₹{Number(selectedOrder.totalAmount).toLocaleString('en-IN')}</span></div>
                    {selectedOrder.advanceRequested && (
                      <div className="grid grid-cols-2 gap-2"><span className="text-muted font-medium">Advance Requested</span><span className="font-bold text-warning text-right tabular-nums">₹{Number(selectedOrder.advanceRequested).toLocaleString('en-IN')}</span></div>
                    )}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border">
                      <span className="text-ink font-bold">Total Paid (Ack'd)</span>
                      <span className="font-extrabold text-success text-right tabular-nums">
                        ₹{selectedOrder.payments?.filter((p:any)=>p.status==='ACKNOWLEDGED').reduce((sum:number, p:any)=>sum+Number(p.amount), 0).toLocaleString('en-IN') || '0'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="cp-card">
                  <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Payment History</h4>
                  {selectedOrder.payments?.length > 0 ? (
                    <div className="space-y-3">
                      {selectedOrder.payments.map((p: any) => (
                        <div key={p.id} className="p-3 bg-surface-2 rounded-lg border border-border text-[13px] flex items-center justify-between">
                          <div>
                            <p className="font-bold text-ink tabular-nums">₹{Number(p.amount).toLocaleString('en-IN')}</p>
                            <p className="text-[11px] font-medium text-muted mt-0.5">{new Date(p.paymentDate).toLocaleDateString()} {p.utr ? `• UTR: ${p.utr}` : ''}</p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-transparent ${PAY_STATUS_CONFIG[p.status]?.bg} ${PAY_STATUS_CONFIG[p.status]?.color}`}>{PAY_STATUS_CONFIG[p.status]?.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] font-medium text-muted italic bg-surface-3 p-4 rounded-lg border border-border text-center">No payments recorded yet.</p>
                  )}
                </div>

                {/* Record Payment Form */}
                {['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(selectedOrder.status) && (
                  <form onSubmit={handleRecordPayment} className="cp-card bg-surface-2 border-border-strong">
                    <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-4">Record Payment Sent</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-semibold text-ink mb-1.5">Amount (₹)</label>
                        <input required type="number" min="1" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} className="cp-input text-[13px]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-ink mb-1.5">Date Sent</label>
                        <input required type="date" value={paymentForm.paymentDate} onChange={e => setPaymentForm({...paymentForm, paymentDate: e.target.value})} className="cp-input text-[13px]" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-ink mb-1.5">UTR / Ref Number (Optional)</label>
                      <input type="text" value={paymentForm.utr} onChange={e => setPaymentForm({...paymentForm, utr: e.target.value})} className="cp-input text-[13px]" placeholder="e.g. 1234567890" />
                    </div>
                    <button type="submit" disabled={actionLoading === selectedOrder.id} className="w-full cp-btn cp-btn--primary">Submit Record</button>
                  </form>
                )}
              </div>
            )}

            {detailTab === 'reviews' && (
              <div className="space-y-4">
                {selectedOrder.reviews?.length > 0 ? selectedOrder.reviews.map((r: any) => (
                  <div key={r.id} className="cp-card">
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-ink">{r.reviewerRole === 'BUYER' ? 'Your Review' : "Supplier's Review"}</span>
                      <span className="text-warning flex">{Array.from({length: r.rating}).map((_, i) => <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}</span>
                    </div>
                    {r.comment && <p className="text-[13px] text-muted leading-relaxed">"{r.comment}"</p>}
                  </div>
                )) : (
                  <div className="text-center py-12 bg-surface border border-border rounded-xl">
                    <p className="text-[13px] font-medium text-muted">No reviews yet.</p>
                  </div>
                )}
                {selectedOrder.status === 'DELIVERED' && !selectedOrder.reviews?.some((r: any) => r.reviewerRole === 'BUYER') && (
                  <button onClick={() => { setReviewOrder(selectedOrder); setShowReviewModal(true); }} className="w-full cp-btn cp-btn--secondary mt-2">Write a Review</button>
                )}
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="p-4 border-t border-border bg-surface flex items-center justify-end gap-3 shrink-0">
            {selectedOrder.status === 'PLACED' && (
              <button disabled={actionLoading === selectedOrder.id} onClick={() => setConfirmConfig({ isOpen: true, title: "Cancel Order", desc: "Are you sure you want to cancel this order? This action cannot be undone.", isDanger: true, action: () => orderAction(selectedOrder.id, 'cancel') })} className="cp-btn cp-btn--danger-outline mr-auto">Cancel Order</button>
            )}
            {selectedOrder.status === 'COUNTER_OFFERED' && (
              <button onClick={() => router.push(`/dashboard/buyer/messages?threadId=order-${selectedOrder.id}`)} className="cp-btn cp-btn--primary">Review Counter Offer</button>
            )}
            {selectedOrder.status !== 'COUNTER_OFFERED' && (
              <button onClick={() => router.push(`/dashboard/buyer/messages?threadId=order-${selectedOrder.id}`)} className="cp-btn cp-btn--secondary">Message Supplier</button>
            )}
          </div>
        </div>
      )}

      {/* RIGHT PANE: Invoice Detail View */}
      {selectedInvoice && tab === "invoices" && (
        <div className="flex-1 h-[calc(100vh-100px)] sticky top-[80px] bg-surface border border-border rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden animate-in slide-in-from-right-8 duration-300">
          {/* Header */}
          <div className="p-6 border-b border-border bg-surface relative">
            <button onClick={() => setSelectedInvoice(null)} className="absolute top-4 right-4 h-8 w-8 bg-surface-2 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-border transition-colors lg:hidden">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border border-transparent ${INV_STATUS[selectedInvoice.status]?.color} ${INV_STATUS[selectedInvoice.status]?.bg}`}>{INV_STATUS[selectedInvoice.status]?.label}</span>
              <span className="text-xs font-mono font-medium text-muted bg-surface-3 px-2 py-0.5 rounded-md border border-border">{selectedInvoice.invoiceNumber}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${selectedInvoice.type === 'AUTO' ? 'bg-brand-50 text-brand-700 border-brand-200' : 'bg-surface-2 text-muted border-border'}`}>{selectedInvoice.type === 'AUTO' ? 'Auto' : 'Manual'}</span>
            </div>
            <h2 className="text-2xl font-bold text-ink leading-tight">{selectedInvoice.productName}</h2>
            <p className="text-sm text-muted mt-1.5">Supplier: <span className="font-medium text-ink">{selectedInvoice.sellerProfile?.user?.company?.name || selectedInvoice.sellerProfile?.user?.name}</span></p>
            
            <div className="mt-6 pt-6 border-t border-border flex justify-between items-end">
              <div>
                <p className="text-3xl font-extrabold text-ink tabular-nums leading-none">₹{Number(selectedInvoice.totalAmount).toLocaleString('en-IN')}</p>
                <p className="text-xs font-medium text-muted mt-2">{selectedInvoice.quantity} × ₹{Number(selectedInvoice.unitPrice).toLocaleString('en-IN')} / {UOM[selectedInvoice.pricingUnit] || selectedInvoice.pricingUnit}</p>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-canvas space-y-5">
            <div className="cp-card">
              <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Payment Summary</h4>
              <div className="space-y-4 text-[13px]">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-ink font-bold">Total Paid (Ack'd)</span>
                  <span className="font-extrabold text-success text-right tabular-nums">
                    ₹{((selectedInvoice.order?.payments || selectedInvoice.payments || []).filter((p:any)=>p.status==='ACKNOWLEDGED').reduce((sum:number, p:any)=>sum+Number(p.amount), 0)).toLocaleString('en-IN') || '0'}
                  </span>
                </div>
              </div>
            </div>

            <div className="cp-card">
              <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Payment History</h4>
              {(selectedInvoice.order?.payments || selectedInvoice.payments || []).length > 0 ? (
                <div className="space-y-3">
                  {(selectedInvoice.order?.payments || selectedInvoice.payments || []).map((p: any) => (
                    <div key={p.id} className="p-3 bg-surface-2 rounded-lg border border-border text-[13px] flex items-center justify-between">
                      <div>
                        <p className="font-bold text-ink tabular-nums">₹{Number(p.amount).toLocaleString('en-IN')}</p>
                        <p className="text-[11px] font-medium text-muted mt-0.5">{new Date(p.paymentDate).toLocaleDateString()} {p.utr ? `• UTR: ${p.utr}` : ''}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-transparent ${PAY_STATUS_CONFIG[p.status]?.bg} ${PAY_STATUS_CONFIG[p.status]?.color}`}>{PAY_STATUS_CONFIG[p.status]?.label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] font-medium text-muted italic bg-surface-3 p-4 rounded-lg border border-border text-center">No payments recorded yet.</p>
              )}
            </div>

            {/* Record Payment Form for Manual Invoices */}
            {selectedInvoice.type === 'MANUAL' && (
              <form onSubmit={handleRecordPayment} className="cp-card bg-surface-2 border-border-strong">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-4">Record Payment Sent</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">Amount (₹)</label>
                    <input required type="number" min="1" max={selectedInvoice.totalAmount} value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} className="cp-input text-[13px]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">Date Sent</label>
                    <input required type="date" value={paymentForm.paymentDate} onChange={e => setPaymentForm({...paymentForm, paymentDate: e.target.value})} className="cp-input text-[13px]" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-ink mb-1.5">UTR / Ref Number (Optional)</label>
                  <input type="text" value={paymentForm.utr} onChange={e => setPaymentForm({...paymentForm, utr: e.target.value})} className="cp-input text-[13px]" placeholder="e.g. 1234567890" />
                </div>
                <button type="submit" disabled={actionLoading === selectedInvoice.id} className="w-full cp-btn cp-btn--primary">Submit Record</button>
              </form>
            )}

            {selectedInvoice.type === 'AUTO' && selectedInvoice.order && (
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-6 text-center shadow-sm">
                <p className="text-sm text-brand-800 mb-4 font-medium">This invoice was automatically generated from an order.</p>
                <button onClick={() => { setTab("orders"); setSelectedInvoice(null); setSelectedOrder(orders.find(o => o.id === selectedInvoice.orderId)); setDetailTab("payments"); }} className="cp-btn cp-btn--primary shadow-sm w-full">View Full Order</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Invoice Modal */}
      {showInvModal && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setShowInvModal(false)}></div>
          <div className="relative w-full max-w-md bg-surface h-full shadow-2xl flex flex-col">
            <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surface">
              <div><h2 className="text-[18px] font-bold text-ink">Create Manual Invoice</h2><p className="text-[13px] text-muted mt-0.5">For offline / onsite purchases</p></div>
              <button onClick={() => setShowInvModal(false)} className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center text-muted hover:text-ink hover:bg-border transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-canvas">
              <form id="inv-form" onSubmit={handleCreateInvoice} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-semibold text-ink mb-1.5">Supplier</label>
                  <Select
                    name="sellerProfileId"
                    value={invForm.sellerProfileId}
                    onChange={val => setInvForm({...invForm, sellerProfileId: val})}
                    options={[
                      {value: "", label: "Select supplier..."},
                      ...sellers.map(s => ({value: s.id, label: s.name}))
                    ]}
                    required
                  />
                </div>
                <div><label className="block text-[13px] font-semibold text-ink mb-1.5">Product Name</label><input required value={invForm.productName} onChange={e => setInvForm({...invForm, productName: e.target.value})} className="cp-input text-[13px]" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-[13px] font-semibold text-ink mb-1.5">Price (₹)</label><input required type="number" min="0" value={invForm.unitPrice} onChange={e => setInvForm({...invForm, unitPrice: e.target.value})} className="cp-input text-[13px]" /></div>
                  <div><label className="block text-[13px] font-semibold text-ink mb-1.5">Quantity</label><input required type="number" min="1" value={invForm.quantity} onChange={e => setInvForm({...invForm, quantity: e.target.value})} className="cp-input text-[13px]" /></div>
                </div>
              </form>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-3 bg-surface">
              <button onClick={() => setShowInvModal(false)} className="cp-btn cp-btn--secondary">Cancel</button>
              <button type="submit" form="inv-form" className="cp-btn cp-btn--primary">Create Invoice</button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setShowReviewModal(false)}></div>
          <div className="relative bg-surface rounded-xl shadow-2xl w-full max-w-md p-6 border border-border">
            <h2 className="text-[18px] font-bold text-ink mb-1">Rate Supplier</h2>
            <p className="text-[13px] text-muted mb-5">Share your experience with <span className="font-semibold text-ink">{reviewOrder.sellerProfile?.user?.company?.name || reviewOrder.sellerProfile?.user?.name}</span></p>
            <form onSubmit={handleReviewSubmit} className="space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-ink mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(star => (
                    <button type="button" key={star} onClick={() => setReviewForm({...reviewForm, rating: star})} className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${reviewForm.rating >= star ? 'bg-warning-bg text-warning shadow-sm' : 'bg-surface-2 text-muted hover:bg-surface-3'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg></button>
                  ))}
                </div>
              </div>
              <div><label className="block text-[13px] font-semibold text-ink mb-1.5">Comment</label><textarea value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} rows={3} className="cp-input text-[13px]" placeholder="What did you like or dislike?" /></div>
              <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowReviewModal(false)} className="cp-btn cp-btn--secondary">Cancel</button><button type="submit" disabled={reviewSubmitting} className="cp-btn cp-btn--primary">Submit Review</button></div>
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

      <AlertModal 
        isOpen={!!alertConfig} 
        message={alertConfig?.message || ''} 
        type={alertConfig?.type || 'error'} 
        onClose={() => setAlertConfig(null)} 
      />
    </div>
  );
}

export default function BuyerOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate">Loading orders...</div>}>
      <BuyerOrdersContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CONDITION_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PERFECT: { label: "Perfect", color: "text-success", bg: "bg-success-bg" },
  GOOD: { label: "Good", color: "text-brand-700", bg: "bg-brand-50" },
  FAIR: { label: "Fair", color: "text-warning", bg: "bg-warning-bg" },
  POOR: { label: "Poor", color: "text-orange-700", bg: "bg-orange-50" },
  BROKEN: { label: "Broken", color: "text-danger", bg: "bg-danger-bg" },
};

export default function BuyerAssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAsset, setEditAsset] = useState<any>(null);
  
  const [alertConfig, setAlertConfig] = useState<{message: string} | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{message: string, onConfirm: () => void} | null>(null);
  
  const [form, setForm] = useState({ name: "", type: "", notes: "" });
  const [addConditions, setAddConditions] = useState<Record<string, string>>({ PERFECT: "1", GOOD: "", FAIR: "", POOR: "", BROKEN: "" });
  const [editFields, setEditFields] = useState({ condition: "PERFECT", quantity: "1" });
  const [isCustomType, setIsCustomType] = useState(false);

  const PREDEFINED_CATEGORIES = ["Electronics", "Furniture", "Hardware", "Software", "Office Supplies", "Vehicle"];

  const token = () => localStorage.getItem("access_token");
  const api = (path: string, opts?: any) => fetch(`${process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:3001`}${path}`, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...opts?.headers } });

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await api("/assets");
      if (res.ok) setAssets(await res.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAssets(); }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const entries = Object.entries(addConditions).filter(([_, qty]) => Number(qty) > 0);
      if (entries.length === 0) {
         setAlertConfig({ message: "Please enter a quantity for at least one condition." });
         return;
      }

      if (editAsset) {
        const [firstCond, firstQty] = entries[0];
        await api(`/assets/${editAsset.id}`, { method: "PATCH", body: JSON.stringify({ condition: firstCond, quantity: Number(firstQty), notes: form.notes }) });
        
        if (entries.length > 1) {
          const promises = entries.slice(1).map(([cond, qty]) => {
             return api("/assets", { method: "POST", body: JSON.stringify({ ...form, condition: cond, quantity: Number(qty), sourceOrderId: editAsset.sourceOrderId }) });
          });
          await Promise.all(promises);
        }
      } else {
        const promises = entries.map(([cond, qty]) => {
           return api("/assets", { method: "POST", body: JSON.stringify({ ...form, condition: cond, quantity: Number(qty) }) });
        });
        await Promise.all(promises);
      }
      closeModal();
      fetchAssets();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    setConfirmConfig({
      message: "Are you sure you want to delete this asset?",
      onConfirm: async () => {
        try {
          await api(`/assets/${id}`, { method: "DELETE" });
          fetchAssets();
        } catch (e) { console.error(e); }
        setConfirmConfig(null);
      }
    });
  };

  const openEdit = (a: any) => {
    setEditAsset(a);
    setForm({ name: a.name, type: a.type, notes: a.notes || "" });
    setIsCustomType(!PREDEFINED_CATEGORIES.includes(a.type));
    const newConds: Record<string, string> = { PERFECT: "", GOOD: "", FAIR: "", POOR: "", BROKEN: "" };
    newConds[a.condition] = a.quantity.toString();
    setAddConditions(newConds);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditAsset(null);
    setForm({ name: "", type: "", notes: "" });
    setIsCustomType(false);
    setAddConditions({ PERFECT: "1", GOOD: "", FAIR: "", POOR: "", BROKEN: "" });
    setEditFields({ condition: "PERFECT", quantity: "1" });
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-ink tracking-tight">Asset Management</h2>
          <p className="text-sm text-muted mt-1">Track and manage your procured company assets.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="cp-btn cp-btn--primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Asset
        </button>
      </div>

      {loading ? (
        <div className="py-16 flex items-center justify-center bg-surface border border-border rounded-xl">
          <svg className="animate-spin h-6 w-6 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
      ) : assets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {assets.map(a => {
            const st = CONDITION_CONFIG[a.condition] || CONDITION_CONFIG.PERFECT;
            return (
              <div key={a.id} className="cp-card group flex flex-col h-full hover:border-brand-200 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-[15px] font-bold text-ink">{a.name}</h3>
                    <p className="text-[12px] text-muted mt-0.5">{a.type}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${st.color} ${st.bg}`}>
                    {st.label}
                  </span>
                </div>
                
                <div className="flex items-center gap-6 mt-2 mb-4 bg-surface-2 p-3 rounded-lg border border-border/50">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted mb-0.5">Quantity</p>
                    <p className="font-bold text-ink text-[15px] tabular-nums">{a.quantity}</p>
                  </div>
                  {a.sourceOrder && (
                    <div className="pl-6 border-l border-border/50">
                      <p className="text-[10px] uppercase font-bold text-muted mb-0.5">Source</p>
                      <p className="font-mono text-ink text-[13px] mt-0.5 cursor-help" title={`Procured via Order #${a.sourceOrder.orderNumber}`}>
                        {a.sourceOrder.orderNumber}
                      </p>
                    </div>
                  )}
                </div>

                {a.notes && (
                  <p className="text-[13px] text-ink mt-auto mb-4 p-3 bg-surface-3 rounded-lg italic border-l-2 border-brand-300 leading-relaxed">
                    "{a.notes}"
                  </p>
                )}

                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border">
                  <span className="text-[11px] font-medium text-muted mr-auto">Added {new Date(a.createdAt).toLocaleDateString('en-IN')}</span>
                  <button onClick={() => openEdit(a)} className="text-[13px] font-bold text-ink hover:text-brand-600 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(a.id)} className="text-[13px] font-bold text-danger hover:text-danger-hover transition-colors">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center bg-surface border border-border rounded-xl">
          <div className="h-16 w-16 rounded-full bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h3 className="text-lg font-bold text-ink">No assets found</h3>
          <p className="text-[13px] text-muted mt-1.5 max-w-sm mx-auto">Add your company assets manually or they will appear here automatically when orders are delivered.</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeModal}></div>
          <div className="relative w-full max-w-md bg-surface h-full shadow-2xl flex flex-col animate-in slide-in-from-right-8 duration-300">
            <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surface">
              <div>
                <h2 className="text-[18px] font-bold text-ink">{editAsset ? "Update Asset" : "Add Asset"}</h2>
                <p className="text-[13px] text-muted mt-0.5">{editAsset ? "Update condition or quantity" : "Register a new company asset"}</p>
              </div>
              <button onClick={closeModal} className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center text-muted hover:text-ink hover:bg-border transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-canvas">
              <form id="asset-form" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[13px] font-semibold text-ink mb-2">Asset Name</label>
                  <input required disabled={!!editAsset} value={form.name} onChange={e => setForm({...form, name: e.target.value})} type="text"
                    className="cp-input text-[13px] disabled:opacity-50" placeholder="e.g. Dell XPS 15" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-ink mb-2">Type / Category</label>
                  <select 
                    required={!isCustomType} 
                    disabled={!!editAsset} 
                    value={isCustomType ? "Other" : (form.type || "")} 
                    onChange={e => {
                      if (e.target.value === "Other") {
                        setIsCustomType(true);
                        setForm({...form, type: ""});
                      } else {
                        setIsCustomType(false);
                        setForm({...form, type: e.target.value});
                      }
                    }}
                    className={`cp-input text-[13px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isCustomType ? 'mb-3' : ''}`}
                  >
                    <option value="" disabled>Select a category</option>
                    {PREDEFINED_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    <option value="Other">Other (Custom)</option>
                  </select>
                  
                  {isCustomType && (
                    <input 
                      required 
                      disabled={!!editAsset} 
                      value={form.type} 
                      onChange={e => setForm({...form, type: e.target.value})} 
                      type="text"
                      className="cp-input text-[13px] disabled:opacity-50 animate-in slide-in-from-top-1 fade-in duration-200" 
                      placeholder="Enter custom category name..." 
                      autoFocus
                    />
                  )}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-ink mb-3">Quantities by Condition</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(CONDITION_CONFIG).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-3 bg-surface p-2.5 border border-border rounded-lg shadow-sm">
                        <label className={`text-[11px] font-bold uppercase tracking-wider w-16 shrink-0 ${v.color}`}>{v.label}</label>
                        <input type="number" min="0" placeholder="0" value={addConditions[k] || ''} onChange={e => setAddConditions({...addConditions, [k]: e.target.value})}
                          className="flex-1 w-full px-2 py-1.5 bg-surface-2 border border-border rounded-md text-[13px] font-bold tabular-nums outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-ink mb-2">Notes (optional)</label>
                  <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3}
                    className="cp-input text-[13px] resize-none" placeholder="Serial numbers, assignments..." />
                </div>
              </form>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-3 bg-surface shrink-0">
              <button type="button" onClick={closeModal} className="cp-btn cp-btn--secondary">Cancel</button>
              <button type="submit" form="asset-form" className="cp-btn cp-btn--primary">{editAsset ? "Update Asset" : "Save Asset"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Box */}
      {alertConfig && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setAlertConfig(null)}></div>
          <div className="relative bg-surface rounded-xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200 border border-border">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-warning-bg mb-4 ring-8 ring-warning-bg/50">
              <svg className="h-6 w-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-ink mb-2">Notice</h3>
            <p className="text-[13px] text-muted mb-6">{alertConfig.message}</p>
            <button onClick={() => setAlertConfig(null)} className="w-full cp-btn cp-btn--primary py-2.5">
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Custom Confirm Box */}
      {confirmConfig && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setConfirmConfig(null)}></div>
          <div className="relative bg-surface rounded-xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200 border border-border">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-danger-bg mb-4 ring-8 ring-danger-bg/50">
              <svg className="h-6 w-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-ink mb-2">Confirm Action</h3>
            <p className="text-[13px] text-muted mb-6">{confirmConfig.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmConfig(null)} className="flex-1 cp-btn cp-btn--secondary py-2.5">
                Cancel
              </button>
              <button onClick={confirmConfig.onConfirm} className="flex-1 bg-danger hover:bg-danger-hover text-white font-bold rounded-lg text-sm py-2.5 transition-colors shadow-sm">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

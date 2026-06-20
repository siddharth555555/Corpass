"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertModal, AlertType } from "@/components/ui/AlertModal";

const CATEGORIES = {
  "Office Supplies": ["Paper & Notebooks", "Pens & Writing", "Desk Accessories", "Binders & Folders", "Sticky Notes"],
  "Furniture": ["Desks", "Ergonomic Chairs", "Filing Cabinets", "Conference Tables", "Sofas & Lounge"],
  "Corporate Gifting": ["Apparel", "Tech Gadgets", "Drinkware", "Gift Hampers", "Awards & Trophies"],
  "IT & Electronics": ["Laptops", "Peripherals", "Networking", "Monitors", "Printers & Scanners", "Servers"],
  "Software & SaaS": ["Productivity Tools", "Security Software", "CRM & Sales", "ERP Systems", "Design Software"],
  "Pantry & Breakroom": ["Utensils", "Snacks", "Beverages", "Coffee & Tea", "Appliances"],
  "Industrial Supplies": ["Hand Tools", "Power Tools", "Safety Equipment (PPE)", "Hardware & Fasteners", "Electrical"],
  "Janitorial & Cleaning": ["Cleaning Chemicals", "Trash Bags & Bins", "Dispensers", "Mops & Brooms", "Paper Towels"],
  "Packaging Materials": ["Corrugated Boxes", "Packing Tape", "Bubble Wrap", "Mailers & Envelopes", "Stretch Wrap"],
  "Printing & Signage": ["Business Cards", "Banners & Signs", "Brochures & Flyers", "Custom Merchandise"],
  "Professional Services": ["Consulting", "Marketing & PR", "Legal Services", "Accounting & Finance", "IT Support"],
  "Other": ["General", "Custom"]
};

const UOM_GROUPS = {
  "Countable": [
    { value: "PIECE", label: "Piece" },
    { value: "PAIR", label: "Pair" },
    { value: "SET", label: "Set" },
    { value: "DOZEN", label: "Dozen" },
  ],
  "Composite (define pack size)": [
    { value: "PACK", label: "Pack" },
    { value: "BUNDLE", label: "Bundle" },
    { value: "BOX", label: "Box" },
    { value: "CARTON", label: "Carton" },
    { value: "CASE", label: "Case" },
  ],
  "Weight": [
    { value: "GRAM", label: "Gram" },
    { value: "KILOGRAM", label: "Kilogram" },
    { value: "QUINTAL", label: "Quintal" },
    { value: "TONNE", label: "Tonne" },
  ],
  "Volume": [
    { value: "MILLILITRE", label: "Millilitre" },
    { value: "LITRE", label: "Litre" },
  ],
  "Length / Area": [
    { value: "METRE", label: "Metre" },
    { value: "FOOT", label: "Foot" },
    { value: "ROLL", label: "Roll" },
    { value: "SQ_FOOT", label: "Sq. Foot" },
    { value: "SQ_METRE", label: "Sq. Metre" },
  ],
  "Service": [
    { value: "HOUR", label: "Hour" },
    { value: "DAY", label: "Day" },
    { value: "MONTH", label: "Month" },
    { value: "YEAR", label: "Year" },
    { value: "PROJECT", label: "Project" },
  ],
};

const COMPOSITE_UNITS = ["PACK", "BUNDLE", "BOX", "CARTON", "CASE"];

function getUnitLabel(unit: string): string {
  for (const group of Object.values(UOM_GROUPS)) {
    const found = group.find(u => u.value === unit);
    if (found) return found.label;
  }
  return unit;
}

function formatPrice(p: any): string {
  const unitLabel = getUnitLabel(p.pricingUnit || "PIECE");
  const packInfo = p.piecesPerUnit ? ` (${p.piecesPerUnit} pcs)` : '';
  if (p.priceType === 'FIXED') {
    return `₹${p.price} / ${unitLabel}${packInfo}`;
  }
  return `Quote (From ₹${p.price || 0}) / ${unitLabel}${packInfo}`;
}

export default function SellerProductCatalog() {
  const router = useRouter();
  const [alertConfig, setAlertConfig] = useState<{message: string, type: AlertType} | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const [deliveryCities, setDeliveryCities] = useState<any[]>([]);
  const [deliveryPincodes, setDeliveryPincodes] = useState<string[]>([]);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [citySearchResults, setCitySearchResults] = useState<any[]>([]);
  const [pincodeInput, setPincodeInput] = useState("");

  useEffect(() => {
    if (citySearchQuery.length < 2) {
      setCitySearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`http://${window.location.hostname}:3001/cities?q=${citySearchQuery}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const json = await res.json();
          setCitySearchResults(json.data || json);
        }
      } catch (e) {}
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [citySearchQuery]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number }> = {};
    products.forEach(p => {
      if (!stats[p.category]) stats[p.category] = { count: 0 };
      stats[p.category].count++;
    });
    return stats;
  }, [products]);

  const [formData, setFormData] = useState<any>({
    name: "", description: "", category: "Office Supplies", subCategory: "Paper & Notebooks",
    priceType: "FIXED", price: "", pricingUnit: "PIECE", piecesPerUnit: "",
    isDeliverable: true, deliveryRange: "SHIPPING_AVAILABLE", minQtyPurchase: "1", minAmountPurchase: "0", deliveryTimeDays: "3", stockQuantity: "0",
    images: [],
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return router.push("/login");

      const resProducts = await fetch(`http://${window.location.hostname}:3001/products`, { headers: { Authorization: `Bearer ${token}` } });
      
      if (resProducts.ok) {
        const prodData = await resProducts.json();
        setProducts(Array.isArray(prodData) ? prodData : prodData.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCategoryChange = (e: any) => {
    const cat = e.target.value;
    setFormData({ ...formData, category: cat, subCategory: CATEGORIES[cat as keyof typeof CATEGORIES][0] });
  };

  const handleEditProduct = (product: any) => {
    setEditingProductId(product.id);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "Office Supplies",
      subCategory: product.subCategory || "Paper & Notebooks",
      priceType: product.priceType || "FIXED",
      price: product.price || "",
      pricingUnit: product.pricingUnit || "PIECE",
      piecesPerUnit: product.piecesPerUnit || "",
      isDeliverable: product.isDeliverable ?? true,
      deliveryRange: product.deliveryRange || "SHIPPING_AVAILABLE",
      minQtyPurchase: product.minQtyPurchase || "1",
      minAmountPurchase: product.minAmountPurchase || "0",
      deliveryTimeDays: product.deliveryTimeDays || "3",
      stockQuantity: product.stockQuantity || "0",
      images: product.images || [],
    });
    setDeliveryCities(product.deliveryCities || []);
    setDeliveryPincodes(product.deliveryPincodes || []);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingProductId ? `http://${window.location.hostname}:3001/products/${editingProductId}` : `http://${window.location.hostname}:3001/products`;
      const method = editingProductId ? "PATCH" : "POST";
      const payload = { ...formData, deliveryCities, deliveryPincodes };
      if (editingProductId) {
        delete payload.stockQuantity; // Do not edit stock from here
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingProductId(null);
        setFormData({
          name: "", description: "", category: "Office Supplies", subCategory: "Paper & Notebooks",
          priceType: "FIXED", price: "", pricingUnit: "PIECE", piecesPerUnit: "",
          isDeliverable: true, deliveryRange: "SHIPPING_AVAILABLE", minQtyPurchase: "1", minAmountPurchase: "0", deliveryTimeDays: "3", stockQuantity: "0",
          images: [],
        });
        fetchData();
      } else {
        const err = await res.json();
        const msg = Array.isArray(err.message) ? err.message.join(', ') : err.message;
        setAlertConfig({ message: msg || "Failed to save product", type: "error" });
      }
    } catch (e) { console.error(e); } finally { setSubmitting(false); }
  };

  const isComposite = COMPOSITE_UNITS.includes(formData.pricingUnit);
  const currentUnitLabel = getUnitLabel(formData.pricingUnit);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Product Catalog</h1>
          <p className="text-sm text-slate mt-1">Manage your product listings and pricing.</p>
        </div>
        <button onClick={() => { setEditingProductId(null); setIsModalOpen(true); setDeliveryCities([]); setDeliveryPincodes([]); setFormData({ name: "", description: "", category: "Office Supplies", subCategory: "Paper & Notebooks", priceType: "FIXED", price: "", pricingUnit: "PIECE", piecesPerUnit: "", isDeliverable: true, deliveryRange: "SHIPPING_AVAILABLE", minQtyPurchase: "1", minAmountPurchase: "0", deliveryTimeDays: "3", stockQuantity: "0", images: [] }); }} className="cp-btn cp-btn--primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Product
        </button>
      </div>

      <div className="cp-card p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 mb-6" style={{ backgroundColor: 'var(--cp-surface-2)' }}>
        <h3 className="text-[16px] font-[600] text-[var(--cp-text)] whitespace-nowrap">All Products</h3>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cp-input cp-search pl-9"
            />
            <svg className="w-4 h-4 text-[var(--cp-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="cp-input w-auto cursor-pointer"
          >
            <option value="All">All Categories</option>
            {Object.keys(categoryStats).map(cat => (
              <option key={cat} value={cat}>{cat} ({categoryStats[cat].count})</option>
            ))}
          </select>
        </div>
      </div>
        
      <div className="flex-1 overflow-y-auto pr-2 pb-10">
        {loading ? (
           <div className="py-12 text-center text-slate text-sm">Loading inventory...</div>
        ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
              {products.filter(p => {
                const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCategory = filterCategory === "All" || p.category === filterCategory;
                return matchesSearch && matchesCategory;
              }).map((p) => (
                <div key={p.id} className="cp-card cp-card--flush flex flex-col group transition-all duration-300 hover:shadow-md">
                  <div className="h-48 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: 'var(--cp-surface-3)', borderBottom: '1px solid var(--cp-border)' }}>
                    {p.images && p.images.length > 0 ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <svg className="w-12 h-12" style={{ color: 'var(--cp-text-disabled)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditProduct(p)} className="h-8 w-8 bg-white/90 backdrop-blur-sm border rounded-full flex items-center justify-center shadow-sm transition-colors" style={{ borderColor: 'var(--cp-border)', color: 'var(--cp-text-secondary)' }} title="Edit Product">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <span className="cp-badge cp-badge--neutral uppercase tracking-wider text-[11px]">{p.category}</span>
                    </div>
                  </div>
                  
                  <div className="p-[var(--cp-card-padding)] flex-1 flex flex-col">
                    <h3 className="text-[16px] font-[700] leading-tight mb-1 line-clamp-1" style={{ color: 'var(--cp-text)' }} title={p.name}>{p.name}</h3>
                    <p className="text-[13px] line-clamp-2 mb-4 leading-relaxed h-10" style={{ color: 'var(--cp-text-muted)' }}>{p.description}</p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-2.5 border" style={{ backgroundColor: 'var(--cp-surface-3)', borderRadius: 'var(--cp-radius-sm)', borderColor: 'var(--cp-border)' }}>
                        <p className="text-[11px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--cp-text-muted)' }}>Stock</p>
                        <p className={`text-[15px] font-[600] tabular-nums leading-none mt-1 ${p.stockQuantity <= 10 ? 'text-[var(--cp-danger)]' : 'text-[var(--cp-text)]'}`}>
                          {p.stockQuantity}
                        </p>
                      </div>
                      <div className="p-2.5 border" style={{ backgroundColor: 'var(--cp-surface-3)', borderRadius: 'var(--cp-radius-sm)', borderColor: 'var(--cp-border)' }}>
                        <p className="text-[11px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--cp-text-muted)' }}>Delivery</p>
                        <p className="text-[15px] font-[600] tabular-nums leading-none mt-1" style={{ color: 'var(--cp-text)' }}>
                          {p.isDeliverable ? `${p.deliveryTimeDays} days` : 'Pickup'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto pt-3 border-t flex flex-col" style={{ borderColor: 'var(--cp-border)' }}>
                      <span className="text-[11px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--cp-text-muted)' }}>Pricing</span>
                      <div className="flex items-baseline gap-1.5">
                        {p.priceType === 'FIXED' ? (
                          <>
                            <span className="text-[16px] font-[700] tabular-nums" style={{ color: 'var(--cp-text)' }}>₹{Number(p.price).toLocaleString('en-IN')}</span>
                            <span className="text-[13px]" style={{ color: 'var(--cp-text-muted)' }}>/ {getUnitLabel(p.pricingUnit)}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-[14px] font-[700]" style={{ color: 'var(--cp-danger)' }}>Quote Required</span>
                            <span className="text-[11px] ml-auto font-[500]" style={{ color: 'var(--cp-text-muted)' }}>From ₹{Number(p.price || 0).toLocaleString('en-IN')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
             ))}
           </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="h-10 w-10 rounded-full bg-paper-2 border border-border flex items-center justify-center mb-3">
              <svg className="h-5 w-5 text-slate" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-ink">No products listed</h3>
            <p className="mt-1 text-sm text-slate max-w-sm mx-auto">
              Build your catalog to start receiving orders from corporate buyers.
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="fixed inset-0 bg-primary-600/40 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-paper h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h2 className="text-lg font-semibold text-ink">{editingProductId ? 'Edit Product' : 'List New Product'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate hover:text-slate transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form id="add-product-form" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Product Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full px-3 py-2 bg-paper border border-border rounded text-sm text-ink focus:border-ink focus:ring-1 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-3 py-2 bg-paper border border-border rounded text-sm text-ink focus:border-ink focus:ring-1 focus:ring-primary-500 outline-none"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Category</label>
                    <select value={formData.category} onChange={handleCategoryChange} className="w-full px-3 py-2 bg-paper border border-border rounded text-sm text-ink focus:border-ink outline-none">
                      {Object.keys(CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Subcategory</label>
                    <select value={formData.subCategory} onChange={e => setFormData({...formData, subCategory: e.target.value})} className="w-full px-3 py-2 bg-paper border border-border rounded text-sm text-ink focus:border-ink outline-none">
                      {CATEGORIES[formData.category as keyof typeof CATEGORIES].map((sub: string) => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="pt-2 border-t border-border">
                  <label className="block text-sm font-medium text-ink mb-2">Pricing Structure</label>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <button type="button" onClick={() => setFormData({...formData, priceType: 'FIXED'})} className={`px-4 py-2 text-sm font-medium rounded border transition-colors ${formData.priceType === 'FIXED' ? 'bg-paper-2 border-ink text-primary-700' : 'bg-paper border-border text-slate hover:bg-paper-2'}`}>Fixed Price</button>
                    <button type="button" onClick={() => setFormData({...formData, priceType: 'CONTACT_FOR_QUOTE'})} className={`px-4 py-2 text-sm font-medium rounded border transition-colors ${formData.priceType === 'CONTACT_FOR_QUOTE' ? 'bg-paper-2 border-ink text-primary-700' : 'bg-paper border-border text-slate hover:bg-paper-2'}`}>Quote Base</button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate mb-1">₹ per {currentUnitLabel}{formData.piecesPerUnit ? ` (${formData.piecesPerUnit} pcs)` : ''}</label>
                      <input required={formData.priceType === 'FIXED'} value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} type="number" min="0" className="w-full px-3 py-2 bg-paper border border-border rounded text-sm text-ink focus:border-ink outline-none" placeholder="Amount" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate mb-1">Unit of Measure</label>
                      <select value={formData.pricingUnit} onChange={e => setFormData({...formData, pricingUnit: e.target.value, piecesPerUnit: ""})} className="w-full px-3 py-2 bg-paper border border-border rounded text-sm text-ink focus:border-ink outline-none">
                        {Object.entries(UOM_GROUPS).map(([group, units]) => (
                          <optgroup key={group} label={group}>
                            {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </div>

                  {isComposite && (
                    <div className="mt-3 p-3 bg-paper-2 border border-border rounded">
                      <label className="block text-xs font-medium text-slate mb-1">Pieces per {currentUnitLabel} <span className="text-slate">(optional)</span></label>
                      <input value={formData.piecesPerUnit} onChange={e => setFormData({...formData, piecesPerUnit: e.target.value})} type="number" min="1" className="w-full px-3 py-2 bg-paper border border-border rounded text-sm text-ink focus:border-ink outline-none" placeholder={`e.g. 1 ${currentUnitLabel} = 24 Pieces`} />
                    </div>
                  )}
                </div>

                {/* Quantity & Delivery */}
                <div className="pt-2 border-t border-border space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate mb-1">{editingProductId ? 'Current Stock Qty' : 'Initial Stock Qty'}</label>
                      <input disabled={!!editingProductId} required value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} type="number" min="0" className="w-full px-3 py-2 bg-paper border border-border rounded text-sm text-ink focus:border-ink outline-none disabled:opacity-50 disabled:bg-paper-2" title={editingProductId ? "Manage stock in the Stock tab" : ""} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate mb-1">Min. Purchase Qty</label>
                      <input required value={formData.minQtyPurchase} onChange={e => setFormData({...formData, minQtyPurchase: e.target.value})} type="number" min="1" className="w-full px-3 py-2 bg-paper border border-border rounded text-sm text-ink focus:border-ink outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate mb-1">Min. Order Value (₹)</label>
                      <input required value={formData.minAmountPurchase} onChange={e => setFormData({...formData, minAmountPurchase: e.target.value})} type="number" min="0" className="w-full px-3 py-2 bg-paper border border-border rounded text-sm text-ink focus:border-ink outline-none" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-paper-2 border border-border rounded">
                    <div>
                      <p className="text-sm font-medium text-ink">Physical Delivery</p>
                      <p className="text-xs text-slate mt-0.5">Toggle off for services (consulting, SaaS, etc.)</p>
                    </div>
                    <button type="button" onClick={() => setFormData({...formData, isDeliverable: !formData.isDeliverable})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isDeliverable ? 'bg-ink' : 'bg-paper-2'}`}>
                      <span className={`inline-block h-4 w-4 rounded-full bg-paper transition-transform shadow-sm ${formData.isDeliverable ? 'translate-x-6' : 'translate-x-1'}`}></span>
                    </button>
                  </div>

                  {formData.isDeliverable && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate mb-1">Delivery Time (Days)</label>
                        <input required value={formData.deliveryTimeDays} onChange={e => setFormData({...formData, deliveryTimeDays: e.target.value})} type="number" min="0" className="w-full px-3 py-2 bg-paper border border-border rounded text-sm text-ink focus:border-ink outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate mb-1">Delivery Range</label>
                        <select value={formData.deliveryRange} onChange={e => setFormData({...formData, deliveryRange: e.target.value})} className="w-full px-3 py-2 bg-paper border border-border rounded text-sm text-ink focus:border-ink outline-none">
                          <option value="HYPER_LOCAL_20KM">Hyper Local</option>
                          <option value="LOCAL_100KM">Local</option>
                          <option value="SHIPPING_AVAILABLE">Pan India</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {formData.isDeliverable && formData.deliveryRange === 'LOCAL_100KM' && (
                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-slate mb-1.5">Deliverable Cities</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {deliveryCities.map((c, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-paper-2 border border-border text-ink">
                            {c.name}
                            <button type="button" onClick={() => setDeliveryCities(deliveryCities.filter((_, idx) => idx !== i))} className="text-slate hover:text-rose-500 transition-colors">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="relative">
                        <input 
                          value={citySearchQuery} 
                          onChange={e => setCitySearchQuery(e.target.value)} 
                          type="text" 
                          className="w-full px-4 py-2 bg-paper border border-border rounded text-sm text-ink focus:border-ink outline-none transition-all" 
                          placeholder="Search and add cities..." 
                        />
                        {citySearchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-paper border border-border rounded shadow-lg max-h-48 overflow-y-auto z-50">
                            {citySearchResults.map((city, i) => (
                              <button 
                                key={i} 
                                type="button"
                                onClick={() => {
                                  if (!deliveryCities.find(c => c.name === city.name)) {
                                    setDeliveryCities([...deliveryCities, city]);
                                  }
                                  setCitySearchQuery("");
                                  setCitySearchResults([]);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-paper-2 transition-colors border-b border-border last:border-b-0"
                              >
                                {city.name}, <span className="text-slate">{city.state}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {formData.isDeliverable && formData.deliveryRange === 'HYPER_LOCAL_20KM' && (
                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-slate mb-1.5">Deliverable Pincodes</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {deliveryPincodes.map((pin, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-paper-2 border border-border text-ink">
                            {pin}
                            <button type="button" onClick={() => setDeliveryPincodes(deliveryPincodes.filter((_, idx) => idx !== i))} className="text-slate hover:text-rose-500 transition-colors">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </span>
                        ))}
                      </div>
                      <input 
                        value={pincodeInput} 
                        onChange={e => setPincodeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            const newPin = pincodeInput.trim();
                            if (newPin && !deliveryPincodes.includes(newPin)) {
                              setDeliveryPincodes([...deliveryPincodes, newPin]);
                            }
                            setPincodeInput("");
                          }
                        }}
                        type="text" 
                        className="w-full px-4 py-2 bg-paper border border-border rounded text-sm text-ink focus:border-ink outline-none transition-all" 
                        placeholder="Type pincode and press Enter" 
                      />
                    </div>
                  )}

                  {/* Product Images (Max 5) */}
                  <div className="pt-2 border-t border-border">
                    <label className="block text-sm font-medium text-ink mb-1">Product Images (Max 5)</label>
                    <p className="text-xs text-slate mb-3">Add up to 5 optimized product images.</p>
                    
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {formData.images.map((imgUrl: string, idx: number) => (
                        <div key={idx} className="relative aspect-square rounded border border-border overflow-hidden bg-paper-2 group">
                          <img src={imgUrl} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...formData.images];
                              updated.splice(idx, 1);
                              setFormData({ ...formData, images: updated });
                            }}
                            className="absolute inset-0 bg-rose-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      
                      {formData.images.length < 5 && (
                        <label className="aspect-square border border-dashed border-border hover:border-ink rounded flex flex-col items-center justify-center cursor-pointer transition-colors bg-paper hover:bg-paper-2">
                          <svg className="w-5 h-5 text-slate" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-[10px] text-slate mt-1">Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > 5 * 1024 * 1024) {
                                setAlertConfig({ message: "File size exceeds 5MB limit", type: "error" });
                                return;
                              }
                              
                              const uploadData = new FormData();
                              uploadData.append("file", file);
                              
                              try {
                                const token = localStorage.getItem("access_token");
                                const res = await fetch(`http://${window.location.hostname}:3001/media/upload`, {
                                  method: "POST",
                                  headers: {
                                    Authorization: `Bearer ${token}`
                                  },
                                  body: uploadData
                                });
                                
                                if (res.ok) {
                                  const data = await res.json();
                                  setFormData({
                                    ...formData,
                                    images: [...formData.images, data.url]
                                  });
                                } else {
                                  const err = await res.json();
                                  const msg = Array.isArray(err.message) ? err.message.join(', ') : err.message;
                                  setAlertConfig({ message: msg || "Failed to upload image", type: "error" });
                                }
                              } catch (err) {
                                console.error(err);
                                setAlertConfig({ message: "An error occurred during upload", type: "error" });
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-border bg-paper-2 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate bg-paper border border-border rounded hover:bg-border-subtle transition-colors">Cancel</button>
              <button type="submit" form="add-product-form" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-ink rounded hover:bg-ink transition-colors disabled:opacity-50">{editingProductId ? 'Save Changes' : 'Publish Product'}</button>
            </div>
          </div>
        </div>
      )}

      <AlertModal 
        isOpen={!!alertConfig} 
        message={alertConfig?.message || ''} 
        type={alertConfig?.type || 'error'} 
        onClose={() => setAlertConfig(null)} 
      />
    </div>
  );
}

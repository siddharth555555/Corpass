"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<any>({
    name: "", description: "", category: "Office Supplies", subCategory: "Paper & Notebooks",
    priceType: "FIXED", price: "", pricingUnit: "PIECE", piecesPerUnit: "",
    isDeliverable: true, minQtyPurchase: "1", minAmountPurchase: "0", deliveryTimeDays: "3", stockQuantity: "0",
    images: [],
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return router.push("/login");

      const resProducts = await fetch(`http://${window.location.hostname}:3001/products`, { headers: { Authorization: `Bearer ${token}` } });
      
      if (resProducts.ok) setProducts(await resProducts.json());
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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          name: "", description: "", category: "Office Supplies", subCategory: "Paper & Notebooks",
          priceType: "FIXED", price: "", pricingUnit: "PIECE", piecesPerUnit: "",
          isDeliverable: true, minQtyPurchase: "1", minAmountPurchase: "0", deliveryTimeDays: "3", stockQuantity: "0",
          images: [],
        });
        fetchData();
      }
    } catch (e) { console.error(e); } finally { setSubmitting(false); }
  };

  const isComposite = COMPOSITE_UNITS.includes(formData.pricingUnit);
  const currentUnitLabel = getUnitLabel(formData.pricingUnit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Product Catalog</h2>
          <p className="text-sm text-text-secondary mt-1">Manage your product listings and pricing.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center">
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Product
        </button>
      </div>

      <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle bg-surface-raised flex justify-between items-center">
          <h3 className="text-sm font-semibold text-text-primary">All Products</h3>
        </div>
        
        {loading ? (
           <div className="py-12 text-center text-text-secondary text-sm">Loading inventory...</div>
        ) : products.length > 0 ? (
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-border-subtle">
                   <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Product</th>
                   <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Category</th>
                   <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Stock</th>
                   <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Pricing</th>
                   <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Delivery</th>
                 </tr>
               </thead>
               <tbody>
                 {products.map((p) => (
                   <tr key={p.id} className="border-b border-border-subtle hover:bg-surface-raised transition-colors">
                     <td className="px-6 py-4 flex items-center gap-3">
                       {p.images && p.images.length > 0 ? (
                         <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-border-subtle shrink-0" />
                       ) : (
                         <div className="w-10 h-10 bg-surface-raised border border-border-subtle rounded-lg flex items-center justify-center shrink-0">
                           <svg className="w-5 h-5 text-text-tertiary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                           </svg>
                         </div>
                       )}
                       <div>
                         <p className="text-sm font-medium text-text-primary">{p.name}</p>
                         <p className="text-xs text-text-tertiary truncate max-w-xs">{p.description}</p>
                       </div>
                     </td>
                     <td className="px-6 py-4">
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700">{p.category}</span>
                     </td>
                     <td className="px-6 py-4">
                       <span className={`text-sm font-medium ${p.stockQuantity <= 10 ? 'text-rose-600' : 'text-text-primary'}`}>
                         {p.stockQuantity}
                       </span>
                     </td>
                     <td className="px-6 py-4">
                       <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${p.priceType === 'FIXED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                         {formatPrice(p)}
                       </span>
                     </td>
                     <td className="px-6 py-4">
                       <span className="text-xs text-text-secondary">
                         {p.isDeliverable ? `${p.deliveryTimeDays} days` : 'Service'}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="h-10 w-10 rounded-full bg-surface-raised border border-border-subtle flex items-center justify-center mb-3">
              <svg className="h-5 w-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-text-primary">No products listed</h3>
            <p className="mt-1 text-sm text-text-secondary max-w-sm mx-auto">
              Build your catalog to start receiving orders from corporate buyers.
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="fixed inset-0 bg-primary-600/40 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-surface h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center">
              <h2 className="text-lg font-semibold text-text-primary">List New Product</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-tertiary hover:text-text-secondary transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form id="add-product-form" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Product Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full px-3 py-2 bg-surface border border-border-subtle rounded-xl text-sm text-text-primary focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-3 py-2 bg-surface border border-border-subtle rounded-xl text-sm text-text-primary focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Category</label>
                    <select value={formData.category} onChange={handleCategoryChange} className="w-full px-3 py-2 bg-surface border border-border-subtle rounded-xl text-sm text-text-primary focus:border-primary-500 outline-none">
                      {Object.keys(CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Subcategory</label>
                    <select value={formData.subCategory} onChange={e => setFormData({...formData, subCategory: e.target.value})} className="w-full px-3 py-2 bg-surface border border-border-subtle rounded-xl text-sm text-text-primary focus:border-primary-500 outline-none">
                      {CATEGORIES[formData.category as keyof typeof CATEGORIES].map((sub: string) => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="pt-2 border-t border-border-subtle">
                  <label className="block text-sm font-medium text-text-primary mb-2">Pricing Structure</label>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <button type="button" onClick={() => setFormData({...formData, priceType: 'FIXED'})} className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors ${formData.priceType === 'FIXED' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-surface border-border-subtle text-text-secondary hover:bg-surface-raised'}`}>Fixed Price</button>
                    <button type="button" onClick={() => setFormData({...formData, priceType: 'CONTACT_FOR_QUOTE'})} className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors ${formData.priceType === 'CONTACT_FOR_QUOTE' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-surface border-border-subtle text-text-secondary hover:bg-surface-raised'}`}>Quote Base</button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">₹ per {currentUnitLabel}{formData.piecesPerUnit ? ` (${formData.piecesPerUnit} pcs)` : ''}</label>
                      <input required={formData.priceType === 'FIXED'} value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} type="number" min="0" className="w-full px-3 py-2 bg-surface border border-border-subtle rounded-xl text-sm text-text-primary focus:border-primary-500 outline-none" placeholder="Amount" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Unit of Measure</label>
                      <select value={formData.pricingUnit} onChange={e => setFormData({...formData, pricingUnit: e.target.value, piecesPerUnit: ""})} className="w-full px-3 py-2 bg-surface border border-border-subtle rounded-xl text-sm text-text-primary focus:border-primary-500 outline-none">
                        {Object.entries(UOM_GROUPS).map(([group, units]) => (
                          <optgroup key={group} label={group}>
                            {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </div>

                  {isComposite && (
                    <div className="mt-3 p-3 bg-surface-raised border border-border-subtle rounded-xl">
                      <label className="block text-xs font-medium text-text-secondary mb-1">Pieces per {currentUnitLabel} <span className="text-text-tertiary">(optional)</span></label>
                      <input value={formData.piecesPerUnit} onChange={e => setFormData({...formData, piecesPerUnit: e.target.value})} type="number" min="1" className="w-full px-3 py-2 bg-surface border border-border-subtle rounded-xl text-sm text-text-primary focus:border-primary-500 outline-none" placeholder={`e.g. 1 ${currentUnitLabel} = 24 Pieces`} />
                    </div>
                  )}
                </div>

                {/* Quantity & Delivery */}
                <div className="pt-2 border-t border-border-subtle space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Initial Stock Qty</label>
                      <input required value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} type="number" min="0" className="w-full px-3 py-2 bg-surface border border-border-subtle rounded-xl text-sm text-text-primary focus:border-primary-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Min. Purchase Qty</label>
                      <input required value={formData.minQtyPurchase} onChange={e => setFormData({...formData, minQtyPurchase: e.target.value})} type="number" min="1" className="w-full px-3 py-2 bg-surface border border-border-subtle rounded-xl text-sm text-text-primary focus:border-primary-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Min. Order Value (₹)</label>
                      <input required value={formData.minAmountPurchase} onChange={e => setFormData({...formData, minAmountPurchase: e.target.value})} type="number" min="0" className="w-full px-3 py-2 bg-surface border border-border-subtle rounded-xl text-sm text-text-primary focus:border-primary-500 outline-none" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-surface-raised border border-border-subtle rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Physical Delivery</p>
                      <p className="text-xs text-text-tertiary mt-0.5">Toggle off for services (consulting, SaaS, etc.)</p>
                    </div>
                    <button type="button" onClick={() => setFormData({...formData, isDeliverable: !formData.isDeliverable})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isDeliverable ? 'bg-primary-500' : 'bg-surface-raised'}`}>
                      <span className={`inline-block h-4 w-4 rounded-full bg-surface transition-transform shadow-sm ${formData.isDeliverable ? 'translate-x-6' : 'translate-x-1'}`}></span>
                    </button>
                  </div>

                  {formData.isDeliverable && (
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Delivery Time (Days)</label>
                      <input required value={formData.deliveryTimeDays} onChange={e => setFormData({...formData, deliveryTimeDays: e.target.value})} type="number" min="0" className="w-full px-3 py-2 bg-surface border border-border-subtle rounded-xl text-sm text-text-primary focus:border-primary-500 outline-none" />
                    </div>
                  )}

                  {/* Product Images (Max 5) */}
                  <div className="pt-2 border-t border-border-subtle">
                    <label className="block text-sm font-medium text-text-primary mb-1">Product Images (Max 5)</label>
                    <p className="text-xs text-text-tertiary mb-3">Add up to 5 optimized product images.</p>
                    
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {formData.images.map((imgUrl: string, idx: number) => (
                        <div key={idx} className="relative aspect-square rounded-xl border border-border-subtle overflow-hidden bg-surface-raised group">
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
                        <label className="aspect-square border border-dashed border-border-subtle hover:border-primary-500 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-surface hover:bg-surface-raised">
                          <svg className="w-5 h-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-[10px] text-text-tertiary mt-1">Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > 5 * 1024 * 1024) {
                                alert("File size exceeds 5MB limit");
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
                                  alert(err.message || "Failed to upload image");
                                }
                              } catch (err) {
                                console.error(err);
                                alert("An error occurred during upload");
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
            <div className="p-4 border-t border-border-subtle bg-surface-raised flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-text-secondary bg-surface border border-border-subtle rounded-xl hover:bg-border-subtle transition-colors">Cancel</button>
              <button type="submit" form="add-product-form" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50">Publish Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

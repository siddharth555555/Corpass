"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SellerStockManagement() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [quickAdjusts, setQuickAdjusts] = useState<Record<number, number>>({});
  
  // Stock update modal state
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newStock, setNewStock] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{message: string} | null>(null);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return router.push("/login");

      const res = await fetch(`http://${window.location.hostname}:3001/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) setProducts(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openUpdateModal = (product: any) => {
    setEditingProduct(product);
    setNewStock(product.stockQuantity?.toString() || "0");
  };

  const handleUpdateStock = async (e: any) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://${window.location.hostname}:3001/products/${editingProduct.id}/stock`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ stockQuantity: parseInt(newStock, 10) })
      });
      
      if (res.ok) {
        setEditingProduct(null);
        fetchProducts();
      } else {
        const err = await res.json();
        setAlertConfig({ message: err.message || "Failed to update stock" });
      }
    } catch (error) {
      console.error(error);
      setAlertConfig({ message: "An error occurred while updating stock" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLocalQuickAdjust = (productId: number, delta: number, currentStock: number) => {
    const currentAdjusted = quickAdjusts[productId] !== undefined ? quickAdjusts[productId] : currentStock;
    const newStock = Math.max(0, currentAdjusted + delta);
    setQuickAdjusts({ ...quickAdjusts, [productId]: newStock });
  };

  const confirmQuickAdjust = async (product: any) => {
    const adjustedStock = quickAdjusts[product.id];
    if (adjustedStock === undefined || adjustedStock === (product.stockQuantity || 0)) {
      const newAdjusts = { ...quickAdjusts };
      delete newAdjusts[product.id];
      setQuickAdjusts(newAdjusts);
      return;
    }
    
    // Optimistic UI Update
    setProducts(currentProducts => 
      currentProducts.map(p => 
        p.id === product.id ? { ...p, stockQuantity: adjustedStock } : p
      )
    );
    
    const newAdjusts = { ...quickAdjusts };
    delete newAdjusts[product.id];
    setQuickAdjusts(newAdjusts);
    
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://${window.location.hostname}:3001/products/${product.id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stockQuantity: adjustedStock })
      });
      if (!res.ok) {
         fetchProducts(); 
      }
    } catch (e) {
      console.error(e);
      fetchProducts(); 
    }
  };

  // KPIs
  const totalProducts = products.length;
  const outOfStockCount = products.filter(p => (p.stockQuantity || 0) <= 0).length;
  const lowStockCount = products.filter(p => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= (p.minQtyPurchase || 10)).length;

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.id?.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header & KPI Dashboard */}
      <div>
        <h2 className="text-3xl font-bold text-ink tracking-tight font-sans">Stock Command</h2>
        <p className="text-sm text-slate mt-1.5 max-w-2xl">Real-time inventory tactile control. Adjust levels instantly or monitor fill ratios at a glance.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="bg-paper border border-border rounded-xl p-5 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-5 opacity-10">
               <svg className="w-16 h-16 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
             </div>
             <p className="text-xs font-bold uppercase tracking-widest text-slate mb-1">Total Assets</p>
             <p className="text-4xl font-black text-ink tabular-nums tracking-tighter">{totalProducts}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-paper border border-amber-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-5 opacity-10">
               <svg className="w-16 h-16 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             </div>
             <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-1">Low Stock Alerts</p>
             <p className="text-4xl font-black text-amber-600 tabular-nums tracking-tighter">{lowStockCount}</p>
          </div>
          <div className="bg-gradient-to-br from-rose-50 to-paper border border-rose-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-5 opacity-10">
               <svg className="w-16 h-16 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <p className="text-xs font-bold uppercase tracking-widest text-rose-700 mb-1">Out of Stock</p>
             <p className="text-4xl font-black text-rose-600 tabular-nums tracking-tighter">{outOfStockCount}</p>
          </div>
        </div>
      </div>

      {/* Interactive Stock Grid */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h3 className="text-sm font-bold text-ink uppercase tracking-widest">Inventory Matrix</h3>
          <div className="relative w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Search products by name or SKU..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-paper-2 border border-border rounded-lg text-ink focus:border-ink focus:ring-1 focus:ring-ink outline-none transition-colors"
            />
            <svg className="w-4 h-4 text-slate absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {loading ? (
           <div className="py-20 flex flex-col items-center justify-center text-slate bg-paper border border-border rounded-xl">
             <svg className="animate-spin h-6 w-6 text-ink mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
             <p className="text-sm font-medium">Synchronizing Inventory Data...</p>
           </div>
        ) : filteredProducts.length > 0 ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
             {filteredProducts.map((p) => {
               const currentStock = p.stockQuantity || 0;
               const stock = quickAdjusts[p.id] !== undefined ? quickAdjusts[p.id] : currentStock;
               const isDirty = quickAdjusts[p.id] !== undefined && quickAdjusts[p.id] !== currentStock;
               const minQty = p.minQtyPurchase || 10;
               const isOutOfStock = currentStock <= 0;
               const isLowStock = currentStock > 0 && currentStock <= minQty;
               
               // Liquid Fill calculation
               const maxMeter = Math.max(minQty * 4, 100);
               const fillPercent = Math.min(100, (stock / maxMeter) * 100);
               
               return (
                 <div key={p.id} className={`relative bg-paper border ${isOutOfStock ? 'border-rose-200 shadow-sm shadow-rose-100' : isLowStock ? 'border-amber-200' : 'border-border'} rounded-2xl overflow-hidden group hover:-translate-y-1 hover:shadow-xl hover:border-ink/20 transition-all duration-300 min-h-[180px] flex flex-col justify-between`}>
                    
                    {/* Background Product Image */}
                    {p.images && p.images.length > 0 && (
                      <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-all duration-500 pointer-events-none">
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover mix-blend-multiply" />
                      </div>
                    )}
                    
                    {/* Liquid Fill Background */}
                    <div 
                      className={`absolute bottom-0 left-0 right-0 opacity-10 transition-all duration-1000 ease-in-out ${isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-money'}`} 
                      style={{ height: `${fillPercent}%` }} 
                    />
                    {/* Wave Top Detail */}
                    {fillPercent > 0 && fillPercent < 100 && (
                      <div 
                        className={`absolute left-0 right-0 h-1 opacity-20 ${isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-money'}`}
                        style={{ bottom: `${fillPercent}%` }}
                      />
                    )}
                    
                    {/* Header */}
                    <div className="p-5 relative z-10 flex justify-between items-start gap-3">
                       <div className="min-w-0">
                         <h3 className="font-bold text-ink truncate text-base leading-tight">{p.name}</h3>
                         <p className="text-[10px] text-slate font-mono mt-1 opacity-70">SKU: #{p.id}</p>
                       </div>
                       {isOutOfStock && (
                         <span className="shrink-0 flex h-2.5 w-2.5 relative mt-1">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                         </span>
                       )}
                    </div>

                    {/* Stock Value & Unit */}
                    <div className="px-5 pb-5 relative z-10 flex flex-col justify-end mt-auto h-full">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate mb-0.5">Available Stock</p>
                       <div className="flex items-baseline gap-1.5 transition-transform duration-300 group-hover:-translate-y-1">
                         <span className={`text-4xl font-black tabular-nums tracking-tighter leading-none ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-ink'}`}>
                           {stock}
                         </span>
                         <span className="text-xs text-slate font-medium uppercase">{p.pricingUnit === 'PIECE' ? 'pcs' : p.pricingUnit}</span>
                       </div>
                    </div>

                    {/* Quick Actions Hover Overlay */}
                    <div className="absolute inset-0 bg-paper/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4 z-20">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate">Quick Adjust</p>
                       <div className="flex items-center gap-2 bg-surface rounded-full p-1 border border-border shadow-inner">
                          <button onClick={() => handleLocalQuickAdjust(p.id, -1, currentStock)} className="w-10 h-10 rounded-full flex items-center justify-center text-ink hover:bg-white hover:shadow transition-all font-mono font-bold text-lg">-</button>
                          <span className="text-base font-black w-10 text-center tabular-nums text-ink">{stock}</span>
                          <button onClick={() => handleLocalQuickAdjust(p.id, 1, currentStock)} className="w-10 h-10 rounded-full flex items-center justify-center text-ink hover:bg-white hover:shadow transition-all font-mono font-bold text-lg">+</button>
                       </div>
                       
                       {isDirty ? (
                         <button onClick={() => confirmQuickAdjust(p)} className="px-4 py-1.5 bg-ink text-white text-xs font-bold rounded-md shadow-sm hover:bg-ink/90 transition-colors flex items-center gap-1 mt-1">
                           <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                           Confirm Update
                         </button>
                       ) : (
                         <button onClick={() => openUpdateModal(p)} className="text-[10px] font-bold text-ink hover:text-copper uppercase tracking-widest border-b border-ink/20 hover:border-copper transition-colors pb-0.5 mt-2">
                           Set Exact Value
                         </button>
                       )}
                    </div>
                 </div>
               );
             })}
           </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-border rounded-xl">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-paper-2 mb-4">
               <svg className="h-6 w-6 text-slate" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <h3 className="text-base font-semibold text-ink">No products found</h3>
            <p className="mt-1 text-sm text-slate">Add products to your catalog to start managing stock.</p>
          </div>
        )}
      </div>

      {/* Update Stock Modal (Set Exact Value) */}
      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-primary-900/40 backdrop-blur-sm transition-opacity" onClick={() => setEditingProduct(null)}></div>
          <div className="relative w-full max-w-sm bg-paper rounded-xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-ink">Set Exact Stock</h3>
                <p className="text-xs text-slate mt-1 font-mono">#{editingProduct.id} — {editingProduct.name}</p>
              </div>
              <button onClick={() => setEditingProduct(null)} className="text-slate hover:text-ink transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdateStock} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate mb-2">Quantity Available</label>
                <div className="relative">
                  <input 
                    required 
                    type="number" 
                    min="0" 
                    value={newStock} 
                    onChange={e => setNewStock(e.target.value)} 
                    className="w-full px-4 py-3 text-2xl font-black tabular-nums bg-surface border border-border rounded-lg text-ink focus:border-ink focus:ring-1 focus:ring-ink outline-none transition-all" 
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate uppercase">
                    {editingProduct.pricingUnit === 'PIECE' ? 'pcs' : editingProduct.pricingUnit}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <button 
                  type="button" 
                  onClick={() => setEditingProduct(null)} 
                  className="px-5 py-2.5 text-sm font-bold text-slate bg-surface border border-border rounded-lg hover:bg-paper-2 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="px-5 py-2.5 text-sm font-bold text-white bg-ink rounded-lg hover:bg-ink/90 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {submitting ? 'Applying...' : 'Apply Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Alert Box */}
      {alertConfig && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-primary-900/40 backdrop-blur-sm" onClick={() => setAlertConfig(null)}></div>
          <div className="relative bg-paper rounded-xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200 border border-border">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-50 mb-4 border border-rose-100">
              <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-ink mb-2">Action Failed</h3>
            <p className="text-sm text-slate mb-6">{alertConfig.message}</p>
            <button onClick={() => setAlertConfig(null)} className="w-full bg-ink hover:bg-ink/90 text-white font-bold rounded-lg text-sm py-3 transition-colors shadow-sm">
              Acknowledge
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

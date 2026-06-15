"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SellerStockManagement() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">Stock Management</h2>
          <p className="text-sm text-text-secondary mt-1">Monitor and update inventory levels for your products.</p>
        </div>
      </div>

      <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border-subtle bg-surface-raised flex justify-between items-center">
          <h3 className="text-sm font-semibold text-text-primary">Current Inventory</h3>
        </div>
        
        {loading ? (
           <div className="py-12 text-center text-text-secondary text-sm">Loading inventory...</div>
        ) : products.length > 0 ? (
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-border-subtle">
                   <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Product ID</th>
                   <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Product Name</th>
                   <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Category</th>
                   <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                   <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">In Stock</th>
                   <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {products.map((p) => {
                   const stock = p.stockQuantity || 0;
                   const isOutOfStock = stock <= 0;
                   const isLowStock = stock > 0 && stock <= (p.minQtyPurchase || 10);
                   
                   return (
                     <tr key={p.id} className="border-b border-border-subtle hover:bg-surface-raised transition-colors">
                       <td className="px-6 py-4 text-xs font-mono text-text-tertiary">#{p.id}</td>
                       <td className="px-6 py-4">
                         <p className="text-sm font-medium text-text-primary">{p.name}</p>
                       </td>
                       <td className="px-6 py-4">
                         <span className="text-xs text-text-secondary">{p.category}</span>
                       </td>
                       <td className="px-6 py-4">
                         {isOutOfStock ? (
                           <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 uppercase tracking-wider">Out of Stock</span>
                         ) : isLowStock ? (
                           <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 uppercase tracking-wider">Low Stock</span>
                         ) : (
                           <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 uppercase tracking-wider">In Stock</span>
                         )}
                       </td>
                       <td className="px-6 py-4">
                         <span className={`text-sm font-bold ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-text-primary'}`}>
                           {stock}
                         </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                         <button 
                           onClick={() => openUpdateModal(p)}
                           className="text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded transition-colors"
                         >
                           Update Stock
                         </button>
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
        ) : (
          <div className="py-12 text-center">
            <h3 className="text-base font-semibold text-text-primary">No products found</h3>
            <p className="mt-1 text-sm text-text-secondary">Add products to your catalog to start managing stock.</p>
          </div>
        )}
      </div>

      {/* Update Stock Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-primary-600/40 backdrop-blur-sm" onClick={() => setEditingProduct(null)}></div>
          <div className="relative w-full max-w-sm bg-surface rounded-xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-text-primary">Update Stock</h3>
                <p className="text-xs text-text-secondary mt-1">{editingProduct.name}</p>
              </div>
              <button onClick={() => setEditingProduct(null)} className="text-text-tertiary hover:text-text-secondary">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">New Stock Quantity</label>
                <input 
                  required 
                  type="number" 
                  min="0" 
                  value={newStock} 
                  onChange={e => setNewStock(e.target.value)} 
                  className="w-full px-3 py-2 bg-surface border border-border-subtle rounded-xl text-sm text-text-primary focus:border-primary-500 outline-none" 
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingProduct(null)} 
                  className="px-4 py-2 text-sm font-medium text-text-secondary bg-surface border border-border-subtle rounded-xl hover:bg-border-subtle transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Alert Box */}
      {alertConfig && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAlertConfig(null)}></div>
          <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Error</h3>
            <p className="text-sm text-text-secondary mb-6">{alertConfig.message}</p>
            <button onClick={() => setAlertConfig(null)} className="w-full btn-primary bg-red-600 hover:bg-red-700 border-none text-sm py-2.5">
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

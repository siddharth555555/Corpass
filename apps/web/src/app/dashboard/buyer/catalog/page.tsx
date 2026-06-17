"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { name: "Office Supplies", desc: "Stationery, paper, desk accessories" },
  { name: "Furniture", desc: "Desks, chairs, storage & more" },
  { name: "Corporate Gifting", desc: "Custom merchandise & gifts" },
  { name: "IT & Electronics", desc: "Tech, peripherals & accessories" },
  { name: "Pantry & Breakroom", desc: "Snacks, beverages & essentials" },
  { name: "Janitorial & Cleaning", desc: "Cleaning supplies & equipment" },
  { name: "Industrial Supplies", desc: "Tools, hardware & safety gear" },
  { name: "Packaging Materials", desc: "Boxes, tape & mailers" },
  { name: "Software & SaaS", desc: "Productivity & business tools" },
  { name: "Printing & Signage", desc: "Cards, banners & brochures" },
  { name: "Professional Services", desc: "Consulting, legal & finance" },
  { name: "Other", desc: "General & custom products" },
];

const UOM_LABELS: Record<string, string> = {
  PIECE: "Piece", PAIR: "Pair", SET: "Set", DOZEN: "Dozen",
  PACK: "Pack", BUNDLE: "Bundle", BOX: "Box", CARTON: "Carton", CASE: "Case",
  GRAM: "g", KILOGRAM: "Kg", QUINTAL: "Quintal", TONNE: "Tonne",
  MILLILITRE: "ml", LITRE: "L",
  METRE: "m", FOOT: "ft", ROLL: "Roll", SQ_FOOT: "sq.ft", SQ_METRE: "sq.m",
  HOUR: "Hour", DAY: "Day", MONTH: "Month", YEAR: "Year", PROJECT: "Project",
};

function formatPriceMain(p: any): string {
  if (p.priceType === 'FIXED') return `₹${Number(p.price).toLocaleString('en-IN')}`;
  return 'Get Quote';
}
function formatPriceUnit(p: any): string {
  const unit = UOM_LABELS[p.pricingUnit] || "Piece";
  const packInfo = p.piecesPerUnit ? ` (${p.piecesPerUnit} pcs)` : '';
  if (p.priceType === 'FIXED') return `per ${unit}${packInfo}`;
  return `from ₹${Number(p.price || 0).toLocaleString('en-IN')} / ${unit}${packInfo}`;
}

export default function BuyerMarketplace() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [minRating, setMinRating] = useState("");
  const [showAllProducts, setShowAllProducts] = useState(false);

  // Delivery config state
  const [buyerPincode, setBuyerPincode] = useState("");
  const [tempPincode, setTempPincode] = useState("");
  const [personalPincode, setPersonalPincode] = useState("");
  const [companyPincode, setCompanyPincode] = useState("");
  const [showUndeliverable, setShowUndeliverable] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetch(`http://${window.location.hostname}:3001/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.pincode) {
            setPersonalPincode(data.pincode);
            setBuyerPincode(prev => { if (!prev) { setTempPincode(data.pincode); return data.pincode; } return prev; });
          }
          if (data.company?.pincode) {
            setCompanyPincode(data.company.pincode);
            setBuyerPincode(prev => { if (!prev) { setTempPincode(data.company.pincode); return data.company.pincode; } return prev; });
          }
        });
    }
  }, []);

  // Bundle Cart State
  const [bundleCart, setBundleCart] = useState<any[]>([]);
  const clubbedPrice = bundleCart.reduce((total, p) => total + Number(p.price || 0), 0);
  const hasQuoteItems = bundleCart.some(p => p.priceType !== 'FIXED');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Inquiry Modal
  const [selectedProduct, setSelectedProduct] = useState<any>(null); // can be 'BUNDLE'
  const [inquiryType, setInquiryType] = useState('QUOTE');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Buy Now Modal
  const [buyProduct, setBuyProduct] = useState<any>(null);
  const [buyQty, setBuyQty] = useState('1');
  const [buyNote, setBuyNote] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState('');
  const [paymentMode, setPaymentMode] = useState('BANK_TRANSFER');
  const [buySubmitting, setBuySubmitting] = useState(false);

  const handleToggleBundle = (product: any) => {
    setBundleCart(prev => {
      if (prev.length === 0) return [product];
      if (prev.some(p => p.id === product.id)) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev[0].sellerProfileId !== product.sellerProfileId) {
        setAlertMessage("You can only bundle products from the same supplier. Please clear your current bundle first.");
        return prev;
      }
      return [...prev, product];
    });
  };

  const handleBuyNow = async (e: any) => {
    e.preventDefault();
    setBuySubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const finalBilling = billingSameAsShipping ? shippingAddress : billingAddress;
      if (!shippingAddress || !finalBilling) {
        setAlertMessage("Shipping and Billing addresses are required.");
        setBuySubmitting(false);
        return;
      }

      const res = await fetch(`http://${window.location.hostname}:3001/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: buyProduct.id, quantity: buyQty, unitPrice: buyProduct.price, buyerNote: buyNote, buyerPincode, shippingAddress, billingAddress: finalBilling, paymentMode })
      });
      if (res.ok) { setBuyProduct(null); setBuyQty('1'); setBuyNote(''); setShippingAddress(''); setBillingAddress(''); setPaymentMode('BANK_TRANSFER'); router.push('/dashboard/buyer/orders'); }
      else {
        const error = await res.json();
        setAlertMessage(error.message || "Failed to place order");
      }
    } catch (e) { console.error(e); } finally { setBuySubmitting(false); }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return router.push("/login");
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      if (sortBy) params.append("sortBy", sortBy);
      if (minRating) params.append("minRating", minRating);
      if (buyerPincode) params.append("buyerPincode", buyerPincode);
      if (showUndeliverable || !buyerPincode) params.append("showUndeliverable", "true");
      
      const res = await fetch(`http://${window.location.hostname}:3001/products/marketplace?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setProducts(await res.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, sortBy, minRating, buyerPincode, showUndeliverable]);

  const handleInquire = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      
      let payload;
      if (selectedProduct === 'BUNDLE') {
        const sellerProfileId = bundleCart[0].sellerProfileId;
        const customProductRequest = "Bundled Quote Request:\n" + bundleCart.map(p => `- ${p.name} (ID: ${p.id})`).join('\n');
        
        payload = {
          sellerProfileId,
          productId: null,
          inquiryType,
          buyerMessage: message,
          customProductRequest
        };
      } else {
        payload = {
          sellerProfileId: selectedProduct.sellerProfileId,
          productId: selectedProduct.id,
          inquiryType,
          buyerMessage: message
        };
      }

      const res = await fetch(`http://${window.location.hostname}:3001/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) { 
        setSelectedProduct(null); 
        setMessage(''); 
        if (selectedProduct === 'BUNDLE') setBundleCart([]);
        router.push('/dashboard/buyer/rfqs'); 
      }
    } catch (e) { console.error(e); } finally { setSubmitting(false); }
  };

  const displayProducts = showAllProducts ? products : products.slice(0, 6);

  return (
    <div className="space-y-8 relative">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl text-ink tracking-tight">Marketplace</h2>
        <p className="text-sm text-slate mt-1">Discover products from verified corporate vendors across India.</p>
      </div>

      {/* Delivery Configuration */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-paper p-4 rounded border border-border shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="h-8 w-8 rounded-full bg-paper-2 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <span className="text-sm font-semibold text-ink">Deliver to:</span>
          
          <div className="flex items-center gap-1.5">
            <input type="text" placeholder="6 Digit Pincode" maxLength={6} value={tempPincode} onChange={e => setTempPincode(e.target.value)} 
              className="text-sm bg-paper-2 border border-border rounded px-3 py-1.5 outline-none focus:border-ink w-32" />
            <button 
              onClick={() => {
                if (tempPincode.length === 6) {
                  setBuyerPincode(tempPincode);
                }
              }} 
              className={`h-8 w-8 rounded flex items-center justify-center transition-colors ${tempPincode.length === 6 && tempPincode !== buyerPincode ? 'bg-money hover:bg-money text-white shadow-sm' : 'bg-paper-2 border border-border text-slate'}`}
              disabled={tempPincode.length !== 6 || tempPincode === buyerPincode}
              title="Apply Pincode"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </button>
          </div>

          {(companyPincode || personalPincode) && (
            <div className="flex items-center gap-2 ml-2">
              {companyPincode && (
                <button onClick={() => { setBuyerPincode(companyPincode); setTempPincode(companyPincode); }} className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider transition-all duration-300 ${buyerPincode === companyPincode ? 'bg-ink text-white shadow-sm' : 'bg-paper border border-border text-slate hover:border-ink hover:text-ink'}`}>
                  Company
                </button>
              )}
              {personalPincode && (
                <button onClick={() => { setBuyerPincode(personalPincode); setTempPincode(personalPincode); }} className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider transition-all duration-300 ${buyerPincode === personalPincode ? 'bg-ink text-white shadow-sm' : 'bg-paper border border-border text-slate hover:border-ink hover:text-ink'}`}>
                  Personal
                </button>
              )}
            </div>
          )}
        </div>
        <div className="h-px sm:h-6 sm:w-px bg-border-subtle"></div>
        <label className="flex items-center gap-2.5 cursor-pointer" onClick={(e) => {
          if (!buyerPincode && showUndeliverable) {
            e.preventDefault();
            setAlertMessage("Please enter and apply a 6-digit delivery pincode first before you can filter out-of-range products.");
          }
        }}>
          <input type="checkbox" checked={!buyerPincode ? true : showUndeliverable} onChange={e => {
            if (buyerPincode) setShowUndeliverable(e.target.checked);
          }} 
            className="w-4 h-4 rounded text-ink focus:ring-primary-500 border-border cursor-pointer" />
          <span className="text-sm font-medium text-slate select-none">Show out-of-range products (Inquiry only)</span>
        </label>
      </div>

      {/* Search & Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Search products, brands or categories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-paper border border-border rounded text-sm text-ink placeholder-text-tertiary outline-none transition-all" />
        </div>
        <select value={selectedCategory ? selectedCategory : "all"} onChange={(e) => setSelectedCategory(e.target.value === "all" ? "" : e.target.value)}
          className="px-4 py-2.5 bg-paper border border-border rounded text-sm text-slate outline-none cursor-pointer min-w-[160px]">
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
        <select value={minRating} onChange={(e) => setMinRating(e.target.value)}
          className="px-4 py-2.5 bg-paper border border-border rounded text-sm text-slate outline-none cursor-pointer min-w-[120px]">
          <option value="">Any Rating</option>
          <option value="4.5">4.5+ Stars</option>
          <option value="4">4.0+ Stars</option>
          <option value="3">3.0+ Stars</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 bg-paper border border-border rounded text-sm text-slate outline-none cursor-pointer min-w-[140px]">
          <option value="newest">Sort: Newest</option>
          <option value="rating">Top Rated</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
        {(searchQuery || selectedCategory || minRating) && (
          <button onClick={() => { setSearchQuery(""); setSelectedCategory(""); setSortBy("newest"); setMinRating(""); }}
            className="px-4 py-2.5 bg-paper border border-border rounded text-sm text-slate hover:bg-paper-2 transition-all duration-300 flex items-center gap-2 whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Clear
          </button>
        )}
      </div>

      {/* Quick Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        <button onClick={() => setSelectedCategory("")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 shrink-0 ${!selectedCategory ? 'bg-ink text-white shadow-sm' : 'bg-paper border border-border text-slate hover:bg-paper-2'}`}>
          All
        </button>
        {CATEGORIES.slice(0, 8).map(cat => (
          <button key={cat.name} onClick={() => setSelectedCategory(selectedCategory === cat.name ? '' : cat.name)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 shrink-0 ${selectedCategory === cat.name ? 'bg-ink text-white shadow-sm' : 'bg-paper border border-border text-slate hover:bg-paper-2'}`}>
            {cat.name}
          </button>
        ))}
        {CATEGORIES.length > 8 && (
          <button onClick={() => {/* could show all */}}
            className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap bg-paper border border-border text-slate hover:bg-paper-2 transition-all duration-300 shrink-0">
            More →
          </button>
        )}
      </div>

      {/* Popular Categories Section */}
      {!selectedCategory && !searchQuery && (
        <div>
          <h3 className="text-base font-semibold text-ink mb-4 font-sans">Popular Categories</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {CATEGORIES.slice(0, 5).map(cat => (
              <button key={cat.name} onClick={() => setSelectedCategory(cat.name)}
                className="group bg-paper border border-border rounded p-4 text-left card-hover">
                <p className="text-sm font-bold text-ink group-hover:text-ink transition-colors leading-tight">{cat.name}</p>
                <p className="text-[11px] text-slate mt-1 leading-snug">{cat.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-ink font-sans">
            {selectedCategory || searchQuery ? `Results` : 'Recommended for You'}
            {!loading && <span className="text-sm font-normal text-slate ml-2">({products.length})</span>}
          </h3>
          {products.length > 6 && !showAllProducts && (
            <button onClick={() => setShowAllProducts(true)} className="text-sm font-semibold text-ink hover:text-copper transition-colors">
              View all →
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate bg-paper border border-border rounded">
            <svg className="animate-spin h-6 w-6 text-ink mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p className="text-sm">Loading marketplace...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayProducts.map((p) => {
              const sellerInfo = p.sellerProfile?.user;
              const companyName = sellerInfo?.company?.name || sellerInfo?.name || 'Unknown Supplier';
              const city = sellerInfo?.city && sellerInfo?.city !== 'Unknown' ? sellerInfo.city : null;
              const isBundled = bundleCart.some(b => b.id === p.id);

              return (
                <div key={p.id} className={`group bg-paper border rounded overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col ${isBundled ? 'border-ink shadow-md ring-1 ring-primary-500/20' : 'border-border hover:border-border'}`}>
                  {/* Product Image */}
                  <div className="bg-gradient-to-br from-primary-50 to-surface-raised h-40 flex items-center justify-center border-b border-border relative overflow-hidden">
                    {p.images && p.images.length > 0 ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-12 h-12 text-slate/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-ink text-white uppercase tracking-wider shadow-sm">{p.category}</span>
                    </div>
                    {p.subCategory && (
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-semibold text-slate bg-paper/80 backdrop-blur-sm px-2 py-0.5 rounded-full">{p.subCategory}</span>
                      </div>
                    )}
                    {p.isOutOfRange && (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                         <div className="bg-copper-bg border border-copper text-copper text-[10px] uppercase tracking-wider font-extrabold py-1.5 px-3 rounded-full shadow-sm">
                           Out of Range
                         </div>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col relative">
                    {/* Bundle Checkbox FAB */}
                    <div className="absolute -top-6 right-4 z-10">
                      <button 
                        title="Add to Bundle Quote"
                        onClick={(e) => { e.stopPropagation(); handleToggleBundle(p); }}
                        className={`h-10 w-10 rounded-full flex items-center justify-center shadow-md transition-all duration-300 border-[3px] ${isBundled ? 'bg-ink border-white text-white scale-110' : 'bg-paper border-white text-slate hover:bg-paper-2 hover:text-slate'}`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isBundled ? 3 : 2} d={isBundled ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"} /></svg>
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-ink leading-snug mb-1 pr-10 group-hover:text-ink transition-colors font-sans">{p.name}</h3>
                    <p className="text-xs text-slate line-clamp-2 mb-3 leading-relaxed">{p.description || 'No description provided'}</p>

                    {/* Supplier */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-6 w-6 rounded-full bg-copper-bg border border-copper flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-copper">{companyName.substring(0, 2).toUpperCase()}</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-ink truncate">{companyName}</span>
                          {city && (
                            <span className="text-[11px] text-slate flex items-center gap-0.5 shrink-0">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                              {city}
                            </span>
                          )}
                        </div>
                        {/* Rating Display */}
                        {p.sellerReviewCount > 0 ? (
                          <div className="flex items-center gap-1 mt-0.5">
                            <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            <span className="text-[10px] font-bold text-slate">{p.sellerAvgRating}</span>
                            <span className="text-[10px] text-slate">({p.sellerReviewCount})</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate mt-0.5">No reviews yet</span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mt-auto">
                      <div className="flex items-baseline gap-1.5 mb-1">
                        <span className="text-lg font-extrabold text-ink">{formatPriceMain(p)}</span>
                        <span className="text-xs text-slate font-medium">{formatPriceUnit(p)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate mb-4">
                        <span>MOQ: <b className="text-ink">{p.minQtyPurchase}</b></span>
                        <span className="text-border-subtle">|</span>
                        <span>Min: <b className="text-ink">₹{Number(p.minAmountPurchase).toLocaleString('en-IN')}</b></span>
                        {p.isDeliverable !== false && p.deliveryTimeDays > 0 && (
                          <>
                            <span className="text-border-subtle">|</span>
                            <span className="text-money font-semibold flex items-center gap-0.5">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              {p.deliveryTimeDays}d delivery
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setBuyProduct(p)} disabled={p.isOutOfRange}
                          className={`flex-1 btn-primary text-xs font-bold py-2.5 rounded flex items-center justify-center gap-1.5 ${p.isOutOfRange ? 'opacity-50 cursor-not-allowed bg-text-tertiary text-white border-transparent hover:bg-text-tertiary hover:border-transparent' : ''}`}>
                          {p.isOutOfRange ? 'Out of Range' : 'Buy Now'}
                        </button>
                        <button onClick={() => setSelectedProduct(p)}
                          className="flex-1 btn-outline text-xs font-bold py-2.5 rounded flex items-center justify-center gap-1.5">
                          Inquire
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-center bg-paper border border-border rounded px-6">
            <div className="h-14 w-14 rounded-full bg-paper-2 flex items-center justify-center mb-4">
              <svg className="h-7 w-7 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <h3 className="text-base font-bold text-ink font-sans">No products found</h3>
            <p className="mt-1 text-sm text-slate max-w-sm">Try adjusting your search or filters.</p>
            <button onClick={() => { setSearchQuery(""); setSelectedCategory(""); setSortBy("newest"); setMinRating(""); }} className="mt-4 btn-primary text-sm">
              Clear Filters
            </button>
          </div>
        )}

        {/* Show More Button */}
        {showAllProducts && products.length > 6 && (
          <div className="mt-4 text-center">
            <button onClick={() => setShowAllProducts(false)} className="text-sm font-semibold text-slate hover:text-ink transition-colors">
              Show less ↑
            </button>
          </div>
        )}
      </div>

      {/* Bundle Quote FAB */}
      {bundleCart.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-paper shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-border rounded-full pl-3 pr-2 py-2 flex items-center gap-5 animate-in slide-in-from-bottom-10 fade-in duration-300 min-w-max">
          <div className="flex items-center gap-2 pl-2">
            <div className="h-9 w-9 rounded-full bg-paper-2 border border-border flex items-center justify-center shrink-0">
              <span className="text-[10px] font-extrabold text-ink">
                {(bundleCart[0].sellerProfile?.user?.company?.name || bundleCart[0].sellerProfile?.user?.name || 'S').substring(0,2).toUpperCase()}
              </span>
            </div>
            <div className="max-w-[120px] sm:max-w-[180px]">
              <p className="text-[9px] font-extrabold text-slate uppercase tracking-wider">Bundling from</p>
              <p className="text-xs font-bold text-ink truncate">{bundleCart[0].sellerProfile?.user?.company?.name || bundleCart[0].sellerProfile?.user?.name || 'Supplier'}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-border-subtle"></div>
          <div className="flex items-baseline gap-1">
             <p className="text-xl font-black text-ink">{bundleCart.length}</p>
             <p className="text-[10px] font-extrabold text-slate uppercase">Items</p>
          </div>
          <div className="h-8 w-px bg-border-subtle mx-1"></div>
          <div className="flex flex-col justify-center">
            <p className="text-[9px] font-extrabold text-slate uppercase tracking-wider leading-none mb-1">Estimated Total</p>
            <p className="text-sm font-bold text-ink leading-none">
              {hasQuoteItems ? 'From ' : ''}₹{clubbedPrice.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-2">
             <button onClick={() => setBundleCart([])} className="h-9 w-9 rounded-full flex items-center justify-center text-slate hover:bg-paper-2 hover:text-ink transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
             <button onClick={() => { setSelectedProduct('BUNDLE'); setInquiryType('QUOTE'); }} className="px-5 py-2.5 bg-ink hover:bg-ink text-white shadow-sm text-sm font-bold rounded-full transition-colors flex items-center gap-2">
               Request Quote
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
             </button>
          </div>
        </div>
      )}

      {/* Inquiry Slide-Over */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}></div>
          <div className="relative w-full max-w-md bg-paper h-full shadow-2xl flex flex-col">
            <div className="px-6 py-5 border-b border-border flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-ink font-sans">Send Inquiry</h2>
                <p className="text-xs text-slate mt-0.5">One-time message to the supplier</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="h-8 w-8 rounded-full bg-paper-2 flex items-center justify-center text-slate hover:text-ink hover:bg-border-subtle transition-all duration-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6 p-4 bg-paper-2 border border-border rounded">
                <p className="text-[11px] text-ink uppercase tracking-wider font-bold mb-1">
                  {selectedProduct === 'BUNDLE' ? 'Bundled Request' : 'Product'}
                </p>
                {selectedProduct === 'BUNDLE' ? (
                  <div className="space-y-1.5 mt-2">
                    {bundleCart.map((p, i) => (
                      <p key={i} className="text-xs font-bold text-ink flex items-start justify-between gap-2">
                        <span className="flex items-start gap-2">
                          <span className="block h-1.5 w-1.5 bg-primary-400 rounded-full shrink-0 mt-1.5"></span>
                          <span className="leading-tight">{p.name}</span>
                        </span>
                        <span className="text-ink font-semibold">{p.priceType === 'FIXED' ? `₹${Number(p.price).toLocaleString('en-IN')}` : 'Quote'}</span>
                      </p>
                    ))}
                    <div className="border-t border-border mt-2 pt-2 flex justify-between items-center">
                      <span className="text-xs font-bold text-ink">Total Estimate</span>
                      <span className="text-sm font-bold text-ink">{hasQuoteItems ? 'From ' : ''}₹{clubbedPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-ink">{selectedProduct.name}</p>
                )}

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  <div className="h-5 w-5 rounded-full bg-paper-2 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-ink">
                      {selectedProduct === 'BUNDLE' 
                        ? (bundleCart[0].sellerProfile?.user?.company?.name || bundleCart[0].sellerProfile?.user?.name || 'S').substring(0,2).toUpperCase()
                        : (selectedProduct.sellerProfile?.user?.company?.name || selectedProduct.sellerProfile?.user?.name || 'S').substring(0,2).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-ink">
                    {selectedProduct === 'BUNDLE'
                      ? (bundleCart[0].sellerProfile?.user?.company?.name || bundleCart[0].sellerProfile?.user?.name || 'Supplier')
                      : (selectedProduct.sellerProfile?.user?.company?.name || selectedProduct.sellerProfile?.user?.name || 'Supplier')}
                  </p>
                </div>
              </div>
              
              <form id="inquiry-form" onSubmit={handleInquire} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2 font-sans">What do you need?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[{v:'QUOTE',l:'Get Quote'},{v:'FEASIBILITY',l:'Feasibility'},{v:'AVAILABILITY',l:'Availability'}].map(t => (
                      <button key={t.v} type="button" onClick={() => setInquiryType(t.v)}
                        className={`py-3 px-2 rounded border text-xs font-semibold transition-all duration-300 text-center ${inquiryType === t.v ? 'bg-ink border-ink text-white shadow-sm' : 'bg-paper border-border text-slate hover:border-border hover:bg-paper-2'}`}>
                        {t.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2 font-sans">Your Message</label>
                  <textarea required value={message} onChange={e => setMessage(e.target.value)} rows={6}
                    className="w-full px-4 py-3 bg-paper-2 border border-border rounded text-sm text-ink placeholder-text-tertiary focus:bg-paper focus:border-ink focus:shadow-[0_0_0_3px_rgba(13,10,62,0.08)] outline-none transition-all duration-300 resize-none"
                    placeholder="Describe your requirements: quantity, specifications, delivery timeline..."></textarea>
                </div>
              </form>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-3 bg-paper-2">
              <button onClick={() => setSelectedProduct(null)} className="btn-outline text-sm">Cancel</button>
              <button type="submit" form="inquiry-form" disabled={submitting} className="btn-primary text-sm disabled:opacity-50">
                {selectedProduct === 'BUNDLE' ? 'Send Bundled Inquiry' : 'Send Inquiry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buy Now Modal */}
      {buyProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setBuyProduct(null)}></div>
          <div className="relative bg-paper rounded shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg text-ink mb-1">Place Order</h2>
            <p className="text-xs text-slate mb-4 font-sans">{buyProduct.name}</p>
            <div className="p-3 bg-paper-2 border border-border rounded mb-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-extrabold text-ink">{formatPriceMain(buyProduct)}</span>
                <span className="text-xs text-slate">{formatPriceUnit(buyProduct)}</span>
              </div>
              <p className="text-[11px] text-slate mt-1">MOQ: {buyProduct.minQtyPurchase} • Min Order: ₹{Number(buyProduct.minAmountPurchase).toLocaleString('en-IN')}</p>
            </div>
            
            <form onSubmit={handleBuyNow} className="space-y-3">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate mb-1">Quantity</label>
                  <input required type="number" min={buyProduct.minQtyPurchase} value={buyQty} onChange={e => setBuyQty(e.target.value)}
                    className="w-full px-3 py-2 bg-paper-2 border border-border rounded text-sm outline-none" />
                </div>
                {buyProduct.price && buyQty && (
                  <div className="flex-1 p-2 bg-paper-2 border border-border rounded flex items-center justify-center">
                    <p className="text-sm text-ink text-center leading-tight">Total<br/><b className="text-base">₹{(Number(buyProduct.price) * parseInt(buyQty || '1')).toLocaleString('en-IN')}</b></p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate mb-1">Shipping Address <span className="text-copper">*</span></label>
                <textarea required value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} rows={2}
                  className="w-full px-3 py-2 bg-paper-2 border border-border rounded text-sm outline-none resize-none" placeholder="Enter delivery address..." />
              </div>
              
              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" checked={billingSameAsShipping} onChange={e => setBillingSameAsShipping(e.target.checked)} className="rounded text-ink border-border" />
                  <span className="text-xs text-slate">Billing Address is same as Shipping</span>
                </label>
                {!billingSameAsShipping && (
                  <textarea required value={billingAddress} onChange={e => setBillingAddress(e.target.value)} rows={2}
                    className="w-full px-3 py-2 bg-paper-2 border border-border rounded text-sm outline-none resize-none" placeholder="Enter billing address..." />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate mb-1">Payment Mode <span className="text-copper">*</span></label>
                <select id="payment-mode-select" required value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="w-full px-3 py-2 bg-paper-2 border border-border rounded text-sm outline-none">
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="UPI">UPI</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CASH">Cash</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate mb-1">Note to Supplier (optional)</label>
                <textarea value={buyNote} onChange={e => setBuyNote(e.target.value)} rows={1}
                  className="w-full px-3 py-2 bg-paper-2 border border-border rounded text-sm outline-none resize-none" placeholder="Custom requirements..." />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setBuyProduct(null)} className="btn-outline text-sm py-2">Cancel</button>
                <button type="submit" disabled={buySubmitting} className="btn-primary text-sm py-2 disabled:opacity-50">Place Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Alert Box */}
      {alertMessage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAlertMessage(null)}></div>
          <div className="relative bg-paper rounded shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
              <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-ink mb-2">Notice</h3>
            <p className="text-sm text-slate mb-6">{alertMessage}</p>
            <button onClick={() => setAlertMessage(null)} className="w-full btn-primary text-sm py-2.5">
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

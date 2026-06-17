"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SellerProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [deliveryCities, setDeliveryCities] = useState<any[]>([]);
  const [deliveryPincodes, setDeliveryPincodes] = useState<string[]>([]);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [citySearchResults, setCitySearchResults] = useState<any[]>([]);
  const [pincodeInput, setPincodeInput] = useState("");
  const [saving, setSaving] = useState(false);

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
          setCitySearchResults(await res.json());
        }
      } catch (e) {}
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [citySearchQuery]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return router.push("/login");

      const res = await fetch(`http://${window.location.hostname}:3001/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({
          name: data.name || "",
          mobile: data.mobile || "",
          address: data.address || "",
          city: data.city || "",
          pincode: data.pincode || "",
          gstin: data.sellerProfile?.gstin || "",
          deliveryRange: data.sellerProfile?.deliveryRange || "LOCAL_100KM"
        });
        setDeliveryCities(data.sellerProfile?.deliveryCities || []);
        setDeliveryPincodes(data.sellerProfile?.deliveryPincodes || []);

        // Fetch reviews & stats
        try {
          const [sRes, rRes] = await Promise.all([
            fetch(`http://${window.location.hostname}:3001/reviews/stats/${data.id}`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`http://${window.location.hostname}:3001/reviews/user/${data.id}`, { headers: { Authorization: `Bearer ${token}` } })
          ]);
          if (sRes.ok) setStats(await sRes.json());
          if (rRes.ok) setReviews(await rRes.json());
        } catch(e) { console.error('Error fetching reviews', e); }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      const payload = { ...formData, deliveryCities, deliveryPincodes };
      const res = await fetch(`http://${window.location.hostname}:3001/auth/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsEditing(false);
        fetchProfile();
      }
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate text-sm">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-ink tracking-tight">Profile</h2>
          <p className="text-sm text-slate mt-1">Manage your store details and fulfillment settings.</p>
        </div>
        <button onClick={() => setIsEditing(true)} className="bg-paper hover:bg-paper-2 text-ink border border-border px-4 py-2 rounded text-sm font-medium transition-colors shadow-sm">
          Edit Settings
        </button>
      </div>

      <div className="bg-paper border border-border rounded p-8">
        <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-border">
          <div className="h-24 w-24 rounded-full bg-paper-2 border border-border flex items-center justify-center">
            <span className="text-3xl font-bold text-slate">
              {profile?.name?.substring(0, 2).toUpperCase() || 'SP'}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-ink">{profile?.name || '-'}</h3>
            <p className="text-sm text-slate mt-1">GSTIN: <span className="font-medium text-ink">{profile?.sellerProfile?.gstin || '-'}</span></p>
            <p className="text-sm text-slate mt-1">{profile?.address}, {profile?.city} - {profile?.pincode}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate mb-4">Contact Information</h4>
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium text-slate">Primary Email</p>
                <p className="text-sm text-ink mt-1">{profile?.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate">Phone</p>
                <p className="text-sm text-ink mt-1">{profile?.mobile || '-'}</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate mb-4">Fulfillment Capacity</h4>
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium text-slate">Delivery Range</p>
                <p className="text-sm text-ink mt-1 font-medium bg-paper-2 inline-block px-3 py-1 rounded border border-border">
                  {profile?.sellerProfile?.deliveryRange === 'LOCAL_100KM' ? 'Local' : profile?.sellerProfile?.deliveryRange === 'HYPER_LOCAL_20KM' ? 'Hyper Local' : 'Pan India'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-paper border border-border rounded p-8">
        <h3 className="text-lg font-bold text-ink mb-6">Reviews from Buyers</h3>
        {stats && stats.totalReviews > 0 ? (
          <div className="mb-8 flex items-center gap-6 p-6 bg-paper-2 rounded">
            <div className="text-center">
              <p className="text-4xl font-black text-ink">{stats.averageRating}</p>
              <div className="flex text-amber-500 mt-2 justify-center">
                {Array.from({length: 5}).map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < Math.round(stats.averageRating) ? 'text-amber-500' : 'text-border-subtle'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-sm text-slate mt-1">{stats.totalReviews} Ratings</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map(star => {
                const count = stats.distribution[star] || 0;
                const pct = stats.totalReviews ? (count / stats.totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <span className="w-3 font-medium text-slate">{star}</span>
                    <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <div className="flex-1 h-2.5 bg-paper border border-border rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="w-8 text-right text-slate">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate mb-6">No ratings received yet.</p>
        )}


      </div>

      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsEditing(false)}></div>
          <div className="relative w-full max-w-3xl bg-paper max-h-[90vh] rounded shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-paper z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-paper-2 flex items-center justify-center text-ink">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-ink tracking-tight">Edit Settings</h2>
                  <p className="text-xs text-slate mt-0.5">Update your store and fulfillment details</p>
                </div>
              </div>
              <button onClick={() => setIsEditing(false)} className="h-8 w-8 rounded-full bg-paper-2 flex items-center justify-center text-slate hover:text-slate transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-canvas">
              <form id="edit-vendor-form" onSubmit={handleSave} className="grid md:grid-cols-2 gap-6">
                
                {/* Contact Section */}
                <div className="bg-paper border border-border rounded p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-4 bg-ink rounded-full"></div>
                    <h3 className="text-sm font-bold text-ink uppercase tracking-wide">Contact Details</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate mb-1.5">Full Name / Store Name</label>
                      <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-paper-2 border border-border rounded text-sm text-ink focus:border-ink focus:bg-paper focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="Enter full name" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate mb-1.5">Mobile Number</label>
                      <input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} type="tel" className="w-full px-4 py-2.5 bg-paper-2 border border-border rounded text-sm text-ink focus:border-ink focus:bg-paper focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="Enter mobile number" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate mb-1.5">Store Address</label>
                      <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-paper-2 border border-border rounded text-sm text-ink focus:border-ink focus:bg-paper focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="Street address" />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate mb-1.5">City</label>
                        <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-paper-2 border border-border rounded text-sm text-ink focus:border-ink focus:bg-paper focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="City" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate mb-1.5">Pincode</label>
                        <input value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-paper-2 border border-border rounded text-sm text-ink focus:border-ink focus:bg-paper focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" placeholder="6-digit pincode" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fulfillment Section */}
                <div className="bg-paper border border-border rounded p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-4 bg-amber-500 rounded-full"></div>
                    <h3 className="text-sm font-bold text-ink uppercase tracking-wide">Fulfillment Settings</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate mb-1.5">GSTIN Number</label>
                      <input value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} type="text" className="w-full px-4 py-2.5 bg-paper-2 border border-border rounded text-sm text-ink focus:border-ink focus:bg-paper focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-mono" placeholder="Enter GSTIN" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate mb-1.5">Delivery Range Capability</label>
                      <div className="relative">
                        <select value={formData.deliveryRange} onChange={e => setFormData({...formData, deliveryRange: e.target.value})} className="w-full px-4 py-2.5 bg-paper-2 border border-border rounded text-sm text-ink focus:border-ink focus:bg-paper focus:ring-4 focus:ring-primary-500/10 outline-none transition-all appearance-none font-medium">
                          <option value="HYPER_LOCAL_20KM">Hyper Local</option>
                          <option value="LOCAL_100KM">Local</option>
                          <option value="SHIPPING_AVAILABLE">Pan India</option>
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>

                    {formData.deliveryRange === 'LOCAL_100KM' && (
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
                            className="w-full px-4 py-2 bg-paper-2 border border-border rounded text-sm text-ink focus:border-ink focus:bg-paper focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
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

                    {formData.deliveryRange === 'HYPER_LOCAL_20KM' && (
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
                          className="w-full px-4 py-2 bg-paper-2 border border-border rounded text-sm text-ink focus:border-ink focus:bg-paper focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
                          placeholder="Type pincode and press Enter" 
                        />
                      </div>
                    )}
                  </div>
                </div>

              </form>
            </div>
            
            {/* Footer */}
            <div className="p-5 border-t border-border bg-paper flex justify-end gap-3 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 text-sm font-semibold text-slate bg-paper border border-border rounded hover:bg-paper-2 transition-all">Cancel</button>
              <button type="submit" form="edit-vendor-form" disabled={saving} className="px-5 py-2.5 text-sm font-semibold text-white bg-ink rounded hover:bg-ink transition-all shadow-md shadow-primary-500/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center min-w-[120px]">
                {saving ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

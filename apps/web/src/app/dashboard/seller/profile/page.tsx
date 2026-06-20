"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertModal, AlertType } from "@/components/ui/AlertModal";

export default function SellerProfile() {
  const router = useRouter();
  const [alertConfig, setAlertConfig] = useState<{message: string, type: AlertType} | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  
  // Password Modal State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
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
          const json = await res.json();
          setCitySearchResults(json.data || json);
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

  const handlePasswordChange = async (e: any) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setAlertConfig({ message: "Passwords do not match", type: "error" });
      return;
    }
    setPwdLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://${window.location.hostname}:3001/auth/change-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          oldPassword: pwdForm.currentPassword,
          newPassword: pwdForm.newPassword
        })
      });
      if (res.ok) {
        setIsChangingPassword(false);
        setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setAlertConfig({ message: "Password changed successfully", type: "success" });
      } else {
        const data = await res.json();
        const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        setAlertConfig({ message: msg || "Failed to change password", type: "error" });
      }
    } catch (e) {
      console.error(e);
      setAlertConfig({ message: "An error occurred", type: "error" });
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate text-sm">Loading profile...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Profile</h1>
          <p className="text-sm text-slate mt-1">Manage your store details and fulfillment settings.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsChangingPassword(true)} className="cp-btn cp-btn--neutral text-sm">
            Change Password
          </button>
          <button onClick={() => setIsEditing(true)} className="cp-btn cp-btn--secondary">
            Edit Settings
          </button>
        </div>
      </div>

      <div className="cp-card mb-6">
        <div className="flex items-center space-x-6 mb-8 pb-8 border-b" style={{ borderColor: 'var(--cp-border)' }}>
          <div className="h-24 w-24 rounded-full flex items-center justify-center border" style={{ backgroundColor: 'var(--cp-surface-2)', borderColor: 'var(--cp-border)' }}>
            <span className="text-3xl font-bold" style={{ color: 'var(--cp-text-secondary)' }}>
              {profile?.name?.substring(0, 2).toUpperCase() || 'SP'}
            </span>
          </div>
          <div>
            <h3 className="text-[20px] font-[700]" style={{ color: 'var(--cp-text)' }}>{profile?.name || '-'}</h3>
            <p className="text-[14px] mt-1" style={{ color: 'var(--cp-text-secondary)' }}>GSTIN: <span className="font-[500]" style={{ color: 'var(--cp-text)' }}>{profile?.sellerProfile?.gstin || '-'}</span></p>
            <p className="text-[14px] mt-1" style={{ color: 'var(--cp-text-secondary)' }}>{profile?.address}, {profile?.city} - {profile?.pincode}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h4 className="text-[12px] uppercase tracking-wider font-[700] mb-4" style={{ color: 'var(--cp-text-muted)' }}>Contact Information</h4>
            <div className="space-y-5">
              <div>
                <p className="text-[12px] font-[500] uppercase" style={{ color: 'var(--cp-text-muted)' }}>Primary Email</p>
                <p className="text-[14px] font-[500] mt-1" style={{ color: 'var(--cp-text)' }}>{profile?.email || '-'}</p>
              </div>
              <div>
                <p className="text-[12px] font-[500] uppercase" style={{ color: 'var(--cp-text-muted)' }}>Phone</p>
                <p className="text-[14px] font-[500] mt-1" style={{ color: 'var(--cp-text)' }}>{profile?.mobile || '-'}</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-[12px] uppercase tracking-wider font-[700] mb-4" style={{ color: 'var(--cp-text-muted)' }}>Fulfillment Capacity</h4>
            <div className="space-y-5">
              <div>
                <p className="text-[12px] font-[500] uppercase" style={{ color: 'var(--cp-text-muted)' }}>Delivery Range</p>
                <p className="cp-badge cp-badge--info mt-1">
                  {profile?.sellerProfile?.deliveryRange === 'LOCAL_100KM' ? 'Local' : profile?.sellerProfile?.deliveryRange === 'HYPER_LOCAL_20KM' ? 'Hyper Local' : 'Pan India'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="cp-card">
        <h3 className="text-[18px] font-[700] mb-6" style={{ color: 'var(--cp-text)' }}>Reviews from Buyers</h3>
        {stats && stats.totalReviews > 0 ? (
          <div className="mb-8 flex items-center gap-6 p-6 rounded" style={{ backgroundColor: 'var(--cp-surface-2)' }}>
            <div className="text-center">
              <p className="text-[36px] font-[900]" style={{ color: 'var(--cp-text)' }}>{stats.averageRating}</p>
              <div className="flex mt-2 justify-center" style={{ color: 'var(--cp-warning)' }}>
                {Array.from({length: 5}).map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < Math.round(stats.averageRating) ? '' : 'opacity-20'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-[12px] mt-1" style={{ color: 'var(--cp-text-muted)' }}>{stats.totalReviews} Ratings</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map(star => {
                const count = stats.distribution[star] || 0;
                const pct = stats.totalReviews ? (count / stats.totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-[13px]">
                    <span className="w-3 font-[500]" style={{ color: 'var(--cp-text-muted)' }}>{star}</span>
                    <svg className="w-4 h-4" style={{ color: 'var(--cp-warning)' }} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--cp-surface)', border: '1px solid var(--cp-border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: 'var(--cp-warning)' }}></div>
                    </div>
                    <span className="w-8 text-right" style={{ color: 'var(--cp-text-muted)' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-[13px] mb-6" style={{ color: 'var(--cp-text-muted)' }}>No ratings received yet.</p>
        )}


      </div>

      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm transition-opacity" onClick={() => setIsEditing(false)}></div>
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-surface rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden border border-border">
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surface z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-brand-50 text-brand-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-ink tracking-tight">Edit Settings</h2>
                  <p className="text-sm text-muted mt-0.5">Update your store and fulfillment details</p>
                </div>
              </div>
              <button onClick={() => setIsEditing(false)} className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center text-muted hover:text-ink hover:bg-border transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: 'var(--cp-bg)' }}>
              <form id="edit-vendor-form" onSubmit={handleSave} className="grid md:grid-cols-2 gap-6">
                
                {/* Contact Section */}
                <div className="cp-card">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: 'var(--cp-text)' }}></div>
                    <h3 className="text-[14px] font-[700] uppercase tracking-wide" style={{ color: 'var(--cp-text)' }}>Contact Details</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[12px] font-[600] mb-1.5" style={{ color: 'var(--cp-text-muted)' }}>Full Name / Store Name</label>
                      <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="cp-input w-full" placeholder="Enter full name" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-[600] mb-1.5" style={{ color: 'var(--cp-text-muted)' }}>Mobile Number</label>
                      <input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} type="tel" className="cp-input w-full" placeholder="Enter mobile number" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-[600] mb-1.5" style={{ color: 'var(--cp-text-muted)' }}>Store Address</label>
                      <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} type="text" className="cp-input w-full" placeholder="Street address" />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[12px] font-[600] mb-1.5" style={{ color: 'var(--cp-text-muted)' }}>City</label>
                        <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} type="text" className="cp-input w-full" placeholder="City" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-[600] mb-1.5" style={{ color: 'var(--cp-text-muted)' }}>Pincode</label>
                        <input value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} type="text" className="cp-input w-full" placeholder="6-digit pincode" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fulfillment Section */}
                <div className="cp-card">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: 'var(--cp-warning)' }}></div>
                    <h3 className="text-[14px] font-[700] uppercase tracking-wide" style={{ color: 'var(--cp-text)' }}>Fulfillment Settings</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[12px] font-[600] mb-1.5" style={{ color: 'var(--cp-text-muted)' }}>GSTIN Number</label>
                      <input value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} type="text" className="cp-input w-full font-mono" placeholder="Enter GSTIN" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-[600] mb-1.5" style={{ color: 'var(--cp-text-muted)' }}>Delivery Range Capability</label>
                      <div className="relative">
                        <select value={formData.deliveryRange} onChange={e => setFormData({...formData, deliveryRange: e.target.value})} className="cp-input w-full appearance-none font-[500]">
                          <option value="HYPER_LOCAL_20KM">Hyper Local</option>
                          <option value="LOCAL_100KM">Local</option>
                          <option value="SHIPPING_AVAILABLE">Pan India</option>
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none" style={{ color: 'var(--cp-text-muted)' }}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>

                    {formData.deliveryRange === 'LOCAL_100KM' && (
                      <div className="pt-2">
                        <label className="block text-[12px] font-[600] mb-1.5" style={{ color: 'var(--cp-text-muted)' }}>Deliverable Cities</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {deliveryCities.map((c, i) => (
                            <span key={i} className="cp-badge cp-badge--neutral flex items-center gap-1">
                              {c.name}
                              <button type="button" onClick={() => setDeliveryCities(deliveryCities.filter((_, idx) => idx !== i))} className="hover:text-[var(--cp-danger)] transition-colors" style={{ color: 'var(--cp-text-secondary)' }}>
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
                            className="cp-input w-full" 
                            placeholder="Search and add cities..." 
                          />
                          {citySearchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 border rounded shadow-lg max-h-48 overflow-y-auto z-50" style={{ backgroundColor: 'var(--cp-surface)', borderColor: 'var(--cp-border)' }}>
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
                                  className="w-full text-left px-4 py-2 text-[14px] transition-colors border-b last:border-b-0" style={{ color: 'var(--cp-text)', borderColor: 'var(--cp-border)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor='var(--cp-surface-2)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor='transparent'}
                                >
                                  {city.name}, <span style={{ color: 'var(--cp-text-muted)' }}>{city.state}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {formData.deliveryRange === 'HYPER_LOCAL_20KM' && (
                      <div className="pt-2">
                        <label className="block text-[12px] font-[600] mb-1.5" style={{ color: 'var(--cp-text-muted)' }}>Deliverable Pincodes</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {deliveryPincodes.map((pin, i) => (
                            <span key={i} className="cp-badge cp-badge--neutral flex items-center gap-1">
                              {pin}
                              <button type="button" onClick={() => setDeliveryPincodes(deliveryPincodes.filter((_, idx) => idx !== i))} className="hover:text-[var(--cp-danger)] transition-colors" style={{ color: 'var(--cp-text-secondary)' }}>
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
                          className="cp-input w-full" 
                          placeholder="Type pincode and press Enter" 
                        />
                      </div>
                    )}
                  </div>
                </div>

              </form>
            </div>
            
            {/* Footer */}
            <div className="p-5 border-t flex justify-end gap-3 z-10" style={{ backgroundColor: 'var(--cp-surface)', borderColor: 'var(--cp-border)' }}>
              <button onClick={() => setIsEditing(false)} className="cp-btn cp-btn--secondary">Cancel</button>
              <button type="submit" form="edit-vendor-form" disabled={saving} className="cp-btn cp-btn--primary min-w-[120px] flex items-center justify-center">
                {saving ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isChangingPassword && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm transition-opacity" onClick={() => setIsChangingPassword(false)}></div>
          <div className="relative w-full max-w-md bg-surface rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden border border-border">
            <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surface z-10 shrink-0">
              <h2 className="text-[18px] font-bold text-ink tracking-tight">Change Password</h2>
              <button onClick={() => setIsChangingPassword(false)} className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center text-muted hover:text-ink hover:bg-border transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="p-6 space-y-5 bg-canvas">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">Current Password</label>
                <input value={pwdForm.currentPassword} onChange={e => setPwdForm({...pwdForm, currentPassword: e.target.value})} type="password" required className="cp-input w-full" placeholder="Enter current password" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">New Password</label>
                <input value={pwdForm.newPassword} onChange={e => setPwdForm({...pwdForm, newPassword: e.target.value})} type="password" required minLength={6} className="cp-input w-full" placeholder="Enter new password" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">Confirm New Password</label>
                <input value={pwdForm.confirmPassword} onChange={e => setPwdForm({...pwdForm, confirmPassword: e.target.value})} type="password" required minLength={6} className="cp-input w-full" placeholder="Re-enter new password" />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
                <button type="button" onClick={() => setIsChangingPassword(false)} className="cp-btn cp-btn--secondary">Cancel</button>
                <button type="submit" disabled={pwdLoading} className="cp-btn cp-btn--primary min-w-[100px] flex items-center justify-center">
                  {pwdLoading ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </form>
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

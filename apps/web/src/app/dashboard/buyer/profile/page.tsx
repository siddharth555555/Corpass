"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertModal, AlertType } from "@/components/ui/AlertModal";

export default function BuyerProfile() {
  const router = useRouter();
  const [alertConfig, setAlertConfig] = useState<{message: string, type: AlertType} | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  
  // Password Modal State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

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
          companyName: data.company?.name || "",
          companyAddress: data.company?.address || "",
          companyType: data.company?.type || "LLC",
          employeeCount: data.company?.employeeCount || "1-50"
        });

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
      const res = await fetch(`http://${window.location.hostname}:3001/auth/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
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
    return <div className="py-16 flex items-center justify-center bg-surface border border-border rounded-xl">
      <svg className="animate-spin h-6 w-6 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </div>;
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-ink tracking-tight">Profile</h2>
          <p className="text-sm text-muted mt-1">Manage your corporate identity and billing details.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsChangingPassword(true)} className="cp-btn cp-btn--neutral shadow-sm text-sm">
            Change Password
          </button>
          <button onClick={() => setIsEditing(true)} className="cp-btn cp-btn--secondary shadow-sm">
            Edit Profile
          </button>
        </div>
      </div>

      <div className="cp-card">
        <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-border">
          <div className="h-20 w-20 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center ring-4 ring-brand-50 shadow-sm shrink-0">
            <span className="text-2xl font-bold">
              {profile?.company?.name?.substring(0, 2).toUpperCase() || profile?.name?.substring(0, 2).toUpperCase() || 'CB'}
            </span>
          </div>
          <div>
            <h3 className="text-[20px] font-bold text-ink">{profile?.company?.name || profile?.name || '-'}</h3>
            {profile?.company && (
              <p className="text-[13px] font-medium text-muted mt-1">{profile.company.type} • {profile.company.employeeCount} Employees</p>
            )}
            <div className="flex items-center mt-3 space-x-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-success-bg border border-success/20 text-success shadow-sm">Verified Entity</span>
              <span className="text-[12px] font-medium text-muted">Joined {new Date(profile?.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          <div>
            <h4 className="text-[11px] uppercase tracking-widest font-bold text-brand-600 mb-5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
              Contact Information
            </h4>
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-bold uppercase text-muted tracking-wide">Full Name</p>
                <p className="text-[15px] font-semibold text-ink mt-1 bg-surface-2 px-3 py-2 rounded-lg border border-border/50">{profile?.name || '-'}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase text-muted tracking-wide">Primary Email</p>
                <p className="text-[15px] font-semibold text-ink mt-1 bg-surface-2 px-3 py-2 rounded-lg border border-border/50">{profile?.email || '-'}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase text-muted tracking-wide">Phone</p>
                <p className="text-[15px] font-semibold text-ink mt-1 bg-surface-2 px-3 py-2 rounded-lg border border-border/50">{profile?.mobile || '-'}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase text-muted tracking-wide">Personal Address</p>
                <p className="text-[15px] font-semibold text-ink mt-1 bg-surface-2 px-3 py-2 rounded-lg border border-border/50">{profile?.address}, {profile?.city} - {profile?.pincode}</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-[11px] uppercase tracking-widest font-bold text-brand-600 mb-5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
              Company Details
            </h4>
            <div className="space-y-5">
              {profile?.company ? (
                <>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-muted tracking-wide">Headquarters / Billing Address</p>
                    <p className="text-[14px] text-ink mt-1 leading-relaxed bg-surface-2 px-4 py-3 rounded-xl border border-border/50 shadow-sm">
                      {profile.company.address || '-'}
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-surface-2 border border-border p-5 rounded-xl text-center">
                  <p className="text-[13px] font-medium text-muted">No company associated.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="cp-card">
        <h3 className="text-lg font-bold text-ink mb-6">Reviews from Suppliers</h3>
        {stats && stats.totalReviews > 0 ? (
          <div className="mb-6 flex items-center gap-8 p-6 bg-surface-2 rounded-xl border border-border/50">
            <div className="text-center shrink-0">
              <p className="text-4xl font-black text-ink">{stats.averageRating}</p>
              <div className="flex text-amber-500 mt-2 justify-center gap-0.5">
                {Array.from({length: 5}).map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < Math.round(stats.averageRating) ? 'text-amber-500' : 'text-border-strong'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-[12px] font-bold text-muted mt-2">{stats.totalReviews} Ratings</p>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map(star => {
                const count = stats.distribution[star] || 0;
                const pct = stats.totalReviews ? (count / stats.totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-[13px]">
                    <span className="w-2 font-bold text-muted">{star}</span>
                    <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <div className="flex-1 h-2 bg-surface-3 border border-border rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="w-8 text-right font-bold text-muted">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-8 bg-surface-2 border border-border rounded-xl text-center">
            <p className="text-[13px] font-medium text-muted">No ratings received yet.</p>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm transition-opacity" onClick={() => setIsEditing(false)}></div>
          <div className="relative w-full max-w-3xl bg-surface max-h-[90vh] rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden border border-border">
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surface z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 ring-2 ring-brand-100">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-ink tracking-tight">Edit Profile</h2>
                  <p className="text-[13px] font-medium text-muted mt-0.5">Update your corporate details</p>
                </div>
              </div>
              <button onClick={() => setIsEditing(false)} className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center text-muted hover:text-ink hover:bg-border transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-canvas">
              <form id="edit-profile-form" onSubmit={handleSave} className="grid md:grid-cols-2 gap-6">
                
                {/* Personal Section */}
                <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-1.5 h-4 bg-ink rounded-full"></div>
                    <h3 className="text-[13px] font-bold text-ink uppercase tracking-wider">Personal Details</h3>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[13px] font-semibold text-ink mb-1.5">Full Name</label>
                      <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="cp-input text-[13px]" placeholder="Enter full name" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-ink mb-1.5">Mobile Number</label>
                      <input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} type="tel" className="cp-input text-[13px]" placeholder="Enter mobile number" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-ink mb-1.5">Personal Address</label>
                      <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} type="text" className="cp-input text-[13px]" placeholder="Street address" />
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-[13px] font-semibold text-ink mb-1.5">City</label>
                        <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} type="text" className="cp-input text-[13px]" placeholder="City" />
                      </div>
                      <div>
                        <label className="block text-[13px] font-semibold text-ink mb-1.5">Pincode</label>
                        <input value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} type="text" className="cp-input text-[13px]" placeholder="6-digit pincode" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Section */}
                <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-1.5 h-4 bg-brand-500 rounded-full"></div>
                    <h3 className="text-[13px] font-bold text-ink uppercase tracking-wider">Company Details</h3>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[13px] font-semibold text-ink mb-1.5">Company Name</label>
                      <input value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} type="text" className="cp-input text-[13px]" placeholder="Registered company name" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-ink mb-1.5">Headquarters Address</label>
                      <textarea value={formData.companyAddress} onChange={e => setFormData({...formData, companyAddress: e.target.value})} rows={2} className="cp-input text-[13px] resize-none" placeholder="Full corporate address"></textarea>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-[13px] font-semibold text-ink mb-1.5">Company Type</label>
                        <div className="relative">
                          <select value={formData.companyType} onChange={e => setFormData({...formData, companyType: e.target.value})} className="cp-input text-[13px] appearance-none cursor-pointer">
                            <option value="LLC">LLC</option>
                            <option value="Corporation">Corporation</option>
                            <option value="Partnership">Partnership</option>
                            <option value="Sole Proprietorship">Sole Proprietorship</option>
                          </select>
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[13px] font-semibold text-ink mb-1.5">Employee Count</label>
                        <div className="relative">
                          <select value={formData.employeeCount} onChange={e => setFormData({...formData, employeeCount: e.target.value})} className="cp-input text-[13px] appearance-none cursor-pointer">
                            <option value="1-10">1-10</option>
                            <option value="11-50">11-50</option>
                            <option value="51-200">51-200</option>
                            <option value="201-500">201-500</option>
                            <option value="500+">500+</option>
                          </select>
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </form>
            </div>
            
            {/* Footer */}
            <div className="p-5 border-t border-border bg-surface shrink-0 flex justify-end gap-3 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
              <button onClick={() => setIsEditing(false)} className="cp-btn cp-btn--secondary">Cancel</button>
              <button type="submit" form="edit-profile-form" disabled={saving} className="cp-btn cp-btn--primary min-w-[140px] flex justify-center">
                {saving ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : 'Save Changes'}
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
                <label className="block text-[13px] font-semibold text-ink mb-1.5">Current Password</label>
                <input value={pwdForm.currentPassword} onChange={e => setPwdForm({...pwdForm, currentPassword: e.target.value})} type="password" required className="cp-input w-full text-[13px]" />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-ink mb-1.5">New Password</label>
                <input value={pwdForm.newPassword} onChange={e => setPwdForm({...pwdForm, newPassword: e.target.value})} type="password" required minLength={6} className="cp-input w-full text-[13px]" />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-ink mb-1.5">Confirm New Password</label>
                <input value={pwdForm.confirmPassword} onChange={e => setPwdForm({...pwdForm, confirmPassword: e.target.value})} type="password" required minLength={6} className="cp-input w-full text-[13px]" />
              </div>
              <div className="pt-4 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsChangingPassword(false)} className="cp-btn cp-btn--secondary">Cancel</button>
                <button type="submit" disabled={pwdLoading} className="cp-btn cp-btn--primary min-w-[100px] flex items-center justify-center">
                  {pwdLoading ? 'Saving...' : 'Save'}
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

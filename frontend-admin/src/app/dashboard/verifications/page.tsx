"use client";

import { useState, useEffect } from "react";

export default function VerificationsPage() {
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem("admin_session");
      const res = await fetch(`http://${window.location.hostname}:3001/admin/users/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPendingSellers(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerify = async (id: number) => {
    try {
      const token = localStorage.getItem("admin_session");
      const res = await fetch(`http://${window.location.hostname}:3001/admin/users/${id}/verify`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        // Remove from list
        setPendingSellers(pendingSellers.filter(s => s.id !== id));
      } else {
        alert("Failed to verify user.");
      }
    } catch (e) {
      console.error(e);
      alert("Error verifying user.");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Pending Verifications</h1>
          <p className="text-sm text-slate mt-1">Review and approve new seller accounts.</p>
        </div>
      </div>

      <div className="bg-paper border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-paper-2 border-b border-border">
                <th className="px-6 py-4 text-xs font-semibold text-slate uppercase tracking-wider">Company & User</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate uppercase tracking-wider">GSTIN</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate uppercase tracking-wider">Joined Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center"><div className="animate-spin h-6 w-6 border-2 border-brand border-t-transparent rounded-full"></div></div>
                  </td>
                </tr>
              ) : pendingSellers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate">
                    No pending verifications at the moment.
                  </td>
                </tr>
              ) : (
                pendingSellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-ink">{seller.company}</div>
                      <div className="text-xs text-slate mt-0.5">{seller.name} • {seller.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-ink font-mono">{seller.gstin}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate">{seller.city || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate">{seller.joinedAt}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleVerify(seller.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand text-paper text-sm font-medium rounded hover:bg-brand-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

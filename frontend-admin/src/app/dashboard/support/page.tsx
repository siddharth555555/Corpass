"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/DataTable";
import { statusColor } from "@/lib/utils";

export default function SupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [ticketThread, setTicketThread] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const fetchTickets = () => {
    const token = localStorage.getItem("admin_session");
    if (!token) return;
    
    fetch(`http://${window.location.hostname}:3001/admin/tickets`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setTickets(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    const token = localStorage.getItem("admin_session");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchTickets();
  }, [router]);

  const fetchThread = (id: number) => {
    const token = localStorage.getItem("admin_session");
    fetch(`http://${window.location.hostname}:3001/admin/tickets/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTicketThread(data))
      .catch(console.error);
  };

  useEffect(() => {
    if (selectedTicketId) {
      fetchThread(selectedTicketId);
    } else {
      setTicketThread(null);
    }
  }, [selectedTicketId]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !ticketThread) return;

    setIsReplying(true);
    try {
      const token = localStorage.getItem("admin_session");
      const res = await fetch(`http://${window.location.hostname}:3001/admin/tickets/${ticketThread.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: replyMessage }),
      });

      if (res.ok) {
        setReplyMessage("");
        fetchThread(ticketThread.id);
        fetchTickets(); // Refresh the list to update status if needed
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsReplying(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!ticketThread) return;
    try {
      const token = localStorage.getItem("admin_session");
      const res = await fetch(`http://${window.location.hostname}:3001/admin/tickets/${ticketThread.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchThread(ticketThread.id);
        fetchTickets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const columns = [
    { key: "subject", header: "Subject", render: (row: any) => (
      <div className="flex items-center gap-2">
        <span className="font-semibold">{row.subject}</span>
        {row.repliesCount > 0 && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{row.repliesCount}</span>}
      </div>
    )},
    { key: "user", header: "User", render: (row: any) => (
      <div>
        <p className="font-medium text-ink">{row.user}</p>
        <p className="text-xs text-slate">{row.role}</p>
      </div>
    )},
    { key: "priority", header: "Priority", render: (row: any) => (
      <span className={`status-badge ${statusColor(row.priority)}`}>{row.priority}</span>
    )},
    { key: "status", header: "Status", render: (row: any) => (
      <span className={`status-badge ${statusColor(row.status)}`}>{row.status.replace("_", " ")}</span>
    )},
    { key: "createdAt", header: "Created" },
    { key: "actions", header: "", render: (row: any) => (
      <button onClick={() => setSelectedTicketId(row.id)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
        View Thread
      </button>
    )},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-ink tracking-tight font-semibold">Support Tickets</h2>
        <p className="text-sm text-slate mt-1">Track and resolve user support requests.</p>
      </div>

      <div className="bg-paper border border-border rounded overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate">Loading tickets...</div>
        ) : (
          <DataTable columns={columns} data={tickets} keyField="id" />
        )}
      </div>

      {/* Ticket Detail Modal / Overlay */}
      {selectedTicketId && ticketThread && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper w-full max-w-2xl rounded-xl shadow-xl border border-border flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-border flex justify-between items-center bg-surface shrink-0 rounded-t-xl">
              <div>
                <h3 className="font-bold text-ink">Ticket #{ticketThread.id}</h3>
                <p className="text-sm text-slate">{ticketThread.subject || 'Support Request'}</p>
              </div>
              <div className="flex items-center gap-3">
                <select 
                  value={ticketThread.status} 
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-xs font-semibold px-2 py-1 rounded border border-border bg-paper"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
                <button onClick={() => setSelectedTicketId(null)} className="p-1 hover:bg-surface-2 rounded-md text-slate hover:text-ink transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface/30">
              {/* Original Message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold shrink-0 text-xs">
                  {ticketThread.user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 bg-paper p-3 rounded-lg rounded-tl-none border border-border shadow-sm">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs font-bold text-ink">{ticketThread.user?.name} ({ticketThread.user?.role})</span>
                    <span className="text-[10px] text-slate">{new Date(ticketThread.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-ink whitespace-pre-wrap">{ticketThread.message}</p>
                </div>
              </div>

              {/* Replies */}
              {ticketThread.replies?.map((reply: any) => {
                const isAdmin = reply.user?.role === 'ADMIN';
                return (
                  <div key={reply.id} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 text-xs ${isAdmin ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {isAdmin ? 'A' : (reply.user?.name?.charAt(0) || 'U')}
                    </div>
                    <div className={`flex-1 p-3 border shadow-sm ${isAdmin ? 'bg-blue-50 border-blue-100 rounded-lg rounded-tr-none' : 'bg-paper border-border rounded-lg rounded-tl-none'}`}>
                      <div className={`flex justify-between items-baseline mb-1 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                        <span className="text-xs font-bold text-ink">{isAdmin ? 'Admin' : reply.user?.name}</span>
                        <span className="text-[10px] text-slate">{new Date(reply.createdAt).toLocaleString()}</span>
                      </div>
                      <p className={`text-sm whitespace-pre-wrap ${isAdmin ? 'text-blue-900 text-right' : 'text-ink'}`}>{reply.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-border bg-surface shrink-0 rounded-b-xl">
              <form onSubmit={handleReply} className="flex gap-3">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  className="flex-1 px-3 py-2 text-sm border border-border rounded focus:outline-none focus:border-blue-500"
                  required
                />
                <button 
                  type="submit" 
                  disabled={isReplying}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isReplying ? 'Sending...' : 'Reply'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

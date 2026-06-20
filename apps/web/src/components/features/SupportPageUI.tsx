"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function SupportPageUI({ userRole }: { userRole: 'buyer' | 'seller' }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://${window.location.hostname}:3001/support`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setTickets(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTicketThread = async (id: number) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://${window.location.hostname}:3001/support/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSelectedTicket(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://${window.location.hostname}:3001/support`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, message }),
      });

      if (res.ok) {
        toast.success("Query submitted successfully.");
        setSubject("");
        setMessage("");
        fetchTickets();
      } else {
        throw new Error("Failed to submit query");
      }
    } catch (error) {
      toast.error("An error occurred while submitting your query");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    setIsReplying(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://${window.location.hostname}:3001/support/${selectedTicket.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: replyMessage }),
      });

      if (res.ok) {
        setReplyMessage("");
        fetchTicketThread(selectedTicket.id);
      } else {
        toast.error("Failed to send reply");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsReplying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPEN': return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
      case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-600 border border-blue-500/20';
      case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
      default: return 'bg-[var(--cp-surface-2)] text-[var(--cp-text)] border border-[var(--cp-border)]';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--cp-text)]">Support & Help Center</h1>
        <p className="text-sm text-[var(--cp-text-muted)] mt-1">Get assistance, track your queries, and find contact information.</p>
      </div>

      {selectedTicket ? (
        <div className="cp-card">
          <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-2 text-sm text-[var(--cp-text-muted)] hover:text-[var(--cp-text)] mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Support
          </button>
          
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--cp-border)]">
            <div>
              <h2 className="text-lg font-bold text-[var(--cp-text)]">{selectedTicket.subject || 'Support Ticket'}</h2>
              <p className="text-xs text-[var(--cp-text-muted)] mt-1">Ticket #{selectedTicket.id} • Created {new Date(selectedTicket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <span className={`px-2 py-1 rounded text-[11px] font-bold tracking-wider ${getStatusColor(selectedTicket.status)}`}>{selectedTicket.status}</span>
          </div>

          <div className="space-y-6 mb-8">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--cp-brand-500)] text-white flex items-center justify-center font-bold shrink-0">{selectedTicket.user?.name?.charAt(0) || 'U'}</div>
              <div className="flex-1 bg-[var(--cp-surface-2)] p-4 rounded-r-xl rounded-bl-xl border border-[var(--cp-border)]">
                <p className="text-sm font-semibold text-[var(--cp-text)]">{selectedTicket.user?.name} (You)</p>
                <p className="text-sm text-[var(--cp-text)] mt-2 whitespace-pre-wrap">{selectedTicket.message}</p>
                <p className="text-[10px] text-[var(--cp-text-muted)] mt-3 text-right">{new Date(selectedTicket.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            {selectedTicket.replies?.map((reply: any) => {
              const isAdmin = reply.user?.role === 'ADMIN';
              return (
                <div key={reply.id} className={`flex gap-4 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 ${isAdmin ? 'bg-slate-800 text-white' : 'bg-[var(--cp-brand-500)] text-white'}`}>
                    {isAdmin ? 'A' : (reply.user?.name?.charAt(0) || 'U')}
                  </div>
                  <div className={`flex-1 p-4 border border-[var(--cp-border)] ${isAdmin ? 'bg-[var(--cp-surface)] rounded-l-xl rounded-br-xl' : 'bg-[var(--cp-surface-2)] rounded-r-xl rounded-bl-xl'}`}>
                    <p className="text-sm font-semibold text-[var(--cp-text)]">{isAdmin ? 'Support Team' : `${reply.user?.name} (You)`}</p>
                    <p className="text-sm text-[var(--cp-text)] mt-2 whitespace-pre-wrap">{reply.message}</p>
                    <p className="text-[10px] text-[var(--cp-text-muted)] mt-3 text-right">{new Date(reply.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedTicket.status !== 'CLOSED' && selectedTicket.status !== 'RESOLVED' && (
            <form onSubmit={handleReply} className="flex gap-4">
              <input
                type="text"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply..."
                className="cp-input flex-1"
                required
              />
              <button disabled={isReplying} type="submit" className="cp-btn cp-btn--primary px-6">
                {isReplying ? 'Sending...' : 'Send Reply'}
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Area: Tickets & Form */}
          <div className="md:col-span-2 space-y-8">
            
            {tickets.length > 0 && (
              <div className="cp-card">
                <h2 className="text-[16px] font-[700] mb-4 text-[var(--cp-text)]">Your Active Tickets</h2>
                <div className="space-y-3">
                  {tickets.map(ticket => (
                    <button key={ticket.id} onClick={() => fetchTicketThread(ticket.id)} className="w-full text-left p-4 rounded bg-[var(--cp-surface-2)] border border-[var(--cp-border)] hover:border-[var(--cp-brand-500)] transition-colors flex items-center justify-between group">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[14px] font-bold text-[var(--cp-text)] group-hover:text-[var(--cp-brand-500)] transition-colors">{ticket.subject || 'Support Ticket'}</span>
                          {ticket._count?.replies > 0 && <span className="text-[10px] bg-[var(--cp-brand-500)] text-white px-2 py-0.5 rounded-full">{ticket._count.replies} Replies</span>}
                        </div>
                        <p className="text-[12px] text-[var(--cp-text-muted)] truncate max-w-sm">{ticket.message}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold tracking-wider mb-1 ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
                        <p className="text-[10px] text-[var(--cp-text-muted)]">{new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="cp-card">
              <h2 className="text-[18px] font-[700] mb-6 text-[var(--cp-text)]">Submit a New Query</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="subject" className="block text-[13px] font-[600] mb-1 text-[var(--cp-text-muted)]">Subject (Optional)</label>
                  <input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="cp-input w-full"
                    placeholder="What is this regarding?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-[13px] font-[600] mb-2 text-[var(--cp-text-muted)]">Message <span className="text-[var(--cp-danger)]">*</span></label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    required
                    className="cp-input w-full resize-none"
                    placeholder="Describe your issue or query in detail..."
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="cp-btn cp-btn--primary w-full md:w-auto px-8"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                        Submitting...
                      </span>
                    ) : "Submit Query"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Sidebar: Contact Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="cp-card">
              <h2 className="text-[12px] font-[700] uppercase tracking-wider mb-4 text-[var(--cp-text-muted)]">Contact Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 p-2 rounded-full bg-[var(--cp-surface-2)] text-[var(--cp-brand-600)]">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[var(--cp-text-muted)]">WhatsApp Support</p>
                    <a href="https://wa.me/919330148030" target="_blank" rel="noopener noreferrer" className="block text-[14px] font-[700] hover:underline transition-colors truncate text-[var(--cp-text)]">+91 93301 48030</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="shrink-0 p-2 rounded-full bg-[var(--cp-surface-2)] text-[var(--cp-text)]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[var(--cp-text-muted)]">Email</p>
                    <a href="mailto:siddharth251002@gmail.com" className="block text-[14px] font-[700] hover:underline transition-colors break-all text-[var(--cp-text)]">siddharth251002@gmail.com</a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="rounded p-5 bg-[var(--cp-surface-2)]">
              <h3 className="text-[14px] font-[700] mb-2 text-[var(--cp-text)]">Office Hours</h3>
              <p className="text-[13px] text-[var(--cp-text-muted)]">Monday to Friday<br/>9:00 AM - 6:00 PM (IST)</p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

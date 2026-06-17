"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useNotifications } from "@/hooks/useNotifications";

type Role = "BUYER" | "SELLER";

type Thread = {
  id: string;
  type: "ORDER" | "INQUIRY";
  rawId: number;
  title: string;
  subtitle: string;
  status: string;
  updatedAt: string;
  data: any;
};

type Counterparty = {
  id: string;
  name: string;
  threads: Thread[];
  updatedAt: string;
};

export function MessagesUI({ role }: { role: Role }) {
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [filterType, setFilterType] = useState<"ALL" | "ORDERS" | "INQUIRIES">("ALL");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const { notifications, fetchNotifications, markAsRead } = useNotifications();
  
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  const [activeCounterparty, setActiveCounterparty] = useState<Counterparty | null>(null);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Counter offer states
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");
  const [counterQuantity, setCounterQuantity] = useState("");
  const [counterNote, setCounterNote] = useState("");
  
  const [isThreadDropdownOpen, setIsThreadDropdownOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{message: string} | null>(null);

  const fetchThreads = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const [ordersRes, inqsRes] = await Promise.all([
        fetch(`http://${window.location.hostname}:3001/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`http://${window.location.hostname}:3001/inquiries`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const orders = await ordersRes.json();
      const inqs = await inqsRes.json();

      const cpMap = new Map<string, Counterparty>();

      const addThread = (t: Thread, cpId: string, cpName: string) => {
        if (!cpMap.has(cpId)) {
          cpMap.set(cpId, { id: cpId, name: cpName, threads: [], updatedAt: t.updatedAt });
        }
        const cp = cpMap.get(cpId)!;
        cp.threads.push(t);
        if (new Date(t.updatedAt) > new Date(cp.updatedAt)) {
          cp.updatedAt = t.updatedAt;
        }
      };

      orders.forEach((o: any) => {
        const cpId = role === 'SELLER' ? `buyer-${o.buyerId}` : `seller-${o.sellerProfileId}`;
        const cpName = role === 'SELLER' ? (o.buyer?.company?.name || o.buyer?.name || 'Buyer') : (o.sellerProfile?.user?.company?.name || o.sellerProfile?.user?.name || 'Supplier');
        addThread({
          id: `order-${o.id}`,
          type: "ORDER",
          rawId: o.id,
          title: o.productName,
          subtitle: cpName,
          status: o.status,
          updatedAt: o.updatedAt,
          data: o
        }, cpId, cpName);
      });

      inqs.forEach((i: any) => {
        const cpId = role === 'SELLER' ? `buyer-${i.buyerId}` : `seller-${i.sellerProfileId}`;
        const cpName = role === 'SELLER' ? (i.buyer?.company?.name || i.buyer?.name || 'Buyer') : (i.sellerProfile?.user?.company?.name || i.sellerProfile?.user?.name || 'Supplier');
        addThread({
          id: `inquiry-${i.id}`,
          type: "INQUIRY",
          rawId: i.id,
          title: i.product?.name || i.customProductRequest || 'General',
          subtitle: cpName,
          status: i.status,
          updatedAt: i.updatedAt,
          data: i
        }, cpId, cpName);
      });

      const combinedCp = Array.from(cpMap.values());
      combinedCp.forEach(cp => cp.threads.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      combinedCp.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      setCounterparties(combinedCp);
      setLoading(false);

      // Deep link resolution
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const threadId = params.get('threadId');
        if (threadId) {
          for (const cp of combinedCp) {
            const t = cp.threads.find(x => x.id === threadId);
            if (t) {
              setActiveCounterparty(cp);
              setActiveThread(t);
              window.history.replaceState({}, "", window.location.pathname);
              break;
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [role]);

  const fetchMessages = async (thread: Thread) => {
    try {
      const token = localStorage.getItem("access_token");
      const url = thread.type === "ORDER" 
        ? `http://${window.location.hostname}:3001/orders/${thread.rawId}/messages`
        : `http://${window.location.hostname}:3001/inquiries/${thread.rawId}/messages`;
      
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setMessages(data);
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeThread) {
      fetchMessages(activeThread);
      const interval = setInterval(() => fetchMessages(activeThread), 5000);
      
      const unreadNotificationsForThread = notifications.filter(n => 
        !n.isRead && 
        n.type === 'MESSAGE' && 
        n.entityType === activeThread.type && 
        n.entityId === String(activeThread.rawId)
      );
      
      unreadNotificationsForThread.forEach(n => {
        markAsRead(n.id);
      });

      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [activeThread, notifications]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThread) return;

    try {
      const token = localStorage.getItem("access_token");
      const url = activeThread.type === "ORDER" 
        ? `http://${window.location.hostname}:3001/orders/${activeThread.rawId}/messages`
        : `http://${window.location.hostname}:3001/inquiries/${activeThread.rawId}/messages`;
      
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: inputText })
      });
      setInputText("");
      fetchMessages(activeThread);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || activeThread.type !== "ORDER") return;

    try {
      const token = localStorage.getItem("access_token");
      await fetch(`http://${window.location.hostname}:3001/orders/${activeThread.rawId}/counter`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          counterPrice: parseFloat(counterPrice),
          counterQuantity: parseInt(counterQuantity),
          counterNote
        })
      });
      setShowCounterModal(false);
      setCounterPrice("");
      setCounterQuantity("");
      setCounterNote("");
      fetchMessages(activeThread);
      fetchThreads();
      
      const updatedData = { ...activeThread.data, status: 'COUNTER_OFFERED', latestProposerId: -1 };
      setActiveThread({ ...activeThread, data: updatedData });
    } catch (err) {
      console.error(err);
      setAlertConfig({ message: "Failed to send counter offer" });
    }
  };

  const handleAccept = async () => {
    if (!activeThread || activeThread.type !== "ORDER") return;
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`http://${window.location.hostname}:3001/orders/${activeThread.rawId}/accept`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMessages(activeThread);
      fetchThreads();
      setActiveThread({ ...activeThread, data: { ...activeThread.data, status: 'CONFIRMED' } });
    } catch (err) {
      console.error(err);
      setAlertConfig({ message: "Failed to accept" });
    }
  };

  const handleDecline = async () => {
    if (!activeThread || activeThread.type !== "ORDER") return;
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`http://${window.location.hostname}:3001/orders/${activeThread.rawId}/decline-counter`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMessages(activeThread);
      fetchThreads();
      setActiveThread({ ...activeThread, data: { ...activeThread.data, status: 'PLACED' } });
    } catch (err) {
      console.error(err);
      setAlertConfig({ message: "Failed to decline" });
    }
  };

  const isThreadUnread = (t: Thread) => {
    return notifications.some(n => 
      !n.isRead && 
      n.type === 'MESSAGE' && 
      n.entityType === t.type && 
      n.entityId === String(t.rawId)
    );
  };

  const filteredCounterparties = counterparties.map(cp => {
    const ft = cp.threads.filter(t => {
      if (showUnreadOnly && !isThreadUnread(t)) return false;
      if (filterType === "ORDERS" && t.type !== "ORDER") return false;
      if (filterType === "INQUIRIES" && t.type !== "INQUIRY") return false;
      return true;
    });
    return { ...cp, threads: ft };
  }).filter(cp => cp.threads.length > 0);

  const activeFilteredCp = filteredCounterparties.find(cp => cp.id === activeCounterparty?.id);
  const activeThreadsToDisplay = activeFilteredCp?.threads || [];

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      {/* Sidebar List (Counterparties) */}
      <div className={`w-full md:w-[35%] lg:w-[30%] flex flex-col space-y-4 shrink-0 ${activeCounterparty ? 'hidden md:flex' : 'flex'}`}>
        <div className="flex flex-col gap-2 shrink-0">
          <div className="p-1 bg-surface border border-border rounded-lg shadow-sm flex gap-1">
              {(["ALL", "ORDERS", "INQUIRIES"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => { setFilterType(f); setActiveThread(null); }}
                  className={`flex-1 px-3 py-1.5 text-[12px] font-[600] rounded-md transition-colors ${
                    filterType === f ? "bg-ink text-white shadow-sm" : "text-muted hover:bg-surface-2"
                  }`}
                >
                  {f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
          </div>
          <button 
            onClick={() => { setShowUnreadOnly(!showUnreadOnly); setActiveThread(null); }}
            className={`px-3 py-1.5 text-[12px] font-[600] rounded-lg border transition-colors flex items-center justify-center gap-2 ${
              showUnreadOnly ? "bg-brand-50 border-brand-200 text-brand-700 shadow-sm" : "bg-surface border-border text-muted hover:bg-surface-2"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${showUnreadOnly ? 'bg-brand-500' : 'bg-muted'}`} />
            Show Unread Only
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 pb-10">
          {loading ? (
            <div className="p-6 text-center text-muted text-sm">Loading...</div>
          ) : filteredCounterparties.length === 0 ? (
            <div className="p-6 text-center text-muted text-sm">No conversations found.</div>
          ) : (
            filteredCounterparties.map(cp => (
              <button
                key={cp.id}
                onClick={() => { 
                  setActiveCounterparty(cp); 
                  if (!cp.threads.find(t => t.id === activeThread?.id)) {
                    setActiveThread(cp.threads[0]); 
                  }
                }}
                className={`w-full text-left cp-card flex flex-col items-start transition-all duration-200 border-2 p-4 ${
                  activeCounterparty?.id === cp.id ? "border-brand-500 shadow-md bg-brand-50/30" : "hover:border-brand-300 border-border"
                }`}
              >
                <div className="flex justify-between items-start mb-1.5 w-full relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink text-sm leading-tight">{cp.name}</span>
                    {cp.threads.some(isThreadUnread) && (
                      <span className="w-2 h-2 rounded-full bg-brand-500 shadow-sm" />
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-muted shrink-0 bg-surface/80 px-1.5 py-0.5 rounded backdrop-blur-sm">{new Date(cp.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="text-[12px] text-muted flex items-center gap-2 relative z-10 w-full mt-2">
                  <span className="cp-badge cp-badge--neutral">{cp.threads.length} active threads</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-surface border border-border rounded-xl shadow-sm relative min-w-0 overflow-hidden ${!activeCounterparty ? 'hidden md:flex' : 'flex'}`}>
        {activeCounterparty ? (
          <>
            {/* Header: Counterparty Info & Asset Filter */}
            <div className="bg-surface border-b border-border shadow-sm z-20 relative flex flex-col shrink-0">
              <div className="p-4 flex items-center gap-3">
                <button 
                  onClick={() => setActiveCounterparty(null)}
                  className="md:hidden h-8 w-8 -ml-2 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="h-10 w-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-lg shrink-0 ring-2 ring-brand-50">
                  {activeCounterparty.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-ink truncate">{activeCounterparty.name}</h3>
                  <p className="text-xs font-medium text-muted">{role === 'SELLER' ? 'Buyer Company' : 'Supplier Company'}</p>
                </div>
              </div>
              
              {/* Asset Dropdown Filter */}
              <div className="px-4 pb-4">
                <div className="relative">
                  <button 
                    onClick={() => setIsThreadDropdownOpen(!isThreadDropdownOpen)}
                    className="w-full flex items-center bg-surface border border-border rounded-lg overflow-hidden shadow-sm hover:border-brand-300 transition-colors text-left"
                  >
                    <span className="pl-3 pr-2 py-2.5 text-[10px] font-bold text-muted uppercase tracking-widest shrink-0 bg-surface-2 border-r border-border flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                      {activeThread?.type || 'ASSET'}
                    </span>
                    <div className="flex-1 py-2.5 pr-8 pl-3 bg-transparent text-[13px] font-semibold text-ink truncate">
                      {activeThread 
                        ? `${activeThread.title} (${activeThread.status})` 
                        : 'Select a thread...'}
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                      <svg className={`w-4 h-4 transition-transform duration-200 ${isThreadDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </button>

                  {isThreadDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsThreadDropdownOpen(false)}></div>
                      <div className="absolute z-20 w-full mt-1.5 bg-surface border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {activeThreadsToDisplay.length > 0 ? (
                          activeThreadsToDisplay.map(t => (
                            <button
                              key={t.id}
                              onClick={() => {
                                setActiveThread(t);
                                setIsThreadDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-[13px] hover:bg-surface-2 transition-colors border-b border-border last:border-0 flex justify-between items-center ${activeThread?.id === t.id ? 'bg-surface-2 font-bold text-ink' : 'text-muted font-medium'}`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${t.type === 'ORDER' ? 'bg-success-bg text-success border-success/20' : 'bg-surface-3 text-ink border-border-strong'} uppercase tracking-wider`}>
                                  {t.type}
                                </span>
                                <span className={`truncate ${activeThread?.id === t.id ? 'text-ink' : ''}`}>{t.title}</span>
                              </div>
                              <span className="text-[10px] text-muted ml-2 shrink-0 bg-surface px-2 py-0.5 rounded-md border border-border uppercase font-bold">{t.status}</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-4 text-[13px] text-muted text-center font-medium">No threads found.</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {activeThread ? (
              <>
                {/* Active Thread Banner (if order) */}
                {activeThread.type === "ORDER" && (
                  <div className="px-4 py-3 bg-brand-50 border-b border-brand-200 flex justify-between items-center relative z-10 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="text-[13px] font-bold text-brand-800">Order Total: ₹{Number(activeThread.data.totalAmount).toLocaleString('en-IN')}</div>
                      <div className="text-[11px] font-medium text-brand-700/80 bg-brand-100 px-2 py-0.5 rounded-full">({activeThread.data.quantity} {activeThread.data.pricingUnit} @ ₹{Number(activeThread.data.unitPrice).toLocaleString('en-IN')})</div>
                    </div>
                    {activeThread.data.status === 'PLACED' || activeThread.data.status === 'COUNTER_OFFERED' ? (
                      <button 
                        onClick={() => {
                          setCounterPrice(activeThread.data.unitPrice || "");
                          setCounterQuantity(activeThread.data.quantity || "");
                          setCounterNote("");
                          setShowCounterModal(true);
                        }}
                        className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white shadow-sm text-xs font-bold rounded-md transition-colors"
                      >
                        Make Counter Offer
                      </button>
                    ) : null}
                  </div>
                )}

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5 relative">
                  {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-muted text-[13px] font-medium italic">
                      Send a message to start the conversation for this asset.
                    </div>
                  ) : (
                    (() => {
                      const lastCounterOfferIdx = messages.reduce((lastIdx, m, i) => m.type === 'COUNTER_OFFER' ? i : lastIdx, -1);
                      return messages.map((msg, idx) => {
                        const isMine = msg.sender.role === role;
                        return (
                          <div key={idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                            <div className={`cp-bubble ${
                              isMine ? 'cp-bubble--out' : 'cp-bubble--in'
                            }`}>
                              {msg.type === 'COUNTER_OFFER' ? (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 border-b border-white/20 pb-2 mb-2">
                                    <span className="bg-white/20 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> Counter Offer</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[13px] bg-black/10 rounded-lg p-3">
                                    <div className="opacity-80 font-medium">Proposed Price:</div>
                                    <div className="font-bold text-right">₹{msg.proposedPrice}</div>
                                    <div className="opacity-80 font-medium">Quantity:</div>
                                    <div className="font-bold text-right">{msg.proposedQuantity}</div>
                                  </div>
                                  {msg.message && <div className="mt-3 text-[13px] italic opacity-90 leading-relaxed border-l-2 border-white/30 pl-2.5">"{msg.message}"</div>}
                                  
                                  {!isMine && activeThread.data.status === 'COUNTER_OFFERED' && idx === lastCounterOfferIdx && (
                                    <div className="flex gap-2.5 mt-4 pt-4 border-t border-white/10">
                                      <button onClick={handleAccept} className="flex-1 cp-btn cp-btn--success">Accept Offer</button>
                                      <button onClick={handleDecline} className="flex-1 cp-btn cp-btn--secondary">Decline</button>
                                    </div>
                                  )}
                              </div>
                            ) : msg.type === 'ACCEPT' ? (
                               <div className="flex items-center gap-2.5 text-[13px]">
                                  <span className="h-2 w-2 rounded-full bg-success ring-4 ring-success-bg"></span>
                                  <span className="font-bold">{msg.message}</span>
                               </div>
                            ) : msg.type === 'DECLINE' ? (
                               <div className="flex items-center gap-2.5 text-[13px]">
                                  <span className="h-2 w-2 rounded-full bg-danger ring-4 ring-danger-bg"></span>
                                  <span className="font-bold">{msg.message}</span>
                               </div>
                            ) : msg.type === 'SYSTEM_EVENT' ? (
                                (() => {
                                  try {
                                    const eventPayload = JSON.parse(msg.message);
                                    if (eventPayload.event === 'INVOICE_DISPUTED') {
                                      return (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 w-full min-w-[250px] text-left">
                                          <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            Invoice Disputed
                                          </div>
                                          <p className="text-[12px] text-red-900 mb-1"><strong>Reason:</strong> {eventPayload.reason}</p>
                                          {eventPayload.comment && <p className="text-[12px] text-red-900 italic mb-3">"{eventPayload.comment}"</p>}
                                          <a href={`/dashboard/${role.toLowerCase()}/orders`} className="inline-block px-3 py-1.5 text-[11px] font-bold text-white bg-red-600 rounded hover:bg-red-700 transition-colors shadow-sm">View in Orders</a>
                                        </div>
                                      );
                                    }
                                  } catch (e) {}
                                  return <div className="text-[13px] italic text-muted opacity-80 px-2 py-1 bg-surface-3 rounded">System Event Recorded</div>;
                                })()
                            ) : (
                              <div className="text-[14px] whitespace-pre-wrap leading-relaxed">{msg.message}</div>
                            )}
                          </div>
                          <span className="text-[10px] font-medium text-muted mt-1.5 px-1.5">
                            {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      );
                    });
                    })()
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 bg-surface border-t border-border shrink-0">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <Input
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-surface-2 text-[13px]"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="cp-btn cp-btn--primary px-6"
                    >
                      <svg className="w-4 h-4 mr-1.5 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                      Send
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted bg-canvas">
                <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mb-4 border border-border">
                  <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-[15px] font-bold text-ink">Select a Thread</p>
                <p className="text-[13px] text-muted mt-1">Choose a thread from the top bar to view messages.</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted bg-canvas">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: 'var(--cp-brand-50)' }}>
              <svg className="w-10 h-10" style={{ color: 'var(--cp-brand-600)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-[18px] font-[700]" style={{ color: 'var(--cp-text)' }}>Select a Conversation</p>
            <p className="text-[13px] font-[500] mt-1.5 max-w-xs text-center" style={{ color: 'var(--cp-text-muted)' }}>Choose a company from the sidebar to view your negotiations and messages</p>
          </div>
        )}
      </div>

      {/* Counter Offer Modal */}
      {showCounterModal && activeThread && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowCounterModal(false)}></div>
          <div className="bg-surface w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative z-10 border border-border">
            <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surface">
              <h3 className="text-[18px] font-bold text-ink tracking-tight">Make a Counter Offer</h3>
              <button onClick={() => setShowCounterModal(false)} className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center text-muted hover:text-ink hover:bg-border transition-colors">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
            <form onSubmit={handleCounter} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Proposed Price (₹)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={counterPrice}
                  onChange={e => setCounterPrice(e.target.value)}
                  required
                />
                <Input
                  label={`Quantity (${activeThread.data.pricingUnit}s)`}
                  type="number"
                  min="1"
                  value={counterQuantity}
                  onChange={e => setCounterQuantity(e.target.value)}
                  required
                />
              </div>
              <Textarea
                label="Note / Justification"
                value={counterNote}
                onChange={e => setCounterNote(e.target.value)}
                placeholder="Explain why you are proposing these terms..."
              />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCounterModal(false)} className="cp-btn cp-btn--secondary">Cancel</button>
                <button type="submit" className="cp-btn cp-btn--primary">Send Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Alert Box */}
      {alertConfig && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setAlertConfig(null)}></div>
          <div className="relative bg-surface rounded-xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200 border border-border">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-danger-bg mb-4 ring-8 ring-danger-bg/50">
              <svg className="h-6 w-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-ink mb-2">Error</h3>
            <p className="text-[13px] text-muted mb-6">{alertConfig.message}</p>
            <button onClick={() => setAlertConfig(null)} className="w-full cp-btn cp-btn--danger-outline py-2.5">
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

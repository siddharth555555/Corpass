"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

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
  const [filter, setFilter] = useState<"ALL" | "ORDERS" | "INQUIRIES">("ALL");
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
          title: `Order: ${o.productName}`,
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
          title: `Inquiry: ${i.product?.name || i.customProductRequest || 'General'}`,
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
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [activeThread]);

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

  const filteredCounterparties = counterparties.map(cp => {
    const filterType = filter === "ORDERS" ? "ORDER" : filter === "INQUIRIES" ? "INQUIRY" : "ALL";
    const ft = cp.threads.filter(t => filter === "ALL" || t.type === filterType);
    return { ...cp, threads: ft };
  }).filter(cp => cp.threads.length > 0);

  const activeFilteredCp = filteredCounterparties.find(cp => cp.id === activeCounterparty?.id);
  const activeThreadsToDisplay = activeFilteredCp?.threads || [];

  return (
    <div className="flex h-[calc(100vh-140px)] bg-paper border border-border rounded overflow-hidden shadow-sm">
      {/* Sidebar List (Counterparties) */}
      <div className={`w-full md:w-1/3 border-r border-border flex flex-col bg-paper-2 shrink-0 ${activeCounterparty ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border bg-paper">
          <h2 className="text-lg font-bold text-ink">Messages & Negotiations</h2>
          <div className="flex gap-2 mt-3">
            {(["ALL", "ORDERS", "INQUIRIES"] as const).map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setActiveThread(null); }}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  filter === f ? "bg-ink text-white shadow-sm" : "bg-paper text-slate hover:bg-border-subtle border border-border"
                }`}
              >
                {f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-slate text-sm">Loading...</div>
          ) : filteredCounterparties.length === 0 ? (
            <div className="p-6 text-center text-slate text-sm">No conversations found.</div>
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
                className={`w-full text-left p-4 border-b border-border transition-all duration-200 ${
                  activeCounterparty?.id === cp.id ? "bg-paper-2 border-l-4 border-l-primary-500" : "hover:bg-paper border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-semibold text-ink truncate pr-2">{cp.name}</span>
                  <span className="text-[10px] text-slate whitespace-nowrap">
                    {new Date(cp.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-slate flex items-center gap-2">
                  <span className="bg-paper border border-border rounded px-1.5 py-0.5">{cp.threads.length} active threads</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-canvas relative min-w-0 ${!activeCounterparty ? 'hidden md:flex' : 'flex'}`}>
        {activeCounterparty ? (
          <>
            {/* Header: Counterparty Info & Asset Filter */}
            <div className="bg-paper border-b border-border shadow-sm z-20 relative flex flex-col">
              <div className="p-4 flex items-center gap-3">
                <button 
                  onClick={() => setActiveCounterparty(null)}
                  className="md:hidden h-8 w-8 -ml-2 rounded-full flex items-center justify-center text-slate hover:bg-paper-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="h-10 w-10 rounded-full bg-paper-2 flex items-center justify-center text-ink font-bold text-lg shrink-0">
                  {activeCounterparty.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-ink truncate">{activeCounterparty.name}</h3>
                  <p className="text-xs text-slate">{role === 'SELLER' ? 'Buyer Company' : 'Supplier Company'}</p>
                </div>
              </div>
              
              {/* Asset Dropdown Filter */}
              <div className="px-4 pb-3">
                <div className="relative">
                  <button 
                    onClick={() => setIsThreadDropdownOpen(!isThreadDropdownOpen)}
                    className="w-full flex items-center bg-surface border border-border rounded-lg overflow-hidden shadow-sm hover:border-slate-300 transition-colors text-left"
                  >
                    <span className="pl-3 pr-2 py-2 text-[10px] font-bold text-slate uppercase tracking-widest shrink-0 bg-paper-2 border-r border-border">
                      {activeThread?.type || 'ASSET'}
                    </span>
                    <div className="flex-1 py-2 pr-8 pl-3 bg-transparent text-sm font-semibold text-ink truncate">
                      {activeThread 
                        ? `${activeThread.title.replace(/^Order:\s*/i, '').replace(/^Inquiry:\s*/i, '')} (${activeThread.status})` 
                        : 'Select a thread...'}
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate">
                      <svg className={`w-4 h-4 transition-transform duration-200 ${isThreadDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </button>

                  {isThreadDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsThreadDropdownOpen(false)}></div>
                      <div className="absolute z-20 w-full mt-1 bg-paper border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {activeThreadsToDisplay.length > 0 ? (
                          activeThreadsToDisplay.map(t => (
                            <button
                              key={t.id}
                              onClick={() => {
                                setActiveThread(t);
                                setIsThreadDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-paper-2 transition-colors border-b border-border/50 last:border-0 flex justify-between items-center ${activeThread?.id === t.id ? 'bg-paper-2 font-semibold text-ink' : 'text-slate'}`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${t.type === 'ORDER' ? 'bg-money/10 text-money border-money/20' : 'bg-ink/10 text-ink border-ink/20'} uppercase tracking-wider`}>
                                  {t.type}
                                </span>
                                <span className={`truncate ${activeThread?.id === t.id ? 'text-ink' : ''}`}>{t.title.replace(/^Order:\s*/i, '').replace(/^Inquiry:\s*/i, '')}</span>
                              </div>
                              <span className="text-[10px] text-slate ml-2 shrink-0 bg-surface px-1.5 py-0.5 rounded border border-border uppercase font-semibold">{t.status}</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-slate text-center">No threads found.</div>
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
                  <div className="px-4 py-2 bg-paper-2/50 border-b border-border flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-ink">Order Total: ₹{Number(activeThread.data.totalAmount).toLocaleString('en-IN')}</div>
                      <div className="text-xs text-slate">({activeThread.data.quantity} {activeThread.data.pricingUnit} @ ₹{Number(activeThread.data.unitPrice).toLocaleString('en-IN')})</div>
                    </div>
                    {activeThread.data.status === 'PLACED' || activeThread.data.status === 'COUNTER_OFFERED' ? (
                      <button 
                        onClick={() => {
                          setCounterPrice(activeThread.data.unitPrice || "");
                          setCounterQuantity(activeThread.data.quantity || "");
                          setCounterNote("");
                          setShowCounterModal(true);
                        }}
                        className="px-3 py-1.5 bg-ink hover:bg-ink text-white shadow-sm text-xs font-medium rounded-md transition-colors"
                      >
                        Make Counter Offer
                      </button>
                    ) : null}
                  </div>
                )}

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-slate text-sm">
                      Send a message to start the conversation for this asset.
                    </div>
                  ) : (
                    (() => {
                      const lastCounterOfferIdx = messages.reduce((lastIdx, m, i) => m.type === 'COUNTER_OFFER' ? i : lastIdx, -1);
                      return messages.map((msg, idx) => {
                        const isMine = msg.sender.role === role;
                        return (
                          <div key={idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[70%] rounded px-4 py-2 ${
                              isMine ? 'bg-ink text-white rounded-br-sm shadow-sm' : 'bg-paper border border-border text-ink rounded-bl-sm shadow-sm'
                            }`}>
                              {msg.type === 'COUNTER_OFFER' ? (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 border-b border-white/20 pb-2 mb-2">
                                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide">Counter Offer</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                    <div className="opacity-80">Proposed Price:</div>
                                    <div className="font-semibold">₹{msg.proposedPrice}</div>
                                    <div className="opacity-80">Quantity:</div>
                                    <div className="font-semibold">{msg.proposedQuantity}</div>
                                  </div>
                                  {msg.message && <div className="mt-2 text-sm italic opacity-90">"{msg.message}"</div>}
                                  
                                  {!isMine && activeThread.data.status === 'COUNTER_OFFERED' && idx === lastCounterOfferIdx && (
                                    <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                                      <button onClick={handleAccept} className="flex-1 bg-money hover:bg-money text-white shadow-sm text-xs py-2 rounded-md font-bold transition-colors">Accept Offer</button>
                                      <button onClick={handleDecline} className="flex-1 bg-paper text-ink hover:bg-paper-2 border border-border text-xs py-2 rounded-md font-bold transition-colors">Decline</button>
                                    </div>
                                  )}
                              </div>
                            ) : msg.type === 'ACCEPT' ? (
                               <div className="flex items-center gap-2 text-sm">
                                  <span className="h-2 w-2 rounded-full bg-emerald-300"></span>
                                  <span className="font-medium">{msg.message}</span>
                               </div>
                            ) : msg.type === 'DECLINE' ? (
                               <div className="flex items-center gap-2 text-sm">
                                  <span className="h-2 w-2 rounded-full bg-red-300"></span>
                                  <span className="font-medium">{msg.message}</span>
                               </div>
                            ) : (
                              <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</div>
                            )}
                          </div>
                          <span className="text-[10px] text-slate mt-1 px-1">
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
                <div className="p-4 bg-paper border-t border-border">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-canvas"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="px-6 py-2.5 bg-ink text-white rounded font-medium text-sm hover:bg-ink focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate bg-paper-2/30">
                <p className="text-sm font-medium">Select an asset from the top bar to view messages.</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate bg-paper-2/30">
            <svg className="w-16 h-16 text-border-default mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-sm font-medium text-ink">Select a Supplier</p>
            <p className="text-xs text-slate mt-1">Choose a company from the sidebar to view your negotiations</p>
          </div>
        )}
      </div>

      {/* Counter Offer Modal */}
      {showCounterModal && activeThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-paper w-full max-w-md rounded shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-paper">
              <h3 className="text-lg font-bold text-ink">Make a Counter Offer</h3>
              <button onClick={() => setShowCounterModal(false)} className="h-8 w-8 rounded-full bg-paper-2 flex items-center justify-center text-slate hover:text-ink transition-colors">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
            <form onSubmit={handleCounter} className="p-6 space-y-4">
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
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCounterModal(false)} className="flex-1 px-4 py-2 bg-paper hover:bg-paper-2 border border-border text-ink text-sm font-medium rounded transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-ink hover:bg-ink text-white text-sm font-medium rounded shadow-sm transition-colors">Send Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Alert Box */}
      {alertConfig && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAlertConfig(null)}></div>
          <div className="relative bg-paper rounded shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-ink mb-2">Error</h3>
            <p className="text-sm text-slate mb-6">{alertConfig.message}</p>
            <button onClick={() => setAlertConfig(null)} className="w-full btn-primary bg-red-600 hover:bg-red-700 border-none text-sm py-2.5">
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

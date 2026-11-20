import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Send, Sparkles, Trash2, UserRound, X } from 'lucide-react';
import api from '../services/api';
import { getVehicleImage } from '../services/vehicleImage';
import { displayBrandName, displayModelAndVariant } from '../utils/vehicleName';

const CHAT_KEY = 'evora.quick-advisor.v1';
const initialChat = () => {
  try { const saved = JSON.parse(localStorage.getItem(CHAT_KEY)); if (saved?.messages?.length) return saved; } catch { /* start a clean local session */ }
  return { conversationId: '', messages: [{ role: 'assistant', reply: 'Hi! I’m EVora. I can help with EV questions, and I’m happy to chat about other topics too.' }] };
};

export default function AdvisorDrawer() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [chat, setChat] = useState(initialChat);
  const { conversationId, messages } = chat;
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, busy, open]);
  useEffect(() => { try { localStorage.setItem(CHAT_KEY, JSON.stringify(chat)); } catch { /* chat still works for this tab */ } }, [chat]);
  useEffect(() => {
    const openFromHeader = () => setOpen(true);
    window.addEventListener('evora:open-advisor', openFromHeader);
    return () => window.removeEventListener('evora:open-advisor', openFromHeader);
  }, []);

  const send = async (event) => {
    event?.preventDefault();
    const message = draft.trim();
    if (!message || busy) return;
    setDraft('');
    setChat((current) => ({ ...current, messages: [...current.messages, { role: 'user', reply: message }] }));
    setBusy(true);
    try {
      const response = await api.post('/advisor/chat', { message, conversationId: conversationId || undefined });
      const data = response.data;
      setChat((current) => ({ conversationId: data.conversationId || current.conversationId, messages: [...current.messages, { role: 'assistant', reply: data.reply, notice: data.notice, cards: data.cards || [] }] }));
    } catch (error) {
      setChat((current) => ({ ...current, messages: [...current.messages, { role: 'assistant', reply: error.response?.data?.message || 'I couldn’t reach the EV advisor. Please try again.' }] }));
    } finally { setBusy(false); }
  };
  const clearChat = async () => {
    const previousConversationId = conversationId;
    setDraft('');
    setChat({ conversationId: '', messages: [{ role: 'assistant', reply: 'Hi! I’m EVora. I can help with EV questions, and I’m happy to chat about other topics too.' }] });
    if (previousConversationId) {
      try { await api.delete(`/advisor/conversations/${previousConversationId}`); }
      catch (error) { console.warn('Could not delete the saved Ask EVora conversation.', error); }
    }
  };

  return <>
    {open && <div className="advisor-backdrop fixed inset-0 z-50 flex justify-end bg-slate-950/25" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <aside role="dialog" aria-modal="true" aria-label="EVora EV advisor chat" className="advisor-drawer flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="evora-green-gradient flex items-center justify-between px-5 py-4 text-white shadow-sm"><div className="flex items-center gap-3"><span className="rounded-full border border-white/30 bg-white/20 p-2 text-white shadow-inner"><Bot className="h-5 w-5" /></span><div><h2 className="font-display text-base font-semibold">AI EV Advisor</h2><p className="text-xs text-white/80">Online · Ready to help</p></div></div><div className="flex items-center gap-1"><button onClick={clearChat} aria-label="Delete Ask EVora chat" title="Delete chat and start fresh" className="rounded-lg p-2 text-white/90 transition hover:bg-white/15 hover:text-white"><Trash2 className="h-4 w-4" /></button><button onClick={() => setOpen(false)} aria-label="Close advisor" className="rounded-lg p-2 text-white/90 transition hover:bg-white/15 hover:text-white"><X className="h-5 w-5" /></button></div></header>
        <div className="flex-1 space-y-4 overflow-y-auto bg-[#f8faf8] p-4">
          {messages.map((item, index) => <div key={index} className={`chat-message-in flex items-start gap-2.5 ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {item.role === 'assistant' && <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-700 text-white shadow-sm"><Bot className="h-4 w-4" /></span>}
            <div className={`max-w-[84%] rounded-2xl px-4 py-3 ${item.role === 'user' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm' : 'border border-aurora-border bg-white text-aurora-text shadow-sm'}`}><p className="whitespace-pre-wrap text-sm leading-6">{item.reply}</p>{item.notice && <p className="mt-2 text-xs text-amber-800">{item.notice}</p>}{item.cards?.map((car) => <Link key={car._id} to={`/evs/${car._id}`} onClick={() => setOpen(false)} className="mt-3 flex gap-3 rounded-xl border border-aurora-border p-2.5 text-aurora-text transition duration-300 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-sm">{getVehicleImage(car) && <img src={getVehicleImage(car)} alt="" className="h-16 w-24 rounded-lg object-cover" />}<span className="min-w-0"><b className="block truncate text-sm">{displayBrandName(car.brand)} {displayModelAndVariant(car.name, car.brand, car.variant)}</b><small className="mt-1 block text-slate-500">{car.priceExShowroom ? `₹${(car.priceExShowroom / 100000).toFixed(1)} lakh` : ''}{car.claimedRangeKm ? ` · ${car.claimedRangeKm} km range` : ''}</small><small className="mt-1 block font-semibold text-emerald-700">View details →</small></span></Link>)}</div>
            {item.role === 'user' && <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"><UserRound className="h-4 w-4" /></span>}
          </div>)}
          {busy && <div className="w-fit rounded-full border border-aurora-border bg-white px-4 py-2 text-xs text-slate-500">Finding relevant EV details…</div>}<div ref={endRef} />
        </div>
        <form onSubmit={send} className="border-t border-aurora-border bg-white p-4"><div className="flex items-center gap-2 rounded-xl border border-aurora-border p-1.5 focus-within:border-emerald-500"><label className="sr-only" htmlFor="evora-drawer-message">Ask about electric cars</label><input id="evora-drawer-message" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about range, budget, charging…" className="min-w-0 flex-1 px-2 py-2 text-sm text-aurora-text outline-none" /><button disabled={busy || !draft.trim()} aria-label="Send message" className="rounded-lg bg-emerald-700 p-2.5 text-white disabled:opacity-40"><Send className="h-4 w-4" /></button></div><p className="mt-2 text-[11px] text-slate-400">For EV buying, comparisons, charging and ownership questions.</p></form>
      </aside>
    </div>}
  </>;
}

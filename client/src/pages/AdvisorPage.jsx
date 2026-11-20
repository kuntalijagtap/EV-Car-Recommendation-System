import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUp, Plus, MessageSquare, Scale, X, Sparkles, Gauge, UsersRound, Wallet, GitCompareArrows, Database, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import EVMiniCard from '../components/EVMiniCard';
import { cleanVehicleText } from '../utils/vehicleName';

const STARTERS = [
  { title: 'Match my commute', prompt: 'My office is 25 km away, which car is suitable?', icon: Gauge, detail: 'Find an EV with comfortable everyday range' },
  { title: 'Stay in budget', prompt: 'Best EV under 15 lakh for city use', icon: Wallet, detail: 'Compare options that fit your price range' },
  { title: 'Room for everyone', prompt: 'Family of 5, which EV has the most space?', icon: UsersRound, detail: 'Explore seating and family-friendly choices' },
  { title: 'Compare two cars', prompt: 'Nexon EV vs Punch EV, which is better for city driving?', icon: GitCompareArrows, detail: 'Get a clear verdict based on your needs' },
];
const CHAT_STORAGE_KEY = 'evora.advisor.session';

function readSavedSession() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(CHAT_STORAGE_KEY) || 'null');
    if (!saved || !Array.isArray(saved.messages)) return { messages: [], conversationId: null, compareIds: [] };
    return { ...saved, messages: saved.messages.map((message) => ({ ...message, animate: false })) };
  } catch {
    return { messages: [], conversationId: null, compareIds: [] };
  }
}

/* tiny markdown: **bold**, bullet lines, paragraphs */
function Rich({ text }) {
  const normalized = String(text).replace(/\r\n?/g, '\n').split('\n').map(cleanVehicleText).join('\n');
  const inline = (s) => s.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith('**') ? <strong key={i} className="font-semibold text-aurora-text">{p.slice(2, -2)}</strong> : p));
  const blocks = normalized.split(/\n{2,}/);
  return blocks.map((b, i) => {
    const lines = b.split('\n');
    if (lines.every((l) => /^\s*[-*•]\s+/.test(l)))
      return <ul key={i} className="my-2 list-disc space-y-1 pl-5">{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*[-*•]\s+/, ''))}</li>)}</ul>;
    return <p key={i} className="my-2 first:mt-0 last:mb-0">{lines.map((l, j) => <React.Fragment key={j}>{j > 0 && <br />}{inline(l)}</React.Fragment>)}</p>;
  });
}

/* reveals the answer word by word, like ChatGPT */
function Typewriter({ text, animate, onTick }) {
  const [n, setN] = useState(animate ? 0 : text.length);
  useEffect(() => {
    if (!animate) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setN(text.length); return undefined; }
    const id = setInterval(() => setN((c) => { const next = Math.min(text.length, c + 4); return next; }), 16);
    return () => clearInterval(id);
  }, [text, animate]);
  useEffect(() => { onTick?.(); if (n >= text.length) onTick?.(true); }, [n]); // eslint-disable-line
  return <Rich text={text.slice(0, n)} />;
}

export default function AdvisorPage() {
  const [params] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [initialSession] = useState(readSavedSession);
  const [messages, setMessages] = useState(initialSession.messages);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [conversationId, setConversationId] = useState(initialSession.conversationId);
  const [history, setHistory] = useState([]);
  const [typingDone, setTypingDone] = useState({});
  const [compareIds, setCompareIds] = useState(initialSession.compareIds || []);
  const endRef = useRef(null);
  const startedRef = useRef(false);
  const taRef = useRef(null);

  const scroll = () => endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  useEffect(() => { scroll(); }, [messages, busy]);
  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({ messages, conversationId, compareIds }));
    } catch (error) {
      console.warn('Could not preserve the current advisor chat in this tab.', error);
    }
  }, [messages, conversationId, compareIds]);
  const loadHistory = () => { if (isAuthenticated) api.get('/advisor/conversations').then((r) => setHistory(r.data.data)).catch(() => {}); };
  useEffect(loadHistory, [isAuthenticated]); // eslint-disable-line

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || busy) return;
    setInput(''); setBusy(true);
    if (taRef.current) taRef.current.style.height = 'auto';
    setMessages((m) => [...m, { role: 'user', content: message }]);
    try {
      const r = await api.post('/advisor/chat', { message, conversationId });
      setConversationId(r.data.conversationId);
      const idx = messages.length + 1;
      setMessages((m) => [...m, { role: 'assistant', content: r.data.reply, cards: r.data.cards || [], suggestions: r.data.suggestions || [], notice: r.data.notice, animate: true, idx }]);
      loadHistory();
    } catch (err) {
      console.error('Advisor chat request failed:', err);
      const message = err.response?.data?.message
        || (err.request ? 'I could not reach EVora’s server. Make sure both the backend and frontend are running, then try again.' : 'Sorry, something went wrong. Please try again.');
      setMessages((m) => [...m, { role: 'assistant', content: message, cards: [] }]);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => { const q = params.get('question'); if (q && !startedRef.current) { startedRef.current = true; send(q); } }, []); // eslint-disable-line

  const newChat = () => { setMessages([]); setInput(''); setConversationId(null); setTypingDone({}); setCompareIds([]); if (taRef.current) taRef.current.style.height = 'auto'; };
  const deleteChat = async (id = conversationId) => {
    if (!id) { newChat(); return; }
    try {
      await api.delete(`/advisor/conversations/${id}`);
      setHistory((current) => current.filter((chat) => chat._id !== id));
      if (conversationId === id) newChat();
    } catch (error) { console.error('Could not delete advisor chat:', error); }
  };
  const toggleCompare = (id) => setCompareIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current);
  const openChat = async (id) => {
    const r = await api.get(`/advisor/conversations/${id}`);
    const c = r.data.data; if (!c) return;
    setConversationId(c._id);
    setMessages(c.messages.filter((m) => m.role === 'user' || m.role === 'assistant').map((m) => ({ role: m.role, content: m.content, cards: m.cards || [], suggestions: [] })));
  };
  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
  const grow = (e) => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`; };

  const empty = messages.length === 0;
  return (
    <div className={`mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 ${isAuthenticated ? 'lg:grid-cols-[250px_1fr]' : ''}`}>
      {isAuthenticated && (
        <aside className="hidden lg:block">
          <h2 className="mb-3 text-sm font-semibold text-aurora-text">Recent chats</h2>
          <div className="space-y-1">
            {history.length === 0 && <p className="text-sm text-aurora-muted">No saved chats yet.</p>}
            {history.map((h) => (
              <div key={h._id} className={`group flex items-center gap-1 rounded-xl transition hover:bg-white ${conversationId === h._id ? 'bg-white font-medium text-aurora-text shadow-sm' : 'text-aurora-muted'}`}>
                <button onClick={() => openChat(h._id)} className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left text-sm"><MessageSquare className="h-4 w-4 shrink-0" /><span className="truncate">{h.title}</span></button>
                <button onClick={() => deleteChat(h._id)} aria-label={`Delete chat ${h.title}`} title="Delete chat" className="mr-1 rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-rose-50 hover:text-rose-700 group-hover:opacity-100 focus:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        </aside>
      )}

      <section className="flex h-[calc(100vh-7.5rem)] min-h-[560px] min-w-0 flex-col overflow-hidden rounded-2xl border border-aurora-border bg-white shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
        <header className="flex items-center justify-between border-b border-aurora-border bg-white px-5 py-3.5 sm:px-6">
          <div>
            <h1 className="font-display text-base font-semibold leading-tight text-aurora-text">EVora Advisor</h1>
            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-aurora-muted"><Database className="h-3.5 w-3.5 text-aurora-violet" />Recommendations grounded in EVora’s car database</p>
          </div>
          <button onClick={newChat} className="inline-flex items-center gap-1.5 rounded-lg border border-aurora-border px-3 py-2 text-xs font-semibold text-aurora-text transition hover:border-aurora-violet/40 hover:bg-aurora-raised"><Plus className="h-4 w-4" />New chat</button>
        </header>

        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-aurora-base/70 to-white px-4 py-6 sm:px-8">
          {empty ? (
            <div className="mx-auto flex h-full max-w-3xl flex-col justify-center py-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-aurora-violet text-white shadow-violet"><Sparkles className="h-6 w-6" /></div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-aurora-violet">Your personal EV guide</p>
              <h2 className="font-display text-2xl font-semibold leading-tight text-aurora-text sm:text-3xl">Find the EV that fits your day.</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-aurora-muted">Tell me about your commute, budget, family, or the cars you’re considering. I’ll match your needs with vehicles in the EVora database.</p>
              <p className="mb-3 mt-7 text-xs font-semibold text-aurora-muted">Try asking</p>
              <div className="grid w-full gap-3 sm:grid-cols-2">
                {STARTERS.map(({ title, prompt, icon: Icon, detail }) => (
                  <button key={title} onClick={() => send(prompt)} className="group flex min-h-[92px] items-start gap-3 rounded-xl border border-aurora-border bg-white p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-aurora-violet/40 hover:shadow-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-violet">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-aurora-raised text-aurora-violet transition group-hover:bg-aurora-violet group-hover:text-white"><Icon className="h-4 w-4" /></span>
                    <span><span className="block text-sm font-semibold text-aurora-text">{title}</span><span className="mt-1 block text-xs leading-relaxed text-aurora-muted">{detail}</span></span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-7">
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div className={m.role === 'user' ? 'max-w-[85%] rounded-2xl rounded-tr-sm bg-aurora-violet px-4 py-2.5 text-sm text-white' : 'min-w-0 max-w-[90%] text-sm leading-relaxed text-aurora-text'}>
                    {m.role === 'user' ? m.content : (
                      <>
                        <div>
                          <Typewriter text={m.content} animate={!!m.animate && !typingDone[i]} onTick={(done) => { scroll(); if (done) setTypingDone((d) => (d[i] ? d : { ...d, [i]: true })); }} />
                        </div>
                        {m.notice && <p role="status" className="mt-2 rounded-lg border border-amber-400 bg-amber-100 px-3 py-2.5 text-xs font-medium leading-relaxed text-amber-950 shadow-sm">{m.notice}</p>}
                        {m.cards?.length > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-2">{m.cards.map((c) => <EVMiniCard key={c._id} ev={c} onCompare={toggleCompare} isCompared={compareIds.includes(c._id)} compareDisabled={compareIds.length >= 3 && !compareIds.includes(c._id)} />)}</div>}
                        {i === messages.length - 1 && m.suggestions?.length > 0 && <div className="mt-3 flex flex-wrap gap-2" aria-label="Suggested follow-up questions">{m.suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => send(suggestion)} disabled={busy} className="rounded-full border border-aurora-border bg-white px-3 py-1.5 text-xs font-medium text-aurora-muted transition hover:border-aurora-violet hover:text-aurora-violet disabled:opacity-50">{suggestion}</button>)}</div>}
                      </>
                    )}
                  </div>
                </div>
              ))}
              {busy && (
                <div role="status" aria-label="EVora is searching the vehicle database" className="flex items-center gap-2 py-3 text-xs text-aurora-muted">
                  <span className="flex items-center gap-1.5">{[0, 1, 2].map((dot) => <span key={dot} className="typing-dot h-1.5 w-1.5 rounded-full bg-aurora-violet" style={{ animationDelay: `${dot * 0.18}s` }} />)}</span>
                  Checking your needs against EVora’s car database…
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        {compareIds.length > 0 && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-aurora-border bg-aurora-base px-4 py-2.5 sm:px-8"><div className="flex items-center gap-2 text-xs text-aurora-muted"><Scale className="h-4 w-4" />{compareIds.length} vehicle{compareIds.length === 1 ? '' : 's'} selected <button type="button" onClick={() => setCompareIds([])} className="ml-1 inline-flex items-center gap-1 underline underline-offset-2"><X className="h-3 w-3" />Clear</button></div>{compareIds.length >= 2 ? <Link to={`/compare?ids=${compareIds.join(',')}`} className="rounded-lg bg-aurora-violet px-3 py-2 text-xs font-semibold text-white hover:brightness-110">Compare vehicles</Link> : <span className="text-xs text-aurora-muted">Select one more car to compare.</span>}</div>}

        <div className="border-t border-aurora-border bg-white px-4 pb-4 pt-3 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2 rounded-2xl border border-aurora-border bg-aurora-base p-2 transition focus-within:border-aurora-violet focus-within:bg-white focus-within:ring-4 focus-within:ring-aurora-violet/10">
              <textarea ref={taRef} rows={1} value={input} onChange={grow} onKeyDown={onKey} maxLength={600}
                placeholder="Message EVora..."
                className="max-h-40 min-h-[42px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-aurora-text placeholder:text-slate-500 focus:outline-none" />
              <button onClick={() => send()} disabled={busy || !input.trim()} aria-label="Send message" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-aurora-violet text-white transition hover:brightness-110 disabled:opacity-40"><ArrowUp className="h-5 w-5" /></button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

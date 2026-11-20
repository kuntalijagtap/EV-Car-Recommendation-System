import React, { useCallback, useEffect, useState } from 'react';
import { Check, EyeOff, Flag, LoaderCircle, ShieldCheck, ShieldAlert, Users, CarFront, ClipboardCheck, Database, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { getVehicleImage } from '../services/vehicleImage';

const statuses = ['pending', 'published', 'flagged', 'hidden'];

function AdminVehicleThumbnail({ ev }) {
  const [failed, setFailed] = useState(false);
  const image = getVehicleImage(ev);

  return (
    <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-aurora-border bg-aurora-raised sm:h-24 sm:w-36">
      {image && !failed ? <img src={image} alt={`${ev.brandId?.name || ''} ${ev.name}`} className="h-full w-full object-cover" loading="lazy" onError={() => setFailed(true)} /> : <div className="flex h-full flex-col items-center justify-center gap-1 text-aurora-muted"><CarFront className="h-6 w-6" /><span className="text-[10px]">No photo</span></div>}
    </div>
  );
}

export default function AdminPage() {
  const [status, setStatus] = useState('pending');
  const [reviews, setReviews] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [overview, setOverview] = useState(null);
  const [catalogQueue, setCatalogQueue] = useState([]);
  const [sources, setSources] = useState({});
  const [verifyBusy, setVerifyBusy] = useState('');

  const loadReviews = useCallback(async () => {
    setLoading(true); setError('');
    try { const response = await api.get('/admin/reviews', { params: { status } }); setReviews(response.data.data || []); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not load moderation queue.'); }
    finally { setLoading(false); }
  }, [status]);
  useEffect(() => { loadReviews(); }, [loadReviews]);
  useEffect(() => { api.get('/admin/overview').then((response) => setOverview(response.data.data)).catch(() => {}); }, []);
  const loadCatalogQueue = useCallback(async () => {
    try {
      const response = await api.get('/admin/catalog-needs-review');
      const items = response.data.data || [];
      setCatalogQueue(items);
      setSources((current) => Object.fromEntries(items.map((ev) => [ev._id, current[ev._id] ?? ev.dataSourceUrl ?? ''])));
    } catch (requestError) { setError(requestError.response?.data?.message || 'Could not load catalog review tasks.'); }
  }, []);
  useEffect(() => { loadCatalogQueue(); }, [loadCatalogQueue]);

  const moderate = async (reviewId, nextStatus) => {
    setWorkingId(reviewId); setNotice(''); setError('');
    try {
      await api.patch(`/admin/reviews/${reviewId}`, { status: nextStatus, note: notes[reviewId] || '' });
      setNotice(`Review ${nextStatus}.`);
      setReviews((current) => current.filter((review) => review._id !== reviewId));
    } catch (requestError) { setError(requestError.response?.data?.message || 'Could not update this review.'); }
    finally { setWorkingId(''); }
  };

  const verifyCatalog = async (ev, verifyPrice, verifySpecs) => {
    setVerifyBusy(ev._id); setNotice(''); setError('');
    try {
      await api.patch(`/admin/catalog/${ev._id}/verify`, { dataSourceUrl: sources[ev._id] || '', verifyPrice, verifySpecs });
      setNotice(`${ev.brandId?.name || ''} ${ev.name} catalog record updated.`);
      await Promise.all([loadCatalogQueue(), api.get('/admin/overview').then((response) => setOverview(response.data.data))]);
    } catch (requestError) { setError(requestError.response?.data?.message || 'Could not update this EV record.'); }
    finally { setVerifyBusy(''); }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-aurora-border pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-aurora-violet"><ShieldCheck className="h-4 w-4" />EVora administration</p><h1 className="mt-2 font-display text-3xl font-semibold text-aurora-text">Review moderation</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-aurora-muted">Review user-submitted ownership feedback before it appears on vehicle pages or contributes to ratings.</p></div><span className="inline-flex items-center gap-2 rounded-full border border-aurora-border bg-white px-3 py-2 text-xs font-semibold text-aurora-muted"><ShieldAlert className="h-4 w-4 text-amber-700" />Admin-only tools</span></header>
      {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
      {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
      <section aria-label="Website operations overview" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Registered users', value: overview?.users, icon: Users },
          { label: 'EV catalog records', value: overview?.evs, icon: CarFront },
          { label: 'Pending reviews', value: overview?.reviews?.pending, icon: ClipboardCheck },
          { label: 'Need source or verification', value: overview?.needsSourceOrVerification, icon: Database },
        ].map(({ label, value, icon: Icon }) => <article key={label} className="admin-card rounded-xl border border-aurora-border bg-white p-4"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-aurora-muted">{label}</p><Icon className="h-4 w-4 text-emerald-700" /></div><p className="mt-3 font-display text-2xl font-semibold text-aurora-text">{value ?? '—'}</p></article>)}
      </section>
      <section className="rounded-2xl border border-aurora-border bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Operations guide</p><h2 className="mt-1 font-display text-xl font-semibold text-aurora-text">Your admin workflow</h2></div><p className="text-xs text-slate-500">Updates here are restricted to signed-in admins.</p></div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[['01', 'Check EV data', 'Open a catalog task, confirm details against a reliable source, then save the source and verification date.'], ['02', 'Review owner feedback', 'Read the EV, rating and written review. Approve appropriate feedback, or flag/hide content that needs attention.'], ['03', 'Keep the catalog current', 'The overview highlights unverified entries and review volume so you can work through the most important items.']].map(([number, title, text]) => <article key={number} className="rounded-xl bg-[#f6f8f7] p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-sm"><span className="text-xs font-bold text-emerald-700">{number}</span><h3 className="mt-2 text-sm font-semibold text-aurora-text">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></article>)}
        </div>
      </section>
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Catalog quality</p><h2 className="mt-1 font-display text-xl font-semibold text-aurora-text">Source and verify EV details</h2></div><span className="rounded-full bg-[#fff7ed] px-3 py-1.5 text-xs font-semibold text-[#7c2d12]">{catalogQueue.length} open tasks</span></div>
        {catalogQueue.length === 0 ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">No EV records are currently waiting for source or verification details.</p> : <div className="grid gap-4 lg:grid-cols-2">{catalogQueue.map((ev) => <article key={ev._id} className="admin-card rounded-2xl border border-aurora-border bg-white p-5"><div className="flex items-start gap-4"><AdminVehicleThumbnail ev={ev} /><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{ev.brandId?.name || 'Electric vehicle'}</p><h3 className="mt-1 font-display text-lg font-semibold text-aurora-text">{ev.name}</h3><p className="text-xs text-slate-500">{ev.variant || 'Standard variant'} · {ev.isSampleData ? 'Imported/sample record' : 'Catalog record'}</p></div></div>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">{!ev.priceVerifiedAt && <span className="rounded-full bg-[#fff7ed] px-2.5 py-1 font-semibold text-[#7c2d12]">Price needs checking</span>}{!ev.specsVerifiedAt && <span className="rounded-full bg-[#fff7ed] px-2.5 py-1 font-semibold text-[#7c2d12]">Specs need checking</span>}{!ev.dataSourceUrl && <span className="rounded-full bg-[#fff1f2] px-2.5 py-1 font-semibold text-[#9f1239]">Source missing</span>}</div>
          <label className="mt-4 block text-xs font-semibold text-aurora-text">Data source URL<input type="url" value={sources[ev._id] || ''} onChange={(event) => setSources((current) => ({ ...current, [ev._id]: event.target.value }))} placeholder="https://manufacturer.example/specifications" className="mt-1.5 w-full rounded-lg border border-aurora-border bg-white px-3 py-2.5 text-sm font-normal text-aurora-text outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
          <div className="mt-4 flex flex-wrap gap-2"><button disabled={verifyBusy === ev._id || !sources[ev._id]?.trim()} onClick={() => verifyCatalog(ev, true, false)} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50">Verify price</button><button disabled={verifyBusy === ev._id || !sources[ev._id]?.trim()} onClick={() => verifyCatalog(ev, false, true)} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:opacity-50">Verify specifications</button><button disabled={verifyBusy === ev._id || !sources[ev._id]?.trim()} onClick={() => verifyCatalog(ev, true, true)} className="rounded-lg border border-aurora-border px-3 py-2 text-xs font-semibold text-aurora-text transition hover:bg-aurora-raised disabled:opacity-50">Verify both</button>{ev.dataSourceUrl && <a href={ev.dataSourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 py-2 text-xs font-semibold text-slate-500 hover:text-emerald-800">Open source <ExternalLink className="h-3.5 w-3.5" /></a>}</div>
        </article>)}</div>}
      </section>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter reviews by status">{statuses.map((item) => <button key={item} role="tab" aria-selected={status === item} onClick={() => setStatus(item)} className={`rounded-full border px-4 py-2 text-xs font-semibold capitalize transition ${status === item ? 'border-aurora-violet bg-aurora-violet text-white' : 'border-aurora-border bg-white text-aurora-muted hover:border-aurora-violet/40 hover:text-aurora-text'}`}>{item}</button>)}</div>
      {loading ? <div className="flex items-center justify-center gap-2 py-20 text-sm text-aurora-muted"><LoaderCircle className="h-4 w-4 animate-spin" />Loading reviews…</div> : reviews.length === 0 ? <div className="rounded-2xl border border-aurora-border bg-white p-10 text-center"><Check className="mx-auto h-8 w-8 text-emerald-700" /><h2 className="mt-3 font-display text-lg font-semibold text-aurora-text">Nothing to review here</h2><p className="mt-1 text-sm text-aurora-muted">No {status} owner reviews are currently in the queue.</p></div> : <div className="space-y-4">{reviews.map((review) => <article key={review._id} className="rounded-2xl border border-aurora-border bg-white p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-aurora-violet">{review.evId?.name || 'Unknown EV'} {review.evId?.variant ? `· ${review.evId.variant}` : ''}</p><h2 className="mt-2 font-display text-lg font-semibold text-aurora-text">{review.title}</h2><p className="mt-1 text-xs text-aurora-muted">{review.userId?.name || 'User'} · {review.userId?.email || 'No email'} · {review.city || 'City not provided'}</p></div><span className="rounded-full bg-[#fff7ed] px-3 py-1.5 text-xs font-bold text-[#7c2d12]">{review.rating}/5 · {review.moderationStatus}</span></div><p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-aurora-text">{review.body}</p><div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-aurora-muted"><span>{review.monthsOwned} months owned</span><span>{review.ownerReportedRealWorldRangeKm} km owner-reported range</span><span>{new Date(review.createdAt).toLocaleDateString()}</span></div><label className="mt-4 block text-xs font-semibold text-aurora-text">Moderator note<textarea maxLength={300} rows={2} value={notes[review._id] ?? review.moderationNote ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [review._id]: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-aurora-border px-3 py-2 text-sm font-normal" placeholder="Optional note for the moderation record" /></label><div className="mt-4 flex flex-wrap gap-2"><button disabled={workingId === review._id} onClick={() => moderate(review._id, 'published')} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"><Check className="h-3.5 w-3.5" />Approve</button><button disabled={workingId === review._id} onClick={() => moderate(review._id, 'flagged')} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"><Flag className="h-3.5 w-3.5" />Flag</button><button disabled={workingId === review._id} onClick={() => moderate(review._id, 'hidden')} className="inline-flex items-center gap-1.5 rounded-lg border border-aurora-border bg-white px-3 py-2 text-xs font-semibold text-aurora-muted hover:bg-aurora-raised disabled:opacity-50"><EyeOff className="h-3.5 w-3.5" />Hide</button></div></article>)}</div>}
    </div>
  );
}

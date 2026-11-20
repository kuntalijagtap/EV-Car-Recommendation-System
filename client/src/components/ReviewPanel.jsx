import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquareText, Send, Star, LoaderCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const categories = [
  ['range', 'Driving range'],
  ['comfort', 'Comfort'],
  ['chargingExperience', 'Charging'],
  ['buildQuality', 'Build quality'],
  ['valueForMoney', 'Value for money'],
];
const blankDraft = () => ({ rating: 5, categoryRatings: Object.fromEntries(categories.map(([key]) => [key, 5])), title: '', body: '', city: '', monthsOwned: '', ownerReportedRealWorldRangeKm: '' });

function RatingInput({ label, value, onChange, compact = false }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-semibold text-slate-700">{label}</legend>
      <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <button key={rating} type="button" role="radio" aria-checked={value === rating} aria-label={`${rating} star${rating === 1 ? '' : 's'}`} onClick={() => onChange(rating)} className="rounded p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
            <Star className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} ${rating <= value ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} />
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function ReviewPanel({ evId, evName }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const location = useLocation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [draft, setDraft] = useState(blankDraft);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get(`/evs/${evId}/reviews?limit=6`).then(({ data }) => {
      if (active && data.success) setReviews(data.data || []);
    }).catch(() => {
      if (active) setError('Reviews could not be loaded. Please try again later.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [evId]);

  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const submitReview = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    const payload = {
      ...draft,
      rating: Number(draft.rating),
      categoryRatings: Object.fromEntries(categories.map(([key]) => [key, Number(draft.categoryRatings[key])])),
      monthsOwned: Number(draft.monthsOwned),
      ownerReportedRealWorldRangeKm: Number(draft.ownerReportedRealWorldRangeKm),
      city: draft.city.trim() || undefined,
    };
    try {
      const { data } = await api.post(`/evs/${evId}/reviews`, payload);
      if (!data.success) throw new Error(data.message || 'Your review could not be submitted.');
      const submitted = { ...data.data, author: user?.name || 'EV owner' };
      setReviews((current) => [submitted, ...current.filter((review) => review._id !== submitted._id)].slice(0, 6));
      setDraft(blankDraft());
      setFormOpen(false);
      setNotice('Thanks for sharing your experience. Your review is published and will appear on the homepage.');
    } catch (err) {
      const validation = err.response?.data?.errors?.map((item) => item.message).join(' ');
      setError(err.response?.data?.message === 'Validation failed' ? validation : err.response?.data?.message || err.message || 'Your review could not be submitted. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'mt-1.5 w-full rounded-lg border border-slate-300 !bg-white px-3 py-2.5 text-sm !text-black caret-black outline-none transition placeholder:!text-slate-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15';

  return (
    <section className="space-y-5 border-t border-aurora-border pt-8" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Owner feedback</p>
          <h2 id="reviews-heading" className="mt-1 font-display text-2xl font-semibold text-aurora-text">Reviews for {evName}</h2>
        </div>
        {isAuthenticated ? (
          <button type="button" onClick={() => { setFormOpen((open) => !open); setError(''); }} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800">
            <MessageSquareText className="h-4 w-4" /> {formOpen ? 'Close form' : 'Write a review'}
          </button>
        ) : !authLoading ? (
          <Link to="/login" state={{ from: location.pathname }} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800">Sign in to review</Link>
        ) : null}
      </div>

      {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{notice}</p>}
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      {formOpen && isAuthenticated && (
        <form onSubmit={submitReview} className="space-y-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-700">Review title<input required minLength={3} maxLength={120} value={draft.title} onChange={(event) => update('title', event.target.value)} placeholder="What should other drivers know?" className={inputClass} /></label>
            <div className="text-xs font-semibold text-slate-700"><RatingInput label="Overall rating" value={draft.rating} onChange={(value) => update('rating', value)} /></div>
          </div>
          <label className="block text-xs font-semibold text-slate-700">Your experience<textarea required minLength={10} maxLength={3000} rows={4} value={draft.body} onChange={(event) => update('body', event.target.value)} placeholder={`How has your ${evName} been to own and drive?`} className={inputClass} /><span className="mt-1 block text-right font-normal text-slate-500">{draft.body.length}/3000</span></label>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-xs font-semibold text-slate-700">Months owned<input required type="number" min="0" max="600" step="1" value={draft.monthsOwned} onChange={(event) => update('monthsOwned', event.target.value)} placeholder="e.g. 8" className={inputClass} /></label>
            <label className="text-xs font-semibold text-slate-700">Your typical range (km)<input required type="number" min="20" max="1200" step="1" value={draft.ownerReportedRealWorldRangeKm} onChange={(event) => update('ownerReportedRealWorldRangeKm', event.target.value)} placeholder="e.g. 320" className={inputClass} /></label>
            <label className="text-xs font-semibold text-slate-700">City (optional)<input maxLength={80} value={draft.city} onChange={(event) => update('city', event.target.value)} placeholder="e.g. Pune" className={inputClass} /></label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(([key, label]) => <RatingInput key={key} compact label={label} value={draft.categoryRatings[key]} onChange={(value) => setDraft((current) => ({ ...current, categoryRatings: { ...current.categoryRatings, [key]: value } }))} />)}
          </div>
          <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60">
            {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{saving ? 'Publishing…' : 'Publish review'}
          </button>
          <p className="text-xs leading-5 text-slate-600">Reviews are published immediately. Please share your own ownership experience; EVora may remove inappropriate content.</p>
        </form>
      )}

      {loading ? <div className="rounded-xl border border-aurora-border p-5 text-sm text-slate-500">Loading reviews…</div> : reviews.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => <article key={review._id} className="rounded-xl border border-aurora-border bg-white p-5">
            <div className="flex items-start justify-between gap-3"><div><div aria-label={`${review.rating} out of 5 stars`} className="text-sm tracking-widest text-amber-500">{'★'.repeat(Math.max(0, Math.min(5, Math.round(review.rating || 0))))}<span className="text-slate-200">{'★'.repeat(5 - Math.max(0, Math.min(5, Math.round(review.rating || 0))))}</span></div><h3 className="mt-2 font-semibold text-aurora-text">{review.title}</h3></div><span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">{review.isVerifiedOwner ? 'Verified owner' : 'EV driver'}</span></div>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{review.body}</p>
            <p className="mt-4 border-t border-aurora-border pt-3 text-xs text-slate-500">{review.author || review.userId?.name || 'EV owner'}{review.city && review.city !== 'Not provided' ? ` · ${review.city}` : ''}{review.monthsOwned != null ? ` · ${review.monthsOwned} months with this EV` : ''}</p>
          </article>)}
        </div>
      ) : <div className="rounded-xl border border-dashed border-aurora-border p-6 text-center text-sm text-slate-500">No reviews yet. {isAuthenticated ? 'Be the first to share your experience.' : 'Sign in to be the first to review this EV.'}</div>}
    </section>
  );
}

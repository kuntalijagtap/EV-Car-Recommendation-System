import React, { useEffect, useState } from 'react';
import { ArrowRight, BatteryCharging, Gauge, MessageCircle, MoveUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getVehicleImage } from '../services/vehicleImage';

const money = (value) => value ? `₹${(value / 100000).toFixed(1)} lakh` : 'Price on request';

function HomeVehicleCard({ ev, index }) {
  const photo = getVehicleImage(ev);
  return (
    <Link to={`/evs/${ev._id}`} className={`home-enter home-enter-delay-${index + 1} group overflow-hidden rounded-xl border border-aurora-border bg-white transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg`}>
      <div className="aspect-[16/10] overflow-hidden bg-[#f1f4f2]">
        {photo ? <img src={photo} alt={`${ev.brandId?.name || ''} ${ev.name}`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center text-sm text-slate-400">Photo unavailable</div>}
      </div>
      <div className="p-4">
        <p className="text-xs text-slate-500">{ev.brandId?.name || 'Electric vehicle'}</p>
        <h3 className="mt-1 truncate font-display text-lg font-semibold text-aurora-text">{ev.name}</h3>
        <div className="mt-3 flex items-center justify-between gap-2 text-sm">
          <span className="font-semibold text-aurora-text">{money(ev.price?.exShowroom)}</span>
          {ev.range?.claimedWltp || ev.range?.claimedNedc ? <span className="text-slate-500">{ev.range.claimedWltp || ev.range.claimedNedc} km</span> : null}
        </div>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">View details <MoveUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [reviewPage, setReviewPage] = useState(0);
  const [videoIndex, setVideoIndex] = useState(0);
  const videos = [{ id: 'eTnu_E-bj0s', title: 'All charging questions answered', source: 'TATA.ev' }, { id: 'uDQcdNFtiOk', title: 'EV batteries and chargers', source: 'Know Your Hyundai' }];

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      api.get('/evs?sortBy=rating_desc&limit=9'),
      api.get('/stats/home'),
      api.get('/evs/reviews/featured?limit=6'),
    ]).then(([evResult, statsResult, reviewsResult]) => {
      if (!active) return;
      if (evResult.status === 'fulfilled' && evResult.value.data.success) setVehicles(evResult.value.data.data || []);
      if (statsResult.status === 'fulfilled' && statsResult.value.data.success) setStats(statsResult.value.data.data);
      if (reviewsResult.status === 'fulfilled' && reviewsResult.value.data.success) setReviews(reviewsResult.value.data.data || []);
    });
    return () => { active = false; };
  }, []);

  const vehiclesWithPhotos = vehicles.filter((ev) => getVehicleImage(ev));
  const reviewPages = Math.max(1, Math.ceil(reviews.length / 3));
  const featured = vehiclesWithPhotos.find((ev) => /ioniq\s*5/i.test(ev.name)) || vehiclesWithPhotos[0] || vehicles[0];
  const heroPhoto = getVehicleImage(featured) || '/images/evs/audi-q8-e-tron.jpg';
  const askAdvisor = (event) => {
    event.preventDefault();
    const text = question.trim();
    navigate(text ? `/advisor?question=${encodeURIComponent(text)}` : '/advisor');
  };

  return (
    <main className="bg-white">
      <section className="relative isolate overflow-hidden bg-[#f6f8f7]">
        <div className="mx-auto grid max-w-7xl items-center gap-5 px-5 py-10 sm:px-8 sm:py-14 lg:min-h-[510px] lg:grid-cols-[0.9fr_1.1fr] lg:gap-0 lg:px-12 lg:py-12">
          <div className="home-enter relative z-10 max-w-lg">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">A clearer way to choose</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-aurora-text sm:text-5xl lg:text-[3.65rem]">Make your next drive electric.</h1>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-600">Find an EV that fits your budget, routine and range.</p>
            <form onSubmit={askAdvisor} className="mt-7 flex max-w-md items-center gap-2 rounded-xl border border-aurora-border bg-white p-1.5 shadow-sm focus-within:border-emerald-500/60">
              <label htmlFor="home-question" className="sr-only">Ask for an EV recommendation</label>
              <MessageCircle className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
              <input id="home-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask for a recommendation" className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-sm text-aurora-text outline-none placeholder:text-slate-400" />
              <button aria-label="Ask EVora" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-700"><ArrowRight className="h-4 w-4" /></button>
            </form>
            <div className="mt-5 flex items-center gap-5">
              <Link to="/catalog" className="rounded-lg bg-aurora-text px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">Explore EVs</Link>
              <Link to="/advisor" className="text-sm font-semibold text-aurora-text transition hover:text-emerald-700">Ask the EV advisor <ArrowRight className="ml-1 inline h-4 w-4" /></Link>
            </div>
          </div>

          <div className="home-enter home-enter-delay-1 relative mx-auto flex h-[260px] w-full max-w-[700px] items-center justify-center sm:h-[350px] lg:h-[420px]">
            <img src={heroPhoto} alt={featured ? `${featured.brandId?.name || ''} ${featured.name}` : 'Electric SUV from EVora’s catalog'} className="relative z-10 max-h-full w-full object-contain drop-shadow-[0_28px_24px_rgba(15,23,42,0.18)] transition duration-700 hover:scale-[1.025]" />
            {featured ? <Link to={`/evs/${featured._id}`} className="absolute bottom-3 right-0 z-20 rounded-xl border border-white/70 bg-white/95 px-4 py-3 shadow-lg backdrop-blur transition hover:-translate-y-1 sm:bottom-5 sm:right-2"><span className="block text-[10px] font-semibold uppercase tracking-widest text-emerald-700">Featured EV</span><span className="mt-1 block font-display text-sm font-semibold text-aurora-text">{featured.brandId?.name} {featured.name}</span><span className="mt-1 block text-xs text-slate-500">{money(featured.price?.exShowroom)}</span></Link> : <Link to="/catalog" className="absolute bottom-3 right-0 z-20 rounded-xl border border-white/70 bg-white/95 px-4 py-3 shadow-lg backdrop-blur transition hover:-translate-y-1 sm:bottom-5 sm:right-2"><span className="block text-[10px] font-semibold uppercase tracking-widest text-emerald-700">EVora catalog</span><span className="mt-1 block font-display text-sm font-semibold text-aurora-text">Find your next EV</span></Link>}
          </div>
        </div>
        {stats && <div className="mx-auto grid max-w-7xl grid-cols-2 border-t border-aurora-border/80 px-5 py-4 sm:grid-cols-3 sm:px-8 lg:px-12"><div className="flex items-center gap-3 py-2"><Gauge className="h-5 w-5 text-emerald-700" /><span><b className="block text-sm text-aurora-text">{stats.evs} EVs</b><small className="text-xs text-slate-500">in the catalog</small></span></div><div className="flex items-center gap-3 py-2"><BatteryCharging className="h-5 w-5 text-emerald-700" /><span><b className="block text-sm text-aurora-text">{stats.brands} brands</b><small className="text-xs text-slate-500">to explore</small></span></div><div className="col-span-2 flex items-center gap-3 py-2 sm:col-span-1"><MoveUpRight className="h-5 w-5 text-emerald-700" /><span><b className="block text-sm text-aurora-text">Built around your drive</b><small className="text-xs text-slate-500">range, price and charging</small></span></div></div>}
      </section>

      <section className="mx-auto max-w-7xl px-5 py-11 sm:px-8 sm:py-14 lg:px-12">
        <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">The lineup</p><h2 className="mt-2 font-display text-2xl font-semibold text-aurora-text sm:text-3xl">Explore electric cars</h2></div><Link to="/catalog" className="shrink-0 text-sm font-semibold text-aurora-text transition hover:text-emerald-700">View all <ArrowRight className="ml-1 inline h-4 w-4" /></Link></div>
        {vehiclesWithPhotos.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{vehiclesWithPhotos.slice(0, 3).map((ev, index) => <HomeVehicleCard key={ev._id} ev={ev} index={index} />)}</div> : <Link to="/catalog" className="block rounded-xl border border-aurora-border bg-[#f6f8f7] p-6 text-sm text-aurora-muted transition hover:border-emerald-300">Browse available EVs <ArrowRight className="ml-1 inline h-4 w-4" /></Link>}
      </section>

      <section className="bg-[#f3f8f2]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:px-12">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Choose with confidence</p><h2 className="mt-2 max-w-md font-display text-2xl font-semibold text-aurora-text sm:text-3xl">Compare the details that matter.</h2><p className="mt-3 max-w-md text-sm leading-6 text-slate-600">Put range, price, battery and charging side by side to find an EV that fits your everyday drive.</p><Link to="/compare" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 transition hover:gap-3">Compare EVs <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="grid grid-cols-3 divide-x divide-emerald-900/10 rounded-xl border border-emerald-900/10 bg-white/70 py-5"><div className="px-3 text-center sm:px-5"><span className="text-lg font-semibold text-emerald-800">Up to 4</span><p className="mt-1 text-xs leading-5 text-slate-600">EVs compared together</p></div><div className="px-3 text-center sm:px-5"><span className="text-lg font-semibold text-emerald-800">{stats?.evs ?? '—'}</span><p className="mt-1 text-xs leading-5 text-slate-600">EVs to explore</p></div><div className="px-3 text-center sm:px-5"><span className="text-lg font-semibold text-emerald-800">{stats?.brands ?? '—'}</span><p className="mt-1 text-xs leading-5 text-slate-600">brands to explore</p></div></div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-11 sm:px-8 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-12">
        <div className="overflow-hidden rounded-2xl bg-slate-950 shadow-sm">
          <div className="relative aspect-video"><iframe key={videos[videoIndex].id} className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${videos[videoIndex].id}`} title={videos[videoIndex].title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /><div className="absolute bottom-3 right-3 flex gap-2"><button onClick={() => setVideoIndex((videoIndex + videos.length - 1) % videos.length)} aria-label="Previous video" className="rounded-full bg-white/95 p-2 text-slate-800 shadow"><ChevronLeft /></button><button onClick={() => setVideoIndex((videoIndex + 1) % videos.length)} aria-label="Next video" className="rounded-full bg-white/95 p-2 text-slate-800 shadow"><ChevronRight /></button></div></div>
        </div>
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">EV learning · {videos[videoIndex].source}</p><h2 className="mt-2 font-display text-2xl font-semibold text-aurora-text sm:text-3xl">{videos[videoIndex].title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">Short, practical EV explainers. Explore more models or compare charging details in EVora.</p><div className="mt-5 flex flex-wrap gap-3"><Link to="/catalog" className="rounded-lg bg-aurora-text px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">Explore EVs</Link><Link to="/compare" className="rounded-lg border border-aurora-border px-4 py-2.5 text-sm font-semibold text-aurora-text transition hover:border-emerald-500">Compare cars</Link></div></div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-11 sm:px-8 sm:py-14 lg:px-12">
        <div className="mb-6 text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Owner reviews</p><h2 className="mt-2 font-display text-2xl font-semibold text-aurora-text sm:text-3xl">EV owner perspectives.</h2></div>
        {reviews.length ? <><div className="grid gap-4 md:grid-cols-3">{reviews.slice(reviewPage * 3, reviewPage * 3 + 3).map((review, index) => <article key={review._id} className={`home-enter home-enter-delay-${index + 1} rounded-xl border border-aurora-border bg-white p-5 transition duration-300 hover:-translate-y-1 hover:shadow-md`}><div aria-label={`${review.rating} out of 5 stars`} className="text-sm tracking-widest text-amber-500">{'★'.repeat(Math.max(0, Math.min(5, Math.round(review.rating || 0))))}<span className="text-slate-200">{'★'.repeat(5 - Math.max(0, Math.min(5, Math.round(review.rating || 0))))}</span></div><p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">“{review.body}”</p><div className="mt-5 border-t border-aurora-border pt-3"><p className="text-sm font-semibold text-aurora-text">{review.author || 'EV owner'}</p><p className="mt-1 text-xs text-slate-500">{review.ev?.name || 'EV owner review'}{review.city ? ` · ${review.city}` : ''}</p></div></article>)}</div>{reviews.length > 3 && <div className="mt-5 flex justify-center gap-3"><button aria-label="Previous reviews" onClick={() => setReviewPage((reviewPage + reviewPages - 1) % reviewPages)} className="rounded-full border border-aurora-border bg-white p-2 text-slate-600 hover:text-emerald-700"><ChevronLeft /></button><span className="self-center text-xs text-slate-500">{reviewPage + 1} / {reviewPages}</span><button aria-label="Next reviews" onClick={() => setReviewPage((reviewPage + 1) % reviewPages)} className="rounded-full border border-aurora-border bg-white p-2 text-slate-600 hover:text-emerald-700"><ChevronRight /></button></div>}</> : <div className="mx-auto max-w-lg rounded-xl border border-dashed border-aurora-border px-5 py-6 text-center text-sm text-slate-500">Approved owner reviews will appear here.</div>}
      </section>
    </main>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  Zap,
  Battery,
  Gauge,
  Clock,
  Star,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  ArrowLeft,
  Sliders,
  Sparkles,
  Database,
  ExternalLink,
  CarFront,
} from 'lucide-react';
import WishlistButton from '../components/WishlistButton';
import ReviewPanel from '../components/ReviewPanel';
import EMICalculator from '../components/EMICalculator';
import { getVehicleImage } from '../services/vehicleImage';


export default function EVDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [ev, setEv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [activeTab, setActiveTab] = useState('specs');

  useEffect(() => {
    async function fetchEV() {
      setLoading(true);
      try {
        const res = await api.get(`/evs/${id}`);
        if (res.data.success) {
          setEv(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load EV details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEV();
  }, [id]);

  useEffect(() => setActiveImage(0), [id]);
  useEffect(() => setImageFailed(false), [activeImage, id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <div className="h-8 w-48 bg-aurora-raised animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-[16/10] bg-aurora-raised animate-pulse rounded-2xl" />
          <div className="space-y-4">
            <div className="h-10 bg-aurora-raised animate-pulse rounded-xl" />
            <div className="h-6 w-32 bg-aurora-raised animate-pulse rounded-lg" />
            <div className="h-32 bg-aurora-raised animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!ev) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-aurora-text">Vehicle Not Found</h2>
        <p className="text-sm text-slate-400">The electric car you are looking for does not exist or has been removed.</p>
        <Link to="/catalog" className="inline-flex items-center gap-2 px-5 py-2.5 bg-aurora-violet text-white font-bold rounded-xl text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const brand = ev.brandId || {};
  // Resolve every gallery URL through the same local-image manifest as catalog
  // cards. Raw database URLs may use an outdated extension (for example .jpg
  // while the bundled file is .avif), which made detail pages show a broken image.
  const galleryImages = (ev.images || [])
    .map((image) => ({ ...image, url: getVehicleImage({ ...ev, imageUrl: image.url }) }))
    .filter((image) => image.url);
  const primaryImage = getVehicleImage(ev);
  const images = [...galleryImages];
  if (primaryImage && !images.some((image) => image.url === primaryImage)) {
    images.push({ url: primaryImage, caption: ev.name });
  }

  const formatPrice = (val) => {
    if (!val) return 'Price on Request';
    return `₹${(val / 100000).toFixed(2)} Lakh`;
  };

  const rotateImage = (direction) => {
    setActiveImage((current) => (current + direction + images.length) % images.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-emerald-400 transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <Link to="/catalog" className="hover:text-emerald-400 transition">Catalog</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-slate-200 font-medium truncate">{ev.name}</span>
      </div>

      {/* Hero Showcase: Gallery & Primary Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery (7 Cols) */}
        <div className="min-w-0 space-y-4 lg:col-span-7">
          <div
            className="relative aspect-[16/10] overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
          >
            {images[activeImage]?.url && !imageFailed ? <img src={images[activeImage].url} alt={`${brand.name || ''} ${ev.name}`} draggable="false" className="h-full w-full select-none object-cover" onError={() => { if (activeImage < images.length - 1) setActiveImage((current) => current + 1); else setImageFailed(true); }} /> : <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-aurora-raised to-white text-aurora-muted"><CarFront className="h-14 w-14 text-aurora-violet/60" /><span className="text-sm font-medium">Vehicle photo not provided</span></div>}
          </div>
          <EMICalculator price={ev.price?.exShowroom} />

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    activeImage === idx ? 'border-emerald-500 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" onError={(event) => { event.currentTarget.closest('button')?.classList.add('hidden'); }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Key Overview & Pricing (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {brand.name}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">{ev.bodyType || 'SUV'}</span>
            </div>
              <WishlistButton evId={ev._id} showLabel />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-aurora-text tracking-tight">
              {ev.name}
            </h1>
            <p className="text-sm text-slate-400 mt-1">{ev.variant}</p>
          </div>

          {/* Rating Summary */}
          {ev.ratingAggregates?.averageRating > 0 ? (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-lg">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{ev.ratingAggregates.averageRating}</span>
              </div>
              <div className="text-xs text-slate-400 border-l border-slate-800 pl-3">
                <p className="font-semibold text-slate-200">
                  {ev.ratingAggregates.totalReviews} Verified Owner Reviews
                </p>
                <p className="text-[11px] text-emerald-400">
                  Range satisfaction: {ev.ratingAggregates.categoryAverages?.range || '4.5'}/5
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Awaiting first verified owner community reviews</span>
            </div>
          )}

          {/* Price Box */}
          <div className="p-5 rounded-2xl bg-white border border-aurora-border space-y-2">
            <span className="text-xs text-slate-400 font-medium">Ex-Showroom Price (India)</span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-aurora-text">
                {formatPrice(ev.price?.exShowroom)}
              </span>
              {ev.price?.onRoadEstimate && (
                <span className="text-xs text-slate-400">
                  ~{formatPrice(ev.price.onRoadEstimate)} On-Road Est.
                </span>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-aurora-border bg-aurora-base px-4 py-3 text-xs text-aurora-muted">
            <div className="flex items-start gap-2"><Database className="mt-0.5 h-4 w-4 shrink-0 text-aurora-violet" /><div><p className="font-semibold text-aurora-text">EVora data details</p><p className="mt-1">{ev.priceVerifiedAt ? `Price checked ${new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(new Date(ev.priceVerifiedAt))}.` : 'Price verification date not provided.'} {ev.specsVerifiedAt ? `Specs checked ${new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(new Date(ev.specsVerifiedAt))}.` : 'Specification verification date not provided.'}</p><p className="mt-1">Prices are ex-showroom estimates; confirm the on-road price and variant with a local dealer.{ev.isSampleData ? ' This listing uses demo dataset data.' : ''}</p>{ev.dataSourceUrl && <a href={ev.dataSourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 font-semibold text-aurora-violet hover:underline">View data source <ExternalLink className="h-3 w-3" /></a>}</div></div>
          </div>

          {/* Key Quick Highlight Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Claimed Range</span>
                <span className="font-bold text-aurora-text text-sm">
                  {ev.range?.claimedNedc ? `${ev.range.claimedNedc} km` : '—'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                <Battery className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Battery Pack</span>
                <span className="font-bold text-aurora-text text-sm">
                  {ev.battery?.capacityKwh ? `${ev.battery.capacityKwh} kWh` : '—'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Acceleration</span>
                <span className="font-bold text-aurora-text text-sm">
                  {ev.performance?.acceleration0to100 != null ? `${ev.performance.acceleration0to100}s (0-100)` : 'Not listed'}
                </span>
              </div>
            </div>

            {(ev.charging?.dcFastChargingTimeMinutes != null || ev.charging?.maxDcRateKw != null) && <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">{ev.charging?.dcFastChargingTimeMinutes != null ? 'Fast DC Charging' : 'Maximum DC Rate'}</span>
                <span className="font-bold text-aurora-text text-sm">
                  {ev.charging?.dcFastChargingTimeMinutes != null ? `${ev.charging.dcFastChargingTimeMinutes} mins (10–80%)` : ev.charging?.maxDcRateKw != null ? `${ev.charging.maxDcRateKw} kW` : 'Not listed'}
                </span>
              </div>
            </div>}
          </div>
        </div>
      </div>

      {/* Technical specifications and ownership information */}
      <div id="vehicle-tabs" className="scroll-mt-20 space-y-6 border-t border-slate-200 pt-6">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'specs'
                ? 'bg-aurora-violet text-white shadow-md'
                : 'text-slate-500 hover:text-aurora-text bg-white border border-aurora-border'
            }`}
          >
            Technical Specifications
          </button>

          <button
            onClick={() => setActiveTab('proscons')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'proscons'
                ? 'bg-aurora-violet text-white shadow-md'
                : 'text-slate-500 hover:text-aurora-text bg-white border border-aurora-border'
            }`}
          >
            Pros & Cons
          </button>

        </div>

        {/* Tab 1: Technical Specifications Tables */}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {/* Battery & Charging */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-aurora-text flex items-center gap-2">
                <Battery className="w-4 h-4 text-emerald-400" />
                <span>Battery & Charging System</span>
              </h3>
              <div className="divide-y divide-slate-800 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Battery Capacity</span>
                  <span className="font-semibold text-slate-200">{ev.battery?.capacityKwh != null ? `${ev.battery.capacityKwh} kWh` : 'Not listed'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Battery Chemistry</span>
                  <span className="font-semibold text-slate-200">{ev.battery?.chemistry || 'Not listed'}</span>
                </div>
                {(ev.battery?.warrantyText || ev.battery?.warrantyYears != null || ev.battery?.warrantyKm != null) && <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Battery Warranty</span>
                  <span className="font-semibold text-slate-200">
                    {ev.battery?.warrantyText || (ev.battery?.warrantyYears != null ? `${ev.battery.warrantyYears} years${ev.battery.warrantyKm != null ? ` / ${ev.battery.warrantyKm.toLocaleString()} km` : ''}` : ev.battery?.warrantyKm != null ? `${ev.battery.warrantyKm.toLocaleString()} km` : 'Not listed')}
                  </span>
                </div>}
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">AC Home Charging (0-100%)</span>
                  <span className="font-semibold text-slate-200">{ev.charging?.acChargingTimeHours != null ? `About ${ev.charging.acChargingTimeHours} hours` : 'Not listed'}</span>
                </div>
                {ev.charging?.dcFastChargingTimeMinutes != null && <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">DC Fast Charge (10-80%)</span>
                  <span className="font-semibold text-slate-200">{ev.charging.dcFastChargingTimeMinutes} minutes (10–80%)</span>
                </div>}
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Maximum DC Rate</span>
                  <span className="font-semibold text-slate-200">{ev.charging?.maxDcRateKw != null ? `${ev.charging.maxDcRateKw} kW` : 'Not listed'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Charging Port</span>
                  <span className="font-semibold text-slate-200">{ev.charging?.portType || 'Not listed'}</span>
                </div>
              </div>
            </div>

            {/* Performance & Motor */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-aurora-text flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>Performance & Powertrain</span>
              </h3>
              <div className="divide-y divide-slate-800 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Electric Motor Power</span>
                  <span className="font-semibold text-slate-200">{ev.performance?.powerBhp != null ? `${ev.performance.powerBhp} bhp` : 'Not listed'}</span>
                </div>
                {ev.performance?.torqueNm != null && <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Peak Torque</span>
                  <span className="font-semibold text-slate-200">{ev.performance.torqueNm} Nm</span>
                </div>}
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">0 - 100 km/h</span>
                  <span className="font-semibold text-slate-200">{ev.performance?.acceleration0to100 != null ? `${ev.performance.acceleration0to100} seconds` : 'Not listed'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Top Speed</span>
                  <span className="font-semibold text-slate-200">{ev.performance?.topSpeedKmph != null ? `${ev.performance.topSpeedKmph} km/h` : 'Not listed'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Seating Capacity</span>
                  <span className="font-semibold text-slate-200">{ev.dimensions?.seatingCapacity != null ? `${ev.dimensions.seatingCapacity} Passengers` : 'Not listed'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Boot Space</span>
                  <span className="font-semibold text-slate-200">{ev.dimensions?.bootSpaceLitres != null ? `${ev.dimensions.bootSpaceLitres} litres` : 'Not listed'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Pros & Cons */}
        {activeTab === 'proscons' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-3">
              <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>What We & Owners Love</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {ev.pros?.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-3">
              <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span>Things to Consider</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {ev.cons?.map((c, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

      </div>
      <ReviewPanel evId={ev._id} evName={`${brand.name || ''} ${ev.name}`} />
    </div>
  );
}

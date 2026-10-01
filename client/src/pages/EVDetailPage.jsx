import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
  Zap,
  Battery,
  Gauge,
  Clock,
  Rotate3d,
  Star,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ChevronRight,
  Share2,
  Heart,
  ArrowLeft,
  Sliders,
  Sparkles,
} from 'lucide-react';

export default function EVDetailPage() {
  const { id } = useParams();
  const [ev, setEv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <div className="h-8 w-48 bg-slate-900 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-[16/10] bg-slate-900 animate-pulse rounded-2xl" />
          <div className="space-y-4">
            <div className="h-10 bg-slate-900 animate-pulse rounded-xl" />
            <div className="h-6 w-32 bg-slate-900 animate-pulse rounded-lg" />
            <div className="h-32 bg-slate-900 animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!ev) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Vehicle Not Found</h2>
        <p className="text-sm text-slate-400">The electric car you are looking for does not exist or has been removed.</p>
        <Link to="/catalog" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const brand = ev.brandId || {};
  const isFlagship = ev.has360Model;
  const images = ev.images?.length > 0 ? ev.images : [{ url: ev.imageUrl, caption: ev.name }];

  const formatPrice = (val) => {
    if (!val) return 'Price on Request';
    return `₹${(val / 100000).toFixed(2)} Lakh`;
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
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
            <img
              src={images[activeImage]?.url || ev.imageUrl}
              alt={ev.name}
              className="w-full h-full object-cover"
            />
            {/* 360 Overlay CTA if Flagship */}
            {isFlagship && (
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 text-cyan-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Rotate3d className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Flagship 360° Interactive Model</p>
                    <p className="text-[11px] text-cyan-300/80">
                      Explore {ev.hotspots360?.length || 4} clickable engineering hotspots
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('360')}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition"
                >
                  Launch 360°
                </button>
              </div>
            )}
          </div>

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
                  <img src={img.url} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Key Overview & Pricing (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {brand.name}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">{ev.bodyType || 'SUV'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
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
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 font-medium">Ex-Showroom Price (India)</span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-white">
                {formatPrice(ev.price?.exShowroom)}
              </span>
              {ev.price?.onRoadEstimate && (
                <span className="text-xs text-slate-400">
                  ~{formatPrice(ev.price.onRoadEstimate)} On-Road Est.
                </span>
              )}
            </div>
          </div>

          {/* Key Quick Highlight Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Claimed Range</span>
                <span className="font-bold text-white text-sm">
                  {ev.range?.claimedNedc ? `${ev.range.claimedNedc} km` : '—'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                <Battery className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Battery Pack</span>
                <span className="font-bold text-white text-sm">
                  {ev.battery?.capacityKwh ? `${ev.battery.capacityKwh} kWh` : '—'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Acceleration</span>
                <span className="font-bold text-white text-sm">
                  {ev.performance?.acceleration0to100 ? `${ev.performance.acceleration0to100}s (0-100)` : '—'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Fast DC Charging</span>
                <span className="font-bold text-white text-sm">
                  {ev.charging?.dcFastChargingTimeMinutes ? `${ev.charging.dcFastChargingTimeMinutes} mins` : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Specifications, Pros & Cons, 360 Feature Hotspots */}
      <div className="space-y-6 pt-6 border-t border-slate-800">
        <div className="flex gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'specs'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            Technical Specifications
          </button>

          <button
            onClick={() => setActiveTab('proscons')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'proscons'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            Pros & Cons
          </button>

          {isFlagship && (
            <button
              onClick={() => setActiveTab('360')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === '360'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-cyan-400 hover:bg-cyan-950/40 bg-slate-900 border border-cyan-800/40'
              }`}
            >
              <Rotate3d className="w-3.5 h-3.5" />
              <span>360° Interactive Hotspots</span>
            </button>
          )}
        </div>

        {/* Tab 1: Technical Specifications Tables */}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {/* Battery & Charging */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Battery className="w-4 h-4 text-emerald-400" />
                <span>Battery & Charging System</span>
              </h3>
              <div className="divide-y divide-slate-800 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Battery Capacity</span>
                  <span className="font-semibold text-slate-200">{ev.battery?.capacityKwh ? `${ev.battery.capacityKwh} kWh` : 'null'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Battery Chemistry</span>
                  <span className="font-semibold text-slate-200">{ev.battery?.chemistry || 'LFP'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Battery Warranty</span>
                  <span className="font-semibold text-slate-200">
                    {ev.battery?.warrantyYears ? `${ev.battery.warrantyYears} Years / ${ev.battery.warrantyKm?.toLocaleString()} km` : 'null'}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">AC Home Charging (0-100%)</span>
                  <span className="font-semibold text-slate-200">{ev.charging?.acChargingTimeHours ? `${ev.charging.acChargingTimeHours} Hours (7.2kW)` : 'null'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">DC Fast Charge (10-80%)</span>
                  <span className="font-semibold text-slate-200">{ev.charging?.dcFastChargingTimeMinutes ? `${ev.charging.dcFastChargingTimeMinutes} Minutes` : 'null'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Charging Port</span>
                  <span className="font-semibold text-slate-200">{ev.charging?.portType || 'CCS2'}</span>
                </div>
              </div>
            </div>

            {/* Performance & Motor */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>Performance & Powertrain</span>
              </h3>
              <div className="divide-y divide-slate-800 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Electric Motor Power</span>
                  <span className="font-semibold text-slate-200">{ev.performance?.powerBhp ? `${ev.performance.powerBhp} bhp` : 'null'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Peak Torque</span>
                  <span className="font-semibold text-slate-200">{ev.performance?.torqueNm ? `${ev.performance.torqueNm} Nm` : 'null'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">0 - 100 km/h</span>
                  <span className="font-semibold text-slate-200">{ev.performance?.acceleration0to100 ? `${ev.performance.acceleration0to100} seconds` : 'null'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Top Speed</span>
                  <span className="font-semibold text-slate-200">{ev.performance?.topSpeedKmph ? `${ev.performance.topSpeedKmph} km/h` : 'null'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Seating Capacity</span>
                  <span className="font-semibold text-slate-200">{ev.dimensions?.seatingCapacity || 5} Passengers</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Boot Space</span>
                  <span className="font-semibold text-slate-200">{ev.dimensions?.bootSpaceLitres ? `${ev.dimensions.bootSpaceLitres} Litres` : 'null'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Pros & Cons */}
        {activeTab === 'proscons' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-6 space-y-3">
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

            <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-6 space-y-3">
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

        {/* Tab 3: Flagship 360 Hotspots */}
        {activeTab === '360' && isFlagship && (
          <div className="bg-slate-900 border border-cyan-800/40 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Rotate3d className="w-5 h-5 text-cyan-400" />
                  <span>360° Feature Hotspots</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any hotspot below to inspect the embedded architectural component details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ev.hotspots360?.map((hs) => (
                <div key={hs.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                    {hs.category}
                  </span>
                  <h4 className="text-sm font-bold text-white">{hs.title}</h4>
                  <p className="text-xs text-slate-400">{hs.description}</p>
                  {hs.specHighlight && (
                    <p className="text-[11px] font-semibold text-emerald-400 pt-1 border-t border-slate-900">
                      ⚡ {hs.specHighlight}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Battery,
  Gauge,
  Clock,
  Star,
  Eye,
  Rotate3d,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export default function EVCard({ ev }) {
  // Format price in Lakhs
  const formatPrice = (val) => {
    if (!val) return 'Price on Request';
    const lakhs = val / 100000;
    return `₹${lakhs.toFixed(2)} Lakh`;
  };

  const brand = ev.brandId || {};
  const isFlagship = ev.has360Model;

  return (
    <div className="group relative bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Flagship 360 Badge */}
      {isFlagship && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-semibold backdrop-blur-md shadow-lg">
          <Rotate3d className="w-3.5 h-3.5 animate-spin-slow" />
          <span>360° Visualizer</span>
        </div>
      )}

      {/* Body type pill */}
      {ev.bodyType && (
        <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-slate-300 text-[11px] font-medium backdrop-blur-md">
          {ev.bodyType}
        </div>
      )}

      {/* Vehicle Image Container */}
      <Link to={`/evs/${ev._id}`} className="block relative aspect-[16/10] overflow-hidden bg-slate-950">
        <img
          src={ev.imageUrl || ev.images?.[0]?.url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'}
          alt={ev.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
      </Link>

      {/* Content Container */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand header */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-medium text-emerald-400 tracking-wide uppercase">
              {brand.name || 'Electric Vehicle'}
            </span>
            {ev.ratingAggregates?.averageRating > 0 && (
              <div className="flex items-center gap-1 text-xs text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="font-bold">{ev.ratingAggregates.averageRating}</span>
                <span className="text-slate-400 text-[10px]">({ev.ratingAggregates.totalReviews})</span>
              </div>
            )}
          </div>

          {/* Model Name & Variant */}
          <Link to={`/evs/${ev._id}`} className="block group-hover:text-emerald-400 transition">
            <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1">
              {ev.name}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
              {ev.variant || 'Standard Edition'}
            </p>
          </Link>

          {/* Price display */}
          <div className="mt-3.5 pb-3 border-b border-slate-800 flex items-baseline justify-between">
            <div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                {formatPrice(ev.price?.exShowroom)}
              </span>
              <span className="text-[11px] text-slate-400 ml-1.5 font-normal">Ex-Showroom</span>
            </div>
            {ev.range?.realWorldEstimateCity && (
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                ~{ev.range.realWorldEstimateCity} km real city
              </span>
            )}
          </div>

          {/* Core Specs Grid */}
          <div className="grid grid-cols-2 gap-2.5 py-3 text-xs text-slate-300">
            <div className="flex items-center gap-2 bg-slate-950/50 p-2 rounded-xl border border-slate-800/60">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">Claimed Range</span>
                <span className="font-semibold text-slate-200">
                  {ev.range?.claimedNedc ? `${ev.range.claimedNedc} km` : '—'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/50 p-2 rounded-xl border border-slate-800/60">
              <Battery className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">Battery Pack</span>
                <span className="font-semibold text-slate-200">
                  {ev.battery?.capacityKwh ? `${ev.battery.capacityKwh} kWh` : '—'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/50 p-2 rounded-xl border border-slate-800/60">
              <Gauge className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">0-100 km/h</span>
                <span className="font-semibold text-slate-200">
                  {ev.performance?.acceleration0to100 ? `${ev.performance.acceleration0to100}s` : '—'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/50 p-2 rounded-xl border border-slate-800/60">
              <Clock className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">Fast Charge</span>
                <span className="font-semibold text-slate-200">
                  {ev.charging?.dcFastChargingTimeMinutes ? `${ev.charging.dcFastChargingTimeMinutes}m (10-80%)` : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-2 mt-2 border-t border-slate-800 flex items-center gap-2">
          <Link
            to={`/evs/${ev._id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-white text-xs font-semibold transition-all duration-200"
          >
            <span>Explore Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          {isFlagship && (
            <Link
              to={`/evs/${ev._id}?tab=360`}
              title="Open 360° Visualizer"
              className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition"
            >
              <Rotate3d className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

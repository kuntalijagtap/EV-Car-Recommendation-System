import React, { useState } from 'react';
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
  Scale,
  ShieldCheck,
  CarFront,
} from 'lucide-react';
import WishlistButton from './WishlistButton';
import { getVehicleImage } from '../services/vehicleImage';

export default function EVCard({ ev, onToggleCompare, isCompared = false, compareDisabled = false }) {
  const [imageFailed, setImageFailed] = useState(false);
  // Format price in Lakhs
  const formatPrice = (val) => {
    if (!val) return 'Price on Request';
    const lakhs = val / 100000;
    return `₹${lakhs.toFixed(2)} Lakh`;
  };

  const brand = ev.brandId || {};
  const imageUrl = getVehicleImage(ev);
  const isFlagship = (ev.view360Frames?.length || 0) > 1;

  return (
    <div className="aurora-glass group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-violet">
      {/* Flagship 360 Badge */}
      {isFlagship && (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-aurora-violet/35 bg-white px-2.5 py-1 text-xs font-semibold text-aurora-blue shadow-sm">
          <Rotate3d className="w-3.5 h-3.5 animate-spin-slow" />
          <span>360° Visualizer</span>
        </div>
      )}

      {/* Body type pill */}
      {ev.bodyType && (
        <div className="absolute right-3 top-3 z-10 rounded-full border border-aurora-border bg-white px-2.5 py-1 text-[11px] font-medium text-slate-300 shadow-sm">
          {ev.bodyType}
        </div>
      )}

      {/* Vehicle Image Container */}
      <Link to={`/evs/${ev._id}`} className="relative block aspect-[16/10] overflow-hidden bg-aurora-base">
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={`${brand.name || ''} ${ev.name}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-aurora-raised to-white text-aurora-muted">
            <CarFront className="h-10 w-10 text-aurora-violet/60" />
            <span className="text-xs font-medium">Vehicle photo unavailable</span>
          </div>
        )}
      </Link>

      {/* Content Container */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand header */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-aurora-lime">
              {brand.name || 'Electric Vehicle'}
            </span>
            {ev.ratingAggregates?.averageRating > 0 && (
              <div className="flex items-center gap-1 text-xs text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="font-bold">{ev.ratingAggregates.averageRating}</span>
                <span className="text-slate-400 text-[11px]">({ev.ratingAggregates.totalReviews})</span>
              </div>
            )}
          </div>

          {/* Model Name & Variant */}
          <Link to={`/evs/${ev._id}`} className="block group-hover:text-emerald-400 transition">
            <h3 className="text-lg font-bold text-aurora-text tracking-tight line-clamp-1">
              {ev.name}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
              {ev.variant || 'Standard Edition'}
            </p>
          </Link>

          {/* Price display */}
            <div className="mt-3.5 flex items-baseline justify-between border-b border-aurora-border pb-3">
            <div>
              <span className="text-xl font-extrabold text-aurora-text tracking-tight">
                {formatPrice(ev.price?.exShowroom)}
              </span>
              <span className="text-[11px] text-slate-400 ml-1.5 font-normal">Ex-Showroom</span>
            </div>
            {ev.range?.realWorldEstimateCity && (
              <span className="rounded border border-aurora-blue/20 bg-aurora-blue/10 px-2 py-0.5 font-mono text-[11px] text-aurora-blue">
                ~{ev.range.realWorldEstimateCity} km real city
              </span>
            )}
          </div>

          {/* Core Specs Grid */}
          <div className="grid grid-cols-2 gap-2.5 py-3 text-xs text-slate-300">
            <div className="flex items-center gap-2 rounded-xl border border-aurora-border bg-aurora-base/55 p-2">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-400 block">Claimed Range</span>
                <span className="font-semibold text-slate-200">
                  {ev.range?.claimedNedc ? `${ev.range.claimedNedc} km` : '—'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-aurora-border bg-aurora-base/55 p-2">
              <Battery className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-400 block">Battery Pack</span>
                <span className="font-semibold text-slate-200">
                  {ev.battery?.capacityKwh ? `${ev.battery.capacityKwh} kWh` : '—'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-aurora-border bg-aurora-base/55 p-2">
              <Gauge className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-400 block">0-100 km/h</span>
                <span className="font-semibold text-slate-200">
                  {ev.performance?.acceleration0to100 ? `${ev.performance.acceleration0to100}s` : '—'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-aurora-border bg-aurora-base/55 p-2">
              <Clock className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-400 block">Fast Charge</span>
                <span className="font-semibold text-slate-200">
                  {ev.charging?.dcFastChargingTimeMinutes ? `${ev.charging.dcFastChargingTimeMinutes}m (10-80%)` : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="mt-2 flex items-center gap-2 border-t border-aurora-border pt-2">
          <Link
            to={`/evs/${ev._id}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-aurora-raised px-3 py-2.5 text-xs font-semibold text-aurora-text transition-all duration-200 hover:bg-aurora-violet"
          >
            <span>Explore Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <WishlistButton evId={ev._id} />
          {onToggleCompare && (
            <button
              type="button"
              onClick={() => onToggleCompare(ev._id)}
              disabled={compareDisabled}
              aria-label={isCompared ? 'Remove from comparison' : 'Add to comparison'}
              title={isCompared ? 'Remove from comparison' : 'Add to comparison'}
              className={`h-10 w-10 shrink-0 rounded-xl border flex items-center justify-center transition disabled:opacity-40 ${
                isCompared
                  ? 'border-aurora-blue/40 bg-aurora-blue/5 text-aurora-blue'
                  : 'border-aurora-border bg-white text-slate-500 hover:border-aurora-blue/40 hover:text-aurora-blue'
              }`}
            >
              <Scale className="w-4 h-4" />
            </button>
          )}
          {isFlagship && (
            <Link
              to={`/evs/${ev._id}?tab=360`}
              title="Open 360° Visualizer"
              className="p-2.5 rounded-xl border border-aurora-border bg-aurora-raised text-aurora-blue transition hover:bg-aurora-violet hover:text-white"
            >
              <Rotate3d className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

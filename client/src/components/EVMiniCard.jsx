import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Battery, Gauge, Star, Users, ChevronRight, Scale, CarFront } from 'lucide-react';
import { getVehicleImage } from '../services/vehicleImage';
import { displayBrandName, displayModelAndVariant } from '../utils/vehicleName';

const scoreColor = (s) => (s >= 80 ? 'bg-emerald-100 text-emerald-700' : s >= 55 ? 'bg-sky-100 text-sky-700' : s >= 35 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700');

export default function EVMiniCard({ ev, onCompare, isCompared = false, compareDisabled = false }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = getVehicleImage(ev);
  const brandName = displayBrandName(ev.brand);
  const modelName = displayModelAndVariant(ev.name, ev.brand, ev.variant);
  return (
    <article className="aurora-glass overflow-hidden rounded-2xl">
      <Link to={`/evs/${ev._id}`} aria-label={`View ${ev.brand || ''} ${ev.name} details`} className="group/image relative block aspect-[16/9] overflow-hidden bg-gradient-to-br from-aurora-raised to-white">
        {imageUrl && !imageFailed ? <img src={imageUrl} alt={`${ev.brand || ''} ${ev.name}`} className="h-full w-full object-cover transition duration-500 group-hover/image:scale-[1.03]" loading="lazy" onError={() => setImageFailed(true)} /> : <div className="flex h-full flex-col items-center justify-center gap-2 text-aurora-muted"><CarFront className="h-8 w-8 text-aurora-violet/60" /><span className="text-xs font-medium">Vehicle photo unavailable</span></div>}
      </Link>
      <div className="space-y-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div><p className="text-xs text-aurora-muted">{brandName}</p><p className="font-display font-semibold leading-tight text-aurora-text">{modelName}</p></div>
          {ev.comfort && <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${scoreColor(ev.comfort.score)}`} title={ev.comfort.reason}>{ev.comfort.score}/100</span>}
        </div>
        <p className="text-sm font-bold text-aurora-violet">{ev.priceExShowroom ? `₹${(ev.priceExShowroom / 100000).toFixed(1)} lakh` : 'Price n/a'}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-aurora-muted">
          {ev.realWorldRangeKm != null && <span className="inline-flex items-center gap-1"><Gauge className="h-3.5 w-3.5" />{ev.realWorldRangeKm} km estimated real-world</span>}
          {ev.batteryKwh && <span className="inline-flex items-center gap-1"><Battery className="h-3.5 w-3.5" />{ev.batteryKwh} kWh</span>}
          {ev.claimedRangeKm && <span className="inline-flex items-center gap-1">{ev.claimedRangeKm} km claimed</span>}
          {ev.seats && <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{ev.seats} seats</span>}
          {ev.rating > 0 && <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />{ev.rating}</span>}
        </div>
        {ev.comfort && <p className="text-[11px] text-aurora-muted">Range comfort: <b>{ev.comfort.label}</b></p>}
      </div>
      <div className="px-3.5 pb-3.5">
        <div className="flex gap-2">
          <Link to={`/evs/${ev._id}`} className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-aurora-raised px-3 py-2 text-xs font-semibold text-aurora-text hover:bg-aurora-violet hover:text-white">View details <ChevronRight className="h-3.5 w-3.5" /></Link>
          {onCompare && <button type="button" onClick={() => onCompare(ev._id)} disabled={compareDisabled} aria-pressed={isCompared} className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-semibold disabled:opacity-40 ${isCompared ? 'border-aurora-violet bg-aurora-violet/10 text-aurora-violet' : 'border-aurora-border text-aurora-muted hover:border-aurora-violet hover:text-aurora-violet'}`}><Scale className="h-3.5 w-3.5" />{isCompared ? 'Selected' : 'Compare'}</button>}
        </div>
      </div>
    </article>
  );
}

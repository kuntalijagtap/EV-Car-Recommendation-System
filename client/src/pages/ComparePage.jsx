import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BatteryCharging, CarFront, Check, ChevronDown, Plus, Scale, Search, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { getVehicleImage } from '../services/vehicleImage';
import { displayBrandName, displayModelAndVariant } from '../utils/vehicleName';

const number = (value, unit) => value == null ? '—' : `${Number(value).toLocaleString('en-IN')} ${unit}`;
const lakhPrice = (value) => value == null ? '—' : `₹${(value / 100000).toFixed(2)} lakh`;
const rows = [
  { label: 'Variant', get: (ev) => ev.variant || 'Standard variant', format: (v) => v, better: null },
  { label: 'Ex-showroom price', get: (ev) => ev.price?.exShowroom, format: lakhPrice, better: 'lower' },
  { label: 'Claimed range', get: (ev) => ev.range?.claimedWltp || ev.range?.claimedNedc, format: (v) => number(v, 'km'), better: 'higher' },
  { label: 'City range estimate', get: (ev) => ev.range?.realWorldEstimateCity, format: (v) => number(v, 'km'), better: 'higher' },
  { label: 'Battery capacity', get: (ev) => ev.battery?.capacityKwh, format: (v) => number(v, 'kWh'), better: 'higher' },
  { label: 'Motor power', get: (ev) => ev.performance?.powerBhp, format: (v) => number(v, 'bhp'), better: 'higher' },
  { label: 'Peak torque', get: (ev) => ev.performance?.torqueNm, format: (v) => number(v, 'Nm'), better: 'higher' },
  { label: '0–100 km/h', get: (ev) => ev.performance?.acceleration0to100, format: (v) => number(v, 's'), better: 'lower' },
  { label: 'DC fast charging', get: (ev) => ev.charging?.dcFastChargingTimeMinutes, format: (v) => number(v, 'min'), better: 'lower' },
  { label: 'AC charging', get: (ev) => ev.charging?.acChargingTimeHours, format: (v) => number(v, 'hours'), better: 'lower' },
  { label: 'Seating capacity', get: (ev) => ev.dimensions?.seatingCapacity, format: (v) => number(v, 'seats'), better: 'higher' },
  { label: 'Boot space', get: (ev) => ev.dimensions?.bootSpaceLitres, format: (v) => number(v, 'L'), better: 'higher' },
  { label: 'Top speed', get: (ev) => ev.performance?.topSpeedKmph, format: (v) => number(v, 'km/h'), better: 'higher' },
  { label: 'Owner rating', get: (ev) => ev.ratingAggregates?.averageRating || null, format: (v) => number(v, '/ 5'), better: 'higher' },
];

export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [catalog, setCatalog] = useState([]);
  const [evs, setEvs] = useState([]);
  const [variantsById, setVariantsById] = useState({});
  const [openSlot, setOpenSlot] = useState(null);
  const [pickerQuery, setPickerQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const idsKey = searchParams.get('ids') || '';
  const ids = idsKey.split(',').map((id) => id.trim()).filter(Boolean);
  const vehiclesById = useMemo(() => new Map([...catalog, ...evs].map((ev) => [String(ev._id), ev])), [catalog, evs]);

  useEffect(() => {
    let active = true;
    api.get('/evs?limit=50&sortBy=rating_desc&page=1').then(async (first) => {
      const pages = first.data.totalPages || 1;
      const rest = await Promise.all(Array.from({ length: Math.max(0, pages - 1) }, (_, index) => api.get(`/evs?limit=50&sortBy=rating_desc&page=${index + 2}`)));
      if (active) setCatalog([...(first.data.data || []), ...rest.flatMap((page) => page.data.data || [])]);
    }).catch(() => { if (active) setCatalog([]); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (openSlot == null) return undefined;
    const closeOnEscape = (event) => { if (event.key === 'Escape') setOpenSlot(null); };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [openSlot]);
  useEffect(() => {
    if (ids.length < 2 || ids.length > 4) {
      setEvs([]); setLoading(false);
      setError(ids.length > 4 ? 'Compare up to four EVs at a time.' : '');
      return undefined;
    }
    let active = true;
    setLoading(true); setError('');
    api.get('/evs/compare', { params: { ids: ids.join(',') } })
      .then(async (res) => {
        if (!active) return;
        const selected = res.data.data || []; setEvs(selected);
        const variantResponse = await api.get('/evs/compare-variants', { params: { ids: ids.join(',') } });
        if (active) setVariantsById(Object.fromEntries((variantResponse.data.data || []).map((item) => [item.evId, item.variants || []])));
      })
      .catch((err) => { if (active) { setEvs([]); setError(err.response?.data?.message || 'Could not load this comparison.'); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [idsKey]);

  const chooseVehicle = (slot, id) => {
    if (!id || ids.includes(id) || slot !== ids.length || ids.length >= 4) return;
    setSearchParams({ ids: [...ids, id].join(',') });
    setOpenSlot(null);
  };
  const hasDcFastChargeValues = evs.some((ev) => {
    const value = ev.charging?.dcFastChargingTimeMinutes;
    return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
  });
  const replaceVehicle = (slot, id) => {
    if (!id) { setSearchParams(ids.filter((_, index) => index !== slot).length ? { ids: ids.filter((_, index) => index !== slot).join(',') } : {}); setOpenSlot(null); return; }
    if (ids.includes(id) && ids[slot] !== id) return;
    const next = [...ids]; next[slot] = id; setSearchParams({ ids: next.join(',') });
    setOpenSlot(null);
  };
  const addAnother = () => {
    const slot = ids.length;
    setPickerQuery('');
    setOpenSlot(slot);
  };
  const pickerCurrentId = openSlot == null ? null : ids[openSlot];
  const pickerCars = catalog.filter((car) => {
    const carId = String(car._id);
    if (ids.includes(carId) && carId !== pickerCurrentId) return false;
    const name = `${displayBrandName(car.brandId?.name)} ${displayModelAndVariant(car.name, car.brandId?.name, car.variant)} ${car.variant || ''} ${car.price?.exShowroom || ''}`.toLowerCase();
    return name.includes(pickerQuery.trim().toLowerCase());
  });

  return <main className="mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6 lg:px-8">
    <header className="compare-hero overflow-hidden rounded-[28px] border border-emerald-900/5 px-5 py-9 text-center sm:px-10 sm:py-12">
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-white/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700 shadow-sm"><Scale className="h-4 w-4" /> Compare tool</span>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">Compare electric cars <span className="text-emerald-600">side by side</span></h1>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Select up to four EVs to compare prices, range, battery, charging and performance.</p>
    </header>

    <section className="rounded-[26px] border border-aurora-border bg-white p-4 shadow-[0_8px_32px_rgba(15,23,42,0.035)] sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="rounded-full bg-emerald-50 p-2.5 text-emerald-700"><Scale className="h-5 w-5" /></span><div><h2 className="font-display text-lg font-bold text-[#0f172a]">Select cars to compare</h2><p className="text-xs text-slate-600">Choose at least two · {ids.length}/4 selected</p></div></div>
        {ids.length > 0 && ids.length < 4 && <button type="button" onClick={addAnother} className="evora-green-gradient inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(20,160,88,.22)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(20,160,88,.3)]"><Plus className="h-4 w-4" />Add another EV</button>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((slot) => {
          const id = ids[slot]; const ev = id ? vehiclesById.get(id) : null;
          const isOptional = slot > 1;
          const disabled = !id && slot > ids.length;
          const pickerOpen = openSlot === slot;
          return <article key={slot} className={`compare-slot relative min-w-0 overflow-hidden rounded-2xl border text-[#0f172a] transition duration-300 ${ev ? 'border-emerald-200 bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-md' : 'border-dashed border-slate-300 bg-slate-50/65 hover:border-emerald-400 hover:bg-emerald-50/40'} ${disabled ? 'opacity-50' : ''}`}>
            <div className="relative flex aspect-[16/8] items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-br from-emerald-50 via-white to-sky-50">
              {ev && getVehicleImage(ev) ? <img src={getVehicleImage(ev)} alt={`${displayBrandName(ev.brandId?.name)} ${displayModelAndVariant(ev.name, ev.brandId?.name, ev.variant)}`} className="h-full w-full object-cover transition duration-500 hover:scale-[1.035]" /> : <button type="button" id={`compare-car-${slot}`} disabled={disabled} onClick={() => { if (!disabled) { setPickerQuery(''); setOpenSlot(pickerOpen ? null : slot); } }} aria-expanded={pickerOpen} aria-haspopup="dialog" className="flex h-full w-full flex-col items-center justify-center text-slate-500 disabled:cursor-not-allowed"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm"><Plus className="h-6 w-6" /></span><span className="mt-2 block text-xs font-semibold">{isOptional ? `Add car ${slot + 1} (optional)` : `Select car ${slot + 1}`}</span></button>}
              {ev && <button type="button" onClick={() => replaceVehicle(slot, '')} aria-label={`Remove ${ev.name}`} className="absolute right-2 top-2 rounded-full bg-white/95 p-2 text-slate-600 shadow transition hover:bg-rose-50 hover:text-rose-700"><X className="h-4 w-4" /></button>}
            </div>
            <div className="p-3.5">
              {ev && <><p style={{ color: '#15803d' }} className="truncate text-xs font-medium">{displayBrandName(ev.brandId?.name) || 'Electric vehicle'}</p><p style={{ color: '#0f172a' }} className="mt-0.5 min-h-10 font-display text-sm font-bold leading-5">{displayModelAndVariant(ev.name, ev.brandId?.name, ev.variant)}</p><p style={{ color: '#0f172a' }} className="mt-1 flex items-center gap-1 text-sm font-bold"><BatteryCharging className="h-4 w-4 text-emerald-600" />{lakhPrice(ev.price?.exShowroom)}</p></>}
              <button type="button" id={ev ? `compare-car-${slot}` : undefined} disabled={disabled} onClick={() => { if (!disabled) { setPickerQuery(''); setOpenSlot(pickerOpen ? null : slot); } }} aria-expanded={pickerOpen} aria-haspopup="dialog" className="mt-3 flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-[#0f172a] transition hover:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"><span>{ev ? 'Change car' : 'Select a car'}</span><ChevronDown className="h-4 w-4" /></button>
            </div>
          </article>;
        })}
      </div>
      {ids.length >= 2 && <p className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-emerald-800"><Check className="h-4 w-4" />Your comparison updates automatically as you select cars.</p>}
    </section>

    {openSlot != null && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpenSlot(null); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="compare-picker-heading" className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 p-4 sm:p-5">
          <div><h2 id="compare-picker-heading" className="font-display text-lg font-bold text-slate-900">Choose an electric car</h2><p className="mt-1 text-sm text-slate-600">Select car {openSlot + 1} · {catalog.length} cars available</p></div>
          <button type="button" onClick={() => setOpenSlot(null)} aria-label="Close car picker" className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"><X className="h-5 w-5" /></button>
        </header>
        <label className="relative mx-4 mt-4 block sm:mx-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input autoFocus type="search" value={pickerQuery} onChange={(event) => setPickerQuery(event.target.value)} placeholder="Search by car or brand name..." className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
        </label>
        <div role="listbox" aria-label="Available electric cars" className="grid min-h-0 grid-cols-1 gap-2 overflow-y-auto p-4 sm:grid-cols-2 sm:p-5">
          {pickerCars.map((item) => {
            const photo = getVehicleImage(item);
            const brand = displayBrandName(item.brandId?.name);
            const model = displayModelAndVariant(item.name, item.brandId?.name, item.variant);
            return <button type="button" role="option" aria-selected={String(item._id) === pickerCurrentId} key={item._id} onClick={() => pickerCurrentId ? replaceVehicle(openSlot, String(item._id)) : chooseVehicle(openSlot, String(item._id))} className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 text-left transition hover:border-emerald-400 hover:bg-emerald-50/60 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100">
              <span className="relative h-[4.5rem] w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100"><CarFront className="absolute inset-0 m-auto h-6 w-6 text-slate-400" />{photo && <img src={photo} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}</span>
              <span className="min-w-0 flex-1"><b className="block text-sm font-bold leading-5 text-slate-900">{brand} {model}</b><small className="mt-1 block truncate text-xs text-slate-600">{item.variant || 'Standard variant'}</small><strong className="mt-1 block text-sm font-semibold text-emerald-800">{lakhPrice(item.price?.exShowroom)}</strong></span>
            </button>;
          })}
          {pickerCars.length === 0 && <p className="col-span-full py-10 text-center text-sm text-slate-600">{catalog.length ? 'No cars match that search.' : 'Loading the EV catalog...'}</p>}
        </div>
      </section>
    </div>}

    {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
    {ids.length >= 2 && <section id="comparison-results" className="scroll-mt-24 flex flex-col gap-4" aria-live="polite">
      {loading ? <div className="h-48 animate-pulse rounded-2xl bg-emerald-50" /> : evs.length >= 2 && <>
        <div className="order-1 flex items-center justify-between gap-3"><h2 className="font-display text-xl font-bold text-[#0f172a]">Your EV comparison</h2><Link to="/catalog" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-900">Browse all EVs <ArrowRight className="h-4 w-4" /></Link></div>
        <section className={`order-3 grid items-stretch gap-3 ${hasDcFastChargeValues ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-3'}`} aria-label="Visual specification comparison">
          {[
            { title: 'Price comparison', unit: '₹ lakh', value: (ev) => ev.price?.exShowroom ? ev.price.exShowroom / 100000 : null, text: (n) => `₹${n.toFixed(2)} L`, lower: true },
            { title: 'Claimed range', unit: 'km', value: (ev) => ev.range?.claimedWltp || ev.range?.claimedNedc, text: (n) => `${n} km` },
            { title: 'Battery capacity', unit: 'kWh', value: (ev) => ev.battery?.capacityKwh, text: (n) => `${n} kWh` },
            { title: 'DC fast charge', unit: 'minutes', value: (ev) => ev.charging?.dcFastChargingTimeMinutes, text: (n) => `${n} min`, lower: true },
          ].map((metric) => {
            const values = evs.map((ev) => metric.value(ev));
            const hasValue = (value) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
            if (metric.title === 'DC fast charge' && !values.some(hasValue)) return null;
            const numbers = values.filter(hasValue).map(Number);
            const max = Math.max(...numbers, 1);
            const best = numbers.length ? (metric.lower ? Math.min(...numbers) : Math.max(...numbers)) : null;
            return <article key={metric.title} className="flex h-full min-h-[310px] flex-col rounded-2xl border border-aurora-border bg-white p-4 shadow-sm">
              <div className="h-10 shrink-0">
                <h3 className="truncate font-semibold leading-5 text-[#0f172a]">{metric.title}</h3>
                <p className="text-xs leading-4 text-slate-500">{metric.lower ? 'Lower is better' : 'Higher is better'}</p>
              </div>
              <div className="mt-auto grid h-[238px] gap-2 pt-2" style={{ gridTemplateColumns: `repeat(${evs.length}, minmax(0, 1fr))` }}>
                {evs.map((ev, index) => {
                  const valid = hasValue(values[index]);
                  const value = valid ? Number(values[index]) : null;
                  return <div key={ev._id} className="flex h-full min-w-0 flex-col items-center text-center">
                    <b className={`flex h-6 w-full shrink-0 items-center justify-center truncate text-[11px] ${valid && value === best ? 'text-emerald-800' : 'text-[#475569]'}`}>{valid ? metric.text(value) : 'Not listed'}</b>
                    <div className="flex h-[142px] w-full shrink-0 items-end justify-center border-b border-slate-200">
                      {valid && <div className="relative w-12 max-w-full rounded-t-lg evora-green-gradient" style={{ height: `${Math.max(value === 0 ? 4 : 8, value / max * 100)}%` }} />}
                    </div>
                    <span className="mt-2 line-clamp-2 h-8 w-full shrink-0 text-[10px] font-medium leading-3 text-[#334155]">{ev.brandId?.name} {ev.name}</span>
                    <small className="mt-1 line-clamp-1 h-4 w-full shrink-0 text-[9px] leading-3 text-slate-500">{ev.variant || 'Standard'}</small>
                  </div>;
                })}
              </div>
            </article>;
          })}
        </section>
        <section className="order-4 rounded-2xl border border-aurora-border bg-white p-5"><h3 className="font-display text-lg font-bold text-[#0f172a]">Other variants and prices</h3><p className="mt-1 text-xs text-slate-600">Compare available trims of each selected model.</p><div className="mt-4 grid gap-4 sm:grid-cols-2">{evs.map((ev) => <article key={ev._id} className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-semibold text-emerald-700">{ev.brandId?.name}</p><h4 className="mt-1 font-bold text-[#0f172a]">{ev.name}</h4><div className="mt-3 divide-y divide-slate-100">{(variantsById[String(ev._id)] || [ev]).map((variant) => <div key={variant._id} className="flex items-start justify-between gap-3 py-2.5 text-sm"><span className="min-w-0"><b className="block text-[#334155]">{variant.variant || 'Standard variant'}</b><small className="text-slate-500">{number(variant.battery?.capacityKwh, 'kWh')} battery · {variant.range?.claimedWltp || variant.range?.claimedNedc ? `${variant.range.claimedWltp || variant.range.claimedNedc} km` : 'Range n/a'}</small></span><b className="shrink-0 text-[#0f172a]">{lakhPrice(variant.price?.exShowroom)}</b></div>)}</div></article>)}</div></section>
        <div className="order-2 overflow-x-auto rounded-2xl border border-aurora-border bg-white shadow-sm"><table className="w-full min-w-[720px] border-collapse text-left">
          <thead><tr><th className="sticky left-0 z-10 w-48 bg-slate-50 p-3 text-xs font-semibold uppercase text-slate-600">Specification</th>{evs.map((ev) => <th key={ev._id} className="min-w-48 border-l border-slate-100 p-4 align-top"><p className="text-[11px] font-bold uppercase text-emerald-700">{ev.brandId?.name || 'EV'}</p><p className="mt-1 text-sm font-bold text-[#0f172a]">{ev.name}</p><p className="mt-1 text-xs text-slate-600">Variant: {ev.variant || 'Standard variant'}</p></th>)}</tr></thead>
          <tbody>{rows.map((row) => { const values = evs.map(row.get); const hasAnyValue = values.some((value) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))); if (['Peak torque', 'DC fast charging'].includes(row.label) && !hasAnyValue) return null; const usable = values.filter(Number.isFinite); const best = usable.length ? (row.better === 'lower' ? Math.min(...usable) : Math.max(...usable)) : null; return <tr key={row.label} className="border-t border-slate-100"><th scope="row" className="sticky left-0 z-10 bg-white px-3 py-3 text-xs font-medium text-slate-600">{row.label}</th>{values.map((value, index) => <td key={evs[index]._id} className={`border-l border-slate-100 px-4 py-3 text-sm font-semibold ${value != null && value === best ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700'}`}>{row.format(value)}</td>)}</tr>; })}</tbody>
        </table></div>
      </>}
    </section>}
  </main>;
}

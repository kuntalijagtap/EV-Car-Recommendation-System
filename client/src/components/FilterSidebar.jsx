import React from 'react';
import { Search, RotateCcw, SlidersHorizontal } from 'lucide-react';

export default function FilterSidebar({
  filters,
  metadata,
  onChange,
  onReset,
}) {
  const bodyTypes = ['SUV', 'Sedan', 'Hatchback', 'MUV', 'Crossover'];
  const brands = metadata?.brands || [];

  const handleBodyTypeToggle = (type) => {
    const current = filters.bodyType ? filters.bodyType.split(',') : [];
    let updated;
    if (current.includes(type)) {
      updated = current.filter((t) => t !== type);
    } else {
      updated = [...current, type];
    }
    onChange('bodyType', updated.join(','));
  };

  const handleBrandToggle = (brandName) => {
    const current = filters.brand ? filters.brand.split(',') : [];
    let updated;
    if (current.includes(brandName)) {
      updated = current.filter((b) => b !== brandName);
    } else {
      updated = [...current, brandName];
    }
    onChange('brand', updated.join(','));
  };

  const currentBrands = filters.brand ? filters.brand.split(',') : [];
  const currentBodyTypes = filters.bodyType ? filters.bodyType.split(',') : [];

  return (
    <div className="aurora-glass space-y-6 rounded-2xl p-5 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-aurora-border pb-3">
        <div className="flex items-center gap-2 font-bold text-aurora-text">
          <SlidersHorizontal className="h-4 w-4 text-aurora-violet" />
          <span>Catalog Filters</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-slate-400 transition hover:text-aurora-lime"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Instant Search Bar */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Vehicle Search
        </label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="e.g. Nexon, Seal, 500km..."
            value={filters.search || ''}
            onChange={(e) => onChange('search', e.target.value)}
            className="w-full rounded-xl border border-aurora-border bg-aurora-base py-2 pl-9 pr-3 text-xs text-aurora-text placeholder-slate-500 transition focus:border-aurora-violet focus:outline-none"
          />
        </div>
      </div>

      {/* Max Budget Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Max Budget
          </label>
          <span className="font-mono text-xs font-bold text-aurora-lime">
            {filters.maxPrice
              ? `₹${(filters.maxPrice / 100000).toFixed(1)} Lakh`
              : 'Any Budget'}
          </span>
        </div>
        <input
          type="range"
          min="800000"
          max="8000000"
          step="100000"
          value={filters.maxPrice || 8000000}
          onChange={(e) => onChange('maxPrice', Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-aurora-raised accent-violet-500"
        />
        <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
          <span>₹8L</span>
          <span>₹40L</span>
          <span>₹80L+</span>
        </div>
      </div>

      {/* Minimum Claimed Range */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Min Claimed Range
          </label>
          <span className="font-mono text-xs font-bold text-aurora-blue">
            {filters.minRange ? `${filters.minRange} km+` : 'Any'}
          </span>
        </div>
        <input
          type="range"
          min="200"
          max="700"
          step="25"
          value={filters.minRange || 200}
          onChange={(e) => onChange('minRange', Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-aurora-raised accent-blue-500"
        />
        <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
          <span>200 km</span>
          <span>450 km</span>
          <span>700 km</span>
        </div>
      </div>

      {/* Body Types */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
          Body Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          {bodyTypes.map((type) => {
            const isSelected = currentBodyTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleBodyTypeToggle(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  isSelected
                    ? 'bg-aurora-violet font-bold text-white shadow-violet'
                    : 'border border-aurora-border bg-aurora-base text-slate-300 hover:text-aurora-text'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Manufacturers / Brands */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
          Manufacturers
        </label>
        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
          {brands.map((b) => {
            const isChecked = currentBrands.includes(b.name);
            return (
              <label
                key={b._id}
                className="flex cursor-pointer items-center justify-between rounded-lg p-1.5 text-xs hover:bg-aurora-raised/60"
              >
                <div className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleBrandToggle(b.name)}
                    className="w-3.5 h-3.5 accent-emerald-500 rounded cursor-pointer"
                  />
                  <span>{b.name}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {b.activeEvCount || ''}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Seating Capacity */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Seats
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[4, 5, 7].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange('seats', filters.seats === String(s) ? '' : String(s))}
              className={`py-1.5 rounded-lg text-xs font-medium border text-center transition ${
                filters.seats === String(s)
                  ? 'border-aurora-lime/35 bg-aurora-lime/10 text-aurora-lime'
                  : 'border-aurora-border bg-aurora-base text-slate-300 hover:border-aurora-violet/40'
              }`}
            >
              {s} Seats
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

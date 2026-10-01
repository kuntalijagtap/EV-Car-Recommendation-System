import React from 'react';
import { Search, RotateCcw, Rotate3d, SlidersHorizontal } from 'lucide-react';

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
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-6 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 font-bold text-white">
          <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
          <span>Catalog Filters</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition"
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
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
      </div>

      {/* 360° Visualizer Flagship Toggle */}
      <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            <Rotate3d className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-200">
              360° Virtual Models Only
            </span>
          </div>
          <input
            type="checkbox"
            checked={Boolean(filters.has360)}
            onChange={(e) => onChange('has360', e.target.checked)}
            className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
          />
        </label>
      </div>

      {/* Max Budget Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Max Budget
          </label>
          <span className="text-xs font-mono font-bold text-emerald-400">
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
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
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
          <span className="text-xs font-mono font-bold text-cyan-400">
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
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
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
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
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
                className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-950 cursor-pointer text-xs"
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
                <span className="text-[10px] text-slate-500 font-mono">
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
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
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

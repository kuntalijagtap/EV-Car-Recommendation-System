import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import api from '../services/api';
import EVCard from '../components/EVCard';
import FilterSidebar from '../components/FilterSidebar';
import {
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Layers,
  ArrowUpDown,
  X,
} from 'lucide-react';
import { getVehicleImage } from '../services/vehicleImage';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [evs, setEvs] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [compareIds, setCompareIds] = useState([]);
  const [compareCars, setCompareCars] = useState({});

  // Parse filter state from URL search params
  const filters = {
    search: searchParams.get('search') || '',
    brand: searchParams.get('brand') || '',
    bodyType: searchParams.get('bodyType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRange: searchParams.get('minRange') || '',
    seats: searchParams.get('seats') || '',
    sortBy: searchParams.get('sortBy') || 'rating_desc',
    page: parseInt(searchParams.get('page') || '1', 10),
  };

  // Load metadata bounds once
  useEffect(() => {
    async function loadMetadata() {
      try {
        const res = await api.get('/evs/metadata/filters');
        if (res.data.success) {
          setMetadata(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    }
    loadMetadata();
  }, []);

  // Fetch EVs when filters change
  useEffect(() => {
    async function fetchEVs() {
      setLoading(true);
      try {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.brand) params.brand = filters.brand;
        if (filters.bodyType) params.bodyType = filters.bodyType;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (filters.minRange) params.minRange = filters.minRange;
        if (filters.seats) params.seats = filters.seats;
        if (filters.sortBy) params.sortBy = filters.sortBy;
        params.page = filters.page;
        params.limit = 12;

        const res = await api.get('/evs', { params });
        if (res.data.success) {
          setEvs(res.data.data);
          setTotalPages(res.data.totalPages);
        }
      } catch (err) {
        console.error('Failed to fetch EVs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEVs();
  }, [searchParams]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === '' || value === null || value === false || value === undefined) {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
    // Reset to page 1 on filter changes
    if (key !== 'page') {
      next.set('page', '1');
    }
    setSearchParams(next);
  };

  const handleReset = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateFilter('page', newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleCompare = (evId, ev) => {
    if (compareIds.includes(evId)) {
      setCompareIds((current) => current.filter((id) => id !== evId));
      setCompareCars((items) => { const next = { ...items }; delete next[evId]; return next; });
      return;
    }
    if (compareIds.length >= 4) return;
    setCompareIds((current) => [...current, evId]);
    setCompareCars((items) => ({ ...items, [evId]: ev }));
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 ${compareIds.length ? 'pb-32' : 'pb-8'} space-y-6`}>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-aurora-text tracking-tight">
            Electric Vehicle Catalog
          </h1>
        </div>

        {/* Sort & Mobile filter trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-aurora-border text-xs font-semibold text-aurora-text"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-white border border-aurora-border rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 hidden sm:inline">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="bg-transparent text-aurora-text font-medium focus:outline-none cursor-pointer"
            >
              <option value="rating_desc" className="bg-white text-aurora-text">Top Rated First</option>
              <option value="price_asc" className="bg-white text-aurora-text">Price: Low to High</option>
              <option value="price_desc" className="bg-white text-aurora-text">Price: High to Low</option>
              <option value="range_desc" className="bg-white text-aurora-text">Highest Claimed Range</option>
              <option value="views_desc" className="bg-white text-aurora-text">Most Popular</option>
              <option value="newest" className="bg-white text-aurora-text">Latest Models</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar + EV Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar */}
        <div className="hidden md:block md:col-span-1 sticky top-24">
          <FilterSidebar
            filters={filters}
            metadata={metadata}
            onChange={updateFilter}
            onReset={handleReset}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-aurora-base/95 p-4 overflow-y-auto">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="px-4 py-2 bg-aurora-raised text-aurora-text rounded-lg text-xs font-bold"
              >
                Close Filters
              </button>
            </div>
            <FilterSidebar
              filters={filters}
              metadata={metadata}
              onChange={(k, v) => {
                updateFilter(k, v);
              }}
              onReset={() => {
                handleReset();
                setMobileFilterOpen(false);
              }}
            />
          </div>
        )}

        {/* Vehicle Cards Grid */}
        <div className="md:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 rounded-2xl bg-aurora-raised animate-pulse border border-aurora-border" />
              ))}
            </div>
          ) : evs.length === 0 ? (
            <div className="bg-white border border-aurora-border rounded-3xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-aurora-raised text-slate-400 mx-auto flex items-center justify-center">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-aurora-text">No Electric Vehicles Match Your Criteria</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Try widening your price range, claimed range slider, or clearing the manufacturer filters.
              </p>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-aurora-violet text-white font-bold text-xs shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {evs.map((ev) => (
                <EVCard
                  key={ev._id}
                  ev={ev}
                  onToggleCompare={(id) => toggleCompare(id, ev)}
                  isCompared={compareIds.includes(ev._id)}
                  compareDisabled={compareIds.length >= 4 && !compareIds.includes(ev._id)}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-800 text-xs">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page <= 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-aurora-border text-slate-300 hover:text-aurora-text disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-slate-400 font-medium">
                Page <strong className="text-aurora-text">{filters.page}</strong> of <strong className="text-aurora-text">{totalPages}</strong>
              </span>

              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page >= totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-aurora-border text-slate-300 hover:text-aurora-text disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      {compareIds.length > 0 && <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-2xl border border-emerald-900/10 bg-white/95 p-3 shadow-[0_18px_55px_rgba(15,23,42,.18)] backdrop-blur-xl sm:px-5">
          <div className="flex min-w-0 items-center gap-3"><span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 sm:flex"><Layers className="h-5 w-5" /></span><div className="min-w-0"><p className="text-sm font-bold text-slate-900">{compareIds.length} EV{compareIds.length === 1 ? '' : 's'} selected</p><div className="mt-1 flex max-w-[55vw] gap-2 overflow-hidden">{compareIds.map((id) => { const car = compareCars[id]; const image = getVehicleImage(car); return <span key={id} className="inline-flex max-w-40 items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-1 pr-2 text-[11px] font-medium text-slate-600">{image ? <img src={image} alt="" className="h-5 w-7 rounded-full object-cover" /> : <span className="h-5 w-7 rounded-full bg-gradient-to-br from-emerald-200 to-green-500" />}<span className="truncate">{car?.name || 'EV selected'}</span></span>; })}</div></div></div>
          <div className="flex shrink-0 items-center gap-2"><button type="button" onClick={() => { setCompareIds([]); setCompareCars({}); }} className="hidden rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 sm:inline-flex">Clear</button><Link to={compareIds.length >= 2 ? `/compare?ids=${compareIds.join(',')}` : '/compare'} className="evora-green-gradient inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(20,160,88,.25)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(20,160,88,.32)]">Compare {compareIds.length >= 2 && `(${compareIds.length})`} <ArrowUpDown className="h-4 w-4" /></Link><button type="button" aria-label="Clear selected cars" onClick={() => { setCompareIds([]); setCompareCars({}); }} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 sm:hidden"><X className="h-4 w-4" /></button></div>
        </div>
      </div>}
    </div>
  );
}

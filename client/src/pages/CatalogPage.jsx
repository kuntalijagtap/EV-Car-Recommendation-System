import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
} from 'lucide-react';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [evs, setEvs] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Parse filter state from URL search params
  const filters = {
    search: searchParams.get('search') || '',
    brand: searchParams.get('brand') || '',
    bodyType: searchParams.get('bodyType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRange: searchParams.get('minRange') || '',
    seats: searchParams.get('seats') || '',
    has360: searchParams.get('has360') === 'true',
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
        if (filters.has360) params.has360 = true;
        if (filters.sortBy) params.sortBy = filters.sortBy;
        params.page = filters.page;
        params.limit = 12;

        const res = await api.get('/evs', { params });
        if (res.data.success) {
          setEvs(res.data.data);
          setTotalCount(res.data.totalCount);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Electric Vehicle Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Showing <strong className="text-emerald-400">{totalCount}</strong> verified models available in India
          </p>
        </div>

        {/* Sort & Mobile filter trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 hidden sm:inline">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="rating_desc" className="bg-slate-900 text-white">Top Rated First</option>
              <option value="price_asc" className="bg-slate-900 text-white">Price: Low to High</option>
              <option value="price_desc" className="bg-slate-900 text-white">Price: High to Low</option>
              <option value="range_desc" className="bg-slate-900 text-white">Highest Claimed Range</option>
              <option value="views_desc" className="bg-slate-900 text-white">Most Popular</option>
              <option value="newest" className="bg-slate-900 text-white">Latest Models</option>
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
          <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold"
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
                <div key={i} className="h-96 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : evs.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">No Electric Vehicles Match Your Criteria</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Try widening your price range, claimed range slider, or clearing the manufacturer filters.
              </p>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {evs.map((ev) => (
                <EVCard key={ev._id} ev={ev} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-800 text-xs">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page <= 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-slate-400 font-medium">
                Page <strong className="text-white">{filters.page}</strong> of <strong className="text-white">{totalPages}</strong>
              </span>

              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page >= totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

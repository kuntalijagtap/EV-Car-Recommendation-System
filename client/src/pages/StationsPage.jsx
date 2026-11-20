import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StationsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center border border-emerald-200">
        <MapPin className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-aurora-text">Public Charging Station Map</h1>
      <p className="text-sm text-slate-400 max-w-lg mx-auto">
        Interactive Leaflet map with connector-type filtering (CCS2, Type 2, GB/T) and live availability (Scheduled for Phase 7).
      </p>
      <Link
        to="/catalog"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-aurora-violet text-white font-bold rounded-xl text-xs"
      >
        <span>Explore Vehicles</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

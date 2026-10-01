import React from 'react';
import { Scale, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ComparePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
        <Scale className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-white">Compare Electric Vehicles</h1>
      <p className="text-sm text-slate-400 max-w-lg mx-auto">
        Side-by-side spec comparison and AI difference explanation engine (Scheduled for Phase 3).
      </p>
      <Link
        to="/catalog"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
      >
        <span>Browse Catalog</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

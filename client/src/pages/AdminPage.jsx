import React from 'react';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-white">Admin Control & Moderation</h1>
      <p className="text-sm text-slate-400 max-w-lg mx-auto">
        CRUD management for EVs, brands, review moderation, and platform telemetry analytics (Scheduled for Phase 7).
      </p>
      <Link
        to="/catalog"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
      >
        <span>Back to Catalog</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

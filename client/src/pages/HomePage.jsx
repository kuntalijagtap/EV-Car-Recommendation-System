import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import EVCard from '../components/EVCard';
import {
  Zap,
  Sparkles,
  Rotate3d,
  ArrowRight,
  ShieldCheck,
  BatteryCharging,
  Compass,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export default function HomePage() {
  const [flagships, setFlagships] = useState([]);
  const [popularEVs, setPopularEVs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [flagshipRes, popularRes] = await Promise.all([
          api.get('/evs?has360=true&limit=6'),
          api.get('/evs?sortBy=views_desc&limit=4'),
        ]);

        if (flagshipRes.data.success) {
          setFlagships(flagshipRes.data.data);
        }
        if (popularRes.data.success) {
          setPopularEVs(popularRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24">
        {/* Glow gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 w-[400px] h-[250px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6 shadow-lg shadow-emerald-500/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Electric Vehicle Recommendation Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Stop Guessing. <br />
            Find the <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Exact Electric Car</span> for Your Life.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Existing catalogs are endless filters. <strong>EVora</strong> is an AI-first EV advisor. Tell us your daily commute and charging access, and get database-grounded recommendations with 360° virtual exploration.
          </p>

          {/* AI Prompt Teaser */}
          <div className="mt-8 max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 py-2 text-left">
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
              <span className="text-sm text-slate-300 italic truncate">
                "My office is 25 km away in Pune, budget under 20 Lakhs, family of 4..."
              </span>
            </div>
            <Link
              to="/advisor"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all"
            >
              <span>Ask AI Advisor</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick metric pills */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>22 Indian Market EVs</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero-Hallucination Grounding</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>6 Flagship 360° Visualizers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Verified Owner Reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* Flagship 360° Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Rotate3d className="w-4 h-4" />
              <span>Exclusive Interactive Experience</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Flagship 360° Virtual Showroom
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Explore external geometry, battery architecture, and cabin hotspots in 3D.
            </p>
          </div>
          <Link
            to="/catalog?has360=true"
            className="flex items-center gap-1 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition"
          >
            <span>View All 360° Models</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flagships.slice(0, 6).map((ev) => (
              <EVCard key={ev._id} ev={ev} />
            ))}
          </div>
        )}
      </section>

      {/* Popular Trending EVs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Most Researched by Buyers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Trending Electric Cars in India
            </h2>
          </div>
          <Link
            to="/catalog"
            className="flex items-center gap-1 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularEVs.map((ev) => (
            <EVCard key={ev._id} ev={ev} />
          ))}
        </div>
      </section>

      {/* Database & Platform Architecture Feature Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              DBMS Core Engineering
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Data Integrity & Grounded Recommendations
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every recommendation generated by EVora is strictly cross-referenced with our MongoDB catalog using compound index searches (`price`, `claimedRange`), geospatial 2dsphere station proximity queries, and verified owner telemetry pipelines.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to="/catalog"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition"
              >
                Explore Vehicles
              </Link>
              <Link
                to="/advisor"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
              >
                Try AI Advisor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

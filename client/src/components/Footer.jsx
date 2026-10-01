import React from 'react';
import { Zap, Heart, Database, ShieldCheck, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">EVora</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-Powered Electric Vehicle Recommendation & Intelligence System. Grounded recommendations, 360° virtual tours, and verified owner telemetry for Indian EV buyers.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
              <Database className="w-3.5 h-3.5" />
              <span>MongoDB 9.0 Verified Architecture</span>
            </div>
          </div>

          {/* Catalog Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/catalog" className="hover:text-emerald-400 transition">All Electric Vehicles</Link>
              </li>
              <li>
                <Link to="/catalog?has360=true" className="hover:text-emerald-400 transition">360° Flagship Models</Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-emerald-400 transition">Compare Specifications</Link>
              </li>
              <li>
                <Link to="/stations" className="hover:text-emerald-400 transition">Charging Station Locator</Link>
              </li>
            </ul>
          </div>

          {/* AI Intelligence */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Intelligent Tools
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/advisor" className="hover:text-cyan-400 transition flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  AI Conversational Advisor
                </Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Range Comfort Calculator</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">5-Year TCO Fuel Savings</span>
              </li>
              <li>
                <Link to="/catalog?sortBy=rating_desc" className="hover:text-emerald-400 transition">Verified Owner Reviews</Link>
              </li>
            </ul>
          </div>

          {/* Academic DBMS Project Info */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>DBMS Course Project</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Designed with 9 MongoDB collections, 5 standalone aggregation pipelines, composite indexing, and transactional integrity.
            </p>
            <div className="mt-3 text-[10px] text-slate-500">
              Built with MERN Stack + Vite + Tailwind CSS
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 EVora India. All rights reserved. Realistic sample data for academic demonstration.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Engineered with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> for the Indian EV Revolution
          </p>
        </div>
      </div>
    </footer>
  );
}

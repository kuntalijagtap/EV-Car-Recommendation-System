import React from 'react';
import { Sparkles, Bot, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdvisorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center border border-cyan-500/30">
        <Bot className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-white">AI EV Conversational Advisor</h1>
      <p className="text-sm text-slate-400 max-w-lg mx-auto">
        Natural language EV advisor grounded with Gemini function calling and Range Comfort Score calculation (Scheduled for Phase 5).
      </p>
      <Link
        to="/catalog"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs"
      >
        <span>Explore Catalog First</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

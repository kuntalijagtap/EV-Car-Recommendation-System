import React from 'react';
import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-aurora-border bg-aurora-base">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-aurora-violet text-white">
                <Zap aria-hidden="true" className="h-5 w-5" />
              </span>
              <span className="font-display text-lg font-bold text-aurora-text">EVora</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-aurora-muted">A Personalized Multi-Criteria EV Selection Platform</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-300 sm:justify-end">
            <Link to="/catalog" className="hover:text-aurora-violet">Catalog</Link>
            <Link to="/compare" className="hover:text-aurora-violet">Compare</Link>
            <Link to="/advisor" className="hover:text-aurora-violet">AI Advisor</Link>
          </nav>
        </div>

        <div className="mt-6 border-t border-aurora-border pt-4 text-xs text-slate-500">
          <p>© 2026 EVora. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

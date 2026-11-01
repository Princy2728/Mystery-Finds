import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, ShieldAlert, Sparkles, FolderLock } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const isInvestigation = location.pathname.startsWith('/investigation/');
  const isResults = location.pathname.startsWith('/results/');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-900/30 bg-[#0c0e14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-3 group transition-transform active:scale-95"
        >
          <div className="w-9 h-9 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:border-amber-400 group-hover:bg-amber-500/20 transition-all shadow-inner">
            <Compass className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-lg tracking-wider text-slate-100 group-hover:text-amber-300 transition-colors">
              AI MYSTERY ROOM
            </span>
            <span className="text-[10px] uppercase font-mono-code tracking-widest text-amber-500/80 -mt-1">
              BUREAU OF INVESTIGATION
            </span>
          </div>
        </Link>

        {/* Navigation & Actions */}
        <nav className="flex items-center gap-3">
          {isInvestigation && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-amber-400/90 bg-amber-950/40 px-3 py-1 rounded border border-amber-800/40 font-mono-code">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>ACTIVE INVESTIGATION</span>
            </div>
          )}

          {isResults && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400/90 bg-emerald-950/40 px-3 py-1 rounded border border-emerald-800/40 font-mono-code">
              <FolderLock className="w-3.5 h-3.5 text-emerald-400" />
              <span>CASE ARCHIVED</span>
            </div>
          )}

          <Link
            to="/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Mystery</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

import React from 'react';
import { ShieldCheck, Database, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#090b0f] text-slate-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="font-heading font-bold text-slate-200 tracking-wider mb-2 flex items-center gap-2">
              <span className="text-amber-400">✦</span> AI MYSTERY ROOM
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-narrative">
              An interactive fair-play detective simulation. Generated cases follow strict logical rules, server-enforced evidence boundaries, and tamper-proof scoring.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-mono-code uppercase tracking-wider text-slate-300 mb-3">
              Fair-Play Guarantee
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Culprit & solution sealed on server until verdict</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Every clue and alibi verified for logical consistency</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Authoritative backend scoring and progress persistence</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono-code uppercase tracking-wider text-slate-300 mb-3">
              Standard Precinct Protocol
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every accusation is irrevocable. Inspect physical evidence carefully, cross-examine motives, and calculate hint penalties before filing your formal charge.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} AI Mystery Room. Confidential Case Files.</p>
          <div className="flex items-center gap-4">
            <span className="font-mono-code">Google Gemini Engine</span>
            <span>·</span>
            <span className="font-mono-code">Server-Authoritative Game State</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

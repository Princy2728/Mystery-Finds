import React from 'react';
import { Search, CheckCircle2, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { PublicClue } from '../../server/services/serializers.ts';

interface ClueCardProps {
  clue: PublicClue;
  index: number;
  onDiscover: (clueId: string) => void;
  isDiscovering?: boolean;
  disabled?: boolean;
}

export const ClueCard: React.FC<ClueCardProps> = ({
  clue,
  index,
  onDiscover,
  isDiscovering = false,
  disabled = false,
}) => {
  return (
    <div
      className={`rounded-lg border transition-all p-5 flex flex-col justify-between ${
        clue.discovered
          ? 'bg-[#151924] border-amber-500/40 shadow-sm ring-1 ring-amber-500/10'
          : 'bg-[#10131c] border-slate-800 hover:border-slate-700/80'
      }`}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2 pb-2.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono-code font-bold ${
                clue.discovered
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              #{index + 1}
            </span>
            <h4 className="font-heading font-semibold text-sm text-slate-100">
              {clue.title}
            </h4>
          </div>

          <span
            className={`inline-flex items-center gap-1 text-[11px] font-mono-code px-2 py-0.5 rounded ${
              clue.discovered
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            {clue.discovered ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>UNCOVERED</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3 text-slate-400" />
                <span>SEALED</span>
              </>
            )}
          </span>
        </div>

        {/* Teaser Description */}
        <div className="text-xs text-slate-400 font-narrative mb-3 leading-relaxed">
          <span className="font-mono-code text-[10px] uppercase text-slate-400 block mb-0.5">
            Initial Observation:
          </span>
          {clue.description}
        </div>

        {/* Revealed Evidence Content */}
        {clue.discovered && clue.content && (
          <div className="mt-3 p-3.5 rounded bg-amber-950/20 border border-amber-900/40 text-xs">
            <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-mono-code uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3 h-3" />
              <span>Forensic Analysis Report (+5 pts)</span>
            </div>
            <p className="text-amber-100 font-narrative leading-relaxed">
              {clue.content}
            </p>

            {clue.relatedSuspectIds && clue.relatedSuspectIds.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-amber-900/30 flex items-center gap-1.5 text-[10px] font-mono-code text-amber-300/80">
                <span className="text-slate-400 uppercase">Related Persons:</span>
                <span>{clue.relatedSuspectIds.join(', ')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action when undiscovered */}
      {!clue.discovered && (
        <div className="mt-4 pt-3 border-t border-slate-800/60">
          <button
            type="button"
            disabled={disabled || isDiscovering}
            onClick={() => onDiscover(clue.id)}
            className="w-full py-2 px-3 text-xs font-semibold rounded bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 hover:border-amber-400 transition-all flex items-center justify-center gap-1.5 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDiscovering ? (
              <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5 text-amber-400 group-hover:text-slate-950 transition-colors" />
            )}
            <span>Inspect & Discover Evidence (+5 pts)</span>
          </button>
        </div>
      )}
    </div>
  );
};

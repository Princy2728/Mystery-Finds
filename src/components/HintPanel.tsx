import React from 'react';
import { Lightbulb, AlertTriangle, HelpCircle } from 'lucide-react';
import { PublicHint } from '../../server/services/serializers.ts';

interface HintPanelProps {
  hints: PublicHint[];
  hintsUsed: number;
  maxHints: number;
  hintsRemaining: number;
  onRequestHint: () => void;
  isRequesting?: boolean;
  disabled?: boolean;
}

export const HintPanel: React.FC<HintPanelProps> = ({
  hints,
  hintsUsed,
  maxHints,
  hintsRemaining,
  onRequestHint,
  isRequesting = false,
  disabled = false,
}) => {
  const canRequest = hintsRemaining > 0 && !disabled;

  return (
    <div className="bg-[#10131c] rounded-lg border border-slate-800 p-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <h3 className="font-heading font-bold text-sm text-slate-100 uppercase tracking-wider">
            Precinct Consultation & Clues
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-code">
          <span className="text-slate-400">Hints:</span>
          <span className="text-amber-400 font-bold">{hintsUsed} / {maxHints}</span>
          <span className="text-slate-400">({hintsRemaining} left)</span>
        </div>
      </div>

      {/* Disclosed hints */}
      {hints.length === 0 ? (
        <div className="p-4 rounded bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400 font-narrative mb-4">
          No hints requested. Requesting advice from senior detectives incurs a <span className="text-rose-400 font-mono-code font-semibold">-10 points</span> penalty against your final detective rating.
        </div>
      ) : (
        <div className="space-y-2.5 mb-4">
          {hints.map((hint) => (
            <div
              key={hint.id}
              className="p-3.5 rounded bg-amber-950/20 border border-amber-900/40 text-xs font-narrative"
            >
              <div className="flex items-center justify-between text-[10px] font-mono-code text-amber-400 uppercase tracking-wider mb-1">
                <span>Detective Lead #{hint.index}</span>
                <span className="text-rose-400">-10 pts</span>
              </div>
              <p className="text-amber-100/90 leading-relaxed">
                {hint.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Action button */}
      <div>
        <button
          type="button"
          disabled={!canRequest || isRequesting}
          onClick={onRequestHint}
          className={`w-full py-2.5 px-4 text-xs font-semibold rounded border transition-all flex items-center justify-center gap-2 ${
            canRequest
              ? 'bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border-amber-500/30 hover:border-amber-400 cursor-pointer shadow-sm'
              : 'bg-slate-900 text-slate-400 border-slate-800 cursor-not-allowed opacity-60'
          }`}
        >
          {isRequesting ? (
            <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <HelpCircle className="w-3.5 h-3.5" />
          )}
          <span>
            {hintsRemaining > 0
              ? `Request Next Hint (${hintsRemaining} available, -10 pts)`
              : 'All Available Hints Exhausted'}
          </span>
        </button>

        {hintsRemaining > 0 && (
          <p className="text-[10px] font-mono-code text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Hints narrow down contradictions but never state the culprit directly.
          </p>
        )}
      </div>
    </div>
  );
};

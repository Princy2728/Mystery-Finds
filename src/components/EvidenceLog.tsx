import React from 'react';
import { BookOpen, CheckCircle, Search, AlertCircle } from 'lucide-react';
import { PublicClue } from '../../server/services/serializers.ts';

interface EvidenceLogProps {
  discoveredClues: PublicClue[];
  totalClues: number;
}

export const EvidenceLog: React.FC<EvidenceLogProps> = ({
  discoveredClues,
  totalClues,
}) => {
  return (
    <div className="bg-[#10131c] rounded-lg border border-slate-800 p-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <h3 className="font-heading font-bold text-sm text-slate-100 uppercase tracking-wider">
            Evidence Docket & Discovery Log
          </h3>
        </div>
        <div className="text-xs font-mono-code text-slate-400">
          <span>
            {discoveredClues.length} of {totalClues} secured
          </span>
        </div>
      </div>

      {discoveredClues.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-slate-800 rounded-md">
          <Search className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-narrative">
            No physical evidence discovered yet. Inspect the clue files below to begin unearthing the truth.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {discoveredClues.map((clue, idx) => (
            <div
              key={clue.id}
              className="p-3.5 rounded-md bg-[#161a26] border border-slate-700/60 flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono-code text-[11px] font-bold shrink-0 mt-0.5">
                #{idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-xs font-semibold text-slate-100">
                    {clue.title}
                  </h4>
                  <span className="text-[10px] font-mono-code text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    +5 pts
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-narrative leading-relaxed">
                  {clue.content || clue.description}
                </p>
                {clue.relatedSuspectIds && clue.relatedSuspectIds.length > 0 && (
                  <div className="mt-2 text-[10px] font-mono-code text-slate-400 flex items-center gap-2">
                    <span className="text-slate-400 uppercase">Connects to:</span>
                    <span className="text-amber-400/90">{clue.relatedSuspectIds.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

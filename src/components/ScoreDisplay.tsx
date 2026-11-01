import React from 'react';
import { Award, Plus, Minus, Info } from 'lucide-react';

interface ScoreDisplayProps {
  cluesDiscovered: number;
  hintsUsed: number;
  currentPoints: number;
  basePointsPotential: number;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  cluesDiscovered,
  hintsUsed,
  currentPoints,
  basePointsPotential,
}) => {
  const cluePoints = cluesDiscovered * 5;
  const hintPenalties = hintsUsed * 10;

  return (
    <div className="bg-[#10131c] rounded-lg border border-slate-800 p-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <h3 className="font-heading font-bold text-sm text-slate-100 uppercase tracking-wider">
            Investigative Score Preview
          </h3>
        </div>
        <div className="font-mono-code font-bold text-base text-amber-400">
          {currentPoints} <span className="text-xs font-normal text-slate-400">pts (preview)</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center py-2 bg-slate-900/60 rounded border border-slate-800 mb-3 font-mono-code text-xs">
        <div>
          <div className="text-[10px] text-slate-400 uppercase">Clue Findings</div>
          <div className="text-emerald-400 font-semibold flex items-center justify-center gap-0.5 mt-0.5">
            <Plus className="w-3 h-3" />
            {cluePoints}
          </div>
        </div>
        <div className="border-x border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Hint Deductions</div>
          <div className="text-rose-400 font-semibold flex items-center justify-center gap-0.5 mt-0.5">
            <Minus className="w-3 h-3" />
            {hintPenalties}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase">Potential Bounty</div>
          <div className="text-amber-300 font-semibold mt-0.5">
            +{basePointsPotential}
          </div>
        </div>
      </div>

      <p className="text-[11px] font-narrative text-slate-400 leading-normal flex items-start gap-1.5">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>
          Base case bounty (+{basePointsPotential} pts) is awarded upon successful, accurate accusation. An incorrect accusation awards 0 base points and finalizes the case.
        </span>
      </p>
    </div>
  );
};

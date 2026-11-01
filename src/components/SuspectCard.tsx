import React from 'react';
import { User, FileText, Target, Clock, ShieldAlert } from 'lucide-react';

interface SuspectCardProps {
  id: string;
  name: string;
  background: string;
  motive: string;
  alibi: string;
  index: number;
  onAccuseClick?: () => void;
  disabled?: boolean;
}

export const SuspectCard: React.FC<SuspectCardProps> = ({
  id,
  name,
  background,
  motive,
  alibi,
  index,
  onAccuseClick,
  disabled = false,
}) => {
  return (
    <div className="bg-[#12151f] rounded-lg border border-slate-800/90 hover:border-slate-700/80 transition-all flex flex-col p-5 shadow-sm">
      {/* Dossier Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/70 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-300 font-heading font-bold text-base shrink-0 shadow-inner">
            <User className="w-5 h-5 text-amber-400/80" />
          </div>
          <div>
            <div className="text-[10px] font-mono-code uppercase tracking-wider text-slate-400">
              Person of Interest #{index + 1}
            </div>
            <h3 className="font-heading font-bold text-base text-slate-100">
              {name}
            </h3>
          </div>
        </div>

        <span className="text-[11px] font-mono-code text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
          {id}
        </span>
      </div>

      {/* Suspect Dossier Details */}
      <div className="space-y-3.5 text-xs flex-1">
        <div>
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono-code uppercase tracking-wide mb-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Background & Profile</span>
          </div>
          <p className="text-slate-300 font-narrative leading-relaxed pl-5 border-l border-slate-800">
            {background}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-amber-400/90 text-[11px] font-mono-code uppercase tracking-wide mb-1">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>Presumed Motive</span>
          </div>
          <p className="text-slate-300 font-narrative leading-relaxed pl-5 border-l border-amber-900/40">
            {motive}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-sky-400/90 text-[11px] font-mono-code uppercase tracking-wide mb-1">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Reported Alibi</span>
          </div>
          <p className="text-slate-300 font-narrative leading-relaxed pl-5 border-l border-sky-900/40">
            {alibi}
          </p>
        </div>
      </div>

      {onAccuseClick && (
        <div className="mt-4 pt-3 border-t border-slate-800/70">
          <button
            type="button"
            disabled={disabled}
            onClick={onAccuseClick}
            className="w-full py-2 px-3 text-xs font-semibold rounded bg-slate-800/80 hover:bg-rose-950/60 text-slate-200 hover:text-rose-200 hover:border-rose-700/60 border border-slate-700 transition-all flex items-center justify-center gap-1.5 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400 transition-colors" />
            <span>Accuse {name.split(' ')[0]}</span>
          </button>
        </div>
      )}
    </div>
  );
};

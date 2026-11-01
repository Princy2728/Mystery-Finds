import React, { useEffect, useState } from 'react';
import { Compass, Sparkles, Search, FileSearch } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

const DETECTIVE_STEPS = [
  'Constructing crime scene environment...',
  'Evaluating forensic timelines and witness alibis...',
  'Planting physical evidence trails and motives...',
  'Drafting confidential suspect dossier...',
  'Sealing case file with server-side integrity hash...',
];

export const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIdx((prev) => (prev + 1) % DETECTIVE_STEPS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 animate-pulse">
          <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border border-amber-500/50 flex items-center justify-center text-amber-300">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      <h3 className="font-heading font-bold text-lg text-slate-100 tracking-wide mb-2">
        {message || 'Generating Mystery Case'}
      </h3>

      <div className="h-6 flex items-center justify-center">
        <p className="text-xs font-mono-code text-amber-400/90 transition-all">
          {DETECTIVE_STEPS[stepIdx]}
        </p>
      </div>

      <p className="text-xs text-slate-400 font-narrative mt-4 leading-relaxed max-w-sm">
        Our AI detective architect is crafting an airtight case where every clue links to forensic consistency.
      </p>
    </div>
  );
};

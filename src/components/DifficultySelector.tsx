import React from 'react';
import { DIFFICULTY_CONFIG, type DifficultyLevel } from '../../server/config/difficulty.ts';
import { Shield, Flame, Skull } from 'lucide-react';

interface DifficultySelectorProps {
  selected: DifficultyLevel;
  onChange: (diff: DifficultyLevel) => void;
  disabled?: boolean;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  selected,
  onChange,
  disabled = false,
}) => {
  const levels: Array<{
    key: DifficultyLevel;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    badge: string;
  }> = [
    {
      key: 'easy',
      label: 'Casual Inquest',
      icon: Shield,
      accentColor: 'border-emerald-500/40 hover:border-emerald-500',
      badge: 'Easy',
    },
    {
      key: 'medium',
      label: 'Classic Noir',
      icon: Flame,
      accentColor: 'border-amber-500/40 hover:border-amber-500',
      badge: 'Medium',
    },
    {
      key: 'hard',
      label: 'Master Conspiracy',
      icon: Skull,
      accentColor: 'border-rose-500/40 hover:border-rose-500',
      badge: 'Hard',
    },
  ];

  return (
    <div className="space-y-3">
      <label className="block text-xs font-mono-code uppercase tracking-wider text-slate-300">
        Investigation Difficulty Level
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {levels.map((lvl) => {
          const config = DIFFICULTY_CONFIG[lvl.key];
          const isSelected = selected === lvl.key;
          const Icon = lvl.icon;

          return (
            <button
              key={lvl.key}
              type="button"
              disabled={disabled}
              onClick={() => onChange(lvl.key)}
              className={`text-left p-4 rounded-lg border transition-all relative ${
                isSelected
                  ? 'bg-amber-950/25 border-amber-500/80 ring-1 ring-amber-500/50 shadow-lg'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded flex items-center justify-center ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-heading font-semibold text-sm text-slate-100">
                    {lvl.label}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono-code uppercase px-2 py-0.5 rounded ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {lvl.badge}
                </span>
              </div>

              <div className="text-xs text-slate-400 mb-3 font-narrative">
                {config.description}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono-code text-slate-400">
                <span>{config.suspects} suspects</span>
                <span>·</span>
                <span>{config.clues} clues</span>
                <span>·</span>
                <span className="text-amber-400/90">+{config.basePoints} pts</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

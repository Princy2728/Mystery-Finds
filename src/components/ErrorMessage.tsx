import React from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorMessageProps {
  title?: string;
  message: string;
  code?: string;
  onRetry?: () => void;
  homeLink?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Investigative Error Encountered',
  message,
  code,
  onRetry,
  homeLink = true,
}) => {
  return (
    <div className="max-w-lg mx-auto my-8 p-6 rounded-lg bg-rose-950/30 border border-rose-900/60 shadow-lg text-center">
      <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>

      <h3 className="font-heading font-bold text-base text-rose-200 uppercase tracking-wide mb-1">
        {title}
      </h3>

      {code && (
        <span className="inline-block text-[10px] font-mono-code uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 mb-3">
          Error Code: {code}
        </span>
      )}

      <p className="text-xs text-rose-200/90 font-narrative leading-relaxed mb-6">
        {message}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 text-xs font-semibold rounded bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Investigation</span>
          </button>
        )}

        <Link
          to="/create"
          className="px-4 py-2 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-all"
        >
          <span>Open New Case</span>
        </Link>

        {homeLink && (
          <Link
            to="/"
            className="px-4 py-2 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Precinct</span>
          </Link>
        )}
      </div>
    </div>
  );
};

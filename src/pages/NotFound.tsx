import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-800 text-amber-400 border border-slate-700 flex items-center justify-center mb-6">
        <FileQuestion className="w-8 h-8" />
      </div>

      <span className="text-xs font-mono-code uppercase tracking-widest text-amber-500 mb-2">
        Error 404 · Uncharted Territory
      </span>

      <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-100 mb-3">
        Case File Missing or Expunged
      </h1>

      <p className="text-xs sm:text-sm text-slate-400 font-narrative max-w-md mx-auto mb-8 leading-relaxed">
        The investigative dossier you are seeking does not exist in precinct records or has been archived under sealed classification.
      </p>

      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow transition-all flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>

        <Link
          to="/create"
          className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs uppercase tracking-wider transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Open New Case</span>
        </Link>
      </div>
    </div>
  );
};

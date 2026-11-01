import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { caseApi } from '../api/caseApi.ts';
import { CaseResult } from '../../server/services/serializers.ts';
import { LoadingState } from '../components/LoadingState.tsx';
import { ErrorMessage } from '../components/ErrorMessage.tsx';
import { ApiClientError } from '../api/axiosClient.ts';
import {
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Home,
  ShieldCheck,
  FileText,
  UserCheck,
  UserX,
  Lock,
} from 'lucide-react';

export const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<CaseResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiClientError | null>(null);

  const fetchResult = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await caseApi.getResult(id);
      setResult(data);
    } catch (err: unknown) {
      setError(err as ApiClientError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <LoadingState message="Unsealing Confidential Inquest Verdict & Solution..." />
      </div>
    );
  }

  // Handle case still open state (409 CASE_NOT_COMPLETED)
  if (error?.code === 'CASE_NOT_COMPLETED') {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-xl bg-[#121622] border border-amber-900/60 text-center shadow-xl">
        <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="font-heading font-bold text-lg text-slate-100 uppercase tracking-wide mb-2">
          Case Records Still Sealed
        </h2>
        <p className="text-xs text-slate-300 font-narrative mb-6 leading-relaxed">
          This investigation is currently active. The official solution and verdict are sealed until you deliver a formal accusation.
        </p>
        <Link
          to={`/investigation/${id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow transition-all"
        >
          <span>Return to Investigation Room</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <ErrorMessage
          title="Verdict Unobtainable"
          message={error?.message || 'Unable to retrieve case results.'}
          code={error?.code}
          onRetry={fetchResult}
        />
      </div>
    );
  }

  const isSuccess = result.verdict === 'correct';

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Verdict Banner */}
      <div
        className={`rounded-xl border p-8 shadow-2xl relative overflow-hidden ${
          isSuccess
            ? 'bg-gradient-to-b from-emerald-950/40 to-[#0e1416] border-emerald-500/50'
            : 'bg-gradient-to-b from-rose-950/40 to-[#140e10] border-rose-500/50'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center border shadow-inner shrink-0 ${
                isSuccess
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-9 h-9" />
              ) : (
                <XCircle className="w-9 h-9" />
              )}
            </div>

            <div>
              <span
                className={`text-[11px] font-mono-code uppercase tracking-widest font-bold block mb-1 ${
                  isSuccess ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                Official Case Outcome
              </span>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-100">
                {isSuccess ? 'CASE SOLVED — VERDICT CONFIRMED' : 'UNSOLVED — WRONGFUL ACCUSATION'}
              </h1>
              <p className="text-xs text-slate-400 font-mono-code mt-0.5">
                {result.title}
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right bg-slate-900/80 px-6 py-4 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono-code uppercase tracking-widest text-slate-400 block">
              Final Detective Bounty
            </span>
            <div className="font-mono-code font-extrabold text-3xl text-amber-400 mt-0.5">
              {result.score.final} <span className="text-sm font-normal text-slate-400">pts</span>
            </div>
          </div>
        </div>

        {/* Suspect Identification Cards */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono-code text-slate-400 uppercase mb-2">
              <UserX className="w-4 h-4 text-slate-400" />
              <span>Party You Indicted</span>
            </div>
            <div className="font-heading font-bold text-lg text-slate-100">
              {result.accusedSuspect.name}
            </div>
            <div className="text-xs font-mono-code text-slate-400">
              ID: {result.accusedSuspect.id}
            </div>
          </div>

          <div
            className={`p-4 rounded-lg border ${
              isSuccess
                ? 'bg-emerald-950/20 border-emerald-800/60'
                : 'bg-rose-950/20 border-rose-800/60'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-mono-code uppercase mb-2">
              <UserCheck className={`w-4 h-4 ${isSuccess ? 'text-emerald-400' : 'text-rose-400'}`} />
              <span className={isSuccess ? 'text-emerald-300' : 'text-rose-300'}>
                Actual Culprit Behind Crime
              </span>
            </div>
            <div className="font-heading font-bold text-lg text-slate-100">
              {result.culprit.name}
            </div>
            <div className="text-xs font-mono-code text-slate-400">
              ID: {result.culprit.id}
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown Table */}
      <div className="bg-[#101420] rounded-xl border border-slate-800 p-6 shadow-xl">
        <h3 className="font-heading font-bold text-base text-slate-100 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Precinct Scoring Breakdown</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono-code">
          <div className="p-4 rounded bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block mb-1">
              Base Bounty
            </span>
            <div className={`text-xl font-bold ${result.score.base > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
              +{result.score.base}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {isSuccess ? 'Accuracy Bonus' : 'Accusation missed'}
            </span>
          </div>

          <div className="p-4 rounded bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block mb-1">
              Evidence Logged
            </span>
            <div className="text-xl font-bold text-emerald-400">
              +{result.score.cluePoints}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {result.cluesDiscovered} clues × 5 pts
            </span>
          </div>

          <div className="p-4 rounded bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block mb-1">
              Hint Deductions
            </span>
            <div className="text-xl font-bold text-rose-400">
              -{result.score.hintPenalty}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {result.hintsUsed} hints × 10 pts
            </span>
          </div>

          <div className="p-4 rounded bg-amber-950/30 border border-amber-900/60">
            <span className="text-[10px] text-amber-400 uppercase block mb-1">
              Total Score
            </span>
            <div className="text-xl font-bold text-amber-300">
              {result.score.final}
            </div>
            <span className="text-[10px] text-amber-400/80 mt-1 block">
              Floor at 0 pts
            </span>
          </div>
        </div>
      </div>

      {/* Crime Reconstruction & Forensic Explanation */}
      <div className="bg-[#101420] rounded-xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code uppercase tracking-wider text-amber-500 mb-2">
            <FileText className="w-4 h-4" />
            <span>Forensic Case Reconstruction</span>
          </div>
          <h2 className="font-heading font-bold text-xl text-slate-100">
            How The Crime Occurred
          </h2>
          <p className="text-slate-200 font-narrative text-sm leading-relaxed mt-3 pl-4 border-l-2 border-amber-500/50 whitespace-pre-line">
            {result.explanation}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <h4 className="text-xs font-mono-code uppercase tracking-wider text-slate-300 mb-2">
            Deductive Reasoning Summary
          </h4>
          <p className="text-xs text-slate-300 font-narrative leading-relaxed bg-slate-900/60 p-4 rounded border border-slate-800">
            {result.reasoningSummary}
          </p>
        </div>

        {/* Supporting Physical Evidence Cards with Significance */}
        <div className="pt-4 border-t border-slate-800">
          <h4 className="font-heading font-bold text-base text-slate-100 uppercase tracking-wide mb-3">
            Decisive Physical Evidence & Significance
          </h4>
          <div className="space-y-3">
            {result.evidence.map((ev, idx) => (
              <div
                key={ev.id}
                className="p-4 rounded-lg bg-[#141824] border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono-code font-bold">
                      #{idx + 1}
                    </span>
                    <h5 className="font-heading font-semibold text-sm text-slate-100">
                      {ev.title}
                    </h5>
                  </div>
                  <span className="text-[10px] font-mono-code text-slate-400">
                    {ev.id}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-narrative leading-relaxed">
                  <strong className="text-slate-400">Content:</strong> {ev.content}
                </p>

                <div className="pt-2 border-t border-slate-800/80 text-xs font-narrative text-amber-300/90 bg-amber-950/20 p-2.5 rounded border border-amber-900/30">
                  <span className="text-[10px] font-mono-code uppercase text-amber-400 block mb-0.5">
                    Critical Significance:
                  </span>
                  {ev.significance}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-4">
        <Link
          to="/create"
          className="w-full sm:w-auto px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Investigate Another Case</span>
        </Link>

        <Link
          to="/"
          className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Return to Central Dispatch</span>
        </Link>
      </div>
    </div>
  );
};

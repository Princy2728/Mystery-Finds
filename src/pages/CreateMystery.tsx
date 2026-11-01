import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { DifficultyLevel } from '../../server/config/difficulty.ts';
import { DifficultySelector } from '../components/DifficultySelector.tsx';
import { LoadingState } from '../components/LoadingState.tsx';
import { ErrorMessage } from '../components/ErrorMessage.tsx';
import { caseApi } from '../api/caseApi.ts';
import { ApiClientError } from '../api/axiosClient.ts';
import { Sparkles, ArrowLeft, Lightbulb, FileText } from 'lucide-react';

const SAMPLE_PREMISES = [
  'During a stormy midnight gala at Blackwood Manor, Lord Alistair is found poisoned in his locked study, with a shattered antique glass beside him.',
  'An irreplaceable quantum cryptographic cipher key vanishes from the high-security subterranean vault of Neo-Gene Technologies during a 30-second system blackout.',
  'The head curator of the Royal Antiquities Museum is found unconscious next to an open display case; the Golden Scarab of Karnak has been replaced by an obsidian replica.',
  'At a remote alpine observatory cut off by an avalanche, the senior astrophysicist disappears just hours before announcing a classified discovery.',
];

export const CreateMystery: React.FC = () => {
  const navigate = useNavigate();
  const [premise, setPremise] = useState<string>('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const charCount = premise.trim().length;
  const isTooShort = charCount < 10;
  const isTooLong = charCount > 500;

  const handlePremiseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPremise(e.target.value);
    if (validationError) setValidationError(null);
  };

  const handleSelectSample = (sample: string) => {
    setPremise(sample);
    if (validationError) setValidationError(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isTooShort) {
      setValidationError('Premise must be at least 10 characters.');
      return;
    }
    if (isTooLong) {
      setValidationError('Premise cannot exceed 500 characters.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setValidationError(null);

    try {
      const createdCase = await caseApi.createCase(premise.trim(), difficulty);
      navigate(`/investigation/${createdCase.id}`);
    } catch (err: unknown) {
      setError(err as ApiClientError);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <LoadingState message="Drafting Confidential Case Dossier" />
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono-code text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Central Dispatch</span>
        </Link>
      </div>

      <div className="bg-[#10141f] rounded-xl border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="border-b border-slate-800 pb-5 mb-6">
          <div className="flex items-center gap-2 text-xs font-mono-code uppercase tracking-wider text-amber-500 mb-1">
            <FileText className="w-4 h-4" />
            <span>Case Commission Form #882</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-slate-100">
            Commission a New Mystery Case
          </h1>
          <p className="text-xs text-slate-400 font-narrative mt-1">
            Specify the crime premise and complexity. The AI engine will architect suspects, physical clues, hidden timelines, and a sealed culprit.
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMessage
              title="Mystery Generation Interrupted"
              message={error.message}
              code={error.code}
              onRetry={handleSubmit}
              homeLink={false}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Premise Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="case-premise"
                className="text-xs font-mono-code uppercase tracking-wider text-slate-300"
              >
                Mystery Incident Premise <span className="text-amber-500">*</span>
              </label>
              <span
                className={`text-xs font-mono-code ${
                  isTooShort
                    ? 'text-slate-400'
                    : isTooLong
                    ? 'text-rose-400 font-bold'
                    : 'text-emerald-400'
                }`}
              >
                {charCount} / 500 chars (min 10)
              </span>
            </div>

            <textarea
              id="case-premise"
              rows={4}
              value={premise}
              onChange={handlePremiseChange}
              placeholder="Describe the setting, the victim, the crime, or the valuable object that disappeared... (e.g. A priceless painting is stolen from a locked gallery during an electrical blackout.)"
              className={`w-full p-4 rounded-lg bg-slate-900/80 border text-slate-100 font-narrative text-sm leading-relaxed placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-all ${
                validationError
                  ? 'border-rose-500/80 focus:ring-rose-500'
                  : 'border-slate-800 focus:border-amber-500/80 focus:ring-amber-500/50'
              }`}
            />

            {validationError && (
              <p className="text-xs font-mono-code text-rose-400">
                {validationError}
              </p>
            )}

            {/* Inspiration Chips */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5 text-[11px] font-mono-code text-slate-400 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500/80" />
                <span>Need inspiration? Click a case brief:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PREMISES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="text-left text-xs font-narrative p-2.5 rounded bg-slate-900 hover:bg-slate-800/80 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                  >
                    "{sample.slice(0, 75)}..."
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Difficulty Selector */}
          <div className="pt-2 border-t border-slate-800/80">
            <DifficultySelector
              selected={difficulty}
              onChange={setDifficulty}
              disabled={isGenerating}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <Link
              to="/"
              className="text-xs font-mono-code text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel & Discard
            </Link>

            <button
              type="submit"
              disabled={isGenerating || isTooShort || isTooLong}
              className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              <span>Architect & Begin Investigation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

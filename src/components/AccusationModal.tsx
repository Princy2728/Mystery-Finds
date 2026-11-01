import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, X, Check, User } from 'lucide-react';

interface SuspectOption {
  id: string;
  name: string;
  background: string;
  motive: string;
}

interface AccusationModalProps {
  isOpen: boolean;
  onClose: () => void;
  suspects: SuspectOption[];
  onConfirmAccusation: (suspectId: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const AccusationModal: React.FC<AccusationModalProps> = ({
  isOpen,
  onClose,
  suspects,
  onConfirmAccusation,
  isSubmitting = false,
}) => {
  const [selectedSuspectId, setSelectedSuspectId] = useState<string>('');
  const [isConfirmedStep, setIsConfirmedStep] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedSuspect = suspects.find((s) => s.id === selectedSuspectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuspectId) {
      setErrorMsg('Please select a suspect to accuse.');
      return;
    }

    if (!isConfirmedStep) {
      setIsConfirmedStep(true);
      return;
    }

    setErrorMsg(null);
    try {
      await onConfirmAccusation(selectedSuspectId);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Failed to submit accusation.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="accusation-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative w-full max-w-xl bg-[#121520] border border-amber-900/60 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-amber-950/30 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="accusation-modal-title"
                className="font-heading font-bold text-base text-slate-100 uppercase tracking-wide"
              >
                Deliver Formal Accusation
              </h2>
              <span className="text-[10px] font-mono-code uppercase tracking-wider text-rose-400">
                Official Indictment Procedure
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="px-6 py-3 bg-rose-950/40 border-b border-rose-900/50 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-200 font-narrative">
            <strong className="font-semibold text-rose-300">Warning:</strong> This ends the investigation. Your verdict is final and cannot be undone. An erroneous accusation will award 0 base points.
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded bg-rose-950/60 border border-rose-800/80 text-xs text-rose-200">
              {errorMsg}
            </div>
          )}

          {!isConfirmedStep ? (
            <>
              <p className="text-xs text-slate-300 font-narrative">
                Select the individual you believe is responsible for the crime based on the gathered evidence:
              </p>

              <div className="space-y-2.5" role="radiogroup">
                {suspects.map((suspect) => {
                  const isChecked = selectedSuspectId === suspect.id;
                  return (
                    <label
                      key={suspect.id}
                      className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-amber-950/30 border-amber-500/80 ring-1 ring-amber-500/40'
                          : 'bg-slate-900/50 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="suspectAccusation"
                        value={suspect.id}
                        checked={isChecked}
                        onChange={() => {
                          setSelectedSuspectId(suspect.id);
                          setErrorMsg(null);
                        }}
                        className="mt-1 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-heading font-semibold text-sm text-slate-100">
                            {suspect.name}
                          </span>
                          <span className="text-[10px] font-mono-code text-slate-400">
                            {suspect.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-narrative mt-1 line-clamp-2">
                          Motive: {suspect.motive}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono-code uppercase text-slate-400">
                    Accused Party
                  </div>
                  <div className="font-heading font-bold text-base text-slate-100">
                    {selectedSuspect?.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    ID: {selectedSuspect?.id}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-900/50 text-xs text-amber-200 font-narrative space-y-2">
                <p>
                  Are you prepared to sign and submit this indictment against <strong>{selectedSuspect?.name}</strong>?
                </p>
                <p>
                  Upon submission, the sealed case records will be unsealed, the crime reconstructive findings will be evaluated, and your official detective rating will be computed.
                </p>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            {isConfirmedStep ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsConfirmedStep(false)}
                className="px-4 py-2 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                Change Suspect
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !selectedSuspectId}
              className="px-5 py-2 text-xs font-bold rounded bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Verdict...</span>
                </>
              ) : isConfirmedStep ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Execute Irrevocable Accusation</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Proceed to Confirmation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

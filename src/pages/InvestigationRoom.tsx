import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCase } from '../hooks/useCase.ts';
import { SuspectCard } from '../components/SuspectCard.tsx';
import { ClueCard } from '../components/ClueCard.tsx';
import { EvidenceLog } from '../components/EvidenceLog.tsx';
import { HintPanel } from '../components/HintPanel.tsx';
import { ScoreDisplay } from '../components/ScoreDisplay.tsx';
import { AccusationModal } from '../components/AccusationModal.tsx';
import { LoadingState } from '../components/LoadingState.tsx';
import { ErrorMessage } from '../components/ErrorMessage.tsx';
import { DIFFICULTY_CONFIG, type DifficultyLevel } from '../../server/config/difficulty.ts';
import {
  FileText,
  Users,
  Search,
  ShieldAlert,
  FolderOpen,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const InvestigationRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    caseData,
    loading,
    error,
    refetch,
    discoverClue,
    discoveringClueId,
    claimHint,
    requestingHint,
    accuseSuspect,
    submittingAccusation,
  } = useCase(id);

  const [isAccusationOpen, setIsAccusationOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'suspects' | 'clues' | 'evidence'>('clues');

  // If case is already completed, redirect to results
  useEffect(() => {
    if (caseData?.status === 'completed' && id) {
      navigate(`/results/${id}`, { replace: true });
    }
  }, [caseData?.status, id, navigate]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <LoadingState message="Retrieving Incident Dossier & Evidence Log..." />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <ErrorMessage
          title="Investigation File Inaccessible"
          message={error?.message || 'The requested case could not be opened.'}
          code={error?.code}
          onRetry={refetch}
        />
      </div>
    );
  }

  const difficultyConf = DIFFICULTY_CONFIG[caseData.difficulty as DifficultyLevel] || DIFFICULTY_CONFIG.medium;
  const discoveredClues = caseData.clues.filter((c) => c.discovered);

  const handleAccusationSubmit = async (suspectId: string) => {
    await accuseSuspect(suspectId);
    navigate(`/results/${id}`);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Case Header Banner */}
      <div className="bg-[#101420] rounded-xl border border-slate-800 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-code uppercase tracking-wider text-amber-500 mb-2">
              <FolderOpen className="w-4 h-4" />
              <span>Confidential Incident Dossier · Case ID: {caseData.id}</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-100 tracking-tight">
              {caseData.title}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono-code uppercase px-3 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {caseData.difficulty} Tier
            </span>

            <button
              type="button"
              onClick={() => setIsAccusationOpen(true)}
              className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Deliver Accusation</span>
            </button>
          </div>
        </div>

        {/* Premise & Story Narrative */}
        <div className="pt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono-code uppercase text-slate-400">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span>Initial Crime Scene Report</span>
            </div>
            <p className="text-slate-200 font-narrative text-sm sm:text-base leading-relaxed pl-4 border-l-2 border-amber-500/40 whitespace-pre-line">
              {caseData.story}
            </p>
          </div>

          <div className="bg-[#151926] rounded-lg p-5 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono-code uppercase text-slate-400 mb-2">
                Core Incident Premise
              </div>
              <p className="text-xs text-slate-300 font-narrative leading-relaxed italic">
                "{caseData.premise}"
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono-code text-slate-400 flex items-center justify-between">
              <span>Status: Active Inquest</span>
              <span>Logged: {new Date(caseData.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Investigation Panels & Sidebars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Suspects and Clues */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-2 p-1 bg-[#101420] rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('clues')}
              className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'clues'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Physical Clues ({caseData.progress.cluesDiscovered}/{caseData.progress.totalClues})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('suspects')}
              className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'suspects'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Persons of Interest ({caseData.suspects.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('evidence')}
              className={`flex-1 py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'evidence'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Discovery Log ({discoveredClues.length})</span>
            </button>
          </div>

          {/* Clues Tab View */}
          {activeTab === 'clues' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg text-slate-100 flex items-center gap-2">
                  <span>Physical Clues & Forensic Leads</span>
                </h3>
                <span className="text-xs font-mono-code text-slate-400">
                  Uncover sealed files to earn +5 pts each
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {caseData.clues.map((clue, idx) => (
                  <ClueCard
                    key={clue.id}
                    clue={clue}
                    index={idx}
                    onDiscover={discoverClue}
                    isDiscovering={discoveringClueId === clue.id}
                    disabled={caseData.status === 'completed'}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Suspects Tab View */}
          {activeTab === 'suspects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg text-slate-100">
                  Interrogation Dossiers
                </h3>
                <span className="text-xs font-mono-code text-slate-400">
                  All suspects held under formal inquiry
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {caseData.suspects.map((suspect, idx) => (
                  <SuspectCard
                    key={suspect.id}
                    id={suspect.id}
                    name={suspect.name}
                    background={suspect.background}
                    motive={suspect.motive}
                    alibi={suspect.alibi}
                    index={idx}
                    onAccuseClick={() => setIsAccusationOpen(true)}
                    disabled={caseData.status === 'completed'}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Evidence Docket Tab View */}
          {activeTab === 'evidence' && (
            <EvidenceLog
              discoveredClues={discoveredClues}
              totalClues={caseData.progress.totalClues}
            />
          )}
        </div>

        {/* Right Col: Score, Hints, and Call-to-Accuse */}
        <div className="space-y-6">
          {/* Live Score Display */}
          <ScoreDisplay
            cluesDiscovered={caseData.progress.cluesDiscovered}
            hintsUsed={caseData.progress.hintsUsed}
            currentPoints={caseData.progress.currentPoints}
            basePointsPotential={difficultyConf.basePoints}
          />

          {/* Sequential Hint Terminal */}
          <HintPanel
            hints={caseData.hints}
            hintsUsed={caseData.progress.hintsUsed}
            maxHints={caseData.progress.maxHints}
            hintsRemaining={caseData.progress.hintsRemaining}
            onRequestHint={claimHint}
            isRequesting={requestingHint}
            disabled={caseData.status === 'completed'}
          />

          {/* Accusation Callout */}
          <div className="p-5 rounded-lg bg-rose-950/20 border border-rose-900/40 text-center space-y-3">
            <h4 className="font-heading font-bold text-sm text-rose-200 uppercase tracking-wide">
              Ready to Name the Culprit?
            </h4>
            <p className="text-xs text-rose-200/80 font-narrative">
              Have you pieced together the contradictions in alibis and physical evidence?
            </p>
            <button
              type="button"
              onClick={() => setIsAccusationOpen(true)}
              className="w-full py-2.5 px-4 text-xs font-bold rounded bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Deliver Final Accusation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Accusation Modal */}
      <AccusationModal
        isOpen={isAccusationOpen}
        onClose={() => setIsAccusationOpen(false)}
        suspects={caseData.suspects}
        onConfirmAccusation={handleAccusationSubmit}
        isSubmitting={submittingAccusation}
      />
    </div>
  );
};

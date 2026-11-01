import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  ShieldCheck,
  Search,
  HelpCircle,
  Award,
  ChevronRight,
  Fingerprint,
  FileCheck,
  Lock,
} from 'lucide-react';
import { DIFFICULTY_CONFIG } from '../../server/config/difficulty.ts';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col noir-grid">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 border-b border-amber-900/20 overflow-hidden">
        <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono-code mb-6">
            <Fingerprint className="w-3.5 h-3.5" />
            <span>AI-POWERED DETECTIVE SIMULATION</span>
          </div>

          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl text-slate-100 tracking-tight mb-6 leading-tight">
            Every Clue Matters.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
              Every Suspect Has a Secret.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-narrative max-w-2xl mx-auto mb-10 leading-relaxed">
            Enter a world of AI-generated mysteries, investigate suspicious characters, uncover hidden evidence, and solve the case before the truth disappears.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/create"
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Start Investigating</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <a
              href="#how-to-play"
              className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-sm border border-slate-800 hover:border-slate-700 transition-all text-center"
            >
              How It Works
            </a>
          </div>
        </div>
      </section>

      {/* How to Play Section */}
      <section id="how-to-play" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-[#0d1017]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-mono-code uppercase tracking-widest text-amber-500">
              Precinct Field Protocol
            </span>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-slate-100 mt-2">
              Four Steps to Solving Any Crime
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Set Premise & Difficulty',
                desc: 'Provide your own crime premise or setting. Choose Casual, Classic Noir, or Master Conspiracy.',
                icon: Sparkles,
              },
              {
                step: '02',
                title: 'Interrogate Suspects',
                desc: 'Study dossier backgrounds, suspicious motives, and fragile alibis across all persons of interest.',
                icon: Search,
              },
              {
                step: '03',
                title: 'Discover Sealed Clues',
                desc: 'Uncover forensic evidence items one by one (+5 pts each). Seek sequential hints if stuck (-10 pts).',
                icon: HelpCircle,
              },
              {
                step: '04',
                title: 'Deliver Verdict',
                desc: 'File your irrevocable charge. Reveal the criminal reconstructive truth and claim your final detective bounty.',
                icon: Award,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="p-6 rounded-lg bg-[#121622] border border-slate-800 flex flex-col relative"
                >
                  <div className="font-mono-code font-bold text-3xl text-amber-500/30 mb-4">
                    {item.step}
                  </div>
                  <div className="w-9 h-9 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-heading font-semibold text-base text-slate-100 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-narrative leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Difficulty Overview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-mono-code uppercase tracking-widest text-amber-500">
              Investigation Tiers
            </span>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-slate-100 mt-2">
              Tailored Case Complexities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['easy', 'medium', 'hard'] as const).map((lvl) => {
              const conf = DIFFICULTY_CONFIG[lvl];
              const titleMap = {
                easy: 'Casual Inquest',
                medium: 'Classic Noir',
                hard: 'Master Conspiracy',
              };

              return (
                <div
                  key={lvl}
                  className="p-6 rounded-xl bg-[#121622] border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-heading font-bold text-lg text-slate-100">
                        {titleMap[lvl]}
                      </h3>
                      <span className="text-xs font-mono-code uppercase px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {lvl}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 font-narrative mb-6 leading-relaxed">
                      {conf.description}
                    </p>

                    <div className="space-y-2 text-xs font-mono-code text-slate-300 border-t border-slate-800/80 pt-4 mb-6">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Suspects:</span>
                        <span className="font-semibold">{conf.suspects} persons</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Forensic Clues:</span>
                        <span className="font-semibold">{conf.clues} items</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Available Hints:</span>
                        <span className="font-semibold">{conf.hints} allowances</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Base Bounty:</span>
                        <span className="font-semibold text-amber-400">+{conf.basePoints} pts</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/create"
                    className="w-full py-2.5 text-xs font-bold font-heading uppercase tracking-wider text-center rounded bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition-all"
                  >
                    Launch {lvl} Case
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#0a0d14]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm text-slate-100 mb-1">
                Zero Leaks Architecture
              </h4>
              <p className="text-xs text-slate-400 font-narrative leading-relaxed">
                The culprit ID and explanation never reach the browser client until an accusation is sealed and processed on the server.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm text-slate-100 mb-1">
                11-Point Consistency Engine
              </h4>
              <p className="text-xs text-slate-400 font-narrative leading-relaxed">
                Generated cases are subjected to rigorous structural tests ensuring solvability, no premature naming, and alibi integrity.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm text-slate-100 mb-1">
                Persistent Investigation
              </h4>
              <p className="text-xs text-slate-400 font-narrative leading-relaxed">
                Page refreshes and network blips will not erase your detective progress. Discovered clues and hints stay permanently logged.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

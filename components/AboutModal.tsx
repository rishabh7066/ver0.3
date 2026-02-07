
import React from 'react';
import { X, Info, Target, Cpu, Code2, Users, Github, Linkedin, Mail, ExternalLink, ShieldCheck, Trophy } from 'lucide-react';
import { ThemeMode } from '../types';
import clsx from 'clsx';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, theme }) => {
  if (!isOpen) return null;

  const panelBg = theme === 'black' ? "bg-black/95 border-slate-800" : theme === 'blue' ? "bg-slate-900/95 border-slate-700" : "bg-white/95 border-slate-200";
  const textColor = theme === 'white' ? "text-slate-900" : "text-white";
  const secondaryText = theme === 'white' ? "text-slate-600" : "text-slate-400";

  const highlights = [
    "Real-time sector risk analysis based on live weather parameters",
    "Location-based monitoring with interactive satellite map",
    "Smart risk scoring using environmental indicators",
    "Instant visibility of temperature, wind, rain, and humidity",
    "Designed for rapid response and preventive awareness"
  ];

  const techStack = ["React", "Node.js", "Supabase", "Weather APIs", "Mapbox", "Tailwind CSS"];

  return (
    <div className="fixed inset-0 z-[3500] flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" onClick={onClose}></div>
      
      <div className={clsx(
        "relative w-full max-w-4xl h-full sm:h-auto sm:max-h-[92vh] rounded-none sm:rounded-[2.5rem] shadow-2xl border overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-500",
        panelBg
      )}>
        {/* Tactical Background Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#00f2ff 1px, transparent 1px), linear-gradient(90deg, #00f2ff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

        {/* Header */}
        <div className="px-6 py-6 border-b border-white/5 flex justify-between items-center shrink-0 z-10 bg-inherit">
           <div className="flex items-center gap-3">
             <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-500 shadow-lg shadow-cyan-500/10"><Info className="w-6 h-6" /></div>
             <div>
                <h2 className={clsx("font-black text-xl tracking-widest uppercase", textColor)}>Project Intelligence</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Documentation // Ver 2.0.4</p>
             </div>
           </div>
           <button onClick={onClose} className="p-2.5 hover:bg-white/10 rounded-full transition-all active:scale-90"><X className="w-7 h-7 text-slate-400" /></button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-12 space-y-12 z-10 custom-scrollbar">
          
          {/* Section: Overview */}
          <section className="space-y-6">
            <div className="space-y-2">
               <h3 className="text-xs font-black uppercase tracking-[0.4em] text-cyan-500">About Predictive Sky-X</h3>
               <h1 className={clsx("text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-none", textColor)}>
                 The Intelligent <span className="text-cyan-500">Response Grid</span>
               </h1>
            </div>
            <p className={clsx("text-base sm:text-lg leading-relaxed font-medium opacity-90 border-l-4 border-cyan-500/30 pl-6", secondaryText)}>
              Predictive Sky-X is an intelligent disaster response grid that analyzes real-time environmental data to predict potential risk zones across regions. It empowers authorities and citizens with early insights, enabling faster, data-driven decisions during critical situations.
            </p>
          </section>

          {/* Section: Highlights & Tech Stack Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-cyan-500 flex items-center gap-2">
                <Target className="w-4 h-4" /> Key Highlights
              </h3>
              <ul className="space-y-4">
                {highlights.map((item, i) => (
                  <li key={i} className="flex gap-4 text-sm sm:text-base group">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500 font-black text-xs group-hover:bg-cyan-500 group-hover:text-white transition-all">0{i+1}</div>
                    <span className={clsx("mt-1", secondaryText)}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-purple-500 flex items-center gap-2">
                  <Cpu className="w-4 h-4" /> Technology Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech) => (
                    <span key={tech} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[11px] font-black uppercase tracking-widest hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-default">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-2">
                  <Trophy className="w-4 h-4" /> Built For
                </h3>
                <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                   <p className={clsx("text-sm font-bold leading-relaxed", secondaryText)}>
                     Hackathon Project focused on strengthening national disaster preparedness using predictive intelligence.
                   </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Development Team
                </h3>
                <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between">
                   <div>
                     <div className="font-black text-blue-500 uppercase tracking-widest text-xl">Techno Coder</div>
                     <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Lead System Architecture</div>
                   </div>
                   <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Code2 className="w-6 h-6 text-blue-500" />
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Strategic Mission */}
          <section className="relative p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-br from-cyan-600/10 to-blue-900/20 border border-cyan-500/20 text-center space-y-4 overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <ShieldCheck className="w-32 h-32 text-cyan-500" />
             </div>
             <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-500 relative z-10">Our Strategic Mission</h3>
             <p className={clsx("text-xl sm:text-2xl font-black italic relative z-10 max-w-2xl mx-auto leading-tight", textColor)}>
               "To make disaster awareness proactive, accessible, and data-driven for every region."
             </p>
          </section>

          {/* Section: Contact & Socials */}
          <section className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" /> System Links & Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a href="https://github.com/rishabh7066/hyperspace" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white transition-all group shadow-lg">
                <Github className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                <span className="text-xs font-black uppercase tracking-widest">GitHub</span>
              </a>
              <button className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-[#0077b5]/10 hover:bg-[#0077b5]/20 text-[#00a0dc] border border-[#0077b5]/20 transition-all group">
                <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                <span className="text-xs font-black uppercase tracking-widest">LinkedIn</span>
              </button>
              <button className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all group">
                <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                <span className="text-xs font-black uppercase tracking-widest">Email Intel</span>
              </button>
            </div>
          </section>
        </div>

        {/* Tactical Footer */}
        <div className={clsx("px-10 py-6 border-t flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0", theme === 'white' ? "bg-slate-50 border-slate-200" : "bg-black/40 border-white/5")}>
           <div className="flex items-center gap-3 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              National Disaster Response Grid // Operational
           </div>
           <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
             © 2026 Predictive Sky-X — National Disaster Response Grid
           </span>
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { X, Cpu, Globe, Shield, Zap, Code2, Layers, HeartPulse } from 'lucide-react';
import { ThemeMode } from '../types';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, theme }) => {
  
  const panelBg = theme === 'white' ? "bg-white border-slate-200" : "bg-slate-950 border-slate-800";
  const textColor = theme === 'white' ? "text-slate-900" : "text-white";
  const subTextColor = theme === 'white' ? "text-slate-500" : "text-slate-400";
  const cardBg = theme === 'white' ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/5";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            onClick={onClose}
          ></motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={clsx(
              "relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border flex flex-col custom-scrollbar",
              panelBg
            )}
          >
            {/* Header */}
            <div className="relative h-48 shrink-0 overflow-hidden bg-gradient-to-br from-indigo-900 to-slate-900 flex flex-col items-center justify-center text-center p-6">
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
               
               <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all z-20">
                 <X className="w-5 h-5" />
               </button>

               <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="relative z-10"
               >
                 <div className="inline-flex items-center justify-center p-3 bg-cyan-500/20 rounded-2xl mb-4 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                    <Globe className="w-8 h-8 text-cyan-400" />
                 </div>
                 <h2 className="text-3xl font-black text-white tracking-tight">PREDICTIVE SKY-X</h2>
                 <p className="text-cyan-400 text-xs font-bold uppercase tracking-[0.3em] mt-2">National Disaster Response Grid</p>
               </motion.div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
               
               {/* Vision Section */}
               <section className="text-center space-y-4">
                  <p className={clsx("text-sm leading-relaxed font-medium max-w-lg mx-auto", subTextColor)}>
                    An advanced AI-powered geospatial intelligence platform designed to predict, monitor, and mitigate natural disasters across the Indian subcontinent in real-time.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                     <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">v2.0 Alpha</span>
                     <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">Live Telemetry</span>
                  </div>
               </section>

               {/* Core Capabilities Grid */}
               <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={clsx("p-5 rounded-2xl border transition-all hover:scale-[1.02]", cardBg)}>
                     <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Cpu className="w-5 h-5" /></div>
                        <h3 className={clsx("font-bold text-sm", textColor)}>Gemini 1.5 Pro AI</h3>
                     </div>
                     <p className="text-xs text-slate-500 leading-relaxed">
                        Utilizes Google's latest multimodal models to analyze satellite imagery and weather patterns for hyper-local risk assessment.
                     </p>
                  </div>
                  <div className={clsx("p-5 rounded-2xl border transition-all hover:scale-[1.02]", cardBg)}>
                     <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><Zap className="w-5 h-5" /></div>
                        <h3 className={clsx("font-bold text-sm", textColor)}>Real-time Response</h3>
                     </div>
                     <p className="text-xs text-slate-500 leading-relaxed">
                        Sub-second latency updates for critical alerts regarding floods, cyclones, and heatwaves directly to field responders.
                     </p>
                  </div>
                  <div className={clsx("p-5 rounded-2xl border transition-all hover:scale-[1.02]", cardBg)}>
                     <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Layers className="w-5 h-5" /></div>
                        <h3 className={clsx("font-bold text-sm", textColor)}>Data Fusion</h3>
                     </div>
                     <p className="text-xs text-slate-500 leading-relaxed">
                        Synthesizes data from INSAT-3DR, Sentinel-2, and ground sensors into a unified tactical dashboard.
                     </p>
                  </div>
                  <div className={clsx("p-5 rounded-2xl border transition-all hover:scale-[1.02]", cardBg)}>
                     <div className="p-2 bg-red-500/10 rounded-lg text-red-500 mb-3 w-fit"><HeartPulse className="w-5 h-5" /></div>
                     <h3 className={clsx("font-bold text-sm mb-1", textColor)}>Public Safety First</h3>
                     <p className="text-xs text-slate-500 leading-relaxed">
                        Integrated SOS protocols and multilingual safety guides to empower communities during crises.
                     </p>
                  </div>
               </section>

               {/* Tech Stack Footer */}
               <section className="border-t border-slate-500/10 pt-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                     <Code2 className="w-3 h-3" /> System Architecture
                  </h4>
                  <div className="flex flex-wrap gap-2">
                     {['Next.js 14', 'React 18', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Leaflet Maps', 'Framer Motion', 'Google Cloud Run'].map((tech) => (
                        <span key={tech} className={clsx(
                           "px-2.5 py-1 rounded-md text-[10px] font-mono border",
                           theme === 'white' ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-slate-900 text-slate-400 border-slate-800"
                        )}>
                           {tech}
                        </span>
                     ))}
                  </div>
               </section>

               <div className="text-center pt-4">
                  <p className="text-[10px] text-slate-600 italic">
                     "Predicting the Unpredictable. Protecting the Vulnerable."
                  </p>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

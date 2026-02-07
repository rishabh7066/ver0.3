
import React from 'react';
import { X, Palette, Globe, CheckCircle2, Monitor, Layout, ShieldCheck, ShieldAlert, ChevronRight } from 'lucide-react';
import { ThemeMode, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import clsx from 'clsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onOpenSafety: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, theme, setTheme, language, setLanguage, onOpenSafety }) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[language];

  const languages: {id: Language, label: string, native: string}[] = [
    { id: 'en', label: 'English', native: 'English' },
    { id: 'hi', label: 'Hindi', native: 'हिंदी' },
    { id: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { id: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  ];

  const themes: {id: ThemeMode, label: string, color: string}[] = [
    { id: 'black', label: 'OLED Black', color: 'bg-black border-slate-800' },
    { id: 'blue', label: 'Tactical Blue', color: 'bg-slate-900 border-slate-700' },
    { id: 'white', label: 'Daylight White', color: 'bg-white border-slate-200' },
  ];

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={clsx(
        "relative w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden flex flex-col animate-in zoom-in-95",
        theme === 'black' ? "bg-black border-slate-800 text-white" :
        theme === 'blue' ? "bg-slate-900 border-slate-700 text-slate-100" :
        "bg-white border-slate-200 text-slate-900"
      )}>
        <div className={clsx("px-6 py-4 border-b flex justify-between items-center", theme === 'white' ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10")}>
           <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-cyan-500" />
              <h2 className="text-lg font-bold">{t.settings}</h2>
           </div>
           <button onClick={onClose} className="p-1.5 hover:bg-black/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
          <section className="space-y-4">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <Globe className="w-3 h-3" /> {t.language}
             </div>
             <div className="grid grid-cols-2 gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id)}
                    className={clsx(
                      "p-3 rounded-xl border text-left transition-all relative flex flex-col",
                      language === lang.id ? "ring-2 ring-cyan-500 border-cyan-500 bg-cyan-500/5" : "hover:border-slate-500 bg-white/5",
                      theme === 'white' && "bg-slate-50"
                    )}
                  >
                    <span className="text-sm font-bold">{lang.native}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{lang.label}</span>
                    {language === lang.id && <CheckCircle2 className="w-4 h-4 absolute top-3 right-3 text-cyan-500" />}
                  </button>
                ))}
             </div>
          </section>

          <section className="space-y-4">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <Layout className="w-3 h-3" /> {t.theme}
             </div>
             <div className="grid grid-cols-3 gap-3">
                {themes.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    className={clsx(
                      "p-2 rounded-xl border transition-all text-center flex flex-col items-center gap-2",
                      theme === th.id ? "ring-2 ring-cyan-500 border-cyan-500" : "hover:border-slate-500"
                    )}
                  >
                    <div className={clsx("w-full h-12 rounded-lg border", th.color)}></div>
                    <span className="text-[10px] font-bold uppercase">{th.label}</span>
                  </button>
                ))}
             </div>
          </section>

          <section className="space-y-4">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <ShieldAlert className="w-3 h-3" /> Safety & Emergency
             </div>
             <button 
               onClick={() => { onClose(); onOpenSafety(); }}
               className={clsx(
                 "w-full p-4 rounded-xl border flex items-center justify-between group transition-all",
                 theme === 'white' ? "bg-red-50 hover:bg-red-100 border-red-200" : "bg-red-500/5 hover:bg-red-500/10 border-red-500/20"
               )}
             >
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-red-500/20 rounded-lg text-red-500"><ShieldAlert className="w-5 h-5" /></div>
                   <div className="text-left">
                      <div className="text-sm font-bold">{t.safetyGuide}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Do's & Don'ts for Disasters</div>
                   </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
             </button>
          </section>
        </div>

        <div className={clsx("px-6 py-4 border-t flex justify-center", theme === 'white' ? "bg-slate-50 border-slate-200" : "bg-black/40 border-white/10")}>
           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
              <ShieldCheck className="w-3 h-3 text-cyan-500" /> Powered by Predictive Sky Core Engine
           </div>
        </div>
      </div>
    </div>
  );
};

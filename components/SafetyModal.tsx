
import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, Phone, LifeBuoy, Zap, Droplets, Flame, Sun } from 'lucide-react';
import { ThemeMode, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import clsx from 'clsx';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  language: Language;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({ isOpen, onClose, theme, language }) => {
  const [activeTab, setActiveTab] = useState<'flood' | 'cyclone' | 'fire' | 'heatwave' | 'sos'>('flood');
  const t = TRANSLATIONS[language];

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'flood': return <Droplets className="w-5 h-5" />;
      case 'cyclone': return <Zap className="w-5 h-5" />;
      case 'fire': return <Flame className="w-5 h-5" />;
      case 'heatwave': return <Sun className="w-5 h-5" />;
      default: return <Phone className="w-5 h-5" />;
    }
  };

  const renderTabContent = () => {
    if (activeTab === 'sos') {
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
             <LifeBuoy className="w-5 h-5 text-emerald-500" /> {t.emergencyMeasures}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {Object.entries(t.sosNumbers).map(([key, num]) => (
               <div key={key} className={clsx("p-4 rounded-xl border flex items-center justify-between", theme === 'white' ? "bg-slate-100 border-slate-200" : "bg-white/5 border-white/10")}>
                  <div>
                     <div className="text-[10px] uppercase font-bold text-slate-500">{key}</div>
                     <div className="text-xl font-bold text-cyan-500">{num as string}</div>
                  </div>
                  <a href={`tel:${num}`} className="p-3 bg-cyan-600 rounded-full text-white hover:bg-cyan-500 transition-all">
                     <Phone className="w-5 h-5" />
                  </a>
               </div>
             ))}
          </div>
          <div className={clsx("p-4 rounded-xl border-l-4 border-amber-500", theme === 'white' ? "bg-amber-50" : "bg-amber-500/10")}>
             <h4 className="font-bold text-amber-500 mb-2">Emergency Kit Checklist</h4>
             <ul className="text-sm space-y-1 list-disc list-inside text-slate-500">
                <li>Water (3 days supply)</li>
                <li>Non-perishable food</li>
                <li>First aid kit & medicines</li>
                <li>Flashlight & extra batteries</li>
                <li>Battery-powered radio</li>
             </ul>
          </div>
        </div>
      );
    }

    const content = t.safetyContent[activeTab];
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        <h3 className="text-2xl font-bold">{content.title}</h3>
        
        <div className="space-y-4">
           <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase tracking-widest text-xs">
              <CheckCircle2 className="w-4 h-4" /> Do's
           </div>
           <div className="grid gap-3">
              {content.dos.map((item: string, i: number) => (
                <div key={i} className={clsx("p-3 rounded-lg border-l-4 border-emerald-500 text-sm", theme === 'white' ? "bg-emerald-50 border-emerald-100" : "bg-emerald-500/5 border-emerald-500/20")}>
                   {item}
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-4">
           <div className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-widest text-xs">
              <AlertTriangle className="w-4 h-4" /> Don'ts
           </div>
           <div className="grid gap-3">
              {content.donts.map((item: string, i: number) => (
                <div key={i} className={clsx("p-3 rounded-lg border-l-4 border-red-500 text-sm", theme === 'white' ? "bg-red-50 border-red-100" : "bg-red-500/5 border-red-500/20")}>
                   {item}
                </div>
              ))}
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={clsx(
        "relative w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl border overflow-hidden flex flex-col animate-in zoom-in-95",
        theme === 'black' ? "bg-black border-slate-800 text-white" :
        theme === 'blue' ? "bg-slate-900 border-slate-700 text-slate-100" :
        "bg-white border-slate-200 text-slate-900"
      )}>
        <div className={clsx("px-6 py-4 border-b flex justify-between items-center", theme === 'white' ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10")}>
           <div className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-bold">{t.safetyGuide}</h2>
           </div>
           <button onClick={onClose} className="p-1.5 hover:bg-black/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className={clsx("w-16 md:w-48 border-r flex flex-col", theme === 'white' ? "bg-slate-50 border-slate-200" : "bg-black/20 border-white/10")}>
             {['flood', 'cyclone', 'fire', 'heatwave', 'sos'].map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab as any)}
                 className={clsx(
                   "flex items-center gap-3 p-4 transition-all relative",
                   activeTab === tab ? 
                   (theme === 'white' ? "bg-white text-cyan-600 border-r-2 border-cyan-500 shadow-sm" : "bg-white/5 text-cyan-400 border-r-2 border-cyan-500") 
                   : "text-slate-500 hover:text-slate-300"
                 )}
               >
                 {getIcon(tab)}
                 <span className="hidden md:inline text-sm font-bold capitalize">
                   {tab === 'sos' ? t.emergencyMeasures.split(' ')[0] : tab}
                 </span>
               </button>
             ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

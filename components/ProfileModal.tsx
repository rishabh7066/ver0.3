
import React from 'react';
import { X, Mail, Shield, Activity, Map } from 'lucide-react';
import { User, ThemeMode, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import clsx from 'clsx';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdate: (user: User) => void;
  theme: ThemeMode;
  language: Language;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, theme, language }) => {
  const t = TRANSLATIONS[language];

  if (!isOpen || !user) return null;

  const panelBg = theme === 'white' ? "bg-white border-slate-200" : "bg-slate-950 border-slate-800";
  const textColor = theme === 'white' ? "text-slate-900" : "text-white";

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className={clsx(
        "relative w-full max-w-md rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border overflow-hidden flex flex-col animate-in zoom-in-95 transition-all",
        panelBg
      )}>
        
        {/* Header Section */}
        <div className="h-48 bg-gradient-to-b from-cyan-600 to-blue-800 relative flex flex-col items-center justify-center overflow-hidden">
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
           
           <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-all z-10">
             <X className="w-5 h-5" />
           </button>
           
           <div className="relative group z-10">
              <div className="w-28 h-28 rounded-full bg-slate-900 p-1 shadow-2xl overflow-hidden border-4 border-cyan-500/50 relative">
                 <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover bg-slate-100" />
              </div>
           </div>
        </div>

        {/* User Details */}
        <div className="p-8 space-y-6">
           <div className="text-center">
              <h2 className={clsx("text-2xl font-black uppercase tracking-tight", textColor)}>{user.name}</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1 mt-1">
                 <Shield className="w-3 h-3" /> System ID: {user.id.slice(-8)}
              </p>
           </div>

           <div className="space-y-4">
              <div className={clsx("p-4 rounded-2xl border flex items-center gap-4", theme === 'white' ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/5")}>
                <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-500"><Mail className="w-5 h-5" /></div>
                <div>
                    <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider mb-0.5">Verified Contact</p>
                    <p className="text-sm font-bold truncate max-w-[240px]">{user.email}</p>
                </div>
              </div>
              <div className={clsx("p-4 rounded-2xl border flex items-center gap-4", theme === 'white' ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/5")}>
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><Activity className="w-5 h-5" /></div>
                <div>
                    <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider mb-0.5">Operational Level</p>
                    <p className="text-sm font-bold">Standard Responder</p>
                </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className={clsx("p-4 rounded-2xl border text-center", theme === 'white' ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/5")}>
                <Map className="w-5 h-5 mx-auto mb-1 text-cyan-500" />
                <div className="text-xl font-black">12</div>
                <div className="text-[8px] uppercase text-slate-500 font-black tracking-widest">Reports</div>
              </div>
              <div className={clsx("p-4 rounded-2xl border text-center", theme === 'white' ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/5")}>
                <Shield className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                <div className="text-xl font-black">LVL 1</div>
                <div className="text-[8px] uppercase text-slate-500 font-black tracking-widest">Clearance</div>
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-4 bg-black/20 text-center">
            <p className="text-[9px] text-slate-600 font-mono tracking-widest uppercase">PREDICTIVE SKY-X // NODAL SECURITY</p>
        </div>
      </div>
    </div>
  );
};

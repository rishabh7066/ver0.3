
import React, { useState, useCallback, useEffect } from 'react';
import InteractiveMap from './components/InteractiveMap';
import DashboardPanel from './components/DashboardPanel';
import { SearchBar } from './components/SearchBar';
import { AuthModal } from './components/AuthModal';
import { AdminModal } from './components/AdminModal';
import { ProfileModal } from './components/ProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { SafetyModal } from './components/SafetyModal';
import { AboutModal } from './components/AboutModal';
import { ChatWidget } from './components/ChatWidget';
import { GeoLocation, LocationReport, User, ThemeMode, Language } from './types';
import { fetchRealWeather } from './services/weatherService';
import { getActiveSession, logout, subscribeToAuthChanges } from './services/authService';
import { TRANSLATIONS } from './constants';
import { CloudLightning, LogIn, LogOut, ChevronDown, Database, User as UserIcon, Settings as SettingsIcon, Activity, ShieldAlert, Info } from 'lucide-react';
import clsx from 'clsx';

const App: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<LocationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState<GeoLocation | null>(null);
  const [theme, setTheme] = useState<ThemeMode>('blue');
  const [language, setLanguage] = useState<Language>('en');

  // Auth & UI States
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((u) => {
      setUser(prev => {
        if (prev?.id === u?.id) return prev;
        return u;
      });
      if (window.location.hash && window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    });

    const initAuth = async () => {
      try {
        const sessionUser = await getActiveSession();
        if (sessionUser) {
           setUser(prev => prev?.id === sessionUser.id ? prev : sessionUser);
        }
      } catch (e) {
        console.error("Failed to restore session", e);
      }
    };
    initAuth();

    return () => { unsubscribe(); };
  }, []);

  const handleLocationSelect = useCallback(async (loc: GeoLocation) => {
    setSelectedLoc(loc);
    setLoading(true);
    setSelectedReport(null);
    const report = await fetchRealWeather(loc.lat, loc.lng, loc.name);
    setTimeout(() => {
        setSelectedReport(report);
        setLoading(false);
    }, 600);
  }, []);

  const closeDashboard = () => {
    setSelectedReport(null);
    setLoading(false);
    setSelectedLoc(null);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setIsUserMenuOpen(false);
  };

  const handleUserUpdate = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  return (
    <div className={clsx(
      "h-screen w-screen flex flex-col overflow-hidden transition-colors duration-500",
      theme === 'black' ? "bg-black text-white" :
      theme === 'blue' ? "bg-slate-950 text-white" :
      "bg-slate-50 text-slate-900"
    )}>
      
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onAuthSuccess={setUser} />
      <AdminModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} onUserUpdate={handleUserUpdate} theme={theme} language={language} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} theme={theme} setTheme={setTheme} language={language} setLanguage={setLanguage} onOpenSafety={() => setIsSafetyOpen(true)} />
      <SafetyModal isOpen={isSafetyOpen} onClose={() => setIsSafetyOpen(false)} theme={theme} language={language} />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} theme={theme} />

      <header className={clsx(
        "h-16 flex items-center justify-between px-4 md:px-6 backdrop-blur-md border-b z-40 absolute top-0 w-full shadow-lg transition-all duration-300",
        theme === 'black' ? "bg-black/90 border-slate-800 text-white" :
        theme === 'blue' ? "bg-slate-900/90 border-slate-800 text-white" :
        "bg-white/90 border-slate-200 text-slate-900"
      )}>
        <div className="flex items-center gap-3 w-fit shrink-0">
          <div className={clsx("p-2 rounded-lg border", theme === 'white' ? "bg-cyan-50 border-cyan-100" : "bg-cyan-500/10 border-cyan-500/20")}>
            <CloudLightning className="w-6 h-6 text-cyan-500" />
          </div>
          <div className="cursor-pointer" onClick={() => setIsAboutOpen(true)}>
            <h1 className="font-bold text-lg md:text-xl tracking-tight leading-tight">
              {t.appTitle.split('-')[0]}<span className="text-cyan-500">-{t.appTitle.split('-')[1]}</span>
            </h1>
            <p className="text-[9px] md:text-[10px] text-slate-500 uppercase tracking-widest font-semibold hidden sm:block">
              {t.subtitle}
            </p>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-4">
           <SearchBar onLocationSelect={handleLocationSelect} theme={theme} language={language} />
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
           {/* Quick Access Info / Safety */}
           <div className="hidden lg:flex items-center gap-2">
              <button 
                onClick={() => setIsAboutOpen(true)}
                className={clsx(
                  "p-2 rounded-lg border transition-all",
                  theme === 'white' ? "bg-slate-50 border-slate-200 text-slate-500 hover:text-cyan-500" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-cyan-400"
                )}
                title="Mission Brief"
              >
                <Info className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setIsSafetyOpen(true)}
                className={clsx(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all",
                  theme === 'white' ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100" : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                )}
              >
                  <ShieldAlert className="w-4 h-4" />
                  <span className="hidden xl:inline">{t.safetyGuide.toUpperCase()}</span>
              </button>
           </div>

           <div className={clsx(
             "hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-colors",
             theme === 'white' ? "bg-slate-100 border-slate-200 text-emerald-600" : "bg-slate-800 border-slate-700 text-emerald-400"
           )}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {t.liveStream}
           </div>
           
           {user ? (
             <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={clsx(
                    "flex items-center gap-2 pl-2 pr-3 py-1.5 border rounded-full transition-all",
                    theme === 'white' ? "bg-slate-100 hover:bg-slate-200 border-slate-200" : "bg-slate-800 hover:bg-slate-700 border-slate-700"
                  )}
                >
                   <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-full border border-slate-600 object-cover bg-slate-100" />
                   <span className="text-xs font-bold hidden sm:block truncate max-w-[100px]">{user.name}</span>
                   <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                {isUserMenuOpen && (
                  <div className={clsx(
                    "absolute top-full right-0 mt-2 w-56 border rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50",
                    theme === 'white' ? "bg-white border-slate-200 text-slate-700" : "bg-slate-900 border-slate-700 text-slate-300"
                  )}>
                     <button onClick={() => { setIsProfileOpen(true); setIsUserMenuOpen(false); }} className={clsx("w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-2 border-b", theme === 'white' ? "hover:bg-slate-50 border-slate-100" : "hover:bg-slate-800 border-slate-800")}>
                        <UserIcon className="w-4 h-4 text-cyan-500" /> {t.profile}
                     </button>
                     <button onClick={() => { setIsAboutOpen(true); setIsUserMenuOpen(false); }} className={clsx("w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-2 border-b", theme === 'white' ? "hover:bg-slate-50 border-slate-100" : "hover:bg-slate-800 border-slate-800")}>
                        <Info className="w-4 h-4 text-cyan-400" /> About Sky-X
                     </button>
                     <button onClick={() => { setIsSafetyOpen(true); setIsUserMenuOpen(false); }} className={clsx("w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-2 border-b", theme === 'white' ? "hover:bg-slate-50 border-slate-100" : "hover:bg-slate-800 border-slate-800")}>
                        <ShieldAlert className="w-4 h-4 text-red-500" /> {t.safetyGuide}
                     </button>
                     <button onClick={() => { setIsSettingsOpen(true); setIsUserMenuOpen(false); }} className={clsx("w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-2 border-b", theme === 'white' ? "hover:bg-slate-50 border-slate-100" : "hover:bg-slate-800 border-slate-800")}>
                        <SettingsIcon className="w-4 h-4 text-slate-400" /> {t.settings}
                     </button>
                     <button onClick={() => { setIsAdminOpen(true); setIsUserMenuOpen(false); }} className={clsx("w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-2 border-b", theme === 'white' ? "hover:bg-slate-50 border-slate-100" : "hover:bg-slate-800 border-slate-800")}>
                        <Database className="w-4 h-4 text-purple-400" /> {t.database}
                     </button>
                     <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/5 transition-colors flex items-center gap-2">
                        <LogOut className="w-4 h-4" /> {t.signOut}
                     </button>
                  </div>
                )}
             </div>
           ) : (
             <div className="flex items-center gap-2">
                <button onClick={() => setIsAboutOpen(true)} className="p-2 text-slate-400 hover:text-cyan-400 transition-colors hidden sm:block">
                   <Info className="w-5 h-5" />
                </button>
                <button onClick={() => setIsAuthOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 rounded-lg text-xs font-bold transition-all uppercase tracking-wide">
                    <LogIn className="w-4 h-4" /> Sign In
                </button>
             </div>
           )}
        </div>
      </header>

      <main className="flex-1 relative">
        <InteractiveMap onLocationSelect={handleLocationSelect} selectedLocation={selectedLoc} theme={theme} />
        <DashboardPanel report={selectedReport} loading={loading} onClose={closeDashboard} theme={theme} language={language} />
        
        {!selectedReport && !loading && (
          <div className="absolute top-24 left-6 z-40 space-y-2 hidden xl:block">
            <div className={clsx(
              "backdrop-blur-xl p-4 rounded-lg border w-64 shadow-2xl transition-all duration-300",
              theme === 'white' ? "bg-white/80 border-slate-200" : "bg-slate-900/90 border-slate-700"
            )}>
              <div className={clsx("flex items-center gap-2 mb-3 border-b pb-2", theme === 'white' ? "border-slate-100" : "border-slate-700")}>
                 <Activity className="w-4 h-4 text-cyan-500" />
                 <h3 className="font-bold text-sm">{t.satInputs}</h3>
              </div>
              <div className="space-y-3">
                {['INSAT-3DR', 'Sentinel-2', 'Himawari-9', 'Meteosat-9'].map((sat) => (
                  <div key={sat} className="flex justify-between items-center group cursor-default">
                    <div>
                      <div className={clsx("text-xs font-bold group-hover:text-cyan-400 transition-colors", theme === 'white' ? "text-slate-700" : "text-slate-300")}>{sat}</div>
                      <div className="text-[10px] text-slate-500">Live Telemetry</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <ChatWidget report={selectedReport} theme={theme} language={language} />
      </main>
    </div>
  );
};

export default App;

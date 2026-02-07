
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Map as MapIcon, X, History, Trash2 } from 'lucide-react';
import { GeoLocation, ThemeMode, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface SearchBarProps {
  onLocationSelect: (loc: GeoLocation) => void;
  theme: ThemeMode;
  language: Language;
}

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
  admin2?: string;
  feature_code?: string;
  population?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onLocationSelect, theme, language }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language];

  // Load recent searches on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sky_x_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load recent searches", e);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) { setResults([]); return; }
      setLoading(true);
      try {
        // Increased count to 100 to catch smaller NE towns
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=100&language=en&format=json`);
        const data = await res.json();
        
        if (data.results) {
          // Strict Filter: India Only
          let indianLocations = data.results.filter((item: GeocodingResult) => item.country_code === 'IN');
          
          // Smart Sorting for North East Visibility
          // Prioritizes: Exact Name Match -> State Capitals (PPLA/ADM1) -> Population
          indianLocations.sort((a: GeocodingResult, b: GeocodingResult) => {
             const aExact = a.name.toLowerCase() === query.toLowerCase();
             const bExact = b.name.toLowerCase() === query.toLowerCase();
             if (aExact && !bExact) return -1;
             if (!aExact && bExact) return 1;

             const aIsMajor = a.feature_code === 'ADM1' || a.feature_code === 'PPLA';
             const bIsMajor = b.feature_code === 'ADM1' || b.feature_code === 'PPLA';
             if (aIsMajor && !bIsMajor) return -1;
             if (!aIsMajor && bIsMajor) return 1;

             return (b.population || 0) - (a.population || 0);
          });

          setResults(indianLocations.slice(0, 15)); 
          setShowDropdown(true);
        } else {
          setResults([]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addToHistory = (result: GeocodingResult) => {
    const newHistory = [result, ...recentSearches.filter(r => r.id !== result.id)].slice(0, 5);
    setRecentSearches(newHistory);
    localStorage.setItem('sky_x_recent_searches', JSON.stringify(newHistory));
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('sky_x_recent_searches');
  };

  const handleSelect = (result: GeocodingResult) => {
    addToHistory(result);
    const isState = result.feature_code === 'ADM1';
    // Better name formatting
    const fullName = isState 
        ? `${result.name}, India (State)` 
        : `${result.name}, ${result.admin1 || ''}`;
        
    onLocationSelect({ lat: result.latitude, lng: result.longitude, name: fullName });
    setQuery(fullName);
    setShowDropdown(false);
  };

  const inputBg = theme === 'white' ? "bg-slate-100 border-slate-200 text-slate-900" : "bg-slate-800/50 border-slate-700 text-slate-100";
  const dropdownBg = theme === 'white' ? "bg-white border-slate-200" : "bg-slate-900/95 border-slate-700";

  return (
    <div ref={wrapperRef} className="relative w-full max-w-sm mx-auto md:mx-0">
       <div className="relative group">
         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
           <Search className="h-4 w-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
         </div>
         <input 
           type="text" value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => setShowDropdown(true)}
           placeholder={t.searchPlaceholder}
           className={clsx("block w-full pl-10 pr-10 py-2 border rounded-full leading-5 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all sm:text-sm", inputBg)}
         />
         <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {loading ? <Loader2 className="h-4 w-4 text-cyan-500 animate-spin" /> : query.length > 0 ? (
               <button onClick={() => { setQuery(''); setResults([]); }} className="text-slate-500 hover:text-white"><X className="h-4 w-4" /></button>
            ) : null}
         </div>
       </div>

       <AnimatePresence>
       {showDropdown && (results.length > 0 || (query === '' && recentSearches.length > 0)) && (
         <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={clsx("absolute top-full mt-2 w-full backdrop-blur-xl border rounded-xl shadow-2xl overflow-hidden z-[100]", dropdownBg)}
         >
            <ul className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
              {query === '' && recentSearches.length > 0 && (
                <>
                  <li className={clsx("px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 flex justify-between items-center border-b", theme === 'white' ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/5")}>
                     <span className="flex items-center gap-1.5"><History className="w-3 h-3" /> Recent Searches</span>
                     <button onClick={clearHistory} className="hover:text-red-400 transition-colors p-1 rounded-md hover:bg-white/10" title="Clear History"><Trash2 className="w-3 h-3" /></button>
                  </li>
                  {recentSearches.map((res) => {
                    const isState = res.feature_code === 'ADM1';
                    return (
                      <motion.li 
                        key={`recent-${res.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <button onClick={() => handleSelect(res)} className={clsx("w-full text-left px-4 py-3 hover:bg-cyan-500/10 flex items-center gap-3 group border-b last:border-0 transition-colors", theme === 'white' ? "border-slate-100" : "border-slate-800/50")}>
                          <div className={clsx("p-2 rounded-lg transition-colors", theme === 'white' ? "bg-slate-200 text-slate-500" : "bg-slate-800 text-slate-500 group-hover:text-cyan-400")}>
                             <History className="w-4 h-4" />
                          </div>
                          <div>
                            <div className={clsx("text-sm font-medium flex items-center gap-2", theme === 'white' ? "text-slate-800" : "text-slate-200")}>
                                {res.name}
                                {isState && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 rounded border border-purple-500/30">STATE</span>}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                                {res.admin1 && !isState ? res.admin1 : res.country}
                            </div>
                          </div>
                        </button>
                      </motion.li>
                    );
                  })}
                  <li className={clsx("px-4 py-1.5 text-[10px] font-medium text-slate-500 text-center border-t", theme === 'white' ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/5")}>
                     Results from History
                  </li>
                </>
              )}
              {results.map((res) => {
                const isState = res.feature_code === 'ADM1';
                return (
                  <motion.li 
                    key={res.id}
                    layout
                  >
                    <button onClick={() => handleSelect(res)} className={clsx("w-full text-left px-4 py-3 hover:bg-cyan-500/10 flex items-center gap-3 group border-b last:border-0 transition-colors", theme === 'white' ? "border-slate-100" : "border-slate-800/50")}>
                      <div className={clsx("p-2 rounded-lg transition-colors", isState ? "bg-purple-500/20 text-purple-400" : "bg-slate-800 text-slate-400 group-hover:text-cyan-400")}>
                         {isState ? <MapIcon className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className={clsx("text-sm font-medium flex items-center gap-2", theme === 'white' ? "text-slate-800" : "text-slate-200")}>
                            {res.name}
                            {isState && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 rounded border border-purple-500/30">STATE</span>}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                            {res.admin1 && !isState ? res.admin1 : res.country}
                        </div>
                      </div>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
         </motion.div>
       )}
       </AnimatePresence>
    </div>
  );
};
    
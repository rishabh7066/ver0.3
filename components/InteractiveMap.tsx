
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, ZoomControl, Circle } from 'react-leaflet';
import { INDIA_CENTER, DEFAULT_ZOOM, HOTSPOTS } from '../constants';
import { GeoLocation, LocationReport, RiskLevel, ThemeMode } from '../types';
import { fetchRealWeather } from '../services/weatherService';
import { Locate, Loader2, Layers, Eye, Thermometer, Droplets, ScanLine, Check, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import clsx from 'clsx';

const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};
fixLeafletIcons();

interface InteractiveMapProps {
  onLocationSelect: (loc: GeoLocation) => void;
  selectedLocation: GeoLocation | null;
  theme: ThemeMode;
}

const SATELLITE_BANDS = [
  { id: 'vis', name: 'Visible (VIS)', description: 'True Color Optical', filter: 'none', icon: Eye },
  { id: 'ir', name: 'Infrared (SWIR)', description: 'Vegetation Analysis', filter: 'invert(1) hue-rotate(180deg) saturate(1.5)', icon: ScanLine },
  { id: 'wv', name: 'Water Vapour', description: 'Moisture Tracking', filter: 'grayscale(100%) sepia(100%) hue-rotate(190deg) saturate(300%) contrast(1.2)', icon: Droplets },
  { id: 'tir', name: 'Thermal (TIR)', description: 'Heat Signature', filter: 'contrast(125%) hue-rotate(45deg) saturate(200%)', icon: Thermometer },
];

const DISASTER_ICONS: Record<string, string> = {
  'Flood': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`,
  'Cyclone': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/></svg>`,
  'Heatwave': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/><path d="M12 9a4 4 0 0 0-2 7.5"/><path d="M12 3v2"/></svg>`,
  'Fire': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3.3.7 3.7 4.4 4.5 5.9 3.8z"/></svg>`,
  'Safe': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
  'Unknown': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`
};

const MapEvents = ({ onSelect }: { onSelect: (loc: GeoLocation) => void }) => {
  useMapEvents({ click(e) { onSelect({ lat: e.latlng.lat, lng: e.latlng.lng }); } });
  return null;
};

const MapUpdater = ({ center }: { center: GeoLocation | null }) => {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo([center.lat, center.lng], 10, { animate: true, duration: 1.5 }); }, [center, map]);
  return null;
};

const createRiskIcon = (level: RiskLevel, type: string) => {
  const isSafe = level === RiskLevel.SAFE;
  
  // Colors & Styles
  let bgColor = 'bg-emerald-500';
  let shadowColor = 'shadow-emerald-500/50';
  let ringColor = 'border-emerald-400';
  
  if (level === RiskLevel.EMERGENCY) {
    bgColor = 'bg-red-500';
    shadowColor = 'shadow-red-500/50';
    ringColor = 'border-red-400';
  } else if (level === RiskLevel.WATCH) {
    bgColor = 'bg-amber-500';
    shadowColor = 'shadow-amber-500/50';
    ringColor = 'border-amber-400';
  }

  // Determine Icon
  let iconKey = type;
  if (type === 'None' || !DISASTER_ICONS[type]) {
    iconKey = isSafe ? 'Safe' : 'Unknown';
  }

  const iconSvg = DISASTER_ICONS[iconKey] || DISASTER_ICONS['Unknown'];
  
  const size = isSafe ? 28 : 42; 
  const iconSize = isSafe ? 14 : 22;

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-full h-full group perspective-1000">
        ${!isSafe ? `<span class="absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping ${bgColor}"></span>` : ''}
        
        <div class="relative flex items-center justify-center rounded-full border-2 border-white shadow-xl ${bgColor} ${shadowColor} ${ringColor} transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1" style="width: ${size}px; height: ${size}px;">
           <div class="text-white drop-shadow-md" style="width: ${iconSize}px; height: ${iconSize}px;">
             ${iconSvg}
           </div>
        </div>

        <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900/90 text-white text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700/50 shadow-2xl z-[9999] uppercase tracking-wider backdrop-blur-sm pointer-events-none transform translate-y-2 group-hover:translate-y-0 duration-200">
          ${level === RiskLevel.SAFE ? 'Sector Secure' : `${type} Alert`}
          <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900/90 rotate-45 border-t border-l border-slate-700/50"></div>
        </div>
      </div>
    `,
    className: 'bg-transparent',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({ onLocationSelect, selectedLocation, theme }) => {
  const [hotspotRisks, setHotspotRisks] = useState<LocationReport[]>([]);
  const [locating, setLocating] = useState(false);
  const [activeBand, setActiveBand] = useState('vis');
  const [isBandMenuOpen, setIsBandMenuOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Periodic Data Refresh
  useEffect(() => {
    let isMounted = true;
    const REFRESH_INTERVAL = 30000; // 30 seconds

    const loadRisks = async () => {
      try {
        // Fetch weather for all hotspots to simulate live grid monitoring
        const results = await Promise.all(HOTSPOTS.map(spot => fetchRealWeather(spot.lat, spot.lng, spot.name)));
        
        if (isMounted) {
          setHotspotRisks(results);
          setLastUpdated(new Date());
        }
      } catch (err) {
        console.error("Auto-refresh failed", err);
      }
    };

    loadRisks(); // Initial load
    const intervalId = setInterval(loadRisks, REFRESH_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleLocateMe = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { onLocationSelect({ lat: pos.coords.latitude, lng: pos.coords.longitude, name: "Local Sector" }); setLocating(false); },
      () => setLocating(false)
    );
  };

  const currentBand = SATELLITE_BANDS.find(b => b.id === activeBand) || SATELLITE_BANDS[0];

  return (
    <div className="h-full w-full relative z-0 group">
      {/* Inject Dynamic CSS for Tile Filters */}
      <style>
        {`
          .leaflet-tile-container img {
            transition: filter 0.8s ease-in-out;
            filter: ${currentBand.filter} !important;
          }
        `}
      </style>

      {/* Live Status Indicator */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
        className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] px-4 py-1.5 rounded-full backdrop-blur-md bg-black/40 border border-emerald-500/30 flex items-center gap-2 shadow-lg pointer-events-none"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-widest flex items-center gap-2">
          Live Grid Active <span className="text-slate-500">|</span> {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </span>
      </motion.div>

      <MapContainer 
        center={[INDIA_CENTER.lat, INDIA_CENTER.lng]} 
        zoom={DEFAULT_ZOOM} 
        className="h-full w-full" 
        style={{ background: '#020617' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        
        <TileLayer 
          attribution='&copy; ESRI Satellite' 
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
        />
        
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" opacity={0.4} />
        
        <MapEvents onSelect={onLocationSelect} />
        <MapUpdater center={selectedLocation} />

        {hotspotRisks.map((report) => (
          <Marker 
            key={report.id} 
            position={[report.location.lat, report.location.lng]} 
            icon={createRiskIcon(report.risk.level, report.risk.type)} 
            eventHandlers={{ click: () => onLocationSelect({ lat: report.location.lat, lng: report.location.lng, name: report.location.name }) }} 
          />
        ))}

        {selectedLocation && (
           <Circle 
             center={[selectedLocation.lat, selectedLocation.lng]} 
             radius={50000} 
             pathOptions={{ color: '#06b6d4', fillColor: '#06b6d4', fillOpacity: 0.1, weight: 1, dashArray: '5, 5' }}
           />
        )}
      </MapContainer>
      
      {/* Satellite Band Controls */}
      <div className="absolute top-24 right-6 z-[1000] flex flex-col items-end">
        <motion.button 
           whileTap={{ scale: 0.95 }}
           onClick={() => setIsBandMenuOpen(!isBandMenuOpen)}
           className={clsx(
             "flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md border shadow-xl transition-all",
             theme === 'white' ? "bg-white/90 border-slate-200 text-slate-700" : "bg-slate-900/80 border-slate-700 text-cyan-400"
           )}
        >
           <Layers className="w-4 h-4" />
           <span className="text-xs font-bold uppercase tracking-wider">{currentBand.name}</span>
        </motion.button>

        <AnimatePresence>
          {isBandMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={clsx(
                "mt-2 w-64 rounded-xl border backdrop-blur-xl shadow-2xl p-2",
                theme === 'white' ? "bg-white/95 border-slate-200" : "bg-slate-950/90 border-slate-800"
              )}
            >
               <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-500/10 mb-1">
                  Select Spectral Band
               </div>
               <div className="space-y-1">
                 {SATELLITE_BANDS.map((band) => {
                   const Icon = band.icon;
                   const isActive = activeBand === band.id;
                   return (
                     <button
                       key={band.id}
                       onClick={() => { setActiveBand(band.id); setIsBandMenuOpen(false); }}
                       className={clsx(
                         "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                         isActive 
                           ? (theme === 'white' ? "bg-slate-100 text-cyan-600" : "bg-cyan-500/10 text-cyan-400") 
                           : (theme === 'white' ? "text-slate-600 hover:bg-slate-50" : "text-slate-400 hover:bg-white/5")
                       )}
                     >
                       <div className={clsx("p-2 rounded-md", isActive ? "bg-cyan-500/20" : "bg-slate-500/10")}>
                          <Icon className="w-4 h-4" />
                       </div>
                       <div className="flex-1">
                          <div className="text-xs font-bold">{band.name}</div>
                          <div className="text-[9px] opacity-70">{band.description}</div>
                       </div>
                       {isActive && <Check className="w-3 h-3 text-cyan-500" />}
                     </button>
                   );
                 })}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleLocateMe} 
        disabled={locating} 
        className="absolute bottom-6 right-6 z-[1000] p-3 rounded-xl bg-slate-900/90 border border-white/10 text-cyan-400 shadow-2xl backdrop-blur-md hover:bg-slate-800 transition-all"
      >
         {locating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Locate className="w-5 h-5" />}
      </motion.button>
    </div>
  );
};

export default InteractiveMap;
    
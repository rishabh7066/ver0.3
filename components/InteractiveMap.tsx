
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, ZoomControl, Circle } from 'react-leaflet';
import { INDIA_CENTER, DEFAULT_ZOOM, HOTSPOTS } from '../constants';
import { GeoLocation, LocationReport, RiskLevel, ThemeMode } from '../types';
import { fetchRealWeather } from '../services/weatherService';
import { Locate, Loader2, Layers, Eye, Thermometer, Droplets, ScanLine, Check } from 'lucide-react';
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

const MapEvents = ({ onSelect }: { onSelect: (loc: GeoLocation) => void }) => {
  useMapEvents({ click(e) { onSelect({ lat: e.latlng.lat, lng: e.latlng.lng }); } });
  return null;
};

const MapUpdater = ({ center }: { center: GeoLocation | null }) => {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo([center.lat, center.lng], 10, { animate: true, duration: 1.5 }); }, [center, map]);
  return null;
};

const createRiskIcon = (level: RiskLevel) => {
  const color = level === RiskLevel.EMERGENCY ? '#ef4444' : level === RiskLevel.WATCH ? '#f59e0b' : '#10b981';
  const size = level === RiskLevel.SAFE ? 12 : 24;
  
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute inset-0 bg-[${color}] rounded-full opacity-20 animate-ping"></div>
        <div class="w-${size/4} h-${size/4} bg-[${color}] rounded-full border-2 border-white shadow-[0_0_10px_${color}]"></div>
      </div>
    `,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({ onLocationSelect, selectedLocation, theme }) => {
  const [hotspotRisks, setHotspotRisks] = useState<LocationReport[]>([]);
  const [locating, setLocating] = useState(false);
  const [activeBand, setActiveBand] = useState('vis');
  const [isBandMenuOpen, setIsBandMenuOpen] = useState(false);

  useEffect(() => {
    const loadRisks = async () => {
      const results = await Promise.all(HOTSPOTS.map(spot => fetchRealWeather(spot.lat, spot.lng, spot.name)));
      setHotspotRisks(results);
    };
    loadRisks();
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
            icon={createRiskIcon(report.risk.level)} 
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
        <button 
           onClick={() => setIsBandMenuOpen(!isBandMenuOpen)}
           className={clsx(
             "flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md border shadow-xl transition-all hover:scale-105 active:scale-95",
             theme === 'white' ? "bg-white/90 border-slate-200 text-slate-700" : "bg-slate-900/80 border-slate-700 text-cyan-400"
           )}
        >
           <Layers className="w-4 h-4" />
           <span className="text-xs font-bold uppercase tracking-wider">{currentBand.name}</span>
        </button>

        {isBandMenuOpen && (
          <div className={clsx(
            "mt-2 w-64 rounded-xl border backdrop-blur-xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-4",
            theme === 'white' ? "bg-white/95 border-slate-200" : "bg-slate-950/90 border-slate-800"
          )}>
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
          </div>
        )}
      </div>

      <button 
        onClick={handleLocateMe} 
        disabled={locating} 
        className="absolute bottom-6 right-6 z-[1000] p-3 rounded-xl bg-slate-900/90 border border-white/10 text-cyan-400 shadow-2xl backdrop-blur-md hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
      >
         {locating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Locate className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default InteractiveMap;

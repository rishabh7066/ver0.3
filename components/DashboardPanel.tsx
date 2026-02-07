
import React, { useState, useEffect, useRef } from 'react';
import { LocationReport, GeminiInsight, RiskLevel, ThemeMode, Language, HazardAnalysisResult, ClimateRiskSummary } from '../types';
import { generateDisasterInsight, detectSafetyHazards, generateClimateRiskSummary } from '../services/geminiService';
import { WeatherChart } from './Charts';
import { TRANSLATIONS } from '../constants';
import { 
  Wind, 
  Droplets, 
  Thermometer, 
  CloudRain, 
  Bot, 
  Loader2,
  X,
  MapPin,
  Cpu,
  Sparkles,
  FileText,
  Database,
  Camera,
  AlertTriangle,
  HardHat,
  ChevronRight,
  Info,
  History,
  TrendingUp,
  Sun
} from 'lucide-react';
import clsx from 'clsx';

interface DashboardPanelProps {
  report: LocationReport | null;
  onClose: () => void;
  loading: boolean;
  theme: ThemeMode;
  language: Language;
}

const DashboardPanel: React.FC<DashboardPanelProps> = ({ report, onClose, loading, theme, language }) => {
  const [insight, setInsight] = useState<GeminiInsight | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Climate Summary State
  const [climateSummary, setClimateSummary] = useState<ClimateRiskSummary | null>(null);
  const [fetchingSummary, setFetchingSummary] = useState(false);
  const [activeTab, setActiveTab] = useState<'main' | 'summary'>('main');

  // Hazard Detection State
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [hazardResult, setHazardResult] = useState<HazardAnalysisResult | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[language];

  useEffect(() => { 
    setInsight(null); 
    setHazardResult(null);
    setPreviewImage(null);
    setClimateSummary(null);
    setActiveTab('main');
  }, [report]);

  const handleRunAI = async () => {
    if (!report) return;
    setAnalyzing(true);
    const result = await generateDisasterInsight(report);
    setInsight(result);
    setAnalyzing(false);
  };

  const handleFetchSummary = async () => {
    if (!report) return;
    setFetchingSummary(true);
    const result = await generateClimateRiskSummary(report);
    setClimateSummary(result);
    setFetchingSummary(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setPreviewImage(base64);
      setAnalyzingImage(true);
      setHazardResult(null);
      try {
        const result = await detectSafetyHazards(base64);
        setHazardResult(result);
      } catch (err) {
        console.error(err);
      } finally {
        setAnalyzingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!report && !loading) return null;

  const panelBg = theme === 'black' ? "bg-black/95 border-slate-800" : theme === 'blue' ? "bg-slate-900/95 border-slate-700" : "bg-white/95 border-slate-200";
  const textColor = theme === 'white' ? "text-slate-900" : "text-white";

  return (
    <>
      <div className={clsx(
        "fixed top-0 right-0 h-full w-full md:w-[480px] backdrop-blur-3xl border-l shadow-2xl transition-transform duration-500 z-50 overflow-y-auto flex flex-col",
        panelBg, (report || loading) ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-5 border-b border-white/5 flex justify-between items-center sticky top-0 bg-inherit z-10 shrink-0">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-cyan-500/10 rounded-lg"><Cpu className="text-cyan-400 w-5 h-5" /></div>
             <h2 className={clsx("font-bold text-lg tracking-tight", textColor)}>{t.sectorAnalysis}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-500">
             <Loader2 className="w-12 h-12 animate-spin mb-4 text-cyan-500" />
             <p className="font-mono text-xs tracking-widest uppercase italic text-center">Synchronizing Tactical Data...</p>
          </div>
        ) : report ? (
          <div className="flex-1">
            {/* Tabs Selector */}
            <div className="px-6 pt-4 flex gap-2">
              <button 
                onClick={() => setActiveTab('main')}
                className={clsx(
                  "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                  activeTab === 'main' ? "bg-cyan-500 text-white shadow-lg" : "bg-white/5 text-slate-500 hover:text-slate-300"
                )}
              >
                Analysis
              </button>
              <button 
                onClick={() => {
                  setActiveTab('summary');
                  if (!climateSummary && !fetchingSummary) handleFetchSummary();
                }}
                className={clsx(
                  "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2",
                  activeTab === 'summary' ? "bg-indigo-600 text-white shadow-lg" : "bg-white/5 text-slate-500 hover:text-slate-300"
                )}
              >
                <History className="w-3 h-3" /> Summary
              </button>
            </div>

            <div className="p-6 space-y-6 pb-20">
              {activeTab === 'main' ? (
                <>
                  {/* Header Info */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <h1 className={clsx("text-2xl font-black tracking-tight uppercase", textColor)}>
                          {report.location.name || "Unknown Sector"}
                        </h1>
                        <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-slate-500">
                          <MapPin className="w-3 h-3 text-cyan-500" />
                          {report.location.lat.toFixed(4)}N / {report.location.lng.toFixed(4)}E
                        </div>
                    </div>
                    <div className={clsx(
                      "px-3 py-1 rounded border font-mono text-xs",
                      report.risk.level === RiskLevel.EMERGENCY ? "bg-red-500/10 border-red-500/30 text-red-500" :
                      report.risk.level === RiskLevel.WATCH ? "bg-amber-500/10 border-amber-500/30 text-amber-500" :
                      "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                    )}>
                        {report.risk.level}
                    </div>
                  </div>

                  {/* Risk Score */}
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t.riskScore}</h3>
                        <span className="text-2xl font-black text-cyan-400 font-mono">{(report.risk.score * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={clsx("h-full transition-all duration-1000", report.risk.level === RiskLevel.EMERGENCY ? "bg-red-500" : "bg-cyan-500")}
                          style={{ width: `${report.risk.score * 100}%` }}
                        ></div>
                    </div>
                  </div>

                  {/* Weather Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                        <div className="flex items-center gap-2 text-slate-500 mb-2">
                          <Thermometer className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{t.temp}</span>
                        </div>
                        <div className={clsx("text-xl font-black", textColor)}>{report.currentWeather.temp}°C</div>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                        <div className="flex items-center gap-2 text-slate-500 mb-2">
                          <Wind className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{t.wind}</span>
                        </div>
                        <div className={clsx("text-xl font-black", textColor)}>{report.currentWeather.windSpeed} km/h</div>
                    </div>
                  </div>

                  {/* Visual Hazard Analysis Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-500 flex items-center gap-2">
                        <Camera className="w-4 h-4" /> Visual Hazard Analysis
                      </h3>
                    </div>

                    <div className={clsx(
                      "p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer relative group overflow-hidden",
                      previewImage ? "border-cyan-500/30 bg-cyan-500/5" : "border-slate-700 hover:border-cyan-500/50 bg-slate-800/20"
                    )} onClick={() => fileInputRef.current?.click()}>
                      <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageUpload} />
                      
                      {previewImage ? (
                        <div className="relative aspect-video rounded-xl overflow-hidden">
                          <img src={previewImage} alt="Hazard Source" className="w-full h-full object-cover" />
                          {analyzingImage && (
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                              <Loader2 className="w-8 h-8 animate-spin mb-2 text-cyan-400" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Scanning Infrastructure...</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-8 flex flex-col items-center justify-center gap-3">
                          <div className="p-3 bg-cyan-500/10 rounded-full text-cyan-500 group-hover:scale-110 transition-transform">
                              <Camera className="w-6 h-6" />
                          </div>
                          <div className="text-center">
                              <div className="text-xs font-bold text-slate-300">Upload Infrastructure Photo</div>
                              <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Detect Pits, Drains & Broken Roads</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {hazardResult && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                            <div className="flex items-center gap-2 text-amber-500 mb-2">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Hazard Report Summary</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed italic">"{hazardResult.overallSummary}"</p>
                        </div>

                        {hazardResult.hazards.map((hazard, idx) => (
                          <div key={idx} className={clsx(
                            "p-4 rounded-2xl border flex gap-4 transition-all hover:bg-white/5",
                            hazard.severity === 'High' ? "border-red-500/30 bg-red-500/5" : 
                            hazard.severity === 'Medium' ? "border-amber-500/30 bg-amber-500/5" : "border-slate-700 bg-slate-800/30"
                          )}>
                              <div className={clsx(
                                "p-2.5 h-fit rounded-xl shrink-0",
                                hazard.severity === 'High' ? "bg-red-500/20 text-red-500" :
                                hazard.severity === 'Medium' ? "bg-amber-500/20 text-amber-500" : "bg-slate-700/50 text-slate-400"
                              )}>
                                <HardHat className="w-5 h-5" />
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="text-sm font-bold">{hazard.type}</h4>
                                      <div className="text-[9px] text-slate-500 font-mono flex items-center gap-1 uppercase">
                                          <MapPin className="w-2.5 h-2.5" /> {hazard.locationInImage}
                                      </div>
                                    </div>
                                    <span className={clsx(
                                      "text-[8px] font-black uppercase px-2 py-0.5 rounded border",
                                      hazard.severity === 'High' ? "bg-red-500/20 border-red-500/20 text-red-500" :
                                      hazard.severity === 'Medium' ? "bg-amber-500/20 border-amber-500/20 text-amber-500" : "bg-slate-500/20 border-slate-500/20 text-slate-400"
                                    )}>{hazard.severity} SEVERITY</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-snug">{hazard.reason}</p>
                                <div className="flex items-center gap-2">
                                    <span className={clsx(
                                      "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter",
                                      hazard.classification === 'Man-Made' ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    )}>{hazard.classification}</span>
                                </div>
                              </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="h-48 bg-white/5 border border-white/5 rounded-2xl p-4">
                    <WeatherChart data={report.timelineData} />
                  </div>

                  <div className="space-y-4 pt-4">
                    {!insight ? (
                      <button 
                        onClick={handleRunAI} 
                        disabled={analyzing} 
                        className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-cyan-900/20"
                      >
                        {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Bot className="w-5 h-5" /> {t.geminiAnalysis}</>}
                      </button>
                    ) : (
                      <div className="bg-cyan-900/20 border border-cyan-500/30 p-5 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-cyan-400" />
                            <h3 className="font-bold text-sm uppercase text-cyan-400 tracking-wider">Gemini Strategic Intel</h3>
                          </div>
                          <p className="text-slate-300 text-sm leading-relaxed mb-4">{insight.analysis}</p>
                          <div className="space-y-2">
                            {insight.recommendations.map((rec, i) => (
                              <div key={i} className="flex gap-3 text-xs text-slate-400 bg-white/5 p-2 rounded-lg">
                                  <span className="text-cyan-500 font-bold">•</span>
                                  {rec}
                              </div>
                            ))}
                          </div>
                      </div>
                    )}

                    <button
                        onClick={() => setShowDetails(true)}
                        className="w-full mt-4 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                    >
                        <FileText className="w-4 h-4" /> Comprehensive Telemetry
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                  {/* Summary Title */}
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <History className="w-6 h-6 text-indigo-400" />
                    <div>
                      <h2 className={clsx("text-xl font-black uppercase tracking-tight", textColor)}>Disaster-Risk Assessment</h2>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Historical 5-Year Patterns</p>
                    </div>
                  </div>

                  {fetchingSummary ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                      <p className="text-xs font-mono uppercase tracking-widest text-slate-500">Querying Risk Engine...</p>
                    </div>
                  ) : climateSummary ? (
                    <div className="space-y-10">
                      {/* Section 1: Disaster Probabilities */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-400">
                           <TrendingUp className="w-4 h-4" />
                           <h3 className="text-xs font-black uppercase tracking-[0.2em]">Disaster Probabilities</h3>
                        </div>
                        <div className="space-y-3 font-mono">
                          {[
                            { label: 'Flood', data: climateSummary.flood, color: 'text-blue-400' },
                            { label: 'Drought', data: climateSummary.drought, color: 'text-orange-400' },
                            { label: 'Landslide', data: climateSummary.landslide, color: 'text-emerald-400' },
                            { label: 'Heatwave', data: climateSummary.heatwave, color: 'text-red-400' },
                          ].map((risk) => (
                            <div key={risk.label} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                              <span className="text-xs font-bold uppercase tracking-tight">{risk.label} Probability:</span>
                              <div className="text-right">
                                <span className={clsx("text-sm font-black", risk.color)}>{risk.data.probability.toFixed(2)}</span>
                                <span className="ml-2 text-[10px] font-bold text-slate-500">({risk.data.risk})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section 2: Recent 5-Year Summary */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-400">
                           <FileText className="w-4 h-4" />
                           <h3 className="text-xs font-black uppercase tracking-[0.2em]">Recent 5-Year Summary</h3>
                        </div>
                        <div className="space-y-3">
                          {[
                            { label: 'Flood', text: climateSummary.recentSummary.flood },
                            { label: 'Drought', text: climateSummary.recentSummary.drought },
                            { label: 'Landslide', text: climateSummary.recentSummary.landslide },
                            { label: 'Heatwave', text: climateSummary.recentSummary.heatwave },
                          ].map((item) => (
                            <div key={item.label} className="flex gap-3 items-start px-2">
                              <span className="text-indigo-500 font-black mt-0.5">-</span>
                              <div className="text-sm leading-relaxed">
                                <span className="font-bold text-slate-400 mr-1">{item.label}:</span>
                                <span className="text-slate-300">{item.text}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-start gap-3">
                        <Info className="w-5 h-5 text-indigo-400 mt-0.5" />
                        <p className="text-[10px] text-indigo-300 leading-relaxed italic uppercase font-bold tracking-tight">
                          Dashboard-style risk output with minimal historical context to support user understanding.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-20 text-center">
                      <button 
                        onClick={handleFetchSummary}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-indigo-900/20"
                      >
                        Generate Assessment
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {showDetails && report && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in" onClick={() => setShowDetails(false)}>
          <div
            className={clsx(
              "w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-[2rem] border shadow-2xl animate-in zoom-in-95",
              theme === 'white' ? "bg-white border-slate-200" : "bg-slate-950 border-slate-800"
            )}
            onClick={e => e.stopPropagation()}
          >
            <div className={clsx("p-6 border-b sticky top-0 backdrop-blur-md z-10 flex justify-between items-center", theme === 'white' ? "bg-white/90 border-slate-200" : "bg-slate-950/90 border-slate-800")}>
              <div className="flex items-center gap-2">
                 <Database className="w-5 h-5 text-cyan-500" />
                 <h3 className={clsx("font-bold text-lg", textColor)}>System Telemetry Archive</h3>
              </div>
              <button onClick={() => setShowDetails(false)} className="p-2 hover:bg-slate-500/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-8 space-y-8">
               <section>
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-4 border-b border-slate-500/10 pb-2">Geographic Profile</h4>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 font-mono font-bold">SECTOR ID</span>
                        <span className={clsx("font-mono font-bold", textColor)}>{report.id}</span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 font-mono font-bold">COORDINATES</span>
                        <span className={clsx("font-mono font-bold", textColor)}>{report.location.lat.toFixed(6)}, {report.location.lng.toFixed(6)}</span>
                     </div>
                  </div>
               </section>
               
               <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                  <p className="text-xs text-blue-300 leading-relaxed italic">The above report represents a high-fidelity fusion of real-time IMD weather streams and Predictive Sky-X orbital analysis. Use for strategic planning and public safety response.</p>
               </div>
            </div>
             <div className={clsx("p-5 border-t text-center", theme === 'white' ? "bg-slate-50 border-slate-200" : "bg-black/20 border-slate-800")}>
                 <span className="text-[10px] text-slate-500 font-mono tracking-widest">PREDICTIVE SKY-X // NODAL RESPONSE GRID ALPHA</span>
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardPanel;

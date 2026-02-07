
export enum RiskLevel {
  SAFE = 'Safe',
  WATCH = 'Watch',
  EMERGENCY = 'Emergency'
}

export type ThemeMode = 'black' | 'blue' | 'white';
export type Language = 'en' | 'hi' | 'ta' | 'gu';

export interface GeoLocation {
  lat: number;
  lng: number;
  name?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  windGust: number;
  rainfall: number;
  cloudCover: number;
  pressure: number;
  timestamp: string;
}

export interface DisasterRisk {
  score: number;
  level: RiskLevel;
  type: 'Flood' | 'Cyclone' | 'Heatwave' | 'Fire' | 'None';
  predictionTimeframe?: string;
}

export interface SatelliteMetadata {
  satelliteId: string;
  acquisitionTime: string;
  band: string;
  imageUrl: string;
}

export interface LocationReport {
  id: string;
  location: GeoLocation;
  currentWeather: WeatherData;
  risk: DisasterRisk;
  satellite: SatelliteMetadata;
  timelineData: { time: string; rain: number; temp: number; probability: number }[]; 
}

export interface GeminiInsight {
  analysis: string;
  recommendations: string[];
  alertLevel: string;
}

export interface PublicSafetyHazard {
  type: string;
  locationInImage: string;
  severity: 'Low' | 'Medium' | 'High';
  reason: string;
  classification: 'Natural' | 'Man-Made';
}

export interface HazardAnalysisResult {
  hazards: PublicSafetyHazard[];
  overallSummary: string;
}

// Added ClimateRiskSummary interface to fix Module '"../types"' has no exported member 'ClimateRiskSummary' error
export interface ClimateRiskSummary {
  flood: { probability: number; risk: string };
  drought: { probability: number; risk: string };
  landslide: { probability: number; risk: string };
  heatwave: { probability: number; risk: string };
  recentSummary: {
    flood: string;
    drought: string;
    landslide: string;
    heatwave: string;
  };
}

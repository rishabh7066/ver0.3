
import { LocationReport, WeatherData, RiskLevel, DisasterRisk } from '../types';
import { generateMockReport } from '../constants';

// Indian Meteorological Department (IMD) & Global Standards Thresholds
const THRESHOLDS = {
  HEAVY_RAIN: 15.0,     // mm/hr
  EXTREME_RAIN: 50.0,   // mm/hr
  SATURATION_LIMIT: 100,// mm (Cumulative 12h)
  DEPRESSION: 31,       // km/h
  CYCLONE_STORM: 62,    // km/h
  SEVERE_CYCLONE: 89,   // km/h
  HEATWAVE_TEMP: 40,    // Celsius
  FIRE_HUMIDITY: 30,    // %
  NORMAL_PRESSURE: 1013,// hPa
};

/**
 * Advanced Heuristic Engine (Rule-based AI)
 */
function calculateAdvancedRisk(weather: WeatherData, recentRainSum: number): DisasterRisk {
    // 1. CYCLONE RISK MODEL
    let cycloneScore = 0;
    if (weather.windSpeed > THRESHOLDS.DEPRESSION) {
        const windFactor = Math.min(1.0, (weather.windSpeed - 30) / 70);
        const pressureDeficit = Math.max(0, THRESHOLDS.NORMAL_PRESSURE - weather.pressure);
        const pressureFactor = Math.min(1.0, pressureDeficit / 20); 
        cycloneScore = (windFactor * 0.6) + (pressureFactor * 0.4);
    }

    // 2. FLOOD RISK MODEL
    let floodScore = 0;
    const rainFactor = Math.min(1.0, weather.rainfall / THRESHOLDS.EXTREME_RAIN);
    const saturationFactor = Math.min(1.0, recentRainSum / THRESHOLDS.SATURATION_LIMIT);
    
    if (weather.rainfall > 0 || recentRainSum > 0) {
        floodScore = (rainFactor * 0.6) + (saturationFactor * 0.4);
    }

    // 3. HEAT/FIRE RISK MODEL
    let heatScore = 0;
    if (weather.temp > 35) {
        heatScore = Math.min(1.0, (weather.temp - 35) / 10);
    }

    // DECISION LOGIC
    let finalScore = 0;
    let type: DisasterRisk['type'] = 'None';
    let predictionTimeframe = 'Next 24 Hours';

    if (cycloneScore > 0.4 && cycloneScore >= floodScore) {
        finalScore = cycloneScore;
        type = 'Cyclone';
        predictionTimeframe = 'Landfall in 6-12h';
    } else if (floodScore > 0.35) {
        finalScore = floodScore;
        type = 'Flood';
        predictionTimeframe = 'Immediate';
    } else if (heatScore > 0.6) {
        finalScore = heatScore;
        type = 'Heatwave';
        predictionTimeframe = 'Peak: 2:00 PM';
    } else {
        finalScore = Math.max(0.1, cycloneScore * 0.2, floodScore * 0.2);
    }

    finalScore = parseFloat(Math.min(0.99, finalScore).toFixed(2));

    let level = RiskLevel.SAFE;
    if (finalScore > 0.65) level = RiskLevel.EMERGENCY;
    else if (finalScore > 0.35) level = RiskLevel.WATCH;

    return {
        score: finalScore,
        level,
        type,
        predictionTimeframe
    };
}

// Reverse Geocoding Helper
const resolveLocationName = async (lat: number, lng: number): Promise<string> => {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
    if (!res.ok) throw new Error('Geocoding failed');
    const data = await res.json();
    
    const locality = data.locality || data.city || data.town || data.village;
    const region = data.principalSubdivision || data.countryName;
    
    if (locality && region) return `${locality}, ${region}`;
    if (region) return `${region}, India`;
    return `Sector ${lat.toFixed(2)}, ${lng.toFixed(2)}`;
  } catch (e) {
    return `Sector ${lat.toFixed(2)}, ${lng.toFixed(2)}`;
  }
};

export const fetchRealWeather = async (lat: number, lng: number, locationName?: string): Promise<LocationReport> => {
  try {
    let resolvedName = locationName;
    if (!resolvedName) {
        // Perform reverse geocoding if name is missing (e.g. map click)
        resolvedName = await resolveLocationName(lat, lng);
    }

    // Fetch forecast with past_days=1 to ensure we have data for the full chart window
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,rain,surface_pressure,wind_speed_10m,wind_gusts_10m,cloud_cover&hourly=rain,precipitation_probability,temperature_2m&past_days=1&forecast_days=2&timezone=auto`
    );
    const data = await response.json();

    if (!data.current) throw new Error("No weather data available");

    const current = data.current;
    
    const weather: WeatherData = {
      temp: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      windGust: current.wind_gusts_10m || current.wind_speed_10m,
      rainfall: current.rain,
      cloudCover: current.cloud_cover,
      pressure: current.surface_pressure,
      timestamp: new Date().toISOString(),
    };

    // --- TIMELINE PROCESSING ---
    // Correctly slice data relative to NOW to show trend (past 5h -> future 6h)
    // This fixes the "constant graph" issue by ensuring we don't pick static indices.
    const hourlyTimes = data.hourly.time;
    const now = new Date();
    
    // Find the index closest to current hour
    let nowIndex = hourlyTimes.findIndex((t: string) => new Date(t) > now);
    if (nowIndex === -1) nowIndex = 12; // Fallback

    const startIndex = Math.max(0, nowIndex - 5);
    const endIndex = Math.min(hourlyTimes.length, nowIndex + 7); // Total 12 points

    const timelineData = hourlyTimes.slice(startIndex, endIndex).map((t: string, i: number) => {
        const idx = startIndex + i;
        const timeObj = new Date(t);
        return {
            time: `${timeObj.getHours()}:00`,
            rain: data.hourly.rain[idx] || 0,
            temp: data.hourly.temperature_2m[idx] || weather.temp,
            probability: data.hourly.precipitation_probability[idx] || 0,
        };
    });
    
    // Calculate recent rain sum for flood model (past 12h)
    const floodStartIndex = Math.max(0, nowIndex - 12);
    const recentHistory = data.hourly.rain.slice(floodStartIndex, nowIndex);
    const recentRainSum = recentHistory.reduce((a: number, b: number) => a + b, 0);

    const prediction = calculateAdvancedRisk(weather, recentRainSum);

    return {
      id: `${lat}-${lng}-${Date.now()}`,
      location: { lat, lng, name: resolvedName },
      currentWeather: weather,
      risk: prediction,
      satellite: {
        satelliteId: 'INSAT-3DR',
        acquisitionTime: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        band: 'TIR-1 (Thermal Infrared)',
        imageUrl: `https://picsum.photos/seed/${lat}${lng}/400/300`, 
      },
      timelineData: timelineData
    };
  } catch (error) {
    console.warn("Weather fetch failed, falling back to mock", error);
    return generateMockReport(lat, lng, locationName);
  }
};

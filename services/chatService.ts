
import { GoogleGenAI, Chat } from "@google/genai";
import { LocationReport } from "../types";

// Safe environment access
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  return '';
};

// Lazy initialization
let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const key = getApiKey();
    if (key) {
      aiInstance = new GoogleGenAI({ apiKey: key });
    }
  }
  return aiInstance;
};

const SYSTEM_INSTRUCTION = `
You are the "Predictive Sky-X" AI Climate Intelligence Assistant. 
Your primary role is to provide expert analysis on current climate risks, real-time weather patterns, and immediate public safety for locations across India.

CAPABILITIES:
- Analyze real-time multi-modal data: rainfall, temperature, wind, and satellite telemetry provided in the context.
- Suggest immediate actionable safety recommendations for current hazards (Floods, Cyclones, Heatwaves).
- Explain satellite spectral bands (Visible, Infrared, Water Vapour, Thermal) in the context of current monitoring.

STRICT CONSTRAINTS ON HISTORICAL DATA:
- DO NOT provide historical 5-year climate risk assessments, probabilities based on 5-year patterns, or long-term historical statistics UNLESS the user explicitly asks for "historical data", "5-year analysis", or "past patterns".
- Default to analyzing the CURRENT telemetry and immediate 24-hour forecast provided in the operational context.

GUIDELINES:
- Be helpful, professional, and authoritative yet accessible.
- Use the provided context (current weather and telemetry) to tailor your responses.
- If the user asks about specific risks, provide a nuanced assessment based on the available REAL-TIME data.
- State clearly that predictions are based on AI models and real-time sensor fusion.
- Maintain a focus on public safety and tactical disaster response for the present moment.

When analyzing a location, consider the local geography (e.g., North East terrain, coastal vulnerabilities, or urban heat islands) in relation to the current weather.
`;

export const createChatSession = (currentReport: LocationReport | null): Chat | null => {
  const ai = getAI();
  if (!ai) return null;

  let contextPrompt = "";
  if (currentReport) {
    contextPrompt = `
      CURRENT OPERATIONAL CONTEXT (REAL-TIME):
      Location: ${currentReport.location.name || 'Unknown Sector'} (${currentReport.location.lat}, ${currentReport.location.lng})
      Current Weather: ${currentReport.currentWeather.temp}°C, ${currentReport.currentWeather.rainfall}mm rainfall, ${currentReport.currentWeather.windSpeed}km/h wind speed.
      Satellite Telemetry: ${currentReport.satellite.satelliteId} active on ${currentReport.satellite.band}.
      Current Risk Profile: ${currentReport.risk.type} (${currentReport.risk.level}).
      Immediate Trend (Next few hours): ${JSON.stringify(currentReport.timelineData.slice(0, 3))}
    `;
  }

  return ai.chats.create({
    model: 'gemini-2.0-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION + (contextPrompt ? `\n\n${contextPrompt}` : ""),
      temperature: 0.7,
      topP: 0.95,
    },
  });
};

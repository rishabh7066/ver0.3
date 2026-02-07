
import { GoogleGenAI, Type } from "@google/genai";
import { LocationReport, GeminiInsight, HazardAnalysisResult, ClimateRiskSummary } from "../types";

const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  return '';
};

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

export const generateClimateRiskSummary = async (report: LocationReport): Promise<ClimateRiskSummary> => {
  try {
    const ai = getAI();
    if (!ai) throw new Error("Gemini API Key is missing");

    const prompt = `
      You are an AI disaster-risk assessment engine integrated into a climate analytics website.
      Analyze this location: ${report.location.name} (Lat: ${report.location.lat}, Lng: ${report.location.lng}).

      ROLE:
      - Compute disaster probabilities using internally available satellite and historical climate data.
      - Use ONLY the most recent 5 years of data for all calculations.

      COMPUTATION RULES:
      - Flood: frequency of flood events during extreme rainfall.
      - Drought: repeated rainfall deficit and vegetation stress.
      - Landslide: heavy rainfall combined with terrain slope (assume hilly if relevant for location).
      - Heatwave: repeated extreme temperature events.

      RISK SCALE:
      0.0–0.2 Very Low | 0.2–0.4 Low | 0.4–0.6 Moderate | 0.6–0.8 High | 0.8–1.0 Very High.

      STRICT RULES:
      - Keep summary factual and concise (one line per disaster).
      - Do NOT explain methodology.
      - Do NOT include years or technical jargon.
      - Do NOT use paragraphs.
      - Do NOT make predictions or guarantees.
      - Use neutral, data-driven language only.

      RETURN JSON FORMAT:
      {
        "flood": { "probability": number, "risk": "string" },
        "drought": { "probability": number, "risk": "string" },
        "landslide": { "probability": number, "risk": "string" },
        "heatwave": { "probability": number, "risk": "string" },
        "recentSummary": {
          "flood": "factual string",
          "drought": "factual string",
          "landslide": "factual string",
          "heatwave": "factual string"
        }
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            flood: {
              type: Type.OBJECT,
              properties: { probability: { type: Type.NUMBER }, risk: { type: Type.STRING } },
              required: ["probability", "risk"]
            },
            drought: {
              type: Type.OBJECT,
              properties: { probability: { type: Type.NUMBER }, risk: { type: Type.STRING } },
              required: ["probability", "risk"]
            },
            landslide: {
              type: Type.OBJECT,
              properties: { probability: { type: Type.NUMBER }, risk: { type: Type.STRING } },
              required: ["probability", "risk"]
            },
            heatwave: {
              type: Type.OBJECT,
              properties: { probability: { type: Type.NUMBER }, risk: { type: Type.STRING } },
              required: ["probability", "risk"]
            },
            recentSummary: {
              type: Type.OBJECT,
              properties: {
                flood: { type: Type.STRING },
                drought: { type: Type.STRING },
                landslide: { type: Type.STRING },
                heatwave: { type: Type.STRING }
              },
              required: ["flood", "drought", "landslide", "heatwave"]
            }
          },
          required: ["flood", "drought", "landslide", "heatwave", "recentSummary"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ClimateRiskSummary;
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Risk Assessment Error:", error);
    return {
      flood: { probability: 0, risk: "N/A" },
      drought: { probability: 0, risk: "N/A" },
      landslide: { probability: 0, risk: "N/A" },
      heatwave: { probability: 0, risk: "N/A" },
      recentSummary: {
        flood: "Data unavailable",
        drought: "Data unavailable",
        landslide: "Data unavailable",
        heatwave: "Data unavailable"
      }
    };
  }
};

export const generateDisasterInsight = async (report: LocationReport): Promise<GeminiInsight> => {
  try {
    const ai = getAI();
    if (!ai) throw new Error("Gemini API Key is missing");

    const prompt = `
      Analyze current weather telemetry for Lat ${report.location.lat}, Lng ${report.location.lng}.
      Weather: Temp ${report.currentWeather.temp}°C, Rain ${report.currentWeather.rainfall}mm, Wind ${report.currentWeather.windSpeed}km/h.
      Risk Profile: ${report.risk.type} (${report.risk.level}).
      Provide a strategic assessment for disaster management.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            alertLevel: { type: Type.STRING },
          },
          required: ["analysis", "recommendations", "alertLevel"],
        },
      },
    });

    if (response.text) return JSON.parse(response.text) as GeminiInsight;
    throw new Error("Empty response");
  } catch (error) {
    return { analysis: "Insight generation failed.", recommendations: [], alertLevel: "N/A" };
  }
};

export const detectSafetyHazards = async (base64Image: string): Promise<HazardAnalysisResult> => {
  try {
    const ai = getAI();
    if (!ai) throw new Error("Gemini API Key is missing");
    const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } };
    const textPart = { text: "Identify visible infrastructure risks in this image (pits, drains, broken roads)." };

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-preview',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hazards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  locationInImage: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  classification: { type: Type.STRING },
                },
                required: ["type", "locationInImage", "severity", "reason", "classification"],
              },
            },
            overallSummary: { type: Type.STRING },
          },
          required: ["hazards", "overallSummary"],
        },
      },
    });

    if (response.text) return JSON.parse(response.text) as HazardAnalysisResult;
    throw new Error("Analysis failed");
  } catch (error) {
    return { hazards: [], overallSummary: "Scan failed." };
  }
};

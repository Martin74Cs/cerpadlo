import { GoogleGenAI } from "@google/genai";
import { RecommendationData } from '../types';

const createClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key is missing via process.env.API_KEY");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getPumpRecommendation = async (data: RecommendationData): Promise<string> => {
  const client = createClient();
  if (!client) {
    return "Chybí API klíč. Nelze načíst doporučení AI.";
  }

  const prompt = `
    Jsem inženýr navrhující čerpací systém. Potřebuji odborné shrnutí a doporučení pro následující parametry:
    - Médium: ${data.fluidName}
    - Požadovaný průtok: ${data.flow} m³/h
    - Výtlak (dopravní výška): ${data.head} m
    - Zvolený typ čerpadla: ${data.pumpType}
    - Vypočtený požadovaný výkon motoru (včetně rezervy): ${data.motorPower.toFixed(2)} kW

    Prosím poskytni:
    1. Krátké zhodnocení, zda je zvolený typ čerpadla vhodný pro toto médium a parametry. Pokud ne, navrhni lepší.
    2. Na co si dát pozor při instalaci (kavitace, materiálové provedení, těsnění).
    3. Doporučený standardní výkon motoru z řady IEC (např. zda zvolit 5.5 kW, 7.5 kW atd., vždy nejbližší vyšší).
    
    Odpověz česky, stručně a technicky. Používej odrážky.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "Jsi expertní strojní inženýr specializující se na hydrauliku a čerpací techniku.",
        temperature: 0.3, 
      }
    });
    
    return response.text || "Nepodařilo se vygenerovat doporučení.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Došlo k chybě při komunikaci s AI asistentem.";
  }
};
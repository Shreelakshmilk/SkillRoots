import { GoogleGenAI, Type } from "@google/genai";
import { Translations } from '../types';
import { UI_TEXT } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getLanguageName = (code: string): string => {
  switch (code) {
    case 'hi': return 'Hindi';
    case 'kn': return 'Kannada';
    case 'ta': return 'Tamil';
    case 'te': return 'Telugu';
    case 'ml': return 'Malayalam';
    default: return 'English';
  }
};

export const translateText = async (
  textObject: Translations, 
  targetLanguage: string
): Promise<Translations> => {
    
  if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using fallback translations.");
    return { ...UI_TEXT };
  }

  const languageName = getLanguageName(targetLanguage);
  
  const properties: { [key: string]: { type: Type.STRING, description: string } } = {};
  Object.keys(textObject).forEach(key => {
    properties[key] = { type: Type.STRING, description: `Translation for the key '${key}'` };
  });

  const prompt = `Translate the values in the following JSON object to ${languageName}. Do not translate the keys. It is critical that you return a complete JSON object with all of the original keys.
  
  Original JSON:
  ${JSON.stringify(textObject, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: properties,
            },
        },
    });

    const jsonString = response.text.trim();
    const translatedFromAPI = JSON.parse(jsonString);

    // Create a result object starting with the original text as a fallback.
    const finalTranslations: Translations = { ...textObject };

    // Merge the translated values into our result object.
    // This ensures that even if some keys are missing from the API response,
    // we still have a complete object with fallbacks.
    for (const key in translatedFromAPI) {
        if (Object.prototype.hasOwnProperty.call(finalTranslations, key)) {
            if (typeof translatedFromAPI[key] === 'string') {
                finalTranslations[key] = translatedFromAPI[key];
            }
        }
    }

    return finalTranslations;

  } catch (error) {
    console.error("Error translating text with Gemini:", error);
    // In case of error, return the original text to prevent crashes
    return textObject;
  }
};

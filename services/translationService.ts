
import { GoogleGenAI } from "@google/genai";
import { Translations } from '../types';
import { UI_TEXT } from '../constants';

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
  
  // Initialize client
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `You are an expert translator for a web application. 
  Translate the values in the following JSON object to ${languageName}. 
  Do NOT translate the keys. 
  Keep the structure exactly the same.
  
  Original JSON:
  ${JSON.stringify(textObject, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        },
    });

    const jsonString = response.text;
    if (!jsonString) {
        throw new Error("No text returned from API");
    }

    const translatedFromAPI = JSON.parse(jsonString);

    // Create a result object starting with the original text as a fallback.
    const finalTranslations: Translations = { ...textObject };

    // Merge the translated values into our result object.
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

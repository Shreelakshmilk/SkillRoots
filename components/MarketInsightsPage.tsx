
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from "@google/genai";
import { Translations } from '../types';
import { Search, LoaderCircle, ExternalLink, Mic, Square } from 'lucide-react';

interface MarketInsightsPageProps {
  translations: Translations;
}

interface GroundingSource {
    uri: string;
    title: string;
}

// Helper for base64 encoding audio bytes
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const MarketInsightsPage: React.FC<MarketInsightsPageProps> = ({ translations }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const stopListening = () => {
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => session.close());
        sessionPromiseRef.current = null;
    }
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    setIsListening(false);
  };

  const toggleListening = async () => {
      if (isListening) {
          stopListening();
          return;
      }

      setError(null);
      setIsListening(true);
      
      // Append a space if there is already text, so new speech is distinct
      if (query.trim().length > 0) {
          setQuery(prev => prev + ' ');
      }

      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
          
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          sessionPromiseRef.current = ai.live.connect({
              model: 'gemini-2.5-flash-native-audio-preview-09-2025',
              callbacks: {
                  onopen: () => {
                    const source = audioContextRef.current!.createMediaStreamSource(stream);
                    const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;
                    
                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const l = inputData.length;
                        const int16 = new Int16Array(l);
                        for (let i = 0; i < l; i++) {
                            int16[i] = inputData[i] * 32768;
                        }
                        const pcmBlob = {
                            data: encode(new Uint8Array(int16.buffer)),
                            mimeType: 'audio/pcm;rate=16000',
                        };
                         
                        sessionPromiseRef.current?.then(session => {
                             session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(audioContextRef.current!.destination);
                  },
                  onmessage: (message: LiveServerMessage) => {
                      if (message.serverContent?.inputTranscription) {
                        const text = message.serverContent.inputTranscription.text;
                        setQuery(prev => prev + text);
                      }
                  },
                  onclose: () => {
                      stopListening();
                  },
                  onerror: (err) => {
                      // Fix: Log the error message to avoid circular structure issues if 'err' is an Event
                      const errMsg = err instanceof Error ? err.message : "Unknown error";
                      console.error("Live API Error:", errMsg);
                      setError("Voice input error. Please try again.");
                      stopListening();
                  }
              },
              config: {
                responseModalities: [Modality.AUDIO],
                inputAudioTranscription: {},
              }
          });

      } catch (err) {
          const errMsg = err instanceof Error ? err.message : "Unknown error";
          console.error("Mic Error:", errMsg);
          setError("Could not access microphone. Please check permissions.");
          setIsListening(false);
      }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening) stopListening();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setResponse(null);
    setSources([]);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config: {
          tools: [{googleSearch: {}}],
        },
      });
      
      setResponse(result.text);

      const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const webSources = groundingChunks
        .map(chunk => chunk.web)
        .filter((web): web is { uri: string; title: string } => !!web && !!web.uri);
        
      setSources(webSources);

    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("Error fetching market insights:", errMsg);
      setError(errMsg || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white p-8 rounded-xl shadow-lg border border-orange-200 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-orange-800 mb-2">{translations.marketInsightsTitle}</h2>
      <p className="text-center text-gray-500 mb-6">{translations.marketInsightsSubtitle}</p>

      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-8 relative">
        <div className="relative flex-grow">
            <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isListening ? translations.voiceAssistantListening || "Listening..." : translations.marketInsightsPlaceholder}
            disabled={isLoading}
            className={`w-full px-4 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${isListening ? 'border-orange-500 ring-2 ring-orange-200 pl-10' : 'border-gray-300'}`}
            />
            {isListening && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </div>
            )}
        </div>
        
        <button
            type="button"
            onClick={toggleListening}
            className={`flex items-center justify-center p-2 border border-transparent rounded-md shadow-sm font-medium transition duration-300 ${isListening ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            aria-label={isListening ? "Stop listening" : "Start voice input"}
            title={isListening ? "Stop listening" : "Voice Search"}
        >
            {isListening ? <Square size={20} className="fill-current" /> : <Mic size={20}/>}
        </button>

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="flex items-center justify-center gap-2 px-6 py-2 border border-transparent rounded-md shadow-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-300 disabled:bg-orange-300 disabled:cursor-not-allowed"
        >
          {isLoading ? <LoaderCircle className="animate-spin" size={20}/> : <Search size={20}/>}
          <span className="hidden sm:inline">{translations.marketInsightsButton}</span>
        </button>
      </form>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <LoaderCircle className="animate-spin h-10 w-10 text-orange-600" />
        </div>
      )}

      {error && (
         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
           <strong className="font-bold">Error: </strong>
           <span className="block sm:inline">{error}</span>
         </div>
      )}

      {response && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 bg-orange-50/50 rounded-lg border border-orange-200">
             <p className="text-gray-800 whitespace-pre-wrap font-serif leading-relaxed">{response}</p>
          </div>
         
          {sources.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-3">{translations.sourcesTitle}</h3>
              <ul className="space-y-2">
                {sources.map((source, index) => (
                  <li key={index} className="flex items-start">
                    <ExternalLink className="h-4 w-4 text-orange-500 mr-2 mt-1 flex-shrink-0" />
                    <a
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {source.title || source.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MarketInsightsPage;

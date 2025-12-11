
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from "@google/genai";
import { Translations } from '../types';
import { Mic, X, LoaderCircle, AlertTriangle, MicOff } from 'lucide-react';

// Audio Encoding/Decoding functions (as per guidelines)
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


interface VoiceAssistantProps {
  translations: Translations;
}

type ConnectionState = "IDLE" | "CONNECTING" | "CONNECTED" | "ERROR";
type TranscriptItem = { speaker: 'user' | 'model'; text: string };

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ translations }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>("IDLE");
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [statusText, setStatusText] = useState('');

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const nextStartTimeRef = useRef(0);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');


  const updateTranscript = useCallback((item: TranscriptItem) => {
    setTranscript(prev => [...prev, item]);
  }, []);

  const closeSession = useCallback(() => {
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
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close();
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
    }
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    setConnectionState('IDLE');
    setStatusText('');
    currentInputTranscriptionRef.current = '';
    currentOutputTranscriptionRef.current = '';
  }, []);


  const startSession = useCallback(async () => {
    setIsOpen(true);
    setConnectionState('CONNECTING');
    setStatusText(translations.voiceAssistantConnecting);
    setTranscript([]);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        // Fix: Cast window to `any` to allow access to `webkitAudioContext` for cross-browser compatibility.
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        // Fix: Cast window to `any` to allow access to `webkitAudioContext` for cross-browser compatibility.
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        nextStartTimeRef.current = 0;

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    setConnectionState('CONNECTED');
                    setStatusText(translations.voiceAssistantListening);
                    updateTranscript({speaker: 'model', text: translations.voiceAssistantWelcome});

                    const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                    const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const l = inputData.length;
                        const int16 = new Int16Array(l);
                        for (let i = 0; i < l; i++) {
                            int16[i] = inputData[i] * 32768;
                        }
                        const pcmBlob: Blob = {
                            data: encode(new Uint8Array(int16.buffer)),
                            mimeType: 'audio/pcm;rate=16000',
                        };
                        
                        if(sessionPromiseRef.current){
                           sessionPromiseRef.current.then((session) => {
                               session.sendRealtimeInput({ media: pcmBlob });
                           });
                        }
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContextRef.current!.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                  if (message.serverContent?.outputTranscription) {
                    const text = message.serverContent.outputTranscription.text;
                    currentOutputTranscriptionRef.current += text;
                  }
                  if (message.serverContent?.inputTranscription) {
                    const text = message.serverContent.inputTranscription.text;
                    currentInputTranscriptionRef.current += text;
                  }
                  if (message.serverContent?.turnComplete) {
                    if (currentInputTranscriptionRef.current.trim()) {
                      updateTranscript({ speaker: 'user', text: currentInputTranscriptionRef.current.trim() });
                    }
                    if (currentOutputTranscriptionRef.current.trim()) {
                      updateTranscript({ speaker: 'model', text: currentOutputTranscriptionRef.current.trim() });
                    }
                    currentInputTranscriptionRef.current = '';
                    currentOutputTranscriptionRef.current = '';
                  }

                  const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                  if (base64Audio && outputAudioContextRef.current) {
                      nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                      const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                      const source = outputAudioContextRef.current.createBufferSource();
                      source.buffer = audioBuffer;
                      source.connect(outputAudioContextRef.current.destination);
                      source.addEventListener('ended', () => { sourcesRef.current.delete(source); });
                      source.start(nextStartTimeRef.current);
                      nextStartTimeRef.current += audioBuffer.duration;
                      sourcesRef.current.add(source);
                  }
                  
                  if (message.serverContent?.interrupted) {
                      sourcesRef.current.forEach(source => source.stop());
                      sourcesRef.current.clear();
                      nextStartTimeRef.current = 0;
                  }
                },
                onerror: (e: ErrorEvent) => {
                    // Fix: Do not log the entire ErrorEvent object as it can contain circular references to the DOM
                    console.error('Live session error:', e.message);
                    setConnectionState('ERROR');
                    setStatusText(e.message || "A connection error occurred.");
                    closeSession();
                },
                onclose: (e: CloseEvent) => {
                    closeSession();
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                },
                systemInstruction: 'You are a friendly and helpful assistant for SkillRoots, a platform for rural artisans. Keep your answers concise and encouraging.',
                inputAudioTranscription: {},
                outputAudioTranscription: {},
            },
        });
    } catch (err) {
        // Fix: Sanitize error logging
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error('Failed to start session:', errMsg);
        setConnectionState('ERROR');
        if (err instanceof Error && err.name === 'NotAllowedError') {
             setStatusText(translations.voiceAssistantMicError);
        } else {
             setStatusText(errMsg || "Failed to get microphone.");
        }
        setIsOpen(true); // Keep modal open to show error
    }
  }, [translations, updateTranscript, closeSession]);

  const handleFabClick = () => {
    if (isOpen) {
        handleClose();
    } else {
        startSession();
    }
  };

  const handleClose = () => {
    closeSession();
    setIsOpen(false);
  };

  useEffect(() => {
      if (transcriptContainerRef.current) {
          transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
      }
  }, [transcript]);
  
  const getStatusIcon = () => {
      switch (connectionState) {
          case 'IDLE': return <MicOff size={24} className="text-gray-500" />;
          case 'CONNECTING': return <LoaderCircle size={24} className="text-blue-500 animate-spin" />;
          case 'CONNECTED': return <Mic size={24} className="text-green-500" />;
          case 'ERROR': return <AlertTriangle size={24} className="text-red-500" />;
      }
  };

  return (
    <>
      <button
        onClick={handleFabClick}
        className="fixed bottom-6 right-6 bg-orange-600 text-white rounded-full p-4 shadow-lg hover:bg-orange-700 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 z-50"
        aria-label="Open Voice Assistant"
      >
        <Mic size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg h-[80vh] max-h-[700px] flex flex-col">
            <header className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-orange-800">{translations.voiceAssistantTitle}</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </header>

            <div ref={transcriptContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4">
               {transcript.map((item, index) => (
                   <div key={index} className={`flex ${item.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <p className={`max-w-[80%] p-3 rounded-lg ${item.speaker === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                           {item.text}
                       </p>
                   </div>
               ))}
            </div>

            <footer className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex items-center justify-center gap-3">
                {getStatusIcon()}
                <p className="text-gray-600 font-medium">{statusText}</p>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceAssistant;


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Send, Bot, Loader2, Maximize2, Minimize2, 
  Volume2, VolumeX, Volume1, Mic, MicOff, Square, Trash2, AudioLines,
  Keyboard, Radio, Zap
} from 'lucide-react';
import { LocationReport, ThemeMode, Language } from '../types';
import { createChatSession } from '../services/chatService';
import { GoogleGenAI, GenerateContentResponse, Modality } from '@google/genai';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface Message {
  role: 'user' | 'model';
  text: string;
  isAudio?: boolean;
}

interface ChatWidgetProps {
  report: LocationReport | null;
  theme: ThemeMode;
  language: Language;
}

// Audio Decoding Helpers
function decodeBase64(base64: string) {
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

const Waveform: React.FC<{ active?: boolean; color?: string }> = ({ active = true, color = "bg-cyan-500" }) => (
  <div className="flex items-center gap-1 h-6">
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className={clsx(
          "w-0.5 rounded-full transition-all",
          active ? color + " animate-waveform" : "bg-slate-700 h-1"
        )}
        style={{ 
          height: active ? '100%' : '20%', 
          animationDelay: active ? `${i * 0.05}s` : '0s',
          animationDuration: active ? `${0.4 + Math.random() * 0.4}s` : '0s'
        }}
      ></div>
    ))}
  </div>
);

export const ChatWidget: React.FC<ChatWidgetProps> = ({ report, theme, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Tactical Uplink established. Mission Control AI is ready for your report.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true);

  // WhatsApp-style Input State
  const [inputMode, setInputMode] = useState<'TEXT' | 'VOICE'>('TEXT');
  const [isRecording, setIsRecording] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const aiRef = useRef(new GoogleGenAI({ apiKey: process.env.API_KEY }));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isRecording, loading, isOpen, isExpanded]);

  const stopCurrentSpeech = useCallback(() => {
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch (e) {}
      currentSourceRef.current = null;
      setIsSpeaking(false);
    }
  }, []);

  const speakText = useCallback(async (text: string, force: boolean = false) => {
    if (!force && !voiceOutputEnabled) return;
    const cleanText = text.replace(/\[MAP_CMD:.*?\]/g, '').trim();
    if (!cleanText) return;

    stopCurrentSpeech();

    try {
      setIsSpeaking(true);
      const ai = aiRef.current;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say in a professional, calm dispatcher tone: ${cleanText}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        currentSourceRef.current = source;
        source.onended = () => {
          if (currentSourceRef.current === source) {
            setIsSpeaking(false);
            currentSourceRef.current = null;
          }
        };
        source.start();
      } else {
        setIsSpeaking(false);
      }
    } catch (e) {
      console.error("TTS Error:", e);
      setIsSpeaking(false);
    }
  }, [voiceOutputEnabled, stopCurrentSpeech]);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.readAsDataURL(blob);
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await handleSendVoice(audioBlob);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied", err);
      setInputMode('TEXT');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendVoice = async (blob: Blob) => {
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', text: "🎤 [Audio Transmission]", isAudio: true }]);
    
    try {
      const base64Audio = await blobToBase64(blob);
      const ai = aiRef.current;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { text: "Analyze this tactical voice report. Respond as Mission Control AI. Provide current analysis based on the report." },
              { inlineData: { mimeType: 'audio/webm', data: base64Audio } }
            ]
          }
        ],
      });

      const responseText = response.text || "Transmission received. Analysis pending.";
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      if (voiceOutputEnabled) speakText(responseText);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Signal corrupted. Please resend voice report." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendText = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const chat = createChatSession(report);
      if (!chat) throw new Error("Link failed");
      const response = await chat.sendMessageStream({ message: userMsg });
      let fullText = "";
      setMessages(prev => [...prev, { role: 'model', text: "" }]);
      for await (const chunk of response) {
        const c = chunk as GenerateContentResponse;
        fullText += c.text;
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { role: 'model', text: fullText };
          return newMsgs;
        });
      }
      if (voiceOutputEnabled) speakText(fullText);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Connection lost. Re-establishing satellite link..." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (inputMode === 'TEXT') {
        handleSendText();
      } else if (inputMode === 'VOICE' && isRecording) {
        stopRecording();
      }
    }
  };

  const panelBg = theme === 'white' ? "bg-white/95 border-slate-200" : "bg-slate-950/90 border-cyan-500/30";
  const textColor = theme === 'white' ? "text-slate-900" : "text-white";

  return (
    <motion.div 
      layout
      className={clsx(
        "fixed bottom-6 right-6 z-[3000] flex flex-col",
      )}
      initial={false}
      animate={{
        width: isOpen ? (isExpanded ? (window.innerWidth < 768 ? '90vw' : 600) : 350) : 56,
        height: isOpen ? (isExpanded ? (window.innerHeight < 800 ? '80vh' : 700) : 500) : 56,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
    >
      <AnimatePresence mode='wait'>
      {isOpen ? (
        <motion.div 
          key="chat-window"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={clsx("flex flex-col h-full rounded-2xl border shadow-2xl backdrop-blur-3xl overflow-hidden", panelBg)}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-cyan-600/30 to-blue-900/40 flex justify-between items-center shadow-lg cursor-pointer" onClick={() => !isExpanded && setIsExpanded(true)}>
            <div className="flex items-center gap-3">
              <div className={clsx("p-2 rounded-xl text-white shadow-lg transition-all", isSpeaking ? "bg-emerald-500 animate-pulse" : "bg-cyan-600")}>
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className={clsx("text-sm font-black uppercase tracking-tight", textColor)}>Sky-X Intel</h3>
                <div className="flex items-center gap-1.5">
                  <span className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", isSpeaking ? "bg-emerald-500" : "bg-cyan-500")}></span>
                  <span className="text-[9px] text-slate-400 font-mono uppercase tracking-[0.2em]">Operational</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
               <button onClick={() => setVoiceOutputEnabled(!voiceOutputEnabled)} className={clsx("p-2 rounded-lg transition-all", voiceOutputEnabled ? "text-cyan-400" : "text-slate-500")}>
                  {voiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
               </button>
               <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-slate-400 hover:text-white">
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
               </button>
               <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-white">
                 <X className="w-4 h-4" />
               </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20 custom-scrollbar">
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={clsx("flex flex-col group", msg.role === 'user' ? "items-end" : "items-start")}
              >
                <div className={clsx(
                  "max-w-[85%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-lg transition-all",
                  msg.role === 'user' 
                    ? "bg-cyan-700 text-white rounded-tr-none" 
                    : theme === 'white' ? "bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-none" : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-none backdrop-blur-md shadow-inner",
                  msg.isAudio && "border-l-4 border-l-emerald-500 italic flex items-center gap-2"
                )}>
                  {msg.isAudio && <AudioLines className="w-4 h-4 text-emerald-400" />}
                  {msg.text || (loading && idx === messages.length - 1 && (
                    <div className="flex gap-1 py-1">
                      <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce"></span>
                    </div>
                  ))}
                  {msg.role === 'model' && msg.text && (
                    <button onClick={() => speakText(msg.text)} className="mt-2 text-[10px] text-cyan-500 flex items-center gap-1 font-black opacity-60 hover:opacity-100 uppercase tracking-widest">
                      <Volume1 className="w-3 h-3" /> Replay Feed
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* WhatsApp Style Dual Input */}
          <div className="p-3 border-t border-white/5 bg-slate-950/50 backdrop-blur-xl">
             <div className="flex items-center gap-2">
                {/* Mode Toggle Button */}
                <button 
                  onClick={() => {
                    if (isRecording) stopRecording();
                    setInputMode(inputMode === 'TEXT' ? 'VOICE' : 'TEXT');
                  }}
                  className={clsx(
                    "p-3 rounded-full transition-all shadow-lg border",
                    inputMode === 'VOICE' ? "bg-emerald-600 border-emerald-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                  )}
                >
                  {inputMode === 'VOICE' ? <Keyboard className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <div className="flex-1 relative">
                  {inputMode === 'TEXT' ? (
                    <div className="relative group flex items-center bg-black/40 border border-white/10 rounded-full pr-1 overflow-hidden transition-all focus-within:border-cyan-500/40">
                      <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type tactical query..."
                        className="w-full bg-transparent py-3 pl-5 pr-12 text-sm text-white focus:outline-none placeholder:text-slate-600 font-mono"
                      />
                      <button 
                        onClick={handleSendText}
                        disabled={!input.trim() || loading}
                        className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full transition-all disabled:opacity-50 shadow-lg"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : (
                    <div className={clsx(
                      "flex items-center gap-3 bg-black/40 border rounded-full px-5 py-2.5 transition-all",
                      isRecording ? "border-red-500/50" : "border-emerald-500/30"
                    )}>
                      {isRecording ? (
                        <>
                          <div className="flex-1 flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                            <Waveform active={true} color="bg-red-500" />
                            <span className="text-[10px] font-black uppercase text-red-500 tracking-widest animate-pulse">Recording...</span>
                          </div>
                          <div className="text-[8px] text-slate-500 font-mono flex items-center gap-1 uppercase">
                             <Zap className="w-2 h-2" /> Enter Key to Send
                          </div>
                          <button onClick={stopRecording} className="p-2 bg-red-600 rounded-full text-white shadow-lg animate-bounce">
                             <Square className="w-3 h-3 fill-current" />
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={startRecording}
                          className="flex-1 flex items-center justify-between text-emerald-500 group"
                        >
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-emerald-400 transition-colors">Start Voice Report</span>
                           <div className="flex gap-1 h-3 items-end">
                              {[...Array(5)].map((_, i) => <div key={i} className="w-0.5 bg-emerald-500/30 h-full rounded-full"></div>)}
                           </div>
                           <div className="p-2 bg-emerald-500/10 rounded-full group-hover:bg-emerald-500/20 transition-all">
                              <Mic className="w-4 h-4" />
                           </div>
                        </button>
                      )}
                    </div>
                  )}
                </div>
             </div>
          </div>
        </motion.div>
      ) : (
        <motion.button 
          key="chat-bubble"
          layoutId="chat-trigger"
          onClick={() => setIsOpen(true)}
          className="group relative w-14 h-14 bg-gradient-to-br from-cyan-600 to-blue-800 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all border border-cyan-500/30"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Bot className="w-7 h-7 text-white relative z-10" />
          <span className="absolute h-full w-full rounded-full bg-cyan-400 opacity-20 animate-ping"></span>
        </motion.button>
      )}
      </AnimatePresence>

      <style>{`
        @keyframes waveform {
          0%, 100% { height: 20%; }
          50% { height: 100%; }
        }
        .animate-waveform {
          animation: waveform 0.6s infinite ease-in-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6,182,212,0.2);
          border-radius: 2px;
        }
      `}</style>
    </motion.div>
  );
};

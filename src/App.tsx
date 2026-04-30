/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Camera, Sparkles, ChevronRight, RefreshCw, Download, Image as ImageIcon, Wand2 } from 'lucide-react';
import { generateJoJoPrompt, generateJoJoImage } from './services/geminiService';

type Step = 'upload' | 'processing' | 'result';

interface ProcessingStatus {
  step: number;
  message: string;
}

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [status, setStatus] = useState<Step>('upload');
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({ step: 0, message: '' });
  const [resultPrompt, setResultPrompt] = useState<string>('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file.');
        return;
      }
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startTransformation = async () => {
    if (!image) return;

    try {
      setStatus('processing');
      setError(null);
      
      setProcessingStatus({ step: 1, message: 'Analyzing your soul...' });
      const prompt = await generateJoJoPrompt(image, mimeType);
      setResultPrompt(prompt);
      
      setProcessingStatus({ step: 2, message: 'Materializing Bizarre form...' });
      const generatedImageUrl = await generateJoJoImage(prompt);
      setResultImage(generatedImageUrl);
      
      setStatus('result');
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message || 'The Bizarre energy was too strong!';
      if (errorMessage.includes('API_KEY')) {
        setError('GEMINI_API_KEY is missing. Please set it in your Netlify environment variables.');
      } else if (errorMessage.includes('safety')) {
        setError('The image was flagged by safety filters. Try a different photo!');
      } else {
        setError(`Error: ${errorMessage}. Please try again.`);
      }
      setStatus('upload');
    }
  };

  const reset = () => {
    setImage(null);
    setResultImage(null);
    setResultPrompt('');
    setStatus('upload');
    setError(null);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen bg-brand-bg text-white font-sans lg:overflow-hidden">
      {/* Sidebar / Top Header on Mobile */}
      <aside className="w-full h-16 lg:w-20 lg:h-full bg-brand-pink flex flex-row lg:flex-col justify-between items-center px-6 lg:px-0 lg:py-8 border-b-4 lg:border-b-0 lg:border-r-4 border-black shrink-0 z-50">
        <div className="lg:vertical-rl lg:transform lg:rotate-180 font-display font-black text-lg lg:text-2xl tracking-[0.2em] text-black whitespace-nowrap">
          STAND VISUALIZER
        </div>
        <div className="font-display font-black text-xl lg:text-2xl text-black">
          P.0{status === 'upload' ? '1' : status === 'processing' ? '02' : '03'}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* Central Display */}
        <main className="flex-1 relative flex flex-col p-6 lg:p-10 border-b-4 lg:border-b-0 lg:border-r-4 border-brand-yellow overflow-y-auto min-h-[600px] lg:min-h-0">
          {/* Onomatopoeia Ornaments - Adjusted for responsiveness */}
          <div className="absolute top-10 right-6 lg:right-10 text-5xl lg:text-8xl font-display font-black text-brand-pink/20 selection:text-transparent pointer-events-none uppercase">
            ゴゴゴゴ
          </div>
          <div className="hidden lg:block absolute bottom-20 left-10 text-7xl font-display font-black text-brand-cyan/10 selection:text-transparent pointer-events-none uppercase">
            あやしい
          </div>

          <header className="relative z-10 mb-8 lg:mb-12">
            <h1 className="text-5xl lg:text-7xl font-display font-black leading-[0.85] tracking-tighter uppercase mb-4">
              BIZARRE<br />PERSONA
            </h1>
            <h2 className="text-[10px] lg:text-xs font-display font-bold tracking-[0.2em] text-brand-yellow uppercase">
              THE ARAKI-STYLE TRANSFORMATION ENGINE v.5.0
            </h2>
          </header>

          <div className="flex-1 relative z-10">
            <AnimatePresence mode="wait">
              {/* UPLOAD STEP */}
              {status === 'upload' && (
                <motion.div 
                  key="upload"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full"
                >
                  {/* Photo Frame */}
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`
                      relative aspect-[4/5] border-4 border-white bg-white/5 flex items-center justify-center p-4 transition-colors
                      ${image ? 'border-brand-yellow' : 'border-white hover:border-brand-pink'}
                    `}
                  >
                    <div className="absolute top-0 left-0 bg-white text-black text-[10px] font-bold px-3 py-1 uppercase z-20">
                      SOURCE_IMAGE.JPG
                    </div>
                    {image ? (
                      <>
                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-brand-pink/10 pointer-events-none" />
                      </>
                    ) : (
                      <div className="text-center p-8">
                        <Upload size={48} className="mx-auto mb-6 text-white/20" />
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-8 leading-loose">
                          Drag and drop or click to upload soul profile
                        </p>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-brand-yellow text-black px-6 py-3 font-display font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                        >
                          Select Subject
                        </button>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  </div>

                  <div className="flex flex-col gap-8">
                    <div className="border-l-4 border-brand-pink pl-6 py-4">
                      <h4 className="text-xs font-bold text-brand-pink uppercase tracking-widest mb-4">Transformation Parameters</h4>
                      <div className="space-y-4">
                        {[
                          "Contrapposto Silhouette",
                          "Araki Linework Depth",
                          "Surreal Palette Swap",
                          "High-Fashion Tailoring"
                        ].map((stat, i) => (
                          <div key={i} className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest border-b border-white/10 pb-2">
                             <span>{stat}</span>
                             <span className="text-brand-yellow">READY</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      disabled={!image}
                      onClick={startTransformation}
                      className={`
                        w-full py-6 font-display font-black text-2xl uppercase italic tracking-tighter transition-all relative group
                        ${image ? 'bg-brand-yellow text-black hover:bg-white active:scale-[0.98]' : 'bg-white/5 text-white/20 cursor-not-allowed'}
                      `}
                    >
                      Summon Stand
                      {image && (
                        <div className="absolute -bottom-2 -right-2 w-full h-full border-2 border-brand-yellow pointer-events-none group-hover:-bottom-1 group-hover:-right-1 transition-all" />
                      )}
                    </button>

                    {error && (
                      <div className="bg-red-500 text-white p-4 font-bold text-[10px] uppercase tracking-widest text-center animate-pulse">
                        ERROR: {error}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* PROCESSING STEP */}
              {status === 'processing' && (
                <motion.div 
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full"
                >
                  <div className="relative mb-12">
                    <div className="w-48 h-48 border-4 border-brand-pink animate-[spin_3s_linear_infinity]" />
                    <div className="absolute inset-4 border-4 border-brand-cyan animate-[spin_5s_linear_infinite_reverse]" />
                    <div className="absolute inset-8 border-4 border-brand-yellow animate-[spin_2s_linear_infinite]" />
                  </div>
                  <h3 className="text-3xl font-display font-black italic uppercase tracking-tighter text-brand-yellow mb-2">
                    {processingStatus.message}
                  </h3>
                  <div className="text-[10px] uppercase font-bold tracking-[0.5em] text-white/40">
                    PHASE 0{processingStatus.step} IN PROGRESS
                  </div>
                </motion.div>
              )}

              {/* RESULT STEP */}
              {status === 'result' && resultImage && (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 pb-8"
                >
                  <div className="relative aspect-[4/5] border-4 border-brand-pink max-w-sm mx-auto lg:max-w-none w-full">
                    <div className="absolute top-0 left-0 bg-brand-pink text-black text-[10px] font-bold px-3 py-1 uppercase z-20">
                      BIZARRE_RENDER_01
                    </div>
                    <img src={resultImage} alt="Result" className="w-full h-full object-cover" />
                    <div className="absolute bottom-[-4px] right-[-4px] w-24 lg:w-32 h-24 lg:h-32 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(255,0,0,0.5)_5px,rgba(255,0,0,0.5)_10px)]" />
                  </div>

                  <div className="flex flex-col justify-center gap-6 lg:gap-8">
                     <div>
                       <h3 className="text-4xl lg:text-5xl font-display font-black uppercase italic tracking-tighter leading-none mb-4">
                         SOUL<br /><span className="text-brand-pink">MATERIALIZED</span>
                       </h3>
                       <p className="text-[10px] uppercase font-bold tracking-widest text-brand-cyan mb-6 lg:mb-8">
                         Status: Successfully Manifested
                       </p>
                       <div className="border border-white/20 p-4">
                         <div className="text-[9px] uppercase font-bold text-white/40 mb-2">Manifestation Archetype</div>
                         <div className="flex flex-wrap gap-2">
                           {["Contrapposto", "Hyper-Drama", "Gucci-Warrior", "Stand Power"].map(t => (
                             <span key={t} className="border border-white/20 px-2 py-1 text-[9px] uppercase font-bold text-white/60">{t}</span>
                           ))}
                         </div>
                       </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = resultImage;
                            link.download = 'bizarre_profile.png';
                            link.click();
                          }}
                          className="bg-brand-yellow text-black py-4 font-display font-black text-sm uppercase tracking-widest hover:bg-white transition-colors"
                        >
                          Save
                        </button>
                        <button 
                          onClick={reset}
                          className="border-2 border-white/20 text-white py-4 font-display font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-colors"
                        >
                          Retake
                        </button>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <footer className="mt-12 pt-8 border-t border-white/10 flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.3em] text-white/30">
            <span>Stand Visualization Engine P.03</span>
            <span>Est. 1987 Araki Corp</span>
          </footer>
        </main>

        {/* Control Side Panel */}
        <aside className="w-full lg:w-[400px] bg-[#111111] p-6 lg:p-10 flex flex-col border-t-4 lg:border-t-0 lg:border-l-4 border-black shrink-0 overflow-hidden">
          <div className="flex-1 flex flex-col h-full">
            <div className="mb-8 lg:mb-auto">
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 mb-4 lg:mb-6">Subject Telemetry</div>
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/10 pb-2">
                  <span className="text-[10px] font-bold text-white/40 uppercase">Identity</span>
                  <span className="text-xs font-bold text-brand-cyan uppercase">Transformed</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/10 pb-2">
                  <span className="text-[10px] font-bold text-white/40 uppercase">Aesthetic</span>
                  <span className="text-xs font-bold text-brand-pink uppercase">Bizarre</span>
                </div>
              </div>
            </div>

            {status === 'result' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 pt-8 border-t border-white/10"
              >
                <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 mb-4">Generated Visualization Prompt</div>
                <div className="bg-black border-l-4 border-brand-cyan p-6 font-serif italic text-xs leading-relaxed text-white/60">
                   {resultPrompt}
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(resultPrompt)}
                  className="w-full mt-6 bg-white text-black py-4 font-display font-black text-xs uppercase tracking-widest hover:bg-brand-cyan transition-colors"
                >
                  Copy Prompt Data
                </button>
              </motion.div>
            )}

            <div className="mt-auto">
              <div className="flex items-center gap-4 py-8 border-t border-white/10 opacity-20">
                <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center font-display font-black italic">!</div>
                <p className="text-[9px] font-bold uppercase leading-tight tracking-widest italic">
                  Warning: Stand power may result in high fashion, extreme drama, and vivid hallucinations.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

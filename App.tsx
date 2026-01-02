
import React, { useState, useRef, useEffect } from 'react';
import { generateCampaign } from './services/geminiService';
import { CampaignData, BrandDNA } from './types';
import { Button } from './components/Button';
import { AdCard } from './components/AdCard';
import { ChatBot } from './components/ChatBot';

// Define the AIStudio interface to ensure consistency with the global declaration
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    // FIX: Use the named AIStudio type and make it optional to match the existing environment declaration
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [brand, setBrand] = useState<BrandDNA>({ url: '', description: '', logoBase64: '' });
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      // Check if the AI Studio API is available on the window object
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    // Open the API key selection dialog provided by AI Studio
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Per guidelines, proceed assuming the key selection was successful to avoid race conditions
      setHasApiKey(true);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBrand(prev => ({ ...prev, logoBase64: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateCampaign(prompt, brand);
      setCampaign(data);
    } catch (err: any) {
      console.error(err);
      // Handle project mismatch errors by prompting for a new API key selection
      if (err.message?.includes("Requested entity was not found")) {
        setError("API Key Error: Project mismatch. Please re-select your key.");
        setHasApiKey(false); // Reset key state to trigger setup view
      } else {
        setError("System failure. Banana engine overheated. Try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Setup View: Required when no valid API key has been selected
  if (hasApiKey === false) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-950 border-2 border-yellow-400 rounded-[40px] p-12 text-center shadow-[0_0_50px_rgba(250,204,21,0.15)]">
          <div className="text-7xl mb-8 animate-bounce">🍌</div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Banana Setup</h1>
          <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
            To power the Gemini 3 Pro engines, you must select an API key from a <span className="text-yellow-400 font-bold">Paid GCP Project</span>.
          </p>
          <div className="space-y-4">
            <Button onClick={handleOpenKeySelector} className="w-full py-5 text-sm">
              Connect API Key
            </Button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-yellow-400 transition-colors"
            >
              Billing Documentation →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Loading state for initial API key check
  if (hasApiKey === null) return null;

  return (
    <div className="min-h-screen bg-black text-slate-100 pb-24 selection:bg-yellow-400 selection:text-black">
      {/* High Contrast Header */}
      <header className="bg-black/80 backdrop-blur-xl border-b border-yellow-400/20 sticky top-0 z-50 py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border-2 border-yellow-400 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:rotate-12 transition-transform bg-transparent">
              <span className="text-2xl">🍌</span>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase leading-none text-white">
                <span className="text-yellow-400">Banana</span> My Facebook?
              </h1>
              <p className="text-[10px] text-yellow-400 font-black uppercase tracking-[0.4em] mt-1">High-Voltage Ad Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex gap-4">
                <div className="px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-full flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[9px] font-black text-yellow-400 uppercase tracking-widest">Gemini 3 Pro Active</span>
                </div>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-12">
        <section className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase italic">
               Ripen Your <span className="text-yellow-400">Revenue</span>.
             </h2>
             <p className="text-slate-400 text-lg font-medium">Turn generic inputs into professional, brand-synchronized Facebook campaigns.</p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-8">
            {/* Brand DNA Module */}
            <div className="bg-slate-950 border-2 border-yellow-400 rounded-[32px] p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <span className="text-9xl rotate-12 block">🍌</span>
              </div>
              
              <div className="relative z-10">
                <div className="mb-10 inline-flex items-center gap-4 px-6 py-3 border-2 border-yellow-400 rounded-2xl bg-black">
                  <div className="w-1.5 h-6 bg-yellow-400 rounded-full"></div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-yellow-400">Banana Core DNA</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Target URL (Enables Live Research)</label>
                      <input 
                        type="url" placeholder="https://yourbrand.com"
                        className="w-full bg-black border-2 border-yellow-400/40 rounded-2xl px-5 py-4 text-sm text-slate-200 focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                        value={brand.url} onChange={(e) => setBrand(prev => ({ ...prev, url: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Brand Personality</label>
                      <textarea 
                        placeholder="e.g. Bold, electric, luxury minimalist..."
                        className="w-full bg-black border-2 border-yellow-400/40 rounded-2xl px-5 py-4 text-sm text-slate-200 focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 outline-none min-h-[120px] transition-all"
                        value={brand.description} onChange={(e) => setBrand(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Brand Asset / Logo</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 rounded-[24px] border-2 border-dashed border-yellow-400/40 hover:border-yellow-400 bg-black flex flex-col items-center justify-center cursor-pointer transition-all group/logo overflow-hidden min-h-[200px]"
                    >
                      {brand.logoBase64 ? (
                        <div className="relative w-full h-full p-6">
                           <img src={brand.logoBase64} alt="Logo" className="w-full h-full object-contain" />
                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-[10px] font-black uppercase bg-yellow-400 text-black px-4 py-2 rounded-full">Replace Peel</span>
                           </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center">
                            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Peel Image & Drop<br/>(Logo for AI reference)</span>
                        </div>
                      )}
                      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Objective Section */}
            <div className="bg-slate-950 border-2 border-yellow-400 rounded-[32px] p-10 shadow-2xl relative overflow-hidden group">
              <div className="mb-10 inline-flex items-center gap-4 px-6 py-3 border-2 border-yellow-400 rounded-2xl bg-black">
                 <div className="w-1.5 h-6 bg-yellow-400 rounded-full"></div>
                 <h3 className="text-sm font-black uppercase tracking-widest text-yellow-400">Ad Campaign Objective</h3>
              </div>
              <textarea 
                className="w-full bg-black border-2 border-yellow-400/40 rounded-2xl p-6 text-slate-200 placeholder:text-slate-700 focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 outline-none min-h-[160px] transition-all text-lg font-bold leading-relaxed mb-8"
                placeholder="What are we pushing today? New product drop? Seasonal sale? Event signup?"
                value={prompt} onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  isLoading={isLoading} 
                  className="w-full md:w-auto px-16 py-6 text-sm rounded-[20px]"
                >
                  Banana My Facebook!
                </Button>
              </div>
            </div>
          </form>
        </section>

        {error && (
          <div className="mt-8 max-w-4xl mx-auto flex flex-col items-center gap-4">
            <p className="w-full text-red-500 text-center text-xs font-black uppercase tracking-widest bg-red-500/10 p-4 rounded-2xl border border-red-500/20">{error}</p>
            {error.includes("Project mismatch") && (
              <Button onClick={handleOpenKeySelector} variant="outline" className="px-8">Re-select API Key</Button>
            )}
          </div>
        )}

        {/* Results Section */}
        {campaign && (
          <section className="mt-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-yellow-400 pb-12 mb-16 gap-8">
              <div>
                <span className="text-yellow-400 font-black text-xs uppercase tracking-[0.4em] mb-4 block">Blueprint Generated 🍌</span>
                <h2 className="text-6xl font-black text-white tracking-tighter uppercase italic">{campaign.productName}</h2>
                <div className="flex items-center gap-3 mt-6">
                  <span className="text-[10px] font-black bg-yellow-400 text-black px-4 py-2 rounded-full uppercase tracking-widest">Target: {campaign.targetAudience}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-20">
              {campaign.variants.map((v, i) => (
                <AdCard key={i} variant={v} productName={campaign.productName} brand={brand} />
              ))}
            </div>

            {/* Grounding Attribution: Mandatory when using Google Search tool */}
            {campaign.groundingUrls && campaign.groundingUrls.length > 0 && (
              <div className="bg-slate-950 border border-slate-900 rounded-[32px] p-10 mb-20">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Intelligence Sources (Grounding)</h4>
                <div className="flex flex-wrap gap-4">
                  {campaign.groundingUrls.map((source, i) => (
                    <a 
                      key={i} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-yellow-400/80 hover:text-yellow-400 underline decoration-yellow-400/20 underline-offset-4"
                    >
                      {source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {!campaign && !isLoading && (
          <div className="py-40 flex flex-col items-center justify-center opacity-5 grayscale select-none">
            <span className="text-9xl mb-8">🍌</span>
            <h3 className="text-xs font-black uppercase tracking-[1em] text-white">Banana Engine Standby</h3>
          </div>
        )}
      </main>

      <ChatBot />
    </div>
  );
};

export default App;


import React, { useState } from 'react';
import { AdVariant, ImageAspectRatio, BrandDNA } from '../types';
import { generateImage, editImage } from '../services/geminiService';
import { Button } from './Button';

interface AdCardProps {
  variant: AdVariant;
  productName: string;
  brand: BrandDNA;
}

export const AdCard: React.FC<AdCardProps> = ({ variant, productName, brand }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      const url = await generateImage(
        variant.imagePrompt, 
        variant.headline, 
        productName,
        brand,
        ImageAspectRatio.SQUARE
      );
      setImageUrl(url);
    } catch (err: any) {
      console.error(err);
      setError("Peel failed. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPrompt.trim() || !imageUrl) return;

    try {
      setIsGenerating(true);
      setError(null);
      const url = await editImage(
        imageUrl,
        editPrompt,
        variant.headline,
        productName,
        brand
      );
      setImageUrl(url);
      setEditPrompt('');
    } catch (err: any) {
      console.error(err);
      setError("Refine failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full group banana-glow">
      {/* Visual Header */}
      <div className="aspect-square bg-black relative overflow-hidden border-b border-slate-900">
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="Generated visual" className="w-full h-full object-cover" />
            
            {/* Edit Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <form onSubmit={handleEditImage} className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Refine this visual..."
                  className="flex-1 bg-black border-2 border-yellow-400 rounded-lg px-3 py-2 text-[10px] text-white focus:ring-1 focus:ring-yellow-400 outline-none"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  disabled={isGenerating}
                />
                <button 
                  type="submit" 
                  disabled={isGenerating}
                  className="bg-yellow-400 p-2 rounded-lg text-black hover:bg-yellow-300 transition-colors disabled:opacity-50"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-950">
            <div className="mb-4 text-yellow-400/10">
              <span className="text-6xl">🍌</span>
            </div>
            <p className="text-[10px] font-black text-slate-600 mb-6 uppercase tracking-widest">Awaiting Visual Peel</p>
            <Button onClick={handleGenerateImage} isLoading={isGenerating} variant="primary" className="w-full max-w-[180px]">
              Banana Visual
            </Button>
          </div>
        )}
        
        {isGenerating && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-yellow-400">
              <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Peeling Pixels...</span>
            </div>
          </div>
        )}
      </div>

      {/* Ad Content */}
      <div className="p-8 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md bg-yellow-400 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em]">Banana Ad Unit</span>
        </div>
        <h3 className="font-black text-xl mb-4 text-white leading-tight tracking-tighter">{variant.headline}</h3>
        <p className="text-sm text-slate-400 mb-8 line-clamp-4 leading-relaxed font-medium">{variant.bodyCopy}</p>
        <div className="mt-auto pt-6 border-t border-slate-900 flex items-center justify-between">
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Powered by 2.5 Peel</span>
          <button className="bg-yellow-400 text-black px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-yellow-300 transition-all active:scale-95 shadow-lg shadow-yellow-900/20">
            {variant.callToAction}
          </button>
        </div>
      </div>
      {error && <div className="px-5 py-2 bg-red-950/30 text-red-400 text-[10px] font-black text-center">{error}</div>}
    </div>
  );
};

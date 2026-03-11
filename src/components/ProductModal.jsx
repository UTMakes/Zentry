import React, { useEffect, useState } from 'react';
import { X, Heart, ShieldCheck, DownloadSimple, Copy, WarningCircle, Code, Cube, Desktop, AppleLogo, LinuxLogo, WindowsLogo } from '@phosphor-icons/react';

// A dynamic icon resolver
import * as PhosphorIcons from '@phosphor-icons/react';

const ProductModal = ({ isOpen, productId, catalog, userFavorites, onToggleFavorite, onClose }) => {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (isOpen && productId) {
      // Find product deeply in the catalog tree
      let found = null;
      for (const section of catalog) {
        for (const subsection of section.subsections) {
          const item = subsection.items.find(i => i.id === productId);
          if (item) { found = item; break; }
        }
        if (found) break;
      }
      setProduct(found);
    }
  }, [isOpen, productId, catalog]);

  if (!isOpen || !product) return null;

  const isScript = product.type === "Script";
  const isReady = product.downloadLink !== "#" || isScript;
  const isFavorite = userFavorites.includes(product.id);

  const parsedIconName = product.icon ? product.icon.replace('ph-', '').split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') : 'Cube';
  const ProductIcon = PhosphorIcons[parsedIconName] || PhosphorIcons.Cube;

  const osString = (product.requirements?.os || "").toLowerCase();
  const OsIcon = osString.includes("mac") || osString.includes("apple") ? AppleLogo : 
                 osString.includes("linux") ? LinuxLogo : 
                 osString.includes("win") ? WindowsLogo : Desktop;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-bg bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="modal-panel bg-slate-900 border border-slate-700/50 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="h-32 bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-pink-900/40 relative">
           <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-900/50 p-2 rounded-full backdrop-blur-md transition-colors border border-slate-700 hover:border-slate-500">
              <X weight="bold" />
           </button>
           <div className="absolute -bottom-10 left-8 p-4 bg-slate-800 rounded-xl border border-slate-700 shadow-xl inline-block">
               <ProductIcon weight="duotone" className="text-4xl text-blue-400" />
           </div>
        </div>
        
        {/* Content */}
        <div className="pt-14 px-8 pb-8">
            <div className="flex justify-between items-start mb-2">
                <div>
                   <h2 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                       {product.name}
                       {product.isVerified && <SealCheck weight="fill" className="text-blue-500 text-2xl" title="Verified by Zentry" />}
                   </h2>
                   <div className="flex items-center gap-3 text-sm text-slate-400 font-mono mb-4">
                       <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-300">{product.version}</span>
                       <span>By <span className="text-blue-400">{product.author}</span></span>
                       <span>•</span>
                       <span>{(product.downloads/1000).toFixed(1)}k DLs</span>
                   </div>
                </div>
                
                <button 
                   onClick={() => onToggleFavorite(product.id)}
                   className={`p-3 rounded-xl border transition-all ${isFavorite ? 'bg-pink-500/10 border-pink-500/50 text-pink-500' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'}`}
                >
                   <Heart weight={isFavorite ? "fill" : "regular"} className="text-xl" />
                </button>
            </div>

            <p className="text-slate-300 mb-6 leading-relaxed text-base">{product.longDescription || product.description}</p>
            
            {/* Requirements Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1"><OsIcon /> OS</span>
                    <span className="text-sm text-slate-300 font-medium">{product.requirements?.os || "Any"}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Processor</span>
                    <span className="text-sm text-slate-300 font-medium truncate" title={product.requirements?.processor}>{product.requirements?.processor || "N/A"}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Memory</span>
                    <span className="text-sm text-slate-300 font-medium">{product.requirements?.ram || "N/A"}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Graphics</span>
                    <span className="text-sm text-slate-300 font-medium truncate" title={product.requirements?.graphics}>{product.requirements?.graphics || "N/A"}</span>
                </div>
            </div>

            {/* Script Viewer or Gallery (Mock) */}
            {isScript && product.scriptContent && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1"><Code /> Script Source</span>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-sm text-blue-300 overflow-x-auto">
                        <code>{product.scriptContent}</code>
                    </div>
                </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-800/50">
                {isReady ? (
                    <button 
                       className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-6 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 text-lg group"
                       onClick={() => alert(`Triggering ${isScript ? 'copy' : 'download'} for ${product.name}`)}
                    >
                       {isScript ? <Copy weight="bold" /> : <DownloadSimple weight="bold" className="group-hover:-translate-y-1 transition-transform" />}
                       {isScript ? "Copy Script" : `Download (${product.size})`}
                    </button>
                ) : (
                    <button className="flex-1 bg-slate-800 text-slate-500 cursor-not-allowed py-3.5 px-6 rounded-xl font-bold border border-slate-700 flex items-center justify-center gap-2">
                       <WarningCircle weight="bold" /> Not Available Yet
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;

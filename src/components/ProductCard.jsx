import React from 'react';
import { Heart, Desktop, AppleLogo, LinuxLogo, WindowsLogo, SealCheck, Copy, DownloadSimple, Fire } from '@phosphor-icons/react';

// A dynamic icon resolver since we don't have dynamic imports setup yet.
import * as PhosphorIcons from '@phosphor-icons/react';

const ProductCard = ({ product, isFavorite, onToggleFavorite, onOpenModal }) => {
  const isScript = product.type === "Script";
  const isReady = product.downloadLink !== "#" || isScript;
  
  const buttonClass = isReady 
      ? (isScript ? "bg-slate-800 text-blue-400 hover:bg-slate-700 hover:text-white border border-slate-700" : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20")
      : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700";
      
  const buttonText = isScript ? "Copy" : (isReady ? "Download" : "Soon");
  const BtnIcon = isScript ? Copy : DownloadSimple;

  const itemType = product.type || "App";
  
  const osString = (product.requirements?.os || "").toLowerCase();
  const OsIcon = osString.includes("mac") || osString.includes("apple") ? AppleLogo : 
                 osString.includes("linux") ? LinuxLogo : 
                 osString.includes("win") ? WindowsLogo : Desktop;

  // Convert "ph-cube" -> "Cube" 
  const parsedIconName = product.icon ? product.icon.replace('ph-', '').split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') : 'Cube';
  const ProductIcon = PhosphorIcons[parsedIconName] || PhosphorIcons.Cube;

  const handleAction = (e) => {
    e.stopPropagation();
    // In a real app we'd dispatch an event or call a context method here to trigger download/copy
    alert(isScript ? "Link Copied!" : "Download Started!");
  };

  return (
    <div onClick={() => onOpenModal(product.id)} className="glass-effect rounded-xl p-6 product-card border border-slate-700 flex flex-col h-full relative group">
        {product.isTrending && <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-orange-500/20 border border-orange-400 z-10 flex items-center gap-1 animate-pulse"><Fire weight="fill" /> HOT</span>}
        {!product.isTrending && product.isNew && <span className="absolute -top-2 -right-2 bg-green-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-green-500/20 border border-green-400 z-10">NEW</span>}

        <div className="flex items-start justify-between mb-4 card-header">
            <div className="relative bg-slate-800 p-3 rounded-lg border border-slate-700 group-hover:border-blue-500/50 transition-colors">
                <ProductIcon weight="regular" className="text-2xl text-blue-400" />
                {product.isVerified && <SealCheck weight="fill" className="text-blue-400 absolute -bottom-1 -right-1 bg-slate-800 rounded-full text-sm border border-slate-700" />}
            </div>
            <div className="flex flex-col items-end gap-1 card-stats">
                  <div className="flex gap-2 items-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(product.id); }} 
                        className={`heart-btn ${isFavorite ? 'active' : ''} p-1 rounded-full hover:bg-slate-800 transition`}
                      >
                        <Heart weight={isFavorite ? "fill" : "bold"} className={isFavorite ? "text-pink-500" : "text-slate-500 hover:text-pink-500 transition-colors"} />
                      </button>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{itemType}</span>
                  </div>
                  <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-md border border-slate-700 font-mono block mb-1">{product.version}</span>
            </div>
        </div>
        <div className="card-body">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors filter-name line-clamp-1">{product.name}</h3>
            <p className="text-slate-400 text-sm mb-4 flex-grow leading-relaxed filter-desc line-clamp-2">{product.description}</p>
            <div className="flex flex-wrap gap-2 mb-4 filter-tags">
                {product.tags.slice(0,3).map(tag => (
                  <span key={tag} className="text-[10px] font-medium text-blue-300 bg-blue-900/20 px-2 py-1 rounded border border-blue-800/30 hover:bg-blue-600 hover:text-white cursor-pointer transition z-10 relative">{tag}</span>
                ))}
                {product.tags.length > 3 && <span className="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">+{product.tags.length - 3}</span>}
            </div>
        </div>
        <div className="mt-auto pt-4 border-t border-slate-700/50 flex items-center justify-between card-footer">
            <div className="text-xs text-slate-500 font-mono flex flex-col stats-row">
                <span className="flex items-center gap-1"><OsIcon weight="bold" /> {product.size}</span>
                <span className="text-[10px] mt-0.5 transition-colors duration-300">{(product.downloads/1000).toFixed(1)}k DLs</span>
            </div>
            <button 
              onClick={handleAction} 
              className={`${buttonClass} px-4 py-2 rounded-lg text-sm font-semibold transition-all transform active:scale-95 flex items-center gap-2 justify-center min-w-[100px]`}
            >
                <BtnIcon weight="bold" /> {buttonText}
            </button>
        </div>
    </div>
  );
};

export default ProductCard;

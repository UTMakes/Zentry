import React from 'react';
import { Cube, DiceThree } from '@phosphor-icons/react';

const Hero = ({ onSurpriseMe }) => {
  return (
    <div className="relative bg-black overflow-hidden border-b border-slate-800/50">
      <div className="relative py-16 sm:py-20 lg:py-24 flex items-center justify-center min-h-[70vh]">
        <div className="relative flex flex-col items-center justify-center px-4">
          <div className="relative text-center">
            <h1 className="text-[15vw] sm:text-[12vw] lg:text-[10vw] font-serif text-white leading-[0.85] tracking-tight whitespace-nowrap relative z-10" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              Build<span className="text-blue-500">.</span>
            </h1>
            <div className="relative flex items-center justify-center">
              <h1 className="text-[15vw] sm:text-[12vw] lg:text-[10vw] font-serif text-white leading-[0.85] tracking-tight whitespace-nowrap relative z-10" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                Ship<span className="text-purple-500">.</span>
              </h1>
              <div className="absolute -right-4 sm:-right-8 lg:-right-16 top-1/2 -translate-y-1/2 z-20">
                <div className="blob-mini relative w-20 h-20 sm:w-28 sm:h-28 lg:w-36 lg:h-36">
                  <div className="absolute inset-0 rounded-full" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)", boxShadow: "0 0 40px rgba(139,92,246,0.5)", willChange: "transform" }}></div>
                  <div className="absolute inset-2 rounded-full" style={{ background: "linear-gradient(45deg, rgba(34,211,238,0.6) 0%, rgba(59,130,246,0.6) 50%, rgba(168,85,247,0.6) 100%)" }}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Cube className="text-xl sm:text-2xl lg:text-3xl text-white" weight="fill" />
                  </div>
                </div>
              </div>
            </div>
            <h1 className="text-[15vw] sm:text-[12vw] lg:text-[10vw] font-serif text-white leading-[0.85] tracking-tight whitespace-nowrap relative z-10" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              Simplify<span className="text-pink-500">.</span>
            </h1>
          </div>

          <p className="mt-8 text-slate-400 text-center text-sm sm:text-base max-w-2xl px-4">
            Zentry is the home for high-performance utilities, developer tools, and indie games. 
            Secure, open-source, and ready for deployment.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <a href="#products" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition duration-300 shadow-lg shadow-blue-900/30">
              Browse Catalog
            </a>
            <button onClick={onSurpriseMe} className="px-8 py-3 border border-pink-500/30 text-pink-400 hover:bg-pink-600/10 rounded-lg font-medium transition duration-300 flex items-center gap-2">
              <DiceThree weight="bold" /> Surprise Me
            </button>
          </div>
        </div>
      </div>

      <div className="relative px-4 sm:px-6 lg:px-8 py-6 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1">16 February 2026</p>
            <p className="text-sm text-slate-300 font-light">Premium Software Hub</p>
          </div>
          <div className="flex items-center gap-8">
            <a href="#products" className="text-xs text-slate-400 hover:text-white uppercase tracking-[0.15em] transition duration-300">Browse</a>
            <a href="#features" className="text-xs text-slate-400 hover:text-white uppercase tracking-[0.15em] transition duration-300">Features</a>
            <a href="#products" className="text-xs text-slate-400 hover:text-white uppercase tracking-[0.15em] transition duration-300">Catalog</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

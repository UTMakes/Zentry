import React from 'react';
import { Cube, DiceThree, ShieldCheck } from '@phosphor-icons/react';

const Navbar = ({ onSurpriseMe }) => {
  return (
    <nav className="sticky top-0 w-full z-50 glass-effect border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer group">
            <Cube className="text-blue-500 text-3xl transition-transform leading-none group-hover:animate-spin-fast" weight="fill" />
            <span className="font-zentry-logo text-2xl tracking-wide font-bold leading-none">Zentry</span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#features" className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition">Features</a>
              <a href="#products" className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition">Catalog</a>
              <button 
                onClick={onSurpriseMe} 
                className="px-3 py-2 rounded-md text-sm font-medium text-pink-400 hover:text-white hover:bg-pink-600/20 transition border border-pink-500/30 flex items-center gap-2 shadow-lg shadow-pink-900/20"
              >
                <DiceThree className="text-lg animate-pulse" weight="bold" /> Surprise Me
              </button>
              <button 
                onClick={() => document.getElementById('submit-modal').classList.toggle('hidden')} 
                className="px-3 py-2 rounded-md text-sm font-medium text-emerald-400 hover:text-white hover:bg-emerald-600/20 transition border border-emerald-500/30"
              >
                Submit App
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

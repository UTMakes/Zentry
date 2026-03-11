import React from 'react';

// Basic wrapper layout and footer
const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8 mt-auto z-10 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <span className="font-zentry-logo text-2xl text-slate-300 font-bold tracking-wide">Zentry</span>
            </div>
            <p className="text-slate-500 text-sm text-center md:text-left">
                © 2026 Zentry LLC. Premium Software Hub.
            </p>
            <div className="flex gap-4 items-center">
                <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Terms</a>
                <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Privacy</a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white text-sm transition-colors">GitHub</a>
            </div>
        </div>
    </footer>
  );
};

export default Footer;

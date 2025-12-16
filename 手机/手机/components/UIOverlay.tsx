import React from 'react';
import { TreeState } from '../types';

interface UIOverlayProps {
  treeState: TreeState;
  onToggle: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ treeState, onToggle }) => {
  const isTree = treeState === TreeState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12">
      {/* Header */}
      <header className="flex flex-col items-start space-y-2">
        <h1 className="text-4xl md:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 tracking-wider drop-shadow-lg">
          ARIX
        </h1>
        <div className="h-[1px] w-24 bg-yellow-500/50"></div>
        <p className="text-emerald-400/80 text-xs md:text-sm tracking-[0.3em] uppercase font-light">
          Signature Collection
        </p>
      </header>

      {/* Center Action (only visible logic if needed, but we keep it clean) */}
      
      {/* Footer Controls */}
      <footer className="flex flex-col md:flex-row justify-between items-end md:items-center w-full">
        <div className="text-white/40 text-[10px] md:text-xs font-mono mb-4 md:mb-0">
          <p>COORDINATES: {isTree ? 'LOCKED' : 'DRIFTING'}</p>
          <p>SYSTEM STATUS: {isTree ? 'CONVERGED' : 'SCATTERED'}</p>
        </div>

        {/* The Magic Button */}
        <button
          onClick={onToggle}
          className={`
            pointer-events-auto
            group relative px-8 py-4 
            border border-yellow-500/30 
            bg-black/40 backdrop-blur-md 
            overflow-hidden transition-all duration-500 ease-out
            hover:border-yellow-400 hover:bg-emerald-900/30
          `}
        >
          {/* Button Glow Effect */}
          <div className="absolute inset-0 w-0 bg-gradient-to-r from-yellow-500/20 to-transparent transition-all duration-[700ms] ease-out group-hover:w-full" />
          
          <span className="relative z-10 font-serif text-yellow-100 tracking-widest text-lg md:text-xl transition-colors duration-300 group-hover:text-white">
            {isTree ? 'RELEASE MAGIC' : 'ASSEMBLE TREE'}
          </span>
          
          {/* Decorative Corners */}
          <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-yellow-500 transition-all duration-300 group-hover:w-full group-hover:h-full opacity-50"></span>
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-yellow-500 transition-all duration-300 group-hover:w-full group-hover:h-full opacity-50"></span>
        </button>
      </footer>
    </div>
  );
};
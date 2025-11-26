import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Sliders, BookOpen } from 'lucide-react';
import { THEME } from '../utils/helpers';
import { TheoryPanel, DataCard } from './UIComponents';

export const SimControls = ({ running, onToggle, onReset }) => (
  <div className="mt-4 pt-6 border-t border-slate-700 grid grid-cols-3 gap-2">
    <button onClick={onToggle} className={`col-span-2 ${running ? 'bg-rose-600 hover:bg-rose-500' : 'bg-cyan-600 hover:bg-cyan-500'} text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg`}>
      {running ? <Pause size={18} /> : <Play size={18} />}
      {running ? "PAUSE" : "START"}
    </button>
    <button onClick={onReset} className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all">
      <RotateCcw size={18} />
    </button>
  </div>
);

export const SimLayout = ({ Controls, Canvas, Data, Concept }) => {
  const [mode, setMode] = useState('sim'); 

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4">
      {/* LEFT: Controls & Intel Switcher */}
      <div className={`w-full lg:w-80 ${THEME.panel} p-6 rounded-xl flex flex-col h-full relative overflow-hidden transition-all`}>
        
        {/* Toggle Header */}
        <div className="flex bg-slate-800/50 p-1 rounded-lg mb-6 border border-slate-700">
           <button 
             onClick={() => setMode('sim')}
             className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${mode === 'sim' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
             <Sliders size={14}/> CONTROLS
           </button>
           <button 
             onClick={() => setMode('intel')}
             className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${mode === 'intel' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
             <BookOpen size={14}/> THEORY INTEL
           </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative overflow-y-auto custom-scrollbar">
           {mode === 'sim' ? (
              <div className="animate-in slide-in-from-left duration-300 pb-4">
                  {Controls}
              </div>
           ) : (
              <TheoryPanel content={Concept} />
           )}
        </div>
      </div>

      {/* RIGHT: Visuals */}
      <div className="flex-1 flex flex-col gap-4 min-h-[400px]">
        <div className={`flex-1 relative rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-[#0b0d14]`}>
          {Canvas}
          <div className="absolute top-4 left-4 text-xs font-mono text-slate-500 pointer-events-none select-none">
             PHYS_ENGINE_V2.1 // RENDER_ACTIVE
          </div>
        </div>
        
        {/* Data Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
           {Data.map((d, i) => <DataCard key={i} label={d.l} value={d.v} unit={d.u} />)}
        </div>
      </div>
    </div>
  );
};
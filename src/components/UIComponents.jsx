import React from 'react';

export const Slider = ({ label, value, min, max, step, onChange, unit }) => (
  <div className="mb-5 group">
    <div className="flex justify-between mb-2">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-cyan-300 transition-colors">{label}</span>
      <span className="text-xs font-mono text-cyan-400 bg-cyan-900/30 px-2 py-0.5 rounded border border-cyan-800">{value} {unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"
    />
  </div>
);

export const DataCard = ({ label, value, unit, color = "text-slate-200" }) => (
  <div className="bg-[#1a1e29] p-3 rounded border border-slate-800 flex flex-col items-center justify-center min-w-[80px]">
    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">{label}</span>
    <span className={`text-lg font-mono font-bold ${color}`}>
      {typeof value === 'number' ? value.toFixed(2) : value}
      <span className="text-xs ml-1 text-slate-600">{unit}</span>
    </span>
  </div>
);

export const TheoryPanel = ({ content }) => (
  <div className="h-full overflow-y-auto pr-2 animate-in slide-in-from-right duration-300 custom-scrollbar">
    <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">{content.title}</h2>
    
    <div className="mb-6">
      <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-2">Core Concept</h3>
      <p className="text-slate-300 text-sm leading-relaxed bg-slate-800/50 p-3 rounded-lg border-l-2 border-cyan-500">
        {content.description}
      </p>
    </div>

    <div className="mb-6">
      <h3 className="text-emerald-400 text-sm font-bold uppercase tracking-widest mb-2">Key Formulas</h3>
      <div className="bg-[#0f111a] p-4 rounded-lg font-mono text-sm space-y-3 text-slate-300 border border-slate-800">
        {content.formulas.map((f, i) => (
          <div key={i} className="flex justify-between items-center">
            <span>{f.label}</span>
            <span className="text-cyan-200 font-bold">{f.tex}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="mb-6">
      <h3 className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-2">Real World Application</h3>
      <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
        {content.applications.map((app, i) => <li key={i}>{app}</li>)}
      </ul>
    </div>

    <div className="pb-4">
      <h3 className="text-amber-400 text-sm font-bold uppercase tracking-widest mb-2">JEE Practice (High Yield)</h3>
      <div className="space-y-3">
        {content.questions?.map((q, i) => (
          <div key={i} className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50 hover:border-slate-600 transition-colors">
             <p className="text-slate-200 text-sm font-medium mb-2 leading-snug"><span className="text-cyan-400 font-bold">Q{i+1}.</span> {q.q}</p>
             <details className="group">
                <summary className="text-xs text-slate-400 cursor-pointer hover:text-cyan-300 transition-colors list-none flex items-center gap-1 select-none">
                   <span className="group-open:rotate-90 transition-transform text-[10px]">▶</span> View Solution
                </summary>
                <div className="mt-2 text-xs text-emerald-300 font-mono bg-[#0f111a] p-3 rounded border border-slate-800 leading-relaxed whitespace-pre-wrap">
                   {q.a}
                </div>
             </details>
          </div>
        ))}
      </div>
    </div>
  </div>
);
import React, { useState } from 'react';
import { 
  Activity, Zap, MoveDiagonal, Waves,
  CircleDashed, Rocket, Globe, Anchor, ArrowRightLeft
} from 'lucide-react';
import { THEME } from './utils/helpers';
import { 
    RampSim, ProjectileSim, CircularSim, OrbitSim, 
    WaveSim, SpringSim, PendulumSim, CollisionSim 
} from './components/Simulations';

const App = () => {
  const [activeTab, setActiveTab] = useState('ramp');

  const modules = [
    { id: 'ramp', label: 'Ramp & Forces', icon: MoveDiagonal },
    { id: 'projectile', label: 'Projectile Motion', icon: Rocket },
    { id: 'circular', label: 'Circular Motion', icon: CircleDashed },
    { id: 'gravity', label: 'Orbital Gravity', icon: Globe },
    { id: 'waves', label: 'Wave Interference', icon: Waves },
    { id: 'spring', label: 'Hooke\'s Law', icon: Activity },
    { id: 'pendulum', label: 'Simple Pendulum', icon: Anchor },
    { id: 'collision', label: 'Elastic Collision', icon: ArrowRightLeft },
  ];

  return (
    <div className={`h-screen w-full ${THEME.bg} text-slate-200 font-sans selection:bg-cyan-500/30 flex overflow-hidden`}>
      {/* Sidebar */}
      <nav className="w-16 lg:w-64 border-r border-slate-800 bg-[#0b0d14] flex flex-col z-20 shadow-xl">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap size={20} className="text-white" fill="white" />
          </div>
          <span className="font-bold text-lg tracking-tight hidden lg:block text-white">Phys<span className="text-cyan-400">Lab</span>.Pro</span>
        </div>
        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {modules.map(m => (
            <button
              key={m.id}
              onClick={() => setActiveTab(m.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
                ${activeTab === m.id 
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-inner' 
                  : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'
                }`}
            >
              <m.icon size={20} className={activeTab === m.id ? "text-cyan-400" : "group-hover:text-slate-300"} />
              <span className="font-medium text-sm hidden lg:block">{m.label}</span>
              {activeTab === m.id && <div className="ml-auto w-1 h-1 rounded-full bg-cyan-400 hidden lg:block"></div>}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-6 flex flex-col h-screen overflow-hidden">
        <header className="flex justify-between items-center mb-6 shrink-0">
           <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                 {modules.find(m => m.id === activeTab)?.label}
                 <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">v2.1.0</span>
              </h1>
           </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'ramp' && <RampSim />}
          {activeTab === 'projectile' && <ProjectileSim />}
          {activeTab === 'circular' && <CircularSim />}
          {activeTab === 'gravity' && <OrbitSim />}
          {activeTab === 'waves' && <WaveSim />}
          {activeTab === 'spring' && <SpringSim />}
          {activeTab === 'pendulum' && <PendulumSim />}
          {activeTab === 'collision' && <CollisionSim />}
        </div>
      </main>
    </div>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import { ChevronLeft, RotateCcw, Box, Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles, Zap, BrainCircuit, Target } from 'lucide-react';

interface Block {
  x: number;
  y: number;
  z: number;
}

interface SandboxLevel {
  id: number;
  name: string;
  blocks: Block[];
  totalTarget: number;
  hiddenTarget: number;
  surfaceTarget: number; // Number of exposed cube faces
}

const LEVELS: SandboxLevel[] = [
  {
    id: 1,
    name: "Foundation Stack",
    blocks: [
      { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 },
      { x: 0, y: 0, z: 1 }
    ],
    totalTarget: 5,
    hiddenTarget: 0,
    surfaceTarget: 17
  },
  {
    id: 2,
    name: "The Void Path",
    blocks: [
      { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 }, { x: 2, y: 1, z: 0 },
      { x: 0, y: 2, z: 0 }, { x: 1, y: 2, z: 0 }, { x: 2, y: 2, z: 0 },
      { x: 1, y: 0, z: 1 }, { x: 1, y: 2, z: 1 }, { x: 1, y: 1, z: 2 }
    ],
    totalTarget: 11,
    hiddenTarget: 1,
    surfaceTarget: 42
  },
  {
    id: 3,
    name: "Tectonic Drift",
    blocks: [
      { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 2, y: 1, z: 0 },
      { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }, { x: 2, y: 0, z: 1 },
      { x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: 2, y: 1, z: 1 },
      { x: 1, y: 1, z: 2 }, { x: 1, y: 0, z: 2 }
    ],
    totalTarget: 14,
    hiddenTarget: 4,
    surfaceTarget: 40
  }
];

const NeuralSandbox: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [isXRay, setIsXRay] = useState(false);
  const [answers, setAnswers] = useState({ total: '', hidden: '', surface: '' });
  const [results, setResults] = useState<{ total?: boolean; hidden?: boolean; surface?: boolean } | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const currentLevel = LEVELS[currentLevelIdx];

  const handleCheck = () => {
    const totalCorrect = parseInt(answers.total) === currentLevel.totalTarget;
    const hiddenCorrect = parseInt(answers.hidden) === currentLevel.hiddenTarget;
    const surfaceCorrect = parseInt(answers.surface) === currentLevel.surfaceTarget;
    
    setResults({ total: totalCorrect, hidden: hiddenCorrect, surface: surfaceCorrect });
  };

  const nextLevel = () => {
    if (currentLevelIdx < LEVELS.length - 1) {
      setCurrentLevelIdx(prev => prev + 1);
      resetLevel();
    }
  };

  const resetLevel = () => {
    setAnswers({ total: '', hidden: '', surface: '' });
    setResults(null);
    setShowSolution(false);
    setIsXRay(false);
  };

  // Helper to render an isometric cube stack
  const renderIsometricStack = () => {
    // Sort blocks by depth (Y then Z then X) to ensure correct layering
    const sortedBlocks = [...currentLevel.blocks].sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      if (a.z !== b.z) return a.z - b.z;
      return a.x - b.x;
    });

    return (
      <div className="relative w-full h-[400px] flex items-center justify-center scale-75 md:scale-100">
        <div className="relative" style={{ perspective: '1000px' }}>
          {sortedBlocks.map((block, idx) => {
            // Isometric math: 
            // X offset = (x - y) * size / 2
            // Y offset = (x + y) * size / 4 - (z * size / 2)
            const size = 60;
            const left = (block.x - block.y) * (size / 1.15);
            const top = (block.x + block.y) * (size / 2.3) - (block.z * (size / 1.15));
            
            // Check if block is "hidden" (surrounded by blocks on top, front-left, front-right)
            const isHidden = currentLevel.blocks.some(b => b.x === block.x && b.y === block.y && b.z === block.z + 1) &&
                             currentLevel.blocks.some(b => b.x === block.x + 1 && b.y === block.y && b.z === block.z) &&
                             currentLevel.blocks.some(b => b.x === block.x && b.y === block.y + 1 && b.z === block.z);

            return (
              <div 
                key={`${block.x}-${block.y}-${block.z}`}
                className="absolute transition-all duration-700 ease-out"
                style={{ 
                  left: `${left}px`, 
                  top: `${top}px`, 
                  zIndex: (block.x + block.y + block.z * 10),
                  opacity: isXRay ? (isHidden ? 1 : 0.15) : 1
                }}
              >
                <div className="relative w-[60px] h-[60px] group">
                  {/* Top Face */}
                  <div className={`absolute w-[42px] h-[42px] rotate-x-[60deg] rotate-z-[45deg] -translate-y-[21px] translate-x-[9px] border border-white/10 transition-colors ${isHidden && isXRay ? 'bg-[#e89f71]' : 'bg-[#7c9473]'}`}></div>
                  {/* Left Face */}
                  <div className={`absolute w-[42px] h-[42px] rotate-y-[60deg] rotate-z-[45deg] -translate-x-[11px] translate-y-[10px] border border-white/10 transition-colors ${isHidden && isXRay ? 'bg-[#b45309]' : 'bg-[#5a6b53]'}`}></div>
                  {/* Right Face */}
                  <div className={`absolute w-[42px] h-[42px] rotate-y-[60deg] rotate-z-[-45deg] translate-x-[29px] translate-y-[10px] border border-white/10 transition-colors ${isHidden && isXRay ? 'bg-[#78350f]' : 'bg-[#4b5d44]'}`}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="space-y-4">
          <button onClick={onBack} className="flex items-center gap-3 text-gray-500 hover:text-white transition-all font-bold text-sm group mb-4">
             <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
             <span>Command Center</span>
          </button>
          <div className="flex items-center gap-3 text-[#7c9473]">
            <BrainCircuit size={20} className="animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.4em] opacity-80">Spatial Lab Protocol</span>
          </div>
          <h1 className="text-5xl font-outfit font-extrabold text-white tracking-tighter">Neural Sandbox</h1>
          <p className="text-gray-500 text-lg font-medium opacity-80 max-w-xl">Interactive 3D structural analysis for architectural intuition and spatial logic.</p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-[32px] border border-white/10">
           <button 
            onClick={() => setIsXRay(!isXRay)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${isXRay ? 'bg-[#e89f71] text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}
           >
              {isXRay ? <EyeOff size={16} /> : <Eye size={16} />}
              {isXRay ? 'X-Ray Active' : 'X-Ray Scanner'}
           </button>
           <button 
            onClick={resetLevel}
            className="p-3 bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-all border border-white/5"
           >
             <RotateCcw size={20} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-stretch">
        {/* Sandbox Render Area */}
        <div className="lg:col-span-2 glass-card rounded-[64px] border border-white/5 overflow-hidden flex flex-col items-center justify-center bg-black/40 min-h-[500px] relative">
           <div className="absolute top-10 left-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#7c9473]/10 border border-[#7c9473]/20 rounded-2xl flex items-center justify-center text-[#7c9473]">
                 <Box size={24} />
              </div>
              <div>
                <h3 className="text-xl font-outfit font-bold text-white tracking-tight">{currentLevel.name}</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Level {currentLevelIdx + 1}</p>
              </div>
           </div>

           {renderIsometricStack()}

           <div className="absolute bottom-10 left-10 flex gap-3">
              <div className="px-4 py-2 bg-white/5 rounded-full text-[9px] font-bold text-gray-600 uppercase tracking-widest border border-white/5">
                Isometric Projection Active
              </div>
           </div>
        </div>

        {/* Challenge Input Area */}
        <div className="glass-card p-10 md:p-14 rounded-[64px] border border-white/5 flex flex-col justify-between space-y-12">
           <div className="space-y-10">
              <div className="flex items-center gap-4 border-b border-white/5 pb-8">
                 <Target size={24} className="text-[#7c9473]" />
                 <h2 className="text-2xl font-outfit font-bold text-white tracking-tight">Spatial Parameters</h2>
              </div>

              <div className="space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block ml-2">Total Unit Blocks</label>
                    <div className="relative">
                       <input 
                        type="number"
                        value={answers.total}
                        onChange={(e) => setAnswers({...answers, total: e.target.value})}
                        placeholder="0"
                        className={`w-full bg-white/[0.03] border rounded-3xl py-6 px-8 text-2xl font-outfit font-bold text-white outline-none transition-all ${results?.total === true ? 'border-green-500/50 focus:border-green-500' : results?.total === false ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#7c9473]'}`}
                       />
                       {results?.total !== undefined && (
                         <div className="absolute right-6 top-1/2 -translate-y-1/2">
                            {results.total ? <CheckCircle2 className="text-green-500" /> : <AlertCircle className="text-red-500" />}
                         </div>
                       )}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block ml-2">Occluded (Hidden) Units</label>
                    <div className="relative">
                       <input 
                        type="number"
                        value={answers.hidden}
                        onChange={(e) => setAnswers({...answers, hidden: e.target.value})}
                        placeholder="0"
                        className={`w-full bg-white/[0.03] border rounded-3xl py-6 px-8 text-2xl font-outfit font-bold text-white outline-none transition-all ${results?.hidden === true ? 'border-green-500/50 focus:border-green-500' : results?.hidden === false ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#7c9473]'}`}
                       />
                       {results?.hidden !== undefined && (
                         <div className="absolute right-6 top-1/2 -translate-y-1/2">
                            {results.hidden ? <CheckCircle2 className="text-green-500" /> : <AlertCircle className="text-red-500" />}
                         </div>
                       )}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block ml-2">Exposed Surface Faces</label>
                    <div className="relative">
                       <input 
                        type="number"
                        value={answers.surface}
                        onChange={(e) => setAnswers({...answers, surface: e.target.value})}
                        placeholder="0"
                        className={`w-full bg-white/[0.03] border rounded-3xl py-6 px-8 text-2xl font-outfit font-bold text-white outline-none transition-all ${results?.surface === true ? 'border-green-500/50 focus:border-green-500' : results?.surface === false ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#7c9473]'}`}
                       />
                       {results?.surface !== undefined && (
                         <div className="absolute right-6 top-1/2 -translate-y-1/2">
                            {results.surface ? <CheckCircle2 className="text-green-500" /> : <AlertCircle className="text-red-500" />}
                         </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-4 pt-8">
              {!results ? (
                <button 
                  onClick={handleCheck}
                  className="w-full py-6 bg-[#7c9473] text-white rounded-[32px] font-bold text-xl shadow-2xl hover:-translate-y-1 transition-all active:scale-95"
                >
                  Verify Parameters
                </button>
              ) : (
                <div className="flex gap-4">
                   <button 
                    onClick={resetLevel}
                    className="flex-1 py-5 bg-white/5 border border-white/10 text-gray-500 rounded-[28px] font-bold text-sm hover:text-white transition-all"
                   >
                     Retry Trace
                   </button>
                   <button 
                    onClick={nextLevel}
                    className="flex-1 py-5 bg-[#7c9473] text-white rounded-[28px] font-bold text-sm shadow-xl hover:-translate-y-1 transition-all"
                   >
                     Next Protocol
                   </button>
                </div>
              )}
           </div>
        </div>
      </div>

      <div className="glass-card p-12 md:p-16 rounded-[64px] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent flex flex-col md:flex-row items-center gap-14 reveal shadow-inner">
         <div className="w-28 h-28 bg-[#7c9473]/10 rounded-[48px] border border-[#7c9473]/20 flex items-center justify-center text-[#7c9473] shadow-2xl animate-float">
            <Zap size={48} />
         </div>
         <div className="space-y-4 text-center md:text-left">
            <h3 className="text-3xl font-outfit font-extrabold text-white tracking-tight">The Art of Hidden Logic</h3>
            <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-2xl opacity-80">
              Spatial reasoning isn't just counting what's there; it's visualizing what *must* be there to support the structure. Use the X-Ray tool to confirm your mental model.
            </p>
         </div>
      </div>

      <style>
        {`
          .rotate-x-60 { transform: rotateX(60deg); }
          .rotate-y-60 { transform: rotateY(60deg); }
          .rotate-z-45 { transform: rotateZ(45deg); }
          .rotate-z-neg45 { transform: rotateZ(-45deg); }
          .preserve-3d { transform-style: preserve-3d; }
        `}
      </style>
    </div>
  );
};

export default NeuralSandbox;


import React, { useState, useEffect } from 'react';
import { LayoutGrid, Star, Calendar, Trash2, ArrowUpRight, Search, Palette, Filter, ShieldCheck } from 'lucide-react';
import { ExhibitItem } from '../types';

const EXHIBIT_STORAGE_KEY = 'designdost_exhibit';

const Exhibit: React.FC = () => {
  const [items, setItems] = useState<ExhibitItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<ExhibitItem | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(EXHIBIT_STORAGE_KEY);
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = items.filter(item => item.id !== id);
    setItems(filtered);
    localStorage.setItem(EXHIBIT_STORAGE_KEY, JSON.stringify(filtered));
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const filteredItems = items.filter(item => 
    item.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.critique.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-[#e89f71]">
            <Palette size={20} className="animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.4em] opacity-80">Curation Protocol</span>
          </div>
          <h1 className="text-5xl font-outfit font-extrabold text-white tracking-tighter">The Exhibit.</h1>
          <p className="text-gray-500 text-lg font-medium opacity-80 max-w-xl">A permanent archive of your creative evolution and high-precision AI critiques.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search archive..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:border-[#e89f71]/50 outline-none transition-all"
          />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="glass-card p-20 rounded-[64px] border border-white/5 text-center space-y-8 opacity-40">
           <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center mx-auto border border-white/10">
              <LayoutGrid size={48} className="text-gray-600" />
           </div>
           <div className="space-y-2">
              <h3 className="text-2xl font-outfit font-bold text-white">No Artifacts Detected</h3>
              <p className="text-sm font-medium text-gray-500">Initialize an AI Review cycle and pin your findings to build your archive.</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, idx) => (
            <div 
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group glass-card rounded-[48px] overflow-hidden border border-white/5 hover:border-[#e89f71]/30 transition-all cursor-pointer reveal flex flex-col h-full"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Work" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-6 right-6">
                   <div className="px-5 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                      <Star size={14} className="text-[#e89f71] fill-[#e89f71]" />
                      <span className="text-sm font-outfit font-bold text-white">{item.score}</span>
                   </div>
                </div>
              </div>
              <div className="p-10 space-y-6 flex-1 flex flex-col">
                <div className="space-y-3 flex-1">
                   <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{new Date(item.date).toLocaleDateString()}</span>
                   <h3 className="text-xl font-outfit font-bold text-white tracking-tight line-clamp-2 leading-snug">{item.prompt}</h3>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                   <div className="flex items-center gap-2 text-[#e89f71] text-[10px] font-bold uppercase tracking-widest">
                      <ShieldCheck size={14} /> AI Evaluated
                   </div>
                   <button 
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-3 bg-white/5 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                   >
                      <Trash2 size={16} />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail View */}
      {selectedItem && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-[#050608]/90 backdrop-blur-3xl animate-in fade-in duration-500 overflow-y-auto">
          <div className="glass-card max-w-5xl w-full rounded-[64px] border border-white/10 overflow-hidden relative max-h-[90vh] flex flex-col md:flex-row">
             <button onClick={() => setSelectedItem(null)} className="absolute top-8 right-8 z-10 p-4 bg-black/40 text-white rounded-2xl hover:bg-black/60 transition-all">
                <Trash2 className="rotate-45" size={24} />
             </button>
             
             <div className="w-full md:w-1/2 bg-black flex items-center justify-center p-4">
                <img src={selectedItem.imageUrl} className="max-h-full max-w-full object-contain rounded-3xl" alt="Exhibit Detail" />
             </div>
             
             <div className="flex-1 p-10 md:p-16 space-y-10 overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                   <span className="text-[10px] font-bold text-[#e89f71] uppercase tracking-[0.4em]">Artifact Record</span>
                   <h2 className="text-3xl font-outfit font-extrabold text-white tracking-tighter">{selectedItem.prompt}</h2>
                   <div className="flex items-center gap-4 text-gray-500 text-xs font-bold pt-2">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} /> {new Date(selectedItem.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-[#e89f71]/10 text-[#e89f71] rounded-full">
                        <Star size={12} fill="currentColor" /> {selectedItem.score}
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center gap-3 text-[#7c9473] border-b border-white/5 pb-4">
                      <ShieldCheck size={20} />
                      <h4 className="font-outfit font-bold text-white text-lg">Critique Archive</h4>
                   </div>
                   <div className="text-gray-400 leading-relaxed space-y-4 text-base italic pr-4">
                      {selectedItem.critique.split('\n').filter(l => !l.includes('SCORE ESTIMATE')).map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                   </div>
                </div>

                <button 
                  onClick={() => setSelectedItem(null)}
                  className="w-full py-5 bg-white/5 border border-white/10 text-gray-400 rounded-3xl font-bold flex items-center justify-center gap-2 hover:text-white hover:bg-white/10 transition-all"
                >
                  Close Archive
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exhibit;

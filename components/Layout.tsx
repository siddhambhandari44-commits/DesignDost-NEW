
import React, { useState, useEffect } from 'react';
import { Home, LayoutDashboard, PenTool, BookOpen, Clock, User, Menu, X, Timer, Sparkles, Zap, Info, Users, LayoutGrid, Maximize, Minimize, Smartphone, Tablet, Monitor } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const navItems = [
    { id: 'home', label: 'Lobby', icon: Home },
    { id: 'dashboard', label: 'Systems', icon: LayoutDashboard },
    { id: 'connect', label: 'Connect', icon: Users },
    { id: 'drawing', label: 'Creative', icon: PenTool },
    { id: 'review', label: 'AI Intel', icon: Sparkles },
    { id: 'exhibit', label: 'Exhibit', icon: LayoutGrid },
    { id: 'mocks', label: 'Simulation', icon: Clock },
    { id: 'timerbuddy', label: 'Chronos', icon: Timer },
    { id: 'about', label: 'Mission', icon: Info },
    { id: 'profile', label: 'Identity', icon: User },
  ];

  const viewportConfig = {
    desktop: { width: '100%', height: '100%', scale: 1 },
    tablet: { width: '768px', height: '1024px', scale: 0.8 },
    mobile: { width: '375px', height: '667px', scale: 0.9 }
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row bg-[#050608] transition-all duration-700 ${viewportMode !== 'desktop' ? 'items-center justify-center p-12' : ''}`}>
      
      {/* Viewport Simulation Frame (only visible if not desktop) */}
      <div 
        className={`flex flex-col md:flex-row w-full transition-all duration-700 bg-[#050608] overflow-hidden ${viewportMode !== 'desktop' ? 'rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 ring-8 ring-white/5' : ''}`}
        style={viewportMode !== 'desktop' ? { 
          width: viewportConfig[viewportMode].width, 
          height: viewportConfig[viewportMode].height,
          transform: `scale(${viewportConfig[viewportMode].scale})`
        } : {}}
      >
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 glass-nav sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#7c9473] rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(124,148,115,0.4)] transition-transform hover:scale-110 active:scale-90">
              <Zap size={18} />
            </div>
            <span className="font-outfit font-bold text-lg tracking-tight gradient-text">DesignDost</span>
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 p-2 hover:bg-white/5 rounded-xl transition-all">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-72 glass-nav transform transition-all duration-500 ease-in-out
          md:translate-x-0 md:static border-r border-white/5
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-8 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-12 group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7c9473] to-[#4b5d44] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-[#7c9473]/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-active:scale-95">
                <Zap size={24} />
              </div>
              <div>
                <span className="font-outfit font-bold text-2xl tracking-tighter block leading-none transition-all group-hover:neon-text">DesignDost</span>
                <span className="text-[10px] font-bold text-[#7c9473] uppercase tracking-[0.3em] block mt-1">v3.5 Intelligence</span>
              </div>
            </div>

            <nav className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group
                    ${activeTab === item.id 
                      ? 'bg-white/5 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/10' 
                      : 'text-gray-500 hover:text-white hover:bg-white/[0.04] hover:scale-[1.02] active:scale-[0.98]'}
                  `}
                >
                  <item.icon size={20} className={`transition-all duration-300 ${activeTab === item.id ? 'text-[#7c9473] scale-110' : 'group-hover:scale-110 group-hover:text-[#7c9473]'}`} />
                  <span className={`font-semibold tracking-wide text-sm ${activeTab === item.id ? 'neon-text' : ''}`}>
                    {item.label}
                  </span>
                  {activeTab === item.id && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7c9473] shadow-[0_0_8px_#7c9473] animate-pulse"></div>
                  )}
                </button>
              ))}
            </nav>

            <div className="mt-auto space-y-4 pt-8 border-t border-white/5">
               <button 
                  onClick={toggleFullscreen}
                  className="w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-gray-500 hover:text-[#7c9473] hover:bg-white/5 transition-all text-sm font-bold"
               >
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                  <span>{isFullscreen ? 'Exit Immersive' : 'Immersive Mode'}</span>
               </button>

               <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5 group hover:border-[#7c9473]/30 hover:bg-white/[0.05] transition-all cursor-default">
                  <div className="flex items-center gap-3 mb-2 text-[#7c9473]">
                     <Sparkles size={16} className="group-hover:animate-spin-slow" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Protocol</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed italic group-hover:text-gray-400 transition-colors">
                    "Designed for students. By a student."
                  </p>
               </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen relative overflow-y-auto overflow-x-hidden">
          <div className="max-w-6xl mx-auto p-6 md:p-12 relative reveal">
            {children}
          </div>
        </main>
      </div>

      {/* Viewport Simulation Controller - Bottom Left */}
      <div className="fixed bottom-8 left-8 z-[100] flex gap-2 p-2 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl">
         <button 
          onClick={() => setViewportMode('desktop')}
          className={`p-3 rounded-2xl transition-all ${viewportMode === 'desktop' ? 'bg-[#7c9473] text-white' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}
          title="Desktop View"
         >
           <Monitor size={20} />
         </button>
         <button 
          onClick={() => setViewportMode('tablet')}
          className={`p-3 rounded-2xl transition-all ${viewportMode === 'tablet' ? 'bg-[#7c9473] text-white' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}
          title="Tablet View"
         >
           <Tablet size={20} />
         </button>
         <button 
          onClick={() => setViewportMode('mobile')}
          className={`p-3 rounded-2xl transition-all ${viewportMode === 'mobile' ? 'bg-[#7c9473] text-white' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}
          title="Mobile View"
         >
           <Smartphone size={20} />
         </button>
      </div>
    </div>
  );
};

export default Layout;

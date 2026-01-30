
import React, { useState, useEffect, useRef } from 'react';
import { Users, Plus, MessageSquare, Heart, Shield, Send, Image as ImageIcon, Sparkles, ChevronLeft, ArrowRight, User, Globe, Target, X, FileText, Paperclip, Download, Share2, Brain, Calculator, Book, PenTool } from 'lucide-react';
import { CommunityNode, CommunityMessage, UserProfile, Badge, CommunityAttachment, SubjectType } from '../types';

const USER_STORAGE_KEY = 'designdost_user';
const COMMUNITIES_STORAGE_KEY = 'designdost_communities';

const INITIAL_NODES: CommunityNode[] = [
  { id: '1', name: 'UCEED 2025 Warriors', description: 'Deep dive into spatial reasoning and NAT protocols.', memberCount: 124, specialty: 'Reasoning', lastActivity: '2m ago' },
  { id: '2', name: 'Gesture Masters', description: 'Daily 30s sketch challenge and peer critique.', memberCount: 89, specialty: 'Drawing', lastActivity: '15m ago' },
  { id: '3', name: 'Material Intel', description: 'Discussing design materials and industrial history.', memberCount: 45, specialty: 'GK', lastActivity: '1h ago' },
];

const SPECIALTIES = [
  { id: SubjectType.REASONING, icon: Brain },
  { id: SubjectType.MATH, icon: Calculator },
  { id: SubjectType.GK, icon: Globe },
  { id: SubjectType.ENGLISH, icon: Book },
  { id: SubjectType.DRAWING, icon: PenTool },
];

const Connect: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [nodes, setNodes] = useState<CommunityNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<CommunityNode | null>(null);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [input, setInput] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<CommunityAttachment | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wasFullscreenRef = useRef(false);

  // Group creation states
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeDesc, setNewNodeDesc] = useState('');
  const [newNodeSpecialty, setNewNodeSpecialty] = useState<string>(SubjectType.REASONING);

  useEffect(() => {
    const savedCommunities = localStorage.getItem(COMMUNITIES_STORAGE_KEY);
    if (savedCommunities) {
      setNodes(JSON.parse(savedCommunities));
    } else {
      setNodes(INITIAL_NODES);
    }
  }, []);

  useEffect(() => {
    if (nodes.length > 0) {
      localStorage.setItem(COMMUNITIES_STORAGE_KEY, JSON.stringify(nodes));
    }
  }, [nodes]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    if (!isImage && !isPDF) {
      alert("DesignDost supports high-fidelity images and PDF documentation only.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPendingAttachment({
        url: reader.result as string,
        type: isImage ? 'image' : 'pdf',
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB'
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';

    if (wasFullscreenRef.current) {
        document.documentElement.requestFullscreen().catch(err => {
            console.warn("Failed to restore fullscreen:", err);
        });
        wasFullscreenRef.current = false;
    }
  };

  const downloadFile = (attachment: CommunityAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const awardCommunityBadge = () => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (savedUser) {
      const profile: UserProfile = JSON.parse(savedUser);
      if (!profile.badges.some(b => b.id === 'community_dost')) {
        const badge: Badge = {
          id: 'community_dost',
          name: 'Community Dost',
          description: 'Contribute to the peer network.',
          icon: 'MessageSquare',
          color: '#d946ef',
          dateEarned: new Date().toISOString()
        };
        profile.badges.push(badge);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
      }
    }
  };

  const handleSendMessage = (isCritique = false) => {
    if (!input.trim() && !pendingAttachment) return;

    const msg: CommunityMessage = {
      id: Date.now().toString(),
      user: user.name,
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCritique,
      attachment: pendingAttachment || undefined
    };

    setMessages([...messages, msg]);
    setInput('');
    setPendingAttachment(null);
    awardCommunityBadge();
  };

  const createNode = () => {
    if (!newNodeName || !newNodeDesc) return;
    
    const newNode: CommunityNode = {
      id: Date.now().toString(),
      name: newNodeName,
      description: newNodeDesc,
      memberCount: 1,
      specialty: newNodeSpecialty,
      lastActivity: 'Just created'
    };

    setNodes([newNode, ...nodes]);
    setShowCreate(false);
    setSelectedNode(newNode);
    setMessages([]);
    setNewNodeName('');
    setNewNodeDesc('');
    awardCommunityBadge();
  };

  const renderAttachment = (attachment: CommunityAttachment) => {
    if (attachment.type === 'image') {
      return (
        <div className="mt-3 rounded-[24px] overflow-hidden border border-white/10 group/img relative cursor-pointer">
          <img src={attachment.url} alt={attachment.name} className="w-full h-auto max-h-80 object-cover transition-transform duration-700 group-hover/img:scale-105" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-all flex flex-col items-center justify-center gap-4">
             <button 
              onClick={(e) => { e.stopPropagation(); downloadFile(attachment); }}
              className="p-4 bg-white text-gray-900 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2 font-bold text-xs"
             >
                <Download size={18} />
                Download
             </button>
             <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">{attachment.name}</p>
          </div>
        </div>
      );
    }
    return (
      <div className="mt-3 p-5 bg-white/[0.03] border border-white/10 rounded-[28px] flex items-center gap-5 group/pdf hover:bg-white/[0.08] transition-all hover:border-white/20">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20 shadow-inner group-hover/pdf:scale-110 transition-transform">
           <FileText size={28} />
        </div>
        <div className="flex-1 min-w-0">
           <p className="text-sm font-bold text-white truncate">{attachment.name}</p>
           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{attachment.size || 'PDF Document'}</p>
        </div>
        <button 
          onClick={() => downloadFile(attachment)}
          className="p-4 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all shadow-sm"
          title="Download PDF"
        >
           <Download size={20} />
        </button>
      </div>
    );
  };

  if (selectedNode) {
    return (
      <div className="max-w-5xl mx-auto h-[82vh] flex flex-col animate-in fade-in slide-in-from-bottom-12 duration-1000">
        {/* Node Header */}
        <div className="flex items-center justify-between glass-card p-6 md:px-10 md:py-8 rounded-t-[48px] border-b-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7c9473]/40 via-transparent to-transparent"></div>
          <div className="flex items-center gap-6">
            <button onClick={() => setSelectedNode(null)} className="p-4 bg-white/5 rounded-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-all">
              <ChevronLeft size={22} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-[10px] font-bold text-[#7c9473] uppercase tracking-[0.3em]">Neural Node Connection</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></span>
              </div>
              <h2 className="text-2xl md:text-3xl font-outfit font-extrabold text-white tracking-tight leading-none">{selectedNode.name}</h2>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-8">
             <div className="text-right">
                <p className="text-base font-outfit font-bold text-white">{selectedNode.memberCount}</p>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Active Links</p>
             </div>
             <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 border border-white/10">
                <Users size={26} />
             </div>
          </div>
        </div>

        {/* Message Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto glass-card p-8 md:p-12 space-y-10 custom-scrollbar rounded-none border-y-0 bg-[#07080a]/40 relative">
           {messages.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-40 py-20">
                <div className="w-24 h-24 bg-white/[0.03] rounded-[40px] flex items-center justify-center border border-white/10 shadow-inner">
                   <MessageSquare size={40} className="text-gray-600" />
                </div>
                <div>
                   <h3 className="text-2xl font-outfit font-bold text-white tracking-tight">Node Buffer Empty</h3>
                   <p className="text-sm font-medium text-gray-500 max-w-xs mx-auto">Upload prototypes or synchronize logic to begin the peer growth sequence.</p>
                </div>
             </div>
           )}
           {messages.map((m) => (
             <div key={m.id} className={`flex ${m.user === user.name ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}>
                <div className={`max-w-[85%] md:max-w-[70%] space-y-2`}>
                   <div className={`flex items-center gap-3 px-2 ${m.user === user.name ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{m.user}</span>
                      <span className="text-[9px] text-gray-700 font-bold">{m.timestamp}</span>
                   </div>
                   <div className={`p-6 rounded-[32px] text-sm md:text-base leading-relaxed shadow-2xl border transition-all duration-500 ${
                     m.user === user.name 
                      ? 'bg-white text-gray-900 font-bold rounded-tr-none border-white' 
                      : m.isCritique 
                        ? 'bg-[#7c9473]/10 text-gray-200 border-[#7c9473]/30 rounded-tl-none' 
                        : 'bg-white/[0.03] text-gray-200 border-white/10 rounded-tl-none backdrop-blur-md'
                   }`}>
                      {m.isCritique && (
                        <div className="flex items-center gap-2 mb-3 text-[#7c9473] font-bold text-[10px] uppercase tracking-[0.3em]">
                           <Sparkles size={14} className="animate-pulse" /> Peer Critique
                        </div>
                      )}
                      {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                      {m.attachment && renderAttachment(m.attachment)}
                   </div>
                </div>
             </div>
           ))}
        </div>

        {/* Pending Attachment Preview */}
        {pendingAttachment && (
          <div className="px-10 py-6 bg-white/[0.02] border-x border-white/10 flex items-center justify-between animate-in slide-in-from-bottom-4 duration-500 backdrop-blur-xl">
             <div className="flex items-center gap-6">
                {pendingAttachment.type === 'image' ? (
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg">
                    <img src={pendingAttachment.url} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20 shadow-inner">
                    <FileText size={32} />
                  </div>
                )}
                <div className="space-y-1">
                   <p className="text-sm font-bold text-white truncate max-w-[250px]">{pendingAttachment.name}</p>
                   <p className="text-[10px] text-[#7c9473] font-bold uppercase tracking-widest flex items-center gap-2">
                     <span className="w-1 h-1 rounded-full bg-[#7c9473] animate-pulse"></span>
                     Pending Synchronization...
                   </p>
                </div>
             </div>
             <button 
              onClick={() => setPendingAttachment(null)}
              className="p-4 bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
             >
                <X size={20} />
             </button>
          </div>
        )}

        {/* Input Area */}
        <div className="glass-card p-6 md:p-10 rounded-b-[48px] border-t-0 bg-black/40">
           <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 rounded-[32px] p-2 pr-4 shadow-inner group-focus-within:border-white/20 transition-all">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileSelect}
                accept="image/*,application/pdf"
              />
              <button 
                onClick={() => {
                    wasFullscreenRef.current = !!document.fullscreenElement;
                    fileInputRef.current?.click();
                }}
                title="Add Media / PDF" 
                className="p-5 text-gray-500 hover:text-[#7c9473] transition-all group/attach relative"
              >
                 <Paperclip size={24} className="group-hover/attach:rotate-45 transition-transform duration-500" />
                 <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#7c9473] rounded-full scale-0 group-hover/attach:scale-100 transition-transform"></div>
              </button>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={pendingAttachment ? "Add a descriptive caption..." : "Sync logic or share designs..."} 
                className="flex-1 bg-transparent border-none outline-none text-white text-base placeholder:text-gray-700 px-2 font-medium"
              />
              <div className="flex gap-3">
                 <button 
                  onClick={() => handleSendMessage(true)}
                  className="px-8 py-3 bg-[#e89f71]/10 border border-[#e89f71]/30 text-[#e89f71] rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#e89f71]/20 transition-all hidden sm:flex items-center gap-2"
                 >
                    <Sparkles size={14} /> Critique
                 </button>
                 <button 
                  onClick={() => handleSendMessage()}
                  className="w-14 h-14 bg-white text-gray-900 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all"
                 >
                    <Send size={22} className="ml-1" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-5">
           <div className="flex items-center gap-3 text-[#7c9473]">
              <Globe size={20} className="animate-spin-slow" />
              <span className="text-[11px] font-bold uppercase tracking-[0.4em] opacity-80">Collective Intelligence</span>
           </div>
           <h1 className="text-5xl md:text-6xl font-outfit font-extrabold text-white tracking-tighter leading-none">Design Communities</h1>
           <p className="text-gray-500 text-lg font-medium opacity-80 max-w-xl">Join specialized nodes to collaborate on spatial reasoning, gesture flows, and material intel with high-performing peers.</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="apple-btn flex items-center justify-center gap-5 px-12 py-6 bg-[#7c9473] text-white rounded-[28px] font-bold text-lg shadow-2xl hover:-translate-y-2 transition-all active:scale-95 group"
        >
          <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" /> Create Node
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[100] bg-[#07080a]/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-in zoom-in-95 duration-700">
           <div className="glass-card p-12 md:p-16 rounded-[64px] border border-white/10 max-w-2xl w-full space-y-10 relative overflow-hidden overflow-y-auto max-h-[90vh] custom-scrollbar">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#7c9473] to-[#e89f71] shadow-[0_0_20px_rgba(124,148,115,0.3)]"></div>
              <div className="flex items-center justify-between">
                 <div>
                    <h2 className="text-3xl font-outfit font-extrabold text-white tracking-tight">Initiate Node</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Establishing Peer Protocol</p>
                 </div>
                 <button onClick={() => setShowCreate(false)} className="p-4 bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-all"><X size={24} /></button>
              </div>
              
              <div className="space-y-10">
                 <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block ml-5">Node Designation</label>
                    <input 
                      type="text" 
                      value={newNodeName}
                      onChange={(e) => setNewNodeName(e.target.value)}
                      placeholder="e.g. UCEED 2025 Warriors" 
                      className="w-full px-8 py-5 rounded-[28px] bg-white/[0.04] border border-white/10 text-white outline-none focus:border-[#7c9473]/50 focus:bg-white/[0.06] transition-all font-bold text-lg placeholder:text-gray-800 shadow-inner"
                    />
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block ml-5">Specialization Protocol</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                       {SPECIALTIES.map((spec) => (
                         <button
                           key={spec.id}
                           onClick={() => setNewNodeSpecialty(spec.id)}
                           className={`p-4 rounded-[24px] border transition-all flex flex-col items-center gap-3 group/spec ${newNodeSpecialty === spec.id ? 'bg-[#7c9473]/10 border-[#7c9473] text-[#7c9473]' : 'bg-white/[0.03] border-white/5 text-gray-600 hover:border-white/20'}`}
                         >
                            <spec.icon size={20} className={newNodeSpecialty === spec.id ? 'scale-110' : 'group-hover/spec:scale-110 transition-transform'} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">{spec.id}</span>
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block ml-5">Mission Directive</label>
                    <textarea 
                      value={newNodeDesc}
                      onChange={(e) => setNewNodeDesc(e.target.value)}
                      placeholder="What specific growth protocol will this node focus on?" 
                      className="w-full h-32 px-8 py-6 rounded-[28px] bg-white/[0.04] border border-white/10 text-white outline-none focus:border-[#7c9473]/50 focus:bg-white/[0.06] transition-all font-medium text-base resize-none placeholder:text-gray-800 shadow-inner"
                    />
                 </div>
                 
                 <button 
                  onClick={createNode}
                  className="w-full py-6 bg-[#7c9473] text-white rounded-[32px] font-bold text-xl shadow-2xl hover:-translate-y-1 transition-all active:scale-95"
                 >
                   Establish Link
                 </button>
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {nodes.map((node, i) => (
          <div 
            key={node.id} 
            className="glass-card p-10 md:p-12 rounded-[56px] border border-white/5 flex flex-col justify-between group hover:border-[#7c9473]/40 transition-all reveal relative overflow-hidden h-full shadow-lg"
            style={{ animationDelay: `${0.2 + i * 0.1}s` }}
          >
            <div className="absolute top-0 right-0 p-10 opacity-5 -mr-4 -mt-4 transition-transform duration-700 group-hover:scale-110"><Target size={120} /></div>
            <div className="space-y-8 relative z-10">
               <div className="flex items-center justify-between">
                  <span className="px-5 py-2 bg-[#7c9473]/10 border border-[#7c9473]/20 text-[#7c9473] text-[9px] font-bold uppercase tracking-[0.2em] rounded-full">
                    {node.specialty} Specialist
                  </span>
                  <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{node.lastActivity}</span>
               </div>
               <div>
                  <h3 className="text-3xl font-outfit font-extrabold text-white mb-3 tracking-tight group-hover:text-[#7c9473] transition-colors">{node.name}</h3>
                  <p className="text-gray-500 text-base font-medium leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity">{node.description}</p>
               </div>
            </div>
            
            <div className="mt-12 flex items-center justify-between relative z-10">
               <div className="flex -space-x-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="w-12 h-12 rounded-2xl border-4 border-[#07080a] bg-gradient-to-br from-[#7c9473] to-[#4b5d44] flex items-center justify-center text-[10px] font-bold text-white shadow-xl transition-transform hover:z-20 hover:scale-110">
                       <User size={16} />
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-2xl border-4 border-[#07080a] bg-white/5 backdrop-blur-md flex items-center justify-center text-[10px] font-bold text-gray-400">
                    +{Math.max(0, node.memberCount - 3)}
                  </div>
               </div>
               <button 
                onClick={() => setSelectedNode(node)}
                className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 group-hover:bg-[#7c9473] group-hover:text-white transition-all shadow-xl group-active:scale-90"
               >
                  <ArrowRight size={28} />
               </button>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-12 md:p-16 rounded-[64px] border border-white/5 bg-gradient-to-br from-[#7c9473]/05 via-transparent to-transparent flex flex-col md:flex-row items-center gap-14 text-center md:text-left reveal shadow-inner" style={{ animationDelay: '0.6s' }}>
         <div className="w-28 h-28 bg-gradient-to-br from-[#e89f71] to-[#b45309] rounded-[48px] flex items-center justify-center text-white shadow-[0_20px_50px_rgba(232,159,113,0.2)] flex-shrink-0 animate-float">
            <Shield size={56} />
         </div>
         <div className="space-y-4">
            <h3 className="text-3xl font-outfit font-extrabold text-white tracking-tight">Peer Critique Protocols</h3>
            <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-2xl opacity-80">
              Connect is optimized for high-trust visual iteration. Every upload, PDF, and critique is a building block for your design portfolio. Share with integrity, critique with empathy.
            </p>
         </div>
      </div>
    </div>
  );
};

export default Connect;


import React, { useState, useEffect } from 'react';
import { ThinkingTag, ReflectionEntry } from '../types';
import { Brain, Check, ChevronRight, X } from 'lucide-react';

interface CognitiveDeconstructionProps {
  taskType: 'Reasoning' | 'Visual' | 'Drawing' | 'Gesture' | 'Mock';
  onComplete: () => void;
  taskId?: string;
}

const TAGS: ThinkingTag[] = [
  'Observation',
  'Assumption',
  'Guess',
  'Rule-based logic',
  'Time pressure',
  'Intuition'
];

const REFLECTION_QUESTIONS: Record<string, string> = {
  'Reasoning': 'What was the first thing you noticed in the problem?',
  'Visual': 'Which visual or factual cue influenced your decision the most?',
  'Drawing': 'What decision did you make early that shaped the entire sketch?',
  'Gesture': 'Where did your attention go first — structure, motion, or detail?',
  'Mock': 'Did you stick to your time allocation strategy?'
};

const CognitiveDeconstruction: React.FC<CognitiveDeconstructionProps> = ({ taskType, onComplete, taskId }) => {
  const [response, setResponse] = useState('');
  const [selectedTags, setSelectedTags] = useState<ThinkingTag[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [history, setHistory] = useState<ReflectionEntry[]>([]);

  // Load history on mount
  useEffect(() => {
    const stored = localStorage.getItem('designdost_reflections');
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  const toggleTag = (tag: ThinkingTag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    const newEntry: ReflectionEntry = {
      id: Date.now().toString(),
      taskId: taskId || Date.now().toString(),
      taskType,
      question: REFLECTION_QUESTIONS[taskType] || REFLECTION_QUESTIONS['Reasoning'],
      userResponse: response,
      tags: selectedTags,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [newEntry, ...history];
    localStorage.setItem('designdost_reflections', JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
    setIsSubmitted(true);
  };

  const getDominantTendencies = () => {
    if (history.length === 0) return [];
    
    const counts: Record<string, number> = {};
    history.forEach(entry => {
      entry.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([tag]) => tag);
  };

  const getCorrectionFocus = (tendencies: string[]) => {
    if (tendencies.includes('Assumption')) return "Verify constraints before forming a hypothesis.";
    if (tendencies.includes('Time pressure')) return "Practice isolating variables faster to reduce panic.";
    if (tendencies.includes('Guess')) return "Identify the exact gap in logic preventing a definitive answer.";
    if (tendencies.includes('Intuition')) return "Back up gut feelings with one concrete piece of evidence.";
    if (tendencies.includes('Observation')) return "Ensure observation translates to actionable execution.";
    return "Maintain analytical distance from the problem.";
  };

  const question = REFLECTION_QUESTIONS[taskType] || REFLECTION_QUESTIONS['Reasoning'];

  if (isSubmitted) {
    const tendencies = getDominantTendencies();
    const correction = getCorrectionFocus(tendencies);

    return (
      <div className="fixed inset-0 z-[2000] bg-[#050608] flex items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="max-w-xl w-full space-y-12">
          <div className="border-l-2 border-white/20 pl-6 space-y-2">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-[0.3em]">Thinking Profile</h2>
            <h1 className="text-3xl font-outfit font-bold text-white tracking-tight">Pattern Analysis</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block">Dominant Tendencies</span>
              <div className="space-y-2">
                {tendencies.length > 0 ? tendencies.map(tag => (
                  <div key={tag} className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300">
                    {tag}
                  </div>
                )) : <div className="text-gray-500 italic text-sm">Insufficient data for pattern match.</div>}
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block">Correction Focus</span>
              <p className="text-lg font-medium text-white leading-relaxed">
                {correction}
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5">
             <div className="bg-[#7c9473]/10 border border-[#7c9473]/20 p-6 rounded-xl">
                <span className="text-[10px] font-bold text-[#7c9473] uppercase tracking-widest block mb-2">Next Attempt Directive</span>
                <p className="text-gray-400 font-medium">"Next time, delay commitment by 10 seconds and scan for constraints."</p>
             </div>
          </div>

          <button 
            onClick={onComplete}
            className="w-full py-5 bg-white text-gray-900 font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors rounded-lg"
          >
            Acknowledge & Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[2000] bg-[#050608]/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="max-w-lg w-full space-y-10">
        <div className="space-y-2 text-center">
           <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
              <Brain size={20} className="text-gray-400" />
           </div>
           <h2 className="text-2xl font-outfit font-bold text-white tracking-tight">How did you think?</h2>
           <p className="text-gray-500 font-medium text-lg leading-relaxed">{question}</p>
        </div>

        <div className="space-y-6">
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Type your reflection here (1-2 sentences)..."
            className="w-full h-32 bg-white/[0.03] border border-white/10 rounded-xl p-5 text-gray-300 placeholder:text-gray-700 outline-none focus:border-white/20 transition-all resize-none text-base"
            autoFocus
          />

          <div className="space-y-3">
             <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block">Tag Factors</span>
             <div className="flex flex-wrap gap-2">
                {TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full border text-xs font-medium transition-all ${
                      selectedTags.includes(tag) 
                        ? 'bg-white text-black border-white' 
                        : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
             </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between">
           <button onClick={onComplete} className="text-gray-600 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
             Skip Reflection
           </button>
           <button 
            onClick={handleSubmit}
            disabled={!response.trim() && selectedTags.length === 0}
            className="flex items-center gap-2 px-8 py-3 bg-[#7c9473] text-white rounded-lg font-bold text-sm hover:bg-[#6b8263] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
           >
             Analyze <ChevronRight size={16} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default CognitiveDeconstruction;

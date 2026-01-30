import { GoogleGenAI, Type } from "@google/genai";
import { Question, SubjectType, QuestionType, ChatMessage, SessionResult, QuestionMetric, Flashcard } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuestions = async (
  subject: SubjectType | 'Mock',
  topic: string,
  count: number,
  difficulty: string
): Promise<Question[]> => {
  const systemInstruction = `You are a world-class expert UCEED exam paper setter. 
  UCEED Part A questions are visual-logic, mathematical, and conceptual.
  
  GENERATE QUESTIONS BASED ON THESE CATEGORIES:
  1. NAT: Counting geometric shapes, gear math, coordinate patterns, 3D transformations.
  2. MSQ: Spatial reasoning logic, design history facts, material science properties.
  3. MCQ: Pattern recognition logic, visual puzzles described in text.
  
  Format: JSON array. Precision is key. No image URLs.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate ${count} ${difficulty} level questions for ${topic}. All questions must be text-based logic or mathematical reasoning.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING },
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              topic: { type: Type.STRING },
            },
            required: ["id", "type", "text", "options", "correctAnswer", "explanation", "difficulty", "topic"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text).map((q: any) => {
      if (q.type === QuestionType.MSQ) {
        try {
          const parsed = typeof q.correctAnswer === 'string' && q.correctAnswer.startsWith('[')
            ? JSON.parse(q.correctAnswer)
            : q.correctAnswer;
          return { ...q, correctAnswer: Array.isArray(parsed) ? parsed : [parsed] };
        } catch (e) {
          return { ...q, correctAnswer: [q.correctAnswer] };
        }
      }
      return q;
    });
  } catch (error) {
    console.error("Error generating questions:", error);
    return [];
  }
};

export const generateFlashcards = async (
  subject: string,
  topic: string,
  count: number
): Promise<Flashcard[]> => {
  const systemInstruction = `You are a high-speed design study liaison. Create bite-sized, high-fidelity flashcards for design entrance exams like UCEED.
  Front: A concept, term, or short riddle.
  Back: A concise, technical, yet easy-to-understand explanation or application.
  Focus on technical precision and visual thinking.
  
  Format: JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate ${count} flashcards for the topic: ${topic} under ${subject}.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              front: { type: Type.STRING },
              back: { type: Type.STRING },
              topic: { type: Type.STRING }
            },
            required: ["id", "front", "back", "topic"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Flashcard generation error:", error);
    return [];
  }
};

export const generateSessionInsights = async (
  session: { topic: string; score: number; total: number; timeSpent: number; metrics: QuestionMetric[] },
  history: SessionResult[]
): Promise<{ feedback: string; recommendedCount: number; recommendedDifficulty: string }> => {
  const systemInstruction = `You are Mitra, a high-tech design study liaison.
  Analyze the current session's granular data (accuracy and time per question) and history to provide 1-2 punchy sentences of feedback.
  
  TONE & FORMAT:
  - Be direct and analytical.
  - Example: "You’re weak in Mechanical Reasoning under time pressure. Practice 5 medium questions now."
  - Identify specific topics with poor accuracy or high time-spent (e.g. > 45s per question).
  - Use "time pressure" if average time for incorrect questions is high.
  
  Response must be JSON.`;

  const context = `Current Session Data: ${JSON.stringify(session)}. Recent History: ${JSON.stringify(history.slice(0, 3))}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: context,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING },
            recommendedCount: { type: Type.NUMBER },
            recommendedDifficulty: { type: Type.STRING }
          },
          required: ["feedback", "recommendedCount", "recommendedDifficulty"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { 
      feedback: "Consistent practice is the key to spatial mastery. Keep refining your visual logic nodes.",
      recommendedCount: 5,
      recommendedDifficulty: "Medium"
    };
  }
};

export const generateDrawingPrompt = async (): Promise<string> => {
  const systemInstruction = `Provide concise, concentrated Part B UCEED prompts.
  Format:
  SCENARIO: [One sentence]
  PERSPECTIVE: [Viewpoint]
  REQUIREMENTS: [3 items]
  FOCUS: [Challenge]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Create a challenging situation drawing prompt.",
      config: { systemInstruction }
    });
    return response.text || "SCENARIO: A busy tea stall in monsoon.\nPERSPECTIVE: Eye-level.\nREQUIREMENTS: Kettle, rain, customers.\nFOCUS: Depth.";
  } catch (error) {
    return "SCENARIO: An ant's view of oversized sneakers.\nPERSPECTIVE: Worm's eye.\nREQUIREMENTS: Shoelaces, person, grass.\nFOCUS: Scale.";
  }
};

export const chatWithMitra = async (
  userName: string,
  history: SessionResult[],
  chatHistory: ChatMessage[],
  newMessage: string,
  useThinking: boolean = false
): Promise<string> => {
  const performanceContext = history.length > 0 
    ? `Student Stats: ${JSON.stringify(history.slice(0, 3).map(h => ({ topic: h.topic, score: `${h.score}/${h.total}` })))}`
    : "No tests taken.";

  const systemInstruction = `You are "Mitra", a high-tech AI study liaison for DesignDost.
  
  STRICT RULES:
  1. NO MARKDOWN HEADERS: Absolutely NO '#' or '##'. 
  2. NO OVER-BOLDING: Minimize '**'. Use standard text for flow.
  3. CONCISE: Max 50-70 words. Slay the fluff.
  4. DIRECT: No greeting "I'm here to help". Answer the prompt immediately.
  5. CREDIBILITY: Use professional, futuristic, and precise design terminology.
  
  User: ${userName}
  Context: ${performanceContext}`;

  try {
    const config: any = {
      systemInstruction,
      temperature: 0.7,
      topP: 0.9,
    };

    if (useThinking) {
      config.thinkingConfig = { thinkingBudget: 32768 };
    }

    const response = await ai.models.generateContent({
      model: useThinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
      contents: newMessage,
      config
    });

    return response.text || "Neural link stable. Proceed with next query.";
  } catch (error) {
    console.error("Mitra Chat Error:", error);
    return "Signal disruption. Retrying liaison...";
  }
};

export const analyzeDrawing = async (
  base64Data: string,
  mimeType: string,
  userPrompt?: string
): Promise<string> => {
  const systemInstruction = `You are an expert UCEED/CEED Design Evaluator with 20 years of experience.
  Perform a technical, academic analysis of this design drawing based on the official examination manual.
  
  EVALUATION CATEGORIES:
  1. PERSPECTIVE: Evaluate vanishing points, eye-level consistency, structural foreshortening, and volume.
  2. COMPOSITION: Evaluate rule of thirds, frame usage, focal point placement, and visual hierarchy.
  3. RENDERING & TEXTURE: Evaluate light-source consistency, material depiction (metal/wood/fabric), and tonal value range.
  4. STORYTELLING & IMAGINATION: Evaluate narrative clarity, character interaction, and environmental context.

  For EACH category, you MUST provide:
  - A score out of 10.
  - At least 2 actionable, specific suggestions for improvement aligned with UCEED/CEED criteria.

  FORMAT RULES:
  - Use format: "[CATEGORY NAME]: [Score]/10" on its own line.
  - Use "-" for specific suggestions.
  - Final line: "SCORE ESTIMATE: [Weighted Total]/100".
  - Be critical, professional, and precise. Do NOT use markdown headers (#).`;

  const promptPart = { text: `Critique this design work for a design entrance exam. ${userPrompt ? `Original exam prompt was: "${userPrompt}"` : "General sketch practice."}` };
  const imagePart = { inlineData: { data: base64Data, mimeType } };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [imagePart, promptPart] },
      config: { 
        systemInstruction,
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    return response.text || "Analysis engine failed to render. Please resubmit image.";
  } catch (error) {
    console.error("Drawing Analysis Error:", error);
    return "Technical connection error. Ensure image clarity and retry.";
  }
};

export interface LensMission {
  id: string;
  title: string;
  brief: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Study';
  category: string;
}

export const generateLensMission = async (
  difficulty: string
): Promise<LensMission> => {
  const systemInstruction = `You are a design instructor creating "World Lens" missions.
  These missions require students to find and photograph real-world objects that demonstrate specific design principles.
  
  DIFFICULTY LEVELS:
  - Easy: Common objects (e.g., "A red cylinder", "Something with a rough texture").
  - Medium: Abstract concepts (e.g., "Visual rhythm", "Asymmetry", "Negative space").
  - Hard: Complex or rare combinations (e.g., "Juxtaposition of organic and geometric", "Subsurface scattering").
  - Study: Specific study items (e.g. "A study lamp", "A pencil sketch").
  
  Output JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a ${difficulty} difficulty design photography mission.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            brief: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            category: { type: Type.STRING },
          },
          required: ["id", "title", "brief", "difficulty", "category"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Lens Mission Gen Error:", error);
    return {
      id: "fallback",
      title: "Texture Hunt",
      brief: "Find an object with a rough, abrasive texture.",
      difficulty: "Easy",
      category: "Texture"
    } as LensMission;
  }
};

export const analyzeLensCapture = async (
  base64Data: string,
  mission: LensMission
): Promise<{ success: boolean; feedback: string; xp: number; score: number }> => {
  const systemInstruction = `You are an AI design evaluator. 
  The user was given a mission: "${mission.title} - ${mission.brief}".
  They have uploaded a photo.
  
  Evaluate if the photo matches the mission criteria.
  Provide:
  - success: boolean
  - feedback: Short, constructive critique (max 2 sentences).
  - score: 0-100 based on accuracy and aesthetic.
  - xp: 0-50 based on difficulty and success.
  
  JSON Output.`;

  const imagePart = { inlineData: { data: base64Data, mimeType: 'image/jpeg' } };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [imagePart, { text: "Analyze this image against the mission." }] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            success: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING },
            score: { type: Type.NUMBER },
            xp: { type: Type.NUMBER }
          },
          required: ["success", "feedback", "score", "xp"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Lens Analysis Error:", error);
    return {
      success: false,
      feedback: "Analysis failed. Ensure image is clear.",
      score: 0,
      xp: 0
    };
  }
};

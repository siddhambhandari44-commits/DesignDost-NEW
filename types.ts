
export enum ExamType {
  UCEED = 'UCEED',
  CEED = 'CEED',
  NID = 'NID DAT',
  NIFT = 'NIFT',
  JEE_BARCH = 'JEE B.Arch',
  NATA = 'NATA'
}

export enum SubjectType {
  REASONING = 'Reasoning',
  MATH = 'Math',
  GK = 'GK',
  ENGLISH = 'English',
  DRAWING = 'Drawing',
  DESIGN_PRINCIPLES = 'Design Principles'
}

export enum QuestionType {
  MCQ = 'MCQ',
  MSQ = 'MSQ',
  NAT = 'NAT'
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  dateEarned: string;
}

export type ThinkingTag = 'Observation' | 'Assumption' | 'Guess' | 'Rule-based logic' | 'Time pressure' | 'Intuition';

export interface ReflectionEntry {
  id: string;
  taskId: string; // ID of the session or specific drawing
  taskType: string; // Reasoning, Drawing, Gesture, etc.
  question: string;
  userResponse: string;
  tags: ThinkingTag[];
  timestamp: string;
}

export interface UserProfile {
  name: string;
  targetExam: string;
  onboarded: boolean;
  xp: number;
  streak: number;
  lastActive: string;
  badges: Badge[];
  sessionsCompleted: number;
  reflections?: ReflectionEntry[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ExhibitItem {
  id: string;
  imageUrl: string;
  prompt: string;
  critique: string;
  score: string;
  date: string;
}

export interface CommunityAttachment {
  url: string;
  type: 'image' | 'pdf';
  name: string;
  size?: string;
}

export interface CommunityMessage {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  isCritique?: boolean;
  attachment?: CommunityAttachment;
}

export interface CommunityNode {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  specialty: string;
  lastActivity: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  imageUrl?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
}

export interface SavedFlashcardSession {
  subject: string;
  topic: string;
  cards: Flashcard[];
  currentIndex: number;
  masteredIds: string[];
}

export interface CountdownData {
  name: string;
  date: string;
  id: ExamType;
}

export interface SavedSession {
  subject: SubjectType | 'Mock';
  topic: string;
  count: number;
  difficulty: string;
  currentIndex: number;
  score: number;
  timer: number;
  questions: Question[];
}

export interface QuestionMetric {
  topic: string;
  isCorrect: boolean;
  timeSpent: number;
}

export interface SessionResult {
  id: string;
  date: string;
  subject: string;
  topic: string;
  score: number;
  total: number;
  timeSpent: number;
  metrics?: QuestionMetric[];
}

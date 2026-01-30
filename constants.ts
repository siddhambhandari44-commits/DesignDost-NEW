
import { ExamType, SubjectType, CountdownData } from './types';

export const EXAM_DATES: CountdownData[] = [
  { name: 'UCEED 2025', date: '2025-01-19T09:00:00', id: ExamType.UCEED },
  { name: 'CEED 2025', date: '2025-01-19T09:00:00', id: ExamType.CEED },
  { name: 'NID DAT 2025', date: '2025-12-24T10:00:00', id: ExamType.NID },
  { name: 'NIFT 2025', date: '2025-02-05T09:00:00', id: ExamType.NIFT },
];

export const TOPICS = {
  [SubjectType.REASONING]: [
    'Mechanical Reasoning',
    'Gears',
    'Pulleys',
    'Levers',
    'Belts & Chains',
    'Analytical Reasoning',
    'Logical Reasoning',
    'Pattern Recognition'
  ],
  [SubjectType.MATH]: [
    'Ratio & Proportion',
    'Percentages',
    'Averages',
    'Geometry',
    'Mensuration',
    'Speed, Time & Distance',
    'Basic Algebra'
  ],
  [SubjectType.GK]: [
    'Design Awareness',
    'Architecture & Monuments',
    'Art & Artists',
    'Product & Industrial Design',
    'Current Affairs (Design & Innovation)'
  ],
  [SubjectType.ENGLISH]: [
    'Vocabulary',
    'Reading Comprehension',
    'Grammar',
    'Sentence Formation'
  ],
  [SubjectType.DESIGN_PRINCIPLES]: [
    'Gestalt Laws',
    'Visual Hierarchy',
    'Color Theory',
    'Typography Principles',
    'Balance & Contrast',
    'Emphasis & Unity',
    'Grids & Composition'
  ]
};

export const COLORS = {
  primary: '#7c9473', // Cyber Sage
  bg: '#07080a',      // Near-black for eye comfort
  surface: '#10131a', // Deep surface
  accent: '#e89f71',  // Plasma Sunset
  text: '#cbd5e1',    // Softer off-white
  muted: '#64748b'    // Darker muted text
};

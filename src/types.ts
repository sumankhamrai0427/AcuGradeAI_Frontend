export type Board = 'CBSE' | 'ICSE' | 'ISC' | 'UK-Cambridge' | 'NCERT' | 'NEET' | 'IIT';

export type ClassGrade = 
  | 'Class 5' 
  | 'Class 6' 
  | 'Class 7' 
  | 'Class 8' 
  | 'Class 9' 
  | 'Class 10' 
  | 'Class 11' 
  | 'Class 12';

export type Subject = 
  | 'Mathematics' 
  | 'Physics' 
  | 'Chemistry' 
  | 'Biology' 
  | 'Science' 
  | 'Social Studies' 
  | 'English' 
  | 'Computer Science' 
  | 'Logical Reasoning';

export type ExamDifficulty = 'simple' | 'medium' | 'hard';

export type QuestionType = 'mcq' | 'objective' | 'numerical' | 'logical';

export interface ReferenceLink {
  title: string;
  source: string;
  url: string;
  description: string;
  type: 'video' | 'article' | 'official_syllabus' | 'practice';
}

export interface Question {
  id: string;
  questionNumber: number;
  type: QuestionType;
  questionText: string;
  options?: string[]; // for MCQ
  correctAnswer: string;
  explanation: string;
  difficulty: ExamDifficulty;
  marks: number; // 1 mark each
  topic: string;
  board: Board;
  referenceLinks?: ReferenceLink[];
  hint?: string;
}

export interface Exam {
  id: string;
  title: string;
  board: Board;
  classGrade: ClassGrade;
  subject: Subject;
  difficulty: ExamDifficulty;
  totalMarks: number; // 10 marks
  questionCount: number; // 10 questions
  timeLimitMinutes: number; // default 15
  questions: Question[];
  ragKnowledgeNodesUsed: string[];
  createdAt: string;
}

export interface QuestionEvaluation {
  questionId: string;
  questionNumber: number;
  type: QuestionType;
  questionText: string;
  options?: string[];
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  marksAwarded: number; // 0 or 1
  explanation: string;
  misconceptionIdentified?: string;
  referenceLinks: ReferenceLink[];
  topic: string;
}

export interface KGraphInsight {
  topic: string;
  masteryPercentage: number;
  status: 'mastered' | 'reinforce' | 'critical_gap';
  recommendedAction: string;
}

export interface DiagnosticAnalysis {
  overallBand: 'Needs Foundation' | 'Developing' | 'Proficient' | 'Advanced Mastery' | 'Competitive Ready';
  masteryScorePercentage: number;
  strengths: string[];
  areasToImprove: string[];
  kGraphInsights: KGraphInsight[];
  evolutionaryRoadmap: string;
  encouragementNote: string;
  recommendedNextExam: {
    board: Board;
    classGrade: ClassGrade;
    subject: Subject;
    difficulty: ExamDifficulty;
    reason: string;
  };
  curatedStudyLinks: ReferenceLink[];
}

export interface ExamSubmission {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  board: Board;
  classGrade: ClassGrade;
  subject: Subject;
  difficulty: ExamDifficulty;
  answers: Record<string, string>; // questionId -> answer
  marksObtained: number; // out of 10
  totalMarks: number; // 10
  accuracyPercentage: number;
  timeTakenSeconds: number;
  submittedAt: string;
  evaluations: QuestionEvaluation[];
  analysis: DiagnosticAnalysis;
}

export interface ChildAccount {
  id: string;
  parentId: string;
  name: string;
  avatar: string;
  classGrade: ClassGrade;
  targetBoard: Board;
  schoolName?: string;
  pin: string;
  dailyExamsTakenToday: number;
  lastExamDate?: string;
  totalExamsTaken: number;
  averageScore: number; // out of 10
  topicMastery: Record<string, number>; // topic -> percentage 0..100
  streakDays: number;
  createdAt: string;
  // Gamification fields
  xp?: number;
  level?: number;
  earnedBadgeIds?: string[];
}

// Gamification Models
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond';
export type BadgeCategory = 'mastery' | 'streak' | 'score' | 'speed' | 'explorer';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: BadgeTier;
  category: BadgeCategory;
  xpReward: number;
  requirementText: string;
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  avatar: string;
  classGrade: ClassGrade;
  targetBoard: Board;
  schoolName?: string;
  xp: number;
  level: number;
  averageScore: number;
  examsCompleted: number;
  streakDays: number;
  badgesCount: number;
  isCurrentStudent?: boolean;
}

// Adaptive Learning Path Models
export type LearningPathStatus = 'locked' | 'available' | 'in_progress' | 'mastered' | 'remedial_needed';
export type LearningLevel = 'foundational' | 'intermediate' | 'advanced_hots';

export interface LearningPathNode {
  id: string;
  topic: string;
  chapterName: string;
  subject: Subject;
  classGrade: ClassGrade;
  board: Board;
  status: LearningPathStatus;
  masteryPercentage: number;
  level: LearningLevel;
  prerequisites: string[];
  keyConcepts: string[];
  commonMisconceptions: string[];
  curatedResources: ReferenceLink[];
  practiceExamConfig: {
    board: Board;
    classGrade: ClassGrade;
    subject: Subject;
    difficulty: ExamDifficulty;
    focusTopic: string;
  };
  recommendedReason: string;
}

// Parent-Teacher Communication Models
export interface TeacherContact {
  id: string;
  name: string;
  role: string;
  subject: Subject | 'All Subjects' | 'Class Advisor';
  schoolName: string;
  email: string;
  avatar: string;
  phone?: string;
  verified: boolean;
}

export interface ParentTeacherMessage {
  id: string;
  parentId: string;
  parentName: string;
  teacherId: string;
  teacherName: string;
  childId: string;
  childName: string;
  senderRole: 'parent' | 'teacher';
  message: string;
  timestamp: string;
  attachedSubmissionId?: string;
  attachedSubmissionTitle?: string;
  actionItems?: string[];
  status: 'sent' | 'delivered' | 'read' | 'action_taken';
}

export interface SharedDossier {
  id: string;
  childId: string;
  childName: string;
  parentName: string;
  shareToken: string;
  createdAt: string;
  expiresAt: string;
  notes: string;
  recipients: string[];
  includedSubmissionsCount: number;
  status: 'active' | 'revoked';
}

export type SubscriptionTier = 'free' | 'scholar_pro' | 'genius_competitive';

export interface ParentAccount {
  id: string;
  name: string;
  email: string;
  role: 'parent';
  subscriptionTier: SubscriptionTier;
  subscriptionExpiry?: string;
  children: ChildAccount[];
  createdAt: string;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

export interface RunbookKGraphNode {
  id: string;
  board: Board;
  classGrade: ClassGrade;
  subject: Subject;
  chapterName: string;
  coreConcepts: string[];
  keyFormulasOrRules: string[];
  commonTraps: string[];
  curatedReferenceUrls: ReferenceLink[];
  sampleQuestionArchetypes: string[];
  difficultyCalibration: {
    simple: string;
    medium: string;
    hard: string;
  };
  lastUpdated: string;
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  badge?: string;
  description: string;
  features: string[];
  dailyExamLimit: number | 'unlimited';
  maxChildren: number | 'unlimited';
  isPopular?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: string;
  authorRole: string;
  readTime: string;
  publishedDate: string;
  category: 'Board Strategies' | 'NEET & IIT' | 'Parenting & Pedagogy' | 'AI & RAG Learning';
  summary: string;
  content: string[];
  tags: string[];
}

export interface ScienceJokeOrAnecdote {
  id: string;
  category: 'anecdote' | 'joke' | 'fact' | 'riddle';
  title: string;
  subject: 'Physics' | 'Mathematics' | 'Chemistry' | 'Biology' | 'General Science' | 'History of Science';
  setupOrStory: string;
  punchlineOrTakeaway?: string;
  characterOrOrigin?: string;
  funReactionEmoji: string;
  likesCount: number;
}

export type BrainBreakGameType = 'speed-math' | 'memory-match' | 'word-scramble' | 'particle-pop' | 'anecdote-vault';

export type AppPersona = 'parent' | 'child';

export interface MenuItemPermission {
  id: number;
  pageName: string;
  pageRoute: string;
  icon: string | null;
  menuOrder: number;
}

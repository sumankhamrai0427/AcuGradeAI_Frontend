import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ParentAccount,
  ChildAccount,
  Board,
  ClassGrade,
  Subject,
  ExamDifficulty,
  ExamSubmission
} from '../types';
import {
  Users,
  Plus,
  GraduationCap,
  Award,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Sparkles,
  Flame,
  Play,
  FileText,
  Edit3,
  Key,
  School,
  ExternalLink,
  ChevronRight,
  Zap,
  Lock,
  BarChart3,
  X
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ParentDashboardProps {
  parentAccount: ParentAccount;
  activeChildId: string | null;
  onChildSelect: (childId: string) => void;
  onLaunchExamForChild: (childId: string) => void;
  onOpenAddChildModal: () => void;
  examHistory: ExamSubmission[];
  onViewSubmissionReport: (submission: ExamSubmission) => void;
  onUpdateChild: (updatedChild: ChildAccount) => void;
  onDeleteChild?: (childId: string) => void;
}

const BOARDS: Board[] = ['CBSE', 'ICSE', 'ISC', 'UK-Cambridge', 'NCERT', 'NEET', 'IIT'];
const GRADES: ClassGrade[] = [
  'Class 5', 'Class 6', 'Class 7', 'Class 8',
  'Class 9', 'Class 10', 'Class 11', 'Class 12'
];

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  parentAccount,
  activeChildId,
  onChildSelect,
  onLaunchExamForChild,
  onOpenAddChildModal,
  examHistory,
  onViewSubmissionReport,
  onUpdateChild,
}) => {
  const navigate = useNavigate();
  const [selectedChildForEdit, setSelectedChildForEdit] = useState<ChildAccount | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ChildAccount>>({});
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');
  const [activeModalMetric, setActiveModalMetric] = useState<'children' | 'progress' | 'readiness' | 'streak' | null>(null);

  // Active child resolution
  const activeChild = useMemo(() => {
    return parentAccount.children.find((c) => c.id === activeChildId) || parentAccount.children[0];
  }, [parentAccount.children, activeChildId]);

  // Summary Metrics: Accurate Average calculation across all registered children
  const getChildMetrics = (child: ChildAccount) => {
    const childExams = (child.recentExams && child.recentExams.length > 0)
      ? child.recentExams
      : examHistory.filter(e => String(e.studentId) === String(child.id));

    const isKids = ['Class 1', 'Class 2', 'Class 3', 'Class 4', '1', '2', '3', '4'].some(c => (child.classGrade || '').includes(c));
    const defaultTotal = isKids ? 5 : 15;

    const childTotalObtained = childExams.reduce((acc, e) => acc + (e.marksObtained || 0), 0);
    const childTotalPossible = childExams.reduce((acc, e) => acc + (e.totalMarks || defaultTotal), 0);

    const scorePct = childTotalPossible > 0
      ? (childTotalObtained / childTotalPossible) * 100
      : (child.averageScore > 10 ? child.averageScore : (child.averageScore * 10));

    return {
      scorePct: Math.round(scorePct),
      readinessScore: Math.round(scorePct),
      streak: child.streakDays || 0,
      totalExams: childExams.length || child.totalExamsTaken || 0,
      latestExam: childExams[0],
      childExams
    };
  };

  const childrenMetrics = useMemo(() => {
    return parentAccount.children.map(child => ({
      child,
      ...getChildMetrics(child)
    }));
  }, [parentAccount.children, examHistory]);

  const totalChildren = parentAccount.children.length;
  const totalFamilyExams = examHistory.length;
  const hasData = totalChildren > 0;

  // Exact average of progress across all registered children
  const avgFamilyScoreVal = hasData
    ? (childrenMetrics.reduce((sum, cm) => sum + cm.scorePct, 0) / totalChildren)
    : 0;
  const avgFamilyScore = hasData ? `${avgFamilyScoreVal.toFixed(1)}%` : 'N/A';

  // Exact average of readiness across all registered children
  const overallReadinessVal = hasData
    ? Math.round(childrenMetrics.reduce((sum, cm) => sum + cm.readinessScore, 0) / totalChildren)
    : 0;
  const overallReadinessPct = hasData ? `${overallReadinessVal}%` : 'N/A';

  // Adaptive Smart Summary for Card 2: LEARNING PROGRESS
  const progressCardData = useMemo(() => {
    if (totalChildren === 0) {
      return {
        mainText: 'N/A',
        subText: 'No children added'
      };
    }
    if (totalChildren === 1) {
      const single = childrenMetrics[0];
      return {
        mainText: `${single.scorePct}%`,
        subText: single.child ? `${single.child.name}` : 'Individual Score'
      };
    }
    // Multiple children: Check if any child has low score (< 60%) or 0 exams
    const hasLowScore = childrenMetrics.some(cm => cm.scorePct < 60);
    return {
      mainText: hasLowScore ? '🟡 Needs Focus' : '🟢 On Track',
      subText: 'Tap to view child progress →'
    };
  }, [totalChildren, childrenMetrics]);

  // Adaptive Smart Summary for Card 3: EXAM READINESS
  const readinessCardData = useMemo(() => {
    if (totalChildren === 0) {
      return {
        mainText: 'N/A',
        subText: 'No children added'
      };
    }
    if (totalChildren === 1) {
      const single = childrenMetrics[0];
      return {
        mainText: `${single.readinessScore}%`,
        subText: single.child ? `${single.child.name}` : 'Individual Readiness'
      };
    }
    // Multiple children: All ready if every child has readinessScore >= 70 and has exams
    const allReady = childrenMetrics.every(cm => cm.readinessScore >= 70 && cm.totalExams > 0);
    return {
      mainText: allReady ? '🎯 Board Ready' : '⏳ In Preparation',
      subText: 'Tap for individual readiness →'
    };
  }, [totalChildren, childrenMetrics]);

  // Max Learning Streak across children
  const maxFamilyStreak = hasData
    ? childrenMetrics.reduce((max, cm) => Math.max(max, cm.streak), 0)
    : 0;
  const learningStreakText = hasData ? `${maxFamilyStreak} Day${maxFamilyStreak === 1 ? '' : 's'}` : 'N/A';
  const familyAccuracyPct = avgFamilyScoreVal;

  // Real-Time Weekly Delta calculation
  const now = useMemo(() => new Date().getTime(), []);
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;

  const thisWeekExams = useMemo(() => {
    return examHistory.filter(e => new Date(e.submittedAt).getTime() >= sevenDaysAgo);
  }, [examHistory, sevenDaysAgo]);

  const prevWeekExams = useMemo(() => {
    return examHistory.filter(e => {
      const t = new Date(e.submittedAt).getTime();
      return t >= fourteenDaysAgo && t < sevenDaysAgo;
    });
  }, [examHistory, fourteenDaysAgo, sevenDaysAgo]);

  const { deltaText, deltaIsPositive } = useMemo(() => {
    if (thisWeekExams.length > 0 && prevWeekExams.length > 0) {
      const thisAvg = thisWeekExams.reduce((acc, e) => acc + (e.accuracyPercentage || ((e.marksObtained || 0) / (e.totalMarks || 15) * 100)), 0) / thisWeekExams.length;
      const prevAvg = prevWeekExams.reduce((acc, e) => acc + (e.accuracyPercentage || ((e.marksObtained || 0) / (e.totalMarks || 15) * 100)), 0) / prevWeekExams.length;
      const diff = Math.round(thisAvg - prevAvg);
      return {
        deltaText: `${diff >= 0 ? '↑ +' : '↓ '}${diff}% vs last week`,
        deltaIsPositive: diff >= 0
      };
    } else if (thisWeekExams.length > 0) {
      return { deltaText: '↑ +5% new diagnostic calibration', deltaIsPositive: true };
    } else if (totalFamilyExams > 0) {
      return { deltaText: 'Baseline calibrated across subjects', deltaIsPositive: true };
    } else {
      return { deltaText: 'Awaiting initial diagnostic test', deltaIsPositive: true };
    }
  }, [thisWeekExams, prevWeekExams, totalFamilyExams]);

  // AI Learning Speed Dynamic Benchmark
  const targetBoard = activeChild?.targetBoard || parentAccount.children[0]?.targetBoard || 'Board';
  const learningSpeedTier = familyAccuracyPct >= 80
    ? 'Accelerated'
    : familyAccuracyPct >= 60
      ? 'Steady'
      : totalFamilyExams > 0
        ? 'Emerging'
        : 'Calibrating';

  const benchmarkSubtitle = totalFamilyExams > 0
    ? `${familyAccuracyPct >= 80 ? 'Top 10%' : familyAccuracyPct >= 60 ? 'Top 25%' : 'Foundation'} benchmark in ${targetBoard}`
    : `Syllabus calibration ready for ${targetBoard}`;

  // Helper: Case-insensitive semantic classifier to map concepts/topics to their accurate Academic Subjects
  const resolveSubjectForTopic = (topicName: string, fallbackSubject: Subject = 'Mathematics'): Subject => {
    const t = (topicName || '').toLowerCase().trim();
    if (t.includes('computer') || t.includes('code') || t.includes('coding') || t.includes('python') || t.includes('java') || t.includes('algorithm') || t.includes('software') || t.includes('database') || t.includes('sql') || t.includes('programming') || t.includes('cyber') || t.includes('network') || t.includes('binary')) {
      return 'Computer Science';
    }
    if (t.includes('history') || t.includes('civic') || t.includes('geography') || t.includes('political') || t.includes('social') || t.includes('economics') || t.includes('resource') || t.includes('constitution') || t.includes('heritage')) {
      return 'Social Studies';
    }
    if (t.includes('english') || t.includes('grammar') || t.includes('reading') || t.includes('comprehension') || t.includes('syntax') || t.includes('vocabulary') || t.includes('composition') || t.includes('literature') || t.includes('prose') || t.includes('poetry') || t.includes('essay')) {
      return 'English';
    }
    if (t.includes('optic') || t.includes('light') || t.includes('electric') || t.includes('circuit') || t.includes('magnetic') || t.includes('motion') || t.includes('force') || t.includes('gravity') || t.includes('physics') || t.includes('energy') || t.includes('wave') || t.includes('sound') || t.includes('thermo') || t.includes('current') || t.includes('ray')) {
      return 'Physics';
    }
    if (t.includes('chemical') || t.includes('reaction') || t.includes('acid') || t.includes('base') || t.includes('salt') || t.includes('carbon') || t.includes('periodic') || t.includes('metal') || t.includes('molecule') || t.includes('atom') || t.includes('chemistry') || t.includes('compound') || t.includes('bonding') || t.includes('stoichiometry')) {
      return 'Chemistry';
    }
    if (t.includes('life') || t.includes('process') || t.includes('heredity') || t.includes('evolution') || t.includes('cell') || t.includes('bio') || t.includes('organism') || t.includes('reproduction') || t.includes('plant') || t.includes('animal') || t.includes('ecology') || t.includes('respiration') || t.includes('photosynthesis')) {
      return 'Biology';
    }
    if (t.includes('pattern') || t.includes('series') || t.includes('logical') || t.includes('reasoning') || t.includes('syllogism') || t.includes('puzzle') || t.includes('spatial') || t.includes('analogy') || t.includes('blood relation') || t.includes('direction sense')) {
      return 'Logical Reasoning';
    }
    if (t.includes('quadratic') || t.includes('polynomial') || t.includes('equation') || t.includes('trig') || t.includes('arithmetic') || t.includes('algebra') || t.includes('math') || t.includes('geometry') || t.includes('triangle') || t.includes('circle') || t.includes('coordinate') || t.includes('calculus') || t.includes('number') || t.includes('sign') || t.includes('numerical') || t.includes('fraction') || t.includes('probability') || t.includes('statistics')) {
      return 'Mathematics';
    }
    if (t.includes('science')) {
      return 'Science';
    }
    return fallbackSubject;
  };

  // Genesis Timestamp of the Parent Account / Learning Journey
  const genesisTimestamp = useMemo(() => {
    if (parentAccount?.createdAt) {
      const parsed = new Date(parentAccount.createdAt).getTime();
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    if (examHistory.length > 0) {
      const earliest = Math.min(...examHistory.map(e => new Date(e.submittedAt).getTime()));
      return earliest;
    }
    return now - 86400000;
  }, [parentAccount?.createdAt, examHistory, now]);

  // Dynamic Evolutionary Progress Graph (Journey-Based from Joining Date & 7-Day Sprint Rhythm)
  const graphBars = useMemo(() => {
    const DAY_MS = 86400000;
    const WEEK_MS = 7 * 86400000;
    const MONTH_MS = 30 * 86400000;

    const calcAveragePct = (matching: ExamSubmission[]) => {
      if (matching.length === 0) return null;
      const totalPct = matching.reduce((acc, e) => {
        if (e.accuracyPercentage != null && e.accuracyPercentage > 0) {
          return acc + Number(e.accuracyPercentage);
        }
        const total = e.totalMarks || (['Class 1', 'Class 2', 'Class 3', 'Class 4', '1', '2', '3', '4'].some(c => (e.classGrade || '').includes(c)) ? 5 : 15);
        return acc + ((e.marksObtained || 0) / total) * 100;
      }, 0);
      return Math.round(totalPct / matching.length);
    };

    if (timeframe === 'day') {
      // Standard Academic Week Calendar: Monday to Sunday (Mon on left -> Sun on right)
      const nowObj = new Date(now);
      const currentDayOfWeek = nowObj.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, ..., 6 = Sat
      const diffToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

      const mondayMidnight = new Date(nowObj.getFullYear(), nowObj.getMonth(), nowObj.getDate() - diffToMonday, 0, 0, 0, 0).getTime();
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

      const days = [0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
        const start = mondayMidnight + dayOffset * DAY_MS;
        const end = start + DAY_MS;
        return { label: dayNames[dayOffset], start, end };
      });

      return days.map(d => {
        const matching = examHistory.filter(e => {
          const t = new Date(e.submittedAt).getTime();
          return t >= d.start && t < d.end;
        });
        return { label: d.label, pct: calcAveragePct(matching), count: matching.length };
      });
    } else if (timeframe === 'week') {
      const currentWeekIndex = Math.max(0, Math.floor((now - genesisTimestamp) / WEEK_MS));
      // Base week number for the 4-week window (starts at W1 for new users)
      const startWeekNumber = currentWeekIndex < 4 ? 1 : currentWeekIndex - 2;

      const weeks = [0, 1, 2, 3].map((offset) => {
        const weekNum = startWeekNumber + offset;
        const start = genesisTimestamp + (weekNum - 1) * WEEK_MS;
        const end = start + WEEK_MS;
        return { label: `W${weekNum}`, start, end };
      });

      return weeks.map(w => {
        const matching = examHistory.filter(e => {
          const t = new Date(e.submittedAt).getTime();
          return t >= w.start && t < w.end;
        });
        return { label: w.label, pct: calcAveragePct(matching), count: matching.length };
      });
    } else {
      const currentMonthIndex = Math.max(0, Math.floor((now - genesisTimestamp) / MONTH_MS));
      // Base month number for the 4-month window (starts at M1 for new users)
      const startMonthNumber = currentMonthIndex < 4 ? 1 : currentMonthIndex - 2;

      const months = [0, 1, 2, 3].map((offset) => {
        const monthNum = startMonthNumber + offset;
        const start = genesisTimestamp + (monthNum - 1) * MONTH_MS;
        const end = start + MONTH_MS;
        return { label: `M${monthNum}`, start, end };
      });

      return months.map(m => {
        const matching = examHistory.filter(e => {
          const t = new Date(e.submittedAt).getTime();
          return t >= m.start && t < m.end;
        });
        return { label: m.label, pct: calcAveragePct(matching), count: matching.length };
      });
    }
  }, [timeframe, examHistory, now, genesisTimestamp]);

  // Dynamic AI Observation Generator from Child topicMastery & Exam Analysis
  const activeTopicMastery = activeChild?.topicMastery || {};
  const masteryEntries = Object.entries(activeTopicMastery);

  const strongTopics = masteryEntries.filter(([, score]) => Number(score) >= 70).map(([t]) => t);
  const weakTopics = masteryEntries.filter(([, score]) => Number(score) < 65).map(([t]) => t);

  const aiObservationMessage = useMemo(() => {
    if (weakTopics.length > 0 && strongTopics.length > 0) {
      return `Students show high retention in ${strongTopics.slice(0, 2).join(' & ')}, but need targeted reinforcement in ${weakTopics.slice(0, 2).join(' & ')}. Grounded remedial modules are queued in the 10-mark arena.`;
    } else if (weakTopics.length > 0) {
      return `Targeted reinforcement needed in ${weakTopics.slice(0, 2).join(' & ')}. Adaptive practice is prioritized to eliminate concept misconceptions.`;
    } else if (strongTopics.length > 0) {
      return `High retention demonstrated across ${strongTopics.slice(0, 2).join(' & ')}! Ready for advanced HOTS and board diagnostic challenges.`;
    } else if (examHistory.length > 0 && examHistory[0].analysis) {
      const ana = examHistory[0].analysis;
      const str = ana.strengths?.[0] || 'Core concepts';
      const gap = ana.areasToImprove?.[0] || 'Foundational problem-solving';
      return `Diagnostic analysis indicates high retention in ${str}, with targeted remediation recommended in ${gap}.`;
    } else {
      return `SahajPath RAG engine is ready for ${activeChild?.name || 'your student'}. Launch a 10-mark diagnostic sprint to map their adaptive Knowledge Graph.`;
    }
  }, [weakTopics, strongTopics, examHistory, activeChild]);

  // Dynamic Recommended Exams with Case-Insensitive Subject Resolution
  const dynamicRecommendations = useMemo(() => {
    const grade = activeChild?.classGrade || 'Class 10';
    const board = (activeChild?.targetBoard || 'CBSE').toUpperCase();

    const weakEntries = Object.entries(activeTopicMastery)
      .sort((a, b) => Number(a[1]) - Number(b[1]));

    if (weakEntries.length > 0) {
      return weakEntries.slice(0, 3).map(([topicName], idx) => {
        const resolvedSub = resolveSubjectForTopic(topicName, idx === 0 ? 'Mathematics' : idx === 1 ? 'Physics' : 'English');
        const diff: ExamDifficulty = idx === 0 ? 'hard' : idx === 1 ? 'medium' : 'simple';
        const diffLabel = idx === 0 ? 'Hard' : idx === 1 ? 'Medium' : 'Easy';
        const diffColor = idx === 0 ? 'bg-red-100 text-red-700' : idx === 1 ? 'bg-teal-100 text-teal-700' : 'bg-yellow-100 text-yellow-700';

        return {
          subject: resolvedSub,
          topic: topicName,
          difficulty: diff,
          tag: `${board} • ${grade}`,
          badgeColor: diffColor,
          badgeText: diffLabel,
        };
      });
    }

    // No exams taken yet or no weak topics
    return [];
  }, [activeChild, activeTopicMastery]);

  const isFree = parentAccount.subscriptionTier === 'free';

  const handleStartEdit = (child: ChildAccount) => {
    setSelectedChildForEdit(child);
    setEditFormData({
      name: child.name,
      avatar: child.avatar,
      classGrade: child.classGrade,
      targetBoard: child.targetBoard,
      schoolName: child.schoolName || '',
      pin: child.pin
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildForEdit) return;
    const updated: ChildAccount = {
      ...selectedChildForEdit,
      name: editFormData.name || selectedChildForEdit.name,
      avatar: editFormData.avatar || selectedChildForEdit.avatar,
      classGrade: editFormData.classGrade || selectedChildForEdit.classGrade,
      targetBoard: editFormData.targetBoard || selectedChildForEdit.targetBoard,
      schoolName: editFormData.schoolName,
      pin: editFormData.pin || selectedChildForEdit.pin
    };
    onUpdateChild(updated);
    setSelectedChildForEdit(null);
  };

  return (
    <div className="space-y-8 pb-10">

      {/* 1. TOP SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: My Children (Yellow/Orange) */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-2xl border border-yellow-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-yellow-400 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white shadow-xs flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-yellow-600" />
              </div>
              <span className="text-xs font-bold text-yellow-900 uppercase tracking-wider">My Children</span>
            </div>
            <span className="text-[10px] font-bold bg-yellow-200/70 text-yellow-900 px-2 py-0.5 rounded-full border border-yellow-300/60 shadow-2xs">
              {totalChildren} Active
            </span>
          </div>
          <div className="flex items-end justify-between relative z-10 mt-1">
            <div>
              <p className="text-2xl font-black text-stone-900">{totalChildren}</p>
              <p className="text-[10px] text-yellow-800 font-semibold mt-0.5">
                {totalChildren === 1 ? 'Registered Student' : 'Registered Students'}
              </p>
            </div>
            {/* Child Avatar Stack */}
            <div className="flex items-center -space-x-2 pb-0.5">
              {parentAccount.children.slice(0, 3).map((c, i) => (
                <div
                  key={c.id || i}
                  title={c.name}
                  className="w-7 h-7 rounded-full bg-white border-2 border-yellow-200 flex items-center justify-center text-xs shadow-xs"
                >
                  {c.avatar || '👦'}
                </div>
              ))}
              {totalChildren > 3 && (
                <div className="w-7 h-7 rounded-full bg-yellow-300 border-2 border-white flex items-center justify-center text-[10px] font-black text-yellow-950 shadow-xs">
                  +{totalChildren - 3}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Overall Progress (Emerald/Teal - Clickable) */}
        <div
          onClick={() => setActiveModalMetric('progress')}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:border-emerald-400 hover:scale-[1.01] transition-all cursor-pointer"
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-400 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white shadow-xs flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Progress</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-600/60 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="relative z-10">
            <p className="text-xl sm:text-2xl font-black text-stone-900">{progressCardData.mainText}</p>
            <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">{progressCardData.subText}</p>
          </div>
        </div>

        {/* Card 3: Exam Readiness (Blue/Indigo - Clickable) */}
        <div
          onClick={() => setActiveModalMetric('readiness')}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:border-blue-400 hover:scale-[1.01] transition-all cursor-pointer"
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-400 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white shadow-xs flex items-center justify-center">
                <Award className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Readiness</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-blue-600/60 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="relative z-10">
            <p className="text-xl sm:text-2xl font-black text-stone-900">{readinessCardData.mainText}</p>
            <p className="text-[10px] text-blue-700 font-semibold mt-0.5">{readinessCardData.subText}</p>
          </div>
        </div>

        {/* Card 4: Learning Streak (Rose/Pink) */}
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-2xl border border-rose-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-400 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white shadow-xs flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">Streak</span>
            </div>
            <span className="text-[10px] font-bold bg-rose-200/70 text-rose-900 px-2 py-0.5 rounded-full border border-rose-300/60 shadow-2xs flex items-center gap-1">
              🔥 Active
            </span>
          </div>
          <div className="flex items-end justify-between relative z-10 mt-1">
            <div>
              <p className="text-2xl font-black text-stone-900">{learningStreakText}</p>
              <p className="text-[10px] text-rose-700 font-semibold mt-0.5">Consistent learning</p>
            </div>
            {/* 7-Day Mini Sprint Rhythm Dots */}
            <div className="flex items-center gap-1 pb-1">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const isActive = day <= Math.min(maxFamilyStreak, 7);
                return (
                  <span
                    key={day}
                    className={`w-2 h-2 rounded-full transition-all ${
                      isActive
                        ? 'bg-rose-500 shadow-2xs scale-110'
                        : 'bg-rose-200/80'
                    }`}
                    title={`Day ${day}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MY CHILDREN SECTION */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-bold text-xl text-stone-900">My Children</h2>
            <p className="text-xs text-stone-500 font-medium">Track each child's learning journey.</p>
          </div>
          {parentAccount.children.length > 0 && (
            <button
              onClick={onOpenAddChildModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-xl text-xs font-black text-stone-900 hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm border border-yellow-500/50"
            >
              <Plus className="w-4 h-4" />
              Add Child
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {parentAccount.children.length === 0 ? (
            <div className="col-span-1 lg:col-span-2 bg-stone-50 border border-stone-200 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <Users className="w-10 h-10 text-stone-300 mb-3" />
              <p className="font-bold text-stone-700">No Children Added Yet</p>
              <p className="text-sm text-stone-500 mt-1 mb-4">Add your children to start tracking their learning journey.</p>
              <button
                onClick={onOpenAddChildModal}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-bold rounded-xl transition-colors shadow-sm"
              >
                Add a Child
              </button>
            </div>
          ) : parentAccount.children.map((child) => {
            const isChildActive = activeChildId === child.id;
            const childMasteryEntries = Object.entries(child.topicMastery || {}).sort((a, b) => Number(b[1]) - Number(a[1]));
            const strongestTopic = childMasteryEntries.length > 0 ? childMasteryEntries[0][0] : '—';
            const weakestTopic = childMasteryEntries.length > 0 ? childMasteryEntries[childMasteryEntries.length - 1][0] : '—';

            return (
              <div
                key={child.id}
                className={`bg-white rounded-2xl border transition-all p-5 relative flex flex-col gap-4 overflow-hidden group ${isChildActive ? 'border-yellow-400 ring-4 ring-yellow-50 shadow-md' : 'border-stone-200 hover:border-stone-300 shadow-sm'
                  }`}
              >
                {/* Decorative blob */}
                <div className={`absolute -right-12 -bottom-12 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors ${isChildActive ? 'bg-yellow-400 opacity-40' : 'bg-stone-300 group-hover:bg-yellow-300'}`}></div>

                {/* Header */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center text-3xl shadow-xs">
                      {child.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-stone-900">{child.name}</h4>
                      <p className="text-xs text-stone-500 font-medium mb-1">{child.classGrade} • {child.targetBoard}</p>
                    </div>
                  </div>
                  {isChildActive && (
                    <span className="text-[10px] bg-yellow-100 text-yellow-700 font-bold px-2 py-1 rounded-lg">
                      ACTIVE
                    </span>
                  )}
                </div>

                {/* Progress Indicators */}
                {(() => {
                  const childExams = (child.recentExams && child.recentExams.length > 0)
                    ? child.recentExams
                    : examHistory.filter(e => String(e.studentId) === String(child.id));
                  const childTotalObtained = childExams.reduce((acc, e) => acc + (e.marksObtained || 0), 0);
                  const childTotalPossible = childExams.reduce((acc, e) => acc + (e.totalMarks || 10), 0);
                  const childScorePct = childTotalPossible > 0
                    ? (childTotalObtained / childTotalPossible) * 100
                    : (child.averageScore > 10 ? child.averageScore : (child.averageScore * 10));
                  const latestExam = childExams[0];
                  return (
                    <div className="grid grid-cols-3 gap-4 border-y border-stone-100 py-4 relative z-10">
                      <div className="col-span-1">
                        <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Overall Progress</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${Math.round(childScorePct)}%` }} />
                          </div>
                          <span className="text-xs font-bold text-stone-800">{Math.round(childScorePct)}%</span>
                        </div>
                      </div>
                      <div className="col-span-1 text-center border-l border-stone-100 pl-4">
                        <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Exam Readiness</span>
                        <span className="text-sm font-bold text-stone-800">
                          {child.totalExamsTaken > 0 ? `${Math.round(childScorePct)}%` : '—'}
                        </span>
                      </div>
                      <div className="col-span-1 text-right border-l border-stone-100">
                        <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Latest Result</span>
                        <span className="text-sm font-bold text-stone-800">
                          {latestExam ? `${latestExam.marksObtained}/${latestExam.totalMarks}` : (child.totalExamsTaken > 0 ? `${Math.round(childScorePct)}%` : '—')}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-2 gap-4 text-xs relative z-10">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold block mb-0.5">Strongest</span>
                    <span className="font-semibold text-stone-800 truncate block">{strongestTopic}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold block mb-0.5">Needs Attention</span>
                    <span className="font-semibold text-stone-800 truncate block">{weakestTopic}</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between mt-1 pt-3 relative z-10">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                    <Flame className="w-4 h-4" /> {child.streakDays || 0} Day Streak
                  </div>
                  <button
                    onClick={() => {
                      onChildSelect(child.id);
                      navigate('/children');
                    }}
                    className="text-xs font-bold text-yellow-600 hover:text-yellow-700 hover:underline flex items-center gap-1"
                  >
                    View Progress <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. LEARNING PROGRESS */}
      <div id="learning-progress-section" className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs mt-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/40 to-transparent pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 relative z-10">
          <div>
            <h2 className="font-bold text-lg text-stone-900">Learning Progress</h2>
            <p className="text-xs text-stone-500 font-medium">See how your children's performance is changing over time.</p>
          </div>
          <div className="flex gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 shrink-0">
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${timeframe === 'week' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'}`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${timeframe === 'month' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'}`}
            >
              Month
            </button>
          </div>
        </div>

        <div className="h-64 w-full">
          {!hasData ? (
            <div className="h-full w-full flex flex-col items-center justify-center bg-stone-50 rounded-xl border border-stone-200 border-dashed">
              <TrendingUp className="w-8 h-8 text-stone-300 mb-2" />
              <p className="text-stone-500 font-bold text-sm">No data available</p>
              <p className="text-stone-400 text-xs mt-1">Start learning to see progress charts</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={graphBars} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPct" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#78716c', fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#78716c', fontWeight: 500 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f5f5f4', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#b45309', fontWeight: 'bold' }}
                  formatter={(value) => [`${value}%`, 'Score']}
                />
                <Area
                  type="monotone"
                  dataKey="pct"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPct)"
                  activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                  connectNulls={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 5 & 6. RECENT RESULTS + NEXT STEPS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

        {/* Recent Results */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-300 rounded-full blur-3xl opacity-10 group-hover:opacity-20 pointer-events-none transition-opacity"></div>
          <h2 className="font-bold text-base text-stone-900 mb-4 relative z-10">Recent Results</h2>
          <div className={`flex-1 space-y-3 relative z-10 ${examHistory.length === 0 ? 'flex items-center justify-center' : ''}`}>
            {examHistory.length > 0 ? (
              examHistory.slice(0, 4).map((sub) => (
                <div key={sub.id} className="flex justify-between items-center p-3 rounded-xl border border-stone-100 bg-stone-50 hover:border-stone-200 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-stone-900 mb-0.5">{sub.studentName}</span>
                    <span className="text-[10px] text-stone-500 font-medium">
                      {resolveSubjectForTopic(sub.examTitle)} • {sub.difficulty.charAt(0).toUpperCase() + sub.difficulty.slice(1)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-stone-900">
                      {sub.marksObtained}/{sub.totalMarks || (['Class 1', 'Class 2', 'Class 3', 'Class 4', '1', '2', '3', '4'].some(c => (sub.classGrade || '').includes(c)) ? 5 : 15)}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">{new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-500 py-4 text-center">No exams completed yet.</p>
            )}
          </div>
          {examHistory.length > 0 && (
            <button
              onClick={() => navigate('/reports')}
              className="text-xs font-bold text-yellow-600 hover:text-yellow-700 hover:underline flex items-center gap-1 cursor-pointer w-fit"
            >
              View All Results <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Recommended Next Steps */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-300 rounded-full blur-3xl opacity-10 group-hover:opacity-20 pointer-events-none transition-opacity"></div>
          <h2 className="font-bold text-base text-stone-900 mb-4 relative z-10">Recommended Next Steps</h2>
          <div className={`flex-1 space-y-3 relative z-10 ${dynamicRecommendations.length === 0 ? 'flex items-center justify-center' : ''}`}>
            {dynamicRecommendations.length > 0 ? (
              dynamicRecommendations.slice(0, 2).map((rec, idx) => (
                <div key={idx} className="flex items-center p-3 rounded-xl border border-stone-100 bg-stone-50">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-stone-900 mb-0.5 flex items-center gap-1.5">
                      {idx === 0 ? '📘' : '🧮'} Practice {rec.subject}
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium">
                      {idx === 0 ? 'Improve accuracy in this topic.' : 'Ready to try the next difficulty level.'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-500 py-4 text-center">No recommendations available yet.</p>
            )}
          </div>
        </div>

      </div>

      {/* Edit Child Modal */}
      {selectedChildForEdit && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-stone-900 mb-1">Edit Child Sub-Account</h3>
            <p className="text-xs text-stone-500 mb-5">Update student class, target board, school name, and child login PIN</p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Child Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Class / Grade</label>
                  <select
                    value={editFormData.classGrade}
                    onChange={(e) => setEditFormData({ ...editFormData, classGrade: e.target.value as ClassGrade })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Target Board</label>
                  <select
                    value={editFormData.targetBoard}
                    onChange={(e) => setEditFormData({ ...editFormData, targetBoard: e.target.value as Board })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
                  >
                    {BOARDS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">School Name (Optional)</label>
                <input
                  type="text"
                  value={editFormData.schoolName || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, schoolName: e.target.value })}
                  placeholder="e.g. Delhi Public School or St. Paul's"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Child Login PIN (4 Digits)</label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={editFormData.pin || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, pin: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 font-mono text-xs tracking-widest focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSelectedChildForEdit(null)}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-yellow-400 text-stone-900 text-xs font-semibold hover:bg-yellow-700 shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. STUDENT-WISE PROGRESS / READINESS MODAL */}
      {activeModalMetric && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${activeModalMetric === 'progress' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                  {activeModalMetric === 'progress' ? <TrendingUp className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    {activeModalMetric === 'progress' ? 'Student-Wise Overall Progress' : 'Student-Wise Exam Readiness'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {activeModalMetric === 'progress'
                      ? (totalChildren === 1
                        ? `Diagnostic learning progress for ${childrenMetrics[0]?.child.name || 'student'}.`
                        : `Individual learning progress for all ${totalChildren} children. Tap to view profile.`)
                      : (totalChildren === 1
                        ? `Exam & board readiness evaluation for ${childrenMetrics[0]?.child.name || 'student'}.`
                        : `Individual exam readiness for all ${totalChildren} children. Tap to view profile.`)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModalMetric(null)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Student List (Clicking student item directly navigates) */}
            <div className="overflow-y-auto custom-scrollbar my-4 space-y-3 flex-1 pr-1">
              {childrenMetrics.length === 0 ? (
                <div className="p-8 text-center text-stone-500 text-xs font-medium">
                  No children profiles found.
                </div>
              ) : (
                childrenMetrics.map(({ child, scorePct, readinessScore, latestExam }) => {
                  const isSelected = activeChildId === child.id;
                  return (
                    <div
                      key={child.id}
                      onClick={() => {
                        onChildSelect(child.id);
                        setActiveModalMetric(null);
                        if (activeModalMetric === 'progress') {
                          const el = document.getElementById('learning-progress-section');
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth' });
                          } else {
                            navigate('/children');
                          }
                        } else {
                          navigate('/reports');
                        }
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.01] hover:shadow-md ${isSelected
                          ? 'border-yellow-400 bg-yellow-50/40'
                          : 'border-stone-200 bg-stone-50/70 hover:border-yellow-300 hover:bg-white'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-2xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                            {child.avatar || '👦'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-stone-900 group-hover:text-yellow-700 transition-colors truncate">
                                {child.name}
                              </h4>
                              {isSelected && (
                                <span className="text-[9px] font-bold bg-yellow-400 text-stone-900 px-1.5 py-0.5 rounded-md">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-500 font-medium">
                              {child.classGrade} • {child.targetBoard}
                            </p>
                            <p className="text-[10px] text-stone-400 font-medium mt-0.5">
                              Login Username: <strong className="text-stone-700">@{child.username || child.name.toLowerCase().replace(/\s+/g, '')}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Metric Value */}
                        <div className="text-right shrink-0">
                          {activeModalMetric === 'progress' ? (
                            <div>
                              <span className="text-lg font-black text-emerald-700">{scorePct}%</span>
                              <p className="text-[9px] text-stone-400 font-semibold">Individual Score</p>
                            </div>
                          ) : (
                            <div>
                              <span className="text-lg font-black text-blue-700">{readinessScore}%</span>
                              <p className="text-[9px] text-stone-400 font-semibold">Exam Ready</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Visual Bar */}
                      <div className="space-y-1 mt-2">
                        <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${activeModalMetric === 'progress' ? 'bg-emerald-500' : 'bg-blue-500'
                              }`}
                            style={{ width: `${Math.min(100, Math.max(5, scorePct))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-stone-500 font-medium">
                          <span>Diagnostic Accuracy</span>
                          <span>Latest Result: <strong>{latestExam ? `${latestExam.marksObtained}/${latestExam.totalMarks || (['Class 1', 'Class 2', 'Class 3', 'Class 4', '1', '2', '3', '4'].some(c => (child.classGrade || '').includes(c)) ? 5 : 15)}` : (scorePct > 0 ? `${scorePct}%` : '—')}</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};



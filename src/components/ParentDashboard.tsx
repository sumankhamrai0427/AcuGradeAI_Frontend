import React, { useState } from 'react';
import { 
  ParentAccount, 
  ChildAccount, 
  Board, 
  ClassGrade, 
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
  Lock
} from 'lucide-react';

interface ParentDashboardProps {
  parentAccount: ParentAccount;
  activeChildId: string | null;
  onChildSelect: (childId: string) => void;
  onLaunchExamForChild: (childId: string) => void;
  onOpenAddChildModal: () => void;
  onOpenUpgradeModal: () => void;
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
  onOpenUpgradeModal,
  examHistory,
  onViewSubmissionReport,
  onUpdateChild,
}) => {
  const [selectedChildForEdit, setSelectedChildForEdit] = useState<ChildAccount | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ChildAccount>>({});

  // Summary Metrics
  const totalChildren = parentAccount.children.length;
  const totalFamilyExams = parentAccount.children.reduce((acc, c) => acc + (c.totalExamsTaken || 0), 0) + examHistory.length;
  const avgFamilyScore = parentAccount.children.length > 0
    ? (parentAccount.children.reduce((acc, c) => acc + (c.averageScore || 0), 0) / totalChildren).toFixed(1)
    : '0.0';

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

  const [timeframe, setTimeframe] = useState<'week' | 'month'>('month');

  return (
    <div className="space-y-6">
      {/* High Density Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Columns: Metrics, Evolutionary Progress Graph, and Child Sub-Accounts */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Top 3 High Density Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-500 mb-1">Overall Readiness</p>
              <p className="text-2xl font-bold text-emerald-600">
                {Number(avgFamilyScore) > 0 ? `${Math.min(98, Math.round(Number(avgFamilyScore) * 10))}%` : '84%'}
              </p>
              <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                <span className="text-emerald-600 font-semibold">↑ +5%</span> calibrated across all subjects
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-500 mb-1">Exams Completed</p>
              <p className="text-2xl font-bold text-indigo-600">{totalFamilyExams}</p>
              <p className="text-[10px] text-slate-400 mt-2">
                Across {totalChildren} Registered Sub-Accounts
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-500 mb-1">AI Learning Speed</p>
              <p className="text-2xl font-bold text-amber-600">
                {Number(avgFamilyScore) >= 8 ? 'Accelerated' : Number(avgFamilyScore) >= 6 ? 'Steady' : 'Emerging'}
              </p>
              <p className="text-[10px] text-slate-400 mt-2">
                Top 10% benchmark in {parentAccount.children[0]?.targetBoard || 'CBSE'}
              </p>
            </div>
          </div>

          {/* Evolutionary Progress Graph (High Density Card) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col shadow-xs">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
              <div>
                <h2 className="font-bold text-base text-slate-800 flex items-center gap-2">
                  <span>Evolutionary Progress Graph</span>
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    RAG-based K-Graph Analysis
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Continuous knowledge accretion across 10-mark diagnostic sprints</p>
              </div>

              <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button 
                  onClick={() => setTimeframe('week')}
                  className={`px-2.5 py-1 text-[11px] rounded font-semibold transition-all ${
                    timeframe === 'week' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Week
                </button>
                <button 
                  onClick={() => setTimeframe('month')}
                  className={`px-2.5 py-1 text-[11px] rounded font-semibold transition-all ${
                    timeframe === 'month' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Month
                </button>
              </div>
            </div>

            {/* Visual Step Graph */}
            <div className="pt-6 pb-2 px-4 flex items-end justify-between gap-4 h-36 border-b border-slate-100">
              <div className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full bg-slate-100 rounded-t-lg relative transition-all group-hover:bg-indigo-100" style={{ height: '40%' }}>
                  <div className="absolute -top-1.5 right-1/2 translate-x-1/2 w-3 h-3 bg-indigo-400 rounded-full border-2 border-white shadow-xs"></div>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 mt-2">W1 (65%)</span>
              </div>

              <div className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full bg-slate-100 rounded-t-lg relative transition-all group-hover:bg-indigo-100" style={{ height: '58%' }}>
                  <div className="absolute -top-1.5 right-1/2 translate-x-1/2 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-xs"></div>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 mt-2">W2 (72%)</span>
              </div>

              <div className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full bg-indigo-100 rounded-t-lg relative transition-all" style={{ height: '76%' }}>
                  <div className="absolute -top-1.5 right-1/2 translate-x-1/2 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white shadow-xs"></div>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 mt-2">W3 (82%)</span>
              </div>

              <div className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full bg-slate-100 rounded-t-lg relative transition-all group-hover:bg-indigo-100" style={{ height: '90%' }}>
                  <div className="absolute -top-1.5 right-1/2 translate-x-1/2 w-3 h-3 bg-indigo-700 rounded-full border-2 border-white shadow-xs"></div>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 mt-2">W4 (88%)</span>
              </div>
            </div>

            {/* AI Observation Callout */}
            <div className="mt-5 p-3.5 bg-indigo-50/80 rounded-xl flex items-center gap-3 border border-indigo-100">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                <strong>AI Observation:</strong> Students show high retention in Logical Reasoning and Algebraic Factoring, but need reinforcement in Quadratic Equations. Grounded remedial modules are queued in the 10-mark arena.
              </p>
            </div>
          </div>

          {/* Children Sub-Accounts Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Candidate Sub-Accounts & Active Personas</span>
                </h3>
                <p className="text-xs text-slate-400">Independent credentials, target boards, and syllabus tracking</p>
              </div>

              <button
                id="add-child-btn-dashboard"
                onClick={onOpenAddChildModal}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Child Sub-Account</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parentAccount.children.map((child) => {
                const isChildActive = activeChildId === child.id;
                const quotaReached = isFree && child.dailyExamsTakenToday >= 1;

                return (
                  <div
                    key={child.id}
                    id={`child-card-${child.id}`}
                    className={`bg-white rounded-2xl border transition-all p-5 shadow-xs relative ${
                      isChildActive
                        ? 'border-indigo-500 ring-2 ring-indigo-100 bg-white'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl">
                          {child.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-sm text-slate-900">{child.name}</h4>
                            {isChildActive && (
                              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.2 rounded border border-indigo-200">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{child.schoolName || 'School Student'}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                              {child.classGrade}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {child.targetBoard}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartEdit(child)}
                        className="p-1 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700"
                        title="Edit Child Profile & PIN"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* PIN and Stats */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-xl text-center text-xs mb-3 border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Average</span>
                        <span className="font-bold text-indigo-600">{child.averageScore}/10</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tests</span>
                        <span className="font-bold text-slate-800">{child.totalExamsTaken}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">PIN</span>
                        <span className="font-mono font-bold text-slate-700">{child.pin}</span>
                      </div>
                    </div>

                    {/* Topic Mastery */}
                    {child.topicMastery && Object.keys(child.topicMastery).length > 0 && (
                      <div className="mb-3 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Topic Mastery (K-Graph)
                        </span>
                        {Object.entries(child.topicMastery).slice(0, 2).map(([topic, pct]) => {
                          const numPct = Number(pct);
                          return (
                            <div key={topic} className="text-xs">
                              <div className="flex justify-between text-slate-600 mb-0.5 text-[11px]">
                                <span className="truncate max-w-[140px] font-medium">{topic}</span>
                                <span className="font-bold text-slate-800">{numPct}%</span>
                              </div>
                              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${numPct >= 80 ? 'bg-emerald-500' : numPct >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                  style={{ width: `${numPct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onChildSelect(child.id)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                          isChildActive
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isChildActive ? 'Selected' : 'Select Candidate'}
                      </button>

                      <button
                        onClick={() => {
                          onChildSelect(child.id);
                          onLaunchExamForChild(child.id);
                        }}
                        className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Start Test</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Recommended Exams and Recent Results Ledger */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Recommended Exams Widget (High Density Theme) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col shadow-xs">
            <h2 className="font-bold text-sm text-slate-800 mb-3">Recommended Exams</h2>
            
            <div className="space-y-2.5">
              <div 
                onClick={() => onLaunchExamForChild(activeChildId || parentAccount.children[0]?.id)}
                className="p-3 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-slate-50 cursor-pointer transition-all"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight">Mathematics</span>
                  <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">Hard</span>
                </div>
                <p className="text-xs font-semibold mb-1.5 text-slate-900">Quadratic Equations & Polynomials</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span>10 Questions (10 Marks)</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span>{parentAccount.children[0]?.targetBoard || 'CBSE 10th'}</span>
                </div>
              </div>

              <div 
                onClick={() => onLaunchExamForChild(activeChildId || parentAccount.children[0]?.id)}
                className="p-3 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-slate-50 cursor-pointer transition-all"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">Physics</span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">Medium</span>
                </div>
                <p className="text-xs font-semibold mb-1.5 text-slate-900">Ray Optics & Light Refraction</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span>10 Questions (10 Marks)</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span>Board Calibration</span>
                </div>
              </div>

              <div 
                onClick={() => onLaunchExamForChild(activeChildId || parentAccount.children[0]?.id)}
                className="p-3 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-slate-50 cursor-pointer transition-all"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">Logical Reasoning</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Easy</span>
                </div>
                <p className="text-xs font-semibold mb-1.5 text-slate-900">Pattern Recognition & Series Alpha</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span>10 Questions (10 Marks)</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span>Foundation Prep</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => onLaunchExamForChild(activeChildId || parentAccount.children[0]?.id)}
              className="w-full mt-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Browse All Subjects & Launch Arena
            </button>
          </div>

          {/* Recent Results Ledger (High Density Theme) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm text-slate-800">Recent Results</h2>
              <span className="text-[10px] text-slate-400">{examHistory.length} Recorded</span>
            </div>

            <div className="space-y-3">
              {examHistory.slice(0, 4).map((sub) => (
                <div 
                  key={sub.id} 
                  onClick={() => onViewSubmissionReport(sub)}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      sub.marksObtained >= 8 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                        : sub.marksObtained >= 5 
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' 
                        : 'bg-rose-50 text-rose-600 border border-rose-200'
                    }`}>
                      {sub.marksObtained}/10
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{sub.examTitle}</p>
                      <p className="text-[10px] text-slate-400">
                        {sub.studentName} • {new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Child Modal */}
      {selectedChildForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">Edit Child Sub-Account</h3>
            <p className="text-xs text-slate-500 mb-5">Update student class, target board, school name, and child login PIN</p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Child Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Class / Grade</label>
                  <select
                    value={editFormData.classGrade}
                    onChange={(e) => setEditFormData({ ...editFormData, classGrade: e.target.value as ClassGrade })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Board</label>
                  <select
                    value={editFormData.targetBoard}
                    onChange={(e) => setEditFormData({ ...editFormData, targetBoard: e.target.value as Board })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {BOARDS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">School Name (Optional)</label>
                <input
                  type="text"
                  value={editFormData.schoolName || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, schoolName: e.target.value })}
                  placeholder="e.g. Delhi Public School or St. Paul's"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Child Login PIN (4 Digits)</label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={editFormData.pin || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, pin: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs tracking-widest focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedChildForEdit(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Board,
  ClassGrade,
  Subject,
  ExamDifficulty,
  Exam,
  ChildAccount,
  ParentAccount,
  ExamSubmission
} from '../types';
import {
  BookOpen,
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flag,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Calculator,
  Layers,
  Award,
  Zap
} from 'lucide-react';
import ApiServices from '../services/ApiServices';

interface ExamArenaProps {
  parentAccount: ParentAccount;
  activeChildId: string | null;
  activePersona?: 'parent' | 'child';
  onChildSelect: (childId: string) => void;
  onExamComplete: (submission: ExamSubmission) => void;
  onOpenUpgradeModal: () => void;
  onResetDailyQuota: (childId: string) => void;
  presetSubject?: Subject;
  presetDifficulty?: ExamDifficulty;
}

const BOARDS: Board[] = ['CBSE', 'ICSE', 'ISC', 'UK-Cambridge', 'NCERT', 'NEET', 'IIT'];
const GRADES: ClassGrade[] = [
  'Class 5', 'Class 6', 'Class 7', 'Class 8',
  'Class 9', 'Class 10', 'Class 11', 'Class 12'
];
const SUBJECTS: Subject[] = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Science', 'Social Studies', 'English', 'Computer Science', 'Logical Reasoning'
];

export const ExamArena: React.FC<ExamArenaProps> = ({
  parentAccount,
  activeChildId,
  activePersona = 'parent',
  onChildSelect,
  onExamComplete,
  onOpenUpgradeModal,
  onResetDailyQuota,
}) => {
  const isStudentPersona = activePersona === 'child';
  // Current active child
  const activeChild = parentAccount.children.find((c) => c.id === activeChildId) || parentAccount.children[0];

  // Config State
  const [selectedBoard, setSelectedBoard] = useState<Board>(activeChild?.targetBoard || 'CBSE');
  const [selectedGrade, setSelectedGrade] = useState<ClassGrade>(activeChild?.classGrade || 'Class 10');
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Mathematics');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ExamDifficulty>('medium');

  // Exam taking state
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(15 * 60); // 15 mins
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [scratchpadNote, setScratchpadNote] = useState('');
  const [generationStep, setGenerationStep] = useState('');

  // Sync defaults when active child changes
  useEffect(() => {
    if (activeChild) {
      setSelectedBoard(activeChild.targetBoard);
      setSelectedGrade(activeChild.classGrade);
    }
  }, [activeChildId]);

  // Timer countdown
  useEffect(() => {
    let timer: any;
    if (activeExam && timeRemainingSeconds > 0 && !showConfirmSubmit && !isSubmitting) {
      timer = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeExam, timeRemainingSeconds, showConfirmSubmit, isSubmitting]);

  const isFreeTier = parentAccount.subscriptionTier === 'free';
  const hasReachedDailyLimit = isFreeTier && activeChild?.dailyExamsTakenToday >= 1;

  const handleStartExam = async () => {
    if (hasReachedDailyLimit) {
      onOpenUpgradeModal();
      return;
    }

    setIsGenerating(true);
    setGenerationStep('Retrieving Board Syllabus & RAG Runbook Nodes...');

    try {
      setTimeout(() => setGenerationStep('Grounding 10 calibrated questions for 10 marks...'), 600);

      // Weak topics are no longer sent from the client — the backend derives
      // them itself from the student's stored mastery history
      // (helper/exam_generator.py:get_weak_topics), since a client-supplied
      // list can't be trusted as an input to exam personalization.
      if (!activeChildId) return;

      const { exam } = await ApiServices.generateExam({
        studentId: activeChildId,
        board: selectedBoard,
        classGrade: selectedGrade,
        subject: selectedSubject,
        difficulty: selectedDifficulty,
      });

      setActiveExam(exam);
      setCurrentQuestionIdx(0);
      setAnswers({});
      setFlaggedQuestions({});
      setTimeRemainingSeconds((exam.timeLimitMinutes || 15) * 60);
    } catch (err) {
      console.error('Error generating exam:', err);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleSelectAnswer = (questionId: string, answerValue: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerValue
    }));
  };

  const toggleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleSubmitExam = async () => {
    if (!activeExam || isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmSubmit(false);

    const totalSecondsSpent = (activeExam.timeLimitMinutes || 15) * 60 - timeRemainingSeconds;

    try {
      // Only the exam id + the student's answers are sent — never the full
      // exam object. The backend already has the questions (and their
      // correct answers) stored server-side from the /generate call, so
      // there's nothing left for the client to round-trip or tamper with.
      // (This replaces the original flow, which sent the whole exam —
      // correctAnswer included — back to the server on every submission.)
      const { submission } = await ApiServices.submitExam(
        activeExam.id,
        { answers, timeTakenSeconds: Math.max(10, totalSecondsSpent) }
      );
      onExamComplete(submission);
    } catch (err) {
      console.error('Error evaluating exam:', err);
    } finally {
      setIsSubmitting(false);
      setActiveExam(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // If in active exam mode
  if (activeExam) {
    const currentQ = activeExam.questions[currentQuestionIdx];
    const totalQuestions = activeExam.questions.length;
    const answeredCount = Object.keys(answers).filter((k) => answers[k]?.trim() !== '').length;

    return (
      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Top Sticky Status Bar */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 border border-yellow-300 flex items-center justify-center font-bold text-yellow-700">
              {currentQuestionIdx + 1}/{totalQuestions}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-900 text-sm sm:text-base">{activeExam.title}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-300">
                  10 Marks Total
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Candidate: <span className="font-medium text-stone-700">{activeChild?.name}</span> ({activeExam.board} • {activeExam.classGrade})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer */}
            <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-sm font-mono font-bold ${timeRemainingSeconds < 180
              ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
              : 'bg-stone-50 border-stone-200 text-stone-700'
              }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeRemainingSeconds)}</span>
            </div>

            {/* Scratchpad Toggle */}
            <button
              id="toggle-scratchpad-btn"
              onClick={() => setShowScratchpad(!showScratchpad)}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${showScratchpad ? 'bg-amber-50 border-amber-300 text-amber-800 font-semibold' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              title="Open Scratchpad / Calculation Notes"
            >
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Scratchpad</span>
            </button>

            {/* Finish / Submit Button */}
            <button
              id="finish-exam-btn"
              onClick={() => setShowConfirmSubmit(true)}
              className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-stone-900 text-xs sm:text-sm font-semibold shadow-xs transition-colors"
            >
              Submit 10 Marks
            </button>
          </div>
        </div>

        {/* Scratchpad Drawer */}
        {showScratchpad && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-amber-700" />
                Working Scratchpad (Draft equations & steps)
              </span>
              <button
                onClick={() => setScratchpadNote('')}
                className="text-[11px] text-amber-700 hover:underline"
              >
                Clear
              </button>
            </div>
            <textarea
              id="exam-scratchpad-textarea"
              value={scratchpadNote}
              onChange={(e) => setScratchpadNote(e.target.value)}
              placeholder="Jot down formulas, unit conversions, or calculations here (not graded)..."
              className="w-full h-24 p-2.5 rounded-xl border border-amber-200 bg-white text-xs font-mono text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
            />
          </div>
        )}

        {/* Main Grid: Question Content + Question Palette */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Question Card (Col 1-3) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 sm:p-6">
              {/* Question Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-stone-900 text-white">
                    Question {currentQuestionIdx + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200 uppercase">
                    {currentQ.type}
                  </span>
                  <span className="text-xs text-stone-400">•</span>
                  <span className="text-xs text-stone-500 font-medium">Topic: {currentQ.topic}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-2 py-1 rounded-md">
                    1.0 Mark
                  </span>
                  <button
                    id="flag-question-btn"
                    onClick={() => toggleFlagQuestion(currentQ.id)}
                    className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${flaggedQuestions[currentQ.id]
                      ? 'bg-amber-50 border-amber-300 text-amber-700'
                      : 'border-stone-200 text-stone-400 hover:text-stone-600'
                      }`}
                    title="Flag for review"
                  >
                    <Flag className={`w-3.5 h-3.5 ${flaggedQuestions[currentQ.id] ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Question Statement */}
              <div className="text-stone-900 text-base sm:text-lg font-medium leading-relaxed mb-4 whitespace-pre-line">
                {currentQ.questionText}
              </div>

              {/* Response Inputs based on Type */}
              <div className="space-y-3 pt-2">
                {/* MCQ / Logical with Options */}
                {(currentQ.type === 'mcq' || currentQ.type === 'logical') && currentQ.options && (
                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, oIdx) => {
                      const letter = opt.trim().charAt(0).toUpperCase();
                      const isSelected = answers[currentQ.id]?.toUpperCase() === letter || answers[currentQ.id] === opt;
                      return (
                        <label
                          key={oIdx}
                          id={`question-${currentQuestionIdx}-opt-${oIdx}`}
                          onClick={() => handleSelectAnswer(currentQ.id, letter)}
                          className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isSelected
                            ? 'bg-yellow-50/80 border-yellow-400 ring-2 ring-yellow-200 text-yellow-950 font-medium'
                            : 'bg-white border-stone-200 hover:bg-stone-50 hover:border-stone-300 text-stone-700'
                            }`}
                        >
                          <div className={`w-5 h-5 rounded-full mt-0.5 border flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${isSelected ? 'bg-yellow-400 border-yellow-400 text-white' : 'border-stone-300 bg-white text-stone-500'
                            }`}>
                            {letter}
                          </div>
                          <span className="text-sm sm:text-base leading-snug">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Numerical Input */}
                {currentQ.type === 'numerical' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-stone-600">
                      Enter numerical value (Exact integer or decimal):
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="numerical-answer-input"
                        type="text"
                        value={answers[currentQ.id] || ''}
                        onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                        placeholder="e.g. 6 or -8 or 3.14"
                        className="flex-1 max-w-sm px-4 py-3 rounded-xl border border-stone-300 text-stone-900 font-mono text-base focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
                      />
                    </div>
                    <p className="text-[11px] text-stone-400">Do not include variable units unless requested.</p>
                  </div>
                )}

                {/* Objective Short Answer */}
                {currentQ.type === 'objective' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-stone-600">
                      Write your specific objective answer / key term:
                    </label>
                    <input
                      id="objective-answer-input"
                      type="text"
                      value={answers[currentQ.id] || ''}
                      onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                      placeholder="e.g. Total Internal Reflection or Pascal"
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-900 text-sm sm:text-base focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>

              {/* Navigation Footer Controls */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-100">
                <button
                  id="prev-question-btn"
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="text-xs text-stone-500 font-medium hidden sm:block">
                  {answeredCount} of {totalQuestions} Questions Answered
                </div>

                {currentQuestionIdx < totalQuestions - 1 ? (
                  <button
                    id="next-question-btn"
                    onClick={() => setCurrentQuestionIdx((p) => Math.min(totalQuestions - 1, p + 1))}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold shadow-xs"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    id="submit-final-exam-btn"
                    onClick={() => setShowConfirmSubmit(true)}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-stone-900 text-xs sm:text-sm font-semibold shadow-xs"
                  >
                    Submit 10 Marks
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Palette (Col 4) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 sticky top-24">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Question Palette</span>
                <span className="text-[11px] text-yellow-600 font-semibold">{answeredCount}/10</span>
              </h3>

              {/* 10-Question Grid */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {activeExam.questions.map((q, idx) => {
                  const isCurrent = idx === currentQuestionIdx;
                  const isAnswered = !!answers[q.id]?.trim();
                  const isFlagged = !!flaggedQuestions[q.id];

                  let btnBg = 'bg-stone-100 text-stone-700 hover:bg-stone-200';
                  if (isAnswered) btnBg = 'bg-yellow-400 text-stone-900 font-bold';
                  if (isFlagged) btnBg = 'bg-amber-400 text-amber-950 font-bold';
                  if (isCurrent) btnBg = 'bg-yellow-400 text-stone-900 ring-2 ring-yellow-300 ring-offset-2 font-bold';

                  return (
                    <button
                      key={q.id}
                      id={`palette-q-${idx + 1}`}
                      onClick={() => setCurrentQuestionIdx(idx)}
                      className={`h-10 rounded-xl text-xs flex items-center justify-center transition-all relative ${btnBg}`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="space-y-1.5 pt-3 border-t border-stone-100 text-[11px] text-stone-500">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-yellow-400"></span>
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-stone-200"></span>
                  <span>Unanswered ({totalQuestions - answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-amber-400"></span>
                  <span>Flagged for Review</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center text-yellow-600 mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">Submit 10-Mark Diagnostic?</h3>
              <p className="text-xs sm:text-sm text-stone-600 mb-4">
                You have answered <span className="font-semibold text-stone-900">{answeredCount} out of {totalQuestions} questions</span>.
                {totalQuestions - answeredCount > 0 && (
                  <span className="text-amber-600 block mt-1 font-medium">
                    ⚠️ You have {totalQuestions - answeredCount} unanswered questions that will receive 0 marks.
                  </span>
                )}
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  id="cancel-submit-modal-btn"
                  onClick={() => setShowConfirmSubmit(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Continue Test
                </button>
                <button
                  id="confirm-submit-exam-btn"
                  disabled={isSubmitting}
                  onClick={handleSubmitExam}
                  className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-stone-900 text-xs sm:text-sm font-semibold shadow-xs disabled:opacity-60"
                >
                  {isSubmitting ? 'Evaluating AI RAG...' : 'Yes, Submit & View Analytics'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Configuration & Exam Setup Screen
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-yellow-900 via-stone-900 to-yellow-950 text-white rounded-2xl p-5 sm:p-8 shadow-lg mb-6 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-200 border border-yellow-400/30 mb-4">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            10 Questions • 10 Marks • Adaptive RAG Diagnostic
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-3">
            Exam Preparedness & Knowledge Assessment
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-6">
            Calibrated for Classes 5 to 12 across CBSE, ICSE, ISC, Cambridge, NCERT, NEET, and IIT.
            Grounding your test in authentic syllabus runbooks with instant misconception analysis.
          </p>

          {/* Active Candidate Badge */}
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-xs sm:text-sm">
            <span className="text-xl">{activeChild?.avatar || '👦'}</span>
            <div>
              <span className="text-stone-300 text-[11px] block">Active Candidate Persona:</span>
              <span className="font-semibold text-white">{activeChild?.name} ({activeChild?.classGrade} • {activeChild?.targetBoard})</span>
            </div>
          </div>
        </div>

        {/* Decorative Background Accents */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-yellow-500/20 via-transparent to-transparent opacity-70 pointer-events-none" />
      </div>

      {/* Free Plan Daily Quota Notice */}
      {hasReachedDailyLimit && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">Daily Exam Quota Reached for Free Tier</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                {activeChild?.name} has completed 1/1 free diagnostic exam today. Upgrade to <strong className="font-semibold">Scholar Pro</strong> for unlimited daily tests or reset demo quota.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onResetDailyQuota(activeChild?.id)}
              className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors"
            >
              Reset Demo Quota (Testing)
            </button>
            <button
              onClick={onOpenUpgradeModal}
              className="px-4 py-1.5 rounded-xl bg-yellow-400 text-stone-900 text-xs font-semibold hover:bg-yellow-700 shadow-xs transition-colors"
            >
              Upgrade to Unlimited
            </button>
          </div>
        </div>
      )}

      {/* Exam Configuration Form */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Configure 10-Mark Diagnostic Exam</h2>
            <p className="text-xs text-stone-500">Select board, grade, subject, and target challenge level</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
              10 Questions • 10 Marks
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {isStudentPersona ? (
            /* Student View: Auto-locked Enrolled Syllabus Banner (Zero friction!) */
            <div className="md:col-span-2 bg-gradient-to-r from-yellow-50/90 via-amber-50/70 to-yellow-50/90 rounded-2xl p-4 sm:p-5 border border-yellow-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-xs border border-yellow-200 shrink-0">
                  {activeChild?.avatar || '🎓'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900">{activeChild?.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-400 text-stone-900">
                      Enrolled Student
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 flex items-center gap-2 flex-wrap">
                    <span>Curriculum Board: <strong className="text-yellow-950 font-bold">{selectedBoard}</strong></span>
                    <span className="text-stone-300">•</span>
                    <span>Grade / Class: <strong className="text-yellow-950 font-bold">{selectedGrade}</strong></span>
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-yellow-200">
                <span className="text-[11px] font-semibold text-yellow-700 bg-yellow-50 px-2.5 py-0.5 rounded-full border border-yellow-300">
                  ✓ Ready for Practice
                </span>
                <span className="text-[10px] text-stone-400">Adaptive 10-Mark Challenge</span>
              </div>
            </div>
          ) : (
            /* Parent View: Full Cross-Board & Syllabus Calibration Freedom */
            <>
              <div className="md:col-span-2 p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs text-amber-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Parent Cross-Board Calibration:</strong> You have full freedom to benchmark <strong>{activeChild?.name}</strong> against other exam boards (e.g. ICSE, Cambridge, IIT-JEE Foundation) to test cross-syllabus readiness.
                </span>
              </div>

              {/* Board Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  1. Target Curriculum / Exam Board
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BOARDS.map((b) => (
                    <button
                      key={b}
                      id={`board-btn-${b}`}
                      type="button"
                      onClick={() => setSelectedBoard(b)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${selectedBoard === b
                        ? 'bg-yellow-400 text-stone-900 border-yellow-400 shadow-2xs'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grade / Class Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  2. Student Class / Grade (Class 5 to 12)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      id={`grade-btn-${g.replace(/\s+/g, '')}`}
                      type="button"
                      onClick={() => setSelectedGrade(g)}
                      className={`py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all ${selectedGrade === g
                        ? 'bg-yellow-400 text-stone-900 border-yellow-400 shadow-2xs'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              3. Subject
            </label>
            <select
              id="subject-dropdown-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value as Subject)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-800 text-sm font-medium focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              4. Exam Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['simple', 'medium', 'hard'] as ExamDifficulty[]).map((d) => {
                const isSel = selectedDifficulty === d;
                const labels: Record<ExamDifficulty, { title: string; subtitle: string }> = {
                  simple: { title: 'Simple', subtitle: 'Foundation' },
                  medium: { title: 'Medium', subtitle: 'Proficiency' },
                  hard: { title: 'Hard', subtitle: 'HOTS / Olympiad' }
                };
                return (
                  <button
                    key={d}
                    id={`diff-btn-${d}`}
                    type="button"
                    onClick={() => setSelectedDifficulty(d)}
                    className={`py-2 px-3 rounded-xl border text-left transition-all ${isSel
                      ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                  >
                    <div className="font-bold text-xs capitalize">{labels[d].title}</div>
                    <div className={`text-[10px] ${isSel ? 'text-stone-300' : 'text-stone-400'}`}>
                      {labels[d].subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RAG Knowledge Blueprint Preview */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 mb-8">
          <p className="text-xs text-stone-600 leading-relaxed">
            Generating 10 questions for <strong className="text-stone-900">{selectedGrade} {selectedBoard} {selectedSubject} ({selectedDifficulty.toUpperCase()})</strong>.
            Questions will synthesize Multiple Choice, Numericals, Objective Definitions, and Assertion-Reasoning cases.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-stone-500">
            Estimated duration: <strong className="text-stone-800">15 minutes</strong> • 10 Marks
          </div>

          <button
            id="start-exam-generate-btn"
            disabled={isGenerating}
            onClick={handleStartExam}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-bold text-sm shadow-md shadow-yellow-200 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{generationStep || 'Building RAG Diagnostic...'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Start 10-Mark Diagnostic Exam</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

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
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flag,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calculator,
  Award,
  Star,
  Smile,
} from 'lucide-react';
import ApiServices from '../services/ApiServices';

interface KidsExamArenaProps {
  parentAccount: ParentAccount;
  activeChildId: string | null;
  activePersona?: 'parent' | 'child';
  onChildSelect: (childId: string) => void;
  onExamComplete: (submission: ExamSubmission) => void;
  onOpenUpgradeModal: () => void;
  onResetDailyQuota: (childId: string) => void;
  presetSubject?: Subject;
  presetDifficulty?: ExamDifficulty;
  initialExam?: Exam | null;
  onClearInitialExam?: () => void;
}

const BOARDS: Board[] = ['CBSE', 'ICSE', 'ISC', 'UK-Cambridge', 'NCERT', 'NEET', 'IIT'];
const KIDS_GRADES: ClassGrade[] = ['Class 1', 'Class 2', 'Class 3', 'Class 4'];

const MOCK_EXAMS_BY_CLASS: Record<string, Exam> = {
  'Class 1': {
    id: 'mock-class-1', title: 'Class 1 Adventure', board: 'CBSE', classGrade: 'Class 1', subject: 'Mathematics', difficulty: 'simple', totalMarks: 5, questionCount: 5, timeLimitMinutes: 10, ragKnowledgeNodesUsed: [], createdAt: new Date().toISOString(),
    questions: [
      { id: 'c1q1', questionNumber: 1, type: 'mcq', questionText: 'What sound does a cow make? 🐄', options: ['A. Moo', 'B. Baa', 'C. Oink', 'D. Quack'], correctAnswer: 'A', explanation: 'Cows say moo!', difficulty: 'simple', marks: 1, topic: 'Animals', board: 'CBSE' },
      { id: 'c1q2', questionNumber: 2, type: 'mcq', questionText: 'How many wheels does a bicycle have? 🚲', options: ['A. 1', 'B. 2', 'C. 3', 'D. 4'], correctAnswer: 'B', explanation: 'A bicycle has 2 wheels.', difficulty: 'simple', marks: 1, topic: 'Counting', board: 'CBSE' },
      { id: 'c1q3', questionNumber: 3, type: 'numerical', questionText: '1 + 1 = ? 🤔', correctAnswer: '2', explanation: 'One and one make two.', difficulty: 'simple', marks: 1, topic: 'Math', board: 'CBSE' },
      { id: 'c1q4', questionNumber: 4, type: 'mcq', questionText: 'Which one is a fruit? 🍎', options: ['A. Carrot', 'B. Potato', 'C. Apple', 'D. Onion'], correctAnswer: 'C', explanation: 'Apple is a fruit.', difficulty: 'simple', marks: 1, topic: 'Food', board: 'CBSE' },
      { id: 'c1q5', questionNumber: 5, type: 'objective', questionText: 'What color is the sun? ☀️', correctAnswer: 'YELLOW', explanation: 'The sun looks yellow.', difficulty: 'simple', marks: 1, topic: 'Colors', board: 'CBSE' }
    ]
  },
  'Class 2': {
    id: 'mock-class-2', title: 'Class 2 Explorer', board: 'CBSE', classGrade: 'Class 2', subject: 'Mathematics', difficulty: 'simple', totalMarks: 5, questionCount: 5, timeLimitMinutes: 10, ragKnowledgeNodesUsed: [], createdAt: new Date().toISOString(),
    questions: [
      { id: 'c2q1', questionNumber: 1, type: 'mcq', questionText: 'Which animal is known as the king of the jungle? 🦁', options: ['A. Tiger', 'B. Lion', 'C. Elephant', 'D. Bear'], correctAnswer: 'B', explanation: 'The lion is the king of the jungle.', difficulty: 'simple', marks: 1, topic: 'Animals', board: 'CBSE' },
      { id: 'c2q2', questionNumber: 2, type: 'numerical', questionText: '5 + 3 = ? 🎈', correctAnswer: '8', explanation: 'Five plus three is eight.', difficulty: 'simple', marks: 1, topic: 'Math', board: 'CBSE' },
      { id: 'c2q3', questionNumber: 3, type: 'mcq', questionText: 'Which month comes after March? 🗓️', options: ['A. May', 'B. February', 'C. April', 'D. June'], correctAnswer: 'C', explanation: 'April comes after March.', difficulty: 'simple', marks: 1, topic: 'Calendar', board: 'CBSE' },
      { id: 'c2q4', questionNumber: 4, type: 'mcq', questionText: 'How many days are in a week? 📅', options: ['A. 5', 'B. 6', 'C. 7', 'D. 8'], correctAnswer: 'C', explanation: 'There are 7 days in a week.', difficulty: 'simple', marks: 1, topic: 'Calendar', board: 'CBSE' },
      { id: 'c2q5', questionNumber: 5, type: 'objective', questionText: 'Opposite of HOT is? 🧊', correctAnswer: 'COLD', explanation: 'The opposite of hot is cold.', difficulty: 'simple', marks: 1, topic: 'English', board: 'CBSE' }
    ]
  },
  'Class 3': {
    id: 'mock-class-3', title: 'Class 3 Challenger', board: 'CBSE', classGrade: 'Class 3', subject: 'Science', difficulty: 'simple', totalMarks: 5, questionCount: 5, timeLimitMinutes: 10, ragKnowledgeNodesUsed: [], createdAt: new Date().toISOString(),
    questions: [
      { id: 'c3q1', questionNumber: 1, type: 'mcq', questionText: 'Which planet do we live on? 🌍', options: ['A. Mars', 'B. Earth', 'C. Jupiter', 'D. Venus'], correctAnswer: 'B', explanation: 'We live on planet Earth.', difficulty: 'simple', marks: 1, topic: 'Science', board: 'CBSE' },
      { id: 'c3q2', questionNumber: 2, type: 'numerical', questionText: '12 - 5 = ? ✏️', correctAnswer: '7', explanation: '12 minus 5 equals 7.', difficulty: 'simple', marks: 1, topic: 'Math', board: 'CBSE' },
      { id: 'c3q3', questionNumber: 3, type: 'mcq', questionText: 'What is the past tense of "Go"? 🏃', options: ['A. Goes', 'B. Going', 'C. Gone', 'D. Went'], correctAnswer: 'D', explanation: '"Went" is the past tense of "Go".', difficulty: 'simple', marks: 1, topic: 'English', board: 'CBSE' },
      { id: 'c3q4', questionNumber: 4, type: 'mcq', questionText: 'Water boils at what temperature? 🌡️', options: ['A. 50°C', 'B. 100°C', 'C. 0°C', 'D. 200°C'], correctAnswer: 'B', explanation: 'Water boils at 100 degrees Celsius.', difficulty: 'simple', marks: 1, topic: 'Science', board: 'CBSE' },
      { id: 'c3q5', questionNumber: 5, type: 'objective', questionText: 'Name the shape with 4 equal sides. 🟩', correctAnswer: 'SQUARE', explanation: 'A square has 4 equal sides.', difficulty: 'simple', marks: 1, topic: 'Math', board: 'CBSE' }
    ]
  },
  'Class 4': {
    id: 'mock-class-4', title: 'Class 4 Champion', board: 'CBSE', classGrade: 'Class 4', subject: 'Science', difficulty: 'simple', totalMarks: 5, questionCount: 5, timeLimitMinutes: 10, ragKnowledgeNodesUsed: [], createdAt: new Date().toISOString(),
    questions: [
      { id: 'c4q1', questionNumber: 1, type: 'mcq', questionText: 'Which gas do plants absorb from the atmosphere? 🌱', options: ['A. Oxygen', 'B. Carbon Dioxide', 'C. Nitrogen', 'D. Hydrogen'], correctAnswer: 'B', explanation: 'Plants absorb Carbon Dioxide for photosynthesis.', difficulty: 'simple', marks: 1, topic: 'Science', board: 'CBSE' },
      { id: 'c4q2', questionNumber: 2, type: 'numerical', questionText: '8 x 4 = ? ✖️', correctAnswer: '32', explanation: '8 multiplied by 4 is 32.', difficulty: 'simple', marks: 1, topic: 'Math', board: 'CBSE' },
      { id: 'c4q3', questionNumber: 3, type: 'mcq', questionText: 'Which part of speech describes a noun? 📝', options: ['A. Verb', 'B. Adverb', 'C. Adjective', 'D. Pronoun'], correctAnswer: 'C', explanation: 'An adjective describes a noun.', difficulty: 'simple', marks: 1, topic: 'English', board: 'CBSE' },
      { id: 'c4q4', questionNumber: 4, type: 'mcq', questionText: 'What fraction is equivalent to 1/2? 🍕', options: ['A. 2/4', 'B. 1/3', 'C. 3/5', 'D. 2/3'], correctAnswer: 'A', explanation: '2/4 reduces to 1/2.', difficulty: 'simple', marks: 1, topic: 'Math', board: 'CBSE' },
      { id: 'c4q5', questionNumber: 5, type: 'objective', questionText: 'What is the capital of India? 🇮🇳', correctAnswer: 'NEW DELHI', explanation: 'New Delhi is the capital of India.', difficulty: 'simple', marks: 1, topic: 'Geography', board: 'CBSE' }
    ]
  }
};

export const KidsExamArena: React.FC<KidsExamArenaProps> = ({
  parentAccount,
  activeChildId,
  activePersona = 'parent',
  onChildSelect,
  onExamComplete,
  onOpenUpgradeModal,
  onResetDailyQuota,
  initialExam,
  onClearInitialExam,
}) => {
  const isStudentPersona = activePersona === 'child';
  const activeChild = parentAccount.children.find((c) => c.id === activeChildId) || parentAccount.children[0];

  // Config State
  const [selectedBoard, setSelectedBoard] = useState<Board>(activeChild?.targetBoard || 'CBSE');
  const [selectedGrade, setSelectedGrade] = useState<ClassGrade>(
    activeChild?.classGrade && KIDS_GRADES.includes(activeChild.classGrade as ClassGrade)
      ? activeChild.classGrade
      : 'Class 1'
  );
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Mathematics');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ExamDifficulty>('simple');

  // Exam taking state
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeExam, setActiveExam] = useState<Exam | null>(initialExam || null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(
    initialExam?.timeLimitMinutes ? initialExam.timeLimitMinutes * 60 : 15 * 60
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  useEffect(() => {
    if (initialExam) {
      setActiveExam(initialExam);
      setCurrentQuestionIdx(0);
      setAnswers({});
      setFlaggedQuestions({});
      setTimeRemainingSeconds((initialExam.timeLimitMinutes || 15) * 60);
      if (onClearInitialExam) {
        onClearInitialExam();
      }
    }
  }, [initialExam]);

  useEffect(() => {
    if (activeChild) {
      setSelectedBoard(activeChild.targetBoard);
      if (KIDS_GRADES.includes(activeChild.classGrade as ClassGrade)) {
        setSelectedGrade(activeChild.classGrade);
      }
    }
  }, [activeChildId, activeChild]);

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
    setIsGenerating(true);
    setGenerationStep('Getting Fun Questions Ready... 🎈');

    try {
      setTimeout(() => {
        const grade = activeChild?.classGrade || 'Class 1';
        const mockExam = MOCK_EXAMS_BY_CLASS[grade] || MOCK_EXAMS_BY_CLASS['Class 1'];
        setActiveExam(mockExam);
        setCurrentQuestionIdx(0);
        setAnswers({});
        setFlaggedQuestions({});
        setTimeRemainingSeconds(mockExam.timeLimitMinutes * 60);
        setIsGenerating(false);
        setGenerationStep('');
      }, 1000);
    } catch (err) {
      console.error('Error starting mock exam:', err);
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

    setTimeout(() => {
      // Mock Submission Evaluation
      let marksObtained = 0;
      const evaluations = activeExam.questions.map((q) => {
        let isCorrect = false;
        const studentAnswer = answers[q.id] || '';
        if (q.type === 'mcq' || q.type === 'logical') {
          isCorrect = studentAnswer.toUpperCase() === q.correctAnswer.toUpperCase();
        } else if (q.type === 'numerical' || q.type === 'objective') {
          isCorrect = studentAnswer.trim().toLowerCase() === q.correctAnswer.toLowerCase();
        }
        
        if (isCorrect) marksObtained += (q.marks || 1);

        return {
          questionId: q.id,
          questionNumber: q.questionNumber,
          type: q.type,
          questionText: q.questionText,
          options: q.options,
          studentAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect,
          marksAwarded: isCorrect ? q.marks : 0,
          explanation: q.explanation,
          referenceLinks: [],
          topic: q.topic
        };
      });

      const submission: ExamSubmission = {
        id: `mock-sub-${Date.now()}`,
        examId: activeExam.id,
        examTitle: activeExam.title,
        studentId: activeChild?.id || 'unknown',
        studentName: activeChild?.name || 'Student',
        board: activeExam.board,
        classGrade: activeExam.classGrade,
        subject: activeExam.subject,
        difficulty: activeExam.difficulty,
        answers,
        marksObtained,
        totalMarks: activeExam.totalMarks,
        accuracyPercentage: (marksObtained / activeExam.totalMarks) * 100,
        timeTakenSeconds: Math.max(10, totalSecondsSpent),
        submittedAt: new Date().toISOString(),
        evaluations,
        analysis: {
          overallBand: 'Proficient',
          masteryScorePercentage: (marksObtained / activeExam.totalMarks) * 100,
          strengths: ['Great job completing the test!'],
          areasToImprove: [],
          kGraphInsights: [],
          evolutionaryRoadmap: 'Keep practicing to earn more stars! 🌟',
          encouragementNote: 'You did amazing! Super star! ✨',
          recommendedNextExam: {
            board: activeExam.board,
            classGrade: activeExam.classGrade,
            subject: activeExam.subject,
            difficulty: 'simple',
            reason: 'Practice makes perfect!'
          },
          curatedStudyLinks: []
        }
      };

      onExamComplete(submission);
      setIsSubmitting(false);
      setActiveExam(null);
    }, 1500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (activeExam) {
    const currentQ = activeExam.questions[currentQuestionIdx];
    const totalQuestions = activeExam.questions.length;
    const answeredCount = Object.keys(answers).filter((k) => answers[k]?.trim() !== '').length;

    return (
      <div className="max-w-5xl mx-auto px-4 py-6 font-comic">
        {/* Top Sticky Status Bar */}
        <div className="bg-white rounded-3xl border-4 border-sky-200 shadow-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4 sticky top-20 z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-yellow-300 border-4 border-yellow-400 flex items-center justify-center font-black text-xl text-yellow-800 shadow-sm">
              {currentQuestionIdx + 1}/{totalQuestions}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="font-black text-sky-900 text-lg sm:text-2xl">{activeExam.title} 🌟</span>
              </div>
              <p className="text-sm text-sky-600 font-bold">
                Student: <span className="text-sky-800">{activeChild?.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-4 font-black text-lg ${timeRemainingSeconds < 180
              ? 'bg-rose-100 border-rose-300 text-rose-600 animate-bounce'
              : 'bg-emerald-100 border-emerald-300 text-emerald-700'
              }`}>
              <Clock className="w-5 h-5" />
              <span>{formatTime(timeRemainingSeconds)}</span>
            </div>

            {/* Finish / Submit Button */}
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="px-6 py-2.5 rounded-full bg-yellow-400 hover:bg-yellow-500 border-4 border-yellow-500 text-yellow-950 text-lg font-black shadow-lg hover:scale-105 transition-transform"
            >
              Finish! 🎯
            </button>
          </div>
        </div>

        {/* Main Grid: Question Content + Question Palette */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Card (Col 1-3) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border-4 border-sky-200 shadow-xl p-6 sm:p-10 relative overflow-hidden">
              {/* Question Header */}
              <div className="flex items-center justify-between pb-4 border-b-4 border-sky-100 mb-6">
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 rounded-2xl text-lg font-black bg-sky-500 text-white shadow-sm">
                    Question {currentQuestionIdx + 1}
                  </span>
                  <span className="px-3 py-1 rounded-xl text-sm font-bold bg-pink-100 text-pink-700 border-2 border-pink-200">
                    Topic: {currentQ.topic}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-purple-700 bg-purple-100 border-2 border-purple-200 px-3 py-1.5 rounded-xl">
                    ⭐ {currentQ.marks || 1} Star{(currentQ.marks || 1) > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => toggleFlagQuestion(currentQ.id)}
                    className={`p-2.5 rounded-xl border-4 flex items-center gap-1 transition-transform hover:scale-110 ${flaggedQuestions[currentQ.id]
                      ? 'bg-amber-100 border-amber-400 text-amber-700'
                      : 'bg-white border-stone-200 text-stone-400'
                      }`}
                    title="Mark to check later!"
                  >
                    <Flag className={`w-5 h-5 ${flaggedQuestions[currentQ.id] ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Question Statement */}
              <div className="text-sky-950 text-xl sm:text-3xl font-bold leading-tight mb-8 whitespace-pre-line">
                {currentQ.questionText}
              </div>

              {/* Response Inputs based on Type */}
              <div className="space-y-4 pt-2">
                {(currentQ.type === 'mcq' || currentQ.type === 'logical') && currentQ.options && (
                  <div className="space-y-4">
                    {currentQ.options.map((opt, oIdx) => {
                      const letter = opt.trim().charAt(0).toUpperCase();
                      const isSelected = answers[currentQ.id]?.toUpperCase() === letter || answers[currentQ.id] === opt;
                      return (
                        <label
                          key={oIdx}
                          onClick={() => handleSelectAnswer(currentQ.id, letter)}
                          className={`flex items-center gap-4 p-5 rounded-2xl border-4 cursor-pointer transition-all hover:-translate-y-1 ${isSelected
                            ? 'bg-emerald-100 border-emerald-400 shadow-md text-emerald-950'
                            : 'bg-white border-stone-200 hover:border-sky-300 text-stone-700'
                            }`}
                        >
                          <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center shrink-0 text-xl font-black transition-colors ${isSelected ? 'bg-emerald-400 border-emerald-500 text-white' : 'bg-stone-100 border-stone-300 text-stone-500'
                            }`}>
                            {letter}
                          </div>
                          <span className="text-lg sm:text-2xl font-bold leading-snug">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {currentQ.type === 'numerical' && (
                  <div className="space-y-4">
                    <label className="block text-lg font-black text-sky-700">
                      Type your number here:
                    </label>
                    <input
                      type="text"
                      value={answers[currentQ.id] || ''}
                      onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full max-w-sm px-6 py-4 rounded-2xl border-4 border-sky-300 text-sky-950 font-black text-3xl focus:ring-4 focus:ring-yellow-400 focus:outline-hidden"
                    />
                  </div>
                )}

                {currentQ.type === 'objective' && (
                  <div className="space-y-4">
                    <label className="block text-lg font-black text-sky-700">
                      Type your answer here:
                    </label>
                    <input
                      type="text"
                      value={answers[currentQ.id] || ''}
                      onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                      placeholder="Your answer..."
                      className="w-full px-6 py-4 rounded-2xl border-4 border-sky-300 text-sky-950 font-black text-xl sm:text-2xl focus:ring-4 focus:ring-yellow-400 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>

              {/* Navigation Footer Controls */}
              <div className="flex items-center justify-between mt-10 pt-8 border-t-4 border-sky-100">
                <button
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                  className="flex items-center gap-2 px-6 py-3 rounded-full border-4 border-sky-300 text-lg font-black text-sky-700 hover:bg-sky-50 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 transition-all"
                >
                  <ArrowLeft className="w-6 h-6" />
                  Back
                </button>

                {currentQuestionIdx < totalQuestions - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIdx((p) => Math.min(totalQuestions - 1, p + 1))}
                    className="flex items-center gap-2 px-8 py-3 rounded-full bg-sky-500 hover:bg-sky-600 border-4 border-sky-600 text-white text-lg font-black shadow-lg hover:scale-105 transition-all"
                  >
                    Next
                    <ArrowRight className="w-6 h-6" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmSubmit(true)}
                    className="flex items-center gap-2 px-8 py-3 rounded-full bg-yellow-400 hover:bg-yellow-500 border-4 border-yellow-500 text-yellow-950 text-lg font-black shadow-lg hover:scale-105 transition-all"
                  >
                    Done! 🏆
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Palette (Col 4) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border-4 border-sky-200 shadow-xl p-5 sticky top-48">
              <h3 className="text-lg font-black text-sky-900 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Map 🗺️</span>
                <span className="text-sm text-emerald-600 font-black bg-emerald-100 px-3 py-1 rounded-full border-2 border-emerald-200">{answeredCount}/10</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {activeExam.questions.map((q, idx) => {
                  const isCurrent = idx === currentQuestionIdx;
                  const isAnswered = !!answers[q.id]?.trim();
                  const isFlagged = !!flaggedQuestions[q.id];

                  let btnBg = 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100';
                  if (isAnswered) btnBg = 'bg-emerald-400 border-emerald-500 text-white font-black shadow-sm';
                  if (isFlagged) btnBg = 'bg-amber-300 border-amber-400 text-amber-900 font-black shadow-sm';
                  if (isCurrent) btnBg = 'bg-yellow-400 border-yellow-500 text-yellow-950 font-black scale-110 shadow-md';

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIdx(idx)}
                      className={`h-12 rounded-2xl border-4 text-xl flex items-center justify-center transition-all relative ${btnBg}`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span className="absolute -top-2 -right-2 text-xl drop-shadow-md">🚩</span>
                      )}
                      {isAnswered && !isCurrent && !isFlagged && (
                        <span className="absolute -top-2 -right-2 text-xl drop-shadow-md">⭐</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-50 bg-sky-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border-4 border-sky-200 text-center animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-full bg-yellow-100 border-4 border-yellow-300 flex items-center justify-center text-5xl mx-auto mb-6 shadow-sm">
                🏆
              </div>
              <h3 className="text-3xl font-black text-sky-950 mb-3">All Done?</h3>
              <p className="text-lg text-stone-600 font-bold mb-8">
                You've got <span className="text-emerald-600 text-2xl">{answeredCount}</span> out of {totalQuestions} stars!
                {totalQuestions - answeredCount > 0 && (
                  <span className="text-rose-500 block mt-2">
                    Oh oh! You missed {totalQuestions - answeredCount} question{totalQuestions - answeredCount > 1 ? 's' : ''}.
                  </span>
                )}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  disabled={isSubmitting}
                  onClick={handleSubmitExam}
                  className="w-full px-6 py-4 rounded-full bg-emerald-400 hover:bg-emerald-500 border-4 border-emerald-500 text-white text-xl font-black shadow-lg hover:scale-105 transition-all disabled:opacity-60"
                >
                  {isSubmitting ? 'Checking Answers...' : "Yes, Let's Go! 🚀"}
                </button>
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="w-full px-6 py-4 rounded-full bg-stone-100 hover:bg-stone-200 border-4 border-stone-200 text-stone-600 text-xl font-black hover:scale-105 transition-all"
                >
                  Wait, go back!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Configuration & Exam Setup Screen for Kids
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-comic">
      <div className="bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl mb-10 relative overflow-hidden border-8 border-sky-300/30">
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-black bg-yellow-300 text-yellow-900 border-4 border-yellow-400 mb-6 shadow-md transform -rotate-2">
            <Star className="w-5 h-5 fill-current" />
            Super Fun Learning Zone! 🎈
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6 drop-shadow-lg leading-tight">
            Ready for an Adventure? 🚀
          </h1>
          <p className="text-sky-100 text-lg sm:text-xl font-bold leading-relaxed mb-8 drop-shadow-md">
            Let's play a game of questions! Answer them correctly to earn shiny stars and badges.
          </p>

          <div className="inline-flex items-center gap-4 bg-white/20 backdrop-blur-md px-6 py-4 rounded-3xl border-4 border-white/40 shadow-xl">
            <span className="text-4xl bg-white p-2 rounded-full shadow-inner">{activeChild?.avatar || '👦'}</span>
            <div className="text-left">
              <span className="text-sky-100 text-sm font-bold block uppercase tracking-wider">Player 1 Ready:</span>
              <span className="font-black text-2xl text-white drop-shadow-sm">{activeChild?.name} ({selectedGrade})</span>
            </div>
          </div>
        </div>
        
        {/* Floating background elements */}
        <div className="absolute top-10 left-10 text-6xl opacity-30 animate-bounce delay-100">🌟</div>
        <div className="absolute bottom-10 right-10 text-6xl opacity-30 animate-bounce delay-300">🎈</div>
        <div className="absolute top-20 right-20 text-5xl opacity-30 animate-pulse">🚀</div>
      </div>

      {hasReachedDailyLimit && (
        <div className="bg-rose-100 border-4 border-rose-300 rounded-3xl p-6 mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="text-4xl">😴</div>
            <div>
              <h4 className="text-xl font-black text-rose-900 mb-1">Time for a break!</h4>
              <p className="text-base text-rose-700 font-bold">
                {activeChild?.name} has played enough today. Tell Mom or Dad to unlock more games!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenUpgradeModal}
              className="px-6 py-3 rounded-full bg-rose-500 border-4 border-rose-600 text-white text-lg font-black hover:bg-rose-600 shadow-lg hover:scale-105 transition-transform"
            >
              Get More Tests!
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border-4 border-sky-200 shadow-xl p-8 sm:p-12 relative">
        <h2 className="text-3xl font-black text-sky-900 mb-8 text-center">Pick Your Quest! 🗺️</h2>

        {/* Action Button */}
        <div className="flex justify-center mt-6">
          <button
            disabled={isGenerating}
            onClick={handleStartExam}
            className="group px-10 py-5 rounded-full bg-emerald-400 hover:bg-emerald-500 border-4 border-emerald-500 text-white font-black text-2xl shadow-[0_8px_0_rgb(16,185,129)] active:shadow-[0_0px_0_rgb(16,185,129)] active:translate-y-2 flex items-center justify-center gap-4 transition-all disabled:opacity-60 disabled:transform-none disabled:shadow-none"
          >
            {isGenerating ? (
              <>
                <span className="text-3xl animate-spin">🌀</span>
                <span>{generationStep || 'Building Magic...'}</span>
              </>
            ) : (
              <>
                <span>Start Playing!</span>
                <Play className="w-8 h-8 fill-white group-hover:scale-125 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Layers,
  Zap,
  Users,
  ShieldCheck,
  Award,
  CheckCircle2,
  ArrowRight,
  Play,
  Compass,
  Trophy,
  Smile,
  BookOpen,
  ChevronRight,
  ChevronDown,
  BarChart3,
  MessageSquare,
  FileText,
  Activity,
  Brain,
  KeyRound,
  Gamepad2,
  Clock,
  Flame,
  Menu,
  X,
  Target,
  Check,
  TrendingUp,
  Lock,
  Lightbulb
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onQuickDemo?: (role?: 'admin' | 'parent') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interactive Live Diagnostic Demo state
  const [selectedSubjectKey, setSelectedSubjectKey] = useState<'math' | 'physics' | 'science' | 'chemistry'>('math');
  const [selectedResponseIdx, setSelectedResponseIdx] = useState<number>(0);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Active Board tab in the Curriculum Matrix
  const [activeBoardTab, setActiveBoardTab] = useState<'cbse' | 'icse' | 'cambridge' | 'neet_iit' | 'state'>('cbse');

  // FAQ open/close state
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    onOpenAuth(mode);
  };

  // Real question samples matching the backend's published runbooks
  const demoQuestions = {
    math: {
      subject: 'Mathematics',
      grade: 'Class 10 CBSE',
      chapter: 'Quadratic Equations & Nature of Roots',
      marks: 10,
      question:
        'A motorboat whose speed is 18 km/h in still water takes 1 hour more to go 24 km upstream than to return downstream to the same spot. Find the speed of the stream.',
      responses: [
        {
          label: 'Flawless Derivation',
          tag: '10/10 Score',
          tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          studentWork:
            'Let speed of stream = x km/h.\nUpstream speed = (18 - x), Downstream = (18 + x).\nTime difference: 24/(18 - x) - 24/(18 + x) = 1\n24[(18 + x) - (18 - x)] / (324 - x²) = 1\n24(2x) = 324 - x²  =>  x² + 48x - 324 = 0\n(x + 54)(x - 6) = 0\nSince speed > 0, speed of stream x = 6 km/h.',
          score: 10,
          breakdown: [
            { step: 'Variable definition & speed expressions', marks: '2/2', pass: true },
            { step: 'Correct time equation setup [24/(18-x) - 24/(18+x) = 1]', marks: '3/3', pass: true },
            { step: 'Quadratic formulation (x² + 48x - 324 = 0)', marks: '3/3', pass: true },
            { step: 'Root extraction & physical constraint check (reject x = -54)', marks: '2/2', pass: true },
          ],
          feedback: 'Clean step progression with clear algebraic formulation and constraint justification.',
        },
        {
          label: 'Sign Trap in Step 3',
          tag: '7/10 Feedback',
          tagColor: 'bg-amber-100 text-amber-800 border-amber-200',
          studentWork:
            'Let speed of stream = x km/h.\nUpstream = (18 - x), Downstream = (18 + x).\n24/(18 - x) - 24/(18 + x) = 1\n48x = 324 - x²  =>  x² + 48x + 324 = 0  [sign flipped on RHS move]\nUsing quadratic formula gave negative roots.',
          score: 7,
          breakdown: [
            { step: 'Variable definition & speed expressions', marks: '2/2', pass: true },
            { step: 'Time equation setup', marks: '3/3', pass: true },
            { step: 'Quadratic formulation (Sign error during transposition)', marks: '1/3', pass: false },
            { step: 'Root validation', marks: '1/2', pass: false },
          ],
          feedback:
            'Transposition sign flip detected moving 324 to LHS. Pinpointed to NCERT Chapter 4 Section 4.3 transposition rules.',
        },
      ],
    },
    physics: {
      subject: 'Physics',
      grade: 'Class 12 CBSE / ISC',
      chapter: 'Electromagnetic Induction & Lenz’s Law',
      marks: 10,
      question:
        'A rectangular wire loop of sides 8 cm and 2 cm with a small cut is moving out of a uniform magnetic field of 0.3 T at a constant velocity of 1 cm/s. Calculate the induced EMF and state the current direction.',
      responses: [
        {
          label: 'Complete Solution',
          tag: '10/10 Score',
          tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          studentWork:
            'Motional EMF e = B·l·v\nGiven: B = 0.3 T, l = 8 cm = 0.08 m, v = 1 cm/s = 0.01 m/s.\ne = 0.3 × 0.08 × 0.01 = 2.4 × 10⁻⁴ V = 0.24 mV.\nBy Lenz’s Law, the induced current opposes flux decrease => Clockwise direction.',
          score: 10,
          breakdown: [
            { step: 'Motional EMF formula identification (e = Blv)', marks: '2/2', pass: true },
            { step: 'SI unit conversion (cm to m)', marks: '3/3', pass: true },
            { step: 'Numerical computation (0.24 mV)', marks: '3/3', pass: true },
            { step: 'Lenz’s law direction justification', marks: '2/2', pass: true },
          ],
          feedback: 'Accurate formula application, SI unit normalization, and clear Lenz’s law reasoning.',
        },
      ],
    },
    science: {
      subject: 'General Science',
      grade: 'Class 8 NCERT / ICSE',
      chapter: 'Cell Structure & Functions',
      marks: 10,
      question:
        'State three fundamental differences between plant and animal cells with respect to cell wall, plastids, and vacuoles. Explain why plant cells require a rigid cell wall.',
      responses: [
        {
          label: 'Model Answer',
          tag: '10/10 Score',
          tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          studentWork:
            '1. Plant cell has a rigid cellulose cell wall; animal cell does not.\n2. Plant cell contains plastids (chloroplasts); animal cell lacks plastids.\n3. Plant cell contains a large central vacuole; animal cell has small vacuoles.\nReason: Plants cannot move to shelter from temperature swings, wind, and moisture, so the cell wall provides mechanical rigidity and prevents osmotic bursting.',
          score: 10,
          breakdown: [
            { step: 'Cell wall distinction', marks: '2/2', pass: true },
            { step: 'Plastids distinction', marks: '2/2', pass: true },
            { step: 'Vacuole distinction', marks: '2/2', pass: true },
            { step: 'Environmental protection reasoning', marks: '4/4', pass: true },
          ],
          feedback: 'Accurate comparative taxonomy and clear physiological reasoning.',
        },
      ],
    },
    chemistry: {
      subject: 'Chemistry',
      grade: 'Class 11 CBSE / NEET Foundation',
      chapter: 'Chemical Bonding & Molecular Geometry',
      marks: 10,
      question:
        'Predict the hybridization, electron geometry, and actual molecular shape of SF₄ and XeF₄ using VSEPR theory. Account for lone pair-bond pair repulsions.',
      responses: [
        {
          label: 'VSEPR Derivation',
          tag: '10/10 Score',
          tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          studentWork:
            'For SF₄: 6 valence e⁻ + 4 F = 10 e⁻ (5 pairs: 4 bp + 1 lp). Hybridization: sp³d. Electron geometry: Trigonal bipyramidal. Lone pair occupies equatorial position => Shape: See-saw.\n\nFor XeF₄: 8 valence e⁻ + 4 F = 12 e⁻ (6 pairs: 4 bp + 2 lp). Hybridization: sp³d². Electron geometry: Octahedral. Lone pairs occupy trans axial positions => Shape: Square planar.',
          score: 10,
          breakdown: [
            { step: 'Steric number & hybridization derivation', marks: '3/3', pass: true },
            { step: 'Electron vs molecular geometry distinction', marks: '3/3', pass: true },
            { step: 'Equatorial vs Axial repulsion minimization', marks: '2/2', pass: true },
            { step: 'Final shapes: See-saw & Square planar', marks: '2/2', pass: true },
          ],
          feedback: 'Thorough steric number derivation with correct VSEPR repulsion minimization.',
        },
      ],
    },
  };

  const currentQ = demoQuestions[selectedSubjectKey];
  const currentResp = currentQ.responses[selectedResponseIdx] || currentQ.responses[0];

  const handleSimulateEvaluate = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
    }, 300);
  };

  const faqs = [
    {
      q: 'How does AcuGrade AI evaluate multi-step answers?',
      a: 'AcuGrade AI uses an intelligent knowledge engine grounded in verified board runbooks (CBSE, ICSE, Cambridge, and State Boards). It parses student derivations, checks intermediate formulas, identifies calculation or sign slips, and allocates partial step marks per official board rubrics.',
    },
    {
      q: 'Why a 10-mark diagnostic sprint instead of a full 3-hour mock test?',
      a: 'Full 3-hour tests cause student fatigue and cannot easily be taken daily. A calibrated 10-mark sprint delivers pinpoint diagnostic insights in 15 minutes, allowing students to test regularly, isolate conceptual gaps immediately, and track long-term topic mastery.',
    },
    {
      q: 'Can parents manage multiple children across different grades and boards?',
      a: 'Yes. A single Parent Account supports multiple child profiles (e.g. one in Class 10 CBSE and another in Class 8 ICSE). Each child gets an individual 4-digit PIN for student arena access, independent streak tracking, and separate evolutionary mastery maps.',
    },
    {
      q: 'What curricula and competitive benchmarks are supported?',
      a: 'AcuGrade AI natively supports CBSE & NCERT, ICSE & ISC (CISCE), UK Cambridge (CIE IGCSE & A-Levels), State Secondary Boards, and foundational problem archetypes for NEET (NTA) and IIT JEE for Classes 5 through 12.',
    },
    {
      q: 'Can diagnostic reports be shared with school teachers?',
      a: 'Yes. Parents can export comprehensive 360° PDF Diagnostic Dossiers with one click, or invite educators to communicate directly via the Parent-Teacher Communication hub.',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-indigo-600 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. HEADER / NAVIGATION BAR                                                */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left Side: Brand Logo, Project Name, Tagline */}
          <div className="flex items-center gap-3 select-none">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-100 ring-2 ring-indigo-50">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 font-display">AcuGrade AI</span>
              <span className="block text-[11px] text-slate-500 font-medium">Precision AI Exam Diagnostics</span>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#hero" className="hover:text-indigo-600 transition-colors">
              Home
            </a>
            <a href="#about-app" className="hover:text-indigo-600 transition-colors">
              About
            </a>
            <a href="#features" className="hover:text-indigo-600 transition-colors">
              Features
            </a>
            <a href="#interactive-demo" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <span>Interactive Demo</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                Live
              </span>
            </a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">
              How It Works
            </a>
            <a href="#curriculum" className="hover:text-indigo-600 transition-colors">
              Curriculum
            </a>
          </nav>

          {/* Right Side: Login & Sign Up Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => openAuth('login')}
              className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-slate-500" />
              <span>Sign in</span>
            </button>

            <button
              onClick={() => openAuth('register')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 hover:shadow-lg transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>Sign Up</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Sheet */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600"
            >
              Home
            </a>
            <a
              href="#about-app"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600"
            >
              About Platform
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600"
            >
              Features
            </a>
            <a
              href="#interactive-demo"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600"
            >
              Interactive Demo
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600"
            >
              How It Works
            </a>
            <a
              href="#curriculum"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600"
            >
              Curriculum & Boards
            </a>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuth('login');
                }}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold text-sm hover:bg-slate-50"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuth('register');
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md"
              >
                Sign Up / Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section id="hero" className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 mesh-gradient-bg overflow-hidden">
        {/* Subtle Background Glow Orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[320px] bg-gradient-to-tr from-indigo-200/30 to-purple-200/20 blur-3xl -z-10 pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Project Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-indigo-100 shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-indigo-900 tracking-tight">
                AI Exam Diagnostics for School & Competitive Prep
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] font-display">
              Smarter Learning. <br className="hidden sm:block" />
              <span className="gradient-text-primary">Better Preparation.</span> Powered by AI.
            </h1>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
              Transform high-stress exam revision into <strong>15-minute 10-mark diagnostic sprints</strong>.
              Grounded in official CBSE, ICSE, Cambridge, and State Board runbooks with zero hallucinations,
              step-by-step mark distribution, and personalized evolutionary learning paths.
            </p>

            {/* Hero CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={() => openAuth('register')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-3 group cursor-pointer"
              >
                <span>Get Started / Sign Up</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => openAuth('login')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-base shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <span>Login to Workspace</span>
              </button>
            </div>

            {/* Key Platform Highlights */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
              <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 backdrop-blur-xs">
                <div className="text-xl sm:text-2xl font-black text-slate-900 font-display">10-Mark</div>
                <div className="text-[11px] font-semibold text-slate-500">Diagnostic Sprints</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 backdrop-blur-xs">
                <div className="text-xl sm:text-2xl font-black text-indigo-600 font-display">Step Marks</div>
                <div className="text-[11px] font-semibold text-slate-500">Multi-Step Rubrics</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 backdrop-blur-xs">
                <div className="text-xl sm:text-2xl font-black text-emerald-600 font-display">K-Graph</div>
                <div className="text-[11px] font-semibold text-slate-500">Adaptive Mastery</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 backdrop-blur-xs">
                <div className="text-xl sm:text-2xl font-black text-purple-600 font-display">8 Boards</div>
                <div className="text-[11px] font-semibold text-slate-500">Classes 5 to 12</div>
              </div>
            </div>
          </div>

          {/* Hero Visual Mockup Card */}
          <div className="mt-12 sm:mt-16 max-w-5xl mx-auto">
            <div className="relative rounded-3xl bg-slate-900 p-2 sm:p-4 shadow-2xl border border-slate-800 ring-1 ring-white/10 glow-indigo">
              {/* Window Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-[11px] text-slate-400">
                    acugrade.ai/diagnostic/cbse-class10-math/sprint-103
                  </span>
                </div>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded bg-indigo-900/50 text-indigo-300 font-semibold text-[10px] border border-indigo-700/50">
                  AI Evaluation Engine Active
                </span>
              </div>

              {/* Inside Body */}
              <div className="bg-slate-950 rounded-2xl p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 text-white text-left">
                {/* Left Column: Question & Steps */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                      CBSE Class 10 • Mathematics
                    </span>
                    <span className="text-xs text-amber-400 font-bold">10 Marks Multi-Step</span>
                  </div>

                  <div className="text-sm font-semibold text-slate-200">
                    Q3. A motorboat speed in still water is 18 km/h. It takes 1 hr more to travel 24 km upstream than downstream. Calculate the speed of the stream.
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 leading-relaxed">
                    <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                      Student Steps:
                    </div>
                    <div>1. Upstream speed = (18 - x), Downstream = (18 + x)</div>
                    <div>2. Time equation: 24/(18-x) - 24/(18+x) = 1</div>
                    <div>3. 24(2x) = 324 - x²  =&gt;  x² + 48x - 324 = 0</div>
                    <div>4. (x + 54)(x - 6) = 0  =&gt;  x = 6 km/h  (reject x = -54)</div>
                  </div>
                </div>

                {/* Right Column: Step Breakdown */}
                <div className="lg:col-span-5 bg-slate-900/80 rounded-2xl p-4 border border-indigo-500/30 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Step-by-Step Scoring
                    </span>
                    <span className="text-sm font-extrabold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                      10 / 10 Marks
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300 bg-slate-950/60 p-2 rounded-lg">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Variable formulation
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">+2.0</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300 bg-slate-950/60 p-2 rounded-lg">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Time equation setup
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">+3.0</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300 bg-slate-950/60 p-2 rounded-lg">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Quadratic formulation
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">+3.0</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300 bg-slate-950/60 p-2 rounded-lg">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Negative root constraint check
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">+2.0</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Mastery Impact:</span>
                    <span className="text-emerald-400 font-bold">+15 XP • Quadratic Concept Graph +12%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PROJECT INFORMATION (WHAT THE APPLICATION DOES)                        */}
      {/* ========================================================================= */}
      <section id="about-app" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
              <Layers className="w-3.5 h-3.5" />
              What AcuGrade AI Does
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              A Complete Diagnostic & Personalized Practice Platform
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              AcuGrade AI bridges the gap between studying chapters and mastering exam room execution through targeted
              micro-tests, conceptual gap classification, and evolutionary mastery maps.
            </p>
          </div>

          {/* 3 Core Architecture Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. Calibrated Diagnostic Sprints</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Rather than overwhelming children with exhaustive 3-hour practice tests, AcuGrade generates targeted
                10-mark sprints covering exact chapter concepts, formulas, and derivation steps in 15 minutes.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">2. Precision Board Blueprint Engine</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every question, marking rubric, and feedback point is grounded in verified curriculum runbooks (CBSE,
                ICSE, Cambridge, and NEET/IIT blueprints) to ensure syllabus fidelity and authentic step grading.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">3. Evolutionary Knowledge Graph</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Tracks topic mastery dynamically after every sprint. When a misconception is detected (e.g. sign flip or
                missed unit conversion), it unlocks targeted remediation video guides and adaptive mini-drills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. KEY FEATURES SECTION (CARDS WITH HOVER INTERACTIONS)                    */}
      {/* ========================================================================= */}
      <section id="features" className="py-20 mesh-gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Platform Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              Engineered for Students, Parents & Educators
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Every feature in AcuGrade AI is designed to make exam preparation clear, structured, and rewarding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: AI Exam Generation */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:shadow-md transition-all hover:border-indigo-200 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">AI Exam Generation</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Generate customized 10-mark diagnostic exams based on subject, board, class grade, and difficulty level
                (Easy, Medium, Hard, HOTS).
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                <span>10-Mark Diagnostic Arena</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 2: Smart Step Assessment */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:shadow-md transition-all hover:border-indigo-200 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-5 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Smart Step Assessment</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Evaluate student derivation steps, formulas, and calculations with structured partial mark breakdowns
                and pinpointed trap identification.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <span>Multi-Step Rubric Engine</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 3: Personalized Practice */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:shadow-md transition-all hover:border-indigo-200 group">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-5 group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Personalized Practice</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Adaptive learning paths dynamically suggest remediation mini-drills and official textbook references
                based on student weaknesses.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600">
                <span>Adaptive K-Graph Roadmaps</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 4: Progress Tracking */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:shadow-md transition-all hover:border-indigo-200 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-5 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Progress & Mastery Tracking</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Real-time evolutionary topic mastery heatmaps, average score metrics, and streak tracking to monitor
                continuous academic improvement.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                <span>Topic Mastery Heatmaps</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 5: Parent Dashboard & PINs */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:shadow-md transition-all hover:border-indigo-200 group">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-5 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Parent Dashboard & Child PINs</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Manage multiple children from a single parent account with individual 4-digit PIN security, daily quota
                controls, and detailed score logs.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600">
                <span>Multi-Child Family Co-Pilot</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 6: Gamification & FunZone */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:shadow-md transition-all hover:border-indigo-200 group">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 mb-5 group-hover:scale-105 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Gamification & Brain Breaks</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Earn XP, unlock achievement badges (Pioneer, Perfect 10, Speed Demon), climb the academic leaderboard,
                and enjoy FunZone brain breaks.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-pink-600">
                <span>XP, Badges & Arcade Games</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE LIVE DIAGNOSTIC DEMO                                       */}
      {/* ========================================================================= */}
      <section id="interactive-demo" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
              <Play className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
              Interactive Live Demo
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              See Multi-Step AI Step Assessment in Action
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Select a subject and student attempt to observe how AcuGrade AI scores intermediate steps and catches
              conceptual traps.
            </p>
          </div>

          {/* Subject Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <button
              onClick={() => {
                setSelectedSubjectKey('math');
                setSelectedResponseIdx(0);
                handleSimulateEvaluate();
              }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${selectedSubjectKey === 'math'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              📐 Class 10 Math (CBSE)
            </button>
            <button
              onClick={() => {
                setSelectedSubjectKey('physics');
                setSelectedResponseIdx(0);
                handleSimulateEvaluate();
              }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${selectedSubjectKey === 'physics'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              ⚡ Class 12 Physics (ISC)
            </button>
            <button
              onClick={() => {
                setSelectedSubjectKey('science');
                setSelectedResponseIdx(0);
                handleSimulateEvaluate();
              }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${selectedSubjectKey === 'science'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              🧬 Class 8 Science (ICSE)
            </button>
            <button
              onClick={() => {
                setSelectedSubjectKey('chemistry');
                setSelectedResponseIdx(0);
                handleSimulateEvaluate();
              }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${selectedSubjectKey === 'chemistry'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              🧪 Class 11 Chem (NEET/JEE)
            </button>
          </div>

          {/* Interactive Card */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                    {currentQ.grade} • {currentQ.subject}
                  </span>
                  <span className="text-xs font-medium text-slate-500">• {currentQ.chapter}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2">{currentQ.question}</h3>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-500 font-semibold">Sprint Marks:</span>
                <div className="text-lg font-black text-indigo-600 font-display">{currentQ.marks} Marks Max</div>
              </div>
            </div>

            {/* Content Body */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Student Attempt */}
              <div className="lg:col-span-6 space-y-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Student Attempt Scenario:
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentQ.responses.map((resp, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedResponseIdx(idx);
                        handleSimulateEvaluate();
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${selectedResponseIdx === idx
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <span>{resp.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${resp.tagColor}`}>
                        {resp.tag}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed min-h-[160px]">
                  {currentResp.studentWork}
                </div>
              </div>

              {/* Right: AI Assessment */}
              <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">AcuGrade Multi-Step Analysis</div>
                      <div className="text-[10px] text-slate-400">Grounded against board runbook</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Score:</span>
                    <span
                      className={`text-base font-black px-2.5 py-1 rounded-lg font-display ${currentResp.score >= 9
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                    >
                      {currentResp.score} / 10
                    </span>
                  </div>
                </div>

                {isEvaluating ? (
                  <div className="py-10 flex flex-col items-center justify-center gap-2 text-indigo-600">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-semibold text-slate-600">Analyzing logical steps & formulas...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Mark Breakdown by Step:
                      </span>
                      {currentResp.breakdown.map((b, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs border border-slate-100"
                        >
                          <span className="flex items-center gap-2 text-slate-700">
                            {b.pass ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            )}
                            <span>{b.step}</span>
                          </span>
                          <span className={`font-mono font-bold ${b.pass ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {b.marks}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-amber-700" />
                        Diagnostic Feedback:
                      </div>
                      <p className="text-[11px] text-amber-800">{currentResp.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. HOW IT WORKS                                                           */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 mesh-gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
              <Activity className="w-3.5 h-3.5" />
              Four Simple Steps
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              How AcuGrade AI Delivers Structured Improvement
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              From launching a sprint to pinpointing conceptual traps in under 15 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                01
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Select Subject & Board</h3>
              <p className="text-xs text-slate-600 leading-relaxed flex-1">
                Choose target board (CBSE, ICSE, Cambridge, State), class grade (5–12), subject, and chapter.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                🎯 8 Curricula Supported
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                02
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">10-Mark Diagnostic</h3>
              <p className="text-xs text-slate-600 leading-relaxed flex-1">
                Take a rapid 15-minute diagnostic exam designed against official board blueprints without fatigue.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                ⏱ ~15 Minutes Daily
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                03
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Smart Step Assessment</h3>
              <p className="text-xs text-slate-600 leading-relaxed flex-1">
                AI evaluates every formula, derivation step, and calculation against official rubrics with partial marks.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                ⚡ Instant Step Rubrics
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                04
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Adaptive Remediation</h3>
              <p className="text-xs text-slate-600 leading-relaxed flex-1">
                Unlock targeted mini-drills, earn XP, maintain daily streaks, and export printable teacher dossiers.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                🏆 Topic Mastery Roadmaps
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CURRICULUM & 8-BOARD MATRIX                                            */}
      {/* ========================================================================= */}
      <section id="curriculum" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              Supported Curricula
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              Aligned with Premier National & International Standards
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              From Class 5 foundations to Class 12 board finals and Olympiad/JEE benchmarks.
            </p>
          </div>

          {/* Matrix Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveBoardTab('cbse')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeBoardTab === 'cbse'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              CBSE & NCERT
            </button>
            <button
              onClick={() => setActiveBoardTab('icse')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeBoardTab === 'icse'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              ICSE & ISC Board
            </button>
            <button
              onClick={() => setActiveBoardTab('cambridge')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeBoardTab === 'cambridge'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              UK Cambridge (IGCSE / A-Level)
            </button>
            <button
              onClick={() => setActiveBoardTab('neet_iit')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeBoardTab === 'neet_iit'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              NEET & IIT JEE Foundation
            </button>
            <button
              onClick={() => setActiveBoardTab('state')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeBoardTab === 'state'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              State Secondary Boards
            </button>
          </div>

          {/* Matrix Content Box */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-8">
            {activeBoardTab === 'cbse' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Central Board of Secondary Education (CBSE)</h3>
                    <p className="text-xs text-slate-500">Classes 5 to 12 • Standardized NCERT Framework</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 w-fit">
                    Full Syllabus Indexed
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="font-bold text-sm text-indigo-900">Mathematics</div>
                    <div className="text-xs text-slate-500 mt-1">Algebra, Geometry, Trigonometry, Calculus</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="font-bold text-sm text-indigo-900">Science & Physics</div>
                    <div className="text-xs text-slate-500 mt-1">Optics, Mechanics, Electricity, Magnetism</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="font-bold text-sm text-indigo-900">Chemistry & Biology</div>
                    <div className="text-xs text-slate-500 mt-1">Chemical Reactions, Genetics, Cell Physiology</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="font-bold text-sm text-indigo-900">Social Science & English</div>
                    <div className="text-xs text-slate-500 mt-1">Case Studies, Reading Comprehension, Grammar</div>
                  </div>
                </div>
              </div>
            )}

            {activeBoardTab === 'icse' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">CISCE (ICSE Class 10 & ISC Class 12)</h3>
                    <p className="text-xs text-slate-500">Comprehensive syllabus with rigorous descriptive analysis</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 w-fit">
                    Standardized CISCE Rubrics
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="font-bold text-sm text-indigo-900">Commercial & Pure Math</div>
                    <div className="text-xs text-slate-500 mt-1">GST, Banking, Matrices, Coordinate Geometry</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="font-bold text-sm text-indigo-900">ICSE Physics & Chemistry</div>
                    <div className="text-xs text-slate-500 mt-1">Calorimetry, Radioactivity, Organic Chemistry</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="font-bold text-sm text-indigo-900">Biology & Environmental</div>
                    <div className="text-xs text-slate-500 mt-1">Circulatory System, Genetics, Endocrine Glands</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="font-bold text-sm text-indigo-900">English Literature & Lang</div>
                    <div className="text-xs text-slate-500 mt-1">Critical Prose Analysis, Formal Compositions</div>
                  </div>
                </div>
              </div>
            )}

            {activeBoardTab === 'cambridge' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Cambridge Assessment International (CIE)</h3>
                    <p className="text-xs text-slate-500">IGCSE, AS & A-Levels • Inquiry-based grading</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-800 w-fit">
                    Extended & Core Standards
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="font-bold text-sm text-indigo-900">IGCSE Mathematics 0580</div>
                    <div className="text-xs text-slate-500 mt-1">Vectors, Functions, Transformations, Probability</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="font-bold text-sm text-indigo-900">Cambridge Physics 0625</div>
                    <div className="text-xs text-slate-500 mt-1">Thermal Physics, Waves, Space Physics, Nuclear</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="font-bold text-sm text-indigo-900">Chemistry 0620</div>
                    <div className="text-xs text-slate-500 mt-1">Stoichiometry, Polymers, Energetics</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="font-bold text-sm text-indigo-900">AS & A-Level Pure Math</div>
                    <div className="text-xs text-slate-500 mt-1">Calculus (P1, P3), Mechanics (M1), Statistics</div>
                  </div>
                </div>
              </div>
            )}

            {activeBoardTab === 'neet_iit' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">NEET (NTA) & IIT JEE Main/Advanced</h3>
                    <p className="text-xs text-slate-500">High-Order Thinking (HOTS), Olympiad Drills & Speed Velocity</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 w-fit">
                    HOTS Archetypes
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="font-bold text-sm text-indigo-900">JEE Advanced Mathematics</div>
                    <div className="text-xs text-slate-500 mt-1">Conic Sections, Differential Equations, Vectors 3D</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="font-bold text-sm text-indigo-900">NEET / JEE Physics</div>
                    <div className="text-xs text-slate-500 mt-1">Rotational Dynamics, Electrostatics, Modern Physics</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="font-bold text-sm text-indigo-900">Physical & Organic Chem</div>
                    <div className="text-xs text-slate-500 mt-1">Thermodynamics, Reaction Mechanisms, Equilibrium</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="font-bold text-sm text-indigo-900">NEET Biology NTA Pattern</div>
                    <div className="text-xs text-slate-500 mt-1">Human Physiology, Genetics, Plant Reproduction</div>
                  </div>
                </div>
              </div>
            )}

            {activeBoardTab === 'state' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">State Secondary & Higher Secondary Boards</h3>
                    <p className="text-xs text-slate-500">Maharashtra SSC/HSC, Karnataka KSEEB, Tamil Nadu, UP Board</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 text-sky-800 w-fit">
                    Regional Blueprint Support
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="font-bold text-sm text-indigo-900">Maharashtra SSC Board</div>
                    <div className="text-xs text-slate-500 mt-1">Algebra, Geometry, Science 1 & 2</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="font-bold text-sm text-indigo-900">Karnataka KSEEB / PU</div>
                    <div className="text-xs text-slate-500 mt-1">Standardized PUC 1 & 2 Blueprint Drills</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="font-bold text-sm text-indigo-900">Tamil Nadu Samacheer</div>
                    <div className="text-xs text-slate-500 mt-1">Core Science & Mathematics Syllabi</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="font-bold text-sm text-indigo-900">UP Secondary Board</div>
                    <div className="text-xs text-slate-500 mt-1">Bilingual Question Archetypes</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FAQ ACCORDION                                                          */}
      {/* ========================================================================= */}
      <section className="py-20 mesh-gradient-bg border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
              <Lightbulb className="w-3.5 h-3.5" />
              Frequently Asked Questions
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              Everything You Need to Know
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Learn how AcuGrade AI supports students and parents with precision diagnostic practice.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:text-indigo-600 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-indigo-600' : ''
                        }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. FINAL CTA SECTION                                                      */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          <span className="px-3 py-1 rounded-full bg-slate-800 text-indigo-300 text-xs font-bold border border-slate-700">
            Start Practicing Today
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-display">
            Ready to Experience Precision AI Diagnostics?
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-medium">
            Join students and parents practicing daily 10-mark sprints. Take your first diagnostic exam in minutes.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openAuth('register')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 font-extrabold text-base shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>Get Started / Sign Up</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => openAuth('login')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-indigo-400" />
              <span>Login to Existing Account</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. FOOTER                                                                */}
      {/* ========================================================================= */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Col 1: Brand Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-lg font-extrabold text-white font-display">AcuGrade AI</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Precision diagnostic exam grading and adaptive learning platform powered by verified curriculum knowledge graphs.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-3 py-1.5 rounded-full w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Knowledge Graph: Operational v2.4</span>
              </div>
            </div>

            {/* Col 2: Supported Curricula */}
            <div className="space-y-2.5">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Curricula</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li>CBSE & NCERT (Class 5–12)</li>
                <li>ICSE & ISC CISCE</li>
                <li>UK Cambridge (IGCSE & A-Level)</li>
                <li>NEET & IIT JEE Foundation</li>
                <li>State Secondary Boards</li>
              </ul>
            </div>

            {/* Col 3: Core Features */}
            <div className="space-y-2.5">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Platform</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li>10-Mark Diagnostic Arena</li>
                <li>Adaptive K-Graph Roadmaps</li>
                <li>Smart Step Assessment</li>
                <li>Gamification & FunZone</li>
                <li>Parent-Teacher Dossiers</li>
              </ul>
            </div>

            {/* Col 4: Quick Auth */}
            <div className="space-y-2.5">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Navigation</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li>
                  <button onClick={() => openAuth('login')} className="hover:text-white cursor-pointer">
                    Login
                  </button>
                </li>
                <li>
                  <button onClick={() => openAuth('register')} className="hover:text-white cursor-pointer">
                    Sign Up / Get Started
                  </button>
                </li>
                <li>
                  <a href="#about-app" className="hover:text-white">
                    About Platform
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white">
                    Features
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>© {new Date().getFullYear()} AcuGrade AI Technologies Inc. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-400 cursor-pointer">Academic Honor Code</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

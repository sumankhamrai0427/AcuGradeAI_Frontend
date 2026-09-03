import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Play,
  Brain,
  Target,
  Trophy,
  Users,
  BookOpen,
  BarChart3,
  MessageSquare,
  Gamepad2,
  Flame,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Lightbulb,
  Lock,
  Zap,
  TrendingUp,
} from 'lucide-react';
import ApiServices from '../services/ApiServices';

interface LandingPageProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onQuickDemo?: (role?: 'admin' | 'parent') => void;
}

type Role = 'student' | 'teacher' | 'parent';

const demoQuestions = {
  math: {
    subject: 'Mathematics',
    grade: 'Class 10 CBSE',
    chapter: 'Quadratic Equations',
    marks: 10,
    question:
      'A motorboat travels 24 km upstream and downstream. The upstream trip takes 1 hour more. Find the speed of the stream.',
    responses: [
      {
        label: 'Strong Attempt',
        tag: '10/10',
        score: 10,
        studentWork:
          'Let speed of stream = x km/h.\nUpstream = 18 − x, Downstream = 18 + x.\n24/(18 − x) − 24/(18 + x) = 1\nx² + 48x − 324 = 0\nx = 6 km/h.',
        feedback:
          'Excellent step-by-step reasoning. The equation, algebra and final constraint are correct.',
        breakdown: [
          ['Define variables', '2/2', true],
          ['Set up time equation', '3/3', true],
          ['Form quadratic', '3/3', true],
          ['Validate the answer', '2/2', true],
        ],
      },
      {
        label: 'Needs Help',
        tag: '7/10',
        score: 7,
        studentWork:
          'Let speed of stream = x km/h.\nUpstream = 18 − x, Downstream = 18 + x.\n24/(18 − x) − 24/(18 + x) = 1\nx² + 48x + 324 = 0\nGot negative roots.',
        feedback:
          'A sign error appeared while moving a term across the equation. The next learning step focuses on transposition.',
        breakdown: [
          ['Define variables', '2/2', true],
          ['Set up time equation', '3/3', true],
          ['Form quadratic', '1/3', false],
          ['Validate the answer', '1/2', false],
        ],
      },
    ],
  },
  science: {
    subject: 'Science',
    grade: 'Class 8',
    chapter: 'Cell Structure & Functions',
    marks: 10,
    question:
      'Give three differences between plant and animal cells and explain why plant cells need a cell wall.',
    responses: [
      {
        label: 'Model Answer',
        tag: '10/10',
        score: 10,
        studentWork:
          'Plant cells have a cell wall, plastids and a large central vacuole.\nAnimal cells do not have a cell wall or plastids and usually have smaller vacuoles.\nThe cell wall gives plant cells support and protection.',
        feedback:
          'Clear comparison with accurate reasoning and good use of scientific terms.',
        breakdown: [
          ['Cell wall difference', '2/2', true],
          ['Plastid difference', '2/2', true],
          ['Vacuole difference', '2/2', true],
          ['Explain the reason', '4/4', true],
        ],
      },
    ],
  },
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onQuickDemo,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] =
    useState<keyof typeof demoQuestions>('math');
  const [selectedAttempt, setSelectedAttempt] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeRole, setActiveRole] = useState<Role>('student');
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  // Scroll Reveal Animation Logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);



  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setMobileMenuOpen(false);
    onOpenAuth(mode);
  };

  const runDemo = (subject: keyof typeof demoQuestions) => {
    setSelectedSubject(subject);
    setSelectedAttempt(0);
    setIsEvaluating(true);
    window.setTimeout(() => setIsEvaluating(false), 450);
  };

  const currentQuestion = demoQuestions[selectedSubject];
  const currentAttempt =
    currentQuestion.responses[selectedAttempt] ||
    currentQuestion.responses[0];

  const faqs = [
    {
      q: 'How does the personalized learning path work?',
      a: 'The platform studies assessment performance, finds strong and weak topics, and recommends the next lesson, practice set or challenge. The path changes as the student improves.',
    },
    {
      q: 'What happens after a student makes mistakes?',
      a: 'The system identifies the topic or mistake pattern and recommends focused learning resources, practice questions and, when appropriate, another mini-test.',
    },
    {
      q: 'What do advanced students receive?',
      a: 'Students who consistently perform well can move to harder questions, HOTS (Higher Order Thinking Skills) practice, challenge quizzes and advanced mock exams instead of repeating basic content.',
    },
    {
      q: 'Can parents and teachers see progress?',
      a: 'Yes. Authorized parents and teachers can view relevant progress, reports, strengths and improvement areas, and communicate securely about the learning journey.',
    },
    {
      q: 'Is learning only about tests?',
      a: 'No. The platform combines assessment, personalized learning, practice, rewards, simple educational games and short fun moments to keep children engaged.',
    },
  ];

  const roleContent = {
    student: {
      title: 'For Students',
      subtitle: 'Learn at your own pace.',
      icon: GraduationCap,
      bullets: [
        'Personalized learning path',
        'Practice and mock tests',
        'Points, badges and streaks',
        'Fun games and brain breaks',
      ],
    },
    teacher: {
      title: 'Your Study Buddy',
      subtitle: 'The smartest virtual teacher around.',
      icon: BookOpen,
      bullets: [
        'Instant step-by-step guidance',
        'Finds weak spots in seconds',
        'Recommends the best next lesson',
        'Available 24/7 for support',
      ],
    },
    parent: {
      title: 'For Parents',
      subtitle: "Stay connected with your child's progress.",
      icon: Users,
      bullets: [
        'Progress and performance reports',
        'Strength and weakness insights',
        'Secure teacher communication',
        'Support learning at home',
      ],
    },
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 overflow-x-hidden">
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 min-h-[72px] flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-stone-900 flex items-center justify-center shadow-lg shadow-yellow-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-lg tracking-tight">SahajPath</div>
              <div className="text-[10px] text-stone-500 font-semibold">
                Smarter Learning Platform
              </div>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-stone-600">
            <a href="#hero" className="hover:text-yellow-600">Home</a>
            <a href="#features" className="hover:text-yellow-600">Features</a>
            <a href="#how-it-works" className="hover:text-yellow-600">How It Works</a>
            <a href="#roles" className="hover:text-yellow-600">For Everyone</a>
            <a href="#demo" className="hover:text-yellow-600 flex items-center gap-1.5">
              Demo <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">LIVE</span>
            </a>
          </nav>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => openAuth('login')}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-stone-700 hover:bg-stone-100"
            >
              Login
            </button>
            <button
              onClick={() => openAuth('register')}
              className="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-white text-sm font-extrabold shadow-lg shadow-yellow-200 flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="lg:hidden p-2 rounded-xl hover:bg-stone-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-stone-100 px-4 py-4 space-y-2">
            {[
              ['#hero', 'Home'],
              ['#features', 'Features'],
              ['#how-it-works', 'How It Works'],
              ['#roles', 'For Everyone'],
              ['#demo', 'Demo'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 text-sm font-semibold text-stone-700"
              >
                {label}
              </a>
            ))}
            <div className="pt-3 border-t border-stone-100 flex gap-2">
              <button
                onClick={() => openAuth('login')}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 font-bold"
              >
                Login
              </button>
              <button
                onClick={() => openAuth('register')}
                className="flex-1 py-2.5 rounded-xl bg-yellow-400 text-stone-900 font-bold"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section
        id="hero"
        className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-white to-stone-50"
      >
        <div className="absolute -top-28 -right-28 w-80 h-80 rounded-full bg-yellow-200/40 blur-3xl" />
        <div className="absolute top-40 -left-32 w-80 h-80 rounded-full bg-amber-200/30 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="reveal-on-scroll">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-yellow-200 text-yellow-700 text-xs font-bold shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Study Buddy-powered learning for students, teachers & parents
                <span className={`w-1.5 h-1.5 rounded-full ${isBackendOnline === false ? 'bg-rose-500' : 'bg-yellow-500'
                  }`} />
              </div>

              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight capitalize">
                Learn Smarter.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-500">
                  Grow Better.
                </span>
              </h1>

              <p className="mt-5 text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
                Take an assessment, understand where you need help, and get a
                learning path made for you. Learn, practice, play and improve
                with your Study Buddy.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => openAuth('register')}
                  className="px-7 py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-white font-extrabold shadow-xl shadow-yellow-200 flex items-center justify-center gap-2"
                >
                  Get Started <ArrowRight className="w-5 h-5" />
                </button>
                <a
                  href="#how-it-works"
                  className="px-7 py-3.5 rounded-2xl bg-white border border-stone-200 hover:border-yellow-300 text-stone-800 font-bold flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  See How It Works
                </a>
              </div>

              <div className="mt-7 flex flex-wrap gap-3 text-xs font-bold text-stone-600">
                {['Assess', 'Analyze', 'Learn', 'Improve'].map((item, i) => (
                  <React.Fragment key={item}>
                    <span className="px-3 py-1.5 rounded-full bg-yellow-50 border border-yellow-300 text-yellow-800 shadow-sm shadow-yellow-100/50">
                      {i + 1}. {item}
                    </span>
                    {i < 3 && <ArrowRight className="w-3.5 self-center text-yellow-400" />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* HERO RIGHT IMAGE */}
            <div className="relative flex justify-center lg:justify-end reveal-on-scroll">
              <style>{`
                @keyframes float-animation {
                  0% { transform: translateY(0px); }
                  50% { transform: translateY(-20px); }
                  100% { transform: translateY(0px); }
                }
                @keyframes float-delayed {
                  0% { transform: translateY(0px); }
                  50% { transform: translateY(-15px); }
                  100% { transform: translateY(0px); }
                }
                .animate-float-hero {
                  animation: float-animation 6s ease-in-out infinite;
                }
                .animate-float-delayed {
                  animation: float-delayed 7s ease-in-out infinite 1s;
                }
                .animate-float-slow {
                  animation: float-animation 8s ease-in-out infinite 2s;
                }
              `}</style>

              <div className="absolute top-10 -left-10 text-4xl opacity-50 animate-float-delayed select-none pointer-events-none">✨</div>
              <div className="absolute bottom-20 -left-5 text-3xl opacity-50 animate-float-slow select-none pointer-events-none">🌟</div>
              <div className="absolute top-20 right-0 text-3xl opacity-40 animate-float-delayed select-none pointer-events-none">💡</div>
              <div className="absolute bottom-10 right-10 text-4xl opacity-50 animate-float-slow select-none pointer-events-none">🎨</div>
              <img
                src="/hero-illustration.jpg"
                alt="Animated Hero Illustration"
                className="w-full max-w-[550px] object-contain mix-blend-multiply animate-float-hero rounded-3xl"
              />
            </div>
          </div>
        </div>

        {/* WAVY DIVIDER at bottom of Hero */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10 translate-y-[99%]">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 sm:h-20 fill-yellow-50/50">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C101.33,26.6,204.66,66.19,321.39,56.44Z"></path>
          </svg>
        </div>
      </section>

      {/* QUICK VALUE */}
      <section className="bg-yellow-50/50 relative pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              ['📝', 'Assess', 'Find what you know'],
              ['🤖', 'Study Buddy Insights', 'Find where you need help'],
              ['🎯', 'Personal Path', 'Get the right next step'],
              ['🏆', 'Rewards', 'Stay motivated'],
            ].map(([icon, title, text], idx) => (
              <div key={title} className="flex items-center gap-4 reveal-on-scroll" style={{ animationDelay: `${idx * 150}ms` }}>
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm shadow-yellow-100 border border-yellow-200 flex items-center justify-center text-2xl shrink-0">{icon}</div>
                <div>
                  <div className="font-extrabold text-sm text-stone-900">{title}</div>
                  <div className="text-xs font-medium text-stone-600 mt-0.5">{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              What You Can Do
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight capitalize">
              Everything you need to learn better
            </h2>
            <p className="mt-3 text-stone-600">
              Simple tools for learning, practice, motivation and communication.
            </p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Target,
                title: 'Smart Assessment',
                text: 'Take short assessments that show exactly which topics need attention.',
                bg: 'bg-yellow-50',
                fg: 'text-yellow-600',
              },
              {
                icon: Brain,
                title: 'Study Buddy Insights',
                text: 'Study Buddy finds strengths, weak areas and common mistake patterns.',
                bg: 'bg-yellow-50',
                fg: 'text-yellow-600',
              },
              {
                icon: TrendingUp,
                title: 'Personalized Learning',
                text: 'Get lessons, resources and practice based on your current level.',
                bg: 'bg-yellow-50',
                fg: 'text-yellow-600',
              },
              {
                icon: Trophy,
                title: 'Points & Badges',
                text: 'Earn points for correct answers and badges for milestones.',
                bg: 'bg-yellow-50',
                fg: 'text-yellow-600',
              },
              {
                icon: BarChart3,
                title: 'Progress Tracking',
                text: 'See scores, topic mastery, streaks and improvement over time.',
                bg: 'bg-sky-50',
                fg: 'text-sky-600',
              },
              {
                icon: MessageSquare,
                title: 'Parent-Teacher Connect',
                text: 'Share progress and communicate securely about the student.',
                bg: 'bg-pink-50',
                fg: 'text-pink-600',
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group bg-white rounded-3xl border border-stone-200 p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-200/60 transition-all reveal-on-scroll"
                >
                  <div className={`w-12 h-12 rounded-2xl ${feature.bg} ${feature.fg} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="mt-5 font-black text-lg">{feature.title}</h3>
                  <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                    {feature.text}
                  </p>
                  <div className="mt-5 flex items-center gap-1 text-xs font-bold text-yellow-600">
                    Learn more <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* KNOW THE TIME */}
      <section className="py-8 bg-gradient-to-br from-yellow-50 via-amber-50/50 to-white border-y border-yellow-200 overflow-hidden relative">
        <style>{`
          @keyframes float-gentle {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-14px); }
          }
          @keyframes tick-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes wiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(3deg); }
            75% { transform: rotate(-3deg); }
          }
          @keyframes fade-slide-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-float-gentle { animation: float-gentle 4s ease-in-out infinite; }
          .animate-tick-pulse { animation: tick-pulse 2s ease-in-out infinite; }
          .animate-wiggle { animation: wiggle 3s ease-in-out infinite; }
          .animate-fade-slide { animation: fade-slide-up 0.8s ease-out forwards; }
        `}</style>

        {/* Floating decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <span className="absolute top-8 left-[5%] text-5xl opacity-15 animate-wiggle">⏰</span>
          <span className="absolute top-16 right-[8%] text-4xl opacity-15 animate-bounce" style={{ animationDuration: '3s' }}>🕐</span>
          <span className="absolute bottom-12 left-[15%] text-4xl opacity-15 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>📐</span>
          <span className="absolute bottom-8 right-[10%] text-5xl opacity-15 animate-wiggle" style={{ animationDelay: '1.5s' }}>🌟</span>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            {/* Image - animated floating */}
            <div className="flex-1 flex justify-center animate-float-gentle">
              <div className="relative">
                <div className="absolute -inset-4 bg-yellow-200/30 rounded-[2rem] blur-2xl"></div>
                <img
                  src="/child-learning-clock.jpg"
                  alt="Child learning to tell time with a clock"
                  className="relative w-full max-w-md rounded-3xl border-2 border-yellow-300 shadow-2xl shadow-yellow-200/40"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center lg:text-left reveal-on-scroll">

              <h2 className="text-4xl sm:text-5xl font-black text-stone-900 leading-tight">
                Short on <span className="text-yellow-500">Time?</span> ⏳
              </h2>

              <p className="mt-4 text-stone-600 text-lg max-w-md">
                Exams approaching fast? Study Buddy quickly finds your weak spots so you can focus on what really matters and learn faster.
              </p>


            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold">
              <Lightbulb className="w-3.5 h-3.5" />
              How It Works
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black capitalize">
              Four simple steps
            </h2>
            <p className="mt-3 text-stone-600">
              The platform keeps learning simple: assess, understand, learn and improve.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-4 gap-5">
            {[
              ['01', 'Assess', 'Take a quiz or diagnostic test.', '📝'],
              ['02', 'Analyze', 'Study Buddy identifies strong and weak topics.', '🤖'],
              ['03', 'Learn', 'Follow lessons, resources and practice.', '📚'],
              ['04', 'Improve', 'Retest, earn rewards and move up.', '🚀'],
            ].map(([number, title, text, emoji], i) => (
              <div key={number} className="relative p-6 rounded-3xl bg-stone-50 border border-stone-200 reveal-on-scroll" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-yellow-400 text-stone-900 flex items-center justify-center text-xs font-black">
                    {number}
                  </span>
                  <span className="text-2xl">{emoji}</span>
                </div>
                <h3 className="mt-5 font-black text-lg">{title}</h3>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 p-5 rounded-3xl bg-gradient-to-r from-yellow-500 to-amber-500 text-white flex flex-col md:flex-row items-center justify-between gap-5 reveal-on-scroll">
            <div>
              <div className="text-sm font-bold text-yellow-100">The learning loop</div>
              <div className="mt-1 text-xl font-black">
                Assess → Analyze → Learn → Practice → Retest → Improve
              </div>
            </div>
            <button
              onClick={() => openAuth('register')}
              className="px-5 py-3 rounded-xl bg-white text-yellow-700 font-extrabold text-sm"
            >
              Start Learning
            </button>
          </div>
        </div>
      </section>

      {/* PERSONAS */}
      <section id="roles" className="py-20 bg-stone-50 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-stone-200 text-stone-700 text-xs font-bold">
              <Users className="w-3.5 h-3.5" />
              One Platform, Three Perspectives
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black capitalize">
              Built for everyone around the learner
            </h2>
            <p className="mt-3 text-stone-600">
              Students learn, teachers guide, and parents stay connected.
            </p>
          </div>

          <div className="mt-12 grid lg:grid-cols-3 gap-5">
            {(Object.keys(roleContent) as Role[]).map((role, i) => {
              const content = roleContent[role];
              const Icon = content.icon;
              const active = activeRole === role;

              return (
                <div
                  key={role}
                  className="text-left rounded-3xl p-6 border-2 border-yellow-300 bg-white shadow-xl shadow-yellow-100/60 transition-all reveal-on-scroll"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${role === 'student'
                      ? 'bg-yellow-50 text-yellow-600'
                      : role === 'teacher'
                        ? 'bg-yellow-50 text-yellow-600'
                        : 'bg-sky-50 text-sky-600'
                      } flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="mt-5 text-xl font-black">{content.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-stone-500">{content.subtitle}</p>

                  <ul className="mt-5 space-y-3">
                    {content.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2.5 text-sm text-stone-700">
                        <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 text-sm font-extrabold text-yellow-500 flex items-center gap-1">
                    {role === 'student'
                      ? 'Start Learning'
                      : role === 'teacher'
                        ? 'See How It Works'
                        : 'Parent Login'}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PERSONALIZATION EXAMPLE */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold">
              <Brain className="w-3.5 h-3.5" />
              Study Buddy Personalization
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black capitalize">
              Not the same lesson for everyone
            </h2>
            <p className="mt-3 text-stone-600">
              Example: Rahul struggles with Geometry, so the platform changes his next steps.
            </p>
          </div>

          <div className="mt-16 relative">
            <style>{`
              @keyframes float-card {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
              }
              .animate-float-card {
                animation: float-card 4s ease-in-out infinite;
              }
            `}</style>

            <div className="hidden lg:block absolute top-1/2 left-[5%] right-[5%] h-1.5 bg-gradient-to-r from-blue-200 via-purple-300 to-green-300 -translate-y-1/2 rounded-full opacity-60"></div>

            <div className="grid lg:grid-cols-5 gap-6 lg:gap-4 relative z-10">
              {[
                ['📝', 'Assessment', 'Rahul scores 60%', 'bg-blue-100 border-blue-200', 'text-blue-700', 'lg:-translate-y-4'],
                ['🔍', 'Study Buddy Finds', 'Geometry is weak', 'bg-red-100 border-red-200', 'text-red-700', 'lg:translate-y-4'],
                ['📚', 'Recommends', 'Lesson + practice', 'bg-purple-100 border-purple-200', 'text-purple-700', 'lg:-translate-y-4'],
                ['🎯', 'Retest', 'Mini mock exam', 'bg-orange-100 border-orange-200', 'text-orange-700', 'lg:translate-y-4'],
                ['🎉', 'Improves', '60% → 82%', 'bg-green-100 border-green-200', 'text-green-700', 'lg:-translate-y-4'],
              ].map(([icon, title, text, colorClass, textClass, offsetClass], i) => (
                <div key={title} className={`relative flex flex-col items-center group ${offsetClass} reveal-on-scroll`} style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="animate-float-card w-full">
                    <div className="transition-transform hover:-translate-y-3 duration-300 relative">
                      <div className="absolute inset-0 bg-white/40 blur-xl rounded-full group-hover:bg-yellow-400/20 transition-colors"></div>

                      <div className={`relative w-full p-6 sm:p-8 lg:p-6 rounded-[2rem] bg-white/90 backdrop-blur-xl border border-white shadow-xl shadow-stone-200/50 flex flex-col items-center text-center z-10 overflow-hidden`}>
                        <div className={`absolute top-0 right-0 w-24 h-24 ${colorClass} blur-3xl opacity-50 rounded-full -mr-10 -mt-10`}></div>

                        <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-3xl ${colorClass} shadow-sm border border-white/50 mb-4 relative z-10`}>
                          {icon}
                        </div>
                        <h3 className={`font-black text-lg ${textClass} mb-1.5 relative z-10`}>{title}</h3>
                        <p className="text-sm font-semibold text-stone-500 relative z-10">{text}</p>
                      </div>
                    </div>
                  </div>

                  {i < 4 && <div className="lg:hidden w-1 h-8 bg-gradient-to-b from-stone-200 to-stone-300 rounded-full my-2"></div>}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 relative overflow-hidden rounded-[2.5rem] border border-yellow-200 bg-gradient-to-br from-yellow-50 via-white to-amber-50 p-8 sm:p-10 shadow-2xl shadow-yellow-500/10 reveal-on-scroll">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-yellow-300 rounded-full blur-[80px] opacity-40"></div>
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-amber-400 rounded-full blur-[80px] opacity-20"></div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
              <div className="w-16 h-16 shrink-0 rounded-[1.5rem] bg-gradient-to-br from-yellow-400 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-stone-900">Advanced students get harder content.</h3>
                <p className="mt-3 text-stone-600 font-medium text-lg leading-relaxed max-w-3xl">
                  If a student consistently performs strongly, the platform dynamically adapts, moving them to <span className="font-bold text-amber-700 bg-amber-100/50 px-2 rounded-md">HOTS (Higher Order Thinking Skills)</span> questions, challenge quizzes, and advanced mock exams.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GAMIFICATION */}
      <section className="py-20 bg-gradient-to-br from-amber-50 via-white to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="reveal-on-scroll">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-amber-200 text-amber-700 text-xs font-bold">
                <Trophy className="w-3.5 h-3.5" />
                Learning, but make it fun
              </div>
              <h2 className="mt-4 text-3xl sm:text-4xl font-black capitalize">
                Rewards that make children want to keep going
              </h2>
              <p className="mt-4 text-stone-600 leading-relaxed">
                Correct answers earn points. Milestones unlock badges. Daily activity builds streaks. Students can see a friendly leaderboard and take short educational brain breaks.
              </p>

              <div className="mt-7 grid sm:grid-cols-2 gap-4">
                {[
                  ['⭐', 'Points', 'Earn for correct answers', 'bg-yellow-100 text-yellow-700'],
                  ['🏆', 'Badges', 'Unlock subject milestones', 'bg-orange-100 text-orange-700'],
                  ['🔥', 'Streaks', 'Keep learning every day', 'bg-red-100 text-red-700'],
                  ['🥇', 'Leaderboard', 'See friendly rankings', 'bg-blue-100 text-blue-700'],
                ].map(([icon, title, text, colorClass]) => (
                  <div key={title} className="bg-white/80 backdrop-blur-sm rounded-[1.5rem] border border-white p-5 shadow-lg shadow-amber-900/5 group hover:-translate-y-1 transition-transform">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${colorClass} shadow-inner mb-3`}>{icon}</div>
                    <div className="font-black text-stone-800">{title}</div>
                    <div className="text-xs font-semibold text-stone-500 mt-1">{text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative rounded-[2rem] border border-amber-200 shadow-2xl p-6 sm:p-8 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden reveal-on-scroll">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="text-xs text-amber-700 font-bold uppercase tracking-wider">This Week</div>
                  <div className="text-2xl font-black text-stone-900 mt-1">Rahul's Rewards</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="mt-6 space-y-3 relative z-10">
                {[
                  ['Correct answers', '+120 XP', 'text-amber-600', 'bg-white'],
                  ['7-day streak', '+70 XP', 'text-amber-600', 'bg-white'],
                  ['Geometry badge', 'Unlocked!', 'text-amber-600', 'bg-amber-100/50'],
                  ['Leaderboard', '#3', 'text-amber-600', 'bg-white'],
                ].map(([label, value, color, bg]) => (
                  <div key={label} className={`flex items-center justify-between p-4 rounded-2xl ${bg} border border-white shadow-sm`}>
                    <span className="text-sm font-bold text-stone-700">{label}</span>
                    <span className={`text-sm font-black ${color}`}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 p-5 rounded-2xl bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-200/50 relative z-10">
                <div className="flex items-center gap-2 font-black text-sm text-stone-900">
                  <Gamepad2 className="w-4 h-4 text-amber-600" />
                  Brain Break
                </div>
                <p className="text-xs font-semibold text-stone-600 mt-1.5 leading-relaxed">
                  Solve 3 quick puzzles and unlock a fun fact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE DEMO */}
      <section id="demo" className="py-20 bg-white border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold">
              <Play className="w-3.5 h-3.5 fill-current" />
              Interactive Demo
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black capitalize">
              Unbox The Future Of Grading
            </h2>
            <p className="mt-3 text-stone-600">
              Try a sample student attempt and see how the platform gives useful feedback.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2 reveal-on-scroll">
            {(['math', 'science'] as const).map((subject) => (
              <button
                key={subject}
                onClick={() => runDemo(subject)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold ${selectedSubject === subject
                  ? 'bg-yellow-400 text-stone-900'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
              >
                {subject === 'math' ? '📐 Class 10 Math' : '🧬 Class 8 Science'}
              </button>
            ))}
          </div>

          <div className="mt-7 grid lg:grid-cols-2 gap-5 reveal-on-scroll">
            <div className="rounded-3xl bg-stone-50 border border-stone-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-stone-500">{currentQuestion.grade}</div>
                  <h3 className="font-black text-lg">{currentQuestion.subject}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
                  {currentQuestion.marks} marks
                </span>
              </div>

              <p className="mt-5 text-sm font-semibold leading-relaxed">
                {currentQuestion.question}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {currentQuestion.responses.map((response, index) => (
                  <button
                    key={response.label}
                    onClick={() => {
                      setSelectedAttempt(index);
                      setIsEvaluating(true);
                      window.setTimeout(() => setIsEvaluating(false), 350);
                    }}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold ${selectedAttempt === index
                      ? 'bg-white border-yellow-400 text-yellow-700'
                      : 'bg-white border-stone-200 text-stone-600'
                      }`}
                  >
                    {response.label} · {response.tag}
                  </button>
                ))}
              </div>

              <div className="mt-4 bg-white rounded-2xl border border-stone-200 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                {currentAttempt.studentWork}
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-stone-200 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-sm">Study Buddy Analysis</div>
                    <div className="text-[10px] text-stone-400">Step-by-step feedback</div>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-sm font-black ${currentAttempt.score >= 9
                  ? 'bg-yellow-50 text-yellow-700'
                  : 'bg-yellow-50 text-amber-700'
                  }`}>
                  {currentAttempt.score}/10
                </div>
              </div>

              {isEvaluating ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                  <div className="w-7 h-7 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
                  <div className="text-xs font-semibold text-stone-500">
                    Study Buddy is checking the answer...
                  </div>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {currentAttempt.breakdown.map(([step, marks, pass]) => (
                    <div
                      key={step}
                      className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100"
                    >
                      <span className="flex items-center gap-2 text-xs font-semibold">
                        {pass ? (
                          <CheckCircle2 className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <X className="w-4 h-4 text-rose-500" />
                        )}
                        {step}
                      </span>
                      <span className={`text-xs font-black ${pass ? 'text-yellow-600' : 'text-rose-600'}`}>
                        {marks}
                      </span>
                    </div>
                  ))}

                  <div className="mt-4 p-4 rounded-2xl bg-yellow-50 border border-yellow-200">
                    <div className="text-xs font-black text-yellow-700">What should the student do next?</div>
                    <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                      {currentAttempt.feedback}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PARENT TEACHER CONNECTION */}
      <section className="relative py-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-200/40 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-200/40 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-800 text-xs font-bold shadow-sm">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              Connected Learning
            </div>
            <h2 className="mt-6 text-4xl sm:text-5xl font-black tracking-tight text-stone-900 leading-tight capitalize">
              Parents & <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-500">SahajPath</span>: Guiding Your Child Together
            </h2>
            <p className="mt-4 text-lg text-stone-600 font-medium">
              The Study Buddy handles the teaching, while the parent stays fully informed.
            </p>
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-6 items-stretch max-w-5xl mx-auto">
            <div className="relative bg-gradient-to-br from-white to-blue-50/50 rounded-[2rem] border-2 border-blue-300 p-8 shadow-xl shadow-blue-200/50 overflow-hidden group hover:-translate-y-1 hover:border-blue-400 transition-all reveal-on-scroll">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-40 -mr-10 -mt-10 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative z-10 w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-inner border border-blue-200 mb-6">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="font-black text-xl text-stone-900 relative z-10">Student</h3>
              <p className="mt-2 text-sm font-semibold text-stone-600 leading-relaxed relative z-10">
                Takes tests, follows the learning path, practices and earns rewards while the Study Buddy adapts the lessons.
              </p>
            </div>

            <div className="relative bg-gradient-to-br from-white to-purple-50/50 rounded-[2rem] border-2 border-purple-300 p-8 shadow-xl shadow-purple-200/50 overflow-hidden group hover:-translate-y-1 hover:border-purple-400 transition-all reveal-on-scroll">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-40 -mr-10 -mt-10 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative z-10 w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-inner border border-purple-200 mb-6">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="font-black text-xl text-stone-900 relative z-10">Parent</h3>
              <p className="mt-2 text-sm font-semibold text-stone-600 leading-relaxed relative z-10">
                Views reports, understands improvement areas, and tracks their child's progress without having to teach.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-center reveal-on-scroll">
            <div className="px-5 py-3 rounded-2xl bg-white border border-stone-200 text-xs font-bold text-stone-600 flex items-center gap-2">
              <Lock className="w-4 h-4 text-yellow-600" />
              Authorized access and secure communication
            </div>
          </div>
        </div>
      </section>

      {/* CURRICULUM */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 reveal-on-scroll">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold">
                <BookOpen className="w-3.5 h-3.5" />
                Curriculum
              </div>
              <h2 className="mt-4 text-3xl sm:text-4xl font-black capitalize">
                Choose the learning track that fits
              </h2>
              <p className="mt-3 text-stone-600 max-w-2xl">
                Support for school learning and higher-level preparation across the platform.
              </p>
            </div>
            <button
              onClick={() => openAuth('register')}
              className="px-5 py-3 rounded-xl bg-stone-900 text-white font-bold text-sm"
            >
              Explore After Sign Up
            </button>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ['CBSE & NCERT', 'Class 5–12', 'School learning and board preparation'],
              ['ICSE & ISC', 'Class 5–12', 'Structured subject practice'],
              ['Cambridge', 'IGCSE & A-Level', 'International curriculum support'],
              ['Competitive Prep', 'HOTS (Higher Order Thinking Skills) / Foundation', 'More challenging practice'],
            ].map(([title, level, text], i) => (
              <div key={title} className="rounded-3xl border border-stone-200 p-5 bg-stone-50 reveal-on-scroll" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-yellow-600">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="mt-4 font-black">{title}</h3>
                <div className="mt-1 text-xs font-bold text-yellow-600">{level}</div>
                <p className="mt-3 text-xs text-stone-500 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-24 bg-gradient-to-b from-white to-amber-50/50 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-200/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-100/80 border border-yellow-200 text-yellow-800 text-xs font-bold shadow-sm">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
              FAQ
            </div>
            <h2 className="mt-6 text-4xl sm:text-5xl font-black tracking-tight text-stone-900 capitalize">
              Your Questions, Our Answers
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, index) => {
              const open = openFaq === index;
              return (
                <div key={faq.q} className={`bg-white/80 backdrop-blur-md rounded-2xl border transition-all duration-300 overflow-hidden ${open ? 'border-yellow-300 shadow-xl shadow-yellow-500/10' : 'border-stone-200 hover:border-yellow-200 hover:shadow-md'}`}>
                  <button
                    onClick={() => setOpenFaq(open ? null : index)}
                    className="w-full p-6 flex items-center justify-between gap-4 text-left font-bold text-stone-800"
                  >
                    <span className="text-lg">{faq.q}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${open ? 'bg-yellow-100 text-yellow-700' : 'bg-stone-100 text-stone-400'}`}>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  {open && (
                    <div className="px-6 pb-6 text-stone-600 leading-relaxed pt-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-24 overflow-hidden bg-stone-950 text-white">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-yellow-600/20 to-amber-900/40 blur-[100px] rounded-full"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="mx-auto w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-2xl shadow-yellow-500/20 border border-white/10">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="mt-8 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight capitalize">
            Ready to make<br />learning smarter?
          </h2>
          <p className="mt-6 text-stone-300 max-w-xl mx-auto text-lg font-medium">
            Start with an assessment and let SahajPath guide the next step.
          </p>
          <button
            onClick={() => openAuth('register')}
            className="mt-10 px-8 py-4 rounded-[1.25rem] bg-white text-stone-900 font-black inline-flex items-center gap-2 hover:scale-105 hover:bg-stone-50 transition-all duration-300 shadow-xl shadow-white/10"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-stone-950 text-stone-500 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-yellow-400 text-stone-900 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="font-black text-white">SahajPath</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed max-w-sm">
                Study Buddy-powered adaptive learning that connects students, teachers and parents.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-800 text-[10px]">
                <span className={`w-1.5 h-1.5 rounded-full ${isBackendOnline === false ? 'bg-rose-500' : 'bg-yellow-500'
                  }`} />
                Platform: {isBackendOnline === false ? 'Offline' : 'Online'}
              </div>
            </div>

            <div>
              <div className="text-white text-xs font-black uppercase tracking-wider">Platform</div>
              <div className="mt-3 space-y-2 text-xs">
                <a href="#features" className="block hover:text-white">Features</a>
                <a href="#how-it-works" className="block hover:text-white">How It Works</a>
                <a href="#roles" className="block hover:text-white">For Everyone</a>
                <a href="#demo" className="block hover:text-white">Demo</a>
              </div>
            </div>

            <div>
              <div className="text-white text-xs font-black uppercase tracking-wider">Legal</div>
              <div className="mt-3 space-y-2 text-xs">
                <Link to="/privacy" className="block hover:text-white transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="block hover:text-white transition-colors">Terms of Service</Link>
                <Link to="/disclaimer" className="block hover:text-white transition-colors">Disclaimer</Link>
              </div>
            </div>
            <div>
              <div className="text-white text-xs font-black uppercase tracking-wider">Company</div>
              <div className="mt-3 space-y-2 text-xs">
                <Link to="/about" className="block hover:text-white transition-colors">About Us</Link>
                <Link to="/blog" className="block hover:text-white transition-colors">Blog</Link>
                <Link to="/contact" className="block hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px]">
            <span>© {new Date().getFullYear()} SahajPath. All rights reserved.</span>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {onQuickDemo && (
                <button
                  onClick={() => onQuickDemo('admin')}
                  className="px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition"
                >
                  Super Admin Panel
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};


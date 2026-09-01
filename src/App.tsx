import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ParentAccount,
  ChildAccount,
  SubscriptionTier,
  ExamSubmission,
  AppPersona,
  LearningPathNode,
  Badge,
  LeaderboardEntry,
  TeacherContact,
  ParentTeacherMessage,
  SharedDossier,
  PTMSchedule,
  Board,
  ClassGrade,
  Subject,
  ExamDifficulty
} from './types';
import {
  GraduationCap,
  Users,
  BookOpen,
  CheckCircle,
  FileText,
  Sparkles,
  ShieldCheck,
  Info,
  AlertTriangle,
  Lock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Play,
  Award,
  Layers,
  BarChart3,
  Menu,
  X,
  Clock,
  Compass,
  Trophy,
  MessageSquare,
  Flame,
  Zap,
  Share2,
  Smile,
  Gamepad2,
  LogOut,
  Loader2
} from 'lucide-react';
import { ExamArena } from './components/ExamArena';
import { DiagnosticReport } from './components/DiagnosticReport';
import { ParentDashboard } from './components/ParentDashboard';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { BlogSection } from './components/BlogSection';
import { AboutSection } from './components/AboutSection';
import { LegalSection } from './components/LegalSection';
import { AddChildModal } from './components/AddChildModal';
import { AdaptiveLearningPath } from './components/AdaptiveLearningPath';
import { GamificationHub } from './components/GamificationHub';
import { ParentTeacherCommunication } from './components/ParentTeacherCommunication';
import { FunZone } from './components/FunZone';
import { LoginPage } from './components/LoginPage';
import { LandingPage } from './components/LandingPage';
import { ChildPinModal } from './components/ChildPinModal';
import {
  getStoredTokens,
  clearTokens,
  decodeTokenPayload,
  authApi,
  parentApi,
  communicationApi,
  gamificationApi,
  subscriptionApi,
  adminApi,
} from './lib/api';

export default function App() {
  // ------------------------------------------------------------
  // Auth bootstrap. Nothing about the account is hardcoded anymore —
  // this reads whatever tokens (if any) are already in sessionStorage and
  // decides whether to show LandingPage or the app shell.
  // ------------------------------------------------------------
  const [authRole, setAuthRole] = useState<string | null>(() => {
    const tokens = getStoredTokens();
    if (!tokens) return null;
    const payload = decodeTokenPayload(tokens.accessToken);
    return payload?.role ?? null;
  });
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<
    'arena' | 'dashboard' | 'learning-path' | 'gamification' | 'ptc' | 'fun-zone' | 'pricing' | 'admin' | 'blog' | 'about' | 'legal'
  >('dashboard');
  const [activePersona, setActivePersona] = useState<AppPersona>('parent');
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  // Core Data State — all loaded from the backend, none of it seeded from mock data
  const [parentAccount, setParentAccount] = useState<ParentAccount | null>(null);
  const [examHistory, setExamHistory] = useState<ExamSubmission[]>([]);
  const [activeSubmissionReport, setActiveSubmissionReport] = useState<ExamSubmission | null>(null);

  // Adaptive Learning, Gamification & PTC State
  const [learningNodes, setLearningNodes] = useState<LearningPathNode[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Modals & UI States
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const personaMenuRef = useRef<HTMLDivElement>(null);

  // Close persona dropdown when clicking anywhere outside
  useEffect(() => {
    if (!showPersonaMenu) return;
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (personaMenuRef.current && !personaMenuRef.current.contains(event.target as Node)) {
        setShowPersonaMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showPersonaMenu]);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('acugrade_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('acugrade_sidebar_collapsed', String(next));
      } catch { }
      return next;
    });
  };

  const [pinModalTargetChild, setPinModalTargetChild] = useState<ChildAccount | null>(null);

  const normalizedRole = (authRole || '').toUpperCase();
  const isAdminSession = normalizedRole === 'ADMIN' || normalizedRole === 'SUPER_ADMIN';
  const isTeacherSession = normalizedRole === 'TEACHER';
  const isStudentSession = normalizedRole === 'STUDENT';
  const isParentSession = normalizedRole === 'PARENT';
  const activeChild = parentAccount?.children.find((c) => c.id === activeChildId) || parentAccount?.children[0];
  const isParentActive = activePersona === 'parent';
  const isFreePlan = parentAccount?.subscriptionTier === 'free';
  const dailyQuotaUsed = activeChild ? activeChild.dailyExamsTakenToday : 0;
  const totalFamilyXP = parentAccount?.children.reduce((acc, c) => acc + (c.xp || 0), 0) || 0;
  const totalChildrenCount = parentAccount?.children.length || 0;

  // ------------------------------------------------------------
  // Data loading — replaces the old mock-data useState initializers.
  // ------------------------------------------------------------
  const loadParentAndChildren = useCallback(async () => {
    const [me, children] = await Promise.all([parentApi.getMe(), parentApi.getChildren()]);

    // Merge per-child topicMastery + recent exams from each child's overview
    // (the children-list endpoint returns the lean ChildAccount shape only).
    const overviews = await Promise.all(children.map((c: ChildAccount) => parentApi.getChildOverview(c.id)));
    const enrichedChildren: ChildAccount[] = children.map((c: ChildAccount, idx: number) => ({
      ...c,
      topicMastery: overviews[idx].topicMastery || {},
    }));
    const allRecentExams = overviews
      .flatMap((o) => o.recentExams)
      .sort((a: ExamSubmission, b: ExamSubmission) => (a.submittedAt < b.submittedAt ? 1 : -1));

    setParentAccount({
      id: me.id,
      name: me.name,
      email: me.email,
      role: 'parent',
      subscriptionTier: me.subscriptionTier,
      subscriptionExpiry: me.subscriptionExpiry,
      children: enrichedChildren,
      createdAt: me.createdAt,
    });
    setExamHistory(allRecentExams);
    if (!activeChildId && enrichedChildren[0]) setActiveChildId(enrichedChildren[0].id);
    return enrichedChildren;
  }, [activeChildId]);

  const loadGamification = useCallback(async () => {
    const [badgeList, leaderboardList] = await Promise.all([
      gamificationApi.listBadges(),
      gamificationApi.leaderboard('all_time'),
    ]);
    setBadges(badgeList);
    setLeaderboard(
      leaderboardList.map((entry: LeaderboardEntry) => ({
        ...entry,
        isCurrentStudent: entry.studentId === activeChildId,
      }))
    );
  }, [activeChildId]);

  const loadLearningPath = useCallback(async (childId: string) => {
    const nodes = await parentApi.getChildLearningPath(childId);
    setLearningNodes(nodes);
  }, []);



  // Full bootstrap once authenticated - ESSENTIAL SESSION ONLY (Zero Over-fetching)
  useEffect(() => {
    if (!authRole) {
      setIsBootstrapping(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setIsBootstrapping(true);
      setBootstrapError(null);
      try {
        if (isAdminSession) {
          setActiveTab('admin');
        } else if (isTeacherSession) {
          setActiveTab('ptc');
        } else if (isStudentSession) {
          setActiveTab('arena');
        } else if (isParentSession) {
          // Only fetch parent and children on login bootstrap (Super Fast Login!)
          await loadParentAndChildren();
        } else {
          clearTokens();
          setAuthRole(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          const message = err?.message || 'Could not load your account. Please try logging in again.';
          setBootstrapError(message);
        }
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authRole, isAdminSession, isTeacherSession, isStudentSession, isParentSession, loadParentAndChildren]);

  // On-demand gamification loading (Only calls API when user navigates to Leaderboard/Gamification)
  useEffect(() => {
    if (activeTab === 'gamification') {
      loadGamification();
    }
  }, [activeTab, loadGamification]);

  // On-demand learning path loading (Only calls API when user navigates to Learning Path)
  useEffect(() => {
    if (activeTab === 'learning-path' && activeChild) {
      loadLearningPath(activeChild.id);
    }
  }, [activeTab, activeChild?.id, loadLearningPath]);

  // ------------------------------------------------------------
  // Auth handlers
  // ------------------------------------------------------------
  const handleAuthenticated = (role: string) => {
    setBootstrapError(null);
    setAuthRole(role.toUpperCase());
  };

  const handleLogout = async () => {
    const tokens = getStoredTokens();
    try {
      if (tokens) await authApi.logout(tokens.refreshToken);
    } catch {
      // best-effort — clear local state regardless
    }
    clearTokens();
    setAuthRole(null);
    setAuthModalMode(null);
    setParentAccount(null);
    setActiveChildId(null);
    setExamHistory([]);
    setShowPersonaMenu(false);
  };

  // Persona Handlers
  const handleSwitchToParent = () => {
    setActivePersona('parent');
    setActiveTab('dashboard');
    setShowPersonaMenu(false);
  };

  const handleSwitchToChild = (childId: string) => {
    const target = parentAccount?.children.find((c) => c.id === childId);
    if (!target) return;

    // If already in child persona and on same child, simply navigate to arena
    if (activePersona === 'child' && activeChildId === childId) {
      setActiveTab('arena');
      setShowPersonaMenu(false);
      return;
    }

    // Intercept with PIN Verification Modal
    setPinModalTargetChild(target);
    setShowPersonaMenu(false);
  };

  const handlePinSuccess = (childId: string) => {
    setActivePersona('child');
    setActiveChildId(childId);
    setActiveTab('arena');
    setPinModalTargetChild(null);
  };

  // Exam submission is now handled server-side by ExamArena's call to
  // POST /exams/{id}/submit (XP, badges, mastery, learning path, streak,
  // average score are all computed by the backend — see
  // helper/gamification_engine.py, helper/mastery_engine.py, etc.). This
  // handler's job shrinks to: show the report, then resync from the server
  // so the dashboard/gamification/learning-path views reflect what changed.
  const handleExamComplete = async (submission: ExamSubmission) => {
    setExamHistory((prev) => [submission, ...prev]);
    setActiveSubmissionReport(submission);

    try {
      await loadParentAndChildren();
      await loadGamification();
      if (activeChildId) await loadLearningPath(activeChildId);
    } catch {
      // Non-fatal — the report itself already rendered from the submit
      // response; a stale sidebar stat will self-correct on next navigation.
    }
  };

  const handleLaunchTopicExam = (_config: {
    board: Board;
    classGrade: ClassGrade;
    subject: Subject;
    difficulty: ExamDifficulty;
    topic: string;
  }) => {
    setActiveTab('arena');
  };

  // Retake or jump to next exam
  const handleRetakeOrNextExam = () => {
    setActiveSubmissionReport(null);
    setActiveTab('arena');
  };

  // Subscription Upgrade
  const handleUpgradeTier = async (tier: SubscriptionTier) => {
    await subscriptionApi.upgrade(tier);
    setParentAccount((prev) => (prev ? { ...prev, subscriptionTier: tier } : prev));
    setShowUpgradeModal(false);
  };

  // Daily quota reset (admin/parent action)
  const handleResetDailyQuota = async (childId: string) => {
    await adminApi.resetQuota(childId);
    setParentAccount((prev) =>
      prev
        ? { ...prev, children: prev.children.map((c) => (c.id === childId ? { ...c, dailyExamsTakenToday: 0 } : c)) }
        : prev
    );
  };

  // Add child
  const handleAddChild = async (
    childData: Omit<ChildAccount, 'id' | 'totalExamsTaken' | 'averageScore' | 'streakDays' | 'dailyExamsTakenToday' | 'topicMastery'>
  ) => {
    const created = await parentApi.addChild({
      name: childData.name,
      avatar: childData.avatar,
      classGrade: childData.classGrade,
      targetBoard: childData.targetBoard,
      schoolName: childData.schoolName,
      pin: childData.pin,
    });
    setParentAccount((prev) => (prev ? { ...prev, children: [...prev.children, { ...created, topicMastery: {} }] } : prev));
    setActiveChildId(created.id);
  };

  // Update child
  const handleUpdateChild = async (updatedChild: ChildAccount) => {
    const saved = await parentApi.updateChild(updatedChild.id, {
      name: updatedChild.name,
      avatar: updatedChild.avatar,
      classGrade: updatedChild.classGrade,
      targetBoard: updatedChild.targetBoard,
      schoolName: updatedChild.schoolName,
    });
    setParentAccount((prev) =>
      prev
        ? { ...prev, children: prev.children.map((c) => (c.id === saved.id ? { ...c, ...saved } : c)) }
        : prev
    );
  };

  // Award XP from Fun Zone Games & Brain Breaks — server-validated & capped
  // (see controller/gamification_controller.py:award_xp_route).
  const handleAwardXP = async (amount: number, reason: string) => {
    if (!activeChildId) return;
    const { xp, level } = await gamificationApi.awardXp(activeChildId, amount, reason);
    setParentAccount((prev) =>
      prev
        ? { ...prev, children: prev.children.map((c) => (c.id === activeChildId ? { ...c, xp, level } : c)) }
        : prev
    );
    loadGamification().catch(() => { });
  };

  const getPageTitle = () => {
    if (activeSubmissionReport) return 'Diagnostic Dossier & Analysis';
    switch (activeTab) {
      case 'dashboard': return isParentActive ? 'Parent Dashboard' : `${activeChild?.name}'s Study Dashboard`;
      case 'arena': return '10-Mark Diagnostic Exam Arena';
      case 'learning-path': return 'Adaptive Learning Paths & RAG Knowledge Engine';
      case 'gamification': return 'Academic Leaderboard & Badge Hall of Fame';
      case 'ptc': return 'Parent-Teacher Communication & Dossier Bridge';
      case 'fun-zone': return 'Brain Breaks, Anecdotes & Speed Games Arcade';
      case 'pricing': return 'Subscription & Plan Management';
      case 'admin': return 'Super Admin & RAG Runbook Engine';
      case 'blog': return 'Curriculum Taxonomy & Pedagogical Blog';
      case 'about': return 'About AcuGrade & RAG Intelligence';
      case 'legal': return 'Academic Policies & Disclaimers';
      default: return 'AcuGrade Workspace';
    }
  };

  // ------------------------------------------------------------
  // Render: If not logged in, show the LandingPage. If the visitor
  // clicks Login/Sign Up, show the LoginPage modal. Once authenticated,
  // bootstrap the app shell.
  // ------------------------------------------------------------
  if (!authRole) {
    if (authModalMode) {
      return (
        <LoginPage
          onAuthenticated={handleAuthenticated}
          initialMode={authModalMode}
          onClose={() => setAuthModalMode(null)}
        />
      );
    }
    return (
      <LandingPage
        onOpenAuth={(mode) => setAuthModalMode(mode || 'login')}
      />
    );
  }

  if (isBootstrapping) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-sm">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (bootstrapError) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-sm text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm text-slate-700">{bootstrapError}</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  // Admin-only session: render just the SuperAdminPanel — there's no
  // "family" for an ADMIN/SUPER_ADMIN account to show a parent dashboard for.
  if (isAdminSession) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex flex-col">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-slate-900">AcuGrade AI — Admin Console</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <SuperAdminPanel
            parentAccount={{
              id: '', name: 'Admin', email: '', role: 'parent', subscriptionTier: 'free',
              children: [], createdAt: '',
            }}
            onUpdateParentTier={() => { }}
            onResetChildQuota={handleResetDailyQuota}
          />
        </div>
      </div>
    );
  }

  // Teacher-only session: render Teacher Portal
  if (isTeacherSession) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex flex-col">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-slate-900">AcuGrade AI — Teacher Portal</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </header>
        <div className="flex-1 max-w-3xl w-full mx-auto p-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Welcome, Educator! 🧑‍🏫</h2>
            <p className="text-sm text-slate-600">
              You are logged in with a Teacher account. This portal receives diagnostic dossiers and enables communication with parents.
            </p>
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-sm text-indigo-800 space-y-2">
              <p className="font-semibold">Parent & Student Dashboard Testing:</p>
              <p className="text-xs text-indigo-700">
                To experience the full Parent Dashboard, 10-Mark Diagnostic Exam Arena, Gamification Hub, and Adaptive Learning Paths, please sign in with a <strong>Parent</strong> account or create a new account from the login screen.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              Sign out / Switch account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!parentAccount) {
    return null; // shouldn't happen — isBootstrapping/bootstrapError cover this
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar (High Density Theme with Global Collapse / Expand) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col transform transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
          } ${mobileSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand Header */}
        <div className={`p-4 border-b border-slate-100 flex items-center ${isSidebarCollapsed ? 'lg:flex-col lg:gap-2.5 justify-center' : 'justify-between'}`}>
          <div
            className="flex items-center gap-2.5 cursor-pointer min-w-0"
            onClick={() => {
              setActiveSubmissionReport(null);
              setActiveTab('dashboard');
              setMobileSidebarOpen(false);
            }}
            title="AcuGrade AI — RAG K-Graph"
          >
            <div className="w-8 h-8 min-w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-xs">
              <span>Σ</span>
            </div>
            <div className={`truncate ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
              <span className="font-bold text-lg tracking-tight italic text-slate-900">AcuGrade AI</span>
              <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">RAG K-Graph</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Single Desktop Toggle Button inside Sidebar with Rich Hover Effect */}
            <button
              id="desktop-sidebar-toggle"
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 bg-slate-50/80 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 shadow-2xs hover:shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 group cursor-pointer"
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              ) : (
                <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              )}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Sections (Dynamic Persona-Gated Navigation) */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {activePersona === 'child' ? (
            /* ============================================================ */
            /* STUDENT / CHILD PERSONA SIDEBAR                              */
            /* ============================================================ */
            <>
              {!isSidebarCollapsed ? (
                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest px-3 mb-2 mt-1 flex items-center justify-between">
                  <span>Student Arena</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                    {activeChild?.name}
                  </span>
                </div>
              ) : (
                <div className="hidden lg:block my-2 border-t border-slate-100" title={`Student Arena (${activeChild?.name})`} />
              )}

              <button
                id="nav-sidebar-arena"
                title="10-Mark Exam Arena"
                onClick={() => {
                  setActiveSubmissionReport(null);
                  setActiveTab('arena');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center py-2.5 rounded-xl text-sm font-medium transition-all ${isSidebarCollapsed ? 'lg:justify-center lg:px-0 px-3 gap-3' : 'gap-3 px-3'
                  } ${activeTab === 'arena' && !activeSubmissionReport
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-indigo-50/50 hover:text-indigo-900'
                  }`}
              >
                <Play className={`w-4 h-4 flex-shrink-0 ${activeTab === 'arena' && !activeSubmissionReport ? 'text-white' : 'text-emerald-600'}`} />
                <span className={`truncate ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>10-Mark Exam Arena</span>
              </button>

              <button
                id="nav-sidebar-learning-path"
                title="Adaptive Learning Path"
                onClick={() => {
                  setActiveSubmissionReport(null);
                  setActiveTab('learning-path');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center py-2.5 rounded-xl text-sm font-medium transition-all ${isSidebarCollapsed ? 'lg:justify-center lg:px-0 justify-between px-3' : 'justify-between px-3'
                  } ${activeTab === 'learning-path' && !activeSubmissionReport
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-indigo-50/50 hover:text-indigo-900'
                  }`}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'lg:gap-0 gap-3' : 'gap-3'}`}>
                  <Compass className={`w-4 h-4 flex-shrink-0 ${activeTab === 'learning-path' && !activeSubmissionReport ? 'text-white' : 'text-indigo-600'}`} />
                  <span className={`truncate ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>Adaptive Learning Path</span>
                </div>
              </button>

              <button
                id="nav-sidebar-gamification"
                title={`Ranks & Badges (Lvl ${activeChild?.level || 1})`}
                onClick={() => {
                  setActiveSubmissionReport(null);
                  setActiveTab('gamification');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center py-2.5 rounded-xl text-sm font-medium transition-all ${isSidebarCollapsed ? 'lg:justify-center lg:px-0 justify-between px-3' : 'justify-between px-3'
                  } ${activeTab === 'gamification' && !activeSubmissionReport
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-indigo-50/50 hover:text-indigo-900'
                  }`}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'lg:gap-0 gap-3' : 'gap-3'}`}>
                  <Trophy className={`w-4 h-4 flex-shrink-0 ${activeTab === 'gamification' && !activeSubmissionReport ? 'text-white' : 'text-amber-500'}`} />
                  <span className={`truncate ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>Ranks & Badges</span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isSidebarCollapsed ? 'lg:hidden' : ''} ${activeTab === 'gamification' && !activeSubmissionReport ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
                  Lvl {activeChild?.level || 1}
                </span>
              </button>

              <button
                id="nav-sidebar-fun-zone"
                title="Brain Breaks & Games"
                onClick={() => {
                  setActiveSubmissionReport(null);
                  setActiveTab('fun-zone');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center py-2.5 rounded-xl text-sm font-medium transition-all ${isSidebarCollapsed ? 'lg:justify-center lg:px-0 justify-between px-3' : 'justify-between px-3'
                  } ${activeTab === 'fun-zone' && !activeSubmissionReport
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-indigo-50/50 hover:text-indigo-900'
                  }`}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'lg:gap-0 gap-3' : 'gap-3'}`}>
                  <Smile className={`w-4 h-4 flex-shrink-0 ${activeTab === 'fun-zone' && !activeSubmissionReport ? 'text-white' : 'text-pink-500'}`} />
                  <span className={`truncate ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>Brain Breaks & Games</span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isSidebarCollapsed ? 'lg:hidden' : ''} ${activeTab === 'fun-zone' && !activeSubmissionReport ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-700'}`}>
                  Fun
                </span>
              </button>

              {examHistory.length > 0 && (
                <button
                  id="nav-sidebar-results"
                  title="My Results & Analysis"
                  onClick={() => {
                    setActiveSubmissionReport(examHistory[0]);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center py-2.5 rounded-xl text-sm font-medium transition-all ${isSidebarCollapsed ? 'lg:justify-center lg:px-0 px-3 gap-3' : 'gap-3 px-3'
                    } ${activeSubmissionReport
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-indigo-50/50 hover:text-indigo-900'
                    }`}
                >
                  <Award className={`w-4 h-4 flex-shrink-0 ${activeSubmissionReport ? 'text-white' : 'text-amber-500'}`} />
                  <span className={`truncate ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>My Results & Analysis</span>
                </button>
              )}

              {/* Student Quick Action to return to Parent View */}
              <div className="pt-4 mt-4 border-t border-slate-100">
                {!isSidebarCollapsed && (
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
                    Parent Access
                  </div>
                )}
                <button
                  onClick={handleSwitchToParent}
                  title="Switch to Parent View"
                  className={`w-full flex items-center rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border border-slate-200 ${isSidebarCollapsed ? 'lg:justify-center lg:px-0 lg:py-2.5 px-3 py-2.5 gap-2.5' : 'px-3 py-2.5 gap-2.5'
                    }`}
                >
                  <span className="text-base">👨‍👩‍👧‍👦</span>
                  <span className={`truncate ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>Switch to Parent View</span>
                </button>
              </div>
            </>
          ) : (
            /* ============================================================ */
            /* PARENT PERSONA SIDEBAR                                       */
            /* ============================================================ */
            <>
              {!isSidebarCollapsed ? (
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 mt-1">
                  Family & Management
                </div>
              ) : (
                <div className="hidden lg:block my-2 border-t border-slate-100" title="Family & Management" />
              )}

              <button
                id="nav-sidebar-dashboard"
                title="Family Dashboard"
                onClick={() => {
                  setActiveSubmissionReport(null);
                  setActiveTab('dashboard');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center py-2 rounded-md text-sm font-medium transition-colors ${isSidebarCollapsed ? 'lg:justify-center lg:px-0 px-3 gap-3' : 'gap-3 px-3'
                  } ${activeTab === 'dashboard' && !activeSubmissionReport
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <BarChart3 className="w-4 h-4 flex-shrink-0 text-indigo-600" />
                <span className={`truncate ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>Family Dashboard</span>
              </button>

              <button
                id="nav-sidebar-ptc"
                title="Parent-Teacher Hub"
                onClick={() => {
                  setActiveSubmissionReport(null);
                  setActiveTab('ptc');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center py-2 rounded-md text-sm font-medium transition-colors ${isSidebarCollapsed ? 'lg:justify-center lg:px-0 justify-between px-3' : 'justify-between px-3'
                  } ${activeTab === 'ptc' && !activeSubmissionReport
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'lg:gap-0 gap-3' : 'gap-3'}`}>
                  <MessageSquare className="w-4 h-4 flex-shrink-0 text-sky-600" />
                  <span className={`truncate ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>Parent-Teacher Hub</span>
                </div>
                <span className={`text-[10px] bg-sky-50 text-sky-700 font-bold px-1.5 py-0.5 rounded border border-sky-100 ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
                  Live
                </span>
              </button>

              <button
                id="nav-sidebar-pricing"
                title="Subscription Plans"
                onClick={() => {
                  setActiveSubmissionReport(null);
                  setActiveTab('pricing');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center py-2 rounded-md text-sm font-medium transition-colors ${isSidebarCollapsed ? 'lg:justify-center lg:px-0 px-3 gap-3' : 'gap-3 px-3'
                  } ${activeTab === 'pricing'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <Sparkles className="w-4 h-4 flex-shrink-0 text-indigo-500" />
                <span className={`truncate ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>Subscription Plans</span>
              </button>

              {!isSidebarCollapsed ? (
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 mt-5">
                  Academic Progress & Tools
                </div>
              ) : (
                <div className="hidden lg:block my-3 border-t border-slate-100" title="Academic Progress & Tools" />
              )}

              <button
                id="nav-sidebar-arena"
                title="10-Mark Exam Arena"
                onClick={() => {
                  setActiveSubmissionReport(null);
                  setActiveTab('arena');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center py-2 rounded-md text-sm font-medium transition-colors ${isSidebarCollapsed ? 'lg:justify-center lg:px-0 px-3 gap-3' : 'gap-3 px-3'
                  } ${activeTab === 'arena' && !activeSubmissionReport
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <Play className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span className={`truncate ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>10-Mark Exam Arena</span>
              </button>

              <button
                id="nav-sidebar-learning-path"
                title="Adaptive Path"
                onClick={() => {
                  setActiveSubmissionReport(null);
                  setActiveTab('learning-path');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center py-2 rounded-md text-sm font-medium transition-colors ${isSidebarCollapsed ? 'lg:justify-center lg:px-0 justify-between px-3' : 'justify-between px-3'
                  } ${activeTab === 'learning-path' && !activeSubmissionReport
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'lg:gap-0 gap-3' : 'gap-3'}`}>
                  <Compass className="w-4 h-4 flex-shrink-0 text-indigo-600" />
                  <span className={`truncate ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>Adaptive Path</span>
                </div>
              </button>

              <button
                id="nav-sidebar-gamification"
                title="Leaderboard & Ranks"
                onClick={() => {
                  setActiveSubmissionReport(null);
                  setActiveTab('gamification');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center py-2 rounded-md text-sm font-medium transition-colors ${isSidebarCollapsed ? 'lg:justify-center lg:px-0 justify-between px-3' : 'justify-between px-3'
                  } ${activeTab === 'gamification' && !activeSubmissionReport
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'lg:gap-0 gap-3' : 'gap-3'}`}>
                  <Trophy className="w-4 h-4 flex-shrink-0 text-amber-500" />
                  <span className={`truncate ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>Leaderboard</span>
                </div>
                <span className={`text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
                  Ranks
                </span>
              </button>

              {/* Super Admin Panel link ONLY shown if session is Admin */}
              {isAdminSession && (
                <button
                  id="nav-sidebar-admin"
                  title="Super Admin Panel"
                  onClick={() => {
                    setActiveSubmissionReport(null);
                    setActiveTab('admin');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center py-2 rounded-md text-sm font-medium transition-colors ${isSidebarCollapsed ? 'lg:justify-center lg:px-0 px-3 gap-3' : 'gap-3 px-3'
                    } ${activeTab === 'admin'
                      ? 'bg-amber-50 text-amber-800 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 text-amber-600" />
                  <span className={`truncate ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>Super Admin Panel</span>
                </button>
              )}

              {!isSidebarCollapsed ? (
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 mt-5">
                  Pedagogy & Resources
                </div>
              ) : (
                <div className="hidden lg:block my-3 border-t border-slate-100" title="Pedagogy & Resources" />
              )}

              <button
                id="nav-sidebar-blog"
                title="Curriculum Blog"
                onClick={() => {
                  setActiveSubmissionReport(null);
                  setActiveTab('blog');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center py-2 rounded-md text-sm font-medium transition-colors ${isSidebarCollapsed ? 'lg:justify-center lg:px-0 px-3 gap-3' : 'gap-3 px-3'
                  } ${activeTab === 'blog'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <BookOpen className="w-4 h-4 flex-shrink-0" />
                <span className={`truncate ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>Curriculum Blog</span>
              </button>

              <button
                id="nav-sidebar-about"
                title="About & Pedagogy"
                onClick={() => {
                  setActiveSubmissionReport(null);
                  setActiveTab('about');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center py-2 rounded-md text-sm font-medium transition-colors ${isSidebarCollapsed ? 'lg:justify-center lg:px-0 px-3 gap-3' : 'gap-3 px-3'
                  } ${activeTab === 'about'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <Info className="w-4 h-4 flex-shrink-0" />
                <span className={`truncate ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>About & Pedagogy</span>
              </button>

              <button
                id="nav-sidebar-legal"
                title="Policies & Disclaimers"
                onClick={() => {
                  setActiveSubmissionReport(null);
                  setActiveTab('legal');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center py-2 rounded-md text-sm font-medium transition-colors ${isSidebarCollapsed ? 'lg:justify-center lg:px-0 px-3 gap-3' : 'gap-3 px-3'
                  } ${activeTab === 'legal'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span className={`truncate ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>Policies & Disclaimers</span>
              </button>
            </>
          )}
        </nav>

        {/* Bottom Current Plan Widget (High Density) */}
        <div className="p-3 border-t border-slate-100">
          {/* Collapsed view on Desktop */}
          {isSidebarCollapsed ? (
            <div
              onClick={() => isFreePlan ? setShowUpgradeModal(true) : setActiveTab('pricing')}
              title={`Active Plan: ${parentAccount.subscriptionTier === 'free' ? 'Free Plan (1 Exam/Day)' : 'Unlimited Family Exams'} — Click to view`}
              className="hidden lg:flex flex-col items-center justify-center p-2.5 bg-slate-900 rounded-xl text-white cursor-pointer hover:bg-slate-800 transition-colors shadow-2xs group"
            >
              <Sparkles className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-bold text-indigo-300 mt-1 uppercase">
                {parentAccount.subscriptionTier === 'free' ? 'Free' : 'Pro'}
              </span>
            </div>
          ) : null}

          {/* Full view on Expanded Desktop / Mobile Drawer */}
          <div className={`bg-slate-900 rounded-xl p-3.5 text-white space-y-2 ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Active Plan</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                {parentAccount.subscriptionTier === 'free' ? 'Free Plan' : parentAccount.subscriptionTier === 'scholar_pro' ? 'Scholar Pro' : 'Genius Pro'}
              </span>
            </div>
            <p className="text-xs font-bold truncate">
              {parentAccount.subscriptionTier === 'free' ? 'Foundation (1 Exam/Day)' : 'Unlimited Family Exams'}
            </p>

            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{
                  width: isFreePlan ? (dailyQuotaUsed >= 1 ? '100%' : '0%') : '100%'
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-[10px] text-slate-400">
                {isFreePlan ? `${dailyQuotaUsed}/1 Daily Test Taken` : 'Unlimited Exams Available'}
              </p>
              {isFreePlan ? (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline"
                >
                  Upgrade
                </button>
              ) : (
                <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area (High Density Theme) */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header Bar */}
        <header className="h-14 lg:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 z-20">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Mobile-only Sidebar Toggle (hidden on desktop) */}
            <button
              id="mobile-sidebar-toggle"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <h1 className="text-base sm:text-lg font-semibold text-slate-800 truncate">
              {getPageTitle()}
            </h1>

            <div className="hidden sm:block h-4 w-[1px] bg-slate-200" />

            {/* Quick Profile Switcher (High Density Pill) */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-slate-500">Active Persona:</span>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={handleSwitchToParent}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${isParentActive ? 'bg-white shadow-2xs text-indigo-700' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  Parent View
                </button>
                {parentAccount.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => handleSwitchToChild(child.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${activePersona === 'child' && activeChildId === child.id
                      ? 'bg-white shadow-2xs text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <span>{child.avatar}</span>
                    <span>{child.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Persona Menu & Actions */}
          <div className="flex items-center gap-3">
            {/* Persona-Aware Quick Badge (Family Momentum for Parent, Personal Streak for Student) */}
            {isParentActive ? (
              <div
                title={`Total Family Momentum: ${totalFamilyXP} XP across ${totalChildrenCount} registered child profile${totalChildrenCount === 1 ? '' : 's'}`}
                className="hidden sm:flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-200 text-xs font-bold text-indigo-800 shadow-2xs"
              >
                <Trophy className="w-3.5 h-3.5 text-indigo-600" />
                <span>Family: {totalFamilyXP} XP</span>
                <span className="text-indigo-300">•</span>
                <span>{totalChildrenCount} Profile{totalChildrenCount === 1 ? '' : 's'}</span>
              </div>
            ) : activeChild ? (
              <div
                title={`${activeChild.name}'s Learning Streak and Experience Points`}
                className="hidden sm:flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-200 text-xs font-bold text-amber-800 shadow-2xs"
              >
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                <span>{activeChild.streakDays || 0}d Streak</span>
                <span className="text-amber-300">•</span>
                <span>{activeChild.xp || 0} XP</span>
                <span className="text-amber-700 font-bold text-[10px] bg-amber-100/80 px-1.5 py-0.5 rounded-sm">
                  Lvl {activeChild.level || 1}
                </span>
              </div>
            ) : null}

            <div className="relative" ref={personaMenuRef}>
              <button
                id="header-persona-switcher"
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-all text-xs sm:text-sm shadow-2xs"
              >
                <span className="text-base">{isParentActive ? '👨‍👩‍👧‍👦' : activeChild?.avatar || '👤'}</span>
                <div className="text-left hidden sm:block leading-tight">
                  <div className="font-semibold text-slate-800 truncate max-w-[110px]">
                    {isParentActive ? 'Parent View' : activeChild?.name}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {isParentActive ? 'All Children' : `${activeChild?.classGrade} • ${activeChild?.targetBoard}`}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Dropdown Menu Modal */}
              {showPersonaMenu && (
                <div
                  id="persona-dropdown-menu"
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Switch Persona</p>
                    <p className="text-xs text-slate-700 font-medium mt-0.5">{parentAccount.name}</p>
                  </div>

                  <div className="p-1 space-y-0.5">
                    <button
                      onClick={handleSwitchToParent}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${isParentActive ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">👨‍👩‍👧‍👦</span>
                        <div>
                          <div className="font-medium text-slate-900">Parent Dashboard</div>
                          <div className="text-[10px] text-slate-500">Full family analytics & sub-accounts</div>
                        </div>
                      </div>
                      {isParentActive && <CheckCircle className="w-4 h-4 text-indigo-600" />}
                    </button>

                    <div className="my-1 border-t border-slate-100 px-3 py-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Children Sub-Accounts</p>
                    </div>

                    {parentAccount.children.map((child) => {
                      const isSelected = activePersona === 'child' && activeChildId === child.id;
                      return (
                        <button
                          key={child.id}
                          onClick={() => handleSwitchToChild(child.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${isSelected ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{child.avatar}</span>
                            <div>
                              <div className="font-medium text-slate-900">{child.name}</div>
                              <div className="text-[10px] text-slate-500">
                                {child.classGrade} • {child.targetBoard} • Avg {child.averageScore}/10
                              </div>
                            </div>
                          </div>
                          {isSelected && <CheckCircle className="w-4 h-4 text-indigo-600" />}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => {
                        setShowPersonaMenu(false);
                        setShowAddChildModal(true);
                      }}
                      className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-indigo-600 hover:bg-indigo-50 font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Child Sub-Account</span>
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800 font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Main Content Frame (High Density Theme) */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          {activeSubmissionReport ? (
            <DiagnosticReport
              submission={activeSubmissionReport}
              onRetakeOrNextExam={handleRetakeOrNextExam}
              onBackToDashboard={() => {
                setActiveSubmissionReport(null);
                setActiveTab('dashboard');
              }}
              onNavigateToLearningPath={() => {
                setActiveSubmissionReport(null);
                setActiveTab('learning-path');
              }}
              onNavigateToPTC={() => {
                setActiveSubmissionReport(null);
                setActiveTab('ptc');
              }}
              onNavigateToFunZone={() => {
                setActiveSubmissionReport(null);
                setActiveTab('fun-zone');
              }}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <ParentDashboard
                  parentAccount={parentAccount}
                  activeChildId={activeChildId}
                  onChildSelect={(cId) => {
                    setActiveChildId(cId);
                  }}
                  onLaunchExamForChild={(cId) => {
                    setActiveChildId(cId);
                    setActiveTab('arena');
                  }}
                  onOpenAddChildModal={() => setShowAddChildModal(true)}
                  onOpenUpgradeModal={() => setShowUpgradeModal(true)}
                  examHistory={examHistory}
                  onViewSubmissionReport={(sub) => setActiveSubmissionReport(sub)}
                  onUpdateChild={handleUpdateChild}
                />
              )}

              {activeTab === 'arena' && (
                <ExamArena
                  parentAccount={parentAccount}
                  activeChildId={activeChildId}
                  onChildSelect={(cId) => setActiveChildId(cId)}
                  onExamComplete={handleExamComplete}
                  onOpenUpgradeModal={() => setShowUpgradeModal(true)}
                  onResetDailyQuota={handleResetDailyQuota}
                />
              )}

              {activeTab === 'learning-path' && activeChild && (
                <AdaptiveLearningPath
                  activeChild={activeChild}
                  learningNodes={learningNodes}
                  onLaunchTopicExam={handleLaunchTopicExam}
                />
              )}

              {activeTab === 'gamification' && activeChild && (
                <GamificationHub
                  activeChild={activeChild}
                  allBadges={badges}
                  leaderboard={leaderboard}
                />
              )}

              {activeTab === 'ptc' && activeChild && (
                <ParentTeacherCommunication
                  parentAccount={parentAccount}
                  activeChild={activeChild}
                  recentSubmissions={examHistory}
                  onViewSubmissionReport={(sub) => setActiveSubmissionReport(sub)}
                />
              )}

              {activeTab === 'fun-zone' && (
                <FunZone
                  activeChild={activeChild}
                  onAwardXP={handleAwardXP}
                  onLaunchExam={() => {
                    setActiveSubmissionReport(null);
                    setActiveTab('arena');
                  }}
                />
              )}

              {activeTab === 'pricing' && (
                <SubscriptionPlans
                  parentAccount={parentAccount}
                  onUpgradeTier={handleUpgradeTier}
                />
              )}

              {activeTab === 'admin' && (
                <SuperAdminPanel
                  parentAccount={parentAccount}
                  onUpdateParentTier={handleUpgradeTier}
                  onResetChildQuota={handleResetDailyQuota}
                />
              )}

              {activeTab === 'blog' && <BlogSection />}
              {activeTab === 'about' && <AboutSection />}
              {activeTab === 'legal' && <LegalSection />}
            </>
          )}
        </div>

        {/* Crisp Bottom Footer (Dynamic Persona-Gated Theme) */}
        <footer className="h-10 bg-white border-t border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 text-[11px] text-slate-400 flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            {activePersona === 'child' ? (
              <>
                <button
                  onClick={() => { setActiveSubmissionReport(null); setActiveTab('arena'); }}
                  className="hover:text-indigo-600 transition-colors font-medium"
                >
                  Exam Arena
                </button>
                <button
                  onClick={() => { setActiveSubmissionReport(null); setActiveTab('learning-path'); }}
                  className="hover:text-slate-700 transition-colors"
                >
                  Adaptive Path
                </button>
                <button
                  onClick={() => { setActiveSubmissionReport(null); setActiveTab('gamification'); }}
                  className="hover:text-slate-700 transition-colors"
                >
                  Leaderboard & Badges
                </button>
                <button
                  onClick={() => { setActiveSubmissionReport(null); setActiveTab('fun-zone'); }}
                  className="hover:text-pink-600 font-medium transition-colors flex items-center gap-1"
                >
                  <Smile className="w-3 h-3 text-pink-500" />
                  <span>Fun Zone</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setActiveSubmissionReport(null); setActiveTab('dashboard'); }}
                  className="hover:text-slate-700 transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { setActiveSubmissionReport(null); setActiveTab('ptc'); }}
                  className="hover:text-slate-700 transition-colors"
                >
                  Parent-Teacher Bridge
                </button>
                <button
                  onClick={() => { setActiveSubmissionReport(null); setActiveTab('blog'); }}
                  className="hover:text-slate-700 transition-colors"
                >
                  Curriculum Blog
                </button>
                <button
                  onClick={() => { setActiveSubmissionReport(null); setActiveTab('pricing'); }}
                  className="hover:text-slate-700 transition-colors"
                >
                  Plans
                </button>
                {isAdminSession && (
                  <button
                    onClick={() => { setActiveSubmissionReport(null); setActiveTab('admin'); }}
                    className="hover:text-amber-700 transition-colors font-medium"
                  >
                    Admin
                  </button>
                )}
              </>
            )}
          </div>
          <p className="hidden md:block italic">
            Empowering evolution through adaptive RAG intelligence & parent-educator alignment.
          </p>
        </footer>
      </main>

      {/* Child 4-Digit Security PIN Verification Modal */}
      <ChildPinModal
        child={pinModalTargetChild}
        isOpen={!!pinModalTargetChild}
        onClose={() => setPinModalTargetChild(null)}
        onSuccess={handlePinSuccess}
      />

      {/* Add Child Sub-Account Modal */}
      <AddChildModal
        isOpen={showAddChildModal}
        onClose={() => setShowAddChildModal(false)}
        onAddChild={handleAddChild}
      />

      {/* Upgrade Subscription Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Upgrade Subscription Plan</h2>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                ✕ Close
              </button>
            </div>
            <SubscriptionPlans
              parentAccount={parentAccount}
              onUpgradeTier={handleUpgradeTier}
              onClose={() => setShowUpgradeModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ParentAccount,
  ChildAccount,
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
  ExamDifficulty,
  Exam,
} from './types';
import {
  GraduationCap,
  Users,
  BookOpen,
  CheckCircle,
  FileText,
  Bell,
  Sparkles,
  ShieldCheck,
  Info,
  AlertTriangle,
  Lock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
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
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, PageAccess } from './components/Sidebar';
import { AIChatWidget } from './components/AIChatWidget2';
import { ExamArena } from './components/ExamArena';
import { KidsExamArena } from './components/KidsExamArena';
import { DiagnosticReport } from './components/DiagnosticReport';
import { ParentDashboard } from './components/ParentDashboard';
import { ChildrenPage } from './components/ChildrenPage';
import { ReportsPage } from './components/ReportsPage';
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
import { PublicDossierView } from './components/PublicDossierView';
import ApiServices, {
  getStoredTokens,
  clearTokens,
  decodeTokenPayload,
} from './services/ApiServices';

const getInitialPublicDossierToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname || '';
  if (path.includes('/share/dossier/')) {
    const parts = path.split('/share/dossier/');
    if (parts[1]) {
      const token = parts[1].split('/')[0].split('?')[0].split('#')[0].trim();
      if (token) return token;
    }
  }
  const params = new URLSearchParams(window.location.search);
  const qToken = params.get('dossier') || params.get('token') || params.get('shareToken');
  if (qToken) return qToken.trim();

  const hash = window.location.hash || '';
  if (hash.includes('dossier=')) {
    const match = hash.match(/dossier=([^&]+)/);
    if (match && match[1]) return match[1].trim();
  }
  return null;
};

export default function App() {
  // Public Shared Dossier Portal Router
  const [publicDossierToken, setPublicDossierToken] = useState<string | null>(getInitialPublicDossierToken);

  useEffect(() => {
    const onLocationChange = () => {
      setPublicDossierToken(getInitialPublicDossierToken());
    };
    window.addEventListener('popstate', onLocationChange);
    return () => window.removeEventListener('popstate', onLocationChange);
  }, []);

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
  const [pageAccess, setPageAccess] = useState<PageAccess[]>([]);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  // Navigation & View State
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname.substring(1).split('/')[0] || 'dashboard';
  const setActiveTab = (tab: string) => navigate('/' + tab);
  const [activePersona, setActivePersona] = useState<AppPersona>('parent');
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [showChildAddedSuccess, setShowChildAddedSuccess] = useState(false);

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
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showQuickTestChildModal, setShowQuickTestChildModal] = useState(false);
  const [isQuickTestLoading, setIsQuickTestLoading] = useState(false);
  const [preloadedExam, setPreloadedExam] = useState<Exam | null>(null);
  const personaMenuRef = useRef<HTMLDivElement>(null);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

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

  // Close notification dropdown when clicking anywhere outside
  useEffect(() => {
    if (!showNotificationMenu) return;
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
        setShowNotificationMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showNotificationMenu]);

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
  const totalFamilyXP = parentAccount?.children.reduce((acc, c) => acc + (c.xp || 0), 0) || 0;
  const totalChildrenCount = parentAccount?.children.length || 0;

  // ------------------------------------------------------------
  // Data loading — replaces the old mock-data useState initializers.
  // ------------------------------------------------------------
  const loadParentAndChildren = useCallback(async () => {
    const dashboardData = await ApiServices.getParentDashboard();
    const { profile, children: enrichedChildren, recentExams, pageAccess } = dashboardData;

    setParentAccount({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: 'parent',
      children: enrichedChildren,
      createdAt: profile.createdAt,
    });
    setExamHistory(recentExams);
    setPageAccess(pageAccess);
    setActiveChildId((prev) => (prev || (enrichedChildren && enrichedChildren[0] ? enrichedChildren[0].id : null)));
    return pageAccess;
  }, []);

  const loadGamification = useCallback(async () => {
    const [badgeList, leaderboardList] = await Promise.all([
      ApiServices.listBadges(),
      ApiServices.leaderboard('all_time'),
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
    const nodes = await ApiServices.getChildLearningPath(childId);
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
        const isRoot = location.pathname === '/' || location.pathname === '';
        if (isAdminSession) {
          const perms = await ApiServices.getMenuPermissions();
          setPageAccess(perms);
          if (perms.length > 0 && isRoot) navigate(perms[0].pageRoute, { replace: true });
        } else if (isTeacherSession) {
          const perms = await ApiServices.getMenuPermissions();
          setPageAccess(perms);
          if (perms.length > 0 && isRoot) navigate(perms[0].pageRoute, { replace: true });
        } else if (isStudentSession) {
          const perms = await ApiServices.getMenuPermissions();
          setPageAccess(perms);
          if (perms.length > 0 && isRoot) navigate(perms[0].pageRoute, { replace: true });
        } else if (isParentSession) {
          const perms = await loadParentAndChildren();
          if (perms.length > 0 && isRoot) navigate(perms[0].pageRoute, { replace: true });
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
      if (tokens) await ApiServices.logout({ refreshToken: tokens.refreshToken });
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


  // Add child
  const handleAddChild = async (
    childData: {
      name: string;
      avatar?: string;
      classGrade: string;
      targetBoard: string;
      schoolName?: string;
      email?: string;
      password?: string;
      pin?: string;
    }
  ) => {
    const created = await ApiServices.addChild({
      name: childData.name,
      avatar: childData.avatar || '👦',
      classGrade: childData.classGrade,
      targetBoard: childData.targetBoard,
      schoolName: childData.schoolName,
      email: childData.email,
      password: childData.password || childData.pin,
      pin: childData.password || childData.pin,
    });
    setParentAccount((prev) => (prev ? { ...prev, children: [...prev.children, { ...created, topicMastery: {} }] } : prev));
    setActiveChildId(created.id);
    setShowChildAddedSuccess(true);
  };

  // Update child
  const handleUpdateChild = async (updatedChild: ChildAccount) => {
    const saved = await ApiServices.updateChild(updatedChild.id, {
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
    const { xp, level } = await ApiServices.awardXp({ studentId: activeChildId, amount, reason });
    setParentAccount((prev) =>
      prev
        ? { ...prev, children: prev.children.map((c) => (c.id === activeChildId ? { ...c, xp, level } : c)) }
        : prev
    );
    loadGamification().catch(() => { });
  };

  // Launch Quick Test from Database for a specific student
  const handleLaunchQuickTest = async (childId: string) => {
    try {
      setIsQuickTestLoading(true);
      setShowQuickTestChildModal(false);
      const res = await ApiServices.generateQuickTest(childId, 10);
      const exam = res?.exam || res?.data?.exam || (res?.questions ? res : null);
      if (exam) {
        setPreloadedExam(exam);
        setActiveChildId(childId);
        setActiveTab('arena');
      } else {
        console.error('Unexpected quick test response structure:', res);
        alert('Could not load diagnostic exam from database response.');
      }
    } catch (err: any) {
      console.error('Failed to generate quick test:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to generate diagnostic quick test from database.');
    } finally {
      setIsQuickTestLoading(false);
    }
  };

  const handleStartQuickTestClick = () => {
    if (!parentAccount || !parentAccount.children || parentAccount.children.length === 0) return;
    if (parentAccount.children.length === 1) {
      handleLaunchQuickTest(parentAccount.children[0].id);
    } else {
      setShowQuickTestChildModal(true);
    }
  };

  const getPageTitle = () => {
    if (activeSubmissionReport) return 'Diagnostic Dossier & Analysis';
    switch (activeTab) {
      case 'dashboard': return isParentActive ? 'Parent Dashboard' : `${activeChild?.name}'s Study Dashboard`;
      case 'arena': return ['Class 1', 'Class 2', 'Class 3', 'Class 4'].includes(activeChild?.classGrade || '') ? 'Kids Magic Exam Arena ✨' : '10-Mark Diagnostic Exam Arena';
      case 'learning-path': return 'Adaptive Learning Paths & RAG Knowledge Engine';
      case 'gamification': return 'Academic Leaderboard & Badge Hall of Fame';
      case 'ptc': return 'Parent-Teacher Communication & Dossier Bridge';
      case 'fun-zone': return 'Brain Breaks, Anecdotes & Speed Games Arcade';
      case 'pricing': return 'Subscription & Plan Management';
      case 'admin': return 'Super Admin & RAG Runbook Engine';
      case 'blog': return 'Curriculum Taxonomy & Pedagogical Blog';
      case 'about': return 'About SahajPath & RAG Intelligence';
      case 'legal': return 'Academic Policies & Disclaimers';
      default: return 'SahajPath Workspace';
    }
  };

  // ------------------------------------------------------------
  // Render Public Academic Dossier (Zero login required for educators)
  // ------------------------------------------------------------
  if (publicDossierToken) {
    return (
      <PublicDossierView
        shareToken={publicDossierToken}
        onExit={() => {
          window.history.pushState({}, '', '/');
          setPublicDossierToken(null);
        }}
      />
    );
  }

  // ------------------------------------------------------------
  // Render: If not logged in, show the LandingPage. If the visitor
  // clicks Login/Sign Up, show the LoginPage modal. Once authenticated,
  // bootstrap the app shell.
  // ------------------------------------------------------------
  if (!authRole) {
    return (
      <div className="relative w-full h-full min-h-screen overflow-x-hidden">
        {/* Main Landing Page */}
        <LandingPage
          onOpenAuth={(mode) => setAuthModalMode(mode || 'login')}
        />

        {/* Slide-over panel for LoginPage */}
        <div
          className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl transform transition-transform duration-500 ease-in-out ${authModalMode ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          {authModalMode && (
            <LoginPage
              onAuthenticated={handleAuthenticated}
              initialMode={authModalMode}
              onClose={() => setAuthModalMode(null)}
            />
          )}
        </div>

        {/* Backdrop */}
        {authModalMode && (
          <div
            className="fixed inset-0 bg-stone-900/50 z-40 backdrop-blur-sm transition-opacity duration-500"
            onClick={() => setAuthModalMode(null)}
          />
        )}
      </div>
    );
  }


  if (bootstrapError) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-stone-50 px-4">
        <div className="max-w-sm text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm text-stone-700">{bootstrapError}</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-semibold"
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
      <div className="min-h-screen w-full bg-stone-50 flex flex-col">
        <header className="h-14 bg-white border-b border-stone-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-stone-900">SahajPath — Admin Console</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <SuperAdminPanel
            parentAccount={{
              id: '', name: 'Admin', email: '', role: 'parent',
              children: [], createdAt: '',
            }}
          />
        </div>
        {/* Floating AI Chat Widget */}
        <AIChatWidget activeChild={activeChild} />
      </div>
    );
  }

  // Teacher-only session: render Teacher Portal
  if (isTeacherSession) {
    return (
      <div className="min-h-screen w-full bg-stone-50 flex flex-col">
        <header className="h-14 bg-white border-b border-stone-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-yellow-600" />
            <span className="font-bold text-stone-900">SahajPath — Teacher Portal</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </header>
        <div className="flex-1 max-w-3xl w-full mx-auto p-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-stone-900">Welcome, Educator! 🧑‍🏫</h2>
            <p className="text-sm text-stone-600">
              You are logged in with a Teacher account. This portal receives diagnostic dossiers and enables communication with parents.
            </p>
            <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-sm text-yellow-800 space-y-2">
              <p className="font-semibold">Parent & Student Dashboard Testing:</p>
              <p className="text-xs text-yellow-700">
                To experience the full Parent Dashboard, 10-Mark Diagnostic Exam Arena, Gamification Hub, and Adaptive Learning Paths, please sign in with a <strong>Parent</strong> account or create a new account from the login screen.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-semibold hover:bg-stone-800 transition-colors"
            >
              Sign out / Switch account
            </button>
          </div>
        </div>
        {/* Floating AI Chat Widget */}
        <AIChatWidget activeChild={activeChild} />
      </div>
    );
  }


  const dummyParentAccount: ParentAccount = {
    id: 'dummy',
    name: 'Loading...',
    email: '',
    role: 'parent',
    subscriptionTier: 'free',
    children: [],
    createdAt: new Date().toISOString()
  };

  const currentParentAccount = parentAccount || dummyParentAccount;

  return (
    <div className="flex h-screen w-full bg-[#FFFDF8] font-sans text-stone-900 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar (High Density Theme with Global Collapse / Expand) */}
      <div className={`fixed inset-y-0 left-0 z-50 flex flex-col transform transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} ${mobileSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full'}`}>
        <Sidebar pageAccess={pageAccess} isSidebarCollapsed={isSidebarCollapsed} setMobileSidebarOpen={setMobileSidebarOpen} onToggleSidebar={toggleSidebar} onLogout={handleLogout} activePersona={activePersona} activeChildName={activeChild?.name} />
      </div>

      {/* Main Workspace Area (High Density Theme) */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
        {(isBootstrapping || !parentAccount) && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm">
            <Loader2 className="w-10 h-10 animate-spin text-yellow-500 mb-4" />
            <p className="text-sm font-bold text-stone-700">Loading your workspace...</p>
          </div>
        )}

        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-500 ${(isBootstrapping || !parentAccount) ? 'blur-sm pointer-events-none opacity-60' : ''}`}>
          {/* Top Header Bar */}
          <header className="h-14 lg:h-16 bg-gradient-to-r from-yellow-50/90 via-white/90 to-orange-50/90 backdrop-blur-xl border-b border-stone-200/50 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 z-20 sticky top-0">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {/* Mobile-only Sidebar Toggle (hidden on desktop) */}
              <button
                id="mobile-sidebar-toggle"
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-yellow-600 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>


              <h1 className="text-base sm:text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-stone-800 to-stone-500 truncate">
                Welcome, {isParentActive ? (parentAccount?.name || 'Parent') : (activeChild?.name || 'Student')} <span className="text-stone-800">👋</span>
              </h1>
            </div>

            {/* Persona Menu & Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-semibold text-stone-700">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="text-xs text-stone-400 font-medium">
                  {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>

              {/* Notification Bell & Dropdown — only active when children exist */}
              {(parentAccount?.children?.length ?? 0) > 0 ? (
                <div className="relative" ref={notificationMenuRef}>
                  <button
                    onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                    className="relative p-2 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>
                  </button>
                  {showNotificationMenu && (
                    <div className="absolute right-0 mt-2 w-[340px] bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-stone-200/50 p-3 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right flex flex-col gap-2 max-h-[420px] overflow-y-auto custom-scrollbar">
                      {(parentAccount?.children || []).map((child) => {
                        const isKids = ['Class 1', 'Class 2', 'Class 3', 'Class 4'].includes(child.classGrade || '');

                        return (
                          <div key={child.id} className={`p-4 rounded-2xl border ${isKids ? 'bg-sky-50/50 border-sky-100' : 'bg-stone-50 border-stone-100'}`}>
                            <div className="flex items-start gap-4 mb-1">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${isKids ? 'bg-gradient-to-tr from-sky-400 to-indigo-500' : 'bg-gradient-to-tr from-yellow-400 via-amber-500 to-orange-500'}`}>
                                <span className="text-xl">{isKids ? '🎈' : '📊'}</span>
                              </div>
                              <div className="flex flex-col pt-0.5">
                                <span className="text-sm font-black text-stone-900 tracking-tight leading-tight">
                                  {isKids
                                    ? `Ready for a fun adventure with ${child.name?.split(' ')[0] || 'your child'}?`
                                    : `Want a quick feedback on ${child.name?.split(' ')[0] || 'your child'}?`}
                                </span>
                                <span className="text-[10px] font-medium text-stone-500 mt-1 leading-tight">
                                  {isKids
                                    ? <>Play a short game now — earn shiny <span className="text-sky-600 font-semibold">stars</span> instantly.</>
                                    : <>Take a short test now — get an instant <span className="text-yellow-600 font-semibold">report</span>.</>}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 my-3 px-1">
                              {isKids
                                ? ['🎈 Fun Games', '⭐ Stars', '🏆 Badges'].map(tag => (
                                  <span key={tag} className="text-[9px] font-semibold text-stone-500 bg-white rounded-full px-1.5 py-0.5 border border-stone-200/50 whitespace-nowrap">{tag}</span>
                                ))
                                : ['📖 Curriculum', '⚡ Results', '📊 AI analysis'].map(tag => (
                                  <span key={tag} className="text-[9px] font-semibold text-stone-500 bg-white rounded-full px-1.5 py-0.5 border border-stone-200/50 whitespace-nowrap">{tag}</span>
                                ))}
                            </div>

                            <button
                              disabled={isQuickTestLoading}
                              onClick={() => {
                                setShowNotificationMenu(false);
                                if (isKids) {
                                  setActiveChildId(child.id);
                                  setActiveTab('arena');
                                } else {
                                  handleLaunchQuickTest(child.id);
                                }
                              }}
                              className={`group w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 relative overflow-hidden ${isKids ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-[0_4px_10px_-3px_rgba(14,165,233,0.5)]' : 'bg-stone-900 text-yellow-400 hover:bg-stone-800 shadow-[0_4px_10px_-3px_rgba(28,25,23,0.5)]'}`}
                            >
                              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                              {isQuickTestLoading ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span>Loading...</span>
                                </>
                              ) : (
                                <>
                                  {isKids ? 'Start Playing!' : 'Start Quick Test'} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* No children — plain inactive bell */
                <button className="p-2 rounded-full text-stone-400 cursor-default" disabled>
                  <Bell className="w-5 h-5" />
                </button>
              )}

              <div className="relative" ref={personaMenuRef}>
                <button
                  id="header-persona-switcher"
                  onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-50 to-amber-50 border border-yellow-200 shadow-sm flex items-center justify-center text-xl hover:scale-105 transition-transform cursor-pointer"
                  title={isParentActive ? `Parent Account (${parentAccount?.name})` : `Active Student (${activeChild?.name})`}
                >
                  {isParentActive ? '👨‍👩‍👧‍👦' : activeChild?.avatar || '👤'}
                </button>

                {/* Dropdown Menu Modal */}
                {showPersonaMenu && (
                  <div
                    id="persona-dropdown-menu"
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <button
                      onClick={handleSwitchToParent}
                      className={`w-full px-4 py-2.5 border-b border-stone-100 rounded-t-2xl flex items-center justify-between text-left transition-colors hover:bg-stone-50 ${isParentActive ? 'bg-yellow-50/60' : 'bg-stone-50/60'}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-xs shrink-0">
                          {(parentAccount?.name || "P").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-stone-900 truncate">{parentAccount?.name} (Parent)</p>
                          <p className="text-[10px] text-stone-500 truncate">{parentAccount?.email || 'Parent Account'}</p>
                        </div>
                      </div>
                      {isParentActive && <CheckCircle className="w-4 h-4 text-yellow-600 shrink-0" />}
                    </button>

                    <div className="p-1 space-y-0.5">
                      <div className="my-1 px-3 py-1">
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Children Profiles</p>
                      </div>

                      {(parentAccount?.children || []).length === 0 ? (
                        <div className="px-3 py-2 flex flex-col items-center justify-center text-center">
                          <span className="text-stone-300 mb-1">👦👧</span>
                          <p className="text-[10px] text-stone-500 font-medium">No children added yet</p>
                        </div>
                      ) : (parentAccount?.children || []).map((child) => {
                        const isSelected = activePersona === 'child' && activeChildId === child.id;
                        return (
                          <button
                            key={child.id}
                            onClick={() => handleSwitchToChild(child.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${isSelected ? 'bg-yellow-50 text-yellow-900 font-semibold' : 'text-stone-700 hover:bg-stone-100'
                              }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-base">{child.avatar}</span>
                              <div>
                                <div className="font-medium text-stone-900">{child.name}</div>
                                <div className="text-[10px] text-stone-500">
                                  {child.classGrade} • {child.targetBoard} • Avg {child.averageScore}/10
                                </div>
                              </div>
                            </div>
                            {isSelected && <CheckCircle className="w-4 h-4 text-yellow-600 shrink-0" />}
                          </button>
                        );
                      })}

                      <div className="my-1 border-t border-stone-100" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-stone-500 hover:bg-stone-100 hover:text-stone-800 font-medium transition-colors"
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
          <div className="flex-1 overflow-y-auto bg-stone-50 p-4 sm:p-6 lg:p-8">


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
                {activeTab === 'home' && (
                  <LandingPage onOpenAuth={() => { }} />
                )}
                {activeTab === 'dashboard' && parentAccount && (
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
                    examHistory={examHistory}
                    onViewSubmissionReport={(sub) => setActiveSubmissionReport(sub)}
                    onUpdateChild={handleUpdateChild}
                  />
                )}

                {activeTab === 'children' && parentAccount && (
                  <ChildrenPage
                    parentAccount={parentAccount}
                    activeChildId={activeChildId}
                    onChildSelect={setActiveChildId}
                    onNavigateToArena={() => setActiveTab('arena')}
                  />
                )}

                {activeTab === 'reports' && parentAccount && (
                  <ReportsPage
                    examHistory={examHistory}
                    parentAccount={parentAccount}
                    onViewSubmissionReport={(submission) => setActiveSubmissionReport(submission)}
                  />
                )}

                {activeTab === 'arena' && (
                  ['Class 1', 'Class 2', 'Class 3', 'Class 4'].includes(activeChild?.classGrade || '') ? (
                    <KidsExamArena
                      parentAccount={currentParentAccount}
                      activeChildId={activeChildId}
                      activePersona={activePersona}
                      onChildSelect={(cId) => setActiveChildId(cId)}
                      onExamComplete={handleExamComplete}
                      initialExam={preloadedExam}
                      onClearInitialExam={() => setPreloadedExam(null)}
                    />
                  ) : (
                    <ExamArena
                      parentAccount={currentParentAccount}
                      activeChildId={activeChildId}
                      activePersona={activePersona}
                      onChildSelect={(cId) => setActiveChildId(cId)}
                      onExamComplete={handleExamComplete}
                      initialExam={preloadedExam}
                      onClearInitialExam={() => setPreloadedExam(null)}
                    />
                  )
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
                    activePersona={activePersona}
                  />
                )}

                {activeTab === 'ptc' && activeChild && (
                  <ParentTeacherCommunication
                    parentAccount={parentAccount || { id: '', name: '', email: '', role: 'parent', children: [] }}
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

                {activeTab === 'admin' && (
                  <SuperAdminPanel
                    parentAccount={parentAccount || { id: '', name: '', email: '', role: 'parent', children: [] }}
                  />
                )}

                {activeTab === 'blog' && <BlogSection />}
                {activeTab === 'about' && <AboutSection />}
                {activeTab === 'legal' && <LegalSection />}
              </>
            )}
          </div>
        </div>
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
        parentEmail={currentParentAccount?.email}
      />


      {/* Quick Test Child Selector Modal for Multi-Child Parents */}
      {showQuickTestChildModal && parentAccount && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-lg font-black text-stone-900">Select Student</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Pick which student's diagnostic test to launch from database.
                </p>
              </div>
              <button
                onClick={() => setShowQuickTestChildModal(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 my-4">
              {parentAccount.children.map((child) => (
                <button
                  key={child.id}
                  disabled={isQuickTestLoading}
                  onClick={() => handleLaunchQuickTest(child.id)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 hover:border-yellow-400 hover:bg-yellow-50/50 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-2xl border border-stone-200 group-hover:scale-105 transition-transform">
                      {child.avatar || '👦'}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 group-hover:text-yellow-700">{child.name}</h4>
                      <p className="text-xs font-semibold text-stone-500">
                        {child.classGrade} • {child.targetBoard}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-yellow-600 group-hover:underline">Start Test</span>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-yellow-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))}
            </div>

            {isQuickTestLoading && (
              <div className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-yellow-600">
                <Loader2 className="w-4 h-4 animate-spin" /> Fetching diagnostic questions from database...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating AI Chat Widget */}
      <AIChatWidget activeChild={activeChild} />
    </div>
  );
}

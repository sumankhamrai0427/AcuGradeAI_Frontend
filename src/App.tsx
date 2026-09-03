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
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, PageAccess } from './components/Sidebar';
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
    const [me, children] = await Promise.all([ApiServices.getMe(), ApiServices.getChildren()]);

    const overviews = await Promise.all(children.map((c: ChildAccount) => ApiServices.getChildOverview(c.id)));
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
        if (isAdminSession) {
          const perms = await ApiServices.getMenuPermissions();
          setPageAccess(perms);
          if (perms.length > 0 && location.pathname === '/') navigate(perms[0].pageRoute);
        } else if (isTeacherSession) {
          const perms = await ApiServices.getMenuPermissions();
          setPageAccess(perms);
          if (perms.length > 0 && location.pathname === '/') navigate(perms[0].pageRoute);
        } else if (isStudentSession) {
          const perms = await ApiServices.getMenuPermissions();
          setPageAccess(perms);
          if (perms.length > 0 && location.pathname === '/') navigate(perms[0].pageRoute);
        } else if (isParentSession) {
          await loadParentAndChildren();
          const perms = await ApiServices.getMenuPermissions();
          setPageAccess(perms);
          if (perms.length > 0 && location.pathname === '/') navigate(perms[0].pageRoute);
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

  // Subscription Upgrade
  const handleUpgradeTier = async (tier: SubscriptionTier) => {
    await ApiServices.upgradeSubscription({ tier });
    setParentAccount((prev) => (prev ? { ...prev, subscriptionTier: tier } : prev));
    setShowUpgradeModal(false);
  };

  // Daily quota reset (admin/parent action)
  const handleResetDailyQuota = async (childId: string) => {
    await ApiServices.resetQuota(childId);
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
    const created = await ApiServices.addChild({
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
          className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl transform transition-transform duration-500 ease-in-out ${
            authModalMode ? 'translate-x-0' : 'translate-x-full'
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
      </div>
    );
  }


  return (
    <div className="flex h-screen w-full bg-stone-50 font-sans text-stone-900 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar (High Density Theme with Global Collapse / Expand) */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-stone-200 flex flex-col transform transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} ${mobileSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full'}`}>
        <Sidebar pageAccess={pageAccess} isSidebarCollapsed={isSidebarCollapsed} setMobileSidebarOpen={setMobileSidebarOpen} onToggleSidebar={toggleSidebar} onLogout={handleLogout} activePersona={activePersona} activeChildName={activeChild?.name} />
      </div>

      {/* Main Workspace Area (High Density Theme) */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {isBootstrapping || !parentAccount ? (
           <div className="flex-1 flex flex-col items-center justify-center gap-3">
             <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
             <p className="text-sm font-medium text-stone-500">Loading your workspace...</p>
           </div>
        ) : (
          <>
        {/* Top Header Bar */}
        <header className="h-14 lg:h-16 bg-white border-b border-stone-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 z-20">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Mobile-only Sidebar Toggle (hidden on desktop) */}
            <button
              id="mobile-sidebar-toggle"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-stone-600 hover:bg-stone-100"
            >
              <Menu className="w-5 h-5" />
            </button>


            <h1 className="text-base sm:text-lg font-semibold text-stone-800 truncate">
              {getPageTitle()}
            </h1>

            <div className="hidden sm:block h-4 w-[1px] bg-stone-200" />

            {/* Quick Profile Switcher (High Density Pill) */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-stone-500">Active Persona:</span>
              <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg">
                <button
                  onClick={handleSwitchToParent}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${isParentActive ? 'bg-white shadow-2xs text-yellow-700' : 'text-stone-600 hover:text-stone-900'
                    }`}
                >
                  Parent View
                </button>
                {(parentAccount?.children || []).map((child) => (
                  <button
                    key={child.id}
                    onClick={() => handleSwitchToChild(child.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${activePersona === 'child' && activeChildId === child.id
                      ? 'bg-white shadow-2xs text-yellow-700'
                      : 'text-stone-600 hover:text-stone-900'
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
                className="hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 rounded-full border border-yellow-300 text-xs font-bold text-yellow-800 shadow-2xs"
              >
                <Trophy className="w-3.5 h-3.5 text-yellow-600" />
                <span>Family: {totalFamilyXP} XP</span>
                <span className="text-yellow-300">•</span>
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
                className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-full sm:rounded-xl border border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50 transition-all text-xs shadow-2xs group cursor-pointer"
                title={isParentActive ? `Parent Account (${parentAccount?.name})` : `Active Student (${activeChild?.name})`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-50 to-amber-50 border border-yellow-200 flex items-center justify-center text-lg shadow-2xs group-hover:scale-105 transition-transform">
                  {isParentActive ? '👨‍👩‍👧‍👦' : activeChild?.avatar || '👤'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 transition-transform duration-150" />
              </button>

              {/* Dropdown Menu Modal */}
              {showPersonaMenu && (
                <div
                  id="persona-dropdown-menu"
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-4 py-2.5 border-b border-stone-100 bg-stone-50/60 rounded-t-2xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-xs shrink-0">
                        {(parentAccount?.name || "P").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-stone-900 truncate">{parentAccount?.name}</p>
                        <p className="text-[10px] text-stone-400 truncate">{parentAccount?.email || 'Parent Account'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-1 space-y-0.5">
                    <button
                      onClick={handleSwitchToParent}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${isParentActive ? 'bg-yellow-50 text-yellow-900 font-semibold' : 'text-stone-700 hover:bg-stone-100'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">👨‍👩‍👧‍👦</span>
                        <div>
                          <div className="font-medium text-stone-900">Parent Dashboard</div>
                          <div className="text-[10px] text-stone-500">Full family analytics & sub-accounts</div>
                        </div>
                      </div>
                      {isParentActive && <CheckCircle className="w-4 h-4 text-yellow-600" />}
                    </button>

                    <div className="my-1 border-t border-stone-100 px-3 py-1">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Children Profiles</p>
                    </div>

                    {(parentAccount?.children || []).map((child) => {
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
                          {isSelected && <CheckCircle className="w-4 h-4 text-yellow-600" />}
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
                <LandingPage onOpenAuth={() => {}} />
              )}
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
                  activePersona={activePersona}
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
                  activePersona={activePersona}
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
        <footer className="h-10 bg-white border-t border-stone-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 text-[11px] text-stone-400 flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            {activePersona === 'child' ? (
              <>
                <button
                  onClick={() => { setActiveSubmissionReport(null); setActiveTab('arena'); }}
                  className="hover:text-yellow-600 transition-colors font-medium"
                >
                  Exam Arena
                </button>
                <button
                  onClick={() => { setActiveSubmissionReport(null); setActiveTab('learning-path'); }}
                  className="hover:text-stone-700 transition-colors"
                >
                  Adaptive Path
                </button>
                <button
                  onClick={() => { setActiveSubmissionReport(null); setActiveTab('gamification'); }}
                  className="hover:text-stone-700 transition-colors"
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
                  className="hover:text-stone-700 transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { setActiveSubmissionReport(null); setActiveTab('ptc'); }}
                  className="hover:text-stone-700 transition-colors"
                >
                  Parent-Teacher Bridge
                </button>
                <button
                  onClick={() => { setActiveSubmissionReport(null); setActiveTab('blog'); }}
                  className="hover:text-stone-700 transition-colors"
                >
                  Curriculum Blog
                </button>
                <button
                  onClick={() => { setActiveSubmissionReport(null); setActiveTab('pricing'); }}
                  className="hover:text-stone-700 transition-colors"
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
          </>
        )}
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
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-stone-100">
              <h2 className="text-base font-bold text-stone-900">Upgrade Subscription Plan</h2>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-2.5 py-1 rounded-lg border border-stone-200 text-xs font-semibold text-stone-500 hover:text-stone-800"
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

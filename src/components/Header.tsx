import React, { useState } from 'react';
import { 
  GraduationCap, 
  UserCheck, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  BookOpen, 
  CreditCard, 
  FileText, 
  Info, 
  AlertTriangle, 
  Lock,
  ChevronDown,
  CheckCircle,
  Plus
} from 'lucide-react';
import { ParentAccount, ChildAccount, SubscriptionTier } from '../types';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  parentAccount: ParentAccount;
  activeChildId: string | null;
  setActiveChildId: (id: string | null) => void;
  onOpenAddChildModal: () => void;
  onOpenUpgradeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  parentAccount,
  activeChildId,
  setActiveChildId,
  onOpenAddChildModal,
  onOpenUpgradeModal,
}) => {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeChild = parentAccount.children.find((c) => c.id === activeChildId);
  const isParentActive = activeChildId === null;

  const isFreePlan = parentAccount.subscriptionTier === 'free';
  const dailyLimit = isFreePlan ? 1 : 'Unlimited';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            id="brand-logo"
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setCurrentView(isParentActive ? 'parent-dashboard' : 'exam-arena')}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm ring-2 ring-indigo-100">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">AcuGrade<span className="text-indigo-600">.AI</span></span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  RAG K-Graph
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Class 5–12 Adaptive Board Prep (10-Mark Diagnostic)</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            <button
              id="nav-exams-btn"
              onClick={() => setCurrentView('exam-arena')}
              className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                currentView === 'exam-arena'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Exam Arena
            </button>

            <button
              id="nav-learning-path-btn"
              onClick={() => setCurrentView('learning-path')}
              className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'learning-path'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Learning Path</span>
            </button>

            <button
              id="nav-gamification-btn"
              onClick={() => setCurrentView('gamification')}
              className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'gamification'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Leaderboard & Badges</span>
            </button>

            <button
              id="nav-ptc-btn"
              onClick={() => setCurrentView('ptc-hub')}
              className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'ptc-hub'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Parent-Teacher Hub</span>
            </button>

            <button
              id="nav-dashboard-btn"
              onClick={() => setCurrentView('parent-dashboard')}
              className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                currentView === 'parent-dashboard'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Family Hub
            </button>

            <button
              id="nav-plans-btn"
              onClick={() => setCurrentView('subscription-plans')}
              className={`px-2.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                currentView === 'subscription-plans'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Plans
            </button>

            <button
              id="nav-admin-btn"
              onClick={() => setCurrentView('super-admin')}
              className={`px-2 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors flex items-center gap-1 ${
                currentView === 'super-admin'
                  ? 'bg-amber-50 text-amber-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin</span>
            </button>
          </nav>

          {/* Right Action & Persona Switcher */}
          <div className="flex items-center gap-3">
            {/* Subscription Tier Pill */}
            <div 
              onClick={onOpenUpgradeModal}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all border shadow-2xs hover:shadow-xs"
              style={{
                backgroundColor: isFreePlan ? '#F8FAFC' : '#EEF2FF',
                borderColor: isFreePlan ? '#E2E8F0' : '#C7D2FE',
                color: isFreePlan ? '#475569' : '#4338CA'
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {parentAccount.subscriptionTier === 'free' ? 'Free Tier (1 exam/day)' : parentAccount.subscriptionTier === 'scholar_pro' ? 'Scholar Pro' : 'Genius Tier'}
              </span>
            </div>

            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                id="persona-switcher-btn"
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

              {/* Persona Menu */}
              {showPersonaMenu && (
                <div 
                  id="persona-dropdown-modal"
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Switch Persona</p>
                    <p className="text-xs text-slate-700 font-medium mt-0.5">{parentAccount.name}</p>
                  </div>

                  <div className="p-1 space-y-0.5">
                    {/* Parent Account Item */}
                    <button
                      onClick={() => {
                        setActiveChildId(null);
                        setShowPersonaMenu(false);
                        setCurrentView('parent-dashboard');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                        isParentActive ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">👨‍👩‍👧‍👦</span>
                        <div>
                          <div className="font-medium text-slate-900">Parent Dashboard</div>
                          <div className="text-[10px] text-slate-500">Full family analytics & sub-accounts</div>
                        </div>
                      </div>
                      {isParentActive && <CheckCircle className="w-4 h-4 text-indigo-600" />}
                    </button>

                    <div className="my-1 border-t border-slate-100 px-3 py-1">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Children Sub-Accounts</p>
                    </div>

                    {/* Children Items */}
                    {parentAccount.children.map((child) => {
                      const isSelected = activeChildId === child.id;
                      return (
                        <button
                          key={child.id}
                          onClick={() => {
                            setActiveChildId(child.id);
                            setShowPersonaMenu(false);
                            setCurrentView('exam-arena');
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                            isSelected ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{child.avatar}</span>
                            <div>
                              <div className="font-medium text-slate-900">{child.name}</div>
                              <div className="text-[10px] text-slate-500">
                                {child.classGrade} • {child.targetBoard} • Avg {child.averageScore}/10
                              </div>
                            </div>
                          </div>
                          {isSelected ? (
                            <CheckCircle className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 font-mono">
                              PIN: {child.pin}
                            </span>
                          )}
                        </button>
                      );
                    })}

                    {/* Add Child Sub-Account */}
                    <button
                      onClick={() => {
                        setShowPersonaMenu(false);
                        onOpenAddChildModal();
                      }}
                      className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-indigo-600 hover:bg-indigo-50 font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Child Sub-Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              id="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Users className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 space-y-1">
            <button
              onClick={() => {
                setCurrentView('exam-arena');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              10-Mark Exam Arena
            </button>
            <button
              onClick={() => {
                setCurrentView('learning-path');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Adaptive Learning Path
            </button>
            <button
              onClick={() => {
                setCurrentView('gamification');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Leaderboard & Badges
            </button>
            <button
              onClick={() => {
                setCurrentView('ptc-hub');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Parent-Teacher Academic Bridge
            </button>
            <button
              onClick={() => {
                setCurrentView('parent-dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Parent & Child Portal
            </button>
            <button
              onClick={() => {
                setCurrentView('subscription-plans');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Subscriptions & Upgrades
            </button>
            <button
              onClick={() => {
                setCurrentView('blog-section');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Blog & Study Guides
            </button>
            <button
              onClick={() => {
                setCurrentView('about-us');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100"
            >
              About Us & Pedagogy
            </button>
            <button
              onClick={() => {
                setCurrentView('disclaimer');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100"
            >
              Disclaimer
            </button>
            <button
              onClick={() => {
                setCurrentView('policies');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100"
            >
              Privacy & Child Safety Policies
            </button>
            <button
              onClick={() => {
                setCurrentView('super-admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-amber-700 hover:bg-amber-50"
            >
              Super Admin Panel
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

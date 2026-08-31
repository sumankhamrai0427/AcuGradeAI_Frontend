import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  Flame, 
  Zap, 
  Crown, 
  Star, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Filter, 
  Users, 
  Search,
  Shield,
  Clock,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { 
  ChildAccount, 
  Badge, 
  LeaderboardEntry, 
  BadgeCategory, 
  Board, 
  ClassGrade 
} from '../types';

interface GamificationHubProps {
  activeChild: ChildAccount;
  allBadges: Badge[];
  leaderboard: LeaderboardEntry[];
  onSelectStudentToCompare?: (studentId: string) => void;
}

export const GamificationHub: React.FC<GamificationHubProps> = ({
  activeChild,
  allBadges,
  leaderboard,
  onSelectStudentToCompare
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'badges'>('leaderboard');
  const [badgeFilter, setBadgeFilter] = useState<BadgeCategory | 'all'>('all');
  const [boardFilter, setBoardFilter] = useState<Board | 'all'>('all');
  const [gradeFilter, setGradeFilter] = useState<ClassGrade | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Child's current stats
  const childXP = activeChild.xp || 1420;
  const childLevel = activeChild.level || Math.floor(childXP / 250) + 1;
  const nextLevelXP = childLevel * 250;
  const currentLevelBaseXP = (childLevel - 1) * 250;
  const progressToNextLevel = Math.min(100, Math.max(0, Math.round(((childXP - currentLevelBaseXP) / 250) * 100)));

  const earnedBadgeIds = activeChild.earnedBadgeIds || ['badge-pioneer', 'badge-streak-3'];

  // Filter leaderboard
  const filteredLeaderboard = leaderboard.filter((entry) => {
    const matchBoard = boardFilter === 'all' || entry.targetBoard === boardFilter;
    const matchGrade = gradeFilter === 'all' || entry.classGrade === gradeFilter;
    const matchSearch = searchQuery.trim() === '' || 
      entry.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.schoolName && entry.schoolName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchBoard && matchGrade && matchSearch;
  });

  // Filter badges
  const filteredBadges = allBadges.filter((b) => {
    return badgeFilter === 'all' || b.category === badgeFilter;
  });

  const unlockedBadgesCount = allBadges.filter(b => earnedBadgeIds.includes(b.id)).length;

  return (
    <div className="space-y-6">
      {/* Top Gamification Status Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl shrink-0 shadow-2xs">
            {activeChild.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{activeChild.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                Level {childLevel} Scholar
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {activeChild.classGrade} • {activeChild.targetBoard} • {activeChild.schoolName || 'School Student'}
            </p>
          </div>
        </div>

        {/* XP Progress Meter */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 min-w-[280px]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{childXP} AcuPoints (XP)</span>
            </span>
            <span className="text-[11px] text-slate-400 font-semibold">
              Next Level: {nextLevelXP} XP
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-1">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progressToNextLevel}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>Level {childLevel}</span>
            <span>{progressToNextLevel}% completed</span>
            <span>Level {childLevel + 1}</span>
          </div>
        </div>
      </div>

      {/* 4 Gamification Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Daily Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{activeChild.streakDays} Days</p>
          <span className="text-[10px] text-slate-400 font-semibold">+30 XP per active day</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Badges Earned</span>
            <Trophy className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-600">{unlockedBadgesCount} / {allBadges.length}</p>
          <span className="text-[10px] text-indigo-600 font-semibold">Trophies & Milestones</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Average Sprint Score</span>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{activeChild.averageScore}/10</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Across {activeChild.totalExamsTaken} Sprints</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Global Rank</span>
            <Crown className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">Top 5%</p>
          <span className="text-[10px] text-purple-600 font-semibold">In {activeChild.targetBoard} Board</span>
        </div>
      </div>

      {/* Main Tab Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'leaderboard'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Global & Board Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'badges'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Badges & Trophies Showcase ({unlockedBadgesCount}/{allBadges.length})</span>
        </button>
      </div>

      {/* TAB 1: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          {/* Leaderboard Filters */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student or school..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Board */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500">Board:</span>
                <select
                  value={boardFilter}
                  onChange={(e) => setBoardFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800"
                >
                  <option value="all">All Boards</option>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="UK-Cambridge">UK-Cambridge</option>
                  <option value="NEET">NEET</option>
                  <option value="IIT">IIT JEE</option>
                </select>
              </div>

              {/* Grade */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500">Grade:</span>
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800"
                >
                  <option value="all">All Classes</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                </select>
              </div>
            </div>

            <span className="text-xs text-slate-400">
              Showing {filteredLeaderboard.length} candidates
            </span>
          </div>

          {/* Leaderboard Table / Cards */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredLeaderboard.map((entry, index) => {
                const isTop1 = entry.rank === 1;
                const isTop2 = entry.rank === 2;
                const isTop3 = entry.rank === 3;
                const isSelf = entry.isCurrentStudent;

                return (
                  <div
                    key={entry.studentId}
                    className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      isSelf ? 'bg-indigo-50/70 hover:bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Rank & Student Details */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-8 flex items-center justify-center shrink-0">
                        {isTop1 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-bold text-xs flex items-center justify-center shadow-2xs">
                            🥇
                          </span>
                        ) : isTop2 ? (
                          <span className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center shadow-2xs">
                            🥈
                          </span>
                        ) : isTop3 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-700/10 border border-amber-700/30 text-amber-900 font-bold text-xs flex items-center justify-center shadow-2xs">
                            🥉
                          </span>
                        ) : (
                          <span className="font-bold text-xs text-slate-400">
                            #{entry.rank}
                          </span>
                        )}
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl shrink-0">
                        {entry.avatar}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 truncate">{entry.studentName}</span>
                          {isSelf && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-600 text-white">
                              You
                            </span>
                          )}
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {entry.classGrade} • {entry.targetBoard}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {entry.schoolName || 'School Candidate'}
                        </p>
                      </div>
                    </div>

                    {/* Stats & XP Pill */}
                    <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-bold text-slate-800 block">{entry.averageScore}/10 Avg</span>
                        <span className="text-[10px] text-slate-400 font-medium">{entry.examsCompleted} sprints • {entry.streakDays}d streak</span>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-right shadow-2xs">
                        <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          {entry.xp} XP
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 block">Lvl {entry.level}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* XP & Rewards Calculation Guide */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>How to Earn AcuPoints (XP) & Climb the Ranks</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">🎯 Correct Answers</span>
                <p className="text-slate-500">+10 XP for every question answered correctly in 10-mark sprints.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">🏆 Perfect 10/10 Bonus</span>
                <p className="text-slate-500">+50 XP bonus for scoring full marks with zero misconception slips.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">🔥 Daily Streak Power</span>
                <p className="text-slate-500">+30 XP daily multiplier for consecutive diagnostic test days.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">⏱️ Velocity Sprint</span>
                <p className="text-slate-500">+25 XP speed bonus for finishing accurate sprints in &lt;6 mins.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BADGES & TROPHIES */}
      {activeTab === 'badges' && (
        <div className="space-y-4">
          {/* Badge Category Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', 'mastery', 'streak', 'score', 'speed', 'explorer'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setBadgeFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  badgeFilter === cat
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat === 'all' ? 'All Trophies' : cat}
              </button>
            ))}
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map((badge) => {
              const isUnlocked = earnedBadgeIds.includes(badge.id);

              let tierStyle = {
                badge: 'bg-amber-100 text-amber-800 border-amber-200',
                card: 'border-slate-200'
              };

              if (badge.tier === 'silver') {
                tierStyle = {
                  badge: 'bg-slate-100 text-slate-800 border-slate-300',
                  card: 'border-slate-200'
                };
              } else if (badge.tier === 'gold') {
                tierStyle = {
                  badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                  card: 'border-amber-200 ring-1 ring-amber-100'
                };
              } else if (badge.tier === 'diamond') {
                tierStyle = {
                  badge: 'bg-cyan-100 text-cyan-800 border-cyan-300',
                  card: 'border-cyan-200 ring-1 ring-cyan-100'
                };
              }

              return (
                <div
                  key={badge.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                    isUnlocked
                      ? tierStyle.card
                      : 'border-dashed border-slate-300 bg-slate-50/40 opacity-75'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shadow-2xs ${
                        isUnlocked ? 'bg-white border-slate-200' : 'bg-slate-100 border-slate-200 grayscale'
                      }`}>
                        {badge.icon}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${tierStyle.badge}`}>
                          {badge.tier}
                        </span>
                        {isUnlocked ? (
                          <span className="p-1 bg-emerald-100 text-emerald-700 rounded-full" title="Unlocked">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="p-1 bg-slate-200 text-slate-500 rounded-full" title="Locked">
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 mb-1">{badge.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">{badge.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">
                      {isUnlocked && badge.unlockedAt ? `Unlocked on ${new Date(badge.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : badge.requirementText}
                    </span>

                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 shrink-0">
                      +{badge.xpReward} XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

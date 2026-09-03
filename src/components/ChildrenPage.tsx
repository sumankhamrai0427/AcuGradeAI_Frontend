import React, { useMemo } from 'react';
import { ParentAccount, ChildAccount } from '../types';
import { Trophy, TrendingUp, Award, Flame, Target, BookOpen, BrainCircuit } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ChildrenPageProps {
  parentAccount: ParentAccount;
  activeChildId: string | null;
  onChildSelect: (childId: string) => void;
  onNavigateToArena: () => void;
}

export const ChildrenPage: React.FC<ChildrenPageProps> = ({
  parentAccount,
  activeChildId,
  onChildSelect,
  onNavigateToArena
}) => {
  const activeChild = useMemo(() => {
    return parentAccount.children.find((c) => c.id === activeChildId) || parentAccount.children[0];
  }, [parentAccount.children, activeChildId]);

  if (!activeChild) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-stone-500 font-medium">No children profiles found.</p>
      </div>
    );
  }

  const topicMasteryEntries = Object.entries(activeChild.topicMastery || {}).sort((a, b) => Number(b[1]) - Number(a[1]));
  const strongestTopics = topicMasteryEntries.slice(0, 3);
  const weakestTopics = topicMasteryEntries.slice(-3).reverse();

  // Mock progression data for the chart based on average score
  const chartData = Array.from({ length: 7 }).map((_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
    score: Math.max(0, Math.min(100, Math.round((activeChild.averageScore * 10) + (Math.random() * 10 - 5) - ((6 - i) * 2))))
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 fade-in">
      {/* Header & Child Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Child Progress</h1>
          <p className="text-sm font-medium text-stone-500 mt-1">Detailed performance and mastery analytics.</p>
        </div>
        <div className="flex gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 overflow-x-auto hide-scrollbar">
          {parentAccount.children.map(child => (
            <button
              key={child.id}
              onClick={() => onChildSelect(child.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeChild.id === child.id 
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200' 
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
              }`}
            >
              <span className="text-lg">{child.avatar}</span>
              {child.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stats Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Stat Card */}
          <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            
            <div className="w-32 h-32 bg-gradient-to-br from-stone-50 to-stone-100 rounded-3xl border-2 border-stone-200 flex items-center justify-center text-7xl shadow-sm shrink-0 relative z-10">
              {activeChild.avatar}
              <div className="absolute -bottom-3 -right-3 bg-white border border-stone-200 rounded-xl p-1.5 shadow-sm">
                <span className="text-xs font-black text-stone-800 bg-stone-100 px-2 py-0.5 rounded-lg border border-stone-200">LVL {activeChild.level}</span>
              </div>
            </div>

            <div className="flex-1 relative z-10 text-center md:text-left">
              <h2 className="text-3xl font-black text-stone-900 tracking-tight mb-2">{activeChild.name}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                <span className="px-3 py-1 bg-stone-100 text-stone-700 text-xs font-bold rounded-lg border border-stone-200">
                  {activeChild.classGrade}
                </span>
                <span className="px-3 py-1 bg-stone-100 text-stone-700 text-xs font-bold rounded-lg border border-stone-200">
                  {activeChild.targetBoard}
                </span>
                <span className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg border border-rose-100 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> 6 Day Streak
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">Total XP</p>
                  <p className="text-xl font-black text-stone-900 flex items-center gap-1 justify-center md:justify-start">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    {activeChild.xp.toLocaleString()}
                  </p>
                </div>
                <div className="border-l border-stone-100 pl-4">
                  <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">Avg Score</p>
                  <p className="text-xl font-black text-stone-900">{Math.round(activeChild.averageScore * 10)}%</p>
                </div>
                <div className="border-l border-stone-100 pl-4">
                  <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">Readiness</p>
                  <p className="text-xl font-black text-stone-900">{Math.max(0, Math.round((activeChild.averageScore * 10) - 4))}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Performance Trend</h3>
                <p className="text-xs text-stone-500 font-medium mt-1">Accuracy over the last 7 days</p>
              </div>
              <TrendingUp className="w-5 h-5 text-stone-400" />
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#78716c', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#78716c', fontWeight: 600 }} dx={-10} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#1c1917' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Topic Mastery */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-6">
              <BrainCircuit className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-stone-900">Topic Mastery</h3>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-3">Strongest Areas</p>
                <div className="space-y-3">
                  {strongestTopics.length > 0 ? strongestTopics.map(([topic, level], idx) => (
                    <div key={idx} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-stone-700 truncate">{topic}</span>
                        <span className="font-black text-emerald-600">Lvl {level}</span>
                      </div>
                      <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (Number(level) / 5) * 100)}%` }}></div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-xs text-stone-500">No data available yet.</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-3">Needs Attention</p>
                <div className="space-y-3">
                  {weakestTopics.length > 0 ? weakestTopics.map(([topic, level], idx) => (
                    <div key={idx} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-stone-700 truncate">{topic}</span>
                        <span className="font-black text-rose-500">Lvl {level}</span>
                      </div>
                      <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-400 rounded-full" style={{ width: `${Math.min(100, (Number(level) / 5) * 100)}%` }}></div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-xs text-stone-500">No data available yet.</p>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={onNavigateToArena}
              className="w-full mt-6 py-3 bg-stone-900 hover:bg-stone-800 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4" /> Improve Weak Areas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

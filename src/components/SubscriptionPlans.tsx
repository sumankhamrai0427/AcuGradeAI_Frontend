import React, { useState } from 'react';
import { SUBSCRIPTION_PLANS } from '../data/initialData';
import { SubscriptionTier, ParentAccount } from '../types';
import { 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  HelpCircle, 
  Award, 
  Lock,
  CheckCircle2
} from 'lucide-react';

interface SubscriptionPlansProps {
  parentAccount: ParentAccount;
  onUpgradeTier: (tier: SubscriptionTier) => void;
  onClose?: () => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  parentAccount,
  onUpgradeTier,
  onClose,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedPlanSuccess, setSelectedPlanSuccess] = useState<string | null>(null);

  const handleSelectPlan = (tier: SubscriptionTier) => {
    if (tier === parentAccount.subscriptionTier) return;
    setIsUpgrading(true);
    setTimeout(() => {
      onUpgradeTier(tier);
      setIsUpgrading(false);
      setSelectedPlanSuccess(`Successfully activated the ${tier.replace('_', ' ').toUpperCase()} Plan!`);
      setTimeout(() => setSelectedPlanSuccess(null), 3000);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Transparent & Student-Friendly Pricing
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Supercharge Your Child’s Learning Evolutionary Progress
        </h1>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
          From daily 1-exam revision on our Free Tier to unlimited high-order HOTS Olympiad, NEET, and IIT JEE RAG diagnostics.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <span className={`text-xs sm:text-sm font-semibold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>
            Monthly Billing
          </span>
          <button
            id="billing-cycle-toggle-btn"
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-14 h-7 bg-slate-900 rounded-full p-1 transition-colors flex items-center"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                billingCycle === 'yearly' ? 'transform translate-x-7 bg-emerald-400' : ''
              }`}
            />
          </button>
          <span className={`text-xs sm:text-sm font-semibold flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>
            <span>Annual Billing</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {selectedPlanSuccess && (
        <div className="max-w-md mx-auto mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{selectedPlanSuccess}</span>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrent = parentAccount.subscriptionTier === plan.id;
          const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;

          return (
            <div
              key={plan.id}
              id={`plan-card-${plan.id}`}
              className={`bg-white rounded-3xl border transition-all p-8 flex flex-col justify-between relative ${
                plan.isPopular
                  ? 'border-indigo-600 ring-2 ring-indigo-200 shadow-xl lg:-translate-y-2'
                  : 'border-slate-200 shadow-sm hover:border-slate-300'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-bold bg-indigo-600 text-white shadow-sm whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  {isCurrent && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Active Plan
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 min-h-[36px] mb-6 leading-relaxed">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-100">
                  <span className="text-4xl font-extrabold text-slate-900">
                    ${price}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                  {plan.priceMonthly === 0 && (
                    <span className="text-xs text-slate-400 font-normal ml-2">Always 100% Free</span>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Included Features:
                  </span>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-snug">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                        ✓
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Action Button */}
              <div>
                <button
                  id={`select-plan-btn-${plan.id}`}
                  disabled={isCurrent || isUpgrading}
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-xs ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : plan.isPopular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isCurrent ? 'Current Active Tier' : isUpgrading ? 'Processing Setup...' : `Switch to ${plan.name}`}
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                  {plan.id === 'free' ? 'No credit card required' : 'Cancel or change anytime with 1-click'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-8">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          Subscription Model Capabilities Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="pb-3 pr-4">Platform Feature</th>
                <th className="pb-3 px-4 text-center">Foundation Free</th>
                <th className="pb-3 px-4 text-center text-indigo-700">Scholar Pro</th>
                <th className="pb-3 pl-4 text-center text-slate-900">Genius Competitive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              <tr>
                <td className="py-3 pr-4 font-semibold">Daily Diagnostic Exams</td>
                <td className="py-3 px-4 text-center font-bold text-amber-700">1 Exam / Day / Child</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-700">Unlimited</td>
                <td className="py-3 pl-4 text-center font-bold text-emerald-700">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold">Child Sub-Accounts Allowed</td>
                <td className="py-3 px-4 text-center">Up to 2 Sub-Accounts</td>
                <td className="py-3 px-4 text-center">Up to 5 Sub-Accounts</td>
                <td className="py-3 pl-4 text-center font-bold">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold">Boards (CBSE, ICSE, ISC, Cambridge, NCERT, NEET, IIT)</td>
                <td className="py-3 px-4 text-center">✓ All 8 Boards</td>
                <td className="py-3 px-4 text-center">✓ All 8 Boards</td>
                <td className="py-3 pl-4 text-center">✓ All 8 Boards</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold">Detailed AI Misconception Diagnosis</td>
                <td className="py-3 px-4 text-center text-slate-400">Basic Answer Key</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-700">✓ Step-by-Step AI</td>
                <td className="py-3 pl-4 text-center font-bold text-emerald-700">✓ Priority Gemini 3.7</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold">Evolutionary K-Graph Mastery Tracker</td>
                <td className="py-3 px-4 text-center text-slate-400">Limited</td>
                <td className="py-3 px-4 text-center font-bold text-indigo-700">✓ Full Topic Radar</td>
                <td className="py-3 pl-4 text-center font-bold text-indigo-700">✓ Full Topic Radar</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold">Custom Runbook Blueprint Mode</td>
                <td className="py-3 px-4 text-center text-slate-400">—</td>
                <td className="py-3 px-4 text-center text-slate-400">—</td>
                <td className="py-3 pl-4 text-center font-bold text-emerald-700">✓ Included</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

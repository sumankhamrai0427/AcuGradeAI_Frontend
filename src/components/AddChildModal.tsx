import React, { useState } from 'react';
import { ChildAccount, Board, ClassGrade } from '../types';
import { Plus, X, User } from 'lucide-react';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChild: (childData: Omit<ChildAccount, 'id' | 'totalExamsTaken' | 'averageScore' | 'streakDays' | 'dailyExamsTakenToday' | 'topicMastery'>) => void;
}

const BOARDS: Board[] = ['CBSE', 'ICSE', 'ISC', 'UK-Cambridge', 'NCERT', 'NEET', 'IIT'];
const GRADES: ClassGrade[] = [
  'Class 5', 'Class 6', 'Class 7', 'Class 8', 
  'Class 9', 'Class 10', 'Class 11', 'Class 12'
];
const AVATARS = ['👦', '👧', '🧑‍🎓', '🚀', '🌟', '📚', '⚡', '🎯'];

export const AddChildModal: React.FC<AddChildModalProps> = ({
  isOpen,
  onClose,
  onAddChild,
}) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('👦');
  const [classGrade, setClassGrade] = useState<ClassGrade>('Class 8');
  const [targetBoard, setTargetBoard] = useState<Board>('CBSE');
  const [schoolName, setSchoolName] = useState('');
  const [pin, setPin] = useState('1234');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddChild({
      name: name.trim(),
      avatar,
      classGrade,
      targetBoard,
      schoolName: schoolName.trim() || undefined,
      pin: pin.trim() || '1234'
    });

    // Reset & close
    setName('');
    setSchoolName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
          <div>
            <h3 className="text-lg font-bold text-stone-900">Create Child Sub-Account</h3>
            <p className="text-xs text-stone-500">Each child gets their own login PIN, board profile, and diagnostic tracker</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-stone-200 text-stone-400 hover:text-stone-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">Select Avatar</label>
            <div className="flex items-center gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  className={`w-10 h-10 rounded-xl border text-xl flex items-center justify-center transition-all ${
                    avatar === a ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-200' : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Child / Student Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav Sharma or Sara Jenkins"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Class / Grade</label>
              <select
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value as ClassGrade)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Target Curriculum Board</label>
              <select
                value={targetBoard}
                onChange={(e) => setTargetBoard(e.target.value as Board)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
              >
                {BOARDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">School Name (Optional)</label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g. Delhi Public School or St. Xavier's"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Child Login PIN (4 Digits)
            </label>
            <input
              type="text"
              maxLength={4}
              required
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="1234"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-sm tracking-widest focus:ring-2 focus:ring-yellow-500 focus:outline-hidden"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Your child can use this simple PIN to log into their student arena directly.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-yellow-400 text-stone-900 text-xs font-semibold hover:bg-yellow-700 shadow-xs"
            >
              Create Child Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

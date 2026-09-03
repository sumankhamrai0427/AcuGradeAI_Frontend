import React, { useState } from 'react';
import { ChildAccount, Board, ClassGrade } from '../types';
import { Plus, X, User } from 'lucide-react';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChild: (childData: Omit<ChildAccount, 'id' | 'totalExamsTaken' | 'averageScore' | 'streakDays' | 'dailyExamsTakenToday' | 'topicMastery'>) => void;
  parentEmail?: string;
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
  parentEmail,
}) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('👦');
  const [classGrade, setClassGrade] = useState<ClassGrade>('Class 8');
  const [targetBoard, setTargetBoard] = useState<Board>('CBSE');
  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState(parentEmail || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update email if parentEmail prop changes when modal opens
  React.useEffect(() => {
    if (isOpen && parentEmail && !email) {
      setEmail(parentEmail);
    }
  }, [isOpen, parentEmail]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!password) newErrors.password = "Password is required";
    if (!confirmPassword) newErrors.confirmPassword = "Confirm password is required";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    onAddChild({
      name: name.trim(),
      avatar,
      classGrade,
      targetBoard,
      schoolName: schoolName.trim() || undefined,
      email: email.trim() || undefined,
      pin: password.trim() // storing password in the pin field for now
    });

    // Reset & close
    setName('');
    setSchoolName('');
    setEmail(parentEmail || '');
    setPassword('');
    setConfirmPassword('');
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

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>


          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Child / Student Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              placeholder="e.g. Aarav Sharma or Sara Jenkins"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 ${errors.name ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-stone-300 focus:ring-yellow-500'}`}
            />
            {errors.name && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Target Curriculum Board <span className="text-red-500">*</span>
              </label>
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

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Class / Grade <span className="text-red-500">*</span>
              </label>
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
              Account Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              placeholder="e.g. parent@example.com"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 ${errors.email ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-stone-300 focus:ring-yellow-500'}`}
            />
            {errors.email ? (
              <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.email}</p>
            ) : (
              <p className="text-[10px] text-stone-400 mt-1 font-medium">Default is parent's email. You can change this if needed.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Create Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                placeholder="••••••••"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 ${errors.password ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-stone-300 focus:ring-yellow-500'}`}
              />
              {errors.password && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                }}
                placeholder="••••••••"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 ${errors.confirmPassword ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-stone-300 focus:ring-yellow-500'}`}
              />
              {errors.confirmPassword && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border-2 border-yellow-400 text-xs font-bold text-stone-700 hover:bg-yellow-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-yellow-400 border-2 border-yellow-500 text-stone-900 text-xs font-bold hover:bg-yellow-500 shadow-xs transition-colors"
            >
              Create Child Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

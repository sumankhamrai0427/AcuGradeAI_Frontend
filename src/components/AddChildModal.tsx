import React, { useState, useEffect } from 'react';
import { ChildAccount } from '../types';
import ApiServices from '../services/ApiServices';
import { Plus, X, User, Loader2 } from 'lucide-react';

interface MasterOption {
  id: number;
  name: string;
  description?: string;
}

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChild: (childData: {
    name: string;
    avatar?: string;
    classGrade: string;
    targetBoard: string;
    schoolName?: string;
    email?: string;
    password?: string;
    pin?: string;
  }) => void | Promise<void>;
  parentEmail?: string;
}

const AVATARS = ['👦', '👧', '🧑‍🎓', '🚀', '🌟', '📚', '⚡', '🎯'];

export const AddChildModal: React.FC<AddChildModalProps> = ({
  isOpen,
  onClose,
  onAddChild,
  parentEmail,
}) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('👦');
  const [classGrade, setClassGrade] = useState<string>('');
  const [targetBoard, setTargetBoard] = useState<string>('');
  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState(parentEmail || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [boards, setBoards] = useState<MasterOption[]>([]);
  const [classes, setClasses] = useState<MasterOption[]>([]);
  const [isLoadingMasters, setIsLoadingMasters] = useState(false);

  // Fetch Master Data directly from Database on Modal Open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingMasters(true);

    ApiServices.getChildRegistrationOptions()
      .then((res: any) => {
        if (!isMounted) return;
        const fetchedBoards: MasterOption[] = res?.boards || res?.data?.boards || [];
        const fetchedClasses: MasterOption[] = res?.classes || res?.data?.classes || [];

        setBoards(fetchedBoards);
        if (fetchedBoards.length > 0) {
          setTargetBoard((prev) => {
            const exists = fetchedBoards.some((b) => b.name === prev);
            return exists && prev ? prev : fetchedBoards[0].name;
          });
        } else {
          setTargetBoard('');
        }

        setClasses(fetchedClasses);
        if (fetchedClasses.length > 0) {
          setClassGrade((prev) => {
            const exists = fetchedClasses.some((c) => c.name === prev);
            return exists && prev ? prev : fetchedClasses[0].name;
          });
        } else {
          setClassGrade('');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch master data from database:', err);
        if (isMounted) {
          setBoards([]);
          setClasses([]);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingMasters(false);
      });
  }, [isOpen]);

  // Update email if parentEmail prop changes when modal opens
  useEffect(() => {
    if (isOpen && parentEmail && !email) {
      setEmail(parentEmail);
    }
  }, [isOpen, parentEmail]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!targetBoard) newErrors.targetBoard = "Curriculum board is required";
    if (!classGrade) newErrors.classGrade = "Class/grade is required";
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
      password: password.trim(),
      pin: password.trim()
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
                onChange={(e) => {
                  setTargetBoard(e.target.value);
                  if (errors.targetBoard) setErrors({ ...errors, targetBoard: '' });
                }}
                disabled={isLoadingMasters || boards.length === 0}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-yellow-500 focus:outline-hidden bg-white ${errors.targetBoard ? 'border-red-500 bg-red-50' : 'border-stone-300'}`}
              >
                {boards.length === 0 ? (
                  <option value="">{isLoadingMasters ? 'Loading boards...' : 'No boards in database'}</option>
                ) : (
                  boards.map((b) => (
                    <option key={b.id || b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))
                )}
              </select>
              {errors.targetBoard && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.targetBoard}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Class / Grade <span className="text-red-500">*</span>
              </label>
              <select
                value={classGrade}
                onChange={(e) => {
                  setClassGrade(e.target.value);
                  if (errors.classGrade) setErrors({ ...errors, classGrade: '' });
                }}
                disabled={isLoadingMasters || classes.length === 0}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-yellow-500 focus:outline-hidden bg-white ${errors.classGrade ? 'border-red-500 bg-red-50' : 'border-stone-300'}`}
              >
                {classes.length === 0 ? (
                  <option value="">{isLoadingMasters ? 'Loading classes...' : 'No classes in database'}</option>
                ) : (
                  classes.map((g) => (
                    <option key={g.id || g.name} value={g.name}>
                      {g.name}
                    </option>
                  ))
                )}
              </select>
              {errors.classGrade && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.classGrade}</p>}
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

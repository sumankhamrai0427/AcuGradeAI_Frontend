import React, { useState, useEffect } from 'react';
import { ChildAccount } from '../types';
import ApiServices from '../services/ApiServices';
import { Plus, User, Loader2, ChevronDown, Search } from 'lucide-react';

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

interface SearchableSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  hasError?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder, disabled, hasError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selectedOption = options.find(o => o.value === value);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3 py-2.5 rounded-xl border text-sm flex justify-between items-center cursor-pointer ${disabled ? 'opacity-60 cursor-not-allowed bg-stone-50' : 'bg-white'} ${hasError ? 'border-red-500 bg-red-50' : 'border-stone-300'}`}
      >
        <span className={selectedOption ? 'text-stone-900' : 'text-stone-500'}>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-xl max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-stone-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-stone-400" />
              <input 
                type="text" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search..." 
                className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-yellow-400"
                autoFocus
                onClick={e => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="overflow-y-auto custom-scrollbar flex-1 p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-xs text-stone-500 text-center">No results found</div>
            ) : (
              filteredOptions.map(opt => (
                <div 
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setIsOpen(false); setSearch(''); }}
                  className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${value === opt.value ? 'bg-yellow-50 text-yellow-900 font-medium' : 'hover:bg-stone-50 text-stone-700'}`}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            return exists && prev ? prev : '';
          });
        } else {
          setTargetBoard('');
        }

        setClasses(fetchedClasses);
        if (fetchedClasses.length > 0) {
          setClassGrade((prev) => {
            const exists = fetchedClasses.some((c) => c.name === prev);
            return exists && prev ? prev : '';
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

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);
    try {
      await onAddChild({
        name: name.trim(),
        avatar,
        classGrade,
        targetBoard,
        schoolName: schoolName.trim() || undefined,
        email: email.trim() || undefined,
        password: password.trim(),
        pin: password.trim()
      });

      // Reset & close only on success
      setName('');
      setSchoolName('');
      setEmail(parentEmail || '');
      setPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err) {
      console.error('Failed to add child:', err);
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
          <div>
            <h3 className="text-lg font-bold text-stone-900">Create Child Sub-Account</h3>
            <p className="text-xs text-stone-500">Each child gets their own login password, board profile, and diagnostic tracker</p>
          </div>
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
              <SearchableSelect
                value={targetBoard}
                onChange={(value) => {
                  setTargetBoard(value);
                  if (errors.targetBoard) setErrors({ ...errors, targetBoard: '' });
                }}
                placeholder="Please Select"
                disabled={isLoadingMasters || boards.length === 0}
                options={boards.map(b => ({ value: b.name, label: b.name }))}
                hasError={!!errors.targetBoard}
              />
              {errors.targetBoard && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.targetBoard}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Class / Grade <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                value={classGrade}
                onChange={(value) => {
                  setClassGrade(value);
                  if (errors.classGrade) setErrors({ ...errors, classGrade: '' });
                }}
                placeholder="Please Select"
                disabled={isLoadingMasters || classes.length === 0}
                options={classes.map(g => ({ value: g.name, label: g.name }))}
                hasError={!!errors.classGrade}
              />
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
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border-2 border-yellow-400 text-xs font-bold text-stone-700 hover:bg-yellow-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-yellow-400 border-2 border-yellow-500 text-stone-900 text-xs font-bold hover:bg-yellow-500 shadow-xs transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                'Create Child Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

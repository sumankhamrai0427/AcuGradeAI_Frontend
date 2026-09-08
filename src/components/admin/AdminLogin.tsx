import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Menu,
  X,
  Bell,
  TrendingUp,
  UserCheck,
  BookMarked,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Settings,
  Activity,
  GraduationCap,
  CheckCircle2,
  Play,
  Bot,
  FileText,
  Trophy,
  Search,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import ApiServices, {
  storeTokens,
  decodeTokenPayload,
  clearTokens,
  getStoredTokens,
} from '../../services/ApiServices';
import { BASE_URL } from '../../connection';
import { BOARD_CLASSES_MAP, CLASS_SUBJECTS_MAP } from '../../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import 'jodit/es2021/jodit.min.css';
import { lazy, Suspense } from 'react';

const JoditEditor = lazy(() => import('jodit-react'));

const BLOG_EDITOR_CONFIG = {
  readonly: false,
  enter: 'p',
  toolbarAdaptive: false,
  toolbarSticky: false,
  showCharsCounter: false,
  showWordsCounter: false,
  showXPathInStatusbar: false,
  cleanHTML: {
    safeJavaScriptLink: true,
    safeLinksTarget: true,
  },
  link: {
    followOnDblClick: true,
    openInNewTabCheckbox: true,
    openInNewTabCheckboxDefaultChecked: true,
    noFollowCheckbox: true,
    processVideoLink: false,
  },
  buttons: 'bold,italic,underline,|,paragraph,|,ul,ol,|,align,|,link,|,undo,redo,|,source',
  buttonsXS: 'bold,italic,underline,|,paragraph,|,ul,ol,|,align,|,link,|,undo,redo',
};

const INTRODUCTION_EDITOR_CONFIG = {
  ...BLOG_EDITOR_CONFIG,
  height: 240,
  placeholder: 'Write the introduction...',
};

const BLOG_CONTENT_EDITOR_CONFIG = {
  ...BLOG_EDITOR_CONFIG,
  height: 320,
  placeholder: 'Write the blog content here...',
};

const BlogEditPage: React.FC<{ blogId: string; onBack: () => void; onSaved: () => void }> = ({ blogId, onBack, onSaved }) => {
  const [blog, setBlog] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ApiServices.listBlogs({ status: 'all' })
      .then((response: any) => {
        const records = Array.isArray(response) ? response : response?.items || response?.data || [];
        setBlog(records.find((item: any) => String(item.id) === String(blogId)) || null);
      })
      .catch((err: any) => setError(err?.message || 'Failed to load blog'))
      .finally(() => setLoading(false));
  }, [blogId]);

  if (loading) return <div className="py-24 text-center text-stone-500">Loading blog editor...</div>;
  if (!blog) return <div className="py-24 text-center text-rose-600">{error || 'Blog not found'}</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="p-2 hover:bg-stone-100 rounded-xl text-stone-500 cursor-pointer">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-stone-900">Jodit Editor</h1>
          <p className="text-sm text-stone-500">Edit blog heading, introduction and content.</p>
        </div>
      </div>
      <BlogFormModal
        isOpen
        fullPage
        initialBlog={blog}
        onClose={onBack}
        onSuccess={() => { onSaved(); onBack(); }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type AdminView = string;

// ─────────────────────────────────────────────────────────────
// Stat Card Component
// ─────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  positive?: boolean;
  accent?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, change, positive = true, accent = 'bg-amber-400' }) => (
  <div className="admin-card group hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl ${accent} flex items-center justify-center shadow-lg`}>
        {icon}
      </div>
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
        {change}
      </span>
    </div>
    <p className="text-3xl font-black text-stone-900 tracking-tight">{value}</p>
    <p className="text-sm text-stone-500 font-medium mt-1">{label}</p>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Sidebar Nav Item
// ─────────────────────────────────────────────────────────────
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
  id: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, collapsed, onClick, id }) => (
  <button
    id={id}
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`group w-full flex items-center py-2.5 rounded-xl text-sm transition-all relative overflow-hidden
      ${collapsed ? 'justify-center px-0 gap-3' : 'gap-3 px-3'}
      ${active
        ? 'text-yellow-700 font-bold bg-gradient-to-r from-yellow-50 to-white shadow-sm border border-yellow-100/50'
        : 'text-stone-500 font-medium hover:text-stone-900 hover:bg-stone-50 border border-transparent'
      }
    `}
  >
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-yellow-400 rounded-r-full"></div>}
    <div className={`w-4 h-4 flex-shrink-0 transition-colors relative z-10 ${active ? 'text-yellow-600' : 'text-stone-400 group-hover:text-stone-500'}`}>
      {icon}
    </div>
    {!collapsed && <span className="truncate relative z-10">{label}</span>}
  </button>
);

// ─────────────────────────────────────────────────────────────
// Shared full-page blog editor component
// ─────────────────────────────────────────────────────────────
interface BlogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBlog?: any | null;
  onSuccess: () => void;
  fullPage?: boolean;
}

const BlogFormModal: React.FC<BlogFormModalProps> = ({ isOpen, onClose, initialBlog, onSuccess, fullPage = false }) => {
  const [title, setTitle] = useState('');
  const [heading, setHeading] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [content, setContent] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [author, setAuthor] = useState('Admin User');
  const [category, setCategory] = useState('Education');
  const [status, setStatus] = useState<'Published' | 'Draft'>('Published');
  const [blogDate, setBlogDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<string[]>([
    'Education',
    'Technology',
    'Engineering',
    'Parenting',
    'Platform News',
  ]);
  const [authors, setAuthors] = useState<string[]>([
    'Admin User',
    'Sonia Khatun',
    'Tech Team',
  ]);

  useEffect(() => {
    if (!isOpen) return;
    ApiServices.listBlogCategories()
      .then((res: any) => {
        const catList = Array.isArray(res) ? res : res?.data || [];
        if (Array.isArray(catList) && catList.length > 0) {
          const names = catList.map((c: any) => c.name);
          setCategories(prev => Array.from(new Set([...names, ...prev])));
        }
      })
      .catch(() => {});

    ApiServices.listBlogAuthors()
      .then((res: any) => {
        const authList = Array.isArray(res) ? res : res?.data || [];
        if (Array.isArray(authList) && authList.length > 0) {
          const names = authList.map((a: any) => a.name);
          setAuthors(prev => Array.from(new Set([...names, ...prev])));
        }
      })
      .catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    if (initialBlog) {
      setTitle(initialBlog.title || '');
      setHeading(initialBlog.heading || initialBlog.title || '');
      setIntroduction(initialBlog.introduction || '');
      setContent(initialBlog.content || '');
      setSubcategory(initialBlog.subcategory || '');
      setCoverImage(initialBlog.imageUrl || initialBlog.image_url || '');
      setTags(Array.isArray(initialBlog.tags) ? initialBlog.tags.join(', ') : (initialBlog.tags || ''));
      setMetaTitle(initialBlog.metaTitle || initialBlog.meta_title || '');
      setMetaDescription(initialBlog.metaDescription || initialBlog.meta_description || '');
      setMetaKeywords(initialBlog.metaKeywords || initialBlog.meta_keywords || '');
      setCanonicalUrl(initialBlog.canonicalUrl || initialBlog.canonical_url || '');
      setIsPinned(Boolean(initialBlog.isPinned ?? initialBlog.is_pinned));
      setAuthor(initialBlog.author || 'Admin User');
      setCategory(initialBlog.category || 'Education');
      setStatus(initialBlog.status === 'Draft' ? 'Draft' : 'Published');
      setBlogDate(
        initialBlog.isoDate
          ? initialBlog.isoDate.slice(0, 10)
          : new Date().toISOString().slice(0, 10)
      );
    } else {
      setTitle('');
      setHeading('');
      setIntroduction('');
      setContent('');
      setSubcategory('');
      setCoverImage('');
      setTags('');
      setMetaTitle('');
      setMetaDescription('');
      setMetaKeywords('');
      setCanonicalUrl('');
      setIsPinned(false);
      setAuthor('Admin User');
      setCategory('Education');
      setStatus('Published');
      setBlogDate(new Date().toISOString().slice(0, 10));
    }
    setError(null);
  }, [initialBlog, isOpen]);

  if (!isOpen) return null;

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const result = await ApiServices.uploadBlogImage(file);
      const url = result.url?.startsWith('http') ? result.url : `${BASE_URL || ''}${result.url}`;
      return url;
    } finally {
      setUploading(false);
    }
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setCoverImage(await uploadImage(file));
    } catch (err: any) {
      setError(err?.message || 'Failed to upload cover image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const nextStatus = submitter?.value === 'Draft' || submitter?.value === 'Published'
      ? submitter.value
      : status;
    if (!title.trim()) {
      setError('Blog title is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        heading: heading.trim() || title.trim(),
        introduction: introduction.trim(),
        content,
        subcategory: subcategory.trim(),
        image_url: coverImage,
        is_pinned: isPinned,
        is_post: nextStatus === 'Published',
        tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        meta_title: metaTitle.trim(),
        meta_description: metaDescription.trim(),
        meta_keywords: metaKeywords.trim(),
        canonical_url: canonicalUrl.trim(),
        author: author.trim(),
        category: category.trim(),
        status: nextStatus,
        date: blogDate || new Date().toISOString().slice(0, 10),
      };

      if (initialBlog?.id) {
        await ApiServices.updateBlog(initialBlog.id, payload);
      } else {
        await ApiServices.createBlog(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error?.message ||
          err?.message ||
          'Failed to save blog post'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={fullPage ? 'min-h-[calc(100vh-8rem)] w-full' : 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200'}>
      <div
        className={fullPage ? 'bg-white border border-stone-200 shadow-sm w-full max-w-6xl mx-auto overflow-hidden flex flex-col' : 'bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]'}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900">
                {initialBlog ? 'Edit Blog Post' : 'Create New Blog'}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                {initialBlog ? 'Update existing blog details in MySQL' : 'Publish a new curriculum blog post to MySQL'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className={`${fullPage ? 'p-5 sm:p-8' : 'p-6'} space-y-4 overflow-y-auto`}>
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Blog Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 10 Tips for Effective Online Learning"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Heading
            </label>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="Main article heading"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Introduction
            </label>
            <Suspense fallback={<div className="h-64 flex items-center justify-center text-sm text-stone-500">Loading editor...</div>}>
                <JoditEditor
                  key={`blog-introduction-editor-${initialBlog?.id ?? 'new'}`}
                  value={introduction}
                  onChange={(value: string) => setIntroduction(value)}
                  config={INTRODUCTION_EDITOR_CONFIG}
                />
            </Suspense>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Subcategory</label>
              <input value={subcategory} onChange={(e) => setSubcategory(e.target.value)} placeholder="e.g. Exam Strategy" className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Tags</label>
              <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="math, learning, exams" className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Featured / Cover Image</label>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleCoverUpload} className="w-full text-xs text-stone-500 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-100 file:px-3 file:py-2 file:font-bold file:text-amber-800" />
              {coverImage && <img src={coverImage} alt="Cover preview" className="mt-3 h-24 w-full rounded-lg object-cover border border-stone-200" />}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Blog Content
            </label>
            <Suspense fallback={<div className="h-80 flex items-center justify-center text-sm text-stone-500">Loading editor...</div>}>
                <JoditEditor
                  key={`blog-editor-${initialBlog?.id ?? 'new'}`}
                  value={content}
                  onChange={(value: string) => setContent(value)}
                  config={BLOG_CONTENT_EDITOR_CONFIG}
                />
            </Suspense>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Author
              </label>
              <select
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all cursor-pointer"
              >
                {authors.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-stone-100 pt-4 space-y-4">
            <p className="text-xs font-black uppercase tracking-wider text-stone-500">Search Metadata</p>
            <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Meta title" className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="Meta description" rows={2} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} placeholder="Meta keywords" className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              <input value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder="Canonical URL" type="url" className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700 cursor-pointer">
              <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="h-4 w-4 accent-amber-500" />
              Pin blog
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Published' | 'Draft')}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Publication Date
              </label>
              <input
                type="date"
                value={blogDate}
                onChange={(e) => setBlogDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-100 border border-stone-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              value="Draft"
              disabled={loading || uploading}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-100 border border-stone-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              Save Draft
            </button>
            <button
              type="submit"
              value="Published"
              disabled={loading || uploading}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {initialBlog ? 'Update Blog' : 'Publish Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Dashboard View
// ─────────────────────────────────────────────────────────────
const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Platform dynamic stats & audit logs state
  const [stats, setStats] = useState<{
    totalUsers?: number;
    totalStudents?: number;
    totalExamsGenerated?: number;
    totalExamsCompleted?: number;
    totalRunbooks?: number;
    averagePlatformScore?: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Pagination state for Platform Blogs
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const fetchStatsAndLogs = useCallback(async () => {
    setStatsLoading(true);
    setLogsLoading(true);
    try {
      const [statsRes, logsRes] = await Promise.allSettled([
        ApiServices.adminDashboard(),
        ApiServices.adminAuditLogs({ limit: 10 }),
      ]);

      if (statsRes.status === 'fulfilled') {
        const d = statsRes.value;
        const data = d?.data || d;
        setStats(data || null);
      }

      if (logsRes.status === 'fulfilled') {
        const d = logsRes.value;
        const items = Array.isArray(d)
          ? d
          : Array.isArray(d?.items)
            ? d.items
            : Array.isArray(d?.data?.items)
              ? d.data.items
              : Array.isArray(d?.data)
                ? d.data
                : [];
        setAuditLogs(items);
      }
    } catch (err) {
      console.error('Failed to load admin stats or logs:', err);
    } finally {
      setStatsLoading(false);
      setLogsLoading(false);
    }
  }, []);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiServices.listBlogs({ status: 'all' });
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res?.data)
            ? res.data
            : [];
      setBlogs(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
    fetchStatsAndLogs();
  }, [fetchBlogs, fetchStatsAndLogs]);

  const handleCreateBlog = () => {
    navigate('/add-blogs');
  };

  const handleEditBlog = (b: any) => {
    navigate(`/edit-blog/${b.id}`);
  };

  const handleDeleteBlog = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    setDeletingId(id);
    try {
      await ApiServices.deleteBlog(id);
      setActionSuccess('Blog deleted successfully');
      setTimeout(() => setActionSuccess(null), 3500);
      await fetchBlogs();
      fetchStatsAndLogs();
    } catch (err) {
      console.error('Failed to delete blog:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatRelativeTime = (isoString?: string): string => {
    if (!isoString) return 'Recently';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      if (diffMs < 0) return 'Just now';
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} min ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  const getAuditLogDisplay = (log: any) => {
    const action = log?.action || '';
    const name = log?.userName || (log?.entityId && isNaN(Number(log.entityId)) ? log.entityId : null);

    if (action === 'USER_REGISTER') {
      return {
        icon: <UserCheck className="w-4 h-4 text-amber-600" />,
        text: name ? `New user registered: ${name}` : 'New user registered',
        bg: 'bg-amber-50',
      };
    }
    if (action === 'LOGIN_SUCCESS') {
      return {
        icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
        text: name ? `User signed in: ${name}` : 'User signed in successfully',
        bg: 'bg-emerald-50',
      };
    }
    if (action === 'LOGIN_FAILED') {
      return {
        icon: <AlertCircle className="w-4 h-4 text-rose-500" />,
        text: `Failed login attempt ${log.ipAddress ? `(IP: ${log.ipAddress})` : ''}`,
        bg: 'bg-rose-50',
      };
    }
    if (action === 'ADMIN_LOGIN_SUCCESS') {
      return {
        icon: <ShieldCheck className="w-4 h-4 text-blue-600" />,
        text: name ? `Admin signed in: ${name}` : 'Admin signed in successfully',
        bg: 'bg-blue-50',
      };
    }
    if (action === 'ADMIN_LOGIN_FAILED') {
      return {
        icon: <AlertCircle className="w-4 h-4 text-rose-500" />,
        text: `Failed admin login attempt ${log.ipAddress ? `(IP: ${log.ipAddress})` : ''}`,
        bg: 'bg-rose-50',
      };
    }
    if (action === 'CHILD_CREATED') {
      return {
        icon: <Users className="w-4 h-4 text-amber-600" />,
        text: name ? `New student profile created: ${name}` : 'New student enrolled',
        bg: 'bg-amber-50',
      };
    }
    if (action === 'CHILD_UPDATED') {
      return {
        icon: <Edit className="w-4 h-4 text-indigo-600" />,
        text: name ? `Student profile updated: ${name}` : 'Student profile updated',
        bg: 'bg-indigo-50',
      };
    }
    if (action === 'EXAM_GENERATED' || action === 'QUICK_EXAM_GENERATED') {
      return {
        icon: <FileText className="w-4 h-4 text-violet-600" />,
        text: log.entityId ? `AI practice test generated (${log.entityId})` : 'New AI assessment generated',
        bg: 'bg-violet-50',
      };
    }
    if (action === 'EXAM_SUBMITTED') {
      return {
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
        text: name ? `Test evaluated & completed: ${name}` : 'Exam evaluated and submitted',
        bg: 'bg-emerald-50',
      };
    }
    if (action === 'BLOG_CREATED') {
      return {
        icon: <BookOpen className="w-4 h-4 text-yellow-600" />,
        text: log.entityId ? `Curriculum blog published: "${log.entityId}"` : 'Curriculum blog published',
        bg: 'bg-yellow-50',
      };
    }
    if (action === 'BLOG_UPDATED') {
      return {
        icon: <Edit className="w-4 h-4 text-amber-600" />,
        text: log.entityId ? `Curriculum blog updated: "${log.entityId}"` : 'Curriculum blog updated',
        bg: 'bg-amber-50',
      };
    }
    if (action === 'BLOG_DELETED') {
      return {
        icon: <Trash2 className="w-4 h-4 text-stone-500" />,
        text: 'Blog post deleted from database',
        bg: 'bg-stone-50',
      };
    }
    return {
      icon: <Activity className="w-4 h-4 text-stone-600" />,
      text: `${action.replace(/_/g, ' ')}${name ? `: ${name}` : ''}`,
      bg: 'bg-stone-50',
    };
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-semibold shadow-sm animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-4">Platform Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="w-6 h-6 text-white" />}
            label="Total Users"
            value={statsLoading ? '...' : (stats?.totalUsers ?? 0).toLocaleString()}
            change="Registered"
            positive={true}
            accent="bg-amber-400"
          />
          <StatCard
            icon={<GraduationCap className="w-6 h-6 text-white" />}
            label="Exams Generated"
            value={statsLoading ? '...' : (stats?.totalExamsGenerated ?? 0).toLocaleString()}
            change="AI Created"
            positive={true}
            accent="bg-yellow-500"
          />
          <StatCard
            icon={<Activity className="w-6 h-6 text-white" />}
            label="Tests Evaluated"
            value={statsLoading ? '...' : (stats?.totalExamsCompleted ?? 0).toLocaleString()}
            change="Completed"
            positive={true}
            accent="bg-amber-500"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            label="Platform Accuracy"
            value={statsLoading ? '...' : `${stats?.averagePlatformScore ?? 0}%`}
            change="Avg Score"
            positive={true}
            accent="bg-yellow-400"
          />
        </div>
      </div>

      {/* ── Dynamic Platform Blogs Section ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-yellow-600" />
              <h2 className="text-xl font-black text-stone-900">Platform Blogs</h2>
            </div>
            <p className="text-sm text-stone-500 font-medium mt-0.5">
              Live curriculum blogs and pedagogical updates from MySQL database.
            </p>
          </div>
          <button
            id="dashboard-create-blog-btn"
            onClick={handleCreateBlog}
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all whitespace-nowrap active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Blog
          </button>
        </div>

        <div className="admin-card overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/60">
                  <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Title</th>
                  <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Author</th>
                  <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Category</th>
                  <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Date</th>
                  <th className="text-right px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-stone-400 font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                        <span>Loading blogs from MySQL...</span>
                      </div>
                    </td>
                  </tr>
                ) : blogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-stone-400 font-medium">
                      <p className="font-semibold text-stone-600 mb-1">No blogs found in MySQL</p>
                      <p className="text-xs">Click "Create Blog" above to publish your first post.</p>
                    </td>
                  </tr>
                ) : (
                  blogs.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((b) => (
                    <tr key={b.id} className="hover:bg-amber-50/40 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-stone-800">{b.title}</p>
                      </td>
                      <td className="px-6 py-4 text-stone-600 font-medium">{b.author || 'Admin User'}</td>
                      <td className="px-6 py-4 text-stone-600">{b.category || 'General'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            b.status === 'Published'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : 'bg-amber-50 text-amber-600 border border-amber-200'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-stone-500 text-xs">{b.date}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              handleEditBlog(b);
                            }}
                            title="Edit Blog"
                            className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(b.id)}
                            disabled={deletingId === b.id}
                            title="Delete Blog"
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {deletingId === b.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {blogs.length > 0 && (
            <div className="px-6 py-3.5 border-t border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-stone-500 font-medium">
                Showing <span className="font-bold text-stone-800">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-bold text-stone-800">{Math.min(currentPage * pageSize, blogs.length)}</span> of{' '}
                <span className="font-bold text-stone-800">{blogs.length}</span> blogs
              </span>

              {Math.ceil(blogs.length / pageSize) > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 font-semibold hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.ceil(blogs.length / pageSize) }, (_, idx) => idx + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-stone-900 text-white shadow-xs'
                            : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(Math.ceil(blogs.length / pageSize), p + 1))}
                    disabled={currentPage === Math.ceil(blogs.length / pageSize)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 font-semibold hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-stone-400">Recent Activity</h2>
          <span className="text-xs text-stone-400 font-medium">Live Audit Logs</span>
        </div>
        <div className="admin-card space-y-4">
          {logsLoading ? (
            <div className="flex items-center justify-center py-6 text-stone-400 text-sm gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              <span>Loading recent activities from audit logs...</span>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="py-8 text-center text-stone-400 text-sm">
              <Activity className="w-6 h-6 text-stone-300 mx-auto mb-2" />
              <p className="font-semibold text-stone-600 mb-1">No audit activities recorded yet</p>
              <p className="text-xs">User signups, logins, and exams will appear here in real time.</p>
            </div>
          ) : (
            auditLogs.slice(0, 6).map((log: any, i: number) => {
              const display = getAuditLogDisplay(log);
              return (
                <div key={log.id || i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl ${display.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    {display.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-800 truncate">{display.text}</p>
                    <p className="text-xs text-stone-400 font-medium mt-0.5">{formatRelativeTime(log.createdAt || log.created_at)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Platform Analytics & Trends ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Assessment Activity */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Weekly Assessment Activity</h3>
              <p className="text-xs text-stone-400 font-medium mt-0.5">Tests Generated vs. Completed (Mon–Sun)</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-stone-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Generated
              </span>
              <span className="flex items-center gap-1.5 text-stone-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed
              </span>
            </div>
          </div>

          <div className="h-56 w-full mt-2">
            {statsLoading ? (
              <div className="h-full flex items-center justify-center text-stone-400 text-xs gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>Loading activity trend...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.weeklyActivity || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#78716c', fontWeight: 600 }} tickLine={false} axisLine={{ stroke: '#e7e5e4' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c1917', borderRadius: '0.75rem', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 600, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#fbbf24', fontWeight: 700, marginBottom: '4px' }}
                  />
                  <Bar dataKey="generated" name="Generated" fill="#fbbf24" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Subject Performance Breakdown */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Subject Accuracy & Volume</h3>
              <p className="text-xs text-stone-400 font-medium mt-0.5">Average accuracy score % by curriculum subject</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Avg Score %
            </div>
          </div>

          <div className="h-56 w-full mt-2">
            {statsLoading ? (
              <div className="h-full flex items-center justify-center text-stone-400 text-xs gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>Loading subject performance...</span>
              </div>
            ) : (!stats?.subjectBreakdown || stats.subjectBreakdown.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 text-xs">
                <Activity className="w-5 h-5 text-stone-300 mb-1" />
                <span>No subject assessment data available yet</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.subjectBreakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                  <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#78716c', fontWeight: 600 }} tickLine={false} axisLine={{ stroke: '#e7e5e4' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Accuracy']}
                    labelFormatter={(label: any) => `Subject: ${label}`}
                    contentStyle={{ backgroundColor: '#1c1917', borderRadius: '0.75rem', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 600 }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#818cf8', fontWeight: 700, marginBottom: '4px' }}
                  />
                  <Bar dataKey="averageAccuracy" name="Avg Accuracy" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Blog Creation & Edit Modal */}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Users View
// ─────────────────────────────────────────────────────────────
const UsersView: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 10;

  const fetchUsers = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const res = await ApiServices.listAdminUsers({ page, limit: pageSize });
      const data = res?.data || res;
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      setUsers(items);
      setTotalCount(data?.total ?? items.length);
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, fetchUsers]);

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const formatJoinedDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const getRoleBadgeStyle = (role?: string) => {
    const r = (role || '').toUpperCase();
    if (r === 'PARENT') return 'bg-amber-100 text-amber-800 border border-amber-200';
    if (r === 'STUDENT') return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    if (r === 'TEACHER') return 'bg-blue-100 text-blue-800 border border-blue-200';
    if (r === 'ADMIN' || r === 'SUPER_ADMIN') return 'bg-purple-100 text-purple-800 border border-purple-200';
    return 'bg-stone-100 text-stone-700 border border-stone-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900">Users</h1>
          <p className="text-sm text-stone-500 font-medium mt-1">Manage all registered platform users and their access.</p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name, email..."
            className="w-full h-10 pl-10 pr-4 rounded-xl text-xs font-semibold text-stone-900 bg-white border border-stone-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all placeholder:text-stone-400"
          />
        </div>
      </div>

      <div className="admin-card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/60">
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Name</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Role</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400 hidden sm:table-cell">Status</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400 hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-stone-400 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                      <span>Loading registered users from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-stone-400 font-medium">
                    <Users className="w-6 h-6 text-stone-300 mx-auto mb-2" />
                    <p className="font-semibold text-stone-600 mb-1">No users found</p>
                    <p className="text-xs">{searchQuery ? 'Try changing your search keywords.' : 'No registered users in database.'}</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-amber-50/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-300 to-yellow-500 flex items-center justify-center text-white font-black text-sm shadow-sm flex-shrink-0">
                          {(u.name || u.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-800 truncate">{u.name || u.username}</p>
                          <p className="text-xs text-stone-400 truncate">{u.email || `@${u.username}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getRoleBadgeStyle(u.roleName || u.role)}`}>
                        {u.role || u.roleName || 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className={`flex items-center gap-1.5 text-xs font-bold w-fit px-2.5 py-1 rounded-full ${u.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive !== false ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                        {u.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone-500 text-xs hidden md:table-cell">
                      {formatJoinedDate(u.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 10 items Pagination Footer */}
        {totalCount > 0 && (
          <div className="px-6 py-3.5 border-t border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-stone-500 font-medium">
              Showing <span className="font-bold text-stone-800">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-bold text-stone-800">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-bold text-stone-800">{totalCount}</span> users
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 font-semibold hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={loading}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || loading}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 font-semibold hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// Course Form Modal (Add / Edit Academic Chapter)
// ─────────────────────────────────────────────────────────────
interface CourseModalProps {
  initialCourse?: any | null;
  onClose: () => void;
  onSaved: () => void;
}

const CourseFormModal: React.FC<CourseModalProps> = ({ initialCourse, onClose, onSaved }) => {
  const [board, setBoard] = useState(initialCourse?.board || 'CBSE');
  const [classGrade, setClassGrade] = useState(initialCourse?.classGrade || 'Class 8');
  const [subject, setSubject] = useState(initialCourse?.subject || 'Mathematics');
  const [chapterName, setChapterName] = useState(initialCourse?.chapterName || '');
  const [coreConceptsText, setCoreConceptsText] = useState(
    initialCourse?.coreConcepts
      ? Array.isArray(initialCourse.coreConcepts)
        ? initialCourse.coreConcepts.join(', ')
        : typeof initialCourse.coreConcepts === 'object'
          ? Object.keys(initialCourse.coreConcepts).join(', ')
          : String(initialCourse.coreConcepts)
      : ''
  );
  const [keyFormulasText, setKeyFormulasText] = useState(
    initialCourse?.keyFormulasOrRules
      ? Array.isArray(initialCourse.keyFormulasOrRules)
        ? initialCourse.keyFormulasOrRules.join('\n')
        : String(initialCourse.keyFormulasOrRules)
      : ''
  );
  const [commonTrapsText, setCommonTrapsText] = useState(
    initialCourse?.commonTraps
      ? Array.isArray(initialCourse.commonTraps)
        ? initialCourse.commonTraps.join('\n')
        : String(initialCourse.commonTraps)
      : ''
  );
  const [status, setStatus] = useState(initialCourse?.status || 'PUBLISHED');
  const [boardClassesMap, setBoardClassesMap] = useState<Record<string, string[]>>(BOARD_CLASSES_MAP as any);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch live Board-Class Mapping from API /api/v1/master/board_class_dropdown
  useEffect(() => {
    ApiServices.getBoardClassDropdown()
      .then((res: any) => {
        const fetchedMap = res?.boardClassesMap || res?.data?.boardClassesMap;
        if (fetchedMap) {
          setBoardClassesMap(fetchedMap);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch board class master dropdown:', err);
      });
  }, []);

  // Dynamic allowed classes strictly determined by Board mapping
  const allowedClasses = (boardClassesMap && boardClassesMap[board]) || BOARD_CLASSES_MAP[board] || [
    'Class 1', 'Class 2', 'Class 3', 'Class 4',
    'Class 5', 'Class 6', 'Class 7', 'Class 8',
    'Class 9', 'Class 10', 'Class 11', 'Class 12'
  ];

  // Dynamic allowed subjects strictly determined by Class Grade mapping (e.g. Class 1 has no Physics/Chem/Bio)
  const availableSubjects = CLASS_SUBJECTS_MAP[classGrade] || [
    'Mathematics', 'English', 'Science', 'Social Studies', 'Computer Science', 'Logical Reasoning'
  ];

  const handleClassGradeChange = (newGrade: string) => {
    setClassGrade(newGrade);
    const newAllowedSubjects = CLASS_SUBJECTS_MAP[newGrade] || [
      'Mathematics', 'English', 'Science', 'Social Studies', 'Computer Science', 'Logical Reasoning'
    ];
    if (!newAllowedSubjects.includes(subject as any)) {
      setSubject(newAllowedSubjects[0]);
    }
  };

  const handleBoardChange = (newBoard: string) => {
    setBoard(newBoard);
    const newAllowed = (boardClassesMap && boardClassesMap[newBoard]) || BOARD_CLASSES_MAP[newBoard] || [
      'Class 1', 'Class 2', 'Class 3', 'Class 4',
      'Class 5', 'Class 6', 'Class 7', 'Class 8',
      'Class 9', 'Class 10', 'Class 11', 'Class 12'
    ];
    const targetGrade = newAllowed.includes(classGrade as any) ? classGrade : newAllowed[0];
    setClassGrade(targetGrade);
    const newAllowedSubjects = CLASS_SUBJECTS_MAP[targetGrade] || [
      'Mathematics', 'English', 'Science', 'Social Studies', 'Computer Science', 'Logical Reasoning'
    ];
    if (!newAllowedSubjects.includes(subject as any)) {
      setSubject(newAllowedSubjects[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterName.trim()) {
      setError('Chapter name is required.');
      return;
    }

    const concepts = coreConceptsText
      .split(/[,\n]+/)
      .map((c) => c.trim())
      .filter(Boolean);

    const formulas = keyFormulasText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const traps = commonTrapsText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      board,
      classGrade,
      subject,
      chapterName: chapterName.trim(),
      coreConcepts: concepts,
      keyFormulasOrRules: formulas,
      commonTraps: traps,
      status,
    };

    setLoading(true);
    setError(null);
    try {
      if (initialCourse?.id) {
        await ApiServices.updateRunbook(initialCourse.id, payload);
      } else {
        await ApiServices.createRunbook(payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Failed to save chapter:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to save chapter. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-900 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900">
                {initialCourse ? 'Edit Academic Chapter' : 'Add New Academic Chapter'}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                {initialCourse ? 'Update chapter syllabus and study topics.' : 'Add a new chapter and syllabus topics for students.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-200/60 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Board, Class Grade, Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Board *
              </label>
              <select
                value={board}
                onChange={(e) => handleBoardChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white cursor-pointer"
              >
                <optgroup label="Active Platform Boards">
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE (Class 1-10)</option>
                  <option value="ISC">ISC (Class 11-12)</option>
                  <option value="WBBSE">WBBSE (Madhyamik - Class 1-10)</option>
                  <option value="WBCHSE">WBCHSE (Higher Secondary - Class 11-12)</option>
                </optgroup>
                <optgroup label="Other / Extended Boards">
                  <option value="NCERT">NCERT</option>
                  <option value="UK-Cambridge">UK-Cambridge</option>
                  <option value="NEET">NEET (Competitive - Class 11-12)</option>
                  <option value="IIT">IIT-JEE (Competitive - Class 11-12)</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Class Grade *
              </label>
              <select
                value={classGrade}
                onChange={(e) => handleClassGradeChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white cursor-pointer"
              >
                {allowedClasses.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Subject *
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white cursor-pointer"
              >
                {availableSubjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Chapter Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Chapter / Unit Name *
            </label>
            <input
              type="text"
              required
              value={chapterName}
              onChange={(e) => setChapterName(e.target.value)}
              placeholder="e.g. Integers, Number Line & Basic Fractions"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
            />
          </div>

          {/* Key Topics */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Key Topics Covered
              </label>
              <span className="text-[11px] text-stone-400 font-medium">Separate with commas</span>
            </div>
            <textarea
              rows={2}
              value={coreConceptsText}
              onChange={(e) => setCoreConceptsText(e.target.value)}
              placeholder="e.g. Positive & Negative Integers, Absolute Value, Fractions Comparison"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white resize-none"
            />
          </div>

          {/* Key Formulas / Rules */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Important Formulas & Notes
              </label>
              <span className="text-[11px] text-stone-400 font-medium">One per line (optional)</span>
            </div>
            <textarea
              rows={3}
              value={keyFormulasText}
              onChange={(e) => setKeyFormulasText(e.target.value)}
              placeholder="e.g. (-a) * (-b) = a * b&#10;LCM(a, b) * GCD(a, b) = a * b"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
            />
          </div>

          {/* Common Mistakes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Common Student Mistakes
              </label>
              <span className="text-[11px] text-stone-400 font-medium">One mistake per line (optional)</span>
            </div>
            <textarea
              rows={2}
              value={commonTrapsText}
              onChange={(e) => setCommonTrapsText(e.target.value)}
              placeholder="e.g. Confusing (-3) - (-5) with (-3) - 5&#10;Assuming -5 is larger than -2"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Publishing Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white cursor-pointer"
            >
              <option value="PUBLISHED">Published (Active & Live for Students)</option>
              <option value="DRAFT">Draft (Hidden / Under Review)</option>
            </select>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 border border-stone-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {initialCourse ? 'Update Chapter' : 'Save Chapter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Course Deep-Dive Detail Modal
// ─────────────────────────────────────────────────────────────
const CourseDetailModal: React.FC<{
  course: any;
  onClose: () => void;
  onEdit: () => void;
}> = ({ course, onClose, onEdit }) => {
  const concepts = course.coreConcepts
    ? Array.isArray(course.coreConcepts)
      ? course.coreConcepts
      : typeof course.coreConcepts === 'object'
        ? Object.keys(course.coreConcepts)
        : [String(course.coreConcepts)]
    : [];

  const formulas = course.keyFormulasOrRules
    ? Array.isArray(course.keyFormulasOrRules)
      ? course.keyFormulasOrRules
      : [String(course.keyFormulasOrRules)]
    : [];

  const traps = course.commonTraps
    ? Array.isArray(course.commonTraps)
      ? course.commonTraps
      : [String(course.commonTraps)]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-start justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900 leading-snug">
                {course.chapterName || `${course.subject} - ${course.classGrade}`}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                  {course.board || 'CBSE'}
                </span>
                <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                  {course.subject}
                </span>
                <span className="text-xs font-semibold text-stone-500">
                  {course.classGrade}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  {course.status || 'PUBLISHED'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-200/60 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Topics Covered */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5 flex items-center gap-1.5">
              <span>🎯</span> Topics Covered ({concepts.length})
            </h3>
            {concepts.length === 0 ? (
              <p className="text-xs text-stone-400 italic">No topics specified.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {concepts.map((concept: any, idx: number) => {
                  const title = typeof concept === 'object' && concept !== null ? concept.title || concept.name || JSON.stringify(concept) : String(concept);
                  return (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-amber-50/80 border border-amber-200/70 text-amber-900 rounded-xl text-xs font-semibold shadow-2xs"
                    >
                      {title}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Key Formulas & Notes */}
          {formulas.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
                <span>📐</span> Important Formulas & Notes ({formulas.length})
              </h3>
              <div className="space-y-1.5">
                {formulas.map((f: string, idx: number) => (
                  <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 text-xs font-mono text-stone-800">
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common Mistakes */}
          {traps.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
                <span>⚠️</span> Common Student Mistakes ({traps.length})
              </h3>
              <div className="space-y-1.5">
                {traps.map((trap: string, idx: number) => (
                  <div key={idx} className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/60 text-xs font-medium text-rose-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>{trap}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question Difficulty Guidelines */}
          {course.difficultyCalibration && typeof course.difficultyCalibration === 'object' && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
                <span>🤖</span> Question Difficulty Guidelines
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl">
                  <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Simple Level</p>
                  <p className="text-xs text-stone-700 mt-1 font-medium leading-relaxed">
                    {course.difficultyCalibration.simple || 'Basic definitions and direct formula applications.'}
                  </p>
                </div>
                <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl">
                  <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Medium Level</p>
                  <p className="text-xs text-stone-700 mt-1 font-medium leading-relaxed">
                    {course.difficultyCalibration.medium || 'Analytical reasoning and multi-step calculations.'}
                  </p>
                </div>
                <div className="p-3 bg-purple-50/60 border border-purple-200/60 rounded-xl">
                  <p className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">Hard Level</p>
                  <p className="text-xs text-stone-700 mt-1 font-medium leading-relaxed">
                    {course.difficultyCalibration.hard || 'Complex problem solving and Olympiad level questions.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between bg-stone-50/40">
          <span className="text-[11px] text-stone-400 font-medium">
            Chapter ID: {course.id ? String(course.id).slice(0, 8) : 'N/A'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-stone-900 hover:bg-amber-500 transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Chapter</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200/60 border border-stone-200 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Courses View (Academics)
// ─────────────────────────────────────────────────────────────
const CoursesView: React.FC = () => {
  const [runbooks, setRunbooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBoard, setSelectedBoard] = useState('ALL');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [viewingCourse, setViewingCourse] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchRunbooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiServices.listRunbooks();
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.items)
            ? res.items
            : [];
      setRunbooks(list);
    } catch (err) {
      console.error('Failed to load curriculum runbooks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRunbooks();
  }, [fetchRunbooks]);

  const handleDeleteCourse = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete chapter "${name}"? This will remove it from the student practice tests.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await ApiServices.removeRunbook(id);
      setActionSuccess(`Chapter "${name}" deleted successfully.`);
      setTimeout(() => setActionSuccess(null), 3500);
      await fetchRunbooks();
    } catch (err) {
      console.error('Failed to delete chapter:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Distinct boards, subjects, grades
  const distinctBoards = ['ALL', ...Array.from(new Set(runbooks.map((r) => r.board).filter(Boolean)))];
  const distinctSubjects = ['ALL', ...Array.from(new Set(runbooks.map((r) => r.subject).filter(Boolean)))];
  const distinctGrades = ['ALL', ...Array.from(new Set(runbooks.map((r) => r.classGrade).filter(Boolean)))];

  // Calculated Overview Stats
  const totalConceptsCount = runbooks.reduce((acc, rb) => {
    if (!rb.coreConcepts) return acc;
    if (Array.isArray(rb.coreConcepts)) return acc + rb.coreConcepts.length;
    if (typeof rb.coreConcepts === 'object') return acc + Object.keys(rb.coreConcepts).length;
    return acc + 1;
  }, 0);

  // Filter by Board, Grade, Subject, and Search Query
  const filteredCourses = runbooks.filter((rb) => {
    const matchesBoard =
      selectedBoard === 'ALL' ||
      (rb.board && rb.board.toUpperCase() === selectedBoard.toUpperCase());

    if (!matchesBoard) return false;

    const matchesGrade =
      selectedGrade === 'ALL' ||
      (rb.classGrade && rb.classGrade.toLowerCase() === selectedGrade.toLowerCase());

    if (!matchesGrade) return false;

    const matchesSubject =
      selectedSubject === 'ALL' ||
      (rb.subject && rb.subject.toLowerCase() === selectedSubject.toLowerCase());

    if (!matchesSubject) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (rb.chapterName && rb.chapterName.toLowerCase().includes(q)) ||
      (rb.subject && rb.subject.toLowerCase().includes(q)) ||
      (rb.board && rb.board.toLowerCase().includes(q)) ||
      (rb.classGrade && rb.classGrade.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900">Academics & Courses</h1>
          <p className="text-sm text-stone-500 font-medium mt-1">
            Manage curriculum syllabus, boards, classes, and chapter topics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingCourse(null);
              setIsFormModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add New Chapter</span>
          </button>
        </div>
      </div>

      {/* Quick Overview Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="admin-card !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xl font-black text-stone-900">{runbooks.length}</p>
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Total Chapters</p>
          </div>
        </div>

        <div className="admin-card !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-black text-stone-900">
              {new Set(runbooks.map((r) => r.board).filter(Boolean)).size}
            </p>
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Active Boards</p>
          </div>
        </div>

        <div className="admin-card !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xl font-black text-stone-900">
              {new Set(runbooks.map((r) => r.subject).filter(Boolean)).size}
            </p>
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Subjects Covered</p>
          </div>
        </div>

        <div className="admin-card !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xl font-black text-stone-900">{totalConceptsCount}</p>
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Topics Covered</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-card !p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search subject, chapter, grade..."
            className="w-full h-10 pl-10 pr-4 rounded-xl text-xs font-semibold text-stone-900 bg-stone-50 border border-stone-200 focus:border-yellow-400 focus:bg-white focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all placeholder:text-stone-400"
          />
        </div>

        {/* Dropdowns for Class & Subject */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <select
            value={selectedGrade}
            onChange={(e) => {
              setSelectedGrade(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white cursor-pointer"
          >
            <option value="ALL">All Grades</option>
            {distinctGrades.filter((g) => g !== 'ALL').map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white cursor-pointer"
          >
            <option value="ALL">All Subjects</option>
            {distinctSubjects.filter((s) => s !== 'ALL').map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Board Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {distinctBoards.map((b) => (
          <button
            key={b}
            onClick={() => {
              setSelectedBoard(b);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedBoard === b
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {b === 'ALL' ? 'All Boards' : b}
          </button>
        ))}
      </div>

      {/* Cards List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="admin-card py-12 flex flex-col items-center justify-center text-stone-400 text-sm gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
            <span>Loading curriculum courses from database...</span>
          </div>
        ) : paginatedCourses.length === 0 ? (
          <div className="admin-card py-12 text-center text-stone-400 text-sm">
            <BookOpen className="w-6 h-6 text-stone-300 mx-auto mb-2" />
            <p className="font-semibold text-stone-600 mb-1">No curriculum chapters found</p>
            <p className="text-xs">
              {searchQuery || selectedBoard !== 'ALL' || selectedGrade !== 'ALL' || selectedSubject !== 'ALL'
                ? 'Try clearing the active filters or search keywords.'
                : 'No published chapters found in database.'}
            </p>
          </div>
        ) : (
          paginatedCourses.map((c, i) => {
            const conceptsCount = c.coreConcepts
              ? Array.isArray(c.coreConcepts)
                ? c.coreConcepts.length
                : typeof c.coreConcepts === 'object'
                  ? Object.keys(c.coreConcepts).length
                  : 1
              : 0;

            return (
              <div
                key={c.id || i}
                className="admin-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-500 flex items-center justify-center shadow-md flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-stone-900 text-base truncate">
                      {c.chapterName || `${c.subject} - ${c.classGrade}`}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                        {c.board || 'CBSE'}
                      </span>
                      <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                        {c.subject}
                      </span>
                      <span className="text-xs font-semibold text-stone-500">
                        {c.classGrade || 'Class 8'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-xs text-stone-500">
                      <span className="font-medium">
                        🎯 <strong className="text-stone-700">{conceptsCount}</strong> Topics
                      </span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        {c.status || 'PUBLISHED'}
                      </span>
                      {c.lastUpdated && (
                        <>
                          <span>•</span>
                          <span className="text-stone-400">Updated: {c.lastUpdated}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setViewingCourse(c)}
                    title="View Chapter Details"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-stone-500" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingCourse(c);
                      setIsFormModalOpen(true);
                    }}
                    title="Edit Chapter"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-amber-600" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteCourse(c.id, c.chapterName || c.subject)}
                    disabled={deletingId === c.id}
                    title="Delete Chapter"
                    className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                  >
                    {deletingId === c.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5 items Pagination Footer */}
      {filteredCourses.length > 0 && (
        <div className="admin-card !p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-stone-500 font-medium">
            Showing <span className="font-bold text-stone-800">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-bold text-stone-800">
              {Math.min(currentPage * pageSize, filteredCourses.length)}
            </span>{' '}
            of <span className="font-bold text-stone-800">{filteredCourses.length}</span> chapters
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 font-semibold hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={loading}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 font-semibold hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isFormModalOpen && (
        <CourseFormModal
          initialCourse={editingCourse}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingCourse(null);
          }}
          onSaved={() => {
            setActionSuccess(
              editingCourse
                ? `Chapter updated successfully!`
                : `New chapter created successfully!`
            );
            setTimeout(() => setActionSuccess(null), 3500);
            fetchRunbooks();
          }}
        />
      )}

      {/* Deep-Dive View Details Modal */}
      {viewingCourse && (
        <CourseDetailModal
          course={viewingCourse}
          onClose={() => setViewingCourse(null)}
          onEdit={() => {
            setEditingCourse(viewingCourse);
            setViewingCourse(null);
            setIsFormModalOpen(true);
          }}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Reports View
// ─────────────────────────────────────────────────────────────
const ReportsView: React.FC = () => {
  const reports = [
    { title: 'Monthly Platform Report', period: 'August 2026', type: 'PDF', size: '2.4 MB', status: 'Ready' },
    { title: 'User Growth Analytics', period: 'Q3 2026', type: 'CSV', size: '1.1 MB', status: 'Ready' },
    { title: 'Course Completion Summary', period: 'August 2026', type: 'PDF', size: '890 KB', status: 'Processing' },
    { title: 'Revenue & Subscription Report', period: 'August 2026', type: 'XLSX', size: '3.2 MB', status: 'Ready' },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-stone-900">Reports</h1>
        <p className="text-sm text-stone-500 font-medium mt-1">Download and view platform analytics reports.</p>
      </div>
      <div className="grid gap-4">
        {reports.map((r, i) => (
          <div key={i} className="admin-card flex items-center gap-4 hover:-translate-y-0.5 transition-all duration-200">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0
              ${r.type === 'PDF' ? 'bg-red-100' : r.type === 'CSV' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
              <BarChart3 className={`w-6 h-6 ${r.type === 'PDF' ? 'text-red-500' : r.type === 'CSV' ? 'text-emerald-600' : 'text-blue-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-stone-900 truncate">{r.title}</p>
              <p className="text-xs text-stone-400 mt-0.5">{r.period} · {r.size}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${r.status === 'Ready' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {r.status}
              </span>
              {r.status === 'Ready' && (
                <button className="text-xs font-black text-amber-600 hover:text-amber-800 border border-amber-200 hover:border-amber-400 px-3 py-1.5 rounded-lg transition-all hover:bg-amber-50 hidden sm:block">
                  Download
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Manage Blogs View
// ─────────────────────────────────────────────────────────────
const ManageBlogsView: React.FC<{ setActiveView: (v: AdminView) => void }> = ({ setActiveView }) => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fetchBlogs = useCallback(async (query?: string) => {
    setLoading(true);
    try {
      const filters = { ...(query && query.trim() ? { search: query.trim() } : {}), status: 'all' };
      const res = await ApiServices.listBlogs(filters);
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res?.data)
            ? res.data
            : [];
      setBlogs(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchBlogs(val);
  };

  const handleCreateBlog = () => {
    navigate('/add-blogs');
  };

  const handleEditBlog = (b: any) => {
    navigate(`/edit-blog/${b.id}`);
  };

  const handleDeleteBlog = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    setDeletingId(id);
    try {
      await ApiServices.deleteBlog(id);
      setToast('Blog deleted successfully');
      setTimeout(() => setToast(null), 3500);
      await fetchBlogs(searchQuery);
    } catch (err) {
      console.error('Failed to delete blog:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-semibold shadow-sm animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900">Manage Blogs</h1>
          <p className="text-sm text-stone-500 font-medium mt-1">Create and manage content for your platform from MySQL.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search blogs..."
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
            />
          </div>
          <button
            onClick={handleCreateBlog}
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all whitespace-nowrap cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Blog
          </button>
        </div>
      </div>

      <div className="admin-card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/60">
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Title</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Author</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Category</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Status</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Date</th>
                <th className="text-right px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-stone-400 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                      <span>Loading blogs from MySQL...</span>
                    </div>
                  </td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-stone-400 font-medium">
                    <p className="font-semibold text-stone-600 mb-1">No blogs found in MySQL</p>
                    <p className="text-xs">Click "Add Blog" above to create and publish your first post.</p>
                  </td>
                </tr>
              ) : (
                blogs.map((b) => (
                  <tr key={b.id} className="hover:bg-amber-50/40 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-stone-800">{b.title}</p>
                    </td>
                    <td className="px-6 py-4 text-stone-600 font-medium">{b.author || 'Admin User'}</td>
                    <td className="px-6 py-4 text-stone-600">{b.category || 'General'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          b.status === 'Published'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone-500 text-xs">{b.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            handleEditBlog(b);
                          }}
                          title="Edit Blog"
                          className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(b.id)}
                          disabled={deletingId === b.id}
                          title="Delete Blog"
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {deletingId === b.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Add Blog View
// ─────────────────────────────────────────────────────────────
const AddBlogView: React.FC<{ setActiveView: (v: AdminView) => void }> = ({ setActiveView }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Education');
  const [author, setAuthor] = useState('Admin User');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState<string[]>([
    'Education',
    'Technology',
    'Engineering',
    'Parenting',
    'Platform News',
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ApiServices.listBlogCategories()
      .then((res: any) => {
        const catList = res?.data || [];
        if (Array.isArray(catList) && catList.length > 0) {
          const names = catList.map((c: any) => c.name);
          setCategories(prev => Array.from(new Set([...names, ...prev])));
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (status: 'Published' | 'Draft') => {
    if (!title.trim()) {
      setError('Blog title is required');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await ApiServices.createBlog({
        title: title.trim(),
        category,
        author: author.trim() || 'Admin User',
        status,
        date: new Date().toISOString().slice(0, 10),
      });
      setActiveView('manage-blogs' as AdminView);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error?.message ||
          err?.message ||
          'Failed to create blog'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('manage-blogs' as AdminView)}
            className="p-2 hover:bg-stone-100 rounded-xl transition-colors text-stone-500 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-stone-900">Create New Blog</h1>
            <p className="text-sm text-stone-500 font-medium mt-1">Draft a new post for your audience in MySQL.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave('Draft')}
            disabled={submitting}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-100 border border-stone-200 transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            onClick={() => handleSave('Published')}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Publish Post
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm font-semibold shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="admin-card space-y-6">
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Blog Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter an engaging title..."
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Admin User"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Content</label>
          <Suspense fallback={<div className="h-80 flex items-center justify-center text-sm text-stone-500">Loading editor...</div>}>
              <JoditEditor
                key="add-blog-editor"
                value={content}
                onChange={(value: string) => setContent(value)}
                config={BLOG_CONTENT_EDITOR_CONFIG}
              />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Category View
// ─────────────────────────────────────────────────────────────
const CategoryView: React.FC<{ setActiveView: (v: string) => void }> = () => {
  const categories = [
    { name: 'Education', count: 24, status: 'Active' },
    { name: 'Technology', count: 18, status: 'Active' },
    { name: 'Parenting', count: 12, status: 'Active' },
    { name: 'Platform News', count: 5, status: 'Active' },
    { name: 'Engineering', count: 9, status: 'Active' },
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900">Categories</h1>
          <p className="text-sm text-stone-500 font-medium mt-1">Manage content categories and tags.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input type="text" placeholder="Search categories..." className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all" />
          </div>
          <button className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all whitespace-nowrap">
            <Plus className="w-4 h-4" />Add Category
          </button>
        </div>
      </div>
      <div className="admin-card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/60">
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Name</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Items</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Status</th>
                <th className="text-right px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {categories.map((c, i) => (
                <tr key={i} className="hover:bg-amber-50/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-stone-800">{c.name}</td>
                  <td className="px-6 py-4 text-stone-600 font-medium">{c.count}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-600">{c.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                      <button className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Admin Dashboard Shell
// ─────────────────────────────────────────────────────────────
interface AdminDashboardProps {
  onLogout: () => void;
  user?: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // navigate-based replacement for setActiveView — child views use this to navigate between pages
  const navigate = useNavigate();
  const location = useLocation();
  const isBlogEditor = location.pathname.startsWith('/edit-blog/');
  const activeView: AdminView = isBlogEditor ? 'edit-blog' : location.pathname.split('/').pop() || 'dashboard';
  const editBlogId = location.pathname.split('/').pop() || '';
  const setActiveView = (view: string) => {
    if (view.startsWith('/')) navigate(view);
    else navigate('/' + view);
  };

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [profileMenuOpen]);

  const [pageAccess, setPageAccess] = useState<any[]>(() => {
    const stored = sessionStorage.getItem('acugrade_admin_page_access') || localStorage.getItem('acugrade_admin_page_access');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'BarChart3': return <BarChart3 className="w-5 h-5" />;
      case 'Users': return <Users className="w-5 h-5" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5" />;
      case 'Play': return <Play className="w-5 h-5" />;
      case 'Bot': return <Bot className="w-5 h-5" />;
      case 'FileText': return <FileText className="w-5 h-5" />;
      case 'Trophy': return <Trophy className="w-5 h-5" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5" />;
      case 'Settings': return <Settings className="w-5 h-5" />;
      case 'LayoutDashboard': return <LayoutDashboard className="w-5 h-5" />;
      default: return <LayoutDashboard className="w-5 h-5" />;
    }
  };


  const navItems = pageAccess.map(page => ({
    id: page.pageRoute?.split('/').pop() || 'dashboard',
    route: page.pageRoute || '/admin/dashboard',
    icon: getIcon(page.icon),
    label: page.pageName,
    navId: `admin-nav-${page.pageRoute?.split('/').pop() || 'dashboard'}`
  }));

  const handleNav = (item: { id: string; route: string }) => {
    navigate(item.route);
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen w-full bg-stone-50 flex font-sans overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ── Sidebar ─────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col h-full flex-shrink-0 shadow-xl overflow-hidden
          bg-gradient-to-b from-yellow-50/40 via-white to-orange-50/20 border-r border-stone-200/60
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 lg:shadow-none
          ${collapsed ? 'lg:w-20' : 'lg:w-64'}
          w-72
        `}
      >
        {/* Decorative background blob in sidebar */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-yellow-100/30 to-transparent pointer-events-none"></div>

        {/* Brand */}
        <div className={`h-16 w-full flex items-center justify-between ${collapsed ? 'lg:justify-center px-4' : 'px-6'} border-b border-stone-100 flex-shrink-0 relative z-10 transition-all`}>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-yellow-500 flex-shrink-0" />
            {!collapsed && (
              <div className="min-w-0">
                <span className="text-lg font-bold text-stone-900 tracking-tight transition-all">
                  SahajPath<span className="text-yellow-500">.</span>
                </span>
                <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-600 mt-0.5 leading-none">Admin Console</p>
              </div>
            )}
          </div>
          {/* Desktop collapse toggle */}
          <button
            id="admin-sidebar-collapse"
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden lg:flex p-1.5 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 bg-stone-50 border border-stone-100 rounded-lg transition-colors ${collapsed ? '' : 'ml-auto'}`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto mt-2 relative z-10 custom-scrollbar">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              id={item.navId}
              icon={item.icon}
              label={item.label}
              active={activeView === item.id}
              collapsed={collapsed}
              onClick={() => handleNav(item)}
            />
          ))}
        </nav>

        {/* Footer Actions (Logout) */}
        <div className="p-4 border-t border-stone-100 mt-auto relative z-10">
          <button
            id="admin-nav-logout"
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-stone-600 rounded-lg hover:bg-stone-50 hover:text-stone-900 transition-colors ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
            title="Log out"
          >
            <LogOut className="w-4 h-4 flex-shrink-0 text-stone-400" />
            <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>Log out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Area ───────────────────────────── */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden relative">

        {/* Top Header */}
        <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              id="admin-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-black text-stone-800">
                Welcome, {user?.name || 'Admin'} 👋
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* Date and Time */}
            <div className="hidden sm:block text-right">
              <p className="text-xs text-stone-700 font-semibold">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-[10px] text-stone-400 font-medium">
                {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification bell */}
              <button
                id="admin-notifications"
                className="relative p-1.5 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5" />
              </button>

              {/* Admin Avatar */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-full sm:rounded-xl border border-transparent hover:bg-stone-50 hover:border-stone-200 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-yellow-50 to-amber-50 border border-yellow-200 flex items-center justify-center text-base sm:text-lg shadow-sm group-hover:scale-105 transition-transform">
                    👨‍👩‍👧‍👦
                  </div>
                </button>

                {/* Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2.5 border-b border-stone-100 bg-stone-50/60 rounded-t-2xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-xs shrink-0">
                          {(user?.name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-stone-900 truncate">{user?.name || 'Admin'} (Admin)</p>
                          <p className="text-[10px] text-stone-400 truncate">{user?.email || 'admin@sahajpath.com'}</p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-yellow-600" />
                      </div>
                    </div>

                    <div className="p-1">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs text-stone-700 hover:bg-stone-100 transition-colors mt-1"
                      >
                        <LogOut className="w-4 h-4 text-stone-400" />
                        <span className="font-medium text-stone-900">Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {(() => {
            // Dynamic view registry — add new pages here as backend adds them
            const VIEW_MAP: Record<string, React.ReactNode> = {
              dashboard:      <DashboardView />,
              users:          <UsersView />,
              academics:      <CoursesView />,
              courses:        <CoursesView />,
              analytics:      <ReportsView />,
              reports:        <ReportsView />,
              blogs:          <ManageBlogsView setActiveView={(v) => navigate('/' + v)} />,
              'manage-blogs': <ManageBlogsView setActiveView={(v) => navigate('/' + v)} />,
              'add-blogs':    <BlogFormModal isOpen fullPage initialBlog={null} onClose={() => navigate('/manage-blogs')} onSuccess={() => navigate('/manage-blogs')} />,
              'edit-blog':   <BlogEditPage blogId={editBlogId} onBack={() => navigate('/manage-blogs')} onSaved={() => {}} />,
              category:       <CategoryView setActiveView={(v) => navigate('/' + v)} />,
            };

            return VIEW_MAP[activeView] ?? (
              <div className="flex flex-col items-center justify-center h-full text-stone-400 font-medium py-20">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                  <Settings className="w-8 h-8 text-stone-300" />
                </div>
                <p className="text-lg text-stone-600 font-bold mb-1">Coming Soon</p>
                <p className="text-sm">This module is currently under construction.</p>
              </div>
            );
          })()}
        </main>
      </div>

      {/* Inline scoped styles */}
      <style>{`
        .admin-card {
          background: white;
          border: 1px solid rgba(231,229,228,0.7);
          border-radius: 1.25rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.04);
        }
      `}</style>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Admin Login Page
// ─────────────────────────────────────────────────────────────
type AuthScreen = 'login' | 'forgot-password';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Auth state ──────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const tokens = getStoredTokens();
    if (!tokens) return false;
    const payload = decodeTokenPayload(tokens.accessToken);
    const role = (payload?.role ?? '').toUpperCase();
    return role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'AUTHOR';
  });

  const [adminUser, setAdminUser] = useState<any>(() => {
    const stored = sessionStorage.getItem('acugrade_admin_user') || localStorage.getItem('acugrade_admin_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [view, setView] = useState<AuthScreen>('login');

  // Synchronize router path when authenticated or not
  useEffect(() => {
    if (isAuthenticated) {
      if (location.pathname === '/admin' || location.pathname === '/admin/login') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // ── Login form state ────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loginSuccess, setLoginSuccess] = useState(false);

  // ── Create New Password state ───────────────
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetErrorMessage, setResetErrorMessage] = useState<string | null>(null);
  const [resetFieldErrors, setResetFieldErrors] = useState<{
    email?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const clearFieldError = (field: 'email' | 'password') => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    if (errorMessage) setErrorMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = 'Please enter your admin email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!password) errs.password = 'Please enter your password.';
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await ApiServices.adminLogin({ email: email.trim(), password });
      const result = response.data?.data || response.data;

      const accessToken = result.accessToken || result.tokens?.accessToken;
      const refreshToken = result.refreshToken || result.tokens?.refreshToken;

      if (accessToken && refreshToken) {
        storeTokens({ accessToken, refreshToken });
      }

      const payload = accessToken ? decodeTokenPayload(accessToken) : null;
      const userRole = ((payload?.role || result.user?.role || result.user?.roleName || '') as string).toUpperCase();

      if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        clearTokens();
        sessionStorage.removeItem('acugrade_admin_user');
        setErrorMessage('Access denied. This portal is restricted to admin accounts only.');
        return;
      }

      const userData = result.user || {
        email: email.trim(),
        name: result.user?.name || 'SahajPath Admin',
        role: userRole,
        roleName: userRole,
      };

      sessionStorage.setItem('acugrade_admin_user', JSON.stringify(userData));
      sessionStorage.setItem('acugrade_admin_page_access', JSON.stringify(result.pageAccess || []));
      setAdminUser(userData);

      setLoginSuccess(true);
      setTimeout(() => {
        setIsAuthenticated(true);
        navigate('/admin/dashboard');
      }, 500);
    } catch (error: any) {
      const msg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to sign in. Please check your credentials and try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetErrorMessage(null);
    setResetFieldErrors({});

    const errs: { email?: string; newPassword?: string; confirmPassword?: string } = {};
    if (!resetEmail.trim()) {
      errs.email = 'Please enter your admin email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!newPassword) {
      errs.newPassword = 'Please enter a new password.';
    } else if (newPassword.length < 6) {
      errs.newPassword = 'Password must be at least 6 characters.';
    }
    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your new password.';
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errs).length) {
      setResetFieldErrors(errs);
      return;
    }

    setResetSubmitting(true);
    try {
      await ApiServices.adminResetPassword({
        email: resetEmail.trim(),
        newPassword,
      });
      setResetSuccess(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update password. Please try again.';
      setResetErrorMessage(msg);
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleLogout = async () => {
    const tokens = getStoredTokens();
    try {
      if (tokens) await ApiServices.logout({ refreshToken: tokens.refreshToken });
    } catch {
      /* best-effort */
    }
    clearTokens();
    sessionStorage.removeItem('acugrade_admin_user');
    localStorage.removeItem('acugrade_admin_user');
    setAdminUser(null);
    setIsAuthenticated(false);
    setLoginSuccess(false);
    setEmail('');
    setPassword('');
    setErrorMessage(null);
    navigate('/admin/login');
  };

  // If already authenticated or on dashboard route with valid auth, show dashboard
  if (isAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} user={adminUser} />;
  }

  // ── Clean SahajPath Admin Sign In Page ──────────
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/80 shadow-xl shadow-stone-200/50">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-stone-900 flex items-center justify-center shadow-lg shadow-yellow-200 mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="font-black text-xl tracking-tight text-stone-900">SahajPath</div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight mt-4">
            {view === 'login' ? 'Admin Sign In' : 'Create New Password'}
          </h1>
        </div>

        {/* ── View: Admin Sign In ── */}
        {view === 'login' && (
          <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
            {/* Admin Email */}
            <div>
              <label htmlFor="admin-email" className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative group">
                <Mail
                  size={17}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${fieldErrors.email ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'
                    }`}
                />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError('email');
                  }}
                  placeholder="admin@sahajpath.com"
                  autoComplete="email"
                  className={`w-full h-12 pl-11 pr-4 rounded-2xl text-sm font-semibold text-stone-900 outline-none transition-all
                    placeholder:text-stone-300 placeholder:font-normal
                    bg-stone-50/60 border-2
                    ${fieldErrors.email
                      ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-400/15'
                      : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/15 focus:bg-white'
                    }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="admin-password" className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative group">
                <Lock
                  size={17}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${fieldErrors.password ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'
                    }`}
                />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError('password');
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full h-12 pl-11 pr-12 rounded-2xl text-sm font-semibold text-stone-900 outline-none transition-all
                    placeholder:text-stone-300 placeholder:font-normal
                    bg-stone-50/60 border-2
                    ${fieldErrors.password
                      ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-400/15'
                      : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/15 focus:bg-white'
                    }`}
                />
                <button
                  type="button"
                  id="admin-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                id="admin-forgot-password"
                onClick={() => {
                  setResetEmail(email);
                  setResetSuccess(false);
                  setResetErrorMessage(null);
                  setResetFieldErrors({});
                  setView('forgot-password');
                }}
                className="text-xs font-bold text-yellow-600 hover:text-yellow-700 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Sign In Button */}
            <button
              id="admin-login-submit"
              type="submit"
              disabled={isSubmitting || loginSuccess}
              className="w-full h-12 rounded-2xl font-extrabold text-sm transition-all duration-200 shadow-lg shadow-yellow-200 bg-yellow-400 hover:bg-yellow-500 text-stone-900 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : loginSuccess ? (
                <span>Signed In</span>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        )}

        {/* ── View: Create New Password ── */}
        {view === 'forgot-password' && (
          <div>
            {resetSuccess ? (
              <div className="text-center space-y-4 py-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-stone-800">Password created successfully.</p>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(resetEmail);
                    setPassword('');
                    setView('login');
                  }}
                  className="w-full h-12 rounded-2xl font-extrabold text-sm transition-all duration-200 shadow-lg shadow-yellow-200 bg-yellow-400 hover:bg-yellow-500 text-stone-900 active:scale-[0.98] flex items-center justify-center mt-4"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} noValidate className="space-y-4">
                {/* Admin Email */}
                <div>
                  <label htmlFor="reset-email" className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
                    Admin Email
                  </label>
                  <div className="relative group">
                    <Mail
                      size={17}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${resetFieldErrors.email ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'
                        }`}
                    />
                    <input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        setResetFieldErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      placeholder="admin@sahajpath.com"
                      autoComplete="email"
                      className={`w-full h-12 pl-11 pr-4 rounded-2xl text-sm font-semibold text-stone-900 outline-none transition-all
                        placeholder:text-stone-300 placeholder:font-normal bg-stone-50/60 border-2 ${resetFieldErrors.email
                          ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-400/15'
                          : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/15 focus:bg-white'
                        }`}
                    />
                  </div>
                  {resetFieldErrors.email && (
                    <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{resetFieldErrors.email}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="new-password" className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative group">
                    <Lock
                      size={17}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${resetFieldErrors.newPassword ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'
                        }`}
                    />
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setResetFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
                      }}
                      placeholder="••••••••"
                      className={`w-full h-12 pl-11 pr-12 rounded-2xl text-sm font-semibold text-stone-900 outline-none transition-all
                        placeholder:text-stone-300 placeholder:font-normal bg-stone-50/60 border-2 ${resetFieldErrors.newPassword
                          ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-400/15'
                          : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/15 focus:bg-white'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {resetFieldErrors.newPassword && (
                    <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{resetFieldErrors.newPassword}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm-password" className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Lock
                      size={17}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${resetFieldErrors.confirmPassword ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'
                        }`}
                    />
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setResetFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                      }}
                      placeholder="••••••••"
                      className={`w-full h-12 pl-11 pr-12 rounded-2xl text-sm font-semibold text-stone-900 outline-none transition-all
                        placeholder:text-stone-300 placeholder:font-normal bg-stone-50/60 border-2 ${resetFieldErrors.confirmPassword
                          ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-400/15'
                          : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/15 focus:bg-white'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {resetFieldErrors.confirmPassword && (
                    <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{resetFieldErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Error Message */}
                {resetErrorMessage && (
                  <div className="p-3.5 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>{resetErrorMessage}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  id="admin-reset-submit"
                  type="submit"
                  disabled={resetSubmitting}
                  className="w-full h-12 rounded-2xl font-extrabold text-sm transition-all duration-200 shadow-lg shadow-yellow-200 bg-yellow-400 hover:bg-yellow-500 text-stone-900 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2 mt-2"
                >
                  {resetSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <span>Create Password</span>
                  )}
                </button>

                {/* Back to Sign In Link */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setView('login');
                      setErrorMessage(null);
                    }}
                    className="text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
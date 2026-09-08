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
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

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
  }, [fetchBlogs]);

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
    } catch (err) {
      console.error('Failed to delete blog:', err);
    } finally {
      setDeletingId(null);
    }
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
            value="12,480"
            change="+8.2%"
            accent="bg-amber-400"
          />
          <StatCard
            icon={<BookOpen className="w-6 h-6 text-white" />}
            label="Active Courses"
            value="348"
            change="+3.1%"
            accent="bg-yellow-500"
          />
          <StatCard
            icon={<Activity className="w-6 h-6 text-white" />}
            label="Sessions Today"
            value="2,193"
            change="+14%"
            accent="bg-amber-500"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            label="Completion Rate"
            value="78.4%"
            change="+2.3%"
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

      {/* Recent Activity */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-4">Recent Activity</h2>
        <div className="admin-card space-y-4">
          {[
            { icon: <UserCheck className="w-4 h-4 text-amber-600" />, text: 'New user registration: Priya Sharma', time: '2 min ago', bg: 'bg-amber-50' },
            { icon: <BookMarked className="w-4 h-4 text-yellow-600" />, text: 'Course "CBSE Math Grade 8" updated', time: '15 min ago', bg: 'bg-yellow-50' },
            { icon: <AlertCircle className="w-4 h-4 text-rose-500" />, text: 'Failed login attempt detected (IP: 192.168.x.x)', time: '32 min ago', bg: 'bg-red-50' },
            { icon: <BarChart3 className="w-4 h-4 text-emerald-600" />, text: 'Monthly report generated for August 2026', time: '1 hr ago', bg: 'bg-emerald-50' },
            { icon: <UserCheck className="w-4 h-4 text-amber-600" />, text: 'New user registration: Arjun Mehta', time: '2 hr ago', bg: 'bg-amber-50' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-800 truncate">{item.text}</p>
                <p className="text-xs text-stone-400 font-medium mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <h3 className="text-sm font-bold text-stone-800 mb-4">Revenue Growth</h3>
          <div className="h-48 w-full flex items-end gap-2 mt-4 px-2">
            {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-amber-200 to-amber-400 rounded-t-md" style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-stone-400 font-medium px-2">
            <span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
          </div>
        </div>
        <div className="admin-card">
          <h3 className="text-sm font-bold text-stone-800 mb-4">User Acquisition</h3>
          <div className="h-48 w-full flex items-end gap-2 mt-4 px-2">
            {[30, 50, 40, 70, 65, 85, 95].map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-emerald-200 to-emerald-400 rounded-t-md" style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-stone-400 font-medium px-2">
            <span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
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
  const users = [
    { name: 'Priya Sharma', email: 'priya@example.com', role: 'Parent', status: 'Active', joined: 'Aug 30, 2026' },
    { name: 'Arjun Mehta', email: 'arjun@example.com', role: 'Student', status: 'Active', joined: 'Aug 29, 2026' },
    { name: 'Deepa Nair', email: 'deepa@example.com', role: 'Teacher', status: 'Inactive', joined: 'Aug 25, 2026' },
    { name: 'Rahul Verma', email: 'rahul@example.com', role: 'Parent', status: 'Active', joined: 'Aug 22, 2026' },
    { name: 'Sunita Patel', email: 'sunita@example.com', role: 'Student', status: 'Active', joined: 'Aug 20, 2026' },
    { name: 'Vikram Singh', email: 'vikram@example.com', role: 'Teacher', status: 'Active', joined: 'Aug 18, 2026' },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-stone-900">Users</h1>
        <p className="text-sm text-stone-500 font-medium mt-1">Manage all platform users and their access.</p>
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
              {users.map((u, i) => (
                <tr key={i} className="hover:bg-amber-50/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-300 to-yellow-500 flex items-center justify-center text-white font-black text-sm shadow-sm">
                        {u.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-800">{u.name}</p>
                        <p className="text-xs text-stone-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold
                      ${u.role === 'Parent' ? 'bg-amber-100 text-amber-700' :
                        u.role === 'Teacher' ? 'bg-blue-50 text-blue-600' :
                          'bg-yellow-50 text-yellow-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className={`flex items-center gap-1.5 text-xs font-bold w-fit px-2.5 py-1 rounded-full
                      ${u.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-stone-500 hidden md:table-cell">{u.joined}</td>
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
// Courses View
// ─────────────────────────────────────────────────────────────
const CoursesView: React.FC = () => {
  const courses = [
    { title: 'CBSE Mathematics Grade 8', subject: 'Mathematics', students: 1240, completion: 82, board: 'CBSE' },
    { title: 'ICSE Science Grade 10', subject: 'Science', students: 980, completion: 71, board: 'ICSE' },
    { title: 'CBSE English Language', subject: 'English', students: 2100, completion: 90, board: 'CBSE' },
    { title: 'NCERT Social Studies Grade 7', subject: 'Social Studies', students: 760, completion: 65, board: 'NCERT' },
    { title: 'ICSE Hindi Grade 9', subject: 'Hindi', students: 540, completion: 58, board: 'ICSE' },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-stone-900">Courses</h1>
        <p className="text-sm text-stone-500 font-medium mt-1">Overview of all active curriculum courses on the platform.</p>
      </div>
      <div className="grid gap-4">
        {courses.map((c, i) => (
          <div key={i} className="admin-card flex flex-col sm:flex-row sm:items-center gap-4 hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-stone-900 truncate">{c.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md">{c.board}</span>
                <span className="text-xs text-stone-400">{c.subject}</span>
              </div>
              <div className="mt-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-stone-400 font-medium">Completion</span>
                  <span className="text-xs font-black text-amber-600">{c.completion}%</span>
                </div>
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full transition-all duration-700"
                    style={{ width: `${c.completion}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-black text-stone-900">{c.students.toLocaleString()}</p>
              <p className="text-xs text-stone-400 font-medium">students</p>
            </div>
          </div>
        ))}
      </div>
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
    <div className="min-h-screen bg-stone-50 flex font-sans">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ── Sidebar ─────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col shadow-xl overflow-hidden
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        {/* Top Header */}
        <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
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
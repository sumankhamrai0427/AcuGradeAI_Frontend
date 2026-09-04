import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  ArrowLeft,
  Clock,
  Calendar,
  Tag,
  ArrowRight,
  Search,
  Menu,
  X,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import blogsData from "../data/blogs.json";
import { PublicHeader } from "./common/PublicHeader";
import { PublicFooter } from "./common/PublicFooter";

export interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  readTime: string;
  publishedDate: string;
  category: string;
  classRange: string;
  board: string;
  coverGradient: string;
  coverEmoji: string;
  summary: string;
  content: string[];
  tags: string[];
  featured: boolean;
  image: string;
}

// ── Markdown bold
const renderMD = (text: string) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((p, i) =>
    i % 2 === 1 ? <strong key={i} className="font-bold text-stone-900">{p}</strong> : <span key={i}>{p}</span>
  );
};

// ── Category colour
const CAT_COLOR: Record<string, string> = {
  "Board Strategies": "text-yellow-600",
  "AI & RAG Learning": "text-violet-600",
  "NEET & IIT": "text-rose-600",
  "Parenting & Pedagogy": "text-emerald-600",
};
const catColor = (c: string) => CAT_COLOR[c] ?? "text-stone-500";

const ALL_CATS = ["All", "Board Strategies", "AI & RAG Learning", "Parenting & Pedagogy"];



// ─────────────────────────────────────────────────────────────────────────────
// Cover image (gradient + emoji, like a real thumbnail)
// ─────────────────────────────────────────────────────────────────────────────
const CoverImg: React.FC<{ post: BlogPostData }> = ({ post }) => (
  <div className="relative w-full h-48 overflow-hidden bg-stone-100 flex items-center justify-center group-hover:opacity-90 transition-opacity">
    <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-black/10" />
    {/* class + board chips */}
    <div className="absolute top-3 left-3 flex gap-1.5 z-10">
      <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold">{post.board}</span>
      <span className="px-2 py-0.5 rounded-full bg-white/25 backdrop-blur-sm text-white text-[9px] font-bold border border-white/20">{post.classRange}</span>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Blog Card — exact SahajJobs reference layout
// ─────────────────────────────────────────────────────────────────────────────
const BlogCard: React.FC<{ post: BlogPostData }> = ({ post }) => (
  <Link
    to={`/blog/${post.slug}`}
    className="group bg-white rounded-xl border border-stone-200 hover:shadow-lg hover:border-stone-300 shadow-sm overflow-hidden cursor-pointer transition-all duration-200 flex flex-col"
  >
    {/* Thumbnail */}
    <CoverImg post={post} />

    {/* Body */}
    <div className="p-5 flex flex-col flex-1">
      {/* Category label */}
      <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${catColor(post.category)}`}>
        {post.category}
      </p>

      {/* Title */}
      <h3 className="font-black text-stone-900 text-[15px] leading-snug group-hover:text-yellow-600 transition-colors mb-2 line-clamp-2">
        {post.title}
      </h3>

      {/* Meta: Leave a Comment / Category / Author */}
      <p className="text-[10px] text-stone-400 mb-3 flex items-center gap-1 flex-wrap">
        <span className="flex items-center gap-0.5 hover:text-yellow-600 cursor-pointer transition-colors">
          <MessageSquare className="w-2.5 h-2.5" /> Leave a Comment
        </span>
        <span className="mx-0.5">/</span>
        <span className={`font-semibold ${catColor(post.category)}`}>{post.category}</span>
        <span className="mx-0.5">/</span>
        <span>{post.author}</span>
      </p>

      {/* Excerpt */}
      <p className="text-xs text-stone-500 leading-relaxed line-clamp-3 flex-1 mb-5">{post.summary}</p>

      {/* Read More button */}
      <div className="w-full py-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-stone-900 font-black text-xs tracking-wide transition-all flex items-center justify-center gap-1.5 group-hover:gap-2.5">
        Read More <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  </Link>
);

// ─────────────────────────────────────────────────────────────────────────────
// Article Detail page
// ─────────────────────────────────────────────────────────────────────────────
const ArticleDetail: React.FC<{ post: BlogPostData; onBack: () => void }> = ({ post, onBack }) => {
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [post]);

  const allPosts = blogsData as BlogPostData[];
  const relatedPosts = allPosts.filter(p => p.category === post.category && p.id !== post.id).slice(0, 3);
  const latestPosts = allPosts.filter(p => p.id !== post.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-10 rounded-xl border border-stone-200 shadow-sm">
            {/* Hero Image */}
            <div className="w-full rounded-xl overflow-hidden mb-8 border border-stone-100 shadow-sm">
              <img src={post.image} alt={post.title} className="w-full h-auto object-cover" />
            </div>

            {/* Category Pill */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 rounded bg-[#0d47a1] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight mb-4">{post.title}</h1>

            {/* Meta: Author & Date */}
            <div className="text-sm text-stone-500 mb-6 font-medium">
              By <span className="text-stone-700">{post.author}</span> / {new Date(post.publishedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>

            {/* Share Row */}
            <div className="flex items-center gap-2 mb-6 pb-6 border-b border-stone-100">
              <span className="text-sm text-stone-500 mr-2 font-bold">Share</span>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-[#1877F2] text-white hover:opacity-90 transition"><span className="text-sm font-bold font-serif">f</span></button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-black text-white hover:opacity-90 transition"><span className="text-xs font-bold font-sans">X</span></button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-[#0A66C2] text-white hover:opacity-90 transition"><span className="text-xs font-bold font-sans">in</span></button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-[#25D366] text-white hover:opacity-90 transition"><span className="text-xs font-bold font-sans">Wa</span></button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-stone-200 text-stone-600 hover:bg-stone-300 transition"><Share2 className="w-4 h-4" /></button>
            </div>

            {/* Breadcrumb */}
            <div className="text-xs text-stone-500 mb-8 flex items-center gap-1.5 flex-wrap font-semibold">
              <Link to="/" className="text-[#0d47a1] hover:underline">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/blog" className="text-[#0d47a1] hover:underline">Blog</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-stone-700">{post.title}</span>
            </div>

            {/* Content Header */}
            <h2 className="text-xl font-bold text-stone-900 mb-4">Introduction</h2>

            {/* Content Body */}
            <div className="space-y-6 text-stone-700 text-[15px] leading-relaxed">
              {post.content.map((para, i) => <p key={i}>{renderMD(para)}</p>)}
            </div>

            {/* Tags */}
            <div className="mt-10 pt-6 border-t border-stone-100 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-stone-100 text-stone-600 text-xs font-bold border border-stone-200">
                  <Tag className="w-3 h-3" />{tag}
                </span>
              ))}
            </div>

            {/* Previous Post */}
            <div className="mt-10 pt-6 border-t border-stone-100">
              <p className="text-xs text-stone-400 mb-1 font-bold">Previous Post</p>
              <button onClick={onBack} className="text-[#0d47a1] text-sm font-semibold hover:underline">
                Back to All Articles
              </button>
            </div>

            {/* Newsletter */}
            <div className="mt-10 p-6 sm:p-8 bg-stone-50 rounded-xl border border-stone-200">
              <h3 className="text-lg font-black text-stone-900 mb-4">Join our newsletter for the latest updates and insights.</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="email" placeholder="Enter your email for more updates" className="flex-1 px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm bg-white" />
                <button className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-stone-900 font-bold rounded-lg transition text-sm whitespace-nowrap shadow-sm">
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Latest Articles */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="bg-yellow-400 px-4 py-3 border-b border-yellow-500">
                <h3 className="text-sm font-black text-stone-900 tracking-wider">LATEST ARTICLES</h3>
              </div>
              <div className="p-4 space-y-4">
                {latestPosts.map(p => (
                  <Link to={`/blog/${p.slug}`} key={p.id} className="flex gap-3 group">
                    <img src={p.image} alt={p.title} className="w-16 h-16 object-cover rounded-md border border-stone-200 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 group-hover:text-[#0d47a1] transition-colors line-clamp-2 mb-1">{p.title}</h4>
                      <p className="text-[10px] text-stone-500 font-medium">{new Date(p.publishedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} | By {p.author}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Related Articles */}
            {relatedPosts.length > 0 && (
              <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="bg-yellow-400 px-4 py-3 border-b border-yellow-500">
                  <h3 className="text-sm font-black text-stone-900 tracking-wider">RELATED ARTICLES</h3>
                </div>
                <div className="p-4 space-y-4">
                  {relatedPosts.map(p => (
                    <Link to={`/blog/${p.slug}`} key={p.id} className="flex gap-3 group">
                      <img src={p.image} alt={p.title} className="w-16 h-16 object-cover rounded-md border border-stone-200 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-stone-900 group-hover:text-[#0d47a1] transition-colors line-clamp-2 mb-1">{p.title}</h4>
                        <p className="text-[10px] text-stone-500 font-medium">{new Date(p.publishedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} | By {p.author}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main BlogPage
// ─────────────────────────────────────────────────────────────────────────────
export const BlogPage: React.FC = () => {
  const posts: BlogPostData[] = blogsData as BlogPostData[];
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();

  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(6);
  const PER_PAGE_OPTIONS = [3, 6, 9, 12];

  const selectedPost = slug ? posts.find((p) => p.slug === slug) ?? null : null;
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [selectedPost]);

  const filtered = useMemo(() => {
    setCurrentPage(1);
    return posts.filter((p) => {
      const okCat = activeCat === "All" || p.category === activeCat;
      const q = search.toLowerCase();
      const okQ = !q || p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q)
        || p.author.toLowerCase().includes(q) || p.board.toLowerCase().includes(q)
        || p.tags.some(t => t.toLowerCase().includes(q));
      return okCat && okQ;
    });
  }, [posts, search, activeCat]);

  const totalPages = Math.ceil(filtered.length / postsPerPage);
  const paginated = filtered.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  // Visible page range (max 5 buttons)
  const getPageRange = () => {
    const delta = 2;
    const range: (number | '...')[] = [];
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);
    range.push(1);
    if (left > 2) range.push('...');
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) range.push('...');
    if (totalPages > 1) range.push(totalPages);
    return range;
  };

  const goTo = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Detail view
  if (selectedPost) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <div className="flex-1">
          <ArticleDetail post={selectedPost} onBack={() => navigate("/blog")} />
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Header */}
      <PublicHeader />

      {/* ── Page body */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* ── Title row + search (exactly like reference) */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            {/* Left: title + subtitle */}
            <div>
              <h1 className="text-3xl font-black text-stone-900 leading-tight">Blogs For You</h1>
              <p className="text-sm text-stone-500 mt-1 max-w-md">
                Explore career guidance, exam strategies, and board-specific updates to help your child grow professionally — Class 1 to 12.
              </p>
            </div>
            {/* Right: search bar */}
            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                id="blog-search"
                type="text"
                placeholder="Search blogs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>



          {/* ── Grid */}
          {filtered.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginated.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              {/* ── PrimeReact-style Paginator */}
              {totalPages >= 1 && (
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-100 pt-6">

                  {/* Left: result count */}
                  <p className="text-xs text-stone-400 order-2 sm:order-1">
                    Showing{" "}
                    <strong className="text-stone-600">{(currentPage - 1) * postsPerPage + 1}</strong>
                    {"–"}
                    <strong className="text-stone-600">{Math.min(currentPage * postsPerPage, filtered.length)}</strong>
                    {" of "}
                    <strong className="text-stone-600">{filtered.length}</strong>{" articles"}
                  </p>

                  {/* Centre: page buttons */}
                  <div className="flex items-center gap-1 order-1 sm:order-2">
                    {/* First page << */}
                    <button
                      onClick={() => goTo(1)}
                      disabled={currentPage === 1}
                      title="First page"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-lg font-medium"
                    >
                      «
                    </button>
                    {/* Prev < */}
                    <button
                      onClick={() => goTo(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      title="Previous page"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-lg font-medium"
                    >
                      ‹
                    </button>

                    {/* Page numbers */}
                    {getPageRange().map((p, idx) =>
                      p === '...' ? (
                        <span key={`dot-${idx}`} className="w-8 h-8 flex items-center justify-center text-stone-400 text-xs select-none">
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => goTo(p as number)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-bold transition-all ${
                            currentPage === p
                              ? 'bg-yellow-400 text-stone-900 border-yellow-400 shadow-sm shadow-yellow-200'
                              : 'bg-white text-stone-600 border-stone-200 hover:border-yellow-300 hover:bg-yellow-50'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                    {/* Next > */}
                    <button
                      onClick={() => goTo(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      title="Next page"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-lg font-medium"
                    >
                      ›
                    </button>
                    {/* Last >> */}
                    <button
                      onClick={() => goTo(totalPages)}
                      disabled={currentPage === totalPages}
                      title="Last page"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-lg font-medium"
                    >
                      »
                    </button>
                  </div>

                  {/* Right: rows per page dropdown */}
                  <div className="flex items-center gap-2 order-3">
                    <label className="text-xs text-stone-400 whitespace-nowrap">Per page</label>
                    <select
                      value={postsPerPage}
                      onChange={(e) => { setPostsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className="text-xs font-semibold text-stone-700 border border-stone-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 cursor-pointer hover:border-stone-300 transition-all"
                    >
                      {PER_PAGE_OPTIONS.map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-stone-400" />
              </div>
              <h3 className="text-base font-bold text-stone-700 mb-1">No articles found</h3>
              <p className="text-sm text-stone-400 mb-5">Try a different search or category.</p>
              <button onClick={() => { setSearch(""); setActiveCat("All"); }}
                className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-stone-900 text-xs font-bold shadow-sm transition-all">
                Clear filters
              </button>
            </div>
          )}

        </div>
      </main>

      {/* ── Footer */}
      <PublicFooter />
    </div>
  );
};

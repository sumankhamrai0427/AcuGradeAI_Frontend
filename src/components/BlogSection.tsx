import React, { useState } from 'react';
import { SAMPLE_BLOG_POSTS } from '../data/initialData';
import { BlogPost } from '../types';
import { BookOpen, Calendar, Clock, Tag, User, ArrowRight, Sparkles } from 'lucide-react';

export const BlogSection: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => setSelectedPost(null)}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 mb-6 flex items-center gap-1.5"
        >
          ← Back to All Articles
        </button>

        <article className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {selectedPost.category}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {selectedPost.readTime}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
            {selectedPost.title}
          </h1>

          <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-8 text-xs text-slate-500">
            <span className="font-semibold text-slate-800">{selectedPost.author}</span>
            <span>•</span>
            <span>{selectedPost.publishedDate}</span>
          </div>

          <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-4">
            <p className="font-medium text-slate-600 italic text-base border-l-4 border-indigo-500 pl-4 py-1">
              {selectedPost.summary}
            </p>
            <p>
              In contemporary school education across boards like ICSE, CBSE, ISC, Cambridge, NEET, and IIT JEE, students often face cognitive overload from standard textbook question banks. The breakthrough of Retrieval-Augmented Generation (RAG) lies in anchoring diagnostic assessments strictly to authoritative syllabus nodes and real-time concept mapping.
            </p>
            <h3 className="text-lg font-bold text-slate-900 mt-6 mb-2">1. The 10-Mark Diagnostic Power Sprint</h3>
            <p>
              Long 3-hour mock tests often cause burnout and fatigue for middle and high school students. A calibrated 10-mark, 10-question sprint allows parents and teachers to pinpoint specific misconceptions—such as confusing magnetic flux with field strength or forgetting unit conversions—within a rapid 15-minute window.
            </p>
            <h3 className="text-lg font-bold text-slate-900 mt-6 mb-2">2. Evolutionary Learning Pathways</h3>
            <p>
              Evolutionary learning means that no assessment exists in isolation. Each 10-mark submission feeds the child's knowledge graph. If a student shows weakness in ray optics sign conventions, the AI engine immediately presents remedial reference links and schedules targeted reinforcement questions in the next session.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-2">
            {selectedPost.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                #{tag}
              </span>
            ))}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Pedagogical Insights & Exam Prep Guides
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          AcuGrade Learning Blog & Board Strategies
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          Expert guides on mastering CBSE, ICSE, Cambridge, NEET, and IIT JEE curricula with AI-RAG diagnostics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SAMPLE_BLOG_POSTS.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 p-6 flex flex-col justify-between cursor-pointer transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {post.category}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                {post.summary}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{post.publishedDate}</span>
              <span className="font-semibold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Read Guide <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

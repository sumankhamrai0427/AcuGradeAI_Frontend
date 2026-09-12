import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Database,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  Search,
  BookOpen,
  Cpu,
  Layers,
  Check,
  Zap,
  Bot
} from 'lucide-react';
import ApiServices from '../../services/ApiServices';
import { Board, ClassGrade, Subject } from '../../types';

const BOARDS: Board[] = ['CBSE', 'ICSE', 'ISC', 'UK-Cambridge', 'NCERT', 'NEET', 'IIT'];
const GRADES: ClassGrade[] = [
  'Class 5', 'Class 6', 'Class 7', 'Class 8',
  'Class 9', 'Class 10', 'Class 11', 'Class 12'
];
const SUBJECTS: Subject[] = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Science', 'Social Studies', 'English', 'Computer Science', 'Logical Reasoning'
];

interface RagDocument {
  id: string;
  filename: string;
  content_type: string;
  board?: string;
  classGrade?: string;
  subject?: string;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  chunk_count: number;
  created_at: string;
}

interface RagStatusData {
  vector_store_enabled: boolean;
  total_documents: number;
  total_chunks: number;
  total_runbooks: number;
  documents: RagDocument[];
}

export const AiRagHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ingestion' | 'playground'>('ingestion');
  const [ragStatus, setRagStatus] = useState<RagStatusData | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Ingestion Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<Board>('CBSE');
  const [selectedGrade, setSelectedGrade] = useState<ClassGrade>('Class 10');
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Mathematics');
  const [uploading, setUploading] = useState(false);

  // Playground State
  const [testQuery, setTestQuery] = useState('');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [testingLlm, setTestingLlm] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchRagStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await ApiServices.getRagStatus();
      const data = res?.data !== undefined ? res.data : res;
      setRagStatus(data);
    } catch (err: any) {
      console.error('Failed to load RAG status:', err);
      showNotify('error', 'Failed to connect to ChromaDB vector store');
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchRagStatus();
  }, []);

  const handleUploadPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('board', selectedBoard);
      formData.append('classGrade', selectedGrade);
      formData.append('subject', selectedSubject);

      await ApiServices.uploadRagFile(formData);
      showNotify('success', `PDF "${uploadFile.name}" ingested into ChromaDB Vector Store!`);
      setUploadFile(null);
      fetchRagStatus();
    } catch (err: any) {
      console.error('PDF upload error:', err);
      showNotify('error', err?.response?.data?.error?.message || 'Failed to ingest PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Are you sure you want to remove this textbook from ChromaDB?')) return;
    try {
      await ApiServices.deleteRagDocument(id);
      showNotify('success', 'Document removed from ChromaDB vector store');
      fetchRagStatus();
    } catch (err: any) {
      showNotify('error', 'Failed to delete document');
    }
  };

  const handleTestChat = async () => {
    if (!testQuery.trim()) return;
    setTestingLlm(true);
    setTestResponse(null);
    try {
      const res = await ApiServices.sendChatMessage({
        messages: [{ role: 'user', content: testQuery.trim() }]
      });
      const reply = res?.response || (typeof res === 'string' ? res : JSON.stringify(res));
      setTestResponse(reply);
    } catch (err: any) {
      setTestResponse(`Error: ${err?.message || 'Failed to contact AI Teacher'}`);
    } finally {
      setTestingLlm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-bounce ${
          notification.type === 'success'
            ? 'bg-emerald-500/90 text-white border-emerald-400'
            : 'bg-rose-500/90 text-white border-rose-400'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">AI & RAG Management Hub</h1>
            <p className="text-xs text-stone-500 font-medium">Textbook PDF Chunking, ChromaDB Vector Store & Live AI Playground</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 bg-stone-100 rounded-2xl border border-stone-200/60 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('ingestion')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ingestion'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Database className="w-4 h-4 text-yellow-600" />
            PDF & Vector Ingestion
          </button>
          <button
            onClick={() => setActiveTab('playground')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'playground'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Bot className="w-4 h-4 text-yellow-600" />
            AI RAG Playground
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          VECTOR STORE HEALTH METRICS CARDS
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Vector Store</span>
            <span className={`w-2.5 h-2.5 rounded-full ${ragStatus?.vector_store_enabled ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
          </div>
          <p className="text-2xl font-black text-stone-900">
            {ragStatus?.vector_store_enabled ? 'ChromaDB Active' : 'Offline'}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> High-dimensional cosine embeddings
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Indexed Chunks</span>
            <Layers className="w-4 h-4 text-yellow-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{ragStatus?.total_chunks || 0}</p>
          <p className="text-[11px] text-stone-400 font-medium">300-500 token semantic segments</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Textbook PDFs</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{ragStatus?.total_documents || 0}</p>
          <p className="text-[11px] text-stone-400 font-medium">Official Curriculum Chapters</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">K-Graph Runbooks</span>
            <BookOpen className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{ragStatus?.total_runbooks || 0}</p>
          <p className="text-[11px] text-stone-400 font-medium">Curated Concepts & Formulas</p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: PDF INGESTION & DOCUMENT REPOSITORY
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'ingestion' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Upload Form */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <UploadCloud className="w-5 h-5 text-yellow-600" />
              <h2 className="text-base font-black text-stone-900">Ingest Textbook PDF</h2>
            </div>

            <form onSubmit={handleUploadPdf} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Board</label>
                <select
                  value={selectedBoard}
                  onChange={(e) => setSelectedBoard(e.target.value as Board)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
                >
                  {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Class</label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value as ClassGrade)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
                  >
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value as Subject)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
                  >
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* PDF Dropzone */}
              <div className="border-2 border-dashed border-stone-300 rounded-2xl p-6 text-center hover:border-yellow-400 transition-colors cursor-pointer bg-stone-50/50">
                <input
                  type="file"
                  id="pdf-upload-input"
                  accept=".pdf"
                  onChange={(e) => e.target.files && setUploadFile(e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="pdf-upload-input" className="cursor-pointer space-y-2 block">
                  <FileText className="w-8 h-8 mx-auto text-yellow-600 animate-bounce" />
                  <p className="text-xs font-bold text-stone-800">
                    {uploadFile ? uploadFile.name : 'Click to select Textbook PDF'}
                  </p>
                  <p className="text-[10px] text-stone-400 font-medium">Supports PDF textbooks up to 50MB</p>
                </label>
              </div>

              <button
                type="submit"
                disabled={!uploadFile || uploading}
                className="w-full py-3 rounded-2xl text-xs font-bold bg-yellow-400 text-stone-900 hover:bg-yellow-300 transition-all disabled:opacity-50 shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Extracting Chunks & Vectorizing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Process & Index into ChromaDB
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Ingested Documents Table */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h2 className="text-base font-black text-stone-900">Vector Repository Documents</h2>
                <p className="text-xs text-stone-400">PDFs parsed into ChromaDB vector chunks</p>
              </div>
              <button
                onClick={fetchRagStatus}
                className="p-2 hover:bg-stone-100 rounded-xl text-stone-500 transition-colors"
                title="Refresh Status"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {loadingStatus ? (
              <div className="py-20 text-center text-stone-400 font-medium text-xs animate-pulse">
                Loading indexed documents...
              </div>
            ) : !ragStatus?.documents || ragStatus.documents.length === 0 ? (
              <div className="py-20 text-center text-stone-400 space-y-2">
                <Database className="w-12 h-12 mx-auto text-stone-300" />
                <p className="text-sm font-bold text-stone-600">No PDFs ingested in ChromaDB yet.</p>
                <p className="text-xs text-stone-400">Upload your first chapter PDF on the left to start vectorizing.</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {ragStatus.documents.map((doc) => (
                  <div key={doc.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-yellow-50 text-yellow-700 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate">{doc.filename}</p>
                        <p className="text-[10px] text-stone-400 font-medium">
                          {doc.board} &bull; {doc.classGrade} &bull; {doc.subject}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {doc.chunk_count} Chunks
                      </span>
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="p-1.5 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Remove Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: AI RAG PLAYGROUND & TEST CONSOLE
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'playground' && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-black text-stone-900">AI Teacher & RAG Query Playground</h2>
            <p className="text-xs text-stone-400">Test how the AI assistant responds using textbook RAG context and student persona</p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTestChat()}
                placeholder="Ask an educational or progress query (e.g. 'Explain Newton 3rd law in simple words', 'How is the student progressing?')..."
                className="w-full pl-4 pr-32 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                onClick={handleTestChat}
                disabled={testingLlm || !testQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-yellow-400 text-stone-900 rounded-xl text-xs font-bold hover:bg-yellow-300 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
              >
                {testingLlm ? 'Thinking...' : 'Test Response'}
              </button>
            </div>

            {testResponse && (
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                <div className="flex items-center gap-2 text-stone-500 font-bold uppercase text-[10px]">
                  <Bot className="w-3.5 h-3.5 text-yellow-600" />
                  <span>AI Teacher Response:</span>
                </div>
                <p className="text-stone-800 leading-relaxed font-medium whitespace-pre-wrap">{testResponse}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

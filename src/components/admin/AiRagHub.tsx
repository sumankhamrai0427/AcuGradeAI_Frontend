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
  Bot,
  PlusCircle,
  HelpCircle,
  X,
  Edit3,
  Sliders,
  ChevronRight,
  BookmarkCheck
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
  total_topics?: number;
  total_ai_exams?: number;
  total_documents: number;
  total_chunks: number;
  total_runbooks: number;
  documents: RagDocument[];
}

interface GeneratedQuestionItem {
  id: string;
  question: string;
  type: string;
  difficulty: string;
  marks: number;
  options: string[];
  correct_answer: string;
  explanation: string;
  topic_suggested?: string;
}

interface FlatTopic {
  id: number;
  name: string;
  chapterName: string;
  subjectName: string;
  className: string;
  boardName: string;
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

  // AI Question Generator Modal State
  const [generatorModalOpen, setGeneratorModalOpen] = useState(false);
  const [activeDocForGen, setActiveDocForGen] = useState<RagDocument | null>(null);
  const [genCount, setGenCount] = useState<number>(5);
  const [genType, setGenType] = useState<string>('MCQ');
  const [genDifficulty, setGenDifficulty] = useState<string>('medium');
  const [genInstructions, setGenInstructions] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestionItem[]>([]);
  const [selectedTargetTopicId, setSelectedTargetTopicId] = useState<number | null>(null);
  const [flatTopics, setFlatTopics] = useState<FlatTopic[]>([]);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
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

  const fetchCurriculumTopics = async () => {
    try {
      const res = await ApiServices.getCurriculumTree();
      const tree = Array.isArray(res) ? res : res?.tree || [];
      const topics: FlatTopic[] = [];
      tree.forEach((b: any) => {
        (b.classes || []).forEach((c: any) => {
          (c.subjects || []).forEach((s: any) => {
            (s.chapters || []).forEach((ch: any) => {
              (ch.topics || []).forEach((t: any) => {
                topics.push({
                  id: t.id,
                  name: t.topic_name,
                  chapterName: ch.chapter_name,
                  subjectName: s.subject_name,
                  className: c.class_name,
                  boardName: b.board_name
                });
              });
            });
          });
        });
      });
      setFlatTopics(topics);
      if (topics.length > 0 && !selectedTargetTopicId) {
        setSelectedTargetTopicId(topics[0].id);
      }
    } catch (err: any) {
      console.warn('Failed to load topics for Question Bank mapping:', err);
    }
  };

  useEffect(() => {
    fetchRagStatus();
    fetchCurriculumTopics();
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

      const res = await ApiServices.uploadRagFile(formData);
      showNotify('success', `PDF "${uploadFile.name}" indexed successfully!`);
      setUploadFile(null);
      await fetchRagStatus();

      // Automatically offer to generate questions from this newly uploaded document
      if (res && res.id) {
        const newDoc: RagDocument = {
          id: res.id,
          filename: res.filename || uploadFile.name,
          content_type: 'application/pdf',
          board: selectedBoard,
          classGrade: selectedGrade,
          subject: selectedSubject,
          status: 'PROCESSED',
          chunk_count: 1,
          created_at: new Date().toISOString()
        };
        openQuestionGenerator(newDoc);
      }
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

  // Open Question Generator Modal for a document
  const openQuestionGenerator = (doc: RagDocument) => {
    setActiveDocForGen(doc);
    setGeneratedQuestions([]);
    setGenCount(5);
    setGenType('MCQ');
    setGenDifficulty('medium');
    setGenInstructions('');

    // Pre-select matching topic based on doc subject/board if available
    const matched = flatTopics.find(
      t => t.boardName.toLowerCase() === (doc.board || '').toLowerCase() &&
           t.className.toLowerCase() === (doc.classGrade || '').toLowerCase() &&
           t.subjectName.toLowerCase() === (doc.subject || '').toLowerCase()
    ) || flatTopics[0];

    if (matched) {
      setSelectedTargetTopicId(matched.id);
    }
    setGeneratorModalOpen(true);
  };

  // Trigger AI Question Generation
  const handleGenerateQuestions = async () => {
    if (!activeDocForGen) return;
    setIsGenerating(true);
    try {
      const res = await ApiServices.generateRagQuestions({
        document_id: activeDocForGen.id,
        count: genCount,
        type: genType,
        difficulty: genDifficulty,
        instructions: genInstructions
      });

      const questionsList = res?.questions || res?.data?.questions || [];
      if (Array.isArray(questionsList) && questionsList.length > 0) {
        setGeneratedQuestions(questionsList);
        showNotify('success', `✨ Generated ${questionsList.length} questions from ${activeDocForGen.filename}!`);
      } else {
        showNotify('error', 'No questions were returned. Please try with different instructions.');
      }
    } catch (err: any) {
      console.error('Question generation error:', err);
      showNotify('error', err?.response?.data?.error?.message || 'Failed to generate questions with AI');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save generated questions to question_master
  const handleSaveQuestionsToBank = async () => {
    if (!selectedTargetTopicId) {
      showNotify('error', 'Please select a curriculum Topic to save questions under.');
      return;
    }
    if (generatedQuestions.length === 0) {
      showNotify('error', 'No questions to save.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await ApiServices.saveRagQuestions({
        topic_id: selectedTargetTopicId,
        questions: generatedQuestions
      });

      showNotify('success', res?.message || `Successfully saved ${generatedQuestions.length} questions to Question Bank!`);
      setGeneratorModalOpen(false);
      setGeneratedQuestions([]);
      fetchRagStatus();
    } catch (err: any) {
      console.error('Save questions error:', err);
      showNotify('error', err?.response?.data?.error?.message || 'Failed to save questions to database');
    } finally {
      setIsSaving(false);
    }
  };

  // Edit question locally
  const handleUpdateGeneratedQuestion = (index: number, updatedFields: Partial<GeneratedQuestionItem>) => {
    setGeneratedQuestions(prev => {
      const clone = [...prev];
      clone[index] = { ...clone[index], ...updatedFields };
      return clone;
    });
  };

  // Remove single generated question from review list
  const handleRemoveGeneratedQuestion = (index: number) => {
    setGeneratedQuestions(prev => prev.filter((_, i) => i !== index));
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

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-50/90 via-yellow-50/80 to-orange-50/60 border border-yellow-200/90 p-6 rounded-3xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-stone-900">Curriculum RAG & Question Synthesis Hub</h1>
          </div>
          <p className="text-xs text-stone-600 pl-11">
            Official NCERT & Board textbook ingestion engine. Generates semantic chunks into ChromaDB and auto-synthesizes exam questions into <code className="bg-yellow-200/60 px-1 rounded font-mono text-[11px]">question_master</code>.
          </p>
        </div>
        <button
          onClick={fetchRagStatus}
          disabled={loadingStatus}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-yellow-50 text-stone-800 rounded-xl text-xs font-semibold border border-yellow-300/80 shadow-2xs hover:border-yellow-400 transition-all cursor-pointer shrink-0 active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${loadingStatus ? 'animate-spin' : ''}`} />
          <span className="font-bold text-amber-950">Refresh Status</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
        <div className="flex items-center gap-2">
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
            <Cpu className="w-4 h-4 text-yellow-600" />
            AI Query Playground
          </button>
        </div>

        {/* Vector Store Status Badge */}
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200/80">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>ChromaDB Vector Store: Active</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          VECTOR STORE HEALTH & CURRICULUM METRICS CARDS
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Curriculum Topics</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-stone-900">
            {ragStatus?.total_topics ?? 0}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Mapped Core Learning Concepts
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
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Textbook Repository</span>
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
            <div>
              <h2 className="text-base font-black text-stone-900">Ingest Curriculum PDF</h2>
              <p className="text-xs text-stone-400">Upload chapters to extract chunks, vectorize, and generate examination questions</p>
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
                <p className="text-xs text-stone-400">PDFs parsed into ChromaDB vector chunks with 1-click Question Synthesis</p>
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
                  <div key={doc.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 p-2 rounded-2xl transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 border border-amber-200/60 font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate" title={doc.filename}>{doc.filename}</p>
                        <p className="text-[10px] text-stone-400 font-medium">
                          {doc.board || 'General'} &bull; {doc.classGrade || 'Standard'} &bull; {doc.subject || 'All'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {doc.chunk_count} Chunks
                      </span>

                      {/* ⚡ Generate Questions Action Button */}
                      <button
                        onClick={() => openQuestionGenerator(doc)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold text-[11px] shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                        title="Synthesize AI Questions from this document into question_master"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Generate Questions</span>
                      </button>

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
                placeholder="Ask an educational query (e.g. 'Explain Newton 3rd law in simple words', 'What is photosynthesis?')..."
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

      {/* ─────────────────────────────────────────────────────────────
          MODAL: AI QUESTION GENERATOR & REVIEW CONSOLE
         ───────────────────────────────────────────────────────────── */}
      {generatorModalOpen && activeDocForGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-100 bg-gradient-to-r from-yellow-50/90 to-amber-50/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-stone-900 flex items-center justify-center shadow-xs">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
                    <span>AI Question Generator from Document</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-yellow-200/70 text-yellow-900 border border-yellow-300">
                      Auto-Synthesis
                    </span>
                  </h3>
                  <p className="text-xs text-stone-600 truncate max-w-lg">
                    Source: <strong className="text-stone-800">{activeDocForGen.filename}</strong> ({activeDocForGen.board} &bull; {activeDocForGen.classGrade} &bull; {activeDocForGen.subject})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGeneratorModalOpen(false)}
                className="p-2 hover:bg-stone-200/60 rounded-xl text-stone-500 hover:text-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {/* Generation Settings Card */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  <span>Configure Question Synthesis Parameters</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">Number of Questions</label>
                    <select
                      value={genCount}
                      onChange={(e) => setGenCount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
                    >
                      <option value={3}>3 Questions</option>
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                      <option value={15}>15 Questions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">Question Type</label>
                    <select
                      value={genType}
                      onChange={(e) => setGenType(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
                    >
                      <option value="MCQ">MCQ (Multiple Choice)</option>
                      <option value="TRUE_FALSE">True / False</option>
                      <option value="SHORT_ANSWER">Short Answer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">Difficulty Calibration</label>
                    <select
                      value={genDifficulty}
                      onChange={(e) => setGenDifficulty(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
                    >
                      <option value="easy">Easy / Foundation</option>
                      <option value="medium">Medium / Standard</option>
                      <option value="hard">Hard / Analytical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">Custom Focus Instructions (Optional)</label>
                  <input
                    type="text"
                    value={genInstructions}
                    onChange={(e) => setGenInstructions(e.target.value)}
                    placeholder="e.g., Focus heavily on core definitions, formulas, and conceptual traps from the PDF..."
                    className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleGenerateQuestions}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-stone-900 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Analyzing Chunks & Synthesizing Questions...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {generatedQuestions.length > 0 ? 'Re-generate Questions' : 'Generate Questions with AI'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Generated Questions Preview & Review List */}
              {generatedQuestions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-black text-stone-900">
                        Generated Questions Preview ({generatedQuestions.length})
                      </span>
                    </div>

                    {/* Target Topic Selection for Database Linkage */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-stone-600 shrink-0">Save under Topic:</span>
                      <select
                        value={selectedTargetTopicId || ''}
                        onChange={(e) => setSelectedTargetTopicId(Number(e.target.value))}
                        className="px-3 py-1.5 bg-yellow-50/80 border border-yellow-300/80 rounded-xl text-xs font-bold text-stone-800 max-w-xs truncate"
                      >
                        {flatTopics.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.boardName} &bull; {t.className} &bull; {t.subjectName} &bull; {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {generatedQuestions.map((q, idx) => (
                      <div key={q.id || idx} className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-2 hover:border-yellow-300 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                              Q{idx + 1} &bull; {q.type}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              q.difficulty === 'hard'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : q.difficulty === 'medium'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {q.difficulty}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveGeneratedQuestion(idx)}
                            className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                            title="Remove this question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Editable Question Text */}
                        <textarea
                          value={q.question}
                          onChange={(e) => handleUpdateGeneratedQuestion(idx, { question: e.target.value })}
                          rows={2}
                          className="w-full p-2 bg-stone-50/70 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 leading-relaxed focus:bg-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                        />

                        {/* Options Display */}
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {q.options.map((opt, optIdx) => {
                              const isCorrect = opt.trim().toLowerCase().startsWith(q.correct_answer.toLowerCase()) ||
                                                opt.trim().toLowerCase().includes(q.correct_answer.toLowerCase()) ||
                                                (q.correct_answer.toUpperCase() === String.fromCharCode(65 + optIdx));
                              return (
                                <div
                                  key={optIdx}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center justify-between ${
                                    isCorrect
                                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                                      : 'bg-stone-50 text-stone-700 border-stone-200/70'
                                  }`}
                                >
                                  <span>{opt}</span>
                                  {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="p-2 rounded-xl bg-yellow-50/60 border border-yellow-200/60 text-[11px] text-yellow-900 font-medium">
                            💡 <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-medium">
                {generatedQuestions.length > 0 ? `${generatedQuestions.length} questions ready to save` : 'Select settings and click generate'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGeneratorModalOpen(false)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQuestionsToBank}
                  disabled={generatedQuestions.length === 0 || isSaving}
                  className="flex items-center gap-2 px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-stone-900 rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving to Database...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Save to Question Bank (<code className="bg-yellow-200/60 px-1 rounded font-mono text-[11px]">question_master</code>)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

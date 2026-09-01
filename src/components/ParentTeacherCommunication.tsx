import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, 
  Share2, 
  Send, 
  Paperclip, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  Plus, 
  Printer,
  ChevronRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  TeacherContact, 
  ParentTeacherMessage, 
  SharedDossier, 
  PTMSchedule,
  ChildAccount, 
  ParentAccount, 
  ExamSubmission 
} from '../types';
import { communicationApi } from '../lib/api';

interface ParentTeacherCommunicationProps {
  parentAccount: ParentAccount;
  activeChild: ChildAccount;
  recentSubmissions: ExamSubmission[];
  onViewSubmissionReport?: (submission: ExamSubmission) => void;
}

export const ParentTeacherCommunication: React.FC<ParentTeacherCommunicationProps> = ({
  parentAccount,
  activeChild,
  recentSubmissions,
  onViewSubmissionReport
}) => {
  const [activeTab, setActiveTab] = useState<'messages' | 'dossiers' | 'schedule'>('messages');
  
  // Dynamic Live State
  const [teachers, setTeachers] = useState<TeacherContact[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  
  const [messages, setMessages] = useState<ParentTeacherMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [selectedSubmissionForAttachment, setSelectedSubmissionForAttachment] = useState<string>('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const [sharedDossiers, setSharedDossiers] = useState<SharedDossier[]>([]);
  const [isLoadingDossiers, setIsLoadingDossiers] = useState(false);
  const [isCreatingDossier, setIsCreatingDossier] = useState(false);
  const [isSubmittingDossier, setIsSubmittingDossier] = useState(false);
  const [dossierNotes, setDossierNotes] = useState(`Comprehensive Class ${activeChild.classGrade} Diagnostic dossier across 10-mark sprints for term review.`);
  const [dossierRecipients, setDossierRecipients] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const [ptmSchedules, setPtmSchedules] = useState<PTMSchedule[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTopic, setScheduledTopic] = useState('Review K-Graph Topic Mastery & Misconceptions');
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // ------------------------------------------------------------
  // Live On-Demand Fetchers (Pure Live API - Zero Cache)
  // ------------------------------------------------------------
  const fetchTeachers = useCallback(async () => {
    setIsLoadingTeachers(true);
    try {
      const list = await communicationApi.listTeachers();
      const formatted = list.map((t: TeacherContact) => ({
        ...t,
        avatar: t.avatar || '🧑‍🏫',
      }));
      setTeachers(formatted);
      if (formatted.length > 0 && !selectedTeacherId) {
        setSelectedTeacherId(formatted[0].id);
      }
    } catch (err) {
      console.error('Live fetchTeachers error:', err);
    } finally {
      setIsLoadingTeachers(false);
    }
  }, [selectedTeacherId]);

  const fetchConversations = useCallback(async () => {
    setIsLoadingMessages(true);
    try {
      const convos = await communicationApi.listConversations();
      const flatMessages: ParentTeacherMessage[] = [];
      for (const convo of convos) {
        const teacher = teachers.find((t) => t.id === convo.teacherId);
        for (const m of convo.messages) {
          flatMessages.push({
            id: m.id,
            parentId: parentAccount.id,
            parentName: parentAccount.name,
            teacherId: convo.teacherId,
            teacherName: teacher?.name || 'Teacher',
            childId: convo.studentId,
            childName: activeChild.name,
            senderRole: m.senderRole,
            message: m.message,
            timestamp: m.timestamp,
            attachedSubmissionId: m.attachedSubmissionId,
            actionItems: m.actionItems,
            status: m.status,
          });
        }
      }
      setMessages(flatMessages);
    } catch (err) {
      console.error('Live fetchConversations error:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [teachers, parentAccount.id, parentAccount.name, activeChild.name]);

  const fetchDossiers = useCallback(async () => {
    setIsLoadingDossiers(true);
    try {
      const list = await communicationApi.listDossiers();
      setSharedDossiers(
        list.map((d: any) => ({
          id: d.id,
          childId: d.studentId,
          childName: activeChild.name,
          parentName: parentAccount.name,
          shareToken: d.shareToken,
          createdAt: d.createdAt,
          expiresAt: d.expiresAt,
          notes: d.notes,
          recipients: d.recipients,
          includedSubmissionsCount: d.includedSubmissionsCount,
          status: d.status,
        }))
      );
    } catch (err) {
      console.error('Live fetchDossiers error:', err);
    } finally {
      setIsLoadingDossiers(false);
    }
  }, [activeChild.name, parentAccount.name]);

  const fetchSchedules = useCallback(async () => {
    setIsLoadingSchedules(true);
    try {
      const list = await communicationApi.listPTMSchedules();
      setPtmSchedules(list || []);
    } catch (err) {
      console.error('Live fetchSchedules error:', err);
    } finally {
      setIsLoadingSchedules(false);
    }
  }, []);

  // 1. Initial Load: Fetch Teachers on mount or child change
  useEffect(() => {
    fetchTeachers();
  }, [activeChild.id]);

  // 2. Tab 1: Live Conversations on Messages tab or teacher change
  useEffect(() => {
    if (activeTab === 'messages' && teachers.length > 0) {
      fetchConversations();
    }
  }, [activeTab, selectedTeacherId, teachers.length, activeChild.id]);

  // 3. Tab 2: Live Dossiers when Dossiers tab becomes active
  useEffect(() => {
    if (activeTab === 'dossiers') {
      fetchDossiers();
    }
  }, [activeTab, activeChild.id]);

  // 4. Tab 3: Live PTM Schedules when Schedule tab becomes active
  useEffect(() => {
    if (activeTab === 'schedule') {
      fetchSchedules();
    }
  }, [activeTab, activeChild.id]);

  // Set default dossier recipients once teachers load
  useEffect(() => {
    if (teachers.length > 0 && !dossierRecipients) {
      setDossierRecipients(teachers[0].email || '');
    }
  }, [teachers, dossierRecipients]);

  const activeTeacher = teachers.find(t => t.id === selectedTeacherId) || teachers[0] || {
    id: 't-1',
    name: 'School Faculty',
    role: 'Educator',
    subject: 'Academic Counselor',
    schoolName: activeChild.schoolName || 'School',
    email: 'faculty@school.edu',
    verified: true,
    avatar: '🧑‍🏫'
  };

  // Filter messages for current child & selected teacher
  const filteredMessages = messages.filter(
    m => m.childId === activeChild.id && m.teacherId === selectedTeacherId
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || isSendingMessage) return;

    setIsSendingMessage(true);
    try {
      const attachedSub = recentSubmissions.find(s => s.id === selectedSubmissionForAttachment);
      const { id: conversationId } = await communicationApi.createConversation(activeTeacher.id, activeChild.id);
      await communicationApi.sendMessage(conversationId, {
        message: messageInput.trim(),
        attachedSubmissionId: attachedSub?.id,
        actionItems: ['Review child diagnostic trends']
      });

      setMessageInput('');
      setSelectedSubmissionForAttachment('');
      await fetchConversations();
    } catch (err) {
      console.error('Send message failed:', err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleCreateDossierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingDossier) return;

    setIsSubmittingDossier(true);
    try {
      await communicationApi.createDossier({
        studentId: activeChild.id,
        notes: dossierNotes,
        recipients: dossierRecipients.split(',').map(s => s.trim()).filter(Boolean),
      });
      setIsCreatingDossier(false);
      await fetchDossiers();
    } catch (err) {
      console.error('Create dossier failed:', err);
    } finally {
      setIsSubmittingDossier(false);
    }
  };

  const handleCopyLink = (token: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://acugrade.ai';
    navigator.clipboard?.writeText(`${origin}/share/dossier/${token}`);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate || isSubmittingSchedule) return;

    setIsSubmittingSchedule(true);
    try {
      await communicationApi.schedulePTM({
        teacherId: activeTeacher.id,
        studentId: activeChild.id,
        scheduledAt: scheduledDate,
        topic: scheduledTopic.trim() || 'Review K-Graph Topic Mastery & Misconceptions',
      });
      setScheduleSuccess(true);
      setScheduledDate('');
      await fetchSchedules();
      setTimeout(() => setScheduleSuccess(false), 4000);
    } catch (err) {
      console.error('PTM schedule failed:', err);
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl sm:text-2xl">{activeChild.avatar}</span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Parent-Teacher Academic Bridge: <span className="text-indigo-600">{activeChild.name}</span>
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              {activeChild.schoolName || 'School Student'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Seamlessly synchronize your child's 10-mark diagnostic sprint analytics, misconception graphs, and study milestones with school teachers and educators.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCreatingDossier(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Generate Shareable Dossier</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'messages'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Teacher Messages & Feedback ({filteredMessages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dossiers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'dossiers'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Shared Academic Dossiers ({sharedDossiers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'schedule'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Schedule PTM / Review Check-In</span>
        </button>
      </div>

      {/* TAB 1: MESSAGES & CHAT WITH TEACHERS */}
      {activeTab === 'messages' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 4 Columns: Teachers Directory */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              School Faculty & Advisors ({teachers.length})
            </h2>

            <div className="space-y-2">
              {teachers.map((teacher) => {
                const isSelected = selectedTeacherId === teacher.id;
                return (
                  <div
                    key={teacher.id}
                    onClick={() => setSelectedTeacherId(teacher.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-100 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl shrink-0">
                        {teacher.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-bold text-xs text-slate-900 truncate">{teacher.name}</h3>
                          {teacher.verified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" title="Verified School Educator" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{teacher.role}</p>
                        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded mt-1 inline-block">
                          {teacher.subject}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 8 Columns: Active Conversation Thread */}
          <div className="lg:col-span-8 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden min-h-[520px]">
            {/* Thread Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-2xs">
                  {activeTeacher.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <span>{activeTeacher.name}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      Online / Verified
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeTeacher.role} • {activeTeacher.schoolName}
                  </p>
                </div>
              </div>

              <div className="text-right text-xs text-slate-400 hidden sm:block">
                <span>{activeTeacher.email}</span>
              </div>
            </div>

            {/* Message History */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[380px] bg-slate-50/30">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-semibold">No messages with {activeTeacher.name} yet</p>
                  <p className="text-[11px] mt-1">Send a note or attach an analytical diagnostic report below.</p>
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const isParent = msg.senderRole === 'parent';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isParent ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-700">
                          {isParent ? `${msg.parentName} (Parent)` : msg.teacherName}
                        </span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                          isParent
                            ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs shadow-2xs'
                        }`}
                      >
                        <p>{msg.message}</p>

                        {/* Attached Submission Report Badge */}
                        {msg.attachedSubmissionTitle && (
                          <div
                            onClick={() => {
                              if (msg.attachedSubmissionId && onViewSubmissionReport) {
                                const found = recentSubmissions.find(s => s.id === msg.attachedSubmissionId);
                                if (found) onViewSubmissionReport(found);
                              }
                            }}
                            className={`mt-3 p-2.5 rounded-xl border flex items-center justify-between gap-2 text-[11px] cursor-pointer transition-opacity hover:opacity-90 ${
                              isParent
                                ? 'bg-indigo-700/80 border-indigo-500 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate font-semibold">{msg.attachedSubmissionTitle}</span>
                            </div>
                            <span className="text-[10px] font-bold underline shrink-0">
                              View Report →
                            </span>
                          </div>
                        )}

                        {/* Action Items */}
                        {msg.actionItems && msg.actionItems.length > 0 && (
                          <div className={`mt-2.5 pt-2 border-t text-[11px] ${
                            isParent ? 'border-indigo-500 text-indigo-100' : 'border-slate-100 text-slate-600'
                          }`}>
                            <span className="font-bold block mb-1">🎯 Action Items:</span>
                            <ul className="list-disc list-inside space-y-0.5">
                              {msg.actionItems.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSend} className="p-3.5 border-t border-slate-200 bg-white">
              {/* Attachment selector */}
              {recentSubmissions.length > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    <Paperclip className="w-3 h-3 text-slate-400" />
                    Attach Test:
                  </span>
                  <select
                    value={selectedSubmissionForAttachment}
                    onChange={(e) => setSelectedSubmissionForAttachment(e.target.value)}
                    className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 max-w-xs truncate focus:outline-hidden"
                  >
                    <option value="">-- None (General Message) --</option>
                    {recentSubmissions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.examTitle} ({s.marksObtained}/10)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Write an academic note to ${activeTeacher.name}...`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: SHARED ACADEMIC DOSSIERS */}
      {activeTab === 'dossiers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-slate-800">Active Academic Dossiers & Share Links</h2>
              <p className="text-xs text-slate-400">Encrypted snapshot dossiers shared with educators, tutors, and schools</p>
            </div>

            <button
              onClick={() => setIsCreatingDossier(true)}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-indigo-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Dossier</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sharedDossiers.map((dossier) => (
              <div
                key={dossier.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 uppercase">
                      Active Dossier
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1.5">
                      Candidate: {dossier.childName}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Created by {dossier.parentName} • {new Date(dossier.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                    {dossier.shareToken}
                  </span>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {dossier.notes}
                </p>

                <div className="text-xs text-slate-500 space-y-1">
                  <span className="font-bold text-slate-700 block">Authorized Recipients:</span>
                  <div className="flex gap-1 flex-wrap">
                    {dossier.recipients.map((rec, i) => (
                      <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                        {rec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleCopyLink(dossier.shareToken)}
                    className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5"
                  >
                    {copiedToken === dossier.shareToken ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Secure URL</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SCHEDULE PTM / REVIEW */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-xl mx-auto space-y-5">
            <div className="text-center">
              <Calendar className="w-10 h-10 text-indigo-600 mx-auto mb-2" />
              <h2 className="font-bold text-base text-slate-900">Schedule Parent-Teacher Diagnostic Review</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Book a 15-minute academic consultation with {activeChild.name}’s educators to discuss RAG knowledge retention.
              </p>
            </div>

            {scheduleSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <h3 className="text-xs font-bold text-emerald-900">Review Request Dispatched & Saved!</h3>
                <p className="text-[11px] text-emerald-700">
                  The consultation has been synchronized with the database. Calendar invite sent to {parentAccount.email}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Select Faculty:</label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-1 focus:ring-indigo-500"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.role} - {t.subject})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Preferred Date & Time:</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Discussion Agenda / Topic:</label>
                  <input
                    type="text"
                    value={scheduledTopic}
                    onChange={(e) => setScheduledTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingSchedule}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{isSubmittingSchedule ? 'Saving to Database...' : 'Confirm Academic Review Slot'}</span>
                </button>
              </form>
            )}
          </div>

          {/* List of Scheduled Consultations */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Upcoming Scheduled Academic Consultations ({ptmSchedules.length})
                </h3>
                <p className="text-xs text-slate-400">Live meetings confirmed in MySQL database</p>
              </div>
            </div>

            {ptmSchedules.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <Calendar className="w-8 h-8 mx-auto mb-1.5 text-slate-300" />
                <p className="text-xs font-semibold">No consultations booked yet</p>
                <p className="text-[11px] text-slate-400">Schedule your first review session above.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {ptmSchedules.map((ptm) => (
                  <div
                    key={ptm.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{ptm.teacherName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                          {ptm.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{ptm.topic}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(ptm.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                        <span>•</span>
                        <span>Candidate: <strong className="text-slate-700">{ptm.studentName}</strong></span>
                      </div>
                    </div>

                    {ptm.meetingLink && (
                      <a
                        href={ptm.meetingLink}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Join Meeting</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Create New Dossier */}
      {isCreatingDossier && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">Generate Shareable Academic Dossier</h3>
            <p className="text-xs text-slate-500 mb-4">
              Packages {activeChild.name}’s 10-mark diagnostic exam history, topic mastery bars, and error classifications into an encrypted link.
            </p>

            <form onSubmit={handleCreateDossierSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Dossier Notes / Purpose:</label>
                <textarea
                  rows={3}
                  required
                  value={dossierNotes}
                  onChange={(e) => setDossierNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Educator Email Addresses (comma separated):</label>
                <input
                  type="text"
                  required
                  value={dossierRecipients}
                  onChange={(e) => setDossierRecipients(e.target.value)}
                  placeholder="e.g. s.mukherjee@dpsrkp.edu.in, a.verma@dpsrkp.edu.in"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingDossier(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xs"
                >
                  Generate & Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

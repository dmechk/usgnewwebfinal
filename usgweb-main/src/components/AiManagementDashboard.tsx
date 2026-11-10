import React, { useState, useEffect } from 'react';
import {
  Bot,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  HelpCircle,
  Settings,
  MessageSquare,
  Shield,
  Eye,
  X,
  Save,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  Clock,
  Layers,
} from 'lucide-react';
import { aiApi, KnowledgeArticleItem, FAQItem, AIChatSessionItem } from '../services/api';

interface AiManagementDashboardProps {
  userRole?: string;
}

export const AiManagementDashboard: React.FC<AiManagementDashboardProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'faqs' | 'config' | 'sessions'>('articles');
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── 1. Articles State ──
  const [articles, setArticles] = useState<KnowledgeArticleItem[]>([]);
  const [articleSearch, setArticleSearch] = useState('');
  const [articleCategory, setArticleCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticleItem | null>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  // Article Form State
  const [artTitle, setArtTitle] = useState('');
  const [artCategory, setArtCategory] = useState('general');
  const [artContent, setArtContent] = useState('');
  const [artSummary, setArtSummary] = useState('');
  const [artLanguage, setArtLanguage] = useState('en');
  const [artTags, setArtTags] = useState('');
  const [artIsPublished, setArtIsPublished] = useState(true);
  const [artIsApprovedForAI, setArtIsApprovedForAI] = useState(true);
  const [artPriority, setArtPriority] = useState(0);

  // ── 2. FAQs State ──
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [faqSearch, setFaqSearch] = useState('');
  const [faqCategory, setFaqCategory] = useState('all');
  const [selectedFaq, setSelectedFaq] = useState<FAQItem | null>(null);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);

  // FAQ Form State (Multi-language)
  const [faqQEn, setFaqQEn] = useState('');
  const [faqAEn, setFaqAEn] = useState('');
  const [faqQRw, setFaqQRw] = useState('');
  const [faqARw, setFaqARw] = useState('');
  const [faqQFr, setFaqQFr] = useState('');
  const [faqAFr, setFaqAFr] = useState('');
  const [faqCategoryVal, setFaqCategoryVal] = useState('general');
  const [faqTags, setFaqTags] = useState('');
  const [faqIsPublished, setFaqIsPublished] = useState(true);
  const [faqPriority, setFaqPriority] = useState(0);

  // ── 3. Configuration State ──
  const [aiEnabled, setAiEnabled] = useState(true);
  const [assistantName, setAssistantName] = useState('Ubumwe Digital Assistant');
  const [welcomeEn, setWelcomeEn] = useState('');
  const [welcomeRw, setWelcomeRw] = useState('');
  const [welcomeFr, setWelcomeFr] = useState('');

  // ── 4. Sessions State ──
  const [sessions, setSessions] = useState<AIChatSessionItem[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [isSessionDetailOpen, setIsSessionDetailOpen] = useState(false);

  // Load data on tab switch
  useEffect(() => {
    if (activeTab === 'articles') loadArticles();
    if (activeTab === 'faqs') loadFaqs();
    if (activeTab === 'config') loadConfig();
    if (activeTab === 'sessions') loadSessions();
  }, [activeTab]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // ── Loaders ──
  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const res = await aiApi.listArticles({
        category: articleCategory !== 'all' ? articleCategory : undefined,
        search: articleSearch.trim() || undefined,
        limit: 50,
      });
      if (res?.data?.articles) setArticles(res.data.articles);
    } catch (err: any) {
      showToast(err.message || 'Failed to load knowledge articles', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFaqs = async () => {
    setIsLoading(true);
    try {
      const res = await aiApi.listFaqs({
        category: faqCategory !== 'all' ? faqCategory : undefined,
        search: faqSearch.trim() || undefined,
        limit: 50,
      });
      if (res?.data?.faqs) setFaqs(res.data.faqs);
    } catch (err: any) {
      showToast(err.message || 'Failed to load FAQs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const res = await aiApi.getConfig();
      if (res?.data?.config) {
        const c = res.data.config;
        setAiEnabled(c.enabled !== false);
        setAssistantName(c.name || 'Ubumwe Digital Assistant');
        setWelcomeEn(c.welcomeMessageEn || '');
        setWelcomeRw(c.welcomeMessageRw || '');
        setWelcomeFr(c.welcomeMessageFr || '');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load AI configuration', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const res = await aiApi.listSessions({ limit: 40 });
      if (res?.data?.sessions) setSessions(res.data.sessions);
    } catch (err: any) {
      showToast(err.message || 'Failed to load chat sessions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Article Handlers ──
  const openNewArticleModal = () => {
    setSelectedArticle(null);
    setArtTitle('');
    setArtCategory('general');
    setArtContent('');
    setArtSummary('');
    setArtLanguage('en');
    setArtTags('');
    setArtIsPublished(true);
    setArtIsApprovedForAI(true);
    setArtPriority(0);
    setIsArticleModalOpen(true);
  };

  const openEditArticleModal = (art: KnowledgeArticleItem) => {
    setSelectedArticle(art);
    setArtTitle(art.title);
    setArtCategory(art.category);
    setArtContent(art.content);
    setArtSummary(art.summary || '');
    setArtLanguage(art.language || 'en');
    setArtTags((art.tags || []).join(', '));
    setArtIsPublished(art.isPublished);
    setArtIsApprovedForAI(art.isApprovedForAI);
    setArtPriority(art.priority || 0);
    setIsArticleModalOpen(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle.trim() || !artContent.trim()) {
      showToast('Title and content are required', 'error');
      return;
    }

    const payload: Partial<KnowledgeArticleItem> = {
      title: artTitle.trim(),
      category: artCategory,
      content: artContent.trim(),
      summary: artSummary.trim(),
      language: artLanguage,
      tags: artTags.split(',').map((t) => t.trim()).filter(Boolean),
      isPublished: artIsPublished,
      isApprovedForAI: artIsApprovedForAI,
      priority: Number(artPriority) || 0,
    };

    try {
      if (selectedArticle) {
        await aiApi.updateArticle(selectedArticle.id, payload);
        showToast('Knowledge article updated successfully');
      } else {
        await aiApi.createArticle(payload);
        showToast('Knowledge article created successfully');
      }
      setIsArticleModalOpen(false);
      loadArticles();
    } catch (err: any) {
      showToast(err.message || 'Failed to save knowledge article', 'error');
    }
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete article "${title}"?`)) return;
    try {
      await aiApi.deleteArticle(id);
      showToast('Article deleted');
      loadArticles();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete article', 'error');
    }
  };

  // ── FAQ Handlers ──
  const openNewFaqModal = () => {
    setSelectedFaq(null);
    setFaqQEn('');
    setFaqAEn('');
    setFaqQRw('');
    setFaqARw('');
    setFaqQFr('');
    setFaqAFr('');
    setFaqCategoryVal('general');
    setFaqTags('');
    setFaqIsPublished(true);
    setFaqPriority(0);
    setIsFaqModalOpen(true);
  };

  const openEditFaqModal = (faq: FAQItem) => {
    setSelectedFaq(faq);
    setFaqQEn(faq.question || faq.translations?.en?.question || '');
    setFaqAEn(faq.answer || faq.translations?.en?.answer || '');
    setFaqQRw(faq.translations?.rw?.question || '');
    setFaqARw(faq.translations?.rw?.answer || '');
    setFaqQFr(faq.translations?.fr?.question || '');
    setFaqAFr(faq.translations?.fr?.answer || '');
    setFaqCategoryVal(faq.category || 'general');
    setFaqTags((faq.tags || []).join(', '));
    setFaqIsPublished(faq.isPublished !== false);
    setFaqPriority(faq.priority || 0);
    setIsFaqModalOpen(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    const primaryQ = faqQEn || faqQRw || faqQFr;
    const primaryA = faqAEn || faqARw || faqAFr;

    if (!primaryQ.trim() || !primaryA.trim()) {
      showToast('At least one Question and Answer is required', 'error');
      return;
    }

    const payload: Partial<FAQItem> = {
      question: primaryQ.trim(),
      answer: primaryA.trim(),
      category: faqCategoryVal,
      tags: faqTags.split(',').map((t) => t.trim()).filter(Boolean),
      isPublished: faqIsPublished,
      priority: Number(faqPriority) || 0,
      translations: {
        en: { question: faqQEn.trim(), answer: faqAEn.trim() },
        rw: { question: faqQRw.trim(), answer: faqARw.trim() },
        fr: { question: faqQFr.trim(), answer: faqAFr.trim() },
      },
    };

    try {
      if (selectedFaq) {
        await aiApi.updateFaq(selectedFaq.id, payload);
        showToast('FAQ updated successfully');
      } else {
        await aiApi.createFaq(payload);
        showToast('FAQ created successfully');
      }
      setIsFaqModalOpen(false);
      loadFaqs();
    } catch (err: any) {
      showToast(err.message || 'Failed to save FAQ', 'error');
    }
  };

  const handleDeleteFaq = async (id: string, question: string) => {
    if (!window.confirm(`Are you sure you want to delete FAQ "${question}"?`)) return;
    try {
      await aiApi.deleteFaq(id);
      showToast('FAQ deleted');
      loadFaqs();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete FAQ', 'error');
    }
  };

  // ── Config Save ──
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await aiApi.updateConfig({
        enabled: aiEnabled,
        name: assistantName.trim(),
        welcomeMessageEn: welcomeEn.trim(),
        welcomeMessageRw: welcomeRw.trim(),
        welcomeMessageFr: welcomeFr.trim(),
      });
      showToast('AI Assistant configuration updated successfully');
    } catch (err: any) {
      showToast(err.message || 'Failed to update AI configuration', 'error');
    }
  };

  const viewSessionDetail = async (sessId: string) => {
    try {
      const res = await aiApi.getSession(sessId);
      if (res?.data?.session) {
        setSelectedSession(res.data.session);
        setIsSessionDetailOpen(true);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load session details', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Sub-navigation Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">
              Ubumwe SACCO AI Assistant & Knowledge Management
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage approved institutional knowledge, multi-language FAQs, assistant settings, and visitor session audit logs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('articles')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'articles'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Knowledge Articles</span>
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'faqs'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQs (3 Languages)</span>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'config'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Configuration</span>
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'sessions'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Visitor Sessions</span>
          </button>
        </div>
      </div>

      {/* Toast Banner */}
      {feedbackMsg && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-200'
              : 'bg-red-950/80 border border-red-500 text-red-200'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 1: KNOWLEDGE ARTICLES ──────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'articles' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search articles by title or keyword..."
                  value={articleSearch}
                  onChange={(e) => setArticleSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadArticles()}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={articleCategory}
                onChange={(e) => {
                  setArticleCategory(e.target.value);
                  setTimeout(loadArticles, 50);
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="services">Services</option>
                <option value="loans">Loans & Credit</option>
                <option value="savings">Savings Accounts</option>
                <option value="membership">Membership</option>
                <option value="branches">Branch Network</option>
                <option value="ussd">USSD & Mobile</option>
                <option value="governance">Governance & Policies</option>
              </select>

              <button
                onClick={loadArticles}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
              >
                Filter
              </button>
            </div>

            <button
              onClick={openNewArticleModal}
              className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Knowledge Article</span>
            </button>
          </div>

          {/* Articles Table */}
          <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Title & Summary</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Language</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">AI Approved</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {articles.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        {isLoading ? 'Loading articles...' : 'No knowledge articles found. Click "Add Knowledge Article" to create one.'}
                      </td>
                    </tr>
                  )}
                  {articles.map((art) => (
                    <tr key={art.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{art.title}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{art.summary || art.content}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-medium text-emerald-400 border border-slate-700/50">
                          {art.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 uppercase text-[11px] font-bold text-slate-400">{art.language}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            art.isPublished ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/40' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {art.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            art.isApprovedForAI ? 'bg-teal-950 text-teal-300 border border-teal-600/40' : 'bg-red-950 text-red-400'
                          }`}
                        >
                          {art.isApprovedForAI ? 'Approved' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditArticleModal(art)}
                            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 rounded transition-colors"
                            title="Edit Article"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(art.id, art.title)}
                            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-red-400 rounded transition-colors"
                            title="Delete Article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 2: FREQUENTLY ASKED QUESTIONS (3 LANGUAGES) ─────────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search FAQs across Kinyarwanda, English, French..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadFaqs()}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={faqCategory}
                onChange={(e) => {
                  setFaqCategory(e.target.value);
                  setTimeout(loadFaqs, 50);
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="membership">Membership</option>
                <option value="savings">Savings</option>
                <option value="loans">Loans</option>
                <option value="digital">Digital / USSD</option>
                <option value="branches">Branches</option>
                <option value="contact">Contact & Hours</option>
              </select>

              <button
                onClick={loadFaqs}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
              >
                Filter
              </button>
            </div>

            <button
              onClick={openNewFaqModal}
              className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Multi-Language FAQ</span>
            </button>
          </div>

          {/* FAQs List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {faqs.length === 0 && (
              <div className="col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
                {isLoading ? 'Loading FAQs...' : 'No FAQs found. Seed or create initial FAQs.'}
              </div>
            )}
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-emerald-700/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-950 border border-emerald-600/40 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      {faq.category}
                    </span>
                    {faq.priority > 0 && (
                      <span className="text-[10px] text-amber-400 font-bold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                        Priority {faq.priority}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditFaqModal(faq)}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(faq.id, faq.question)}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Multilingual Question Preview */}
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="font-bold text-slate-400 text-[10px] uppercase mr-1.5">[EN]:</span>
                    <span className="text-white font-medium">{faq.translations?.en?.question || faq.question}</span>
                  </div>
                  {faq.translations?.rw?.question && (
                    <div>
                      <span className="font-bold text-emerald-400 text-[10px] uppercase mr-1.5">[RW]:</span>
                      <span className="text-slate-300">{faq.translations.rw.question}</span>
                    </div>
                  )}
                  {faq.translations?.fr?.question && (
                    <div>
                      <span className="font-bold text-teal-400 text-[10px] uppercase mr-1.5">[FR]:</span>
                      <span className="text-slate-300">{faq.translations.fr.question}</span>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 line-clamp-3">
                  {faq.translations?.en?.answer || faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 3: ASSISTANT CONFIGURATION ─────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'config' && (
        <form onSubmit={handleSaveConfig} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-5 text-xs">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Official Assistant Global Parameters</span>
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Configure visitor welcome messaging, master enable/disable switch, and operational contact routing.
            </p>
          </div>

          {/* Enable / Disable Switch */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <div className="font-bold text-white text-xs">AI Assistant Operational Status</div>
              <div className="text-slate-400 text-[11px]">
                When disabled, visitors see a scheduled maintenance notice referring them to the telephone desk.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Digital Assistant Public Name</label>
            <input
              type="text"
              value={assistantName}
              onChange={(e) => setAssistantName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Multilingual Welcome Greetings */}
          <div className="space-y-3 pt-2">
            <div className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
              Welcome Messages by Language
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>English Greeting</span>
              </label>
              <textarea
                rows={2}
                value={welcomeEn}
                onChange={(e) => setWelcomeEn(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Kinyarwanda Greeting (Ikaze mu Kinyarwanda)</span>
              </label>
              <textarea
                rows={2}
                value={welcomeRw}
                onChange={(e) => setWelcomeRw(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                <span>French Greeting (Message d'accueil en Français)</span>
              </label>
              <textarea
                rows={2}
                value={welcomeFr}
                onChange={(e) => setWelcomeFr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Verified Institutional Contact Information Summary */}
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
            <div className="font-bold text-emerald-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Verified Institutional Escalation Routing (Locked for Security)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300 text-[11px]">
              <div>
                <span className="text-slate-500 block">Official Public Email:</span>
                <span className="font-mono text-white">ubumwesaccogakenke@gmail.com</span>
              </div>
              <div>
                <span className="text-slate-500 block">Official Public Telephone:</span>
                <span className="font-mono text-white">0786422080</span>
              </div>
              <div>
                <span className="text-slate-500 block">Official WhatsApp Desk:</span>
                <span className="font-mono text-white">+250786422080</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg shadow transition-colors text-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Assistant Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 4: VISITOR CHAT SESSIONS & CONVERSATION AUDIT ──────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-400">
            Audit trail of anonymous visitor conversations. Records are retained for 90 days in compliance with privacy regulations.
          </div>

          <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Session ID</th>
                  <th className="px-4 py-3">Language</th>
                  <th className="px-4 py-3">First Query Preview</th>
                  <th className="px-4 py-3">Escalated</th>
                  <th className="px-4 py-3">Inquiry Ref</th>
                  <th className="px-4 py-3">Last Active</th>
                  <th className="px-4 py-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      {isLoading ? 'Loading visitor interaction sessions...' : 'No visitor interaction records logged yet.'}
                    </td>
                  </tr>
                )}
                {sessions.map((s) => (
                  <tr key={s.sessionId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-emerald-400">{s.sessionId}</td>
                    <td className="px-4 py-3 uppercase text-[10px] font-bold text-slate-400">{s.preferredLanguage}</td>
                    <td className="px-4 py-3 max-w-[240px] truncate text-[11px] text-slate-300">
                      {s.preview || 'No text preview'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          s.escalated
                            ? 'bg-amber-950 text-amber-300 border border-amber-600/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {s.escalated ? 'Escalated' : 'Resolved'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-white">
                      {s.inquiryReference ? (
                        <span className="bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-600/40">
                          {s.inquiryReference}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-400">
                      {s.lastActivityAt ? new Date(s.lastActivityAt).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => viewSessionDetail(s.sessionId)}
                        className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 rounded transition-colors"
                        title="View Full Conversation"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── MODAL: CREATE / EDIT KNOWLEDGE ARTICLE ─────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 text-xs text-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>{selectedArticle ? 'Edit Knowledge Article' : 'New Knowledge Article'}</span>
              </h3>
              <button
                onClick={() => setIsArticleModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={artTitle}
                  onChange={(e) => setArtTitle(e.target.value)}
                  placeholder="e.g. Agricultural Harvest Seasonal Credit Policy"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={artCategory}
                    onChange={(e) => setArtCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none"
                  >
                    <option value="general">General</option>
                    <option value="services">Services</option>
                    <option value="loans">Loans & Credit</option>
                    <option value="savings">Savings Accounts</option>
                    <option value="membership">Membership</option>
                    <option value="branches">Branch Network</option>
                    <option value="ussd">USSD & Mobile</option>
                    <option value="governance">Governance & Policies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Language</label>
                  <select
                    value={artLanguage}
                    onChange={(e) => setArtLanguage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="rw">Kinyarwanda</option>
                    <option value="fr">French</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority Rank (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={artPriority}
                    onChange={(e) => setArtPriority(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Brief Summary (Optional)</label>
                <input
                  type="text"
                  value={artSummary}
                  onChange={(e) => setArtSummary(e.target.value)}
                  placeholder="One sentence description..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Article Content *</label>
                <textarea
                  required
                  rows={6}
                  value={artContent}
                  onChange={(e) => setArtContent(e.target.value)}
                  placeholder="Official verified details, eligibility, procedures, terms..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-xs focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={artTags}
                  onChange={(e) => setArtTags(e.target.value)}
                  placeholder="e.g. loans, agriculture, harvest, gakenke"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={artIsPublished}
                    onChange={(e) => setArtIsPublished(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-600 focus:ring-0"
                  />
                  <span>Published on Website</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={artIsApprovedForAI}
                    onChange={(e) => setArtIsApprovedForAI(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-600 focus:ring-0"
                  />
                  <span>Approved for AI Agent Retrieval</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsArticleModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                >
                  Save Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── MODAL: CREATE / EDIT MULTI-LANGUAGE FAQ ────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 text-xs text-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>{selectedFaq ? 'Edit Multi-Language FAQ' : 'New Multi-Language FAQ'}</span>
              </h3>
              <button
                onClick={() => setIsFaqModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={faqCategoryVal}
                    onChange={(e) => setFaqCategoryVal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  >
                    <option value="general">General</option>
                    <option value="membership">Membership</option>
                    <option value="savings">Savings Accounts</option>
                    <option value="loans">Loans & Credit</option>
                    <option value="digital">Digital / USSD</option>
                    <option value="branches">Branch Locations</option>
                    <option value="contact">Contact Information</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority Rank (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={faqPriority}
                    onChange={(e) => setFaqPriority(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs"
                  />
                </div>
              </div>

              {/* 1. English Version */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-blue-400 text-[10px] uppercase tracking-wider block">
                  1. English Version
                </span>
                <input
                  type="text"
                  placeholder="Question in English..."
                  value={faqQEn}
                  onChange={(e) => setFaqQEn(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                />
                <textarea
                  rows={2}
                  placeholder="Answer in English..."
                  value={faqAEn}
                  onChange={(e) => setFaqAEn(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 2. Kinyarwanda Version */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-emerald-400 text-[10px] uppercase tracking-wider block">
                  2. Kinyarwanda Version (Ikaze mu Kinyarwanda)
                </span>
                <input
                  type="text"
                  placeholder="Ikibazo mu Kinyarwanda..."
                  value={faqQRw}
                  onChange={(e) => setFaqQRw(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                <textarea
                  rows={2}
                  placeholder="Igisubizo mu Kinyarwanda..."
                  value={faqARw}
                  onChange={(e) => setFaqARw(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* 3. French Version */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-teal-400 text-[10px] uppercase tracking-wider block">
                  3. French Version (En Français)
                </span>
                <input
                  type="text"
                  placeholder="Question en Français..."
                  value={faqQFr}
                  onChange={(e) => setFaqQFr(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-teal-500"
                />
                <textarea
                  rows={2}
                  placeholder="Réponse en Français..."
                  value={faqAFr}
                  onChange={(e) => setFaqAFr(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={faqTags}
                  onChange={(e) => setFaqTags(e.target.value)}
                  placeholder="e.g. membership, savings, ussd"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="faqPub"
                  checked={faqIsPublished}
                  onChange={(e) => setFaqIsPublished(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-0"
                />
                <label htmlFor="faqPub" className="text-slate-300 cursor-pointer">
                  Published and Active for AI & Public Visitors
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                >
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── MODAL: CONVERSATION SESSION INSPECT ─────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {isSessionDetailOpen && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto p-5 text-xs text-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Session Inspection: {selectedSession.sessionId}</span>
                </h3>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Language: <span className="uppercase text-white font-bold">{selectedSession.preferredLanguage}</span> &middot; Escalated: {selectedSession.escalated ? 'Yes' : 'No'}
                </div>
              </div>
              <button
                onClick={() => setIsSessionDetailOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedSession.inquiryReference && (
              <div className="p-2.5 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center justify-between">
                <span>Associated Member Inquiry Reference:</span>
                <span className="font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-emerald-500/30">
                  {selectedSession.inquiryReference}
                </span>
              </div>
            )}

            <div className="space-y-3 pt-1">
              {(selectedSession.messages || []).map((msg: any, i: number) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border ${
                    msg.role === 'user'
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-emerald-950/30 border-emerald-800/40 text-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold uppercase tracking-wider text-emerald-400">
                      {msg.role === 'user' ? 'Visitor' : 'AI Digital Assistant'}
                    </span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  {msg.sourcesUsed && msg.sourcesUsed.length > 0 && (
                    <div className="mt-2 text-[9px] text-slate-400 border-t border-slate-800 pt-1 flex flex-wrap gap-1">
                      <span className="text-emerald-400 font-semibold">Sources:</span>
                      {msg.sourcesUsed.map((s: string, idx: number) => (
                        <span key={idx} className="bg-slate-800 px-1 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

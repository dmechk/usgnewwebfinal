import React from 'react';
import {
  Users,
  Briefcase,
  UserCheck,
  MessageSquare,
  TrendingUp,
  ShieldCheck,
  Layers,
  MapPin,
  Camera,
  Bell,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Bot,
  Activity,
  FileSpreadsheet,
  Award,
  ChevronRight,
  Building,
  Archive,
} from 'lucide-react';

interface DashboardOverviewProps {
  userRole?: string;
  userName?: string;
  stats: {
    totalStaff: number;
    totalApplications: number;
    totalJobApplicants: number;
    totalJobPostings: number;
    totalInquiries: number;
    totalAnnouncements: number;
    totalMoments: number;
    totalBranches: number;
    totalProducts: number;
    jobApplicationsList?: any[];
    applicationsList?: any[];
    inquiriesList?: any[];
  };
  saccoInfo?: any;
  onNavigateTab: (tabId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  userRole = 'ADMIN_IT',
  userName = 'Administrator',
  stats,
  saccoInfo,
  onNavigateTab,
}) => {
  // Calculate recruitment pipeline stages from actual data
  const rawApplicants = stats.jobApplicationsList || [];
  const pipeline = {
    applied: rawApplicants.filter(
      (a) => !a.status || a.status === 'APPLIED' || a.status === 'applied'
    ).length,
    screening: rawApplicants.filter(
      (a) => a.status === 'SCREENING' || a.status === 'screening' || a.status === 'shortlisted'
    ).length,
    interview: rawApplicants.filter(
      (a) => a.status === 'INTERVIEW' || a.status === 'interview'
    ).length,
    offer: rawApplicants.filter(
      (a) => a.status === 'OFFER' || a.status === 'offer'
    ).length,
    hired: rawApplicants.filter(
      (a) => a.status === 'HIRED' || a.status === 'hired' || a.status === 'approved'
    ).length,
    rejected: rawApplicants.filter(
      (a) => a.status === 'REJECTED' || a.status === 'rejected'
    ).length,
  };

  const totalPipeline = rawApplicants.length || 1;

  // Format today's date
  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Welcome & Institutional Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>UBUMWE SACCO WORKSPACE</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {todayFormatted}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Role: {userRole}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-emerald-400">{userName}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Institutional Operations &amp; Management Dashboard. Real-time oversight of cooperative membership, credit requests, recruitment deliberations, and public communications across all 19 sectors of Gakenke District.
            </p>
          </div>

          {/* Quick Regulatory Badge */}
          <div className="shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex flex-col gap-1.5 text-xs text-slate-200 min-w-[240px]">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>BNR &amp; RCA Supervised</span>
            </div>
            <div className="text-[11px] text-slate-300">
              License: <span className="font-mono text-white font-semibold">RCA-MF-2012-088</span>
            </div>
            <div className="text-[11px] text-slate-300">
              Coverage: <span className="text-white font-semibold">19 Sector Branches</span>
            </div>
            <div className="text-[11px] text-slate-300">
              Digital USSD: <span className="font-mono text-amber-300 font-bold">*541#</span> (24/7 Active)
            </div>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Primary KPI Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Staff Directory */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Authorized Staff
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalStaff}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active accounts across IT, Board, HR, DAF, and Media
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('users')}
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
          >
            <span>Manage Staff &amp; Roles</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Card 2: Recruitment & Applicants */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Job Candidates
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalJobApplicants}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stats.totalJobPostings} active vacancies currently published
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('job-applicants')}
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <span>Review Deliberation Files</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Card 3: Member Onboarding / KYC & Loans */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Member KYC &amp; Loans
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalApplications}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Online account opening &amp; credit application requests
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('applications')}
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
          >
            <span>Process KYC Records</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Card 4: Citizen Inquiries */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Citizen Inquiries
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalInquiries}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Inquiries received via official website contact portal
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('inquiries')}
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
          >
            <span>Inquiries Response Desk</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">Published Vacancies</div>
          <div className="text-xl font-extrabold text-slate-800 mt-0.5">{stats.totalJobPostings}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">Active Postings</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">Bulletins &amp; News</div>
          <div className="text-xl font-extrabold text-slate-800 mt-0.5">{stats.totalAnnouncements}</div>
          <div className="text-[10px] text-blue-600 font-semibold">Press Releases</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">Photo Moments</div>
          <div className="text-xl font-extrabold text-slate-800 mt-0.5">{stats.totalMoments}</div>
          <div className="text-[10px] text-indigo-600 font-semibold">Gallery Moments</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">Sector Branches</div>
          <div className="text-xl font-extrabold text-slate-800 mt-0.5">19</div>
          <div className="text-[10px] text-slate-500 font-semibold">District Coverage</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">Financial Products</div>
          <div className="text-xl font-extrabold text-slate-800 mt-0.5">{stats.totalProducts}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">Savings &amp; Credit</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase text-slate-400">AI Assistant Desk</div>
          <div className="text-xl font-extrabold text-slate-800 mt-0.5">24/7</div>
          <div className="text-[10px] text-purple-600 font-semibold">EN • FR • RW</div>
        </div>
      </div>

      {/* Main Grid: Visual Pipeline & Operational Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recruitment Pipeline Breakdown & Funnel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-700" />
                <span>Recruitment Pipeline &amp; Talent Deliberation</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribution of candidate dossiers through the official recruitment workflow
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('job-applicants')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
            >
              Open Pipeline
            </button>
          </div>

          {/* Stage Funnel Bars */}
          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                <span>1. Applied (Initial Submissions)</span>
                <span className="font-mono text-slate-900">{pipeline.applied} candidates</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(8, (pipeline.applied / totalPipeline) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                <span>2. Screening (HR Dossier Review)</span>
                <span className="font-mono text-slate-900">{pipeline.screening} candidates</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(8, (pipeline.screening / totalPipeline) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                <span>3. Interview Scheduled &amp; Oral Exams</span>
                <span className="font-mono text-slate-900">{pipeline.interview} candidates</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(8, (pipeline.interview / totalPipeline) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                <span>4. Conditional Offer Issued</span>
                <span className="font-mono text-slate-900">{pipeline.offer} candidates</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(8, (pipeline.offer / totalPipeline) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                <span>5. Hired / Appointed to Post</span>
                <span className="font-mono text-slate-900">{pipeline.hired} candidates</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(8, (pipeline.hired / totalPipeline) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center justify-between border border-slate-200/60">
            <span className="text-[11px] text-slate-500">
              Total candidates logged in system: <strong>{rawApplicants.length}</strong>
            </span>
            <span className="text-[11px] text-rose-600 font-semibold">
              Archived/Rejected: {pipeline.rejected}
            </span>
          </div>
        </div>

        {/* Right Col: Departmental Quick Action Shortcuts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Workspace Quick Actions</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rapid access to essential operational and administrative modules
            </p>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => onNavigateTab('users')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-purple-900">
                      Staff &amp; Users
                    </div>
                    <div className="text-[10px] text-slate-500">14 staff accounts &amp; RBAC</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-purple-700 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('job-applicants')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                      Job Candidates
                    </div>
                    <div className="text-[10px] text-slate-500">Deliberate applications</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-700 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('careers')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                      Post New Vacancy
                    </div>
                    <div className="text-[10px] text-slate-500">Publish open positions</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-700 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('announcements')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-amber-900">
                      News &amp; Bulletins
                    </div>
                    <div className="text-[10px] text-slate-500">Publish public notices</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-amber-700 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('ai-assistant')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                      AI Assistant Desk
                    </div>
                    <div className="text-[10px] text-slate-500">Institutional knowledge base</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-700 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('archive')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                    <Archive className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-violet-900">
                      Backup &amp; Archive
                    </div>
                    <div className="text-[10px] text-slate-500">Restore items &amp; site snapshots</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-violet-700 transition-all" />
              </button>
            </div>
          </div>

          <div className="p-3 bg-gradient-to-r from-emerald-900 to-slate-900 rounded-xl text-white text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-emerald-300">
              <Building className="w-3.5 h-3.5" />
              <span>Gakenke Commercial Center HQ</span>
            </div>
            <div className="text-[11px] text-slate-300">
              Hours: Mon - Fri: 8:00 AM - 5:00 PM | Sat: 8:00 AM - 1:00 PM
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


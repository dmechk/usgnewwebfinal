import React from 'react';
import {
  ArrowLeft, Briefcase, MapPin, Calendar, CheckCircle2,
  Sparkles, Clock, DollarSign, ArrowRight
} from 'lucide-react';
import type { JobPosting } from '../types';

interface JobDetailsPageProps {
  job: JobPosting | null;
  currentLang: string;
  onBack: () => void;
  onApply: (job: JobPosting) => void;
}

export const JobDetailsPage: React.FC<JobDetailsPageProps> = ({
  job,
  currentLang,
  onBack,
  onApply,
}) => {
  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-slate-500 text-lg font-semibold mb-4">Job not found.</p>
          <button onClick={onBack} className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-bold cursor-pointer">
            ← Back to Careers
          </button>
        </div>
      </div>
    );
  }

  const isClosed = job.status === 'closed';

  const jobTitle = currentLang === 'fr'
    ? job.titleFr || job.titleEn
    : currentLang === 'rw'
    ? job.titleRw || job.titleEn
    : job.titleEn;

  const department = currentLang === 'rw'
    ? job.departmentRw || job.departmentEn
    : job.departmentEn;

  const description = currentLang === 'rw'
    ? job.descriptionRw || job.descriptionEn
    : job.descriptionEn;

  const requirements = currentLang === 'rw'
    ? job.requirementsRw || job.requirementsEn
    : job.requirementsEn;

  const responsibilities = currentLang === 'rw'
    ? job.responsibilitiesRw || job.responsibilitiesEn
    : job.responsibilitiesEn;

  const deadlineDate = job.deadline
    ? new Date(job.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Open';

  const isDeadlineSoon = job.deadline
    ? (new Date(job.deadline).getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000
    : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100">

      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Careers
          </button>

          {!isClosed && (
            <button
              onClick={() => onApply(job)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              Apply Now
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-10">
          {/* Status badge */}
          <div className="flex items-center gap-2 mb-5">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isClosed
                ? 'bg-red-100 text-red-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {!isClosed && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              {isClosed ? 'Position Closed' : 'Now Hiring'}
            </span>
            <span className="text-xs text-slate-400 font-semibold">{department}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-6">
            {jobTitle}
          </h1>

          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-1">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</span>
              <span className="text-sm font-bold text-slate-800">{job.location}</span>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-1">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</span>
              <span className="text-sm font-bold text-slate-800 capitalize">{job.employmentType?.replace('_', ' ') || 'Full Time'}</span>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-1">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salary</span>
              <span className="text-sm font-bold text-slate-800">{job.salaryRange || 'Competitive'}</span>
            </div>
            <div className={`rounded-2xl p-4 flex flex-col gap-1 ${isDeadlineSoon && !isClosed ? 'bg-red-50' : 'bg-slate-50'}`}>
              <Calendar className={`w-4 h-4 ${isDeadlineSoon && !isClosed ? 'text-red-500' : 'text-emerald-600'}`} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deadline</span>
              <span className={`text-sm font-bold ${isDeadlineSoon && !isClosed ? 'text-red-600' : 'text-slate-800'}`}>
                {deadlineDate}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{description}</p>
        </div>

        {/* Requirements */}
        {requirements && requirements.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-10">
            <h2 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Requirements & Profile
            </h2>
            <ul className="space-y-3">
              {requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Responsibilities */}
        {responsibilities && responsibilities.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-10">
            <h2 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Responsibilities
            </h2>
            <ul className="space-y-3">
              {responsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  {resp}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        {!isClosed && (
          <div className="bg-emerald-700 rounded-3xl p-8 sm:p-10 text-center">
            <h2 className="text-2xl font-black text-white mb-2">Interested in this role?</h2>
            <p className="text-emerald-100 text-sm mb-6">Submit your application before the deadline — {deadlineDate}</p>
            <button
              onClick={() => onApply(job)}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white hover:bg-emerald-50 text-emerald-800 font-black rounded-xl transition-colors cursor-pointer shadow-lg text-base"
            >
              Apply for this Position
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {isClosed && (
          <div className="bg-slate-100 rounded-3xl p-8 text-center">
            <p className="text-slate-500 font-semibold">This position is no longer accepting applications.</p>
            <button onClick={onBack} className="mt-4 px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm cursor-pointer">
              View Other Vacancies
            </button>
          </div>
        )}

      </div>
    </div>
  );
};


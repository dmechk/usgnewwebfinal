import React from 'react';
import { JobApplication, Language } from '../types';
import { SACCO_INFO } from '../data/saccoData';
import {
  X,
  Printer,
  Download,
  Building,
  CheckCircle2,
  ShieldCheck,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Briefcase,
  Star,
  FileText,
} from 'lucide-react';
import { ImigongoRibbon } from './ImigongoPattern';

interface ApplicantDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: JobApplication | null;
  currentLang: Language;
}

export const ApplicantDossierModal: React.FC<ApplicantDossierModalProps> = ({
  isOpen,
  onClose,
  applicant,
  currentLang,
}) => {
  if (!isOpen || !applicant) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: JobApplication['status']) => {
    switch (status) {
      case 'accepted':
        return { label: 'OFFER EXTENDED / ACCEPTED', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'interview':
        return { label: 'INTERVIEW SCHEDULED', bg: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'shortlisted':
        return { label: 'SHORTLISTED CANDIDATE', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'not_shortlisted':
        return { label: 'NOT SHORTLISTED', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'waitlisted':
        return { label: 'WAITLISTED / RESERVE POOL', bg: 'bg-teal-100 text-teal-800 border-teal-300' };
      case 'rejected':
        return { label: 'APPLICATION REGRET', bg: 'bg-red-100 text-red-800 border-red-300' };
      default:
        return { label: 'UNDER PRELIMINARY REVIEW', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
    }
  };

  const badge = getStatusBadge(applicant.status);

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-950/90 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[96vh] flex flex-col print:max-w-none print:w-full print:shadow-none print:border-none print:m-0 print:rounded-none">
        {/* Printable Top Ribbon (Hidden in print if desired or styled neatly) */}
        <div className="print:hidden">
          <ImigongoRibbon height={8} variant="light" bordered={false} />
        </div>

        {/* Modal Header Actions (Hidden in Print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Official Candidate Dossier · PDF &amp; Print Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOSSIER SHEET */}
        <div className="p-8 sm:p-10 overflow-y-auto space-y-6 flex-1 bg-white text-slate-800 font-sans print:p-8 print:overflow-visible">
          {/* Official Cooperative Header */}
          <div className="border-b-2 border-slate-900 pb-5 space-y-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold tracking-widest text-emerald-800 uppercase block">
                  REPUBLIC OF RWANDA · NORTHERN PROVINCE · GAKENKE DISTRICT
                </span>
                <h1 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
                  {SACCO_INFO.name}
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Savings &amp; Credit Cooperative Society · Regulated by RCA ({SACCO_INFO.rcaRegistration}) &amp; BNR
                </p>
                <p className="text-xs text-slate-500">
                  Headquarters: {SACCO_INFO.headquarters} · Tel: {SACCO_INFO.phone} · Email: {SACCO_INFO.email}
                </p>
              </div>

              {/* Official Seal Badge */}
              <div className="border-2 border-dashed border-emerald-700 p-2.5 rounded-2xl text-center bg-emerald-50/50 shrink-0">
                <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-widest block">
                  OFFICIAL HR DOSSIER
                </span>
                <span className="text-xs font-mono font-bold text-slate-900 block mt-0.5">
                  REF: {applicant.id.toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Date: {applicant.appliedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Dossier Title Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Position Applied For
              </span>
              <h2 className="text-lg font-bold text-slate-950">
                {applicant.jobTitle}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${badge.bg}`}>
                {badge.label}
              </span>
              {applicant.verified && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-700 text-white flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>NID VERIFIED</span>
                </span>
              )}
            </div>
          </div>

          {/* Section 1: Candidate Personal Details */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-700" />
              <span>1. Candidate Profile &amp; Civil Identification</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div>
                  <span className="text-slate-500 block">Full Legal Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{applicant.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Rwandan National ID Number:</span>
                  <span className="font-mono font-bold text-slate-900">{applicant.nationalId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Residence Sector (Gakenke):</span>
                  <span className="font-semibold text-slate-900">{applicant.residenceSector}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-slate-500 block">Telephone Contact:</span>
                  <span className="font-bold text-slate-900">{applicant.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Electronic Mail (Email):</span>
                  <span className="font-bold text-slate-900">{applicant.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Application Submission Date:</span>
                  <span className="font-semibold text-slate-900">{applicant.appliedDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Education & Professional Qualifications */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-700" />
              <span>2. Qualifications &amp; Work Experience</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Highest Level of Education:</span>
                <span className="font-bold text-slate-900">{applicant.educationLevel}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Relevant Industry Experience:</span>
                <span className="font-bold text-slate-900">{applicant.yearsExperience} Years</span>
              </div>
              {applicant.cvFileName && (
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block">Attached Curriculum Vitae (CV):</span>
                  <span className="font-semibold text-emerald-800">{applicant.cvFileName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Motivation Statement */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>3. Candidate Statement of Motivation &amp; Vision</span>
            </h3>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {applicant.coverLetter}
            </div>
          </div>

          {/* Section 4: Recruitment Committee Evaluation */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-emerald-700" />
              <span>4. HR Committee Appraisal &amp; Audit Notes</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Evaluation Score:</span>
                <span className="font-bold text-slate-900">
                  {applicant.rating ? `${applicant.rating} / 5 Stars` : 'Pending Score'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Feedback Email Dispatched:</span>
                <span className="font-bold text-slate-900">
                  {applicant.emailFeedbackSent ? `YES (${applicant.lastFeedbackDate})` : 'Awaiting Dispatch'}
                </span>
              </div>
              {applicant.notes && (
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block">Committee Observations:</span>
                  <span className="italic text-slate-700">{applicant.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Official Signatures Strip */}
          <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs text-slate-700">
            <div>
              <span className="font-bold text-slate-900 block">Human Resources Committee</span>
              <div className="h-12 border-b border-dashed border-slate-400 mt-2" />
              <span className="text-[11px] text-slate-500 block mt-1">Verified &amp; Evaluated</span>
            </div>

            <div>
              <span className="font-bold text-slate-900 block">
                Mbitsemunda Phocas (General Manager)
              </span>
              <div className="h-12 border-b border-dashed border-slate-400 mt-2" />
              <span className="text-[11px] text-slate-500 block mt-1">
                Executive Approval · UBUMWE SACCO GAKENKE
              </span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Close (Hidden in Print) */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 print:hidden">
          <span>Click "Print / Save PDF" to generate or print the official PDF dossier.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};

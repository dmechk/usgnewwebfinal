import React, { useState } from 'react';
import {
  ArrowLeft, Briefcase, User, Phone, Mail, IdCard,
  MapPin, GraduationCap, FileText, Upload, CheckCircle2, AlertCircle, Send
} from 'lucide-react';
import type { JobPosting, JobApplication } from '../types';

interface JobApplyPageProps {
  job: JobPosting | null;
  jobPostings: JobPosting[];
  currentLang: string;
  onBack: () => void;
  onSubmit: (app: Omit<JobApplication, 'id' | 'appliedDate' | 'status'>) => void;
}

export const JobApplyPage: React.FC<JobApplyPageProps> = ({
  job,
  jobPostings,
  currentLang,
  onBack,
  onSubmit,
}) => {
  const selectedJob = job || jobPostings[0] || null;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [sector, setSector] = useState('Gakenke');
  const [education, setEducation] = useState("Bachelor's Degree (A0) in Finance & Banking");
  const [experience, setExperience] = useState(1);
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFileName, setCvFileName] = useState('');
  const [cvFileData, setCvFileData] = useState('');
  const [motivFileName, setMotivFileName] = useState('');
  const [motivFileData, setMotivFileData] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);

  const jobTitle = selectedJob
    ? currentLang === 'fr'
      ? selectedJob.titleFr || selectedJob.titleEn
      : currentLang === 'rw'
      ? selectedJob.titleRw
      : selectedJob.titleEn
    : 'General Application';

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrorMsg('CV must be under 5MB.'); return; }
    setCvFileName(file.name);
    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === 'string') setCvFileData(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleMotivUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setErrorMsg('Motivation letter must be under 10MB.'); return; }
    setMotivFileName(file.name);
    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === 'string') setMotivFileData(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setErrorMsg('Full name and phone number are required.');
      return;
    }
    if (nationalId.replace(/\D/g, '').length !== 16) {
      setErrorMsg('Rwandan National ID must be exactly 16 digits.');
      return;
    }
    const ref = `UBUMWE-${Date.now().toString().slice(-6)}`;
    onSubmit({
      jobId: selectedJob?.id || 'job-general',
      jobTitle,
      fullName: fullName.trim(),
      email: email.trim() || `${phone.replace(/\D/g, '')}@applicant.sacco`,
      phone: phone.trim(),
      nationalId: nationalId.trim(),
      residenceSector: sector,
      educationLevel: education,
      yearsExperience: Number(experience),
      coverLetter: coverLetter.trim() || 'Submitted via online application portal.',
      cvFileName: cvFileName || 'Resume.pdf',
      cvFileData: cvFileData || undefined,
      motivationLetterFileName: motivFileName || undefined,
      motivationLetterFileData: motivFileData || undefined,
    });
    setSubmitted(ref);
    setErrorMsg('');
  };

  // ── SUCCESS SCREEN ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Application Submitted!</h2>
          <p className="text-slate-500 mb-4">Your application for <span className="font-bold text-emerald-700">{jobTitle}</span> has been received.</p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-4 mb-8">
            <p className="text-xs text-emerald-700 font-semibold uppercase tracking-widest mb-1">Reference Number</p>
            <p className="text-2xl font-black text-emerald-800 tracking-widest">{submitted}</p>
          </div>
          <p className="text-sm text-slate-400 mb-8">Keep this reference. We will contact you via phone or email.</p>
          <button
            onClick={onBack}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Back to Careers
          </button>
        </div>
      </div>
    );
  }

  // ── APPLY FORM PAGE ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Careers
          </button>
          <div className="h-5 w-px bg-slate-300" />
          <div className="flex items-center gap-2 min-w-0">
            <Briefcase className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-sm font-bold text-slate-800 truncate">{jobTitle}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Briefcase className="w-3.5 h-3.5" />
            Job Application
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">{jobTitle}</h1>
          {selectedJob && (
            <div className="flex flex-wrap gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-emerald-500" />{selectedJob.location}</span>
              <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-emerald-500" />{selectedJob.departmentEn}</span>
              {selectedJob.deadline && (
                <span className="flex items-center gap-1.5 text-red-500 font-semibold">
                  Deadline: {new Date(selectedJob.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

          {/* Section: Personal Info */}
          <div className="px-6 sm:px-10 py-8 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" /> Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm font-medium text-slate-800 placeholder-slate-400"
                />
              </div>
              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5"><Phone className="inline w-3.5 h-3.5 mr-1" />Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. 0788 123 456"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm font-medium text-slate-800 placeholder-slate-400"
                />
              </div>
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5"><Mail className="inline w-3.5 h-3.5 mr-1" />Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm font-medium text-slate-800 placeholder-slate-400"
                />
              </div>
              {/* National ID */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5"><IdCard className="inline w-3.5 h-3.5 mr-1" />National ID <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={e => setNationalId(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="16-digit National ID"
                  maxLength={16}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm font-mono font-medium text-slate-800 placeholder-slate-400"
                />
                <p className="text-xs text-slate-400 mt-1">{nationalId.length}/16 digits</p>
              </div>
              {/* Sector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5"><MapPin className="inline w-3.5 h-3.5 mr-1" />Residence Sector</label>
                <input
                  type="text"
                  value={sector}
                  onChange={e => setSector(e.target.value)}
                  placeholder="e.g. Gakenke"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm font-medium text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Section: Qualifications */}
          <div className="px-6 sm:px-10 py-8 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-600" /> Qualifications
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Education Level</label>
                <select
                  value={education}
                  onChange={e => setEducation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm font-medium text-slate-800 bg-white"
                >
                  <option>Certificate / A2</option>
                  <option>Diploma / A1</option>
                  <option>Bachelor's Degree (A0) in Finance & Banking</option>
                  <option>Bachelor's Degree (A0) in Accounting & Finance</option>
                  <option>Bachelor's Degree (A0) in Business Administration</option>
                  <option>Bachelor's Degree (A0) in Economics</option>
                  <option>Bachelor's Degree (A0) in Computer Science / IT</option>
                  <option>Master's Degree</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Years of Experience</label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={experience}
                  onChange={e => setExperience(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section: Documents */}
          <div className="px-6 sm:px-10 py-8 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-600" /> Documents
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* CV Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">CV / Resume <span className="text-slate-400">(PDF, max 5MB)</span></label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-xl p-6 cursor-pointer transition-colors bg-slate-50 hover:bg-emerald-50">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-500">
                    {cvFileName ? cvFileName : 'Click to upload CV'}
                  </span>
                  {cvFileName && <span className="text-xs text-emerald-600 font-bold">✓ File selected</span>}
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvUpload} className="hidden" />
                </label>
              </div>
              {/* Motivation Letter Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Motivation Letter <span className="text-slate-400">(PDF, max 10MB)</span></label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-xl p-6 cursor-pointer transition-colors bg-slate-50 hover:bg-emerald-50">
                  <FileText className="w-6 h-6 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-500">
                    {motivFileName ? motivFileName : 'Click to upload Letter'}
                  </span>
                  {motivFileName && <span className="text-xs text-emerald-600 font-bold">✓ File selected</span>}
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleMotivUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Section: Cover Letter */}
          <div className="px-6 sm:px-10 py-8">
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" /> Cover Letter / Message
            </h2>
            <textarea
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              rows={5}
              placeholder="Tell us why you are the right candidate for this position..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm font-medium text-slate-800 placeholder-slate-400 resize-none"
            />
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="mx-6 sm:mx-10 mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <div className="px-6 sm:px-10 pb-10 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 sm:flex-none py-3 px-8 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-8 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
            >
              <Send className="w-4 h-4" />
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


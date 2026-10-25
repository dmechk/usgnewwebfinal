import React, { useState, useEffect } from 'react';
import { JobApplication, Language } from '../types';
import { SACCO_INFO } from '../data/saccoData';
import { validateRwandaNID, exportApplicantsToExcel } from '../utils/applicantExport';
import {
  X,
  Mail,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Send,
  ExternalLink,
  FileText,
  Download,
  Star,
  Printer,
  Check,
  Building,
  UserCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ImigongoRibbon } from './ImigongoPattern';

interface ApplicantFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: JobApplication | null;
  currentLang: Language;
  onUpdateApplicant: (id: string, updated: Partial<JobApplication>) => void;
  onOpenDossier?: (applicant: JobApplication) => void;
}

export const ApplicantFeedbackModal: React.FC<ApplicantFeedbackModalProps> = ({
  isOpen,
  onClose,
  applicant,
  currentLang,
  onUpdateApplicant,
  onOpenDossier,
}) => {
  const [currentStatus, setCurrentStatus] = useState<JobApplication['status']>(applicant?.status || 'pending');
  const [isVerified, setIsVerified] = useState<boolean>(applicant?.verified || false);
  const [rating, setRating] = useState<number>(applicant?.rating || 0);
  const [adminNotes, setAdminNotes] = useState<string>(applicant?.notes || '');

  // Email feedback state
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  const [isEmailSentSuccess, setIsEmailSentSuccess] = useState<boolean>(false);

  // Sync state if applicant changes
  useEffect(() => {
    if (applicant) {
      setCurrentStatus(applicant.status);
      setIsVerified(applicant.verified || false);
      setRating(applicant.rating || 0);
      setAdminNotes(applicant.notes || '');
    }
  }, [applicant]);

  // Rwanda NID Validation calculation
  const nidValidation = validateRwandaNID(applicant?.nationalId || '');

  // Generate standard templates based on chosen status
  useEffect(() => {
    if (!applicant) return;
    const jobTitle = applicant.jobTitle;
    const name = applicant.fullName;

    switch (currentStatus) {
      case 'shortlisted':
        setEmailSubject(`UBUMWE SACCO GAKENKE: Application Shortlisted - ${jobTitle}`);
        setEmailBody(
          `Dear ${name},\n\nWe are pleased to inform you that following the review of applications for the position of "${jobTitle}", your file has been successfully SHORTLISTED by the UBUMWE SACCO GAKENKE Recruitment Committee.\n\nOur Human Resources department will contact you with specific interview and testing guidelines.\n\nRequired Verification for Next Stage:\n- Original Rwandan National ID card\n- Certified copies of academic degrees and transcripts\n- Police clearance certificate (Certificate de Casier Judiciaire)\n\nThank you for your commitment to serving our cooperative community in Gakenke District.\n\nSincerely,\nHuman Resources & Recruitment Committee\nUBUMWE SACCO GAKENKE\nHeadquarters: Gakenke Commercial Center, Northern Province\nTel: ${SACCO_INFO.phone} | USSD: *541#\nRegulated by Rwanda Cooperative Agency (RCA) & National Bank of Rwanda (BNR)`
        );
        break;

      case 'not_shortlisted':
        setEmailSubject(`UBUMWE SACCO GAKENKE: Application Status - ${jobTitle}`);
        setEmailBody(
          `Dear ${name},\n\nThank you for applying for the position of "${jobTitle}" at UBUMWE SACCO GAKENKE.\n\nFollowing a thorough review of all submissions against the candidate specifications for this vacancy, we regret to inform you that your profile was NOT SHORTLISTED for this recruitment phase.\n\nWe appreciate the interest you showed in working with UBUMWE SACCO GAKENKE and encourage you to follow our future vacancies as our cooperative operations expand.\n\nSincerely,\nHuman Resources & Recruitment Committee\nUBUMWE SACCO GAKENKE\nTel: ${SACCO_INFO.phone}`
        );
        break;

      case 'waitlisted':
        setEmailSubject(`UBUMWE SACCO GAKENKE: Candidate Waitlist Notice - ${jobTitle}`);
        setEmailBody(
          `Dear ${name},\n\nThank you for applying for "${jobTitle}" at UBUMWE SACCO GAKENKE.\n\nYour qualifications have been evaluated positively. While primary interview places for this batch are allocated, you have been placed on our ACTIVE WAITLIST / RESERVE POOL for this role.\n\nShould an opening or supplementary interview slot arise over the coming period, our recruitment committee will contact you immediately.\n\nSincerely,\nRecruitment Committee\nUBUMWE SACCO GAKENKE`
        );
        break;

      case 'interview':
        setEmailSubject(`Interview Invitation: ${jobTitle} at UBUMWE SACCO GAKENKE`);
        setEmailBody(
          `Dear ${name},\n\nYou are cordially invited for an in-person written test and oral interview for the position of "${jobTitle}" at UBUMWE SACCO GAKENKE.\n\nInterview Details:\n- Date: Monday, 9:00 AM\n- Location: UBUMWE SACCO GAKENKE Headquarters, 2nd Floor Executive Boardroom (Gakenke District, Northern Province)\n- Panel: General Manager (Mbitsemunda Phocas) & Board Governance Committee\n\nPlease arrive 15 minutes early and bring your original National Identification Card and academic testimonials.\n\nIf you have any scheduling conflicts, please contact us at ${SACCO_INFO.email} or call ${SACCO_INFO.phone}.\n\nSincerely,\nHuman Resources & Recruitment Committee\nUBUMWE SACCO GAKENKE`
        );
        break;

      case 'accepted':
        setEmailSubject(`Offer of Employment: ${jobTitle} - UBUMWE SACCO GAKENKE`);
        setEmailBody(
          `Dear ${name},\n\nOn behalf of the Board of Directors and Management of UBUMWE SACCO GAKENKE, we are delighted to offer you employment as "${jobTitle}".\n\nYour performance throughout the evaluation process demonstrated exceptional competence, professional integrity, and passion for rural community empowerment.\n\nPlease report to the General Manager's Office (Mbitsemunda Phocas) at Gakenke Central Branch to review and sign your appointment letter.\n\nWelcome to the UBUMWE SACCO family!\n\nWarm regards,\nMbitsemunda Phocas, General Manager\nWellarse, Board Chairperson\nUBUMWE SACCO GAKENKE`
        );
        break;

      case 'rejected':
        setEmailSubject(`UBUMWE SACCO GAKENKE: Application Status - ${jobTitle}`);
        setEmailBody(
          `Dear ${name},\n\nThank you for taking the time to apply for the position of "${jobTitle}" at UBUMWE SACCO GAKENKE.\n\nWe received numerous qualified applications for this vacancy. After careful evaluation by our recruitment panel, we regret to inform you that we will not be moving forward with your application at this time.\n\nWe will keep your resume on file in our talent database for future vacancies that align with your profile.\n\nWe appreciate your interest in UBUMWE SACCO GAKENKE and wish you every success in your career.\n\nSincerely,\nRecruitment Committee\nUBUMWE SACCO GAKENKE\nTel: ${SACCO_INFO.phone}`
        );
        break;

      default:
        setEmailSubject(`UBUMWE SACCO GAKENKE: Application Received - ${jobTitle}`);
        setEmailBody(
          `Dear ${name},\n\nThis is to confirm that your application for "${jobTitle}" has been received and is currently under review by our operations team.\n\nApplication ID: ${applicant.id}\nApplied Date: ${applicant.appliedDate}\n\nWe will notify you once candidate shortlisting is completed.\n\nBest regards,\nUBUMWE SACCO GAKENKE Team`
        );
        break;
    }
  }, [currentStatus, applicant]);

  const handleSaveAll = () => {
    if (!applicant) return;
    onUpdateApplicant(applicant.id, {
      status: currentStatus,
      verified: isVerified,
      rating,
      notes: adminNotes,
      comment: adminNotes,
      verifiedDetails: isVerified
        ? {
            nidValid: nidValidation.isValid,
            phoneValid: true,
            documentsValid: true,
            verifiedBy: 'UBUMWE SACCO Admin',
            verifiedDate: new Date().toISOString().split('T')[0],
          }
        : undefined,
    });
  };

  const handleSendSimulatedEmail = () => {
    if (!applicant) return;
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    onUpdateApplicant(applicant.id, {
      status: currentStatus,
      verified: isVerified,
      rating,
      notes: adminNotes,
      comment: adminNotes,
      emailFeedbackSent: true,
      lastFeedbackDate: formattedDate,
      lastFeedbackSubject: emailSubject,
      lastFeedbackMessage: emailBody,
    });

    setIsEmailSentSuccess(true);
    setTimeout(() => {
      setIsEmailSentSuccess(false);
    }, 4000);
  };

  const getMailtoUrl = () => {
    if (!applicant) return '';
    const encodedSubject = encodeURIComponent(emailSubject);
    const encodedBody = encodeURIComponent(emailBody);
    return `mailto:${applicant.email}?subject=${encodedSubject}&body=${encodedBody}`;
  };

  if (!isOpen || !applicant) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[94vh] flex flex-col">
        {/* Top Imigongo Skeleton Ribbon */}
        <ImigongoRibbon height={8} variant="light" bordered={false} />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
              <UserCheck className="w-4 h-4" />
              <span>Applicant Verification &amp; Official Feedback Center</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {applicant.fullName}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Position: <strong className="text-emerald-300">{applicant.jobTitle}</strong> · ID: {applicant.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Quick Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">National ID</div>
              <div className="font-mono font-bold text-slate-900 mt-0.5 truncate">{applicant.nationalId}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Phone Number</div>
              <div className="font-bold text-slate-900 mt-0.5">{applicant.phone}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Candidate Email</div>
              <div className="font-bold text-slate-900 mt-0.5 truncate" title={applicant.email}>{applicant.email}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Residence Sector</div>
              <div className="font-bold text-slate-900 mt-0.5">{applicant.residenceSector}</div>
            </div>
          </div>

          {/* Verification & Rwanda NID Review */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Rwandan National ID &amp; Credential Verification</span>
              </span>
              <button
                type="button"
                onClick={() => setIsVerified(!isVerified)}
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isVerified
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {isVerified ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Candidate Verified</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Click to Mark as Verified</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    nidValidation.isValid ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <span className="text-slate-700 font-medium">
                  {nidValidation.message}
                </span>
              </div>

              {applicant.cvFileName && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">CV / Dossier:</span>
                  <span className="font-semibold text-emerald-800">{applicant.cvFileName}</span>
                  {applicant.cvFileData && (
                    <a
                      href={applicant.cvFileData}
                      download={applicant.cvFileName}
                      className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded font-bold text-[11px]"
                    >
                      Download
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Status Selection & Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status Selector */}
            <div>
              <label className="block font-bold text-slate-800 mb-1.5 text-xs">
                Candidate Employment Status *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['pending', 'shortlisted', 'not_shortlisted', 'interview', 'accepted', 'rejected', 'waitlisted'] as const).map((st) => {
                  const isSelected = currentStatus === st;
                  const label =
                    st === 'pending'
                      ? 'Pending Review'
                      : st === 'shortlisted'
                      ? 'Shortlisted'
                      : st === 'not_shortlisted'
                      ? 'Not Shortlisted'
                      : st === 'interview'
                      ? 'Interview Invited'
                      : st === 'accepted'
                      ? 'Accepted / Offer'
                      : st === 'waitlisted'
                      ? 'Waitlisted / Pool'
                      : 'Rejected (Regret)';

                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setCurrentStatus(st)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? st === 'accepted'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                          : st === 'rejected'
                            ? 'bg-red-600 text-white border-red-700 shadow-xs'
                          : st === 'not_shortlisted'
                            ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
                          : st === 'waitlisted'
                            ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                          : st === 'interview'
                            ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                          : st === 'shortlisted'
                            ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                            : 'bg-slate-800 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span>{label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Candidate Rating & Evaluation */}
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5 text-xs">
                  Evaluation Rating (HR Score)
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-2">
                    {rating > 0 ? `${rating} of 5 Stars` : 'Not Rated'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1 text-xs">
                  Committee Deliberations &amp; Comments (Reserved for Notes)
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record committee evaluation notes, interview remarks, background check notes, or reasoning for status..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden resize-y"
                />
              </div>
            </div>
          </div>

          {/* Email Feedback Notification Dispatcher */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-2">
              <span className="font-bold text-emerald-950 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-emerald-700" />
                <span>Automated Email Feedback to Applicant</span>
              </span>

              {applicant.emailFeedbackSent && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Last sent: {applicant.lastFeedbackDate}</span>
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-600">
              When you change the applicant status, this notification is prepared automatically for <strong>{applicant.email}</strong>. You can edit the text before sending.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Subject</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Message Body</label>
              <textarea
                rows={5}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono leading-relaxed focus:outline-hidden"
              />
            </div>

            {/* Email Dispatch Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                {/* 1-click in-app simulated email dispatcher */}
                <button
                  type="button"
                  onClick={handleSendSimulatedEmail}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Email to Applicant</span>
                </button>

                {/* Direct mailto link */}
                <a
                  href={getMailtoUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Open candidate email directly in your email client (Outlook, Gmail)"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>Open in Mail Client</span>
                </a>
              </div>

              {isEmailSentSuccess && (
                <div className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300 flex items-center gap-1 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Email dispatched &amp; logged successfully!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar: Export & Save */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Download PDF Dossier */}
            <button
              type="button"
              onClick={() => {
                handleSaveAll();
                onOpenDossier?.(applicant);
              }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download PDF Dossier</span>
            </button>

            {/* Download Excel */}
            <button
              type="button"
              onClick={() => {
                exportApplicantsToExcel([applicant], `${applicant.fullName.replace(/\s+/g, '_')}_Dossier_2026.csv`);
              }}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export Excel</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                handleSaveAll();
                onClose();
              }}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save &amp; Update Status</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

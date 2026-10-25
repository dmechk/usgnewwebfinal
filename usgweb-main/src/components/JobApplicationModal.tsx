import React, { useState } from 'react';
import { Language, JobPosting, JobApplication } from '../types';
import { SACCO_INFO } from '../data/saccoData';
import {
  X,
  Briefcase,
  User,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  GraduationCap,
  FileText,
  Upload,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { ImigongoRibbon } from './ImigongoPattern';

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  job: JobPosting | null;
  allJobs: JobPosting[];
  onSubmitApplication: (application: Omit<JobApplication, 'id' | 'appliedDate' | 'status'>) => void;
}

export const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  job,
  allJobs,
  onSubmitApplication,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(job?.id || allJobs[0]?.id || '');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [residenceSector, setResidenceSector] = useState('Gakenke');
  const [educationLevel, setEducationLevel] = useState("Bachelor's Degree (A0)");
  const [yearsExperience, setYearsExperience] = useState<number>(1);
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFileName, setCvFileName] = useState('');
  const [cvFileData, setCvFileData] = useState('');
  const [motivationLetterFileName, setMotivationLetterFileName] = useState('');
  const [motivationLetterFileData, setMotivationLetterFileData] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [appReference, setAppReference] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Update selected job if prop changes
  React.useEffect(() => {
    if (job) {
      setSelectedJobId(job.id);
    } else if (allJobs.length > 0 && !selectedJobId) {
      setSelectedJobId(allJobs[0].id);
    }
  }, [job, allJobs]);

  if (!isOpen) return null;

  const currentSelectedJob = allJobs.find((j) => j.id === selectedJobId) || job;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('CV / Resume file must be under 5MB.');
      return;
    }

    setCvFileName(file.name);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCvFileData(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMotivationLetterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Motivation letter file must be under 10MB.');
      return;
    }

    setMotivationLetterFileName(file.name);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMotivationLetterFileData(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 9) {
      setErrorMsg('Please enter a valid phone number (e.g. 078XXXXXXX).');
      return;
    }
    if (!nationalId.trim() || nationalId.length < 16) {
      setErrorMsg('Please enter a valid 16-digit Rwandan National ID.');
      return;
    }
    if (!coverLetter.trim() || coverLetter.length < 30) {
      setErrorMsg('Please provide a brief statement of interest or cover letter (at least 30 characters).');
      return;
    }

    const ref = `UB-JOB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setAppReference(ref);

    onSubmitApplication({
      jobId: selectedJobId,
      jobTitle: currentSelectedJob ? currentSelectedJob.titleEn : 'General Application',
      fullName: fullName.trim(),
      email: email.trim() || `${phone.replace(/\D/g, '')}@applicant.sacco`,
      phone: phone.trim(),
      nationalId: nationalId.trim(),
      residenceSector,
      educationLevel,
      yearsExperience: Number(yearsExperience) || 0,
      coverLetter: coverLetter.trim(),
      cvFileName: cvFileName || 'Resume_Document.pdf',
      cvFileData: cvFileData || undefined,
      motivationLetterFileName: motivationLetterFileName || undefined,
      motivationLetterFileData: motivationLetterFileData || undefined,
    });

    setIsSubmitted(true);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setNationalId('');
    setCoverLetter('');
    setCvFileName('');
    setCvFileData('');
    setMotivationLetterFileName('');
    setMotivationLetterFileData('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full relative shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Top Ribbon */}
        <ImigongoRibbon height={10} variant="light" bordered={false} />

        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between relative shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span>UBUMWE SACCO GAKENKE · Employment Application</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {currentLang === 'fr' ? 'Soumettre une Candidature' : currentLang === 'rw' ? 'Gusaba Akazi muri Koperative' : 'Apply for Employment'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              {currentSelectedJob
                ? `${currentLang === 'fr' ? (currentSelectedJob.titleFr || currentSelectedJob.titleEn) : currentLang === 'rw' ? currentSelectedJob.titleRw : currentSelectedJob.titleEn} · ${currentSelectedJob.location}`
                : currentLang === 'fr' ? 'Rejoignez notre équipe pour servir Gakenke.' : currentLang === 'rw' ? 'Injira mu bantu bacu bafasha abaturage ba Gakenke.' : 'Join our team in empowering the community of Gakenke.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {isSubmitted ? (
            <div className="text-center py-8 space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-900">
                  {currentLang === 'fr' ? 'Candidature Reçue avec Succès !' : currentLang === 'rw' ? 'Ubusabe Bwakiriwe Neza!' : 'Application Received Successfully!'}
                </h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto">
                  {currentLang === 'fr'
                    ? 'Merci de votre intérêt à rejoindre UBUMWE SACCO GAKENKE. Notre comité des Ressources Humaines examinera votre candidature.'
                    : currentLang === 'rw'
                    ? 'Urakoze kwifuza gukorana na UBUMWE SACCO GAKENKE. Komite y\'Abakozi n\'Ubuyobozi izasuzuma dosiye yawe.'
                    : 'Thank you for your interest in joining UBUMWE SACCO GAKENKE. Our Human Resources and Management committee will review your application.'}
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 max-w-md mx-auto text-left space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Application Reference:</span>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {appReference}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Candidate:</span>
                  <span className="font-bold text-slate-900">{fullName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Position Applied:</span>
                  <span className="font-bold text-slate-900">{currentSelectedJob?.titleEn}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Contact Phone:</span>
                  <span className="font-bold text-slate-900">{phone}</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Target Position Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Target Position / Umwanya Wifuza *
                </label>
                <div className="relative">
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                  >
                    {allJobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {currentLang === 'fr' ? (j.titleFr || j.titleEn) : currentLang === 'rw' ? j.titleRw : j.titleEn} ({j.departmentEn} - {j.location})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Personal Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Full Legal Name / Amazina Yose *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jean Claude Habimana"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                    <span>National ID / Indangamuntu (16 Digits) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
                    placeholder="1199XXXXXXXXXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Phone Number / Telefone *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 078XXXXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Email Address (Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. candidate@gmail.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Qualifications & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Residence Sector *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={residenceSector}
                    onChange={(e) => setResidenceSector(e.target.value)}
                    placeholder="e.g. Gakenke / Rushashi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Education Level *</span>
                  </label>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="Bachelor's Degree (A0)">Bachelor's Degree (A0)</option>
                    <option value="Advanced Diploma (A1)">Advanced Diploma (A1)</option>
                    <option value="Secondary School (A2)">Secondary School (A2)</option>
                    <option value="Master's Degree (Postgraduate)">Master's Degree</option>
                    <option value="Professional Certificate (CPA/ACCA)">Professional Certificate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Years of Experience</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Statement of Motivation / Cover Letter *</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Summarize your professional qualifications, experience, and why you wish to serve at UBUMWE SACCO GAKENKE..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Resume / CV Upload */}
              <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-emerald-700" />
                    <span>Upload CV / Resume (PDF, DOCX, or Image)</span>
                  </span>
                  {cvFileName && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      File Attached
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select File</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-slate-500 truncate max-w-xs">
                    {cvFileName || 'No file selected (Max 5MB)'}
                  </span>
                </div>
              </div>

              {/* Motivation Letter Upload */}
              <div className="p-4 bg-emerald-50/60 border border-dashed border-emerald-300 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <span>Motivation Letter (Any Format — Optional)</span>
                  </span>
                  {motivationLetterFileName && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      ✓ Letter Attached
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-emerald-700">
                  You may upload your formal motivation letter in any format: PDF, Word (.doc/.docx), OpenDocument (.odt), image scan (.jpg/.png), or any other document format.
                </p>

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Attach Motivation Letter</span>
                    <input
                      type="file"
                      accept="*"
                      onChange={handleMotivationLetterUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-slate-500 truncate max-w-xs">
                    {motivationLetterFileName || 'No file selected (Max 10MB, any format)'}
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] text-slate-500">
                  By submitting, you certify that all information provided is accurate and authentic.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <span>Submit Application</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

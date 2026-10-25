import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { SACCO_INFO } from '../data/saccoData';
import { X, CheckCircle2, Printer, ShieldCheck, Landmark } from 'lucide-react';
import { ImigongoRibbon } from './ImigongoPattern';

interface AccountApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  prefillLoan?: {
    amount: number;
    tenureMonths: number;
    loanType: string;
    monthlyPayment: number;
  } | null;
  prefillProductType?: string;
}

const GAKENKE_SECTORS = [
  "Gakenke", "Busengo", "Coko", "Cyabingo", "Gashenyi", "Janja",
  "Kamubuga", "Karambo", "Kivuruga", "Mataba", "Minazi", "Mugunga",
  "Muhondo", "Muyongwe", "Muzo", "Nemba", "Ruli", "Rusasa", "Rushashi"
];

export const AccountApplicationModal: React.FC<AccountApplicationModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  prefillLoan,
  prefillProductType,
}) => {
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [sector, setSector] = useState(GAKENKE_SECTORS[0]);
  const [accountType, setAccountType] = useState('compulsory_savings');
  const [occupation, setOccupation] = useState('');
  const [initialAmount, setInitialAmount] = useState<number>(10000);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [idError, setIdError] = useState('');

  const t = TRANSLATIONS[currentLang];

  useEffect(() => {
    if (prefillLoan) {
      setAccountType(prefillLoan.loanType);
      setInitialAmount(prefillLoan.amount);
    } else if (prefillProductType) {
      setAccountType(prefillProductType);
    }
  }, [prefillLoan, prefillProductType]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate 16-digit Rwandan National ID
    const cleanId = idNumber.replace(/\s+/g, '');
    if (cleanId.length !== 16 || !/^\d+$/.test(cleanId)) {
      setIdError(currentLang === 'fr' ? 'La carte d\'identité nationale doit comporter exactement 16 chiffres.' : currentLang === 'rw' ? 'Indangamuntu igomba kuba igizwe n\'imibare 16 yose.' : 'National ID must be exactly 16 numeric digits.');
      return;
    }
    setIdError('');

    const newAppNumber = `UB-APPL-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedData({
      appNumber: newAppNumber,
      fullName,
      idNumber: cleanId,
      phone,
      sector,
      accountType,
      occupation,
      initialAmount,
      date: new Date().toLocaleDateString('en-GB'),
    });
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const handleReset = () => {
    setSubmittedData(null);
    setFullName('');
    setIdNumber('');
    setPhone('');
    setOccupation('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 relative shadow-2xl border border-slate-200 my-8 overflow-hidden">
        {/* Top Imigongo ribbon */}
        <div className="absolute top-0 left-0 right-0">
          <ImigongoRibbon height={8} variant="light" bordered={false} />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!submittedData ? (
          <div className="pt-2">
            <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold mb-1">
              <Landmark className="w-4 h-4 text-emerald-700" />
              <span>UBUMWE SACCO GAKENKE ONBOARDING</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {prefillLoan ? 'Apply for Cooperative Loan Facility' : t.accountOpening.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {prefillLoan
                ? `Calculated request for ${prefillLoan.amount.toLocaleString()} RWF over ${prefillLoan.tenureMonths} months.`
                : t.accountOpening.subtitle}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  {t.accountOpening.fullName} *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Jean Bosco Habimana"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* National ID & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    {t.accountOpening.idNumber} *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="1 1985 8 0012345 0 12"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono-numbers focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  {idError && <span className="text-[11px] text-red-600 block mt-1">{idError}</span>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    {t.accountOpening.phone} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0788 000 000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono-numbers focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sector & Occupation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    {t.accountOpening.sector} *
                  </label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {GAKENKE_SECTORS.map((sec) => (
                      <option key={sec} value={sec}>{sec} Sector</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    {t.accountOpening.occupation} *
                  </label>
                  <input
                    type="text"
                    required
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Coffee Farmer / Shopkeeper / Teacher"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Initial Deposit or Loan Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  {prefillLoan ? 'Requested Principal Amount (RWF)' : t.accountOpening.initialDeposit}
                </label>
                <input
                  type="number"
                  min="2000"
                  step="1000"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono-numbers font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
                >
                  {t.accountOpening.submitBtn}
                </button>
              </div>

              <div className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Compliant with RCA and National Cooperative KYC standards</span>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation & Printable Membership Certificate */
          <div className="space-y-6 text-center">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">{t.accountOpening.successTitle}</h3>
              <p className="text-xs text-slate-600 mt-1">{t.accountOpening.successDesc}</p>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-3 font-mono-numbers">
              <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-200">
                <span className="text-slate-500 uppercase">{t.accountOpening.accountAllocated}</span>
                <span className="text-base font-extrabold text-emerald-800">{submittedData.appNumber}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Member Name</span>
                  <span className="font-semibold text-slate-800">{submittedData.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">National ID</span>
                  <span className="font-semibold text-slate-800">{submittedData.idNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Sector</span>
                  <span className="font-semibold text-slate-800">{submittedData.sector}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Telephone</span>
                  <span className="font-semibold text-slate-800">{submittedData.phone}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block">Commitment</span>
                  <span className="font-bold text-emerald-800 text-sm">{submittedData.initialAmount.toLocaleString()} RWF</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Please present this reference number or your National ID card at any of the 6 branches (Gakenke Town, Nemba, Rushashi, Janja, Kivuruga, Busengo) to collect your passbook or authorize instant MoMo link.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handlePrintSlip}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>{t.accountOpening.printCert}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

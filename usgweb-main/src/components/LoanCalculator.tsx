import React, { useState, useId } from 'react';
import { Language } from '../types';
import { Table, ChevronDown, ChevronUp } from 'lucide-react';

interface LoanCalculatorProps {
  currentLang: Language;
  onApplyWithCalculation: (calculationDetails: {
    amount: number;
    tenureMonths: number;
    loanType: string;
    monthlyPayment: number;
  }) => void;
  initialAmount?: number;
  initialType?: string;
}

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({
  currentLang,
  onApplyWithCalculation,
  initialAmount = 500000,
}) => {
  const [amount, setAmount] = useState<number>(initialAmount);
  const [tenureMonths, setTenureMonths] = useState<number>(12);
  const [annualRate, setAnnualRate] = useState<number>(18);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);
  const [hasCalculated, setHasCalculated] = useState<boolean>(true);

  const amountInputId = useId();
  const tenureInputId = useId();
  const rateInputId = useId();

  // Annuity calculation formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const calculateAnnuity = (principal: number, annualPercentage: number, months: number) => {
    if (months <= 0) return 0;
    if (annualPercentage <= 0) return Math.round(principal / months);

    const monthlyRate = annualPercentage / 100 / 12;
    const factor = Math.pow(1 + monthlyRate, months);
    if (factor === 1) return Math.round(principal / months);

    return Math.round((principal * (monthlyRate * factor)) / (factor - 1));
  };

  const monthlyInstallment = calculateAnnuity(amount, annualRate, tenureMonths);
  const totalRepayable = monthlyInstallment * tenureMonths;
  const totalInterest = Math.max(0, totalRepayable - amount);

  const generateSchedule = () => {
    const schedule = [];
    const monthlyRate = annualRate / 100 / 12;
    let remainingPrincipal = amount;

    for (let m = 1; m <= tenureMonths; m++) {
      const interestForMonth = Math.round(remainingPrincipal * monthlyRate);
      const principalForMonth = Math.min(remainingPrincipal, monthlyInstallment - interestForMonth);
      remainingPrincipal = Math.max(0, remainingPrincipal - principalForMonth);

      schedule.push({
        month: m,
        monthlyPayment: monthlyInstallment,
        principalPayment: principalForMonth,
        interestPayment: interestForMonth,
        balance: remainingPrincipal,
      });
    }
    return schedule;
  };

  const scheduleData = showSchedule ? generateSchedule() : [];

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setHasCalculated(true);
  };

  const handleApply = () => {
    onApplyWithCalculation({
      amount,
      tenureMonths,
      loanType:
        currentLang === 'fr'
          ? 'Crédit Standard Annuité'
          : currentLang === 'rw'
          ? 'Inguzanyo Isanzwe ya Annuité'
          : 'Standard Annuity Credit',
      monthlyPayment: monthlyInstallment,
    });
  };

  return (
    <div className="relative w-full py-12 sm:py-16 px-4 sm:px-6 overflow-hidden rounded-3xl my-4">
      {/* Background illustration / scenic background */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-25"
        style={{
          backgroundImage: `url('/src/assets/images/farmers_cooperative_1791989969904.jpg')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#F5F0FF]/85 via-[#F6F1FF]/90 to-[#F5F0FF]/95 pointer-events-none" />

      <div className="relative max-w-3xl mx-auto">
        {/* Intro description */}
        <p className="text-center text-slate-700 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-8 font-normal" style={{ textWrap: 'balance' }}>
          {currentLang === 'fr'
            ? 'Estimez vos remboursements mensuels selon la méthode d\'annuité (versements mensuels constants pendant la durée du prêt). Ceci est une estimation indicative, contactez-nous pour les conditions définitives.'
            : currentLang === 'rw'
            ? "Mugereranye amafaranga muzajya mwishyura buri kwezi hakoreshejwe uburyo bwa annuité (kwishyura angana buri kwezi). Iki ni igipimo cy'agateganyo gusa, si amasezerano ya nyuma - twandikire ku bisobanuro birambuye."
            : 'Estimate your monthly repayment using the annuity method (equal monthly payments over the loan term). This is an estimate only, not a formal loan offer - contact us for exact terms.'}
        </p>

        {/* White Card matching the requested UI */}
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-10">
          <form onSubmit={handleCalculate} className="space-y-5 sm:space-y-6">
            {/* 1. Loan Amount */}
            <div>
              <label htmlFor={amountInputId} className="block text-sm font-semibold text-slate-800 mb-2">
                {currentLang === 'fr'
                  ? 'Montant du Prêt (RWF)'
                  : currentLang === 'rw'
                  ? 'Amafaranga Yifuzwa (RWF)'
                  : 'Loan Amount (RWF)'}
              </label>
              <input
                id={amountInputId}
                type="number"
                min="10000"
                step="10000"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="500000"
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono-numbers text-base focus:outline-none focus:ring-2 focus:ring-[#1b3a27] focus:border-transparent transition-all placeholder:text-slate-400"
              />
            </div>

            {/* 2. Loan Term */}
            <div>
              <label htmlFor={tenureInputId} className="block text-sm font-semibold text-slate-800 mb-2">
                {currentLang === 'fr'
                  ? 'Durée du Prêt (mois)'
                  : currentLang === 'rw'
                  ? 'Igihe cyo Kwishyura (amezi)'
                  : 'Loan Term (months)'}
              </label>
              <input
                id={tenureInputId}
                type="number"
                min="1"
                max="60"
                value={tenureMonths || ''}
                onChange={(e) => setTenureMonths(Number(e.target.value))}
                placeholder="12"
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono-numbers text-base focus:outline-none focus:ring-2 focus:ring-[#1b3a27] focus:border-transparent transition-all placeholder:text-slate-400"
              />
            </div>

            {/* 3. Annual Interest Rate */}
            <div>
              <label htmlFor={rateInputId} className="block text-sm font-semibold text-slate-800 mb-2">
                {currentLang === 'fr'
                  ? "Taux d'Intérêt Annuel (%)"
                  : currentLang === 'rw'
                  ? 'Inyungu ku Mwaka (%)'
                  : 'Annual Interest Rate (%)'}
              </label>
              <input
                id={rateInputId}
                type="number"
                min="0"
                step="0.1"
                value={annualRate || ''}
                onChange={(e) => setAnnualRate(Number(e.target.value))}
                placeholder="18"
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono-numbers text-base focus:outline-none focus:ring-2 focus:ring-[#1b3a27] focus:border-transparent transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Calculate Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-[#1b3a27] hover:bg-[#132c1c] active:bg-[#0e2115] text-white text-base font-bold rounded-lg shadow-sm transition-all duration-150 cursor-pointer flex items-center justify-center tracking-wide"
            >
              {currentLang === 'fr'
                ? 'Calculer la Mensualité'
                : currentLang === 'rw'
                ? 'Kubara Inguzanyo'
                : 'Calculate Repayment'}
            </button>
          </form>

          {/* Calculation Summary Results */}
          {hasCalculated && (
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-4 animate-in fade-in duration-300">
              <div className="bg-[#F5F0FF]/80 border border-[#DCCCFF] rounded-xl p-4 text-center">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-600 block mb-1">
                  {currentLang === 'fr'
                    ? 'Mensualité Estimée'
                    : currentLang === 'rw'
                    ? 'Ayishyurwa Buri Kwezi'
                    : 'Estimated Monthly Payment'}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#1b3a27] font-mono-numbers">
                  {monthlyInstallment.toLocaleString()} <span className="text-sm font-semibold text-slate-600">RWF</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-3">
                  <span className="text-slate-500 block text-xs">
                    {currentLang === 'fr'
                      ? 'Total des Intérêts'
                      : currentLang === 'rw'
                      ? 'Inyungu Yose'
                      : 'Total Interest'}
                  </span>
                  <span className="font-bold text-slate-800 font-mono-numbers text-sm">
                    {totalInterest.toLocaleString()} RWF
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-3">
                  <span className="text-slate-500 block text-xs">
                    {currentLang === 'fr'
                      ? 'Total à Rembourser'
                      : currentLang === 'rw'
                      ? 'Ayose Azishyurwa'
                      : 'Total Repayable'}
                  </span>
                  <span className="font-bold text-slate-900 font-mono-numbers text-sm">
                    {totalRepayable.toLocaleString()} RWF
                  </span>
                </div>
              </div>

              {/* Schedule view toggle */}
              <button
                type="button"
                onClick={() => setShowSchedule(!showSchedule)}
                className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Table className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {showSchedule
                    ? currentLang === 'fr'
                      ? 'Masquer l\'Échéancier'
                      : currentLang === 'rw'
                      ? 'Hisha Imbonerahamwe'
                      : 'Hide Amortization Schedule'
                    : currentLang === 'fr'
                    ? 'Afficher l\'Échéancier de Remboursement'
                    : currentLang === 'rw'
                    ? "Reba Imbonerahamwe y'Uko Wishyura"
                    : 'View Amortization Schedule'}
                </span>
                {showSchedule ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {/* Talk to us link */}
          <div className="text-center pt-6">
            <button
              type="button"
              onClick={handleApply}
              className="text-[#1e6091] hover:text-[#0f3d61] hover:underline text-sm sm:text-base font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              {currentLang === 'fr'
                ? 'Contactez-nous pour une demande de prêt formelle →'
                : currentLang === 'rw'
                ? 'Twandikire kugira ngo usabe inguzanyo nyayo →'
                : 'Talk to us about a real loan application →'}
            </button>
          </div>
        </div>

        {/* Amortization Schedule Table */}
        {showSchedule && (
          <div className="mt-8 max-w-xl mx-auto bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md animate-in fade-in duration-300">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {currentLang === 'fr'
                    ? 'Échéancier Mensuel de Remboursement'
                    : currentLang === 'rw'
                    ? 'Imbonerahamwe yo Kwishyura'
                    : 'Monthly Repayment Schedule'}
                </h4>
                <p className="text-xs text-slate-500 font-mono-numbers">
                  {amount.toLocaleString()} RWF @ {annualRate}% / year ({tenureMonths} mos)
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 font-mono-numbers">RWF</span>
            </div>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3 text-right">
                      {currentLang === 'fr' ? 'Paiement' : currentLang === 'rw' ? 'Kwishyura' : 'Payment'}
                    </th>
                    <th className="py-2 px-3 text-right">
                      {currentLang === 'fr' ? 'Principal' : currentLang === 'rw' ? 'Igishoro' : 'Principal'}
                    </th>
                    <th className="py-2 px-3 text-right">
                      {currentLang === 'fr' ? 'Intérêts' : currentLang === 'rw' ? 'Inyungu' : 'Interest'}
                    </th>
                    <th className="py-2 px-3 text-right">
                      {currentLang === 'fr' ? 'Solde Restant' : currentLang === 'rw' ? 'Amafaranga Asigaye' : 'Balance'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono-numbers">
                  {scheduleData.map((row) => (
                    <tr key={row.month} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 font-semibold text-slate-700">M{row.month}</td>
                      <td className="py-2 px-3 text-right text-slate-900 font-medium">{row.monthlyPayment.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-[#1b3a27] font-medium">{row.principalPayment.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right text-slate-500">{row.interestPayment.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-semibold text-slate-800">{row.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


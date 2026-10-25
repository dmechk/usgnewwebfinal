import React, { useState, useEffect, useRef } from 'react';
import { Language, SaccoContactInfo, HomeMetricItem } from '../types';
import { SACCO_INFO, INITIAL_HOME_METRICS } from '../data/saccoData';
import {
  Users,
  PiggyBank,
  Landmark,
  Building2,
  ShieldCheck,
  TrendingUp,
  Award,
  Star,
  Sparkles,
  Edit2,
  Plus,
  Trash2,
  X,
  Save,
  CheckCircle2,
} from 'lucide-react';

interface MetricsProps {
  currentLang: Language;
  saccoInfo?: SaccoContactInfo;
  metrics?: HomeMetricItem[];
  isAdmin?: boolean;
  onOpenAdminConsole?: (tab?: string) => void;
  onDeleteMetric?: (id: string) => void;
  onUpdateSaccoInfo?: (updated: Partial<SaccoContactInfo>) => void;
}

/**
 * Animated Number Counter triggered on scroll into view
 */
const AnimatedCounter: React.FC<{ valueStr: string; isVisible: boolean }> = ({ valueStr, isVisible }) => {
  // Parse value string: e.g. "18,640+", "4.85B RWF", "3.62B RWF", "6 Branches", "15 Years"
  const match = valueStr.match(/^([^\d.]*)(\d+(?:,\d+)*(?:\.\d+)?)(.*)$/);
  const prefix = match ? match[1] || '' : '';
  const rawNum = match ? match[2] : '0';
  const suffix = match ? match[3] || '' : '';
  const hasComma = rawNum.includes(',');
  const cleanNum = parseFloat(rawNum.replace(/,/g, ''));
  const decimals = rawNum.includes('.') ? rawNum.split('.')[1].length : 0;
  const initialZero = hasComma ? '0' : decimals > 0 ? (0).toFixed(decimals) : '0';

  const [displayValue, setDisplayValue] = useState<string>(`${prefix}${initialZero}${suffix}`);

  useEffect(() => {
    if (!isVisible) {
      // Reset to 0 when out of view, so scrolling into view animates the numbers every time
      setDisplayValue(`${prefix}${initialZero}${suffix}`);
      return;
    }

    if (isNaN(cleanNum)) {
      setDisplayValue(valueStr);
      return;
    }

    let startTimestamp: number | null = null;
    const duration = 1500; // ms smooth count-up
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentNumber = cleanNum * easeOut;

      let formattedNumber: string;
      if (hasComma) {
        formattedNumber = Math.round(currentNumber).toLocaleString('en-US');
      } else if (decimals > 0) {
        formattedNumber = currentNumber.toFixed(decimals);
      } else {
        formattedNumber = Math.round(currentNumber).toString();
      }

      setDisplayValue(`${prefix}${formattedNumber}${suffix}`);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(valueStr);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [valueStr, isVisible, cleanNum, decimals, hasComma, prefix, suffix, initialZero]);

  return <>{displayValue}</>;
};

export const Metrics: React.FC<MetricsProps> = ({
  currentLang,
  saccoInfo = SACCO_INFO,
  metrics = INITIAL_HOME_METRICS,
  isAdmin = false,
  onOpenAdminConsole,
  onDeleteMetric,
  onUpdateSaccoInfo,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  // In-Place Oversight CRUD Modal State
  const [isEditOversightModalOpen, setIsEditOversightModalOpen] = useState(false);
  const [formRcaReg, setFormRcaReg] = useState(saccoInfo.rcaRegistration || 'RCA / COOP / 042 / 2011');
  const [formOversightEn, setFormOversightEn] = useState(saccoInfo.oversightLabelEn || 'Cooperative Oversight:');
  const [formOversightRw, setFormOversightRw] = useState(saccoInfo.oversightLabelRw || 'Ubugenzuzi bwa Koperative :');
  const [formOversightFr, setFormOversightFr] = useState(saccoInfo.oversightLabelFr || 'Supervision Coopérative :');
  const [formLicensedEn, setFormLicensedEn] = useState(saccoInfo.licensedLabelEn || 'Licensed Financial Cooperative');
  const [formLicensedRw, setFormLicensedRw] = useState(saccoInfo.licensedLabelRw || "Koperative y'Imari Yemewe n'Amategeko");
  const [formLicensedFr, setFormLicensedFr] = useState(saccoInfo.licensedLabelFr || 'Coopérative Financière Agréée');
  const [formPhone, setFormPhone] = useState(saccoInfo.phone || '0786422080');
  const [formUssd, setFormUssd] = useState(saccoInfo.ussdCode || '*541#');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setFormRcaReg(saccoInfo.rcaRegistration || 'RCA / COOP / 042 / 2011');
    setFormOversightEn(saccoInfo.oversightLabelEn || 'Cooperative Oversight:');
    setFormOversightRw(saccoInfo.oversightLabelRw || 'Ubugenzuzi bwa Koperative :');
    setFormOversightFr(saccoInfo.oversightLabelFr || 'Supervision Coopérative :');
    setFormLicensedEn(saccoInfo.licensedLabelEn || 'Licensed Financial Cooperative');
    setFormLicensedRw(saccoInfo.licensedLabelRw || "Koperative y'Imari Yemewe n'Amategeko");
    setFormLicensedFr(saccoInfo.licensedLabelFr || 'Coopérative Financière Agréée');
    setFormPhone(saccoInfo.phone || '0786422080');
    setFormUssd(saccoInfo.ussdCode || '*541#');
  }, [saccoInfo]);

  const handleSaveOversight = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateSaccoInfo) {
      onUpdateSaccoInfo({
        rcaRegistration: formRcaReg,
        oversightLabelEn: formOversightEn,
        oversightLabelRw: formOversightRw,
        oversightLabelFr: formOversightFr,
        licensedLabelEn: formLicensedEn,
        licensedLabelRw: formLicensedRw,
        licensedLabelFr: formLicensedFr,
        phone: formPhone,
        ussdCode: formUssd,
      });
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditOversightModalOpen(false);
    }, 1200);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Triggers on scroll into view and resets when scrolling away
          setIsInView(entry.isIntersecting);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'users':
        return Users;
      case 'piggy':
      case 'piggybank':
        return PiggyBank;
      case 'landmark':
        return Landmark;
      case 'building':
      case 'building2':
        return Building2;
      case 'shield':
      case 'shieldcheck':
        return ShieldCheck;
      case 'trending':
      case 'trendingup':
        return TrendingUp;
      case 'award':
        return Award;
      default:
        return Star;
    }
  };

  const oversightLabel =
    currentLang === 'fr'
      ? (saccoInfo.oversightLabelFr || 'Supervision Coopérative :')
      : currentLang === 'rw'
      ? (saccoInfo.oversightLabelRw || 'Ubugenzuzi bwa Koperative :')
      : (saccoInfo.oversightLabelEn || 'Cooperative Oversight:');

  const licensedLabel =
    currentLang === 'fr'
      ? (saccoInfo.licensedLabelFr || 'Coopérative Financière Agréée')
      : currentLang === 'rw'
      ? (saccoInfo.licensedLabelRw || "Koperative y'Imari Yemewe n'Amategeko")
      : (saccoInfo.licensedLabelEn || 'Licensed Financial Cooperative');

  const helpDeskLabel =
    currentLang === 'fr'
      ? 'Assistance :'
      : currentLang === 'rw'
      ? 'Ubufasha :'
      : 'Help Desk:';

  return (
    <section ref={sectionRef} className="bg-white border-b border-slate-200 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 lg:py-10">
        {/* Admin Section Control */}
        {isAdmin && onOpenAdminConsole && (
          <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>
                {currentLang === 'fr'
                  ? `Statistiques Clés de la Coopérative (${metrics.length} cartes actives)`
                  : currentLang === 'rw'
                  ? `Imibare y'Ingenzi ya Koperative (${metrics.length} zikora)`
                  : `Cooperative Key Metrics & Statistics (${metrics.length} cards active)`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAdminConsole('home-metrics')}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  {currentLang === 'fr'
                    ? 'Gérer les Métriques (CRUD)'
                    : currentLang === 'rw'
                    ? 'Gucunga Imibare (CRUD)'
                    : 'Add / Manage Metrics (CRUD)'}
                </span>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
          {metrics.map((item) => {
            const IconComponent = getIcon(item.iconName);
            const label =
              currentLang === 'fr'
                ? item.labelFr || item.labelEn
                : currentLang === 'rw'
                ? item.labelRw
                : item.labelEn;
            const detail =
              currentLang === 'fr'
                ? item.detailFr || item.detailEn
                : currentLang === 'rw'
                ? item.detailRw
                : item.detailEn;

            // If this is the branches metric card, dynamically reflect saccoInfo.branchesCount
            const isBranchMetric =
              item.id === 'metric-4' ||
              item.labelEn.toLowerCase().includes('branch') ||
              item.labelEn.toLowerCase().includes('outpost');

            const branchSuffix =
              currentLang === 'fr'
                ? ' Agences'
                : currentLang === 'rw'
                ? ' Amashami'
                : ' Branches';

            const resolvedValue = isBranchMetric && saccoInfo?.branchesCount !== undefined
              ? `${saccoInfo.branchesCount}${branchSuffix}`
              : item.value;

            return (
              <div
                key={item.id}
                className="relative group flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border border-slate-200/80 hover:border-emerald-500/50 transition-all bg-white shadow-xs hover:shadow-sm"
              >
                <div className={`p-2.5 rounded-lg ${item.bgClass || 'bg-emerald-50'} shrink-0`}>
                  <IconComponent className={`w-5 h-5 ${item.colorClass || 'text-emerald-700'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg sm:text-xl xl:text-2xl font-extrabold text-slate-900 font-mono-numbers tracking-tight whitespace-normal break-words leading-tight">
                    <AnimatedCounter valueStr={resolvedValue} isVisible={isInView} />
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1 leading-snug">
                    {label}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {detail}
                  </div>
                </div>

                {/* Admin Quick Action Button on Each Card */}
                {isAdmin && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/95 rounded-md p-1 shadow-xs border border-slate-200">
                    <button
                      type="button"
                      onClick={() => onOpenAdminConsole?.('home-metrics')}
                      className="p-1 text-slate-600 hover:text-emerald-700 rounded transition-colors cursor-pointer"
                      title="Edit Metric"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {onDeleteMetric && metrics.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteMetric(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Delete Metric"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Regulatory reassurance footer strip with contact details */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-semibold text-slate-800">{oversightLabel}</span>
            <span className="font-mono-numbers">{saccoInfo.rcaRegistration}</span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span className="text-emerald-800 font-medium">{licensedLabel}</span>

            {/* Admin In-Place CRUD Edit Trigger */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsEditOversightModalOpen(true)}
                className="ml-2 px-2.5 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-md font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer shadow-2xs border border-emerald-300"
                title="Edit Cooperative Oversight & RCA Registration"
              >
                <Edit2 className="w-3 h-3 text-emerald-700" />
                <span>Edit (CRUD)</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-4 text-slate-600 font-mono-numbers text-xs">
            <span>
              {helpDeskLabel} <strong className="text-slate-900">{saccoInfo.phone}</strong>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>
              USSD: <strong className="text-emerald-700">{saccoInfo.ussdCode}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* In-Place Oversight & RCA Registration CRUD Modal */}
      {isEditOversightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold leading-tight">
                    Edit Cooperative Oversight &amp; RCA Registration
                  </h3>
                  <p className="text-[11px] text-slate-500 font-normal">
                    Update regulatory licensing details, registration code, and badges live on the site.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOversightModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Preview of what this line looks like */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Live Preview (How it appears to citizens)
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-semibold text-slate-800">{formOversightEn || 'Cooperative Oversight:'}</span>
                <span className="font-mono-numbers font-bold text-slate-900">{formRcaReg}</span>
                <span className="text-slate-400">·</span>
                <span className="text-emerald-800 font-medium">{formLicensedEn || 'Licensed Financial Cooperative'}</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveOversight} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Official RCA Registration Number *
                </label>
                <input
                  type="text"
                  required
                  value={formRcaReg}
                  onChange={(e) => setFormRcaReg(e.target.value)}
                  placeholder="RCA / COOP / 042 / 2011"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prefix Label (English)
                  </label>
                  <input
                    type="text"
                    value={formOversightEn}
                    onChange={(e) => setFormOversightEn(e.target.value)}
                    placeholder="Cooperative Oversight:"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prefix Label (Kinyarwanda)
                  </label>
                  <input
                    type="text"
                    value={formOversightRw}
                    onChange={(e) => setFormOversightRw(e.target.value)}
                    placeholder="Ubugenzuzi bwa Koperative :"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Badge (English)
                  </label>
                  <input
                    type="text"
                    value={formLicensedEn}
                    onChange={(e) => setFormLicensedEn(e.target.value)}
                    placeholder="Licensed Financial Cooperative"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Badge (Kinyarwanda)
                  </label>
                  <input
                    type="text"
                    value={formLicensedRw}
                    onChange={(e) => setFormLicensedRw(e.target.value)}
                    placeholder="Koperative y'Imari Yemewe n'Amategeko"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Help Desk Phone
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="0786422080"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    USSD Code
                  </label>
                  <input
                    type="text"
                    value={formUssd}
                    onChange={(e) => setFormUssd(e.target.value)}
                    placeholder="*541#"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-emerald-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {saveSuccess && (
                <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Oversight updated successfully!</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                {onOpenAdminConsole && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditOversightModalOpen(false);
                      onOpenAdminConsole('contact');
                    }}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
                  >
                    Open in Admin Console
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsEditOversightModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  CreditCard,
  PiggyBank,
  Smartphone,
  Phone,
  MessageCircle,
  FileText,
  Printer,
  ChevronRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Clock,
  Landmark,
  Layers,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { ImigongoRibbon } from './ImigongoPattern';
import { Language } from '../types';
import { SACCO_INFO } from '../data/saccoData';

interface MemberPortalDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang?: Language;
  onOpenNewApplication?: () => void;
  onOpenLoanCalculator?: () => void;
}

export const MemberPortalDashboard: React.FC<MemberPortalDashboardProps> = ({
  isOpen,
  onClose,
  currentLang = 'rw',
  onOpenNewApplication,
  onOpenLoanCalculator,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'savings' | 'loans' | 'ussd'>('overview');
  const [savedApplication, setSavedApplication] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ubumwe_recent_application');
      if (stored) {
        setSavedApplication(JSON.parse(stored));
      } else {
        // Fallback demo application for first-time visitors to demonstrate functionality
        setSavedApplication({
          appNumber: 'UB-APPL-382910',
          fullName: 'Umunyamuryango (Member)',
          idNumber: '1199080012345012',
          phone: '0786422080',
          sector: 'Gakenke',
          accountType: 'Compulsory Savings & Credit',
          initialAmount: 25000,
          date: new Date().toLocaleDateString('en-GB'),
          status: 'PENDING VERIFICATION',
        });
      }
    } catch {}
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-50 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Member Portal
                </span>
                <span className="text-xs text-slate-500">UBUMWE SACCO Gakenke</span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
                Ikaze ku rubuga rw'Umunyamuryango (Member Self-Service)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Gusubira ku rubuga</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              title="Funga"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <ImigongoRibbon />

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Incamake (Overview)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('applications')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'applications'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ubusabe bwanjye (My Requests)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('savings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'savings'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PiggyBank className="w-3.5 h-3.5" />
            <span>Kuzigama (Savings)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('loans')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'loans'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Inguzanyo (Credit)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ussd')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ussd'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>USSD *541# Banki</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Member Welcome Card */}
              <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Umunyamuryango wemewe
                    </span>
                    <span className="text-xs text-slate-300">Akarere ka Gakenke</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                    Murakaza neza, {savedApplication?.fullName || 'Munyamuryango'}!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 max-w-xl">
                    Iri ni ipaji rigenewe abanyamuryango ba UBUMWE SACCO Gakenke ribafasha gukurikirana ubusabe bwabo, amakuru yo kuzigama n'inguzanyo, ndetse n'uburyo bwo gukoresha telefone binyuze kuri *541#.
                  </p>
                </div>
              </div>

              {/* Status of Recent Application */}
              {savedApplication && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Ubusabe buheruka (Latest Application)
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
                        Numero y'ubusabe: <span className="font-mono text-emerald-700">{savedApplication.appNumber}</span>
                      </h4>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 self-start sm:self-auto">
                      ⏳ {savedApplication.status || 'Buri mu isuzuma (Under Review)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Amazina:</span>
                      <strong className="text-slate-800">{savedApplication.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Telefone:</span>
                      <strong className="text-slate-800">{savedApplication.phone}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Umurenge:</span>
                      <strong className="text-slate-800">{savedApplication.sector} Branch</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Ubwoko bwa Konti:</span>
                      <strong className="text-slate-800">{savedApplication.accountType}</strong>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 text-[11px]">
                      Itariki bwakiriweho: {savedApplication.date || 'Today'}
                    </span>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Gucapa inyemezabwishyu (Print Dossier)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Service Quick Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <PiggyBank className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Gahunda zo Kuzigama</h4>
                    <p className="text-xs text-slate-500">
                      Ubwizigame rusange, konti z'urubyiruko, n'ubwizigame bw'amatsinda bugenerwa inyungu ingana na <strong>9.8%</strong> ku mwaka.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('savings')}
                    className="mt-4 text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Reba birambuye</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Inguzanyo Zihuse</h4>
                    <p className="text-xs text-slate-500">
                      Inguzanyo z'ubuhinzi n'ubworozi, iz'ubucuruzi buto n'ubuciriritse (SME), n'inguzanyo z'amashuri zisuzumwa mu masaha 48-72.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenLoanCalculator) onOpenLoanCalculator();
                      else setActiveTab('loans');
                    }}
                    className="mt-4 text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Kubara inguzanyo (Calculator)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Banki Kuri Telefone (*541#)</h4>
                    <p className="text-xs text-slate-500">
                      Kanda <strong>*541#</strong> kuri telefone yawe ushobore kureba amafaranga ufite, kubitsa no kubikuza binyuze kuri MoMo cyangwa Airtel Money.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ussd')}
                    className="mt-4 text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Amabwiriza ya USSD</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Ubusabe bw'Umunyamuryango (Member Applications)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Amakuru yose y'ubusabe wigeze gutanga kuri UBUMWE SACCO Gakenke
                  </p>
                </div>
                {onOpenNewApplication && (
                  <button
                    type="button"
                    onClick={onOpenNewApplication}
                    className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                  >
                    Tanga ubundi busabe
                  </button>
                )}
              </div>

              {savedApplication ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-sm text-emerald-800">
                      {savedApplication.appNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                      YARAKIRIWE
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-400 block">Umukiriya:</span>
                      <strong>{savedApplication.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Indangamuntu:</span>
                      <strong className="font-mono">{savedApplication.idNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Ishami ryakiriye:</span>
                      <strong>Ishami rya {savedApplication.sector}</strong>
                    </div>
                  </div>
                  <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-200">
                    Iyo ubusabe bumaze gusuzumwa n'akanama k'inguzanyo cyangwa abakozi b'ishami, muhita mubimenyeshwa kuri telefone <strong>{savedApplication.phone}</strong>.
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Nta busabe buheruka bwabonywe muri ubu bubiko bw'agateganyo.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAVINGS */}
          {activeTab === 'savings' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Gahunda zo Kuzigama muri UBUMWE SACCO Gakenke
              </h3>
              <p className="text-xs text-slate-500">
                Ubumwe SACCO ibika neza amafaranga y'abanyamuryango ikabagenera inyungu ishimishije:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <strong className="text-emerald-900 block font-bold text-sm">1. Ubwizigame Rusange</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Ubwizigame bwa buri munsi bufasha abaturage kwiteganyiriza no kubona serivisi z'imari zibegereye mu mirenge 19.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <strong className="text-emerald-900 block font-bold text-sm">2. Ubwizigame bw'Amatsinda (Solidarity)</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Amatsinda y'abahinzi n'aborozi, abacuruzi bato n'amashyirahamwe azigama hamwe bakagobokana.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <strong className="text-emerald-900 block font-bold text-sm">3. Konti y'Urubyiruko n'Abanyeshuri</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Gutoza urubyiruko umuco wo kuzigama hakiri kare nta kiguzi cyo kubika amafaranga.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <strong className="text-emerald-900 block font-bold text-sm">4. Imigabane n'Inyungu ku Mwaka</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Inyungu y'umugabane wa buri mwaka igeze kuri <strong>9.8%</strong>, ihabwa abanyamuryango bose bafite imigabane.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LOANS */}
          {activeTab === 'loans' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Amoko y'Inguzanyo Zihari
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold">
                    🌾
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">Inguzanyo y'Ubuhinzi n'Ubworozi</h5>
                    <p className="text-slate-600 mt-0.5">
                      Inguzanyo ifasha kugura ifumbire, imbuto z'indobanure, amatungo, n'imiti y'ubuhinzi. Yishyurwa nyuma y'isarura.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 font-bold">
                    🏪
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">Inguzanyo y'Ubucuruzi Bworoheje (SME Microfinance)</h5>
                    <p className="text-slate-600 mt-0.5">
                      Kuzamura igishoro cy'abacuruzi, abamotari, abatwara amagare, n'abanyabukorikori bo mu dusanteri twose twa Gakenke.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold">
                    🎓
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">Inguzanyo y'Amafaranga y'Ishuri</h5>
                    <p className="text-slate-600 mt-0.5">
                      Kwishyurira abana amafaranga y'ishuri n'ibikoresho ku gihe, ikishyurwa mu byiciro byoroheje buri kwezi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: USSD *541# */}
          {activeTab === 'ussd' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl">
                  *541#
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Uburyo bwo gukoresha USSD Code ya UBUMWE SACCO (*541#)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Serivisi ya banki igendanwa ikora amasaha 24 kuri 24, iminsi 7 mu cyumweru
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                  <span>Kanda <strong>*541#</strong> kuri telefone yawe (MTN cyangwa Airtel).</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                  <span>Shyiramo umubare w'ibanga wawe wahawe n'ishami rya SACCO (PIN).</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                  <span>Hitamo: <strong>1. Kureba amafaranga ari kuri konti</strong> cyangwa <strong>2. Kubikuza/Kohereza kuri Mobile Money</strong>.</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">4</span>
                  <span>Kwakira ubutumwa bugufi (SMS) bwemeza igikorwa wakoze ako kanya.</span>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                Niba utarabona umubare w'ibanga (PIN), mugane ishami ryacu rihegereye mu mirenge 19 ya Gakenke cyangwa mwahamagara umurongo utishyurwa kuri <strong>0786422080</strong>.
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="bg-white border-t border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Koperative icunzwe kandi igenzurwa na Banki Nkuru y'u Rwanda (BNR) &amp; RCA</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Ubufasha: <strong>0786422080</strong></span>
            <span>WhatsApp: <strong>+250 786 422 080</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};


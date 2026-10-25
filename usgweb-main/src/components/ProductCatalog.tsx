import React, { useState } from 'react';
import { Language, SaccoProduct } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { LoanCalculator } from './LoanCalculator';
import {
  Coins,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Smartphone,
  ArrowRight,
  Calculator,
  CheckCircle2,
  Sparkles,
  Plus,
  Edit2,
} from 'lucide-react';

interface ProductCatalogProps {
  currentLang: Language;
  products: SaccoProduct[];
  isAdmin: boolean;
  onOpenAdminConsole: () => void;
  onSelectProductForLoan: (product: SaccoProduct) => void;
  onSelectProductForAccount: (product: SaccoProduct) => void;
  onApplyWithCalculation: (calculationDetails: {
    amount: number;
    tenureMonths: number;
    loanType: string;
    monthlyPayment: number;
  }) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  currentLang,
  products,
  isAdmin,
  onOpenAdminConsole,
  onSelectProductForLoan,
  onSelectProductForAccount,
  onApplyWithCalculation,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'savings' | 'loans' | 'digital'>('all');
  const [showComingSoon, setShowComingSoon] = useState<string | null>(null);
  const t = TRANSLATIONS[currentLang];

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'all') return true;
    return p.category === activeTab;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'savings':
        return <Coins className="w-5 h-5 text-emerald-700" />;
      case 'loans':
        return <TrendingUp className="w-5 h-5 text-[#1b3a27]" />;
      case 'digital':
        return <Smartphone className="w-5 h-5 text-sky-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-slate-700" />;
    }
  };

  return (
    <section id="products" className="bg-slate-50 border-b border-slate-200">
      {/* Page Title Header (Aligned to Reference Image) */}
      <div className="bg-white border-b border-slate-200 py-10 sm:py-14 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 tracking-wider uppercase mb-2">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <span>
                {currentLang === 'fr'
                  ? 'Nos Solutions Financières Coopératives'
                  : currentLang === 'rw'
                  ? 'Serivisi za Koperative'
                  : 'Our Cooperative Financial Solutions'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight" style={{ textWrap: 'balance' }}>
              {currentLang === 'fr'
                ? 'Services · UBUMWE SACCO GAKENKE'
                : currentLang === 'rw'
                ? 'Serivisi Zacu · UBUMWE SACCO GAKENKE'
                : 'Our Services · UBUMWE SACCO GAKENKE'}
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-3xl">
              {t.products.subtitle}
            </p>
          </div>

          {/* Navigation Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.products.allTab}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('savings')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'savings'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.products.savingsTab}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('loans')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'loans'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.products.loansTab}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('digital')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'digital'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.products.digitalTab}
            </button>

            {/* Admin Direct CRUD Action */}
            {isAdmin && onOpenAdminConsole && (
              <button
                type="button"
                onClick={onOpenAdminConsole}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-700 hover:bg-emerald-600 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Open Admin Console to Add, Edit, or Delete Financial Products"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {currentLang === 'fr'
                    ? 'Gérer / Ajouter Produit'
                    : currentLang === 'rw'
                    ? 'Gucunga / Kongeramo Serivisi'
                    : 'Manage / Add Product'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => {
            const isLoan = product.category === 'loans';
            const title = currentLang === 'fr' ? (product.titleFr || product.titleEn) : currentLang === 'rw' ? product.titleRw : product.titleEn;
            const tagline = currentLang === 'fr' ? (product.taglineFr || product.taglineEn) : currentLang === 'rw' ? product.taglineRw : product.taglineEn;
            const features = currentLang === 'fr' ? (product.featuresFr || product.featuresEn) : currentLang === 'rw' ? product.featuresRw : product.featuresEn;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group p-6 sm:p-7 relative"
              >
                {product.popular && (
                  <span className="absolute top-4 right-4 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {currentLang === 'fr' ? 'Le Plus Populaire' : currentLang === 'rw' ? 'Ikunzwe Cyane' : 'Most Popular'}
                  </span>
                )}

                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {getCategoryIcon(product.category)}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {title}
                      </h3>
                      {product.interestRate && (
                        <span className="text-xs font-semibold text-emerald-700 font-mono-numbers">
                          {product.interestRate}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                    {tagline}
                  </p>

                  {/* Key Features */}
                  {features && features.length > 0 && (
                    <div className="space-y-1.5 mb-6 pt-3 border-t border-slate-100">
                      {features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="pt-4 border-t border-slate-100">
                  {isLoan ? (
                    <button
                      type="button"
                      onClick={() => {
                        const calcEl = document.getElementById('calculator');
                        if (calcEl) {
                          calcEl.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="w-full py-2.5 px-4 bg-[#1b3a27] hover:bg-[#132c1c] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Calculator className="w-4 h-4 text-emerald-300" />
                      <span>{currentLang === 'fr' ? 'Calculer ce Prêt' : currentLang === 'rw' ? 'Bara Iyi Nguzanyo' : 'Calculate This Loan'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowComingSoon(product.titleEn || 'Savings Account')}
                      className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-200" />
                      <span>{currentLang === 'en' ? 'Open Account' : currentLang === 'fr' ? 'Ouvrir un Compte' : 'Fungura Konti'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Admin Quick Edit Button */}
                  {isAdmin && onOpenAdminConsole && (
                    <button
                      type="button"
                      onClick={onOpenAdminConsole}
                      className="mt-2 w-full py-1.5 px-3 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Edit in Admin (CRUD)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Coming Soon Interactive Toast/Modal */}
        {showComingSoon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-emerald-500/30 text-center space-y-4 relative">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-xs">
                <Sparkles className="w-7 h-7 text-amber-500 animate-pulse" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 mb-2">
                  {currentLang === 'en' ? 'Coming Soon' : currentLang === 'fr' ? 'Bientôt Disponible' : 'Biri Hafi Kuza'}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {currentLang === 'en'
                    ? 'Online Account Opening Coming Soon'
                    : currentLang === 'fr'
                    ? 'Ouverture de Compte en Ligne Bientôt Disponible'
                    : 'Gufungura Konti kuri Interineti Biri Hafi Kuza'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                  {currentLang === 'en'
                    ? `Direct self-service digital account onboarding for ${showComingSoon} is currently being upgraded for security compliance with BNR/RCA regulations.`
                    : currentLang === 'fr'
                    ? `Le service d'ouverture de compte direct en ligne pour ${showComingSoon} est en cours de déploiement sécurisé.`
                    : `Gufungura konti ya ${showComingSoon} ako kanya kuri interineti biri gutunganywa neza kugira ngo byubahirize amabwiriza ya Banki Nkuru y'u Rwanda.`}
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-left text-xs text-emerald-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {currentLang === 'en'
                      ? 'Available Now via USSD or Branch'
                      : currentLang === 'fr'
                      ? 'Disponible via USSD ou en Agence'
                      : 'Wafungura Konti ako kanya uciye kuri USSD cyangwa ku Ishami'}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  {currentLang === 'en'
                    ? 'Dial *541# on your phone or visit any of our 6 branches across Gakenke District.'
                    : currentLang === 'fr'
                    ? 'Composez le *541# sur votre téléphone ou rendez-vous dans l’une de nos 6 agences à Gakenke.'
                    : 'Kanda *541# kuri telefoni yawe cyangwa usure rimwe mu mashami yacu 6 ari muri Gakenke.'}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowComingSoon(null)}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  {currentLang === 'en' ? 'Understood' : currentLang === 'fr' ? 'Compris' : 'Nabyumvise'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loan Calculator Integrated Directly Inside Our Services */}
      <div id="calculator" className="border-t border-[#DCCCFF]/60 bg-[#F5F0FF]/40 py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1b3a27] tracking-wider uppercase mb-1">
              <Calculator className="w-4 h-4 text-emerald-700" />
              <span>{currentLang === 'fr' ? 'Simulateur de Remboursement' : currentLang === 'rw' ? "Kubara Ubwishyu bw'Inguzanyo" : 'Loan Repayment Simulator'}</span>
            </span>
            <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {currentLang === 'fr' ? 'Simulez Vos Mensualités de Prêt' : currentLang === 'rw' ? 'Bara Amafaranga Uzajya Wishyura Buri Kwezi' : 'Simulate Your Monthly Installments'}
            </h3>
          </div>

          <LoanCalculator
            currentLang={currentLang}
            onApplyWithCalculation={onApplyWithCalculation}
          />
        </div>
      </div>
    </section>
  );
};



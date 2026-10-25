import React, { useState } from 'react';
import { Language, Announcement, CommunityImpactStory } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { ANNOUNCEMENTS, TESTIMONIALS, SACCO_IMAGES, SACCO_INFO } from '../data/saccoData';
import { ShieldCheck, Calendar, ArrowRight, ArrowLeft, UserCheck, X, Phone, Mail, Plus, Edit2, Trash2, ImageIcon, Sparkles, Bell, Printer } from 'lucide-react';
import { ImigongoRibbon } from './ImigongoPattern';
import { ImageUploader } from './ImageUploader';

interface GovernanceAndNewsProps {
  currentLang: Language;
  announcements?: Announcement[];
  communityStories?: CommunityImpactStory[];
  isAdmin?: boolean;
  onOpenAdminConsole?: (tab?: string) => void;
  onAddAnnouncement?: (ann: Omit<Announcement, 'id'>) => void;
  onUpdateAnnouncement?: (id: string, updated: Partial<Announcement>) => void;
  onDeleteAnnouncement?: (id: string) => void;
  onAddCommunityStory?: (story: Omit<CommunityImpactStory, 'id'>) => void;
  onUpdateCommunityStory?: (id: string, updated: Partial<CommunityImpactStory>) => void;
  onDeleteCommunityStory?: (id: string) => void;
}

export const GovernanceAndNews: React.FC<GovernanceAndNewsProps> = ({
  currentLang,
  announcements = ANNOUNCEMENTS,
  communityStories = TESTIMONIALS,
  isAdmin = false,
  onOpenAdminConsole,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  onAddCommunityStory,
  onUpdateCommunityStory,
  onDeleteCommunityStory,
}) => {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const t = TRANSLATIONS[currentLang];

  // Inline quick-edit state for image change
  const [quickEditId, setQuickEditId] = useState<string | null>(null);
  const [quickImgUrl, setQuickImgUrl] = useState('');

  const handleQuickImageSave = () => {
    if (quickEditId && onUpdateAnnouncement && quickImgUrl) {
      onUpdateAnnouncement(quickEditId, { imageUrl: quickImgUrl });
    }
    setQuickEditId(null);
    setQuickImgUrl('');
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'agm': return 'bg-blue-700 text-white';
      case 'dividend': return 'bg-amber-600 text-white';
      case 'loan_window': return 'bg-emerald-700 text-white';
      default: return 'bg-slate-700 text-white';
    }
  };

  const storiesList: CommunityImpactStory[] = communityStories && communityStories.length > 0 ? communityStories : TESTIMONIALS as CommunityImpactStory[];

  return (
    <section id="announcements" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-16 lg:space-y-24">
        {/* Section 1: Member Stories & Social Proof */}
        <div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 mb-8 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 tracking-wider uppercase mb-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>
                  {currentLang === 'fr'
                    ? 'Impact Communautaire & Témoignages'
                    : currentLang === 'rw'
                    ? "Ubuhamya bw'Iterambere"
                    : 'Community Impact & Stories'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight" style={{ textWrap: 'balance' }}>
                {currentLang === 'fr'
                  ? 'Témoignages · UBUMWE SACCO GAKENKE'
                  : currentLang === 'rw'
                  ? 'Ubuhamya · UBUMWE SACCO GAKENKE'
                  : 'Impact Stories · UBUMWE SACCO GAKENKE'}
              </h2>
              <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-3xl">
                {currentLang === 'fr'
                  ? "Témoignages authentiques de transformation agricole et d'expansion commerciale des membres de Gakenke."
                  : currentLang === 'rw'
                  ? "Ubuhamya bw'abahinzi, aborozi n'abacuruzi batejwe imbere na serivisi za Ubumwe SACCO Gakenke."
                  : 'Real accounts of agricultural transformation and retail expansion from Gakenke members.'}
              </p>
            </div>

            {isAdmin && onOpenAdminConsole && (
              <button
                type="button"
                onClick={() => onOpenAdminConsole('impact')}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  {currentLang === 'fr'
                    ? 'Gérer Témoignages (CRUD)'
                    : currentLang === 'rw'
                    ? 'Kongeraho Ubuhamya (CRUD)'
                    : 'Manage Stories (CRUD)'}
                </span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {storiesList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs hover:border-slate-300 transition-colors relative group"
              >
                <div className="h-56 sm:h-64 overflow-hidden relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700">
                    {item.metric}
                  </div>

                  {isAdmin && onOpenAdminConsole && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 z-20">
                      <button
                        type="button"
                        onClick={() => onOpenAdminConsole('impact')}
                        className="px-2.5 py-1 bg-slate-950/80 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold backdrop-blur-md border border-white/20 flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                        title="Edit story in admin console"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      {onDeleteCommunityStory && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete impact story for ${item.name}?`)) {
                              onDeleteCommunityStory(item.id);
                            }
                          }}
                          className="px-2 py-1 bg-rose-600/90 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold backdrop-blur-md flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                          title="Delete story"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <blockquote className="text-sm sm:text-base text-slate-700 leading-relaxed italic">
                    "{currentLang === 'fr' ? ((item as CommunityImpactStory).quoteFr || item.quoteEn) : currentLang === 'rw' ? item.quoteRw || item.quoteEn : item.quoteEn}"
                  </blockquote>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{item.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {currentLang === 'fr' ? ((item as CommunityImpactStory).roleFr || item.roleEn) : currentLang === 'rw' ? item.roleRw || item.roleEn : item.roleEn}
                      </p>
                    </div>
                    <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Official Announcements & News for UBUMWE SACCO GAKENKE */}
        <div id="news">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 tracking-wider uppercase mb-2">
                <Bell className="w-4 h-4 text-emerald-700" />
                <span>
                  {currentLang === 'fr'
                    ? 'Bulletins Officiels & Presse'
                    : currentLang === 'rw'
                    ? "Amatangazo n'Amakuru Mashya"
                    : 'Official Bulletins & Press'}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                {currentLang === 'fr'
                  ? 'Actualités · UBUMWE SACCO GAKENKE'
                  : currentLang === 'rw'
                  ? 'Amakuru · UBUMWE SACCO GAKENKE'
                  : 'News · UBUMWE SACCO GAKENKE'}
              </h3>
              <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-3xl">
                {currentLang === 'fr'
                  ? `Annonces des assemblées générales, dividendes et avis officiels. Ligne directe : ${SACCO_INFO.phone}`
                  : currentLang === 'rw'
                  ? `Amatangazo y'inama rusange, amakuru y'inyungu n'imigabane. Telefone: ${SACCO_INFO.phone}`
                  : `General assembly notices, dividend releases, and official updates. Direct inquiries: ${SACCO_INFO.phone}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && onAddAnnouncement && (
                <button
                  type="button"
                  onClick={() => onOpenAdminConsole?.('announcements')}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Publish News
                </button>
              )}
              {isAdmin && onOpenAdminConsole && !onAddAnnouncement && (
                <button
                  type="button"
                  onClick={() => onOpenAdminConsole('announcements')}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shrink-0"
                >
                  Manage Bulletins
                </button>
              )}
            </div>
          </div>

          {/* News Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col group"
              >
                {/* Card Image */}
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  {ann.imageUrl ? (
                    <img
                      src={ann.imageUrl}
                      alt={currentLang === 'fr' ? ann.titleFr || ann.titleEn : currentLang === 'rw' ? ann.titleRw || ann.titleEn : ann.titleEn}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-slate-300" />
                    </div>
                  )}
                  {/* Category badge */}
                  <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${getCategoryColor(ann.category)}`}>
                    {ann.category.replace('_', ' ')}
                  </span>
                  {/* Admin overlay */}
                  {isAdmin && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => onOpenAdminConsole?.('announcements')}
                        className="p-1.5 bg-white/90 backdrop-blur-xs rounded-lg text-slate-600 hover:text-emerald-700 border border-slate-200 shadow-xs"
                        title="Edit notice"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteAnnouncement?.(ann.id)}
                        className="p-1.5 bg-white/90 backdrop-blur-xs rounded-lg text-slate-400 hover:text-red-600 border border-slate-200 shadow-xs"
                        title="Delete notice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{ann.date}</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mb-2">
                    {currentLang === 'fr' ? ann.titleFr || ann.titleEn : currentLang === 'rw' ? ann.titleRw || ann.titleEn : ann.titleEn}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-3 flex-1">
                    {currentLang === 'fr' ? ann.summaryFr || ann.summaryEn : currentLang === 'rw' ? ann.summaryRw || ann.summaryEn : ann.summaryEn}
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedAnnouncement(ann)}
                      className="w-full px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>{t.governance.learnMore}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full-Page Official News & Bulletin Reader (Full Page instead of Popup) */}
        {selectedAnnouncement && (
          <div className="fixed inset-0 z-50 bg-white overflow-y-auto flex flex-col animate-in fade-in duration-200">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-2xs">
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-slate-900 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>
                  {currentLang === 'fr'
                    ? 'Retour aux Actualités'
                    : currentLang === 'rw'
                    ? 'Subira ku Makuru'
                    : 'Back to All News & Bulletins'}
                </span>
              </button>

              <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>UBUMWE SACCO GAKENKE · Official Bulletin Archive</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Print Official Bulletin"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span className="hidden sm:inline">Print Bulletin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAnnouncement(null)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  aria-label="Close article"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Imigongo ribbon top trim */}
            <ImigongoRibbon height={8} variant="light" bordered={false} />

            {/* Main Full-Page Article Content Area */}
            <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 space-y-8">
              {/* Meta tags and breadcrumb */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>
                    {currentLang === 'fr'
                      ? 'AVIS OFFICIEL SACCO'
                      : currentLang === 'rw'
                      ? 'ITANGAZO RYEMEWE RYA SACCO'
                      : 'OFFICIAL SACCO NOTICE'}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span>
                    {currentLang === 'fr' ? 'Publié :' : currentLang === 'rw' ? 'Yashyizweho :' : 'Published:'}{' '}
                    <strong>{selectedAnnouncement.date}</strong>
                  </span>
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500">Gakenke District, Northern Province, Rwanda</span>
              </div>

              {/* Massive Full Article Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight sm:leading-tight">
                {currentLang === 'fr'
                  ? selectedAnnouncement.titleFr || selectedAnnouncement.titleEn
                  : currentLang === 'rw'
                  ? selectedAnnouncement.titleRw || selectedAnnouncement.titleEn
                  : selectedAnnouncement.titleEn}
              </h1>

              {/* Full-Width Featured Photograph */}
              {selectedAnnouncement.imageUrl && (
                <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-lg bg-slate-950 max-h-[500px]">
                  <img
                    src={selectedAnnouncement.imageUrl}
                    alt={currentLang === 'fr' ? selectedAnnouncement.titleFr || selectedAnnouncement.titleEn : currentLang === 'rw' ? selectedAnnouncement.titleRw || selectedAnnouncement.titleEn : selectedAnnouncement.titleEn}
                    className="w-full h-full object-cover"
                  />
                  <div className="p-3 bg-slate-900/90 text-slate-300 text-xs flex items-center justify-between">
                    <span>Official Institutional Archive Photograph · UBUMWE SACCO GAKENKE</span>
                    <span className="text-emerald-400 font-mono-numbers">{selectedAnnouncement.date}</span>
                  </div>
                </div>
              )}

              {/* Lead Summary Callout */}
              <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50/80 border-l-4 border-emerald-700 border-y border-r border-emerald-200 text-slate-900 text-sm sm:text-base font-semibold leading-relaxed shadow-2xs">
                {currentLang === 'fr'
                  ? selectedAnnouncement.summaryFr || selectedAnnouncement.summaryEn
                  : currentLang === 'rw'
                  ? selectedAnnouncement.summaryRw || selectedAnnouncement.summaryEn
                  : selectedAnnouncement.summaryEn}
              </div>

              {/* Full Detailed Body Content */}
              <div className="text-sm sm:text-base lg:text-lg text-slate-800 leading-loose space-y-6">
                <div className="whitespace-pre-line leading-relaxed">
                  {currentLang === 'fr'
                    ? selectedAnnouncement.contentFr || selectedAnnouncement.contentEn
                    : currentLang === 'rw'
                    ? selectedAnnouncement.contentRw || selectedAnnouncement.contentEn
                    : selectedAnnouncement.contentEn}
                </div>
              </div>

              {/* Administrative Regulatory Signature Box */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Cooperative Governance &amp; Compliance Statement</h4>
                    <p className="text-xs text-slate-500">
                      RCA Microfinance Regulation: {SACCO_INFO.rcaRegistration} · District: {SACCO_INFO.district}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  This bulletin has been issued under the cooperative authority of Executive Manager (Mbitsemunda Phocas) and the Board of Directors (Wellarse, Bartazal). For questions regarding meeting resolutions, dividend distribution formulas, or credit policies, please contact our help desk.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono-numbers text-slate-700">
                  <a href={`tel:${SACCO_INFO.phone}`} className="flex items-center gap-1.5 hover:text-emerald-700">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{SACCO_INFO.phone}</span>
                  </a>
                  <a href={`mailto:${SACCO_INFO.email}`} className="flex items-center gap-1.5 hover:text-emerald-700">
                    <Mail className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{SACCO_INFO.email}</span>
                  </a>
                </div>
              </div>

              {/* Admin: In-reader image editor */}
              {isAdmin && onUpdateAnnouncement && (
                <div className="p-5 bg-slate-100 rounded-2xl border border-slate-200">
                  {quickEditId === selectedAnnouncement.id ? (
                    <div className="space-y-3">
                      <ImageUploader
                        value={quickImgUrl}
                        onChange={setQuickImgUrl}
                        label="Change Bulletin Article Picture"
                        aspectRatio="video"
                        presets={[
                          { label: 'Governance', url: '/src/assets/images/community_governance_1791989970347.jpg' },
                          { label: 'Farmers', url: '/src/assets/images/farmers_cooperative_1791989969904.jpg' },
                          { label: 'Banking Hall', url: '/src/assets/images/mbitsemunda_phocas_desk.jpg' },
                        ]}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleQuickImageSave}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Save New Picture
                        </button>
                        <button
                          type="button"
                          onClick={() => { setQuickEditId(null); setQuickImgUrl(''); }}
                          className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setQuickEditId(selectedAnnouncement.id); setQuickImgUrl(selectedAnnouncement.imageUrl || ''); }}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Admin: Update or replace this article photograph</span>
                    </button>
                  )}
                </div>
              )}

              {/* Bottom Back Button */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedAnnouncement(null)}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>
                    {currentLang === 'fr'
                      ? 'Retour à la Liste des Actualités'
                      : currentLang === 'rw'
                      ? 'Subira ku Rutonde rw\'Amakuru'
                      : 'Return to All Bulletins & News'}
                  </span>
                </button>
                <span className="text-xs text-slate-500">UBUMWE SACCO GAKENKE · Official Publication</span>
              </div>
            </main>
          </div>
        )}
      </div>

    </section>
  );
};

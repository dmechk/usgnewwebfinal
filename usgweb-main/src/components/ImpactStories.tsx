import React from 'react';
import { Language, CommunityImpactStory } from '../types';
import { TESTIMONIALS } from '../data/saccoData';
import { Sparkles, Plus, Edit2, Trash2, UserCheck } from 'lucide-react';

interface ImpactStoriesProps {
  currentLang: Language;
  communityStories?: CommunityImpactStory[];
  isAdmin?: boolean;
  onOpenAdminConsole?: (tab?: string) => void;
  onAddCommunityStory?: (story: Omit<CommunityImpactStory, 'id'>) => void;
  onUpdateCommunityStory?: (id: string, updated: Partial<CommunityImpactStory>) => void;
  onDeleteCommunityStory?: (id: string) => void;
}

export const ImpactStories: React.FC<ImpactStoriesProps> = ({
  currentLang,
  communityStories = TESTIMONIALS,
  isAdmin = false,
  onOpenAdminConsole,
  onDeleteCommunityStory,
}) => {
  const storiesList: CommunityImpactStory[] =
    communityStories && communityStories.length > 0
      ? communityStories
      : (TESTIMONIALS as CommunityImpactStory[]);

  return (
    <section id="impact-stories" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
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
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight"
              style={{ textWrap: 'balance' }}
            >
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
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs hover:border-emerald-300 hover:shadow-md transition-all relative group"
            >
              <div className="h-56 sm:h-64 overflow-hidden relative bg-slate-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-md text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700 shadow-sm">
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

              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                <blockquote className="text-sm sm:text-base text-slate-700 leading-relaxed italic">
                  "{currentLang === 'fr' ? (item.quoteFr || item.quoteEn) : currentLang === 'rw' ? item.quoteRw || item.quoteEn : item.quoteEn}"
                </blockquote>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{item.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {currentLang === 'fr' ? (item.roleFr || item.roleEn) : currentLang === 'rw' ? item.roleRw || item.roleEn : item.roleEn}
                    </p>
                  </div>
                  <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


import React, { useState } from 'react';
import { Language, HomeVideoItem } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { Play, Video as VideoIcon, Plus, Sparkles, Edit2 } from 'lucide-react';
import { ImigongoRibbon } from './ImigongoPattern';

interface HomeVideoSectionProps {
  currentLang: Language;
  videos: HomeVideoItem[];
  isAdmin?: boolean;
  onOpenAdminConsole?: (tab?: string) => void;
  onAddVideo?: (video: Omit<HomeVideoItem, 'id'>) => void;
  onDeleteVideo?: (id: string) => void;
}

export const HomeVideoSection: React.FC<HomeVideoSectionProps> = ({
  currentLang,
  videos = [],
  isAdmin = false,
  onOpenAdminConsole,
  onDeleteVideo,
}) => {
  // If there are no videos uploaded and user is not an admin, we keep it optional and do not render empty space
  if (videos.length === 0 && !isAdmin) {
    return null;
  }

  const [activeVideoId, setActiveVideoId] = useState<string>(videos[0]?.id || '');
  const activeVideo = videos.find((v) => v.id === activeVideoId) || videos[0];

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}?rel=0&playsinline=1&modestbranding=1`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?rel=0&playsinline=1&modestbranding=1`;
    }
    return url;
  };

  const isEmbed = (url: string) =>
    url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');

  return (
    <section className="py-16 bg-slate-900 text-white relative overflow-hidden border-b border-slate-800">
      {/* Decorative ambient backdrop */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentLang === 'fr' ? 'Découvrir UBUMWE SACCO' : currentLang === 'rw' ? 'Menya Birambuye UBUMWE SACCO' : 'Discover UBUMWE SACCO'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              {currentLang === 'fr'
                ? 'Vidéos Coopératives & Réussites des Membres'
                : currentLang === 'rw'
                ? 'Amashusho n’Ubuhamya bw’Iterambere ry’Abanyamuryango'
                : 'Cooperative Video Showcase & Member Success'}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-2">
              {currentLang === 'fr'
                ? 'Découvrez comment notre épargne coopérative, nos micro-prêts et le service USSD *541# transforment la vie des agriculteurs et entrepreneurs de Gakenke.'
                : currentLang === 'rw'
                ? 'Reba uko ubwizigame, inguzanyo ziciriritse, na serivisi za USSD *541# bihindura imibereho n\'ubucuruzi mu Karere ka Gakenke.'
                : 'Watch how our cooperative savings, micro-loans, and digital USSD *541# empower farmers and entrepreneurs across Gakenke.'}
            </p>
          </div>

          {/* Admin Control */}
          {isAdmin && onOpenAdminConsole && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAdminConsole('videos')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload / Manage Attraction Videos (Admin)</span>
              </button>
            </div>
          )}
        </div>

        {/* When videos exist */}
        {videos.length > 0 && activeVideo ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Primary Video Player Screen (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="relative rounded-3xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video shadow-2xl group">
                {isEmbed(activeVideo.videoUrl) ? (
                  <iframe
                    src={getEmbedUrl(activeVideo.videoUrl)}
                    title={activeVideo.titleEn}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <video
                    key={activeVideo.videoUrl}
                    src={activeVideo.videoUrl}
                    controls
                    playsInline
                    autoPlay={false}
                    className="w-full h-full object-cover"
                    poster={activeVideo.thumbnailUrl}
                  />
                )}

                {/* Badge if available */}
                {activeVideo.badge && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-full text-xs font-bold text-emerald-400 border border-emerald-500/30">
                    {activeVideo.badge}
                  </div>
                )}
              </div>

              {/* Video Title and Caption */}
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {currentLang === 'fr' ? (activeVideo.titleFr || activeVideo.titleEn) : currentLang === 'rw' ? activeVideo.titleRw : activeVideo.titleEn}
                  </h3>
                  {(activeVideo.descriptionEn || activeVideo.descriptionRw) && (
                    <p className="text-xs text-slate-300 mt-1">
                      {currentLang === 'fr' ? (activeVideo.descriptionFr || activeVideo.descriptionEn) : currentLang === 'rw' ? activeVideo.descriptionRw : activeVideo.descriptionEn}
                    </p>
                  )}
                </div>

                {isAdmin && onOpenAdminConsole && (
                  <button
                    type="button"
                    onClick={() => onOpenAdminConsole('videos')}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Manage</span>
                  </button>
                )}
              </div>
            </div>

            {/* Video Playlist / Attraction Highlights (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Featured Client Videos ({videos.length})</span>
                <span className="text-emerald-400 font-mono-numbers">HD 1080p</span>
              </div>

              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {videos.map((vid) => {
                  const isCurrent = vid.id === activeVideo.id;
                  return (
                    <button
                      key={vid.id}
                      type="button"
                      onClick={() => setActiveVideoId(vid.id)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-lg'
                          : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="w-20 h-14 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden relative shrink-0 flex items-center justify-center">
                        {vid.thumbnailUrl ? (
                          <img
                            src={vid.thumbnailUrl}
                            alt={vid.titleEn}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <VideoIcon className="w-6 h-6 text-slate-500" />
                        )}
                        <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                          <Play className={`w-4 h-4 ${isCurrent ? 'text-emerald-400 fill-emerald-400' : 'text-white'}`} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold truncate text-white">
                          {currentLang === 'fr' ? (vid.titleFr || vid.titleEn) : currentLang === 'rw' ? vid.titleRw : vid.titleEn}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {currentLang === 'fr' ? (vid.descriptionFr || vid.descriptionEn) : currentLang === 'rw' ? vid.descriptionRw : vid.descriptionEn}
                        </p>
                        {vid.badge && (
                          <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                            {vid.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Empty placeholder for Admin when no videos have been added yet */
          isAdmin && (
            <div className="p-8 text-center rounded-3xl border border-dashed border-slate-700 bg-slate-800/40 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                <VideoIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Attraction Videos Uploaded Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                As an Admin, you can upload captivating videos or paste YouTube links showing member success, cooperative awards, or services to attract more clients.
              </p>
              <button
                type="button"
                onClick={() => onOpenAdminConsole?.('videos')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload First Video</span>
              </button>
            </div>
          )
        )}
      </div>

    </section>
  );
};

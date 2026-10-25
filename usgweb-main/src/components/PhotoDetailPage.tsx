import React, { useState, useEffect } from 'react';
import { Language, InstitutionMoment } from '../types';
import {
  ArrowLeft,
  Calendar,
  Camera,
  ChevronLeft,
  ChevronRight,
  Eye,
  Share2,
  Check,
  Trophy,
  PiggyBank,
  Building2,
  Users,
  GraduationCap,
  Sparkles,
  Maximize2,
  Grid,
  Plus,
  Trash2,
  X,
  ArrowRight,
  Layers
} from 'lucide-react';
import { ImigongoRibbon } from './ImigongoPattern';
import { ImageUploader } from './ImageUploader';

interface PhotoDetailPageProps {
  moment: InstitutionMoment | null;
  allMoments: InstitutionMoment[];
  currentLang: Language;
  isAdmin: boolean;
  onBack: () => void;
  onNavigateMoment: (momentId: string) => void;
  onUpdateMoment?: (id: string, updated: Partial<InstitutionMoment>) => void;
  onDeleteMoment?: (id: string) => void;
  onOpenAdminConsole?: (tab?: string) => void;
}

export const PhotoDetailPage: React.FC<PhotoDetailPageProps> = ({
  moment,
  allMoments,
  currentLang,
  isAdmin,
  onBack,
  onNavigateMoment,
  onUpdateMoment,
  onDeleteMoment,
  onOpenAdminConsole,
}) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // Reset active photo index when moment changes
  useEffect(() => {
    setActivePhotoIndex(0);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [moment?.id]);

  // Keyboard navigation for photos
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!moment) return;
      const photos = getMomentPhotos(moment);
      if (e.key === 'ArrowRight') {
        if (photos.length > 1) {
          setActivePhotoIndex((prev) => (prev + 1) % photos.length);
        }
      } else if (e.key === 'ArrowLeft') {
        if (photos.length > 1) {
          setActivePhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
        }
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moment, isFullscreen]);

  const getMomentPhotos = (m: InstitutionMoment | null): string[] => {
    if (!m) return [];
    if (m.additionalImages && m.additionalImages.length > 0) {
      return Array.from(new Set([m.imageUrl, ...m.additionalImages]));
    }
    return [m.imageUrl];
  };

  const photos = getMomentPhotos(moment);

  const handleNextPhoto = () => {
    if (photos.length > 1) {
      setActivePhotoIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const handlePrevPhoto = () => {
    if (photos.length > 1) {
      setActivePhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleSaveNewPhoto = () => {
    if (moment && newPhotoUrl.trim() && onUpdateMoment) {
      const updatedPhotos = Array.from(new Set([...photos, newPhotoUrl.trim()]));
      onUpdateMoment(moment.id, {
        additionalImages: updatedPhotos,
      });
      setActivePhotoIndex(updatedPhotos.length - 1);
      setNewPhotoUrl('');
      setIsAddingPhoto(false);
    }
  };

  const handleDeleteCurrentPhoto = () => {
    if (!moment || photos.length <= 1 || !onUpdateMoment) return;
    const photoToDelete = photos[activePhotoIndex];
    const updatedPhotos = photos.filter((_, idx) => idx !== activePhotoIndex);
    const newPrimary = moment.imageUrl === photoToDelete ? updatedPhotos[0] : moment.imageUrl;

    onUpdateMoment(moment.id, {
      imageUrl: newPrimary,
      additionalImages: updatedPhotos,
    });
    setActivePhotoIndex(Math.max(0, activePhotoIndex - 1));
  };

  const getCategoryBadge = (cat?: InstitutionMoment['category']) => {
    switch (cat) {
      case 'award':
        return {
          icon: <Trophy className="w-4 h-4 text-amber-500" />,
          label: currentLang === 'fr' ? 'Excellence & Prix' : currentLang === 'rw' ? 'Ibihembo n\'Ishimwe' : 'Excellence & Awards',
          color: 'bg-amber-50 text-amber-900 border-amber-200',
        };
      case 'agm_dividend':
        return {
          icon: <PiggyBank className="w-4 h-4 text-emerald-600" />,
          label: currentLang === 'fr' ? 'Dividendes & Assemblée Générale' : currentLang === 'rw' ? 'Inama Rusange & Inyungu' : 'Dividends & AGM Assembly',
          color: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        };
      case 'branch_opening':
        return {
          icon: <Building2 className="w-4 h-4 text-blue-600" />,
          label: currentLang === 'fr' ? 'Guichet Bancaire & Infrastructures' : currentLang === 'rw' ? 'Amashami & Utubande' : 'Banking Hall & Infrastructure',
          color: 'bg-blue-50 text-blue-900 border-blue-200',
        };
      case 'community':
        return {
          icon: <Users className="w-4 h-4 text-purple-600" />,
          label: currentLang === 'fr' ? 'Communauté & Agriculteurs' : currentLang === 'rw' ? 'Abahinzi n\'Abanyamuryango' : 'Community & Farmers Field',
          color: 'bg-purple-50 text-purple-900 border-purple-200',
        };
      case 'training':
        return {
          icon: <GraduationCap className="w-4 h-4 text-orange-600" />,
          label: currentLang === 'fr' ? 'Éducation Financière' : currentLang === 'rw' ? 'Amahugurwa n\'Ubumenyi' : 'Financial Literacy',
          color: 'bg-orange-50 text-orange-900 border-orange-200',
        };
      default:
        return {
          icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
          label: currentLang === 'fr' ? 'Événement Institutionnel' : currentLang === 'rw' ? 'Ibyagezweho' : 'Institutional Milestone',
          color: 'bg-slate-100 text-slate-800 border-slate-200',
        };
    }
  };

  if (!moment) {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center mb-4 text-slate-500">
          <Camera className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Photo Not Found</h2>
        <p className="text-slate-600 text-sm max-w-md mb-6">
          The requested photo milestone could not be found or may have been updated.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Photo Gallery</span>
        </button>
      </div>
    );
  }

  const badge = getCategoryBadge(moment.category);

  // Find previous and next moments
  const currentIndex = allMoments.findIndex((m) => m.id === moment.id);
  const prevMoment = currentIndex > 0 ? allMoments[currentIndex - 1] : null;
  const nextMoment = currentIndex < allMoments.length - 1 ? allMoments[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Imigongo Ribbon Accent */}
      <ImigongoRibbon height={8} variant="dark" bordered={false} />

      {/* Dedicated Page Header & Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-slate-900 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>
                {currentLang === 'fr'
                  ? 'Retour à la Galerie'
                  : currentLang === 'rw'
                  ? 'Subira ku Mafoto'
                  : 'Back to Photo Gallery'}
              </span>
            </button>

            {/* Breadcrumb on desktop */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Home</span>
              <span>/</span>
              <button
                type="button"
                onClick={onBack}
                className="hover:text-emerald-700 font-bold transition-colors cursor-pointer"
              >
                Gallery
              </button>
              <span>/</span>
              <span className="text-slate-900 font-bold max-w-[220px] truncate">
                {currentLang === 'fr' ? moment.titleFr || moment.titleEn : currentLang === 'rw' ? moment.titleRw : moment.titleEn}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Copy link to this photo"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-emerald-200"
            >
              <Grid className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">All Photos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {/* Photo Stage Area */}
        <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative select-none">
          {/* Top Stage Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-20 pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
              <span className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-white border border-slate-700 flex items-center gap-2 shadow-lg">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Photo {activePhotoIndex + 1} of {photos.length}
                </span>
              </span>

              <span className="hidden sm:flex bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-300 border border-slate-700 items-center gap-1.5 shadow-lg">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>{moment.date}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-full bg-slate-900/90 hover:bg-emerald-700 text-white border border-slate-700 shadow-lg transition-all cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'View Full Resolution'}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Photo Display */}
          <div
            className={`relative flex items-center justify-center transition-all duration-300 ${
              isFullscreen
                ? 'min-h-[80vh] max-h-[85vh]'
                : 'min-h-[380px] sm:min-h-[500px] md:min-h-[580px] max-h-[640px]'
            }`}
          >
            <img
              src={photos[activePhotoIndex] || moment.imageUrl}
              alt={moment.titleEn}
              className="max-h-[640px] w-full object-contain transition-all duration-300"
              referrerPolicy="no-referrer"
            />

            {/* Left Prev Navigation Button */}
            {photos.length > 1 && (
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-slate-900/85 hover:bg-emerald-600 text-white shadow-2xl transition-all cursor-pointer z-20 border border-slate-700/60"
                title="Previous Photo (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Right Next Navigation Button */}
            {photos.length > 1 && (
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-slate-900/85 hover:bg-emerald-600 text-white shadow-2xl transition-all cursor-pointer z-20 border border-slate-700/60"
                title="Next Photo (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Thumbnails Bar (If multiple photos) */}
          {photos.length > 1 && (
            <div className="bg-slate-900/95 backdrop-blur-md p-3 sm:p-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
                {photos.map((photo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activePhotoIndex === idx
                        ? 'border-emerald-500 scale-105 shadow-lg ring-2 ring-emerald-500/50'
                        : 'border-slate-700 opacity-60 hover:opacity-100 hover:border-slate-500'
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/75 px-1 rounded text-[9px] font-bold text-white">
                      {idx + 1}
                    </span>
                  </button>
                ))}
              </div>

              <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium shrink-0">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Use keyboard ← / → to flip photos</span>
              </div>
            </div>
          )}
        </div>

        {/* Story Narrative & High-Contrast Context Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Context Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            
            {/* Header with Category Badge and Date */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${badge.color}`}>
                  {badge.icon}
                  <span>{badge.label}</span>
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{moment.date}</span>
                </span>
              </div>

              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                UBUMWE SACCO GAKENKE ARCHIVE
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 leading-snug">
                {currentLang === 'fr' ? moment.titleFr || moment.titleEn : currentLang === 'rw' ? moment.titleRw : moment.titleEn}
              </h1>
              {moment.titleRw && moment.titleRw !== moment.titleEn && currentLang === 'en' && (
                <h2 className="text-sm sm:text-base font-bold text-emerald-800 mt-1">
                  {moment.titleRw}
                </h2>
              )}
            </div>

            {/* Narrative Box with Clear High-Contrast Typography */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-md space-y-3">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-bold border-b border-slate-800 pb-2">
                <span className="uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Official Story Narrative · Inkuru n'Ibisobanuro</span>
                </span>
                <span>{photos.length} {photos.length === 1 ? 'Photo' : 'Photos'} in Record</span>
              </div>

              <p className="text-base sm:text-lg text-slate-100 leading-relaxed font-medium">
                "{currentLang === 'fr' ? moment.captionFr || moment.captionEn : currentLang === 'rw' ? moment.captionRw : moment.captionEn}"
              </p>

              {currentLang === 'en' && moment.captionRw && (
                <p className="text-xs sm:text-sm text-slate-400 italic pt-2 border-t border-slate-800/80">
                  Kinyarwanda: "{moment.captionRw}"
                </p>
              )}
            </div>

            {/* Admin Controls Area */}
            {isAdmin && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Manager Admin Tools
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingPhoto(!isAddingPhoto)}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Another Photo</span>
                    </button>

                    {photos.length > 1 && (
                      <button
                        type="button"
                        onClick={handleDeleteCurrentPhoto}
                        className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-red-200 cursor-pointer"
                        title="Delete current photo from milestone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Photo</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Photo Uploader for Admins */}
                {isAddingPhoto && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-emerald-700" />
                        <span>Add Photo to this Milestone</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddingPhoto(false)}
                        className="text-slate-500 hover:text-slate-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <ImageUploader
                      value={newPhotoUrl}
                      onChange={(url) => setNewPhotoUrl(url)}
                      label="Select or Upload Photo"
                      aspectRatio="video"
                      helpText="Upload a photo from your computer/device to add to this milestone."
                    />

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingPhoto(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!newPhotoUrl.trim()}
                        onClick={handleSaveNewPhoto}
                        className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save to Milestone</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar: Institutional Heritage & Next/Prev Milestone Links */}
          <div className="space-y-6">
            
            {/* Quick Navigation Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>Explore Other Stories</span>
              </h3>

              <div className="space-y-3">
                {prevMoment && (
                  <button
                    type="button"
                    onClick={() => onNavigateMoment(prevMoment.id)}
                    className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all group cursor-pointer flex items-center gap-3"
                  >
                    <img
                      src={prevMoment.imageUrl}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        ← Previous Story
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 truncate">
                        {currentLang === 'fr' ? prevMoment.titleFr || prevMoment.titleEn : currentLang === 'rw' ? prevMoment.titleRw : prevMoment.titleEn}
                      </h4>
                    </div>
                  </button>
                )}

                {nextMoment && (
                  <button
                    type="button"
                    onClick={() => onNavigateMoment(nextMoment.id)}
                    className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all group cursor-pointer flex items-center gap-3"
                  >
                    <img
                      src={nextMoment.imageUrl}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Next Story →
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 truncate">
                        {currentLang === 'fr' ? nextMoment.titleFr || nextMoment.titleEn : currentLang === 'rw' ? nextMoment.titleRw : nextMoment.titleEn}
                      </h4>
                    </div>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={onBack}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Return to Full Photo Gallery</span>
              </button>
            </div>

            {/* Official Heritage Info Card */}
            <div className="bg-emerald-950 text-white rounded-3xl p-6 shadow-md space-y-3 relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                  COOPERATIVE HERITAGE
                </span>
                <h4 className="text-base font-extrabold text-white">
                  Preserving Gakenke's Financial History
                </h4>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Every milestone in this media archive commemorates over a decade of community banking, member dividend payouts, and cooperative economic dignity.
                </p>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
};

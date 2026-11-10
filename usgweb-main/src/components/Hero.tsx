import React from 'react';
import { Language, SaccoContactInfo, HeroContentConfig } from '../types';
import deskImg from '../assets/images/mbitsemunda_phocas_desk.jpeg';
import coopImg from '../assets/images/farmers_cooperative_1791989969904.jpg';
import govImg from '../assets/images/community_governance_1791989970347.jpg';
import bizImg from '../assets/images/entrepreneur_business_1791989970089.jpg';
import wellarsImg from '../assets/images/portrait_director_wellars_1791994899049.jpg';
import { TRANSLATIONS } from '../i18n/translations';
import { SACCO_INFO } from '../data/saccoData';
import {
  Smartphone,
  Camera,
  Edit2,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

/**
 * Hero slide definition – each slide can optionally carry a caption that will be displayed
 * together with the image. This matches the requested "image displays comes with text message
 * related" requirement.
 */
export type HeroSlide = {
  /** Image URL (or imported module) */
  src: string;
  /** Optional caption displayed under the image */
  caption?: string;
};

interface HeroProps {
  currentLang: Language;
  onOpenMembershipModal: () => void;
  onScrollToCalculator: () => void;
  onOpenMomoModal: () => void;
  onScrollToContact: () => void;
  saccoInfo?: SaccoContactInfo;
  /** Legacy prop – single image URL for backward compatibility */
  heroImage?: string;
  /** Array of slide URLs (legacy) – kept for existing data */
  heroSlides?: string[];
  heroContent?: HeroContentConfig;
  isAdmin?: boolean;
  onOpenAdminConsole?: (tab?: string) => void;
  /** New prop – array of slide objects with optional caption */
  heroSlideObjects?: HeroSlide[];
  /** Callback to update slide objects */
  onUpdateSlideObjects?: (slides: HeroSlide[]) => void;
  /** Callback to update legacy slide array */
  onUpdateSlides?: (slides: string[]) => void;
}

export const Hero: React.FC<HeroProps> = ({
  currentLang,
  onOpenMembershipModal,
  onScrollToCalculator,
  onOpenMomoModal,
  saccoInfo = SACCO_INFO,
  heroImage,
  heroSlides = [],
  heroSlideObjects = [],
  heroContent,
  isAdmin = false,
  onOpenAdminConsole,
  onUpdateSlides,
  onUpdateSlideObjects,
}) => {
  const t = TRANSLATIONS[currentLang];

  // ---------------------------------------------------------------------------
  // Resolve slides – we support three ways of providing data for maximum backward
  // compatibility:
  //   1. heroSlideObjects (new) – each entry can have a caption.
  //   2. heroSlides (legacy string array) – no captions.
  //   3. heroImage (single fallback) – no captions.
  // ---------------------------------------------------------------------------
  const legacySlides = (heroSlides && heroSlides.length > 0)
    ? heroSlides.map((url) => ({ src: url }))
    : (heroImage ? [{ src: heroImage }] : []);

  const combinedLegacy = heroSlideObjects.length > 0 ? heroSlideObjects : legacySlides;

  // Default bundled images – always available in production.
  const defaultFlowImages: HeroSlide[] = React.useMemo(() => [
    { src: deskImg },
    { src: govImg },
    { src: coopImg },
    { src: bizImg },
    { src: wellarsImg },
  ], []);

  const allFlowImages: HeroSlide[] = React.useMemo(() => {
    const combined = [...combinedLegacy];
    defaultFlowImages.forEach((img) => {
      if (!combined.find((s) => s.src === img.src)) combined.push(img);
    });
    return combined;
  }, [combinedLegacy, defaultFlowImages]);

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const touchStartX = React.useRef<number | null>(null);

  // ---------------------------------------------------------------------------
  // Image upload utilities (unchanged logic) – uploaded images are stored as plain URLs
  // in the legacy `slides` array because the backend already expects that format.
  // ---------------------------------------------------------------------------
  const compressHeroImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 1280;
          const maxHeight = 800;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
          } else {
            if (height > maxHeight) { width = Math.round((width * maxHeight) / height); height = maxHeight; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) { resolve(e.target?.result as string); return; }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePrev = (e?: React.MouseEvent) => { if (e) e.stopPropagation(); setCurrentIndex((p) => (p - 1 + allFlowImages.length) % allFlowImages.length); };
  const handleNext = (e?: React.MouseEvent) => { if (e) e.stopPropagation(); setCurrentIndex((p) => (p + 1) % allFlowImages.length); };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? handleNext() : handlePrev(); }
    touchStartX.current = null;
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowLeft') setCurrentIndex((p) => (p - 1 + allFlowImages.length) % allFlowImages.length);
      else if (e.key === 'ArrowRight') setCurrentIndex((p) => (p + 1) % allFlowImages.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allFlowImages.length]);

  // Auto‑advance every 5.5 s (paused on hover / when uploading)
  React.useEffect(() => {
    if (allFlowImages.length <= 1 || isPaused || isUploading) return;
    const interval = setInterval(() => setCurrentIndex((p) => (p + 1) % allFlowImages.length), 5500);
    return () => clearInterval(interval);
  }, [allFlowImages.length, isPaused, isUploading]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const compressed = await compressHeroImage(file);
      // Prompt for an optional caption for the new slide
      const caption = window.prompt('Enter caption for the new image (optional)');
      const newSlide: HeroSlide = { src: compressed };
      if (caption) newSlide.caption = caption;
      // Prefer updating slide objects if the callback is provided
      if (onUpdateSlideObjects) {
        const updated = [...heroSlideObjects, newSlide];
        onUpdateSlideObjects(updated);
        setCurrentIndex(updated.length - 1);
      } else if (onUpdateSlides) {
        const updated = [...allFlowImages.map(s => s.src), compressed];
        onUpdateSlides(updated);
        setCurrentIndex(updated.length - 1);
      }
    } catch (err) { console.error('Failed to process image upload', err); }
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleDeleteCurrentSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateSlideObjects && !onUpdateSlides) return;
    if (allFlowImages.length <= 1) return;
    if (window.confirm('Delete this welcome slide image?')) {
      // Remove the current slide
      const updatedImages = allFlowImages.filter((_, i) => i !== currentIndex);
      if (onUpdateSlideObjects) {
        // Preserve caption info
        const updatedSlides: HeroSlide[] = updatedImages.map((s) => ({ src: s.src, caption: s.caption }));
        onUpdateSlideObjects(updatedSlides);
      } else if (onUpdateSlides) {
        const updated: string[] = updatedImages.map((s) => s.src);
        onUpdateSlides(updated);
      }
      // Adjust current index if needed
      setCurrentIndex((p) => (p >= updatedImages.length ? Math.max(0, updatedImages.length - 1) : p));
    }
  };

  // ---------------------------------------------------------------------------
  // Text content (multilingual) – unchanged from previous version.
  // ---------------------------------------------------------------------------
  const districtBadge =
    currentLang === 'fr' ? `Coopérative du District de ${saccoInfo.district}`
    : currentLang === 'rw' ? heroContent?.districtBadgeRw || `Koperative y'Akarere ka ${saccoInfo.district}`
    : heroContent?.districtBadgeEn || `${saccoInfo.district} District Cooperative`;

  const headlinePrefix =
    currentLang === 'fr' ? t.hero.headlinePrefix
    : currentLang === 'rw' ? heroContent?.headlinePrefixRw ?? t.hero.headlinePrefix
    : heroContent?.headlinePrefixEn ?? t.hero.headlinePrefix;

  const headlineFocus =
    currentLang === 'fr' ? t.hero.headlineFocus
    : currentLang === 'rw' ? heroContent?.headlineFocusRw ?? t.hero.headlineFocus
    : heroContent?.headlineFocusEn ?? t.hero.headlineFocus;

  const headlineSuffix =
    currentLang === 'fr' ? t.hero.headlineSuffix
    : currentLang === 'rw' ? heroContent?.headlineSuffixRw ?? t.hero.headlineSuffix
    : heroContent?.headlineSuffixEn ?? t.hero.headlineSuffix;

  const subheading =
    currentLang === 'fr' ? t.hero.subheading
    : currentLang === 'rw' ? heroContent?.subheadingRw ?? t.hero.subheading
    : heroContent?.subheadingEn ?? t.hero.subheading;

  const ctaJoin =
    currentLang === 'fr' ? t.hero.ctaJoin
    : currentLang === 'rw' ? heroContent?.ctaJoinRw ?? t.hero.ctaJoin
    : heroContent?.ctaJoinEn ?? t.hero.ctaJoin;

  const ctaCalculator =
    currentLang === 'fr' ? t.hero.ctaCalculator
    : currentLang === 'rw' ? heroContent?.ctaCalculatorRw ?? t.hero.ctaCalculator
    : heroContent?.ctaCalculatorEn ?? t.hero.ctaCalculator;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <section id="hero" className="relative bg-slate-950 text-white overflow-hidden w-full">
      {/* Admin fast‑bar */}
      {isAdmin && onOpenAdminConsole && (
        <div className="bg-emerald-950/90 border-b border-emerald-800/80 px-4 py-2 text-xs flex items-center justify-between text-emerald-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">Home Hero (Admin · {allFlowImages.length} slides)</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => onOpenAdminConsole('pictures')}
              className="px-3 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
              <Camera className="w-3 h-3" /><span>Manage Pictures</span>
            </button>
            <button type="button" onClick={() => onOpenAdminConsole('home-hero')}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
              <Edit2 className="w-3 h-3" /><span>Edit Headlines</span>
            </button>
          </div>
        </div>
      )}

      {/* Full‑width cinematic slideshow */}
      <div
        className="relative w-full h-[450px] sm:h-[520px] md:h-[600px] lg:h-[680px] overflow-hidden select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Sliding track */}
        <div
          className="flex h-full w-full transition-transform duration-700 ease-out will-change-transform"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {allFlowImages.map((slide, idx) => (
            <div
              key={`hero-slide-${idx}`}
              className="relative w-full h-full min-w-full shrink-0 overflow-hidden bg-slate-950"
            >
              <img
                src={slide.src}
                alt={`UBUMWE SACCO GAKENKE ${idx + 1}`}
                className="w-full h-full object-cover object-[center_20%]"
                loading={idx === 0 ? 'eager' : 'lazy'}
                draggable={false}
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 pointer-events-none"></div>
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent pointer-events-none" />

        {/* Text overlay – bottom‑left */}
        <div className="absolute inset-0 flex flex-col justify-end pb-14 sm:pb-16 px-5 sm:px-10 lg:px-16 z-10 max-w-2xl">
          {/* District badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-400 text-[11px] sm:text-xs font-extrabold uppercase tracking-widest">
              {districtBadge}
            </span>
            {isAdmin && onOpenAdminConsole && (
              <button type="button" onClick={() => onOpenAdminConsole('home-hero')}
                className="text-[10px] underline text-emerald-300 hover:text-white cursor-pointer">
                (Edit)
              </button>
            )}
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight mb-3 drop-shadow-lg">
            <span>{headlinePrefix} </span>
            <span className="text-emerald-400">{headlineFocus}</span>
            <span> {headlineSuffix}</span>
          </h1>

          {/* Sub‑heading */}
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed line-clamp-2 mb-3 max-w-xl drop-shadow">
            {subheading}
          </p>

          {/* Caption associated with the current image (if any) */}
          <p className="text-xs sm:text-sm text-amber-200 italic mb-4 max-w-xl drop-shadow">
            {allFlowImages[currentIndex].caption ? (
              <span>{allFlowImages[currentIndex].caption}</span>
            ) : (
              <span className="text-gray-500">Enter caption for this image...</span>
            )}
            {isAdmin && onUpdateSlideObjects && (
              <button
                type="button"
                onClick={() => {
                  const newCap = window.prompt(
                    'Edit caption',
                    allFlowImages[currentIndex].caption || ''
                  );
                  if (newCap !== null) {
                    const updated = [...allFlowImages];
                    updated[currentIndex] = { ...updated[currentIndex], caption: newCap };
                    onUpdateSlideObjects(updated);
                  }
                }}
                className="ml-2 text-emerald-300 hover:text-emerald-100"
              >
                <Edit2 className="inline w-4 h-4" />
              </button>
            )}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center gap-2.5">




            <button type="button" onClick={onOpenMomoModal}
              className="px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-amber-300 bg-white/10 hover:bg-white/20 hover:text-amber-200 rounded-xl border border-amber-400/30 flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-sm font-mono-numbers">
              <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
              <span>USSD: <strong>{saccoInfo.ussdCode}</strong></span>
            </button>
          </div>
        </div>

        {/* Navigation arrows */}
        <button type="button" onClick={handlePrev} aria-label="Previous image"
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-950/60 hover:bg-emerald-700 text-white backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer shadow-xl z-20">
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button type="button" onClick={handleNext} aria-label="Next image"
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-950/60 hover:bg-emerald-700 text-white backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer shadow-xl z-20">
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dot navigation – centered bottom */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {allFlowImages.map((_, i) => (
            <button
              key={`dot-${i}`}
              type="button"
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to image ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === currentIndex ? 'w-7 bg-amber-400' : 'w-2 bg-white/45 hover:bg-white/75'
              }`}
            />
          ))}
        </div>

        {/* Persistent UBUMWE SACCO badge – bottom left */}
        <div className="absolute bottom-4 left-5 sm:left-10 lg:left-16 flex items-center gap-2 z-20 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-slate-300 font-semibold tracking-wide">
            {currentLang === 'fr'
              ? 'UBUMWE SACCO · District de Gakenke'
              : currentLang === 'rw'
              ? 'UBUMWE SACCO · Akarere ka Gakenke'
              : 'UBUMWE SACCO · Gakenke District'}
          </span>
        </div>

        {/* Hidden file input for admin uploads */}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

        {/* Admin floating controls – top right */}
        {isAdmin && (
          <div className="absolute top-4 right-4 flex flex-wrap items-center justify-end gap-2 z-30">
            {onUpdateSlides && allFlowImages.length > 1 && (
              <button type="button" onClick={handleDeleteCurrentSlide}
                className="px-2.5 py-1.5 bg-rose-950/85 hover:bg-rose-600 text-rose-200 hover:text-white rounded-xl text-xs font-semibold backdrop-blur-md border border-rose-500/30 flex items-center gap-1 shadow-xl transition-all cursor-pointer"
                title="Delete this image">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onUpdateSlides && (
              <button type="button" disabled={isUploading}
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold backdrop-blur-md border border-emerald-400/40 flex items-center gap-1.5 shadow-xl transition-all cursor-pointer"
                title="Upload a new slide image">
                {isUploading ? <span>Uploading…</span> : <><Upload className="w-3.5 h-3.5" /><span>+ Add Photo</span></>}
              </button>
            )}
            {onOpenAdminConsole && (
              <button type="button" onClick={() => onOpenAdminConsole('pictures')}
                className="px-3.5 py-1.5 bg-slate-950/90 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-xl transition-all cursor-pointer"
                title="Open full admin pictures manager">
                <Camera className="w-3.5 h-3.5 text-emerald-300" /><span>Manage Flow</span>
              </button>
            )}
          </div>
        )}

        {/* Inline admin edit button for text */}
        {isAdmin && (
          <button type="button" onClick={() => onOpenAdminConsole?.('home-hero')}
            className="absolute top-4 left-4 px-2.5 py-1.5 bg-slate-950/80 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-xl transition-all cursor-pointer z-30"
            title="Edit hero content">
            <Edit2 className="w-3 h-3 text-emerald-300" /><span>Edit Text</span>
          </button>
        )}
      </div>
    </section>
  );
};

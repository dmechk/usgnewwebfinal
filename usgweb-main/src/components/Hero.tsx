import React from 'react';
import { Language, SaccoContactInfo, HeroContentConfig } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { SACCO_INFO, SACCO_IMAGES } from '../data/saccoData';
import {
  ArrowRight,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Phone,
  MessageSquare,
  Mail,
  Camera,
  Edit2,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';


interface HeroProps {
  currentLang: Language;
  onOpenMembershipModal: () => void;
  onScrollToCalculator: () => void;
  onOpenMomoModal: () => void;
  onScrollToContact: () => void;
  saccoInfo?: SaccoContactInfo;
  heroImage?: string;
  heroSlides?: string[];
  heroContent?: HeroContentConfig;
  isAdmin?: boolean;
  onOpenAdminConsole?: (tab?: string) => void;
  onUpdateSlides?: (slides: string[]) => void;
}

export const Hero: React.FC<HeroProps> = ({
  currentLang,
  onOpenMembershipModal,
  onScrollToCalculator,
  onOpenMomoModal,
  onScrollToContact,
  saccoInfo = SACCO_INFO,
  heroImage,
  heroSlides = [],
  heroContent,
  isAdmin = false,
  onOpenAdminConsole,
  onUpdateSlides,
}) => {
  const t = TRANSLATIONS[currentLang];

  // Resolve slides list: use heroSlides if non-empty, otherwise fallback to heroImage or default banking photo
  const rawSlides = (heroSlides && heroSlides.length > 0)
    ? heroSlides
    : (heroImage ? [heroImage] : ['/src/assets/images/mbitsemunda_phocas_desk.jpg']);

  // Ensure heroImage is included if provided and not in the list
  const slides = (heroImage && !rawSlides.includes(heroImage))
    ? [heroImage, ...rawSlides]
    : rawSlides;

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const touchStartX = React.useRef<number | null>(null);

  // Compress image on the fly to avoid exceeding browser localStorage quota
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
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Curate rich cooperative moment images for continuous full-frame flow
  const defaultFlowImages = React.useMemo(() => [
    '/src/assets/images/mbitsemunda_phocas_desk.jpg',
    '/src/assets/images/community_governance_1791989970347.jpg',
    '/src/assets/images/farmers_cooperative_1791989969904.jpg',
    '/src/assets/images/portrait_director_wellars_1791994899049.jpg',
    '/src/assets/images/bartazal_speaking.jpg',
    '/src/assets/images/hero_sacco_banking_1791989969362.jpg',
    '/src/assets/images/entrepreneur_business_1791989970089.jpg',
  ], []);

  const allFlowImages = React.useMemo(() => {
    const combined = [...slides];
    defaultFlowImages.forEach((img) => {
      if (!combined.includes(img)) combined.push(img);
    });
    return combined;
  }, [slides, defaultFlowImages]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + allFlowImages.length) % allFlowImages.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % allFlowImages.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  // Keyboard Left / Right arrow navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + allFlowImages.length) % allFlowImages.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % allFlowImages.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allFlowImages.length]);

  // Ambient auto-flow when idle; smoothly transitions to next image every 5.5s, pauses on hover/upload
  React.useEffect(() => {
    if (allFlowImages.length <= 1 || isPaused || isUploading) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allFlowImages.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [allFlowImages.length, isPaused, isUploading]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateSlides) return;
    try {
      setIsUploading(true);
      const compressed = await compressHeroImage(file);
      const updated = [...slides, compressed];
      onUpdateSlides(updated);
      setCurrentIndex(updated.length - 1);
    } catch (err) {
      console.error('Failed to process image upload', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteCurrentSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateSlides || slides.length <= 1) return;
    if (window.confirm('Delete this welcome slide image?')) {
      const updated = slides.filter((_, i) => i !== currentIndex);
      onUpdateSlides(updated);
      setCurrentIndex((prev) => (prev >= updated.length ? Math.max(0, updated.length - 1) : prev));
    }
  };

  const districtBadge =
    currentLang === 'fr'
      ? `Coopérative du District de ${saccoInfo.district}`
      : currentLang === 'rw'
      ? heroContent?.districtBadgeRw || `Koperative y'Akarere ka ${saccoInfo.district}`
      : heroContent?.districtBadgeEn || `${saccoInfo.district} Cooperative`;

  const headlinePrefix =
    currentLang === 'fr'
      ? t.hero.headlinePrefix
      : currentLang === 'rw'
      ? heroContent?.headlinePrefixRw ?? t.hero.headlinePrefix
      : heroContent?.headlinePrefixEn ?? t.hero.headlinePrefix;

  const headlineFocus =
    currentLang === 'fr'
      ? t.hero.headlineFocus
      : currentLang === 'rw'
      ? heroContent?.headlineFocusRw ?? t.hero.headlineFocus
      : heroContent?.headlineFocusEn ?? t.hero.headlineFocus;

  const headlineSuffix =
    currentLang === 'fr'
      ? t.hero.headlineSuffix
      : currentLang === 'rw'
      ? heroContent?.headlineSuffixRw ?? t.hero.headlineSuffix
      : heroContent?.headlineSuffixEn ?? t.hero.headlineSuffix;

  const subheading =
    currentLang === 'fr'
      ? t.hero.subheading
      : currentLang === 'rw'
      ? heroContent?.subheadingRw ?? t.hero.subheading
      : heroContent?.subheadingEn ?? t.hero.subheading;

  const ctaJoin =
    currentLang === 'fr'
      ? t.hero.ctaJoin
      : currentLang === 'rw'
      ? heroContent?.ctaJoinRw ?? t.hero.ctaJoin
      : heroContent?.ctaJoinEn ?? t.hero.ctaJoin;

  const ctaCalculator =
    currentLang === 'fr'
      ? t.hero.ctaCalculator
      : currentLang === 'rw'
      ? heroContent?.ctaCalculatorRw ?? t.hero.ctaCalculator
      : heroContent?.ctaCalculatorEn ?? t.hero.ctaCalculator;

  return (
    <section id="hero" className="relative bg-slate-900 text-white overflow-hidden">
      {/* Decorative ambient backdrop */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Admin Fast Bar */}
      {isAdmin && onOpenAdminConsole && (
        <div className="bg-emerald-950/90 border-b border-emerald-800/80 px-4 py-2 text-xs flex items-center justify-between text-emerald-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">Home Hero Section (Admin Control Active · {slides.length} Welcome Backgrounds)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenAdminConsole('pictures')}
              className="px-3 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Camera className="w-3 h-3" />
              <span>Manage Pictures</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenAdminConsole('home-hero')}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit Headlines</span>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Proposition and Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Regulatory trust indicator */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-emerald-400">
              <span className="text-amber-300 font-semibold">{districtBadge}</span>
              {isAdmin && onOpenAdminConsole && (
                <button
                  type="button"
                  onClick={() => onOpenAdminConsole('home-hero')}
                  className="text-[11px] underline text-emerald-300 hover:text-white cursor-pointer ml-2"
                >
                  (Edit)
                </button>
              )}
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight" style={{ textWrap: 'balance' }}>
              <span>{headlinePrefix} </span>
              <span className="text-emerald-400">
                {headlineFocus}
              </span>
              <span> {headlineSuffix}</span>
            </h1>

            {/* Narrative Paragraph */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              {subheading}
            </p>

            {/* Left Column Actions */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={onOpenMomoModal}
                className="px-5 py-3.5 text-xs sm:text-sm font-semibold text-amber-300 bg-slate-800/90 hover:bg-slate-700 hover:text-amber-200 rounded-xl border border-slate-700/80 flex items-center gap-2 transition-all font-mono-numbers cursor-pointer shadow-sm"
              >
                <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>USSD Digital Banking: <strong>{saccoInfo.ussdCode}</strong></span>
              </button>
            </div>
          </div>

          {/* Right Column: Full-Frame Hero Image Flow with Left/Right Controls (7 cols) */}
          <div className="lg:col-span-7">
            <div
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative rounded-3xl overflow-hidden border border-emerald-500/25 shadow-2xl shadow-emerald-950/50 bg-slate-950 group ring-1 ring-white/10 select-none h-[460px] sm:h-[520px] lg:h-[580px]"
            >
              {/* Full-Frame Horizontal Sliding Track */}
              <div
                className="flex h-full w-full transition-transform duration-700 ease-out will-change-transform"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {allFlowImages.map((imgUrl, idx) => (
                  <div
                    key={`hero-flow-img-${idx}-${imgUrl}`}
                    className="relative w-full h-full min-w-full shrink-0 overflow-hidden bg-slate-900"
                  >
                    <img
                      src={imgUrl}
                      alt={`UBUMWE SACCO GAKENKE ${idx + 1}`}
                      className="w-full h-full object-cover select-none"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                    {/* Subtle cinematic gradient overlay for high contrast and readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-slate-950/25 pointer-events-none" />
                  </div>
                ))}
              </div>

              {/* Left Navigation Arrow Button */}
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous image"
                className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-950/75 hover:bg-emerald-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer shadow-2xl z-25 group/btn"
                title="Previous image (Left arrow)"
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover/btn:-translate-x-0.5" />
              </button>

              {/* Right Navigation Arrow Button */}
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next image"
                className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-950/75 hover:bg-emerald-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer shadow-2xl z-25 group/btn"
                title="Next image (Right arrow)"
              >
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover/btn:translate-x-0.5" />
              </button>

              {/* Bottom Overlay Bar with District Badge & Counter/Dots */}
              <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between gap-2 pointer-events-none">
                {/* Flow Identity Badge */}
                <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/15 text-[11px] text-slate-200 shadow-xl pointer-events-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold tracking-wide">
                    {currentLang === 'fr'
                      ? 'UBUMWE SACCO · District de Gakenke'
                      : currentLang === 'rw'
                      ? 'UBUMWE SACCO · Akarere ka Gakenke'
                      : 'UBUMWE SACCO · Gakenke District'}
                  </span>
                </div>

                {/* Slide counter & interactive mini dots */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/15 text-xs text-slate-200 shadow-xl pointer-events-auto">
                  <div className="flex items-center gap-1.5 hidden sm:flex">
                    {allFlowImages.map((_, i) => (
                      <button
                        key={`dot-${i}`}
                        type="button"
                        onClick={() => setCurrentIndex(i)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          i === currentIndex ? 'w-5 bg-emerald-400' : 'w-1.5 bg-white/40 hover:bg-white/75'
                        }`}
                        aria-label={`Go to image ${i + 1}`}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-emerald-400 font-bold ml-1">{currentIndex + 1}</span>
                  <span className="text-slate-500 font-mono">/</span>
                  <span className="text-slate-300 font-mono">{allFlowImages.length}</span>
                </div>
              </div>

              {/* Hidden File Input for Direct Local Image Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Admin Floating Controls */}
              {isAdmin && (
                <div className="absolute top-4 right-4 flex flex-wrap items-center justify-end gap-2 z-30">
                  {/* Delete current slide if custom slides present */}
                  {onUpdateSlides && slides.length > 1 && (
                    <button
                      type="button"
                      onClick={handleDeleteCurrentSlide}
                      className="px-2.5 py-1.5 bg-rose-950/85 hover:bg-rose-600 text-rose-200 hover:text-white rounded-xl text-xs font-semibold backdrop-blur-md border border-rose-500/30 flex items-center gap-1 shadow-xl transition-all cursor-pointer"
                      title="Delete this image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Direct Add Image button */}
                  {onUpdateSlides && (
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold backdrop-blur-md border border-emerald-400/40 flex items-center gap-1.5 shadow-xl transition-all cursor-pointer"
                      title="Upload and add another image to the visual flow"
                    >
                      {isUploading ? (
                        <span>Uploading...</span>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Photo</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Open Full Admin Console */}
                  {onOpenAdminConsole && (
                    <button
                      type="button"
                      onClick={() => onOpenAdminConsole('pictures')}
                      className="px-3.5 py-1.5 bg-slate-950/90 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-xl transition-all cursor-pointer"
                      title="Open full admin pictures manager"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Manage Flow</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};


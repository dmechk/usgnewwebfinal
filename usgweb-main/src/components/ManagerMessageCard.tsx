import React, { useRef, useState, useMemo, useEffect } from 'react';
import { ManagerMessage, Language } from '../types';
import { Quote, ShieldCheck, Edit2, User, Calendar, Camera, ChevronLeft, ChevronRight } from 'lucide-react';

interface ManagerMessageCardProps {
  message?: ManagerMessage;
  messages?: ManagerMessage[];
  currentLang: Language;
  isAdmin?: boolean;
  onEdit?: (messageId?: string) => void;
  onUpdateImage?: ((newUrl: string) => void) | ((messageId: string, newUrl: string) => void);
  variant?: 'home' | 'about';
}

export const ManagerMessageCard: React.FC<ManagerMessageCardProps> = ({
  message,
  messages,
  currentLang,
  isAdmin = false,
  onEdit,
  onUpdateImage,
  variant = 'home',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);

  // Normalize list of messages and prioritize Board Chair first, General Manager second
  const allMessages = useMemo(() => {
    const list = messages && messages.length > 0 ? [...messages] : message ? [message] : [];
    return list.sort((a, b) => {
      const aIsChair = a.authorRole.toLowerCase().includes('chair') || a.titleEn.toLowerCase().includes('chair');
      const bIsChair = b.authorRole.toLowerCase().includes('chair') || b.titleEn.toLowerCase().includes('chair');
      if (aIsChair && !bIsChair) return -1;
      if (!aIsChair && bIsChair) return 1;
      return 0;
    });
  }, [messages, message]);

  const [activeTab, setActiveTab] = useState<string>(() => allMessages[0]?.id || 'both');
  const [isPaused, setIsPaused] = useState(false);

  // Auto‑advance leadership messages every 60 seconds
  const AUTO_ADVANCE_DELAY = 60000;
  useEffect(() => {
    if (allMessages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveTab(prev => {
        const idx = allMessages.findIndex(m => m.id === prev);
        const nextIdx = (idx + 1) % allMessages.length;
        return allMessages[nextIdx].id;
      });
    }, AUTO_ADVANCE_DELAY);
    return () => clearInterval(interval);
  }, [allMessages]);

  const handleFileSelect = (msgId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string' && onUpdateImage) {
        try {
          (onUpdateImage as any)(msgId, reader.result);
        } catch {
          (onUpdateImage as any)(reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const getLocalizedTitle = (msg: ManagerMessage) =>
    currentLang === 'fr'
      ? msg.titleFr || msg.titleEn
      : currentLang === 'rw'
        ? msg.titleRw || msg.titleEn
        : msg.titleEn;

  const getLocalizedBody = (msg: ManagerMessage) =>
    currentLang === 'fr'
      ? msg.bodyFr || msg.bodyEn
      : currentLang === 'rw'
        ? msg.bodyRw || msg.bodyEn
        : msg.bodyEn;

  // Render a single prominent card (full width inside section)
  const renderProminentCard = (msg: ManagerMessage) => {
    const title = getLocalizedTitle(msg);
    const body = getLocalizedBody(msg);
    return (
      <div
        key={msg.id}
        className="bg-slate-800/95 rounded-3xl border border-slate-700/80 shadow-2xl p-6 sm:p-10 backdrop-blur-md relative overflow-hidden transition-all duration-300"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-2">
          {/* Left Column: Portrait & Author Bio */}
          <div className="lg:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="relative group">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-emerald-500/80 shadow-xl bg-slate-900 relative">
                {msg.imageUrl ? (
                  <img
                    src={msg.imageUrl}
                    alt={msg.authorName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <User className="w-16 h-16" />
                  </div>
                )}
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveUploadId(msg.id);
                    fileInputRef.current?.click();
                  }}
                  className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-xs font-bold cursor-pointer"
                  title="Upload / Change Portrait Picture"
                >
                  <Camera className="w-6 h-6 text-emerald-400" />
                  <span className="text-[11px]">Upload Photo</span>
                </button>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-600 rounded-lg text-white shadow-md">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="mt-4 space-y-1">
              <h4 className="text-lg font-bold text-white">{msg.authorName}</h4>
              <p className="text-xs font-semibold text-emerald-400">{msg.authorRole}</p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 justify-center sm:justify-start">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{msg.date}</span>
              </p>
            </div>
            {isAdmin && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(msg.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Message</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setActiveUploadId(msg.id);
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  title="Upload or change portrait photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Change Picture</span>
                </button>
              </div>
            )}
          </div>
          {/* Right Column: Message Content */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Quote className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{currentLang === 'en' ? 'UBUMWE SACCO GAKENKE · Leadership Word' : "UBUMWE SACCO GAKENKE · Ijambo ry'Ubuyobozi"}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{title}</h3>
            <blockquote className="text-sm sm:text-base text-slate-200 leading-relaxed italic border-l-2 border-emerald-500/60 pl-4 py-1">"{body}"</blockquote>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 bg-slate-900/60 px-3 py-1 rounded-full border border-slate-700 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Official Institutional Statement</span>
              </span>
              <span className="text-emerald-400 font-medium">
                {currentLang === 'fr'
                  ? 'Servant 19 Secteurs de Gakenke'
                  : currentLang === 'rw'
                    ? "Dukorera mu Mirenge 19 ya Gakenke"
                    : 'Serving 19 Sectors of Gakenke'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Navigation arrows (previous / next)
  const goPrev = () => {
    const idx = allMessages.findIndex(m => m.id === activeTab);
    const prevIdx = (idx - 1 + allMessages.length) % allMessages.length;
    setActiveTab(allMessages[prevIdx].id);
  };
  const goNext = () => {
    const idx = allMessages.findIndex(m => m.id === activeTab);
    const nextIdx = (idx + 1) % allMessages.length;
    setActiveTab(allMessages[nextIdx].id);
  };

  if (variant === 'home') {
    if (allMessages.length === 0) return null;
    const currentMsg = allMessages.find(m => m.id === activeTab) || allMessages[0];
    return (
      <section className="relative py-12 lg:py-16 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden border-y border-slate-700/60">
        {/* Hidden file input for uploads */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={e => {
            if (activeUploadId) {
              handleFileSelect(activeUploadId, e);
            }
          }}
          className="hidden"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {currentLang === 'fr'
                ? 'Paroles de Notre Direction'
                : currentLang === 'rw'
                  ? "Ijambo ry'Ubuyobozi Bukuru"
                  : 'Words from Our Leadership'}
            </h3>
            <div className="flex gap-2">
              <button onClick={goPrev} className="p-2 bg-slate-700 hover:bg-emerald-700 rounded-md">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button onClick={goNext} className="p-2 bg-slate-700 hover:bg-emerald-700 rounded-md">
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          {renderProminentCard(currentMsg)}
        </div>
      </section>
    );
  }

  // ABOUT variant – render side‑by‑side grid (kept unchanged for now)
  const renderSideBySideGrid = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
      {allMessages.map(msg => {
        const title = getLocalizedTitle(msg);
        const body = getLocalizedBody(msg);
        return (
          <div key={msg.id} className="bg-slate-800/95 rounded-3xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-2">
              <div className="lg:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="relative group">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-emerald-500/80 shadow-lg bg-slate-900 relative">
                    {msg.imageUrl ? (
                      <img src={msg.imageUrl} alt={msg.authorName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <User className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveUploadId(msg.id);
                        fileInputRef.current?.click();
                      }}
                      className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer"
                      title="Upload / Change Picture"
                    >
                      <Camera className="w-4 h-4 text-emerald-400 mb-0.5" />
                      <span>Change</span>
                    </button>
                  )}
                </div>
                <div className="mt-2 text-sm font-bold text-emerald-400">{msg.authorRole}</div>
                <h4 className="text-base font-bold text-white truncate">{msg.authorName}</h4>
                <p className="text-xs text-slate-300 font-medium line-clamp-1">{msg.authorRole}</p>
                <p className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  <span>{msg.date}</span>
                </p>
                {isAdmin && onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(msg.id)}
                    className="mt-2 px-2.5 py-1 bg-slate-700 hover:bg-emerald-700 text-white rounded-md text-xs font-bold"
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="lg:col-span-8 space-y-4">
                <h5 className="text-base sm:text-lg font-bold text-emerald-300">{title}</h5>
                <blockquote className="text-xs sm:text-sm text-slate-200 leading-relaxed italic border-l-2 border-emerald-500/60 pl-3.5 py-0.5">"{body}"</blockquote>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return renderSideBySideGrid();
};

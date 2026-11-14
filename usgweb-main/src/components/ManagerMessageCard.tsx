import React, { useRef, useState, useMemo } from 'react';
import { ManagerMessage, Language } from '../types';
import { Quote, ShieldCheck, Edit2, User, Calendar, Camera } from 'lucide-react';
import { ImigongoRibbon } from './ImigongoPattern';

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
        const aIsChair =
          a.authorRole.toLowerCase().includes('chair') || a.titleEn.toLowerCase().includes('chair');
        const bIsChair =
          b.authorRole.toLowerCase().includes('chair') || b.titleEn.toLowerCase().includes('chair');
        if (aIsChair && !bIsChair) return -1;
        if (!aIsChair && bIsChair) return 1;
        return 0;
      });
    }, [messages, message]);

    // Active tab state: default to first message or 'both'
    const [activeTab, setActiveTab] = useState<string>(() => {
      return allMessages[0]?.id || 'both';
    });

    const handleFileSelect = (msgId: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string' && onUpdateImage) {
          // Support both callback signatures
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
              {/* Top decorative ribbon */}
              <div className="absolute top-0 left-0 right-0">
                <ImigongoRibbon height={6} variant="light" bordered={false} />
              </div>

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

                            {/* Admin Image Upload Hover Overlay */}
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
                                  <span>
                                    {currentLang === 'en'
                                      ? 'UBUMWE SACCO GAKENKE · Leadership Word'
                                      : "UBUMWE SACCO GAKENKE · Ijambo ry'Ubuyobozi"}
                                  </span>
                                </div>

                                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                                  {title}
                                </h3>

                                <blockquote className="text-sm sm:text-base text-slate-200 leading-relaxed italic border-l-2 border-emerald-500/60 pl-4 py-1">
                                  "{body}"
                                </blockquote>

                                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                                  <span className="inline-flex items-center gap-1.5 bg-slate-900/60 px-3 py-1 rounded-full border border-slate-700 text-slate-300">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Official Institutional Statement</span>
                                  </span>
                                  <span className="text-emerald-400 font-medium">
                                    {currentLang === 'fr'
                                      ? 'Servant 19 Secteurs de Gakenke'
                                      : currentLang === 'rw'
                                        ? 'Dukorera mu Mirenge 19 ya Gakenke'
                                        : 'Serving 19 Sectors of Gakenke'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          );
  };

  // Render side-by-side cards when "View Both" is selected
  const renderSideBySideGrid = () => {
    return (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
                            {allMessages.map((msg) => {
                              const title = getLocalizedTitle(msg);
                              const body = getLocalizedBody(msg);

                              return (
                                <div
                                  key={msg.id}
                                  className="bg-slate-800/95 rounded-3xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden flex flex-col justify-between"
                                >
                                  <div className="absolute top-0 left-0 right-0">
                                    <ImigongoRibbon height={5} variant="light" bordered={false} />
                                  </div>

                                  <div className="space-y-5 mt-2">
                                    {/* Header with portrait and metadata */}
                                    <div className="flex items-center gap-4">
                                      <div className="relative group shrink-0">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-emerald-500/80 shadow-lg bg-slate-900 relative">
                                          {msg.imageUrl ? (
                                            <img
                                              src={msg.imageUrl}
                                              alt={msg.authorName}
                                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                              <User className="w-10 h-10" />
                                            </div>
                                          )}

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
                                        <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-600 rounded-md text-white shadow-xs">
                                          <ShieldCheck className="w-3.5 h-3.5" />
                                        </div>
                                      </div>

                                        <div className="min-w-0">
                                          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                                            {msg.authorRole.toLowerCase().includes('chair') || msg.titleEn.toLowerCase().includes('chair')
                                              ? 'Institutional Message'
                                              : 'Executive Word'}
                                          </div>
                                          <h4 className="text-base sm:text-lg font-bold text-white truncate">{msg.authorName}</h4>
                                          <p className="text-xs text-slate-300 font-medium line-clamp-1">{msg.authorRole}</p>
                                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                            <Calendar className="w-3 h-3 text-slate-400" />
                                            <span>{msg.date}</span>
                                          </p>
                                        </div>
                                      </div>

                                        {/* Message Body */}
                                        <div className="space-y-2">
                                          <h5 className="text-base sm:text-lg font-bold text-emerald-300 leading-snug">
                                            {title}
                                          </h5>
                                          <blockquote className="text-xs sm:text-sm text-slate-200 leading-relaxed italic border-l-2 border-emerald-500/60 pl-3.5 py-0.5">
                                            "{body}"
                                          </blockquote>
                                        </div>
                                      </div>

                                      {/* Bottom footer */}
                                      <div className="pt-4 mt-6 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                          <span>Official Statement</span>
                                        </span>

                                        {isAdmin && (
                                            <div className="flex items-center gap-2">
                                              {onEdit && (
                                                <button
                                                  type="button"
                                                  onClick={() => onEdit(msg.id)}
                                                  className="px-2.5 py-1 bg-slate-700 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold cursor-pointer"
                                                >
                                                  Edit
                                                </button>
                                              )}
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setActiveUploadId(msg.id);
                                                  fileInputRef.current?.click();
                                                }}
                                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-[11px] font-bold cursor-pointer"
                                              >
                                                Photo
                                              </button>
                                            </div>
                )}
                                          </div>
            </div>
                                      );
        })}
                                    </div>
                                    );
  };

  // HOME VARIANT: Renders in a unified, organized section
                                        if (variant === 'home') {
    if (allMessages.length === 0) return null;

    const currentMsg = allMessages.find((m) => m.id === activeTab) || allMessages[0];

                                        return (
                                        <section className="relative py-12 lg:py-16 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden border-y border-slate-700/60">
                                          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

                                          {/* Hidden file input for uploads */}
                                          <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={(e) => {
                                              if (activeUploadId) {
                                                handleFileSelect(activeUploadId, e);
                                              }
                                            }}
                                            className="hidden"
                                          />

                                          <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 space-y-8">
                                            {/* Section Header & Interactive Tabs if multiple messages */}
                                            {allMessages.length > 1 && (
                                              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-700/60">
                                                <div>
                                                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5">
                                                    <Quote className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span>UBUMWE SACCO GAKENKE · Leadership</span>
                                                  </div>
                                                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                                      {currentLang === 'fr'
                                                        ? 'Paroles de Notre Direction'
                                                        : currentLang === 'rw'
                                                          ? "Ijambo ry'Ubuyobozi Bukuru"
                                                          : 'Words from Our Leadership'}
                                                    </h3>
                                                </div>

                                                {/* Tabs Switcher */}
                                                <div className="flex items-center gap-2 p-1 bg-slate-950/70 border border-slate-700/70 rounded-2xl backdrop-blur-md self-start md:self-auto overflow-x-auto max-w-full">
                                                  {allMessages.map((m) => {
                                                    const isChair =
                                                      m.authorRole.toLowerCase().includes('chair') ||
                                                      m.titleEn.toLowerCase().includes('chair');
                                                    const label = isChair ? 'Board Chair' : 'Manager';
                                                    return (
                                                      <button
                                                        key={m.id}
                                                        type="button"
                                                        onClick={() => setActiveTab(m.id)}
                                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${activeTab === m.id
                                                            ? 'bg-emerald-600 text-white shadow-md'
                                                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                                          }`}
                                                      >
                                                        <span>{isChair ? '🏛️' : '💼'}</span>
                                                        <span>{m.authorName}</span>
                                                        <span className="text-[10px] opacity-75">({label})</span>
                                                      </button>
                                                    );
                                                  })}

                                                      <button
                                                        type="button"
                                                        onClick={() => setActiveTab('both')}
                                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${activeTab === 'both'
                                                            ? 'bg-emerald-600 text-white shadow-md'
                                                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                                          }`}
                                                      >
                                                        <span>📑</span>
                                                        <span>
                                                          {currentLang === 'fr' ? 'Les Deux' : currentLang === 'rw' ? 'Byose' : 'View Both'}
                                                        </span>
                                                    </button>
                                                  </div>
                                                </div>
                                            )}

                                            {/* Active View: Side-by-Side OR Single Prominent Card */}
                                            {activeTab === 'both' ? renderSideBySideGrid() : renderProminentCard(currentMsg)}
                                          </div>
                                        </section>
                                        );
  }

                                        // ABOUT VARIANT (Original About Us Card styling)
                                        const singleMsg = message || allMessages[0];
                                        if (!singleMsg) return null;

                                        const aboutTitle = getLocalizedTitle(singleMsg);
                                        const aboutBody = getLocalizedBody(singleMsg);

                                        return (
                                        <div className="p-6 sm:p-8 bg-emerald-50/70 border border-emerald-200 rounded-3xl relative overflow-hidden space-y-6">
                                          <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={(e) => handleFileSelect(singleMsg.id, e)}
                                            className="hidden"
                                          />

                                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                              <div className="relative group">
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-emerald-600 shadow-md bg-slate-100 shrink-0 relative">
                                                    {
                                                      singleMsg.imageUrl ? (
                                                        <img
                                                          src={singleMsg.imageUrl}
                                                          alt={singleMsg.authorName}
                                                          className="w-full h-full object-cover"
                                                        />
                                                      ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                          <User className="w-8 h-8" />
                                                        </div>
                                                      )
                                                    }

                                                  {isAdmin && (
                                                    <button
                                                      type="button"
                                                      onClick={() => fileInputRef.current?.click()}
                                                      className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer"
                                                      title="Upload / Change Picture"
                                                    >
                                                      <Camera className="w-4 h-4 text-emerald-400 mb-0.5" />
                                                      <span>Change</span>
                                                    </button>
                                                  )}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-700 text-white rounded-md shadow-xs">
                                                  <ShieldCheck className="w-3.5 h-3.5" />
                                                </div>
                                              </div>

                                              <div>
                                                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                                                  {currentLang === 'fr'
                                                    ? 'Message Institutionnel'
                                                    : currentLang === 'rw'
                                                      ? "Ubutumwa bw'Ubuyobozi"
                                                      : 'Institutional Message'}
                                                </span>
                                                <h4 className="text-base sm:text-lg font-bold text-slate-900">{singleMsg.authorName}</h4>
                                                <p className="text-xs text-slate-600">{singleMsg.authorRole}</p>
                                              </div>
                                            </div>

                                            {isAdmin && (
                                              <div className="flex items-center gap-2">
                                                <button
                                                  type="button"
                                                  onClick={() => fileInputRef.current?.click()}
                                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                                                  title="Upload new image from your device"
                                                >
                                                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                                                  <span>Change Photo</span>
                                                </button>

                                                {onEdit && (
                                                  <button
                                                    type="button"
                                                    onClick={() => onEdit(singleMsg.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                                                  >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                    <span>Edit Message</span>
                                                  </button>
                                                )}
                                              </div>
                                            )}
                                          </div>

                                          <div className="space-y-2">
                                            <h5 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                              <Quote className="w-4 h-4 text-emerald-700 shrink-0" />
                                              <span>{aboutTitle}</span>
                                            </h5>
                                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic pl-3 border-l-2 border-emerald-600">
                                              "{aboutBody}"
                                            </p>
                                          </div>

                                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-emerald-200/60 font-mono-numbers">
                                            <span>UBUMWE SACCO GAKENKE</span>
                                            <span>{singleMsg.date}</span>
                                          </div>
                                        </div>
                                        );
};

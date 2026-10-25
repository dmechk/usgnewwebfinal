import React, { useRef } from 'react';
import { ManagerMessage, Language } from '../types';
import { Quote, ShieldCheck, Edit2, User, Calendar, Camera, Upload } from 'lucide-react';
import { ImigongoRibbon } from './ImigongoPattern';

interface ManagerMessageCardProps {
  message: ManagerMessage;
  currentLang: Language;
  isAdmin?: boolean;
  onEdit?: () => void;
  onUpdateImage?: (newUrl: string) => void;
  variant?: 'home' | 'about';
}

export const ManagerMessageCard: React.FC<ManagerMessageCardProps> = ({
  message,
  currentLang,
  isAdmin = false,
  onEdit,
  onUpdateImage,
  variant = 'home',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string' && onUpdateImage) {
        onUpdateImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };
  const title = currentLang === 'fr' ? (message.titleFr || message.titleEn) : currentLang === 'rw' ? (message.titleRw || message.titleEn) : message.titleEn;
  const body = currentLang === 'fr' ? (message.bodyFr || message.bodyEn) : currentLang === 'rw' ? (message.bodyRw || message.bodyEn) : message.bodyEn;

  if (variant === 'home') {
    return (
      <section className="relative py-10 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden border-y border-slate-700/60">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="bg-slate-800/90 rounded-3xl border border-slate-700/80 shadow-2xl p-6 sm:p-10 backdrop-blur-md relative overflow-hidden">
            {/* Top decorative ribbon */}
            <div className="absolute top-0 left-0 right-0">
              <ImigongoRibbon height={6} variant="light" bordered={false} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-2">
              {/* Left Column: Portrait & Author Bio */}
              <div className="lg:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left">
                {/* Hidden file input for uploading manager photo */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="relative group">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-emerald-500/80 shadow-xl bg-slate-900 relative">
                    {message.imageUrl ? (
                      <img
                        src={message.imageUrl}
                        alt={message.authorName}
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
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-xs font-bold cursor-pointer"
                        title="Upload / Change Manager Picture"
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
                  <h4 className="text-lg font-bold text-white">{message.authorName}</h4>
                  <p className="text-xs font-semibold text-emerald-400">{message.authorRole}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 justify-center sm:justify-start">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{message.date}</span>
                  </p>
                </div>

                {isAdmin && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={onEdit}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Message</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
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
                      : 'UBUMWE SACCO GAKENKE · Ijambo ry\'Ubuyobozi'}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {title}
                </h3>

                <blockquote className="text-sm sm:text-base text-slate-200 leading-relaxed italic border-l-2 border-emerald-500/60 pl-4 py-1">
                  "{body}"
                </blockquote>

                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1.5 bg-slate-900/60 px-3 py-1 rounded-full border border-slate-700 text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Official Institutional Statement</span>
                  </span>
                  <span className="text-emerald-400 font-medium">
                    {currentLang === 'fr' ? 'Servant 19 Secteurs de Gakenke' : currentLang === 'rw' ? 'Dukorera mu Mirenge 19 ya Gakenke' : 'Serving 19 Sectors of Gakenke'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Variant for About Us page
  return (
    <div className="p-6 sm:p-8 bg-emerald-50/70 border border-emerald-200 rounded-3xl relative overflow-hidden space-y-6">
      {/* Hidden file input for uploading photo */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-emerald-600 shadow-md bg-slate-100 shrink-0 relative">
              {message.imageUrl ? (
                <img
                  src={message.imageUrl}
                  alt={message.authorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <User className="w-8 h-8" />
                </div>
              )}

              {/* Admin Image Upload Hover Overlay */}
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
              {currentLang === 'fr' ? 'Message Institutionnel' : currentLang === 'rw' ? 'Ubutumwa bw\'Ubuyobozi' : 'Institutional Message'}
            </span>
            <h4 className="text-base sm:text-lg font-bold text-slate-900">{message.authorName}</h4>
            <p className="text-xs text-slate-600">{message.authorRole}</p>
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
                onClick={onEdit}
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
          <span>{title}</span>
        </h5>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic pl-3 border-l-2 border-emerald-600">
          "{body}"
        </p>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-emerald-200/60 font-mono-numbers">
        <span>UBUMWE SACCO GAKENKE</span>
        <span>{message.date}</span>
      </div>
    </div>
  );
};

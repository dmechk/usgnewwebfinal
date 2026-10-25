import React, { useState } from 'react';
import { Language, SaccoContactInfo } from '../types';
import { SACCO_INFO } from '../data/saccoData';
import { MessageSquare, X, ExternalLink, Phone } from 'lucide-react';

interface FloatingWhatsAppProps {
  currentLang: Language;
  saccoInfo?: SaccoContactInfo;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  currentLang,
  saccoInfo = SACCO_INFO,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const cleanWhatsapp = saccoInfo.whatsapp.replace(/[^0-9]/g, '') || '250786422080';
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    saccoInfo.whatsappMessage ||
      (currentLang === 'en'
        ? 'Hello UBUMWE SACCO GAKENKE, I would like to inquire about cooperative services.'
        : 'Muraho UBUMWE SACCO GAKENKE, nifuzaga amakuru kuri serivisi za SACCO.')
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Popover Bubble */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-emerald-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">{saccoInfo.shortName} Chat</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  <span>{currentLang === 'fr' ? `En ligne / ${saccoInfo.phone}` : currentLang === 'rw' ? `Birakora / ${saccoInfo.phone}` : `Online / ${saccoInfo.phone}`}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3 bg-slate-50 text-xs text-slate-700">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <p className="font-medium text-slate-800">
                {currentLang === 'fr'
                  ? `Muraho! Bienvenue à ${saccoInfo.name}. Comment pouvons-nous vous aider aujourd'hui?`
                  : currentLang === 'rw'
                  ? `Muraho neza! Kaze muri ${saccoInfo.shortName}. Twabafasha iki uyu munsi?`
                  : `Muraho! Welcome to ${saccoInfo.name}. How can we help you today?`}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Manager: Mbitsemunda Phocas Desk
              </span>
            </div>

            <div className="space-y-1.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{currentLang === 'fr' ? 'Démarrer le Chat WhatsApp' : currentLang === 'rw' ? 'Tangira Ikiganiro kuri WhatsApp' : 'Start WhatsApp Chat'}</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>

              <a
                href={`tel:${saccoInfo.phone}`}
                className="w-full py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{currentLang === 'fr' ? `Appeler: ${saccoInfo.phone}` : currentLang === 'rw' ? `Hamagara: ${saccoInfo.phone}` : `Call Desk: ${saccoInfo.phone}`}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative group p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-2 border-white/80 cursor-pointer"
        aria-label="Open WhatsApp Live Support"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 border-2 border-white" />
        </span>

        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};

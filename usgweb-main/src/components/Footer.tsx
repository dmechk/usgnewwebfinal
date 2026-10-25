import React from 'react';
import { Language, ThemeColor, SaccoContactInfo, NavItemConfig, PartnerItem, SocialMediaItem, SocialPlatform } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { SACCO_INFO, THEME_OPTIONS, INITIAL_NAV_ITEMS, INITIAL_PARTNERS, INITIAL_SOCIAL_LINKS } from '../data/saccoData';
import {
  Landmark,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Smartphone,
  Lock,
  Settings,
  LogOut,
  Palette,
  Check,
  ShieldAlert,
  MessageSquare,
  KeyRound,
  ImageIcon,
  Compass,
  Linkedin,
  Facebook,
  X,
  Instagram,
  Youtube,
  Globe,
  MessageCircle,
} from 'lucide-react';
import { ImigongoRibbon } from './ImigongoPattern';
import minecofinLogo from '../assets/images/Minecofin.png';
import bnrLogo from '../assets/images/bnr logo.png';
import rcaLogo from '../assets/images/rica logo.png';
import brdLogo from '../assets/images/brd logo.png';
interface FooterProps {
  currentLang: Language;
  onNavigateToSection: (sectionId: string) => void;
  onOpenMembershipModal: () => void;
  isManagerLoggedIn: boolean;
  managerName?: string;
  onOpenManagerLogin?: () => void;
  onOpenAdminConsole: (tab?: string) => void;
  onManagerLogout: () => void;
  onManagerLoginSuccess?: (user?: { name: string; email: string; role: string }) => void; // optional callback with optional user
  currentTheme: ThemeColor;
  onThemeChange: (theme: ThemeColor) => void;
  saccoInfo?: SaccoContactInfo;
  navItems?: NavItemConfig[];
  partners?: PartnerItem[];
  socialLinks?: SocialMediaItem[];
}

export const Footer: React.FC<FooterProps> = ({
  currentLang,
  onNavigateToSection,
  onOpenMembershipModal,
  isManagerLoggedIn,
  managerName,
  onOpenManagerLogin,
  onOpenAdminConsole,
  onManagerLogout,
  onManagerLoginSuccess,
  currentTheme,
  onThemeChange,
  saccoInfo = SACCO_INFO,
  navItems = INITIAL_NAV_ITEMS,
  partners = INITIAL_PARTNERS,
  socialLinks = INITIAL_SOCIAL_LINKS,
}) => {
  const t = TRANSLATIONS[currentLang];

  const cleanWhatsapp = saccoInfo.whatsapp.replace(/[^0-9]/g, '') || '250786422080';
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    saccoInfo.whatsappMessage ||
    (currentLang === 'fr'
      ? 'Bonjour UBUMWE SACCO GAKENKE, je souhaite me renseigner sur vos services coopératifs.'
      : currentLang === 'rw'
      ? 'Muraho UBUMWE SACCO GAKENKE, nifuzaga kubaza amakuru kuri serivisi zanyu.'
      : 'Hello UBUMWE SACCO GAKENKE, I would like to inquire about cooperative services.')
  )}`;

  const visibleNavs = navItems.filter((i) => i.visible);

  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t-4 border-emerald-600 relative">
      {/* Top Imigongo Skeleton Ribbon */}
      <ImigongoRibbon height={18} variant="dark" bordered={false} />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 lg:py-16 space-y-12">
        {/* Main 3-Column Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand & Regulatory Statement (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <button
              type="button"
              onClick={() => onNavigateToSection('hero')}
              className="flex items-center gap-2.5 text-left cursor-pointer group transition-all"
              title="Return to Home / Top"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-700 group-hover:bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 transition-colors shadow-sm">
                <Landmark className="w-4 h-4 text-emerald-100" />
              </div>
              <span className="text-base font-extrabold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                {saccoInfo.name}
              </span>
            </button>

            <p className="text-slate-400 text-xs leading-relaxed">
              {currentLang === 'fr'
                ? 'Coopérative financière dédiée à la prospérité socio-économique des agriculteurs, commerçants et familles des 19 secteurs du district de Gakenke.'
                : currentLang === 'rw'
                ? "Koperative y'imari igamije iterambere ry'ubukungu n'imibereho myiza y'abahinzi, aborozi n'abaturage bo mu mirenge 19 ya Gakenke."
                : 'Financial cooperative dedicated to the socio-economic prosperity of farmers, merchants, and families across the 19 sectors of Gakenke District.'}
            </p>

            <div className="pt-2 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {currentLang === 'fr'
                    ? `Enregistrement Microfinance RCA : ${saccoInfo.rcaRegistration}`
                    : currentLang === 'rw'
                    ? `Icyangombwa cya RCA : ${saccoInfo.rcaRegistration}`
                    : `RCA Microfinance Registration: ${saccoInfo.rcaRegistration}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {currentLang === 'fr'
                    ? 'Institution Financière Coopérative Agréée'
                    : currentLang === 'rw'
                    ? "Ikigo cy'Imari cya Koperative Cyemewe"
                    : 'Certified Financial Cooperative Institution'}
                </span>
              </div>
            </div>
          </div>

          {/* Direct Contact Details: WhatsApp, Phone, Email (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {currentLang === 'fr'
                ? 'Contact Direct & Assistance'
                : currentLang === 'rw'
                ? 'Itumanaho & Ubufasha'
                : 'Direct Contact & Helpline'}
            </h4>
            <div className="space-y-2.5 text-slate-300">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-semibold"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>WhatsApp: <strong>{saccoInfo.whatsapp || saccoInfo.phone}</strong> (+250)</span>
              </a>

              <a
                href={`tel:${saccoInfo.phone}`}
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors font-mono-numbers"
              >
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Helpline: <strong>{saccoInfo.phone}</strong></span>
              </a>

              <a
                href={`mailto:${saccoInfo.email}`}
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
              >
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Email: <strong className="text-white">{saccoInfo.email}</strong></span>
              </a>

              <div className="flex items-center gap-2 text-amber-300 font-mono-numbers">
                <Smartphone className="w-4 h-4 shrink-0" />
                <span>Official USSD: <strong>{saccoInfo.ussdCode}</strong></span>
              </div>

              <div className="flex items-start gap-2 text-slate-400 text-[11px] pt-1">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{saccoInfo.headquarters}</span>
              </div>
            </div>
          </div>

          {/* Quick Navigational Links (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {t.footer.quickLinks}
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {visibleNavs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigateToSection(item.targetSection)}
                  className={`text-left text-xs transition-all flex items-center gap-1.5 py-1 px-1.5 rounded-lg cursor-pointer group ${
                    item.isPrimary
                      ? 'text-emerald-400 font-bold hover:text-emerald-300'
                      : 'text-slate-300 font-medium hover:text-emerald-400 hover:bg-slate-800 hover:translate-x-1'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:bg-emerald-400 transition-colors shrink-0" />
                  <span className="truncate">
                    {currentLang === 'fr'
                      ? item.labelFr || item.labelEn
                      : currentLang === 'rw'
                      ? item.labelRw
                      : item.labelEn}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 pt-2">
              {currentLang === 'fr'
                ? 'Lun - Ven : 8h00 - 17h00 | Sam : 8h00 - 13h00'
                : currentLang === 'rw'
                ? (saccoInfo.operatingHoursRw || 'Kuwa Mbere - Kuwa Gatanu: Saa 8:00 - 17:00 | Kuwa Gatandatu: Saa 8:00 - 13:00')
                : (saccoInfo.operatingHoursEn || 'Mon - Fri: 8:00 AM - 5:00 PM | Sat: 8:00 AM - 1:00 PM')}
            </p>
          </div>
        </div>
        {/* Partners & Social Media */}
        {((partners && partners.filter((p) => p.visible !== false).length > 0) ||
          (socialLinks && socialLinks.filter((s) => s.visible !== false).length > 0)) && (
          <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* OUR PARTNERS */}
            {partners && partners.filter((p) => p.visible !== false).length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                  {currentLang === 'rw' ? 'Abafatanyabikorwa' : currentLang === 'fr' ? 'Nos Partenaires' : 'Our Partners'}
                </h4>
                <div className="flex flex-wrap items-stretch gap-4">
                  {partners
                    .filter((p) => p.visible !== false)
                    .map((partner) => (
                      <a
                        key={partner.id}
                        href={partner.websiteUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={partner.name}
                        title={partner.name}
                        className="group/card"
                      >
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 transition-all duration-300 ease-out group-hover/card:shadow-2xl group-hover/card:shadow-emerald-500/30 group-hover/card:scale-110 group-hover/card:-translate-y-1 group-hover/card:border-emerald-500 flex flex-col items-center justify-center gap-2 min-w-[120px] min-h-[100px] max-w-[140px] cursor-pointer">
                          {partner.logoUrl ? (
                            <div className="w-full h-14 bg-white rounded-lg p-1.5 flex items-center justify-center shadow-sm overflow-hidden">
                              <img
                                src={partner.logoUrl}
                                alt={`${partner.name} logo`}
                                className="h-10 w-auto object-contain max-w-[110px] transition-transform duration-300 ease-out group-hover/card:scale-125"
                                onError={(e) => {
                                  // Replace broken img with letter fallback
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    parent.classList.remove('bg-white', 'p-1.5');
                                    parent.classList.add('bg-emerald-950/60', 'border', 'border-emerald-800/40');
                                    e.currentTarget.style.display = 'none';
                                    const fallback = document.createElement('span');
                                    fallback.className = 'text-xl font-extrabold text-emerald-400';
                                    fallback.textContent = partner.name.charAt(0);
                                    parent.appendChild(fallback);
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center transition-transform duration-300 ease-out group-hover/card:scale-110">
                              <span className="text-xl font-extrabold text-emerald-400 transition-all duration-300 group-hover/card:text-emerald-300">
                                {partner.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="text-center">
                            <div className="text-[11px] font-extrabold text-slate-200 group-hover/card:text-emerald-400 tracking-wide leading-tight transition-colors duration-200">
                              {partner.name}
                            </div>
                            {partner.fullName && (
                              <div className="text-[9px] text-slate-400 group-hover/card:text-slate-300 leading-tight mt-0.5 px-1 transition-colors duration-200">
                                {partner.fullName}
                              </div>
                            )}
                          </div>
                        </div>
                      </a>
                    ))}
                </div>
              </div>
            )}
            {/* OUR SOCIAL MEDIA */}
            {socialLinks && socialLinks.filter((s) => s.visible !== false).length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                  {currentLang === 'rw' ? 'Dukurikire' : currentLang === 'fr' ? 'Suivez-nous' : 'Follow Us'}
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  {socialLinks
                    .filter((s) => s.visible !== false)
                    .map((social) => {
                      // Official brand colors for each platform
                      const getBrandStyle = (): { bg: string; hover: string; icon: React.ReactNode } => {
                        switch (social.platform) {
                          case 'linkedin':
                            return {
                              bg: 'bg-[#0077B5]',
                              hover: 'hover:bg-[#005885]',
                              icon: <Linkedin size={20} className="text-white" />,
                            };
                          case 'facebook':
                            return {
                              bg: 'bg-[#1877F2]',
                              hover: 'hover:bg-[#0d65d8]',
                              icon: <Facebook size={20} className="text-white" />,
                            };
                          case 'twitter':
                            return {
                              bg: 'bg-[#000000]',
                              hover: 'hover:bg-[#2d2d2d]',
                              icon: <X size={20} className="text-white" />,
                            };
                          case 'instagram':
                            return {
                              bg: 'bg-gradient-to-br from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888]',
                              hover: 'hover:opacity-90',
                              icon: <Instagram size={20} className="text-white" />,
                            };
                          case 'youtube':
                            return {
                              bg: 'bg-[#FF0000]',
                              hover: 'hover:bg-[#cc0000]',
                              icon: <Youtube size={20} className="text-white" />,
                            };
                          case 'whatsapp':
                            return {
                              bg: 'bg-[#25D366]',
                              hover: 'hover:bg-[#1da851]',
                              icon: <MessageCircle size={20} className="text-white" />,
                            };
                          default:
                            return {
                              bg: 'bg-slate-700',
                              hover: 'hover:bg-slate-600',
                              icon: <Globe size={20} className="text-white" />,
                            };
                        }
                      };
                      const { bg, hover, icon } = getBrandStyle();
                      return (
                        <a
                          key={social.id}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.label}
                          title={social.label}
                          className={`p-2.5 rounded-xl ${bg} ${hover} text-white transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white/50 inline-flex items-center justify-center shadow-sm hover:scale-110 hover:shadow-md`}
                        >
                          {icon}
                        </a>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Staff Login Button */}
        <div className="mt-6 flex items-center justify-end">
          {isManagerLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAdminConsole()}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Admin Hub</span>
              </button>
              <button
                type="button"
                onClick={onManagerLogout}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer border border-slate-300"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenManagerLogin}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-200" />
              <span>
                {currentLang === 'fr'
                  ? 'Connexion Staff'
                  : currentLang === 'rw'
                  ? "Kwinjira kw'Abakozi"
                  : 'Staff Login'}
              </span>
            </button>
          )}
        </div>

        {/* Bottom Imigongo Skeleton Trim */}
        <ImigongoRibbon height={12} variant="dark" bordered={false} />

        {/* Copyright & Disclaimer */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© 2026 {saccoInfo.name}. All Rights Reserved. Developed by &amp; DmechTech Ltd.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>District: {saccoInfo.district}</span>
            <span>·</span>
            <span>USSD: {saccoInfo.ussdCode}</span>
            <span>·</span>
            <a href={`tel:${saccoInfo.phone}`} className="hover:text-emerald-400 font-mono-numbers">
              {saccoInfo.phone}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

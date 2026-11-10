import React, { useState, useEffect } from 'react';
import { Language, ThemeColor, SaccoContactInfo, NavItemConfig, SystemImagesConfig } from '../types';
import { SACCO_INFO, THEME_OPTIONS, INITIAL_NAV_ITEMS } from '../data/saccoData';
import {
  Phone, Smartphone, Menu, X, Mail, Shield, LogOut, Settings, Palette,
  Check, ImageIcon, Compass, Users, Layers, Briefcase, Bell, Quote,
} from 'lucide-react';
import { ImigongoRibbon } from './ImigongoPattern';
import { TailwindClasses } from '../constants/tailwindClasses';
import defaultLogo from '../assets/images/usglogo.png';

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenMembershipModal: () => void;
  onNavigateToSection: (sectionId: string) => void;
  isManagerLoggedIn: boolean;
  managerName?: string;
  userRole?: string;
  onOpenAdminConsole: (tab?: string) => void;
  onManagerLogout: () => void;
  currentTheme: ThemeColor;
  onThemeChange: (theme: ThemeColor) => void;
  saccoInfo?: SaccoContactInfo;
  navItems?: NavItemConfig[];
  systemImages?: SystemImagesConfig;
  activeSection?: string;
  onOpenManagerLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  onNavigateToSection,
  isManagerLoggedIn,
  managerName,
  userRole,
  onOpenAdminConsole,
  onManagerLogout,
  currentTheme,
  onThemeChange,
  saccoInfo = SACCO_INFO,
  navItems = INITIAL_NAV_ITEMS,
  systemImages,
  activeSection = 'all',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    onNavigateToSection(sectionId);
    setMobileMenuOpen(false);
  };

  const getNavLabel = (item: NavItemConfig) => {
    if (currentLang === 'fr') return item.labelFr || item.labelEn;
    if (currentLang === 'rw') return item.labelRw;
    return item.labelEn;
  };

  const contactButtonLabel =
    currentLang === 'fr'
      ? 'Contactez-nous'
      : currentLang === 'rw'
        ? 'Twandikire'
        : 'Contact Us';

  const visibleNavs = navItems.filter((i) => i.visible);
  // Loan calculator is embedded inside Our Services; Contact Us is a standalone CTA button — both excluded from the nav link list
  const headerNavs = visibleNavs.filter(
    (item) => item.targetSection !== 'calculator' && item.targetSection !== 'contact'
  );
  // Mobile nav shows everything (including contact) except the calculator
  const mobileNavs = visibleNavs.filter((item) => item.targetSection !== 'calculator' && item.targetSection !== 'contact');

  return (
    <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md transition-all duration-300 border-b border-transparent ${isScrolled ? 'shadow-md' : 'shadow-xs'
      }`}>
      {/* Crisp & Small Imigongo Cultural Ribbon */}
      <ImigongoRibbon height={7} variant="light" bordered={true} />

      {/* Admin Status Ribbon (Strictly tailored to user's role and privileges) */}
      {isManagerLoggedIn && (() => {
        const role = (userRole || localStorage.getItem('ubumwe_user_role') || 'ADMIN_IT').toUpperCase();
        const isHR = role === 'ADMIN_HR';
        const isMediaAdmin = role === 'ADMIN';
        const isDAF = role === 'DAF';
        const isMD = role === 'MD';
        const isSuperAdmin = role === 'ADMIN_IT' || role === 'admin';

        return (
          <div className="bg-emerald-950 text-white text-xs py-1.5 px-4 sm:px-8 border-b border-emerald-800 flex flex-wrap items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                <strong className="text-emerald-300 font-mono">[{role}]</strong> {managerName || saccoInfo.email} ·{' '}
                <span className="text-emerald-400 text-[11px] font-medium">
                  {isHR ? 'Human Resources & Recruitment Privileges' :
                    isDAF ? 'Finance, Careers & KYC Loan Privileges' :
                      isMD ? 'Executive Management & Governance Privileges' :
                        isMediaAdmin ? 'Media, Gallery & News Privileges' :
                          'Full System & Infrastructure Privileges'}
                </span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* HR Authorized Shortcuts */}
              {(isHR || isSuperAdmin || isMD) && (
                <button
                  type="button"
                  onClick={() => onOpenAdminConsole('job-applicants')}
                  className="text-[11px] bg-emerald-800 hover:bg-emerald-700 px-2.5 py-0.5 rounded font-bold flex items-center gap-1 transition-colors cursor-pointer text-white shadow-xs"
                  title="Manage Job Applicants (Status, Deliberation Comments, Dossiers)"
                >
                  <Users className="w-3 h-3 text-emerald-300" />
                  <span>Applicants</span>
                </button>
              )}

              {(isHR || isDAF || isSuperAdmin || isMD) && (
                <button
                  type="button"
                  onClick={() => onOpenAdminConsole('careers')}
                  className="text-[11px] bg-emerald-800 hover:bg-emerald-700 px-2.5 py-0.5 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  title="Manage Careers & Job Vacancies"
                >
                  <Briefcase className="w-3 h-3 text-emerald-300" />
                  <span>Vacancies</span>
                </button>
              )}

              {/* Media Admin Shortcuts */}
              {(isMediaAdmin || isSuperAdmin) && (
                <button
                  type="button"
                  onClick={() => onOpenAdminConsole('moments')}
                  className="text-[11px] bg-emerald-800 hover:bg-emerald-700 px-2.5 py-0.5 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  title="Manage Gallery Moments"
                >
                  <ImageIcon className="w-3 h-3 text-emerald-300" />
                  <span>Gallery</span>
                </button>
              )}

              {(isMediaAdmin || isSuperAdmin) && (
                <button
                  type="button"
                  onClick={() => onOpenAdminConsole('announcements')}
                  className="text-[11px] bg-emerald-800 hover:bg-emerald-700 px-2.5 py-0.5 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  title="Manage News & Bulletins"
                >
                  <Bell className="w-3 h-3 text-emerald-300" />
                  <span>Bulletins</span>
                </button>
              )}

              {/* DAF Shortcuts */}
              {(isDAF || isSuperAdmin) && (
                <button
                  type="button"
                  onClick={() => onOpenAdminConsole('products')}
                  className="text-[11px] bg-emerald-800 hover:bg-emerald-700 px-2.5 py-0.5 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  title="Manage Financial Products"
                >
                  <Layers className="w-3 h-3 text-emerald-300" />
                  <span>Products</span>
                </button>
              )}

              {/* MD Leadership Shortcuts */}
              {(isMD || isSuperAdmin) && (
                <button
                  type="button"
                  onClick={() => onOpenAdminConsole('messages')}
                  className="text-[11px] bg-emerald-800 hover:bg-emerald-700 px-2.5 py-0.5 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  title="Executive Messages"
                >
                  <Quote className="w-3 h-3 text-emerald-300" />
                  <span>Messages</span>
                </button>
              )}

              {/* Super Admin Technical Config */}
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => onOpenAdminConsole('navigation')}
                  className="text-[11px] bg-emerald-800 hover:bg-emerald-700 px-2.5 py-0.5 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  title="Manage Navigation Links"
                >
                  <Compass className="w-3 h-3 text-emerald-300" />
                  <span>Navs</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onOpenAdminConsole()}
                className="text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-0.5 rounded font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <Settings className="w-3 h-3" />
                <span>Console</span>
              </button>

              <button
                type="button"
                onClick={onManagerLogout}
                className="text-[11px] text-emerald-300 hover:text-white flex items-center gap-1 transition-colors ml-1 cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* Top Utility Ribbon */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-3 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <a
              href={`tel:${saccoInfo.phone}`}
              className="flex items-center gap-1.5 text-slate-200 hover:text-emerald-400 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-mono-numbers font-semibold">{saccoInfo.phone}</span>
            </a>
            <span className="text-slate-600">|</span>
            <a
              href={`mailto:${saccoInfo.email}`}
              className="hidden md:flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{saccoInfo.email}</span>
            </a>
            <span className="hidden sm:inline-block text-slate-600">|</span>
            <span className="flex items-center gap-1.5 text-amber-300 font-bold font-mono-numbers">
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span>USSD: {saccoInfo.ussdCode}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-[11px] hidden lg:inline">
              UBUMWE SACCO · {saccoInfo.district}
            </span>

            {/* Theme Color Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="flex items-center gap-1.5 text-[11px] text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer"
                title="Switch Theme Color"
              >
                <Palette className="w-3 h-3 text-amber-400" />
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white/40"
                  style={{ backgroundColor: THEME_OPTIONS.find((t) => t.id === currentTheme)?.primaryHex || '#047857' }}
                />
                <span className="hidden sm:inline">Theme</span>
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-2 z-50 animate-in fade-in">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1 border-b border-slate-800">
                    Whole System Theme Color
                  </div>
                  <div className="space-y-1">
                    {THEME_OPTIONS.map((theme) => {
                      const isSelected = currentTheme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => {
                            onThemeChange(theme.id);
                            setThemeDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${isSelected
                            ? 'bg-slate-800 text-white font-bold'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full border border-white/30"
                              style={{ backgroundColor: theme.primaryHex }}
                            />
                            <span>
                              {currentLang === 'fr'
                                ? theme.nameFr || theme.nameEn
                                : currentLang === 'rw'
                                  ? theme.nameRw
                                  : theme.nameEn}
                            </span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <div className="flex items-center rounded-md bg-slate-800 p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-0.5 text-[11px] font-bold rounded cursor-pointer transition-colors ${currentLang === 'en'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('rw')}
                className={`px-2 py-0.5 text-[11px] font-bold rounded cursor-pointer transition-colors ${currentLang === 'rw'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                RW
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('fr')}
                className={`px-2 py-0.5 text-[11px] font-bold rounded cursor-pointer transition-colors ${currentLang === 'fr'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                FR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className={`max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 lg:gap-3 xl:gap-5 transition-all duration-300 border-b border-transparent ${isScrolled ? 'py-1 sm:py-1.5' : 'py-2 sm:py-2.5'
        }`}>
        {/* Zone 1: SACCO Identity & Big, Prominent Circular Logo */}
        <button
          onClick={() => handleNavClick('hero')}
          className="flex items-center gap-2.5 sm:gap-3.5 group cursor-pointer shrink-0 text-left py-0.5"
          title="UBUMWE SACCO GAKENKE - Home"
        >
          {/* Circle logo badge — bold, sharp, and clearly visible */}
          <div className={`relative shrink-0 rounded-full overflow-hidden border-2 sm:border-[2.5px] border-emerald-600/30 shadow-md bg-white transition-all duration-300 ease-out z-20 group-hover:scale-105 group-hover:shadow-lg p-0.5 ${isScrolled
            ? 'w-11 h-11 sm:w-12 sm:h-12'
            : 'w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18'
            }`}>
            <img
              src={systemImages?.saccoLogo || defaultLogo}
              alt="UBUMWE SACCO GAKENKE Logo"
              className="w-full h-full object-contain select-none transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== defaultLogo) {
                  target.src = defaultLogo;
                }
              }}
            />
          </div>
          <div className="flex flex-col justify-center transition-all duration-300 select-none">
            <span
              className={
                "font-black tracking-tight text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors duration-300 " +
                (isScrolled ? "text-sm sm:text-base" : "text-base sm:text-lg lg:text-lg xl:text-xl")
              }
            >
              UBUMWE SACCO
            </span>
            <span
              className={
                "font-extrabold tracking-widest text-emerald-700 uppercase transition-all duration-300 " +
                (isScrolled ? "text-[9px] sm:text-[10px]" : "text-[10px] sm:text-xs")
              }
            >
              GAKENKE
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links in Header (Excluding Contact Us so only one button exists) */}
        <nav className={TailwindClasses.HEADER_NAV}>
          {headerNavs.map((item) => {
            const isActive =
              activeSection === item.targetSection ||
              (activeSection === 'hero' && item.targetSection === 'hero') ||
              (activeSection === 'all' && item.targetSection === 'hero');

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.targetSection)}
                className={
                  "transition-all whitespace-nowrap shrink-0 px-2 lg:px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl cursor-pointer font-bold tracking-tight text-xs lg:text-[13px] xl:text-sm " +
                  (isActive
                    ? "active-nav bg-emerald-700 text-white font-black shadow-sm hover:bg-emerald-800"
                    : "text-black hover:text-emerald-800 hover:bg-slate-100")
                }
                style={!isActive ? { color: '#000000' } : undefined}
              >
                {getNavLabel(item)}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Working Contact Us (styled identically to Branches & Outposts) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleNavClick('contact')}
            className={
              "transition-all whitespace-nowrap shrink-0 px-3 xl:px-4 py-1.5 xl:py-2 rounded-xl cursor-pointer font-bold tracking-tight text-xs lg:text-[13px] xl:text-sm " +
              (activeSection === "contact"
                ? "active-nav bg-emerald-700 text-white font-black shadow-sm hover:bg-emerald-800"
                : "text-black hover:text-emerald-800 hover:bg-slate-100")
            }
            style={activeSection !== 'contact' ? { color: '#000000' } : undefined}
          >
            <span>{contactButtonLabel}</span>
          </button>

          {/* Mobile menu toggle button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-2 font-bold text-base text-slate-800">
            {mobileNavs.map((item) => {
              const isActive =
                activeSection === item.targetSection ||
                (activeSection === 'hero' && item.targetSection === 'hero');

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.targetSection)}
                  className={
                    "text-left py-2.5 px-4 rounded-xl font-bold text-base transition-colors cursor-pointer " +
                    (isActive
                      ? "active-nav bg-emerald-700 text-white font-extrabold shadow-sm"
                      : "text-black hover:bg-slate-100")
                  }
                  style={!isActive ? { color: '#000000' } : undefined}
                >
                  {getNavLabel(item)}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            {/* Mobile Theme Selector */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-500" />
                  <span>Portal Theme Color</span>
                </span>
                <span className="text-[11px] font-normal text-slate-500">
                  {THEME_OPTIONS.find((t) => t.id === currentTheme)?.nameEn}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {THEME_OPTIONS.map((theme) => {
                  const isSelected = currentTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => onThemeChange(theme.id)}
                      className={
                        "h-8 rounded-lg flex items-center justify-center transition-all " +
                        (isSelected
                          ? "ring-2 ring-slate-900 ring-offset-1 scale-105"
                          : "opacity-80 hover:opacity-100")
                      }
                      style={{ backgroundColor: theme.primaryHex }}
                      title={theme.nameEn}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Authenticated Manager Actions */}
            {isManagerLoggedIn && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <Shield className="w-4 h-4 text-emerald-700" />
                  <span>Manager Session Active</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAdminConsole('contact');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Edit Contacts</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAdminConsole('pictures');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Change Pictures</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onOpenAdminConsole();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Open Full Admin Console</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

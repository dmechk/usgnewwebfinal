import React, { useState, useEffect } from 'react';
import { Language, BranchOutpost } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { BRANCHES_DATA, SACCO_INFO } from '../data/saccoData';
import { MapPin, Phone, Clock, Search, Building2, CheckCircle2, Navigation, Edit2, ExternalLink, Globe } from 'lucide-react';
import { ImigongoRibbon } from './ImigongoPattern';

export const GAKENKE_MAP_DIRECTIONS_URL =
  'https://www.google.com/maps/dir//Gakenke/@-1.7114734,29.617736,11z/data=!4m17!1m8!3m7!1s0x19dcf39e3202d463:0x1eceb378ea2a23e9!2sGakenke!3b1!8m2!3d-1.6924232!4d29.742604!16s%2Fm%2F02w93vh!4m7!1m0!1m5!1m1!1s0x19dcf39e3202d463:0x1eceb378ea2a23e9!2m2!1d29.742604!2d-1.6924232?entry=ttu&g_ep=EgoyMDI2MTAxMy4wIKXMDSoASAFQAw%3D%3D';

interface BranchLocatorProps {
  currentLang: Language;
  branches?: BranchOutpost[];
  isAdmin?: boolean;
  onOpenAdminConsole?: (tab?: string) => void;
}

export const BranchLocator: React.FC<BranchLocatorProps> = ({
  currentLang,
  branches = BRANCHES_DATA,
  isAdmin = false,
  onOpenAdminConsole,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mapMode, setMapMode] = useState<'google' | 'grid'>('google');
  const activeBranches = branches && branches.length > 0 ? branches : BRANCHES_DATA;
  const [selectedBranch, setSelectedBranch] = useState<BranchOutpost>(activeBranches[0] || BRANCHES_DATA[0]);
  const t = TRANSLATIONS[currentLang];

  useEffect(() => {
    if (activeBranches.length > 0) {
      if (!selectedBranch || !activeBranches.some((b) => b.id === selectedBranch.id)) {
        setSelectedBranch(activeBranches[0]);
      }
    }
  }, [branches]);

  const filteredBranches = activeBranches.filter(branch => {
    const q = (searchQuery || '').toLowerCase();
    const name = (branch.name || '').toLowerCase();
    const sector = (branch.sector || '').toLowerCase();
    const manager = (branch.managerName || '').toLowerCase();
    return name.includes(q) || sector.includes(q) || manager.includes(q);
  });

  return (
    <section id="branches" className="py-16 lg:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header (Aligned to reference picture) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 tracking-wider uppercase mb-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>
                {currentLang === 'fr'
                  ? 'Au service des 19 Secteurs du District de Gakenke'
                  : currentLang === 'rw'
                  ? 'Dukorera mu Mirenge 19 ya Gakenke'
                  : 'Serving 19 Sectors in Gakenke District'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight" style={{ textWrap: 'balance' }}>
              {currentLang === 'fr'
                ? 'Agences & Postes · UBUMWE SACCO GAKENKE'
                : currentLang === 'rw'
                ? 'Amashami yacu · UBUMWE SACCO GAKENKE'
                : 'Branches & Outposts · UBUMWE SACCO GAKENKE'}
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-3xl">
              {t.branches.subtitle} · {currentLang === 'fr' ? 'Ligne Centrale :' : currentLang === 'rw' ? 'Telefone Rusange :' : 'Central Support Line:'}{' '}
              <strong className="text-slate-900 font-mono-numbers">{SACCO_INFO.phone}</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.branches.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>

            {isAdmin && onOpenAdminConsole && (
              <button
                type="button"
                onClick={() => onOpenAdminConsole('branches')}
                className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5 shrink-0"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>
                  {currentLang === 'fr'
                    ? 'Gérer Agences'
                    : currentLang === 'rw'
                    ? 'Gucunga Amashami'
                    : 'Manage Branches'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Outpost List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Available Service Outposts ({filteredBranches.length})</span>
              {isAdmin && onOpenAdminConsole && (
                <button
                  type="button"
                  onClick={() => onOpenAdminConsole('branches')}
                  className="text-[11px] text-emerald-700 hover:underline font-bold"
                >
                  + Add / Edit Branch
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {filteredBranches.map((branch) => {
                const isSelected = selectedBranch.id === branch.id;
                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => setSelectedBranch(branch)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-600 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{branch.name}</h4>
                        <span className="text-[11px] font-semibold text-emerald-800 ml-2">{branch.sector}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {currentLang === 'fr' ? branch.locationDetailsFr || branch.locationDetailsEn : currentLang === 'rw' ? branch.locationDetailsRw || branch.locationDetailsEn : branch.locationDetailsEn}
                      </p>
                      {branch.subBranches && branch.subBranches.length > 0 && (
                        <div className="mt-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded inline-block font-semibold">
                          {branch.subBranches.length}{' '}
                          {currentLang === 'fr'
                            ? 'Sous-agence(s)'
                            : currentLang === 'rw'
                            ? 'Ishami rito'
                            : 'Sub-branch(es)'}
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-mono-numbers">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{SACCO_INFO.phone}</span>
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Outpost Detail & Visual Map Box */}
          <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs relative overflow-hidden">
            {/* Top Imigongo accent */}
            <div className="absolute top-0 left-0 right-0">
              <ImigongoRibbon height={8} variant="light" bordered={false} />
            </div>

            {/* Map Mode Selector & Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
              <div className="inline-flex p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMapMode('google')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    mapMode === 'google'
                      ? 'bg-white text-emerald-800 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Google Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapMode('grid')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    mapMode === 'grid'
                      ? 'bg-white text-emerald-800 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sector Outposts</span>
                </button>
              </div>

              {/* External Google Maps Button with Exact Route */}
              <a
                href={GAKENKE_MAP_DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Get driving / walking directions to Gakenke on Google Maps"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Google Maps Directions</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>

            {/* Map Display Box */}
            {mapMode === 'google' ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 h-72 sm:h-84 shadow-inner">
                {/* Dynamically generated Google Map embed for the selected branch */}
                <iframe
                  key={`map-${selectedBranch?.id || 'default'}-${selectedBranch?.sector || ''}`}
                  title={`${selectedBranch?.name || 'UBUMWE SACCO'} Location Map`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    selectedBranch?.coordinates
                      ? `${selectedBranch.coordinates.lat},${selectedBranch.coordinates.lng}`
                      : `${selectedBranch?.name || 'UBUMWE SACCO'}, ${selectedBranch?.sector || 'Gakenke'}, Gakenke District, Rwanda`
                  )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
                <div className="absolute bottom-2 left-2 right-2 bg-slate-900/95 text-white px-3.5 py-2 rounded-xl text-xs backdrop-blur-md flex items-center justify-between pointer-events-auto border border-white/10 shadow-lg">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="truncate font-semibold">
                      {selectedBranch?.name || 'UBUMWE SACCO GAKENKE'} · Sector {selectedBranch?.sector || 'Gakenke'}
                    </span>
                  </div>
                  <a
                    href={
                      selectedBranch?.coordinates
                        ? `https://www.google.com/maps/dir/?api=1&destination=${selectedBranch.coordinates.lat},${selectedBranch.coordinates.lng}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedBranch?.name || 'UBUMWE SACCO'}, ${selectedBranch?.sector || 'Gakenke'}, Rwanda`)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 shrink-0 ml-3 text-[11px] bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700 hover:bg-slate-700 transition-colors"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-900 h-64 sm:h-72 flex items-center justify-center text-white">
                <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-slate-950/80 pointer-events-none" />

                <div className="relative z-10 w-full h-full p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700">
                      <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-semibold text-slate-200">Gakenke District</span>
                    </div>
                    <span className="text-[11px] font-mono-numbers text-slate-400">
                      {selectedBranch?.coordinates
                        ? `${selectedBranch.coordinates.lat.toFixed(4)}° S, ${selectedBranch.coordinates.lng.toFixed(4)}° E`
                        : ''}
                    </span>
                  </div>

                  {/* Sector Pins */}
                  <div className="grid grid-cols-3 gap-2 my-auto">
                    {activeBranches.slice(0, 6).map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBranch(b)}
                        className={`text-center p-2 rounded-lg border transition-all cursor-pointer ${
                          selectedBranch?.id === b.id
                            ? 'bg-emerald-600/90 border-emerald-400 text-white shadow-lg scale-105'
                            : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5 mx-auto mb-0.5 text-emerald-300" />
                        <div className="text-[11px] font-bold truncate">{b.sector}</div>
                      </button>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-300 flex items-center justify-between font-mono-numbers">
                    <span>Helpline: {SACCO_INFO.phone}</span>
                    <span className="text-emerald-400">USSD: {SACCO_INFO.ussdCode}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Outpost Details */}
            {selectedBranch && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">{selectedBranch.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {currentLang === 'fr' ? selectedBranch.locationDetailsFr || selectedBranch.locationDetailsEn : currentLang === 'rw' ? selectedBranch.locationDetailsRw || selectedBranch.locationDetailsEn : selectedBranch.locationDetailsEn}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && onOpenAdminConsole && (
                      <button
                        type="button"
                        onClick={() => onOpenAdminConsole('branches')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-emerald-300"
                        title="Edit this branch in Admin Console"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>
                          {currentLang === 'fr'
                            ? "Modifier l'Agence"
                            : currentLang === 'rw'
                            ? 'Hindura Ishami'
                            : 'Edit Branch'}
                        </span>
                      </button>
                    )}
                    <a
                      href={`tel:${SACCO_INFO.phone}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shrink-0 font-mono-numbers"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call {SACCO_INFO.phone}</span>
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-500 block">{t.branches.manager}</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedBranch.managerName}</span>
                    <span className="text-emerald-700 font-mono-numbers mt-1 block">Help: {SACCO_INFO.phone}</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-500 block">{t.branches.workingHours}</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedBranch.operatingHours}</span>
                    </span>
                  </div>
                </div>

                {/* Sub-branches list */}
                {selectedBranch.subBranches && selectedBranch.subBranches.length > 0 && (
                  <div className="p-4 bg-white rounded-2xl border border-emerald-200 space-y-2">
                    <div className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center justify-between">
                      <span>Registered Sub-branches &amp; Registration Points</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px]">
                        {selectedBranch.subBranches.length} Outposts
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedBranch.subBranches.map((sub) => (
                        <div key={sub.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                          <div className="font-bold text-slate-900">{sub.name}</div>
                          <div className="text-slate-500 text-[11px]">Sector: {sub.sector} · Mgr: {sub.managerName}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Cash Teller &amp; Vault</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>USSD {SACCO_INFO.ussdCode} Assistance</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </section>
  );
};

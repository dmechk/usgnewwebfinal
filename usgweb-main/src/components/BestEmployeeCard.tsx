import React, { useState, useRef } from 'react';
import { EmployeeOfTheYear, Language } from '../types';
import { Award, Trophy, Sparkles, Star, Edit2, Camera, ShieldCheck, User, Calendar, Check, X } from 'lucide-react';
import { ImigongoRibbon } from './ImigongoPattern';

interface BestEmployeeCardProps {
  employee: EmployeeOfTheYear;
  currentLang: Language;
  isAdmin?: boolean;
  onUpdateEmployee?: (updates: Partial<EmployeeOfTheYear>) => void;
  variant?: 'section' | 'card';
}

export const BestEmployeeCard: React.FC<BestEmployeeCardProps> = ({
  employee,
  currentLang,
  isAdmin = false,
  onUpdateEmployee,
  variant = 'section',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form state for editing
  const [formName, setFormName] = useState(employee.name);
  const [formRoleEn, setFormRoleEn] = useState(employee.roleEn);
  const [formRoleRw, setFormRoleRw] = useState(employee.roleRw || '');
  const [formDepartmentEn, setFormDepartmentEn] = useState(employee.departmentEn);
  const [formDepartmentRw, setFormDepartmentRw] = useState(employee.departmentRw || '');
  const [formYear, setFormYear] = useState(employee.year);
  const [formMetric, setFormMetric] = useState(employee.achievementMetric || '');
  const [formCitationEn, setFormCitationEn] = useState(employee.citationEn);
  const [formCitationRw, setFormCitationRw] = useState(employee.citationRw || '');
  const [formImageUrl, setFormImageUrl] = useState(employee.imageUrl);

  const openEditModal = () => {
    setFormName(employee.name);
    setFormRoleEn(employee.roleEn);
    setFormRoleRw(employee.roleRw || '');
    setFormDepartmentEn(employee.departmentEn);
    setFormDepartmentRw(employee.departmentRw || '');
    setFormYear(employee.year);
    setFormMetric(employee.achievementMetric || '');
    setFormCitationEn(employee.citationEn);
    setFormCitationRw(employee.citationRw || '');
    setFormImageUrl(employee.imageUrl);
    setIsEditModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateEmployee) {
      onUpdateEmployee({
        name: formName,
        roleEn: formRoleEn,
        roleRw: formRoleRw || formRoleEn,
        departmentEn: formDepartmentEn,
        departmentRw: formDepartmentRw || formDepartmentEn,
        year: formYear,
        achievementMetric: formMetric,
        citationEn: formCitationEn,
        citationRw: formCitationRw || formCitationEn,
        imageUrl: formImageUrl,
      });
    }
    setIsEditModalOpen(false);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (onUpdateEmployee) {
          onUpdateEmployee({ imageUrl: reader.result });
        }
        setFormImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const role =
    currentLang === 'fr'
      ? employee.roleFr || employee.roleEn
      : currentLang === 'rw'
        ? employee.roleRw || employee.roleEn
        : employee.roleEn;

  const department =
    currentLang === 'rw' ? employee.departmentRw || employee.departmentEn : employee.departmentEn;

  const citation =
    currentLang === 'fr'
      ? employee.citationFr || employee.citationEn
      : currentLang === 'rw'
        ? employee.citationRw || employee.citationEn
        : employee.citationEn;

  if (!employee.active) return null;

  const cardContent = (
    <div className="relative bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white rounded-3xl border-2 border-amber-500/40 shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* Top Imigongo Ribbon with Gold Tint */}
      <div className="absolute top-0 left-0 right-0">
        <ImigongoRibbon height={6} variant="light" bordered={false} />
      </div>

      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative p-6 sm:p-10 z-10">
        {/* Top Badges & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-md">
              <Trophy className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {currentLang === 'fr'
                      ? 'Meilleur Employé de l’Année'
                      : currentLang === 'rw'
                        ? "Umukozi w'Indashyikirwa w'Umwaka"
                        : 'Best Employee of the Year'}
                  </span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-xs">
                  {employee.year}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">UBUMWE SACCO GAKENKE · Staff Excellence Award</p>
            </div>
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openEditModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-md"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Awardee</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Upload Photo"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>Change Photo</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-8">
          {/* Left Column: Portrait with Prestigious Border */}
          <div className="lg:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="relative group">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-3 border-amber-400 shadow-2xl bg-slate-950 relative ring-4 ring-amber-400/20">
                {employee.imageUrl ? (
                  <img
                    src={employee.imageUrl}
                    alt={employee.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    <User className="w-16 h-16" />
                  </div>
                )}

                {/* Admin Quick Upload Overlay */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-xs font-bold cursor-pointer"
                  >
                    <Camera className="w-6 h-6 text-amber-400" />
                    <span>Change Photo</span>
                  </button>
                )}
              </div>

              {/* Gold Ribbon Badge */}
              <div className="absolute -bottom-3 -right-3 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs rounded-full shadow-lg border-2 border-white flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                <span>#1 Top Performer</span>
              </div>
            </div>

            <div className="mt-5 space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {employee.name}
              </h3>
              <p className="text-sm font-bold text-amber-300">{role}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1 justify-center sm:justify-start">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{department}</span>
              </p>
            </div>
          </div>

          {/* Right Column: Achievements & Official Citation */}
          <div className="lg:col-span-8 space-y-5">
            {/* Metric Banner */}
            {employee.achievementMetric && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs sm:text-sm font-extrabold shadow-sm">
                <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{employee.achievementMetric}</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>
                  {currentLang === 'fr'
                    ? 'Citation d’Excellence Professionnelle'
                    : currentLang === 'rw'
                      ? "Impamvu y'Igihembo n'Ubwitange"
                      : 'Official Award Citation'}
                </span>
              </div>

              <blockquote className="text-sm sm:text-base text-slate-100 leading-relaxed italic border-l-3 border-amber-400 pl-4 py-1 bg-white/5 rounded-r-2xl pr-4">
                "{citation}"
              </blockquote>
            </div>

            {/* Official seal footer */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-emerald-300">
                  {currentLang === 'fr'
                    ? 'Certifié par le Conseil d’Administration & la Direction Générale'
                    : currentLang === 'rw'
                      ? "Byemejwe n'Inama y'Ubuyobozi na Biro Nkuru ya SACCO"
                      : 'Recognized by the Board of Directors & General Management'}
                </span>
              </div>
              <span className="text-amber-400 font-mono text-[11px]">UBUMWE SACCO · Gakenke District</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal for Admin */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 text-white max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Trophy className="w-5 h-5" />
                <span>Edit Best Employee of the Year</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Employee Full Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Role / Job Title (English)</label>
                  <input
                    type="text"
                    value={formRoleEn}
                    onChange={(e) => setFormRoleEn(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Role (Kinyarwanda)</label>
                  <input
                    type="text"
                    value={formRoleRw}
                    onChange={(e) => setFormRoleRw(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Department & Branch (English)</label>
                  <input
                    type="text"
                    value={formDepartmentEn}
                    onChange={(e) => setFormDepartmentEn(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Award Year</label>
                  <input
                    type="text"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-amber-400 focus:outline-none"
                    placeholder="e.g. 2026"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Key Achievement Metric</label>
                <input
                  type="text"
                  value={formMetric}
                  onChange={(e) => setFormMetric(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-amber-400 focus:outline-none"
                  placeholder="e.g. 99.8% Recovery · 420+ Farmers Supported"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Official Award Citation (English)</label>
                <textarea
                  rows={3}
                  value={formCitationEn}
                  onChange={(e) => setFormCitationEn(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Citation (Kinyarwanda)</label>
                <textarea
                  rows={3}
                  value={formCitationRw}
                  onChange={(e) => setFormCitationRw(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Photo Image URL</label>
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  if (variant === 'card') {
    return cardContent;
  }

  return (
    <section id="employee-of-the-year" className="py-12 lg:py-16 bg-slate-100/70 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-100 px-3.5 py-1.5 rounded-full border border-amber-300/60 mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Staff Recognition & Excellence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {currentLang === 'fr'
              ? 'Employé de l’Année'
              : currentLang === 'rw'
                ? "Umukozi w'Umwaka"
                : 'Best Employee of the Year'}
          </h2>
          <p className="text-slate-600 text-sm mt-1.5">
            {currentLang === 'fr'
              ? 'Célébrer le dévouement exceptionnel et le service aux membres de notre équipe.'
              : currentLang === 'rw'
                ? "Gushimira ubwitange n'umuhate by'abakozi bacu mu gutanga serivisi nziza."
                : 'Honoring exceptional member service, dedication, and cooperative leadership.'}
          </p>
        </div>

        {cardContent}
      </div>
    </section>
  );
};

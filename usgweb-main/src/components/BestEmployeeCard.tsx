import React, { useState, useRef } from 'react';
import { EmployeeOfTheYear, Language } from '../types';
import {
  Award,
  Trophy,
  Sparkles,
  Star,
  Edit2,
  Camera,
  ShieldCheck,
  User,
  Check,
  X,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import { ImigongoRibbon } from './ImigongoPattern';

interface BestEmployeeCardProps {
  employee?: EmployeeOfTheYear | null;
  currentLang: Language;
  isAdmin?: boolean;
  onUpdateEmployee?: (updates: Partial<EmployeeOfTheYear>) => void;
  onDeleteEmployee?: () => void;
  onCreateEmployee?: (employee: EmployeeOfTheYear) => void;
  variant?: 'section' | 'card';
}

export const BestEmployeeCard: React.FC<BestEmployeeCardProps> = ({
  employee,
  currentLang,
  isAdmin = false,
  onUpdateEmployee,
  onDeleteEmployee,
  onCreateEmployee,
  variant = 'section',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newFileInputRef = useRef<HTMLInputElement>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Edit form state
  const [formName, setFormName] = useState(employee?.name || '');
  const [formRoleEn, setFormRoleEn] = useState(employee?.roleEn || '');
  const [formRoleRw, setFormRoleRw] = useState(employee?.roleRw || '');
  const [formRoleFr, setFormRoleFr] = useState(employee?.roleFr || '');
  const [formDepartmentEn, setFormDepartmentEn] = useState(employee?.departmentEn || '');
  const [formDepartmentRw, setFormDepartmentRw] = useState(employee?.departmentRw || '');
  const [formYear, setFormYear] = useState(employee?.year || new Date().getFullYear().toString());
  const [formMetric, setFormMetric] = useState(employee?.achievementMetric || '');
  const [formCitationEn, setFormCitationEn] = useState(employee?.citationEn || '');
  const [formCitationRw, setFormCitationRw] = useState(employee?.citationRw || '');
  const [formCitationFr, setFormCitationFr] = useState(employee?.citationFr || '');
  const [formImageUrl, setFormImageUrl] = useState(employee?.imageUrl || '');
  const [formActive, setFormActive] = useState(employee?.active ?? true);

  // Create form state
  const [newName, setNewName] = useState('');
  const [newRoleEn, setNewRoleEn] = useState('');
  const [newRoleRw, setNewRoleRw] = useState('');
  const [newRoleFr, setNewRoleFr] = useState('');
  const [newDepartmentEn, setNewDepartmentEn] = useState('');
  const [newDepartmentRw, setNewDepartmentRw] = useState('');
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString());
  const [newMetric, setNewMetric] = useState('');
  const [newCitationEn, setNewCitationEn] = useState('');
  const [newCitationRw, setNewCitationRw] = useState('');
  const [newCitationFr, setNewCitationFr] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  const openEditModal = () => {
    if (!employee) return;
    setFormName(employee.name);
    setFormRoleEn(employee.roleEn);
    setFormRoleRw(employee.roleRw || '');
    setFormRoleFr(employee.roleFr || '');
    setFormDepartmentEn(employee.departmentEn);
    setFormDepartmentRw(employee.departmentRw || '');
    setFormYear(employee.year);
    setFormMetric(employee.achievementMetric || '');
    setFormCitationEn(employee.citationEn);
    setFormCitationRw(employee.citationRw || '');
    setFormCitationFr(employee.citationFr || '');
    setFormImageUrl(employee.imageUrl);
    setFormActive(employee.active ?? true);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateEmployee) {
      onUpdateEmployee({
        name: formName,
        roleEn: formRoleEn,
        roleRw: formRoleRw || formRoleEn,
        roleFr: formRoleFr || formRoleEn,
        departmentEn: formDepartmentEn,
        departmentRw: formDepartmentRw || formDepartmentEn,
        year: formYear,
        achievementMetric: formMetric,
        citationEn: formCitationEn,
        citationRw: formCitationRw || formCitationEn,
        citationFr: formCitationFr || formCitationEn,
        imageUrl: formImageUrl,
        active: formActive,
      });
    }
    setIsEditModalOpen(false);
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const created: EmployeeOfTheYear = {
      id: `eoty-${Date.now()}`,
      name: newName.trim(),
      roleEn: newRoleEn.trim(),
      roleRw: newRoleRw.trim() || newRoleEn.trim(),
      roleFr: newRoleFr.trim() || newRoleEn.trim(),
      departmentEn: newDepartmentEn.trim(),
      departmentRw: newDepartmentRw.trim() || newDepartmentEn.trim(),
      year: newYear.trim() || new Date().getFullYear().toString(),
      achievementMetric: newMetric.trim(),
      citationEn: newCitationEn.trim(),
      citationRw: newCitationRw.trim() || newCitationEn.trim(),
      citationFr: newCitationFr.trim() || newCitationEn.trim(),
      imageUrl: newImageUrl.trim() || '/src/assets/images/farmers_cooperative_1791989969904.jpg',
      active: true,
    };

    if (onCreateEmployee) {
      onCreateEmployee(created);
    } else if (onUpdateEmployee) {
      onUpdateEmployee(created);
    }

    setIsCreateModalOpen(false);
    // Reset create fields
    setNewName('');
    setNewRoleEn('');
    setNewRoleRw('');
    setNewDepartmentEn('');
    setNewDepartmentRw('');
    setNewMetric('');
    setNewCitationEn('');
    setNewCitationRw('');
    setNewImageUrl('');
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, isCreate = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (isCreate) {
          setNewImageUrl(reader.result);
        } else {
          setFormImageUrl(reader.result);
          if (onUpdateEmployee) {
            onUpdateEmployee({ imageUrl: reader.result });
          }
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = () => {
    if (onDeleteEmployee) {
      onDeleteEmployee();
    } else if (onUpdateEmployee) {
      onUpdateEmployee({ active: false });
    }
    setIsDeleteConfirmOpen(false);
  };

  const toggleActiveStatus = () => {
    if (!employee || !onUpdateEmployee) return;
    onUpdateEmployee({ active: !employee.active });
  };

  function renderCreateModal() {
    if (!isCreateModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 text-white max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Trophy className="w-5 h-5" />
              <span>Add / Nominate Best Employee of the Year</span>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Employee Full Name *</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Mukandayisenga Chantal"
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-amber-400 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Role / Job Title (English) *</label>
                <input
                  type="text"
                  value={newRoleEn}
                  onChange={(e) => setNewRoleEn(e.target.value)}
                  placeholder="e.g. Senior Credit Officer"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Role (Kinyarwanda)</label>
                <input
                  type="text"
                  value={newRoleRw}
                  onChange={(e) => setNewRoleRw(e.target.value)}
                  placeholder="Umukozi Mukuru Ushinzwe..."
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Department & Branch (English) *</label>
                <input
                  type="text"
                  value={newDepartmentEn}
                  onChange={(e) => setNewDepartmentEn(e.target.value)}
                  placeholder="e.g. Credit Operations — Gakenke Branch"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Award Year *</label>
                <input
                  type="text"
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  placeholder="e.g. 2026"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Key Achievement Metric</label>
              <input
                type="text"
                value={newMetric}
                onChange={(e) => setNewMetric(e.target.value)}
                placeholder="e.g. 99.8% Recovery · 420+ Farmers Supported"
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Official Award Citation (English) *</label>
              <textarea
                rows={3}
                value={newCitationEn}
                onChange={(e) => setNewCitationEn(e.target.value)}
                placeholder="Describe the achievements and dedication of this employee..."
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-amber-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Citation (Kinyarwanda)</label>
              <textarea
                rows={3}
                value={newCitationRw}
                onChange={(e) => setNewCitationRw(e.target.value)}
                placeholder="Impamvu y'igihembo mu Kinyarwanda..."
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Photo Image URL or File Upload</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Image URL or upload below"
                  className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => newFileInputRef.current?.click()}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upload File</span>
                </button>
                <input
                  type="file"
                  ref={newFileInputRef}
                  accept="image/*"
                  onChange={(e) => handleImageFileChange(e, true)}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save & Showcase Awardee</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // If no employee exists or is deleted
  if (!employee) {
    if (!isAdmin) return null;
    return (
      <div className="py-8">
        <div className="p-8 rounded-3xl border-2 border-dashed border-amber-400/40 bg-amber-500/5 text-center max-w-xl mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600 mx-auto shadow-sm">
            <Trophy className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-slate-800 text-base">Best Employee of the Year</h4>
          <p className="text-xs text-slate-600">
            No employee of the year is currently showcased on the About Us page. As an administrator, you can add or nominate an awardee.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Best Employee of the Year</span>
          </button>
        </div>

        {/* Create Modal */}
        {renderCreateModal()}
      </div>
    );
  }

  // If not active and not admin, hide
  if (!employee.active && !isAdmin) {
    return null;
  }

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

  const cardContent = (
    <div className={`relative bg-gradient-to-br from-slate-800 via-slate-700 to-emerald-900 text-white rounded-3xl border-2 ${employee.active ? 'border-amber-500/60' : 'border-rose-500/60 opacity-80'} shadow-2xl overflow-hidden backdrop-blur-md hover:shadow-emerald-500/50 transition-all`}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={(e) => handleImageFileChange(e, false)}
        className="hidden"
      />

      {/* Top Imigongo Ribbon with Gold Tint */}
      <div className="absolute top-0 left-0 right-0">
        <ImigongoRibbon height={6} variant="light" bordered={false} />
      </div>

      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Admin Status Warning when Inactive */}
      {isAdmin && !employee.active && (
        <div className="bg-rose-950/90 text-rose-200 px-6 py-2 border-b border-rose-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-rose-400" />
            <span>Currently HIDDEN from public view. Only administrators see this card.</span>
          </div>
          <button
            type="button"
            onClick={toggleActiveStatus}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-extrabold cursor-pointer"
          >
            Publish Card
          </button>
        </div>
      )}

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
                {isAdmin && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${employee.active ? 'bg-emerald-500/30 text-emerald-300' : 'bg-rose-500/30 text-rose-300'}`}>
                    {employee.active ? 'Active' : 'Hidden'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300">UBUMWE SACCO GAKENKE · Staff Excellence Award</p>
            </div>
          </div>

          {/* Full Admin CRUD Controls */}
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={openEditModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-md"
                title="Edit Employee Information"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Awardee</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Change Photo"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>Change Photo</span>
              </button>

              <button
                type="button"
                onClick={toggleActiveStatus}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                title={employee.active ? 'Hide from public' : 'Publish to public'}
              >
                {employee.active ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Publish</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-md"
                title="Create or nominate a new awardee"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Awardee</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/50 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Delete this awardee"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete</span>
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

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Employee Full Name *</label>
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
                  <label className="block text-xs font-bold text-slate-300 mb-1">Role / Job Title (English) *</label>
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
                  <label className="block text-xs font-bold text-slate-300 mb-1">Department & Branch (English) *</label>
                  <input
                    type="text"
                    value={formDepartmentEn}
                    onChange={(e) => setFormDepartmentEn(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Award Year *</label>
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
                <label className="block text-xs font-bold text-slate-300 mb-1">Official Award Citation (English) *</label>
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
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload File</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded bg-slate-800 border-slate-700"
                />
                <label htmlFor="activeToggle" className="text-xs text-slate-300 font-bold cursor-pointer">
                  Showcase on public website (Active)
                </label>
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

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-rose-700/60 rounded-3xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 font-bold text-base">
              <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0" />
              <span>Remove Best Employee Awardee?</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-white">{employee.name}</span> as Best Employee of the Year? You can nominate a new awardee at any time.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {renderCreateModal()}
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

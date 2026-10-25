import React, { useState } from 'react';
import { Language, LeaderMember } from '../types';
import { Users, Plus, Edit2, Trash2, ShieldCheck, Phone, Check, X, Image as ImageIcon } from 'lucide-react';
import { ImigongoRibbon } from './ImigongoPattern';
import { ImageUploader } from './ImageUploader';

interface BoardAndManagersProps {
  currentLang: Language;
  leaders: LeaderMember[];
  isAdmin: boolean;
  onAddLeader: (leader: Omit<LeaderMember, 'id'>) => void;
  onUpdateLeader: (id: string, updated: Partial<LeaderMember>) => void;
  onDeleteLeader: (id: string) => void;
}

export const BoardAndManagers: React.FC<BoardAndManagersProps> = ({
  currentLang,
  leaders,
  isAdmin,
  onAddLeader,
  onUpdateLeader,
  onDeleteLeader,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'board' | 'manager'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeader, setEditingLeader] = useState<LeaderMember | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formRoleEn, setFormRoleEn] = useState('');
  const [formRoleRw, setFormRoleRw] = useState('');
  const [formCategory, setFormCategory] = useState<string>('board');
  const [formQualEn, setFormQualEn] = useState('');
  const [formQualRw, setFormQualRw] = useState('');
  const [formImage, setFormImage] = useState('/src/assets/images/portrait_board_chairman_1791991946417.jpg');
  const [formPhone, setFormPhone] = useState('0786422080');

  const filteredLeaders = leaders.filter((l) => {
    if (filterCategory === 'all') return true;
    return l.category === filterCategory;
  });

  const openAddModal = () => {
    setEditingLeader(null);
    setFormName('');
    setFormRoleEn('');
    setFormRoleRw('');
    setFormCategory('board');
    setFormQualEn('');
    setFormQualRw('');
    setFormImage('/src/assets/images/portrait_board_chairman_1791991946417.jpg');
    setFormPhone('0786422080');
    setIsModalOpen(true);
  };

  const openEditModal = (leader: LeaderMember) => {
    setEditingLeader(leader);
    setFormName(leader.name);
    setFormRoleEn(leader.roleEn);
    setFormRoleRw(leader.roleRw);
    setFormCategory(leader.category);
    setFormQualEn(leader.qualificationEn);
    setFormQualRw(leader.qualificationRw);
    setFormImage(leader.imageUrl);
    setFormPhone(leader.phone || '0786422080');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formRoleEn) return;

    if (editingLeader) {
      onUpdateLeader(editingLeader.id, {
        name: formName,
        roleEn: formRoleEn,
        roleRw: formRoleRw || formRoleEn,
        category: formCategory,
        qualificationEn: formQualEn,
        qualificationRw: formQualRw || formQualEn,
        imageUrl: formImage,
        phone: formPhone,
      });
    } else {
      onAddLeader({
        name: formName,
        roleEn: formRoleEn,
        roleRw: formRoleRw || formRoleEn,
        category: formCategory,
        qualificationEn: formQualEn,
        qualificationRw: formQualRw || formQualEn,
        imageUrl: formImage,
        phone: formPhone,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <section id="leadership" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 tracking-wider uppercase mb-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>
                {currentLang === 'fr'
                  ? 'Leadership & Administration Coopérative'
                  : currentLang === 'rw'
                  ? "Ubuyobozi n'Imicungire ya Koperative"
                  : 'Cooperative Leadership & Administration'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight" style={{ textWrap: 'balance' }}>
              {currentLang === 'fr'
                ? 'Conseil & Direction · UBUMWE SACCO GAKENKE'
                : currentLang === 'rw'
                ? "Abayobozi n'Abakozi · UBUMWE SACCO GAKENKE"
                : 'Board & Staff · UBUMWE SACCO GAKENKE'}
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-3xl">
              {currentLang === 'fr'
                ? 'Rencontrez les dirigeants financiers expérimentés et administrateurs guidant UBUMWE SACCO GAKENKE conformément aux normes de la RCA.'
                : currentLang === 'rw'
                ? "Menya abagize Inama y'Ubutegetsi n'abayobozi b'imirimo ya buri munsi bayobora Ubumwe SACCO Gakenke mu mucyo n'ubunyangamugayo."
                : 'Meet the seasoned financial leaders and administrators guiding UBUMWE SACCO GAKENKE in full compliance with cooperative laws and RCA standards.'}
            </p>
          </div>

          {/* Admin Create Action & Category Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setFilterCategory('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  filterCategory === 'all' ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {currentLang === 'fr'
                  ? `Tous (${leaders.length})`
                  : currentLang === 'rw'
                  ? `Bose (${leaders.length})`
                  : `All (${leaders.length})`}
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('board')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  filterCategory === 'board' ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {currentLang === 'fr'
                  ? "Conseil d'Administration"
                  : currentLang === 'rw'
                  ? "Inama y'Ubutegetsi"
                  : 'Board of Directors'}
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('manager')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  filterCategory === 'manager' ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {currentLang === 'fr'
                  ? 'Équipe de Direction'
                  : currentLang === 'rw'
                  ? "Abayobozi b'Imirimo"
                  : 'Management Team'}
              </button>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={openAddModal}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {currentLang === 'fr'
                    ? 'Ajouter un Dirigeant'
                    : currentLang === 'rw'
                    ? 'Ongeraho Umuyobozi'
                    : 'Add Leader / Manager'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Leaders Grid with Photos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {filteredLeaders.map((leader) => {
            const roleText =
              currentLang === 'fr'
                ? leader.roleFr || leader.roleEn
                : currentLang === 'rw'
                ? leader.roleRw || leader.roleEn
                : leader.roleEn;
            const qualText =
              currentLang === 'fr'
                ? leader.qualificationFr || leader.qualificationEn
                : currentLang === 'rw'
                ? leader.qualificationRw || leader.qualificationEn
                : leader.qualificationEn;
            const categoryBadge =
              leader.category === 'board'
                ? currentLang === 'fr'
                  ? "Conseil d'Administration"
                  : currentLang === 'rw'
                  ? "Inama y'Ubutegetsi"
                  : 'Board of Directors'
                : currentLang === 'fr'
                ? 'Direction Exécutive'
                : currentLang === 'rw'
                ? "Ubuyobozi b'Imirimo"
                : 'Executive Management';

            return (
              <div
                key={leader.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative"
              >
                {/* Subtle top Imigongo accent */}
                <div className="absolute top-0 left-0 right-0 z-10">
                  <ImigongoRibbon height={6} variant="light" bordered={false} />
                </div>

                <div>
                  {/* Photo Container */}
                  <div className="aspect-square w-full overflow-hidden relative bg-slate-100">
                    <img
                      src={leader.imageUrl}
                      alt={leader.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />

                    {/* Category Tag (unboxed clean tag) */}
                    <div className="absolute bottom-2 left-2 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700">
                      {categoryBadge}
                    </div>

                    {/* Admin Action Buttons on Photo */}
                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-lg border border-slate-700 z-20">
                        <button
                          type="button"
                          onClick={() => openEditModal(leader)}
                          className="p-1 text-slate-300 hover:text-emerald-400 transition-colors"
                          title="Edit leader details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteLeader(leader.id);
                          }}
                          className="p-1 text-slate-300 hover:text-red-400 transition-colors"
                          title="Delete leader"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Leader Info */}
                  <div className="p-5 space-y-2">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {leader.name}
                    </h3>
                    <div className="text-xs font-bold text-emerald-800">
                      {roleText}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed pt-1">
                      {qualText}
                    </p>
                  </div>
                </div>

                {/* Footer details with phone */}
                <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono-numbers">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{leader.phone || '0786422080'}</span>
                  </span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span></span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CRUD Modal for Add / Edit Leader */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl border border-slate-200 my-8 overflow-hidden">
            <div className="absolute top-0 left-0 right-0">
              <ImigongoRibbon height={8} variant="light" bordered={false} />
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 pt-2">
              {editingLeader ? 'Edit Leader / Manager Details' : 'Add New Board Member or Manager'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Admin CRUD operation: updates will be saved and visible on the website immediately.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. Dr. Alexis Hakizimana"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Role (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formRoleEn}
                    onChange={(e) => setFormRoleEn(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. Board Chairman"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Role (Kinyarwanda)
                  </label>
                  <input
                    type="text"
                    value={formRoleRw}
                    onChange={(e) => setFormRoleRw(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. Perezida w'Inama y'Ubutegetsi"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Leadership Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="board">Board of Directors</option>
                    <option value="manager">Executive Management</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono-numbers focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="0786422080"
                  />
                </div>
              </div>

              <ImageUploader
                value={formImage}
                onChange={(newUrl) => setFormImage(newUrl)}
                label="Portrait Photo (Upload from Device or URL)"
                aspectRatio="square"
                presets={[
                  { label: 'Wellarse (Board Director)', url: '/src/assets/images/portrait_director_wellars_1791994899049.jpg' },
                  { label: 'Mbitsemunda Phocas (Manager)', url: '/src/assets/images/portrait_manager_phocas_1791994898549.jpg' },
                  { label: 'Bartazal (Board Director)', url: '/src/assets/images/portrait_bartazal_1792051299586.jpg' },
                  { label: 'Credit Head', url: '/src/assets/images/portrait_credit_director_1791991947701.jpg' },
                  { label: 'Supervisory Chair', url: '/src/assets/images/portrait_supervisory_chair_1791991947113.jpg' },
                ]}
                helpText="Upload a clear portrait photo directly from your computer or phone."
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Qualifications &amp; Experience (English)
                </label>
                <textarea
                  rows={2}
                  value={formQualEn}
                  onChange={(e) => setFormQualEn(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. Cooperative Governance Specialist (14+ yrs banking & rural finance)"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingLeader ? 'Save Changes' : 'Create Leader'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Imigongo skeleton ribbon connecting to branches */}
      <div className="mt-16">
        <ImigongoRibbon height={16} variant="light" bordered={true} />
      </div>
    </section>
  );
};

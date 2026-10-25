import React, { useState, useEffect, useCallback } from 'react';
import {
  Archive,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  Save,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Package,
  Database,
  X,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Shield,
  HardDrive,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
export interface ArchivedItem {
  id: string;
  archiveId: string;
  collection: string;
  label: string;
  data: Record<string, unknown>;
  archivedAt: string;
  reason?: string;
}

export interface SiteSnapshot {
  snapshotId: string;
  label: string;
  createdAt: string;
  data: Record<string, unknown>;
  sizeBytes: number;
}

// ─────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────
const ARCHIVE_KEY = 'ubumwe_archive_items';
const SNAPSHOTS_KEY = 'ubumwe_archive_snapshots';

const SITE_DATA_KEYS = [
  'ubumwe_sacco_info',
  'ubumwe_nav_items',
  'ubumwe_system_images',
  'ubumwe_products',
  'ubumwe_announcements',
  'ubumwe_applications',
  'ubumwe_moments',
  'ubumwe_leaders',
  'ubumwe_branches',
  'ubumwe_job_postings',
  'ubumwe_job_applications',
  'ubumwe_community_stories',
  'ubumwe_home_videos',
  'ubumwe_hero_content',
  'ubumwe_home_metrics',
  'ubumwe_about_content',
  'ubumwe_partners',
  'ubumwe_social_links',
  'ubumwe_contact_inquiries',
  'ubumwe_manager_messages',
  'ubumwe_employment_types',
  'ubumwe_qualifications',
  'ubumwe_theme',
];

const COLLECTION_LABELS: Record<string, string> = {
  products: '📦 Products',
  announcements: '📢 Announcements',
  moments: '📷 Moments',
  leaders: '👥 Leaders',
  branches: '🏢 Branches',
  job_postings: '💼 Job Vacancies',
  job_applications: '📋 Job Applications',
  applications: '📝 KYC / Loans',
  community_stories: '💚 Impact Stories',
  home_videos: '🎬 Videos',
  home_metrics: '📊 Metrics',
  about_values: '✨ About Values',
  partners: '🤝 Partners',
  social_links: '🌐 Social Links',
  contact_inquiries: '📩 Inquiries',
  manager_messages: '💬 Messages',
  employment_types: '📄 Employment Types',
  qualifications: '🎓 Qualifications',
  nav_items: '🧭 Navigation',
};

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
function loadArchive(): ArchivedItem[] {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveArchive(items: ArchivedItem[]): void {
  try { localStorage.setItem(ARCHIVE_KEY, JSON.stringify(items)); } catch { /* noop */ }
}
function loadSnapshots(): SiteSnapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveSnapshots(snaps: SiteSnapshot[]): void {
  try { localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snaps)); } catch { /* noop */ }
}
function captureSnapshot(label: string): SiteSnapshot {
  const data: Record<string, unknown> = {};
  SITE_DATA_KEYS.forEach((key) => {
    const val = localStorage.getItem(key);
    if (val !== null) {
      try { data[key] = JSON.parse(val); } catch { data[key] = val; }
    }
  });
  const json = JSON.stringify(data);
  return {
    snapshotId: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    label,
    createdAt: new Date().toISOString(),
    data,
    sizeBytes: new Blob([json]).size,
  };
}
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─────────────────────────────────────────────────────────────────
// Public helper — call this BEFORE deleting any item
// ─────────────────────────────────────────────────────────────────
export function archiveItem(
  collection: string,
  item: Record<string, unknown>,
  label: string,
  reason?: string
): void {
  const existing = loadArchive();
  const entry: ArchivedItem = {
    id: String(item.id ?? `item_${Date.now()}`),
    archiveId: `arc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    collection,
    label,
    data: item,
    archivedAt: new Date().toISOString(),
    reason,
  };
  saveArchive([entry, ...existing]);
}

// ─────────────────────────────────────────────────────────────────
// AdminArchive Component
// ─────────────────────────────────────────────────────────────────
interface AdminArchiveProps {
  onRestore?: (collection: string, data: Record<string, unknown>) => void;
  onSnapshotRestored?: () => void;
}

export const AdminArchive: React.FC<AdminArchiveProps> = ({
  onRestore,
  onSnapshotRestored,
}) => {
  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>([]);
  const [snapshots, setSnapshots] = useState<SiteSnapshot[]>([]);
  const [activeSection, setActiveSection] = useState<'archive' | 'snapshots' | 'backup'>('archive');
  const [collectionFilter, setCollectionFilter] = useState<string>('all');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [confirmSnapshotRestore, setConfirmSnapshotRestore] = useState<string | null>(null);
  const [expandedSnapshot, setExpandedSnapshot] = useState<string | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    setArchivedItems(loadArchive());
    setSnapshots(loadSnapshots());
  }, []);

  const collections = ['all', ...Array.from(new Set(archivedItems.map((i) => i.collection)))];
  const filtered = collectionFilter === 'all'
    ? archivedItems
    : archivedItems.filter((i) => i.collection === collectionFilter);

  // ── Archive actions ───────────────────────────────────────────
  const handleRestore = (item: ArchivedItem) => {
    if (onRestore) onRestore(item.collection, item.data);
    const updated = archivedItems.filter((i) => i.archiveId !== item.archiveId);
    setArchivedItems(updated);
    saveArchive(updated);
    setConfirmRestore(null);
    showToast(`✅ "${item.label}" restored!`, 'success');
  };

  const handlePermanentDelete = (archiveId: string) => {
    const updated = archivedItems.filter((i) => i.archiveId !== archiveId);
    setArchivedItems(updated);
    saveArchive(updated);
    setConfirmDelete(null);
    showToast('🗑️ Permanently deleted from archive.', 'info');
  };

  const handleClearArchive = () => {
    setArchivedItems([]);
    saveArchive([]);
    setConfirmWipe(false);
    showToast('Archive cleared.', 'info');
  };

  // ── Snapshot actions ──────────────────────────────────────────
  const handleCreateSnapshot = () => {
    const label = snapshotLabel.trim() || `Snapshot – ${new Date().toLocaleString()}`;
    const snap = captureSnapshot(label);
    const updated = [snap, ...snapshots];
    setSnapshots(updated);
    saveSnapshots(updated);
    setSnapshotLabel('');
    showToast(`📸 "${label}" saved (${formatBytes(snap.sizeBytes)})`, 'success');
  };

  const handleDeleteSnapshot = (snapshotId: string) => {
    const updated = snapshots.filter((s) => s.snapshotId !== snapshotId);
    setSnapshots(updated);
    saveSnapshots(updated);
    showToast('Snapshot deleted.', 'info');
  };

  const handleRestoreSnapshot = (snap: SiteSnapshot) => {
    try {
      Object.entries(snap.data).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
      setConfirmSnapshotRestore(null);
      showToast(`✅ Snapshot "${snap.label}" restored! Reloading…`, 'success');
      setTimeout(() => {
        if (onSnapshotRestored) onSnapshotRestored();
        else window.location.reload();
      }, 1500);
    } catch {
      showToast('❌ Failed to restore snapshot.', 'error');
    }
  };

  // ── Backup export / import ────────────────────────────────────
  const handleExportBackup = () => {
    const snap = captureSnapshot(`Manual Backup – ${new Date().toLocaleString()}`);
    const blob = new Blob([JSON.stringify(snap, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ubumwe_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`📥 Backup downloaded (${formatBytes(snap.sizeBytes)})`, 'success');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed: Partial<SiteSnapshot> = JSON.parse(ev.target?.result as string);
        if (!parsed.data || typeof parsed.data !== 'object') throw new Error('Invalid');
        const snap: SiteSnapshot = {
          snapshotId: `imported_${Date.now()}`,
          label: `[Imported] ${parsed.label || file.name}`,
          createdAt: new Date().toISOString(),
          data: parsed.data as Record<string, unknown>,
          sizeBytes: file.size,
        };
        const updated = [snap, ...snapshots];
        setSnapshots(updated);
        saveSnapshots(updated);
        setActiveSection('snapshots');
        showToast('📤 Backup imported as snapshot. Review & restore when ready.', 'success');
      } catch {
        showToast('❌ Invalid backup file. Must be a UBUMWE backup JSON.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 animate-in fade-in relative">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold animate-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-emerald-700 text-white' :
          toast.type === 'error' ? 'bg-red-700 text-white' :
          'bg-slate-800 text-white'
        }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
          {toast.type === 'error' && <AlertTriangle className="w-4 h-4" />}
          {toast.type === 'info' && <Database className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl border border-slate-700/60 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Archive className="w-5 h-5 text-indigo-400" />
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Admin Archive & Backup Center
              </span>
            </div>
            <h3 className="text-lg font-extrabold">Data Protection & Recovery</h3>
            <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
              No data is lost permanently. Deleted items go here first and can be restored anytime. Create snapshots and full backups to safeguard your site.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900/60 rounded-xl border border-indigo-700/40 text-xs text-indigo-200">
              <Archive className="w-3.5 h-3.5" />
              {archivedItems.length} archived items
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/60 rounded-xl border border-slate-600/40 text-xs text-slate-200">
              <Database className="w-3.5 h-3.5" />
              {snapshots.length} snapshots
            </div>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
        {(['archive', 'snapshots', 'backup'] as const).map((sec) => (
          <button
            key={sec}
            type="button"
            onClick={() => setActiveSection(sec)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === sec ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {sec === 'archive' && <Archive className="w-3.5 h-3.5" />}
            {sec === 'snapshots' && <Database className="w-3.5 h-3.5" />}
            {sec === 'backup' && <HardDrive className="w-3.5 h-3.5" />}
            {sec === 'archive' && `Deleted Items (${archivedItems.length})`}
            {sec === 'snapshots' && `Snapshots (${snapshots.length})`}
            {sec === 'backup' && 'Backup / Restore'}
          </button>
        ))}
      </div>

      {/* ════════════ ARCHIVE ════════════ */}
      {activeSection === 'archive' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Filter by type:</span>
              {collections.map((col) => (
                <button key={col} type="button"
                  onClick={() => setCollectionFilter(col)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    collectionFilter === col ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {col === 'all' ? `All (${archivedItems.length})` : (COLLECTION_LABELS[col] || col)}
                </button>
              ))}
            </div>
            {archivedItems.length > 0 && (
              <button type="button" onClick={() => setConfirmWipe(true)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" /> Clear All Archive
              </button>
            )}
          </div>

          {confirmWipe && (
            <div className="p-4 bg-red-50 border border-red-300 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-red-800">Permanently delete all {archivedItems.length} archived items?</p>
                <p className="text-xs text-red-600 mt-0.5">This action cannot be undone. Create a snapshot first to be safe.</p>
                <div className="flex gap-2 mt-3">
                  <button type="button" onClick={handleClearArchive} className="px-4 py-1.5 bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer">Yes, Clear All</button>
                  <button type="button" onClick={() => setConfirmWipe(false)} className="px-4 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <Archive className="w-8 h-8 text-indigo-300" />
              </div>
              <h4 className="text-sm font-bold text-slate-600">Archive is empty</h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                When items are deleted in the admin panel, they'll appear here so you can restore them anytime.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((item) => (
                <div key={item.archiveId} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 p-3.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-800 truncate">{item.label}</span>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full border border-indigo-200">
                          {COLLECTION_LABELS[item.collection] || item.collection}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" />{timeAgo(item.archivedAt)}
                        </span>
                        {item.reason && <span className="text-[11px] text-amber-600 italic">"{item.reason}"</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button type="button"
                        onClick={() => setExpandedItem(expandedItem === item.archiveId ? null : item.archiveId)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer" title="View data">
                        {expandedItem === item.archiveId ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>

                      {confirmRestore === item.archiveId ? (
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => handleRestore(item)} className="px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-lg cursor-pointer">Confirm</button>
                          <button type="button" onClick={() => setConfirmRestore(null)} className="px-2 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-lg cursor-pointer">Cancel</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setConfirmRestore(item.archiveId)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1">
                          <RotateCcw className="w-3.5 h-3.5" /> Restore
                        </button>
                      )}

                      {confirmDelete === item.archiveId ? (
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => handlePermanentDelete(item.archiveId)} className="px-2.5 py-1 bg-red-600 text-white text-[11px] font-bold rounded-lg cursor-pointer">Delete Forever</button>
                          <button type="button" onClick={() => setConfirmDelete(null)} className="px-2 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-lg cursor-pointer">Cancel</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setConfirmDelete(item.archiveId)}
                          className="p-1.5 text-slate-300 hover:text-red-500 transition-colors cursor-pointer" title="Delete permanently">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {expandedItem === item.archiveId && (
                    <div className="border-t border-slate-100 bg-slate-50 p-3">
                      <pre className="text-[10px] text-slate-500 overflow-auto max-h-48 whitespace-pre-wrap">{JSON.stringify(item.data, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════ SNAPSHOTS ════════════ */}
      {activeSection === 'snapshots' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Save className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Create New Snapshot</span>
            </div>
            <p className="text-[11px] text-indigo-600 mb-3">
              A snapshot captures the full current state of your site. Create one before major changes.
            </p>
            <div className="flex gap-2">
              <input
                type="text" value={snapshotLabel}
                onChange={(e) => setSnapshotLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateSnapshot()}
                placeholder={`e.g. Before bulk edit – ${new Date().toLocaleDateString()}`}
                className="flex-1 px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
              <button type="button" onClick={handleCreateSnapshot}
                className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" /> Save Snapshot
              </button>
            </div>
          </div>

          {snapshots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                <Database className="w-7 h-7 text-blue-300" />
              </div>
              <h4 className="text-sm font-bold text-slate-600">No snapshots yet</h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1">Create your first snapshot above before making big changes.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {snapshots.map((snap) => (
                <div key={snap.snapshotId} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <Database className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-800 truncate">{snap.label}</span>
                        {snap.snapshotId.startsWith('imported_') && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200">Imported</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" />{timeAgo(snap.createdAt)} · {new Date(snap.createdAt).toLocaleString()}
                        </span>
                        <span className="text-[11px] text-slate-400">{formatBytes(snap.sizeBytes)} · {Object.keys(snap.data).length} keys</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button type="button"
                        onClick={() => setExpandedSnapshot(expandedSnapshot === snap.snapshotId ? null : snap.snapshotId)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer">
                        {expandedSnapshot === snap.snapshotId ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      {confirmSnapshotRestore === snap.snapshotId ? (
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => handleRestoreSnapshot(snap)} className="px-2.5 py-1 bg-blue-600 text-white text-[11px] font-bold rounded-lg cursor-pointer">✅ Restore Now</button>
                          <button type="button" onClick={() => setConfirmSnapshotRestore(null)} className="px-2 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-lg cursor-pointer">Cancel</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setConfirmSnapshotRestore(snap.snapshotId)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1">
                          <RefreshCw className="w-3.5 h-3.5" /> Restore
                        </button>
                      )}
                      <button type="button" onClick={() => handleDeleteSnapshot(snap.snapshotId)}
                        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors cursor-pointer" title="Delete snapshot">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {expandedSnapshot === snap.snapshotId && (
                    <div className="border-t border-slate-100 bg-slate-50 p-3">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {Object.keys(snap.data).map((key) => (
                          <span key={key} className="px-2 py-0.5 bg-white text-slate-600 text-[10px] font-mono rounded-lg border border-slate-200">{key.replace('ubumwe_', '')}</span>
                        ))}
                      </div>
                      <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-1.5">
                        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                        Restoring will overwrite ALL current site data with this snapshot's data and reload the page.
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════ BACKUP / RESTORE ════════════ */}
      {activeSection === 'backup' && (
        <div className="space-y-4">
          <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                <Download className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-emerald-900">Export Full Backup</h4>
                <p className="text-xs text-emerald-700 mt-0.5 mb-3">
                  Downloads a complete JSON backup of all site data to your device. Store it in email, cloud drive, or USB for safekeeping.
                </p>
                <button type="button" onClick={handleExportBackup}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-2 shadow-md">
                  <Download className="w-4 h-4" /> Download Backup File (.json)
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5 text-blue-700" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-blue-900">Import Backup File</h4>
                <p className="text-xs text-blue-700 mt-0.5 mb-3">
                  Upload a previously downloaded backup. It will appear as a snapshot in the Snapshots tab so you can review it before restoring.
                </p>
                <label className="cursor-pointer px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md w-fit">
                  <Upload className="w-4 h-4" /> Select Backup File (.json)
                  <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Backup coverage — site data keys</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {SITE_DATA_KEYS.map((key) => {
                const exists = localStorage.getItem(key) !== null;
                return (
                  <div key={key} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono ${
                    exists ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    {exists ? <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" /> : <X className="w-3 h-3 shrink-0" />}
                    <span className="truncate">{key.replace('ubumwe_', '')}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-[11px] text-amber-800 space-y-0.5">
              <p className="font-bold">Best Practices</p>
              <p>• Export a backup before any major changes (bulk deletes, product restructuring).</p>
              <p>• Store backups in a safe location: email, Google Drive, USB, etc.</p>
              <p>• Create named snapshots regularly for point-in-time recovery.</p>
              <p>• Restoring a snapshot overwrites ALL current data — always review first.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminArchive;

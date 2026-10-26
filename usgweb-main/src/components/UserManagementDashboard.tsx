import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Users,
  UserCheck,
  UserPlus,
  Shield,
  KeyRound,
  Lock,
  Unlock,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  X,
  Phone,
  Mail,
  Building,
  Calendar,
  Clock,
  ShieldAlert,
  Activity,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { usersApi, auditApi, SystemUser } from '../services/api';

interface UserManagementDashboardProps {
  currentUserId?: string;
  currentUserRole?: string;
}

const ROLE_BADGE_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; desc: string }
> = {
  ADMIN_IT: {
    label: 'IT Super Admin',
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    desc: 'Complete system oversight, user management, and security configurations.',
  },
  admin: {
    label: 'IT Super Admin (Legacy)',
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    desc: 'Complete administrative access.',
  },
  ADMIN: {
    label: 'Media Admin',
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    desc: 'Gallery moments, bulletins, news publications, and public media content.',
  },
  ADMIN_HR: {
    label: 'HR Administrator',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
    desc: 'Job applicants review, hiring pipeline, candidate feedback, and recruitment.',
  },
  DAF: {
    label: 'Finance Director (DAF)',
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-300',
    desc: 'Financial products, loan applications, vacancies oversight, and institutional metrics.',
  },
  MD: {
    label: 'Managing Director (MD)',
    bg: 'bg-rose-100',
    text: 'text-rose-800',
    border: 'border-rose-300',
    desc: 'Executive board reports, institutional messages, and comprehensive governance oversight.',
  },
};

const ROLE_PERMISSIONS_PREVIEW: Record<string, string[]> = {
  ADMIN_IT: [
    'System Configuration & Security',
    'User Accounts & Credential Issuance',
    'Role & Permission Assignment',
    'Audit Trail & System Logs Access',
    'All Department Modules & Content',
  ],
  admin: [
    'Full Administrative Access',
    'User Management & System Access',
  ],
  ADMIN: [
    'Gallery Moments Creation & Publishing',
    'Bulletins & Press Releases',
    'Impact Stories Management',
    'Attraction Videos Management',
    'Media Content Reports',
  ],
  ADMIN_HR: [
    'Job Applications Pipeline & Review',
    'Applicant Status Management',
    'Interview & Hiring Feedback',
    'Candidate Messaging',
    'Recruitment Reports & Analytics',
  ],
  DAF: [
    'Financial Savings & Loan Products',
    'KYC & Loan Applications Review',
    'Career Vacancies Management',
    'Finance & Operational Reports',
  ],
  MD: [
    'Executive Management Messages',
    'Board & Governance Information',
    'Cross-Department Read-Only Oversight',
    'Audit & Compliance Review',
    'Institutional Analytics',
  ],
};

export const UserManagementDashboard: React.FC<UserManagementDashboardProps> = ({
  currentUserId,
  currentUserRole = 'ADMIN_IT',
}) => {
  // Navigation sub-tabs: 'users' or 'audit'
  const [subTab, setSubTab] = useState<'users' | 'audit'>('users');

  // User list state
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isStatusConfirmModalOpen, setIsStatusConfirmModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);

  // Selected user for actions
  const [activeUser, setActiveUser] = useState<SystemUser | null>(null);

  // Form states for Create User
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Operations',
    role: 'ADMIN',
    password: '',
    autoGeneratePassword: true,
    passwordChangeRequired: true,
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createFormError, setCreateFormError] = useState<string | null>(null);

  // Newly created credentials modal
  const [newCredentials, setNewCredentials] = useState<{
    email: string;
    temporaryPassword: string;
    name: string;
    role: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Visible password toggles for staff accounts (ADMIN_IT feature)
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [fetchedPasswords, setFetchedPasswords] = useState<Record<string, string>>({});
  const [viewModalPasswordRevealed, setViewModalPasswordRevealed] = useState(false);

  // Form state for Edit User
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: '',
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editFormError, setEditFormError] = useState<string | null>(null);

  // Password reset state
  const [resetPasswordForm, setResetPasswordForm] = useState({
    customPassword: '',
    autoGenerate: true,
  });
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetResult, setResetResult] = useState<string | null>(null);

  // Status toggle state
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);

  // Clear toast notifications after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch Users from Backend MongoDB API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page,
        limit,
        search: searchTerm,
      };
      if (selectedRole !== 'ALL') {
        params.role = selectedRole;
      }
      if (selectedStatus === 'ACTIVE') {
        params.isActive = true;
      } else if (selectedStatus === 'INACTIVE') {
        params.isActive = false;
      }

      const res = await usersApi.list(params);
      if (res.success && res.data) {
        setUsers(res.data.users);
        setTotalPages(res.data.pagination.pages || 1);
        setTotalCount(res.data.pagination.total || 0);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load system users from server');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, selectedRole, selectedStatus]);

  // Fetch Audit Logs from Backend MongoDB API
  const fetchAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    try {
      const res = await auditApi.list({ page: auditPage, limit: 15 });
      if (res.success && res.data) {
        setAuditLogs(res.data.logs || []);
        setAuditTotalPages(res.data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  }, [auditPage]);

  useEffect(() => {
    if (subTab === 'users') {
      fetchUsers();
    } else {
      fetchAuditLogs();
    }
  }, [subTab, fetchUsers, fetchAuditLogs]);

  // Metrics summary
  const metrics = useMemo(() => {
    const total = totalCount;
    const active = users.filter((u) => u.isActive).length;
    const inactive = users.filter((u) => !u.isActive).length;
    const itAdmins = users.filter((u) => u.role === 'ADMIN_IT' || u.role === 'admin').length;
    const mediaAdmins = users.filter((u) => u.role === 'ADMIN').length;
    const hrAdmins = users.filter((u) => u.role === 'ADMIN_HR').length;
    const daf = users.filter((u) => u.role === 'DAF').length;
    const md = users.filter((u) => u.role === 'MD').length;
    return { total, active, inactive, itAdmins, mediaAdmins, hrAdmins, daf, md };
  }, [users, totalCount]);

  // Handle Create User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateFormError(null);
    setCreateSubmitting(true);

    try {
      const payload: any = {
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim(),
        department: createForm.department.trim(),
        role: createForm.role,
        passwordChangeRequired: createForm.passwordChangeRequired,
      };

      if (!createForm.autoGeneratePassword && createForm.password.trim()) {
        payload.password = createForm.password.trim();
      }

      const res = await usersApi.create(payload);
      if (res.success && res.data) {
        setIsCreateModalOpen(false);
        setSuccessMessage(`Account for ${res.data.user.name} created successfully.`);

        const issuedPassword =
          res.temporaryPassword || payload.password || res.data.user.currentPassword || 'Ubumwe@2026!';

        setNewCredentials({
          email: res.data.user.email,
          temporaryPassword: issuedPassword,
          name: res.data.user.name,
          role: res.data.user.role,
        });

        // Prepend new user with password to local state immediately
        setUsers((prev) => [
          {
            ...res.data.user,
            currentPassword: issuedPassword,
          },
          ...prev.filter((u) => u.id !== res.data.user.id),
        ]);
        setTotalCount((prev) => prev + 1);

        // Reset form
        setCreateForm({
          name: '',
          email: '',
          phone: '',
          department: 'Information Technology',
          role: 'ADMIN',
          password: '',
          autoGeneratePassword: true,
          passwordChangeRequired: true,
        });

        fetchUsers();
      }
    } catch (err: any) {
      setCreateFormError(err?.message || 'Failed to create user account');
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (user: SystemUser) => {
    setActiveUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      department: user.department || '',
      role: user.role,
    });
    setEditFormError(null);
    setIsEditModalOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;
    setEditFormError(null);
    setEditSubmitting(true);

    try {
      const res = await usersApi.update(activeUser.id, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        department: editForm.department.trim(),
        role: editForm.role,
      });

      if (res.success) {
        setIsEditModalOpen(false);
        setSuccessMessage(`Account for ${editForm.name} updated successfully.`);
        fetchUsers();
      }
    } catch (err: any) {
      setEditFormError(err?.message || 'Failed to update user profile');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Handle Status Toggle (Activate / Deactivate)
  const handleStatusToggle = async () => {
    if (!activeUser) return;
    setStatusSubmitting(true);

    try {
      const newStatus = !activeUser.isActive;
      const res = await usersApi.updateStatus(activeUser.id, newStatus);
      if (res.success) {
        setIsStatusConfirmModalOpen(false);
        setSuccessMessage(
          `User ${activeUser.name} has been ${newStatus ? 'activated' : 'deactivated'}.`
        );
        fetchUsers();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to update account status');
    } finally {
      setStatusSubmitting(false);
    }
  };

  // Handle Password Reset
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;
    setResetSubmitting(true);

    try {
      const newPass = resetPasswordForm.autoGenerate
        ? undefined
        : resetPasswordForm.customPassword.trim();
      const res = await usersApi.resetPassword(activeUser.id, newPass);

      if (res.success) {
        setResetResult(res.temporaryPassword);
        setSuccessMessage(`Password reset successfully for ${activeUser.email}`);
        fetchUsers();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to reset password');
    } finally {
      setResetSubmitting(false);
    }
  };

  // Handle Delete User
  const handleDeleteSubmit = async () => {
    if (!activeUser) return;
    setDeleteSubmitting(true);

    try {
      const res = await usersApi.delete(activeUser.id);
      if (res.success) {
        setIsDeleteConfirmModalOpen(false);
        setSuccessMessage(`Account ${activeUser.name} (${activeUser.email}) removed.`);
        fetchUsers();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to delete account');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, key = 'credentials') => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const toggleRevealPassword = async (user: SystemUser) => {
    const isCurrentlyRevealed = Boolean(revealedPasswords[user.id]);
    if (!isCurrentlyRevealed && !user.currentPassword && !fetchedPasswords[user.id]) {
      try {
        const res = await usersApi.getPassword(user.id);
        if (res.success && res.data?.currentPassword) {
          setFetchedPasswords((prev) => ({ ...prev, [user.id]: res.data.currentPassword }));
        }
      } catch (err) {
        console.warn('Failed to retrieve staff password:', err);
      }
    }
    setRevealedPasswords((prev) => ({ ...prev, [user.id]: !isCurrentlyRevealed }));
  };

  const toggleViewModalPassword = async (user: SystemUser) => {
    if (!viewModalPasswordRevealed && !user.currentPassword && !fetchedPasswords[user.id]) {
      try {
        const res = await usersApi.getPassword(user.id);
        if (res.success && res.data?.currentPassword) {
          setFetchedPasswords((prev) => ({ ...prev, [user.id]: res.data.currentPassword }));
        }
      } catch (err) {
        console.warn('Failed to retrieve staff password:', err);
      }
    }
    setViewModalPasswordRevealed(!viewModalPasswordRevealed);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              IT Security &amp; Access Control
            </span>
            <span className="text-xs text-slate-400">Database: MongoDB (Live)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Staff &amp; User Accounts Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Create user accounts, assign role permissions, reset credentials, and control portal access.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (subTab === 'users') fetchUsers();
              else fetchAuditLogs();
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh records from MongoDB"
          >
            <RefreshCw className={`w-4 h-4 ${loading || auditLoading ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCreateFormError(null);
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Notification Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-700 hover:text-rose-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Staff
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{metrics.total}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">MongoDB accounts</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            Active Accounts
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{metrics.active}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Authorized for login</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-purple-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
            IT Admins
          </div>
          <div className="text-2xl font-black text-purple-600 mt-1">{metrics.itAdmins}</div>
          <div className="text-[11px] text-purple-600 mt-0.5">Full Super Admins</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-amber-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
            HR Admins
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">{metrics.hrAdmins}</div>
          <div className="text-[11px] text-amber-600 mt-0.5">Recruitment portal</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-indigo-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
            DAF &amp; Finance
          </div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{metrics.daf}</div>
          <div className="text-[11px] text-indigo-600 mt-0.5">Products &amp; Loans</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-rose-200 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
            MD &amp; Governance
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">{metrics.md}</div>
          <div className="text-[11px] text-rose-600 mt-0.5">Executive oversight</div>
        </div>
      </div>

      {/* Sub-tab switcher: Users vs Audit Log */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setSubTab('users')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'users'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>System Users ({totalCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('audit')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'audit'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Security Audit Trail</span>
        </button>
      </div>

      {subTab === 'users' ? (
        <>
          {/* Search & Filter Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search by Name or Email */}
              <div className="md:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search staff by full name, email address..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* Role Filter */}
              <div>
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Roles</option>
                  <option value="ADMIN_IT">ADMIN_IT (Super Admin)</option>
                  <option value="ADMIN">ADMIN (Media &amp; News)</option>
                  <option value="ADMIN_HR">ADMIN_HR (Recruitment)</option>
                  <option value="DAF">DAF (Finance &amp; Careers)</option>
                  <option value="MD">MD (Managing Director)</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e: any) => {
                    setSelectedStatus(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="INACTIVE">Deactivated Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Staff Password</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Login</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                        <span>Loading accounts from MongoDB database...</span>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <span className="font-semibold text-slate-600">No users found.</span>
                        <p className="text-xs text-slate-400 mt-1">
                          Try adjusting search filters or create a new user account.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const roleConfig = ROLE_BADGE_CONFIG[user.role] || {
                        label: user.role,
                        bg: 'bg-slate-100',
                        text: 'text-slate-800',
                        border: 'border-slate-300',
                        desc: 'System User',
                      };
                      const isCurrentUser =
                        currentUserId &&
                        (String(currentUserId) === String(user.id) ||
                          String(currentUserId) === String((user as any)._id));

                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          {/* Staff Info */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                                {user.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join('')
                                  .toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                                  <span>{user.name}</span>
                                  {isCurrentUser && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-blue-100 text-blue-800">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-500 text-xs truncate flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{user.email}</span>
                                </div>
                                {user.phone && (
                                  <div className="text-slate-400 text-[11px] truncate flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{user.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Department */}
                          <td className="py-3.5 px-4 text-slate-600">
                            {user.department ? (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium text-xs">
                                {user.department}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">General Staff</span>
                            )}
                          </td>

                          {/* Role Badge */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${roleConfig.bg} ${roleConfig.text} ${roleConfig.border}`}
                              title={roleConfig.desc}
                            >
                              <Shield className="w-3 h-3 shrink-0" />
                              <span>{roleConfig.label}</span>
                            </span>
                          </td>

                          {/* Staff Password (ADMIN_IT Visibility) */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <div className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 flex items-center gap-1.5">
                                <KeyRound className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="font-semibold select-all">
                                  {revealedPasswords[user.id]
                                    ? user.currentPassword || fetchedPasswords[user.id] || '••••••••'
                                    : '••••••••'}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleRevealPassword(user)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                title={revealedPasswords[user.id] ? 'Hide password' : 'View staff password'}
                              >
                                {revealedPasswords[user.id] ? (
                                  <EyeOff className="w-3.5 h-3.5 text-blue-600" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const pwd = user.currentPassword || fetchedPasswords[user.id];
                                  if (pwd) copyToClipboard(pwd, `pwd-${user.id}`);
                                  else {
                                    toggleRevealPassword(user).then(() => {
                                      const p = user.currentPassword || fetchedPasswords[user.id];
                                      if (p) copyToClipboard(p, `pwd-${user.id}`);
                                    });
                                  }
                                }}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                title="Copy password"
                              >
                                {copiedKey === `pwd-${user.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            {user.isActive ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                <Lock className="w-3 h-3 text-rose-500" />
                                <span>Deactivated</span>
                              </span>
                            )}
                          </td>

                          {/* Last Login */}
                          <td className="py-3.5 px-4 text-slate-500 text-xs">
                            {user.lastLoginAt ? (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{new Date(user.lastLoginAt).toLocaleDateString()}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Never logged in</span>
                            )}
                          </td>

                          {/* Created At */}
                          <td className="py-3.5 px-4 text-slate-500 text-xs">
                            {user.createdAt ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* View Details & Effective Permissions */}
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveUser(user);
                                  setIsViewModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                                title="View details and effective permissions"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Edit User */}
                              <button
                                type="button"
                                onClick={() => openEditModal(user)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-blue-600 hover:text-blue-800 transition-colors"
                                title="Edit user profile"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Reset Password */}
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveUser(user);
                                  setResetResult(null);
                                  setResetPasswordForm({
                                    customPassword: '',
                                    autoGenerate: true,
                                  });
                                  setIsResetPasswordModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-amber-600 hover:text-amber-800 transition-colors"
                                title="Reset credentials / temporary password"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>

                              {/* Activate / Deactivate Toggle */}
                              <button
                                type="button"
                                disabled={Boolean(isCurrentUser && user.isActive)}
                                onClick={() => {
                                  setActiveUser(user);
                                  setIsStatusConfirmModalOpen(true);
                                }}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  user.isActive
                                    ? 'hover:bg-rose-50 text-rose-600 hover:text-rose-800'
                                    : 'hover:bg-emerald-50 text-emerald-600 hover:text-emerald-800'
                                } ${isCurrentUser && user.isActive ? 'opacity-40 cursor-not-allowed' : ''}`}
                                title={
                                  isCurrentUser && user.isActive
                                    ? 'Cannot deactivate your own administrator account'
                                    : user.isActive
                                    ? 'Deactivate account access'
                                    : 'Activate account'
                                }
                              >
                                {user.isActive ? (
                                  <Lock className="w-4 h-4" />
                                ) : (
                                  <Unlock className="w-4 h-4" />
                                )}
                              </button>

                              {/* Delete Account */}
                              <button
                                type="button"
                                disabled={Boolean(isCurrentUser)}
                                onClick={() => {
                                  setActiveUser(user);
                                  setIsDeleteConfirmModalOpen(true);
                                }}
                                className={`p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors ${
                                  isCurrentUser ? 'opacity-30 cursor-not-allowed' : ''
                                }`}
                                title={
                                  isCurrentUser
                                    ? 'Cannot delete your own account'
                                    : 'Delete user account'
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <div>
                Showing <span className="font-bold">{users.length}</span> of{' '}
                <span className="font-bold">{totalCount}</span> total accounts in MongoDB
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <span className="px-2 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Security Audit Log View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Administrative &amp; Security Audit Trail
              </h3>
              <p className="text-xs text-slate-500">
                Immutable activity records stored in MongoDB (logins, account creations, role modifications)
              </p>
            </div>
            <button
              type="button"
              onClick={fetchAuditLogs}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Logs</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Actor</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Target Resource</th>
                  <th className="py-2.5 px-4">Outcome</th>
                  <th className="py-2.5 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1 text-blue-500" />
                      <span>Loading audit records...</span>
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No audit logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {log.actor?.name || log.actorEmail || 'System'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {log.actor?.role || log.actorRole || '-'}
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        <span className="font-medium">{log.resourceType}</span>
                        {log.resourceId && (
                          <span className="text-slate-400 font-mono text-[10px] ml-1">
                            ({log.resourceId.slice(-6)})
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            log.outcome === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {log.outcome}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-400 text-[11px]">
                        {log.ipAddress || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODALS — rendered via portal so they overlay the full page  */}
      {/* even when the parent has overflow-y-auto / overflow-hidden   */}
      {/* ───────────────────────────────────────────────────────────── */}

      {/* 1. CREATE USER MODAL */}
      {isCreateModalOpen && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Create New Staff User Account
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saves directly to MongoDB and establishes authorized login credentials.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {createFormError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{createFormError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="e.g. Jean Claude Nshimiyimana"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address (Login Username) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="staff@ubumwesacco.rw"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="+250 788 000 000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department / Unit
                  </label>
                  <select
                    value={createForm.department}
                    onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Information Technology">Information Technology</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance & Administration">Finance &amp; Administration (DAF)</option>
                    <option value="Executive Management">Executive Management (MD)</option>
                    <option value="Media & Communications">Media &amp; Communications</option>
                    <option value="Credit & Loans">Credit &amp; Loans</option>
                    <option value="Operations & Branches">Operations &amp; Branches</option>
                    <option value="Audit & Governance">Audit &amp; Governance</option>
                  </select>
                </div>
              </div>

              {/* Assigned Role */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Application Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'ADMIN',
                      title: 'Media Admin (ADMIN)',
                      desc: 'Gallery moments, bulletins, news, impact stories',
                      badge: 'bg-emerald-100 text-emerald-800',
                    },
                    {
                      id: 'ADMIN_HR',
                      title: 'HR Admin (ADMIN_HR)',
                      desc: 'Job applicant screening, candidate feedback, hiring pipeline',
                      badge: 'bg-amber-100 text-amber-800',
                    },
                    {
                      id: 'DAF',
                      title: 'Finance Director (DAF)',
                      desc: 'Financial products, vacancies, KYC & loan inquiries',
                      badge: 'bg-indigo-100 text-indigo-800',
                    },
                    {
                      id: 'MD',
                      title: 'Managing Director (MD)',
                      desc: 'Board governance, manager messages, read-only oversight',
                      badge: 'bg-rose-100 text-rose-800',
                    },
                    {
                      id: 'ADMIN_IT',
                      title: 'IT Super Admin (ADMIN_IT)',
                      desc: 'Full system privileges, user management, and security controls',
                      badge: 'bg-purple-100 text-purple-800',
                    },
                  ].map((roleOpt) => (
                    <label
                      key={roleOpt.id}
                      className={`p-3 rounded-xl border flex flex-col cursor-pointer transition-all ${
                        createForm.role === roleOpt.id
                          ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">{roleOpt.title}</span>
                        <input
                          type="radio"
                          name="role"
                          value={roleOpt.id}
                          checked={createForm.role === roleOpt.id}
                          onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <span className="text-[11px] text-slate-500">{roleOpt.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Password Setting Option */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Initial Password Setup
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Secure, bcrypt-hashed on backend before storage.
                    </span>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createForm.autoGeneratePassword}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          autoGeneratePassword: e.target.checked,
                        })
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Auto-generate secure temporary password</span>
                  </label>
                </div>

                {!createForm.autoGeneratePassword && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Custom Temporary Password (min 8 characters)
                    </label>
                    <input
                      type="password"
                      value={createForm.password}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, password: e.target.value })
                      }
                      placeholder="Enter minimum 8 characters"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={createForm.passwordChangeRequired}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        passwordChangeRequired: e.target.checked,
                      })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Require user to change password upon first login</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {createSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating in MongoDB...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Save Account to Database</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        , document.body
      )}

      {/* 2. NEW CREDENTIALS ISSUED MODAL */}
      {newCredentials && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Staff Account Created Successfully!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Please securely copy these initial login credentials and provide them to the staff member.
              </p>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-2xl text-left space-y-2.5 font-mono text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Staff Member:</span>
                <span className="font-bold text-white">{newCredentials.name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Assigned Role:</span>
                <span className="font-bold text-emerald-400">{newCredentials.role}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Login Email:</span>
                <span className="font-bold text-blue-300">{newCredentials.email}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Temporary Password:</span>
                <span className="font-bold text-amber-300 bg-slate-800 px-2 py-0.5 rounded text-sm select-all">
                  {newCredentials.temporaryPassword}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const text = `Ubumwe SACCO Staff Credentials\nName: ${newCredentials.name}\nRole: ${newCredentials.role}\nLogin: ${newCredentials.email}\nTemporary Password: ${newCredentials.temporaryPassword}\nLogin Portal: ${window.location.origin}`;
                  copyToClipboard(text);
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                {copiedKey ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Full Credentials</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setNewCredentials(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
        , document.body
      )}

      {/* 3. EDIT USER MODAL */}
      {isEditModalOpen && activeUser && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Edit Staff Profile: {activeUser.name}
                  </h3>
                  <p className="text-xs text-slate-500">Updates will persist directly in MongoDB.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {editFormError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                  {editFormError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role Assignment</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-semibold"
                >
                  <option value="ADMIN_IT">ADMIN_IT (Super Admin)</option>
                  <option value="ADMIN">ADMIN (Media &amp; News)</option>
                  <option value="ADMIN_HR">ADMIN_HR (Recruitment)</option>
                  <option value="DAF">DAF (Finance Director)</option>
                  <option value="MD">MD (Managing Director)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
        , document.body
      )}

      {/* 4. VIEW USER DETAILS & PERMISSIONS MATRIX MODAL */}
      {isViewModalOpen && activeUser && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{activeUser.name}</h3>
                  <p className="text-xs text-slate-500">{activeUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Summary */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl text-xs">
              <div>
                <span className="text-slate-400 block">Department:</span>
                <span className="font-semibold text-slate-800">
                  {activeUser.department || 'General Staff'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Phone:</span>
                <span className="font-semibold text-slate-800">
                  {activeUser.phone || 'Not recorded'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Account Status:</span>
                <span
                  className={`font-bold ${
                    activeUser.isActive ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {activeUser.isActive ? 'Active & Authorized' : 'Deactivated'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Assigned Role:</span>
                <span className="font-bold text-purple-700">{activeUser.role}</span>
              </div>
            </div>

            {/* Staff Login Credentials (ADMIN_IT Visibility) */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  Staff Login Password (ADMIN_IT Access)
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
                    activeUser.passwordChangeRequired
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {activeUser.passwordChangeRequired ? 'Change Required On Login' : 'Password Active'}
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-sm">
                <span className="text-amber-300 select-all font-bold">
                  {viewModalPasswordRevealed
                    ? activeUser.currentPassword || fetchedPasswords[activeUser.id] || '••••••••'
                    : '••••••••••••'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleViewModalPassword(activeUser)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {viewModalPasswordRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{viewModalPasswordRevealed ? 'Hide' : 'Reveal'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const pwd = activeUser.currentPassword || fetchedPasswords[activeUser.id];
                      if (pwd) copyToClipboard(pwd, 'view-modal-pwd');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-bold flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                  >
                    {copiedKey === 'view-modal-pwd' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Effective RBAC Permissions */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                <span>Effective Role Permissions &amp; Access Rights</span>
              </h4>
              <div className="space-y-1.5">
                {(ROLE_PERMISSIONS_PREVIEW[activeUser.role] || ['Standard authenticated user access']).map(
                  (perm, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs font-medium text-emerald-900 flex items-center gap-2"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{perm}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
        , document.body
      )}

      {/* 5. RESET PASSWORD MODAL */}
      {isResetPasswordModalOpen && activeUser && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Reset Staff Password
                </h3>
                <p className="text-xs text-slate-500">For account: {activeUser.email}</p>
              </div>
            </div>

            {resetResult ? (
              <div className="space-y-4 text-center">
                <div className="p-4 bg-slate-900 text-white rounded-2xl text-left space-y-2">
                  <span className="text-slate-400 text-[10px] uppercase block font-mono">
                    New Temporary Password:
                  </span>
                  <div className="font-bold text-amber-300 font-mono text-base bg-slate-800 px-3 py-1.5 rounded-lg select-all">
                    {resetResult}
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    The user will be required to choose a new password upon their next sign-in.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      copyToClipboard(
                        `Ubumwe SACCO Login: ${activeUser.email}\nTemporary Password: ${resetResult}\nLogin URL: ${window.location.origin}`
                      );
                    }}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    {copiedKey ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Password</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsResetPasswordModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <p className="text-xs text-slate-600">
                  Generate a new temporary password for this user. Old sessions will be invalidated.
                </p>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resetPasswordForm.autoGenerate}
                      onChange={(e) =>
                        setResetPasswordForm({
                          ...resetPasswordForm,
                          autoGenerate: e.target.checked,
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Auto-generate secure temporary password</span>
                  </label>

                  {!resetPasswordForm.autoGenerate && (
                    <input
                      type="password"
                      required
                      placeholder="Enter new temporary password (min 8 chars)"
                      value={resetPasswordForm.customPassword}
                      onChange={(e) =>
                        setResetPasswordForm({
                          ...resetPasswordForm,
                          customPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsResetPasswordModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetSubmitting}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                  >
                    {resetSubmitting ? 'Resetting...' : 'Generate New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        , document.body
      )}

      {/* 6. STATUS TOGGLE CONFIRMATION MODAL */}
      {isStatusConfirmModalOpen && activeUser && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
                activeUser.isActive ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {activeUser.isActive ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {activeUser.isActive
                  ? `Deactivate ${activeUser.name}?`
                  : `Activate ${activeUser.name}?`}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {activeUser.isActive
                  ? 'The user will immediately be blocked from logging into the portal and accessing any protected resources.'
                  : 'The user will be restored and permitted to log in with their valid credentials.'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsStatusConfirmModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={statusSubmitting}
                onClick={handleStatusToggle}
                className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 ${
                  activeUser.isActive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {statusSubmitting ? 'Updating...' : activeUser.isActive ? 'Yes, Deactivate' : 'Yes, Activate'}
              </button>
            </div>
          </div>
        </div>
        , document.body
      )}

      {/* 7. DELETE ACCOUNT CONFIRMATION MODAL */}
      {isDeleteConfirmModalOpen && activeUser && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Delete Account: {activeUser.name}?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                This action permanently removes the user account from MongoDB. Historical audit logs will remain intact.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteSubmitting}
                onClick={handleDeleteSubmit}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                {deleteSubmitting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
        , document.body
      )}
    </div>
  );
};

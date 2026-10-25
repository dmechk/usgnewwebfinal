import React, { useState, useEffect } from 'react';
import {
  Language,
  SaccoProduct,
  Announcement,
  ApplicationRecord,
  InstitutionMoment,
  LeaderMember,
  ThemeColor,
  SaccoContactInfo,
  NavItemConfig,
  SystemImagesConfig,
  BranchOutpost,
  ManagerMessage,
  JobPosting,
  JobApplication,
  CommunityImpactStory,
  HomeVideoItem,
  HeroContentConfig,
  HomeMetricItem,
  AboutContentConfig,
  AboutValueItem,
  PartnerItem,
  SocialMediaItem,
  SocialPlatform,
  ContactInquiry,
  EmploymentTypeItem,
  QualificationItem,
} from '../types';
import { THEME_OPTIONS, INITIAL_PARTNERS, INITIAL_SOCIAL_LINKS } from '../data/saccoData';
import { AdminArchive, archiveItem } from './AdminArchive';
import { ImageUploader } from './ImageUploader';
import { VideoUploader } from './VideoUploader';
import { InquiriesDashboard } from './InquiriesDashboard';
import { UserManagementDashboard } from './UserManagementDashboard';
import {
  X,
  Layers,
  Bell,
  UserCheck,
  Video,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Camera,
  Calendar,
  Users,
  Palette,
  BookOpen,
  Check,
  Shield,
  Search,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Info,
  Phone,
  Mail,
  MessageSquare,
  Smartphone,
  MapPin,
  Clock,
  Compass,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  ImageIcon,
  Quote,
  Briefcase,
  FileText,
  Download,
  Printer,
  Send,
  ShieldCheck,
  Star,
  UserPlus,
  Filter,
  MessageCircle,
  Target,
  HeartHandshake,
  Landmark,
  Building2,
  PiggyBank,
  TrendingUp,
  Award,
  Home,
  Share2,
  ExternalLink,
  Globe,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Upload,
  Archive,
} from 'lucide-react';
import { ImigongoRibbon } from './ImigongoPattern';
import { ApplicantFeedbackModal } from './ApplicantFeedbackModal';
import { ApplicantDossierModal } from './ApplicantDossierModal';
import { exportApplicantsToExcel } from '../utils/applicantExport';


interface AdminConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  initialTab?: 'users' | 'contact' | 'pictures' | 'navigation' | 'leaders' | 'moments' | 'products' | 'announcements' | 'applications' | 'careers' | 'job-applicants' | 'theme' | 'guide' | 'branches' | 'inquiries' | 'messages' | 'impact' | 'home-hero' | 'home-metrics' | 'about' | 'videos' | 'partners' | 'employment-types' | 'qualifications' | 'archive';
  saccoInfo: SaccoContactInfo;
  onUpdateSaccoInfo: (updated: Partial<SaccoContactInfo>) => void;
  navItems: NavItemConfig[];
  onAddNavItem: (item: Omit<NavItemConfig, 'id'>) => void;
  onUpdateNavItem: (id: string, updated: Partial<NavItemConfig>) => void;
  onDeleteNavItem: (id: string) => void;
  onReorderNavItems?: (items: NavItemConfig[]) => void;
  onResetNavItems: () => void;
  systemImages: SystemImagesConfig;
  onUpdateSystemImage: (key: string, url: string) => void;
  products: SaccoProduct[];
  announcements: Announcement[];
  applications: ApplicationRecord[];
  moments: InstitutionMoment[];
  leaders: LeaderMember[];
  currentTheme: ThemeColor;
  onAddProduct: (product: Omit<SaccoProduct, 'id'>) => void;
  onUpdateProduct: (id: string, updated: Partial<SaccoProduct>) => void;
  onDeleteProduct: (id: string) => void;
  onAddAnnouncement: (ann: Omit<Announcement, 'id'>) => void;
  onUpdateAnnouncement: (id: string, updated: Partial<Announcement>) => void;
  onDeleteAnnouncement: (id: string) => void;
  onUpdateApplicationStatus: (id: string, status: 'approved' | 'rejected') => void;
  onDeleteApplication: (id: string) => void;
  onAddMoment: (moment: Omit<InstitutionMoment, 'id'>) => void;
  onUpdateMoment: (id: string, updated: Partial<InstitutionMoment>) => void;
  onDeleteMoment: (id: string) => void;
  onAddLeader: (leader: Omit<LeaderMember, 'id'>) => void;
  onUpdateLeader: (id: string, updated: Partial<LeaderMember>) => void;
  onDeleteLeader: (id: string) => void;
  onThemeChange: (theme: ThemeColor) => void;
  branches: BranchOutpost[];
  onAddBranch: (branch: Omit<BranchOutpost, 'id'>) => void;
  onUpdateBranch: (id: string, updated: Partial<BranchOutpost>) => void;
  onDeleteBranch: (id: string) => void;
  onAddSubBranch: (branchId: string, sub: { name: string; sector: string; managerName: string; phone: string }) => void;
  onUpdateSubBranch?: (branchId: string, subId: string, updated: Partial<{ name: string; sector: string; managerName: string; phone: string }>) => void;
  onDeleteSubBranch: (branchId: string, subId: string) => void;
  employmentTypes?: EmploymentTypeItem[];
  onAddEmploymentType?: (emp: Omit<EmploymentTypeItem, 'id'>) => void;
  onUpdateEmploymentType?: (id: string, updated: Partial<EmploymentTypeItem>) => void;
  onDeleteEmploymentType?: (id: string) => void;
  qualifications?: QualificationItem[];
  onAddQualification?: (qual: Omit<QualificationItem, 'id'>) => void;
  onUpdateQualification?: (id: string, updated: Partial<QualificationItem>) => void;
  onDeleteQualification?: (id: string) => void;
  communityStories?: CommunityImpactStory[];
  onAddCommunityStory?: (story: Omit<CommunityImpactStory, 'id'>) => void;
  onUpdateCommunityStory?: (id: string, updated: Partial<CommunityImpactStory>) => void;
  onDeleteCommunityStory?: (id: string) => void;
  homeVideos?: HomeVideoItem[];
  onAddHomeVideo?: (video: Omit<HomeVideoItem, 'id'>) => void;
  onUpdateHomeVideo?: (id: string, updated: Partial<HomeVideoItem>) => void;
  onDeleteHomeVideo?: (id: string) => void;
  heroContent?: HeroContentConfig;
  onUpdateHeroContent?: (updated: Partial<HeroContentConfig>) => void;
  homeMetrics?: HomeMetricItem[];
  onAddHomeMetric?: (metric: Omit<HomeMetricItem, 'id'>) => void;
  onUpdateHomeMetric?: (id: string, updated: Partial<HomeMetricItem>) => void;
  onDeleteHomeMetric?: (id: string) => void;
  onResetHomeMetrics?: () => void;
  aboutContent?: AboutContentConfig;
  onUpdateAboutContent?: (updated: Partial<AboutContentConfig>) => void;
  onAddAboutValue?: (val: Omit<AboutValueItem, 'id'>) => void;
  onUpdateAboutValue?: (id: string, updated: Partial<AboutValueItem>) => void;
  onDeleteAboutValue?: (id: string) => void;
  contactInquiries: ContactInquiry[];
  onAddContactInquiry?: (inq: Omit<ContactInquiry, 'id'>) => void;
  onUpdateContactInquiry?: (id: string, updated: Partial<ContactInquiry>) => void;
  onDeleteContactInquiry: (id: string) => void;
  onResetContactInquiries?: () => void;
  managerMessages: ManagerMessage[];
  onAddManagerMessage: (message: Omit<ManagerMessage, 'id'>) => void;
  onUpdateManagerMessage: (id: string, updated: Partial<ManagerMessage>) => void;
  onDeleteManagerMessage: (id: string) => void;
  jobPostings?: JobPosting[];
  jobApplications?: JobApplication[];
  onAddJobPosting?: (job: Omit<JobPosting, 'id' | 'postedDate'>) => void;
  onUpdateJobPosting?: (id: string, updated: Partial<JobPosting>) => void;
  onDeleteJobPosting?: (id: string) => void;
  onAddJobApplication?: (app: Omit<JobApplication, 'id'>) => void;
  onUpdateJobApplicationStatus?: (id: string, status: JobApplication['status']) => void;
  onUpdateJobApplication?: (id: string, updated: Partial<JobApplication>) => void;
  onDeleteJobApplication?: (id: string) => void;
  onResetJobApplications?: () => void;
  partners?: PartnerItem[];
  onAddPartner?: (partner: Omit<PartnerItem, 'id'>) => void;
  onUpdatePartner?: (id: string, updated: Partial<PartnerItem>) => void;
  onDeletePartner?: (id: string) => void;
  onResetPartners?: () => void;
  socialLinks?: SocialMediaItem[];
  onAddSocialLink?: (social: Omit<SocialMediaItem, 'id'>) => void;
  onUpdateSocialLink?: (id: string, updated: Partial<SocialMediaItem>) => void;
  onDeleteSocialLink?: (id: string) => void;
  onResetSocialLinks?: () => void;
  loggedInUser?: {
    name: string;
    email: string;
    role: string;
    permissions?: string[];
  } | null;
  onSendContactInquiryFeedback?: (
    id: string,
    payload: { message: string; newStatus?: string; internalNotes?: string }
  ) => Promise<void>;
}

export const AdminConsoleModal: React.FC<AdminConsoleModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  initialTab = 'contact',
  loggedInUser,
  saccoInfo,
  onUpdateSaccoInfo,
  navItems,
  onAddNavItem,
  onUpdateNavItem,
  onDeleteNavItem,
  onReorderNavItems,
  onResetNavItems,
  systemImages,
  onUpdateSystemImage,
  products,
  announcements,
  applications,
  moments,
  leaders,
  currentTheme,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  onUpdateApplicationStatus,
  onDeleteApplication,
  onAddMoment,
  onUpdateMoment,
  onDeleteMoment,
  onAddLeader,
  onUpdateLeader,
  onDeleteLeader,
  onThemeChange,
  branches,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
  onAddSubBranch,
  onUpdateSubBranch,
  onDeleteSubBranch,
  employmentTypes = [],
  onAddEmploymentType,
  onUpdateEmploymentType,
  onDeleteEmploymentType,
  qualifications = [],
  onAddQualification,
  onUpdateQualification,
  onDeleteQualification,
  communityStories = [],
  onAddCommunityStory,
  onUpdateCommunityStory,
  onDeleteCommunityStory,
  homeVideos = [],
  onAddHomeVideo,
  onUpdateHomeVideo,
  onDeleteHomeVideo,
  heroContent,
  onUpdateHeroContent,
  homeMetrics = [],
  onAddHomeMetric,
  onUpdateHomeMetric,
  onDeleteHomeMetric,
  onResetHomeMetrics,
  aboutContent,
  onUpdateAboutContent,
  onAddAboutValue,
  onUpdateAboutValue,
  onDeleteAboutValue,
  contactInquiries,
  onAddContactInquiry,
  onUpdateContactInquiry,
  onDeleteContactInquiry,
  onResetContactInquiries,
  managerMessages = [],
  onAddManagerMessage,
  onUpdateManagerMessage,
  onDeleteManagerMessage,
  jobPostings = [],
  jobApplications = [],
  onAddJobPosting,
  onUpdateJobPosting,
  onDeleteJobPosting,
  onAddJobApplication,
  onUpdateJobApplicationStatus,
  onUpdateJobApplication,
  onDeleteJobApplication,
  onResetJobApplications,
  partners = [],
  onAddPartner,
  onUpdatePartner,
  onDeletePartner,
  onResetPartners,
  socialLinks = [],
  onAddSocialLink,
  onUpdateSocialLink,
  onDeleteSocialLink,
  onResetSocialLinks,
  onSendContactInquiryFeedback,
}) => {
  const userRole = (loggedInUser?.role || localStorage.getItem('ubumwe_user_role') || 'ADMIN_IT').toUpperCase();

  const ROLE_ALLOWED_TABS: Record<string, string[]> = {
    ADMIN_IT: [
      'users', 'contact', 'pictures', 'navigation', 'home-hero', 'home-metrics', 'about',
      'leaders', 'moments', 'products', 'announcements', 'job-applicants',
      'careers', 'applications', 'branches', 'employment-types', 'qualifications',
      'impact', 'videos', 'partners', 'messages', 'inquiries', 'theme', 'guide', 'archive'
    ],
    ADMIN: [
      'moments', 'announcements', 'branches', 'impact', 'videos', 'partners', 'inquiries'
    ],
    ADMIN_HR: [
      'job-applicants', 'careers', 'employment-types', 'qualifications', 'inquiries'
    ],
    DAF: [
      'careers', 'applications', 'products', 'home-metrics', 'inquiries'
    ],
    MD: [
      'messages', 'leaders', 'moments', 'announcements', 'job-applicants', 'applications', 'impact', 'inquiries'
    ],
    admin: [
      'users', 'contact', 'pictures', 'navigation', 'home-hero', 'home-metrics', 'about',
      'leaders', 'moments', 'products', 'announcements', 'job-applicants',
      'careers', 'applications', 'branches', 'employment-types', 'qualifications',
      'impact', 'videos', 'partners', 'messages', 'inquiries', 'theme', 'guide', 'archive'
    ],
  };

  const allowedTabs: string[] = ROLE_ALLOWED_TABS[userRole] || ROLE_ALLOWED_TABS[loggedInUser?.role || ''] || ROLE_ALLOWED_TABS['ADMIN_IT'];
  const isTabAllowed = (tab: string): boolean => allowedTabs.includes(tab);

  const getInitialActiveTab = (): any => {
    const raw = (initialTab === 'job-applicants' || (initialTab as string) === 'applicants') ? 'job-applicants' : initialTab;
    if (raw && allowedTabs.includes(raw)) return raw;
    return allowedTabs[0] || 'job-applicants';
  };

  const [activeTab, setActiveTab] = useState<
    | 'users'
    | 'contact'
    | 'pictures'
    | 'navigation'
    | 'leaders'
    | 'moments'
    | 'products'
    | 'announcements'
    | 'applications'
    | 'careers'
    | 'job-applicants'
    | 'theme'
    | 'guide'
    | 'branches'
    | 'inquiries'
    | 'messages'
    | 'impact'
    | 'videos'
    | 'home-hero'
    | 'home-metrics'
    | 'about'
    | 'partners'
    | 'employment-types'
    | 'qualifications'
    | 'archive'
  >(getInitialActiveTab);

  useEffect(() => {
    const raw = (initialTab === 'job-applicants' || (initialTab as string) === 'applicants') ? 'job-applicants' : initialTab;
    if (raw && isTabAllowed(raw)) {
      setActiveTab(raw as any);
    } else if (!isTabAllowed(activeTab)) {
      setActiveTab((allowedTabs[0] || 'job-applicants') as any);
    }
  }, [initialTab, isOpen, userRole]);

  // CONTACT & ORGANIZATION FORM STATE
  const [contactPhone, setContactPhone] = useState(saccoInfo.phone);
  const [contactManagerPhone, setContactManagerPhone] = useState(saccoInfo.managerPhone || saccoInfo.phone);
  const [contactEmail, setContactEmail] = useState(saccoInfo.email);
  const [contactSupportEmail, setContactSupportEmail] = useState(saccoInfo.supportEmail || saccoInfo.email);
  const [contactWhatsapp, setContactWhatsapp] = useState(saccoInfo.whatsapp || '250786422080');
  const [contactWhatsappMsg, setContactWhatsappMsg] = useState(saccoInfo.whatsappMessage || 'Hello UBUMWE SACCO GAKENKE');
  const [contactUssd, setContactUssd] = useState(saccoInfo.ussdCode || '*541#');
  const [contactHeadquarters, setContactHeadquarters] = useState(saccoInfo.headquarters);
  const [contactHoursEn, setContactHoursEn] = useState(saccoInfo.operatingHoursEn || 'Mon - Fri: 8:00 AM - 5:00 PM | Sat: 8:00 AM - 1:00 PM');
  const [contactHoursRw, setContactHoursRw] = useState(saccoInfo.operatingHoursRw || 'Kuwa Mbere - Kuwa Gatanu: Saa 8:00 - 17:00 | Kuwa Gatandatu: Saa 8:00 - 13:00');
  const [contactRcaReg, setContactRcaReg] = useState(saccoInfo.rcaRegistration || 'RCA / COOP / 042 / 2011');
  const [contactOversightEn, setContactOversightEn] = useState(saccoInfo.oversightLabelEn || 'Cooperative Oversight:');
  const [contactOversightRw, setContactOversightRw] = useState(saccoInfo.oversightLabelRw || 'Ubugenzuzi bwa Koperative :');
  const [contactLicensedEn, setContactLicensedEn] = useState(saccoInfo.licensedLabelEn || 'Licensed Financial Cooperative');
  const [contactLicensedRw, setContactLicensedRw] = useState(saccoInfo.licensedLabelRw || "Koperative y'Imari Yemewe n'Amategeko");
  const [contactSavedSuccess, setContactSavedSuccess] = useState(false);

  // Sync state if saccoInfo updates externally
  useEffect(() => {
    setContactPhone(saccoInfo.phone);
    setContactManagerPhone(saccoInfo.managerPhone || saccoInfo.phone);
    setContactEmail(saccoInfo.email);
    setContactSupportEmail(saccoInfo.supportEmail || saccoInfo.email);
    setContactWhatsapp(saccoInfo.whatsapp || '250786422080');
    setContactWhatsappMsg(saccoInfo.whatsappMessage || 'Hello UBUMWE SACCO GAKENKE');
    setContactUssd(saccoInfo.ussdCode || '*541#');
    setContactHeadquarters(saccoInfo.headquarters);
    setContactHoursEn(saccoInfo.operatingHoursEn || 'Mon - Fri: 8:00 AM - 5:00 PM | Sat: 8:00 AM - 1:00 PM');
    setContactHoursRw(saccoInfo.operatingHoursRw || 'Kuwa Mbere - Kuwa Gatanu: Saa 8:00 - 17:00 | Kuwa Gatandatu: Saa 8:00 - 13:00');
    setContactRcaReg(saccoInfo.rcaRegistration || 'RCA / COOP / 042 / 2011');
    setContactOversightEn(saccoInfo.oversightLabelEn || 'Cooperative Oversight:');
    setContactOversightRw(saccoInfo.oversightLabelRw || 'Ubugenzuzi bwa Koperative :');
    setContactLicensedEn(saccoInfo.licensedLabelEn || 'Licensed Financial Cooperative');
    setContactLicensedRw(saccoInfo.licensedLabelRw || "Koperative y'Imari Yemewe n'Amategeko");
  }, [saccoInfo]);

  const handleSaveContactInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSaccoInfo({
      phone: contactPhone,
      managerPhone: contactManagerPhone,
      email: contactEmail,
      supportEmail: contactSupportEmail,
      whatsapp: contactWhatsapp.replace(/[^0-9]/g, ''),
      whatsappMessage: contactWhatsappMsg,
      ussdCode: contactUssd,
      headquarters: contactHeadquarters,
      operatingHoursEn: contactHoursEn,
      operatingHoursRw: contactHoursRw,
      rcaRegistration: contactRcaReg,
      oversightLabelEn: contactOversightEn,
      oversightLabelRw: contactOversightRw,
      licensedLabelEn: contactLicensedEn,
      licensedLabelRw: contactLicensedRw,
    });
    setContactSavedSuccess(true);
    setTimeout(() => setContactSavedSuccess(false), 3000);
  };

  // NAVIGATION FORM STATE
  const [isNavFormOpen, setIsNavFormOpen] = useState(false);
  const [editingNavId, setEditingNavId] = useState<string | null>(null);
  const [navLabelEn, setNavLabelEn] = useState('');
  const [navLabelRw, setNavLabelRw] = useState('');
  const [navTarget, setNavTarget] = useState('hero');
  const [navVisible, setNavVisible] = useState(true);

  const handleOpenAddNav = () => {
    setEditingNavId(null);
    setNavLabelEn('');
    setNavLabelRw('');
    setNavTarget('about');
    setNavVisible(true);
    setIsNavFormOpen(true);
  };

  const handleOpenEditNav = (item: NavItemConfig) => {
    setEditingNavId(item.id);
    setNavLabelEn(item.labelEn);
    setNavLabelRw(item.labelRw);
    setNavTarget(item.targetSection);
    setNavVisible(item.visible);
    setIsNavFormOpen(true);
  };

  const handleSaveNav = (e: React.FormEvent) => {
    e.preventDefault();
    if (!navLabelEn) return;

    if (editingNavId) {
      onUpdateNavItem(editingNavId, {
        labelEn: navLabelEn,
        labelRw: navLabelRw || navLabelEn,
        targetSection: navTarget,
        visible: navVisible,
      });
    } else {
      onAddNavItem({
        labelEn: navLabelEn,
        labelRw: navLabelRw || navLabelEn,
        targetSection: navTarget,
        visible: navVisible,
      });
    }
    setIsNavFormOpen(false);
  };

  const handleMoveNav = (index: number, direction: 'up' | 'down') => {
    if (!onReorderNavItems) return;
    const newItems = [...navItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    onReorderNavItems(newItems);
  };

  // Product form state
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodTitle, setProdTitle] = useState('');
  const [prodCategory, setProdCategory] = useState<'savings' | 'loans' | 'digital'>('loans');
  const [prodRate, setProdRate] = useState('1.1% per month');
  const [prodMin, setProdMin] = useState(100000);
  const [prodMax, setProdMax] = useState(10000000);
  const [prodDuration, setProdDuration] = useState('12 Months');
  const [prodTagline, setProdTagline] = useState('');

  // Announcement form state
  const [isAnnFormOpen, setIsAnnFormOpen] = useState(false);
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annDate, setAnnDate] = useState('Current Season');
  const [annCategory, setAnnCategory] = useState<'agm' | 'dividend' | 'loan_window' | 'notice'>('notice');
  const [annSummary, setAnnSummary] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annImg, setAnnImg] = useState('/src/assets/images/community_governance_1791989970347.jpg');

  // Moments form state
  const [isMomentFormOpen, setIsMomentFormOpen] = useState(false);
  const [editingMomentId, setEditingMomentId] = useState<string | null>(null);
  const [momentTitle, setMomentTitle] = useState('');
  const [momentDate, setMomentDate] = useState('October 2026');
  const [momentCategory, setMomentCategory] = useState<InstitutionMoment['category']>('award');
  const [momentImg, setMomentImg] = useState('/src/assets/images/moment_cooperative_award_1791994900000.jpg');
  const [momentCaption, setMomentCaption] = useState('');

  // Leader / Manager form state
  const [isLeaderFormOpen, setIsLeaderFormOpen] = useState(false);
  const [editingLeaderId, setEditingLeaderId] = useState<string | null>(null);
  const [leaderName, setLeaderName] = useState('');
  const [leaderRoleEn, setLeaderRoleEn] = useState('');
  const [leaderRoleRw, setLeaderRoleRw] = useState('');
  const [leaderCategory, setLeaderCategory] = useState<string>('board');
  const [leaderCategoryCustom, setLeaderCategoryCustom] = useState<string>('');
  const [leaderQualEn, setLeaderQualEn] = useState('');
  const [leaderQualRw, setLeaderQualRw] = useState('');
  const [leaderImg, setLeaderImg] = useState('/src/assets/images/portrait_director_wellars_1791994899049.jpg');
  const [leaderPhone, setLeaderPhone] = useState('0786422080');
  const [leaderSearch, setLeaderSearch] = useState('');
  const [leaderCategoryFilter, setLeaderCategoryFilter] = useState<string>('all');

  // Derive all unique leader categories for filtering
  const allLeaderCategories = Array.from(new Set(leaders.map((l) => l.category).filter(Boolean)));

  // Branch form state
  const [isBranchFormOpen, setIsBranchFormOpen] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [branchName, setBranchName] = useState('');
  const [branchSector, setBranchSector] = useState('');
  const [branchManager, setBranchManager] = useState('');
  const [branchPhone, setBranchPhone] = useState('');

  // Employment Type form state
  const [isEmpTypeFormOpen, setIsEmpTypeFormOpen] = useState(false);
  const [editingEmpTypeId, setEditingEmpTypeId] = useState<string | null>(null);
  const [empTypeKey, setEmpTypeKey] = useState('');
  const [empTypeLabelEn, setEmpTypeLabelEn] = useState('');
  const [empTypeLabelRw, setEmpTypeLabelRw] = useState('');
  const [empTypeLabelFr, setEmpTypeLabelFr] = useState('');
  const [empTypeDescription, setEmpTypeDescription] = useState('');
  const [empTypeBadgeColor, setEmpTypeBadgeColor] = useState('emerald');

  // Qualification form state
  const [isQualFormOpen, setIsQualFormOpen] = useState(false);
  const [editingQualId, setEditingQualId] = useState<string | null>(null);
  const [qualCode, setQualCode] = useState('');
  const [qualTitleEn, setQualTitleEn] = useState('');
  const [qualTitleRw, setQualTitleRw] = useState('');
  const [qualTitleFr, setQualTitleFr] = useState('');
  const [qualCategory, setQualCategory] = useState<'degree' | 'diploma' | 'certificate' | 'professional' | 'other'>('degree');
  const [qualMinYears, setQualMinYears] = useState(1);

  // Community Stories form state
  const [isStoryFormOpen, setIsStoryFormOpen] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [storyName, setStoryName] = useState('');
  const [storyRoleEn, setStoryRoleEn] = useState('');
  const [storyRoleRw, setStoryRoleRw] = useState('');
  const [storyImage, setStoryImage] = useState('/src/assets/images/farmers_cooperative_1791989969904.jpg');
  const [storyQuoteEn, setStoryQuoteEn] = useState('');
  const [storyQuoteRw, setStoryQuoteRw] = useState('');
  const [storyMetric, setStoryMetric] = useState('+35% Farmer Harvest Return');

  // Attraction Videos form state
  const [isVideoFormOpen, setIsVideoFormOpen] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [videoTitleEn, setVideoTitleEn] = useState('');
  const [videoTitleRw, setVideoTitleRw] = useState('');
  const [videoDescEn, setVideoDescEn] = useState('');
  const [videoDescRw, setVideoDescRw] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState('');
  const [videoBadge, setVideoBadge] = useState('Client Attraction');
  const [videoFeatured, setVideoFeatured] = useState(true);

  // PARTNERS CRUD FORM STATE
  const [isPartnerFormOpen, setIsPartnerFormOpen] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [partnerLogoUrl, setPartnerLogoUrl] = useState('');
  const [partnerWebsiteUrl, setPartnerWebsiteUrl] = useState('https://');
  const [partnerVisible, setPartnerVisible] = useState(true);

  const handleOpenAddPartner = () => {
    setEditingPartnerId(null);
    setPartnerName('');
    setPartnerLogoUrl('');
    setPartnerWebsiteUrl('https://');
    setPartnerVisible(true);
    setIsPartnerFormOpen(true);
  };

  const handleOpenEditPartner = (p: PartnerItem) => {
    setEditingPartnerId(p.id);
    setPartnerName(p.name);
    setPartnerLogoUrl(p.logoUrl || '');
    setPartnerWebsiteUrl(p.websiteUrl || 'https://');
    setPartnerVisible(p.visible !== false);
    setIsPartnerFormOpen(true);
  };

  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) return;
    if (editingPartnerId) {
      if (onUpdatePartner) {
        onUpdatePartner(editingPartnerId, {
          name: partnerName.trim(),
          logoUrl: partnerLogoUrl,
          websiteUrl: partnerWebsiteUrl.trim(),
          visible: partnerVisible,
        });
      }
    } else {
      if (onAddPartner) {
        onAddPartner({
          name: partnerName.trim(),
          logoUrl: partnerLogoUrl,
          websiteUrl: partnerWebsiteUrl.trim(),
          visible: partnerVisible,
        });
      }
    }
    setIsPartnerFormOpen(false);
  };

  // SOCIAL MEDIA CRUD FORM STATE
  const [isSocialFormOpen, setIsSocialFormOpen] = useState(false);
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);
  const [socialPlatform, setSocialPlatform] = useState<SocialPlatform>('linkedin');
  const [socialLabel, setSocialLabel] = useState('');
  const [socialUrl, setSocialUrl] = useState('https://');
  const [socialVisible, setSocialVisible] = useState(true);

  const handleOpenAddSocial = () => {
    setEditingSocialId(null);
    setSocialPlatform('linkedin');
    setSocialLabel('LinkedIn');
    setSocialUrl('https://');
    setSocialVisible(true);
    setIsSocialFormOpen(true);
  };

  const handleOpenEditSocial = (s: SocialMediaItem) => {
    setEditingSocialId(s.id);
    setSocialPlatform(s.platform);
    setSocialLabel(s.label);
    setSocialUrl(s.url);
    setSocialVisible(s.visible !== false);
    setIsSocialFormOpen(true);
  };

  const handleSaveSocial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialUrl.trim()) return;
    const finalLabel = socialLabel.trim() || (socialPlatform.charAt(0).toUpperCase() + socialPlatform.slice(1));
    if (editingSocialId) {
      if (onUpdateSocialLink) {
        onUpdateSocialLink(editingSocialId, {
          platform: socialPlatform,
          label: finalLabel,
          url: socialUrl.trim(),
          visible: socialVisible,
        });
      }
    } else {
      if (onAddSocialLink) {
        onAddSocialLink({
          platform: socialPlatform,
          label: finalLabel,
          url: socialUrl.trim(),
          visible: socialVisible,
        });
      }
    }
    setIsSocialFormOpen(false);
  };

  // HOME HERO FORM STATE
  const [heroDistrictBadgeEn, setHeroDistrictBadgeEn] = useState(heroContent?.districtBadgeEn || 'Gakenke District Cooperative');
  const [heroDistrictBadgeRw, setHeroDistrictBadgeRw] = useState(heroContent?.districtBadgeRw || "Koperative y'Akarere ka Gakenke");
  const [heroHeadlinePrefixEn, setHeroHeadlinePrefixEn] = useState(heroContent?.headlinePrefixEn || 'Empowering Growth in');
  const [heroHeadlinePrefixRw, setHeroHeadlinePrefixRw] = useState(heroContent?.headlinePrefixRw || "Iterambere n'Ubukungu bw'Akarere ka");
  const [heroHeadlineFocusEn, setHeroHeadlineFocusEn] = useState(heroContent?.headlineFocusEn || 'Gakenke District');
  const [heroHeadlineFocusRw, setHeroHeadlineFocusRw] = useState(heroContent?.headlineFocusRw || 'Gakenke');
  const [heroHeadlineSuffixEn, setHeroHeadlineSuffixEn] = useState(heroContent?.headlineSuffixEn || 'Through Cooperative Finance');
  const [heroHeadlineSuffixRw, setHeroHeadlineSuffixRw] = useState(heroContent?.headlineSuffixRw || "biciye muri Koperative y'Ubwizigame");
  const [heroSubheadingEn, setHeroSubheadingEn] = useState(heroContent?.subheadingEn || '');
  const [heroSubheadingRw, setHeroSubheadingRw] = useState(heroContent?.subheadingRw || '');
  const [heroCtaJoinEn, setHeroCtaJoinEn] = useState(heroContent?.ctaJoinEn || 'Open Member Account');
  const [heroCtaJoinRw, setHeroCtaJoinRw] = useState(heroContent?.ctaJoinRw || 'Gufungura Konti Ako Kanya');
  const [heroCtaCalculatorEn, setHeroCtaCalculatorEn] = useState(heroContent?.ctaCalculatorEn || 'Calculate Loan Repayment');
  const [heroCtaCalculatorRw, setHeroCtaCalculatorRw] = useState(heroContent?.ctaCalculatorRw || 'Bara Inguzanyo Wifuza');
  const [heroSavedNotice, setHeroSavedNotice] = useState(false);

  useEffect(() => {
    if (heroContent) {
      setHeroDistrictBadgeEn(heroContent.districtBadgeEn || 'Gakenke District Cooperative');
      setHeroDistrictBadgeRw(heroContent.districtBadgeRw || "Koperative y'Akarere ka Gakenke");
      setHeroHeadlinePrefixEn(heroContent.headlinePrefixEn || 'Empowering Growth in');
      setHeroHeadlinePrefixRw(heroContent.headlinePrefixRw || "Iterambere n'Ubukungu bw'Akarere ka");
      setHeroHeadlineFocusEn(heroContent.headlineFocusEn || 'Gakenke District');
      setHeroHeadlineFocusRw(heroContent.headlineFocusRw || 'Gakenke');
      setHeroHeadlineSuffixEn(heroContent.headlineSuffixEn || 'Through Cooperative Finance');
      setHeroHeadlineSuffixRw(heroContent.headlineSuffixRw || "biciye muri Koperative y'Ubwizigame");
      setHeroSubheadingEn(heroContent.subheadingEn || '');
      setHeroSubheadingRw(heroContent.subheadingRw || '');
      setHeroCtaJoinEn(heroContent.ctaJoinEn || 'Open Member Account');
      setHeroCtaJoinRw(heroContent.ctaJoinRw || 'Gufungura Konti Ako Kanya');
      setHeroCtaCalculatorEn(heroContent.ctaCalculatorEn || 'Calculate Loan Repayment');
      setHeroCtaCalculatorRw(heroContent.ctaCalculatorRw || 'Bara Inguzanyo Wifuza');
    }
  }, [heroContent, isOpen]);

  // HOME METRICS CRUD FORM STATE
  const [isMetricFormOpen, setIsMetricFormOpen] = useState(false);
  const [editingMetricId, setEditingMetricId] = useState<string | null>(null);
  const [metricValue, setMetricValue] = useState('');
  const [metricLabelEn, setMetricLabelEn] = useState('');
  const [metricLabelRw, setMetricLabelRw] = useState('');
  const [metricDetailEn, setMetricDetailEn] = useState('');
  const [metricDetailRw, setMetricDetailRw] = useState('');
  const [metricIcon, setMetricIcon] = useState('users');
  const [metricColor, setMetricColor] = useState('text-emerald-700');
  const [metricBg, setMetricBg] = useState('bg-emerald-50');

  // ABOUT US CONTENT & VALUES FORM STATE
  const [aboutBadgeEn, setAboutBadgeEn] = useState(aboutContent?.badgeTitleEn || 'Cooperative Identity & Heritage');
  const [aboutBadgeRw, setAboutBadgeRw] = useState(aboutContent?.badgeTitleRw || "Abo Turibo n'Amateka ya Koperative");
  const [aboutMainTitleEn, setAboutMainTitleEn] = useState(aboutContent?.mainTitleEn || 'About UBUMWE SACCO GAKENKE');
  const [aboutMainTitleRw, setAboutMainTitleRw] = useState(aboutContent?.mainTitleRw || 'Abo Turibo muri Ubumwe SACCO Gakenke');
  const [aboutSubtitleEn, setAboutSubtitleEn] = useState(aboutContent?.subtitleEn || '');
  const [aboutSubtitleRw, setAboutSubtitleRw] = useState(aboutContent?.subtitleRw || '');
  const [aboutNoticeEn, setAboutNoticeEn] = useState(aboutContent?.regulationNoticeEn || '');
  const [aboutNoticeRw, setAboutNoticeRw] = useState(aboutContent?.regulationNoticeRw || '');
  const [aboutP1En, setAboutP1En] = useState(aboutContent?.storyP1En || '');
  const [aboutP1Rw, setAboutP1Rw] = useState(aboutContent?.storyP1Rw || '');
  const [aboutP2En, setAboutP2En] = useState(aboutContent?.storyP2En || '');
  const [aboutP2Rw, setAboutP2Rw] = useState(aboutContent?.storyP2Rw || '');
  const [aboutImage, setAboutImage] = useState(aboutContent?.imageUrl || '/src/assets/images/community_governance_1791989970347.jpg');
  const [aboutCaptionEn, setAboutCaptionEn] = useState(aboutContent?.imageCaptionEn || 'Democratic Governance · Annual General Assembly (AGM) of Members');
  const [aboutCaptionRw, setAboutCaptionRw] = useState(aboutContent?.imageCaptionRw || "Imiyoborere Inoze · Inteko Rusange y'Abanyamuryango (AGM)");
  const [aboutSavedNotice, setAboutSavedNotice] = useState(false);

  // About Core Value Item CRUD
  const [isValueFormOpen, setIsValueFormOpen] = useState(false);
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [valTitleEn, setValTitleEn] = useState('');
  const [valTitleRw, setValTitleRw] = useState('');
  const [valDescEn, setValDescEn] = useState('');
  const [valDescRw, setValDescRw] = useState('');
  const [valIcon, setValIcon] = useState('heart');

  useEffect(() => {
    if (aboutContent) {
      setAboutBadgeEn(aboutContent.badgeTitleEn || 'Cooperative Identity & Heritage');
      setAboutBadgeRw(aboutContent.badgeTitleRw || "Abo Turibo n'Amateka ya Koperative");
      setAboutMainTitleEn(aboutContent.mainTitleEn || 'About UBUMWE SACCO GAKENKE');
      setAboutMainTitleRw(aboutContent.mainTitleRw || 'Abo Turibo muri Ubumwe SACCO Gakenke');
      setAboutSubtitleEn(aboutContent.subtitleEn || '');
      setAboutSubtitleRw(aboutContent.subtitleRw || '');
      setAboutNoticeEn(aboutContent.regulationNoticeEn || '');
      setAboutNoticeRw(aboutContent.regulationNoticeRw || '');
      setAboutP1En(aboutContent.storyP1En || '');
      setAboutP1Rw(aboutContent.storyP1Rw || '');
      setAboutP2En(aboutContent.storyP2En || '');
      setAboutP2Rw(aboutContent.storyP2Rw || '');
      setAboutImage(aboutContent.imageUrl || '/src/assets/images/community_governance_1791989970347.jpg');
      setAboutCaptionEn(aboutContent.imageCaptionEn || 'Democratic Governance · Annual General Assembly (AGM) of Members');
      setAboutCaptionRw(aboutContent.imageCaptionRw || "Imiyoborere Inoze · Inteko Rusange y'Abanyamuryango (AGM)");
    }
  }, [aboutContent, isOpen]);

  // Manager Message form state
  const [isMsgFormOpen, setIsMsgFormOpen] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [msgTitleEn, setMsgTitleEn] = useState('');
  const [msgTitleRw, setMsgTitleRw] = useState('');
  const [msgBodyEn, setMsgBodyEn] = useState('');
  const [msgBodyRw, setMsgBodyRw] = useState('');
  const [msgAuthorName, setMsgAuthorName] = useState('Mbitsemunda Phocas');
  const [msgAuthorRole, setMsgAuthorRole] = useState('General Manager, UBUMWE SACCO GAKENKE');
  const [msgDate, setMsgDate] = useState('October 2026');
  const [msgShowHome, setMsgShowHome] = useState(true);
  const [msgShowAbout, setMsgShowAbout] = useState(false);
  const [msgActive, setMsgActive] = useState(true);
  const [msgImageUrl, setMsgImageUrl] = useState('/src/assets/images/mbitsemunda_phocas_desk.jpg');

  const handleOpenAddMsg = () => {
    setEditingMsgId(null);
    setMsgTitleEn('');
    setMsgTitleRw('');
    setMsgBodyEn('');
    setMsgBodyRw('');
    setMsgAuthorName('Mbitsemunda Phocas');
    setMsgAuthorRole('General Manager, UBUMWE SACCO GAKENKE');
    setMsgDate('October 2026');
    setMsgShowHome(true);
    setMsgShowAbout(false);
    setMsgActive(true);
    setMsgImageUrl('/src/assets/images/mbitsemunda_phocas_desk.jpg');
    setIsMsgFormOpen(true);
  };

  const handleOpenEditMsg = (msg: ManagerMessage) => {
    setEditingMsgId(msg.id);
    setMsgTitleEn(msg.titleEn);
    setMsgTitleRw(msg.titleRw);
    setMsgBodyEn(msg.bodyEn);
    setMsgBodyRw(msg.bodyRw);
    setMsgAuthorName(msg.authorName);
    setMsgAuthorRole(msg.authorRole);
    setMsgDate(msg.date);
    setMsgShowHome(msg.showOnHome);
    setMsgShowAbout(msg.showOnAbout);
    setMsgActive(msg.active);
    setMsgImageUrl(msg.imageUrl || '/src/assets/images/mbitsemunda_phocas_desk.jpg');
    setIsMsgFormOpen(true);
  };

  const handleSaveMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgTitleEn.trim() || !msgBodyEn.trim()) return;

    if (editingMsgId) {
      onUpdateManagerMessage(editingMsgId, {
        titleEn: msgTitleEn.trim(),
        titleRw: msgTitleRw.trim() || msgTitleEn.trim(),
        bodyEn: msgBodyEn.trim(),
        bodyRw: msgBodyRw.trim() || msgBodyEn.trim(),
        authorName: msgAuthorName.trim() || 'General Manager',
        authorRole: msgAuthorRole.trim() || 'UBUMWE SACCO GAKENKE',
        date: msgDate.trim() || 'October 2026',
        showOnHome: msgShowHome,
        showOnAbout: msgShowAbout,
        active: msgActive,
        imageUrl: msgImageUrl,
      });
    } else {
      onAddManagerMessage({
        titleEn: msgTitleEn.trim(),
        titleRw: msgTitleRw.trim() || msgTitleEn.trim(),
        bodyEn: msgBodyEn.trim(),
        bodyRw: msgBodyRw.trim() || msgBodyEn.trim(),
        authorName: msgAuthorName.trim() || 'General Manager',
        authorRole: msgAuthorRole.trim() || 'UBUMWE SACCO GAKENKE',
        date: msgDate.trim() || 'October 2026',
        showOnHome: msgShowHome,
        showOnAbout: msgShowAbout,
        active: msgActive,
        imageUrl: msgImageUrl,
      });
    }
    setIsMsgFormOpen(false);
  };

  // Product Handlers
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProdTitle('');
    setProdCategory('loans');
    setProdRate('1.2% per month');
    setProdMin(100000);
    setProdMax(5000000);
    setProdDuration('12 Months');
    setProdTagline('');
    setIsProductFormOpen(true);
  };

  const handleOpenEditProduct = (prod: SaccoProduct) => {
    setEditingProductId(prod.id);
    setProdTitle(prod.titleEn);
    setProdCategory(prod.category);
    setProdRate(prod.interestRate);
    setProdMin(prod.minAmount);
    setProdMax(prod.maxAmount);
    setProdDuration(prod.duration);
    setProdTagline(prod.taglineEn);
    setIsProductFormOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle) return;

    if (editingProductId) {
      onUpdateProduct(editingProductId, {
        titleEn: prodTitle,
        titleRw: prodTitle,
        category: prodCategory,
        interestRate: prodRate,
        minAmount: Number(prodMin),
        maxAmount: Number(prodMax),
        duration: prodDuration,
        taglineEn: prodTagline,
        taglineRw: prodTagline,
      });
    } else {
      onAddProduct({
        titleEn: prodTitle,
        titleRw: prodTitle,
        category: prodCategory,
        interestRate: prodRate,
        minAmount: Number(prodMin),
        maxAmount: Number(prodMax),
        duration: prodDuration,
        taglineEn: prodTagline,
        taglineRw: prodTagline,
        featuresEn: ['Direct USSD *541# integration', 'Low transparent cooperative interest'],
        featuresRw: ['Gukoresha USSD *541#', 'Inyungu iciriritse ya koperative'],
        requirementsEn: ['Rwanda National ID (16 Digits)'],
        requirementsRw: ["Indangamuntu y'u Rwanda"],
      });
    }
    setIsProductFormOpen(false);
  };

  // Announcement Handlers
  const handleOpenAddAnnouncement = () => {
    setEditingAnnId(null);
    setAnnTitle('');
    setAnnDate('Current Season 2026');
    setAnnCategory('notice');
    setAnnSummary('');
    setAnnContent('');
    setAnnImg('/src/assets/images/community_governance_1791989970347.jpg');
    setIsAnnFormOpen(true);
  };

  const handleOpenEditAnnouncement = (ann: Announcement) => {
    setEditingAnnId(ann.id);
    setAnnTitle(ann.titleEn);
    setAnnDate(ann.date);
    setAnnCategory(ann.category);
    setAnnSummary(ann.summaryEn);
    setAnnContent(ann.contentEn);
    setAnnImg(ann.imageUrl || '/src/assets/images/community_governance_1791989970347.jpg');
    setIsAnnFormOpen(true);
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle) return;

    if (editingAnnId) {
      onUpdateAnnouncement(editingAnnId, {
        titleEn: annTitle,
        titleRw: annTitle,
        date: annDate,
        category: annCategory,
        imageUrl: annImg,
        summaryEn: annSummary,
        summaryRw: annSummary,
        contentEn: annContent || annSummary,
        contentRw: annContent || annSummary,
      });
    } else {
      onAddAnnouncement({
        titleEn: annTitle,
        titleRw: annTitle,
        date: annDate,
        category: annCategory,
        imageUrl: annImg,
        summaryEn: annSummary,
        summaryRw: annSummary,
        contentEn: annContent || annSummary,
        contentRw: annContent || annSummary,
      });
    }
    setIsAnnFormOpen(false);
  };

  // Moment Handlers
  const handleOpenAddMoment = () => {
    setEditingMomentId(null);
    setMomentTitle('');
    setMomentDate('October 2026');
    setMomentCategory('award');
    setMomentImg('/src/assets/images/moment_cooperative_award_1791994900000.jpg');
    setMomentCaption('');
    setIsMomentFormOpen(true);
  };

  const handleOpenEditMoment = (moment: InstitutionMoment) => {
    setEditingMomentId(moment.id);
    setMomentTitle(moment.titleEn);
    setMomentDate(moment.date);
    setMomentCategory(moment.category);
    setMomentImg(moment.imageUrl);
    setMomentCaption(moment.captionEn);
    setIsMomentFormOpen(true);
  };

  const handleSaveMoment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!momentTitle) return;

    if (editingMomentId) {
      onUpdateMoment(editingMomentId, {
        titleEn: momentTitle,
        titleRw: momentTitle,
        date: momentDate,
        category: momentCategory,
        imageUrl: momentImg,
        captionEn: momentCaption,
        captionRw: momentCaption,
      });
    } else {
      onAddMoment({
        titleEn: momentTitle,
        titleRw: momentTitle,
        date: momentDate,
        category: momentCategory,
        imageUrl: momentImg,
        captionEn: momentCaption,
        captionRw: momentCaption,
      });
    }
    setIsMomentFormOpen(false);
  };

  // Leader Handlers
  const handleOpenAddLeader = () => {
    setEditingLeaderId(null);
    setLeaderName('');
    setLeaderRoleEn('Board Director');
    setLeaderRoleRw("Umuyobozi w'Inama y'Ubutegetsi");
    setLeaderCategory('board');
    setLeaderCategoryCustom('');
    setLeaderQualEn('Senior Financial Administrator');
    setLeaderQualRw("Impuguke mu by'Imari n'Amakoperative");
    setLeaderImg('/src/assets/images/portrait_director_wellars_1791994899049.jpg');
    setLeaderPhone(saccoInfo.phone);
    setIsLeaderFormOpen(true);
  };

  const handleOpenEditLeader = (leader: LeaderMember) => {
    setEditingLeaderId(leader.id);
    setLeaderName(leader.name);
    setLeaderRoleEn(leader.roleEn);
    setLeaderRoleRw(leader.roleRw);
    setLeaderCategory(leader.category);
    setLeaderCategoryCustom('');
    setLeaderQualEn(leader.qualificationEn);
    setLeaderQualRw(leader.qualificationRw);
    setLeaderImg(leader.imageUrl);
    setLeaderPhone(leader.phone || saccoInfo.phone);
    setIsLeaderFormOpen(true);
  };

  const handleSaveLeader = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaderName) return;

    // Resolve final category: use custom if provided, else preset
    const finalCategory = leaderCategoryCustom.trim() || leaderCategory;

    if (editingLeaderId) {
      onUpdateLeader(editingLeaderId, {
        name: leaderName,
        roleEn: leaderRoleEn,
        roleRw: leaderRoleRw || leaderRoleEn,
        category: finalCategory,
        qualificationEn: leaderQualEn,
        qualificationRw: leaderQualRw || leaderQualEn,
        imageUrl: leaderImg,
        phone: leaderPhone,
      });
    } else {
      onAddLeader({
        name: leaderName,
        roleEn: leaderRoleEn,
        roleRw: leaderRoleRw || leaderRoleEn,
        category: finalCategory,
        qualificationEn: leaderQualEn,
        qualificationRw: leaderQualRw || leaderQualEn,
        imageUrl: leaderImg,
        phone: leaderPhone,
      });
    }
    setIsLeaderFormOpen(false);
  };

  const filteredLeaders = leaders.filter((l) => {
    if (leaderCategoryFilter !== 'all' && l.category !== leaderCategoryFilter) return false;
    if (!leaderSearch) return true;
    const query = leaderSearch.toLowerCase();
    return (
      l.name.toLowerCase().includes(query) ||
      l.roleEn.toLowerCase().includes(query) ||
      l.category.toLowerCase().includes(query)
    );
  });

  // CAREERS FORM & APPLICATIONS STATE
  const [careerSubTab, setCareerSubTab] = useState<'vacancies' | 'applicants'>('vacancies');
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobTitleEn, setJobTitleEn] = useState('');
  const [jobTitleRw, setJobTitleRw] = useState('');
  const [jobDeptEn, setJobDeptEn] = useState('Credit & Microfinance Operations');
  const [jobDeptRw, setJobDeptRw] = useState('Ishami ry\'Inguzanyo');
  const [jobLoc, setJobLoc] = useState('Gakenke Headquarters & Field Outposts');
  const [jobType, setJobType] = useState<JobPosting['employmentType']>('full_time');
  const [jobSalary, setJobSalary] = useState('Competitive SACCO Scale');
  const [jobDeadline, setJobDeadline] = useState('2026-11-30');
  const [jobStatus, setJobStatus] = useState<'open' | 'closed'>('open');
  const [jobDescEn, setJobDescEn] = useState('');
  const [jobDescRw, setJobDescRw] = useState('');
  const [jobReqsEn, setJobReqsEn] = useState('');
  const [jobReqsRw, setJobReqsRw] = useState('');
  const [jobRespEn, setJobRespEn] = useState('');
  const [jobRespRw, setJobRespRw] = useState('');
  const [viewingApplicant, setViewingApplicant] = useState<JobApplication | null>(null);
  const [feedbackApplicant, setFeedbackApplicant] = useState<JobApplication | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [dossierApplicant, setDossierApplicant] = useState<JobApplication | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

  // APPLICANTS MANAGEMENT FILTER & CRUD STATE
  const [applicantSearch, setApplicantSearch] = useState('');
  const [applicantStatusFilter, setApplicantStatusFilter] = useState<string>('all');
  const [applicantJobFilter, setApplicantJobFilter] = useState<string>('all');
  const [editingCommentAppId, setEditingCommentAppId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState<string>('');
  const [isAddApplicantOpen, setIsAddApplicantOpen] = useState(false);
  const [newApplicant, setNewApplicant] = useState({
    jobId: '',
    jobTitle: '',
    fullName: '',
    email: '',
    phone: '',
    nationalId: '',
    residenceSector: 'Gakenke',
    educationLevel: "Bachelor's Degree (A0)",
    yearsExperience: 2,
    coverLetter: '',
    notes: '',
    comment: '',
    status: 'pending' as JobApplication['status'],
  });
  const [newApplicantMotivationFileName, setNewApplicantMotivationFileName] = useState('');
  const [newApplicantMotivationFileData, setNewApplicantMotivationFileData] = useState('');

  const handleOpenEditComment = (app: JobApplication) => {
    setEditingCommentAppId(app.id);
    setCommentDraft(app.comment || app.notes || '');
  };

  const handleSaveComment = (appId: string) => {
    if (onUpdateJobApplication) {
      onUpdateJobApplication(appId, {
        comment: commentDraft,
        notes: commentDraft,
      });
    }
    setEditingCommentAppId(null);
  };

  const handleCreateApplicantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApplicant.fullName.trim()) return;

    const matchedJob = jobPostings.find((j) => j.id === newApplicant.jobId);
    const resolvedTitle = matchedJob
      ? currentLang === 'fr'
        ? matchedJob.titleFr || matchedJob.titleEn
        : currentLang === 'rw'
        ? matchedJob.titleRw
        : matchedJob.titleEn
      : newApplicant.jobTitle || 'General SACCO Application';

    if (onAddJobApplication) {
      onAddJobApplication({
        jobId: newApplicant.jobId || (jobPostings[0]?.id ?? 'job-general'),
        jobTitle: resolvedTitle,
        fullName: newApplicant.fullName.trim(),
        email: newApplicant.email.trim() || `${newApplicant.phone.replace(/\D/g, '')}@applicant.sacco`,
        phone: newApplicant.phone.trim(),
        nationalId: newApplicant.nationalId.trim(),
        residenceSector: newApplicant.residenceSector || 'Gakenke',
        educationLevel: newApplicant.educationLevel,
        yearsExperience: Number(newApplicant.yearsExperience) || 0,
        coverLetter: newApplicant.coverLetter.trim() || 'Candidate registered by Admin via Management Console.',
        appliedDate: new Date().toISOString().split('T')[0],
        status: newApplicant.status,
        notes: newApplicant.notes || newApplicant.comment || '',
        comment: newApplicant.comment || newApplicant.notes || '',
        verified: true,
        motivationLetterFileName: newApplicantMotivationFileName || undefined,
        motivationLetterFileData: newApplicantMotivationFileData || undefined,
      });
    }

    setIsAddApplicantOpen(false);
    setNewApplicantMotivationFileName('');
    setNewApplicantMotivationFileData('');
    setNewApplicant({
      jobId: '',
      jobTitle: '',
      fullName: '',
      email: '',
      phone: '',
      nationalId: '',
      residenceSector: 'Gakenke',
      educationLevel: "Bachelor's Degree (A0)",
      yearsExperience: 2,
      coverLetter: '',
      notes: '',
      comment: '',
      status: 'pending',
    });
  };

  const filteredJobApplications = jobApplications.filter((app) => {
    if (applicantStatusFilter !== 'all' && app.status !== applicantStatusFilter) {
      return false;
    }
    if (applicantJobFilter !== 'all' && app.jobId !== applicantJobFilter && app.jobTitle !== applicantJobFilter) {
      return false;
    }
    if (applicantSearch.trim()) {
      const q = applicantSearch.toLowerCase().trim();
      const matchName = app.fullName.toLowerCase().includes(q);
      const matchNid = app.nationalId.toLowerCase().includes(q);
      const matchPhone = app.phone.toLowerCase().includes(q);
      const matchTitle = app.jobTitle.toLowerCase().includes(q);
      const matchSector = app.residenceSector.toLowerCase().includes(q);
      const matchComment = (app.comment || app.notes || '').toLowerCase().includes(q);
      if (!matchName && !matchNid && !matchPhone && !matchTitle && !matchSector && !matchComment) {
        return false;
      }
    }
    return true;
  });

  const handleOpenFeedback = (app: JobApplication) => {
    setFeedbackApplicant(app);
    setIsFeedbackModalOpen(true);
  };

  const handleOpenDossier = (app: JobApplication) => {
    setDossierApplicant(app);
    setIsDossierModalOpen(true);
  };

  const handleOpenAddJob = () => {
    setEditingJobId(null);
    setJobTitleEn('');
    setJobTitleRw('');
    setJobDeptEn('Credit & Microfinance Operations');
    setJobDeptRw('Ishami ry\'Inguzanyo');
    setJobLoc('Gakenke Headquarters & Field Outposts');
    setJobType('full_time');
    setJobSalary('Competitive SACCO Scale');
    setJobDeadline('2026-11-30');
    setJobStatus('open');
    setJobDescEn('');
    setJobDescRw('');
    setJobReqsEn('Bachelor\'s degree in related field\n2+ years relevant experience\nFluency in Kinyarwanda and English');
    setJobReqsRw('Impamyabumenyi ya Kaminuza A0\nUburambe nibura bw\'imyaka 2\nKumenya Ikinyarwanda n\'Icyongereza');
    setJobRespEn('Conduct field appraisals and member support\nPrepare risk and compliance reports');
    setJobRespRw('Gusuzuma amadosiye y\'inguzanyo\nGukora raporo zubahiriza amategeko');
    setIsJobModalOpen(true);
  };

  const handleOpenEditJob = (job: JobPosting) => {
    setEditingJobId(job.id);
    setJobTitleEn(job.titleEn);
    setJobTitleRw(job.titleRw);
    setJobDeptEn(job.departmentEn);
    setJobDeptRw(job.departmentRw);
    setJobLoc(job.location);
    setJobType(job.employmentType);
    setJobSalary(job.salaryRange || '');
    setJobDeadline(job.deadline);
    setJobStatus(job.status);
    setJobDescEn(job.descriptionEn);
    setJobDescRw(job.descriptionRw);
    setJobReqsEn(job.requirementsEn.join('\n'));
    setJobReqsRw(job.requirementsRw.join('\n'));
    setJobRespEn(job.responsibilitiesEn.join('\n'));
    setJobRespRw(job.responsibilitiesRw.join('\n'));
    setIsJobModalOpen(true);
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitleEn.trim()) return;

    const reqsEnArray = jobReqsEn.split('\n').map((s) => s.trim()).filter(Boolean);
    const reqsRwArray = jobReqsRw.split('\n').map((s) => s.trim()).filter(Boolean);
    const respEnArray = jobRespEn.split('\n').map((s) => s.trim()).filter(Boolean);
    const respRwArray = jobRespRw.split('\n').map((s) => s.trim()).filter(Boolean);

    if (editingJobId && onUpdateJobPosting) {
      onUpdateJobPosting(editingJobId, {
        titleEn: jobTitleEn,
        titleRw: jobTitleRw || jobTitleEn,
        departmentEn: jobDeptEn,
        departmentRw: jobDeptRw || jobDeptEn,
        location: jobLoc,
        employmentType: jobType,
        salaryRange: jobSalary,
        deadline: jobDeadline,
        status: jobStatus,
        descriptionEn: jobDescEn,
        descriptionRw: jobDescRw || jobDescEn,
        requirementsEn: reqsEnArray,
        requirementsRw: reqsRwArray.length > 0 ? reqsRwArray : reqsEnArray,
        responsibilitiesEn: respEnArray,
        responsibilitiesRw: respRwArray.length > 0 ? respRwArray : respEnArray,
      });
    } else if (onAddJobPosting) {
      onAddJobPosting({
        titleEn: jobTitleEn,
        titleRw: jobTitleRw || jobTitleEn,
        departmentEn: jobDeptEn,
        departmentRw: jobDeptRw || jobDeptEn,
        location: jobLoc,
        employmentType: jobType,
        salaryRange: jobSalary,
        deadline: jobDeadline,
        status: jobStatus,
        descriptionEn: jobDescEn,
        descriptionRw: jobDescRw || jobDescEn,
        requirementsEn: reqsEnArray,
        requirementsRw: reqsRwArray.length > 0 ? reqsRwArray : reqsEnArray,
        responsibilitiesEn: respEnArray,
        responsibilitiesRw: respRwArray.length > 0 ? respRwArray : respEnArray,
      });
    }
    setIsJobModalOpen(false);
  };

  const renderJobApplicantsWorkspace = () => {
    const totalCount = jobApplications.length;
    const pendingCount = jobApplications.filter((a) => a.status === 'pending').length;
    const shortlistedCount = jobApplications.filter((a) => a.status === 'shortlisted').length;
    const notShortlistedCount = jobApplications.filter((a) => a.status === 'not_shortlisted').length;
    const interviewCount = jobApplications.filter((a) => a.status === 'interview').length;
    const acceptedCount = jobApplications.filter((a) => a.status === 'accepted').length;
    const rejectedCount = jobApplications.filter((a) => a.status === 'rejected').length;
    const waitlistedCount = jobApplications.filter((a) => a.status === 'waitlisted').length;

    return (
      <div className="space-y-4 animate-in fade-in">
        {/* Top Header Card */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl border border-slate-700/60 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                HR &amp; Recruitment Center (CRUD)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {totalCount} Total Candidates
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1">
              Job Candidate Applications &amp; Evaluation Workspace
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
              Review applicant dossiers, update status (Pending, Shortlisted, Not Shortlisted, etc.), record committee comments &amp; deliberations, verify Rwandan National IDs, and dispatch feedback.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsAddApplicantOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Register Applicant</span>
            </button>
            {onResetJobApplications && (
              <button
                type="button"
                onClick={onResetJobApplications}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 shadow-sm transition-all cursor-pointer"
                title="Reset or reload initial sample candidates"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reset Sample Data</span>
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                exportApplicantsToExcel(
                  jobApplications,
                  `UBUMWE_SACCO_Job_Applicants_${new Date().toISOString().split('T')[0]}.csv`
                )
              }
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-600 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export All (Excel / CSV)</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Bar (Clickable Filter Pills) */}
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">
            Status Filter:
          </span>
          <button
            type="button"
            onClick={() => setApplicantStatusFilter('all')}
            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
              applicantStatusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setApplicantStatusFilter('pending')}
            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
              applicantStatusFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setApplicantStatusFilter('shortlisted')}
            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
              applicantStatusFilter === 'shortlisted'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            Shortlisted ({shortlistedCount})
          </button>
          <button
            type="button"
            onClick={() => setApplicantStatusFilter('not_shortlisted')}
            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
              applicantStatusFilter === 'not_shortlisted'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Not Shortlisted ({notShortlistedCount})
          </button>
          <button
            type="button"
            onClick={() => setApplicantStatusFilter('interview')}
            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
              applicantStatusFilter === 'interview'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            Interview ({interviewCount})
          </button>
          <button
            type="button"
            onClick={() => setApplicantStatusFilter('accepted')}
            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
              applicantStatusFilter === 'accepted'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Hired / Accepted ({acceptedCount})
          </button>
          <button
            type="button"
            onClick={() => setApplicantStatusFilter('waitlisted')}
            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
              applicantStatusFilter === 'waitlisted'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
            }`}
          >
            Waitlisted ({waitlistedCount})
          </button>
          <button
            type="button"
            onClick={() => setApplicantStatusFilter('rejected')}
            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
              applicantStatusFilter === 'rejected'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* Search & Position Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={applicantSearch}
                onChange={(e) => setApplicantSearch(e.target.value)}
                placeholder="Search applicant name, NID, phone, vacancy, comments..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-emerald-500"
              />
              {applicantSearch && (
                <button
                  type="button"
                  onClick={() => setApplicantSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={applicantJobFilter}
                onChange={(e) => setApplicantJobFilter(e.target.value)}
                className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden"
              >
                <option value="all">All Vacancy Positions</option>
                {jobPostings.map((job) => (
                  <option key={job.id} value={job.id}>
                    {currentLang === 'fr' ? (job.titleFr || job.titleEn) : currentLang === 'rw' ? job.titleRw : job.titleEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Showing <span className="font-bold text-slate-900">{filteredJobApplications.length}</span> of {totalCount} candidates
          </div>
        </div>

        {/* Table / Empty State */}
        {filteredJobApplications.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No applicants matching current criteria</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {applicantSearch || applicantStatusFilter !== 'all' || applicantJobFilter !== 'all'
                ? 'Try resetting your search query or filters to see more candidates.'
                : 'No candidate applications have been recorded yet.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {(applicantSearch || applicantStatusFilter !== 'all' || applicantJobFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setApplicantSearch('');
                    setApplicantStatusFilter('all');
                    setApplicantJobFilter('all');
                  }}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
              {jobApplications.length === 0 && onResetJobApplications && (
                <button
                  type="button"
                  onClick={onResetJobApplications}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Load Sample Candidates (4 Records)</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-3 min-w-[180px]">Candidate Details</th>
                  <th className="py-3 px-3 min-w-[150px]">Position Applied</th>
                  <th className="py-3 px-3 min-w-[140px]">Contact &amp; Sector</th>
                  <th className="py-3 px-3 min-w-[130px]">Qualifications</th>
                  <th className="py-3 px-3 min-w-[160px]">Status (CRUD)</th>
                  <th className="py-3 px-3 min-w-[220px] bg-emerald-50/40">
                    <div className="flex items-center gap-1 text-emerald-950 font-bold">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Committee Comments &amp; Remarks</span>
                    </div>
                  </th>
                  <th className="py-3 px-3 text-right min-w-[160px]">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobApplications.map((app) => {
                  const isEditingComment = editingCommentAppId === app.id;
                  const currentComment = app.comment || app.notes || '';

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* 1. Candidate Details */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {app.verified && (
                            <span title="NID Verified in Rwanda" className="shrink-0">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            </span>
                          )}
                          <span className="text-sm font-extrabold text-slate-900">{app.fullName}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                          NID: {app.nationalId}
                        </div>
                        {app.rating ? (
                          <div className="flex items-center gap-0.5 mt-1" title={`HR Rating: ${app.rating}/5`}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= (app.rating ?? 0)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                            <span className="text-[10px] text-slate-500 font-bold ml-1">{app.rating}/5</span>
                          </div>
                        ) : null}
                        {app.emailFeedbackSent && (
                          <div className="text-[10px] text-emerald-700 flex items-center gap-1 font-semibold mt-1">
                            <Mail className="w-3 h-3" />
                            <span>Feedback sent ({app.lastFeedbackDate})</span>
                          </div>
                        )}
                      </td>

                      {/* 2. Position Applied */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800 block text-xs">
                          {app.jobTitle}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Applied: {app.appliedDate}</span>
                        </div>
                      </td>

                      {/* 3. Contact & Sector */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{app.phone}</div>
                        <div className="text-[11px] text-slate-600 truncate max-w-[150px]">{app.email}</div>
                        <div className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>Sector: {app.residenceSector}</span>
                        </div>
                      </td>

                      {/* 4. Qualifications */}
                      <td className="py-3 px-3">
                        <div className="text-slate-800 font-medium">{app.educationLevel}</div>
                        <div className="text-[11px] text-slate-500 font-semibold">{app.yearsExperience} yrs exp</div>
                        {app.cvFileName && (
                          <div className="text-[11px] text-emerald-800 font-bold mt-1 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span className="truncate max-w-[120px]" title={app.cvFileName}>{app.cvFileName}</span>
                          </div>
                        )}
                        {app.motivationLetterFileName && (
                          <div className="text-[11px] text-blue-700 font-bold mt-0.5 flex items-center gap-1" title="Motivation letter attached">
                            <FileText className="w-3 h-3 text-blue-500" />
                            <span className="truncate max-w-[120px]">{app.motivationLetterFileName}</span>
                          </div>
                        )}
                        {/* Inline qualification edit */}
                        <button
                          type="button"
                          onClick={() => {
                            const newEdu = prompt('Edit education level:', app.educationLevel);
                            if (newEdu !== null && newEdu.trim() && onUpdateJobApplication) {
                              onUpdateJobApplication(app.id, { educationLevel: newEdu.trim() });
                            }
                          }}
                          className="mt-1 text-[10px] text-slate-400 hover:text-emerald-700 flex items-center gap-1 cursor-pointer font-semibold"
                          title="Edit qualifications"
                        >
                          <Edit2 className="w-2.5 h-2.5" /> Edit Qualifications
                        </button>
                      </td>

                      {/* 5. Status (CRUD) */}
                      <td className="py-3 px-3">
                        <select
                          value={app.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as JobApplication['status'];
                            if (onUpdateJobApplication) {
                              onUpdateJobApplication(app.id, { status: newStatus });
                            } else if (onUpdateJobApplicationStatus) {
                              onUpdateJobApplicationStatus(app.id, newStatus);
                            }
                          }}
                          className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-colors shadow-2xs ${
                            app.status === 'shortlisted'
                              ? 'bg-blue-50 text-blue-900 border-blue-300 font-extrabold'
                              : app.status === 'not_shortlisted'
                              ? 'bg-rose-50 text-rose-900 border-rose-300 font-extrabold'
                              : app.status === 'interview'
                              ? 'bg-purple-50 text-purple-900 border-purple-300 font-extrabold'
                              : app.status === 'accepted'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-extrabold'
                              : app.status === 'waitlisted'
                              ? 'bg-teal-50 text-teal-900 border-teal-300 font-extrabold'
                              : app.status === 'rejected'
                              ? 'bg-red-50 text-red-900 border-red-300 font-extrabold'
                              : 'bg-amber-50 text-amber-900 border-amber-300 font-extrabold'
                          }`}
                        >
                          <option value="pending">⏳ Pending Review</option>
                          <option value="shortlisted">⭐ Shortlisted</option>
                          <option value="not_shortlisted">❌ Not Shortlisted</option>
                          <option value="interview">📅 Interview Scheduled</option>
                          <option value="accepted">🎉 Hired / Accepted</option>
                          <option value="waitlisted">📋 Waitlisted / Reserve</option>
                          <option value="rejected">🚫 Regret / Rejected</option>
                        </select>
                      </td>

                      {/* 6. Committee Comments & Remarks (RESERVED PLACE FOR COMMENT!) */}
                      <td className="py-3 px-3 bg-emerald-50/20">
                        {isEditingComment ? (
                          <div className="space-y-1.5">
                            <textarea
                              rows={2}
                              value={commentDraft}
                              onChange={(e) => setCommentDraft(e.target.value)}
                              placeholder="Write evaluation remarks, background observations, interview notes..."
                              className="w-full p-2 bg-white border border-emerald-400 rounded-lg text-xs focus:outline-hidden resize-y shadow-xs"
                              autoFocus
                            />
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSaveComment(app.id)}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                              >
                                Save Comment
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCommentAppId(null)}
                                className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[11px] font-bold cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="group/cmt flex flex-col justify-between">
                            {currentComment ? (
                              <p className="text-xs text-slate-700 leading-relaxed bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs">
                                “{currentComment}”
                              </p>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                No committee comment recorded yet.
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenEditComment(app)}
                              className="mt-1 text-[11px] text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>{currentComment ? 'Edit Comment' : '+ Add Comment'}</span>
                            </button>
                          </div>
                        )}
                      </td>

                      {/* 7. Admin Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Full Review & Email Feedback Modal */}
                          <button
                            type="button"
                            onClick={() => handleOpenFeedback(app)}
                            className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs whitespace-nowrap"
                            title="Full review: verify NID, score rating, and send email feedback"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </button>
                          {/* PDF Dossier */}
                          <button
                            type="button"
                            onClick={() => handleOpenDossier(app)}
                            className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                            title="Print or view PDF dossier"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                          {/* Export CSV */}
                          <button
                            type="button"
                            onClick={() =>
                              exportApplicantsToExcel(
                                [app],
                                `${app.fullName.replace(/\s+/g, '_')}_${app.appliedDate}.csv`
                              )
                            }
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                            title="Export this applicant to CSV"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete application from "${app.fullName}"?`)) {
                                onDeleteJobApplication && onDeleteJobApplication(app.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete candidate application"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto flex flex-col animate-in fade-in duration-200">
      {/* Top Imigongo skeleton ribbon */}
      <ImigongoRibbon height={8} variant="light" bordered={false} />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 flex-1 flex flex-col space-y-4">
        {/* Top Sticky Header */}
        <div className="pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-800 font-bold">
              <span>{saccoInfo.name} · EXECUTIVE MANAGEMENT SYSTEM</span>
              {loggedInUser ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>[{loggedInUser.role}] {loggedInUser.name}</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono">
                  Full Admin Rights Active
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
              Operations &amp; Content Management Center
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Public Website</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              aria-label="Close admin console"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Console Navigation Tabs (Strictly Gated by User Role) */}
        <div className="flex items-center gap-1 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto max-w-full">
          {[
            { id: 'users', label: 'User Management', icon: <Users className="w-3.5 h-3.5 text-blue-400" />, activeClass: 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-500' },
            { id: 'contact', label: 'Contacts & Phone', icon: <Phone className="w-3.5 h-3.5" />, activeClass: 'bg-emerald-700 text-white shadow-xs' },
            { id: 'pictures', label: 'System Pictures', icon: <ImageIcon className="w-3.5 h-3.5" />, activeClass: 'bg-emerald-700 text-white shadow-xs' },
            { id: 'navigation', label: 'Navs Manager', icon: <Compass className="w-3.5 h-3.5" />, activeClass: 'bg-emerald-700 text-white shadow-xs' },
            { id: 'home-hero', label: 'Home Hero', icon: <Home className="w-3.5 h-3.5" />, activeClass: 'bg-emerald-700 text-white shadow-xs' },
            { id: 'home-metrics', label: `Home Metrics (${homeMetrics.length})`, icon: <TrendingUp className="w-3.5 h-3.5" />, activeClass: 'bg-emerald-700 text-white shadow-xs' },
            { id: 'about', label: 'About Us', icon: <Landmark className="w-3.5 h-3.5" />, activeClass: 'bg-emerald-700 text-white shadow-xs' },
            { id: 'leaders', label: `Leaders (${leaders.length})`, icon: <Users className="w-3.5 h-3.5 text-emerald-700" />, activeClass: 'bg-white text-slate-900 shadow-xs' },
            { id: 'moments', label: `Moments (${moments.length})`, icon: <Camera className="w-3.5 h-3.5 text-emerald-700" />, activeClass: 'bg-white text-slate-900 shadow-xs' },
            { id: 'products', label: `Products (${products.length})`, icon: <Layers className="w-3.5 h-3.5 text-emerald-700" />, activeClass: 'bg-white text-slate-900 shadow-xs' },
            { id: 'announcements', label: `Bulletins (${announcements.length})`, icon: <Bell className="w-3.5 h-3.5 text-emerald-700" />, activeClass: 'bg-white text-slate-900 shadow-xs' },
            { id: 'job-applicants', label: `Job Applicants (${jobApplications.length})`, icon: <Users className="w-3.5 h-3.5 text-emerald-400" />, activeClass: 'bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-500' },
            { id: 'careers', label: `Job Vacancies (${jobPostings.length})`, icon: <Briefcase className="w-3.5 h-3.5" />, activeClass: 'bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-500' },
            { id: 'applications', label: `KYC & Loans (${applications.length})`, icon: <UserCheck className="w-3.5 h-3.5" />, activeClass: 'bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-500' },
            { id: 'branches', label: `Branches (${branches.length})`, icon: <MapPin className="w-3.5 h-3.5 text-emerald-700" />, activeClass: 'bg-white text-slate-900 shadow-xs' },
            { id: 'employment-types', label: `Employment Types (${employmentTypes.length})`, icon: <Briefcase className="w-3.5 h-3.5" />, activeClass: 'bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-500' },
            { id: 'qualifications', label: `Qualifications (${qualifications.length})`, icon: <Award className="w-3.5 h-3.5" />, activeClass: 'bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-500' },
            { id: 'impact', label: `Impact Stories (${communityStories.length})`, icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" />, activeClass: 'bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-500' },
            { id: 'videos', label: `Attraction Videos (${homeVideos.length})`, icon: <Video className="w-3.5 h-3.5 text-emerald-400" />, activeClass: 'bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-500' },
            { id: 'partners', label: `Partners & Socials (${partners.length + socialLinks.length})`, icon: <Share2 className="w-3.5 h-3.5 text-emerald-400" />, activeClass: 'bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-500' },
            { id: 'messages', label: `Manager Messages (${managerMessages.length})`, icon: <Quote className="w-3.5 h-3.5 text-emerald-700" />, activeClass: 'bg-white text-slate-900 shadow-xs' },
            { id: 'inquiries', label: `Inquiries (${contactInquiries.length})`, icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />, activeClass: 'bg-white text-slate-900 shadow-xs' },
            { id: 'theme', label: 'Theme', icon: <Palette className="w-3.5 h-3.5 text-amber-500" />, activeClass: 'bg-white text-slate-900 shadow-xs' },
            { id: 'guide', label: 'Guide', icon: <BookOpen className="w-3.5 h-3.5" />, activeClass: 'bg-emerald-900 text-white shadow-xs' },
            { id: 'archive', label: 'Archive & Backup', icon: <Archive className="w-3.5 h-3.5 text-indigo-400" />, activeClass: 'bg-indigo-700 text-white shadow-xs ring-1 ring-indigo-500' },
          ]
            .filter((t) => isTabAllowed(t.id))
            .map((t) => (
              <button
                key={`console-tab-${t.id}`}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === t.id
                    ? t.activeClass || 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {!isTabAllowed(activeTab) && (
            <div className="p-8 text-center bg-amber-50 border border-amber-200 rounded-2xl animate-in fade-in my-4">
              <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-900">Access Restricted by Role</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Your role <span className="font-mono font-bold text-amber-800">[{userRole}]</span> is authorized only for your designated departmental modules. Please select one of your permitted tabs above.
              </p>
            </div>
          )}

          {/* TAB: IT ADMIN USER MANAGEMENT & ACCESS CONTROL */}
          {activeTab === 'users' && (
            <div className="animate-in fade-in">
              <UserManagementDashboard
                currentUserId={(loggedInUser as any)?.id || (loggedInUser as any)?._id}
                currentUserRole={userRole}
              />
            </div>
          )}

          {/* TAB: CONTACT & ORGANIZATION INFO */}
          {activeTab === 'contact' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-xs block">
                    Contact Channels &amp; Office Credentials
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Edit phone numbers, email, WhatsApp, operating hours, and USSD code. Changes update across the entire system.
                  </span>
                </div>
                {contactSavedSuccess && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Saved &amp; Updated Across Site!</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveContactInfo} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone Number */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>Phone Numbers</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Main Helpline / Customer Desk Phone
                      </label>
                      <input
                        type="text"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="0786422080"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-mono-numbers focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Displays in Top Utility Bar, Contact Section, Hero, and Footer.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Manager (Mbitsemunda Phocas) Direct Line
                      </label>
                      <input
                        type="text"
                        value={contactManagerPhone}
                        onChange={(e) => setContactManagerPhone(e.target.value)}
                        placeholder="0786422080"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-mono-numbers focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Email Addresses */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      <span>Email Addresses</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Official Cooperative Email
                      </label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="ubumwesaccogakenke@gmail.com"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Used for default admin login, contact card, and mailto links.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Support / Customer Desk Email
                      </label>
                      <input
                        type="email"
                        value={contactSupportEmail}
                        onChange={(e) => setContactSupportEmail(e.target.value)}
                        placeholder="ubumwesaccogakenke@gmail.com"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* WhatsApp Integration */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>WhatsApp Direct Channel</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        WhatsApp Number (Digits with Country Code, e.g. 250786422080)
                      </label>
                      <input
                        type="text"
                        required
                        value={contactWhatsapp}
                        onChange={(e) => setContactWhatsapp(e.target.value)}
                        placeholder="250786422080"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-mono-numbers focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Direct link: https://wa.me/{contactWhatsapp.replace(/[^0-9]/g, '')}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Default WhatsApp Greeting Message
                      </label>
                      <input
                        type="text"
                        value={contactWhatsappMsg}
                        onChange={(e) => setContactWhatsappMsg(e.target.value)}
                        placeholder="Hello UBUMWE SACCO GAKENKE, I would like to inquire about cooperative services."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* USSD & Office Details */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>USSD &amp; Head Office</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Official USSD Banking Code
                      </label>
                      <input
                        type="text"
                        required
                        value={contactUssd}
                        onChange={(e) => setContactUssd(e.target.value)}
                        placeholder="*541#"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-mono-numbers font-bold text-amber-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Headquarters Physical Location
                      </label>
                      <input
                        type="text"
                        required
                        value={contactHeadquarters}
                        onChange={(e) => setContactHeadquarters(e.target.value)}
                        placeholder="Gakenke Commercial Center, Sector Gakenke, Northern Province"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Operating Hours (EN) */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Operating Hours (English)
                    </label>
                    <input
                      type="text"
                      value={contactHoursEn}
                      onChange={(e) => setContactHoursEn(e.target.value)}
                      placeholder="Mon - Fri: 8:00 AM - 5:00 PM | Sat: 8:00 AM - 1:00 PM"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Operating Hours (RW) */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Operating Hours (Kinyarwanda)
                    </label>
                    <input
                      type="text"
                      value={contactHoursRw}
                      onChange={(e) => setContactHoursRw(e.target.value)}
                      placeholder="Kuwa Mbere - Kuwa Gatanu: Saa 8:00 - 17:00 | Kuwa Gatandatu: Saa 8:00 - 13:00"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Cooperative Oversight & RCA Registration (Full CRUD) */}
                  <div className="md:col-span-2 p-5 bg-emerald-50/70 border-2 border-emerald-300/80 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs uppercase tracking-wider">
                        <ShieldCheck className="w-5 h-5 text-emerald-700" />
                        <span>Cooperative Oversight &amp; Regulatory Licensing (RCA Registration)</span>
                      </div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold uppercase w-fit">
                        Live on Metrics Strip &amp; Footer
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* RCA Registration Number */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Official RCA Registration Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={contactRcaReg}
                          onChange={(e) => setContactRcaReg(e.target.value)}
                          placeholder="RCA / COOP / 042 / 2011"
                          className="w-full px-3 py-2 bg-white border border-emerald-400 rounded-xl text-xs sm:text-sm font-mono font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-2xs"
                        />
                        <span className="text-[11px] text-slate-500 mt-1 block">
                          Displays in the live oversight bar: "Cooperative Oversight: RCA / COOP / 042 / 2011 · Licensed Financial Cooperative"
                        </span>
                      </div>

                      {/* Oversight Label (English / Kinyarwanda) */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Oversight Prefix Label (English)
                        </label>
                        <input
                          type="text"
                          value={contactOversightEn}
                          onChange={(e) => setContactOversightEn(e.target.value)}
                          placeholder="Cooperative Oversight:"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Oversight Prefix Label (Kinyarwanda)
                        </label>
                        <input
                          type="text"
                          value={contactOversightRw}
                          onChange={(e) => setContactOversightRw(e.target.value)}
                          placeholder="Ubugenzuzi bwa Koperative :"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      {/* Licensed Label (English / Kinyarwanda) */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Licensing Status Badge (English)
                        </label>
                        <input
                          type="text"
                          value={contactLicensedEn}
                          onChange={(e) => setContactLicensedEn(e.target.value)}
                          placeholder="Licensed Financial Cooperative"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Licensing Status Badge (Kinyarwanda)
                        </label>
                        <input
                          type="text"
                          value={contactLicensedRw}
                          onChange={(e) => setContactLicensedRw(e.target.value)}
                          placeholder="Koperative y'Imari Yemewe n'Amategeko"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Contact Information Across Whole System</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: SYSTEM PICTURES & MEDIA MANAGER */}
          {activeTab === 'pictures' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-xs block">
                    All System Pictures &amp; Media Manager
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Upload or replace ANY image in the system directly from your computer or by URL.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 0. Institution Logo */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">0. Institution Logo (Header Branding)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">Brand Logo</span>
                  </div>
                  <ImageUploader
                    value={systemImages.saccoLogo || ''}
                    onChange={(url) => onUpdateSystemImage('saccoLogo', url)}
                    label="SACCO Institution Logo"
                    aspectRatio="square"
                    presets={[]}
                    helpText="Appears in the header navigation bar as the official cooperative logo."
                  />
                </div>

                {/* 1. Main Hero Welcome Slides & Carousel (Multi-Image) */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 md:col-span-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">1. Welcome Section Multi-Image Slider (Left Slide Movement)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          {(systemImages.heroSlides || [systemImages.heroBanking]).length} Slides Active
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Images slide left automatically on the welcome home screen. Full admin can add new photos, delete slides, or change existing ones.
                      </span>
                    </div>

                    {/* Quick Add Slide Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const current = systemImages.heroSlides && systemImages.heroSlides.length > 0
                          ? [...systemImages.heroSlides]
                          : [systemImages.heroBanking];
                        const newSlides = [...current, '/src/assets/images/hero_sacco_banking_1791989969362.jpg'];
                        onUpdateSystemImage('heroSlides', newSlides as any);
                      }}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Slide Photo</span>
                    </button>
                  </div>

                  {/* Grid of All Slides */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    {(systemImages.heroSlides && systemImages.heroSlides.length > 0
                      ? systemImages.heroSlides
                      : [systemImages.heroBanking]
                    ).map((slideUrl, idx) => (
                      <div
                        key={`hero-slide-admin-${idx}`}
                        className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs relative group"
                      >
                        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-mono">
                              {idx + 1}
                            </span>
                            <span>Slide {idx + 1}</span>
                          </span>

                          {/* Delete Slide Button */}
                          {(systemImages.heroSlides || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const current = [...(systemImages.heroSlides || [])];
                                current.splice(idx, 1);
                                onUpdateSystemImage('heroSlides', current as any);
                                if (idx === 0 && current[0]) {
                                  onUpdateSystemImage('heroBanking', current[0]);
                                }
                              }}
                              className="p-1 text-rose-500 hover:text-white hover:bg-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Delete this slide"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <ImageUploader
                          value={slideUrl}
                          onChange={(newUrl) => {
                            const current = systemImages.heroSlides && systemImages.heroSlides.length > 0
                              ? [...systemImages.heroSlides]
                              : [systemImages.heroBanking];
                            current[idx] = newUrl;
                            onUpdateSystemImage('heroSlides', current as any);
                            if (idx === 0) {
                              onUpdateSystemImage('heroBanking', newUrl);
                            }
                          }}
                          label={`Slide #${idx + 1} Image`}
                          aspectRatio="video"
                          presets={[
                            { label: 'Phocas Desk', url: '/src/assets/images/mbitsemunda_phocas_desk.jpg' },
                            { label: 'Banking Hall', url: '/src/assets/images/hero_sacco_banking_1791989969362.jpg' },
                            { label: 'Farmers Support', url: '/src/assets/images/farmers_cooperative_1791989969904.jpg' },
                            { label: 'Governance AGM', url: '/src/assets/images/community_governance_1791989970347.jpg' },
                            { label: 'Entrepreneurs', url: '/src/assets/images/entrepreneur_business_1791989970089.jpg' },
                          ]}
                          helpText="Upload from computer or pick preset. Automatically compresses."
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Manager Mbitsemunda Phocas Portrait */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">2. Manager (Mbitsemunda Phocas) Photo</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">Executive Manager</span>
                  </div>
                  <ImageUploader
                    value={systemImages.managerPortrait || '/src/assets/images/portrait_manager_phocas_1791994898549.jpg'}
                    onChange={(url) => {
                      onUpdateSystemImage('managerPortrait', url);
                      // Also update Mbitsemunda in leaders list if exists
                      const mgr = leaders.find((l) => l.name.toLowerCase().includes('mbitsemunda') || l.roleEn.toLowerCase().includes('manager'));
                      if (mgr) onUpdateLeader(mgr.id, { imageUrl: url });
                    }}
                    label="Manager Portrait"
                    aspectRatio="square"
                    presets={[
                      { label: 'Phocas Default', url: '/src/assets/images/portrait_manager_phocas_1791994898549.jpg' },
                    ]}
                    helpText="Official executive portrait used in Leadership section and Admin modal."
                  />
                </div>

                {/* 3. Board Director Wellarse Portrait */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">3. Board Director (Wellarse) Photo</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">Board Director</span>
                  </div>
                  <ImageUploader
                    value={systemImages.boardChairPortrait || '/src/assets/images/portrait_director_wellars_1791994899049.jpg'}
                    onChange={(url) => {
                      onUpdateSystemImage('boardChairPortrait', url);
                      const dir = leaders.find((l) => l.name.toLowerCase().includes('wellarse'));
                      if (dir) onUpdateLeader(dir.id, { imageUrl: url });
                    }}
                    label="Wellarse Portrait"
                    aspectRatio="square"
                    presets={[
                      { label: 'Wellarse Default', url: '/src/assets/images/portrait_director_wellars_1791994899049.jpg' },
                    ]}
                    helpText="Official portrait for Wellarse (Board Director)."
                  />
                </div>

                {/* 4. Board Director Bartazal Portrait */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">4. Board Director (Bartazal) Photo</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold">Board Member</span>
                  </div>
                  <ImageUploader
                    value={systemImages.bartazalPortrait || '/src/assets/images/portrait_bartazal_1792051299586.jpg'}
                    onChange={(url) => {
                      onUpdateSystemImage('bartazalPortrait', url);
                      const bar = leaders.find((l) => l.name.toLowerCase().includes('bartazal'));
                      if (bar) onUpdateLeader(bar.id, { imageUrl: url });
                    }}
                    label="Bartazal Portrait"
                    aspectRatio="square"
                    presets={[
                      { label: 'Bartazal Default', url: '/src/assets/images/portrait_bartazal_1792051299586.jpg' },
                    ]}
                    helpText="Official portrait for Bartazal (Board Director & Trustee)."
                  />
                </div>

                {/* 5. Farmers Cooperative Photo */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">5. Farmers Cooperative Photo</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">Agriculture</span>
                  </div>
                  <ImageUploader
                    value={systemImages.farmersCoop}
                    onChange={(url) => onUpdateSystemImage('farmersCoop', url)}
                    label="Farmers Image"
                    aspectRatio="video"
                    presets={[
                      { label: 'Farmers Support', url: '/src/assets/images/farmers_cooperative_1791989969904.jpg' },
                    ]}
                    helpText="Used in agricultural credit highlights and stories."
                  />
                </div>

                {/* 6. Retail & Entrepreneur Photo */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">6. Entrepreneurs &amp; Business Photo</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold">Commerce</span>
                  </div>
                  <ImageUploader
                    value={systemImages.entrepreneur}
                    onChange={(url) => onUpdateSystemImage('entrepreneur', url)}
                    label="Entrepreneur Image"
                    aspectRatio="video"
                    presets={[
                      { label: 'Retail Shop', url: '/src/assets/images/entrepreneur_business_1791989970089.jpg' },
                    ]}
                    helpText="Used in business and SME loan promotions."
                  />
                </div>

                {/* 7. Community Governance Photo */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 md:col-span-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">7. Community Governance Assembly Photo</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold">AGM Assembly</span>
                  </div>
                  <ImageUploader
                    value={systemImages.governance}
                    onChange={(url) => onUpdateSystemImage('governance', url)}
                    label="Governance Image"
                    aspectRatio="wide"
                    presets={[
                      { label: 'AGM Assembly', url: '/src/assets/images/community_governance_1791989970347.jpg' },
                    ]}
                    helpText="Used in cooperative governance and member resolution sections."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: NAVIGATION LINKS MANAGER */}
          {activeTab === 'navigation' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-xs block">
                    Navigation Menu Items Manager
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Add, edit titles (EN &amp; Kinyarwanda), toggle visibility, reorder, or delete navigation links.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onResetNavItems}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Reset to default SACCO links"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Default</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenAddNav}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Nav Link</span>
                  </button>
                </div>
              </div>

              {/* Add/Edit Nav Form */}
              {isNavFormOpen && (
                <form
                  onSubmit={handleSaveNav}
                  className="p-5 bg-slate-50 border border-emerald-200 rounded-2xl space-y-4 animate-in fade-in"
                >
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      {editingNavId ? 'Edit Navigation Item' : 'Add New Navigation Item'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsNavFormOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Title (English)</label>
                      <input
                        type="text"
                        required
                        value={navLabelEn}
                        onChange={(e) => setNavLabelEn(e.target.value)}
                        placeholder="e.g. Contact Us or Our Projects"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Title (Kinyarwanda)</label>
                      <input
                        type="text"
                        value={navLabelRw}
                        onChange={(e) => setNavLabelRw(e.target.value)}
                        placeholder="e.g. Twandikire cyangwa Imishinga"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Target Section</label>
                      <select
                        value={navTarget}
                        onChange={(e) => setNavTarget(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                      >
                        <option value="hero">hero (Home / Top)</option>
                        <option value="about">about (About Us)</option>
                        <option value="products">products (Our Services / Loans)</option>
                        <option value="leadership">leadership (Board &amp; Managers)</option>
                        <option value="announcements">announcements (Bulletins &amp; News)</option>
                        <option value="gallery">gallery (Photos)</option>
                        <option value="branches">branches (Branches &amp; Outposts)</option>
                        <option value="calculator">calculator (Loan Calculator)</option>
                        <option value="portal">portal (Member Portal)</option>
                        <option value="contact">contact (Contact Us - WhatsApp / Phone / Email)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={navVisible}
                          onChange={(e) => setNavVisible(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span>Visible in Header Navigation</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsNavFormOpen(false)}
                      className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingNavId ? 'Update Nav Item' : 'Create Nav Item'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Nav Items Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">Order</th>
                      <th className="py-2.5 px-3">English Label</th>
                      <th className="py-2.5 px-3">Kinyarwanda Label</th>
                      <th className="py-2.5 px-3">Target Section</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {navItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveNav(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveNav(index, 'down')}
                              disabled={index === navItems.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{item.labelEn}</td>
                        <td className="py-2.5 px-3 text-slate-600">{item.labelRw}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-800">#{item.targetSection}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => onUpdateNavItem(item.id, { visible: !item.visible })}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 mx-auto cursor-pointer ${
                              item.visible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                            }`}
                            title="Toggle Visibility"
                          >
                            {item.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{item.visible ? 'Visible' : 'Hidden'}</span>
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditNav(item)}
                              className="p-1 text-slate-500 hover:text-emerald-700 rounded transition-colors"
                              title="Edit Item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteNavItem(item.id);
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: HOME HERO — Headlines & CTA */}
          {activeTab === 'home-hero' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl border border-slate-700 shadow-sm">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Home Page · Hero Section Editor</span>
                  <h4 className="text-base font-extrabold text-white mt-0.5">Edit Homepage Headlines & Call-to-Action Buttons</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Changes are instantly reflected on the Home page hero banner.</p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (onUpdateHeroContent) {
                    onUpdateHeroContent({
                      districtBadgeEn: heroDistrictBadgeEn,
                      districtBadgeRw: heroDistrictBadgeRw,
                      headlinePrefixEn: heroHeadlinePrefixEn,
                      headlinePrefixRw: heroHeadlinePrefixRw,
                      headlineFocusEn: heroHeadlineFocusEn,
                      headlineFocusRw: heroHeadlineFocusRw,
                      headlineSuffixEn: heroHeadlineSuffixEn,
                      headlineSuffixRw: heroHeadlineSuffixRw,
                      subheadingEn: heroSubheadingEn,
                      subheadingRw: heroSubheadingRw,
                      ctaJoinEn: heroCtaJoinEn,
                      ctaJoinRw: heroCtaJoinRw,
                      ctaCalculatorEn: heroCtaCalculatorEn,
                      ctaCalculatorRw: heroCtaCalculatorRw,
                    });
                  }
                  setHeroSavedNotice(true);
                  setTimeout(() => setHeroSavedNotice(false), 3000);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">District Badge (English)</label>
                    <input type="text" value={heroDistrictBadgeEn} onChange={(e) => setHeroDistrictBadgeEn(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">District Badge (Kinyarwanda)</label>
                    <input type="text" value={heroDistrictBadgeRw} onChange={(e) => setHeroDistrictBadgeRw(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Headline Prefix (EN) — e.g. "Empowering Growth in"</label>
                    <input type="text" value={heroHeadlinePrefixEn} onChange={(e) => setHeroHeadlinePrefixEn(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Headline Prefix (RW)</label>
                    <input type="text" value={heroHeadlinePrefixRw} onChange={(e) => setHeroHeadlinePrefixRw(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Headline Focus Word (EN) — highlighted in emerald</label>
                    <input type="text" value={heroHeadlineFocusEn} onChange={(e) => setHeroHeadlineFocusEn(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Headline Focus Word (RW)</label>
                    <input type="text" value={heroHeadlineFocusRw} onChange={(e) => setHeroHeadlineFocusRw(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Headline Suffix (EN) — e.g. "Through Cooperative Finance"</label>
                    <input type="text" value={heroHeadlineSuffixEn} onChange={(e) => setHeroHeadlineSuffixEn(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Headline Suffix (RW)</label>
                    <input type="text" value={heroHeadlineSuffixRw} onChange={(e) => setHeroHeadlineSuffixRw(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subheading Paragraph (English)</label>
                    <textarea rows={3} value={heroSubheadingEn} onChange={(e) => setHeroSubheadingEn(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subheading Paragraph (Kinyarwanda)</label>
                    <textarea rows={3} value={heroSubheadingRw} onChange={(e) => setHeroSubheadingRw(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Primary CTA Button (EN) — "Open Member Account"</label>
                    <input type="text" value={heroCtaJoinEn} onChange={(e) => setHeroCtaJoinEn(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Primary CTA Button (RW)</label>
                    <input type="text" value={heroCtaJoinRw} onChange={(e) => setHeroCtaJoinRw(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Calculator CTA Button (EN)</label>
                    <input type="text" value={heroCtaCalculatorEn} onChange={(e) => setHeroCtaCalculatorEn(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Calculator CTA Button (RW)</label>
                    <input type="text" value={heroCtaCalculatorRw} onChange={(e) => setHeroCtaCalculatorRw(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
                  {heroSavedNotice && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Hero content saved!
                    </span>
                  )}
                  <button type="submit"
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5 transition-colors">
                    <Save className="w-4 h-4" />
                    <span>Save Hero Content</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: HOME METRICS — Statistics Cards CRUD */}
          {activeTab === 'home-metrics' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl border border-slate-700 shadow-sm">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Home Metrics · Statistics Strip</span>
                  <h4 className="text-base font-extrabold text-white mt-0.5">Manage Key Statistics Cards ({homeMetrics.length} active)</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Add, edit, or remove the 4-column statistics strip shown below the hero banner.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={onResetHomeMetrics}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
                  </button>
                  <button type="button"
                    onClick={() => {
                      setEditingMetricId(null);
                      setMetricValue('');
                      setMetricLabelEn('');
                      setMetricLabelRw('');
                      setMetricDetailEn('');
                      setMetricDetailRw('');
                      setMetricIcon('users');
                      setMetricColor('text-emerald-700');
                      setMetricBg('bg-emerald-50');
                      setIsMetricFormOpen(true);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm">
                    <Plus className="w-3.5 h-3.5" /> Add Metric Card
                  </button>
                </div>
              </div>

              {/* Metrics List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {homeMetrics.map((metric) => (
                  <div key={metric.id} className="relative p-4 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-emerald-300 transition-colors group">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl ${metric.bgClass || 'bg-emerald-50'} shrink-0`}>
                        <TrendingUp className={`w-5 h-5 ${metric.colorClass || 'text-emerald-700'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xl font-extrabold text-slate-900 font-mono">{metric.value}</div>
                        <div className="text-sm font-bold text-slate-800 truncate">{metric.labelEn}</div>
                        <div className="text-xs text-slate-500 truncate">{metric.detailEn}</div>
                        <div className="text-xs text-slate-400 mt-0.5 italic">RW: {metric.labelRw}</div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border border-slate-200">
                      <button type="button"
                        onClick={() => {
                          setEditingMetricId(metric.id);
                          setMetricValue(metric.value);
                          setMetricLabelEn(metric.labelEn);
                          setMetricLabelRw(metric.labelRw);
                          setMetricDetailEn(metric.detailEn);
                          setMetricDetailRw(metric.detailRw);
                          setMetricIcon(metric.iconName);
                          setMetricColor(metric.colorClass);
                          setMetricBg(metric.bgClass);
                          setIsMetricFormOpen(true);
                        }}
                        className="p-1 text-slate-500 hover:text-emerald-700 rounded cursor-pointer" title="Edit Metric">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {homeMetrics.length > 1 && onDeleteHomeMetric && (
                        <button type="button" onClick={() => onDeleteHomeMetric(metric.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer" title="Delete Metric">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add/Edit Metric Form */}
              {isMetricFormOpen && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!metricValue.trim() || !metricLabelEn.trim()) return;
                    const metricData = {
                      value: metricValue.trim(),
                      labelEn: metricLabelEn.trim(),
                      labelRw: metricLabelRw.trim() || metricLabelEn.trim(),
                      detailEn: metricDetailEn.trim(),
                      detailRw: metricDetailRw.trim() || metricDetailEn.trim(),
                      iconName: metricIcon,
                      colorClass: metricColor,
                      bgClass: metricBg,
                    };
                    if (editingMetricId && onUpdateHomeMetric) {
                      onUpdateHomeMetric(editingMetricId, metricData);
                    } else if (onAddHomeMetric) {
                      onAddHomeMetric(metricData);
                    }
                    setIsMetricFormOpen(false);
                  }}
                  className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4"
                >
                  <h5 className="font-bold text-slate-900 text-sm">{editingMetricId ? 'Edit Metric Card' : 'Add New Metric Card'}</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Value / Figure *</label>
                      <input type="text" required value={metricValue} onChange={(e) => setMetricValue(e.target.value)}
                        placeholder="e.g. 18,640+" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Icon Name</label>
                      <select value={metricIcon} onChange={(e) => setMetricIcon(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm cursor-pointer focus:outline-none">
                        <option value="users">👥 Users / Members</option>
                        <option value="piggy">🐷 Savings / PiggyBank</option>
                        <option value="landmark">🏛️ Loans / Landmark</option>
                        <option value="building">🏢 Branches / Building</option>
                        <option value="shield">🛡️ Compliance / Shield</option>
                        <option value="trending">📈 Growth / Trending</option>
                        <option value="award">🏆 Award / Achievement</option>
                        <option value="star">⭐ General / Star</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Label (English) *</label>
                      <input type="text" required value={metricLabelEn} onChange={(e) => setMetricLabelEn(e.target.value)}
                        placeholder="e.g. Cooperative Members" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Label (Kinyarwanda)</label>
                      <input type="text" value={metricLabelRw} onChange={(e) => setMetricLabelRw(e.target.value)}
                        placeholder="e.g. Abanyamuryango" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Detail Text (English)</label>
                      <input type="text" value={metricDetailEn} onChange={(e) => setMetricDetailEn(e.target.value)}
                        placeholder="e.g. Across 19 Gakenke Sectors" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Detail Text (Kinyarwanda)</label>
                      <input type="text" value={metricDetailRw} onChange={(e) => setMetricDetailRw(e.target.value)}
                        placeholder="e.g. Mu Mirenge 19 ya Gakenke" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Icon Color Class</label>
                      <select value={metricColor} onChange={(e) => setMetricColor(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm cursor-pointer focus:outline-none">
                        <option value="text-emerald-700">🟢 Emerald Green</option>
                        <option value="text-blue-700">🔵 Blue</option>
                        <option value="text-amber-700">🟡 Amber / Gold</option>
                        <option value="text-rose-700">🔴 Rose / Red</option>
                        <option value="text-purple-700">🟣 Purple</option>
                        <option value="text-teal-700">🩵 Teal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Background Class</label>
                      <select value={metricBg} onChange={(e) => setMetricBg(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm cursor-pointer focus:outline-none">
                        <option value="bg-emerald-50">Emerald Light</option>
                        <option value="bg-blue-50">Blue Light</option>
                        <option value="bg-amber-50">Amber Light</option>
                        <option value="bg-rose-50">Rose Light</option>
                        <option value="bg-purple-50">Purple Light</option>
                        <option value="bg-teal-50">Teal Light</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                    <button type="button" onClick={() => setIsMetricFormOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer">
                      Cancel
                    </button>
                    <button type="submit"
                      className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer flex items-center gap-1.5 transition-colors">
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingMetricId ? 'Update Metric' : 'Add Metric'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB: ABOUT US — Story, Image & Core Values CRUD */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl border border-slate-700 shadow-sm">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">About Us · Cooperative Heritage</span>
                  <h4 className="text-base font-extrabold text-white mt-0.5">Edit About Us Page — Titles, Story & Core Values</h4>
                  <p className="text-xs text-slate-300 mt-0.5">All changes reflect immediately on the About Us section.</p>
                </div>
              </div>

              {/* About Content Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (onUpdateAboutContent) {
                    onUpdateAboutContent({
                      badgeTitleEn: aboutBadgeEn,
                      badgeTitleRw: aboutBadgeRw,
                      mainTitleEn: aboutMainTitleEn,
                      mainTitleRw: aboutMainTitleRw,
                      subtitleEn: aboutSubtitleEn,
                      subtitleRw: aboutSubtitleRw,
                      regulationNoticeEn: aboutNoticeEn,
                      regulationNoticeRw: aboutNoticeRw,
                      storyP1En: aboutP1En,
                      storyP1Rw: aboutP1Rw,
                      storyP2En: aboutP2En,
                      storyP2Rw: aboutP2Rw,
                      imageUrl: aboutImage,
                      imageCaptionEn: aboutCaptionEn,
                      imageCaptionRw: aboutCaptionRw,
                    });
                  }
                  setAboutSavedNotice(true);
                  setTimeout(() => setAboutSavedNotice(false), 3000);
                }}
                className="space-y-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs"
              >
                <h5 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Section Titles & Story Text</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Section Badge (EN)</label>
                    <input type="text" value={aboutBadgeEn} onChange={(e) => setAboutBadgeEn(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Section Badge (RW)</label>
                    <input type="text" value={aboutBadgeRw} onChange={(e) => setAboutBadgeRw(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Main Title (EN)</label>
                    <input type="text" value={aboutMainTitleEn} onChange={(e) => setAboutMainTitleEn(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Main Title (RW)</label>
                    <input type="text" value={aboutMainTitleRw} onChange={(e) => setAboutMainTitleRw(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle (EN)</label>
                    <input type="text" value={aboutSubtitleEn} onChange={(e) => setAboutSubtitleEn(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Regulation Notice (EN)</label>
                    <input type="text" value={aboutNoticeEn} onChange={(e) => setAboutNoticeEn(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Story Paragraph 1 (EN)</label>
                    <textarea rows={4} value={aboutP1En} onChange={(e) => setAboutP1En(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Story Paragraph 1 (RW)</label>
                    <textarea rows={3} value={aboutP1Rw} onChange={(e) => setAboutP1Rw(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Story Paragraph 2 (EN)</label>
                    <textarea rows={3} value={aboutP2En} onChange={(e) => setAboutP2En(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Story Paragraph 2 (RW)</label>
                    <textarea rows={3} value={aboutP2Rw} onChange={(e) => setAboutP2Rw(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Assembly/Image Caption (EN)</label>
                    <input type="text" value={aboutCaptionEn} onChange={(e) => setAboutCaptionEn(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Assembly/Image Caption (RW)</label>
                    <input type="text" value={aboutCaptionRw} onChange={(e) => setAboutCaptionRw(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">About Section Image URL</label>
                  <div className="flex gap-2">
                    <input type="text" value={aboutImage} onChange={(e) => setAboutImage(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                    <ImageUploader
                      value={aboutImage}
                      onChange={(url: string) => setAboutImage(url)}
                      label="About Section Photo"
                      aspectRatio="wide"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                  {aboutSavedNotice && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> About content saved!
                    </span>
                  )}
                  <button type="submit"
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5 transition-colors">
                    <Save className="w-4 h-4" />
                    <span>Save About Content</span>
                  </button>
                </div>
              </form>

              {/* Core Values CRUD */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">Core Cooperative Values / Principles</h5>
                    <p className="text-xs text-slate-500 mt-0.5">{(aboutContent?.values || []).length} values currently displayed</p>
                  </div>
                  <button type="button"
                    onClick={() => {
                      setEditingValueId(null);
                      setValTitleEn('');
                      setValTitleRw('');
                      setValDescEn('');
                      setValDescRw('');
                      setValIcon('heart');
                      setIsValueFormOpen(true);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm">
                    <Plus className="w-3.5 h-3.5" /> Add Value
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(aboutContent?.values || []).map((val) => (
                    <div key={val.id} className="relative p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-300 transition-colors group">
                      <div className="font-bold text-slate-900 text-xs truncate">{val.titleEn}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{val.descEn}</div>
                      <div className="text-[10px] text-emerald-700 font-medium mt-1">Icon: {val.iconName}</div>
                      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        <button type="button"
                          onClick={() => {
                            setEditingValueId(val.id);
                            setValTitleEn(val.titleEn);
                            setValTitleRw(val.titleRw);
                            setValDescEn(val.descEn);
                            setValDescRw(val.descRw);
                            setValIcon(val.iconName);
                            setIsValueFormOpen(true);
                          }}
                          className="p-1 bg-white rounded shadow-xs text-slate-500 hover:text-emerald-700 cursor-pointer border border-slate-200">
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                        {(aboutContent?.values || []).length > 1 && onDeleteAboutValue && (
                          <button type="button" onClick={() => onDeleteAboutValue(val.id)}
                            className="p-1 bg-white rounded shadow-xs text-slate-400 hover:text-rose-600 cursor-pointer border border-slate-200">
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add/Edit Value Form */}
                {isValueFormOpen && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!valTitleEn.trim()) return;
                      const valData = { titleEn: valTitleEn.trim(), titleRw: valTitleRw.trim() || valTitleEn.trim(), descEn: valDescEn.trim(), descRw: valDescRw.trim() || valDescEn.trim(), iconName: valIcon };
                      if (editingValueId && onUpdateAboutValue) {
                        onUpdateAboutValue(editingValueId, valData);
                      } else if (onAddAboutValue) {
                        onAddAboutValue(valData);
                      }
                      setIsValueFormOpen(false);
                    }}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 mt-2"
                  >
                    <h6 className="font-bold text-slate-800 text-xs">{editingValueId ? 'Edit Core Value' : 'Add Core Value'}</h6>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Title (English) *</label>
                        <input type="text" required value={valTitleEn} onChange={(e) => setValTitleEn(e.target.value)}
                          placeholder="e.g. Ubumwe (Unity)" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Title (Kinyarwanda)</label>
                        <input type="text" value={valTitleRw} onChange={(e) => setValTitleRw(e.target.value)}
                          placeholder="e.g. Ubumwe" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Description (EN)</label>
                        <textarea rows={2} value={valDescEn} onChange={(e) => setValDescEn(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Description (RW)</label>
                        <textarea rows={2} value={valDescRw} onChange={(e) => setValDescRw(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Icon</label>
                        <select value={valIcon} onChange={(e) => setValIcon(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm cursor-pointer focus:outline-none">
                          <option value="heart">❤️ Heart / Solidarity</option>
                          <option value="shield">🛡️ Shield / Compliance</option>
                          <option value="target">🎯 Target / Progress</option>
                          <option value="award">🏆 Award / Excellence</option>
                          <option value="users">👥 Users / Community</option>
                          <option value="check">✅ Checkmark / Integrity</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                      <button type="button" onClick={() => setIsValueFormOpen(false)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer">
                        Cancel
                      </button>
                      <button type="submit"
                        className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer flex items-center gap-1.5 transition-colors">
                        <Check className="w-3.5 h-3.5" />
                        <span>{editingValueId ? 'Update Value' : 'Add Value'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB: LEADERS & MANAGERS */}
          {activeTab === 'leaders' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-xs block">
                    Board of Directors &amp; Executive Management Team
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Add, edit, delete leadership members and assign custom categories (Board, Manager, Committee, etc.)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search leader..."
                      value={leaderSearch}
                      onChange={(e) => setLeaderSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddLeader}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Leader</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              {allLeaderCategories.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category:</span>
                  <button
                    type="button"
                    onClick={() => setLeaderCategoryFilter('all')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      leaderCategoryFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({leaders.length})
                  </button>
                  {allLeaderCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setLeaderCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize transition-all cursor-pointer ${
                        leaderCategoryFilter === cat
                          ? 'bg-emerald-700 text-white'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {cat} ({leaders.filter(l => l.category === cat).length})
                    </button>
                  ))}
                </div>
              )}

              {/* Add/Edit Leader Modal Form */}
              {isLeaderFormOpen && (
                <form
                  onSubmit={handleSaveLeader}
                  className="p-5 bg-slate-50 border border-emerald-200 rounded-2xl space-y-4 animate-in fade-in"
                >
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      {editingLeaderId ? 'Edit Leader / Director' : 'Add New Board Director or Manager'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsLeaderFormOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={leaderName}
                        onChange={(e) => setLeaderName(e.target.value)}
                        placeholder="e.g. Wellarse or Mbitsemunda Phocas or Bartazal"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Leadership Category</label>
                      <div className="space-y-1.5">
                        {/* Preset category presets */}
                        <select
                          value={leaderCategoryCustom ? '__custom__' : leaderCategory}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              setLeaderCategory('__custom__');
                            } else {
                              setLeaderCategory(e.target.value);
                              setLeaderCategoryCustom('');
                            }
                          }}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                        >
                          <option value="board">Board of Directors (Inama y'Ubutegetsi)</option>
                          <option value="manager">Executive Management (Abayobozi b'Imirimo)</option>
                          <option value="supervisory">Supervisory Committee (Komite y'Igenzura)</option>
                          <option value="credit">Credit Committee (Komite y'Inguzanyo)</option>
                          <option value="audit">Audit Committee (Komite y'Igenzura ry'Imari)</option>
                          <option value="staff">Staff / Support Team (Abakozi)</option>
                          {allLeaderCategories
                            .filter(c => !['board','manager','supervisory','credit','audit','staff'].includes(c))
                            .map(c => (
                              <option key={c} value={c} className="capitalize">{c}</option>
                            ))
                          }
                          <option value="__custom__">+ Type Custom Category...</option>
                        </select>
                        {/* Custom free-text category field */}
                        <input
                          type="text"
                          value={leaderCategoryCustom}
                          onChange={(e) => setLeaderCategoryCustom(e.target.value)}
                          placeholder="Or type a new category (e.g. General Assembly, Risk Committee...)"
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-[11px] placeholder:text-slate-400"
                        />
                        {leaderCategoryCustom && (
                          <p className="text-[10px] text-emerald-700 font-semibold">
                            ✓ Will be saved as: <strong>'{leaderCategoryCustom}'</strong>
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Official Role (English)</label>
                      <input
                        type="text"
                        required
                        value={leaderRoleEn}
                        onChange={(e) => setLeaderRoleEn(e.target.value)}
                        placeholder="e.g. Board Director or Manager"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Official Role (Kinyarwanda)</label>
                      <input
                        type="text"
                        value={leaderRoleRw}
                        onChange={(e) => setLeaderRoleRw(e.target.value)}
                        placeholder="e.g. Umuyobozi w'Inama y'Ubutegetsi"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Qualification / Background (EN)</label>
                      <input
                        type="text"
                        value={leaderQualEn}
                        onChange={(e) => setLeaderQualEn(e.target.value)}
                        placeholder="e.g. Senior Cooperative Governance & Finance"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Direct Phone</label>
                      <input
                        type="text"
                        value={leaderPhone}
                        onChange={(e) => setLeaderPhone(e.target.value)}
                        placeholder="0786422080"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono-numbers"
                      />
                    </div>
                  </div>

                  {/* Leader Picture Uploader */}
                  <ImageUploader
                    value={leaderImg}
                    onChange={(newUrl) => setLeaderImg(newUrl)}
                    label="Leader Portrait Picture (Upload from Device or URL)"
                    aspectRatio="square"
                    presets={[
                      { label: 'Wellarse (Board Director)', url: '/src/assets/images/portrait_director_wellars_1791994899049.jpg' },
                      { label: 'Mbitsemunda Phocas (Manager)', url: '/src/assets/images/portrait_manager_phocas_1791994898549.jpg' },
                      { label: 'Bartazal (Board Director)', url: '/src/assets/images/portrait_bartazal_1792051299586.jpg' },
                    ]}
                    helpText="Upload a crisp portrait photo of the leader or director."
                  />

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsLeaderFormOpen(false)}
                      className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingLeaderId ? 'Save Changes' : 'Create Leader'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Leaders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredLeaders.map((leader) => (
                  <div
                    key={leader.id}
                    className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 relative group hover:border-emerald-300 transition-all shadow-xs"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <img src={leader.imageUrl} alt={leader.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 pr-12">
                      <h4 className="font-bold text-slate-900 text-xs truncate">{leader.name}</h4>
                      <p className="text-[11px] text-emerald-800 font-semibold truncate">{leader.roleEn}</p>
                      <span className="text-[10px] text-slate-400 capitalize">{leader.category}</span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditLeader(leader)}
                        className="p-1 text-slate-400 hover:text-emerald-700 rounded transition-colors"
                        title="Edit profile & photo"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteLeader(leader.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Delete profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: BEST MOMENTS & GALLERY */}
          {activeTab === 'moments' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-xs block">
                    Institutional Gallery
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Add achievements, AGM milestones, award ceremonies, and upload high-res photography.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddMoment}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Post Moment</span>
                </button>
              </div>

              {/* Add/Edit Moment Modal Form */}
              {isMomentFormOpen && (
                <form
                  onSubmit={handleSaveMoment}
                  className="p-5 bg-slate-50 border border-emerald-200 rounded-2xl space-y-4 animate-in fade-in"
                >
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      {editingMomentId ? 'Edit Milestone Moment' : 'Create New Best Moment'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsMomentFormOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Moment Title</label>
                      <input
                        type="text"
                        required
                        value={momentTitle}
                        onChange={(e) => setMomentTitle(e.target.value)}
                        placeholder="e.g. 2026 Dividend Distribution"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Category</label>
                      <select
                        value={momentCategory}
                        onChange={(e) => setMomentCategory(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="award">National Award &amp; Trophy</option>
                        <option value="agm_dividend">AGM &amp; Dividend Celebration</option>
                        <option value="community">Community Outreach &amp; Farmers</option>
                        <option value="branch_opening">Branch Opening &amp; Modern Hall</option>
                        <option value="training">Member Financial Literacy</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Date / Period</label>
                      <input
                        type="text"
                        required
                        value={momentDate}
                        onChange={(e) => setMomentDate(e.target.value)}
                        placeholder="October 2026"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono-numbers"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Caption / Summary</label>
                      <input
                        type="text"
                        required
                        value={momentCaption}
                        onChange={(e) => setMomentCaption(e.target.value)}
                        placeholder="Description of the event..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Moment Picture Uploader */}
                  <ImageUploader
                    value={momentImg}
                    onChange={(url) => setMomentImg(url)}
                    label="Moment Photograph (Upload from Device or URL)"
                    aspectRatio="video"
                    presets={[
                      { label: 'Award Trophy', url: '/src/assets/images/moment_cooperative_award_1791994900000.jpg' },
                      { label: 'Dividend Celebration', url: '/src/assets/images/moment_dividend_celebration_1791994900250.jpg' },
                      { label: 'Banking Hall', url: '/src/assets/images/hero_sacco_banking_1791989969362.jpg' },
                      { label: 'Farmers Harvest', url: '/src/assets/images/farmers_cooperative_1791989969904.jpg' },
                    ]}
                    helpText="Upload an authentic milestone photograph."
                  />

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsMomentFormOpen(false)}
                      className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingMomentId ? 'Save Milestone' : 'Publish Moment'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Moments List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {moments.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-white border border-slate-200 rounded-2xl space-y-2 relative group hover:border-emerald-300 transition-all shadow-xs"
                  >
                    <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={m.imageUrl} alt={m.titleEn} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs truncate">{m.titleEn}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{m.captionEn}</p>
                      <span className="text-[10px] text-slate-400 font-mono-numbers mt-1 block">{m.date}</span>
                    </div>

                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-lg border border-slate-200 shadow-xs">
                      <button
                        type="button"
                        onClick={() => handleOpenEditMoment(m)}
                        className="p-1 text-slate-600 hover:text-emerald-700 rounded transition-colors"
                        title="Edit Moment & Photo"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteMoment(m.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Delete Moment"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-700 uppercase tracking-wider block">
                    Savings &amp; Loan Product Catalog
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Terms here automatically configure the public Loan Calculator and Service Catalog.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddProduct}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Add/Edit Product Modal Form */}
              {isProductFormOpen && (
                <form
                  onSubmit={handleSaveProduct}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in"
                >
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {editingProductId ? 'Edit Product' : 'Add New Cooperative Product'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsProductFormOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Title</label>
                      <input
                        type="text"
                        required
                        value={prodTitle}
                        onChange={(e) => setProdTitle(e.target.value)}
                        placeholder="e.g. Tea & Fertilizer Seasonal Credit"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Category</label>
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value as any)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="loans">Loan Product</option>
                        <option value="savings">Savings Account</option>
                        <option value="digital">Digital Facility</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Interest / Dividend</label>
                      <input
                        type="text"
                        required
                        value={prodRate}
                        onChange={(e) => setProdRate(e.target.value)}
                        placeholder="1.2% per month"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Min Amount (RWF)</label>
                      <input
                        type="number"
                        required
                        value={prodMin}
                        onChange={(e) => setProdMin(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono-numbers"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Max Amount (RWF)</label>
                      <input
                        type="number"
                        required
                        value={prodMax}
                        onChange={(e) => setProdMax(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono-numbers"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tenure / Duration</label>
                      <input
                        type="text"
                        required
                        value={prodDuration}
                        onChange={(e) => setProdDuration(e.target.value)}
                        placeholder="12 Months"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Tagline</label>
                      <input
                        type="text"
                        value={prodTagline}
                        onChange={(e) => setProdTagline(e.target.value)}
                        placeholder="Fast disbursement against harvest cycles"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsProductFormOpen(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingProductId ? 'Update Product' : 'Create Product'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Products Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Title</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Interest / Return</th>
                      <th className="py-2.5 px-3">Borrowing Range</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono-numbers">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">{p.titleEn}</td>
                        <td className="py-2.5 px-3 capitalize font-sans">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.category === 'savings'
                                ? 'bg-blue-100 text-blue-800'
                                : p.category === 'loans'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {p.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-emerald-800 font-bold">{p.interestRate}</td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {p.minAmount.toLocaleString()} - {p.maxAmount.toLocaleString()} RWF
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-sans">{p.duration}</td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1 font-sans">
                            <button
                              type="button"
                              onClick={() => handleOpenEditProduct(p)}
                              className="p-1 text-slate-500 hover:text-emerald-700 rounded transition-colors"
                              title="Edit product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteProduct(p.id);
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-700 uppercase tracking-wider block">
                    Statutory Bulletins &amp; News
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Publish AGM notices, dividend payouts, and regulatory disclosures.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddAnnouncement}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publish Notice</span>
                </button>
              </div>

              {/* Add/Edit Announcement Form */}
              {isAnnFormOpen && (
                <form
                  onSubmit={handleSaveAnnouncement}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in"
                >
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {editingAnnId ? 'Edit Announcement' : 'Publish New Notice'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAnnFormOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Headline</label>
                      <input
                        type="text"
                        required
                        value={annTitle}
                        onChange={(e) => setAnnTitle(e.target.value)}
                        placeholder="e.g. 2026 Annual General Meeting Resolutions"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Category</label>
                      <select
                        value={annCategory}
                        onChange={(e) => setAnnCategory(e.target.value as any)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="notice">General Notice</option>
                        <option value="agm">AGM Announcement</option>
                        <option value="dividend">Dividend Declaration</option>
                        <option value="loan_window">Loan Window Announcement</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Date</label>
                      <input
                        type="text"
                        required
                        value={annDate}
                        onChange={(e) => setAnnDate(e.target.value)}
                        placeholder="Current Season 2026"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono-numbers"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Summary (Short Preview)</label>
                      <input
                        type="text"
                        required
                        value={annSummary}
                        onChange={(e) => setAnnSummary(e.target.value)}
                        placeholder="Members are notified that the AGM convened..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block font-bold text-slate-700 mb-1">Full Notice Content</label>
                      <textarea
                        rows={3}
                        value={annContent}
                        onChange={(e) => setAnnContent(e.target.value)}
                        placeholder="Complete details of the announcement..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* News / Bulletin Picture */}
                  <ImageUploader
                    value={annImg}
                    onChange={(url) => setAnnImg(url)}
                    label="News / Bulletin Picture (Upload from Device or URL)"
                    aspectRatio="video"
                    presets={[
                      { label: 'Governance Meeting', url: '/src/assets/images/community_governance_1791989970347.jpg' },
                      { label: 'Farmers / Agri', url: '/src/assets/images/farmers_cooperative_1791989969904.jpg' },
                      { label: 'Banking Hall', url: '/src/assets/images/mbitsemunda_phocas_desk.jpg' },
                      { label: 'Entrepreneur', url: '/src/assets/images/entrepreneur_business_1791989970089.jpg' },
                    ]}
                    helpText="Upload an image that represents this bulletin or news item."
                  />

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsAnnFormOpen(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingAnnId ? 'Update Notice' : 'Publish Notice'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Announcements Grid with Picture Thumbnails */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {announcements.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 bg-white border border-slate-200 rounded-2xl space-y-2 relative group hover:border-emerald-300 transition-all shadow-xs"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                      {a.imageUrl ? (
                        <img src={a.imageUrl} alt={a.titleEn} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-slate-300" />
                        </div>
                      )}
                      {/* Quick image change overlay */}
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleOpenEditAnnouncement(a)}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-white text-slate-900 rounded-lg text-[10px] font-bold hover:bg-emerald-50"
                        >
                          <Camera className="w-3 h-3" />
                          Change Picture
                        </button>
                      </div>
                      {/* Category badge */}
                      <span className="absolute top-2 left-2 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-emerald-700 text-white">
                        {a.category.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs truncate">{a.titleEn}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{a.summaryEn}</p>
                      <span className="text-[10px] text-slate-400 font-mono-numbers mt-1 block">{a.date}</span>
                    </div>

                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-lg border border-slate-200 shadow-xs">
                      <button
                        type="button"
                        onClick={() => handleOpenEditAnnouncement(a)}
                        className="p-1 text-slate-600 hover:text-emerald-700 rounded transition-colors"
                        title="Edit Notice & Picture"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { onDeleteAnnouncement(a.id); }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Delete Notice"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-700 uppercase tracking-wider block">
                    Incoming Member Onboarding &amp; Loan Requests
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Review digital applications submitted by citizens in Gakenke District.
                  </span>
                </div>
                <span className="text-slate-500 text-xs font-mono font-bold">
                  Total: {applications.length} Record{applications.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Ref Code</th>
                      <th className="py-2.5 px-3">Citizen Name</th>
                      <th className="py-2.5 px-3">National ID</th>
                      <th className="py-2.5 px-3">Phone</th>
                      <th className="py-2.5 px-3">Sector</th>
                      <th className="py-2.5 px-3">Target Account / Loan</th>
                      <th className="py-2.5 px-3">Initial / Requested</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono-numbers">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-800 font-mono">{app.appNumber}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{app.fullName}</td>
                        <td className="py-2.5 px-3 text-slate-600">{app.idNumber}</td>
                        <td className="py-2.5 px-3 text-slate-600">{app.phone}</td>
                        <td className="py-2.5 px-3 text-slate-600 capitalize">{app.sector}</td>
                        <td className="py-2.5 px-3 text-slate-700 capitalize">{app.accountType.replace('_', ' ')}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {app.initialAmount.toLocaleString()} RWF
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              app.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1 font-sans">
                            {app.status !== 'approved' && (
                              <button
                                type="button"
                                onClick={() => onUpdateApplicationStatus(app.id, 'approved')}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                Approve
                              </button>
                            )}
                            {app.status !== 'rejected' && (
                              <button
                                type="button"
                                onClick={() => onUpdateApplicationStatus(app.id, 'rejected')}
                                className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteApplication(app.id);
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: CAREERS & JOB VACANCIES */}
          {activeTab === 'careers' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-xs block">
                    Careers &amp; Employment Portal (CRUD)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Publish vacancies, update job requirements, review candidate applications, and manage hiring statuses.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenAddJob}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post New Vacancy</span>
                  </button>
                </div>
              </div>

              {/* Sub-tabs: Vacancies vs Applications */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setCareerSubTab('vacancies')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    careerSubTab === 'vacancies'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Job Vacancies ({jobPostings.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCareerSubTab('applicants')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    careerSubTab === 'applicants'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Received Applications ({jobApplications.length})</span>
                </button>
              </div>

              {/* SUBTAB 1: VACANCIES LIST */}
              {careerSubTab === 'vacancies' && (
                <div className="space-y-4">
                  {/* Vacancy Add/Edit Modal */}
                  {isJobModalOpen && (
                    <form
                      onSubmit={handleSaveJob}
                      className="p-5 bg-slate-50 border border-emerald-200 rounded-2xl space-y-4 animate-in fade-in"
                    >
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                          {editingJobId ? 'Edit Job Vacancy' : 'Create New Job Vacancy'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsJobModalOpen(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Position Title (English) *</label>
                          <input
                            type="text"
                            required
                            value={jobTitleEn}
                            onChange={(e) => setJobTitleEn(e.target.value)}
                            placeholder="e.g. Senior Credit Officer"
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Position Title (Kinyarwanda)</label>
                          <input
                            type="text"
                            value={jobTitleRw}
                            onChange={(e) => setJobTitleRw(e.target.value)}
                            placeholder="e.g. Umukozi Ushinzwe Inguzanyo"
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Department</label>
                          <input
                            type="text"
                            value={jobDeptEn}
                            onChange={(e) => setJobDeptEn(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Employment Type</label>
                          <select
                            value={jobType}
                            onChange={(e) => setJobType(e.target.value as any)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                          >
                            {employmentTypes.length > 0 ? (
                              employmentTypes.map((et) => (
                                <option key={et.id} value={et.key}>{et.labelEn}</option>
                              ))
                            ) : (
                              <>
                                <option value="full_time">Full-Time</option>
                                <option value="part_time">Part-Time</option>
                                <option value="contract">Contract</option>
                                <option value="internship">Internship</option>
                                <option value="volunteer">Volunteer</option>
                              </>
                            )}
                          </select>
                          {employmentTypes.length === 0 && (
                            <p className="text-[10px] text-amber-600 mt-1">ℹ️ Add custom types via the "Employment Types" admin tab to see them here.</p>
                          )}
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Location</label>
                          <input
                            type="text"
                            value={jobLoc}
                            onChange={(e) => setJobLoc(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Deadline</label>
                          <input
                            type="date"
                            value={jobDeadline}
                            onChange={(e) => setJobDeadline(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Salary Range / Scale</label>
                          <input
                            type="text"
                            value={jobSalary}
                            onChange={(e) => setJobSalary(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Hiring Status</label>
                          <select
                            value={jobStatus}
                            onChange={(e) => setJobStatus(e.target.value as any)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                          >
                            <option value="open">Open (Accepting Applications)</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                      </div>

                      <div className="text-xs">
                        <label className="block font-bold text-slate-700 mb-1">Job Description *</label>
                        <textarea
                          rows={2}
                          required
                          value={jobDescEn}
                          onChange={(e) => setJobDescEn(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Requirements (1 per line)</label>
                          <textarea
                            rows={3}
                            value={jobReqsEn}
                            onChange={(e) => setJobReqsEn(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Responsibilities (1 per line)</label>
                          <textarea
                            rows={3}
                            value={jobRespEn}
                            onChange={(e) => setJobRespEn(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => setIsJobModalOpen(false)}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{editingJobId ? 'Update Vacancy' : 'Publish Vacancy'}</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Vacancies Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {jobPostings.map((job) => (
                      <div
                        key={job.id}
                        className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 relative group hover:border-emerald-300 transition-all shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                            {job.departmentEn}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              job.status === 'open'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {job.status === 'open' ? 'Open' : 'Closed'}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-sm leading-snug">
                          {job.titleEn}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {job.descriptionEn}
                        </p>

                        <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex flex-wrap justify-between items-center gap-2">
                          <span>Deadline: <strong>{job.deadline}</strong></span>
                          <span>{job.location}</span>
                        </div>

                        {/* Admin Action Buttons */}
                        <div className="flex items-center justify-end gap-1.5 pt-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditJob(job)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateJobPosting &&
                              onUpdateJobPosting(job.id, {
                                status: job.status === 'open' ? 'closed' : 'open',
                              })
                            }
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            {job.status === 'open' ? 'Close' : 'Open'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteJobPosting && onDeleteJobPosting(job.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                            title="Delete vacancy"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* SUBTAB 2: APPLICATIONS LIST */}
              {careerSubTab === 'applicants' && renderJobApplicantsWorkspace()}
            </div>
          )}

          {/* TAB: DEDICATED JOB APPLICANTS DASHBOARD (CRUD, FILTERS, COMMENTS) */}
          {activeTab === 'job-applicants' && renderJobApplicantsWorkspace()}

          {/* TAB: BRANCHES & OUTPOSTS */}
          {activeTab === 'branches' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-700 uppercase tracking-wider block">Branches &amp; Outposts Manager</span>
                  <span className="text-[11px] text-slate-400">Manage SACCO branches, sub-branches, and their managers.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBranchFormOpen(true)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Branch</span>
                </button>
              </div>

              {isBranchFormOpen && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!branchName.trim()) return;
                    if (editingBranchId) {
                      onUpdateBranch(editingBranchId, {
                        name: branchName.trim(),
                        sector: branchSector.trim() || 'Gakenke',
                        managerName: branchManager.trim() || 'Branch Manager',
                        managerPhone: branchPhone.trim() || '0786422080',
                        locationDetailsEn: branchSector ? `Located in ${branchSector} commercial centre` : 'Central branch office',
                        locationDetailsRw: branchSector ? `Ibiro biherereye mu gasanteri ka ${branchSector}` : 'Ibiro bikuru',
                      });
                    } else {
                      onAddBranch({
                        name: branchName.trim(),
                        sector: branchSector.trim() || 'Gakenke',
                        managerName: branchManager.trim() || 'Branch Manager',
                        managerPhone: branchPhone.trim() || '0786422080',
                        locationDetailsEn: branchSector ? `Located in ${branchSector} commercial centre` : 'Central branch office',
                        locationDetailsRw: branchSector ? `Ibiro biherereye mu gasanteri ka ${branchSector}` : 'Ibiro bikuru',
                        operatingHours: 'Mon - Fri: 8:00 AM - 5:00 PM',
                        cashService: true,
                        momoAgent: true,
                        coordinates: { lat: -1.705, lng: 29.789 }
                      });
                    }
                    setIsBranchFormOpen(false);
                    setEditingBranchId(null);
                    setBranchName('');
                    setBranchSector('');
                    setBranchManager('');
                    setBranchPhone('');
                  }}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
                >
                  <div className="font-bold text-xs text-slate-800">
                    {editingBranchId ? 'Edit Branch Office' : 'Register New Branch Office'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Branch Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rushashi Branch"
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Sector *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rushashi"
                        value={branchSector}
                        onChange={(e) => setBranchSector(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Manager / Rep Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Jean Damascene"
                        value={branchManager}
                        onChange={(e) => setBranchManager(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Phone Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 0788123456"
                        value={branchPhone}
                        onChange={(e) => setBranchPhone(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="submit" className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs">
                      {editingBranchId ? 'Update Branch' : 'Save Branch'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsBranchFormOpen(false);
                        setEditingBranchId(null);
                        setBranchName('');
                        setBranchSector('');
                        setBranchManager('');
                        setBranchPhone('');
                      }}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {branches.map((b) => (
                  <div key={b.id} className="p-3 border border-slate-200 rounded-xl bg-white space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{b.name}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBranchId(b.id);
                            setBranchName(b.name);
                            setBranchSector(b.sector);
                            setBranchManager(b.managerName);
                            setBranchPhone(b.managerPhone || '');
                            setIsBranchFormOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-700 rounded cursor-pointer"
                          title="Edit branch"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteBranch(b.id)}
                          className="p-1 text-slate-400 hover:text-red-700 rounded cursor-pointer"
                          title="Delete branch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500">{b.sector} | Manager: {b.managerName}</p>
                    <div className="space-y-1">
                      {b.subBranches && b.subBranches.map((s: any) => (
                        <div key={s.id} className="text-[10px] bg-slate-50 p-1.5 rounded flex justify-between items-center border border-slate-100">
                          <span>Sub: <strong>{s.name}</strong> ({s.sector || b.sector})</span>
                          <button
                            type="button"
                            onClick={() => onDeleteSubBranch(b.id, s.id)}
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const subName = prompt('Sub-branch name:');
                          if (subName) onAddSubBranch(b.id, { name: subName, sector: b.sector, managerName: b.managerName, phone: b.managerPhone || '' });
                        }}
                        className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
                      >
                        + Add Sub-branch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: EMPLOYMENT TYPES (CRUD) */}
          {activeTab === 'employment-types' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-700 uppercase tracking-wider block">Employment Types Manager</span>
                  <span className="text-[11px] text-slate-400">Define job contract categories (Full-Time, Contract, Internship, Part-Time, etc.). These appear as options when posting vacancies.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEmpTypeFormOpen(true);
                    setEditingEmpTypeId(null);
                    setEmpTypeKey('');
                    setEmpTypeLabelEn('');
                    setEmpTypeLabelRw('');
                    setEmpTypeLabelFr('');
                    setEmpTypeDescription('');
                    setEmpTypeBadgeColor('emerald');
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Type</span>
                </button>
              </div>

              {isEmpTypeFormOpen && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!empTypeKey.trim() || !empTypeLabelEn.trim()) return;
                    const payload = {
                      key: empTypeKey.trim(),
                      labelEn: empTypeLabelEn.trim(),
                      labelRw: empTypeLabelRw.trim() || empTypeLabelEn.trim(),
                      labelFr: empTypeLabelFr.trim() || empTypeLabelEn.trim(),
                      description: empTypeDescription.trim(),
                      badgeColor: empTypeBadgeColor
                    };
                    if (editingEmpTypeId && onUpdateEmploymentType) {
                      onUpdateEmploymentType(editingEmpTypeId, payload);
                    } else if (onAddEmploymentType) {
                      onAddEmploymentType(payload);
                    }
                    setIsEmpTypeFormOpen(false);
                    setEditingEmpTypeId(null);
                  }}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
                >
                  <div className="font-bold text-xs text-slate-800">
                    {editingEmpTypeId ? 'Edit Employment Type' : 'Add New Employment Type'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Key / Identifier *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. full_time"
                        value={empTypeKey}
                        onChange={(e) => setEmpTypeKey(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Badge Color</label>
                      <select
                        value={empTypeBadgeColor}
                        onChange={(e) => setEmpTypeBadgeColor(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      >
                        {['emerald','blue','purple','amber','rose','teal','slate','orange'].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Label (English) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Full-Time"
                        value={empTypeLabelEn}
                        onChange={(e) => setEmpTypeLabelEn(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Label (Kinyarwanda)</label>
                      <input
                        type="text"
                        placeholder="e.g. Igihe Cyose"
                        value={empTypeLabelRw}
                        onChange={(e) => setEmpTypeLabelRw(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Label (Français)</label>
                      <input
                        type="text"
                        placeholder="e.g. Temps Plein"
                        value={empTypeLabelFr}
                        onChange={(e) => setEmpTypeLabelFr(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Permanent full-time staff role with full benefits"
                      value={empTypeDescription}
                      onChange={(e) => setEmpTypeDescription(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="submit" className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer">
                      {editingEmpTypeId ? 'Update Type' : 'Save Type'}
                    </button>
                    <button type="button" onClick={() => { setIsEmpTypeFormOpen(false); setEditingEmpTypeId(null); }}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg cursor-pointer"
                    >Cancel</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {employmentTypes.map((et) => (
                  <div key={et.id} className="p-3.5 border border-slate-200 rounded-xl bg-white space-y-1.5 shadow-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white bg-${et.badgeColor || 'emerald'}-600 mb-1`}>
                          {et.labelEn}
                        </span>
                        <p className="text-[10px] text-slate-500 font-mono">{et.key}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEmpTypeId(et.id);
                            setEmpTypeKey(et.key);
                            setEmpTypeLabelEn(et.labelEn);
                            setEmpTypeLabelRw(et.labelRw || '');
                            setEmpTypeLabelFr(et.labelFr || '');
                            setEmpTypeDescription(et.description || '');
                            setEmpTypeBadgeColor(et.badgeColor || 'emerald');
                            setIsEmpTypeFormOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-700 rounded cursor-pointer"
                        ><Edit2 className="w-3.5 h-3.5" /></button>
                        {onDeleteEmploymentType && (
                          <button
                            type="button"
                            onClick={() => { if (window.confirm(`Delete employment type "${et.labelEn}"?`)) onDeleteEmploymentType(et.id); }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                          ><Trash2 className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                    </div>
                    {et.description && <p className="text-[11px] text-slate-600 italic">{et.description}</p>}
                    <div className="text-[10px] text-slate-400 flex gap-3">
                      <span>RW: {et.labelRw || '—'}</span>
                      <span>FR: {et.labelFr || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
              {employmentTypes.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">No employment types yet. Click "Add Type" to create one.</div>
              )}
            </div>
          )}

          {/* TAB: QUALIFICATIONS (CRUD) */}
          {activeTab === 'qualifications' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-700 uppercase tracking-wider block">Qualifications Manager</span>
                  <span className="text-[11px] text-slate-400">Manage the list of recognized qualifications, degrees, and certifications used in job requirements and candidate screening.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsQualFormOpen(true);
                    setEditingQualId(null);
                    setQualCode('');
                    setQualTitleEn('');
                    setQualTitleRw('');
                    setQualTitleFr('');
                    setQualCategory('degree');
                    setQualMinYears(1);
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Qualification</span>
                </button>
              </div>

              {isQualFormOpen && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!qualCode.trim() || !qualTitleEn.trim()) return;
                    const payload = {
                      code: qualCode.trim(),
                      titleEn: qualTitleEn.trim(),
                      titleRw: qualTitleRw.trim() || qualTitleEn.trim(),
                      titleFr: qualTitleFr.trim() || qualTitleEn.trim(),
                      category: qualCategory,
                      minYearsDefault: qualMinYears
                    };
                    if (editingQualId && onUpdateQualification) {
                      onUpdateQualification(editingQualId, payload);
                    } else if (onAddQualification) {
                      onAddQualification(payload);
                    }
                    setIsQualFormOpen(false);
                    setEditingQualId(null);
                  }}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
                >
                  <div className="font-bold text-xs text-slate-800">
                    {editingQualId ? 'Edit Qualification' : 'Add New Qualification'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Code / Short Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. A0-Fin"
                        value={qualCode}
                        onChange={(e) => setQualCode(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Category</label>
                      <select
                        value={qualCategory}
                        onChange={(e) => setQualCategory(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      >
                        <option value="degree">Degree</option>
                        <option value="diploma">Diploma</option>
                        <option value="certificate">Certificate / TVET</option>
                        <option value="professional">Professional Certification</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Min. Years Exp Required</label>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={qualMinYears}
                        onChange={(e) => setQualMinYears(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Full Title (English) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bachelor's Degree in Finance or Economics"
                      value={qualTitleEn}
                      onChange={(e) => setQualTitleEn(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Full Title (Kinyarwanda)</label>
                      <input
                        type="text"
                        placeholder="Impamyabumenyi ya..."
                        value={qualTitleRw}
                        onChange={(e) => setQualTitleRw(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Full Title (Français)</label>
                      <input
                        type="text"
                        placeholder="Licence / Diplôme en..."
                        value={qualTitleFr}
                        onChange={(e) => setQualTitleFr(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="submit" className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer">
                      {editingQualId ? 'Update Qualification' : 'Save Qualification'}
                    </button>
                    <button type="button" onClick={() => { setIsQualFormOpen(false); setEditingQualId(null); }}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg cursor-pointer"
                    >Cancel</button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {qualifications.map((q) => (
                  <div key={q.id} className="p-3.5 border border-slate-200 rounded-xl bg-white shadow-xs">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 font-mono">{q.code}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 capitalize">{q.category}</span>
                          {q.minYearsDefault !== undefined && (
                            <span className="px-2 py-0.5 rounded text-[10px] text-slate-500 bg-slate-50">{q.minYearsDefault}+ yrs exp</span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-800 mt-1">{q.titleEn}</p>
                        {q.titleRw && <p className="text-[11px] text-slate-400 mt-0.5">{q.titleRw}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingQualId(q.id);
                            setQualCode(q.code);
                            setQualTitleEn(q.titleEn);
                            setQualTitleRw(q.titleRw || '');
                            setQualTitleFr(q.titleFr || '');
                            setQualCategory(q.category || 'degree');
                            setQualMinYears(q.minYearsDefault ?? 1);
                            setIsQualFormOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-700 rounded cursor-pointer"
                        ><Edit2 className="w-3.5 h-3.5" /></button>
                        {onDeleteQualification && (
                          <button
                            type="button"
                            onClick={() => { if (window.confirm(`Delete qualification "${q.code}"?`)) onDeleteQualification(q.id); }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                          ><Trash2 className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {qualifications.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">No qualifications defined yet. Click "Add Qualification" to create one.</div>
              )}
            </div>
          )}

          {/* TAB: COMMUNITY IMPACT STORIES (CRUD) */}
          {activeTab === 'impact' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wider block">Community Impact Stories (CRUD)</span>
                  <span className="text-[11px] text-slate-500">Manage member testimonials, farmer impacts, and enterprise stories displayed on the website.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingStoryId(null);
                    setStoryName('');
                    setStoryRoleEn('Coffee Cooperative Chairperson, Rushashi');
                    setStoryRoleRw("Umuyobozi wa Koperative y'Ikawa, Rushashi");
                    setStoryImage('/src/assets/images/farmers_cooperative_1791989969904.jpg');
                    setStoryQuoteEn('');
                    setStoryQuoteRw('');
                    setStoryMetric('+35% Farmer Harvest Return');
                    setIsStoryFormOpen(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Impact Story</span>
                </button>
              </div>

              {isStoryFormOpen && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!storyName.trim() || !storyQuoteEn.trim()) return;
                    if (editingStoryId && onUpdateCommunityStory) {
                      onUpdateCommunityStory(editingStoryId, {
                        name: storyName.trim(),
                        roleEn: storyRoleEn.trim(),
                        roleRw: storyRoleRw.trim() || storyRoleEn.trim(),
                        image: storyImage,
                        quoteEn: storyQuoteEn.trim(),
                        quoteRw: storyQuoteRw.trim() || storyQuoteEn.trim(),
                        metric: storyMetric.trim(),
                      });
                    } else if (onAddCommunityStory) {
                      onAddCommunityStory({
                        name: storyName.trim(),
                        roleEn: storyRoleEn.trim(),
                        roleRw: storyRoleRw.trim() || storyRoleEn.trim(),
                        image: storyImage,
                        quoteEn: storyQuoteEn.trim(),
                        quoteRw: storyQuoteRw.trim() || storyQuoteEn.trim(),
                        metric: storyMetric.trim(),
                      });
                    }
                    setIsStoryFormOpen(false);
                    setEditingStoryId(null);
                  }}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
                >
                  <div className="font-bold text-xs text-slate-800">
                    {editingStoryId ? 'Edit Community Story' : 'Add New Community Story'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Member / Farmer Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jean Pierre Nshimiyimana"
                        value={storyName}
                        onChange={(e) => setStoryName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Impact Metric Highlight *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. +35% Farmer Harvest Return"
                        value={storyMetric}
                        onChange={(e) => setStoryMetric(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Role / Location (English)</label>
                      <input
                        type="text"
                        placeholder="e.g. Coffee Cooperative Chairperson, Rushashi"
                        value={storyRoleEn}
                        onChange={(e) => setStoryRoleEn(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Role / Location (Kinyarwanda)</label>
                      <input
                        type="text"
                        placeholder="e.g. Umuyobozi wa Koperative y'Ikawa, Rushashi"
                        value={storyRoleRw}
                        onChange={(e) => setStoryRoleRw(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <ImageUploader
                      label="Story / Member Photo"
                      value={storyImage}
                      onChange={setStoryImage}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Testimonial Quote (English) *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Enter what the member achieved with UBUMWE SACCO..."
                      value={storyQuoteEn}
                      onChange={(e) => setStoryQuoteEn(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Testimonial Quote (Kinyarwanda)</label>
                    <textarea
                      rows={2}
                      placeholder="Ubuhamya mu Kinyarwanda..."
                      value={storyQuoteRw}
                      onChange={(e) => setStoryQuoteRw(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button type="submit" className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs">
                      {editingStoryId ? 'Update Story' : 'Save Story'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsStoryFormOpen(false);
                        setEditingStoryId(null);
                      }}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {communityStories.map((story) => (
                  <div key={story.id} className="p-3.5 border border-slate-200 rounded-2xl bg-white space-y-2.5 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={story.image}
                        alt={story.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{story.name}</h4>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStoryId(story.id);
                                setStoryName(story.name);
                                setStoryRoleEn(story.roleEn);
                                setStoryRoleRw(story.roleRw);
                                setStoryImage(story.image);
                                setStoryQuoteEn(story.quoteEn);
                                setStoryQuoteRw(story.quoteRw);
                                setStoryMetric(story.metric);
                                setIsStoryFormOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-emerald-700 rounded cursor-pointer"
                              title="Edit Story"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteCommunityStory && onDeleteCommunityStory(story.id)}
                              className="p-1 text-slate-400 hover:text-red-700 rounded cursor-pointer"
                              title="Delete Story"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{story.roleEn}</p>
                        <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {story.metric}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 italic line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      "{story.quoteEn}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ATTRACTION VIDEOS (CRUD) */}
          {activeTab === 'videos' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wider block">Home Attraction Videos (Optional to Admin)</span>
                  <span className="text-[11px] text-slate-500">
                    Upload engaging videos or paste YouTube/Vimeo links to attract and onboard prospective clients on the Home page.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingVideoId(null);
                    setVideoTitleEn('');
                    setVideoTitleRw('');
                    setVideoDescEn('');
                    setVideoDescRw('');
                    setVideoUrl('');
                    setVideoThumbnailUrl('');
                    setVideoBadge('Client Attraction');
                    setVideoFeatured(true);
                    setIsVideoFormOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload / Add Video</span>
                </button>
              </div>

              {isVideoFormOpen && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!videoTitleEn.trim() || !videoUrl.trim()) return;
                    if (editingVideoId && onUpdateHomeVideo) {
                      onUpdateHomeVideo(editingVideoId, {
                        titleEn: videoTitleEn.trim(),
                        titleRw: videoTitleRw.trim() || videoTitleEn.trim(),
                        descriptionEn: videoDescEn.trim(),
                        descriptionRw: videoDescRw.trim() || videoDescEn.trim(),
                        videoUrl: videoUrl.trim(),
                        thumbnailUrl: videoThumbnailUrl.trim(),
                        badge: videoBadge.trim(),
                        featured: videoFeatured,
                      });
                    } else if (onAddHomeVideo) {
                      onAddHomeVideo({
                        titleEn: videoTitleEn.trim(),
                        titleRw: videoTitleRw.trim() || videoTitleEn.trim(),
                        descriptionEn: videoDescEn.trim(),
                        descriptionRw: videoDescRw.trim() || videoDescEn.trim(),
                        videoUrl: videoUrl.trim(),
                        thumbnailUrl: videoThumbnailUrl.trim(),
                        badge: videoBadge.trim(),
                        featured: videoFeatured,
                      });
                    }
                    setIsVideoFormOpen(false);
                    setEditingVideoId(null);
                  }}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4"
                >
                  <div className="font-bold text-xs text-slate-800">
                    {editingVideoId ? 'Edit Attraction Video' : 'Add New Client Attraction Video'}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Video Title (English) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Empowering Gakenke Farmers with Micro-credit"
                        value={videoTitleEn}
                        onChange={(e) => setVideoTitleEn(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Video Title (Kinyarwanda)</label>
                      <input
                        type="text"
                        placeholder="e.g. Iterambere ry'Abahinzi ba Gakenke binyuze mu Nguzanyo"
                        value={videoTitleRw}
                        onChange={(e) => setVideoTitleRw(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Category Badge</label>
                      <input
                        type="text"
                        placeholder="e.g. Client Attraction / Success Story / How It Works"
                        value={videoBadge}
                        onChange={(e) => setVideoBadge(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Optional Thumbnail Image URL</label>
                      <input
                        type="text"
                        placeholder="e.g. https://... or /src/assets/..."
                        value={videoThumbnailUrl}
                        onChange={(e) => setVideoThumbnailUrl(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Video Uploader (File or URL / YouTube) */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <VideoUploader
                      value={videoUrl}
                      onChange={setVideoUrl}
                      label="Video Source (File Upload or YouTube / MP4 Link) *"
                      helpText="Select an MP4/WebM video file from your computer or paste a direct video / YouTube URL."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Brief Description (English)</label>
                      <textarea
                        rows={2}
                        placeholder="Brief summary to entice viewers..."
                        value={videoDescEn}
                        onChange={(e) => setVideoDescEn(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Brief Description (Kinyarwanda)</label>
                      <textarea
                        rows={2}
                        placeholder="Incamake mu Kinyarwanda..."
                        value={videoDescRw}
                        onChange={(e) => setVideoDescRw(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs">
                      {editingVideoId ? 'Update Video' : 'Save Attraction Video'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsVideoFormOpen(false);
                        setEditingVideoId(null);
                      }}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Videos List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {homeVideos.length === 0 ? (
                  <div className="col-span-full p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-slate-500 text-xs">
                    No client attraction videos uploaded yet. Click <strong>Upload / Add Video</strong> above to add one.
                  </div>
                ) : (
                  homeVideos.map((vid) => (
                    <div key={vid.id} className="p-3.5 border border-slate-200 rounded-2xl bg-white space-y-2.5 shadow-2xs">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{vid.titleEn}</h4>
                          <p className="text-[11px] text-slate-500 truncate">{vid.descriptionEn || 'Client attraction showcase'}</p>
                          {vid.badge && (
                            <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {vid.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingVideoId(vid.id);
                              setVideoTitleEn(vid.titleEn);
                              setVideoTitleRw(vid.titleRw);
                              setVideoDescEn(vid.descriptionEn || '');
                              setVideoDescRw(vid.descriptionRw || '');
                              setVideoUrl(vid.videoUrl);
                              setVideoThumbnailUrl(vid.thumbnailUrl || '');
                              setVideoBadge(vid.badge || 'Client Attraction');
                              setVideoFeatured(vid.featured ?? true);
                              setIsVideoFormOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-emerald-700 rounded cursor-pointer"
                            title="Edit Video"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteHomeVideo && onDeleteHomeVideo(vid.id)}
                            className="p-1 text-slate-400 hover:text-red-700 rounded cursor-pointer"
                            title="Delete Video"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Video Player/Embed Preview */}
                      <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-950">
                        {vid.videoUrl.includes('youtube.com') || vid.videoUrl.includes('youtu.be') ? (
                          <iframe
                            src={
                              vid.videoUrl.includes('watch?v=')
                                ? `https://www.youtube.com/embed/${vid.videoUrl.split('v=')[1]?.split('&')[0]}`
                                : vid.videoUrl.includes('youtu.be/')
                                ? `https://www.youtube.com/embed/${vid.videoUrl.split('youtu.be/')[1]?.split('?')[0]}`
                                : vid.videoUrl
                            }
                            title={vid.titleEn}
                            className="w-full h-full border-0"
                            allowFullScreen
                          />
                        ) : (
                          <video src={vid.videoUrl} controls className="w-full h-full object-cover" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: PARTNERS & SOCIAL MEDIA (CRUD) */}
          {activeTab === 'partners' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Header Banner */}
              <div className="p-4 bg-emerald-950/20 border border-emerald-800/30 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-emerald-600" />
                    <span>Official Partners &amp; Social Media Manager</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage institutional partner organizations and official Ubumwe SACCO social media profiles in the website footer.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenAddPartner}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Partner</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenAddSocial}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Social Media</span>
                  </button>
                  {(onResetPartners || onResetSocialLinks) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Reset Partners & Social Media to official initial defaults (MINECOFIN, BNR, RCA, BRD and official social profiles)?')) {
                          if (onResetPartners) onResetPartners();
                          if (onResetSocialLinks) onResetSocialLinks();
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Reset to defaults"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span className="hidden sm:inline">Reset Defaults</span>
                    </button>
                  )}
                </div>
              </div>

              {/* PARTNER FORM (ADD / EDIT) */}
              {isPartnerFormOpen && (
                <form
                  onSubmit={handleSavePartner}
                  className="p-5 bg-white border-2 border-emerald-500/40 rounded-2xl shadow-sm space-y-4 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="font-bold text-xs text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Landmark className="w-4 h-4 text-emerald-600" />
                      <span>{editingPartnerId ? 'Edit Partner Organization' : 'Add New Partner Organization'}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsPartnerFormOpen(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                    >
                      ✕ Close
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Organization Name * (e.g. MINECOFIN, BNR, RCA, BRD)
                      </label>
                      <input
                        type="text"
                        required
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        placeholder="e.g. MINECOFIN"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Verified Official Website URL *
                      </label>
                      <input
                        type="url"
                        required
                        value={partnerWebsiteUrl}
                        onChange={(e) => setPartnerWebsiteUrl(e.target.value)}
                        placeholder="https://www.minecofin.gov.rw"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Logo Image Uploader */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-xs">
                      Official Partner Logo (Upload or image URL)
                    </label>
                    <ImageUploader
                      value={partnerLogoUrl}
                      onChange={(url) => setPartnerLogoUrl(url)}
                      label="Upload or select logo file"
                    />
                  </div>

                  {/* Visibility & Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={partnerVisible}
                        onChange={(e) => setPartnerVisible(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span>Visible in website footer</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPartnerFormOpen(false)}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{editingPartnerId ? 'Update Partner' : 'Save Partner'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* SOCIAL MEDIA FORM (ADD / EDIT) */}
              {isSocialFormOpen && (
                <form
                  onSubmit={handleSaveSocial}
                  className="p-5 bg-white border-2 border-slate-800/40 rounded-2xl shadow-sm space-y-4 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Share2 className="w-4 h-4 text-slate-700" />
                      <span>{editingSocialId ? 'Edit Social Media Profile' : 'Add Official Social Media Profile'}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsSocialFormOpen(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                    >
                      ✕ Close
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Platform *
                      </label>
                      <select
                        value={socialPlatform}
                        onChange={(e) => {
                          const p = e.target.value as SocialPlatform;
                          setSocialPlatform(p);
                          if (!socialLabel || socialLabel === 'LinkedIn' || socialLabel === 'Facebook' || socialLabel === 'X (Twitter)' || socialLabel === 'Instagram' || socialLabel === 'YouTube' || socialLabel === 'WhatsApp') {
                            const map: Record<string, string> = {
                              linkedin: 'LinkedIn',
                              facebook: 'Facebook',
                              twitter: 'X (Twitter)',
                              instagram: 'Instagram',
                              youtube: 'YouTube',
                              whatsapp: 'WhatsApp',
                              website: 'Official Portal',
                              other: 'Social Media',
                            };
                            setSocialLabel(map[p] || 'Profile');
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="linkedin">LinkedIn</option>
                        <option value="facebook">Facebook</option>
                        <option value="twitter">X (formerly Twitter)</option>
                        <option value="instagram">Instagram</option>
                        <option value="youtube">YouTube</option>
                        <option value="whatsapp">WhatsApp Channel</option>
                        <option value="website">Official Portal</option>
                        <option value="other">Other Link</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Display Label / Tooltip *
                      </label>
                      <input
                        type="text"
                        required
                        value={socialLabel}
                        onChange={(e) => setSocialLabel(e.target.value)}
                        placeholder="e.g. LinkedIn"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Exact Official Profile URL *
                      </label>
                      <input
                        type="url"
                        required
                        value={socialUrl}
                        onChange={(e) => setSocialUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Visibility & Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={socialVisible}
                        onChange={(e) => setSocialVisible(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span>Visible in website footer</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsSocialFormOpen(false)}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{editingSocialId ? 'Update Social Link' : 'Save Social Link'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* 1. PARTNERS LIST */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-emerald-700" />
                    <span>Official Partner Organizations ({partners.length})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleOpenAddPartner}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Partner</span>
                  </button>
                </div>

                {partners.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500">
                    No partners currently listed. Click &quot;Add Partner&quot; or &quot;Reset Defaults&quot; to restore defaults.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {partners.map((partner) => (
                      <div
                        key={partner.id}
                        className={`p-4 bg-white border rounded-2xl transition-all space-y-3 flex flex-col justify-between ${
                          partner.visible === false ? 'opacity-50 border-slate-200' : 'border-slate-200 hover:border-emerald-400 hover:shadow-sm'
                        }`}
                      >
                        {/* Logo Preview */}
                        <div className="bg-slate-100 rounded-xl p-3 flex items-center justify-center min-h-[70px] border border-slate-200">
                          {partner.logoUrl ? (
                            <img
                              src={partner.logoUrl}
                              alt={partner.name}
                              className="h-10 w-auto object-contain max-w-[120px]"
                            />
                          ) : (
                            <span className="text-xs font-bold text-slate-700">{partner.name}</span>
                          )}
                        </div>

                        {/* Partner Details */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm">{partner.name}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                partner.visible !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {partner.visible !== false ? 'Active' : 'Hidden'}
                            </span>
                          </div>
                          <a
                            href={partner.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 truncate"
                            title={partner.websiteUrl}
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">{partner.websiteUrl}</span>
                          </a>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              if (onUpdatePartner) {
                                onUpdatePartner(partner.id, { visible: partner.visible === false ? true : false });
                              }
                            }}
                            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                          >
                            {partner.visible === false ? <Eye className="w-3.5 h-3.5 text-slate-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                            <span>{partner.visible === false ? 'Show' : 'Hide'}</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditPartner(partner)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit partner"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete partner ${partner.name}?`)) {
                                  if (onDeletePartner) onDeletePartner(partner.id);
                                }
                              }}
                              className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete partner"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. SOCIAL MEDIA PROFILES LIST */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-slate-700" />
                    <span>Official Social Media Profiles ({socialLinks.length})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleOpenAddSocial}
                    className="text-xs text-slate-800 hover:text-black font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Profile</span>
                  </button>
                </div>

                {socialLinks.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500">
                    No social media profiles added. Click &quot;Add Social Media&quot; to add links.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {socialLinks.map((social) => {
                      const getPlatformIcon = () => {
                        switch (social.platform) {
                          case 'linkedin':
                            return <Linkedin className="w-4 h-4 text-[#0077B5]" />;
                          case 'facebook':
                            return <Facebook className="w-4 h-4 text-[#1877F2]" />;
                          case 'twitter':
                            return <X className="w-4 h-4 text-[#000000]" />;
                          case 'instagram':
                            return <Instagram className="w-4 h-4 text-[#E1306C]" />;
                          case 'youtube':
                            return <Youtube className="w-4 h-4 text-[#FF0000]" />;
                          case 'whatsapp':
                            return <MessageCircle className="w-4 h-4 text-[#25D366]" />;
                          default:
                            return <Globe className="w-4 h-4 text-slate-600" />;
                        }
                      };

                      return (
                        <div
                          key={social.id}
                          className={`p-4 bg-white border rounded-2xl transition-all space-y-3 flex flex-col justify-between ${
                            social.visible === false ? 'opacity-50 border-slate-200' : 'border-slate-200 hover:border-slate-400 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                              {getPlatformIcon()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 text-xs truncate">{social.label}</span>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                    social.visible !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                                  }`}
                                >
                                  {social.visible !== false ? 'Active' : 'Hidden'}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 uppercase font-semibold">{social.platform}</span>
                            </div>
                          </div>

                          <div className="text-xs">
                            <a
                              href={social.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-slate-600 hover:text-emerald-700 flex items-center gap-1 truncate"
                              title={social.url}
                            >
                              <ExternalLink className="w-3 h-3 shrink-0 text-slate-400" />
                              <span className="truncate">{social.url}</span>
                            </a>
                          </div>

                          {/* Action buttons */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => {
                                if (onUpdateSocialLink) {
                                  onUpdateSocialLink(social.id, { visible: social.visible === false ? true : false });
                                }
                              }}
                              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                            >
                              {social.visible === false ? <Eye className="w-3.5 h-3.5 text-slate-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                              <span>{social.visible === false ? 'Show' : 'Hide'}</span>
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditSocial(social)}
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Edit profile"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Delete social link ${social.label}?`)) {
                                    if (onDeleteSocialLink) onDeleteSocialLink(social.id);
                                  }
                                }}
                                className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete social link"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: MANAGER MESSAGES (CRUD) */}
          {activeTab === 'messages' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-xs block">
                    Manager &amp; Institutional Messages Manager
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Publish official executive messages on the Home page and About Us page for UBUMWE SACCO GAKENKE.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddMsg}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Message</span>
                </button>
              </div>

              {/* Message Edit / Create Form */}
              {isMsgFormOpen && (
                <form
                  onSubmit={handleSaveMsg}
                  className="p-5 bg-white border border-emerald-300 rounded-2xl shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-xs text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Quote className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{editingMsgId ? 'Edit Executive Message' : 'Create New Executive Message'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsMsgFormOpen(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕ Close
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Title (English) *</label>
                      <input
                        type="text"
                        required
                        value={msgTitleEn}
                        onChange={(e) => setMsgTitleEn(e.target.value)}
                        placeholder="e.g. A Message from Our General Manager"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Title (Kinyarwanda)</label>
                      <input
                        type="text"
                        value={msgTitleRw}
                        onChange={(e) => setMsgTitleRw(e.target.value)}
                        placeholder="e.g. Ubutumwa bwa Umuyobozi Mukuru"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Author Name *</label>
                      <input
                        type="text"
                        required
                        value={msgAuthorName}
                        onChange={(e) => setMsgAuthorName(e.target.value)}
                        placeholder="e.g. Mbitsemunda Phocas"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Role / Designation *</label>
                      <input
                        type="text"
                        required
                        value={msgAuthorRole}
                        onChange={(e) => setMsgAuthorRole(e.target.value)}
                        placeholder="e.g. General Manager, UBUMWE SACCO GAKENKE"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Date / Period</label>
                      <input
                        type="text"
                        value={msgDate}
                        onChange={(e) => setMsgDate(e.target.value)}
                        placeholder="e.g. October 2026"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Author Portrait Image Uploader */}
                  <ImageUploader
                    value={msgImageUrl}
                    onChange={(newUrl) => setMsgImageUrl(newUrl)}
                    label="Author / Manager Portrait Photo"
                    aspectRatio="square"
                    presets={[
                      { label: 'Manager Phocas', url: '/src/assets/images/mbitsemunda_phocas_desk.jpg' },
                      { label: 'Director Wellarse', url: '/src/assets/images/portrait_director_wellars_1791994899049.jpg' },
                      { label: 'Director Bartazal', url: '/src/assets/images/bartazal_speaking.jpg' },
                      { label: 'Banking Hall', url: '/src/assets/images/hero_sacco_banking_1791989969362.jpg' },
                      { label: 'Farmers Coop', url: '/src/assets/images/farmers_cooperative_1791989969904.jpg' },
                    ]}
                    helpText="Upload an image from your device (PNG/JPG) or choose from standard leadership portraits."
                  />

                  {/* Body Text */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Message Body (English) *</label>
                      <textarea
                        rows={4}
                        required
                        value={msgBodyEn}
                        onChange={(e) => setMsgBodyEn(e.target.value)}
                        placeholder="Write the message text in English relating to UBUMWE SACCO GAKENKE..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Message Body (Kinyarwanda)</label>
                      <textarea
                        rows={4}
                        value={msgBodyRw}
                        onChange={(e) => setMsgBodyRw(e.target.value)}
                        placeholder="Andika ubutumwa mu Kinyarwanda bwerekeye UBUMWE SACCO GAKENKE..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Placement & Status Toggles */}
                  <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-700 border-t border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={msgShowHome}
                        onChange={(e) => setMsgShowHome(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span>Show on Home Page</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={msgShowAbout}
                        onChange={(e) => setMsgShowAbout(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span>Show on About Us Page</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={msgActive}
                        onChange={(e) => setMsgActive(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span>Active / Published</span>
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      {editingMsgId ? 'Save Changes' : 'Create Message'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMsgFormOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Messages List */}
              <div className="space-y-3">
                {managerMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      msg.active ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-50 border-slate-200 opacity-75'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                          {msg.imageUrl ? (
                            <img src={msg.imageUrl} alt={msg.authorName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-bold">
                              USG
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{msg.titleEn}</h4>
                            <span className="text-[10px] text-slate-400 font-mono-numbers">({msg.date})</span>
                          </div>
                          <p className="text-xs text-emerald-800 font-semibold">{msg.authorName} · {msg.authorRole}</p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleOpenEditMsg(msg)}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Message"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete message "${msg.titleEn}"?`)) {
                              onDeleteManagerMessage(msg.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed italic my-3 line-clamp-3 pl-3 border-l-2 border-emerald-500">
                      "{msg.bodyEn}"
                    </p>

                    {/* Quick placement toggles */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onUpdateManagerMessage(msg.id, { showOnHome: !msg.showOnHome })}
                          className={`px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                            msg.showOnHome
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          Home: {msg.showOnHome ? '✓ Visible' : 'Hidden'}
                        </button>

                        <button
                          type="button"
                          onClick={() => onUpdateManagerMessage(msg.id, { showOnAbout: !msg.showOnAbout })}
                          className={`px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                            msg.showOnAbout
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          About: {msg.showOnAbout ? '✓ Visible' : 'Hidden'}
                        </button>

                        <button
                          type="button"
                          onClick={() => onUpdateManagerMessage(msg.id, { active: !msg.active })}
                          className={`px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                            msg.active
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          Status: {msg.active ? 'Published' : 'Draft'}
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        ID: {msg.id}
                      </span>
                    </div>
                  </div>
                ))}

                {managerMessages.length === 0 && (
                  <div className="py-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs">
                    No manager messages created yet. Click "+ Add Message" to publish a welcome message.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: INQUIRIES */}
          {activeTab === 'inquiries' && (
            <InquiriesDashboard
              inquiries={contactInquiries}
              onAddInquiry={onAddContactInquiry}
              onUpdateInquiry={onUpdateContactInquiry}
              onDeleteInquiry={onDeleteContactInquiry}
              onResetInquiries={onResetContactInquiries}
              onSendFeedback={onSendContactInquiryFeedback}
              currentLang={currentLang}
              saccoInfo={saccoInfo}
              loggedInUser={loggedInUser}
            />
          )}

          {/* TAB: THEME COLOR */}
          {activeTab === 'theme' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <span className="font-bold text-slate-800 uppercase tracking-wider text-xs block">
                  System Theme Color Customization
                </span>
                <span className="text-[11px] text-slate-500">
                  Select a theme palette. This dynamically transforms header, buttons, ribbons, and badges across the entire system.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {THEME_OPTIONS.map((theme) => {
                  const isSelected = currentTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => onThemeChange(theme.id)}
                      className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-white ring-2 ring-emerald-500 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-5 h-5 rounded-full border border-slate-300 shadow-xs"
                            style={{ backgroundColor: theme.primaryHex }}
                          />
                          <span className="font-bold text-xs text-slate-900">{theme.nameEn}</span>
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="h-2 rounded flex-1" style={{ backgroundColor: theme.primaryHex }} />
                        <div className="h-2 rounded w-8" style={{ backgroundColor: theme.accentHex }} />
                        <div className="h-2 rounded w-6" style={{ backgroundColor: theme.bgLightHex, border: '1px solid #e2e8f0' }} />
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span>{theme.nameRw}</span>
                        <span className="font-mono">{theme.primaryHex}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <span className="font-bold text-slate-800 uppercase tracking-wider text-xs block">
                  Admin CRUD &amp; Customization Quick Reference Guide
                </span>
                <span className="text-[11px] text-slate-500">
                  Complete manual of how to manage pictures, contacts, navigation links, and cooperative data.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Guide 1: Edit Contacts */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 text-xs shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-emerald-700" />
                      <span>1. Edit Phone, Email &amp; WhatsApp</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('contact')}
                      className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 text-[11px]"
                    >
                      <span>Jump</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside text-[11px] leading-relaxed">
                    <li>Go to the <strong>Contacts &amp; Phone</strong> tab.</li>
                    <li>Update phone number (e.g. 0786422080), manager direct line, email, or WhatsApp number.</li>
                    <li>Click <strong>Save Contact Information</strong> to update all links, chat buttons, and headers immediately.</li>
                  </ul>
                </div>

                {/* Guide 2: Upload Pictures */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 text-xs shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-700" />
                      <span>2. Upload or Change Pictures Anywhere</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('pictures')}
                      className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 text-[11px]"
                    >
                      <span>Jump</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside text-[11px] leading-relaxed">
                    <li>Go to <strong>System Pictures</strong> or <strong>Leaders</strong> or <strong>Moments</strong>.</li>
                    <li>Click <strong>Upload from Device</strong> to select any photo file from your phone or PC.</li>
                    <li>Alternatively, enter an image URL or click one of the quick presets.</li>
                  </ul>
                </div>

                {/* Guide 3: Manage Navigation */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 text-xs shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-emerald-700" />
                      <span>3. Manage What is Inside Navs</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('navigation')}
                      className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 text-[11px]"
                    >
                      <span>Jump</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside text-[11px] leading-relaxed">
                    <li>Go to the <strong>Navs Manager</strong> tab.</li>
                    <li>Toggle visibility (show/hide), click the pencil to edit title in English/Kinyarwanda, or delete unnecessary links.</li>
                    <li>Click <strong>+ Add Nav Link</strong> to add custom menu links pointing to any section.</li>
                  </ul>
                </div>

                {/* Guide 4: Edit & Delete Leaders & Moments */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 text-xs shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-700" />
                      <span>4. Edit or Delete Leaders &amp; Moments</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('leaders')}
                      className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 text-[11px]"
                    >
                      <span>Jump</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside text-[11px] leading-relaxed">
                    <li>Click the pencil icon on any item card to edit names, roles, or upload a new photo.</li>
                    <li>Click the red trash can icon to delete any leader, milestone moment, or product.</li>
                    <li>All edits persist permanently in localStorage.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ARCHIVE & BACKUP */}
          {activeTab === 'archive' && (
            <AdminArchive
              onRestore={(collection, data) => {
                const item = data as any;
                switch (collection) {
                  case 'products': if (onAddProduct) onAddProduct(item); break;
                  case 'announcements': if (onAddAnnouncement) onAddAnnouncement(item); break;
                  case 'leaders': if (onAddLeader) onAddLeader(item); break;
                  case 'moments': if (onAddMoment) onAddMoment(item); break;
                  case 'branches': if (onAddBranch) onAddBranch(item); break;
                  case 'job_postings': if (onAddJobPosting) onAddJobPosting(item); break;
                  case 'job_applications': if (onAddJobApplication) onAddJobApplication(item); break;
                  case 'community_stories': if (onAddCommunityStory) onAddCommunityStory(item); break;
                  case 'home_videos': if (onAddHomeVideo) onAddHomeVideo(item); break;
                  case 'home_metrics': if (onAddHomeMetric) onAddHomeMetric(item); break;
                  case 'partners': if (onAddPartner) onAddPartner(item); break;
                  case 'social_links': if (onAddSocialLink) onAddSocialLink(item); break;
                  case 'manager_messages': onAddManagerMessage(item); break;
                  case 'employment_types': if (onAddEmploymentType) onAddEmploymentType(item); break;
                  case 'qualifications': if (onAddQualification) onAddQualification(item); break;
                  case 'nav_items': onAddNavItem(item); break;
                  default: break;
                }
              }}
              onSnapshotRestored={() => window.location.reload()}
            />
          )}

        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-700" />
            <span>
              Executive Session: <strong>{saccoInfo.email}</strong> · Tel: {saccoInfo.phone} · USSD: {saccoInfo.ussdCode}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            Close Console
          </button>
        </div>
      </div>

      {/* Modal: Add Candidate Manually (Manual CRUD Registration) */}
      {isAddApplicantOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full relative shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
            <ImigongoRibbon height={8} variant="light" bordered={false} />

            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Register Job Candidate (Manual CRUD Creation)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddApplicantOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplicantSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">Target Vacancy Position *</label>
                  <select
                    value={newApplicant.jobId}
                    onChange={(e) => {
                      const selected = jobPostings.find((j) => j.id === e.target.value);
                      setNewApplicant({
                        ...newApplicant,
                        jobId: e.target.value,
                        jobTitle: selected ? selected.titleEn : '',
                      });
                    }}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="">-- Select Vacancy --</option>
                    {jobPostings.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.titleEn} ({j.departmentEn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Full Candidate Name *</label>
                  <input
                    type="text"
                    required
                    value={newApplicant.fullName}
                    onChange={(e) => setNewApplicant({ ...newApplicant, fullName: e.target.value })}
                    placeholder="e.g. Marie Claire Mukamana"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Rwandan National ID (16 digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={newApplicant.nationalId}
                    onChange={(e) => setNewApplicant({ ...newApplicant, nationalId: e.target.value.replace(/\D/g, '') })}
                    placeholder="1199..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newApplicant.phone}
                    onChange={(e) => setNewApplicant({ ...newApplicant, phone: e.target.value })}
                    placeholder="078..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newApplicant.email}
                    onChange={(e) => setNewApplicant({ ...newApplicant, email: e.target.value })}
                    placeholder="applicant@gmail.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Residence Sector (Gakenke)</label>
                  <input
                    type="text"
                    value={newApplicant.residenceSector}
                    onChange={(e) => setNewApplicant({ ...newApplicant, residenceSector: e.target.value })}
                    placeholder="e.g. Gakenke, Rushashi, Nemba"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Education Level</label>
                  <input
                    type="text"
                    value={newApplicant.educationLevel}
                    onChange={(e) => setNewApplicant({ ...newApplicant, educationLevel: e.target.value })}
                    placeholder="Bachelor's Degree (A0) in Finance"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={newApplicant.yearsExperience}
                    onChange={(e) => setNewApplicant({ ...newApplicant, yearsExperience: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Initial Application Status *</label>
                  <select
                    value={newApplicant.status}
                    onChange={(e) => setNewApplicant({ ...newApplicant, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="pending">⏳ Pending Review</option>
                    <option value="shortlisted">⭐ Shortlisted</option>
                    <option value="not_shortlisted">❌ Not Shortlisted</option>
                    <option value="interview">📅 Interview Scheduled</option>
                    <option value="accepted">🎉 Hired / Accepted</option>
                    <option value="waitlisted">📋 Waitlisted / Reserve</option>
                    <option value="rejected">🚫 Regret / Rejected</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">Committee Deliberations &amp; Comments (Reserved for Notes)</label>
                  <textarea
                    rows={2}
                    value={newApplicant.comment}
                    onChange={(e) => setNewApplicant({ ...newApplicant, comment: e.target.value, notes: e.target.value })}
                    placeholder="Enter evaluator comments, observations, or hiring committee notes..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">Motivation Statement / Cover Letter</label>
                  <textarea
                    rows={2}
                    value={newApplicant.coverLetter}
                    onChange={(e) => setNewApplicant({ ...newApplicant, coverLetter: e.target.value })}
                    placeholder="Summary of experience and motivation..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Motivation Letter File Upload */}
                <div className="sm:col-span-2">
                  <div className="p-3 bg-blue-50 border border-dashed border-blue-300 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        Attach Motivation Letter File (Any Format — Optional)
                      </span>
                      {newApplicantMotivationFileName && (
                        <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-300">
                          ✓ Attached
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-blue-700">
                      Upload motivation letter on behalf of the candidate: PDF, Word (.doc/.docx), image scan, or any format (max 10MB).
                    </p>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-800 border border-blue-300 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose File</span>
                        <input
                          type="file"
                          accept="*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 10 * 1024 * 1024) { alert('File too large. Max 10MB.'); return; }
                            setNewApplicantMotivationFileName(file.name);
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === 'string') setNewApplicantMotivationFileData(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      <span className="text-xs text-slate-500 truncate">
                        {newApplicantMotivationFileName || 'No file selected'}
                      </span>
                      {newApplicantMotivationFileName && (
                        <button
                          type="button"
                          onClick={() => { setNewApplicantMotivationFileName(''); setNewApplicantMotivationFileData(''); }}
                          className="text-xs text-red-500 hover:text-red-700 font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddApplicantOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Register Candidate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applicant Review & Email Feedback Modal */}
      <ApplicantFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => {
          setIsFeedbackModalOpen(false);
          setFeedbackApplicant(null);
        }}
        applicant={feedbackApplicant}
        currentLang={currentLang}
        onUpdateApplicant={(id, updated) => {
          if (onUpdateJobApplication) onUpdateJobApplication(id, updated);
          else if (onUpdateJobApplicationStatus && updated.status) onUpdateJobApplicationStatus(id, updated.status);
          // Sync feedbackApplicant so modal reflects latest state
          setFeedbackApplicant(prev => prev ? { ...prev, ...updated } : prev);
        }}
        onOpenDossier={(app) => {
          setDossierApplicant(app);
          setIsDossierModalOpen(true);
        }}
      />

      {/* Official PDF Dossier Modal */}
      <ApplicantDossierModal
        isOpen={isDossierModalOpen}
        onClose={() => {
          setIsDossierModalOpen(false);
          setDossierApplicant(null);
        }}
        applicant={dossierApplicant}
        currentLang={currentLang}
      />
    </div>
  );
};

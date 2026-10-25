export type Language = 'en' | 'rw' | 'fr';

export type ThemeColor = 'emerald' | 'ochre' | 'blue' | 'teal' | 'terracotta' | 'charcoal' | 'black';

export interface ThemeOption {
  id: ThemeColor;
  nameEn: string;
  nameRw: string;
  nameFr?: string;
  primaryHex: string;
  accentHex: string;
  bgLightHex: string;
  badgeLabel: string;
}

export interface SaccoProduct {
  id: string;
  category: 'savings' | 'loans' | 'digital';
  titleEn: string;
  titleRw: string;
  titleFr?: string;
  taglineEn: string;
  taglineRw: string;
  taglineFr?: string;
  interestRate: string;
  minAmount: number;
  maxAmount: number;
  duration: string;
  featuresEn: string[];
  featuresRw: string[];
  featuresFr?: string[];
  requirementsEn: string[];
  requirementsRw: string[];
  requirementsFr?: string[];
  popular?: boolean;
}

export interface BranchOutpost {
  id: string;
  name: string;
  sector: string;
  locationDetailsEn: string;
  locationDetailsRw: string;
  locationDetailsFr?: string;
  managerName: string;
  managerPhone: string;
  operatingHours: string;
  cashService?: boolean;
  momoAgent?: boolean;
  subBranches?: { id: string; name: string; sector: string; managerName: string; phone: string }[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Announcement {
  id: string;
  titleEn: string;
  titleRw: string;
  titleFr?: string;
  date: string;
  category: 'agm' | 'dividend' | 'loan_window' | 'notice';
  summaryEn: string;
  summaryRw: string;
  summaryFr?: string;
  contentEn: string;
  contentRw: string;
  contentFr?: string;
  imageUrl?: string;
  featuredImage?: string;
  isPublished?: boolean;
}

export interface LeaderMember {
  id: string;
  name: string;
  roleEn: string;
  roleRw: string;
  roleFr?: string;
  category: string;
  qualificationEn: string;
  qualificationRw: string;
  qualificationFr?: string;
  imageUrl: string;
  phone?: string;
}

export interface InstitutionMoment {
  id: string;
  titleEn: string;
  titleRw: string;
  titleFr?: string;
  date: string;
  category: 'agm_dividend' | 'award' | 'community' | 'branch_opening' | 'training';
  imageUrl: string;
  additionalImages?: string[];
  captionEn: string;
  captionRw: string;
  captionFr?: string;
}

export interface ApplicationRecord {
  id: string;
  appNumber: string;
  fullName: string;
  idNumber: string;
  phone: string;
  sector: string;
  accountType: string;
  occupation: string;
  initialAmount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface MemberAccount {
  accountNumber: string;
  holderName: string;
  sector: string;
  accountType: string;
  balanceRwf: number;
  compulsorySavingsRwf: number;
  activeLoanBalanceRwf: number;
  sharesCount: number;
  joinedYear: number;
  phone: string;
  transactions: {
    id: string;
    date: string;
    type: 'deposit' | 'withdrawal' | 'loan_repayment' | 'dividend';
    amount: number;
    channel: 'MoMo' | 'Teller' | 'Agent' | 'Dividend';
    reference: string;
  }[];
}

export interface SaccoContactInfo {
  name: string;
  shortName: string;
  district: string;
  province: string;
  headquarters: string;
  phone: string;
  managerPhone: string;
  email: string;
  supportEmail: string;
  whatsapp: string;
  whatsappMessage: string;
  ussdCode: string;
  operatingHoursEn: string;
  operatingHoursRw: string;
  weekdayHours?: string;
  saturdayHours?: string;
  sundayHours?: string;
  rcaRegistration: string;
  regulatoryLicense?: string;
  bnrLicense?: string;
  oversightLabelEn?: string;
  oversightLabelRw?: string;
  oversightLabelFr?: string;
  licensedLabelEn?: string;
  licensedLabelRw?: string;
  licensedLabelFr?: string;
  activeMembers: number;
  totalSavingsRwf: number;
  totalLoansDisbursedRwf: number;
  annualDividendPercent: number;
  sectorsCovered: number;
  branchesCount: number;
  subBranchesCount?: number;
  yearFounded: number;
}

export interface EmploymentTypeItem {
  id: string;
  key: string;
  labelEn: string;
  labelRw: string;
  labelFr?: string;
  description?: string;
  badgeColor?: string;
}

export interface QualificationItem {
  id: string;
  code: string;
  titleEn: string;
  titleRw: string;
  titleFr?: string;
  category?: 'degree' | 'diploma' | 'certificate' | 'professional' | 'other';
  minYearsDefault?: number;
}

export interface NavItemConfig {
  id: string;
  labelEn: string;
  labelRw: string;
  labelFr?: string;
  targetSection: string;
  visible: boolean;
  isPrimary?: boolean;
}

export interface ManagerMessage {
  id: string;
  titleEn: string;
  titleRw: string;
  titleFr?: string;
  bodyEn: string;
  bodyRw: string;
  bodyFr?: string;
  authorName: string;
  authorRole: string;
  date: string;
  showOnHome: boolean;
  showOnAbout: boolean;
  active: boolean;
  imageUrl?: string;
}

export interface SystemImagesConfig {
  saccoLogo?: string;
  heroBanking: string;
  heroSlides?: string[];
  farmersCoop: string;
  entrepreneur: string;
  governance: string;
  managerPortrait?: string;
  boardChairPortrait?: string;
  bartazalPortrait?: string;
  [key: string]: any;
}

export interface JobPosting {
  id: string;
  titleEn: string;
  titleRw: string;
  titleFr?: string;
  departmentEn: string;
  departmentRw: string;
  departmentFr?: string;
  location: string;
  employmentType: string;
  salaryRange?: string;
  deadline: string;
  status: 'open' | 'closed';
  descriptionEn: string;
  descriptionRw: string;
  descriptionFr?: string;
  requirementsEn: string[];
  requirementsRw: string[];
  requirementsFr?: string[];
  responsibilitiesEn: string[];
  responsibilitiesRw: string[];
  responsibilitiesFr?: string[];
  postedDate: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
  nationalId: string;
  residenceSector: string;
  educationLevel: string;
  yearsExperience: number;
  coverLetter: string;
  cvFileName?: string;
  cvFileData?: string;
  /** Motivation letter file upload (PDF, DOCX, images, any format) */
  motivationLetterFileName?: string;
  motivationLetterFileData?: string;
  appliedDate: string;
  status: 'pending' | 'shortlisted' | 'not_shortlisted' | 'interview' | 'rejected' | 'accepted' | 'waitlisted';
  notes?: string;
  comment?: string;
  comments?: Array<{
    id: string;
    author: string;
    text: string;
    date: string;
  }>;
  verified?: boolean;
  verifiedDetails?: {
    nidValid: boolean;
    phoneValid: boolean;
    documentsValid: boolean;
    verifiedBy?: string;
    verifiedDate?: string;
  };
  rating?: number;
  emailFeedbackSent?: boolean;
  lastFeedbackDate?: string;
  lastFeedbackSubject?: string;
  lastFeedbackMessage?: string;
}
export interface CommunityImpactStory {
  id: string;
  name: string;
  roleEn: string;
  roleRw: string;
  roleFr?: string;
  image: string;
  quoteEn: string;
  quoteRw: string;
  quoteFr?: string;
  metric: string;
}

export interface HomeVideoItem {
  id: string;
  titleEn: string;
  titleRw: string;
  titleFr?: string;
  descriptionEn?: string;
  descriptionRw?: string;
  descriptionFr?: string;
  videoUrl: string; // can be data URL, mp4 url, or YouTube/Vimeo embed
  thumbnailUrl?: string;
  badge?: string;
  featured?: boolean;
}

export interface HeroContentConfig {
  districtBadgeEn: string;
  districtBadgeRw: string;
  headlinePrefixEn: string;
  headlinePrefixRw: string;
  headlineFocusEn: string;
  headlineFocusRw: string;
  headlineSuffixEn: string;
  headlineSuffixRw: string;
  subheadingEn: string;
  subheadingRw: string;
  ctaJoinEn: string;
  ctaJoinRw: string;
  ctaCalculatorEn: string;
  ctaCalculatorRw: string;
}

export interface HomeMetricItem {
  id: string;
  value: string;
  labelEn: string;
  labelRw: string;
  labelFr?: string;
  detailEn: string;
  detailRw: string;
  detailFr?: string;
  iconName: string; // 'users' | 'piggy' | 'landmark' | 'building' | 'shield' | 'trending' | 'award' | 'star'
  colorClass: string;
  bgClass: string;
}

export interface AboutValueItem {
  id: string;
  titleEn: string;
  titleRw: string;
  descEn: string;
  descRw: string;
  iconName: string; // 'heart' | 'shield' | 'target' | 'award' | 'users' | 'check'
}

export interface AboutContentConfig {
  badgeTitleEn: string;
  badgeTitleRw: string;
  mainTitleEn: string;
  mainTitleRw: string;
  subtitleEn: string;
  subtitleRw: string;
  regulationNoticeEn: string;
  regulationNoticeRw: string;
  storyP1En: string;
  storyP1Rw: string;
  storyP2En: string;
  storyP2Rw: string;
  imageUrl?: string;
  imageCaptionEn: string;
  imageCaptionRw: string;
  values: AboutValueItem[];
}

export interface StaffMember {
  id: string;
  nameEn: string;
  nameRw: string;
  roleEn: string;
  roleRw: string;
  email: string;
  phone?: string;
  status: 'active' | 'left';
}

export const INITIAL_STAFF: StaffMember[] = [];

export interface PartnerItem {
  id: string;
  name: string;
  fullName?: string;
  logoUrl: string;
  websiteUrl: string;
  visible?: boolean;
}

export type SocialPlatform = 'linkedin' | 'facebook' | 'twitter' | 'instagram' | 'youtube' | 'whatsapp' | 'website' | 'other';

export interface SocialMediaItem {
  id: string;
  platform: SocialPlatform;
  label: string;
  url: string;
  visible?: boolean;
}

export type InquiryStatus = 'pending' | 'in_review' | 'resolved' | 'archived';
export type InquiryPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface InquiryFeedback {
  id?: string;
  _id?: string;
  senderName: string;
  senderEmail?: string;
  senderRole?: string;
  sentBy?: string | { _id: string; firstName?: string; lastName?: string; email?: string; role?: string };
  message: string;
  createdAt: string;
}

export interface ContactInquiry {
  id: string;
  _id?: string;
  name: string;
  email?: string;
  phone: string;
  subject: string;
  message: string;
  createdAt?: string;
  date?: string;
  recipientEmail?: string;
  status?: InquiryStatus;
  priority?: InquiryPriority;
  notes?: string;
  adminReply?: string;
  feedbacks?: InquiryFeedback[];
  resolvedAt?: string;
  source?: 'website' | 'phone' | 'walk_in' | 'email';
  sector?: string;
  assignedTo?: any;
}



/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Language,
  SaccoProduct,
  LeaderMember,
  Announcement,
  ApplicationRecord,
  InstitutionMoment,
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
  ContactInquiry,
  EmploymentTypeItem,
  QualificationItem,
} from './types';
import {
  SACCO_INFO,
  INITIAL_NAV_ITEMS,
  INITIAL_SYSTEM_IMAGES,
  SACCO_PRODUCTS,
  INITIAL_LEADERS,
  ANNOUNCEMENTS,
  INITIAL_APPLICATIONS,
  INITIAL_MOMENTS,
  THEME_OPTIONS,
  INITIAL_MANAGER_MESSAGES,
  INITIAL_JOB_POSTINGS,
  INITIAL_JOB_APPLICATIONS,
  TESTIMONIALS,
  INITIAL_HERO_CONTENT,
  INITIAL_HOME_METRICS,
  INITIAL_ABOUT_CONTENT,
  INITIAL_PARTNERS,
  INITIAL_SOCIAL_LINKS,
  INITIAL_CONTACT_INQUIRIES,
  INITIAL_EMPLOYMENT_TYPES,
  INITIAL_QUALIFICATIONS,
} from './data/saccoData';
import { BRANCHES_DATA } from './data/saccoData';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Metrics } from './components/Metrics';
import { AboutUs } from './components/AboutUs';
import { ProductCatalog } from './components/ProductCatalog';
import { ManagerMessageCard } from './components/ManagerMessageCard';
import { HomeVideoSection } from './components/HomeVideoSection';

import { BoardAndManagers } from './components/BoardAndManagers';
import { Gallery } from './components/Gallery';
import { PhotoDetailPage } from './components/PhotoDetailPage';
import { CareersSection } from './components/CareersSection';
import { BranchLocator } from './components/BranchLocator';
import { GovernanceAndNews } from './components/GovernanceAndNews';
import { AccountApplicationModal } from './components/AccountApplicationModal';
import { ManagerLoginModal } from './components/ManagerLoginModal';
import { AdminConsoleModal } from './components/AdminConsoleModal';
import { ContactSection } from './components/ContactSection';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { Shield, Phone, ImageIcon, Compass, Settings, LogOut, Quote, Briefcase, Eye, ArrowRight, LayoutGrid, Users, Video, Archive, Layers, UserCheck, Bell } from 'lucide-react';
import { galleryApi, newsApi, careersApi, applicantsApi, inquiryService, getUploadUrl, clearAuthToken } from './services/api';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_lang') as Language;
      if (['en', 'rw', 'fr'].includes(saved)) {
        return saved;
      }
      return 'en';
    } catch {
      return 'en';
    }
  });

  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
    try {
      localStorage.setItem('ubumwe_lang', lang);
    } catch { }
  };

  // Router hooks for navigation syncing and Role-Based Admin Route Protection
  const navigate = useNavigate();
  const location = useLocation();

  // Theme Color State — default: Obsidian Dark Black
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_theme_color') as ThemeColor;
      if (['emerald', 'ochre', 'blue', 'teal', 'terracotta', 'charcoal', 'black'].includes(saved)) {
        // Apply immediately to avoid flash of wrong theme
        document.documentElement.setAttribute('data-theme', saved);
        document.body.setAttribute('data-theme', saved);
        return saved;
      }
      // First-time visit: default to dark black
      document.documentElement.setAttribute('data-theme', 'black');
      document.body.setAttribute('data-theme', 'black');
      return 'black';
    } catch {
      return 'black';
    }
  });

  // Dedicated View Navigation State: 'all' or specific section id ('hero', 'about', 'products', 'leadership', 'announcements', 'gallery', 'careers', 'branches', 'contact')
  const [activeView, setActiveView] = useState<string>('all');

  // Navigation handler using react-router with automatic scroll to top
  const handleNavigateToSection = (sectionId: string) => {
    const targetPath = sectionId === 'all' ? '/' : `/${sectionId}`;
    const currentPath = location.pathname.replace(/^\//, '') || 'all';

    if (currentPath === sectionId || (currentPath === 'all' && (sectionId === 'hero' || sectionId === 'all'))) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } else {
      navigate(targetPath);
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }, 50);
    }
  };


  // Modal Visibility States
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [isManagerLoginModalOpen, setIsManagerLoginModalOpen] = useState(false);
  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = useState(false);
  const [adminConsoleInitialTab, setAdminConsoleInitialTab] = useState<
    'users' | 'contact' | 'pictures' | 'navigation' | 'leaders' | 'moments' | 'products' | 'announcements' | 'applications' | 'careers' | 'job-applicants' | 'theme' | 'guide' | 'branches' | 'inquiries' | 'messages' | 'impact' | 'videos' | 'home-hero' | 'home-metrics' | 'about'
  >('contact');

  // Authentication State (Manager: Mbitsemunda Phocas / Board: Wellarse, Bartazal)
  const [isManagerLoggedIn, setIsManagerLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ubumwe_manager_session') === 'true';
    } catch {
      return false;
    }
  });
  const [managerName, setManagerName] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('ubumwe_manager_name');
      if (stored && !stored.includes('Beata')) {
        return stored;
      }
      return 'Mbitsemunda Phocas (Manager)';
    } catch {
      return 'Mbitsemunda Phocas (Manager)';
    }
  });

  // Logged-in user details (role, permissions) from backend JWT
  const [loggedInUser, setLoggedInUser] = useState<{
    name: string;
    email: string;
    role: string;
    permissions?: string[];
    dashboardUrl?: string;
  } | null>(() => {
    try {
      const stored = localStorage.getItem('ubumwe_auth_user');
      if (stored) return JSON.parse(stored);
      return null;
    } catch {
      return null;
    }
  });

  // ── Role-protected routing: placed AFTER all state declarations to avoid TDZ ──
  useEffect(() => {
    const rawPath = location.pathname.replace(/^\//, '');

    if (rawPath.startsWith('admin')) {
      if (!isManagerLoggedIn) {
        // Not logged in → show login modal and stay on home
        setIsManagerLoginModalOpen(true);
        setActiveView('all');
      } else {
        const role = (
          loggedInUser?.role ||
          localStorage.getItem('ubumwe_user_role') ||
          'ADMIN_IT'
        ).toUpperCase();

        if (rawPath === 'admin/users' || rawPath === 'admin/user-management') {
          setAdminConsoleInitialTab('users');
          setIsAdminConsoleOpen(true);
          setActiveView('all');
        } else if (rawPath === 'admin/recruitment') {
          setAdminConsoleInitialTab('job-applicants');
          setIsAdminConsoleOpen(true);
          setActiveView('careers');
        } else if (rawPath === 'admin/gallery-news') {
          setAdminConsoleInitialTab('moments');
          setIsAdminConsoleOpen(true);
          setActiveView('gallery');
        } else if (rawPath === 'admin/careers') {
          setAdminConsoleInitialTab('careers');
          setIsAdminConsoleOpen(true);
          setActiveView('careers');
        } else if (rawPath === 'admin/management-overview') {
          setAdminConsoleInitialTab('messages');
          setIsAdminConsoleOpen(true);
          setActiveView('leadership');
        } else {
          const defaultTab: any =
            role === 'ADMIN_HR' ? 'job-applicants' :
            role === 'ADMIN'    ? 'moments' :
            role === 'DAF'      ? 'careers' :
            role === 'MD'       ? 'messages' :
            (role === 'ADMIN_IT' || role === 'ADMIN') ? 'users' :
                                  'users';
          setAdminConsoleInitialTab(defaultTab);
          setIsAdminConsoleOpen(true);
          setActiveView('all');
        }
      }
    } else {
      setActiveView(rawPath || 'all');
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isManagerLoggedIn, loggedInUser?.role]);

  // Dynamic Contact & Organization Information
  const [saccoInfo, setSaccoInfo] = useState<SaccoContactInfo>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_sacco_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.email || parsed.email !== 'ubumwesaccogakenke@gmail.com') {
          parsed.email = 'ubumwesaccogakenke@gmail.com';
        }
        if (!parsed.supportEmail || parsed.supportEmail !== 'ubumwesaccogakenke@gmail.com') {
          parsed.supportEmail = 'ubumwesaccogakenke@gmail.com';
        }
        return { ...SACCO_INFO, ...parsed };
      }
      return SACCO_INFO;
    } catch {
      return SACCO_INFO;
    }
  });

  // Dynamic Navigation Items (Ensuring Careers is present)
  const [navItems, setNavItems] = useState<NavItemConfig[]>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_nav_items');
      if (saved) {
        const parsed: NavItemConfig[] = JSON.parse(saved);
        if (!parsed.some((n) => n.id === 'nav-careers' || n.targetSection === 'careers')) {
          // Insert Careers right before Branches
          const branchIdx = parsed.findIndex((n) => n.targetSection === 'branches');
          const insertIdx = branchIdx !== -1 ? branchIdx : parsed.length - 1;
          parsed.splice(insertIdx, 0, {
            id: 'nav-careers',
            labelEn: 'Careers',
            labelRw: 'Imirimo',
            targetSection: 'careers',
            visible: true,
          });
        }
        return parsed;
      }
      return INITIAL_NAV_ITEMS;
    } catch {
      return INITIAL_NAV_ITEMS;
    }
  });

  // Dynamic System Images (Hero, Leaders, Moments, Co-op Photos)
  const [systemImages, setSystemImages] = useState<SystemImagesConfig>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_system_images');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Self-heal stale logo if pointing to non-existent .jpg
        if (parsed.saccoLogo && parsed.saccoLogo.endsWith('.jpg') && parsed.saccoLogo.includes('ubumwe_sacco_logo')) {
          parsed.saccoLogo = INITIAL_SYSTEM_IMAGES.saccoLogo;
        }
        return { ...INITIAL_SYSTEM_IMAGES, ...parsed };
      }
      return INITIAL_SYSTEM_IMAGES;
    } catch {
      return INITIAL_SYSTEM_IMAGES;
    }
  });

  // Dynamic Leaders (Wellarse, Mbitsemunda Phocas, Bartazal)
  const [leaders, setLeaders] = useState<LeaderMember[]>(() => {
    try {
      const version = localStorage.getItem('ubumwe_leaders_version');
      const saved = localStorage.getItem('ubumwe_leaders');
      if (version === 'v5' && saved) {
        return JSON.parse(saved);
      }
      localStorage.setItem('ubumwe_leaders_version', 'v5');
      localStorage.setItem('ubumwe_leaders', JSON.stringify(INITIAL_LEADERS));
      return INITIAL_LEADERS;
    } catch {
      return INITIAL_LEADERS;
    }
  });

  const [products, setProducts] = useState<SaccoProduct[]>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_products');
      return saved ? JSON.parse(saved) : SACCO_PRODUCTS;
    } catch {
      return SACCO_PRODUCTS;
    }
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_announcements');
      return saved ? JSON.parse(saved) : ANNOUNCEMENTS;
    } catch {
      return ANNOUNCEMENTS;
    }
  });

  const [moments, setMoments] = useState<InstitutionMoment[]>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_moments');
      return saved ? JSON.parse(saved) : INITIAL_MOMENTS;
    } catch {
      return INITIAL_MOMENTS;
    }
  });

  // Dedicated photo page route detection: /photos/:id or /photo/:id
  const isPhotoRoute = activeView.startsWith('photos/') || activeView.startsWith('photo/');
  const currentPhotoMomentId = isPhotoRoute ? activeView.replace(/^photos?\//, '') : null;
  const currentPhotoMoment = currentPhotoMomentId
    ? moments.find((m) => m.id === currentPhotoMomentId) || null
    : null;


  const [applications, setApplications] = useState<ApplicationRecord[]>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_applications');
      return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
    } catch {
      return INITIAL_APPLICATIONS;
    }
  });

  const [branches, setBranches] = useState<BranchOutpost[]>(() => {
    try {
      const version = localStorage.getItem('ubumwe_branches_version');
      const saved = localStorage.getItem('ubumwe_branches');
      if (version === 'v19_3' && saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 19) {
          return parsed;
        }
      }
      localStorage.setItem('ubumwe_branches_version', 'v19_3');
      localStorage.setItem('ubumwe_branches', JSON.stringify(BRANCHES_DATA));
      return BRANCHES_DATA;
    } catch {
      return BRANCHES_DATA;
    }
  });

  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_contact_inquiries');
      if (saved) {
        const parsed: ContactInquiry[] = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      }
      return INITIAL_CONTACT_INQUIRIES;
    } catch {
      return INITIAL_CONTACT_INQUIRIES;
    }
  });

  // Dynamic Manager & Leadership Messages
  const [managerMessages, setManagerMessages] = useState<ManagerMessage[]>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_manager_messages');
      return saved ? JSON.parse(saved) : INITIAL_MANAGER_MESSAGES;
    } catch {
      return INITIAL_MANAGER_MESSAGES;
    }
  });

  // Dynamic Employment Types (CRUD by Admin)
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentTypeItem[]>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_employment_types');
      return saved ? JSON.parse(saved) : INITIAL_EMPLOYMENT_TYPES;
    } catch {
      return INITIAL_EMPLOYMENT_TYPES;
    }
  });

  // Dynamic Qualifications (CRUD by Admin)
  const [qualifications, setQualifications] = useState<QualificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_qualifications');
      return saved ? JSON.parse(saved) : INITIAL_QUALIFICATIONS;
    } catch {
      return INITIAL_QUALIFICATIONS;
    }
  });

  // Dynamic Job Postings (Careers)
  const [jobPostings, setJobPostings] = useState<JobPosting[]>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_job_postings');
      return saved ? JSON.parse(saved) : INITIAL_JOB_POSTINGS;
    } catch {
      return INITIAL_JOB_POSTINGS;
    }
  });

  // Dynamic Job Applications Received
  const [jobApplications, setJobApplications] = useState<JobApplication[]>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_job_applications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return INITIAL_JOB_APPLICATIONS;
    } catch {
      return INITIAL_JOB_APPLICATIONS;
    }
  });

  // Dynamic Community Impact Stories (CRUD)
  const [communityStories, setCommunityStories] = useState<CommunityImpactStory[]>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_community_stories');
      return saved ? JSON.parse(saved) : TESTIMONIALS;
    } catch {
      return TESTIMONIALS;
    }
  });

  // Dynamic Client Attraction Videos (Optional on Home Page)
  const [homeVideos, setHomeVideos] = useState<HomeVideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_home_videos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dynamic Hero Content (Headlines, CTA Text)
  const [heroContent, setHeroContent] = useState<HeroContentConfig>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_hero_content');
      return saved ? JSON.parse(saved) : INITIAL_HERO_CONTENT;
    } catch {
      return INITIAL_HERO_CONTENT;
    }
  });

  // Dynamic Home Metrics (CRUD)
  const [homeMetrics, setHomeMetrics] = useState<HomeMetricItem[]>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_home_metrics');
      return saved ? JSON.parse(saved) : INITIAL_HOME_METRICS;
    } catch {
      return INITIAL_HOME_METRICS;
    }
  });

  // Dynamic About Us Content (Story, Values)
  const [aboutContent, setAboutContent] = useState<AboutContentConfig>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_about_content');
      return saved ? JSON.parse(saved) : INITIAL_ABOUT_CONTENT;
    } catch {
      return INITIAL_ABOUT_CONTENT;
    }
  });

  // Dynamic Partners & Collaborators (CRUD)
  const [partners, setPartners] = useState<PartnerItem[]>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_partners');
      if (saved) {
        const parsed: PartnerItem[] = JSON.parse(saved);
        // Always restore bundled asset logoUrl for known partners —
        // localStorage stores plain path strings but Vite hashes asset URLs at build time.
        const restored = parsed.map((item) => {
          const def = INITIAL_PARTNERS.find((p) => p.id === item.id);
          if (def) {
            // Always use the fresh bundled logoUrl for known partners
            return { ...item, logoUrl: def.logoUrl };
          }
          return item;
        });
        // Merge any default partners not yet in localStorage
        INITIAL_PARTNERS.forEach((def) => {
          if (!restored.find((p) => p.id === def.id)) {
            restored.push(def);
          }
        });
        return restored;
      }
      return INITIAL_PARTNERS;
    } catch {
      return INITIAL_PARTNERS;
    }
  });

  // Dynamic Social Media Profiles (CRUD)
  const [socialLinks, setSocialLinks] = useState<SocialMediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_social_links');
      return saved ? JSON.parse(saved) : INITIAL_SOCIAL_LINKS;
    } catch {
      return INITIAL_SOCIAL_LINKS;
    }
  });

  // Pre-fill loan calculator detail state
  const [prefillLoan, setPrefillLoan] = useState<{
    amount: number;
    tenureMonths: number;
    loanType: string;
    monthlyPayment: number;
  } | null>(null);
  const [prefillProductType, setPrefillProductType] = useState<string>('');

  // Save states to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ubumwe_sacco_info', JSON.stringify(saccoInfo));
    } catch (e) {
      console.warn('Unable to save sacco info', e);
    }
  }, [saccoInfo]);

  useEffect(() => {
    try {
      localStorage.setItem('ubumwe_nav_items', JSON.stringify(navItems));
    } catch (e) {
      console.warn('Unable to save nav items', e);
    }
  }, [navItems]);

  useEffect(() => {
    try {
      localStorage.setItem('ubumwe_system_images', JSON.stringify(systemImages));
    } catch (e) {
      console.warn('Unable to save system images', e);
    }
  }, [systemImages]);

  useEffect(() => {
    try {
      localStorage.setItem('ubumwe_leaders', JSON.stringify(leaders));
    } catch (e) {
      console.warn('Unable to save leaders to localStorage', e);
    }
  }, [leaders]);

  useEffect(() => {
    try {
      localStorage.setItem('ubumwe_products', JSON.stringify(products));
    } catch (e) {
      console.warn('Unable to save products to localStorage', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('ubumwe_announcements', JSON.stringify(announcements));
    } catch (e) {
      console.warn('Unable to save announcements to localStorage', e);
    }
  }, [announcements]);

  useEffect(() => {
    try {
      // Try full save first
      localStorage.setItem('ubumwe_moments', JSON.stringify(moments));
    } catch (e) {
      // localStorage quota exceeded — strip large base64 images and save without them
      console.warn('localStorage quota exceeded saving moments; stripping large base64 images', e);
      try {
        const stripped = moments.map((m) => ({
          ...m,
          // Keep base64 only if small (<200KB), otherwise replace with placeholder
          imageUrl: m.imageUrl.startsWith('data:') && m.imageUrl.length > 200000
            ? '/src/assets/images/moment_cooperative_award_1791994900000.jpg'
            : m.imageUrl,
          additionalImages: (m.additionalImages || []).map((img: string) =>
            img.startsWith('data:') && img.length > 200000
              ? '/src/assets/images/moment_cooperative_award_1791994900000.jpg'
              : img
          ),
        }));
        localStorage.setItem('ubumwe_moments', JSON.stringify(stripped));
      } catch {
        console.warn('Unable to save moments even after stripping images');
      }
    }
  }, [moments]);

  useEffect(() => {
    try {
      localStorage.setItem('ubumwe_applications', JSON.stringify(applications));
    } catch (e) {
      console.warn('Unable to save applications to localStorage', e);
    }
  }, [applications]);

  useEffect(() => {
    try {
      localStorage.setItem('ubumwe_branches', JSON.stringify(branches));
    } catch { }

    const subCount = branches.reduce((acc, b) => acc + (b.subBranches ? b.subBranches.length : 0), 0);
    // Synchronize branchesCount & subBranchesCount across saccoInfo and all metrics whenever branches change
    setSaccoInfo((prev) => ({
      ...prev,
      branchesCount: branches.length,
      subBranchesCount: subCount,
      sectorsCovered: 19
    }));
    setHomeMetrics((prevMetrics) =>
      prevMetrics.map((m) => {
        if (m.id === 'metric-4' || m.labelEn.toLowerCase().includes('branch') || m.labelEn.toLowerCase().includes('outpost')) {
          return {
            ...m,
            value: `${branches.length} Branches & ${subCount} Sub-Branches`,
            labelEn: `${branches.length} Branches & ${subCount} Sub-Branches`,
            detailEn: `Covering all 19 Gakenke Sectors with ${subCount} Sub-Branches`
          };
        }
        return m;
      })
    );
  }, [branches]);

  useEffect(() => {
    try {
      localStorage.setItem('ubumwe_employment_types', JSON.stringify(employmentTypes));
    } catch (e) {
      console.warn('Unable to save employment types', e);
    }
  }, [employmentTypes]);

  useEffect(() => {
    try {
      localStorage.setItem('ubumwe_qualifications', JSON.stringify(qualifications));
    } catch (e) {
      console.warn('Unable to save qualifications', e);
    }
  }, [qualifications]);

  useEffect(() => {
    try {
      localStorage.setItem('ubumwe_job_postings', JSON.stringify(jobPostings));
    } catch (e) {
      console.warn('Unable to save job postings', e);
    }
  }, [jobPostings]);

  useEffect(() => {
    try {
      localStorage.setItem('ubumwe_job_applications', JSON.stringify(jobApplications));
    } catch (e) {
      console.warn('Unable to save job applications', e);
    }
  }, [jobApplications]);

  useEffect(() => {
    try {
      localStorage.setItem('ubumwe_community_stories', JSON.stringify(communityStories));
    } catch (e) {
      console.warn('Unable to save community stories', e);
    }
  }, [communityStories]);

  useEffect(() => {
    try {
      localStorage.setItem('ubumwe_home_videos', JSON.stringify(homeVideos));
    } catch (e) {
      console.warn('Unable to save home attraction videos', e);
    }
  }, [homeVideos]);

  useEffect(() => {
    try {
      localStorage.setItem('ubumwe_hero_content', JSON.stringify(heroContent));
    } catch { }
  }, [heroContent]);

  useEffect(() => {
    try {
      localStorage.setItem('ubumwe_home_metrics', JSON.stringify(homeMetrics));
    } catch { }
  }, [homeMetrics]);

  useEffect(() => {
    try {
      localStorage.setItem('ubumwe_about_content', JSON.stringify(aboutContent));
    } catch { }
  }, [aboutContent]);

  useEffect(() => {
    try {
      localStorage.setItem('ubumwe_contact_inquiries', JSON.stringify(contactInquiries));
    } catch { }
  }, [contactInquiries]);

  useEffect(() => {
    try {
      localStorage.setItem('ubumwe_manager_messages', JSON.stringify(managerMessages));
    } catch { }
  }, [managerMessages]);

  useEffect(() => {
    try {
      localStorage.setItem('ubumwe_partners', JSON.stringify(partners));
    } catch { }
  }, [partners]);

  useEffect(() => {
    try {
      localStorage.setItem('ubumwe_social_links', JSON.stringify(socialLinks));
    } catch { }
  }, [socialLinks]);

  useEffect(() => {
    try {
      localStorage.setItem('ubumwe_theme_color', currentTheme);
      document.documentElement.setAttribute('data-theme', currentTheme);
      document.body.setAttribute('data-theme', currentTheme);
    } catch { }
  }, [currentTheme]);

  // ─── Backend Data Sync ────────────────────────────────────────────────────
  // Fetch live gallery items, news/announcements, and careers from the backend
  // API on mount. Falls back to localStorage data gracefully if backend is down.

  const fetchGalleryFromBackend = useCallback(async () => {
    try {
      const res = await galleryApi.list({ isPublished: true, limit: 50 });
      if (res?.data?.items?.length > 0) {
        const mapped: InstitutionMoment[] = res.data.items.map((item) => ({
          id: item.id,
          titleEn: item.title,
          titleRw: item.title,
          captionEn: item.description || item.title,
          captionRw: item.description || item.title,
          imageUrl: item.imageUrl.startsWith('/')
            ? `${window.location.protocol}//${window.location.hostname}:5000${item.imageUrl}`
            : item.imageUrl,
          additionalImages: [],
          category: (['agm_dividend', 'award', 'community', 'branch_opening', 'training'].includes(item.category)
            ? item.category
            : 'community') as any,
          date: item.publishedAt ? new Date(item.publishedAt).toISOString().split('T')[0] : '2026 Season',
        }));
        setMoments(mapped);
      }
    } catch (err) {
      console.warn('[Backend] Gallery fetch failed, using cached data:', (err as Error).message);
    }
  }, []);

  const fetchNewsFromBackend = useCallback(async () => {
    try {
      const res = await newsApi.list({ isPublished: true, limit: 50 });
      if (res?.data?.articles?.length > 0) {
        const mapped: Announcement[] = res.data.articles.map((article) => ({
          id: article.id,
          titleEn: article.title,
          titleRw: article.title,
          summaryEn: article.summary || '',
          summaryRw: article.summary || '',
          contentEn: article.content || '',
          contentRw: article.content || '',
          category: (article.category as any) || 'notice',
          featuredImage: article.featuredImage || '',
          date: article.publishedAt || article.createdAt,
          isPublished: article.isPublished,
        }));
        setAnnouncements(mapped);
      }
    } catch (err) {
      console.warn('[Backend] News fetch failed, using cached data:', (err as Error).message);
    }
  }, []);

  const fetchCareersFromBackend = useCallback(async () => {
    try {
      const res = await careersApi.list({ isPublished: true, limit: 50 });
      if (res?.data?.careers?.length > 0) {
        const mapped: JobPosting[] = res.data.careers.map((career) => {
          const reqs = Array.isArray(career.requirements)
            ? career.requirements
            : typeof career.requirements === 'string'
              ? (career.requirements as string).split('\n').filter(Boolean)
              : [];
          return {
            id: career.id,
            titleEn: career.title,
            titleRw: career.title,
            departmentEn: career.department || 'General Operations',
            departmentRw: career.department || 'Imirimo Rusange',
            location: career.location || 'Gakenke District',
            employmentType: career.employmentType || 'full_time',
            status: career.isPublished !== false ? 'open' : 'closed',
            descriptionEn: career.description || '',
            descriptionRw: career.description || '',
            requirementsEn: reqs,
            requirementsRw: reqs,
            responsibilitiesEn: [],
            responsibilitiesRw: [],
            deadline: career.deadline || '2026-12-31',
            postedDate: career.publishedAt ? new Date(career.publishedAt).toISOString().split('T')[0] : '2026-01-01',
          };
        });
        setJobPostings(mapped);
      }
    } catch (err) {
      console.warn('[Backend] Careers fetch failed, using cached data:', (err as Error).message);
    }
  }, []);

  const fetchApplicantsFromBackend = useCallback(async () => {
    try {
      const res = await applicantsApi.list({ limit: 100 });
      if (res?.data?.applicants && res.data.applicants.length > 0) {
        const mapped: JobApplication[] = res.data.applicants.map((a: any) => ({
          id: a.id || a._id,
          jobId: a.careerId || a.jobId || 'job-general',
          jobTitle: a.jobTitle || 'SACCO Professional Position',
          fullName: a.fullName,
          email: a.email,
          phone: a.phone || '',
          nationalId: a.nationalId || '',
          residenceSector: a.residenceSector || 'Gakenke',
          educationLevel: a.educationLevel || "Bachelor's Degree (A0)",
          yearsExperience: a.yearsExperience || 0,
          coverLetter: a.coverLetter || '',
          cvFileName: a.cvFileName,
          cvFileData: a.cvFileData,
          motivationLetterFileName: a.motivationLetterFileName,
          motivationLetterFileData: a.motivationLetterFileData,
          appliedDate: a.appliedDate ? new Date(a.appliedDate).toISOString().split('T')[0] : new Date(a.createdAt || Date.now()).toISOString().split('T')[0],
          status: a.status || 'pending',
          notes: a.notes,
          comment: a.comment,
        }));
        setJobApplications(mapped);
      }
    } catch {
      // Ignored if unauthenticated or offline
    }
  }, []);

  const fetchInquiriesFromBackend = useCallback(async () => {
    try {
      const res = await inquiryService.getAll({ limit: 150 });
      if (res?.data?.inquiries && res.data.inquiries.length > 0) {
        const mapped: ContactInquiry[] = res.data.inquiries.map((inq: any) => ({
          id: inq.id || inq._id,
          _id: inq._id,
          name: inq.name,
          email: inq.email || '',
          phone: inq.phone || '',
          subject: inq.subject,
          message: inq.message,
          sector: inq.sector || 'Gakenke',
          status: inq.status || 'pending',
          priority: inq.priority || 'medium',
          source: inq.source || 'website',
          notes: inq.notes || '',
          adminReply: inq.adminReply || '',
          feedbacks: inq.feedbacks || [],
          resolvedAt: inq.resolvedAt,
          createdAt: inq.createdAt ? new Date(inq.createdAt).toLocaleString() : inq.date,
          date: inq.date || (inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : ''),
          recipientEmail: inq.recipientEmail || 'ubumwesaccogakenke@gmail.com',
        }));
        setContactInquiries(mapped);
      }
    } catch {
      // Ignored if offline
    }
  }, []);

  // On mount: load live data from backend
  useEffect(() => {
    fetchGalleryFromBackend();
    fetchNewsFromBackend();
    fetchCareersFromBackend();
    fetchApplicantsFromBackend();
    fetchInquiriesFromBackend();
  }, [fetchGalleryFromBackend, fetchNewsFromBackend, fetchCareersFromBackend, fetchApplicantsFromBackend, fetchInquiriesFromBackend]);

  // ─────────────────────────────────────────────────────────────────────────

  // Auth Handlers
  const handleManagerLoginSuccess = (user: { name: string; email: string; role: string; permissions?: string[]; dashboardUrl?: string }) => {
    setIsManagerLoggedIn(true);
    setManagerName(user.name);
    setLoggedInUser(user);
    try {
      localStorage.setItem('ubumwe_manager_session', 'true');
      localStorage.setItem('ubumwe_manager_name', user.name);
      localStorage.setItem('ubumwe_auth_user', JSON.stringify(user));
      localStorage.setItem('ubumwe_user_role', user.role);
    } catch { }
    // Refresh backend data after login so admin sees latest and unpublished items
    fetchGalleryFromBackend();
    fetchNewsFromBackend();
    fetchCareersFromBackend();
    fetchApplicantsFromBackend();
    fetchInquiriesFromBackend();

    // Route to role-specific dashboard and open corresponding Admin Console tab
    const role = (user.role || '').toUpperCase();
    let targetTab: any = 'home-hero';
    let targetRoute = '/admin/dashboard';

    if (role === 'ADMIN_HR') {
      targetTab = 'job-applicants';
      targetRoute = '/admin/recruitment';
    } else if (role === 'ADMIN') {
      targetTab = 'moments';
      targetRoute = '/admin/gallery-news';
    } else if (role === 'DAF') {
      targetTab = 'careers';
      targetRoute = '/admin/careers';
    } else if (role === 'MD') {
      targetTab = 'messages';
      targetRoute = '/admin/management-overview';
    } else {
      targetTab = 'home-hero';
      targetRoute = user.dashboardUrl || '/admin/dashboard';
    }

    setAdminConsoleInitialTab(targetTab);
    setIsAdminConsoleOpen(true);
    navigate(targetRoute);
  };

  const handleManagerLogout = () => {
    setIsManagerLoggedIn(false);
    setLoggedInUser(null);
    clearAuthToken();
    try {
      localStorage.removeItem('ubumwe_manager_session');
      localStorage.removeItem('ubumwe_manager_name');
      localStorage.removeItem('ubumwe_auth_user');
      localStorage.removeItem('ubumwe_user_role');
    } catch { }
    setIsAdminConsoleOpen(false);
    navigate('/');
  };

  const handleOpenAdminConsole = (tab?: string) => {
    if (tab) {
      setAdminConsoleInitialTab(tab as any);
    }
    setIsAdminConsoleOpen(true);
  };

  // Contact Info Handlers
  const handleUpdateSaccoInfo = (updated: Partial<SaccoContactInfo>) => {
    setSaccoInfo((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('ubumwe_sacco_info', JSON.stringify(next));
      } catch { }

      // Cross-sync metrics if related stats changed (e.g. branchesCount, activeMembers)
      if (updated.branchesCount !== undefined || updated.activeMembers !== undefined) {
        setHomeMetrics((prevMetrics) =>
          prevMetrics.map((m) => {
            if (m.id === 'metric-4' && updated.branchesCount !== undefined) {
              return { ...m, value: `${updated.branchesCount} Branches` };
            }
            if (m.id === 'metric-1' && updated.activeMembers !== undefined) {
              return { ...m, value: `${updated.activeMembers.toLocaleString()}+` };
            }
            return m;
          })
        );
      }

      return next;
    });
  };

  // Navigation Items Handlers
  const handleAddNavItem = (newItem: Omit<NavItemConfig, 'id'>) => {
    const itemWithId: NavItemConfig = {
      ...newItem,
      id: `nav-${Date.now()}`,
    };
    setNavItems((prev) => [...prev, itemWithId]);
  };

  const handleUpdateNavItem = (id: string, updated: Partial<NavItemConfig>) => {
    setNavItems((prev) => prev.map((n) => (n.id === id ? { ...n, ...updated } : n)));
  };

  const handleDeleteNavItem = (id: string) => {
    setNavItems((prev) => prev.filter((n) => n.id !== id));
  };

  const handleReorderNavItems = (items: NavItemConfig[]) => {
    setNavItems(items);
  };

  const handleResetNavItems = () => {
    setNavItems(INITIAL_NAV_ITEMS);
  };

  // System Images Handlers
  const handleUpdateSystemImage = (key: string, url: string) => {
    setSystemImages((prev) => {
      const next = { ...prev, [key]: url };
      try {
        localStorage.setItem('ubumwe_system_images', JSON.stringify(next));
      } catch { }
      return next;
    });

    // Cross-sync portraits with leaders list and manager messages
    if (key === 'managerPortrait') {
      setLeaders((prev) =>
        prev.map((l) =>
          l.name.toLowerCase().includes('mbitsemunda') || l.roleEn.toLowerCase().includes('manager')
            ? { ...l, imageUrl: url }
            : l
        )
      );
      setManagerMessages((prev) =>
        prev.map((m) =>
          m.authorName.toLowerCase().includes('mbitsemunda') || m.authorRole.toLowerCase().includes('manager')
            ? { ...m, imageUrl: url }
            : m
        )
      );
    } else if (key === 'boardChairPortrait') {
      setLeaders((prev) =>
        prev.map((l) => (l.name.toLowerCase().includes('wellarse') ? { ...l, imageUrl: url } : l))
      );
      setManagerMessages((prev) =>
        prev.map((m) =>
          m.authorName.toLowerCase().includes('wellarse') || m.authorRole.toLowerCase().includes('chair')
            ? { ...m, imageUrl: url }
            : m
        )
      );
    } else if (key === 'bartazalPortrait') {
      setLeaders((prev) =>
        prev.map((l) => (l.name.toLowerCase().includes('bartazal') ? { ...l, imageUrl: url } : l))
      );
    }
  };

  // CRUD Handlers for Leaders
  const handleAddLeader = (newLeader: Omit<LeaderMember, 'id'>) => {
    const leaderWithId: LeaderMember = {
      ...newLeader,
      id: `lead-${Date.now()}`,
    };
    setLeaders((prev) => [leaderWithId, ...prev]);
  };

  const handleUpdateLeader = (id: string, updated: Partial<LeaderMember>) => {
    let targetLeader: LeaderMember | undefined;
    setLeaders((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          targetLeader = { ...l, ...updated };
          return targetLeader;
        }
        return l;
      })
    );

    // Auto-update to whole similar profile items across the application
    const leader = targetLeader || leaders.find((l) => l.id === id);
    const isMD =
      leader?.category === 'manager' ||
      leader?.roleEn.toLowerCase().includes('manager') ||
      leader?.name.toLowerCase().includes('mbitsemunda');

    const isChair =
      leader?.name.toLowerCase().includes('wellarse') ||
      leader?.roleEn.toLowerCase().includes('chair');

    const isBartazal = leader?.name.toLowerCase().includes('bartazal');

    if (isMD) {
      if (updated.imageUrl) {
        // Auto-update manager system image
        setSystemImages((prev) => ({
          ...prev,
          managerPortrait: updated.imageUrl!,
        }));
        // Auto-update all messages authored by the manager on Home and About pages
        setManagerMessages((prev) =>
          prev.map((m) =>
            m.authorName.toLowerCase().includes('mbitsemunda') ||
            m.authorRole.toLowerCase().includes('manager')
              ? {
                  ...m,
                  imageUrl: updated.imageUrl!,
                  ...(updated.name ? { authorName: updated.name } : {}),
                }
              : m
          )
        );
      }
      if (updated.phone) {
        setSaccoInfo((prev) => ({ ...prev, managerPhone: updated.phone! }));
      }
    } else if (isChair) {
      if (updated.imageUrl) {
        setSystemImages((prev) => ({
          ...prev,
          boardChairPortrait: updated.imageUrl!,
        }));
        setManagerMessages((prev) =>
          prev.map((m) =>
            m.authorName.toLowerCase().includes('wellarse') ||
            m.authorRole.toLowerCase().includes('chair')
              ? {
                  ...m,
                  imageUrl: updated.imageUrl!,
                  ...(updated.name ? { authorName: updated.name } : {}),
                }
              : m
          )
        );
      }
    } else if (isBartazal) {
      if (updated.imageUrl) {
        setSystemImages((prev) => ({
          ...prev,
          bartazalPortrait: updated.imageUrl!,
        }));
      }
    }
  };

  const handleDeleteLeader = (id: string) => {
    setLeaders((prev) => prev.filter((l) => l.id !== id));
  };

  // CRUD Handlers for Products
  const handleAddProduct = (newProduct: Omit<SaccoProduct, 'id'>) => {
    const productWithId: SaccoProduct = {
      ...newProduct,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [productWithId, ...prev]);
  };

  const handleUpdateProduct = (id: string, updated: Partial<SaccoProduct>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // CRUD Handlers for Announcements (Persisted to MongoDB)
  const handleAddAnnouncement = (newAnn: Omit<Announcement, 'id'>) => {
    const tempId = `ann-${Date.now()}`;
    const annWithId: Announcement = {
      ...newAnn,
      id: tempId,
    };
    setAnnouncements((prev) => [annWithId, ...prev]);

    newsApi
      .create({
        title: newAnn.titleEn || newAnn.titleRw,
        summary: newAnn.summaryEn || newAnn.summaryRw,
        content: newAnn.contentEn || newAnn.contentRw,
        category: newAnn.category || 'notice',
        featuredImage: newAnn.featuredImage,
        isPublished: newAnn.isPublished !== false,
      })
      .then((res) => {
        if (res?.data?.article?.id) {
          setAnnouncements((prev) =>
            prev.map((a) => (a.id === tempId ? { ...a, id: res.data.article.id } : a))
          );
        }
      })
      .catch((err) => {
        console.warn('[Backend] Async news save note:', err?.message || err);
      });
  };

  const handleUpdateAnnouncement = (id: string, updated: Partial<Announcement>) => {
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
    if (id && id.length === 24) {
      newsApi
        .update(id, {
          title: updated.titleEn || updated.titleRw,
          summary: updated.summaryEn || updated.summaryRw,
          content: updated.contentEn || updated.contentRw,
          category: updated.category,
          featuredImage: updated.featuredImage,
          isPublished: updated.isPublished,
        })
        .catch((err) => {
          console.warn('[Backend] Async news update note:', err?.message || err);
        });
    }
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    if (id && id.length === 24) {
      newsApi.delete(id).catch((err) => {
        console.warn('[Backend] Async news delete note:', err?.message || err);
      });
    }
  };

  // CRUD Handlers for Moments & Gallery (Persisted to MongoDB)
  const handleAddMoment = (newMoment: Omit<InstitutionMoment, 'id'>) => {
    const tempId = `moment-${Date.now()}`;
    const momentWithId: InstitutionMoment = {
      ...newMoment,
      id: tempId,
    };
    setMoments((prev) => [momentWithId, ...prev]);

    galleryApi
      .create({
        title: newMoment.titleEn || newMoment.titleRw,
        description: newMoment.captionEn || newMoment.captionRw,
        imageUrl: newMoment.imageUrl,
        category: (newMoment.category as any) || 'community',
        isPublished: true,
      })
      .then((res) => {
        if (res?.data?.item?.id) {
          setMoments((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, id: res.data.item.id } : m))
          );
        }
      })
      .catch((err) => {
        console.warn('[Backend] Async gallery save note:', err?.message || err);
      });
  };

  const handleUpdateMoment = (id: string, updated: Partial<InstitutionMoment>) => {
    setMoments((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)));
    if (id && id.length === 24) {
      galleryApi
        .update(id, {
          title: updated.titleEn || updated.titleRw,
          description: updated.captionEn || updated.captionRw,
          imageUrl: updated.imageUrl,
          category: updated.category,
        })
        .catch((err) => {
          console.warn('[Backend] Async gallery update note:', err?.message || err);
        });
    }
  };

  const handleDeleteMoment = (id: string) => {
    setMoments((prev) => prev.filter((m) => m.id !== id));
    if (id && id.length === 24) {
      galleryApi.delete(id).catch((err) => {
        console.warn('[Backend] Async gallery delete note:', err?.message || err);
      });
    }
  };

  // KYC Application Handlers
  const handleUpdateApplicationStatus = (id: string, status: 'approved' | 'rejected') => {
    setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, status } : app)));
  };

  const handleDeleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
  };

  const handleAddBranch = (branch: Omit<BranchOutpost, 'id'>) => {
    const newB = { ...branch, id: `branch-${Date.now()}` };
    setBranches((prev) => {
      const next = [newB, ...prev];
      // Keep saccoInfo.branchesCount and Home Metrics in exact sync
      setSaccoInfo((s) => ({ ...s, branchesCount: next.length }));
      setHomeMetrics((mList) =>
        mList.map((m) => (m.id === 'metric-4' ? { ...m, value: `${next.length} Branches` } : m))
      );
      return next;
    });
  };

  const handleUpdateBranch = (id: string, updated: Partial<BranchOutpost>) => {
    setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
  };

  const handleDeleteBranch = (id: string) => {
    setBranches((prev) => {
      const next = prev.filter((b) => b.id !== id);
      // Keep saccoInfo.branchesCount and Home Metrics in exact sync
      setSaccoInfo((s) => ({ ...s, branchesCount: next.length }));
      setHomeMetrics((mList) =>
        mList.map((m) => (m.id === 'metric-4' ? { ...m, value: `${next.length} Branches` } : m))
      );
      return next;
    });
  };

  const handleAddSubBranch = (branchId: string, sub: { name: string; sector: string; managerName: string; phone: string }) => {
    setBranches((prev) =>
      prev.map((b) => {
        if (b.id === branchId) {
          const subList = b.subBranches || [];
          return { ...b, subBranches: [...subList, { ...sub, id: `sub-${Date.now()}` }] };
        }
        return b;
      })
    );
  };

  const handleDeleteSubBranch = (branchId: string, subId: string) => {
    setBranches((prev) =>
      prev.map((b) => {
        if (b.id === branchId) {
          return { ...b, subBranches: (b.subBranches || []).filter((s) => s.id !== subId) };
        }
        return b;
      })
    );
  };

  const handleUpdateSubBranch = (
    branchId: string,
    subId: string,
    updated: Partial<{ name: string; sector: string; managerName: string; phone: string }>
  ) => {
    setBranches((prev) =>
      prev.map((b) => {
        if (b.id === branchId) {
          const updatedSubs = (b.subBranches || []).map((s) =>
            s.id === subId ? { ...s, ...updated } : s
          );
          return { ...b, subBranches: updatedSubs };
        }
        return b;
      })
    );
  };

  // Employment Types CRUD Handlers
  const handleAddEmploymentType = (emp: Omit<EmploymentTypeItem, 'id'>) => {
    const newEmp: EmploymentTypeItem = {
      ...emp,
      id: `emp-${Date.now()}`
    };
    setEmploymentTypes((prev) => [newEmp, ...prev]);
  };

  const handleUpdateEmploymentType = (id: string, updated: Partial<EmploymentTypeItem>) => {
    setEmploymentTypes((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
  };

  const handleDeleteEmploymentType = (id: string) => {
    setEmploymentTypes((prev) => prev.filter((e) => e.id !== id));
  };

  // Qualifications CRUD Handlers
  const handleAddQualification = (qual: Omit<QualificationItem, 'id'>) => {
    const newQual: QualificationItem = {
      ...qual,
      id: `qual-${Date.now()}`
    };
    setQualifications((prev) => [newQual, ...prev]);
  };

  const handleUpdateQualification = (id: string, updated: Partial<QualificationItem>) => {
    setQualifications((prev) => prev.map((q) => (q.id === id ? { ...q, ...updated } : q)));
  };

  const handleDeleteQualification = (id: string) => {
    setQualifications((prev) => prev.filter((q) => q.id !== id));
  };

  // Contact Inquiries CRUD Handlers (Synchronized with MongoDB Backend API)
  const handleAddContactInquiry = async (inq: Omit<ContactInquiry, 'id'>) => {
    try {
      const res = await inquiryService.create(inq);
      if (res?.data?.inquiry) {
        const created = res.data.inquiry;
        const mapped: ContactInquiry = {
          ...inq,
          id: created.id || created._id,
          _id: created._id,
          createdAt: created.createdAt ? new Date(created.createdAt).toLocaleString() : new Date().toLocaleString(),
          date: created.date || new Date().toLocaleString(),
          status: created.status || inq.status || 'pending',
          feedbacks: created.feedbacks || [],
        };
        setContactInquiries((prev) => [mapped, ...prev]);
        return;
      }
    } catch (err) {
      console.warn('Backend inquiry create failed, fallback to local:', err);
    }
    const newInquiry: ContactInquiry = {
      ...inq,
      id: `inq-${Date.now()}`,
      createdAt: inq.createdAt || new Date().toLocaleString(),
      date: inq.date || new Date().toLocaleString(),
      status: inq.status || 'pending',
    };
    setContactInquiries((prev) => [newInquiry, ...prev]);
  };

  const handleUpdateContactInquiry = async (id: string, updated: Partial<ContactInquiry>) => {
    try {
      await inquiryService.update(id, updated);
    } catch (err) {
      console.warn('Backend inquiry update failed, fallback to local:', err);
    }
    setContactInquiries((prev) => prev.map((i) => (i.id === id || i._id === id ? { ...i, ...updated } : i)));
  };

  const handleDeleteContactInquiry = async (id: string) => {
    try {
      await inquiryService.delete(id);
    } catch (err) {
      console.warn('Backend inquiry delete failed, fallback to local:', err);
    }
    setContactInquiries((prev) => prev.filter((i) => i.id !== id && i._id !== id));
  };

  const handleSendContactInquiryFeedback = async (
    id: string,
    payload: { message: string; newStatus?: string; internalNotes?: string }
  ) => {
    const res = await inquiryService.sendFeedback(id, payload);
    if (res?.data?.inquiry) {
      const updated = res.data.inquiry;
      setContactInquiries((prev) =>
        prev.map((i) =>
          i.id === id || i._id === id
            ? {
                ...i,
                status: updated.status,
                resolvedAt: updated.resolvedAt,
                feedbacks: updated.feedbacks,
                adminReply: updated.adminReply,
                notes: updated.notes || i.notes,
              }
            : i
        )
      );
    }
  };

  const handleResetContactInquiries = () => {
    setContactInquiries(INITIAL_CONTACT_INQUIRIES);
  };

  // Community Impact Stories Handlers (CRUD)
  const handleAddCommunityStory = (story: Omit<CommunityImpactStory, 'id'>) => {
    const newStory: CommunityImpactStory = {
      ...story,
      id: `story-${Date.now()}`,
    };
    setCommunityStories((prev) => [newStory, ...prev]);
  };

  const handleUpdateCommunityStory = (id: string, updated: Partial<CommunityImpactStory>) => {
    setCommunityStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
  };

  const handleDeleteCommunityStory = (id: string) => {
    setCommunityStories((prev) => prev.filter((s) => s.id !== id));
  };

  // Manager Messages Handlers (CRUD)
  const handleAddManagerMessage = (message: Omit<ManagerMessage, 'id'>) => {
    const newMsg = { ...message, id: `msg-${Date.now()}` };
    setManagerMessages((prev) => [newMsg, ...prev]);
  };

  const handleUpdateManagerMessage = (id: string, updated: Partial<ManagerMessage>) => {
    setManagerMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updated } : m))
    );

    // Auto-update to all similar places throughout the application
    if (updated.imageUrl) {
      const msg = managerMessages.find((m) => m.id === id);
      const isMD =
        msg?.authorName.toLowerCase().includes('mbitsemunda') ||
        msg?.authorRole.toLowerCase().includes('manager') ||
        updated.authorName?.toLowerCase().includes('mbitsemunda');

      const isChair =
        msg?.authorName.toLowerCase().includes('wellarse') ||
        msg?.authorRole.toLowerCase().includes('chair') ||
        updated.authorName?.toLowerCase().includes('wellarse');

      if (isMD) {
        setSystemImages((prev) => ({
          ...prev,
          managerPortrait: updated.imageUrl!,
        }));
        setLeaders((prev) =>
          prev.map((l) =>
            l.category === 'manager' ||
            l.name.toLowerCase().includes('mbitsemunda') ||
            l.roleEn.toLowerCase().includes('manager')
              ? {
                  ...l,
                  imageUrl: updated.imageUrl!,
                  ...(updated.authorName ? { name: updated.authorName } : {}),
                }
              : l
          )
        );
      } else if (isChair) {
        setSystemImages((prev) => ({
          ...prev,
          boardChairPortrait: updated.imageUrl!,
        }));
        setLeaders((prev) =>
          prev.map((l) =>
            l.name.toLowerCase().includes('wellarse')
              ? {
                  ...l,
                  imageUrl: updated.imageUrl!,
                  ...(updated.authorName ? { name: updated.authorName } : {}),
                }
              : l
          )
        );
      }
    }
  };

  const handleDeleteManagerMessage = (id: string) => {
    setManagerMessages((prev) => prev.filter((m) => m.id !== id));
  };

  // Dynamic Client Attraction Videos Handlers (CRUD - Optional on Home Page)
  const handleAddHomeVideo = (video: Omit<HomeVideoItem, 'id'>) => {
    const newVid: HomeVideoItem = {
      ...video,
      id: `video-${Date.now()}`,
    };
    setHomeVideos((prev) => [newVid, ...prev]);
  };

  const handleUpdateHomeVideo = (id: string, updated: Partial<HomeVideoItem>) => {
    setHomeVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updated } : v))
    );
  };

  const handleDeleteHomeVideo = (id: string) => {
    setHomeVideos((prev) => prev.filter((v) => v.id !== id));
  };

  // Hero Content Handlers
  const handleUpdateHeroContent = (updated: Partial<HeroContentConfig>) => {
    setHeroContent((prev) => ({ ...prev, ...updated }));
  };

  // Home Metrics CRUD Handlers
  const handleAddHomeMetric = (metric: Omit<HomeMetricItem, 'id'>) => {
    const newMetric: HomeMetricItem = { ...metric, id: `metric-${Date.now()}` };
    setHomeMetrics((prev) => [...prev, newMetric]);
  };

  const handleUpdateHomeMetric = (id: string, updated: Partial<HomeMetricItem>) => {
    setHomeMetrics((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)));
  };

  const handleDeleteHomeMetric = (id: string) => {
    setHomeMetrics((prev) => prev.filter((m) => m.id !== id));
  };

  const handleResetHomeMetrics = () => {
    setHomeMetrics(INITIAL_HOME_METRICS);
  };

  // About Content Handlers
  const handleUpdateAboutContent = (updated: Partial<AboutContentConfig>) => {
    setAboutContent((prev) => ({ ...prev, ...updated }));
  };

  const handleAddAboutValue = (val: Omit<AboutValueItem, 'id'>) => {
    const newVal: AboutValueItem = { ...val, id: `val-${Date.now()}` };
    setAboutContent((prev) => ({ ...prev, values: [...(prev.values || []), newVal] }));
  };

  const handleUpdateAboutValue = (id: string, updated: Partial<AboutValueItem>) => {
    setAboutContent((prev) => ({
      ...prev,
      values: (prev.values || []).map((v) => (v.id === id ? { ...v, ...updated } : v)),
    }));
  };

  const handleDeleteAboutValue = (id: string) => {
    setAboutContent((prev) => ({
      ...prev,
      values: (prev.values || []).filter((v) => v.id !== id),
    }));
  };

  // Partners & Collaborators Handlers (CRUD)
  const handleAddPartner = (partner: Omit<PartnerItem, 'id'>) => {
    const newPartner: PartnerItem = {
      ...partner,
      id: `partner-${Date.now()}`,
    };
    setPartners((prev) => [...prev, newPartner]);
  };

  const handleUpdatePartner = (id: string, updated: Partial<PartnerItem>) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const handleDeletePartner = (id: string) => {
    setPartners((prev) => prev.filter((p) => p.id !== id));
  };

  const handleResetPartners = () => {
    setPartners(INITIAL_PARTNERS);
  };

  // Social Media Profiles Handlers (CRUD)
  const handleAddSocialLink = (social: Omit<SocialMediaItem, 'id'>) => {
    const newSocial: SocialMediaItem = {
      ...social,
      id: `social-${Date.now()}`,
    };
    setSocialLinks((prev) => [...prev, newSocial]);
  };

  const handleUpdateSocialLink = (id: string, updated: Partial<SocialMediaItem>) => {
    setSocialLinks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
  };

  const handleDeleteSocialLink = (id: string) => {
    setSocialLinks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleResetSocialLinks = () => {
    setSocialLinks(INITIAL_SOCIAL_LINKS);
  };

  const homeManagerMessage = managerMessages.find((m) => m.active && m.showOnHome);
  const aboutManagerMessage = managerMessages.find((m) => m.active && m.showOnAbout);

  // Careers & Job Vacancies Handlers (Persisted to MongoDB)
  const handleAddJobPosting = (newJob: Omit<JobPosting, 'id' | 'postedDate'>) => {
    const tempId = `job-${Date.now()}`;
    const jobWithId: JobPosting = {
      ...newJob,
      id: tempId,
      postedDate: new Date().toISOString().split('T')[0],
    };
    setJobPostings((prev) => [jobWithId, ...prev]);

    careersApi
      .create({
        title: newJob.titleEn || newJob.titleRw,
        department: newJob.departmentEn || newJob.departmentRw || 'General Operations',
        location: newJob.location || 'Gakenke District',
        employmentType: newJob.employmentType || 'full_time',
        description: newJob.descriptionEn || newJob.descriptionRw || '',
        requirements: newJob.requirementsEn || [],
        deadline: newJob.deadline,
        isPublished: newJob.status !== 'closed',
      })
      .then((res) => {
        if (res?.data?.career?.id) {
          setJobPostings((prev) =>
            prev.map((j) => (j.id === tempId ? { ...j, id: res.data.career.id } : j))
          );
        }
      })
      .catch((err) => {
        console.warn('[Backend] Async career save note:', err?.message || err);
      });
  };

  const handleUpdateJobPosting = (id: string, updated: Partial<JobPosting>) => {
    setJobPostings((prev) => prev.map((j) => (j.id === id ? { ...j, ...updated } : j)));
    if (id && id.length === 24) {
      careersApi
        .update(id, {
          title: updated.titleEn || updated.titleRw,
          department: updated.departmentEn || updated.departmentRw,
          location: updated.location,
          employmentType: updated.employmentType,
          description: updated.descriptionEn || updated.descriptionRw,
          requirements: updated.requirementsEn,
          deadline: updated.deadline,
          isPublished: updated.status !== 'closed',
        })
        .catch((err) => {
          console.warn('[Backend] Async career update note:', err?.message || err);
        });
    }
  };

  const handleDeleteJobPosting = (id: string) => {
    setJobPostings((prev) => prev.filter((j) => j.id !== id));
    if (id && id.length === 24) {
      careersApi.delete(id).catch((err) => {
        console.warn('[Backend] Async career delete note:', err?.message || err);
      });
    }
  };

  const handleSubmitJobApplication = (app: Omit<JobApplication, 'id' | 'appliedDate' | 'status'>) => {
    const tempId = `job-app-${Date.now()}`;
    const newApp: JobApplication = {
      ...app,
      id: tempId,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    setJobApplications((prev) => [newApp, ...prev]);

    // Asynchronously submit to backend MongoDB
    applicantsApi
      .submit({
        jobId: app.jobId,
        jobTitle: app.jobTitle,
        fullName: app.fullName,
        email: app.email,
        phone: app.phone,
        nationalId: app.nationalId,
        residenceSector: app.residenceSector,
        educationLevel: app.educationLevel,
        yearsExperience: app.yearsExperience,
        coverLetter: app.coverLetter,
        cvFileName: app.cvFileName,
        cvFileData: app.cvFileData,
        motivationLetterFileName: app.motivationLetterFileName,
        motivationLetterFileData: app.motivationLetterFileData,
      })
      .then((res) => {
        if (res?.data?.applicant?.id) {
          setJobApplications((prev) =>
            prev.map((a) => (a.id === tempId ? { ...a, id: res.data.applicant.id } : a))
          );
        }
      })
      .catch((err) => {
        console.warn('[Backend] Async job application submission fallback to local:', err?.message || err);
      });
  };

  const handleUpdateJobApplicationStatus = (id: string, status: JobApplication['status']) => {
    setJobApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    // Asynchronously update status on backend MongoDB
    applicantsApi.updateStatus(id, status).catch((err) => {
      console.warn('[Backend] Async applicant status update note:', err?.message || err);
    });
  };

  const handleUpdateJobApplication = (id: string, updated: Partial<JobApplication>) => {
    setJobApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
  };

  const handleAddJobApplication = (app: Omit<JobApplication, 'id'>) => {
    const newApp: JobApplication = {
      ...app,
      id: `job-app-${Date.now()}`,
    };
    setJobApplications((prev) => [newApp, ...prev]);
  };

  const handleDeleteJobApplication = (id: string) => {
    setJobApplications((prev) => prev.filter((a) => a.id !== id));
  };

  const handleResetJobApplications = () => {
    setJobApplications(INITIAL_JOB_APPLICATIONS);
    try {
      localStorage.setItem('ubumwe_job_applications', JSON.stringify(INITIAL_JOB_APPLICATIONS));
    } catch { }
  };



























  const getSectionTitle = (viewKey: string) => {
    switch (viewKey) {
      case 'hero':
      case 'home':
        return currentLang === 'fr' ? 'Accueil & Bienvenue' : currentLang === 'rw' ? 'Ahabanza' : 'Home & Welcome';
      case 'about':
        return currentLang === 'fr'
          ? 'À Propos · Gouvernance Coopérative'
          : currentLang === 'rw'
          ? "Abo Turibo · Amateka n'Imiyoborere"
          : 'About Us · Cooperative Governance';
      case 'products':
      case 'calculator':
        return currentLang === 'fr'
          ? 'Nos Services & Simulateur de Prêt'
          : currentLang === 'rw'
          ? "Serivisi Zacu n'Imibare y'Inguzanyo"
          : 'Our Services & Loan Calculator';
      case 'leadership':
        return currentLang === 'fr'
          ? "Conseil d'Administration & Direction"
          : currentLang === 'rw'
          ? "Abayobozi n'Abakozi"
          : 'Board of Directors & Management';
      case 'announcements':
      case 'news':
        return currentLang === 'fr'
          ? 'Bulletins Officiels & Presse'
          : currentLang === 'rw'
          ? "Amakuru n'Amatangazo"
          : 'Official News & Press Bulletins';
      case 'gallery':
        return currentLang === 'fr'
          ? 'Galerie & Moments Mémorables'
          : currentLang === 'rw'
          ? "Amafoto y'Ikigo n'Ibihe Byiza"
          : 'Gallery & Memorable Milestones';
      case 'careers':
        return currentLang === 'fr'
          ? 'Carrières & Postes Disponibles'
          : currentLang === 'rw'
          ? "Imirimo n'Amahirwe y'Akazi"
          : 'Careers & Employment Vacancies';
      case 'branches':
        return currentLang === 'fr'
          ? 'Nos Agences & Points de Service'
          : currentLang === 'rw'
          ? "Amashami n'Ibiro by'Imari"
          : 'Branch Locator & Service Outposts';
      case 'contact':
        return currentLang === 'fr'
          ? 'Contactez-nous & Carte des Agences'
          : currentLang === 'rw'
          ? "Twandikire & Ikarita y'Ibiro"
          : 'Contact Us & Headquarter Map';
      default:
        return currentLang === 'fr' ? 'Toutes les Sections' : currentLang === 'rw' ? 'Ibice Byose' : 'All Sections';
    }
  };

  // Calculator / Product Apply Interactions
  const handleApplyWithCalculation = (calc: {
    amount: number;
    tenureMonths: number;
    loanType: string;
    monthlyPayment: number;
  }) => {
    setPrefillLoan(calc);
    setIsMembershipModalOpen(true);
  };

  const handleSelectProductForLoan = (product: SaccoProduct) => {
    handleNavigateToSection('products');
  };

  const handleSelectProductForAccount = (product: SaccoProduct) => {
    setPrefillProductType(product.category);
    setIsMembershipModalOpen(true);
  };

  const handleOpenMembershipModal = () => {
    setPrefillLoan(null);
    setPrefillProductType('');
    setIsMembershipModalOpen(true);
  };

  // User role and capability evaluation
  const currentUserRole = (
    loggedInUser?.role ||
    (isManagerLoggedIn ? localStorage.getItem('ubumwe_user_role') || 'ADMIN_IT' : '')
  ).toUpperCase();

  const isHRUser = currentUserRole === 'ADMIN_HR';
  const isMediaAdminUser = currentUserRole === 'ADMIN';
  const isDAFUser = currentUserRole === 'DAF';
  const isMDUser = currentUserRole === 'MD';
  const isSuperAdminUser = currentUserRole === 'ADMIN_IT' || currentUserRole === 'admin';

  // Granular capability flags based on role
  const canAccessIT = isManagerLoggedIn && isSuperAdminUser;
  const canAccessMedia = isManagerLoggedIn && (isSuperAdminUser || isMediaAdminUser);
  const canAccessRecruitment = isManagerLoggedIn && (isSuperAdminUser || isHRUser || isMDUser);
  const canAccessFinance = isManagerLoggedIn && (isSuperAdminUser || isDAFUser);
  const canAccessLeadership = isManagerLoggedIn && (isSuperAdminUser || isMDUser);
  const canAccessCareers = isManagerLoggedIn && (isSuperAdminUser || isHRUser || isDAFUser || isMDUser);
  const canAccessBranches = isManagerLoggedIn && (isSuperAdminUser || isMediaAdminUser || isDAFUser);

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 ${currentTheme === 'black' ? 'bg-[#09090b] text-zinc-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Universal Top Header with Active Section Highlighting */}
      <Header
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        onOpenMembershipModal={handleOpenMembershipModal}
        onNavigateToSection={handleNavigateToSection}
        isManagerLoggedIn={isManagerLoggedIn}
        managerName={managerName}
        userRole={currentUserRole}
        onOpenAdminConsole={handleOpenAdminConsole}
        onManagerLogout={handleManagerLogout}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        saccoInfo={saccoInfo}
        navItems={navItems}
        systemImages={systemImages}
        onOpenManagerLogin={() => setIsManagerLoginModalOpen(true)}
        activeSection={activeView}
      />


      {/* Main Content Area: Selective Rendering according to clicked navigation item */}
      <main className="flex-1">
        {isPhotoRoute ? (
          <PhotoDetailPage
            moment={currentPhotoMoment}
            allMoments={moments}
            currentLang={currentLang}
            isAdmin={canAccessMedia || canAccessIT}
            onBack={() => {
              navigate('/gallery');
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            }}
            onNavigateMoment={(momentId) => {
              navigate(`/photos/${momentId}`);
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            }}
            onUpdateMoment={handleUpdateMoment}
            onDeleteMoment={handleDeleteMoment}
            onOpenAdminConsole={handleOpenAdminConsole}
          />
        ) : (
          <>
            {/* 1. Home / Hero Section */}
            {(activeView === 'all' || activeView === 'hero') && (
              <>
            <Hero
              currentLang={currentLang}
              onOpenMembershipModal={handleOpenMembershipModal}
              onScrollToCalculator={() => handleNavigateToSection('products')}
              onOpenMomoModal={() => handleNavigateToSection('branches')}
              onScrollToContact={() => handleNavigateToSection('contact')}
              saccoInfo={saccoInfo}
              heroImage={systemImages.heroBanking}
              heroSlides={systemImages.heroSlides}
              heroContent={heroContent}
              isAdmin={canAccessMedia || canAccessIT}
              onOpenAdminConsole={handleOpenAdminConsole}
              onUpdateSlides={(newSlides) => handleUpdateSystemImage('heroSlides', newSlides as any)}
            />

            {/* 4-Column Full-Width Metric Strip */}
            <Metrics
              currentLang={currentLang}
              saccoInfo={saccoInfo}
              metrics={homeMetrics}
              isAdmin={canAccessFinance || canAccessIT}
              onOpenAdminConsole={handleOpenAdminConsole}
              onDeleteMetric={handleDeleteHomeMetric}
              onUpdateSaccoInfo={handleUpdateSaccoInfo}
            />

            {/* Featured Manager Message on Home Page */}
            {homeManagerMessage && (
              <ManagerMessageCard
                message={homeManagerMessage}
                currentLang={currentLang}
                isAdmin={canAccessLeadership || canAccessIT}
                onEdit={() => handleOpenAdminConsole('messages')}
                onUpdateImage={(newUrl) => handleUpdateManagerMessage(homeManagerMessage.id, { imageUrl: newUrl })}
                variant="home"
              />
            )}

            {/* Dynamic Client Attraction Video Showcase (Optional on Home Page) */}
            <HomeVideoSection
              currentLang={currentLang}
              videos={homeVideos}
              isAdmin={canAccessMedia || canAccessIT}
              onOpenAdminConsole={handleOpenAdminConsole}
              onAddVideo={handleAddHomeVideo}
              onDeleteVideo={handleDeleteHomeVideo}
            />
          </>
        )}

        {/* 2. About Us Section (Cooperative History, Licensing, Mission & Leadership Message) */}
        {(activeView === 'all' || activeView === 'about') && (
          <AboutUs
            currentLang={currentLang}
            saccoInfo={saccoInfo}
            aboutContent={aboutContent}
            managerMessage={aboutManagerMessage}
            isAdmin={canAccessLeadership || canAccessMedia || canAccessIT}
            onOpenAdminConsole={handleOpenAdminConsole}
            onUpdateManagerMessage={handleUpdateManagerMessage}
            onDeleteValue={handleDeleteAboutValue}
          />
        )}

        {/* 3. Our Services Section (Savings, Agri Loans, SME Microfinance, USSD *541# & Loan Calculator) */}
        {(activeView === 'all' || activeView === 'products' || activeView === 'calculator') && (
          <ProductCatalog
            currentLang={currentLang}
            products={products}
            isAdmin={canAccessFinance || canAccessIT}
            onOpenAdminConsole={() => handleOpenAdminConsole('products')}
            onSelectProductForLoan={handleSelectProductForLoan}
            onSelectProductForAccount={handleSelectProductForAccount}
            onApplyWithCalculation={handleApplyWithCalculation}
          />
        )}

        {/* 4. Board of Directors & Managers Section (Board Director: WELLARSE, Manager: MBITSEMUNDA PHOCAS, & Admin CRUD) */}
        {(activeView === 'all' || activeView === 'leadership') && (
          <BoardAndManagers
            currentLang={currentLang}
            leaders={leaders}
            isAdmin={canAccessLeadership || canAccessIT}
            onAddLeader={handleAddLeader}
            onUpdateLeader={handleUpdateLeader}
            onDeleteLeader={handleDeleteLeader}
          />
        )}

        {/* 5. Official Announcements, News, & Community Impact Stories for UBUMWE SACCO GAKENKE */}
        {(activeView === 'all' || activeView === 'announcements' || activeView === 'news') && (
          <GovernanceAndNews
            currentLang={currentLang}
            announcements={announcements}
            communityStories={communityStories}
            isAdmin={canAccessMedia || canAccessIT}
            onOpenAdminConsole={handleOpenAdminConsole}
            onAddAnnouncement={handleAddAnnouncement}
            onUpdateAnnouncement={handleUpdateAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            onAddCommunityStory={handleAddCommunityStory}
            onUpdateCommunityStory={handleUpdateCommunityStory}
            onDeleteCommunityStory={handleDeleteCommunityStory}
          />
        )}

        {/* 6. Place where we post Best Moments in our Institution & Gallery */}
        {(activeView === 'all' || activeView === 'gallery') && (
          <Gallery
            currentLang={currentLang}
            moments={moments}
            isAdmin={canAccessMedia || canAccessIT}
            onAddMoment={handleAddMoment}
            onUpdateMoment={handleUpdateMoment}
            onDeleteMoment={handleDeleteMoment}
            onOpenAdminConsole={handleOpenAdminConsole}
          />
        )}

        {/* 7. Careers & Job Postings for UBUMWE SACCO GAKENKE */}
        {(activeView === 'all' || activeView === 'careers' || activeView === 'jobs' || activeView === 'job-applicants') && (
          <CareersSection
            currentLang={currentLang}
            jobPostings={jobPostings}
            jobApplications={jobApplications}
            employmentTypes={employmentTypes}
            isAdmin={canAccessCareers}
            userRole={currentUserRole}
            onOpenAdminConsole={handleOpenAdminConsole}
            onAddJobPosting={handleAddJobPosting}
            onUpdateJobPosting={handleUpdateJobPosting}
            onDeleteJobPosting={handleDeleteJobPosting}
            onSubmitJobApplication={handleSubmitJobApplication}
            onAddJobApplication={handleAddJobApplication}
            onUpdateJobApplicationStatus={handleUpdateJobApplicationStatus}
            onUpdateJobApplication={handleUpdateJobApplication}
            onDeleteJobApplication={handleDeleteJobApplication}
            onResetJobApplications={handleResetJobApplications}
          />
        )}

        {/* 8. Gakenke District Branch & Outpost Directory */}
        {(activeView === 'all' || activeView === 'branches') && (
          <BranchLocator
            currentLang={currentLang}
            branches={branches}
            isAdmin={canAccessBranches || canAccessIT}
            onOpenAdminConsole={handleOpenAdminConsole}
          />
        )}

        {/* 9. Contact Us Section */}
        {(activeView === 'all' || activeView === 'contact') && (
          <ContactSection
            currentLang={currentLang}
            saccoInfo={saccoInfo}
            isAdmin={canAccessIT}
            onOpenAdminConsole={handleOpenAdminConsole}
            onNewInquiry={(inq) => setContactInquiries((prev) => [inq, ...prev])}
          />
        )}
      </>
    )}
  </main>

      {/* Footer with Imigongo Framing, Credentials, Manager Sign In, & Theme Customizer */}
      <Footer
        currentLang={currentLang}
        onNavigateToSection={handleNavigateToSection}
        onOpenMembershipModal={handleOpenMembershipModal}
        isManagerLoggedIn={isManagerLoggedIn}
        managerName={managerName}
        onOpenManagerLogin={() => setIsManagerLoginModalOpen(true)}
        onOpenAdminConsole={handleOpenAdminConsole}
        onManagerLogout={handleManagerLogout}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        saccoInfo={saccoInfo}
        navItems={navItems}
        partners={partners}
        socialLinks={socialLinks}
      />

      {/* Online Membership & Credit Application Modal */}
      <AccountApplicationModal
        isOpen={isMembershipModalOpen}
        onClose={() => {
          setIsMembershipModalOpen(false);
          setPrefillLoan(null);
        }}
        currentLang={currentLang}
        prefillLoan={prefillLoan}
        prefillProductType={prefillProductType}
      />

      {/* Manager Sign In Modal (Accessed Exclusively From Footer) */}
      <ManagerLoginModal
        isOpen={isManagerLoginModalOpen}
        onClose={() => setIsManagerLoginModalOpen(false)}
        onLoginSuccess={handleManagerLoginSuccess}
      />

      {/* Manager / Admin Console (Comprehensive CRUD Hub) */}
      <AdminConsoleModal
        isOpen={isAdminConsoleOpen}
        onClose={() => {
          setIsAdminConsoleOpen(false);
          if (location.pathname.startsWith('/admin')) {
            navigate('/');
          }
        }}
        currentLang={currentLang}
        initialTab={adminConsoleInitialTab}
        loggedInUser={loggedInUser}
        saccoInfo={saccoInfo}
        onUpdateSaccoInfo={handleUpdateSaccoInfo}
        navItems={navItems}
        onAddNavItem={handleAddNavItem}
        onUpdateNavItem={handleUpdateNavItem}
        onDeleteNavItem={handleDeleteNavItem}
        onReorderNavItems={handleReorderNavItems}
        onResetNavItems={handleResetNavItems}
        systemImages={systemImages}
        onUpdateSystemImage={handleUpdateSystemImage}
        products={products}
        announcements={announcements}
        applications={applications}
        moments={moments}
        leaders={leaders}
        currentTheme={currentTheme}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onAddAnnouncement={handleAddAnnouncement}
        onUpdateAnnouncement={handleUpdateAnnouncement}
        onDeleteAnnouncement={handleDeleteAnnouncement}
        onAddMoment={handleAddMoment}
        onUpdateMoment={handleUpdateMoment}
        onDeleteMoment={handleDeleteMoment}
        onAddLeader={handleAddLeader}
        onUpdateLeader={handleUpdateLeader}
        onDeleteLeader={handleDeleteLeader}
        onUpdateApplicationStatus={handleUpdateApplicationStatus}
        onDeleteApplication={handleDeleteApplication}
        onThemeChange={setCurrentTheme}
        branches={branches}
        onAddBranch={handleAddBranch}
        onUpdateBranch={handleUpdateBranch}
        onDeleteBranch={handleDeleteBranch}
        onAddSubBranch={handleAddSubBranch}
        onUpdateSubBranch={handleUpdateSubBranch}
        onDeleteSubBranch={handleDeleteSubBranch}
        employmentTypes={employmentTypes}
        onAddEmploymentType={handleAddEmploymentType}
        onUpdateEmploymentType={handleUpdateEmploymentType}
        onDeleteEmploymentType={handleDeleteEmploymentType}
        qualifications={qualifications}
        onAddQualification={handleAddQualification}
        onUpdateQualification={handleUpdateQualification}
        onDeleteQualification={handleDeleteQualification}
        communityStories={communityStories}
        onAddCommunityStory={handleAddCommunityStory}
        onUpdateCommunityStory={handleUpdateCommunityStory}
        onDeleteCommunityStory={handleDeleteCommunityStory}
        homeVideos={homeVideos}
        onAddHomeVideo={handleAddHomeVideo}
        onUpdateHomeVideo={handleUpdateHomeVideo}
        onDeleteHomeVideo={handleDeleteHomeVideo}
        heroContent={heroContent}
        onUpdateHeroContent={handleUpdateHeroContent}
        homeMetrics={homeMetrics}
        onAddHomeMetric={handleAddHomeMetric}
        onUpdateHomeMetric={handleUpdateHomeMetric}
        onDeleteHomeMetric={handleDeleteHomeMetric}
        onResetHomeMetrics={handleResetHomeMetrics}
        aboutContent={aboutContent}
        onUpdateAboutContent={handleUpdateAboutContent}
        onAddAboutValue={handleAddAboutValue}
        onUpdateAboutValue={handleUpdateAboutValue}
        onDeleteAboutValue={handleDeleteAboutValue}
        contactInquiries={contactInquiries}
        onAddContactInquiry={handleAddContactInquiry}
        onUpdateContactInquiry={handleUpdateContactInquiry}
        onDeleteContactInquiry={handleDeleteContactInquiry}
        onResetContactInquiries={handleResetContactInquiries}
        onSendContactInquiryFeedback={handleSendContactInquiryFeedback}
        managerMessages={managerMessages}
        onAddManagerMessage={handleAddManagerMessage}
        onUpdateManagerMessage={handleUpdateManagerMessage}
        onDeleteManagerMessage={handleDeleteManagerMessage}
        jobPostings={jobPostings}
        jobApplications={jobApplications}
        onAddJobPosting={handleAddJobPosting}
        onUpdateJobPosting={handleUpdateJobPosting}
        onDeleteJobPosting={handleDeleteJobPosting}
        onAddJobApplication={handleAddJobApplication}
        onUpdateJobApplicationStatus={handleUpdateJobApplicationStatus}
        onUpdateJobApplication={handleUpdateJobApplication}
        onDeleteJobApplication={handleDeleteJobApplication}
        onResetJobApplications={handleResetJobApplications}
        partners={partners}
        onAddPartner={handleAddPartner}
        onUpdatePartner={handleUpdatePartner}
        onDeletePartner={handleDeletePartner}
        onResetPartners={handleResetPartners}
        socialLinks={socialLinks}
        onAddSocialLink={handleAddSocialLink}
        onUpdateSocialLink={handleUpdateSocialLink}
        onDeleteSocialLink={handleDeleteSocialLink}
        onResetSocialLinks={handleResetSocialLinks}
      />

      {/* Persistent Floating WhatsApp Quick-Action Widget */}
      <FloatingWhatsApp currentLang={currentLang} saccoInfo={saccoInfo} />

      {/* Active Manager Floating Quick Bar (Strictly Tailored by Staff User Role) */}
      {isManagerLoggedIn && (() => {
        const currentRole = (loggedInUser?.role || localStorage.getItem('ubumwe_user_role') || 'ADMIN_IT').toUpperCase();
        const isHR = currentRole === 'ADMIN_HR';
        const isMediaAdmin = currentRole === 'ADMIN';
        const isDAF = currentRole === 'DAF';
        const isMD = currentRole === 'MD';
        const isSuperAdmin = currentRole === 'ADMIN_IT' || currentRole === 'admin';

        return (
          <aside
            aria-label="Admin quick action bar"
            className="fixed bottom-6 left-6 z-40 bg-slate-900/95 text-white backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-slate-700 flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-3"
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-emerald-400 border-r border-slate-700">
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono">
                {isHR ? 'HR Mode' : isDAF ? 'DAF Mode' : isMD ? 'MD Mode' : isMediaAdmin ? 'Media Admin' : 'IT Admin'}
              </span>
            </div>

            {/* HR Authorized Quick Actions */}
            {(isHR || isSuperAdmin || isMD) && (
              <button
                type="button"
                onClick={() => handleOpenAdminConsole('job-applicants')}
                className="px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ring-1 ring-emerald-500/50"
                title="Manage Job Applicants (Status, Comments, Review, Export)"
              >
                <Users className="w-3 h-3 text-emerald-300" />
                <span>Applicants ({jobApplications.length})</span>
              </button>
            )}

            {(isHR || isDAF || isSuperAdmin || isMD) && (
              <button
                type="button"
                onClick={() => handleOpenAdminConsole('careers')}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-emerald-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Manage Careers & Job Vacancies"
              >
                <Briefcase className="w-3 h-3 text-emerald-400" />
                <span className="hidden md:inline">Vacancies ({jobPostings.length})</span>
              </button>
            )}

            {/* DAF & Finance Authorized Quick Actions */}
            {(isDAF || isSuperAdmin) && (
              <button
                type="button"
                onClick={() => handleOpenAdminConsole('products')}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-emerald-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Manage Financial Products (Savings, Loans, Digital)"
              >
                <Layers className="w-3 h-3 text-emerald-400" />
                <span className="hidden md:inline">Products ({products.length})</span>
              </button>
            )}

            {(isDAF || isSuperAdmin || isMD) && (
              <button
                type="button"
                onClick={() => handleOpenAdminConsole('applications')}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-emerald-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="KYC & Account Loan Applications"
              >
                <UserCheck className="w-3 h-3 text-emerald-400" />
                <span className="hidden md:inline">KYC & Loans ({applications.length})</span>
              </button>
            )}

            {/* Media & Content Admin Actions */}
            {(isMediaAdmin || isSuperAdmin) && (
              <button
                type="button"
                onClick={() => handleOpenAdminConsole('moments')}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-emerald-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Manage Gallery Moments"
              >
                <ImageIcon className="w-3 h-3 text-emerald-400" />
                <span className="hidden md:inline">Gallery ({moments.length})</span>
              </button>
            )}

            {(isMediaAdmin || isSuperAdmin) && (
              <button
                type="button"
                onClick={() => handleOpenAdminConsole('announcements')}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-emerald-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Manage Bulletins & Announcements"
              >
                <Bell className="w-3 h-3 text-emerald-400" />
                <span className="hidden md:inline">Bulletins ({announcements.length})</span>
              </button>
            )}

            {/* MD & Executive Leadership Actions */}
            {(isMD || isSuperAdmin) && (
              <button
                type="button"
                onClick={() => handleOpenAdminConsole('messages')}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-emerald-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Manage Manager & Institutional Messages"
              >
                <Quote className="w-3 h-3 text-emerald-400" />
                <span className="hidden md:inline">Messages</span>
              </button>
            )}

            {/* Super Admin Exclusive User Management & Configuration */}
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => handleOpenAdminConsole('users' as any)}
                className="px-2.5 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ring-1 ring-blue-500/50"
                title="Manage Staff Accounts, Roles & Access Control"
              >
                <Users className="w-3 h-3 text-blue-200" />
                <span>Users &amp; Access</span>
              </button>
            )}

            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => handleOpenAdminConsole('contact')}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-emerald-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Edit Phone Numbers, Email, WhatsApp"
              >
                <Phone className="w-3 h-3 text-emerald-400" />
                <span className="hidden md:inline">Contacts</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleOpenAdminConsole()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Open Role-Authorized Admin Console"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </button>

            <button
              type="button"
              onClick={handleManagerLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer ml-0.5"
              title="Exit Manager Mode"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </aside>
        );
      })()}
    </div>
  );
}

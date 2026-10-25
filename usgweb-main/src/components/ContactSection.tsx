import React, { useState } from 'react';
import { Language, SaccoContactInfo, ContactInquiry } from '../types';
import { SACCO_INFO } from '../data/saccoData';
import { inquiryService } from '../services/api';
import {
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Edit2,
} from 'lucide-react';
import { ImigongoRibbon } from './ImigongoPattern';

export const TARGET_INQUIRY_EMAIL = 'ubumwesaccogakenke@gmail.com';

interface ContactSectionProps {
  currentLang: Language;
  saccoInfo?: SaccoContactInfo;
  isAdmin?: boolean;
  onOpenAdminConsole?: (tab?: string) => void;
  onNewInquiry?: (inquiry: ContactInquiry) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  currentLang,
  saccoInfo = SACCO_INFO,
  isAdmin = false,
  onOpenAdminConsole,
  onNewInquiry,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedDetails, setCopiedDetails] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [subject, setSubject] = useState('general');
  const [message, setMessage] = useState('');
  const [submittedInquiry, setSubmittedInquiry] = useState<ContactInquiry | null>(null);

  const getSubjectLabel = (key: string): string => {
    switch (key) {
      case 'loan':
        return currentLang === 'fr'
          ? 'Demande de Prêt & Conditions'
          : currentLang === 'rw'
          ? 'Gusaba Inguzanyo & Amabwiriza'
          : 'Loan Application & Terms';
      case 'savings':
        return currentLang === 'fr'
          ? 'Épargne & Dépôt à Terme'
          : currentLang === 'rw'
          ? "Kuzigama & Konti y'Igihe Kirekire"
          : 'Fixed Term Deposit & Savings';
      case 'ussd':
        return currentLang === 'fr'
          ? `Support USSD ${saccoInfo.ussdCode} & Banque Mobile`
          : currentLang === 'rw'
          ? `Ubufasha bwa USSD ${saccoInfo.ussdCode}`
          : `USSD ${saccoInfo.ussdCode} & Mobile Banking Support`;
      case 'leadership':
        return currentLang === 'fr'
          ? 'Direction Exécutive (Gérant / Conseil)'
          : currentLang === 'rw'
          ? "Kuvugana n'Ubuyobozi Bukuru"
          : 'Executive Desk (Manager / Board)';
      default:
        return currentLang === 'fr'
          ? 'Demande Générale'
          : currentLang === 'rw'
          ? 'Kubaza Amakuru Rusange'
          : 'General Cooperative Inquiry';
    }
  };

  const getMailtoUrl = (inq: ContactInquiry) => {
    const subj = encodeURIComponent(`[UBUMWE SACCO Inquiry] ${inq.subject} - ${inq.name}`);
    const body = encodeURIComponent(
      `Dear Ubumwe SACCO Inquiry Desk,\n\n` +
      `Member Name: ${inq.name}\n` +
      `Member Email: ${inq.email}\n` +
      `Telephone: ${inq.phone}\n` +
      `Inquiry Topic: ${inq.subject}\n` +
      `Date: ${inq.createdAt || inq.date}\n\n` +
      `Message:\n${inq.message}\n\n` +
      `---\n` +
      `Dispatched directly to: ${TARGET_INQUIRY_EMAIL}\n` +
      `UBUMWE SACCO GAKENKE Direct Member Inquiry Desk`
    );
    return `mailto:${TARGET_INQUIRY_EMAIL}?subject=${subj}&body=${body}`;
  };

  const getGmailUrl = (inq: ContactInquiry) => {
    const subj = encodeURIComponent(`[UBUMWE SACCO Inquiry] ${inq.subject} - ${inq.name}`);
    const body = encodeURIComponent(
      `Dear Ubumwe SACCO Inquiry Desk,\n\n` +
      `Member Name: ${inq.name}\n` +
      `Member Email: ${inq.email}\n` +
      `Telephone: ${inq.phone}\n` +
      `Inquiry Topic: ${inq.subject}\n\n` +
      `Message:\n${inq.message}\n\n` +
      `---\n` +
      `Dispatched directly to: ${TARGET_INQUIRY_EMAIL}`
    );
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(TARGET_INQUIRY_EMAIL)}&su=${subj}&body=${body}`;
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(saccoInfo.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(saccoInfo.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyInquiryDetails = () => {
    if (!submittedInquiry) return;
    const text = `UBUMWE SACCO Inquiry\nRecipient: ${TARGET_INQUIRY_EMAIL}\nName: ${submittedInquiry.name}\nEmail: ${submittedInquiry.email}\nPhone: ${submittedInquiry.phone}\nTopic: ${submittedInquiry.subject}\nDate: ${submittedInquiry.createdAt}\n\nMessage:\n${submittedInquiry.message}`;
    navigator.clipboard.writeText(text);
    setCopiedDetails(true);
    setTimeout(() => setCopiedDetails(false), 2000);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !contactNumber.trim() || !message.trim()) return;

    setIsSubmitting(true);
    const topicLabel = getSubjectLabel(subject);
    const nowFormatted = new Date().toLocaleString();

    const newInquiry: ContactInquiry = {
      id: `inq-${Date.now()}`,
      name: fullName.trim(),
      email: email.trim(),
      phone: contactNumber.trim(),
      subject: topicLabel,
      message: message.trim(),
      createdAt: nowFormatted,
      date: nowFormatted,
      recipientEmail: TARGET_INQUIRY_EMAIL,
    };

    let persistedInquiry = newInquiry;

    // 1. Persist directly to MongoDB database via WebUSG backend API
    try {
      const apiRes = await inquiryService.create({
        name: newInquiry.name,
        email: newInquiry.email,
        phone: newInquiry.phone,
        subject: newInquiry.subject,
        message: newInquiry.message,
        sector: 'Gakenke',
        source: 'website',
      });
      if (apiRes?.data?.inquiry) {
        persistedInquiry = {
          ...newInquiry,
          id: apiRes.data.inquiry.id || apiRes.data.inquiry._id || newInquiry.id,
          _id: apiRes.data.inquiry._id,
        };
      }
    } catch (apiErr) {
      console.warn('Backend inquiry submission fallback to local persistence:', apiErr);
    }

    // Save to local storage for local cache & offline resilience
    try {
      const existing = JSON.parse(localStorage.getItem('ubumwe_contact_inquiries') || '[]');
      localStorage.setItem('ubumwe_contact_inquiries', JSON.stringify([persistedInquiry, ...existing]));
    } catch {}

    if (onNewInquiry) {
      try {
        onNewInquiry(persistedInquiry);
      } catch {}
    }

    // 2. Dispatch to FormSubmit endpoint directly to TARGET_INQUIRY_EMAIL (ubumwesaccogakenke@gmail.com)
    // _replyto = member's email → hitting "Reply" in Gmail goes directly to the member
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      await fetch(`https://formsubmit.co/ajax/${TARGET_INQUIRY_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          // Email metadata — reply goes directly to the member's inbox
          _subject: `📩 [${topicLabel}] from ${newInquiry.name} — UBUMWE SACCO`,
          _replyto: newInquiry.email,          // ← Hit "Reply" → goes to member
          _template: 'table',
          _captcha: 'false',
          _next: 'false',

          // Structured member details — displayed as a table in your inbox
          '1_Member_Name': newInquiry.name,
          '2_Member_Email': newInquiry.email,
          '3_Telephone': newInquiry.phone,
          '4_Inquiry_Topic': topicLabel,
          '5_Date_Submitted': nowFormatted,
          '6_Message': newInquiry.message,
          '7_Reply_Instructions': `Hit "Reply" to respond directly to ${newInquiry.name} at ${newInquiry.email}`,
        }),
        signal: controller.signal,
      }).catch(() => {});
      clearTimeout(timeoutId);
    } catch {}

    setSubmittedInquiry(newInquiry);
    setIsSubmitting(false);
    setFormSubmitted(true);
  };

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setContactNumber('');
    setMessage('');
    setSubmittedInquiry(null);
    setFormSubmitted(false);
  };

  const cleanWhatsapp = saccoInfo.whatsapp.replace(/[^0-9]/g, '') || '250786422080';
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    saccoInfo.whatsappMessage ||
      (currentLang === 'fr'
        ? 'Bonjour UBUMWE SACCO GAKENKE, je souhaite me renseigner sur vos services coopératifs.'
        : currentLang === 'rw'
        ? 'Muraho UBUMWE SACCO GAKENKE, nifuzaga kubaza amakuru kuri serivisi zanyu.'
        : 'Hello UBUMWE SACCO GAKENKE, I would like to inquire about cooperative services.')
  )}`;

  return (
    <section id="contact" className="py-16 lg:py-24 bg-white border-b border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        {/* Section Header (Aligned to Reference Image) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 tracking-wider uppercase mb-2">
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              <span>
                {currentLang === 'fr'
                  ? 'Bureau de Communication Directe'
                  : currentLang === 'rw'
                  ? "Ibiro by'Itumanaho n'Ubufasha"
                  : 'Direct Communication Desk'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight" style={{ textWrap: 'balance' }}>
              {currentLang === 'fr'
                ? 'Contactez-nous · UBUMWE SACCO GAKENKE'
                : currentLang === 'rw'
                ? 'Twandikire · UBUMWE SACCO GAKENKE'
                : 'Contact Us · UBUMWE SACCO GAKENKE'}
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-3xl">
              {currentLang === 'fr'
                ? "Contactez notre service d'assistance client, les membres du conseil ou la direction via WhatsApp, téléphone, e-mail ou demande directe."
                : currentLang === 'rw'
                ? "Vugana n'abayobozi bacu cyangwa itsinda ryita ku banyamuryango ukoresheje WhatsApp, telefone, imeri cyangwa ubutumwa bwihuse."
                : 'Reach our customer desk, Board Directors (Wellarse, Bartazal), or Manager (Mbitsemunda Phocas) via WhatsApp, telephone, email, or direct inquiry.'}
            </p>
          </div>

          {isAdmin && onOpenAdminConsole && (
            <button
              type="button"
              onClick={() => onOpenAdminConsole('contact')}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>
                {currentLang === 'fr'
                  ? 'Modifier Coordonnées (CRUD)'
                  : currentLang === 'rw'
                  ? 'Guhindura Imyirondoro (CRUD)'
                  : 'Edit Phone, Email & WhatsApp'}
              </span>
            </button>
          )}
        </div>

        {/* 3 Core Contact Cards: WhatsApp, Phone, Email */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: WhatsApp (Primary digital chat) */}
          <div className="bg-gradient-to-b from-emerald-50/70 to-white rounded-3xl border-2 border-emerald-500/40 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group">
            <div className="absolute top-0 left-0 right-0">
              <ImigongoRibbon height={5} variant="light" bordered={false} />
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  {currentLang === 'fr' ? 'WhatsApp Rapide' : currentLang === 'rw' ? 'Kuri WhatsApp' : 'Fast WhatsApp'}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {currentLang === 'fr'
                    ? 'Chat Direct WhatsApp'
                    : currentLang === 'rw'
                    ? 'Twandikire kuri WhatsApp'
                    : 'WhatsApp Direct Chat'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {currentLang === 'fr'
                    ? 'Discussion instantanée, conseils sur les prêts, support USSD et questions relatives aux comptes.'
                    : currentLang === 'rw'
                    ? 'Kwandikirana ako kanya, kubaza ku nguzanyo no gufashwa gukoresha *541#.'
                    : 'Instant text chat, loan guidance, USSD assistance, and account questions.'}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-emerald-200 font-mono text-sm font-bold text-emerald-900 flex items-center justify-between">
                <span>{saccoInfo.whatsapp || saccoInfo.phone}</span>
                <span className="text-[11px] text-emerald-700 font-sans font-normal">(+250 Rwanda)</span>
              </div>
            </div>

            <div className="pt-6">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 group-hover:bg-emerald-700"
              >
                <MessageSquare className="w-4 h-4" />
                <span>
                  {currentLang === 'fr'
                    ? 'Ouvrir WhatsApp Chat'
                    : currentLang === 'rw'
                    ? 'Fungura WhatsApp'
                    : 'Open WhatsApp Chat'}
                </span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          </div>

          {/* Card 2: Phone Calling */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group">
            <div className="absolute top-0 left-0 right-0">
              <ImigongoRibbon height={5} variant="light" bordered={false} />
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/20">
                  <Phone className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                  <Clock className="w-3 h-3" />
                  {currentLang === 'fr' ? 'Ligne Directe' : currentLang === 'rw' ? 'Telefone' : 'Direct Line'}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {currentLang === 'fr'
                    ? 'Assistance Téléphonique'
                    : currentLang === 'rw'
                    ? 'Guhamagara kuri Telefone'
                    : 'Telephone Helpline'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {currentLang === 'fr'
                    ? 'Parlez directement avec nos conseillers client et experts en crédit.'
                    : currentLang === 'rw'
                    ? "Vugana n'abakozi bacu mu biro bikuru bya Ubumwe SACCO Gakenke."
                    : 'Speak directly with our central customer desk and loan advisors.'}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>{saccoInfo.phone}</span>
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1 font-sans font-medium cursor-pointer"
                >
                  {copiedPhone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPhone ? (currentLang === 'fr' ? 'Copié' : currentLang === 'rw' ? 'Byakopijwe' : 'Copied') : (currentLang === 'fr' ? 'Copier' : currentLang === 'rw' ? 'Kopera' : 'Copy')}</span>
                </button>
              </div>
            </div>

            <div className="pt-6">
              <a
                href={`tel:${saccoInfo.phone}`}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>
                  {currentLang === 'fr'
                    ? 'Appeler Maintenant'
                    : currentLang === 'rw'
                    ? 'Hamagara Ako Kanya'
                    : 'Call Now'}
                </span>
              </a>
            </div>
          </div>

          {/* Card 3: Official Email */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group">
            <div className="absolute top-0 left-0 right-0">
              <ImigongoRibbon height={5} variant="light" bordered={false} />
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-md shadow-emerald-800/20">
                  <Mail className="w-6 h-6 text-emerald-200" />
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" />
                  {currentLang === 'fr'
                    ? 'Demandes Officielles'
                    : currentLang === 'rw'
                    ? 'Imeri ya Koperative'
                    : 'Official Inquiries'}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {currentLang === 'fr'
                    ? 'Correspondance par E-mail'
                    : currentLang === 'rw'
                    ? 'Kwandikira Imeri'
                    : 'Email Correspondence'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {currentLang === 'fr'
                    ? 'Demandes institutionnelles, partenariats, audits et notifications de gestion.'
                    : currentLang === 'rw'
                    ? "Ubusabe bwa dosiye, amabaruwa yemewe n'itumanaho ry'ubuyobozi."
                    : 'Formal cooperative inquiries, partnerships, audit requests, and management notices.'}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs font-semibold text-slate-800 flex items-center justify-between truncate">
                <span className="truncate">{saccoInfo.email}</span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1 font-sans font-medium shrink-0 ml-2 cursor-pointer"
                >
                  {copiedEmail ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? (currentLang === 'fr' ? 'Copié' : currentLang === 'rw' ? 'Byakopijwe' : 'Copied') : (currentLang === 'fr' ? 'Copier' : currentLang === 'rw' ? 'Kopera' : 'Copy')}</span>
                </button>
              </div>
            </div>

            <div className="pt-6">
              <a
                href={`mailto:${saccoInfo.email}`}
                className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
              >
                <Mail className="w-4 h-4" />
                <span>
                  {currentLang === 'fr'
                    ? 'Envoyer un E-mail Officiel'
                    : currentLang === 'rw'
                    ? 'Ohereza Imeri'
                    : 'Send Official Email'}
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Interactive In-Page Message & Support Box */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Office Details */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {currentLang === 'fr'
                  ? 'Siège Social & Horaires de Travail'
                  : currentLang === 'rw'
                  ? "Ibiro Bikuru n'Amasaha"
                  : 'Headquarters & Working Hours'}
              </span>

              <h3 className="text-2xl font-extrabold text-white">
                {saccoInfo.name}
              </h3>

              <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{saccoInfo.headquarters}</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    {currentLang === 'fr'
                      ? 'Lundi – Vendredi : 8h00 – 17h00 | Samedi : 8h00 – 13h00'
                      : currentLang === 'rw'
                      ? (saccoInfo.operatingHoursRw || 'Kuwa Mbere – Kuwa Gatanu: 8:00 – 17:00 | Kuwa Gatandatu: 8:00 – 13:00')
                      : (saccoInfo.operatingHoursEn || 'Monday – Friday: 8:00 AM – 5:00 PM | Saturday: 8:00 AM – 1:00 PM')}
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    {currentLang === 'fr'
                      ? `Services Mobiles USSD : Composez ${saccoInfo.ussdCode} (Actif 24h/24 et 7j/7)`
                      : currentLang === 'rw'
                      ? `Koresha USSD: Kanda ${saccoInfo.ussdCode} (Amasaha 24/7 Ku Munsi)`
                      : `USSD Mobile Banking: Dial ${saccoInfo.ussdCode} (Active 24 Hours / 7 Days a Week)`}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  Manager: Mbitsemunda Phocas ({saccoInfo.managerPhone || saccoInfo.phone})
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  Board: Wellarse &amp; Bartazal
                </span>
              </div>

              <div className="pt-2">
                <a
                  href="https://www.google.com/maps/dir//Gakenke/@-1.7114734,29.617736,11z/data=!4m17!1m8!3m7!1s0x19dcf39e3202d463:0x1eceb378ea2a23e9!2sGakenke!3b1!8m2!3d-1.6924232!4d29.742604!16s%2Fm%2F02w93vh!4m7!1m0!1m5!1m1!1s0x19dcf39e3202d463:0x1eceb378ea2a23e9!2m2!1d29.742604!2d-1.6924232?entry=ttu&g_ep=EgoyMDI2MTAxMy4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-98"
                >
                  <MapPin className="w-4 h-4 text-emerald-200" />
                  <span>
                    {currentLang === 'fr'
                      ? 'Ouvrir dans Google Maps (Itinéraire)'
                      : currentLang === 'rw'
                      ? 'Reba Aho Duherereye kuri Google Maps'
                      : 'Open in Google Maps (Directions)'}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </a>
              </div>
            </div>

            {/* Right Column: Fast Inquiry Form */}
            <div className="lg:col-span-7 bg-white text-slate-900 p-6 sm:p-7 rounded-2xl shadow-lg border border-slate-100">
              {formSubmitted ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold text-slate-900">
                      {currentLang === 'fr'
                        ? 'Message Envoyé Directement !'
                        : currentLang === 'rw'
                        ? `Ubutumwa Bwoherejwe kuri ${TARGET_INQUIRY_EMAIL}!`
                        : `Inquiry Sent Directly to ${TARGET_INQUIRY_EMAIL}!`}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      {currentLang === 'fr'
                        ? `Merci ${submittedInquiry?.name || fullName}. Votre demande a été transmise directement à ${TARGET_INQUIRY_EMAIL}.`
                        : currentLang === 'rw'
                        ? `Murakoze ${submittedInquiry?.name || fullName}. Ubutumwa bwawe bwoherejwe ako kanya kuri ${TARGET_INQUIRY_EMAIL} no mu buyobozi bwa koperative.`
                        : `Thank you ${submittedInquiry?.name || fullName}. Your inquiry has been forwarded directly to ${TARGET_INQUIRY_EMAIL} and recorded in our member registry.`}
                    </p>
                  </div>

                  {/* Inquiry Receipt Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs max-w-md mx-auto space-y-2.5">
                    <div className="flex items-center justify-between text-slate-500 text-[11px] border-b border-slate-200 pb-2">
                      <span className="font-bold text-slate-700 uppercase tracking-wider">Inquiry Summary</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1 font-mono text-[10.5px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        <Mail className="w-3 h-3 text-emerald-600" />
                        {TARGET_INQUIRY_EMAIL}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Sender Name</span>
                        <span className="font-bold text-slate-900 truncate block">{submittedInquiry?.name || fullName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Sender Email</span>
                        <span className="font-bold text-emerald-700 truncate block">{submittedInquiry?.email || email}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Telephone</span>
                        <span className="font-mono text-slate-800 truncate block">{submittedInquiry?.phone || contactNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Reason / Topic</span>
                        <span className="font-semibold text-slate-800 truncate block">{submittedInquiry?.subject || subject}</span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Mail Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    {submittedInquiry && (
                      <a
                        href={getGmailUrl(submittedInquiry)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
                        title={`Open pre-filled Gmail composer to ${TARGET_INQUIRY_EMAIL}`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Open in Gmail ({TARGET_INQUIRY_EMAIL})</span>
                      </a>
                    )}

                    {submittedInquiry && (
                      <a
                        href={getMailtoUrl(submittedInquiry)}
                        className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border border-slate-300 transition-colors"
                        title={`Open in Outlook or device mail app for ${TARGET_INQUIRY_EMAIL}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        <span>Open in Mail App</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={handleCopyInquiryDetails}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedDetails ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{copiedDetails ? 'Copied' : 'Copy Details'}</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    >
                      {currentLang === 'fr'
                        ? '← Envoyer une autre demande'
                        : currentLang === 'rw'
                        ? '← Ohereza Ubundi Butumwa'
                        : '← Send Another Inquiry'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        {currentLang === 'fr'
                          ? 'Bureau de Demande Directe'
                          : currentLang === 'rw'
                          ? 'Twandikire Ubutumwa Bwihuse'
                          : 'Direct Member Inquiry Desk'}
                      </span>
                      <span className="text-[11px] text-slate-400">Response within 2h</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-200/60 flex items-center gap-1 shadow-2xs">
                      <Mail className="w-3 h-3 text-emerald-600" />
                      <span className="font-mono text-[10.5px] font-semibold">{TARGET_INQUIRY_EMAIL}</span>
                    </div>
                  </div>

                  {/* Form Inputs Grid with Email Field */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {currentLang === 'fr' ? 'Nom et Prénom' : currentLang === 'rw' ? 'Amazina Yombi' : 'Full Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Jean Damascene"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {currentLang === 'fr' ? 'Adresse E-mail' : currentLang === 'rw' ? 'Imeli (Email Address)' : 'Email Address'}
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. member@gmail.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {currentLang === 'fr' ? 'Numéro de Téléphone' : currentLang === 'rw' ? 'Nimero ya Telefone' : 'Telephone Number'}
                      </label>
                      <input
                        type="tel"
                        required
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        placeholder="078..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono-numbers"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {currentLang === 'fr' ? "Objet de l'Inquiry" : currentLang === 'rw' ? "Impamvu / Intego y'Ubutumwa" : 'Inquiry Topic / Reason'}
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="general">
                          {currentLang === 'fr' ? 'Demande Générale' : currentLang === 'rw' ? 'Kubaza Amakuru Rusange' : 'General Cooperative Inquiry'}
                        </option>
                        <option value="loan">
                          {currentLang === 'fr' ? 'Demande de Prêt & Conditions' : currentLang === 'rw' ? 'Gusaba Inguzanyo & Amabwiriza' : 'Loan Application & Terms'}
                        </option>
                        <option value="savings">
                          {currentLang === 'fr' ? 'Épargne & Dépôt à Terme' : currentLang === 'rw' ? "Kuzigama & Konti y'Igihe Kirekire" : 'Fixed Term Deposit & Savings'}
                        </option>
                        <option value="ussd">
                          {currentLang === 'fr' ? `Support USSD ${saccoInfo.ussdCode} & Banque Mobile` : currentLang === 'rw' ? `Ubufasha bwa USSD ${saccoInfo.ussdCode}` : `USSD ${saccoInfo.ussdCode} & Mobile Banking Support`}
                        </option>
                        <option value="leadership">
                          {currentLang === 'fr' ? 'Direction Exécutive (Gérant / Conseil)' : currentLang === 'rw' ? "Kuvugana n'Ubuyobozi Bukuru" : 'Executive Desk (Manager / Board)'}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block font-semibold text-slate-700 mb-1">
                      {currentLang === 'fr' ? 'Votre Message' : currentLang === 'rw' ? 'Ubutumwa Bwawe' : 'Your Message'}
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        currentLang === 'fr'
                          ? 'Expliquez comment nous pouvons vous aider ou posez votre question...'
                          : currentLang === 'rw'
                          ? 'Sobanura uko twagufasha cyangwa ubaze ikibazo cyawe...'
                          : 'Explain how we can help you or ask your question...'
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Direct Delivery Target Indicator */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {currentLang === 'fr'
                          ? 'Destination de livraison directe :'
                          : currentLang === 'rw'
                          ? 'Ubutumwa bwoherezwa kuri:'
                          : 'Direct delivery destination:'}
                      </span>
                    </span>
                    <span className="font-mono font-bold text-emerald-800">{TARGET_INQUIRY_EMAIL}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-75"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>
                          {currentLang === 'fr'
                            ? `Envoi directement à ${TARGET_INQUIRY_EMAIL}...`
                            : currentLang === 'rw'
                            ? `Kohereza kuri ${TARGET_INQUIRY_EMAIL}...`
                            : `Sending directly to ${TARGET_INQUIRY_EMAIL}...`}
                        </span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {currentLang === 'fr'
                            ? `Envoyer directement à ${TARGET_INQUIRY_EMAIL}`
                            : currentLang === 'rw'
                            ? `Ohereza kuri ${TARGET_INQUIRY_EMAIL}`
                            : `Submit Inquiry Directly to ${TARGET_INQUIRY_EMAIL}`}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

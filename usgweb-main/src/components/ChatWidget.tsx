import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  ShieldCheck,
  Phone,
  Mail,
  Smartphone,
  ExternalLink,
  ChevronDown,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FileText,
  MapPin,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { aiApi } from '../services/api';
import { Language } from '../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  language?: string;
  sourcesUsed?: string[];
  isEscalated?: boolean;
  timestamp: string;
}

interface ChatWidgetProps {
  currentLang: Language;
  onLanguageChange?: (lang: Language) => void;
}

function getLocalKnowledgeAnswer(query: string, lang: Language): { reply: string; isEscalated: boolean } {
  const q = query.toLowerCase().trim();

  // KINYARWANDA
  if (lang === 'rw') {
    if (q.includes('muraho') || q.includes('amakuru') || q.includes('mwiriwe') || q.includes('mwaramutse') || q.includes('bite') || q.includes('kaze')) {
      return {
        reply: `Muraho neza! Ndi umufasha wanyu mu buryo bw'ikoranabuhanga muri UBUMWE SACCO Gakenke. Nshobora kubasubiza byihuse ku bijyanye no gufungura konti, inguzanyo, ubwizigame (9.8% dividend), amashami yacu 19, na serivisi ya telefone (*541#). Mwagira icyo mwifuza kubaza?`,
        isEscalated: false,
      };
    }
    if (q.includes('abo turibo') || q.includes('ni iki') || q.includes('koperative') || q.includes('rca') || q.includes('bnr') || (q.includes('ubumwe') && q.includes('sacco'))) {
      return {
        reply: `UBUMWE SACCO GAKENKE ni koperative yo kubitsa no kugurizanya yemewe kandi igenzurwa na Banki Nkuru y'u Rwanda (BNR) hamwe n'Ikigo cy'Igihugu Gishinzwe Amakoperative (RCA). Yashinzwe mu 2011, ifite abanyamuryango barenze 18,640 n'amashami 19 mu mirenge yose igize Akarere ka Gakenke.`,
        isEscalated: false,
      };
    }
    if (q.includes('konti') || q.includes('gufungura') || q.includes('kwinjira') || q.includes('umunyamuryango') || q.includes('ibyangombwa')) {
      return {
        reply: `Kuba umunyamuryango no gufungura konti muri UBUMWE SACCO Gakenke biroroshye cyane:\n1. Kopi y'indangamuntu y'u Rwanda (imibare 16).\n2. Amafoto abiri magufi (passeport).\n3. Kugura umugabane w'ifatizo (10,000 RWF).\n4. Ubwizigame bwa mbere butari munsi ya 5,000 RWF.\nMwasura ishami rya SACCO rihegereye mu mirenge 19 ya Gakenke cyangwa mukatwandikira kuri WhatsApp: +250 786 422 080.`,
        isEscalated: false,
      };
    }
    if (q.includes('ubwizigame') || q.includes('kuzigama') || q.includes('inyungu') || q.includes('imigabane') || q.includes('uruhare') || q.includes('dividende') || q.includes('kubitsa')) {
      return {
        reply: `UBUMWE SACCO Gakenke ifite gahunda z'ubwizigame zunguka cyane:\n• Ubwizigame bw'Uruhare rw'Umunyamuryango: Buhabwa inyungu y'umwaka (dividende igera kuri 9.8%), bukakwemerera kwaka inguzanyo yikubye inshuro 4 z'amafaranga wazigamye.\n• Konti yo Kuzigama Igihe Kirekire (Fixed Term Deposit): Inyungu iri hagati ya 8.5% na 10.5% ku mwaka.\nKubitsa byoroshye kuri telefone ukoresheje *541# amasaha 24/7.`,
        isEscalated: false,
      };
    }
    if (q.includes('inguzanyo') || q.includes('umwenda') || q.includes('kuguriza') || q.includes('ubuhinzi') || q.includes('ubworozi') || q.includes('ubucuruzi') || q.includes('amaduka')) {
      return {
        reply: `UBUMWE SACCO itanga inguzanyo zikurikira:\n1. Inguzanyo y'Ubuhinzi n'Ubworozi (Agri-Credit): Inyungu ya 1.1% ku kwezi (13.2% ku mwaka), ifite amezi agera kuri 4 yo gutegereza igihe cy'isarura.\n2. Inguzanyo y'Ubucuruzi (SME Micro-Loan): Inyungu ya 1.25% ku kwezi (15% ku mwaka), isuzumwa mu masaha 48-72.\n3. Inguzanyo z'Amafaranga y'Ishuri n'Ingoboka.\nIbisabwa: Kuba uri umunyamuryango uzigama, ingwate yemewe, n'abishingizi babiri.`,
        isEscalated: false,
      };
    }
    if (q.includes('telefone') || q.includes('ussd') || q.includes('541') || q.includes('*541#') || q.includes('momo') || q.includes('mtn') || q.includes('airtel') || q.includes('kubikuza')) {
      return {
        reply: `Serivisi yacu ya USSD ikora mukanda *541# kuri telefone igendanwa amasaha 24/7:\n• Kubitsa amafaranga kuri konti yawe ya SACCO uvanye kuri Mobile Money.\n• Kubikuza amafaranga kuri konti yawe uyohereza kuri Mobile Money.\n• Kugenzura amafaranga asigaye kuri konti (Balance Inquiry).\n• Koherereza undi munyamuryango wa UBUMWE SACCO.`,
        isEscalated: false,
      };
    }
    if (q.includes('amashami') || q.includes('aho mukorera') || q.includes('icyicaro') || q.includes('akarere') || q.includes('umurenge')) {
      return {
        reply: `UBUMWE SACCO ifite amashami 19 mu mirenge yose 19 y'Akarere ka Gakenke: Busengo, Coko, Cyabingo, Gakenke, Gashenyi, Janja, Kamubuga, Karambo, Kivuruga, Mataba, Minazi, Mugunga, Muhondo, Muyongwe, Muzo, Nemba, Ruli, Rusasa, na Rushashi. Icyicaro Gikuru kiri mu mujyi wa Gakenke (Gakenke Commercial Center).`,
        isEscalated: false,
      };
    }
    if (q.includes('amasaha') || q.includes('igihe mukingurira') || q.includes('kuwa gatandatu') || q.includes('icyumweru')) {
      return {
        reply: `Amasaha yacu y'akazi:\n• Kuwa Mbere kugeza Kuwa Gatanu: Saa 8:00 - 17:00 (5:00 PM).\n• Kuwa Gatandatu: Saa 8:00 - 13:00 (1:00 PM).\n• Ku Cyumweru: Turafunga (ariko *541# kuri telefone ikora 24/7).`,
        isEscalated: false,
      };
    }
    if (q.includes('ubuyobozi') || q.includes('umuyobozi') || q.includes('mbitsemunda') || q.includes('phocas') || q.includes('wellars')) {
      return {
        reply: `Ubuyobozi bwa UBUMWE SACCO Gakenke:\n• Umuyobozi Mukuru (General Manager): Bwana Mbitsemunda Phocas.\n• Perezida w'Inama y'Ubutegetsi (Board Chair): Bwana Wellars.\nKoperative ikorera ku mategeko n'amabwiriza yemejwe na BNR na RCA.`,
        isEscalated: false,
      };
    }
    if (q.includes('akazi') || q.includes('imirimo') || q.includes('gusaba akazi') || q.includes('ipiganwa')) {
      return {
        reply: `Amatangazo yose y'akazi muri UBUMWE SACCO Gakenke anyuzwa ku rubuga rwacu mu gice cy'Imirimo (Careers). Abakandida bashobora gushyiraho dosiye zabo kuri interineti cyangwa ku biro bikuru i Gakenke.`,
        isEscalated: false,
      };
    }
    if (q.includes('itumanaho') || q.includes('nimero') || q.includes('imeri') || q.includes('whatsapp') || q.includes('twandikire')) {
      return {
        reply: `Itumanaho ryemewe rya UBUMWE SACCO Gakenke:\n• WhatsApp: +250 786 422 080\n• Telefone: 0786422080\n• Imeri: ubumwesaccogakenke@gmail.com\n• USSD: *541#\n• Icyicaro: Gakenke Commercial Center.`,
        isEscalated: true,
      };
    }

    // Referral
    return {
      reply: `Ku bibazo byihariye byerekeye konti yawe bwite, inguzanyo ziri mu isuzumwa, cyangwa ibindi bisobanuro byimbitse:\nNyamuneka mwakorana byihuse n'abakozi bacu binyuze kuri:\n• WhatsApp: +250 786 422 080\n• Imeri: ubumwesaccogakenke@gmail.com\n• Telefone: 0786422080\n• Icyicaro: Gakenke Commercial Center cyangwa mu mashami yacu 19.`,
      isEscalated: true,
    };
  }

  // FRENCH
  if (lang === 'fr') {
    if (q.includes('bonjour') || q.includes('salut') || q.includes('bonsoir') || q.includes('qui etes') || q.includes('qui êtes')) {
      return {
        reply: `Bonjour ! Je suis l'assistant numérique officiel d'UBUMWE SACCO Gakenke. Je peux vous renseigner sur l'ouverture de compte, les solutions d'épargne (9,8% de dividendes), les crédits agricoles et PME, la banque mobile (*541#) et nos 19 agences. Comment puis-je vous aider ?`,
        isEscalated: false,
      };
    }
    if (q.includes('a propos') || q.includes('à propos') || q.includes('qui sommes') || q.includes('histoire') || q.includes('cooperative') || q.includes('coopérative') || q.includes('bnr') || q.includes('rca')) {
      return {
        reply: `UBUMWE SACCO GAKENKE est une coopérative d'épargne et de crédit agréée et régulée par la Banque Nationale du Rwanda (BNR) et la RCA. Fondée en 2011, elle compte plus de 18 640 membres et 19 agences réparties dans l'ensemble des 19 secteurs du district de Gakenke.`,
        isEscalated: false,
      };
    }
    if (q.includes('compte') || q.includes('ouvrir') || q.includes('ouverture') || q.includes('membre') || q.includes('adhesion') || q.includes('adhésion')) {
      return {
        reply: `Pour ouvrir un compte chez UBUMWE SACCO Gakenke :\n1. Copie de votre pièce d'identité rwandaise (16 chiffres).\n2. Deux photos de format passeport.\n3. Part sociale obligatoire de 10 000 RWF.\n4. Premier versement d'épargne minimum de 5 000 RWF.\nRendez-vous dans l'une de nos 19 agences ou contactez-nous sur WhatsApp au +250 786 422 080.`,
        isEscalated: false,
      };
    }
    if (q.includes('epargne') || q.includes('épargne') || q.includes('dividende') || q.includes('part sociale') || q.includes('depot') || q.includes('dépôt') || q.includes('taux')) {
      return {
        reply: `Nos solutions d'épargne rémunérées :\n• Épargne obligatoire des membres (Uruhare) : Génère un dividende annuel moyen de 9,8% et permet d'emprunter jusqu'à 4 fois votre épargne constituée.\n• Dépôt à terme bloqué (Term Deposit) : Taux garanti de 8,5% à 10,5% par an pour des durées de 3 à 24 mois.\nDépôts mobiles instantanés via le code *541# 24h/24.`,
        isEscalated: false,
      };
    }
    if (q.includes('credit') || q.includes('crédit') || q.includes('pret') || q.includes('prêt') || q.includes('emprunt') || q.includes('agricole') || q.includes('pme')) {
      return {
        reply: `Nos solutions de financement :\n1. Crédit Agricole : Taux préférentiel de 1,1% par mois (13,2% par an) avec différé de remboursement jusqu'à 4 mois (aligné sur les récoltes de café et de thé).\n2. Micro-Crédit Commercial PME : Taux de 1,25% par mois (15% par an) accordé sous 48 à 72 heures.\n3. Prêts Scolaires et Avances d'Urgence.\nConditions : Être membre actif, présenter une garantie et 2 garants.`,
        isEscalated: false,
      };
    }
    if (q.includes('ussd') || q.includes('541') || q.includes('*541#') || q.includes('mobile') || q.includes('momo') || q.includes('telephone') || q.includes('téléphone')) {
      return {
        reply: `Le service bancaire mobile d'UBUMWE SACCO est accessible en composant le code court USSD *541# sur votre téléphone (24h/24 et 7j/7) :\n• Dépôt instantané depuis Mobile Money (MTN / Airtel) vers votre compte SACCO.\n• Retrait sécurisé vers Mobile Money.\n• Consultation du solde et mini-relevé.\n• Virements directs entre membres.`,
        isEscalated: false,
      };
    }
    if (q.includes('agence') || q.includes('agences') || q.includes('succursale') || q.includes('adresse') || q.includes('localisation') || q.includes('siege') || q.includes('siège')) {
      return {
        reply: `UBUMWE SACCO dispose de 19 agences couvrant les 19 secteurs de Gakenke : Busengo, Coko, Cyabingo, Gakenke, Gashenyi, Janja, Kamubuga, Karambo, Kivuruga, Mataba, Minazi, Mugunga, Muhondo, Muyongwe, Muzo, Nemba, Ruli, Rusasa et Rushashi. Siège social : Centre Commercial de Gakenke.`,
        isEscalated: false,
      };
    }
    if (q.includes('heures') || q.includes('horaires') || q.includes('ouverture') || q.includes('fermeture')) {
      return {
        reply: `Horaires d'ouverture de nos guichets :\n• Lundi à Vendredi : 8h00 - 17h00\n• Samedi : 8h00 - 13h00\n• Dimanche : Fermé (Banque mobile *541# active 24h/24).`,
        isEscalated: false,
      };
    }
    if (q.includes('direction') || q.includes('directeur') || q.includes('gerant') || q.includes('mbitsemunda') || q.includes('phocas') || q.includes('wellars')) {
      return {
        reply: `Direction d'UBUMWE SACCO Gakenke :\n• Directeur Général (General Manager) : M. Mbitsemunda Phocas.\n• Président du Conseil d'Administration : M. Wellars.\nOpérations supervisées par la BNR et la RCA.`,
        isEscalated: false,
      };
    }
    if (q.includes('carriere') || q.includes('emploi') || q.includes('recrutement') || q.includes('poste')) {
      return {
        reply: `Les offres d'emploi officielles d'UBUMWE SACCO Gakenke sont publiées dans la section Carrières de notre site internet avec toutes les modalités pour postuler en ligne ou au siège.`,
        isEscalated: false,
      };
    }
    if (q.includes('contact') || q.includes('telephone') || q.includes('email') || q.includes('whatsapp')) {
      return {
        reply: `Coordonnées officielles d'UBUMWE SACCO Gakenke :\n• WhatsApp officiel : +250 786 422 080\n• Téléphone direct : 0786422080\n• Email officiel : ubumwesaccogakenke@gmail.com\n• Code USSD Mobile : *541#\n• Siège : Centre Commercial de Gakenke.`,
        isEscalated: true,
      };
    }

    return {
      reply: `Pour toute demande personnalisée concernant votre solde, un dossier de crédit en cours ou une question spécifique :\nVeuillez contacter directement nos services officiels :\n• WhatsApp : +250 786 422 080\n• Email officiel : ubumwesaccogakenke@gmail.com\n• Téléphone : 0786422080\n• Siège : Centre Commercial de Gakenke ou dans l'une de nos 19 agences.`,
      isEscalated: true,
    };
  }

  // ENGLISH
  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('good morning') || q.includes('good afternoon') || q.includes('who are you')) {
    return {
      reply: `Hello! I am the official digital assistant for UBUMWE SACCO Gakenke. I can help you with:\n• Account opening and membership criteria\n• Rewarding savings & annual dividends (9.8%)\n• Affordable loans: Agriculture (1.1%/mo), SME Business (1.25%/mo), and school fees\n• 24/7 Mobile Banking via USSD code *541#\n• Our 19 sector branches across Gakenke District\n• Operating hours and official contacts.\nWhat would you like to know?`,
      isEscalated: false,
    };
  }
  if (q.includes('about') || q.includes('what is ubumwe') || q.includes('history') || q.includes('cooperative') || q.includes('rca') || q.includes('bnr') || q.includes('mission')) {
    return {
      reply: `UBUMWE SACCO GAKENKE is a premier savings and credit cooperative licensed, regulated, and supervised by the National Bank of Rwanda (BNR) and the Rwanda Cooperative Agency (RCA). Founded in 2011, it serves over 18,640 members across Gakenke District through 19 branch outposts, providing secure community savings and affordable credit.`,
      isEscalated: false,
    };
  }
  if (q.includes('account') || q.includes('join') || q.includes('open') || q.includes('membership') || q.includes('how to join') || q.includes('requirement')) {
    return {
      reply: `Opening an account with UBUMWE SACCO Gakenke requires:\n1. Copy of Rwanda National ID (16 digits).\n2. Two passport-sized photographs.\n3. Initial member share capital purchase of 10,000 RWF.\n4. Initial minimum savings deposit of 5,000 RWF.\nYou can visit any of our 19 sector outposts across Gakenke District or reach us on WhatsApp at +250 786 422 080.`,
      isEscalated: false,
    };
  }
  if (q.includes('saving') || q.includes('save') || q.includes('deposit') || q.includes('dividend') || q.includes('interest') || q.includes('term deposit') || q.includes('uruhare')) {
    return {
      reply: `UBUMWE SACCO offers competitive savings products:\n• Compulsory Member Savings (Uruhare): Generates an average 9.8% annual dividend and allows you to borrow up to 4x your accumulated savings.\n• Fixed Term Deposit: Guaranteed returns between 8.5% and 10.5% per annum for 3 to 24 month tenures.\nInstant phone deposits are available 24/7 by dialing *541#.`,
      isEscalated: false,
    };
  }
  if (q.includes('loan') || q.includes('loans') || q.includes('credit') || q.includes('borrow') || q.includes('agri') || q.includes('farm') || q.includes('business') || q.includes('sme')) {
    return {
      reply: `UBUMWE SACCO provides accessible credit facilities:\n1. Agricultural Credit (Agri-Credit): 1.1% per month (13.2% per year) with up to 4 months grace period, aligned with coffee, tea, maize, and potato harvests.\n2. SME Business Loans: 1.25% per month (15% per year) for trading and working capital, approved within 48 to 72 hours.\n3. School Fees and Emergency Member Loans.\nRequirements: Active regular membership, acceptable collateral, and two member guarantors.`,
      isEscalated: false,
    };
  }
  if (q.includes('how to get a loan') || q.includes('loan application') || q.includes('collateral') || q.includes('guarantor') || q.includes('qualify') || q.includes('eligibility')) {
    return {
      reply: `To apply for a loan with UBUMWE SACCO:\n1. Maintain an active member account with regular savings.\n2. Complete a loan application form at your local sector branch.\n3. Provide valid collateral (land title/certificate, equipment, or cooperative crop pledge).\n4. Provide two active member guarantors.\nDecisions are made within 48 to 72 hours. You can also chat with our credit desk on WhatsApp at +250 786 422 080.`,
      isEscalated: false,
    };
  }
  if (q.includes('ussd') || q.includes('541') || q.includes('*541#') || q.includes('mobile') || q.includes('phone') || q.includes('momo') || q.includes('mtn') || q.includes('airtel') || q.includes('transfer')) {
    return {
      reply: `Dial *541# on your mobile phone for 24/7 digital banking with UBUMWE SACCO:\n• Deposit funds directly from Mobile Money (MTN / Airtel) to your SACCO account.\n• Withdraw funds from your SACCO account to Mobile Money.\n• Check your account balance and view recent mini-statements.\n• Transfer funds to another UBUMWE SACCO member.`,
      isEscalated: false,
    };
  }
  if (q.includes('branch') || q.includes('branches') || q.includes('location') || q.includes('where') || q.includes('outpost') || q.includes('sector') || q.includes('address')) {
    return {
      reply: `UBUMWE SACCO operates 19 branch outposts covering all 19 sectors of Gakenke District: Busengo, Coko, Cyabingo, Gakenke, Gashenyi, Janja, Kamubuga, Karambo, Kivuruga, Mataba, Minazi, Mugunga, Muhondo, Muyongwe, Muzo, Nemba, Ruli, Rusasa, and Rushashi. Headquarters is at Gakenke Commercial Center, Gakenke Sector.`,
      isEscalated: false,
    };
  }
  if (q.includes('hour') || q.includes('hours') || q.includes('time') || q.includes('open') || q.includes('close') || q.includes('saturday') || q.includes('sunday')) {
    return {
      reply: `Official Operating Hours for branch counters:\n• Monday to Friday: 8:00 AM - 5:00 PM\n• Saturday: 8:00 AM - 1:00 PM\n• Sunday: Closed (Counter services closed; *541# Mobile Banking active 24/7).`,
      isEscalated: false,
    };
  }
  if (q.includes('leader') || q.includes('leadership') || q.includes('manager') || q.includes('general manager') || q.includes('director') || q.includes('mbitsemunda') || q.includes('phocas') || q.includes('wellars')) {
    return {
      reply: `UBUMWE SACCO Gakenke Leadership:\n• General Manager: Mr. Mbitsemunda Phocas\n• Board Chair: Mr. Wellars and executive governance committees ensuring community oversight under BNR and RCA regulations.`,
      isEscalated: false,
    };
  }
  if (q.includes('career') || q.includes('careers') || q.includes('job') || q.includes('jobs') || q.includes('vacancy') || q.includes('hiring') || q.includes('apply')) {
    return {
      reply: `All official job openings at UBUMWE SACCO Gakenke are published on our website under Careers. You can submit your CV and motivation letter online or deliver your application dossier to our headquarters in Gakenke.`,
      isEscalated: false,
    };
  }
  if (q.includes('contact') || q.includes('phone') || q.includes('email') || q.includes('whatsapp') || q.includes('call') || q.includes('reach')) {
    return {
      reply: `UBUMWE SACCO Gakenke Official Contact Channels:\n• WhatsApp Support: +250 786 422 080\n• Telephone Desk: 0786422080\n• Official Email: ubumwesaccogakenke@gmail.com\n• USSD Banking: *541#\n• Headquarters: Gakenke Commercial Center, Sector Gakenke.`,
      isEscalated: true,
    };
  }

  // Fallback referral for complex or personal account questions
  return {
    reply: `For specialized inquiries regarding your personal account balance, loan appraisal progress, or direct support from our staff:\nPlease contact our official customer support desk directly:\n• WhatsApp: +250 786 422 080\n• Official Email: ubumwesaccogakenke@gmail.com\n• Telephone: 0786422080\n• Headquarters: Gakenke Commercial Center, Gakenke Sector (or visit your nearest sector branch).`,
    isEscalated: true,
  };
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ currentLang, onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_ai_session_id');
      if (saved) return saved;
      const newId = 'sess_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem('ubumwe_ai_session_id', newId);
      return newId;
    } catch {
      return 'sess_' + Math.random().toString(36).substring(2, 11);
    }
  });

  const [activeLang, setActiveLang] = useState<Language>(currentLang || 'en');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('ubumwe_ai_chat_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [];
  });

  // Ticket escalation form state
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquirySector, setInquirySector] = useState('Gakenke');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquirySuccessRef, setInquirySuccessRef] = useState<string | null>(null);
  const [inquiryError, setInquiryError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync language with parent if changed externally
  useEffect(() => {
    if (currentLang && currentLang !== activeLang) {
      setActiveLang(currentLang);
    }
  }, [currentLang]);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem('ubumwe_ai_chat_history', JSON.stringify(messages));
    } catch {
      // Quota
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Initial welcome message if conversation is empty
  useEffect(() => {
    if (messages.length === 0) {
      const initialGreeting: Record<Language, string> = {
        rw: 'Murakaza neza muri UBUMWE SACCO Gakenke! Ndi umufasha wanyu mu buryo bw\'ikoranabuhanga. Nshobora kubafasha ku bijyanye no gufungura konti, serivisi z\'inguzanyo, ubwizigame, amashami yacu 19, no gukoresha serivisi ya telefone (*541#). Mwagira icyo mwifuza kubaza?',
        en: 'Welcome to UBUMWE SACCO Gakenke! I am your official digital assistant. I can help you understand our savings accounts, microfinance loans, 19 sector branches, and 24/7 Mobile Banking (*541#). How may I assist you today?',
        fr: 'Bienvenue chez UBUMWE SACCO Gakenke ! Je suis votre assistant numérique officiel. Je peux vous renseigner sur l\'ouverture de compte, nos produits d\'épargne, les micro-crédits, nos 19 agences et la banque mobile (*541#). Comment puis-je vous aider ?',
      };

      setMessages([
        {
          id: 'welcome-msg',
          role: 'assistant',
          content: initialGreeting[activeLang] || initialGreeting.en,
          language: activeLang,
          sourcesUsed: ['Official SACCO Charter & Knowledge Base'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [activeLang, messages.length]);

  const handleLanguageSwitch = (lang: Language) => {
    setActiveLang(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: text,
      language: activeLang,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await aiApi.chat({
        message: text,
        sessionId,
        preferredLanguage: activeLang,
      });

      if (res?.data) {
        const assistantMsg: ChatMessage = {
          id: 'ast_' + Date.now(),
          role: 'assistant',
          content: res.data.reply,
          language: res.data.language,
          sourcesUsed: res.data.sourcesUsed,
          isEscalated: res.data.isEscalated,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        if (res.data.sessionId) {
          setSessionId(res.data.sessionId);
        }
      }
    } catch {
      // Smart institutional fallback response matching what the user asks
      const { reply, isEscalated } = getLocalKnowledgeAnswer(text, activeLang);

      setMessages((prev) => [
        ...prev,
        {
          id: 'ast_' + Date.now(),
          role: 'assistant',
          content: reply,
          language: activeLang,
          sourcesUsed: ['Official UBUMWE SACCO Knowledge Base'],
          isEscalated,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    localStorage.removeItem('ubumwe_ai_chat_history');
    setMessages([]);
    setShowInquiryForm(false);
    setInquirySuccessRef(null);
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim() || !inquiryMessage.trim()) {
      setInquiryError(
        activeLang === 'rw'
          ? 'Nyamuneka mwuzuze amazina, telefone n\'ubutumwa.'
          : activeLang === 'fr'
          ? 'Veuillez renseigner le nom, le numéro de téléphone et le message.'
          : 'Please complete your name, telephone number, and inquiry message.'
      );
      return;
    }

    setIsSubmittingInquiry(true);
    setInquiryError(null);

    try {
      const res = await aiApi.submitInquiry({
        name: inquiryName,
        phone: inquiryPhone,
        email: inquiryEmail,
        sector: inquirySector,
        subject: `Digital Assistant Referral (${activeLang.toUpperCase()})`,
        message: inquiryMessage,
        sessionId,
      });

      if (res?.data?.referenceNumber) {
        setInquirySuccessRef(res.data.referenceNumber);
        setShowInquiryForm(false);

        // Add confirmation message to chat feed
        setMessages((prev) => [
          ...prev,
          {
            id: 'inq_ack_' + Date.now(),
            role: 'assistant',
            content:
              activeLang === 'rw'
                ? `Ubusabe bwawe bwo gufashwa bwakiriwe neza muri sisitemu! Nimero yawe yo gukurikirana ni: **${res.data.referenceNumber}**. Umukozi wacu ushinzwe serivisi arabavugisha vuba.`
                : activeLang === 'fr'
                ? `Votre demande d'assistance a été enregistrée avec succès ! Votre numéro de suivi est : **${res.data.referenceNumber}**. Un responsable vous contactera dans les plus brefs délais.`
                : `Your official support inquiry has been logged! Your tracking reference number is: **${res.data.referenceNumber}**. An authorized officer will follow up with you promptly.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      setInquiryError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  // Quick suggestion chips by language
  const suggestionChips: Record<Language, Array<{ label: string; query: string }>> = {
    rw: [
      { label: 'Gufungura Konti', query: 'Ni ibihe bisabwa ngo mfungure konti muri UBUMWE SACCO?' },
      { label: 'Ubwoko bw\'Inguzanyo', query: 'Ni izihe nguzanyo UBUMWE SACCO itanga n\'uko zisabwa?' },
      { label: 'Serivisi ya *541#', query: 'Ntegereza nte serivisi ya SACCO kuri telefone ukoresheje *541#?' },
      { label: 'Amashami 19 y\'Akarere', query: 'Amashami ya UBUMWE SACCO aherereye he mu mirenge 19?' },
    ],
    en: [
      { label: 'Open an Account', query: 'What are the requirements to open a member account?' },
      { label: 'Loan Products', query: 'What loan products are available and how do I apply?' },
      { label: 'Mobile Banking (*541#)', query: 'How does the *541# USSD mobile banking service work?' },
      { label: '19 Branch Locations', query: 'Where are your 19 sector branches located across Gakenke?' },
    ],
    fr: [
      { label: 'Ouvrir un Compte', query: 'Quelles sont les conditions pour ouvrir un compte membre ?' },
      { label: 'Nos Micro-Crédits', query: 'Quels sont les types de crédits accordés par la SACCO ?' },
      { label: 'Banque Mobile (*541#)', query: 'Comment fonctionne le service bancaire mobile *541# ?' },
      { label: '19 Agences de Gakenke', query: 'Où se situent vos 19 agences dans le district de Gakenke ?' },
    ],
  };

  return (
    <>
      {/* ── Single Floating AI Agent Launcher ── */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            aria-label="Open UBUMWE SACCO Digital Assistant"
            title="UBUMWE SACCO AI Assistant"
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-400 text-white shadow-2xl hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-emerald-200/50 cursor-pointer"
          >
            <Sparkles className="w-7 h-7 text-white transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 border-2 border-slate-950"></span>
            </span>
          </button>
        </div>
      )}

      {/* ── Floating Chat Flyout Window ── */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-4 sm:right-6 z-50 w-[95vw] sm:w-[420px] rounded-2xl shadow-2xl border border-emerald-600/30 bg-slate-950 text-slate-100 flex flex-col overflow-hidden transition-all duration-300 backdrop-blur-xl ${
            isMinimized ? 'h-16' : 'h-[620px] max-h-[85vh]'
          }`}
        >
          {/* ── Top Header ── */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 border-b border-emerald-700/30">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md border border-emerald-300/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white tracking-wide">UBUMWE SACCO</h3>
                  <span className="px-1.5 py-0.2 text-[10px] uppercase font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400/90 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>
                    {activeLang === 'rw'
                      ? 'Amakuru Yemejwe • BNR & RCA'
                      : activeLang === 'fr'
                      ? 'Vérifié • BNR & RCA'
                      : 'Verified Assistant • BNR & RCA'}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Selector */}
              <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60 text-xs">
                {(['en', 'rw', 'fr'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageSwitch(lang)}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-bold uppercase transition-colors ${
                      activeLang === lang
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {/* Reset chat */}
              <button
                onClick={handleClearChat}
                title="Clear conversation"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Minimize */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isMinimized ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* ── Main Message Body ── */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800">
                {/* Official Supervisory Notice Banner */}
                <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-2.5 text-[11px] text-emerald-200/90 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    {activeLang === 'rw'
                      ? 'Ubu bufasha butanga amakuru yemejwe na UBUMWE SACCO Gakenke gusa. Ntabwo buhawe uburenganzira bwo gukora ihererekanyabubasha ry\'amafaranga ryonyine.'
                      : activeLang === 'fr'
                      ? 'Cet assistant ne fournit que des informations vérifiées issues des registres officiels d\'UBUMWE SACCO. Il n\'exécute aucune transaction financière directe.'
                      : 'This assistant answers strictly from approved Ubumwe SACCO knowledge. It will never invent fees or execute transactions without authorization.'}
                  </p>
                </div>

                {/* Messages stream */}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-emerald-700/80 flex items-center justify-center shrink-0 border border-emerald-500/30">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-xs'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {/* Verified sources badge on assistant responses */}
                      {msg.role === 'assistant' && msg.sourcesUsed && msg.sourcesUsed.length > 0 && (
                        <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                          <span className="font-semibold text-emerald-400 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            {activeLang === 'rw' ? 'Amakuru yakuwe muri:' : activeLang === 'fr' ? 'Source vérifiée :' : 'Verified Source:'}
                          </span>
                          {msg.sourcesUsed.map((src, i) => (
                            <span
                              key={i}
                              className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700/40 text-[9px]"
                            >
                              {src}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Escalation box with official channels */}
                      {msg.isEscalated && (
                        <div className="mt-3 p-2.5 bg-emerald-950/70 border border-emerald-500/40 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-300 text-[11px] uppercase tracking-wide">
                            <Phone className="w-3.5 h-3.5" />
                            <span>
                              {activeLang === 'rw'
                                ? 'Itumanaho Ryemewe rya SACCO'
                                : activeLang === 'fr'
                                ? 'Coordonnées Officielles SACCO'
                                : 'Official SACCO Contacts'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                            <a
                              href="https://wa.me/250786422080?text=Hello%20UBUMWE%20SACCO%20GAKENKE%2C%20I%20have%20an%20inquiry"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 text-white hover:text-emerald-300 bg-emerald-900/80 hover:bg-emerald-800 px-2 py-1.5 rounded-lg border border-emerald-600/50 transition-colors font-semibold"
                            >
                              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                              <span>WhatsApp Chat</span>
                            </a>
                            <a
                              href="mailto:ubumwesaccogakenke@gmail.com"
                              className="flex items-center justify-center gap-1.5 text-white hover:text-emerald-300 bg-slate-900/80 hover:bg-slate-800 px-2 py-1.5 rounded-lg border border-slate-700 transition-colors truncate"
                            >
                              <Mail className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="truncate">ubumwesaccogakenke@gmail.com</span>
                            </a>
                            <a
                              href="tel:0786422080"
                              className="flex items-center justify-center gap-1.5 text-white hover:text-emerald-300 bg-slate-900/80 hover:bg-slate-800 px-2 py-1.5 rounded-lg border border-slate-700 transition-colors col-span-1 sm:col-span-2 font-mono-numbers"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Phone: <strong className="text-emerald-300">0786422080</strong> (USSD: *541#)</span>
                            </a>
                          </div>

                          <button
                            onClick={() => {
                              setShowInquiryForm(true);
                              setInquiryMessage(inputMessage || 'Requesting assistance regarding my inquiry.');
                            }}
                            className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-colors shadow-sm"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>
                              {activeLang === 'rw'
                                ? 'Kora Ubusabe Bwanditse (Official Ticket)'
                                : activeLang === 'fr'
                                ? 'Créer un Ticket de Réclamation Officiel'
                                : 'Submit an Official Support Inquiry'}
                            </span>
                          </button>
                        </div>
                      )}

                      <div className="mt-1 text-[9px] text-slate-400/80 text-right">
                        {msg.timestamp}
                      </div>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                        <User className="w-4 h-4 text-slate-300" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading typing bubble */}
                {isLoading && (
                  <div className="flex gap-2.5 items-center">
                    <div className="w-7 h-7 rounded-lg bg-emerald-700/80 flex items-center justify-center shrink-0 border border-emerald-500/30">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-xs px-4 py-2.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                )}

                {/* Suggestion Chips */}
                {messages.length <= 2 && !isLoading && !showInquiryForm && (
                  <div className="pt-2">
                    <p className="text-[11px] text-slate-400 font-semibold mb-2">
                      {activeLang === 'rw'
                        ? 'Ibibazo Bikunze Kubazwa:'
                        : activeLang === 'fr'
                        ? 'Questions fréquentes :'
                        : 'Frequently Asked Questions:'}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(suggestionChips[activeLang] || suggestionChips.en).map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(chip.query)}
                          className="text-[11px] bg-slate-900 hover:bg-emerald-950/70 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-600/50 rounded-lg px-2.5 py-1.5 transition-all text-left"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Official Escalation Inquiry Form Modal (Inline) ── */}
                {showInquiryForm && (
                  <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-3.5 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>
                          {activeLang === 'rw'
                            ? 'Ubusabe Bwanditse bwo Gufashwa'
                            : activeLang === 'fr'
                            ? 'Ticket Officiel de Réclamation'
                            : 'Official Support Inquiry Ticket'}
                        </span>
                      </h4>
                      <button
                        onClick={() => setShowInquiryForm(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {inquiryError && (
                      <div className="bg-red-950/50 border border-red-500/50 text-red-200 text-xs p-2 rounded-lg flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{inquiryError}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmitInquiry} className="space-y-2 text-xs">
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-0.5">
                          {activeLang === 'rw' ? 'Amazina Yanyu *' : activeLang === 'fr' ? 'Nom complet *' : 'Full Name *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={inquiryName}
                          onChange={(e) => setInquiryName(e.target.value)}
                          placeholder="e.g. Jean Pierre Nshimiyimana"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-300 mb-0.5">
                            {activeLang === 'rw' ? 'Telefone *' : activeLang === 'fr' ? 'Téléphone *' : 'Telephone *'}
                          </label>
                          <input
                            type="tel"
                            required
                            value={inquiryPhone}
                            onChange={(e) => setInquiryPhone(e.target.value)}
                            placeholder="078..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-300 mb-0.5">
                            {activeLang === 'rw' ? 'Umurenge' : activeLang === 'fr' ? 'Secteur' : 'Sector'}
                          </label>
                          <select
                            value={inquirySector}
                            onChange={(e) => setInquirySector(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                          >
                            {[
                              'Busengo', 'Coko', 'Cyabingo', 'Gakenke', 'Gashenyi', 'Janja',
                              'Kamubuga', 'Karambo', 'Kivuruga', 'Mataba', 'Minazi', 'Mugunga',
                              'Muhondo', 'Muyongwe', 'Muzo', 'Nemba', 'Ruli', 'Rusasa', 'Rushashi'
                            ].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-300 mb-0.5">
                          {activeLang === 'rw' ? 'Icyo Mwifuza Kubaza *' : activeLang === 'fr' ? 'Votre message *' : 'Message *'}
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={inquiryMessage}
                          onChange={(e) => setInquiryMessage(e.target.value)}
                          placeholder="Describe your inquiry or requested clarification..."
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowInquiryForm(false)}
                          className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingInquiry}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isSubmittingInquiry ? 'Logging...' : 'Submit to SACCO'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ── Input Box & Send Bar ── */}
              <div className="p-3 bg-slate-950 border-t border-slate-800/80">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    maxLength={1000}
                    placeholder={
                      activeLang === 'rw'
                        ? 'Baza ibyerekeye konti, inguzanyo, *541#...'
                        : activeLang === 'fr'
                        ? 'Posez votre question sur nos services...'
                        : 'Ask about accounts, loans, branches, *541#...'
                    }
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />

                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    aria-label="Send Message"
                    className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {/* Footer disclaimer */}
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>UBUMWE SACCO GAKENKE &middot; 2026</span>
                  </span>
                  <span>USSD: *541#</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

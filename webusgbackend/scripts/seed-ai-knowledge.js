'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../src/config/env');
const KnowledgeArticle = require('../src/models/KnowledgeArticle');
const FAQ = require('../src/models/FAQ');

const INITIAL_ARTICLES = [
  {
    title: 'Membership & Account Opening Requirements',
    category: 'membership',
    language: 'en',
    tags: ['membership', 'account', 'requirements', 'opening', 'shares', 'id'],
    isPublished: true,
    isApprovedForAI: true,
    priority: 10,
    summary: 'Clear requirements for becoming a cooperative member and opening an account at Ubumwe SACCO Gakenke.',
    content: `To open a personal or cooperative member account at Ubumwe SACCO Gakenke, prospective members are required to present:
1. A valid copy of the National Identity Card (Kopi y'indangamuntu) or passport for foreigners.
2. Two recent passport-size photographs.
3. Proof of residence or sector location within Gakenke District or surrounding Northern Province.
4. Payment of the initial cooperative share capital (Umugabane Shingiro) and standard account opening administrative charge.
Accounts can be opened at any of our 19 sector branch outposts across Gakenke District. Cooperative membership entitles members to annual dividend distributions voted during the Annual General Meeting (AGM) and access to subsidized agricultural and microfinance loan facilities.`,
  },
  {
    title: 'Cooperative Savings & Deposit Products',
    category: 'savings',
    language: 'en',
    tags: ['savings', 'deposits', 'interest', 'solidarity', 'agriculture'],
    isPublished: true,
    isApprovedForAI: true,
    priority: 9,
    summary: 'Overview of verified savings solutions tailored to Gakenke agrarian households, traders, and cooperatives.',
    content: `Ubumwe SACCO Gakenke offers four primary savings mechanisms:
1. Standard Member Savings Account (Konti Isanzwe): Daily transactional account with zero prohibitive maintenance deductions, allowing seamless deposits and withdrawals.
2. Agricultural Harvest Savings Account (Ubwizigame bw'Ihinga n'Isarura): Tailored to coffee, maize, bean, and vegetable farmers, enabling safe deposit of harvest proceeds with seasonal access.
3. Solidarity & Group Savings Account (Konti y'Amatsinda n'Amakoperative): For tontines, farmer self-help groups, and commercial associations with multi-signature authorization controls.
4. Youth & Education Savings Account (Ubwizigame bw'Urubyiruko n'Uburezi): Designed for parents and students to secure secondary and university tuition fees.
All savings are legally protected under BNR microfinance regulations and insured in compliance with Rwandan financial cooperative standards.`,
  },
  {
    title: 'Credit Solutions & Microfinance Facilities',
    category: 'loans',
    language: 'en',
    tags: ['loans', 'credit', 'interest', 'microfinance', 'agriculture', 'sme'],
    isPublished: true,
    isApprovedForAI: true,
    priority: 9,
    summary: 'Guidelines on loan products, tenure, collateral, and application processes at Ubumwe SACCO.',
    content: `Ubumwe SACCO Gakenke provides tailored microfinance facilities to stimulate local economic vitality across Gakenke District:
1. Agricultural Seasonal Credit: Designed to finance seeds, fertilizers, agricultural equipment, and farm labor. Repayment terms align directly with harvest cycles.
2. SME & Commerce Development Loans: Working capital for shopkeepers, traders in Gakenke commercial centers, artisans, and transport operators.
3. School Fees Loans: Short-term credit disbursed swiftly (within 48 hours for verified dossiers) to cover termly education expenses.
4. Emergency & Medical Advance Credit: Expedited micro-loans for unforeseen urgent family health or livelihood circumstances.
Eligibility requirements: Applicants must hold an active Ubumwe SACCO account with regular savings history, verifiable repayment capacity, and acceptable collateral or solidarity group co-signatures. Loan decisions are reviewed impartially by the Credit Committee in accordance with BNR prudential guidelines.`,
  },
  {
    title: 'Mobile Banking & USSD Service (*541#)',
    category: 'ussd',
    language: 'en',
    tags: ['mobile', 'ussd', 'banking', '*541#', 'momo', 'transfers', 'digital'],
    isPublished: true,
    isApprovedForAI: true,
    priority: 8,
    summary: 'Official instructions for using the *541# mobile banking platform for 24/7 financial access.',
    content: `Members of Ubumwe SACCO Gakenke can access their accounts 24 hours a day, 7 days a week from any feature phone or smartphone by dialing *541#.
Key features available on *541#:
- Real-time balance inquiries and mini-statement review.
- Instant transfers between MTN Mobile Money / Airtel Money and your SACCO savings account.
- Loan repayment installment settlement via mobile wallet.
- Airtime purchases and cooperative announcements.
To register for USSD mobile banking, visit your nearest Ubumwe SACCO branch with your registered mobile phone and National ID to obtain your secure personal PIN. Never share your secret PIN with anyone, including SACCO staff.`,
  },
  {
    title: 'Branch Network & Sector Coverage in Gakenke District',
    category: 'branches',
    language: 'en',
    tags: ['branches', 'outposts', 'sectors', 'gakenke', 'coverage', 'locations'],
    isPublished: true,
    isApprovedForAI: true,
    priority: 7,
    summary: 'Information on the 19 branch outposts ensuring every citizen in Gakenke is within reach of financial services.',
    content: `Ubumwe SACCO Gakenke operates an extensive network of 19 full-service branch outposts covering every administrative sector of Gakenke District:
1. Busengo Branch
2. Coko Branch
3. Cyabingo Branch
4. Gakenke Headquarters & Commercial Center Branch
5. Gashenyi Branch
6. Janja Branch
7. Kamubuga Branch
8. Karambo Branch
9. Kivuruga Branch
10. Mataba Branch
11. Minazi Branch
12. Mugunga Branch
13. Muhondo Branch
14. Muyongwe Branch
15. Muzo Branch
16. Nemba Branch
17. Ruli Branch
18. Rusasa Branch
19. Rushashi Branch
Additionally, 3 strategic sub-branches operate in high-density rural trading centers. Headquarters is located at Gakenke Commercial Center, Gakenke Sector. Official telephone contact for all branches is 0786422080.`,
  },
];

const INITIAL_FAQS = [
  {
    question: 'How do I open an account with Ubumwe SACCO Gakenke?',
    answer: 'To open an account, visit any of our 19 branch outposts with a copy of your National ID, two passport photos, and your initial share capital contribution. Membership is open to all residents, farmers, traders, and groups in Gakenke District.',
    language: 'en',
    category: 'membership',
    priority: 10,
    isPublished: true,
    isApprovedForAI: true,
    tags: ['account', 'open', 'join', 'membership'],
    translations: {
      en: {
        question: 'How do I open an account with Ubumwe SACCO Gakenke?',
        answer: 'To open an account, visit any of our 19 branch outposts with a copy of your National ID, two passport photos, and your initial share capital contribution. Membership is open to all residents, farmers, traders, and groups in Gakenke District.',
      },
      rw: {
        question: 'Nafungura nte konti muri UBUMWE SACCO Gakenke?',
        answer: 'Gufungura konti bisaba: Kopi y\'indangamuntu yawe, amafoto abiri magufi (passeport), n\'umugabane shingiro. Mwagana irihe shami muri 19 dukorera mu mirenge yose y\'Akarere ka Gakenke cyangwa mukaduhamagara kuri 0786422080.',
      },
      fr: {
        question: 'Comment ouvrir un compte auprès d\'UBUMWE SACCO Gakenke ?',
        answer: 'Pour ouvrir un compte, présentez-vous à l\'une de nos 19 agences avec une copie de votre carte d\'identité nationale, deux photos passeport et le versement de part sociale. Tout résident ou commerçant de Gakenke peut adhérer.',
      },
    },
  },
  {
    question: 'What types of loans does Ubumwe SACCO provide?',
    answer: 'Ubumwe SACCO provides Agricultural Seasonal Loans (aligned with planting and harvest), SME/Commerce Development Credit, School Fees Loans (processed within 48 hours), and Emergency Medical Advances. Active membership and verified capacity are required.',
    language: 'en',
    category: 'loans',
    priority: 9,
    isPublished: true,
    isApprovedForAI: true,
    tags: ['loans', 'credit', 'types', 'borrow'],
    translations: {
      en: {
        question: 'What types of loans does Ubumwe SACCO provide?',
        answer: 'Ubumwe SACCO provides Agricultural Seasonal Loans (aligned with planting and harvest), SME/Commerce Development Credit, School Fees Loans (processed within 48 hours), and Emergency Medical Advances. Active membership and verified capacity are required.',
      },
      rw: {
        question: 'Ni izihe nguzanyo UBUMWE SACCO itanga?',
        answer: 'UBUMWE SACCO itanga inguzanyo z\'ubuhinzi n\'ubworozi (zishyurwa ku isarura), inguzanyo z\'ubucuruzi buciriritse (SMEs), inguzanyo zo kwishyura amashuri (zishyurwa vuba), n\'inguzanyo z\'ingoboka. Bisaba kuba ufite konti ifunguye kandi ikora.',
      },
      fr: {
        question: 'Quels types de crédits UBUMWE SACCO propose-t-elle ?',
        answer: 'Nous proposons des crédits agricoles saisonniers, des micro-crédits pour commerçants et PME, des prêts pour frais scolaires (traités rapidement) et des crédits d\'urgence. Une adhésion active et des garanties sont requises.',
      },
    },
  },
  {
    question: 'How do I access my account on mobile phone (*541#)?',
    answer: 'Dial *541# from your registered mobile phone. You can check your account balance, deposit or withdraw via Mobile Money, and pay loan installments 24/7. To register your SIM card, visit your nearest branch outpost with your National ID.',
    language: 'en',
    category: 'digital',
    priority: 8,
    isPublished: true,
    isApprovedForAI: true,
    tags: ['ussd', '*541#', 'mobile', 'momo'],
    translations: {
      en: {
        question: 'How do I access my account on mobile phone (*541#)?',
        answer: 'Dial *541# from your registered mobile phone. You can check your account balance, deposit or withdraw via Mobile Money, and pay loan installments 24/7. To register your SIM card, visit your nearest branch outpost with your National ID.',
      },
      rw: {
        question: 'Ntegereza nte serivisi ya SACCO kuri telefone (*541#)?',
        answer: 'Kanda *541# kuri telefone yawe. Ushobora kugenzura amafaranga asigaye kuri konti, kubitsa no kubikuza ukoresheje Mobile Money, no kwishyura inguzanyo amasaha 24/7. Guhuza telefone na konti bikorerwa ku ishami rikwegereye.',
      },
      fr: {
        question: 'Comment utiliser les services bancaires mobiles (*541#) ?',
        answer: 'Composez *541# depuis votre téléphone portable enregistré pour consulter votre solde, effectuer des dépôts et retraits Mobile Money et rembourser vos échéances 24h/24 et 7j/7.',
      },
    },
  },
  {
    question: 'What are Ubumwe SACCO operating hours and contact details?',
    answer: 'Operating hours are Monday to Friday: 8:00 AM - 5:00 PM; Saturday: 8:00 AM - 1:00 PM. Closed on Sundays (digital banking *541# operates 24/7). Official contact email is ubumwesaccogakenke@gmail.com and phone is 0786422080. WhatsApp: 250786422080.',
    language: 'en',
    category: 'contact',
    priority: 8,
    isPublished: true,
    isApprovedForAI: true,
    tags: ['hours', 'contact', 'email', 'phone', 'whatsapp'],
    translations: {
      en: {
        question: 'What are Ubumwe SACCO operating hours and contact details?',
        answer: 'Operating hours are Monday to Friday: 8:00 AM - 5:00 PM; Saturday: 8:00 AM - 1:00 PM. Closed on Sundays (digital banking *541# operates 24/7). Official contact email is ubumwesaccogakenke@gmail.com and phone is 0786422080. WhatsApp: 250786422080.',
      },
      rw: {
        question: 'Ni ayahe masaha y\'akazi na nimero z\'itumanaho bya UBUMWE SACCO?',
        answer: 'Amasaha y\'akazi: Kuwa Mbere - Kuwa Gatanu: 8:00 - 17:00; Kuwa Gatandatu: 8:00 - 13:00. Ku Cyumweru turafunga (*541# ikora 24/7). Imeri yemewe: ubumwesaccogakenke@gmail.com. Telefone: 0786422080. WhatsApp: 250786422080.',
      },
      fr: {
        question: 'Quels sont les horaires d\'ouverture et coordonnées officielles d\'UBUMWE SACCO ?',
        answer: 'Lundi au Vendredi : 8h00 - 17h00 ; Samedi : 8h00 - 13h00. Fermé le dimanche (*541# disponible 24h/24). Email officiel : ubumwesaccogakenke@gmail.com ; Téléphone : 0786422080 ; WhatsApp : 250786422080.',
      },
    },
  },
  {
    question: 'Where is Ubumwe SACCO located and which sectors does it cover?',
    answer: 'Headquarters is situated at Gakenke Commercial Center, Gakenke Sector. Ubumwe SACCO operates 19 branch outposts across all 19 sectors of Gakenke District in the Northern Province of Rwanda, plus 3 sub-branches.',
    language: 'en',
    category: 'branches',
    priority: 7,
    isPublished: true,
    isApprovedForAI: true,
    tags: ['location', 'headquarters', 'branches', 'sectors'],
    translations: {
      en: {
        question: 'Where is Ubumwe SACCO located and which sectors does it cover?',
        answer: 'Headquarters is situated at Gakenke Commercial Center, Gakenke Sector. Ubumwe SACCO operates 19 branch outposts across all 19 sectors of Gakenke District in the Northern Province of Rwanda, plus 3 sub-branches.',
      },
      rw: {
        question: 'UBUMWE SACCO iherereye he, kandi ikorera mu yihe mirenge?',
        answer: 'Icyicaro gikuru kiri muri Gakenke Commercial Center, mu Murenge wa Gakenke. UBUMWE SACCO ifite amashami 19 mu mirenge yose 19 igize Akarere ka Gakenke mu Ntara y\'Amajyaruguru, hamwe n\'amashami mato 3.',
      },
      fr: {
        question: 'Où est située UBUMWE SACCO et quels secteurs couvre-t-elle ?',
        answer: 'Le siège social est au Centre Commercial de Gakenke, Secteur Gakenke. UBUMWE SACCO dispose de 19 agences couvrant l\'intégralité des 19 secteurs du district de Gakenke, Province du Nord.',
      },
    },
  },
];

async function seedAIKnowledge() {
  console.log('[Seed] Connecting to MongoDB...');
  await mongoose.connect(env.MONGODB_URI);

  console.log('[Seed] Checking existing Knowledge Articles...');
  const existingArticlesCount = await KnowledgeArticle.countDocuments();
  if (existingArticlesCount === 0) {
    await KnowledgeArticle.insertMany(INITIAL_ARTICLES);
    console.log(`[Seed] Seeded ${INITIAL_ARTICLES.length} verified Knowledge Articles.`);
  } else {
    console.log(`[Seed] ${existingArticlesCount} Knowledge Articles already present. Preserving existing data.`);
  }

  console.log('[Seed] Checking existing FAQs...');
  const existingFaqsCount = await FAQ.countDocuments();
  if (existingFaqsCount === 0) {
    await FAQ.insertMany(INITIAL_FAQS);
    console.log(`[Seed] Seeded ${INITIAL_FAQS.length} verified multi-language FAQs.`);
  } else {
    console.log(`[Seed] ${existingFaqsCount} FAQs already present. Preserving existing data.`);
  }

  console.log('[Seed] Completed successfully.');
  await mongoose.disconnect();
}

if (require.main === module) {
  seedAIKnowledge()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]', err);
      process.exit(1);
    });
}

module.exports = { seedAIKnowledge, INITIAL_ARTICLES, INITIAL_FAQS };

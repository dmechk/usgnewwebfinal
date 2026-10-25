'use strict';

require('dotenv').config({ quiet: true });
const connectDB = require('../src/config/db');
const { disconnectDB } = require('../src/config/db');
const Gallery = require('../src/models/Gallery');
const News = require('../src/models/News');
const Career = require('../src/models/Career');

const INITIAL_MOMENTS = [
  {
    title: '15th Annual General Meeting (AGM) & 14.8% Dividend Distribution',
    description: 'General Assembly convening over 1,200 cooperative delegates celebrating 14.8% member dividend payouts and strategic expansion.',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    category: 'agm_dividend',
    isPublished: true,
    publishedAt: new Date(),
  },
  {
    title: 'Modern Coffee Washing & Processing Cooperative Financing',
    description: 'Providing 185M RWF working capital financing to coffee smallholders across Nemba & Gakenke sectors.',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    category: 'community',
    isPublished: true,
    publishedAt: new Date(),
  },
  {
    title: 'District Best Financial Cooperative Award 2025',
    description: 'Recognized by Northern Province leadership and Rwanda Cooperative Agency (RCA) for outstanding financial inclusion.',
    imageUrl: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=1200&q=80',
    category: 'award',
    isPublished: true,
    publishedAt: new Date(),
  },
  {
    title: 'Commissioning of Kivuruga Digital Banking Branch',
    description: 'Expanding branch network to 5 sectors with full MoMo interoperability, cash counters, and solar power backup.',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    category: 'branch_opening',
    isPublished: true,
    publishedAt: new Date(),
  },
  {
    title: 'Women Youth Agri-Entrepreneurs Financial Literacy Bootcamp',
    description: 'Training 350 women and youth cooperative leaders in modern bookkeeping, digital savings, and seasonal loan management.',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    category: 'training',
    isPublished: true,
    publishedAt: new Date(),
  },
];

const INITIAL_ANNOUNCEMENTS = [
  {
    title: '16th Annual General Assembly & 2026 Dividend Distribution Announcement',
    summary: 'All registered members are cordially invited to the 16th Ordinary General Assembly at Gakenke Youth Centre. Dividend payout of 14.8% declared.',
    content: `UBUMWE SACCO GAKENKE Management and Board of Directors are pleased to invite all member representatives to the 16th Ordinary General Assembly.

Agenda:
1. Review of Audited Financial Statements for FY2025
2. Approval of 14.8% Dividend Distribution on Member Share Capital
3. Launch of 2026 Digital Instant Loan Facility (*541#)
4. Election of Supervisory Committee Members

Dividends will be credited directly to members' savings accounts and mobile wallets.`,
    category: 'agm',
    featuredImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80',
    isPublished: true,
    publishedAt: new Date(),
  },
  {
    title: 'Agricultural Season A 2026 Input Financing Window Now Open',
    summary: 'Discounted 13.5% p.a. loans available for certified seeds, subsidized fertilizers, and cooperative storage equipment.',
    content: `Coffee, maize, and Irish potato cooperatives across Gakenke, Nemba, Rusasa, and Kivuruga sectors can now access flexible seasonal agricultural financing.

Features:
- Interest rate: 13.5% per annum
- Grace period aligned with harvest cycles
- Fast turnaround within 48 hours for verified farmer groups`,
    category: 'loan_window',
    featuredImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
    isPublished: true,
    publishedAt: new Date(),
  },
  {
    title: 'Notice on Upgrade of Core Banking & Instant USSD Services (*541#)',
    summary: 'System maintenance scheduled for Sunday midnight. Instant mobile deposits, withdrawals, and balance inquiries fully active.',
    content: `Dear Valued Members,

Please be informed of scheduled system optimization for our core banking infrastructure to increase transaction throughput and security.

During maintenance, USSD *541# and teller operations will experience a brief 30-minute pause. We thank you for your continued partnership.`,
    category: 'notice',
    featuredImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    isPublished: true,
    publishedAt: new Date(),
  },
];

const INITIAL_CAREERS = [
  {
    title: 'Senior Credit & Risk Analyst',
    department: 'Credit & Risk Management',
    location: 'Headquarters, Gakenke',
    employmentType: 'Full-Time',
    description: 'Responsible for evaluating MSME and agricultural loan applications, monitoring credit portfolio quality, and mitigating non-performing loans (NPLs).',
    requirements: [
      "Bachelor's degree in Banking, Finance, Economics, or Business Administration",
      'At least 3 years experience in credit underwriting in a regulated financial institution or SACCO',
      'Strong analytical abilities and deep familiarity with Rwanda financial sector regulations (BNR/RCA)',
      'Fluent in Kinyarwanda and English or French',
    ],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isPublished: true,
    publishedAt: new Date(),
  },
  {
    title: 'Branch Operations Officer & Cashier',
    department: 'Branch Operations',
    location: 'Nemba Branch',
    employmentType: 'Full-Time',
    description: 'Manage counter cash transactions, process member deposits, loan repayments, account openings, and provide first-class member service.',
    requirements: [
      "Bachelor's degree or Advanced Diploma (A1) in Accounting, Management, or Finance",
      'Minimum 1-2 years experience in cash handling and counter customer care in banking/microfinance',
      'High level of integrity, meticulous attention to detail, and numeracy',
      'Resident of or willing to relocate to Gakenke District',
    ],
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    isPublished: true,
    publishedAt: new Date(),
  },
  {
    title: 'IT Systems & Digital Banking Administrator',
    department: 'Information Technology',
    location: 'Headquarters, Gakenke',
    employmentType: 'Full-Time',
    description: 'Oversee cooperative core banking servers, local network infrastructure, USSD integration (*541#), cybersecurity compliance, and system backups.',
    requirements: [
      "Bachelor's degree in Computer Science, Information Technology, or Software Engineering",
      'Knowledge of Linux, Node.js/Python, relational & NoSQL databases, and network administration',
      'Demonstrated experience with financial software integration and API protocols',
      'Familiarity with cybersecurity standards for microfinance institutions',
    ],
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    isPublished: true,
    publishedAt: new Date(),
  },
];

async function seedContent() {
  await connectDB();
  console.log('Checking and safely seeding initial cooperative content (idempotent)...');

  // 1. Gallery
  const galleryCount = await Gallery.countDocuments();
  if (galleryCount === 0) {
    await Gallery.insertMany(INITIAL_MOMENTS);
    console.log(`Seeded ${INITIAL_MOMENTS.length} initial Gallery items.`);
  } else {
    console.log(`Gallery collection already contains ${galleryCount} items; skipping seed.`);
  }

  // 2. News
  const newsCount = await News.countDocuments();
  if (newsCount === 0) {
    await News.insertMany(INITIAL_ANNOUNCEMENTS);
    console.log(`Seeded ${INITIAL_ANNOUNCEMENTS.length} initial News/Announcement articles.`);
  } else {
    console.log(`News collection already contains ${newsCount} articles; skipping seed.`);
  }

  // 3. Careers
  const careersCount = await Career.countDocuments();
  if (careersCount === 0) {
    await Career.insertMany(INITIAL_CAREERS);
    console.log(`Seeded ${INITIAL_CAREERS.length} initial Career postings.`);
  } else {
    console.log(`Careers collection already contains ${careersCount} postings; skipping seed.`);
  }

  console.log('Initial content check completed.');
}

seedContent()
  .catch((err) => {
    console.error('Content seeding error:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });

'use strict';

const crypto = require('crypto');
const KnowledgeArticle = require('../models/KnowledgeArticle');
const FAQ = require('../models/FAQ');
const SiteSettings = require('../models/SiteSettings');
const Inquiry = require('../models/Inquiry');
const AIChatSession = require('../models/AIChatSession');
const generateReferenceNumber = require('../utils/referenceNumber');
const env = require('../config/env');

// Verified fallback institutional knowledge (always present even if DB is empty)
const VERIFIED_INSTITUTION_PROFILE = {
  name: 'UBUMWE SACCO GAKENKE',
  district: 'Gakenke District',
  province: 'Northern Province, Rwanda',
  headquarters: 'Gakenke Commercial Center, Sector Gakenke, Northern Province',
  officialEmail: 'ubumwesaccogakenke@gmail.com',
  officialPhone: '0786422080',
  whatsapp: '+250 786 422 080',
  ussdCode: '*541#',
  regulatoryLicenses: 'Licensed & Supervised by the National Bank of Rwanda (BNR) and Rwanda Cooperative Agency (RCA). RCA Registration No: RCA/COOP/042/2011; License: RCA-MF-2012-088.',
  operatingHours: 'Monday - Friday: 8:00 AM - 5:00 PM | Saturday: 8:00 AM - 1:00 PM | Sunday: Closed (USSD digital banking 24/7)',
  branchesCoverage: '19 Outposts / Branches covering all 19 Sectors of Gakenke District (Busengo, Coko, Cyabingo, Gakenke, Gashenyi, Mugunga, Janja, Kamubuga, Karambo, Kivuruga, Mataba, Minazi, Muhondo, Muyongwe, Muzo, Nemba, Ruli, Rusasa, Rushashi) plus 3 Sub-Branches.',
  servicesSummary: 'Savings accounts (regular, agricultural, youth, solidarity group), Credit and Microfinance loans (agricultural seasonal loans, SME/business development, school fees, emergency loans), USSD Mobile Banking (*541#), and dividend distribution.',
};

/**
 * Detects whether a message is likely in Kinyarwanda, French, or English.
 */
function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'en';
  const lower = text.toLowerCase();

  // Kinyarwanda markers
  const rwMarkers = [
    'muraho', 'amakuru', 'mwiriwe', 'mwaramutse', 'bite', 'yego', 'oya',
    'sacco', 'ubumwe', 'gakenke', 'amafaranga', 'inguzanyo', 'kuzigama',
    'ubwizigame', 'konti', 'gufungura', 'gufungura konti', 'amashami',
    'umunyamuryango', 'inyungu', 'serivisi', 'gute', 'he', 'ryari',
    'ndifuza', 'ndashaka', 'nshaka', 'mungurize', 'mbaze', 'mumbwire',
    'gahunda', 'ubuyobozi', 'uburyo', 'itegeko', 'akarere', 'umurenge',
  ];

  // French markers
  const frMarkers = [
    'bonjour', 'bonsoir', 'salut', 'merci', 'comment', 'pourquoi',
    'combien', 'prêt', 'pret', 'crédit', 'credit', 'épargne', 'epargne',
    'compte', 'ouvrir', 'adhésion', 'adhesion', 'membre', 'taux',
    'interet', 'intérêt', 'agence', 'succursale', 'heures', 'contact',
    'aidez-moi', 'je voudrais', 's\'il vous plaît', 'service',
  ];

  let rwScore = 0;
  for (const marker of rwMarkers) {
    if (new RegExp(`\\b${marker}\\b`, 'i').test(lower)) rwScore++;
  }

  let frScore = 0;
  for (const marker of frMarkers) {
    if (new RegExp(`\\b${marker}\\b`, 'i').test(lower)) frScore++;
  }

  if (rwScore >= 1 && rwScore >= frScore) return 'rw';
  if (frScore >= 1 && frScore > rwScore) return 'fr';
  return 'en';
}

/**
 * Retrieves verified context from MongoDB knowledge collections and site settings.
 */
async function retrieveVerifiedContext(userQuery, language = 'en') {
  const queryLower = userQuery.toLowerCase().trim();
  const searchTerms = queryLower.split(/\s+/).filter((w) => w.length > 2);

  const contextPieces = [];
  const sourcesUsed = [];

  try {
    // 1. Check FAQs
    let faqs = [];
    try {
      faqs = await FAQ.find({ isPublished: true, isApprovedForAI: true })
        .limit(30)
        .lean();
    } catch {
      faqs = [];
    }

    const matchedFaqs = faqs.filter((faq) => {
      const q = (faq.question || '').toLowerCase();
      const a = (faq.answer || '').toLowerCase();
      const trEnQ = (faq.translations?.en?.question || '').toLowerCase();
      const trRwQ = (faq.translations?.rw?.question || '').toLowerCase();
      const trFrQ = (faq.translations?.fr?.question || '').toLowerCase();

      return searchTerms.some((t) =>
        q.includes(t) || a.includes(t) || trEnQ.includes(t) || trRwQ.includes(t) || trFrQ.includes(t)
      );
    });

    for (const faq of matchedFaqs.slice(0, 5)) {
      let qText = faq.question;
      let aText = faq.answer;
      if (language === 'rw' && faq.translations?.rw?.question) {
        qText = faq.translations.rw.question;
        aText = faq.translations.rw.answer || faq.answer;
      } else if (language === 'fr' && faq.translations?.fr?.question) {
        qText = faq.translations.fr.question;
        aText = faq.translations.fr.answer || faq.answer;
      }
      contextPieces.push(`[FAQ: ${faq.category}] Question: ${qText} -> Reponse: ${aText}`);
      sourcesUsed.push(`FAQ (${faq.category})`);
    }

    // 2. Check Knowledge Articles
    let articles = [];
    try {
      articles = await KnowledgeArticle.find({ isPublished: true, isApprovedForAI: true })
        .limit(20)
        .lean();
    } catch {
      articles = [];
    }

    const matchedArticles = articles.filter((art) => {
      const title = (art.title || '').toLowerCase();
      const content = (art.content || '').toLowerCase();
      const tags = (art.tags || []).map((t) => t.toLowerCase()).join(' ');
      return searchTerms.some((t) => title.includes(t) || content.includes(t) || tags.includes(t));
    });

    for (const art of matchedArticles.slice(0, 4)) {
      contextPieces.push(`[Article: ${art.title} (${art.category})]: ${art.content}`);
      sourcesUsed.push(`Article: ${art.title}`);
    }

    // 3. Check Live Site Settings (Products, Branches, SaccoInfo)
    try {
      const settings = await SiteSettings.findOne({ key: 'global' }).lean();
      if (settings) {
        if (settings.saccoInfo) {
          const info = settings.saccoInfo;
          contextPieces.push(
            `[Official SACCO Contact & Hours]: Headquarters: ${info.headquarters || VERIFIED_INSTITUTION_PROFILE.headquarters}. Official Email: ${info.email || VERIFIED_INSTITUTION_PROFILE.officialEmail}. Phone: ${info.phone || VERIFIED_INSTITUTION_PROFILE.officialPhone}. WhatsApp: ${info.whatsapp || VERIFIED_INSTITUTION_PROFILE.whatsapp}. USSD code: ${info.ussdCode || VERIFIED_INSTITUTION_PROFILE.ussdCode}. Operating hours: ${info.operatingHoursEn || VERIFIED_INSTITUTION_PROFILE.operatingHours}. Branches count: ${info.branchesCount || 19}.`
          );
          sourcesUsed.push('Official SACCO Settings');
        }

        if (Array.isArray(settings.products) && settings.products.length > 0) {
          const relevantProducts = settings.products.filter((p) => {
            const name = (p.nameEn || p.name || p.titleEn || '').toLowerCase();
            const desc = (p.descriptionEn || p.desc || '').toLowerCase();
            return searchTerms.some((t) => name.includes(t) || desc.includes(t));
          });
          const prodsToInclude = relevantProducts.length > 0 ? relevantProducts.slice(0, 4) : settings.products.slice(0, 3);
          for (const p of prodsToInclude) {
            contextPieces.push(
              `[Product: ${p.nameEn || p.name || 'Financial Product'}]: Type: ${p.category || 'Service'}. Description: ${p.descriptionEn || p.descriptionRw || ''}. Eligibility: ${p.requirementsEn || p.featuresEn || 'Member account required'}.`
            );
            sourcesUsed.push(`Product: ${p.nameEn || p.name}`);
          }
        }

        if (Array.isArray(settings.branches) && settings.branches.length > 0) {
          const branchMentions = settings.branches.filter((b) => {
            const bName = (b.name || b.sector || '').toLowerCase();
            return searchTerms.some((t) => bName.includes(t));
          });
          if (branchMentions.length > 0) {
            for (const b of branchMentions.slice(0, 3)) {
              contextPieces.push(`[Branch Outpost: ${b.name || b.sector}]: Located in ${b.sector} sector, Gakenke District. Contact: ${b.phone || VERIFIED_INSTITUTION_PROFILE.officialPhone}.`);
              sourcesUsed.push(`Branch: ${b.name || b.sector}`);
            }
          }
        }
      }
    } catch {
      // Ignore settings fetch error, fall back to default profile
    }
  } catch (err) {
    console.warn('[AI Service] Context retrieval partial error:', err.message);
  }

  // Always include verified institution profile
  contextPieces.unshift(
    `[Verified Institution Identity]: ${VERIFIED_INSTITUTION_PROFILE.name}. Located in ${VERIFIED_INSTITUTION_PROFILE.headquarters}. Official Email: ${VERIFIED_INSTITUTION_PROFILE.officialEmail}. Telephone: ${VERIFIED_INSTITUTION_PROFILE.officialPhone}. USSD Banking: ${VERIFIED_INSTITUTION_PROFILE.ussdCode}. Regulated by: ${VERIFIED_INSTITUTION_PROFILE.regulatoryLicenses}. Branch network: ${VERIFIED_INSTITUTION_PROFILE.branchesCoverage}. Working hours: ${VERIFIED_INSTITUTION_PROFILE.operatingHours}.`
  );

  return {
    contextText: contextPieces.join('\n\n'),
    sourcesUsed: Array.from(new Set(sourcesUsed)),
  };
}

/**
 * Builds the strict system prompt for Ubumwe SACCO AI Agent.
 */
function buildSystemPrompt(language = 'en') {
  return `You are the official digital assistant of Ubumwe SACCO Gakenke, a licensed financial cooperative regulated and supervised by the National Bank of Rwanda (BNR) and Rwanda Cooperative Agency (RCA), located in Gakenke District, Northern Province, Rwanda.

YOUR CORE MANDATE:
1. Provide accurate, helpful, verified information about Ubumwe SACCO's actual savings products, micro-credit loans, 19 sector branches, USSD banking (*541#), membership requirements, and operating hours based strictly on the VERIFIED CONTEXT provided below.
2. Rely ONLY on the VERIFIED CONTEXT from Ubumwe SACCO Gakenke. Do not invent or assume outside policies.
3. NEVER hallucinate, fabricate, or invent interest rates, penalty fees, loan qualification decisions, individual account balances, or transaction receipts.
4. FOR ADVANCED OR COMPLEX QUESTIONS:
   If the user asks an advanced, complex, technical, or personal financial question (such as specific loan approval decisions, individual balance lookups, formal dispute resolutions, job applicant deliberation notes, or customized loan term appraisals):
   - Provide whatever general guidelines exist in our verified system, AND
   - EXPLICITLY refer the user to our official human support channels for direct resolution:
     * WhatsApp: +250 786 422 080 (Direct WhatsApp support)
     * Official Email: ubumwesaccogakenke@gmail.com
     * Telephone: 0786422080
     * Head Office: Gakenke Commercial Center, Gakenke Sector (or visit any of our 19 sector branches).
5. The official contact email is ALWAYS ubumwesaccogakenke@gmail.com. NEVER use or reveal ubumwesaccogakenke1@gmail.com (which is for system SMTP only).
6. The official phone number is 0786422080, and official WhatsApp is +250 786 422 080.
7. Maintain a polite, professional, cooperative, and respectful tone appropriate for an institutional financial cooperative.
8. Respond in the language used by the user:
   - If the user writes in Kinyarwanda, reply in natural, polite Kinyarwanda and include WhatsApp & Email.
   - If the user writes in French, reply in clear, professional French and include WhatsApp & Email.
   - If the user writes in English, reply in professional English and include WhatsApp & Email.`;
}

/**
 * Calls Google Gemini REST API using native fetch.
 */
async function callGeminiApi(systemPrompt, userQuery, contextText) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return null; // Signals fallback
  }

  const model = process.env.AI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const promptContent = `VERIFIED CONTEXT FROM UBUMWE SACCO GAKENKE DATABASE:
"""
${contextText}
"""

USER QUESTION:
"${userQuery}"

Please respond accurately according to your system mandate and verified context.`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: promptContent }],
      },
    ],
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    generationConfig: {
      temperature: 0.2, // Low temperature for high factual accuracy
      maxOutputTokens: 800,
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errBody = await response.text();
      console.warn(`[Gemini API Error] Status ${response.status}: ${errBody}`);
      return null;
    }

    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return generatedText ? generatedText.trim() : null;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[Gemini API Exception]', err.message);
    return null;
  }
}

/**
 * Deterministic rule-based response engine that directly answers user questions
 * across all official Ubumwe SACCO Gakenke domains (services, accounts, loans,
 * branches, USSD, leadership, careers, hours, contacts).
 */
function generateDeterministicResponse(userQuery, contextText, language = 'en') {
  const q = userQuery.toLowerCase().trim();

  // -------------------------------------------------------------
  // KINYARWANDA KNOWLEDGE MATCHER
  // -------------------------------------------------------------
  if (language === 'rw') {
    // 1. Intashyo (Greetings)
    if (q.includes('muraho') || q.includes('amakuru') || q.includes('mwiriwe') || q.includes('mwaramutse') || q.includes('bite') || q.includes('kaze')) {
      return `Muraho neza! Ndi umufasha wanyu mu buryo bw'ikoranabuhanga muri UBUMWE SACCO Gakenke. Nshobora kubasubiza byihuse ku ngingo zikurikira:
• Gufungura konti n'ibisabwa kugira ngo ube umunyamuryango
• Serivisi z'ubwizigame n'inyungu ku migabane (9.8% dividend)
• Inguzanyo z'ubuhinzi (agri-credit), ubucuruzi (SME), amashuri n'ingoboka
• Gukoresha serivisi ya telefone kuri USSD *541#
• Amashami yacu 19 mu mirenge yose igize Akarere ka Gakenke
• Amasaha y'akazi n'aho tubarizwa.
Ni iki mwifuza ko tuganiraho?`;
    }

    // 2. Abo turibo / Ubumwe SACCO ni iki (About Us)
    if (q.includes('abo turibo') || q.includes('ni iki') || q.includes('amateka') || q.includes('koperative') || q.includes('rca') || q.includes('bnr') || (q.includes('ubumwe') && q.includes('sacco'))) {
      return `UBUMWE SACCO GAKENKE ni koperative yo kubitsa no kugurizanya yemewe kandi igenzurwa na Banki Nkuru y'u Rwanda (BNR) hamwe n'Ikigo cy'Igihugu Gishinzwe Amakoperative (RCA).
Yashinzwe mu mwaka wa 2011, ifite abanyamuryango barenze 18,640, ikaba ifite amashami 19 akorera mu mirenge yose 19 igize Akarere ka Gakenke.
Intego yacu ni uguteza imbere abanyamuryango n'abaturage binyuze mu kubitsa, gutanga inguzanyo ziciriritse, no kwegereza abantu serivisi z'imari zinoze.`;
    }

    // 3. Gufungura Konti / Kwinjira mu Bunyamuryango (Account Opening & Membership)
    if (q.includes('konti') || q.includes('gufungura') || q.includes('kwinjira') || q.includes('umunyamuryango') || q.includes('ibyangombwa')) {
      return `Kuba umunyamuryango no gufungura konti muri UBUMWE SACCO Gakenke biroroshye cyane:
1. Kopi y'indangamuntu y'u Rwanda (imibare 16).
2. Amafoto abiri magufi (passeport).
3. Kugura umugabane w'ifatizo (10,000 RWF).
4. Ubwizigame bwa mbere butari munsi ya 5,000 RWF.
Mushobora gufungurira konti ku ishami ryacu rihegereye mu mirenge 19 ya Gakenke, cyangwa mukatwandikira kuri WhatsApp: +250 786 422 080.`;
    }

    // 4. Ubwizigame & Inyungu ku migabane (Savings & Dividends)
    if (q.includes('ubwizigame') || q.includes('kuzigama') || q.includes('inyungu') || q.includes('imigabane') || q.includes('uruhare') || q.includes('dividende') || q.includes('kubitsa')) {
      return `UBUMWE SACCO Gakenke ifite gahunda z'ubwizigame zunguka cyane:
1. Ubwizigame bw'Uruhare rw'Umunyamuryango: Buhabwa inyungu y'umwaka (dividende igera kuri 9.8%), kandi bukakwemerera kwaka inguzanyo yikubye inshuro 4 z'amafaranga wazigamye.
2. Konti yo Kuzigama Igihe Kirekire (Fixed Term Deposit): Itanga inyungu iri hagati ya 8.5% na 10.5% ku mwaka (kuva ku mezi 3 kugeza kuri 24).
Kubitsa byoroshye ukoresheje telefone yawe ukanze *541# amasaha 24/7.`;
    }

    // 5. Ibyerekeye Inguzanyo (Loans & Credit)
    if (q.includes('inguzanyo') || q.includes('umwenda') || q.includes('kuguriza') || q.includes('ubuhinzi') || q.includes('ubworozi') || q.includes('ubucuruzi') || q.includes('amaduka')) {
      return `UBUMWE SACCO itanga inguzanyo zikurikira:
1. Inguzanyo y'Ubuhinzi n'Ubworozi (Agri-Credit): Inyungu ya 1.1% ku kwezi (13.2% ku mwaka). Igenewe abahinzi b'ikawa, icyayi, ibigori, ibirayi n'aborozi. Ifite amezi agera kuri 4 yo gutegereza igihe cy'isarura (grace period).
2. Inguzanyo y'Ubucuruzi (SME Micro-Loan): Inyungu ya 1.25% ku kwezi (15% ku mwaka), igenewe kongera igishoro cy'amaduka n'abacuruzi, isuzumwa mu masaha 48-72.
3. Inguzanyo z'Amafaranga y'Ishuri (School Fees) n'Ingoboka (Emergency).
Ibisabwa: Kuba uri umunyamuryango uzigama, ingwate yemewe, n'abishingizi babiri b'abanyamuryango.`;
    }

    // 6. Serivisi ya Telefone / USSD *541# (Mobile Banking)
    if (q.includes('telefone') || q.includes('ussd') || q.includes('541') || q.includes('*541#') || q.includes('momo') || q.includes('mtn') || q.includes('airtel') || q.includes('kubikuza')) {
      return `Serivisi yacu ya USSD ikora mukanda *541# kuri telefone igendanwa.
Icyo iyi serivisi igufasha (amasaha 24/7):
• Kubitsa amafaranga kuri konti yawe ya SACCO uvanye kuri Mobile Money (MTN / Airtel).
• Kubikuza amafaranga kuri konti yawe uyohereza kuri Mobile Money.
• Kugenzura amafaranga asigaye kuri konti (Balance Inquiry) na raporo ngufi (Mini-statement).
• Koherereza undi munyamuryango wa UBUMWE SACCO.`;
    }

    // 7. Amashami 19 n'Aho dukorera (Branches & Locations)
    if (q.includes('amashami') || q.includes('aho mukorera') || q.includes('icyicaro') || q.includes('akarere') || q.includes('umurenge') || q.includes('adresi') || q.includes('outpost')) {
      return `UBUMWE SACCO ifite amashami 19 n'amashami mato 3 mu mirenge yose 19 y'Akarere ka Gakenke:
Busengo, Coko, Cyabingo, Gakenke, Gashenyi, Janja, Kamubuga, Karambo, Kivuruga, Mataba, Minazi, Mugunga, Muhondo, Muyongwe, Muzo, Nemba, Ruli, Rusasa, na Rushashi.
Icyicaro Gikuru kiri mu mujyi wa Gakenke (Gakenke Commercial Center, Sector Gakenke).`;
    }

    // 8. Amasaha y'Akazi (Operating Hours)
    if (q.includes('amasaha') || q.includes('igihe mukingurira') || q.includes('kuwa gatandatu') || q.includes('icyumweru')) {
      return `Amasaha yacu y'akazi ni aya akurikira:
• Kuwa Mbere kugeza Kuwa Gatanu: Saa 8:00 za mugitondo kugeza Saa 17:00 (5:00 PM).
• Kuwa Gatandatu: Saa 8:00 kugeza Saa 13:00 (1:00 PM).
• Ku Cyumweru: Turafunga, ariko serivisi ya *541# kuri telefone ikora amasaha yose 24/7.`;
    }

    // 9. Ubuyobozi (Leadership & Directors)
    if (q.includes('ubuyobozi') || q.includes('umuyobozi') || q.includes('directeur') || q.includes('manager') || q.includes('mbitsemunda') || q.includes('phocas') || q.includes('wellars')) {
      return `Ubuyobozi bwa UBUMWE SACCO Gakenke buyobowe na:
• Umuyobozi Mukuru (General Manager): Bwana Mbitsemunda Phocas.
• Perezida w'Inama y'Ubutegetsi (Board Chair): Bwana Wellars hamwe n'abandi bagize Inama y'Ubutegetsi n'iy'Ubugenzuzi.
Ubuyobozi bukorera mu mucyo wemejwe na Banki Nkuru y'u Rwanda (BNR) n'Ikigo cy'Igihugu Gishinzwe Amakoperative (RCA).`;
    }

    // 10. Akazi n'Imirimo (Careers & Jobs)
    if (q.includes('akazi') || q.includes('imirimo') || q.includes('gusaba akazi') || q.includes('ipiganwa') || q.includes('dosiyeti')) {
      return `Amatangazo yose y'akazi muri UBUMWE SACCO Gakenke anyuzwa mu buryo bw'umucyo ku rubuga rwacu mu gice cy'Imirimo (Careers).
Iyo amatangazo asohotse, ibisabwa n'igihe ntarengwa byose biratangazwa, kandi abakandida bashobora kohereza dosiye zabo kuri interineti cyangwa ku biro byacu bikuru i Gakenke.`;
    }

    // 11. Itumanaho ryemewe (Contact Channels)
    if (q.includes('itumanaho') || q.includes('nimero') || q.includes('numero') || q.includes('imeri') || q.includes('email') || q.includes('whatsapp') || q.includes('twandikire')) {
      return `Mushobora kuvugana na UBUMWE SACCO Gakenke binyuze kuri:
• WhatsApp: +250 786 422 080
• Telefone Desk: 0786422080
• Imeri yemewe: ubumwesaccogakenke@gmail.com
• USSD Telefone: Kanda *541#
• Icyicaro Gikuru: Gakenke Commercial Center, Akarere ka Gakenke.`;
    }

    // 12. Advanced / Personal / Fallback Referral
    return `Ku bibazo byihariye byerekeye konti yawe bwite, inguzanyo ziri mu isuzumwa, cyangwa ibindi bisobanuro byimbitse:
Nyamuneka mwakorana n'abakozi bacu b'ubufasha bwihuse binyuze kuri:
• WhatsApp yemewe: +250 786 422 080
• Imeri yemewe: ubumwesaccogakenke@gmail.com
• Telefone: 0786422080
• Icyicaro Gikuru: Gakenke Commercial Center cyangwa ishami ryacu rihegereye mu murenge wanyu.`;
  }

  // -------------------------------------------------------------
  // FRENCH KNOWLEDGE MATCHER
  // -------------------------------------------------------------
  if (language === 'fr') {
    // 1. Salutations
    if (q.includes('bonjour') || q.includes('salut') || q.includes('bonsoir') || q.includes('qui etes') || q.includes('qui êtes')) {
      return `Bonjour ! Je suis l'assistant numérique officiel d'UBUMWE SACCO Gakenke. Je peux vous renseigner précisément sur :
• L'ouverture de compte et les conditions d'adhésion
• Les solutions d'épargne et dividendes annuels (9,8%)
• Les crédits agricoles, commerciaux pour PME, scolaires et d'urgence
• La banque mobile 24h/24 via le code USSD *541#
• Notre réseau de 19 agences dans le district de Gakenke
• Les horaires d'ouverture et coordonnées officielles.
Sur quel sujet souhaitez-vous des informations ?`;
    }

    // 2. À propos d'UBUMWE SACCO (About Us)
    if (q.includes('a propos') || q.includes('à propos') || q.includes('qui sommes') || q.includes('histoire') || q.includes('cooperative') || q.includes('coopérative') || q.includes('bnr') || q.includes('rca')) {
      return `UBUMWE SACCO GAKENKE est une coopérative d'épargne et de crédit agréée et régulée par la Banque Nationale du Rwanda (BNR) et l'Agence Rwandaise des Coopératives (RCA).
Fondée en 2011, elle compte plus de 18 640 membres actifs et dispose de 19 agences réparties dans l'ensemble des 19 secteurs du district de Gakenke.
Notre mission est de promouvoir l'inclusion financière et le développement économique communautaire par l'épargne sécurisée et le crédit accessible.`;
    }

    // 3. Ouverture de Compte (Account Opening)
    if (q.includes('compte') || q.includes('ouvrir') || q.includes('ouverture') || q.includes('membre') || q.includes('adhesion') || q.includes('adhésion') || q.includes('rejoindre')) {
      return `L'ouverture d'un compte de membre chez UBUMWE SACCO Gakenke requiert :
1. Une copie de votre pièce d'identité nationale rwandaise (16 chiffres).
2. Deux photos d'identité de format passeport.
3. L'achat de la part sociale obligatoire de 10 000 RWF.
4. Un premier versement d'épargne d'au moins 5 000 RWF.
Vous pouvez ouvrir votre compte dans l'une de nos 19 agences de secteur ou nous contacter sur WhatsApp au +250 786 422 080.`;
    }

    // 4. Produits d'Épargne & Dividendes (Savings & Dividends)
    if (q.includes('epargne') || q.includes('épargne') || q.includes('dividende') || q.includes('part sociale') || q.includes('depot') || q.includes('dépôt') || q.includes('taux')) {
      return `UBUMWE SACCO propose des produits d'épargne très avantageux :
1. Épargne obligatoire des membres (Uruhare) : Génère un dividende annuel élevé (environ 9,8%) et permet d'emprunter jusqu'à 4 fois le montant de votre épargne constituée.
2. Dépôt à terme bloqué (Term Deposit) : Taux de rémunération attractif garanti de 8,5% à 10,5% par an pour des durées de 3 à 24 mois.
Vos dépôts peuvent être effectués 24h/24 via mobile en composant *541#.`;
    }

    // 5. Crédits & Prêts (Loans & Credit)
    if (q.includes('credit') || q.includes('crédit') || q.includes('pret') || q.includes('prêt') || q.includes('emprunt') || q.includes('agricole') || q.includes('pme') || q.includes('commercial')) {
      return `UBUMWE SACCO accorde plusieurs formules de financement :
1. Crédit Agricole (Agri-Credit) : Taux préférentiel de 1,1% par mois (13,2% par an) avec un différé de remboursement jusqu'à 4 mois (aligné sur les récoltes de café, thé, maïs et pommes de terre).
2. Micro-Crédit Commercial PME : Taux de 1,25% par mois (15% par an) pour fonds de roulement et boutiques, accordé sous 48 à 72 heures.
3. Prêts Scolaires et Avances d'Urgence.
Conditions : Être membre actif régulier, présenter une garantie agréée et deux membres garants.`;
    }

    // 6. Banque Mobile USSD *541# (Mobile Banking)
    if (q.includes('ussd') || q.includes('541') || q.includes('*541#') || q.includes('mobile') || q.includes('momo') || q.includes('mtn') || q.includes('airtel') || q.includes('telephone') || q.includes('téléphone')) {
      return `Le service bancaire mobile d'UBUMWE SACCO est accessible en composant le code court USSD *541# sur votre téléphone.
Fonctionnalités disponibles 24h/24 et 7j/7 :
• Dépôt instantané depuis votre compte Mobile Money (MTN / Airtel) vers votre compte SACCO.
• Retrait sécurisé de votre compte SACCO vers votre Mobile Money.
• Consultation du solde et mini-relevé des dernières transactions.
• Virements directs entre membres d'UBUMWE SACCO.`;
    }

    // 7. Agences & Localisation (19 Branches)
    if (q.includes('agence') || q.includes('agences') || q.includes('succursale') || q.includes('adresse') || q.includes('localisation') || q.includes('ou se trouve') || q.includes('où se trouve') || q.includes('secteurs') || q.includes('siege') || q.includes('siège')) {
      return `UBUMWE SACCO compte 19 agences et 3 sous-postes couvrant la totalité des 19 secteurs du district de Gakenke :
Busengo, Coko, Cyabingo, Gakenke, Gashenyi, Janja, Kamubuga, Karambo, Kivuruga, Mataba, Minazi, Mugunga, Muhondo, Muyongwe, Muzo, Nemba, Ruli, Rusasa et Rushashi.
Le Siège Social est situé au Centre Commercial de Gakenke (Secteur Gakenke).`;
    }

    // 8. Horaires d'Ouverture (Hours)
    if (q.includes('heures') || q.includes('horaires') || q.includes('ouverture') || q.includes('fermeture') || q.includes('samedi') || q.includes('dimanche')) {
      return `Nos horaires d'ouverture :
• Du Lundi au Vendredi : de 8h00 à 17h00 sans interruption.
• Samedi : de 8h00 à 13h00.
• Dimanche : Fermé (les services mobiles *541# restent actifs 24h/24).`;
    }

    // 9. Direction & Dirigeants (Leadership)
    if (q.includes('direction') || q.includes('directeur') || q.includes('gerant') || q.includes('gérant') || q.includes('conseil') || q.includes('mbitsemunda') || q.includes('phocas') || q.includes('wellars')) {
      return `La direction d'UBUMWE SACCO Gakenke est assurée par :
• Directeur Général (General Manager) : M. Mbitsemunda Phocas.
• Président du Conseil d'Administration : M. Wellars, appuyé par les comités de crédit et de surveillance agréés par la BNR et la RCA.`;
    }

    // 10. Carrières & Recrutement (Careers)
    if (q.includes('carriere') || q.includes('carrière') || q.includes('emploi') || q.includes('recrutement') || q.includes('poste') || q.includes('postuler') || q.includes('candidature')) {
      return `Toutes les offres d'emploi et avis de vacance de poste chez UBUMWE SACCO Gakenke sont publiés sur notre portail officiel dans la section Carrières.
Les candidatures s'effectuent en ligne avec dépôt de CV et lettre de motivation, ou directement au siège à Gakenke.`;
    }

    // 11. Coordonnées Officielles (Contact)
    if (q.includes('contact') || q.includes('telephone') || q.includes('téléphone') || q.includes('email') || q.includes('whatsapp') || q.includes('joindre')) {
      return `Pour contacter directement UBUMWE SACCO Gakenke :
• WhatsApp officiel : +250 786 422 080
• Téléphone direct : 0786422080
• Email officiel : ubumwesaccogakenke@gmail.com
• USSD Mobile : *541#
• Siège : Centre Commercial de Gakenke, Secteur Gakenke.`;
    }

    // 12. Fallback / Question Avancée
    return `Pour toute question spécifique nécessitant la consultation de votre compte personnel, l'état d'un dossier de prêt en cours ou une étude technique :
Veuillez contacter directement nos conseillers officiels :
• WhatsApp : +250 786 422 080 (Assistance WhatsApp directe)
• Email : ubumwesaccogakenke@gmail.com
• Téléphone : 0786422080
• Siège : Centre Commercial de Gakenke ou auprès de l'une de nos 19 agences.`;
  }

  // -------------------------------------------------------------
  // ENGLISH KNOWLEDGE MATCHER (Default)
  // -------------------------------------------------------------
  // 1. Greetings
  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('good morning') || q.includes('good afternoon') || q.includes('who are you')) {
    return `Hello! I am the official digital assistant for UBUMWE SACCO Gakenke. I can help you with:
• Membership requirements and opening an account
• High-yield savings accounts and annual dividend returns (9.8%)
• Tailored loans: Agricultural credit, SME business credit, school fees, and emergencies
• 24/7 Mobile Banking services on your phone (*541#)
• Our network of 19 branches covering every sector of Gakenke District
• Operating hours and official contact details.
What would you like to know today?`;
  }

  // 2. About UBUMWE SACCO (About Us)
  if (q.includes('about') || q.includes('what is ubumwe') || q.includes('history') || q.includes('cooperative') || q.includes('rca') || q.includes('bnr') || q.includes('mission')) {
    return `UBUMWE SACCO GAKENKE is a premier savings and credit cooperative licensed, regulated, and supervised by the National Bank of Rwanda (BNR) and the Rwanda Cooperative Agency (RCA).
Founded in 2011, the cooperative serves over 18,640 active members across Gakenke District through 19 full-service branch outposts and 3 sub-branches.
Our mission is community economic empowerment through accessible microfinance, secure savings, and affordable credit facilities.`;
  }

  // 3. Opening an Account & Joining (Account Opening)
  if (q.includes('account') || q.includes('join') || q.includes('open') || q.includes('membership') || q.includes('how to join') || q.includes('requirement')) {
    return `Opening an account and becoming a member of UBUMWE SACCO Gakenke is simple and straightforward:
1. Valid copy of Rwanda National ID (16 digits).
2. Two recent passport-sized photographs.
3. Cooperative share capital purchase of 10,000 RWF.
4. Initial minimum savings deposit of 5,000 RWF.
You can open an account at any of our 19 sector branches across Gakenke District, or chat with us on WhatsApp at +250 786 422 080.`;
  }

  // 4. Savings Products & Dividends (Savings)
  if (q.includes('saving') || q.includes('save') || q.includes('deposit') || q.includes('dividend') || q.includes('interest') || q.includes('return') || q.includes('share capital') || q.includes('term deposit') || q.includes('uruhare')) {
    return `UBUMWE SACCO Gakenke provides competitive, rewarding savings products:
1. Compulsory Member Savings (Uruhare): Generates an annual profit dividend declared at the AGM (averaging 9.8%), and qualifies members to borrow up to 4 times their accumulated savings.
2. Fixed Term Deposit Account: Guaranteed high-yield returns between 8.5% and 10.5% per annum for tenures of 3 to 24 months, complete with an official Certificate of Deposit.
Deposits can be made instantly from your phone 24/7 by dialing *541#.`;
  }

  // 5. Loan Products & Credit Facilities (Loans)
  if (q.includes('loan') || q.includes('loans') || q.includes('credit') || q.includes('borrow') || q.includes('agri') || q.includes('farm') || q.includes('business') || q.includes('sme') || q.includes('emergency') || q.includes('school fee')) {
    return `UBUMWE SACCO provides community-first credit facilities:
1. Agricultural Seasonal Credit (Ubuhinzi n'Ubworozi): 1.1% per month (13.2% per annum) with up to 4 months grace period, synchronized with coffee, tea, maize, and potato harvest seasons.
2. SME Business Working Capital: 1.25% per month (15% per annum) for shops, traders, and artisans, with review and approval turnaround within 48 to 72 hours.
3. School Fees and Emergency Member Loans.
Requirements: Active membership with regular savings history, acceptable collateral or cooperative certificate, and two member guarantors.`;
  }

  // 6. How to Apply for Loans & Collateral (Loan Process)
  if (q.includes('how to get a loan') || q.includes('loan application') || q.includes('collateral') || q.includes('guarantor') || q.includes('qualify') || q.includes('eligibility')) {
    return `To apply for a loan with UBUMWE SACCO Gakenke:
1. Maintain an active member account with regular monthly savings.
2. Submit your loan application form at your local sector branch.
3. Provide valid collateral (land title/certificate, business equipment, or cooperative crop pledge).
4. Provide two active member guarantors.
The credit committee reviews applications within 48 to 72 hours. You can also contact our credit desk on WhatsApp at +250 786 422 080.`;
  }

  // 7. Mobile Banking (*541#) (USSD Banking)
  if (q.includes('ussd') || q.includes('541') || q.includes('*541#') || q.includes('mobile') || q.includes('phone') || q.includes('momo') || q.includes('mtn') || q.includes('airtel') || q.includes('transfer')) {
    return `Dial *541# on any mobile phone to access UBUMWE SACCO Mobile Banking 24/7:
• Deposit funds instantly from Mobile Money (MTN / Airtel) to your SACCO account.
• Withdraw funds from your SACCO account directly to your Mobile Money wallet.
• Check your real-time account balance and view recent mini-statements.
• Transfer funds directly between UBUMWE SACCO member accounts.`;
  }

  // 8. 19 Sector Branches & Locations (Locations)
  if (q.includes('branch') || q.includes('branches') || q.includes('location') || q.includes('where') || q.includes('outpost') || q.includes('sectors') || q.includes('headquarters') || q.includes('address')) {
    return `UBUMWE SACCO operates 19 full-service branch outposts covering all 19 sectors of Gakenke District:
Busengo, Coko, Cyabingo, Gakenke, Gashenyi, Janja, Kamubuga, Karambo, Kivuruga, Mataba, Minazi, Mugunga, Muhondo, Muyongwe, Muzo, Nemba, Ruli, Rusasa, and Rushashi (plus 3 sub-branches).
Our Headquarters is located in Gakenke Commercial Center, Gakenke Sector.`;
  }

  // 9. Operating Hours (Hours)
  if (q.includes('hour') || q.includes('hours') || q.includes('time') || q.includes('open') || q.includes('close') || q.includes('saturday') || q.includes('sunday') || q.includes('weekend')) {
    return `Official Operating Hours for all branches:
• Monday to Friday: 8:00 AM - 5:00 PM
• Saturday: 8:00 AM - 1:00 PM
• Sunday: Closed (Branch counters closed; *541# Mobile Banking active 24/7).`;
  }

  // 10. Leadership & Management (Governance)
  if (q.includes('leader') || q.includes('leadership') || q.includes('manager') || q.includes('general manager') || q.includes('director') || q.includes('board') || q.includes('mbitsemunda') || q.includes('phocas') || q.includes('wellars')) {
    return `UBUMWE SACCO Gakenke is guided by executive leadership and democratic cooperative oversight:
• General Manager: Mr. Mbitsemunda Phocas
• Board of Directors: Led by Mr. Wellars (Board Chair) and experienced audit & credit committees operating under BNR and RCA regulatory standards.`;
  }

  // 11. Careers & Job Vacancies (Careers)
  if (q.includes('career') || q.includes('careers') || q.includes('job') || q.includes('jobs') || q.includes('vacancy') || q.includes('hiring') || q.includes('apply for job') || q.includes('recruitment')) {
    return `All official career openings at UBUMWE SACCO Gakenke are published transparently on our website under the Careers section.
When vacancies are open, candidates can review requirements, submit their CV and motivation letter online, or deliver their dossier to our headquarters in Gakenke.`;
  }

  // 12. Contact Channels (Contacts)
  if (q.includes('contact') || q.includes('phone') || q.includes('email') || q.includes('whatsapp') || q.includes('call') || q.includes('reach') || q.includes('desk')) {
    return `You can reach UBUMWE SACCO Gakenke directly through:
• WhatsApp Support: +250 786 422 080
• Telephone Desk: 0786422080
• Official Email: ubumwesaccogakenke@gmail.com
• USSD Mobile Code: Dial *541#
• Head Office: Gakenke Commercial Center, Sector Gakenke.`;
  }

  // 13. Financial Statistics (Metrics)
  if (q.includes('statistic') || q.includes('member') || q.includes('18640') || q.includes('dividend percent') || q.includes('financial') || q.includes('asset')) {
    return `Key Financial Highlights of UBUMWE SACCO Gakenke:
• Active Members: Over 18,640 registered cooperative members
• Member Savings: Over 4.85 Billion RWF safely held
• Credit Disbursed: Over 3.62 Billion RWF invested in local enterprises and farming
• Average Annual Dividend: 9.8% distributed to members
• Sector Coverage: 100% of Gakenke District (19 outposts).`;
  }

  // 14. Advanced or Personal Inquiries (Escalation)
  return `For specific personal inquiries regarding your private account balance, ongoing loan appraisal status, or specialized support:
Please contact our official customer support team directly:
• WhatsApp: +250 786 422 080 (Direct SACCO WhatsApp support)
• Official Email: ubumwesaccogakenke@gmail.com
• Telephone: 0786422080
• Headquarters: Gakenke Commercial Center, Gakenke Sector (or visit any of our 19 sector branches).`;
}

/**
 * Main chat handler: retrieves knowledge, calls LLM or fallback, logs session, flags escalation.
 */
async function processChatMessage({ message, sessionId, preferredLanguage, ipAddress, userAgent }) {
  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new Error('Message is required');
  }

  const cleanMessage = message.trim().slice(0, 1000); // 1000 char maximum
  const detectedLang = preferredLanguage || detectLanguage(cleanMessage);

  // 1. Retrieve verified knowledge from MongoDB
  const { contextText, sourcesUsed } = await retrieveVerifiedContext(cleanMessage, detectedLang);

  // 2. Build system prompt
  const systemPrompt = buildSystemPrompt(detectedLang);

  // 3. Generate response via Gemini API or deterministic fallback
  let responseText = await callGeminiApi(systemPrompt, cleanMessage, contextText);

  let isFallback = false;
  if (!responseText) {
    responseText = generateDeterministicResponse(cleanMessage, contextText, detectedLang);
    isFallback = true;
  }

  // 4. Determine if response indicates an escalation referral
  const isEscalated =
    responseText.includes('cannot verify') ||
    responseText.includes('Ndashaka kumenya neza ko muhawe amakuru yizewe') ||
    responseText.includes('Je tiens à ce que vous receviez une information rigoureusement vérifiée') ||
    responseText.includes(VERIFIED_INSTITUTION_PROFILE.officialEmail);

  // 5. Store session message history if sessionId provided (privacy-compliant)
  const activeSessionId = sessionId || `sess_${crypto.randomBytes(12).toString('hex')}`;
  try {
    const ipHash = ipAddress ? crypto.createHash('sha256').update(ipAddress).digest('hex').slice(0, 16) : null;

    await AIChatSession.findOneAndUpdate(
      { sessionId: activeSessionId },
      {
        $set: {
          preferredLanguage: detectedLang,
          escalated: isEscalated,
          ipAddressHash: ipHash,
          userAgent: userAgent ? userAgent.slice(0, 150) : null,
          lastActivityAt: new Date(),
        },
        $push: {
          messages: [
            {
              role: 'user',
              content: cleanMessage,
              language: detectedLang,
              timestamp: new Date(),
            },
            {
              role: 'assistant',
              content: responseText,
              language: detectedLang,
              sourcesUsed,
              isEscalated,
              confidenceScore: isFallback ? 0.85 : 0.98,
              timestamp: new Date(),
            },
          ],
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
  } catch (err) {
    console.warn('[AI Service] Session logging partial error:', err.message);
  }

  return {
    sessionId: activeSessionId,
    reply: responseText,
    language: detectedLang,
    sourcesUsed,
    isEscalated,
    officialContact: {
      email: VERIFIED_INSTITUTION_PROFILE.officialEmail,
      phone: VERIFIED_INSTITUTION_PROFILE.officialPhone,
      whatsapp: VERIFIED_INSTITUTION_PROFILE.whatsapp,
      headquarters: VERIFIED_INSTITUTION_PROFILE.headquarters,
    },
  };
}

/**
 * Creates an official member support inquiry from chat escalation.
 */
async function createEscalationInquiry({ name, phone, email, subject, message, sector, sessionId }) {
  const refNum = generateReferenceNumber('INQ');

  const inquiry = await Inquiry.create({
    referenceNumber: refNum,
    name: name.trim(),
    phone: phone.trim(),
    email: email ? email.trim().toLowerCase() : '',
    subject: subject ? subject.trim() : 'AI Digital Assistant Support Inquiry',
    message: message.trim(),
    sector: sector || 'Gakenke',
    source: 'website',
    status: 'pending',
    priority: 'medium',
    recipientEmail: VERIFIED_INSTITUTION_PROFILE.officialEmail,
    notes: sessionId ? `Escalated from AI Chat session: ${sessionId}` : 'Escalated from AI Chat Widget',
  });

  if (sessionId) {
    try {
      await AIChatSession.findOneAndUpdate(
        { sessionId },
        { $set: { inquiryReference: refNum, escalated: true } }
      );
    } catch {
      // Ignore
    }
  }

  return {
    referenceNumber: refNum,
    inquiryId: inquiry._id.toString(),
    officialEmail: VERIFIED_INSTITUTION_PROFILE.officialEmail,
    officialPhone: VERIFIED_INSTITUTION_PROFILE.officialPhone,
  };
}

module.exports = {
  detectLanguage,
  retrieveVerifiedContext,
  processChatMessage,
  createEscalationInquiry,
  VERIFIED_INSTITUTION_PROFILE,
};

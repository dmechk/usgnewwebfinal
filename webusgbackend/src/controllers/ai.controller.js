'use strict';

const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/appError');
const aiService = require('../services/ai.service');
const KnowledgeArticle = require('../models/KnowledgeArticle');
const FAQ = require('../models/FAQ');
const AIChatSession = require('../models/AIChatSession');
const SiteSettings = require('../models/SiteSettings');
const { logAudit } = require('../services/audit.service');

// Default initial public configuration
const DEFAULT_AI_CONFIG = {
  enabled: true,
  name: 'Ubumwe Digital Assistant',
  welcomeMessageEn: 'Welcome to Ubumwe SACCO Gakenke! I can assist you with savings, loans, account opening, our 19 sector branches, and USSD banking (*541#). How may I help you today?',
  welcomeMessageRw: 'Murakaza neza muri UBUMWE SACCO Gakenke! Nshobora kubafasha kumenya ibyerekeye konti z\'ubwizigame, inguzanyo, amashami 19, na serivisi ya telefone (*541#). Nabafasha iki uyu munsi?',
  welcomeMessageFr: 'Bienvenue chez UBUMWE SACCO Gakenke ! Je peux vous renseigner sur l\'ouverture de compte, l\'épargne, les micro-crédits, nos 19 agences et la banque mobile (*541#). Que puis-je faire pour vous ?',
  officialContact: {
    email: 'ubumwesaccogakenke@gmail.com',
    phone: '0786422080',
    whatsapp: '250786422080',
    headquarters: 'Gakenke Commercial Center, Gakenke Sector',
  },
};

/**
 * POST /api/ai/chat
 * Public chat endpoint with rate limiting.
 */
async function chat(req, res, next) {
  try {
    const { message, sessionId, preferredLanguage } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new AppError('Message is required', StatusCodes.BAD_REQUEST);
    }

    // Check if AI is administratively enabled
    try {
      const settings = await SiteSettings.findOne({ key: 'global' }).lean();
      if (settings?.aiConfig?.enabled === false) {
        return res.status(StatusCodes.OK).json({
          success: true,
          data: {
            reply: 'The Ubumwe SACCO digital assistant is currently undergoing scheduled maintenance. Please reach our official customer desk directly at 0786422080 or ubumwesaccogakenke@gmail.com.',
            isEscalated: true,
            language: preferredLanguage || 'en',
            sourcesUsed: [],
            officialContact: DEFAULT_AI_CONFIG.officialContact,
          },
        });
      }
    } catch {
      // Proceed if settings lookup fails
    }

    const ipAddress = req.ip || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];

    const result = await aiService.processChatMessage({
      message: message.trim(),
      sessionId,
      preferredLanguage,
      ipAddress,
      userAgent,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      data: result,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/ai/config
 * Returns public AI configuration.
 */
async function getPublicConfig(req, res, next) {
  try {
    let config = { ...DEFAULT_AI_CONFIG };
    try {
      const settings = await SiteSettings.findOne({ key: 'global' }).lean();
      if (settings?.aiConfig) {
        config = { ...config, ...settings.aiConfig };
      }
    } catch {
      // Return defaults
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      data: { config },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/ai/inquiry
 * Create a support inquiry from the chat interface.
 */
async function submitChatInquiry(req, res, next) {
  try {
    const { name, phone, email, subject, message, sector, sessionId } = req.body;

    if (!name || !phone || !message) {
      throw new AppError('Name, telephone number, and message are required', StatusCodes.BAD_REQUEST);
    }

    const result = await aiService.createEscalationInquiry({
      name,
      phone,
      email,
      subject,
      message,
      sector,
      sessionId,
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Your inquiry has been submitted and assigned a tracking reference number.',
      data: result,
    });
  } catch (err) {
    return next(err);
  }
}

// ---------------------------------------------------------------------------
// ADMIN KNOWLEDGE ARTICLES CONTROLLERS
// ---------------------------------------------------------------------------

async function listArticles(req, res, next) {
  try {
    const { category, search, isPublished, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category && category !== 'all') filter.category = category;
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
    if (search && String(search).trim()) {
      const regex = new RegExp(String(search).trim(), 'i');
      filter.$or = [{ title: regex }, { content: regex }, { tags: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [articles, total] = await Promise.all([
      KnowledgeArticle.find(filter).sort({ priority: -1, updatedAt: -1 }).skip(skip).limit(limitNum),
      KnowledgeArticle.countDocuments(filter),
    ]);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        articles,
        pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) || 1 },
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getArticle(req, res, next) {
  try {
    const article = await KnowledgeArticle.findById(req.params.id);
    if (!article) {
      throw new AppError('Knowledge article not found', StatusCodes.NOT_FOUND);
    }
    return res.status(StatusCodes.OK).json({ success: true, data: { article } });
  } catch (err) {
    return next(err);
  }
}

async function createArticle(req, res, next) {
  try {
    const { title, category, content, summary, language, tags, isPublished, isApprovedForAI, priority } = req.body;

    if (!title || !content) {
      throw new AppError('Title and content are required', StatusCodes.BAD_REQUEST);
    }

    const article = await KnowledgeArticle.create({
      title: title.trim(),
      category: category || 'general',
      content: content.trim(),
      summary: summary ? summary.trim() : '',
      language: language || 'en',
      tags: Array.isArray(tags) ? tags : [],
      isPublished: isPublished !== false,
      isApprovedForAI: isApprovedForAI !== false,
      priority: Number(priority) || 0,
      createdBy: req.user?.id || null,
    });

    await logAudit({
      actor: req.user,
      action: 'AI_KNOWLEDGE_CREATED',
      resourceType: 'KnowledgeArticle',
      resourceId: article.id,
      details: { title: article.title, category: article.category },
      req,
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Knowledge article created successfully',
      data: { article },
    });
  } catch (err) {
    return next(err);
  }
}

async function updateArticle(req, res, next) {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedBy: req.user?.id };

    const article = await KnowledgeArticle.findByIdAndUpdate(id, { $set: updates }, { returnDocument: 'after' });
    if (!article) {
      throw new AppError('Knowledge article not found', StatusCodes.NOT_FOUND);
    }

    await logAudit({
      actor: req.user,
      action: 'AI_KNOWLEDGE_UPDATED',
      resourceType: 'KnowledgeArticle',
      resourceId: id,
      details: { title: article.title },
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Knowledge article updated successfully',
      data: { article },
    });
  } catch (err) {
    return next(err);
  }
}

async function deleteArticle(req, res, next) {
  try {
    const { id } = req.params;
    const article = await KnowledgeArticle.findByIdAndDelete(id);
    if (!article) {
      throw new AppError('Knowledge article not found', StatusCodes.NOT_FOUND);
    }

    await logAudit({
      actor: req.user,
      action: 'AI_KNOWLEDGE_DELETED',
      resourceType: 'KnowledgeArticle',
      resourceId: id,
      details: { title: article.title },
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Knowledge article deleted successfully',
      data: { id },
    });
  } catch (err) {
    return next(err);
  }
}

// ---------------------------------------------------------------------------
// ADMIN FAQs CONTROLLERS
// ---------------------------------------------------------------------------

async function listFaqs(req, res, next) {
  try {
    const { category, search, isPublished, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (category && category !== 'all') filter.category = category;
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
    if (search && String(search).trim()) {
      const regex = new RegExp(String(search).trim(), 'i');
      filter.$or = [
        { question: regex },
        { answer: regex },
        { 'translations.rw.question': regex },
        { 'translations.fr.question': regex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [faqs, total] = await Promise.all([
      FAQ.find(filter).sort({ priority: -1, updatedAt: -1 }).skip(skip).limit(limitNum),
      FAQ.countDocuments(filter),
    ]);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        faqs,
        pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) || 1 },
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getFaq(req, res, next) {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      throw new AppError('FAQ not found', StatusCodes.NOT_FOUND);
    }
    return res.status(StatusCodes.OK).json({ success: true, data: { faq } });
  } catch (err) {
    return next(err);
  }
}

async function createFaq(req, res, next) {
  try {
    const { question, answer, category, language, translations, tags, isPublished, isApprovedForAI, priority } = req.body;

    if (!question || !answer) {
      throw new AppError('Question and answer are required', StatusCodes.BAD_REQUEST);
    }

    const faq = await FAQ.create({
      question: question.trim(),
      answer: answer.trim(),
      category: category || 'general',
      language: language || 'en',
      translations: translations || {},
      tags: Array.isArray(tags) ? tags : [],
      isPublished: isPublished !== false,
      isApprovedForAI: isApprovedForAI !== false,
      priority: Number(priority) || 0,
      createdBy: req.user?.id || null,
    });

    await logAudit({
      actor: req.user,
      action: 'AI_FAQ_CREATED',
      resourceType: 'FAQ',
      resourceId: faq.id,
      details: { question: faq.question },
      req,
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'FAQ created successfully',
      data: { faq },
    });
  } catch (err) {
    return next(err);
  }
}

async function updateFaq(req, res, next) {
  try {
    const { id } = req.params;
    const faq = await FAQ.findByIdAndUpdate(id, { $set: req.body }, { returnDocument: 'after' });
    if (!faq) {
      throw new AppError('FAQ not found', StatusCodes.NOT_FOUND);
    }

    await logAudit({
      actor: req.user,
      action: 'AI_FAQ_UPDATED',
      resourceType: 'FAQ',
      resourceId: id,
      details: { question: faq.question },
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'FAQ updated successfully',
      data: { faq },
    });
  } catch (err) {
    return next(err);
  }
}

async function deleteFaq(req, res, next) {
  try {
    const { id } = req.params;
    const faq = await FAQ.findByIdAndDelete(id);
    if (!faq) {
      throw new AppError('FAQ not found', StatusCodes.NOT_FOUND);
    }

    await logAudit({
      actor: req.user,
      action: 'AI_FAQ_DELETED',
      resourceType: 'FAQ',
      resourceId: id,
      details: { question: faq.question },
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'FAQ deleted successfully',
      data: { id },
    });
  } catch (err) {
    return next(err);
  }
}

// ---------------------------------------------------------------------------
// ADMIN CHAT SESSIONS & CONVERSATION AUDIT
// ---------------------------------------------------------------------------

async function listSessions(req, res, next) {
  try {
    const { page = 1, limit = 20, escalated } = req.query;
    const filter = {};
    if (escalated !== undefined) filter.escalated = escalated === 'true';

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [sessions, total] = await Promise.all([
      AIChatSession.find(filter)
        .select('sessionId preferredLanguage escalated inquiryReference createdAt lastActivityAt messages')
        .sort({ lastActivityAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AIChatSession.countDocuments(filter),
    ]);

    const sanitized = sessions.map((s) => ({
      ...s,
      messageCount: s.messages?.length || 0,
      preview: s.messages?.[0]?.content?.slice(0, 80) || '',
      messages: undefined, // Don't send entire conversation in list view for performance
    }));

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        sessions: sanitized,
        pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) || 1 },
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getSession(req, res, next) {
  try {
    const session = await AIChatSession.findOne({ sessionId: req.params.sessionId });
    if (!session) {
      throw new AppError('Chat session not found', StatusCodes.NOT_FOUND);
    }
    return res.status(StatusCodes.OK).json({ success: true, data: { session } });
  } catch (err) {
    return next(err);
  }
}

async function updateConfig(req, res, next) {
  try {
    const updates = req.body;
    const settings = await SiteSettings.findOneAndUpdate(
      { key: 'global' },
      { $set: { aiConfig: updates } },
      { returnDocument: 'after', upsert: true }
    );

    await logAudit({
      actor: req.user,
      action: 'AI_CONFIG_UPDATED',
      resourceType: 'SiteSettings',
      resourceId: settings.id,
      details: updates,
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'AI configuration updated successfully',
      data: { aiConfig: settings.aiConfig },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  chat,
  getPublicConfig,
  submitChatInquiry,
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  listFaqs,
  getFaq,
  createFaq,
  updateFaq,
  deleteFaq,
  listSessions,
  getSession,
  updateConfig,
};

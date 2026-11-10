'use strict';

const KnowledgeArticle = require('../models/KnowledgeArticle');
const FAQ = require('../models/FAQ');
const { INITIAL_ARTICLES, INITIAL_FAQS } = require('../../scripts/seed-ai-knowledge');

async function ensureInitialAIKnowledge() {
  try {
    const articleCount = await KnowledgeArticle.countDocuments();
    if (articleCount === 0) {
      await KnowledgeArticle.insertMany(INITIAL_ARTICLES);
      console.log(`[AI Knowledge] Initialized ${INITIAL_ARTICLES.length} verified SACCO knowledge articles.`);
    }

    const faqCount = await FAQ.countDocuments();
    if (faqCount === 0) {
      await FAQ.insertMany(INITIAL_FAQS);
      console.log(`[AI Knowledge] Initialized ${INITIAL_FAQS.length} verified multi-language SACCO FAQs.`);
    }
  } catch (err) {
    console.warn('[AI Knowledge] Auto-initialization check skipped:', err.message);
  }
}

module.exports = { ensureInitialAIKnowledge };

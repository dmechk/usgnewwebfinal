'use strict';

const { StatusCodes } = require('http-status-codes');
const News = require('../models/News');
const AppError = require('../utils/appError');
const { logAudit } = require('../services/audit.service');

async function listNews(req, res, next) {
  try {
    const { category, isPublished, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (isPublished !== undefined) {
      filter.isPublished = isPublished === 'true';
    } else if (!req.user) {
      filter.isPublished = true;
    }

    if (search && String(search).trim()) {
      const regex = new RegExp(String(search).trim(), 'i');
      filter.$or = [{ title: regex }, { summary: regex }, { content: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [articles, total] = await Promise.all([
      News.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      News.countDocuments(filter),
    ]);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        articles,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getNewsArticle(req, res, next) {
  try {
    const article = await News.findById(req.params.id);
    if (!article) {
      throw new AppError('News article not found', StatusCodes.NOT_FOUND, {
        code: 'NOT_FOUND',
      });
    }
    return res.status(StatusCodes.OK).json({ success: true, data: { article } });
  } catch (err) {
    return next(err);
  }
}

async function createNewsArticle(req, res, next) {
  try {
    const { title, content, summary, category, featuredImage, isPublished } = req.body;
    const article = await News.create({
      title,
      content,
      summary: summary || '',
      category: category || 'Announcement',
      featuredImage: featuredImage || null,
      isPublished: Boolean(isPublished),
      publishedAt: isPublished ? new Date() : null,
      authorId: req.user ? req.user.id : null,
    });

    await logAudit({
      actor: req.user,
      action: 'NEWS_CREATED',
      resourceType: 'News',
      resourceId: article.id,
      details: { title: article.title },
      req,
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'News article created successfully',
      data: { article },
    });
  } catch (err) {
    return next(err);
  }
}

async function updateNewsArticle(req, res, next) {
  try {
    const article = await News.findById(req.params.id);
    if (!article) {
      throw new AppError('News article not found', StatusCodes.NOT_FOUND, {
        code: 'NOT_FOUND',
      });
    }

    const { title, content, summary, category, featuredImage } = req.body;
    if (title) article.title = title;
    if (content) article.content = content;
    if (summary !== undefined) article.summary = summary;
    if (category) article.category = category;
    if (featuredImage !== undefined) article.featuredImage = featuredImage;

    await article.save();

    await logAudit({
      actor: req.user,
      action: 'NEWS_UPDATED',
      resourceType: 'News',
      resourceId: article.id,
      details: { title: article.title },
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'News article updated successfully',
      data: { article },
    });
  } catch (err) {
    return next(err);
  }
}

async function publishNewsArticle(req, res, next) {
  try {
    const article = await News.findById(req.params.id);
    if (!article) {
      throw new AppError('News article not found', StatusCodes.NOT_FOUND, {
        code: 'NOT_FOUND',
      });
    }

    const isPublished = req.body.isPublished !== undefined ? Boolean(req.body.isPublished) : true;
    article.isPublished = isPublished;
    article.publishedAt = isPublished ? new Date() : null;
    await article.save();

    await logAudit({
      actor: req.user,
      action: isPublished ? 'NEWS_PUBLISHED' : 'NEWS_UNPUBLISHED',
      resourceType: 'News',
      resourceId: article.id,
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: `News article ${isPublished ? 'published' : 'unpublished'} successfully`,
      data: { article },
    });
  } catch (err) {
    return next(err);
  }
}

async function deleteNewsArticle(req, res, next) {
  try {
    const article = await News.findByIdAndDelete(req.params.id);
    if (!article) {
      throw new AppError('News article not found', StatusCodes.NOT_FOUND, {
        code: 'NOT_FOUND',
      });
    }

    await logAudit({
      actor: req.user,
      action: 'NEWS_DELETED',
      resourceType: 'News',
      resourceId: req.params.id,
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'News article deleted successfully',
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listNews,
  getNewsArticle,
  createNewsArticle,
  updateNewsArticle,
  publishNewsArticle,
  deleteNewsArticle,
};

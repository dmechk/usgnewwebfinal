'use strict';

const { StatusCodes } = require('http-status-codes');
const Gallery = require('../models/Gallery');
const AppError = require('../utils/appError');
const { logAudit } = require('../services/audit.service');

async function listGallery(req, res, next) {
  try {
    const { category, isPublished, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    // Non-admin/IT/MD users only see published items by default unless explicitly querying
    if (isPublished !== undefined) {
      filter.isPublished = isPublished === 'true';
    } else if (!req.user) {
      filter.isPublished = true;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Gallery.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Gallery.countDocuments(filter),
    ]);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        items,
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

async function getGalleryItem(req, res, next) {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      throw new AppError('Gallery item not found', StatusCodes.NOT_FOUND, {
        code: 'NOT_FOUND',
      });
    }
    return res.status(StatusCodes.OK).json({ success: true, data: { item } });
  } catch (err) {
    return next(err);
  }
}

async function createGalleryItem(req, res, next) {
  try {
    const { title, description, imageUrl, category, isPublished } = req.body;
    const item = await Gallery.create({
      title,
      description,
      imageUrl,
      category: category || 'general',
      isPublished: Boolean(isPublished),
      publishedAt: isPublished ? new Date() : null,
      createdBy: req.user ? req.user.id : null,
    });

    await logAudit({
      actor: req.user,
      action: 'GALLERY_CREATED',
      resourceType: 'Gallery',
      resourceId: item.id,
      details: { title: item.title, category: item.category },
      req,
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Gallery item created successfully',
      data: { item },
    });
  } catch (err) {
    return next(err);
  }
}

async function updateGalleryItem(req, res, next) {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      throw new AppError('Gallery item not found', StatusCodes.NOT_FOUND, {
        code: 'NOT_FOUND',
      });
    }

    const { title, description, imageUrl, category } = req.body;
    if (title) item.title = title;
    if (description !== undefined) item.description = description;
    if (imageUrl) item.imageUrl = imageUrl;
    if (category) item.category = category;

    await item.save();

    await logAudit({
      actor: req.user,
      action: 'GALLERY_UPDATED',
      resourceType: 'Gallery',
      resourceId: item.id,
      details: { title: item.title },
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Gallery item updated successfully',
      data: { item },
    });
  } catch (err) {
    return next(err);
  }
}

async function publishGalleryItem(req, res, next) {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      throw new AppError('Gallery item not found', StatusCodes.NOT_FOUND, {
        code: 'NOT_FOUND',
      });
    }

    const isPublished = req.body.isPublished !== undefined ? Boolean(req.body.isPublished) : true;
    item.isPublished = isPublished;
    item.publishedAt = isPublished ? new Date() : null;
    await item.save();

    await logAudit({
      actor: req.user,
      action: isPublished ? 'GALLERY_PUBLISHED' : 'GALLERY_UNPUBLISHED',
      resourceType: 'Gallery',
      resourceId: item.id,
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: `Gallery item ${isPublished ? 'published' : 'unpublished'} successfully`,
      data: { item },
    });
  } catch (err) {
    return next(err);
  }
}

async function deleteGalleryItem(req, res, next) {
  try {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (!item) {
      throw new AppError('Gallery item not found', StatusCodes.NOT_FOUND, {
        code: 'NOT_FOUND',
      });
    }

    await logAudit({
      actor: req.user,
      action: 'GALLERY_DELETED',
      resourceType: 'Gallery',
      resourceId: req.params.id,
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Gallery item deleted successfully',
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listGallery,
  getGalleryItem,
  createGalleryItem,
  updateGalleryItem,
  publishGalleryItem,
  deleteGalleryItem,
};

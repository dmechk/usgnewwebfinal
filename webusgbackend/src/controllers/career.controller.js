'use strict';

const { StatusCodes } = require('http-status-codes');
const Career = require('../models/Career');
const AppError = require('../utils/appError');
const { logAudit } = require('../services/audit.service');

async function listCareers(req, res, next) {
  try {
    const { department, isPublished, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (isPublished !== undefined) {
      filter.isPublished = isPublished === 'true';
    } else if (!req.user) {
      filter.isPublished = true;
    }

    if (search && String(search).trim()) {
      const regex = new RegExp(String(search).trim(), 'i');
      filter.$or = [{ title: regex }, { description: regex }, { department: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [careers, total] = await Promise.all([
      Career.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Career.countDocuments(filter),
    ]);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        careers,
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

async function getCareer(req, res, next) {
  try {
    const career = await Career.findById(req.params.id);
    if (!career) {
      throw new AppError('Career posting not found', StatusCodes.NOT_FOUND, {
        code: 'NOT_FOUND',
      });
    }
    return res.status(StatusCodes.OK).json({ success: true, data: { career } });
  } catch (err) {
    return next(err);
  }
}

async function createCareer(req, res, next) {
  try {
    const {
      title,
      department,
      location,
      employmentType,
      description,
      requirements,
      deadline,
      isPublished,
    } = req.body;

    const career = await Career.create({
      title,
      department,
      location: location || 'On-site',
      employmentType: employmentType || 'Full-Time',
      description,
      requirements: Array.isArray(requirements) ? requirements : [],
      deadline: deadline ? new Date(deadline) : null,
      isPublished: Boolean(isPublished),
      publishedAt: isPublished ? new Date() : null,
      createdBy: req.user ? req.user.id : null,
    });

    await logAudit({
      actor: req.user,
      action: 'CAREER_CREATED',
      resourceType: 'Career',
      resourceId: career.id,
      details: { title: career.title, department: career.department },
      req,
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Career posting created successfully',
      data: { career },
    });
  } catch (err) {
    return next(err);
  }
}

async function updateCareer(req, res, next) {
  try {
    const career = await Career.findById(req.params.id);
    if (!career) {
      throw new AppError('Career posting not found', StatusCodes.NOT_FOUND, {
        code: 'NOT_FOUND',
      });
    }

    const {
      title,
      department,
      location,
      employmentType,
      description,
      requirements,
      deadline,
    } = req.body;

    if (title) career.title = title;
    if (department) career.department = department;
    if (location) career.location = location;
    if (employmentType) career.employmentType = employmentType;
    if (description) career.description = description;
    if (requirements !== undefined) career.requirements = requirements;
    if (deadline !== undefined) career.deadline = deadline ? new Date(deadline) : null;

    await career.save();

    await logAudit({
      actor: req.user,
      action: 'CAREER_UPDATED',
      resourceType: 'Career',
      resourceId: career.id,
      details: { title: career.title },
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Career posting updated successfully',
      data: { career },
    });
  } catch (err) {
    return next(err);
  }
}

async function publishCareer(req, res, next) {
  try {
    const career = await Career.findById(req.params.id);
    if (!career) {
      throw new AppError('Career posting not found', StatusCodes.NOT_FOUND, {
        code: 'NOT_FOUND',
      });
    }

    const isPublished = req.body.isPublished !== undefined ? Boolean(req.body.isPublished) : true;
    career.isPublished = isPublished;
    career.publishedAt = isPublished ? new Date() : null;
    await career.save();

    await logAudit({
      actor: req.user,
      action: isPublished ? 'CAREER_PUBLISHED' : 'CAREER_UNPUBLISHED',
      resourceType: 'Career',
      resourceId: career.id,
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: `Career posting ${isPublished ? 'published' : 'unpublished'} successfully`,
      data: { career },
    });
  } catch (err) {
    return next(err);
  }
}

async function deleteCareer(req, res, next) {
  try {
    const career = await Career.findByIdAndDelete(req.params.id);
    if (!career) {
      throw new AppError('Career posting not found', StatusCodes.NOT_FOUND, {
        code: 'NOT_FOUND',
      });
    }

    await logAudit({
      actor: req.user,
      action: 'CAREER_DELETED',
      resourceType: 'Career',
      resourceId: req.params.id,
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Career posting deleted successfully',
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listCareers,
  getCareer,
  createCareer,
  updateCareer,
  publishCareer,
  deleteCareer,
};

'use strict';

const { StatusCodes } = require('http-status-codes');
const Gallery = require('../models/Gallery');
const News = require('../models/News');
const Career = require('../models/Career');
const Applicant = require('../models/Applicant');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

async function getOverviewReport(req, res, next) {
  try {
    const [
      totalUsers,
      totalGalleryItems,
      totalNews,
      totalCareers,
      totalApplicants,
      totalAuditLogs,
    ] = await Promise.all([
      User.countDocuments(),
      Gallery.countDocuments(),
      News.countDocuments(),
      Career.countDocuments(),
      Applicant.countDocuments(),
      AuditLog.countDocuments(),
    ]);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          totalGalleryItems,
          totalNews,
          totalCareers,
          totalApplicants,
          totalAuditLogs,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getGalleryNewsReport(req, res, next) {
  try {
    const [
      totalGallery,
      publishedGallery,
      totalNews,
      publishedNews,
    ] = await Promise.all([
      Gallery.countDocuments(),
      Gallery.countDocuments({ isPublished: true }),
      News.countDocuments(),
      News.countDocuments({ isPublished: true }),
    ]);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        gallery: {
          total: totalGallery,
          published: publishedGallery,
          draft: totalGallery - publishedGallery,
        },
        news: {
          total: totalNews,
          published: publishedNews,
          draft: totalNews - publishedNews,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getRecruitmentReport(req, res, next) {
  try {
    const statuses = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'HIRED'];
    const counts = await Promise.all(
      statuses.map((status) => Applicant.countDocuments({ status }))
    );

    const breakdown = {};
    statuses.forEach((status, i) => {
      breakdown[status] = counts[i];
    });

    const total = counts.reduce((sum, count) => sum + count, 0);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        totalApplicants: total,
        pipelineBreakdown: breakdown,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getCareersReport(req, res, next) {
  try {
    const [totalCareers, activeCareers] = await Promise.all([
      Career.countDocuments(),
      Career.countDocuments({ isPublished: true }),
    ]);

    const departmentStats = await Career.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        totalCareers,
        activeCareers,
        draftCareers: totalCareers - activeCareers,
        departments: departmentStats.map((d) => ({
          department: d._id,
          count: d.count,
        })),
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getOverviewReport,
  getGalleryNewsReport,
  getRecruitmentReport,
  getCareersReport,
};

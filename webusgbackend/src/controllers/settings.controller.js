'use strict';

const { StatusCodes } = require('http-status-codes');
const SiteSettings = require('../models/SiteSettings');
const AppError = require('../utils/appError');

/**
 * GET /api/settings
 * Returns the single global settings document (creates it if it does not yet exist).
 * PUBLIC — no authentication required so the public site can load its config.
 */
async function getSettings(req, res, next) {
  try {
    let settings = await SiteSettings.findOne({ key: 'global' });
    if (!settings) {
      // First boot: create an empty settings document
      settings = await SiteSettings.create({ key: 'global' });
    }
    return res.status(StatusCodes.OK).json({
      success: true,
      data: { settings },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * PATCH /api/settings
 * Partial update — only the fields sent in the request body are merged.
 * Requires authentication (any role that has logged in).
 */
async function updateSettings(req, res, next) {
  try {
    const allowedFields = [
      'saccoInfo',
      'navItems',
      'systemImages',
      'leaders',
      'products',
      'branches',
      'managerMessages',
      'heroContent',
      'homeMetrics',
      'aboutContent',
      'partners',
      'socialLinks',
      'communityStories',
      'homeVideos',
      'employmentTypes',
      'qualifications',
      'themeColor',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new AppError('No valid fields provided for update', StatusCodes.BAD_REQUEST);
    }

    if (req.user?.id) {
      updates.updatedBy = req.user.id;
    }

    const settings = await SiteSettings.findOneAndUpdate(
      { key: 'global' },
      { $set: updates },
      { returnDocument: 'after', upsert: true, runValidators: false }
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Settings updated successfully',
      data: { settings },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * PATCH /api/settings/:section
 * Update a single top-level section key (e.g. /api/settings/leaders).
 * Body must contain { data: <value> }.
 */
async function updateSettingsSection(req, res, next) {
  try {
    const { section } = req.params;

    const allowedSections = [
      'saccoInfo',
      'navItems',
      'systemImages',
      'leaders',
      'products',
      'branches',
      'managerMessages',
      'heroContent',
      'homeMetrics',
      'aboutContent',
      'partners',
      'socialLinks',
      'communityStories',
      'homeVideos',
      'employmentTypes',
      'qualifications',
      'themeColor',
    ];

    if (!allowedSections.includes(section)) {
      throw new AppError(`Unknown settings section: ${section}`, StatusCodes.BAD_REQUEST);
    }

    const value = req.body.data !== undefined ? req.body.data : req.body[section];
    if (value === undefined) {
      throw new AppError(
        `Request body must contain a "data" field or a "${section}" field`,
        StatusCodes.BAD_REQUEST
      );
    }

    const update = { [section]: value };
    if (req.user?.id) update.updatedBy = req.user.id;

    const settings = await SiteSettings.findOneAndUpdate(
      { key: 'global' },
      { $set: update },
      { returnDocument: 'after', upsert: true, runValidators: false }
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: `Settings section "${section}" updated successfully`,
      data: { settings },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getSettings, updateSettings, updateSettingsSection };

'use strict';

const crypto = require('crypto');

/**
 * Generates a unique, collision-resistant reference code for Job Applications.
 * Format: UB-JOB-YYYY-XXXXXX
 *
 * @param {import('mongoose').Model} Model
 * @returns {Promise<string>}
 */
async function generateApplicationReference(Model) {
  const year = new Date().getFullYear();
  let ref = '';
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 10) {
    attempts += 1;
    const randomSuffix = crypto.randomInt(100000, 999999).toString();
    ref = `UB-JOB-${year}-${randomSuffix}`;
    if (Model) {
      const match = await Model.findOne({ referenceNumber: ref }).select('_id');
      exists = Boolean(match);
    } else {
      exists = false;
    }
  }

  return ref;
}

/**
 * Generates a unique, collision-resistant reference code for Inquiries.
 * Format: UB-INQ-YYYY-XXXXXX
 *
 * @param {import('mongoose').Model} Model
 * @returns {Promise<string>}
 */
async function generateInquiryReference(Model) {
  const year = new Date().getFullYear();
  let ref = '';
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 10) {
    attempts += 1;
    const randomSuffix = crypto.randomInt(100000, 999999).toString();
    ref = `UB-INQ-${year}-${randomSuffix}`;
    if (Model) {
      const match = await Model.findOne({ referenceNumber: ref }).select('_id');
      exists = Boolean(match);
    } else {
      exists = false;
    }
  }

  return ref;
}

module.exports = {
  generateApplicationReference,
  generateInquiryReference,
};

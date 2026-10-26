'use strict';

const mongoose = require('mongoose');

/**
 * SiteSettings — a single-document store for all website configuration.
 * Uses a singleton pattern: key='global' is always the one document.
 */
const siteSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'global',
      unique: true,
      index: true,
    },

    // Organization / Contact Info
    saccoInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Navigation items
    navItems: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // System images (logo, hero bg, etc.)
    systemImages: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Leadership / Board members
    leaders: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // Financial products
    products: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // Branch / outpost network
    branches: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // Manager / leadership messages
    managerMessages: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // Home page hero content (headlines, CTA)
    heroContent: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Home page metrics (members, assets, etc.)
    homeMetrics: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // About Us page content (story, values)
    aboutContent: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Partners & collaborators
    partners: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // Social media profiles
    socialLinks: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // Community impact stories / testimonials
    communityStories: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // Home page attraction videos
    homeVideos: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // Employment types (CRUD by Admin)
    employmentTypes: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // Qualifications (CRUD by Admin)
    qualifications: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // Active theme color
    themeColor: {
      type: String,
      default: 'black',
    },

    // Last updated by (user id)
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

siteSettingsSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);

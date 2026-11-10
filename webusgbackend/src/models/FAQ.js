'use strict';

const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Primary question is required'],
      trim: true,
      maxlength: 300,
    },
    answer: {
      type: String,
      required: [true, 'Primary answer is required'],
      trim: true,
    },
    language: {
      type: String,
      enum: ['en', 'rw', 'fr'],
      default: 'en',
      index: true,
    },
    translations: {
      en: {
        question: { type: String, trim: true, default: '' },
        answer: { type: String, trim: true, default: '' },
      },
      rw: {
        question: { type: String, trim: true, default: '' },
        answer: { type: String, trim: true, default: '' },
      },
      fr: {
        question: { type: String, trim: true, default: '' },
        answer: { type: String, trim: true, default: '' },
      },
    },
    category: {
      type: String,
      enum: ['membership', 'savings', 'loans', 'digital', 'branches', 'contact', 'general'],
      default: 'general',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    isApprovedForAI: {
      type: Boolean,
      default: true,
      index: true,
    },
    priority: {
      type: Number,
      default: 0,
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

faqSchema.index({
  question: 'text',
  answer: 'text',
  'translations.en.question': 'text',
  'translations.en.answer': 'text',
  'translations.rw.question': 'text',
  'translations.rw.answer': 'text',
  'translations.fr.question': 'text',
  'translations.fr.answer': 'text',
  tags: 'text',
});

faqSchema.index({ isPublished: 1, isApprovedForAI: 1, category: 1, priority: -1 });

module.exports = mongoose.model('FAQ', faqSchema);

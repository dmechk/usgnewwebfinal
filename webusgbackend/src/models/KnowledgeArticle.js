'use strict';

const mongoose = require('mongoose');

const knowledgeArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
      maxlength: 250,
    },
    category: {
      type: String,
      enum: ['services', 'loans', 'savings', 'membership', 'branches', 'ussd', 'governance', 'policies', 'general'],
      default: 'general',
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Article content is required'],
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
      default: '',
      maxlength: 500,
    },
    language: {
      type: String,
      enum: ['en', 'rw', 'fr'],
      default: 'en',
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
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

knowledgeArticleSchema.index({ title: 'text', content: 'text', summary: 'text', tags: 'text' });
knowledgeArticleSchema.index({ isPublished: 1, isApprovedForAI: 1, category: 1 });

module.exports = mongoose.model('KnowledgeArticle', knowledgeArticleSchema);

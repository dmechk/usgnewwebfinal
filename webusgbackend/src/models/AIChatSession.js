'use strict';

const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 4000,
    },
    language: {
      type: String,
      enum: ['en', 'rw', 'fr', 'unknown'],
      default: 'en',
    },
    sourcesUsed: {
      type: [String],
      default: [],
    },
    isEscalated: {
      type: Boolean,
      default: false,
    },
    confidenceScore: {
      type: Number,
      default: 1.0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const aiChatSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'rw', 'fr'],
      default: 'en',
    },
    messages: {
      type: [chatMessageSchema],
      default: [],
    },
    escalated: {
      type: Boolean,
      default: false,
      index: true,
    },
    inquiryReference: {
      type: String,
      default: null,
      index: true,
    },
    ipAddressHash: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // TTL index: Automatic purging after 90 days (90 * 24 * 3600 seconds)
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      index: { expires: 0 },
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

aiChatSessionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AIChatSession', aiChatSessionSchema);

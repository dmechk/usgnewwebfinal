'use strict';

const mongoose = require('mongoose');

const inquiryFeedbackSchema = new mongoose.Schema(
  {
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    senderEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    senderRole: {
      type: String,
      default: 'ADMIN',
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    emailStatus: {
      type: String,
      enum: ['sent', 'failed', 'pending'],
      default: 'pending',
    },
    emailError: {
      type: String,
      default: null,
    },
  },
  { _id: true }
);

const inquirySchema = new mongoose.Schema(
  {
    referenceNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Sender name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      required: [true, 'Telephone number is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Inquiry topic or subject is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    sector: {
      type: String,
      default: 'Gakenke',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_review', 'resolved', 'archived'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    source: {
      type: String,
      enum: ['website', 'phone', 'walk_in', 'email'],
      default: 'website',
    },
    recipientEmail: {
      type: String,
      default: 'ubumwesaccogakenke@gmail.com',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    adminReply: {
      type: String,
      default: '',
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    feedbacks: {
      type: [inquiryFeedbackSchema],
      default: [],
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    date: {
      type: String,
      default: '',
    },
    emailNotification: {
      status: {
        type: String,
        enum: ['PENDING', 'SENT', 'FAILED'],
        default: 'PENDING',
        index: true,
      },
      sentAt: {
        type: Date,
        default: null,
      },
      failedAt: {
        type: Date,
        default: null,
      },
      attempts: {
        type: Number,
        default: 0,
      },
      lastError: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Search index for fast lookup across contact inquiries
inquirySchema.index({ name: 'text', subject: 'text', message: 'text', phone: 'text' });
inquirySchema.index({ status: 1, priority: 1, createdAt: -1 });

const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema);

module.exports = Inquiry;

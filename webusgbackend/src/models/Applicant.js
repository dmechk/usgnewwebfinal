'use strict';

const mongoose = require('mongoose');

const applicantMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    senderRole: {
      type: String,
      default: 'ADMIN_HR',
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const applicantFeedbackSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const applicantSchema = new mongoose.Schema(
  {
    careerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Career',
      default: null,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Applicant full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Applicant email is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    resumeUrl: {
      type: String,
      trim: true,
      default: '',
    },
    coverLetter: {
      type: String,
      trim: true,
      default: '',
    },
    jobTitle: {
      type: String,
      trim: true,
      default: '',
    },
    nationalId: {
      type: String,
      trim: true,
      default: '',
    },
    residenceSector: {
      type: String,
      trim: true,
      default: '',
    },
    educationLevel: {
      type: String,
      trim: true,
      default: '',
    },
    yearsExperience: {
      type: Number,
      default: 0,
    },
    cvFileName: {
      type: String,
      trim: true,
      default: '',
    },
    motivationLetterFileName: {
      type: String,
      trim: true,
      default: '',
    },
    motivationLetterUrl: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        'APPLIED',
        'SCREENING',
        'INTERVIEW',
        'OFFER',
        'REJECTED',
        'HIRED',
        'pending',
        'shortlisted',
        'not_shortlisted',
        'accepted',
        'waitlisted',
      ],
      default: 'APPLIED',
      index: true,
    },
    feedbacks: {
      type: [applicantFeedbackSchema],
      default: [],
    },
    messages: {
      type: [applicantMessageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

applicantSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Applicant', applicantSchema);

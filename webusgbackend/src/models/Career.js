'use strict';

const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: 200,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true,
    },
    location: {
      type: String,
      default: 'On-site',
      trim: true,
    },
    employmentType: {
      type: String,
      enum: [
        'Full-Time',
        'Part-Time',
        'Contract',
        'Internship',
        'Temporary',
        'full_time',
        'part_time',
        'contract',
        'internship',
        'Full-time',
        'Part-time',
      ],
      default: 'Full-Time',
      set: (val) => {
        if (!val) return 'Full-Time';
        const lower = String(val).toLowerCase().replace(/[_-]/g, ' ').trim();
        if (lower.includes('full')) return 'Full-Time';
        if (lower.includes('part')) return 'Part-Time';
        if (lower.includes('contract')) return 'Contract';
        if (lower.includes('intern')) return 'Internship';
        return val;
      },
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    requirements: {
      type: [String],
      default: [],
    },
    deadline: {
      type: Date,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

careerSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Career', careerSchema);

'use strict';

const mongoose = require('mongoose');

const bestEmployeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    roleEn: {
      type: String,
      required: true,
      trim: true,
    },
    roleRw: {
      type: String,
      required: true,
      trim: true,
    },
    roleFr: {
      type: String,
      trim: true,
      default: '',
    },
    departmentEn: {
      type: String,
      required: true,
      trim: true,
    },
    departmentRw: {
      type: String,
      required: true,
      trim: true,
    },
    departmentFr: {
      type: String,
      trim: true,
      default: '',
    },
    year: {
      type: String,
      default: () => new Date().getFullYear().toString(),
      trim: true,
    },
    achievementMetric: {
      type: String,
      default: '',
      trim: true,
    },
    citationEn: {
      type: String,
      default: '',
      trim: true,
    },
    citationRw: {
      type: String,
      default: '',
      trim: true,
    },
    citationFr: {
      type: String,
      default: '',
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '/src/assets/images/farmers_cooperative_1791989969904.jpg',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

bestEmployeeSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('BestEmployee', bestEmployeeSchema);

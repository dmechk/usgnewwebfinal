const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    examType: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    scheduledAt: {
      type: Date,
    },
    findings: {
      type: String,
    },
    report: {
      type: String,
    },
    images: [
      {
        filename: String,
        path: String,
        mimetype: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', examSchema);

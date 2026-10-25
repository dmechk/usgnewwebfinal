const { StatusCodes } = require('http-status-codes');
const { validationResult } = require('express-validator');
const Exam = require('../models/Exam');

async function listExams(req, res, next) {
  try {
    const filter = {};
    if (req.query.patient) {
      filter.patient = req.query.patient;
    }

    const exams = await Exam.find(filter)
      .populate('patient', 'firstName lastName medicalRecordNumber')
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(StatusCodes.OK).json({ exams });
  } catch (err) {
    return next(err);
  }
}

async function getExam(req, res, next) {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('patient')
      .populate('performedBy', 'name email role');

    if (!exam) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Exam not found' });
    }
    return res.status(StatusCodes.OK).json({ exam });
  } catch (err) {
    return next(err);
  }
}

async function createExam(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }

    const payload = {
      ...req.body,
      performedBy: req.body.performedBy || req.user.id,
    };

    if (req.files && req.files.length) {
      payload.images = req.files.map((file) => ({
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
      }));
    }

    const exam = await Exam.create(payload);
    return res.status(StatusCodes.CREATED).json({ exam });
  } catch (err) {
    return next(err);
  }
}

async function updateExam(req, res, next) {
  try {
    const updates = { ...req.body };

    if (req.files && req.files.length) {
      const newImages = req.files.map((file) => ({
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
      }));
      updates.$push = { images: { $each: newImages } };
      delete updates.images;
    }

    const exam = await Exam.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!exam) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Exam not found' });
    }
    return res.status(StatusCodes.OK).json({ exam });
  } catch (err) {
    return next(err);
  }
}

async function deleteExam(req, res, next) {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Exam not found' });
    }
    return res.status(StatusCodes.OK).json({ message: 'Exam deleted' });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
};

const express = require('express');
const path = require('path');
const multer = require('multer');
const { body } = require('express-validator');
const {
  listExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
} = require('../controllers/exam.controller');
const validate = require('../middleware/validate');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.get('/', listExams);
router.get('/:id', getExam);

router.post(
  '/',
  upload.array('images', 10),
  [
    body('patient').notEmpty().withMessage('Patient id is required'),
    body('examType').trim().notEmpty().withMessage('Exam type is required'),
    body('status')
      .optional()
      .isIn(['scheduled', 'in_progress', 'completed', 'cancelled']),
  ],
  validate,
  createExam
);

router.put('/:id', upload.array('images', 10), updateExam);
router.delete('/:id', deleteExam);

module.exports = router;

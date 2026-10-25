const express = require('express');
const { body } = require('express-validator');
const {
  listPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
} = require('../controllers/patient.controller');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', listPatients);
router.get('/:id', getPatient);

router.post(
  '/',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('gender').optional().isIn(['male', 'female', 'other']),
    body('email').optional().isEmail(),
  ],
  validate,
  createPatient
);

router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

module.exports = router;

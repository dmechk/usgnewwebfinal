const { StatusCodes } = require('http-status-codes');
const { validationResult } = require('express-validator');
const Patient = require('../models/Patient');

async function listPatients(req, res, next) {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    return res.status(StatusCodes.OK).json({ patients });
  } catch (err) {
    return next(err);
  }
}

async function getPatient(req, res, next) {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Patient not found' });
    }
    return res.status(StatusCodes.OK).json({ patient });
  } catch (err) {
    return next(err);
  }
}

async function createPatient(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }

    const patient = await Patient.create(req.body);
    return res.status(StatusCodes.CREATED).json({ patient });
  } catch (err) {
    return next(err);
  }
}

async function updatePatient(req, res, next) {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!patient) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Patient not found' });
    }
    return res.status(StatusCodes.OK).json({ patient });
  } catch (err) {
    return next(err);
  }
}

async function deletePatient(req, res, next) {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Patient not found' });
    }
    return res.status(StatusCodes.OK).json({ message: 'Patient deleted' });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
};

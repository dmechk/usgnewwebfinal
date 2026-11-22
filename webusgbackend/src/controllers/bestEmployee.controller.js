'use strict';

const { StatusCodes } = require('http-status-codes');
const BestEmployee = require('../models/BestEmployee');
const AppError = require('../utils/appError');

const INITIAL_EMPLOYEE = {
  name: 'Mukandayisenga Chantal',
  roleEn: 'Senior Credit & Customer Relations Officer',
  roleRw: 'Umukozi Mukuru Ushinzwe Inguzanyo no Kwakira Abakiriya',
  roleFr: 'Agente Principale de Crédit et Relations Membres',
  departmentEn: 'Credit & Microfinance Operations — Gakenke Branch',
  departmentRw: "Ishami ry'Inguzanyo — Ishami rya Gakenke",
  year: '2026',
  citationEn: 'Awarded for extraordinary dedication to smallholder coffee farmers and rural women cooperatives across Gakenke, achieving a 99.8% portfolio recovery rate and exemplary member satisfaction.',
  citationRw: "Yahawe iki gihembo kubera ubwitange bidasanzwe mu gufasha abahinzi b'ikawa n'amatsinda y'abagore mu Karere ka Gakenke, akaba yarageze ku gipimo cya 99.8% mu kugarura inguzanyo no kwakira neza abanyamuryango.",
  citationFr: 'Récompensée pour son dévouement exceptionnel auprès des petits producteurs de café et des coopératives de femmes de Gakenke, atteignant un taux de recouvrement de 99,8 % et une satisfaction membre exemplaire.',
  achievementMetric: '99.8% Recovery · 420+ Farmers Supported',
  imageUrl: '/src/assets/images/farmers_cooperative_1791989969904.jpg',
  active: true,
};

async function listBestEmployees(req, res, next) {
  try {
    let employees = await BestEmployee.find().sort({ createdAt: -1 });
    if (employees.length === 0) {
      const created = await BestEmployee.create(INITIAL_EMPLOYEE);
      employees = [created];
    }
    return res.status(StatusCodes.OK).json(employees);
  } catch (err) {
    return next(err);
  }
}

async function createBestEmployee(req, res, next) {
  try {
    const created = await BestEmployee.create(req.body);
    return res.status(StatusCodes.CREATED).json(created);
  } catch (err) {
    return next(err);
  }
}

async function updateBestEmployee(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await BestEmployee.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      throw new AppError('Employee record not found', StatusCodes.NOT_FOUND);
    }
    return res.status(StatusCodes.OK).json(updated);
  } catch (err) {
    return next(err);
  }
}

async function deleteBestEmployee(req, res, next) {
  try {
    const { id } = req.params;
    await BestEmployee.findByIdAndDelete(id);
    return res.status(StatusCodes.OK).json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listBestEmployees,
  createBestEmployee,
  updateBestEmployee,
  deleteBestEmployee,
  INITIAL_EMPLOYEE,
};

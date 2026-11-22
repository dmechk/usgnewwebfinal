'use strict';

const express = require('express');
const {
  listBestEmployees,
  createBestEmployee,
  updateBestEmployee,
  deleteBestEmployee,
} = require('../controllers/bestEmployee.controller');

const router = express.Router();

router.get('/', listBestEmployees);
router.post('/', createBestEmployee);
router.put('/:id', updateBestEmployee);
router.delete('/:id', deleteBestEmployee);

module.exports = router;

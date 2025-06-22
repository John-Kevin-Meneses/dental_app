const express = require('express');
const router = express.Router();
const { 
  getDentists, 
  getAvailableSlots 
} = require('../controllers/dentistController');

router.get('/', getDentists);
router.get('/available', getAvailableSlots);

module.exports = router;
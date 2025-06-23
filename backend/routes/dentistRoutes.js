// routes/dentistRoutes.js
const express = require('express');
const router = express.Router();
const dentistController = require('../controllers/dentistController');

router.get('/', dentistController.getDentists);
router.get('/slots', dentistController.getAvailableSlots);

module.exports = router;

// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
} = require('../controllers/patientController');

module.exports = router;
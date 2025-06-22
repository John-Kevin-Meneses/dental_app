// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getAllUsers,
  getUserById
} = require('../controllers/userController');

router.get('/', protect, getAllUsers);
router.get('/:id', protect, getUserById);

module.exports = router;
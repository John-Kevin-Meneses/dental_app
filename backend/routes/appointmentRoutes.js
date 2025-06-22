const express = require('express');
const router = express.Router();
const {
  getPatientAppointments: getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  cancelAppointment
} = require('../controllers/appointmentController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getAppointments)  // Using getPatientAppointments as getAppointments
  .post(protect, createAppointment);

router.route('/:id')
  .get(protect, getAppointment)
  .put(protect, updateAppointment)
  .delete(protect, deleteAppointment);

router.route('/:id/cancel')
  .patch(protect, cancelAppointment);

module.exports = router;
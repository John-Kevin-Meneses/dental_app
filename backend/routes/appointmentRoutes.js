const express = require('express');
const router = express.Router();
const {
  getMyAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  cancelAppointment,
  getDentistAvailability
} = require('../controllers/appointmentController');

const { protect, authorize } = require('../middlewares/authMiddleware');

// ================== Authenticated access ==================
router.use(protect);

// ========== PATIENT ROUTES ==========
router.get('/my-appointments', authorize('patient'), getMyAppointments);
router.post('/', authorize('patient'), createAppointment);
router.patch('/:id/cancel', authorize('patient'), cancelAppointment);

// ========== DENTIST ROUTES ==========
router.get('/availability/:dentistId/:date', authorize('dentist', 'admin'), getDentistAvailability);

// ========== SHARED ROUTES ==========
router.route('/:id')
  .get(authorize('admin', 'dentist', 'patient'), getAppointment)
  .put(authorize('admin', 'dentist', 'patient'), updateAppointment)
  .delete(authorize('admin', 'patient'), deleteAppointment);

// ========== Future Admin-Only Routes (example placeholder) ==========
router.use(authorize('admin'));
// router.get('/all', getAllAppointments); // Example admin-only route

module.exports = router;

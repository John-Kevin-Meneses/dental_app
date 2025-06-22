const Appointment = require('../models/Appointment');

// Get all appointments for a patient
exports.getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findByPatientId(
      req.app.locals.pool, 
      req.user.id
    );
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single appointment
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(
      req.app.locals.pool,
      req.params.id
    );
    
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    
    // Verify the appointment belongs to the user
    if (appointment.patient_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { dentistId, procedureId, date, startTime, endTime, notes } = req.body;
    const appointmentId = await Appointment.create(
      req.app.locals.pool,
      req.user.id,
      dentistId,
      procedureId,
      date,
      startTime,
      endTime,
      notes
    );
    res.status(201).json({ success: true, appointmentId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    // First verify the appointment exists and belongs to the user
    const existingAppointment = await Appointment.findById(
      req.app.locals.pool,
      req.params.id
    );
    
    if (!existingAppointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    
    if (existingAppointment.patient_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    const { dentistId, procedureId, date, startTime, endTime, notes } = req.body;
    await Appointment.update(
      req.app.locals.pool,
      req.params.id,
      dentistId,
      procedureId,
      date,
      startTime,
      endTime,
      notes
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    // First verify the appointment exists and belongs to the user
    const existingAppointment = await Appointment.findById(
      req.app.locals.pool,
      req.params.id
    );
    
    if (!existingAppointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    
    if (existingAppointment.patient_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    await Appointment.delete(
      req.app.locals.pool,
      req.params.id
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    // First verify the appointment exists and belongs to the user
    const existingAppointment = await Appointment.findById(
      req.app.locals.pool,
      req.params.id
    );
    
    if (!existingAppointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    
    if (existingAppointment.patient_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    await Appointment.cancel(
      req.app.locals.pool,
      req.params.id
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
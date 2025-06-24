const Appointment = require('../models/Appointment');

// Helper to get patient ID from user ID
const getPatientId = async (pool, userId) => {
  const { rows } = await pool.query(
    'SELECT patient_id FROM patients WHERE user_id = $1',
    [userId]
  );
  return rows[0]?.patient_id;
};

// Get all appointments for current patient
exports.getMyAppointments = async (req, res) => {
  try {
    const patientId = await getPatientId(req.app.locals.pool, req.user.id);
    if (!patientId) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const appointments = await Appointment.findByPatientId(
      req.app.locals.pool, 
      patientId
    );
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
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
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Verify ownership
    const patientId = await getPatientId(req.app.locals.pool, req.user.id);
    if (appointment.patient_id !== patientId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { dentistId, procedureId, date, startTime, endTime, notes } = req.body;
    const patientId = await getPatientId(req.app.locals.pool, req.user.id);
    
    if (!patientId) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Check for conflicts
    const conflicts = await Appointment.checkConflict(
      req.app.locals.pool,
      dentistId,
      date,
      startTime,
      endTime
    );
    
    if (conflicts.length > 0) {
      return res.status(409).json({ 
        error: 'Time conflict with existing appointment',
        conflictingAppointments: conflicts 
      });
    }

    const newAppointment = await Appointment.create(
      req.app.locals.pool,
      patientId,
      dentistId,
      procedureId,
      date,
      startTime,
      endTime,
      notes
    );
    
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const existingAppointment = await Appointment.findById(
      req.app.locals.pool,
      req.params.id
    );
    
    if (!existingAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Verify ownership
    const patientId = await getPatientId(req.app.locals.pool, req.user.id);
    if (existingAppointment.patient_id !== patientId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check for conflicts (excluding current appointment)
    const { dentistId, date, startTime, endTime } = req.body;
    const conflicts = await Appointment.checkConflict(
      req.app.locals.pool,
      dentistId || existingAppointment.dentist_id,
      date || existingAppointment.appointment_date,
      startTime || existingAppointment.start_time,
      endTime || existingAppointment.end_time,
      req.params.id
    );
    
    if (conflicts.length > 0) {
      return res.status(409).json({ 
        error: 'Time conflict with existing appointment',
        conflictingAppointments: conflicts 
      });
    }

    const updatedAppointment = await Appointment.update(
      req.app.locals.pool,
      req.params.id,
      req.body
    );
    
    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const existingAppointment = await Appointment.findById(
      req.app.locals.pool,
      req.params.id
    );
    
    if (!existingAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Verify ownership
    const patientId = await getPatientId(req.app.locals.pool, req.user.id);
    if (existingAppointment.patient_id !== patientId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const cancelledAppointment = await Appointment.cancel(
      req.app.locals.pool,
      req.params.id
    );
    
    if (!cancelledAppointment) {
      return res.status(400).json({ error: 'Cannot cancel completed appointment' });
    }
    
    res.json(cancelledAppointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const existingAppointment = await Appointment.findById(
      req.app.locals.pool,
      req.params.id
    );
    
    if (!existingAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Verify ownership
    const patientId = await getPatientId(req.app.locals.pool, req.user.id);
    if (existingAppointment.patient_id !== patientId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Appointment.delete(
      req.app.locals.pool,
      req.params.id
    );
    
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get dentist availability
exports.getDentistAvailability = async (req, res) => {
  try {
    const { dentistId, date } = req.params;
    const availability = await Appointment.getDentistAvailability(
      req.app.locals.pool,
      dentistId,
      date
    );
    res.json(availability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
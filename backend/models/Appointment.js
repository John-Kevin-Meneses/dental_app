const { DateTime } = require('luxon');

class Appointment {
  // Create new appointment
  static async create(pool, patientId, dentistId, procedureId, date, startTime, endTime, notes = null) {
    const dateUTC = DateTime.fromISO(date, { zone: 'Asia/Singapore' }).toUTC().toISODate();
    const startUTC = DateTime.fromISO(`${date}T${startTime}`, { zone: 'Asia/Singapore' }).toUTC().toISOTime();
    const endUTC = DateTime.fromISO(`${date}T${endTime}`, { zone: 'Asia/Singapore' }).toUTC().toISOTime();

    const { rows } = await pool.query(
      `INSERT INTO appointments 
       (patient_id, dentist_id, procedure_id, appointment_date, start_time, end_time, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [patientId, dentistId, procedureId, dateUTC, startUTC, endUTC, notes]
    );
    return rows[0];
  }

  // Get appointments by patient ID (converted to UTC+8)
  static async findByPatientId(pool, patientId) {
    const { rows } = await pool.query(
      `SELECT 
        a.appointment_id,
        a.patient_id,
        a.dentist_id,
        a.procedure_id,
        a.appointment_date,
        a.start_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Singapore' AS start_time,
        a.end_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Singapore' AS end_time,
        a.status,
        a.notes,
        p.name AS procedure_name,
        p.duration_minutes,
        d.first_name || ' ' || d.last_name AS dentist_name,
        d.phone AS dentist_phone
       FROM appointments a
       JOIN procedures p ON a.procedure_id = p.procedure_id
       JOIN dentists d ON a.dentist_id = d.dentist_id
       WHERE a.patient_id = $1
       ORDER BY a.appointment_date DESC, a.start_time DESC`,
      [patientId]
    );
    return rows;
  }

  // Get single appointment by ID
  static async findById(pool, appointmentId) {
    const { rows } = await pool.query(
      `SELECT 
        a.appointment_id,
        a.patient_id,
        a.dentist_id,
        a.procedure_id,
        a.appointment_date,
        a.start_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Singapore' AS start_time,
        a.end_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Singapore' AS end_time,
        a.status,
        a.notes,
        a.updated_at,
        p.name AS procedure_name,
        d.first_name || ' ' || d.last_name AS dentist_name,
        pt.first_name || ' ' || pt.last_name AS patient_name,
        pt.user_id AS patient_user_id
       FROM appointments a
       JOIN procedures p ON a.procedure_id = p.procedure_id
       JOIN dentists d ON a.dentist_id = d.dentist_id
       JOIN patients pt ON a.patient_id = pt.patient_id
       WHERE a.appointment_id = $1`,
      [appointmentId]
    );
    return rows[0] || null;
  }

  // Update appointment
  static async update(pool, appointmentId, updates) {
    const {
      dentistId,
      procedureId,
      date,
      startTime,
      endTime,
      notes,
      status
    } = updates;

    const dateUTC = date ? DateTime.fromISO(date, { zone: 'Asia/Singapore' }).toUTC().toISODate() : null;
    const startUTC = startTime ? DateTime.fromISO(`${date}T${startTime}`, { zone: 'Asia/Singapore' }).toUTC().toISOTime() : null;
    const endUTC = endTime ? DateTime.fromISO(`${date}T${endTime}`, { zone: 'Asia/Singapore' }).toUTC().toISOTime() : null;

    const { rows } = await pool.query(
      `UPDATE appointments
       SET 
         dentist_id = COALESCE($1, dentist_id),
         procedure_id = COALESCE($2, procedure_id),
         appointment_date = COALESCE($3, appointment_date),
         start_time = COALESCE($4, start_time),
         end_time = COALESCE($5, end_time),
         notes = COALESCE($6, notes),
         status = COALESCE($7, status),
         updated_at = CURRENT_TIMESTAMP
       WHERE appointment_id = $8
       RETURNING *`,
      [dentistId, procedureId, dateUTC, startUTC, endUTC, notes, status, appointmentId]
    );
    return rows[0];
  }

  // Delete appointment
  static async delete(pool, appointmentId) {
    const { rowCount } = await pool.query(
      'DELETE FROM appointments WHERE appointment_id = $1',
      [appointmentId]
    );
    return rowCount > 0;
  }

  // Cancel appointment
  static async cancel(pool, appointmentId) {
    const { rows } = await pool.query(
      `UPDATE appointments
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE appointment_id = $1 AND status != 'completed'
       RETURNING *`,
      [appointmentId]
    );
    return rows[0];
  }

  // Get dentist availability (assumes availability times are already in local time)
  static async getDentistAvailability(pool, dentistId, date) {
    const dayOfWeek = DateTime.fromISO(date, { zone: 'Asia/Singapore' }).toFormat('cccc').toLowerCase();
    const { rows } = await pool.query(
      `SELECT * FROM dentist_availability
       WHERE dentist_id = $1 AND day_of_week = $2`,
      [dentistId, dayOfWeek]
    );
    return rows;
  }

  // Check for conflicting appointments (use UTC for comparison)
  static async checkConflict(pool, dentistId, date, startTime, endTime, excludeAppointmentId = null) {
    const dateUTC = DateTime.fromISO(date, { zone: 'Asia/Singapore' }).toUTC().toISODate();
    const startUTC = DateTime.fromISO(`${date}T${startTime}`, { zone: 'Asia/Singapore' }).toUTC().toISOTime();
    const endUTC = DateTime.fromISO(`${date}T${endTime}`, { zone: 'Asia/Singapore' }).toUTC().toISOTime();

    let query = `
      SELECT * FROM appointments
      WHERE dentist_id = $1 
        AND appointment_date = $2
        AND (
          (start_time < $4 AND end_time > $3)
          OR (start_time >= $3 AND start_time < $4)
          OR (end_time > $3 AND end_time <= $4)
        )
    `;
    const params = [dentistId, dateUTC, startUTC, endUTC];

    if (excludeAppointmentId) {
      query += ' AND appointment_id != $5';
      params.push(excludeAppointmentId);
    }

    const { rows } = await pool.query(query, params);
    return rows;
  }
}

module.exports = Appointment;

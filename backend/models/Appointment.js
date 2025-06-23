// models/Appointment.js
class Appointment {
  static async create(pool, patientId, dentistId, procedureId, date, startTime, endTime) {
    const { rows } = await pool.query(
      `INSERT INTO appointments 
       (patient_id, dentist_id, procedure_id, appointment_date, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING appointment_id`,
      [patientId, dentistId, procedureId, date, startTime, endTime]
    );
    return rows[0].appointment_id;
  }

  static async findByPatientId(pool, patientId) {
    const { rows } = await pool.query(
      `SELECT a.*, p.name AS procedure_name,
              d.first_name || ' ' || d.last_name AS dentist_name
       FROM appointments a
       JOIN procedures p ON a.procedure_id = p.procedure_id
       JOIN dentists d ON a.dentist_id = d.dentist_id
       WHERE a.patient_id = $1`,
      [patientId]
    );
    return rows;
  }
}

module.exports = Appointment;

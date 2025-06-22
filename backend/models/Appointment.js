class Appointment {
  static async create(pool, patientId, dentistId, procedureId, date, startTime, endTime) {
    const [result] = await pool.query(
      'INSERT INTO appointments (patient_id, dentist_id, procedure_id, appointment_date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)',
      [patientId, dentistId, procedureId, date, startTime, endTime]
    );
    return result.insertId;
  }

  static async findByPatientId(pool, patientId) {
    const [rows] = await pool.query(
      `SELECT a.*, p.name as procedure_name, 
       CONCAT(d.first_name, ' ', d.last_name) as dentist_name
       FROM appointments a
       JOIN procedures p ON a.procedure_id = p.procedure_id
       JOIN dentists d ON a.dentist_id = d.dentist_id
       WHERE a.patient_id = ?`,
      [patientId]
    );
    return rows;
  }
}

module.exports = Appointment;
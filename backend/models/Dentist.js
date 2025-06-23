// models/Dentist.js
class Dentist {
  static async findAll(pool) {
    const { rows } = await pool.query(
      `SELECT d.*, u.email
       FROM dentists d
       JOIN users u ON d.user_id = u.user_id`
    );
    return rows;
  }

  static async findAvailableSlots(pool, dentistId, date) {
    const { rows: availability } = await pool.query(
      `SELECT day_of_week, start_time, end_time
       FROM dentist_availability
       WHERE dentist_id = $1`,
      [dentistId]
    );

    const { rows: booked } = await pool.query(
      `SELECT start_time, end_time
       FROM appointments
       WHERE dentist_id = $1 AND appointment_date = $2`,
      [dentistId, date]
    );

    const slots = availability.map(avail => ({
      date,
      start_time: avail.start_time,
      end_time: avail.end_time,
      available: true
    }));

    booked.forEach(b => {
      const i = slots.findIndex(s => s.start_time === b.start_time);
      if (i !== -1) slots[i].available = false;
    });

    return slots.filter(s => s.available);
  }
}

module.exports = Dentist;

class Dentist {
  static async findAll(pool) {
    try {
      const [dentists] = await pool.query(
        `SELECT d.*, u.email 
         FROM dentists d
         JOIN users u ON d.user_id = u.user_id`
      );
      return dentists;
    } catch (error) {
      console.error('Error fetching dentists:', error);
      throw error;
    }
  }

  static async findAvailableSlots(pool, dentistId, date) {
    try {
      // Get dentist's working hours
      const [availability] = await pool.query(
        `SELECT day_of_week, start_time, end_time 
         FROM dentist_availability 
         WHERE dentist_id = ?`,
        [dentistId]
      );

      // Get booked appointments
      const [bookedAppointments] = await pool.query(
        `SELECT start_time, end_time 
         FROM appointments 
         WHERE dentist_id = ? AND appointment_date = ?`,
        [dentistId, date]
      );

      // Generate available slots (simplified example)
      const slots = [];
      availability.forEach(avail => {
        slots.push({
          date: date,
          start_time: avail.start_time,
          end_time: avail.end_time,
          available: true
        });
      });

      // Mark booked slots as unavailable
      bookedAppointments.forEach(booked => {
        const index = slots.findIndex(
          slot => slot.start_time === booked.start_time
        );
        if (index !== -1) {
          slots[index].available = false;
        }
      });

      return slots.filter(slot => slot.available);
    } catch (error) {
      console.error('Error finding available slots:', error);
      throw error;
    }
  }
}

module.exports = Dentist;
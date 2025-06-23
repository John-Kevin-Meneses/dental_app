class Patient {
  /**
   * Create a new patient
   * @param {object} pool - PostgreSQL pool instance
   * @param {object} patientData - Patient data
   * @returns {Promise<object>} Created patient
   */
  static async create(pool, { user_id, first_name, last_name, phone }) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO patients (user_id, first_name, last_name, phone)
         VALUES ($1, $2, $3, $4) 
         RETURNING patient_id, user_id, first_name, last_name, phone, created_at`,
        [user_id, first_name, last_name, phone]
      );
      
      return rows[0];
    } catch (error) {
      console.error('Patient creation error:', error);
      throw new Error('Failed to create patient');
    }
  }

  /**
   * Find patient by user ID
   * @param {object} pool - PostgreSQL pool instance
   * @param {number} user_id - User ID
   * @returns {Promise<object|null>} Patient object or null
   */
  static async findByUserId(pool, user_id) {
    try {
      const { rows } = await pool.query(
        `SELECT p.*, u.email, u.username, u.role
         FROM patients p
         JOIN users u ON p.user_id = u.user_id
         WHERE p.user_id = $1`,
        [user_id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Find patient by user ID error:', error);
      throw new Error('Failed to find patient by user ID');
    }
  }

  /**
   * Update patient information
   * @param {object} pool - PostgreSQL pool instance
   * @param {number} user_id - User ID
   * @param {object} updates - Fields to update
   * @returns {Promise<object|null>} Updated patient or null
   */
  static async update(pool, user_id, updates) {
    try {
      const { first_name, last_name, phone } = updates;
      const { rows } = await pool.query(
        `UPDATE patients 
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             phone = COALESCE($3, phone)
         WHERE user_id = $4
         RETURNING patient_id, user_id, first_name, last_name, phone`,
        [first_name, last_name, phone, user_id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Patient update error:', error);
      throw new Error('Failed to update patient');
    }
  }
}

module.exports = Patient;
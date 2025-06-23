const bcrypt = require('bcryptjs');

class User {
  /**
   * Create a new user
   * @param {object} client - PostgreSQL client or pool instance
   * @param {object} userData - User data
   * @returns {Promise<object>} Created user
   */
  static async create(client, { email, password, role = 'patient' }) {
    try {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const { rows } = await client.query(
        `INSERT INTO users (email, password_hash, role)
         VALUES ($1, $2, $3) 
         RETURNING user_id, email, role, is_active, created_at, updated_at`,
        [email, password_hash, role]
      );
      
      return rows[0];
    } catch (error) {
      console.error('User creation error:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Find user by email
   * @param {object} pool - PostgreSQL pool instance
   * @param {string} email - User email
   * @returns {Promise<object|null>} User object or null
   */
  static async findByEmail(pool, email) {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE email = $1', 
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Find by email error:', error);
      throw new Error('Failed to find user by email');
    }
  }

 
  /**
   * Find user by ID
   * @param {object} pool - PostgreSQL pool instance
   * @param {number} id - User ID
   * @returns {Promise<object|null>} User object or null
   */
  static async findById(pool, id) {
    try {
      const { rows } = await pool.query(
        `SELECT user_id, email, role, is_active, created_at, updated_at
         FROM users WHERE user_id = $1`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Find by ID error:', error);
      throw new Error('Failed to find user by ID');
    }
  }

  /**
   * Get all users
   * @param {object} pool - PostgreSQL pool instance
   * @returns {Promise<array>} Array of users
   */
  static async getAll(pool) {
    try {
      const { rows } = await pool.query(
        `SELECT user_id, email, role, is_active, created_at, updated_at
         FROM users ORDER BY created_at DESC`
      );
      return rows;
    } catch (error) {
      console.error('Get all users error:', error);
      throw new Error('Failed to get all users');
    }
  }

  /**
   * Update user
   * @param {object} pool - PostgreSQL pool instance
   * @param {number} id - User ID
   * @param {object} updates - Fields to update
   * @returns {Promise<object|null>} Updated user or null
   */
  static async update(pool, id, updates) {
    try {
      const {email, role, is_active } = updates;
      const { rows } = await pool.query(
        `UPDATE users 
         SET email = COALESCE($2, email),
             role = COALESCE($3, role),
             is_active = COALESCE($4, is_active),
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $5
         RETURNING user_id, email, role, is_active, created_at, updated_at`,
        [email, role, is_active, id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('User update error:', error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Delete user
   * @param {object} pool - PostgreSQL pool instance
   * @param {number} id - User ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  static async delete(pool, id) {
    try {
      const { rowCount } = await pool.query(
        'DELETE FROM users WHERE user_id = $1',
        [id]
      );
      return rowCount > 0;
    } catch (error) {
      console.error('User deletion error:', error);
      throw new Error('Failed to delete user');
    }
  }

  /**
   * Update user password
   * @param {object} pool - PostgreSQL pool instance
   * @param {number} id - User ID
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} True if password updated successfully
   */
  static async updatePassword(pool, id, newPassword) {
    try {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);

      const { rowCount } = await pool.query(
        `UPDATE users 
         SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2`,
        [password_hash, id]
      );
      
      return rowCount > 0;
    } catch (error) {
      console.error('Password update error:', error);
      throw new Error('Failed to update password');
    }
  }

  /**
   * Toggle user active status
   * @param {object} pool - PostgreSQL pool instance
   * @param {number} id - User ID
   * @returns {Promise<object|null>} Updated user or null
   */
  static async toggleActive(pool, id) {
    try {
      const { rows } = await pool.query(
        `UPDATE users 
         SET is_active = NOT is_active, 
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1
         RETURNING user_id, email, role, is_active, created_at, updated_at`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Toggle active status error:', error);
      throw new Error('Failed to toggle user active status');
    }
  }

  /**
   * Verify user password
   * @param {string} password - Password to verify
   * @param {string} hash - Stored password hash
   * @returns {Promise<boolean>} True if password matches
   */
  static async verifyPassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('Password verification error:', error);
      throw new Error('Failed to verify password');
    }
  }
}

module.exports = User;
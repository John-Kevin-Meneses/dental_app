// models/User.js
class User {
  static async create(pool, userData) {
    const [result] = await pool.query(
      'INSERT INTO users SET ?',
      [userData]
    );
    return this.findById(pool, result.insertId);
  }

  static async findByEmail(pool, email) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findById(pool, id) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE user_id = ?',
      [id]
    );
    return rows[0];
  }

  static async getAll(pool) {
    const [rows] = await pool.query(
      'SELECT user_id, first_name, last_name, email, phone, role, created_at FROM users'
    );
    return rows;
  }
}

module.exports = User;
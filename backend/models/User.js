// models/User.js
class User {
  static async create(pool, { first_name, last_name, email, password, phone, role = 'patient' }) {
    // Hash password before storing
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const { rows } = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING user_id, first_name, last_name, email, phone, role, created_at`,
      [first_name, last_name, email, password_hash, phone, role]
    );
    return rows[0];
  }

  static async findByEmail(pool, email) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1', 
      [email]
    );
    return rows[0] || null;
  }

  static async findById(pool, id) {
    const { rows } = await pool.query(
      `SELECT user_id, first_name, last_name, email, phone, role, created_at 
       FROM users WHERE user_id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  static async getAll(pool) {
    const { rows } = await pool.query(
      `SELECT user_id, first_name, last_name, email, phone, role, created_at 
       FROM users`
    );
    return rows;
  }

  static async update(pool, id, updates) {
    const { first_name, last_name, phone } = updates;
    const { rows } = await pool.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, phone = $3
       WHERE user_id = $4
       RETURNING user_id, first_name, last_name, email, phone, role`,
      [first_name, last_name, phone, id]
    );
    return rows[0] || null;
  }

  static async delete(pool, id) {
    const { rowCount } = await pool.query(
      'DELETE FROM users WHERE user_id = $1',
      [id]
    );
    return rowCount > 0;
  }
}

module.exports = User;
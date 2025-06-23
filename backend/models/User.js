// models/User.js
class User {
  static async create(pool, { first_name, last_name, email, password, phone, role }) {
    const { rows } = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [first_name, last_name, email, password, phone, role]
    );
    return rows[0];
  }

  static async findByEmail(pool, email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  }

  static async findById(pool, id) {
    const { rows } = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
    return rows[0];
  }

  static async getAll(pool) {
    const { rows } = await pool.query(
      'SELECT user_id, first_name, last_name, email, phone, role, created_at FROM users'
    );
    return rows;
  }
}

module.exports = User;

class Procedure {
  static async findAll(pool) {
    const { rows } = await pool.query(
      `SELECT * FROM procedures ORDER BY name`
    );
    return rows;
  }

  static async findById(pool, procedureId) {
    const { rows } = await pool.query(
      `SELECT * FROM procedures WHERE procedure_id = $1`,
      [procedureId]
    );
    return rows[0];
  }

  static async create(pool, { name, duration_minutes }) {
    const { rows } = await pool.query(
      `INSERT INTO procedures (name, duration_minutes)
       VALUES ($1, $2)
       RETURNING *`,
      [name, duration_minutes]
    );
    return rows[0];
  }

  static async update(pool, procedureId, { name, duration_minutes }) {
    const { rows } = await pool.query(
      `UPDATE procedures
       SET name = $1, duration_minutes = $2
       WHERE procedure_id = $3
       RETURNING *`,
      [name, duration_minutes, procedureId]
    );
    return rows[0];
  }

  static async delete(pool, procedureId) {
    const { rows } = await pool.query(
      `DELETE FROM procedures WHERE procedure_id = $1 RETURNING *`,
      [procedureId]
    );
    return rows[0];
  }

  static async exists(pool, procedureId) {
    const { rows } = await pool.query(
      `SELECT 1 FROM procedures WHERE procedure_id = $1`,
      [procedureId]
    );
    return rows.length > 0;
  }

  // Additional business logic method example
  static async findProceduresByDuration(pool, minDuration, maxDuration) {
    const { rows } = await pool.query(
      `SELECT * FROM procedures
       WHERE duration_minutes BETWEEN $1 AND $2
       ORDER BY duration_minutes`,
      [minDuration, maxDuration]
    );
    return rows;
  }
}

module.exports = Procedure;
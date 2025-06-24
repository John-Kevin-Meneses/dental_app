// controllers/userController.js
const User = require('../models/User');
// controllers/userController.js
exports.getAllUsers = async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    
    // Fetch all users with their associated patient/dentist data (PostgreSQL version)
    const { rows: users } = await pool.query(`
      SELECT 
        u.user_id,
        u.email,
        u.role,
        u.is_active,
        u.created_at,
        u.updated_at,
        COALESCE(p.first_name, d.first_name) AS first_name,
        COALESCE(p.last_name, d.last_name) AS last_name,
        COALESCE(p.phone, d.phone) AS phone,
        CASE 
          WHEN p.patient_id IS NOT NULL THEN p.patient_id
          WHEN d.dentist_id IS NOT NULL THEN d.dentist_id
          ELSE NULL
        END AS professional_id
      FROM users u
      LEFT JOIN patients p ON u.user_id = p.user_id
      LEFT JOIN dentists d ON u.user_id = d.user_id
      ORDER BY u.created_at DESC
    `);
    
    // Remove sensitive data before sending
    const sanitizedUsers = users.map(user => {
      const { password_hash, ...userData } = user;
      return userData;
    });
    
    res.status(200).json(sanitizedUsers);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { rows: user } = await pool.query(`
      SELECT 
        u.*,
        COALESCE(p.first_name, d.first_name) AS first_name,
        COALESCE(p.last_name, d.last_name) AS last_name,
        COALESCE(p.phone, d.phone) AS phone,
        CASE 
          WHEN p.patient_id IS NOT NULL THEN p.patient_id
          WHEN d.dentist_id IS NOT NULL THEN d.dentist_id
          ELSE NULL
        END AS professional_id
      FROM users u
      LEFT JOIN patients p ON u.user_id = p.user_id
      LEFT JOIN dentists d ON u.user_id = d.user_id
      WHERE u.user_id = $1
    `, [req.params.id]);

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove sensitive data before sending
    const { password_hash, ...userData } = user[0];
    res.status(200).json(userData);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};
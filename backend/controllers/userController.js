// controllers/userController.js
const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [users] = await pool.query(`
      SELECT 
        user_id as id,
        first_name,
        last_name,
        email,
        phone,
        role,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const user = await User.findById(pool, req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove sensitive data before sending
    const { password, ...userData } = user;
    res.status(200).json(userData);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};
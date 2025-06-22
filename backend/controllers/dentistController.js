const Dentist = require('../models/Dentist');

exports.getDentists = async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const dentists = await Dentist.findAll(pool);
    
    res.status(200).json({
      success: true,
      count: dentists.length,
      data: dentists
    });
  } catch (error) {
    console.error('Error in getDentists:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { dentistId, date } = req.query;
    const pool = req.app.locals.pool;
    
    if (!dentistId || !date) {
      return res.status(400).json({
        success: false,
        error: 'Please provide dentistId and date parameters'
      });
    }

    const slots = await Dentist.findAvailableSlots(pool, dentistId, date);
    
    res.status(200).json({
      success: true,
      data: slots
    });
  } catch (error) {
    console.error('Error in getAvailableSlots:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
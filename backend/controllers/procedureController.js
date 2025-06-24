// controllers/procedureController.js
const Procedure = require('../models/Procedure');

exports.getProcedures = async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const procedures = await Procedure.findAll(pool);
    res.status(200).json({ success: true, count: procedures.length, data: procedures });
  } catch (error) {
    console.error('Error in getProcedures:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.getProcedureById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Procedure ID required' });
    }
    const pool = req.app.locals.pool;
    const procedure = await Procedure.findById(pool, id);
    
    if (!procedure) {
      return res.status(404).json({ success: false, error: 'Procedure not found' });
    }
    
    res.status(200).json({ success: true, data: procedure });
  } catch (error) {
    console.error('Error in getProcedureById:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.createProcedure = async (req, res) => {
  try {
    const { name, duration_minutes } = req.body;
    if (!name || !duration_minutes) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name and duration_minutes are required' 
      });
    }
    
    const pool = req.app.locals.pool;
    const newProcedure = await Procedure.create(pool, { name, duration_minutes });
    
    res.status(201).json({ success: true, data: newProcedure });
  } catch (error) {
    console.error('Error in createProcedure:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.updateProcedure = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration_minutes } = req.body;
    
    if (!id) {
      return res.status(400).json({ success: false, error: 'Procedure ID required' });
    }
    
    if (!name && !duration_minutes) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least one field (name or duration_minutes) required for update' 
      });
    }
    
    const pool = req.app.locals.pool;
    
    // First check if procedure exists
    const existingProcedure = await Procedure.findById(pool, id);
    if (!existingProcedure) {
      return res.status(404).json({ success: false, error: 'Procedure not found' });
    }
    
    const updatedProcedure = await Procedure.update(
      pool, 
      id, 
      {
        name: name || existingProcedure.name,
        duration_minutes: duration_minutes || existingProcedure.duration_minutes
      }
    );
    
    res.status(200).json({ success: true, data: updatedProcedure });
  } catch (error) {
    console.error('Error in updateProcedure:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.deleteProcedure = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Procedure ID required' });
    }
    
    const pool = req.app.locals.pool;
    
    // First check if procedure exists
    const existingProcedure = await Procedure.findById(pool, id);
    if (!existingProcedure) {
      return res.status(404).json({ success: false, error: 'Procedure not found' });
    }
    
    await Procedure.delete(pool, id);
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error in deleteProcedure:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Additional method example
exports.getProceduresByDuration = async (req, res) => {
  try {
    const { min, max } = req.query;
    if (!min || !max) {
      return res.status(400).json({ 
        success: false, 
        error: 'min and max duration parameters required' 
      });
    }
    
    const pool = req.app.locals.pool;
    const procedures = await Procedure.findProceduresByDuration(
      pool, 
      parseInt(min), 
      parseInt(max)
    );
    
    res.status(200).json({ 
      success: true, 
      count: procedures.length, 
      data: procedures 
    });
  } catch (error) {
    console.error('Error in getProceduresByDuration:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
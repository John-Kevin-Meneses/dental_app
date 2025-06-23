const User = require('../models/User');
const Patient = require('../models/Patient');

class AuthService {
  constructor(pool) {
    this.pool = pool;
  }

  async registerPatient({ username, email, password, first_name, last_name, phone }) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Create the user account
      const user = await User.create(client, { 
        username, 
        email, 
        password, 
        role: 'patient' 
      });

      // 2. Create the patient record
      const patient = await Patient.create(client, {
        user_id: user.user_id,
        first_name,
        last_name,
        phone
      });

      await client.query('COMMIT');

      return {
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        patient: {
          patient_id: patient.patient_id,
          first_name: patient.first_name,
          last_name: patient.last_name,
          phone: patient.phone
        }
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = AuthService;
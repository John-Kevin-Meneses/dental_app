// User.jsx
import React, { useEffect } from 'react';

const UserDashboard = () => {
  useEffect(() => {
    console.log('✅ UserDashboard mounted');
  }, []);

  return (
    <div style={{ padding: '2rem', fontSize: '1.5rem', color: 'green' }}>
      ✅ UserDashboard Rendered Successfully
    </div>
  );
};

export default UserDashboard;

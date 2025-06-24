import moment from 'moment';

// Helper function to generate available hours (8AM-5PM)
export const generateAvailableHours = () => {
  return Array.from({ length: 10 }, (_, i) => i + 8).map(hour => ({
    value: hour,
    label: `${hour}:00 - ${hour + 1}:00`,
    disabled: false
  }));
};

// Processes raw appointment data from API according to SQL schema
export const processAppointment = (appt) => {
  try {
    const startDateTime = new Date(`${appt.appointment_date}T${appt.start_time}`);
    const endDateTime = new Date(`${appt.appointment_date}T${appt.end_time}`);

    return {
      id: appt.appointment_id,
      title: `${appt.procedure_name} with ${appt.dentist_name}`,
      start: startDateTime,
      end: endDateTime,
      dentist: appt.dentist_name,
      dentistId: appt.dentist_id,
      procedure: appt.procedure_name,
      procedureId: appt.procedure_id,
      status: appt.status || 'scheduled',
      date: appt.appointment_date,
      startTime: appt.start_time,
      endTime: appt.end_time,
      patientId: appt.patient_id,
      notes: appt.notes || '',
      duration: appt.duration_minutes,
      dentistPhone: appt.dentist_phone
    };
  } catch (error) {
    console.error('Error processing appointment:', error);
    return null;
  }
};

// Calculates end time based on procedure duration
const calculateEndTime = (startTime, durationMinutes) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}:00`;
};

// Fetches all initial data needed for the dashboard
export const fetchInitialData = async (apiService, setState, setUserProfile) => {
  try {
    setState(prev => ({ ...prev, loading: true, profileLoading: true }));

    const [profileRes, appointmentsRes, dentistsRes, proceduresRes] = await Promise.all([
      apiService.getProfile(),
      apiService.getAppointments(),
      apiService.getDentists(),
      apiService.getProcedures()
    ]);

    // Handle profile data
    if (!profileRes.success) throw new Error(profileRes.message || 'Failed to fetch profile');
    
    const profileData = profileRes.data.user;
    setUserProfile({
      name: `${profileData.patient?.first_name || ''} ${profileData.patient?.last_name || ''}`.trim(),
      avatar: profileData.avatar || "https://randomuser.me/api/portraits/men/32.jpg",
      email: profileData.email || '',
      phone: profileData.patient?.phone || '',
      role: profileData.role || 'Patient',
      patientId: profileData.patient_id || null
    });

    // Process appointments
    if (!appointmentsRes.success) throw new Error(appointmentsRes.message || 'Failed to fetch appointments');
    
    const appointmentsData = Array.isArray(appointmentsRes.data) 
      ? appointmentsRes.data 
      : appointmentsRes.data?.appointments || [];
    
    const appointments = appointmentsData
      .map(processAppointment)
      .filter(appt => appt !== null);

    // Process dentists
    if (!dentistsRes.success) throw new Error(dentistsRes.message || 'Failed to fetch dentists');
    
    const dentistsData = Array.isArray(dentistsRes.data) 
      ? dentistsRes.data 
      : dentistsRes.data?.dentists || [];
    
    const dentists = dentistsData.map(d => ({
      dentist_id: d.dentist_id,
      first_name: d.first_name,
      last_name: d.last_name,
      phone: d.phone,
      full_name: `${d.first_name} ${d.last_name}`
    }));

    // Process procedures
    if (!proceduresRes.success) throw new Error(proceduresRes.message || 'Failed to fetch procedures');
    
    const proceduresData = Array.isArray(proceduresRes.data) 
      ? proceduresRes.data 
      : proceduresRes.data?.procedures || [];
    
    const procedures = proceduresData.map(p => ({
      procedure_id: p.procedure_id,
      name: p.name,
      duration_minutes: p.duration_minutes || 30
    }));

    setState(prev => ({
      ...prev,
      appointments,
      filteredAppointments: appointments,
      dentists,
      procedures,
      loading: false,
      profileLoading: false
    }));

  } catch (error) {
    console.error('Failed to fetch data:', error);
    setState(prev => ({ 
      ...prev, 
      loading: false, 
      profileLoading: false,
      error: error.message 
    }));
    
    if (error.message.includes('401')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
};

// Filters appointments based on search and status
export const filterAppointments = (state, setState) => {
  const filtered = state.appointments.filter(appt => {
    const matchesSearch = state.searchTerm 
      ? `${appt.dentist} ${appt.procedure}`.toLowerCase().includes(state.searchTerm.toLowerCase())
      : true;
    
    const matchesStatus = state.filterStatus === 'all' 
      ? true 
      : appt.status === state.filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  setState(prev => ({ ...prev, filteredAppointments: filtered }));
};

// Handles showing the appointment modal
export const handleShowModal = async (apiService, state, setState, appointment = null) => {
  try {
    // Fetch fresh data if needed
    if (!appointment && (state.dentists.length === 0 || state.procedures.length === 0)) {
      const [dentistsRes, proceduresRes] = await Promise.all([
        apiService.getDentists(),
        apiService.getProcedures()
      ]);
      
      if (!dentistsRes.success || !proceduresRes.success) {
        throw new Error('Failed to load required data');
      }

      const dentistsData = Array.isArray(dentistsRes.data) ? dentistsRes.data : dentistsRes.data?.dentists || [];
      const proceduresData = Array.isArray(proceduresRes.data) ? proceduresRes.data : proceduresRes.data?.procedures || [];

      setState(prev => ({
        ...prev,
        dentists: dentistsData.map(d => ({
          dentist_id: d.dentist_id,
          first_name: d.first_name,
          last_name: d.last_name,
          phone: d.phone,
          full_name: `${d.first_name} ${d.last_name}`
        })),
        procedures: proceduresData.map(p => ({
          procedure_id: p.procedure_id,
          name: p.name,
          duration_minutes: p.duration_minutes || 30
        }))
      }));
    }

    setState(prev => ({
      ...prev,
      showModal: true,
      currentAppointment: appointment || {
        id: null,
        dentistId: state.dentists[0]?.dentist_id || '',
        procedureId: state.procedures[0]?.procedure_id || '',
        date: moment().format('YYYY-MM-DD'),
        hour: 9,
        notes: '',
        status: 'scheduled'
      }
    }));

  } catch (error) {
    console.error('Failed to prepare modal:', error);
    setState(prev => ({ ...prev, error: error.message }));
  }
};

// Handles modal close
export const handleCloseModal = (setState) => {
  setState(prev => ({ ...prev, showModal: false }));
};

// Handles form submission for create/update
export const handleSubmit = async (e, apiService, state, setState, userProfile) => {
  e.preventDefault();
  
  try {
    const { currentAppointment } = state;
    const procedure = state.procedures.find(p => p.procedure_id === currentAppointment.procedureId);
    const duration = procedure ? procedure.duration_minutes : 30;

    const appointmentData = {
      patient_id: userProfile.patientId,
      dentist_id: currentAppointment.dentistId,
      procedure_id: currentAppointment.procedureId,
      appointment_date: currentAppointment.date,
      start_time: `${currentAppointment.hour.toString().padStart(2, '0')}:00:00`,
      end_time: calculateEndTime(`${currentAppointment.hour}:00:00`, duration),
      status: 'scheduled',
      notes: currentAppointment.notes
    };

    setState(prev => ({ ...prev, loading: true }));

    // Determine if we're creating or updating
    const result = currentAppointment.id
      ? await apiService.updateAppointment(currentAppointment.id, appointmentData)
      : await apiService.createAppointment(appointmentData);

    if (!result.success) throw new Error(result.message);

    // Refresh appointments
    const appointmentsRes = await apiService.getAppointments();
    if (!appointmentsRes.success) throw new Error(appointmentsRes.message);

    const appointmentsData = Array.isArray(appointmentsRes.data) 
      ? appointmentsRes.data 
      : appointmentsRes.data?.appointments || [];
    
    const appointments = appointmentsData
      .map(processAppointment)
      .filter(appt => appt !== null);

    setState(prev => ({
      ...prev,
      appointments,
      filteredAppointments: appointments,
      showModal: false,
      loading: false
    }));

  } catch (error) {
    console.error('Failed to save appointment:', error);
    setState(prev => ({ 
      ...prev, 
      loading: false,
      error: error.message 
    }));
  }
};

// Handles input changes in the form
export const handleInputChange = (e, state, setState) => {
  const { name, value } = e.target;
  setState(prev => ({
    ...prev,
    currentAppointment: {
      ...prev.currentAppointment,
      [name]: value
    }
  }));
};

// Handles time slot selection
export const handleTimeChange = (e, state, setState) => {
  const hour = parseInt(e.target.value);
  setState(prev => ({
    ...prev,
    currentAppointment: {
      ...prev.currentAppointment,
      hour: hour
    }
  }));
};

// Handles appointment cancellation
export const handleCancel = async (id, apiService, setState) => {
  if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
  
  try {
    setState(prev => ({ ...prev, loading: true }));
    const result = await apiService.cancelAppointment(id);
    if (!result.success) throw new Error(result.message);

    // Refresh appointments
    const appointmentsRes = await apiService.getAppointments();
    if (!appointmentsRes.success) throw new Error(appointmentsRes.message);

    const appointmentsData = Array.isArray(appointmentsRes.data) 
      ? appointmentsRes.data 
      : appointmentsRes.data?.appointments || [];
    
    const appointments = appointmentsData
      .map(processAppointment)
      .filter(appt => appt !== null);

    setState(prev => ({
      ...prev,
      appointments,
      filteredAppointments: appointments,
      loading: false
    }));

  } catch (error) {
    console.error('Failed to cancel appointment:', error);
    setState(prev => ({ 
      ...prev, 
      loading: false,
      error: error.message 
    }));
  }
};

// Handles user logout
export const handleLogout = async (apiService) => {
  try {
    await apiService.logout();
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    window.location.href = '/login';
  } catch (error) {
    console.error('Failed to logout:', error);
    alert('Failed to logout. Please try again.');
  }
};

// Styles calendar events based on status
export const eventStyleGetter = (event) => {
  const statusColors = {
    scheduled: '#17a2b8',
    confirmed: '#28a745',
    cancelled: '#dc3545',
    no_show: '#ffc107',
    completed: '#6c757d'
  };

  return {
    style: {
      backgroundColor: statusColors[event.status] || '#6c757d',
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
      fontSize: '0.85rem',
      padding: '2px 5px'
    }
  };
};
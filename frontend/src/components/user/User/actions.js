import moment from 'moment';

// Generate available hours (8 AM to 5 PM)
export const generateAvailableHours = () => {
  return Array.from({ length: 10 }, (_, i) => i + 8).map(hour => ({
    value: hour,
    label: `${hour}:00 - ${hour + 1}:00`,
    disabled: false
  }));
};

// Normalize raw appointment data from API
export const processAppointment = (appt) => {
  try {
    const dentistName = appt.dentist_name || 
      (appt.first_name ? `${appt.first_name} ${appt.last_name}` : 'Unknown Dentist');

    const dateOnly = appt.appointment_date.split('T')[0];
    const startDateTime = new Date(`${dateOnly}T${appt.start_time}`);
    const endDateTime = new Date(`${dateOnly}T${appt.end_time}`);

    return {
      id: appt.appointment_id,
      title: `${appt.procedure_name} with ${dentistName}`,
      start: startDateTime,
      end: endDateTime,
      dentist: dentistName,
      dentistId: appt.dentist_id,
      procedure: appt.procedure_name,
      procedureId: appt.procedure_id,
      status: appt.status || 'scheduled',
      date: dateOnly,
      startTime: appt.start_time,
      endTime: appt.end_time,
      patientId: appt.patient_id,
      notes: appt.notes || '',
      dentist_phone: appt.dentist_phone,
      duration_minutes: appt.duration_minutes
    };
  } catch (error) {
    console.error('Error processing appointment:', error);
    return null;
  }
};

// Calculate appointment end time based on start + duration
const calculateEndTime = (startTime, durationMinutes) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}:00`;
};

// Fetch all required initial data
export const fetchInitialData = async (apiService, setState, setUserProfile) => {
  try {
    setState(prev => ({ ...prev, loading: true, profileLoading: true }));

    const [profileRes, appointmentsRes, dentistsRes, proceduresRes] = await Promise.all([
      apiService.getProfile(),
      apiService.getAppointments(),
      apiService.getDentists(),
      apiService.getProcedures()
    ]);

    // Profile
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

    // Appointments
    if (!appointmentsRes.success) throw new Error(appointmentsRes.message || 'Failed to fetch appointments');
    const appointmentsRaw = Array.isArray(appointmentsRes.data?.data)
    ? appointmentsRes.data.data
    : [];
    const appointments = appointmentsRaw.map(processAppointment).filter(Boolean);
    console.log('Appointments:', appointments);
    console.log('Appointments Raw:', appointmentsRes.data);

    // Dentists
    if (!dentistsRes.success) throw new Error(dentistsRes.message || 'Failed to fetch dentists');
    const dentists = (dentistsRes.data.data || []).map(d => ({
      dentist_id: d.dentist_id,
      first_name: d.first_name,
      last_name: d.last_name,
      full_name: `Dr. ${d.first_name} ${d.last_name}`,
      phone: d.phone,
      email: d.email
    }));

    // Procedures
    if (!proceduresRes.success) throw new Error(proceduresRes.message || 'Failed to fetch procedures');
    const procedures = (proceduresRes.data.data || []).map(p => ({
      procedure_id: p.procedure_id,
      name: p.name,
      duration_minutes: p.duration_minutes || 30,
      display_name: `${p.name} (${p.duration_minutes || 30} mins)`
    }));

    setState(prev => ({
      ...prev,
      appointments,
      filteredAppointments: appointments,
      dentists,
      procedures,
      availableHours: generateAvailableHours(),
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

// Filter appointments based on search and status
export const filterAppointments = (state, setState) => {
  const filtered = state.appointments.filter(appt => {
    const matchesSearch = state.searchTerm
      ? `${appt.dentist} ${appt.procedure} ${appt.notes}`.toLowerCase().includes(state.searchTerm.toLowerCase())
      : true;
    const matchesStatus = state.filterStatus === 'all' || appt.status === state.filterStatus;
    return matchesSearch && matchesStatus;
  });

  setState(prev => ({ ...prev, filteredAppointments: filtered }));
};

// Show modal for creating or editing an appointment
export const handleShowModal = async (apiService, state, setState, appointment = null) => {
  try {
    if (!appointment) {
      const now = new Date();
      const defaultHour = now.getHours() < 17 ? Math.max(now.getHours(), 9) : 9;

      setState(prev => ({
        ...prev,
        showModal: true,
        currentAppointment: {
          id: null,
          dentistId: state.dentists[0]?.dentist_id || '',
          procedureId: state.procedures[0]?.procedure_id || '',
          date: moment().format('YYYY-MM-DD'),
          hour: defaultHour,
          notes: '',
          status: 'scheduled'
        }
      }));
      return;
    }

    const [apptRes, dentistsRes, proceduresRes] = await Promise.all([
      apiService.getAppointment(appointment.id),
      apiService.getDentists(),
      apiService.getProcedures()
    ]);

    if (!apptRes.success || !dentistsRes.success || !proceduresRes.success) {
      throw new Error('Failed to load appointment details');
    }

    const currentAppointment = processAppointment(apptRes.data);

    const dentists = (dentistsRes.data.data || []).map(d => ({
      dentist_id: d.dentist_id,
      first_name: d.first_name,
      last_name: d.last_name,
      full_name: `Dr. ${d.first_name} ${d.last_name}`,
      phone: d.phone,
      email: d.email
    }));

    const procedures = (proceduresRes.data.data || []).map(p => ({
      procedure_id: p.procedure_id,
      name: p.name,
      duration_minutes: p.duration_minutes || 30,
      display_name: `${p.name} (${p.duration_minutes || 30} mins)`
    }));

    setState(prev => ({
      ...prev,
      showModal: true,
      currentAppointment,
      dentists,
      procedures,
      availableHours: generateAvailableHours()
    }));
  } catch (error) {
    console.error('Failed to prepare modal:', error);
    setState(prev => ({ ...prev, error: error.message }));
  }
};

// Close modal
export const handleCloseModal = (setState) => {
  setState(prev => ({ ...prev, showModal: false, currentAppointment: null }));
};

// Submit form to create or update appointment
export const handleSubmit = async (e, apiService, state, setState, userProfile) => {
  e.preventDefault();

  try {
    const { currentAppointment } = state;
    if (!currentAppointment) throw new Error('No appointment data');

    const { hour } = currentAppointment;
    if (typeof hour !== 'number' || isNaN(hour)) {
      throw new Error('Invalid or missing hour in appointment');
    }

    const procedure = state.procedures.find(p => p.procedure_id === currentAppointment.procedureId);
    const duration = procedure?.duration_minutes || 30;

    const startTime = `${hour.toString().padStart(2, '0')}:00:00`;

    const appointmentData = {
      patientId: userProfile.patientId,
      dentistId: currentAppointment.dentistId,
      procedureId: currentAppointment.procedureId,
      date: currentAppointment.date,
      startTime,
      endTime: calculateEndTime(startTime, duration),
      notes: currentAppointment.notes || ''
    };

    setState(prev => ({ ...prev, loading: true }));

    const result = currentAppointment.id
      ? await apiService.updateAppointment(currentAppointment.id, appointmentData)
      : await apiService.createAppointment(appointmentData);

    if (!result.success) throw new Error(result.message);

    const appointmentsRes = await apiService.getAppointments();
    if (!appointmentsRes.success) throw new Error(appointmentsRes.message);

    const appointments = (Array.isArray(appointmentsRes.data)
      ? appointmentsRes.data
      : appointmentsRes.data?.appointments || []
    ).map(processAppointment).filter(Boolean);

    setState(prev => ({
      ...prev,
      appointments,
      filteredAppointments: appointments,
      showModal: false,
      currentAppointment: null,
      loading: false
    }));

    window.location.reload();
  } catch (error) {
    console.error('Failed to save appointment:', error);
    setState(prev => ({ ...prev, loading: false, error: error.message }));
  }
};


// Cancel appointment
export const handleCancel = async (id, apiService, setState) => {
  if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

  try {
    setState(prev => ({ ...prev, loading: true }));
    const result = await apiService.cancelAppointment(id);
    if (!result.success) throw new Error(result.message);

    const appointmentsRes = await apiService.getAppointments();
    if (!appointmentsRes.success) throw new Error(appointmentsRes.message);

    const appointments = (Array.isArray(appointmentsRes.data)
      ? appointmentsRes.data
      : appointmentsRes.data?.appointments || []
    ).map(processAppointment).filter(Boolean);

    setState(prev => ({
      ...prev,
      appointments,
      filteredAppointments: appointments,
      loading: false
    }));

    window.location.reload();
  } catch (error) {
    console.error('Failed to cancel appointment:', error);
    setState(prev => ({ ...prev, loading: false, error: error.message }));
  }
};

// Logout user
export const handleLogout = async (apiService) => {
  try {
    await apiService.logout();
    localStorage.removeItem('token');
    window.location.href = '/login';
  } catch (error) {
    console.error('Failed to logout:', error);
    alert('Failed to logout. Please try again.');
  }
};

// Event styling for calendar
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
      fontSize: '0.85rem'
    }
  };
};

// Load single appointment
export const getAppointment = async (apiService, appointmentId, setState) => {
  try {
    setState(prev => ({ ...prev, loading: true }));
    const result = await apiService.getAppointment(appointmentId);
    if (!result.success) throw new Error(result.message);

    const appointment = processAppointment(result.data);
    setState(prev => ({ ...prev, loading: false }));
    return appointment;
  } catch (error) {
    console.error('Failed to fetch appointment:', error);
    setState(prev => ({ ...prev, loading: false, error: error.message }));
    return null;
  }
};

// Form field handlers
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

export const handleTimeChange = (e, state, setState) => {
  const hour = parseInt(e.target.value, 10);
  setState(prev => ({
    ...prev,
    currentAppointment: {
      ...prev.currentAppointment,
      hour: isNaN(hour) ? 9 : hour
    }
  }));
};

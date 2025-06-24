import moment from 'moment';

export const generateAvailableHours = () => {
  return Array.from({ length: 10 }, (_, i) => i + 8).map(hour => ({
    value: hour,
    label: `${hour}:00 - ${hour + 1}:00`,
    disabled: false
  }));
};

export const processAppointment = (appt) => {
  try {
    const dentistName = appt.dentist_name || 
      (appt.first_name ? `${appt.first_name} ${appt.last_name}` : 'Unknown Dentist');

    const startDateTime = new Date(`${appt.appointment_date.split('T')[0]}T${appt.start_time}`);
    const endDateTime = new Date(`${appt.appointment_date.split('T')[0]}T${appt.end_time}`);

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
      date: appt.appointment_date.split('T')[0],
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

const calculateEndTime = (startTime, durationMinutes) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}:00`;
};

export const fetchInitialData = async (apiService, setState, setUserProfile) => {
  try {
    setState(prev => ({ ...prev, loading: true, profileLoading: true }));

    const [profileRes, appointmentsRes, dentistsRes, proceduresRes] = await Promise.all([
      apiService.getProfile(),
      apiService.getAppointments(),
      apiService.getDentists(),
      apiService.getProcedures()
    ]);

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

    if (!appointmentsRes.success) throw new Error(appointmentsRes.message || 'Failed to fetch appointments');
    const appointmentsData = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : appointmentsRes.data?.appointments || [];
    const appointments = appointmentsData.map(processAppointment).filter(appt => appt !== null);

    if (!dentistsRes.success) throw new Error(dentistsRes.message || 'Failed to fetch dentists');
    const dentistsData = dentistsRes.data.data || [];
    const dentists = dentistsData.map(d => ({
      dentist_id: d.dentist_id,
      first_name: d.first_name,
      last_name: d.last_name,
      full_name: `Dr. ${d.first_name} ${d.last_name}`,
      phone: d.phone,
      email: d.email
    }));

    if (!proceduresRes.success) throw new Error(proceduresRes.message || 'Failed to fetch procedures');
    const proceduresData = proceduresRes.data.data || [];
    const procedures = proceduresData.map(p => ({
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
      loading: false,
      profileLoading: false,
      availableHours: generateAvailableHours()
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

export const filterAppointments = (state, setState) => {
  const filtered = state.appointments.filter(appt => {
    const matchesSearch = state.searchTerm 
      ? `${appt.dentist} ${appt.procedure} ${appt.notes}`.toLowerCase().includes(state.searchTerm.toLowerCase())
      : true;

    const matchesStatus = state.filterStatus === 'all' 
      ? true 
      : appt.status === state.filterStatus;

    return matchesSearch && matchesStatus;
  });

  setState(prev => ({ ...prev, filteredAppointments: filtered }));
};

export const handleShowModal = async (apiService, state, setState, appointment = null) => {
  try {
    if (!appointment) {
      const now = new Date();
      const defaultHour = now.getHours() < 17 ? (now.getHours() > 8 ? now.getHours() : 9) : 9;

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

export const handleCloseModal = (setState) => {
  setState(prev => ({ ...prev, showModal: false, currentAppointment: null }));
};

export const handleSubmit = async (e, apiService, state, setState, userProfile) => {
  e.preventDefault();

  try {
    const { currentAppointment } = state;
    if (!currentAppointment) throw new Error('No appointment data');

    const procedure = state.procedures.find(p => p.procedure_id === currentAppointment.procedureId);
    const duration = procedure ? procedure.duration_minutes : 30;

    const appointmentData = {
      patient_id: userProfile.patientId,
      dentist_id: currentAppointment.dentistId,
      procedure_id: currentAppointment.procedureId,
      appointment_date: currentAppointment.date,
      start_time: `${currentAppointment.hour.toString().padStart(2, '0')}:00:00`,
      end_time: calculateEndTime(`${currentAppointment.hour}:00:00`, duration),
      status: currentAppointment.status || 'scheduled',
      notes: currentAppointment.notes || ''
    };

    setState(prev => ({ ...prev, loading: true }));

    let result;
    if (currentAppointment.id) {
      result = await apiService.updateAppointment(currentAppointment.id, appointmentData);
    } else {
      result = await apiService.createAppointment(appointmentData);
    }

    if (!result.success) throw new Error(result.message);

    const appointmentsRes = await apiService.getAppointments();
    if (!appointmentsRes.success) throw new Error(appointmentsRes.message);

    const appointments = (Array.isArray(appointmentsRes.data) 
      ? appointmentsRes.data 
      : appointmentsRes.data?.appointments || []
    ).map(processAppointment).filter(appt => appt !== null);

    setState(prev => ({
      ...prev,
      appointments,
      filteredAppointments: appointments,
      showModal: false,
      currentAppointment: null,
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
    ).map(processAppointment).filter(appt => appt !== null);

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
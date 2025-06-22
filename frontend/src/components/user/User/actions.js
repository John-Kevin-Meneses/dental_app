// actions.js
import api from '../../../services/api';
import moment from 'moment';

// Helper function to generate available hours
export const generateAvailableHours = () => {
  const hours = [];
  for (let i = 9; i <= 17; i++) {
    hours.push({
      value: i,
      label: `${i}:00 - ${i+1}:00`,
      disabled: false
    });
  }
  return hours;
};

// Fetch initial data including profile, appointments, dentists, and procedures
export const fetchInitialData = async (setState, setUserProfile) => {
  try {
    // Fetch user profile
    const profileResponse = await api.getProfile();
    const profileData = profileResponse.data.data;
    setUserProfile({
      name: `${profileData.first_name} ${profileData.last_name}`,
      avatar: profileData.avatar || "https://randomuser.me/api/portraits/men/32.jpg",
      email: profileData.email,
      phone: profileData.phone,
      insurance: profileData.insurance_provider
    });

    // Fetch appointments, dentists, and procedures in parallel
    const [appointmentsResponse, dentistsResponse, proceduresResponse] = await Promise.all([
      api.getAppointments(),
      api.getDentists(),
      api.getProcedures()
    ]);

    const appointments = appointmentsResponse.data.data.map(appt => ({
      id: appt.appointment_id,
      title: `${appt.procedure_name} with ${appt.dentist_name}`,
      start: new Date(`${appt.appointment_date}T${appt.start_time}`),
      end: new Date(`${appt.appointment_date}T${appt.end_time}`),
      dentist: appt.dentist_name,
      dentistId: appt.dentist_id,
      procedure: appt.procedure_name,
      procedureId: appt.procedure_id,
      status: appt.status,
      notes: appt.notes,
      date: appt.appointment_date,
      hour: parseInt(appt.start_time.split(':')[0])
    }));

    setState(prev => ({
      ...prev,
      appointments,
      filteredAppointments: appointments,
      dentists: dentistsResponse.data.data,
      procedures: proceduresResponse.data.data,
      loading: false,
      profileLoading: false
    }));
  } catch (error) {
    console.error('Failed to fetch data:', error);
    setState(prev => ({ ...prev, loading: false, profileLoading: false }));
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
};

// Filter appointments based on search term and status
export const filterAppointments = (state, setState) => {
  const filtered = state.appointments.filter(appointment => {
    const matchesSearch = appointment.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                       appointment.dentist.toLowerCase().includes(state.searchTerm.toLowerCase());
    const matchesStatus = state.filterStatus === 'all' || appointment.status === state.filterStatus;
    return matchesSearch && matchesStatus;
  });
  setState(prev => ({ ...prev, filteredAppointments: filtered }));
};

// Handle showing the appointment modal
export const handleShowModal = async (state, setState, appointment = null) => {
  try {
    // If no appointment (new booking) and missing data, fetch fresh
    if (!appointment && (state.dentists.length === 0 || state.procedures.length === 0)) {
      const [dentistsResponse, proceduresResponse] = await Promise.all([
        api.getDentists(),
        api.getProcedures()
      ]);
      
      setState(prev => ({
        ...prev,
        dentists: dentistsResponse.data.data,
        procedures: proceduresResponse.data.data
      }));
    }

    setState(prev => ({
      ...prev,
      showModal: true,
      currentAppointment: appointment || {
        id: null,
        dentistId: state.dentists.length > 0 ? state.dentists[0].dentist_id : '',
        procedureId: state.procedures.length > 0 ? state.procedures[0].procedure_id : '',
        date: moment().format('YYYY-MM-DD'),
        hour: 9, // Default to 9 AM
        notes: '',
        status: 'pending'
      }
    }));
  } catch (error) {
    console.error('Failed to prepare modal:', error);
    alert('Failed to load required data for booking');
  }
};

// Handle closing the modal
export const handleCloseModal = (setState) => {
  setState(prev => ({ ...prev, showModal: false }));
};

// Handle form submission for creating/updating appointments
export const handleSubmit = async (e, state, setState) => {
  e.preventDefault();
  const { currentAppointment } = state;
  
  try {
    const appointmentData = {
      dentistId: currentAppointment.dentistId,
      procedureId: currentAppointment.procedureId,
      date: currentAppointment.date,
      startTime: `${currentAppointment.hour}:00:00`,
      endTime: `${currentAppointment.hour + 1}:00:00`,
      notes: currentAppointment.notes
    };

    setState(prev => ({ ...prev, loading: true }));

    if (currentAppointment.id) {
      await api.updateAppointment(currentAppointment.id, appointmentData);
    } else {
      await api.createAppointment(appointmentData);
    }

    // Refresh appointments
    const appointmentsResponse = await api.getAppointments();
    const appointments = appointmentsResponse.data.data.map(appt => ({
      id: appt.appointment_id,
      title: `${appt.procedure_name} with ${appt.dentist_name}`,
      start: new Date(`${appt.appointment_date}T${appt.start_time}`),
      end: new Date(`${appt.appointment_date}T${appt.end_time}`),
      dentist: appt.dentist_name,
      dentistId: appt.dentist_id,
      procedure: appt.procedure_name,
      procedureId: appt.procedure_id,
      status: appt.status,
      notes: appt.notes,
      date: appt.appointment_date,
      hour: parseInt(appt.start_time.split(':')[0])
    }));

    setState(prev => ({
      ...prev,
      appointments,
      filteredAppointments: appointments,
      showModal: false,
      loading: false
    }));
  } catch (error) {
    console.error('Failed to save appointment:', error);
    setState(prev => ({ ...prev, loading: false }));
    alert(error.response?.data?.error || 'Failed to save appointment');
  }
};

// Handle input changes in the form
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

// Handle time slot selection
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

// Handle appointment cancellation
export const handleCancel = async (id, setState) => {
  if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
  
  try {
    setState(prev => ({ ...prev, loading: true }));
    await api.cancelAppointment(id);
    
    // Refresh appointments
    const appointmentsResponse = await api.getAppointments();
    const appointments = appointmentsResponse.data.data.map(appt => ({
      id: appt.appointment_id,
      title: `${appt.procedure_name} with ${appt.dentist_name}`,
      start: new Date(`${appt.appointment_date}T${appt.start_time}`),
      end: new Date(`${appt.appointment_date}T${appt.end_time}`),
      dentist: appt.dentist_name,
      procedure: appt.procedure_name,
      status: appt.status,
      notes: appt.notes,
      date: appt.appointment_date,
      hour: parseInt(appt.start_time.split(':')[0])
    }));

    setState(prev => ({
      ...prev,
      appointments,
      filteredAppointments: appointments,
      loading: false
    }));
  } catch (error) {
    console.error('Failed to cancel appointment:', error);
    setState(prev => ({ ...prev, loading: false }));
    alert(error.response?.data?.error || 'Failed to cancel appointment');
  }
};

// Handle logout
export const handleLogout = async () => {
  try {
    await api.logout();
    localStorage.removeItem('token');
    window.location.href = '/login';
  } catch (error) {
    console.error('Failed to logout:', error);
    alert('Failed to logout. Please try again.');
  }
};

// Event style getter for calendar
export const eventStyleGetter = (event) => {
  let backgroundColor = '';
  switch(event.status) {
    case 'confirmed': backgroundColor = '#28a745'; break;
    case 'pending': backgroundColor = '#ffc107'; break;
    case 'cancelled': backgroundColor = '#dc3545'; break;
    default: backgroundColor = '#17a2b8';
  }
  
  return {
    style: {
      backgroundColor,
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0px'
    }
  };
};
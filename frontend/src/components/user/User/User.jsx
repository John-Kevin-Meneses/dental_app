import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './User.css';
import apiService from '../../../services/api';
import {
  generateAvailableHours,
  fetchInitialData,
  filterAppointments,
  handleShowModal,
  handleCloseModal,
  handleSubmit,
  handleInputChange,
  handleTimeChange,
  handleCancel,
  handleLogout,
  eventStyleGetter
} from './actions';

const localizer = momentLocalizer(moment);

const UserDashboard = () => {
  const [state, setState] = useState({
    appointments: [],
    filteredAppointments: [],
    showModal: false,
    currentAppointment: null,
    searchTerm: '',
    filterStatus: 'all',
    availableHours: generateAvailableHours(),
    currentView: 'month',
    currentDate: new Date(),
    showProfileDropdown: false,
    dentists: [],
    procedures: [],
    loading: true,
    profileLoading: true,
    error: null
  });

  const [userProfile, setUserProfile] = useState({
    name: "",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    email: "",
    phone: "",
    role: "",
    patientId: null
  });

  useEffect(() => {
    fetchInitialData(apiService, setState, setUserProfile);
  }, []);

  useEffect(() => {
    filterAppointments(state, setState);
  }, [state.searchTerm, state.filterStatus, state.appointments]);

  // Calendar handlers
  const onNavigate = (newDate) => {
    setState(prev => ({ ...prev, currentDate: newDate }));
  };

  const onView = (newView) => {
    setState(prev => ({ ...prev, currentView: newView }));
  };

  // Profile dropdown toggle
  const toggleProfileDropdown = () => {
    setState(prev => ({ ...prev, showProfileDropdown: !prev.showProfileDropdown }));
  };

  const handleEditProfile = () => {
    window.location.href = '/profile/edit';
  };

  if (state.loading && state.profileLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-dashboard">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">DentalCare</a>
          <div className="d-flex align-items-center">
            <div className="dropdown">
              <button 
                className="btn btn-primary dropdown-toggle d-flex align-items-center"
                onClick={toggleProfileDropdown}
              >
                <img 
                  src={userProfile.avatar} 
                  alt="Profile" 
                  className="rounded-circle me-2" 
                  width="32" 
                  height="32"
                />
                {userProfile.name}
              </button>
              {state.showProfileDropdown && (
                <div className="dropdown-menu dropdown-menu-end show">
                  <button className="dropdown-item" onClick={handleEditProfile}>
                    <i className="bi bi-person me-2"></i>Edit Profile
                  </button>
                  <button className="dropdown-item" onClick={() => handleLogout(apiService)}>
                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        {state.error && (
          <div className="alert alert-danger">
            Error: {state.error}
            <button className="btn btn-sm btn-light ms-3" onClick={() => setState(prev => ({ ...prev, error: null }))}>
              Dismiss
            </button>
          </div>
        )}

        <div className="card mb-4 animate-fade-in">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-2 text-center">
                <img 
                  src={userProfile.avatar} 
                  alt="Profile" 
                  className="rounded-circle" 
                  width="100" 
                  height="100"
                />
              </div>
              <div className="col-md-10">
                <h2 className="mb-1">{userProfile.name}</h2>
                <div className="row mt-3">
                  <div className="col-md-4">
                    <p><i className="bi bi-envelope me-2"></i> {userProfile.email}</p>
                  </div>
                  <div className="col-md-4">
                    <p><i className="bi bi-telephone me-2"></i> {userProfile.phone}</p>
                  </div>
                  <div className="col-md-4">
                    <p><i className="bi bi-shield me-2"></i> {userProfile.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-4">
          <div className="search-container flex-grow-1">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search appointments..."
                value={state.searchTerm}
                onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="filter-container">
            <select
              className="form-select"
              value={state.filterStatus}
              onChange={(e) => setState(prev => ({ ...prev, filterStatus: e.target.value }))}
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="ms-auto">
            <button 
              className="btn btn-primary d-flex align-items-center animate-pulse"
              onClick={() => handleShowModal(apiService, state, setState)}
              disabled={state.loading}
            >
              <i className="bi bi-plus-circle me-2"></i>
              New Appointment
            </button>
          </div>
        </div>

        {state.loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row g-4"> 
          <div className="col-lg-6 col-md-12 d-flex"> 
            <div className="card flex-grow-1 animate-fade-in"> 
              <div className="card-body d-flex flex-column"> 
                <h3 className="card-title">Upcoming Appointments</h3>
                <div className="table-responsive flex-grow-1"> 
                  <table className="table table-hover mb-0"> 
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Dentist</th>
                        <th>Procedure</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.filteredAppointments.length > 0 ? (
                        state.filteredAppointments.map((appointment) => (
                          <tr key={appointment.id} className="animate-row">
                            <td>{moment(appointment.start).format('MMM D, YYYY')}</td>
                            <td>{moment(appointment.start).format('h:mm A')}</td>
                            <td>{appointment.dentist}</td>
                            <td>{appointment.procedure}</td>
                            <td>
                              <span className={`badge ${
                                appointment.status === 'scheduled' ? 'bg-info' :
                                appointment.status === 'confirmed' ? 'bg-success' :
                                appointment.status === 'cancelled' ? 'bg-danger' :
                                appointment.status === 'no_show' ? 'bg-warning' :
                                'bg-secondary'
                              }`}>
                                {appointment.status}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => handleShowModal(apiService, state, setState, appointment)}
                                disabled={state.loading}
                              >
                                <i className="bi bi-pencil me-1"></i>Reschedule
                              </button>
                              {appointment.status !== 'cancelled' && (
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleCancel(appointment.id, apiService, setState)}
                                  disabled={state.loading}
                                >
                                  <i className="bi bi-x-circle me-1"></i>Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-4">No appointments found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6 col-md-12 d-flex"> 
            <div className="card flex-grow-1"> 
              <div className="card-body d-flex flex-column">
                <h3 className="card-title">Appointment Calendar</h3>
                <div className="calendar-container flex-grow-1"> 
                  <Calendar
                    localizer={localizer}
                    events={state.filteredAppointments}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }} 
                    defaultView="month"
                    views={['month', 'week', 'day', 'agenda']}
                    view={state.currentView}
                    date={state.currentDate}
                    onNavigate={onNavigate}
                    onView={onView}
                    eventPropGetter={eventStyleGetter}
                    onSelectEvent={(event) => handleShowModal(apiService, state, setState, event)}
                    selectable={true}
                    step={60}
                    timeslots={1}
                    defaultDate={new Date()}
                    min={new Date(0, 0, 0, 8, 0, 0)}
                    max={new Date(0, 0, 0, 17, 0, 0)}
                    toolbar={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {state.showModal && (
        <div className="modal-backdrop fade show" onClick={() => handleCloseModal(setState)}></div>
      )}

      <div className={`modal fade ${state.showModal ? 'show' : ''}`} 
           style={{ display: state.showModal ? 'block' : 'none' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {state.currentAppointment?.id ? 'Reschedule Appointment' : 'Book New Appointment'}
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => handleCloseModal(setState)}
                disabled={state.loading}
              ></button>
            </div>
            <form onSubmit={(e) => handleSubmit(e, apiService, state, setState, userProfile)}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Dentist</label>
                  <select
                    className="form-select"
                    name="dentistId"
                    value={state.currentAppointment?.dentistId || ''}
                    onChange={(e) => handleInputChange(e, state, setState)}
                    required
                  >
                    <option value="">Select a dentist</option>
                    {state.dentists.map(dentist => (
                      <option key={dentist.dentist_id} value={dentist.dentist_id}>
                        {dentist.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Procedure</label>
                  <select
                    className="form-select"
                    name="procedureId"
                    value={state.currentAppointment?.procedureId || ''}
                    onChange={(e) => handleInputChange(e, state, setState)}
                    required
                  >
                    <option value="">Select a procedure</option>
                    {state.procedures.map(procedure => (
                      <option key={procedure.procedure_id} value={procedure.procedure_id}>
                        {procedure.name} ({procedure.duration_minutes} mins)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="date"
                    value={state.currentAppointment?.date || moment().format('YYYY-MM-DD')}
                    onChange={(e) => handleInputChange(e, state, setState)}
                    min={moment().format('YYYY-MM-DD')}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Time Slot</label>
                  <select
                    className="form-select"
                    name="hour"
                    value={state.currentAppointment?.hour || 9}
                    onChange={(e) => handleTimeChange(e, state, setState)}
                    required
                  >
                    {state.availableHours.map(hour => (
                      <option 
                        key={hour.value} 
                        value={hour.value}
                        disabled={hour.disabled}
                      >
                        {hour.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    name="notes"
                    rows="3"
                    value={state.currentAppointment?.notes || ''}
                    onChange={(e) => handleInputChange(e, state, setState)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => handleCloseModal(setState)}
                  disabled={state.loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={state.loading}
                >
                  {state.loading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    <span>{state.currentAppointment?.id ? 'Update' : 'Book'} Appointment</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
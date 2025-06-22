// User.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './User.css';

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
} from '../Login/actions';

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
    profileLoading: true
  });

  const [userProfile, setUserProfile] = useState({
    name: "",
    avatar: "",
    email: "",
    phone: "",
    insurance: ""
  });

  useEffect(() => {
    fetchInitialData(setState, setUserProfile);
  }, []);

  useEffect(() => {
    filterAppointments(state, setState);
  }, [state.searchTerm, state.filterStatus, state.appointments]);

  const onNavigate = (newDate) => {
    setState(prev => ({ ...prev, currentDate: newDate }));
  };

  const onView = (newView) => {
    setState(prev => ({ ...prev, currentView: newView }));
  };

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
      {/* Navbar remains the same */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        {/* ... existing navbar code ... */}
      </nav>

      <div className="container-fluid py-4">
        {/* Profile card remains the same */}
        <div className="card mb-4 animate-fade-in">
          {/* ... existing profile card code ... */}
        </div>

        {/* Search and filter controls */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          <div className="ms-auto">
            <button 
              className="btn btn-primary d-flex align-items-center animate-pulse"
              onClick={() => handleShowModal(state, setState)}
              disabled={state.loading}
            >
              {/* ... button content ... */}
            </button>
          </div>
          
          {/* ... existing search and filter controls ... */}
        </div>

        {/* Main content area */}
        {state.loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row">
            {/* Appointments table */}
            <div className="col-lg-6 col-md-12 mb-4">
              <div className="card h-100 animate-fade-in">
                <div className="card-body">
                  <h3 className="card-title">Upcoming Appointments</h3>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      {/* ... table headers ... */}
                      <tbody>
                        {state.filteredAppointments.length > 0 ? (
                          state.filteredAppointments.map((appointment) => (
                            <tr key={appointment.id} className="animate-row">
                              {/* ... table cells ... */}
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-primary me-2"
                                  onClick={() => handleShowModal(state, setState, appointment)}
                                  disabled={state.loading}
                                >
                                  <i className="bi bi-pencil me-1"></i>Reschedule
                                </button>
                                {appointment.status !== 'cancelled' && (
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleCancel(appointment.id, setState)}
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

            {/* Calendar */}
            <div className="col-lg-6 col-md-12">
              <div className="card h-100">
                <div className="card-body">
                  <h3 className="card-title">Appointment Calendar</h3>
                  <div className="calendar-container">
                    <Calendar
                      localizer={localizer}
                      events={state.filteredAppointments}
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: 500 }}
                      defaultView="month"
                      views={['month', 'week', 'day', 'agenda']}
                      view={state.currentView}
                      date={state.currentDate}
                      onNavigate={onNavigate}
                      onView={onView}
                      eventPropGetter={eventStyleGetter}
                      onSelectEvent={(event) => handleShowModal(state, setState, event)}
                      selectable={true}
                      step={60}
                      timeslots={1}
                      defaultDate={new Date()}
                      min={new Date(0, 0, 0, 9, 0, 0)}
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

      {/* Modal */}
      {state.showModal && (
        <div className="modal-backdrop fade show" onClick={() => handleCloseModal(setState)}></div>
      )}

      <div className={`modal fade ${state.showModal ? 'show' : ''}`} 
           style={{ display: state.showModal ? 'block' : 'none' }}>
        <div className="modal-dialog">
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
            <form onSubmit={(e) => handleSubmit(e, state, setState)}>
              {/* ... modal form content ... */}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
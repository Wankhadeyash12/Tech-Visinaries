// Dashboard Logic for both Organizer and Participant

document.addEventListener('DOMContentLoaded', () => {
  const user = getLoggedInUser();
  
  if (user?.role === 'organizer') {
    setupOrganizerDashboard();
  } else if (user?.role === 'participant') {
    setupParticipantDashboard();
  } else {
    redirectIfNotLoggedIn();
  }
  
  updateNavigation();
});

// ===== ORGANIZER DASHBOARD =====

const setupOrganizerDashboard = async () => {
  try {
    const response = await eventAPI.getOrganizerEvents();
    const events = response.events;

    displayOrganizerEvents(events);
    setupEventActionButtons();
  } catch (error) {
    alert('Error loading events: ' + error.message);
  }
};

const displayOrganizerEvents = (events) => {
  const container = document.getElementById('eventsContainer');
  if (!container) return;

  if (events.length === 0) {
    container.innerHTML = '<p>No events created yet. <a href="/create-event">Create your first event</a></p>';
    return;
  }

  container.innerHTML = events
    .map((event) => {
      const eventDate = new Date(event.eventDateTime).toLocaleDateString();
      const status = event.isPublished ? 'Published' : 'Draft';
      const statusClass = event.isPublished ? 'status-published' : 'status-draft';

      return `
        <div class="event-card">
          <div class="event-card-header">
            <h3>${event.title}</h3>
            <span class="status ${statusClass}">${status}</span>
          </div>
          <p><strong>Date:</strong> ${eventDate}</p>
          <p><strong>Mode:</strong> ${event.eventMode.toUpperCase()}</p>
          <p><strong>Team Size:</strong> ${event.teamMinSize} - ${event.teamMaxSize}</p>
          <p><strong>Registrations:</strong> ${event.totalRegistrations}</p>
          <div class="event-actions">
            ${!event.isPublished ? `
              <button class="btn-publish" onclick="publishEvent('${event._id}')">Publish</button>
            ` : ''}
            <button class="btn-view" onclick="viewEventRegistrations('${event._id}', '${event.title}')">View Registrations</button>
            <button class="btn-analytics" onclick="viewEventAnalytics('${event._id}', '${event.title}')">Analytics</button>
            <button class="btn-edit" onclick="editEvent('${event._id}')">Edit</button>
            <button class="btn-delete" onclick="deleteEvent('${event._id}')">Delete</button>
          </div>
        </div>
      `;
    })
    .join('');
};

const publishEvent = async (eventId) => {
  try {
    await eventAPI.publishEvent(eventId);
    alert('Event published successfully!');
    setupOrganizerDashboard();
  } catch (error) {
    alert('Error publishing event: ' + error.message);
  }
};

const viewEventRegistrations = (eventId, eventTitle) => {
  eventAPI.getEventRegistrations(eventId)
    .then((response) => {
      const registrations = response.registrations;
      displayRegistrationsModal(registrations, eventId, eventTitle);
    })
    .catch((error) => {
      alert('Error loading registrations: ' + error.message);
    });
};

const displayRegistrationsModal = (registrations, eventId, eventTitle) => {
  let modal = document.getElementById('registrationsModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'registrationsModal';
    modal.className = 'modal';
    document.body.appendChild(modal);
  }

  if (registrations.length === 0) {
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close" onclick="document.getElementById('registrationsModal').style.display='none'">&times;</span>
        <h2>Registrations for ${eventTitle}</h2>
        <p>No registrations yet.</p>
      </div>
    `;
  } else {
    const registrationsHTML = registrations
      .map((reg) => `
        <tr>
          <td>${reg.participant.name}</td>
          <td>${reg.participant.email}</td>
          <td>${reg.teamName}</td>
          <td>${reg.teamMembers.length}</td>
          <td>${reg.approvalStatus}</td>
          <td>${reg.paymentStatus}</td>
          <td>
            ${reg.approvalStatus === 'Pending' ? `
              <button onclick="approveRegistration('${reg._id}')" class="btn-approve">Approve</button>
              <button onclick="rejectRegistration('${reg._id}')" class="btn-reject">Reject</button>
            ` : ''}
          </td>
        </tr>
      `)
      .join('');

    modal.innerHTML = `
      <div class="modal-content">
        <span class="close" onclick="document.getElementById('registrationsModal').style.display='none'">&times;</span>
        <h2>Registrations for ${eventTitle}</h2>
        <table class="registrations-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Team Name</th>
              <th>Team Size</th>
              <th>Approval Status</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${registrationsHTML}
          </tbody>
        </table>
      </div>
    `;
  }

  modal.style.display = 'block';
};

const approveRegistration = async (registrationId) => {
  try {
    await registrationAPI.approveRegistration(registrationId);
    alert('Registration approved!');
    // Refresh modal
    document.getElementById('registrationsModal').style.display = 'none';
  } catch (error) {
    alert('Error approving registration: ' + error.message);
  }
};

const rejectRegistration = async (registrationId) => {
  try {
    await registrationAPI.rejectRegistration(registrationId);
    alert('Registration rejected!');
    document.getElementById('registrationsModal').style.display = 'none';
  } catch (error) {
    alert('Error rejecting registration: ' + error.message);
  }
};

const viewEventAnalytics = (eventId, eventTitle) => {
  window.location.href = `/analytics?eventId=${eventId}&eventTitle=${encodeURIComponent(eventTitle)}`;
};

const editEvent = (eventId) => {
  // Implementation for editing event
  alert('Edit functionality to be implemented');
};

const deleteEvent = (eventId) => {
  if (confirm('Are you sure you want to delete this event?')) {
    eventAPI.deleteEvent(eventId)
      .then(() => {
        alert('Event deleted successfully!');
        setupOrganizerDashboard();
      })
      .catch((error) => {
        alert('Error deleting event: ' + error.message);
      });
  }
};

const setupEventActionButtons = () => {
  // Create event button
  const createBtn = document.getElementById('createEventBtn');
  if (createBtn) {
    createBtn.onclick = () => {
      window.location.href = '/create-event';
    };
  }
};

// ===== PARTICIPANT DASHBOARD =====

const setupParticipantDashboard = async () => {
  try {
    const response = await registrationAPI.getParticipantRegistrations();
    const registrations = response.registrations;

    displayParticipantRegistrations(registrations);
  } catch (error) {
    alert('Error loading registrations: ' + error.message);
  }
};

const displayParticipantRegistrations = (registrations) => {
  const container = document.getElementById('registrationsContainer');
  if (!container) return;

  if (registrations.length === 0) {
    container.innerHTML = '<p>You have not registered for any events yet. <a href="/">Browse events</a></p>';
    return;
  }

  container.innerHTML = registrations
    .map((reg) => {
      const eventDate = new Date(reg.event.eventDateTime).toLocaleDateString();
      const approvalClass = `status-${reg.approvalStatus.toLowerCase()}`;
      const paymentClass = `status-${reg.paymentStatus.toLowerCase()}`;

      return `
        <div class="registration-card">
          <div class="registration-header">
            <h3>${reg.event.title}</h3>
          </div>
          <p><strong>Team Name:</strong> ${reg.teamName}</p>
          <p><strong>Team Size:</strong> ${reg.teamMembers.length} members</p>
          <p><strong>Event Date:</strong> ${eventDate}</p>
          <p><strong>Approval Status:</strong> <span class="status ${approvalClass}">${reg.approvalStatus}</span></p>
          <p><strong>Payment Status:</strong> <span class="status ${paymentClass}">${reg.paymentStatus}</span></p>
        </div>
      `;
    })
    .join('');
};

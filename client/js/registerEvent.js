// Event Registration Page Logic

document.addEventListener('DOMContentLoaded', () => {
  redirectIfNotRole('participant');
  setupEventDetailsAndRegistration();
});

const setupEventDetailsAndRegistration = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const eventSlug = urlParams.get('slug');

  if (!eventSlug) {
    alert('Event not found');
    window.location.href = '/';
    return;
  }

  try {
    const response = await eventAPI.getEventBySlug(eventSlug);
    const event = response.event;

    // Display event details
    displayEventDetails(event);

    // Setup registration form
    setupRegistrationForm(event);
  } catch (error) {
    alert('Error loading event: ' + error.message);
    window.location.href = '/';
  }
};

const displayEventDetails = (event) => {
  const container = document.getElementById('eventDetails');
  if (!container) return;

  const eventDate = new Date(event.eventDateTime).toLocaleString();
  const deadlineDate = new Date(event.registrationDeadline).toLocaleString();

  container.innerHTML = `
    <div class="event-header">
      ${event.bannerImage ? `<img src="${event.bannerImage}" alt="${event.title}" class="event-banner">` : ''}
      <h1>${event.title}</h1>
    </div>
    <div class="event-details-section">
      <div class="event-meta">
        <p><strong>Mode:</strong> ${event.eventMode.toUpperCase()}</p>
        <p><strong>Date & Time:</strong> ${eventDate}</p>
        <p><strong>Registration Deadline:</strong> ${deadlineDate}</p>
        <p><strong>Team Size:</strong> ${event.teamMinSize} - ${event.teamMaxSize} members</p>
        <p><strong>Registration Fee:</strong> ₹${event.registrationFee}</p>
      </div>
      
      <div class="event-info">
        <h3>Description</h3>
        <p>${event.description}</p>
        
        ${event.rules ? `<h3>Rules & Guidelines</h3>
        <p>${event.rules}</p>` : ''}
        
        ${event.eventMode === 'offline' || event.eventMode === 'hybrid' 
          ? `<p><strong>Venue:</strong> ${event.venue}</p>` 
          : ''}
        
        ${event.eventMode === 'online' || event.eventMode === 'hybrid' 
          ? `<p><strong>Meeting Link:</strong> <a href="${event.meetingLink}" target="_blank">${event.meetingLink}</a></p>` 
          : ''}
      </div>
      
      <div class="organizer-info">
        <h4>Organized by: ${event.organizer.name}</h4>
        <p>Email: ${event.organizer.email}</p>
      </div>
    </div>
  `;
};

const setupRegistrationForm = (event) => {
  const form = document.getElementById('registrationForm');
  if (!form) return;

  const teamsContainer = document.getElementById('teamMembersContainer');
  
  // Initialize team members input
  updateTeamMemberInputs(event.teamMinSize);

  // Team size change handler
  document.getElementById('teamSize')?.addEventListener('change', (e) => {
    const size = parseInt(e.target.value);
    if (size >= event.teamMinSize && size <= event.teamMaxSize) {
      updateTeamMemberInputs(size);
    } else {
      alert(`Team size must be between ${event.teamMinSize} and ${event.teamMaxSize}`);
      e.target.value = event.teamMinSize;
      updateTeamMemberInputs(event.teamMinSize);
    }
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const teamName = document.getElementById('teamName').value;
    const teamSize = parseInt(document.getElementById('teamSize').value);

    // Validate team size
    if (teamSize < event.teamMinSize || teamSize > event.teamMaxSize) {
      alert(`Team size must be between ${event.teamMinSize} and ${event.teamMaxSize}`);
      return;
    }

    // Collect team members
    const teamMembers = [];
    for (let i = 0; i < teamSize; i++) {
      const name = document.getElementById(`memberName${i}`)?.value;
      const email = document.getElementById(`memberEmail${i}`)?.value;
      
      if (!name || !email) {
        alert('Please fill in all team member details');
        return;
      }
      
      teamMembers.push({ name, email });
    }

    const registrationData = {
      eventSlug: event.slug,
      teamName,
      teamMembers,
    };

    try {
      await registrationAPI.registerForEvent(registrationData);
      alert('Registration successful! Check your dashboard for status.');
      window.location.href = '/participant-dashboard';
    } catch (error) {
      alert('Error registering for event: ' + error.message);
    }
  });
};

const updateTeamMemberInputs = (count) => {
  const container = document.getElementById('teamMembersContainer');
  if (!container) return;

  container.innerHTML = '';
  
  for (let i = 0; i < count; i++) {
    const memberDiv = document.createElement('div');
    memberDiv.className = 'team-member-input';
    memberDiv.innerHTML = `
      <h4>Team Member ${i + 1}</h4>
      <input 
        type="text" 
        id="memberName${i}" 
        placeholder="Name" 
        required
      >
      <input 
        type="email" 
        id="memberEmail${i}" 
        placeholder="Email" 
        required
      >
    `;
    container.appendChild(memberDiv);
  }
};

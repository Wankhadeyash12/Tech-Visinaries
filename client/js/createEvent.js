// Create Event Page Logic

document.addEventListener('DOMContentLoaded', () => {
  redirectIfNotRole('organizer');
  setupCreateEventForm();
});

const setupCreateEventForm = () => {
  const form = document.getElementById('createEventForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const eventData = {
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      rules: document.getElementById('rules').value,
      eventMode: document.getElementById('eventMode').value,
      venue: document.getElementById('venue').value,
      meetingLink: document.getElementById('meetingLink').value,
      eventDateTime: document.getElementById('eventDateTime').value,
      registrationDeadline: document.getElementById('registrationDeadline').value,
      teamMinSize: document.getElementById('teamMinSize').value,
      teamMaxSize: document.getElementById('teamMaxSize').value,
      registrationFee: document.getElementById('registrationFee').value,
    };

    const bannerFile = document.getElementById('banner').files[0];

    try {
      const response = await eventAPI.createEvent(eventData, bannerFile);
      alert('Event created successfully!');
      console.log('Event created:', response);
      window.location.href = '/organizer-dashboard';
    } catch (error) {
      alert('Error creating event: ' + error.message);
    }
  });

  // Show/hide venue or meeting link based on event mode
  const eventMode = document.getElementById('eventMode');
  const venueGroup = document.getElementById('venueGroup');
  const meetingLinkGroup = document.getElementById('meetingLinkGroup');

  if (eventMode) {
    eventMode.addEventListener('change', (e) => {
      const value = e.target.value;
      
      if (value === 'offline') {
        venueGroup.style.display = 'block';
        meetingLinkGroup.style.display = 'none';
      } else if (value === 'online') {
        venueGroup.style.display = 'none';
        meetingLinkGroup.style.display = 'block';
      } else if (value === 'hybrid') {
        venueGroup.style.display = 'block';
        meetingLinkGroup.style.display = 'block';
      }
    });

    // Trigger change event on load
    eventMode.dispatchEvent(new Event('change'));
  }
};

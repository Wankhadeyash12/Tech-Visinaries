// Analytics Page Logic

let analyticsChart = null;

document.addEventListener('DOMContentLoaded', () => {
  redirectIfNotRole('organizer');
  setupAnalyticsPage();
  updateNavigation();
});

const setupAnalyticsPage = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('eventId');

  if (eventId) {
    // Load specific event analytics
    await loadEventAnalytics(eventId);
  } else {
    // Load organizer dashboard analytics
    await loadOrganizerAnalytics();
  }
};

const loadEventAnalytics = async (eventId) => {
  try {
    const response = await analyticsAPI.getEventAnalytics(eventId);
    const analytics = response.analytics;
    const eventTitle = new URLSearchParams(window.location.search).get('eventTitle');

    displayEventAnalytics(analytics, eventTitle);
  } catch (error) {
    alert('Error loading analytics: ' + error.message);
  }
};

const displayEventAnalytics = (analytics, eventTitle) => {
  const container = document.getElementById('analyticsContainer');
  if (!container) return;

  const { totalRegistrations, registrationsPerDay, approvalStats, totalRevenue, pendingRevenue } =
    analytics;

  container.innerHTML = `
    <h2>Analytics - ${eventTitle || 'Event'}</h2>
    
    <div class="analytics-summary">
      <div class="summary-card">
        <h4>Total Registrations</h4>
        <p class="big-number">${totalRegistrations}</p>
      </div>
      
      <div class="summary-card">
        <h4>Total Revenue</h4>
        <p class="big-number">₹${totalRevenue}</p>
      </div>
      
      <div class="summary-card">
        <h4>Pending Revenue</h4>
        <p class="big-number">₹${pendingRevenue}</p>
      </div>
      
      <div class="summary-card">
        <h4>Approved</h4>
        <p class="big-number">${approvalStats.approved}</p>
      </div>
      
      <div class="summary-card">
        <h4>Pending Approval</h4>
        <p class="big-number">${approvalStats.pending}</p>
      </div>
      
      <div class="summary-card">
        <h4>Rejected</h4>
        <p class="big-number">${approvalStats.rejected}</p>
      </div>
    </div>
    
    <div class="charts-container">
      <div class="chart-wrapper">
        <canvas id="lineChart"></canvas>
      </div>
      
      <div class="chart-wrapper">
        <canvas id="pieChart"></canvas>
      </div>
    </div>
  `;

  // Draw charts
  drawLineChart(registrationsPerDay);
  drawPieChart(approvalStats);
};

const loadOrganizerAnalytics = async () => {
  try {
    const response = await analyticsAPI.getOrganizerDashboardAnalytics();
    const { summary, events } = response;

    displayOrganizerAnalytics(summary, events);
  } catch (error) {
    alert('Error loading analytics: ' + error.message);
  }
};

const displayOrganizerAnalytics = (summary, events) => {
  const container = document.getElementById('analyticsContainer');
  if (!container) return;

  container.innerHTML = `
    <h2>Dashboard Analytics</h2>
    
    <div class="analytics-summary">
      <div class="summary-card">
        <h4>Total Events</h4>
        <p class="big-number">${summary.totalEvents}</p>
      </div>
      
      <div class="summary-card">
        <h4>Total Registrations</h4>
        <p class="big-number">${summary.totalRegistrations}</p>
      </div>
      
      <div class="summary-card">
        <h4>Total Revenue</h4>
        <p class="big-number">₹${summary.totalRevenue}</p>
      </div>
      
      <div class="summary-card">
        <h4>Pending Revenue</h4>
        <p class="big-number">₹${summary.pendingRevenue}</p>
      </div>
    </div>
    
    <div class="events-analytics">
      <h3>Event-wise Analytics</h3>
      <table class="analytics-table">
        <thead>
          <tr>
            <th>Event</th>
            <th>Registrations</th>
            <th>Approved</th>
            <th>Rejected</th>
            <th>Revenue</th>
            <th>Pending Revenue</th>
          </tr>
        </thead>
        <tbody>
          ${events
            .map(
              (event) => `
            <tr>
              <td>${event.title}</td>
              <td>${event.totalRegistrations}</td>
              <td>${event.approvalStats.approved}</td>
              <td>${event.approvalStats.rejected}</td>
              <td>₹${event.totalRevenue}</td>
              <td>₹${event.pendingRevenue}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
};

const drawLineChart = (registrationsPerDay) => {
  const ctx = document.getElementById('lineChart');
  if (!ctx) return;

  const dates = Object.keys(registrationsPerDay).sort();
  const data = dates.map((date) => registrationsPerDay[date]);

  if (analyticsChart) {
    analyticsChart.destroy();
  }

  analyticsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Registrations per Day',
          data: data,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Registrations Over Time',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
};

const drawPieChart = (approvalStats) => {
  const ctx = document.getElementById('pieChart');
  if (!ctx) return;

  if (analyticsChart) {
    analyticsChart.destroy();
  }

  analyticsChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Approved', 'Rejected', 'Pending'],
      datasets: [
        {
          data: [
            approvalStats.approved,
            approvalStats.rejected,
            approvalStats.pending,
          ],
          backgroundColor: ['#2ecc71', '#e74c3c', '#f39c12'],
          borderColor: ['#27ae60', '#c0392b', '#d68910'],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Registration Approval Status',
        },
      },
    },
  });
};

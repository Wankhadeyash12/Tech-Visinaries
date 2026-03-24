const Registration = require('../models/Registration');
const Event = require('../models/Event');

const getAnalyticsData = async (eventId) => {
  try {
    // Total registrations count
    const totalRegistrations = await Registration.countDocuments({
      event: eventId,
    });

    // Get all registrations for the event
    const registrations = await Registration.find({ event: eventId })
      .populate('event')
      .exec();

    // Registrations per day
    const registrationsPerDay = {};
    registrations.forEach((reg) => {
      const date = new Date(reg.registeredAt).toLocaleDateString();
      registrationsPerDay[date] = (registrationsPerDay[date] || 0) + 1;
    });

    // Approval vs rejection ratio
    const approvalStats = {
      approved: registrations.filter((r) => r.approvalStatus === 'Approved').length,
      rejected: registrations.filter((r) => r.approvalStatus === 'Rejected').length,
      pending: registrations.filter((r) => r.approvalStatus === 'Pending').length,
    };

    // Total revenue collected
    const totalRevenue = registrations.reduce((sum, reg) => {
      if (reg.paymentStatus === 'Completed') {
        return sum + (reg.registrationFee || 0);
      }
      return sum;
    }, 0);

    const pendingRevenue = registrations.reduce((sum, reg) => {
      if (reg.paymentStatus === 'Pending') {
        return sum + (reg.registrationFee || 0);
      }
      return sum;
    }, 0);

    return {
      totalRegistrations,
      registrationsPerDay,
      approvalStats,
      totalRevenue,
      pendingRevenue,
    };
  } catch (error) {
    throw new Error(`Analytics calculation error: ${error.message}`);
  }
};

module.exports = {
  getAnalyticsData,
};

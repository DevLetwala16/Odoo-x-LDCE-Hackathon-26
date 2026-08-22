import api from './api';

const calendarService = {
  getCalendarTrips: async (month) => {
    // month format should be YYYY-MM
    const response = await api.get(`/calendar?month=${month}`);
    return response.data;
  },
};

export default calendarService;

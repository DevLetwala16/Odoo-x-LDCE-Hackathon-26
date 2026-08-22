import api from './api';

const weatherService = {
  getCityWeather: async (cityName) => {
    const response = await api.get(`/weather/${encodeURIComponent(cityName)}`);
    return response.data;
  },
};

export default weatherService;

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import City from '../models/City.js';
import Activity from '../models/Activity.js';
import '../config/env.js';

const cities = [
  { name: 'Paris', country: 'France', region: 'Europe', costIndex: 5, popularity: 100, description: 'The city of light.', latitude: 48.8566, longitude: 2.3522 },
  { name: 'Tokyo', country: 'Japan', region: 'Asia', costIndex: 4, popularity: 98, description: 'Bustling metropolis.', latitude: 35.6762, longitude: 139.6503 },
  { name: 'New York', country: 'USA', region: 'North America', costIndex: 5, popularity: 95, description: 'The Big Apple.', latitude: 40.7128, longitude: -74.0060 },
  { name: 'Rome', country: 'Italy', region: 'Europe', costIndex: 4, popularity: 92, description: 'The Eternal City.', latitude: 41.9028, longitude: 12.4964 },
  { name: 'Bangkok', country: 'Thailand', region: 'Asia', costIndex: 2, popularity: 90, description: 'Vibrant street life.', latitude: 13.7563, longitude: 100.5018 },
  { name: 'London', country: 'UK', region: 'Europe', costIndex: 5, popularity: 96, description: 'Historic capital.', latitude: 51.5074, longitude: -0.1278 },
  { name: 'Dubai', country: 'UAE', region: 'Middle East', costIndex: 4, popularity: 88, description: 'Luxury and modern architecture.', latitude: 25.2048, longitude: 55.2708 },
  { name: 'Singapore', country: 'Singapore', region: 'Asia', costIndex: 5, popularity: 85, description: 'Clean and green city-state.', latitude: 1.3521, longitude: 103.8198 },
  { name: 'Barcelona', country: 'Spain', region: 'Europe', costIndex: 4, popularity: 89, description: 'Gaudí architecture.', latitude: 41.3851, longitude: 2.1734 },
  { name: 'Istanbul', country: 'Turkey', region: 'Europe/Asia', costIndex: 3, popularity: 87, description: 'Where east meets west.', latitude: 41.0082, longitude: 28.9784 },
  { name: 'Bali', country: 'Indonesia', region: 'Asia', costIndex: 2, popularity: 94, description: 'Island of the gods.', latitude: -8.3405, longitude: 115.0920 },
  { name: 'Kyoto', country: 'Japan', region: 'Asia', costIndex: 4, popularity: 86, description: 'Ancient temples and shrines.', latitude: 35.0116, longitude: 135.7681 },
  { name: 'Sydney', country: 'Australia', region: 'Oceania', costIndex: 5, popularity: 84, description: 'Harbour city.', latitude: -33.8688, longitude: 151.2093 },
  { name: 'Rio de Janeiro', country: 'Brazil', region: 'South America', costIndex: 3, popularity: 82, description: 'Carnival and beaches.', latitude: -22.9068, longitude: -43.1729 },
  { name: 'Cape Town', country: 'South Africa', region: 'Africa', costIndex: 3, popularity: 81, description: 'Table Mountain views.', latitude: -33.9249, longitude: 18.4241 },
  { name: 'Prague', country: 'Czech Republic', region: 'Europe', costIndex: 3, popularity: 83, description: 'City of a hundred spires.', latitude: 50.0755, longitude: 14.4378 },
  { name: 'Amsterdam', country: 'Netherlands', region: 'Europe', costIndex: 4, popularity: 88, description: 'Canals and bicycles.', latitude: 52.3676, longitude: 4.9041 },
  { name: 'Seoul', country: 'South Korea', region: 'Asia', costIndex: 4, popularity: 85, description: 'Dynamic and modern.', latitude: 37.5665, longitude: 126.9780 },
  { name: 'Mexico City', country: 'Mexico', region: 'North America', costIndex: 2, popularity: 80, description: 'Rich history and cuisine.', latitude: 19.4326, longitude: -99.1332 },
  { name: 'Mumbai', country: 'India', region: 'Asia', costIndex: 2, popularity: 78, description: 'City of dreams.', latitude: 19.0760, longitude: 72.8777 },
];

const generateActivities = (cityId, cityName) => [
  { name: `${cityName} City Tour`, category: 'sightseeing', city: cityId, estimatedCost: 2000, duration: 180, rating: 4.5 },
  { name: `Traditional Food Tasting in ${cityName}`, category: 'food', city: cityId, estimatedCost: 1500, duration: 120, rating: 4.7 },
  { name: `Museum Visit in ${cityName}`, category: 'culture', city: cityId, estimatedCost: 1000, duration: 150, rating: 4.2 },
  { name: `Evening Walk around ${cityName}`, category: 'relaxation', city: cityId, estimatedCost: 0, duration: 60, rating: 4.0 },
  { name: `Local Market Shopping in ${cityName}`, category: 'shopping', city: cityId, estimatedCost: 3000, duration: 120, rating: 4.3 },
];

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

    // Clear existing data
    await City.deleteMany({});
    await Activity.deleteMany({});
    console.log('Cleared existing cities and activities');

    // Insert cities
    const insertedCities = await City.insertMany(cities);
    console.log(`Inserted ${insertedCities.length} cities`);

    // Generate and insert activities for each city
    const allActivities = [];
    insertedCities.forEach(city => {
      allActivities.push(...generateActivities(city._id, city.name));
    });

    const insertedActivities = await Activity.insertMany(allActivities);
    console.log(`Inserted ${insertedActivities.length} activities`);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

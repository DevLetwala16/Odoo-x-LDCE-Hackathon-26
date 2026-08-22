import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import City from '../models/City.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import '../config/env.js';

/* ────────────────────────────────────────────────
   Global Cities across all Major Countries & Continents
   ──────────────────────────────────────────────── */
const cities = [
  // ── India (Asia) ──
  {
    name: 'Delhi',
    country: 'India',
    region: 'Asia',
    costIndex: 2,
    popularity: 97,
    description: 'India\'s historic capital — bustling bazaars, Mughal architecture, world-class street food, and historic monuments.',
    latitude: 28.6139,
    longitude: 77.2090,
    imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80',
  },
  {
    name: 'Mumbai',
    country: 'India',
    region: 'Asia',
    costIndex: 3,
    popularity: 96,
    description: 'The City of Dreams — vibrant coastal metropolis, Gateway of India, Bollywood, and lively Marine Drive.',
    latitude: 19.0760,
    longitude: 72.8777,
    imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80',
  },
  {
    name: 'Jaipur',
    country: 'India',
    region: 'Asia',
    costIndex: 2,
    popularity: 94,
    description: 'The Pink City of Rajasthan — grand royal palaces, majestic forts, colorful textiles, and rich heritage.',
    latitude: 26.9124,
    longitude: 75.7873,
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80',
  },
  {
    name: 'Goa',
    country: 'India',
    region: 'Asia',
    costIndex: 2,
    popularity: 98,
    description: 'Sun, sand, and sea — tropical beaches, Portuguese heritage architecture, water sports, and vibrant nightlife.',
    latitude: 15.2993,
    longitude: 74.1240,
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
  },
  {
    name: 'Varanasi',
    country: 'India',
    region: 'Asia',
    costIndex: 1,
    popularity: 90,
    description: 'One of the world\'s oldest living cities — spiritual ghats along the sacred Ganges, evening Aarti, and silk weaving.',
    latitude: 25.3176,
    longitude: 82.9739,
    imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80',
  },
  {
    name: 'Bengaluru',
    country: 'India',
    region: 'Asia',
    costIndex: 3,
    popularity: 88,
    description: 'The Garden City and tech capital — lush public parks, royal palaces, craft microbreweries, and lively cafe culture.',
    latitude: 12.9716,
    longitude: 77.5946,
    imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&q=80',
  },

  // ── France (Europe) ──
  {
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    costIndex: 5,
    popularity: 100,
    description: 'The city of light — romance, world-famous art museums, haute cuisine, and the iconic Eiffel Tower.',
    latitude: 48.8566,
    longitude: 2.3522,
    imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80',
  },
  {
    name: 'Nice',
    country: 'France',
    region: 'Europe',
    costIndex: 4,
    popularity: 87,
    description: 'Capital of the French Riviera — Mediterranean coastline, Promenade des Anglais, and colorful Old Town.',
    latitude: 43.7102,
    longitude: 7.2620,
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80',
  },

  // ── Italy (Europe) ──
  {
    name: 'Rome',
    country: 'Italy',
    region: 'Europe',
    costIndex: 4,
    popularity: 96,
    description: 'The Eternal City — millennia of ancient Roman history, Vatican City, world-class pasta, and baroque fountains.',
    latitude: 41.9028,
    longitude: 12.4964,
    imageUrl: 'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=800&q=80',
  },
  {
    name: 'Venice',
    country: 'Italy',
    region: 'Europe',
    costIndex: 5,
    popularity: 93,
    description: 'The floating city — romantic gondola canals, grand palaces, St. Mark\'s Basilica, and artisan glassblowing.',
    latitude: 45.4408,
    longitude: 12.3155,
    imageUrl: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800&q=80',
  },
  {
    name: 'Florence',
    country: 'Italy',
    region: 'Europe',
    costIndex: 4,
    popularity: 91,
    description: 'Cradle of the Renaissance — world-famous art galleries, the terracotta Duomo, and Tuscan wine and cuisine.',
    latitude: 43.7696,
    longitude: 11.2558,
    imageUrl: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=800&q=80',
  },

  // ── United Kingdom (Europe) ──
  {
    name: 'London',
    country: 'United Kingdom',
    region: 'Europe',
    costIndex: 5,
    popularity: 99,
    description: 'Historic capital blending royal heritage, world-class museums, West End theaters, and vibrant street culture.',
    latitude: 51.5074,
    longitude: -0.1278,
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
  },
  {
    name: 'Edinburgh',
    country: 'United Kingdom',
    region: 'Europe',
    costIndex: 4,
    popularity: 88,
    description: 'Scotland\'s historic capital — dramatic clifftop castle, cobblestone Royal Mile, and world-renowned festivals.',
    latitude: 55.9533,
    longitude: -3.1883,
    imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80',
  },

  // ── United States (Americas) ──
  {
    name: 'New York',
    country: 'United States',
    region: 'Americas',
    costIndex: 5,
    popularity: 99,
    description: 'The city that never sleeps — iconic skyscrapers, Broadway shows, Central Park, and global gastronomy.',
    latitude: 40.7128,
    longitude: -74.0060,
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
  },
  {
    name: 'San Francisco',
    country: 'United States',
    region: 'Americas',
    costIndex: 5,
    popularity: 92,
    description: 'Golden Gate Bridge, historic cable cars, Victorian houses, vibrant tech hub, and bay views.',
    latitude: 37.7749,
    longitude: -122.4194,
    imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80',
  },
  {
    name: 'Los Angeles',
    country: 'United States',
    region: 'Americas',
    costIndex: 4,
    popularity: 95,
    description: 'Entertainment capital of the world — Hollywood glamour, Santa Monica beaches, and iconic palm-lined streets.',
    latitude: 34.0522,
    longitude: -118.2437,
    imageUrl: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=800&q=80',
  },
  {
    name: 'Miami',
    country: 'United States',
    region: 'Americas',
    costIndex: 4,
    popularity: 90,
    description: 'Sun-soaked tropical city — pastel Art Deco architecture, glamorous South Beach, and vibrant nightlife.',
    latitude: 25.7617,
    longitude: -80.1918,
    imageUrl: 'https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=800&q=80',
  },

  // ── Japan (Asia) ──
  {
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    costIndex: 4,
    popularity: 99,
    description: 'Hyper-modern metropolis where ancient shrines coexist with neon skyscrapers and Michelin culinary culture.',
    latitude: 35.6762,
    longitude: 139.6503,
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  },
  {
    name: 'Kyoto',
    country: 'Japan',
    region: 'Asia',
    costIndex: 4,
    popularity: 94,
    description: 'Historic heart of Japan — 1,000+ temples, zen gardens, traditional tea houses, and geisha quarters.',
    latitude: 35.0116,
    longitude: 135.7681,
    imageUrl: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800&q=80',
  },
  {
    name: 'Osaka',
    country: 'Japan',
    region: 'Asia',
    costIndex: 3,
    popularity: 89,
    description: 'Japan\'s street food haven — neon-lit Dotonbori canals, historic castle, and friendly urban culture.',
    latitude: 34.6937,
    longitude: 135.5023,
    imageUrl: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&q=80',
  },

  // ── United Arab Emirates (Middle East) ──
  {
    name: 'Dubai',
    country: 'United Arab Emirates',
    region: 'Middle East',
    costIndex: 5,
    popularity: 98,
    description: 'City of superlatives — world\'s tallest Burj Khalifa, luxury shopping, desert safaris, and man-made islands.',
    latitude: 25.2048,
    longitude: 55.2708,
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
  },
  {
    name: 'Abu Dhabi',
    country: 'United Arab Emirates',
    region: 'Middle East',
    costIndex: 4,
    popularity: 88,
    description: 'Majestic capital featuring the breathtaking Sheikh Zayed Grand Mosque, Louvre museum, and luxury islands.',
    latitude: 24.4539,
    longitude: 54.3773,
    imageUrl: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80',
  },

  // ── Spain (Europe) ──
  {
    name: 'Barcelona',
    country: 'Spain',
    region: 'Europe',
    costIndex: 4,
    popularity: 95,
    description: 'Gaudí\'s architectural wonderland — Sagrada Familia, vibrant beachfront, Gothic quarters, and tapas bars.',
    latitude: 41.3851,
    longitude: 2.1734,
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
  },
  {
    name: 'Madrid',
    country: 'Spain',
    region: 'Europe',
    costIndex: 3,
    popularity: 91,
    description: 'Royal capital brimming with world-class art museums, grand plazas, Retiro Park, and lively night culture.',
    latitude: 40.4168,
    longitude: -3.7038,
    imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80',
  },

  // ── Germany (Europe) ──
  {
    name: 'Berlin',
    country: 'Germany',
    region: 'Europe',
    costIndex: 3,
    popularity: 92,
    description: 'Dynamic cultural capital — iconic Brandenburg Gate, Berlin Wall art, Museum Island, and indie cafes.',
    latitude: 52.5200,
    longitude: 13.4050,
    imageUrl: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80',
  },
  {
    name: 'Munich',
    country: 'Germany',
    region: 'Europe',
    costIndex: 4,
    popularity: 89,
    description: 'Bavarian gem — historic Marienplatz, fairy-tale castle gateway, beer gardens, and engineering museums.',
    latitude: 48.1351,
    longitude: 11.5820,
    imageUrl: 'https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800&q=80',
  },

  // ── Switzerland (Europe) ──
  {
    name: 'Zurich',
    country: 'Switzerland',
    region: 'Europe',
    costIndex: 5,
    popularity: 90,
    description: 'Gleaming lakeside city — Alpine views, historic Old Town, pristine waters, and artisan Swiss chocolates.',
    latitude: 47.3769,
    longitude: 8.5417,
    imageUrl: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800&q=80',
  },
  {
    name: 'Lucerne',
    country: 'Switzerland',
    region: 'Europe',
    costIndex: 5,
    popularity: 89,
    description: 'Picturesque mountain town — wooden Chapel Bridge, stunning Lake Lucerne, and direct gateway to Mount Pilatus.',
    latitude: 47.0502,
    longitude: 8.3093,
    imageUrl: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=800&q=80',
  },

  // ── Australia (Oceania) ──
  {
    name: 'Sydney',
    country: 'Australia',
    region: 'Oceania',
    costIndex: 4,
    popularity: 96,
    description: 'Harbour city icon — Sydney Opera House, Harbour Bridge, Bondi Beach surf, and coastal walks.',
    latitude: -33.8688,
    longitude: 151.2093,
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80',
  },
  {
    name: 'Melbourne',
    country: 'Australia',
    region: 'Oceania',
    costIndex: 4,
    popularity: 91,
    description: 'Cultural & coffee capital — famous graffiti laneways, world-class dining, tramways, and Great Ocean Road.',
    latitude: -37.8136,
    longitude: 144.9631,
    imageUrl: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800&q=80',
  },

  // ── Canada (Americas) ──
  {
    name: 'Toronto',
    country: 'Canada',
    region: 'Americas',
    costIndex: 4,
    popularity: 93,
    description: 'Canada\'s dynamic metropolis — CN Tower, multicultural neighborhoods, and scenic gateway to Niagara Falls.',
    latitude: 43.6532,
    longitude: -79.3832,
    imageUrl: 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=800&q=80',
  },
  {
    name: 'Vancouver',
    country: 'Canada',
    region: 'Americas',
    costIndex: 5,
    popularity: 92,
    description: 'Spectacular mountain and ocean paradise — Stanley Park seawall, Capilano suspension bridge, and outdoor adventures.',
    latitude: 49.2827,
    longitude: -123.1207,
    imageUrl: 'https://images.unsplash.com/photo-1559511260-66a65e0982d5?w=800&q=80',
  },

  // ── Thailand (Asia) ──
  {
    name: 'Bangkok',
    country: 'Thailand',
    region: 'Asia',
    costIndex: 2,
    popularity: 96,
    description: 'Vibrant street food paradise — golden ornate temples, bustling river canals, and lively night markets.',
    latitude: 13.7563,
    longitude: 100.5018,
    imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
  },
  {
    name: 'Phuket',
    country: 'Thailand',
    region: 'Asia',
    costIndex: 2,
    popularity: 94,
    description: 'Tropical island getaway — limestone karst bays, crystal clear waters, Big Buddha, and beach resorts.',
    latitude: 7.8804,
    longitude: 98.3923,
    imageUrl: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80',
  },

  // ── Indonesia (Asia) ──
  {
    name: 'Bali',
    country: 'Indonesia',
    region: 'Asia',
    costIndex: 2,
    popularity: 98,
    description: 'Island of the Gods — emerald terraced rice fields, ancient Hindu temples, volcanic surf beaches, and yoga retreats.',
    latitude: -8.3405,
    longitude: 115.0920,
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
  },

  // ── Singapore (Asia) ──
  {
    name: 'Singapore',
    country: 'Singapore',
    region: 'Asia',
    costIndex: 5,
    popularity: 95,
    description: 'Futuristic garden city — glowing Supertree Grove, Marina Bay Sands infinity pool, and Michelin hawker foods.',
    latitude: 1.3521,
    longitude: 103.8198,
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
  },

  // ── South Korea (Asia) ──
  {
    name: 'Seoul',
    country: 'South Korea',
    region: 'Asia',
    costIndex: 3,
    popularity: 94,
    description: 'K-culture powerhouse — royal Joseon palaces, futuristic Dongdaemun Design Plaza, and sizzling Korean BBQ.',
    latitude: 37.5665,
    longitude: 126.9780,
    imageUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&q=80',
  },

  // ── Netherlands (Europe) ──
  {
    name: 'Amsterdam',
    country: 'Netherlands',
    region: 'Europe',
    costIndex: 4,
    popularity: 93,
    description: 'Canal ring wonderland — world-famous Van Gogh & Rijksmuseum, bicycle-friendly streets, and historic bridges.',
    latitude: 52.3676,
    longitude: 4.9041,
    imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80',
  },

  // ── Greece (Europe) ──
  {
    name: 'Athens',
    country: 'Greece',
    region: 'Europe',
    costIndex: 3,
    popularity: 92,
    description: 'Birthplace of democracy — the ancient Acropolis & Parthenon towering over vibrant taverna-filled neighborhoods.',
    latitude: 37.9838,
    longitude: 23.7275,
    imageUrl: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800&q=80',
  },
  {
    name: 'Santorini',
    country: 'Greece',
    region: 'Europe',
    costIndex: 5,
    popularity: 97,
    description: 'Whitewashed paradise — blue-domed churches perched on volcanic caldera cliffs with world-famous sunsets.',
    latitude: 36.3932,
    longitude: 25.4615,
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
  },

  // ── Egypt (Africa & Middle East) ──
  {
    name: 'Cairo',
    country: 'Egypt',
    region: 'Africa',
    costIndex: 1,
    popularity: 92,
    description: 'Land of the Pharaohs — the Great Pyramids of Giza, the Sphinx, historic mosques, and ancient Nile cruises.',
    latitude: 30.0444,
    longitude: 31.2357,
    imageUrl: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&q=80',
  },

  // ── South Africa (Africa) ──
  {
    name: 'Cape Town',
    country: 'South Africa',
    region: 'Africa',
    costIndex: 2,
    popularity: 93,
    description: 'Where mountains meet two oceans — iconic Table Mountain, penguin beaches, scenic coastal drives, and vineyards.',
    latitude: -33.9249,
    longitude: 18.4241,
    imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&q=80',
  },

  // ── Brazil (Americas) ──
  {
    name: 'Rio de Janeiro',
    country: 'Brazil',
    region: 'Americas',
    costIndex: 2,
    popularity: 95,
    description: 'The Marvelous City — Christ the Redeemer, golden Copacabana sands, Sugarloaf Mountain cable cars, and samba.',
    latitude: -22.9068,
    longitude: -43.1729,
    imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80',
  },

  // ── Turkey (Europe/Asia) ──
  {
    name: 'Istanbul',
    country: 'Turkey',
    region: 'Europe/Asia',
    costIndex: 2,
    popularity: 95,
    description: 'Where continents collide — historic Hagia Sophia, Blue Mosque, bustling Grand Bazaar, and Bosphorus Strait.',
    latitude: 41.0082,
    longitude: 28.9784,
    imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
  },
  {
    name: 'Cappadocia',
    country: 'Turkey',
    region: 'Europe/Asia',
    costIndex: 3,
    popularity: 93,
    description: 'Fairy-tale landscape — sunrise hot air balloon rides over whimsical rock valleys and ancient underground cities.',
    latitude: 38.6431,
    longitude: 34.8289,
    imageUrl: 'https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?w=800&q=80',
  },

  // ── New Zealand (Oceania) ──
  {
    name: 'Queenstown',
    country: 'New Zealand',
    region: 'Oceania',
    costIndex: 4,
    popularity: 92,
    description: 'Adventure capital of the world — alpine lakes, Southern Alps, bungy jumping, jet boating, and Milford Sound.',
    latitude: -45.0312,
    longitude: 168.6626,
    imageUrl: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=800&q=80',
  }
];

/* ────────────────────────────────────────────────
   Activities for Cities
   ──────────────────────────────────────────────── */
const activityTemplates = [
  { name: 'Historic Landmarks & Heritage Walking Tour', category: 'sightseeing', baseCost: 1200, duration: 180, rating: 4.8 },
  { name: 'Famous Local Cuisine & Street Food Crawl', category: 'food', baseCost: 800, duration: 120, rating: 4.9 },
  { name: 'Panoramic Sunset Viewpoint & Skydeck', category: 'sightseeing', baseCost: 1500, duration: 90, rating: 4.7 },
  { name: 'National Museum & Cultural Treasures Guided Tour', category: 'culture', baseCost: 600, duration: 150, rating: 4.6 },
  { name: 'Scenic Boat & Waterfront Cruise Experience', category: 'adventure', baseCost: 2000, duration: 120, rating: 4.8 },
  { name: 'Traditional Artisan Markets & Souvenirs Shopping', category: 'shopping', baseCost: 500, duration: 120, rating: 4.5 },
];

/* ────────────────────────────────────────────────
   Seed Runner
   ──────────────────────────────────────────────── */
export const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🔄 Seeding database with comprehensive Countries & Cities...');

    // Clear existing cities and activities to ensure fresh up-to-date data
    await City.deleteMany({});
    await Activity.deleteMany({});

    const createdCities = await City.insertMany(cities);
    console.log(`✅ Seeded ${createdCities.length} major cities across all continents.`);

    const activitiesToInsert = [];

    for (const city of createdCities) {
      for (const tpl of activityTemplates) {
        activitiesToInsert.push({
          city: city._id,
          name: `${city.name}: ${tpl.name}`,
          description: `Experience the best of ${city.name}, ${city.country} with an expert curated ${tpl.category} activity.`,
          category: tpl.category,
          estimatedCost: Math.round(tpl.baseCost * (city.costIndex * 0.4 + 0.6)),
          duration: tpl.duration,
          rating: Number((tpl.rating - (Math.random() * 0.3)).toFixed(1)),
          imageUrl: city.imageUrl,
          isGlobal: true,
        });
      }
    }

    const createdActivities = await Activity.insertMany(activitiesToInsert);
    console.log(`✅ Seeded ${createdActivities.length} curated activities across all cities.`);

    console.log('🎉 Database seeding complete with global countries and top cities!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
};

// If run directly via node seedData.js
if (process.argv[1]?.includes('seedData.js')) {
  seedDatabase().then(() => process.exit(0));
}

export default seedDatabase;

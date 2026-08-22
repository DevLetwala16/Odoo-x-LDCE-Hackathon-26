import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import City from '../models/City.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import '../config/env.js';

/* ────────────────────────────────────────────────
   20 cities across multiple regions
   ──────────────────────────────────────────────── */
const cities = [
  // Europe
  {
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    costIndex: 5,
    popularity: 100,
    description: 'The city of light — romance, art, haute cuisine, and the iconic Eiffel Tower.',
    latitude: 48.8566,
    longitude: 2.3522,
    imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80',
  },
  {
    name: 'Rome',
    country: 'Italy',
    region: 'Europe',
    costIndex: 4,
    popularity: 92,
    description: 'The Eternal City — millennia of history, world-class cuisine, and baroque fountains.',
    latitude: 41.9028,
    longitude: 12.4964,
    imageUrl: 'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=800&q=80',
  },
  {
    name: 'London',
    country: 'UK',
    region: 'Europe',
    costIndex: 5,
    popularity: 96,
    description: 'Historic capital blending royal heritage, world-class museums, and vibrant street culture.',
    latitude: 51.5074,
    longitude: -0.1278,
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
  },
  {
    name: 'Barcelona',
    country: 'Spain',
    region: 'Europe',
    costIndex: 4,
    popularity: 89,
    description: 'Modernist masterpieces meet vibrant beach culture and world-famous tapas bars.',
    latitude: 41.3851,
    longitude: 2.1734,
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
  },
  {
    name: 'Prague',
    country: 'Czech Republic',
    region: 'Europe',
    costIndex: 3,
    popularity: 83,
    description: 'City of a hundred spires — fairy-tale Gothic architecture and legendary Czech beer.',
    latitude: 50.0755,
    longitude: 14.4378,
    imageUrl: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80',
  },
  {
    name: 'Amsterdam',
    country: 'Netherlands',
    region: 'Europe',
    costIndex: 4,
    popularity: 88,
    description: 'Canals, bicycles, world-class museums, and a uniquely liberal spirit.',
    latitude: 52.3676,
    longitude: 4.9041,
    imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80',
  },
  {
    name: 'Istanbul',
    country: 'Turkey',
    region: 'Europe/Asia',
    costIndex: 3,
    popularity: 87,
    description: 'Where East meets West — minarets, spice bazaars, and the glittering Bosphorus.',
    latitude: 41.0082,
    longitude: 28.9784,
    imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
  },

  // Asia
  {
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    costIndex: 4,
    popularity: 98,
    description: 'Hyper-modern metropolis where ancient shrines coexist with neon-lit skyscrapers.',
    latitude: 35.6762,
    longitude: 139.6503,
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  },
  {
    name: 'Kyoto',
    country: 'Japan',
    region: 'Asia',
    costIndex: 4,
    popularity: 86,
    description: 'Ancient temples, zen gardens, geisha districts, and breathtaking cherry blossoms.',
    latitude: 35.0116,
    longitude: 135.7681,
    imageUrl: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800&q=80',
  },
  {
    name: 'Bangkok',
    country: 'Thailand',
    region: 'Asia',
    costIndex: 2,
    popularity: 90,
    description: 'Vibrant street food, ornate temples, rooftop bars, and buzzing night markets.',
    latitude: 13.7563,
    longitude: 100.5018,
    imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    region: 'Asia',
    costIndex: 2,
    popularity: 94,
    description: 'Island of the gods — terraced rice fields, Hindu temples, surf beaches, and yoga retreats.',
    latitude: -8.3405,
    longitude: 115.0920,
    imageUrl: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&q=80',
  },
  {
    name: 'Singapore',
    country: 'Singapore',
    region: 'Asia',
    costIndex: 5,
    popularity: 85,
    description: 'Futuristic gardens, Michelin-star hawker stalls, and world-class shopping in a gleaming city-state.',
    latitude: 1.3521,
    longitude: 103.8198,
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
  },
  {
    name: 'Seoul',
    country: 'South Korea',
    region: 'Asia',
    costIndex: 4,
    popularity: 85,
    description: 'K-pop culture, ancient palaces, cutting-edge technology, and legendary Korean BBQ.',
    latitude: 37.5665,
    longitude: 126.9780,
    imageUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&q=80',
  },
  {
    name: 'Mumbai',
    country: 'India',
    region: 'Asia',
    costIndex: 2,
    popularity: 78,
    description: 'City of dreams — Bollywood, colonial architecture, bustling bazaars, and incredible street food.',
    latitude: 19.0760,
    longitude: 72.8777,
    imageUrl: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800&q=80',
  },

  // Americas
  {
    name: 'New York',
    country: 'USA',
    region: 'North America',
    costIndex: 5,
    popularity: 95,
    description: 'The Big Apple — Times Square, world-class museums, iconic skyline, and diverse neighbourhoods.',
    latitude: 40.7128,
    longitude: -74.0060,
    imageUrl: 'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?w=800&q=80',
  },
  {
    name: 'Mexico City',
    country: 'Mexico',
    region: 'North America',
    costIndex: 2,
    popularity: 80,
    description: 'Rich Aztec history, vibrant art scene, incredible food, and colonial grandeur.',
    latitude: 19.4326,
    longitude: -99.1332,
    imageUrl: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80',
  },
  {
    name: 'Rio de Janeiro',
    country: 'Brazil',
    region: 'South America',
    costIndex: 3,
    popularity: 82,
    description: 'Carnival, samba, Copacabana beach, Christ the Redeemer, and stunning mountain backdrops.',
    latitude: -22.9068,
    longitude: -43.1729,
    imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80',
  },

  // Middle East & Africa
  {
    name: 'Dubai',
    country: 'UAE',
    region: 'Middle East',
    costIndex: 4,
    popularity: 88,
    description: 'Futuristic skyline, luxury malls, desert safaris, and world-record attractions.',
    latitude: 25.2048,
    longitude: 55.2708,
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
  },
  {
    name: 'Cape Town',
    country: 'South Africa',
    region: 'Africa',
    costIndex: 3,
    popularity: 81,
    description: 'Table Mountain, penguins, world-class wineries, and two-ocean coastlines.',
    latitude: -33.9249,
    longitude: 18.4241,
    imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80',
  },

  // Oceania
  {
    name: 'Sydney',
    country: 'Australia',
    region: 'Oceania',
    costIndex: 5,
    popularity: 84,
    description: 'Iconic Opera House, Harbour Bridge, golden beaches, and a vibrant multicultural food scene.',
    latitude: -33.8688,
    longitude: 151.2093,
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80',
  },
];

/* ────────────────────────────────────────────────
   6 unique activities per city  (120 total)
   ──────────────────────────────────────────────── */
const cityActivities = {
  Paris: [
    { name: 'Eiffel Tower Visit', category: 'sightseeing', estimatedCost: 2800, duration: 180, rating: 4.9, description: 'Ascend the iconic iron lattice tower for panoramic views over Paris.' },
    { name: 'Louvre Museum', category: 'culture', estimatedCost: 1700, duration: 240, rating: 4.8, description: 'World\'s largest art museum — home to the Mona Lisa and Venus de Milo.' },
    { name: 'Seine River Cruise', category: 'sightseeing', estimatedCost: 1500, duration: 90, rating: 4.6, description: 'Glide past Notre Dame, Musee d\'Orsay, and the Eiffel Tower by boat.' },
    { name: 'Montmartre & Sacre-Coeur Walk', category: 'culture', estimatedCost: 0, duration: 120, rating: 4.5, description: 'Explore the artsy hilltop village and visit the stunning white basilica.' },
    { name: 'French Pastry Class', category: 'food', estimatedCost: 8000, duration: 180, rating: 4.7, description: 'Learn to make croissants and macarons with a Parisian patissier.' },
    { name: 'Galeries Lafayette Shopping', category: 'shopping', estimatedCost: 0, duration: 120, rating: 4.4, description: 'Explore Europe\'s grandest department store with its stunning glass dome.' },
  ],
  Rome: [
    { name: 'Colosseum & Roman Forum Tour', category: 'culture', estimatedCost: 2000, duration: 180, rating: 4.9, description: 'Walk through the ancient amphitheatre and Roman Forum ruins.' },
    { name: 'Vatican Museums & Sistine Chapel', category: 'culture', estimatedCost: 2200, duration: 240, rating: 4.8, description: 'Marvel at Michelangelo\'s ceiling and millennia of papal treasures.' },
    { name: 'Trevi Fountain & Piazza Navona', category: 'sightseeing', estimatedCost: 0, duration: 90, rating: 4.7, description: 'Toss a coin in the baroque Trevi Fountain, then stroll to Piazza Navona.' },
    { name: 'Roman Cooking Class', category: 'food', estimatedCost: 7000, duration: 210, rating: 4.6, description: 'Make authentic cacio e pepe and tiramisu with a local chef.' },
    { name: 'Trastevere Evening Food Walk', category: 'food', estimatedCost: 3000, duration: 150, rating: 4.8, description: 'Graze through Rome\'s most atmospheric neighbourhood after dark.' },
    { name: 'Borghese Gallery', category: 'culture', estimatedCost: 1500, duration: 120, rating: 4.7, description: 'Bernini\'s breathtaking sculptures in a stunning villa museum.' },
  ],
  London: [
    { name: 'Tower of London & Crown Jewels', category: 'culture', estimatedCost: 2500, duration: 150, rating: 4.7, description: 'Explore the 1000-year-old fortress and see the dazzling Crown Jewels.' },
    { name: 'British Museum', category: 'culture', estimatedCost: 0, duration: 180, rating: 4.8, description: 'World-class collection including the Rosetta Stone and Elgin Marbles.' },
    { name: 'Borough Market Food Tour', category: 'food', estimatedCost: 2500, duration: 120, rating: 4.6, description: 'Graze through London\'s finest artisan food market near London Bridge.' },
    { name: 'West End Theatre Show', category: 'culture', estimatedCost: 6000, duration: 180, rating: 4.9, description: 'Catch a world-renowned theatre performance in the heart of London.' },
    { name: 'Notting Hill & Portobello Market', category: 'shopping', estimatedCost: 0, duration: 120, rating: 4.5, description: 'Browse antiques, vintage fashion, and street food on Portobello Road.' },
    { name: 'Thames Path & Tower Bridge Walk', category: 'sightseeing', estimatedCost: 0, duration: 90, rating: 4.4, description: 'Stroll along the Thames and cross the iconic bascule bridge.' },
  ],
  Barcelona: [
    { name: 'Sagrada Familia', category: 'culture', estimatedCost: 2600, duration: 150, rating: 5.0, description: 'Gaudi\'s unfinished masterpiece — a breathtaking UNESCO basilica.' },
    { name: 'Park Guell', category: 'sightseeing', estimatedCost: 1000, duration: 120, rating: 4.7, description: 'Mosaic terraces and Gaudi gardens with panoramic city views.' },
    { name: 'La Boqueria Market', category: 'food', estimatedCost: 1500, duration: 90, rating: 4.6, description: 'Vibrant covered market overflowing with fresh seafood, jamon, and tapas.' },
    { name: 'Gothic Quarter Walk', category: 'sightseeing', estimatedCost: 0, duration: 120, rating: 4.5, description: 'Wander the medieval maze of lanes, Roman ruins, and hidden plazas.' },
    { name: 'Barceloneta Beach Day', category: 'relaxation', estimatedCost: 500, duration: 240, rating: 4.4, description: 'Sun, sand, and sangria on the city\'s famous urban beach.' },
    { name: 'Tapas Crawl in El Born', category: 'food', estimatedCost: 3500, duration: 180, rating: 4.8, description: 'Bar-hop through Barcelona\'s hippest neighbourhood tasting pintxos and vermouth.' },
  ],
  Prague: [
    { name: 'Prague Castle & St. Vitus Cathedral', category: 'culture', estimatedCost: 1400, duration: 180, rating: 4.8, description: 'Europe\'s largest castle complex overlooking the Vltava river.' },
    { name: 'Charles Bridge at Dawn', category: 'sightseeing', estimatedCost: 0, duration: 60, rating: 4.9, description: 'Cross the 14th-century stone bridge lined with baroque statues before crowds arrive.' },
    { name: 'Old Town Square & Astronomical Clock', category: 'sightseeing', estimatedCost: 0, duration: 90, rating: 4.7, description: 'Watch the 600-year-old clock perform its hourly mechanical show.' },
    { name: 'Czech Beer Tasting Tour', category: 'food', estimatedCost: 1500, duration: 120, rating: 4.8, description: 'Sample world-class Pilsner and dark lagers at a traditional pub crawl.' },
    { name: 'Vysehrad Fortress Walk', category: 'sightseeing', estimatedCost: 0, duration: 90, rating: 4.5, description: 'Visit the lesser-known clifftop fortress with sweeping river panoramas.' },
    { name: 'Trdelnk & Market Street Food', category: 'food', estimatedCost: 500, duration: 60, rating: 4.4, description: 'Try the chimney cake and browse local artisan markets in the old town.' },
  ],
  Amsterdam: [
    { name: 'Anne Frank House', category: 'culture', estimatedCost: 1400, duration: 120, rating: 4.9, description: 'Poignant visit to the hiding place where Anne Frank wrote her diary.' },
    { name: 'Rijksmuseum', category: 'culture', estimatedCost: 2200, duration: 180, rating: 4.8, description: 'Rembrandt\'s Night Watch among Dutch Golden Age masterpieces.' },
    { name: 'Canal Boat Tour', category: 'sightseeing', estimatedCost: 1800, duration: 90, rating: 4.7, description: 'Float through Amsterdam\'s UNESCO-listed 17th-century canal ring.' },
    { name: 'Albert Cuyp Market', category: 'shopping', estimatedCost: 0, duration: 90, rating: 4.5, description: 'Largest street market in Europe — stroopwafels, cheese, and fresh herring.' },
    { name: 'Vondelpark Bike Ride', category: 'relaxation', estimatedCost: 1200, duration: 120, rating: 4.6, description: 'Rent a bike and cycle through Amsterdam like a true local.' },
    { name: 'Dutch Cheese & Jenever Tasting', category: 'food', estimatedCost: 2000, duration: 90, rating: 4.7, description: 'Taste aged Gouda and traditional Dutch genever gin at a tasting house.' },
  ],
  Istanbul: [
    { name: 'Hagia Sophia & Blue Mosque', category: 'culture', estimatedCost: 0, duration: 150, rating: 4.9, description: 'Visit two of the world\'s most magnificent religious monuments side by side.' },
    { name: 'Grand Bazaar & Spice Market', category: 'shopping', estimatedCost: 2000, duration: 150, rating: 4.7, description: 'Get lost in 4,000 shops selling carpets, spices, jewellery, and lanterns.' },
    { name: 'Bosphorus Sunset Cruise', category: 'sightseeing', estimatedCost: 2000, duration: 120, rating: 4.8, description: 'Cruise between Europe and Asia as the sun sets behind Ottoman palaces.' },
    { name: 'Turkish Hammam Experience', category: 'relaxation', estimatedCost: 3500, duration: 90, rating: 4.6, description: 'Relax with a traditional scrub and soap massage in a centuries-old hammam.' },
    { name: 'Street Food Tour in Karakoy', category: 'food', estimatedCost: 2500, duration: 120, rating: 4.8, description: 'Taste simit, fish sandwiches, and Turkish street sweets in the hip waterfront district.' },
    { name: 'Topkapi Palace', category: 'culture', estimatedCost: 1800, duration: 180, rating: 4.7, description: 'Explore the opulent heart of the Ottoman Empire and its legendary harem.' },
  ],
  Tokyo: [
    { name: 'Senso-ji Temple & Asakusa', category: 'culture', estimatedCost: 0, duration: 120, rating: 4.8, description: 'Tokyo\'s oldest temple set in a lively district of craft shops and street food.' },
    { name: 'Shibuya Crossing & Harajuku', category: 'sightseeing', estimatedCost: 0, duration: 120, rating: 4.7, description: 'Experience the world\'s busiest scramble crossing, then explore quirky fashion culture.' },
    { name: 'Tsukiji Outer Market Breakfast', category: 'food', estimatedCost: 2000, duration: 90, rating: 4.9, description: 'Eat the freshest sushi and tamagoyaki at the famous fish market stalls.' },
    { name: 'teamLab Borderless Digital Art', category: 'culture', estimatedCost: 3200, duration: 150, rating: 4.9, description: 'Immerse yourself in a world-famous borderless digital art universe.' },
    { name: 'Akihabara Electronics & Anime District', category: 'shopping', estimatedCost: 0, duration: 120, rating: 4.5, description: 'Explore the dizzying electronics district packed with gadgets, manga, and arcades.' },
    { name: 'Mount Fuji Day Trip', category: 'adventure', estimatedCost: 5000, duration: 480, rating: 5.0, description: 'Journey to Japan\'s sacred peak for panoramic views and fifth-station hiking.' },
  ],
  Kyoto: [
    { name: 'Fushimi Inari Shrine', category: 'sightseeing', estimatedCost: 0, duration: 150, rating: 4.9, description: 'Hike through thousands of vermillion torii gates winding up a sacred mountain.' },
    { name: 'Arashiyama Bamboo Grove', category: 'sightseeing', estimatedCost: 0, duration: 90, rating: 4.8, description: 'Walk through towering bamboo stalks in this mystical, atmospheric grove.' },
    { name: 'Tea Ceremony Experience', category: 'culture', estimatedCost: 3000, duration: 90, rating: 4.7, description: 'Participate in an authentic matcha tea ceremony with a Kyoto tea master.' },
    { name: 'Kinkaku-ji Golden Pavilion', category: 'culture', estimatedCost: 500, duration: 90, rating: 4.8, description: 'Admire the iconic Zen temple whose top floors are clad entirely in gold leaf.' },
    { name: 'Nishiki Market Food Walk', category: 'food', estimatedCost: 2000, duration: 90, rating: 4.6, description: 'Taste tofu, pickled vegetables, and Japanese sweets in the kitchen of Kyoto.' },
    { name: 'Gion Geisha District Evening Walk', category: 'culture', estimatedCost: 0, duration: 90, rating: 4.7, description: 'Stroll through lantern-lit lanes of the historic geisha district at dusk.' },
  ],
  Bangkok: [
    { name: 'Grand Palace & Wat Phra Kaew', category: 'culture', estimatedCost: 1100, duration: 180, rating: 4.9, description: 'Thailand\'s most sacred temple complex housing the revered Emerald Buddha.' },
    { name: 'Floating Market Tour', category: 'sightseeing', estimatedCost: 2500, duration: 240, rating: 4.7, description: 'Cruise through canal markets selling exotic fruits, noodles, and souvenirs.' },
    { name: 'Chatuchak Weekend Market', category: 'shopping', estimatedCost: 0, duration: 180, rating: 4.6, description: 'Shop till you drop at one of the world\'s largest weekend markets.' },
    { name: 'Thai Cooking Class', category: 'food', estimatedCost: 3000, duration: 210, rating: 4.8, description: 'Learn to make pad thai, green curry, and mango sticky rice.' },
    { name: 'Rooftop Bar Sunset Cocktails', category: 'nightlife', estimatedCost: 4000, duration: 120, rating: 4.7, description: 'Sip cocktails high above Bangkok\'s skyline at a world-famous rooftop bar.' },
    { name: 'Chinatown Street Food Night', category: 'food', estimatedCost: 1500, duration: 120, rating: 4.8, description: 'Devour grilled seafood, roasted duck, and mango desserts on Yaowarat Road.' },
  ],
  Bali: [
    { name: 'Ubud Monkey Forest & Rice Terraces', category: 'sightseeing', estimatedCost: 800, duration: 180, rating: 4.7, description: 'Walk through the sacred monkey sanctuary and marvel at Tegalalang\'s terraces.' },
    { name: 'Sunrise Trek on Mount Batur', category: 'adventure', estimatedCost: 4000, duration: 300, rating: 4.9, description: 'Hike an active volcano at 3am to catch a spectacular sunrise above the clouds.' },
    { name: 'Uluwatu Temple Sunset & Kecak Dance', category: 'culture', estimatedCost: 1000, duration: 120, rating: 4.9, description: 'Watch the Kecak fire dance at a clifftop temple as the sun dips into the sea.' },
    { name: 'Balinese Cooking Class', category: 'food', estimatedCost: 3500, duration: 180, rating: 4.7, description: 'Market shopping, spice grinding, and cooking a traditional Balinese feast.' },
    { name: 'Surf Lesson at Kuta Beach', category: 'adventure', estimatedCost: 2500, duration: 120, rating: 4.5, description: 'Ride your first wave with expert instructors on Bali\'s most famous surf break.' },
    { name: 'Traditional Balinese Spa Massage', category: 'relaxation', estimatedCost: 2000, duration: 90, rating: 4.8, description: 'Luxurious open-air treatment combining stretching, pressure point, and aromatherapy.' },
  ],
  Singapore: [
    { name: 'Gardens by the Bay & Supertrees', category: 'sightseeing', estimatedCost: 2800, duration: 180, rating: 4.9, description: 'Stroll through futuristic garden domes and see the iconic Supertree light show.' },
    { name: 'Hawker Centre Food Crawl', category: 'food', estimatedCost: 1000, duration: 120, rating: 5.0, description: 'Eat your way through Maxwell or Lau Pa Sat — Hainanese chicken rice to chilli crab.' },
    { name: 'Marina Bay Sands SkyPark', category: 'sightseeing', estimatedCost: 2300, duration: 90, rating: 4.8, description: 'Enjoy the iconic infinity pool view or the observation deck over the city.' },
    { name: 'Chinatown & Little India Walk', category: 'culture', estimatedCost: 0, duration: 120, rating: 4.6, description: 'Explore Singapore\'s vibrant ethnic enclaves packed with temples and street art.' },
    { name: 'Universal Studios Singapore', category: 'adventure', estimatedCost: 8100, duration: 360, rating: 4.7, description: 'Thrilling rides and immersive theme zones on Sentosa Island.' },
    { name: 'Night Safari Zoo', category: 'adventure', estimatedCost: 5000, duration: 180, rating: 4.8, description: 'Encounter nocturnal animals in the world\'s first purpose-built night zoo.' },
  ],
  Seoul: [
    { name: 'Gyeongbokgung Palace & Hanbok Rental', category: 'culture', estimatedCost: 1200, duration: 150, rating: 4.8, description: 'Tour Korea\'s grandest Joseon palace and rent a hanbok for free entry.' },
    { name: 'Myeongdong Street Food & Shopping', category: 'shopping', estimatedCost: 2000, duration: 150, rating: 4.7, description: 'K-beauty products, street tteokbokki, and sizzling Korean corn dogs.' },
    { name: 'Korean BBQ Dinner', category: 'food', estimatedCost: 4000, duration: 120, rating: 5.0, description: 'Grill marinated pork belly and galbi beef at your own tabletop brazier.' },
    { name: 'Bukchon Hanok Village Walk', category: 'sightseeing', estimatedCost: 0, duration: 90, rating: 4.7, description: 'Wander narrow alleys lined with 600-year-old traditional Korean houses.' },
    { name: 'K-Pop Entertainment Tour', category: 'culture', estimatedCost: 3000, duration: 150, rating: 4.5, description: 'Visit HYBE headquarters and SM/YG entertainment flagship stores.' },
    { name: 'Namsan Tower Cable Car', category: 'sightseeing', estimatedCost: 1700, duration: 120, rating: 4.6, description: 'Ride up to N Seoul Tower for panoramic views and the famous love padlocks.' },
  ],
  Mumbai: [
    { name: 'Gateway of India & Colaba', category: 'sightseeing', estimatedCost: 0, duration: 120, rating: 4.7, description: 'Stroll the iconic waterfront arch then explore colonial Colaba Causeway market.' },
    { name: 'Dharavi Community Tour', category: 'culture', estimatedCost: 1500, duration: 180, rating: 4.6, description: 'Responsible guided tour of Asia\'s largest urban village and its cottage industries.' },
    { name: 'Mumbai Street Food Walk', category: 'food', estimatedCost: 500, duration: 120, rating: 4.9, description: 'Eat the best vada pav, pav bhaji, and cutting chai Mumbai has to offer.' },
    { name: 'Bollywood Studio Tour', category: 'culture', estimatedCost: 3000, duration: 180, rating: 4.5, description: 'Go behind the scenes at Film City — sets, costumes, and dance performances.' },
    { name: 'Elephanta Caves Ferry Trip', category: 'adventure', estimatedCost: 1200, duration: 300, rating: 4.6, description: 'Take a harbour ferry to UNESCO rock-cut cave temples dedicated to Shiva.' },
    { name: 'Crawford Market & Chor Bazaar', category: 'shopping', estimatedCost: 0, duration: 120, rating: 4.4, description: 'Haggle for spices, antiques, and vintage treasures in Mumbai\'s oldest markets.' },
  ],
  'New York': [
    { name: 'Statue of Liberty & Ellis Island', category: 'culture', estimatedCost: 2500, duration: 300, rating: 4.8, description: 'Ferry to Lady Liberty and the moving immigration museum on Ellis Island.' },
    { name: 'Central Park Highlights Walk', category: 'sightseeing', estimatedCost: 0, duration: 150, rating: 4.7, description: 'Explore Bethesda Fountain, Strawberry Fields, and the Bow Bridge.' },
    { name: 'Metropolitan Museum of Art', category: 'culture', estimatedCost: 2500, duration: 240, rating: 4.9, description: 'One of the world\'s greatest art collections across 5,000 years of human creativity.' },
    { name: 'Brooklyn Bridge Walk & DUMBO', category: 'sightseeing', estimatedCost: 0, duration: 120, rating: 4.8, description: 'Cross the bridge on foot then explore Brooklyn\'s trendiest neighbourhood.' },
    { name: 'High Line & Chelsea Market', category: 'sightseeing', estimatedCost: 0, duration: 120, rating: 4.7, description: 'Stroll the elevated park and browse artisan food and design vendors below.' },
    { name: 'Broadway Show', category: 'culture', estimatedCost: 8000, duration: 180, rating: 4.9, description: 'See the world\'s greatest live theatre in the dazzling Theatre District.' },
  ],
  'Mexico City': [
    { name: 'Teotihuacan Pyramids Day Trip', category: 'adventure', estimatedCost: 2000, duration: 360, rating: 4.9, description: 'Climb the Pyramid of the Sun — one of the largest ancient structures on Earth.' },
    { name: 'Frida Kahlo Museum (Casa Azul)', category: 'culture', estimatedCost: 1700, duration: 120, rating: 4.8, description: 'Visit the cobalt-blue house where Frida Kahlo lived, loved, and painted.' },
    { name: 'Historic Centro & Zocalo', category: 'sightseeing', estimatedCost: 0, duration: 120, rating: 4.6, description: 'Explore the vast main square, Aztec ruins, and baroque cathedral in the heart of CDMX.' },
    { name: 'Mezcal & Taco Tasting Tour', category: 'food', estimatedCost: 3000, duration: 150, rating: 4.9, description: 'Taste artisanal mezcal and authentic tacos de guisado on a walking tour.' },
    { name: 'Xochimilco Trajinera Boat Ride', category: 'sightseeing', estimatedCost: 1500, duration: 180, rating: 4.6, description: 'Float through UNESCO-listed ancient canals on a colourful flat-bottomed boat.' },
    { name: 'Lucha Libre Wrestling Show', category: 'culture', estimatedCost: 1200, duration: 120, rating: 4.7, description: 'Cheer on masked wrestlers at the legendary Arena Mexico — pure Mexican spectacle.' },
  ],
  'Rio de Janeiro': [
    { name: 'Christ the Redeemer', category: 'sightseeing', estimatedCost: 10000, duration: 180, rating: 5.0, description: 'Ascend Corcovado to see the iconic art deco statue with a 360 degree panorama.' },
    { name: 'Sugarloaf Mountain Cable Car', category: 'adventure', estimatedCost: 8000, duration: 180, rating: 4.8, description: 'Two cable car rides to 396 m elevation for stunning Guanabara Bay views.' },
    { name: 'Ipanema & Copacabana Beach Day', category: 'relaxation', estimatedCost: 1000, duration: 300, rating: 4.7, description: 'Lounge on Rio\'s legendary beaches, play footvolley, and sip fresh coconut water.' },
    { name: 'Samba School Tour & Dance Class', category: 'culture', estimatedCost: 4000, duration: 180, rating: 4.7, description: 'Visit one of Rio\'s carnival samba schools and learn the basic samba steps.' },
    { name: 'Santa Teresa Neighbourhood Walk', category: 'sightseeing', estimatedCost: 0, duration: 120, rating: 4.6, description: 'Explore the bohemian hilltop barrio with its street art, cafes, and tram.' },
    { name: 'Feijoada Sunday Lunch', category: 'food', estimatedCost: 3500, duration: 120, rating: 4.8, description: 'Savour the Brazilian national dish — slow-cooked black bean and pork stew.' },
  ],
  Dubai: [
    { name: 'Burj Khalifa At the Top', category: 'sightseeing', estimatedCost: 12000, duration: 120, rating: 4.9, description: 'Take the world\'s fastest elevator to the observation deck at 555 m.' },
    { name: 'Desert Safari & Dune Bashing', category: 'adventure', estimatedCost: 7000, duration: 360, rating: 4.9, description: '4WD dune bashing, camel riding, and a Bedouin camp dinner under the stars.' },
    { name: 'Dubai Creek & Gold Souk', category: 'sightseeing', estimatedCost: 500, duration: 150, rating: 4.7, description: 'Cross the historic creek by abra and browse dazzling gold and spice souks.' },
    { name: 'Dubai Mall & Aquarium', category: 'shopping', estimatedCost: 0, duration: 180, rating: 4.6, description: 'World\'s largest mall — visit the massive shark tank aquarium and indoor ice rink.' },
    { name: 'Dhow Cruise Dinner on Dubai Creek', category: 'nightlife', estimatedCost: 4500, duration: 180, rating: 4.7, description: 'Cruise past illuminated skyscrapers with a buffet dinner and cultural show.' },
    { name: 'Jumeirah Beach & Burj Al Arab View', category: 'relaxation', estimatedCost: 0, duration: 120, rating: 4.5, description: 'Sunbathe on the public beach with a perfect view of the iconic sail-shaped hotel.' },
  ],
  'Cape Town': [
    { name: 'Table Mountain Cable Car', category: 'adventure', estimatedCost: 5000, duration: 180, rating: 4.9, description: 'Ride the rotating cable car to the flat-topped mountain summit for city views.' },
    { name: 'Cape Peninsula & Cape of Good Hope', category: 'sightseeing', estimatedCost: 4000, duration: 480, rating: 5.0, description: 'Drive the scenic coastal road to Africa\'s south-westernmost tip.' },
    { name: 'Boulders Beach Penguin Colony', category: 'sightseeing', estimatedCost: 1800, duration: 120, rating: 4.8, description: 'Walk among thousands of African penguins on a gorgeous boulder-strewn beach.' },
    { name: 'Winelands Tour — Stellenbosch & Franschhoek', category: 'food', estimatedCost: 6000, duration: 360, rating: 4.9, description: 'Taste world-class wines at historic Cape Dutch wine estates.' },
    { name: 'Bo-Kaap Neighbourhood & Cooking Class', category: 'culture', estimatedCost: 3500, duration: 180, rating: 4.7, description: 'Explore the brightly painted Cape Malay quarter and cook traditional dishes.' },
    { name: 'V&A Waterfront & Craft Market', category: 'shopping', estimatedCost: 0, duration: 120, rating: 4.6, description: 'Browse craft markets, restaurants, and street performers at the iconic harbour.' },
  ],
  Sydney: [
    { name: 'Sydney Opera House Tour', category: 'culture', estimatedCost: 4000, duration: 90, rating: 4.9, description: 'Go behind the scenes of the world\'s most recognised architectural masterpiece.' },
    { name: 'Bondi Beach & Coastal Walk', category: 'relaxation', estimatedCost: 0, duration: 240, rating: 4.8, description: 'Surf or swim at Bondi then walk the spectacular clifftop path to Coogee.' },
    { name: 'Sydney Harbour Bridge Climb', category: 'adventure', estimatedCost: 27000, duration: 180, rating: 5.0, description: 'Climb to the arch summit of the Harbour Bridge for an unforgettable panorama.' },
    { name: 'Circular Quay & The Rocks', category: 'sightseeing', estimatedCost: 0, duration: 120, rating: 4.7, description: 'Explore Sydney\'s historic sandstone precinct with galleries, pubs, and market stalls.' },
    { name: 'Blue Mountains Day Trip', category: 'adventure', estimatedCost: 5000, duration: 480, rating: 4.8, description: 'See the Three Sisters at Katoomba and ride the world\'s steepest scenic railway.' },
    { name: 'Sydney Fish Market', category: 'food', estimatedCost: 3000, duration: 90, rating: 4.7, description: 'Feast on the freshest oysters, prawns, and barramundi at the world-famous market.' },
  ],
};

/* ────────────────────────────────────────────────
   Admin user for testing
   ──────────────────────────────────────────────── */
const adminUser = {
  firstName: 'Admin',
  lastName: 'GlobeTrotter',
  username: 'admin',
  email: 'admin@globetrotter.dev',
  password: 'Admin@1234',
  role: 'admin',
  city: 'Mumbai',
  country: 'India',
  additionalInfo: 'System administrator account for GlobeTrotter.',
};

/* ────────────────────────────────────────────────
   Seed runner
   ──────────────────────────────────────────────── */
const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Clear existing seed data
    await City.deleteMany({});
    await Activity.deleteMany({});
    console.log('Cleared existing cities and activities');

    // Remove existing admin to avoid duplicate key errors
    await User.deleteOne({ username: adminUser.username });
    console.log('Removed existing admin user (if any)');

    // Insert cities
    const insertedCities = await City.insertMany(cities);
    console.log('Inserted ' + insertedCities.length + ' cities');

    // Generate activities for each city
    const allActivities = [];
    insertedCities.forEach((city) => {
      const activityList = cityActivities[city.name];
      if (activityList) {
        activityList.forEach((act) => {
          allActivities.push({ ...act, city: city._id, isGlobal: true });
        });
      }
    });

    const insertedActivities = await Activity.insertMany(allActivities);
    console.log('Inserted ' + insertedActivities.length + ' activities');

    // Create admin user — password gets hashed by the pre-save hook in User model
    const admin = new User(adminUser);
    await admin.save();
    console.log('Admin user created — username: ' + adminUser.username + ' / password: ' + adminUser.password);

    console.log('\nSeed completed successfully!');
    console.log('------------------------------------');
    console.log('Cities     : ' + insertedCities.length);
    console.log('Activities : ' + insertedActivities.length);
    console.log('Admin user : ' + adminUser.username + ' / ' + adminUser.password);
    console.log('------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

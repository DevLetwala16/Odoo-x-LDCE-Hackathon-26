/**
 * Utility to dynamically resolve high-definition city cover photography
 * for trips, itineraries, and community cards based on city / country / name.
 */

const CITY_COVERS = [
  { keywords: ['india', 'delhi', 'agra', 'jaipur', 'mumbai', 'goa', 'kerala', 'taj', 'ahmedabad', 'rajasthan', 'varanasi', 'manali', 'ladakh'], url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=1200' },
  { keywords: ['paris', 'france', 'eiffel', 'louvre', 'versailles'], url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1200' },
  { keywords: ['tokyo', 'japan', 'shibuya', 'fuji', 'shinjuku'], url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=1200' },
  { keywords: ['kyoto', 'osaka', 'nara', 'bamboo'], url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1200' },
  { keywords: ['rome', 'italy', 'colosseum', 'vatican', 'venice', 'florence', 'milan'], url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1200' },
  { keywords: ['london', 'uk', 'england', 'thames', 'big ben'], url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=1200' },
  { keywords: ['bali', 'indonesia', 'ubud', 'seminyak', 'canggu'], url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1200' },
  { keywords: ['new york', 'nyc', 'manhattan', 'brooklyn', 'usa', 'america'], url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=1200' },
  { keywords: ['dubai', 'uae', 'burj', 'abu dhabi'], url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=1200' },
  { keywords: ['singapore', 'marina bay', 'sentosa'], url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80&w=1200' },
  { keywords: ['swiss', 'switzerland', 'zurich', 'zermatt', 'geneva', 'alps', 'matterhorn'], url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=1200' },
  { keywords: ['santorini', 'greece', 'athens', 'mykonos'], url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=1200' },
  { keywords: ['barcelona', 'spain', 'madrid', 'gaudi'], url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&q=80&w=1200' },
  { keywords: ['sydney', 'australia', 'melbourne'], url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=1200' },
  { keywords: ['cairo', 'egypt', 'pyramids'], url: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&q=80&w=1200' },
  { keywords: ['rio', 'brazil', 'copacabana'], url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=1200' },
  { keywords: ['iceland', 'reykjavik', 'aurora'], url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&q=80&w=1200' },
];

export const getTripCoverImage = (trip) => {
  if (!trip) return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200';
  
  // If trip already has a custom user-chosen photo that isn't the generic flat camera stock
  if (trip.coverImage && 
      !trip.coverImage.includes('85cb44e25828') && 
      !trip.coverImage.includes('436491865332') &&
      trip.coverImage.startsWith('http')) {
    return trip.coverImage;
  }

  // Search across trip metadata
  const firstStopCity = trip.stops && trip.stops[0] ? (trip.stops[0].city?.name || trip.stops[0].title || '') : '';
  const searchTarget = `${trip.name || ''} ${trip.destination || ''} ${firstStopCity} ${trip.description || ''}`.toLowerCase();

  for (const item of CITY_COVERS) {
    if (item.keywords.some(kw => searchTarget.includes(kw))) {
      return item.url;
    }
  }

  // High quality default scenic travel photo
  return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200';
};

export default getTripCoverImage;

/**
 * Geocoding Service
 * 
 * Provides geocoding functionality for the application including:
 * - Address autocomplete
 * - Coordinate lookup
 * - Reverse geocoding
 * 
 * This implementation uses a simulated API to avoid external dependencies
 * but could be easily swapped with a real geocoding service like Google Places API,
 * Mapbox Geocoding, or OpenStreetMap Nominatim.
 */

export interface GeocodingResult {
  placeId: string;
  formattedAddress: string;
  streetNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface SuggestionResult {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

// Simulated database of common addresses for demonstration
const addressDatabase: GeocodingResult[] = [
  {
    placeId: 'place_id_1',
    formattedAddress: '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',
    streetNumber: '1600',
    street: 'Amphitheatre Parkway',
    city: 'Mountain View',
    state: 'CA',
    country: 'USA',
    postalCode: '94043',
    coordinates: { latitude: 37.422131, longitude: -122.084801 }
  },
  {
    placeId: 'place_id_2',
    formattedAddress: '350 5th Ave, New York, NY 10118, USA',
    streetNumber: '350',
    street: '5th Ave',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    postalCode: '10118',
    coordinates: { latitude: 40.748817, longitude: -73.985428 }
  },
  {
    placeId: 'place_id_3',
    formattedAddress: '221B Baker St, London NW1 6XE, UK',
    streetNumber: '221B',
    street: 'Baker St',
    city: 'London',
    state: '',
    country: 'UK',
    postalCode: 'NW1 6XE',
    coordinates: { latitude: 51.523767, longitude: -0.158565 }
  },
  {
    placeId: 'place_id_4',
    formattedAddress: '1 Infinite Loop, Cupertino, CA 95014, USA',
    streetNumber: '1',
    street: 'Infinite Loop',
    city: 'Cupertino',
    state: 'CA',
    country: 'USA',
    postalCode: '95014',
    coordinates: { latitude: 37.331669, longitude: -122.030228 }
  },
  {
    placeId: 'place_id_5',
    formattedAddress: '1 Microsoft Way, Redmond, WA 98052, USA',
    streetNumber: '1',
    street: 'Microsoft Way',
    city: 'Redmond',
    state: 'WA',
    country: 'USA',
    postalCode: '98052',
    coordinates: { latitude: 47.639747, longitude: -122.129731 }
  },
  {
    placeId: 'place_id_6',
    formattedAddress: '1 Hacker Way, Menlo Park, CA 94025, USA',
    streetNumber: '1',
    street: 'Hacker Way',
    city: 'Menlo Park',
    state: 'CA',
    country: 'USA',
    postalCode: '94025',
    coordinates: { latitude: 37.484947, longitude: -122.148521 }
  },
  {
    placeId: 'place_id_7',
    formattedAddress: '350 Mission St, San Francisco, CA 94105, USA',
    streetNumber: '350',
    street: 'Mission St',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    postalCode: '94105',
    coordinates: { latitude: 37.790795, longitude: -122.396900 }
  },
  {
    placeId: 'place_id_8',
    formattedAddress: '1 Apple Park Way, Cupertino, CA 95014, USA',
    streetNumber: '1',
    street: 'Apple Park Way',
    city: 'Cupertino',
    state: 'CA',
    country: 'USA',
    postalCode: '95014',
    coordinates: { latitude: 37.334722, longitude: -122.008889 }
  },
  {
    placeId: 'place_id_9',
    formattedAddress: '345 Park Ave, San Jose, CA 95110, USA',
    streetNumber: '345',
    street: 'Park Ave',
    city: 'San Jose',
    state: 'CA',
    country: 'USA',
    postalCode: '95110',
    coordinates: { latitude: 37.330800, longitude: -121.894997 }
  },
  {
    placeId: 'place_id_10',
    formattedAddress: '100 Universal City Plaza, Universal City, CA 91608, USA',
    streetNumber: '100',
    street: 'Universal City Plaza',
    city: 'Universal City',
    state: 'CA',
    country: 'USA',
    postalCode: '91608',
    coordinates: { latitude: 34.136543, longitude: -118.353225 }
  }
];

/**
 * Get address suggestions based on input text
 * @param input User input text for address autocomplete
 * @returns Array of address suggestions
 */
export const getAddressSuggestions = async (input: string): Promise<SuggestionResult[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!input || input.trim().length < 3) {
    return [];
  }
  
  const normalizedInput = input.toLowerCase().trim();
  
  // Filter addresses that match the input text
  const filteredAddresses = addressDatabase.filter(address => 
    address.formattedAddress.toLowerCase().includes(normalizedInput) ||
    (address.street && address.street.toLowerCase().includes(normalizedInput)) ||
    (address.city && address.city.toLowerCase().includes(normalizedInput))
  );
  
  // Convert to suggestion format
  return filteredAddresses.map(address => ({
    placeId: address.placeId,
    description: address.formattedAddress,
    mainText: `${address.streetNumber || ''} ${address.street || ''}`.trim(),
    secondaryText: `${address.city || ''}, ${address.state || ''} ${address.postalCode || ''}, ${address.country || ''}`.trim()
  }));
};

/**
 * Get full address details by place ID
 * @param placeId The unique identifier for the place
 * @returns Detailed address information
 */
export const getAddressDetails = async (placeId: string): Promise<GeocodingResult | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return addressDatabase.find(address => address.placeId === placeId) || null;
};

/**
 * Weather impact forecast based on location and timeframe
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 * @param startDate Project start date
 * @param endDate Project end date
 * @returns Weather impact analysis
 */
export interface WeatherImpact {
  summary: string;
  riskLevel: 'low' | 'medium' | 'high';
  details: {
    precipitation: {
      average: number; // mm
      risk: 'low' | 'medium' | 'high';
      impact: string;
    };
    temperature: {
      average: number; // celsius
      extremes: { high: number; low: number };
      risk: 'low' | 'medium' | 'high';
      impact: string;
    };
    seasonalRisks: string[];
  };
}

export const getWeatherImpact = async (
  latitude: number,
  longitude: number,
  startDate: Date,
  endDate: Date
): Promise<WeatherImpact> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // This would normally call a weather API with historical data and forecasts
  // For demo purposes, we'll generate a simulated response based on coordinates and dates
  
  // Determine season based on northern hemisphere
  const startMonth = startDate.getMonth();
  const endMonth = endDate.getMonth();
  
  // Simplistic season determination (northern hemisphere)
  const seasons = new Set<string>();
  const monthToSeason = (month: number) => {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  };
  
  // Collect all seasons the project spans
  let month = startMonth;
  while (true) {
    seasons.add(monthToSeason(month));
    if (month === endMonth) break;
    month = (month + 1) % 12;
  }
  
  // Generate weather impact based on location and seasons
  const isNorthern = latitude > 0;
  const seasonalRisks: string[] = [];
  let precipRisk: 'low' | 'medium' | 'high' = 'low';
  let tempRisk: 'low' | 'medium' | 'high' = 'low';
  let avgTemp = 20; // Default moderate temperature
  let avgPrecip = 30; // Default moderate precipitation
  
  // Determine risks based on latitude and seasons
  if (seasons.has('winter')) {
    if (Math.abs(latitude) > 40) {
      seasonalRisks.push('Heavy snowfall may delay outdoor construction');
      precipRisk = 'high';
      avgPrecip = 70;
      if (isNorthern) {
        seasonalRisks.push('Cold temperatures may affect concrete curing');
        tempRisk = 'high';
        avgTemp = 0;
      }
    } else if (Math.abs(latitude) > 20) {
      seasonalRisks.push('Periodic cold fronts may cause delays');
      precipRisk = 'medium';
      tempRisk = 'medium';
      avgTemp = 10;
    }
  }
  
  if (seasons.has('summer')) {
    if (Math.abs(latitude) < 30) {
      seasonalRisks.push('High temperatures may require adjusted work schedules');
      tempRisk = 'high';
      avgTemp = 32;
    }
    if (latitude > 0 && latitude < 15 && longitude > -100 && longitude < 0) {
      seasonalRisks.push('Hurricane season may cause significant delays');
      precipRisk = 'high';
      avgPrecip = 100;
    }
  }
  
  if (Math.abs(longitude) > 150 || (longitude > -100 && longitude < -50 && latitude > 0 && latitude < 30)) {
    seasonalRisks.push('Area is prone to tropical storms');
    // Convert numeric risk level to string enum type safely
    const riskIndex = Math.max(
      precipRisk === 'low' ? 0 : precipRisk === 'medium' ? 1 : 2, 
      1
    );
    precipRisk = ['low', 'medium', 'high'][riskIndex] as 'low' | 'medium' | 'high';
  }
  
  // Overall risk determination
  const riskLevel: 'low' | 'medium' | 'high' = 
    precipRisk === 'high' || tempRisk === 'high' ? 'high' :
    precipRisk === 'medium' || tempRisk === 'medium' ? 'medium' : 'low';
  
  // Generate impact strings
  const precipImpact = precipRisk === 'high' ? 
    'High precipitation likely to cause significant delays to exterior work' : 
    precipRisk === 'medium' ? 
      'Moderate precipitation may cause occasional delays' : 
      'Low precipitation expected, minimal impact on schedule';
  
  const tempImpact = tempRisk === 'high' ? 
    'Temperature extremes will impact working conditions and material performance' : 
    tempRisk === 'medium' ? 
      'Seasonal temperature variations may require schedule adjustments' : 
      'Temperature conditions are favorable for construction';
  
  // Generate summary
  let summary = '';
  if (riskLevel === 'high') {
    summary = 'High weather risk detected. Schedule buffers strongly recommended.';
  } else if (riskLevel === 'medium') {
    summary = 'Moderate weather risks present. Consider contingency planning.';
  } else {
    summary = 'Weather conditions appear favorable for the project timeline.';
  }
  
  return {
    summary,
    riskLevel,
    details: {
      precipitation: {
        average: avgPrecip,
        risk: precipRisk,
        impact: precipImpact
      },
      temperature: {
        average: avgTemp,
        extremes: { 
          high: avgTemp + 10, 
          low: avgTemp - 15 
        },
        risk: tempRisk,
        impact: tempImpact
      },
      seasonalRisks
    }
  };
};

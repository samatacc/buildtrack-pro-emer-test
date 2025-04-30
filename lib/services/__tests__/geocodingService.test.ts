// Using Jest for testing
import { 
  getAddressSuggestions, 
  getAddressDetails, 
  getWeatherImpact,
  GeocodingResult
} from '../geocodingService';

describe('Geocoding Service', () => {
  describe('getAddressSuggestions', () => {
    it('should return empty array for short inputs', async () => {
      const results = await getAddressSuggestions('');
      expect(results).toEqual([]);
      
      const shortResults = await getAddressSuggestions('ab');
      expect(shortResults).toEqual([]);
    });
    
    it('should return matching suggestions for valid input', async () => {
      const results = await getAddressSuggestions('Mountain View');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('placeId');
      expect(results[0]).toHaveProperty('description');
      expect(results[0].description).toContain('Mountain View');
    });
    
    it('should match partial street names', async () => {
      const results = await getAddressSuggestions('Infinite');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].mainText).toContain('Infinite Loop');
    });
  });
  
  describe('getAddressDetails', () => {
    it('should return null for invalid place ID', async () => {
      const result = await getAddressDetails('invalid_id');
      expect(result).toBeNull();
    });
    
    it('should return full address details for valid place ID', async () => {
      const suggestions = await getAddressSuggestions('Amphitheatre');
      const placeId = suggestions[0]?.placeId;
      
      if (placeId) {
        const details = await getAddressDetails(placeId);
        expect(details).not.toBeNull();
        expect(details).toHaveProperty('formattedAddress');
        expect(details).toHaveProperty('city', 'Mountain View');
        expect(details).toHaveProperty('coordinates');
        expect(details?.coordinates).toHaveProperty('latitude');
        expect(details?.coordinates).toHaveProperty('longitude');
      } else {
        throw new Error('No place ID found for test');
      }
    });
  });
  
  describe('getWeatherImpact', () => {
    it('should return weather impact analysis for given coordinates and dates', async () => {
      const startDate = new Date('2025-01-15');
      const endDate = new Date('2025-06-30');
      
      const result = await getWeatherImpact(
        40.748817, // New York coordinates
        -73.985428,
        startDate,
        endDate
      );
      
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('riskLevel');
      expect(result).toHaveProperty('details');
      expect(result.details).toHaveProperty('precipitation');
      expect(result.details).toHaveProperty('temperature');
      expect(result.details).toHaveProperty('seasonalRisks');
      expect(Array.isArray(result.details.seasonalRisks)).toBe(true);
    });
    
    it('should assign higher risk for winter projects in northern regions', async () => {
      const winterStart = new Date('2025-12-01');
      const winterEnd = new Date('2026-02-28');
      
      const northernResult = await getWeatherImpact(
        55.0, // Northern latitude
        -110.0,
        winterStart,
        winterEnd
      );
      
      const southernResult = await getWeatherImpact(
        -20.0, // Southern latitude
        -110.0,
        winterStart,
        winterEnd
      );
      
      // Winter in northern hemisphere should have higher risks
      expect(northernResult.riskLevel === 'high' || northernResult.riskLevel === 'medium').toBe(true);
      
      // Southern hemisphere should have different season during same calendar months
      expect(northernResult.details.temperature.average).toBeLessThan(southernResult.details.temperature.average);
    });
  });
});

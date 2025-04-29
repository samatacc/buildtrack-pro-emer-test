// Mock implementation of fieldmode functions
export const useFieldMode = jest.fn().mockReturnValue(false);

// Add a dummy test to prevent Jest from complaining
if (process.env.NODE_ENV === 'test') {
  describe('fieldmode mock', () => {
    it('exists', () => {
      expect(useFieldMode).toBeDefined();
    });
  });
}

import { truthy } from '../truthy';

describe('truthy', () => {
  it('should return true for truthy values', () => {
    expect(truthy(true)).toBe(true);
    expect(truthy(1)).toBe(true);
    expect(truthy('1')).toBe(true);
    expect(truthy({})).toBe(true);
    expect(truthy([])).toBe(true);
  });

  it('should return false for falsy values', () => {
    expect(truthy(false)).toBe(false);
    expect(truthy(0)).toBe(false);
    expect(truthy('')).toBe(false);
    expect(truthy(null)).toBe(false);
    expect(truthy(undefined)).toBe(false);
  });
});

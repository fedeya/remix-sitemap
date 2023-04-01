import { getBooleanValue, getOptionalValue } from '../xml';

describe('xml util', () => {
  describe('getBooleanValue', () => {
    it('should return yes for true', () => {
      expect(getBooleanValue(true)).toBe('yes');
    });

    it('should return no for false', () => {
      expect(getBooleanValue(false)).toBe('no');
    });
  });

  describe('getOptionalValue', () => {
    it('should return undefined for undefined', () => {
      expect(getOptionalValue(undefined, {})).toBeUndefined();
    });

    it('should return undefined for null', () => {
      expect(getOptionalValue(null, {})).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      expect(getOptionalValue('', {})).toBeUndefined();
    });

    it('should return returnValue for non-empty string', () => {
      expect(getOptionalValue('value', { hello: 'world' })).toStrictEqual({
        hello: 'world'
      });
    });
  });
});

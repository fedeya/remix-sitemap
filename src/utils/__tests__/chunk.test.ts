import { chunk } from '../chunk';

describe('chunk', () => {
  it('should chunk an array into smaller arrays of a specified size', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});

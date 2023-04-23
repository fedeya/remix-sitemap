/**
 * Chunk an array into smaller arrays of a specified size.
 *
 * @param arr The array to chunk.
 * @param chunkSize The size of each chunk.
 *
 * @returns An array of chunks.
 *
 * @see https://web.archive.org/web/20150909134228/https://jsperf.com/chunk-mtds
 *
 * @example
 * chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(arr: T[], chunkSize: number): T[][] {
  const R = [];

  for (let i = 0, len = arr.length; i < len; i += chunkSize)
    R.push(arr.slice(i, i + chunkSize));

  return R;
}

export function chunk<T>(arr: T[], chunkSize: number): T[][] {
  const R = [];

  for (let i = 0, len = arr.length; i < len; i += chunkSize)
    R.push(arr.slice(i, i + chunkSize));

  return R;
}

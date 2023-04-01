export const getBooleanValue = (value: boolean) => (value ? 'yes' : 'no');

export function getOptionalValue<T>(value: unknown | undefined, returnType: T) {
  if (value) {
    return returnType;
  }

  return undefined;
}

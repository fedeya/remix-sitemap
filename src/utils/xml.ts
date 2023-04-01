export const getBooleanValue = (value: boolean) => (value ? 'yes' : 'no');

export function getOptionalValue<T>(value: any | undefined, returnType: T) {
  if (value) {
    return returnType;
  }

  return undefined;
}

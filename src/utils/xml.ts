export const getBooleanValue = (value?: boolean) =>
  typeof value !== 'boolean' ? undefined : value ? 'yes' : 'no';

export function getOptionalValue<T>(value: unknown | undefined, returnType: T) {
  return !value ? undefined : returnType;
}

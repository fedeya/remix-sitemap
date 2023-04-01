export const getBooleanValue = (value: boolean) => (value ? 'yes' : 'no');

export const getOptionalValue = (
  value: any | undefined,
  returnType: object
) => {
  if (value) {
    return returnType;
  }

  return undefined;
};

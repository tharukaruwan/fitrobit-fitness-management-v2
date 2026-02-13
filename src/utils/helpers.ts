type GenericObject = Record<string, any>;

/**
 * Removes all key-value pairs from an object where the value is null, undefined, or an empty string.
 * If the input is not an object, returns an empty object.
 * 
 * @param input - The value to clean. Should ideally be an object.
 * @returns A new object with only the keys that have valid values, or an empty object if the input is invalid.
 */
export const cleanObject = (input: unknown): GenericObject => {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => {
      if (value == null) return false;
      if (typeof value === "string" && (value.trim() === "" || value.trim() === "_")) {
        return false;
      }
      return true;
    })
  );
};
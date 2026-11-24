// Small validation helpers shared by the controllers.

export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// Accepts a real calendar date written as YYYY-MM-DD (ISO 8601).
export function isIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isValidBirthYear(value) {
  const currentYear = new Date().getUTCFullYear();
  return Number.isInteger(value) && value >= 0 && value <= currentYear;
}

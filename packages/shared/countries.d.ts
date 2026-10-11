export const COUNTRY_TIMEZONES: Readonly<Record<string, string>>;
export const COUNTRY_CODES: readonly string[];
export function isCountryCode(code: string): boolean;
export function primaryTimeZone(code: string): string | null;

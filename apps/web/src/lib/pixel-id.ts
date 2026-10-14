/** Meta pixel IDs are numeric. Anything else is ignored so it cannot be injected into the snippet. */
export function metaPixelId(raw: string | undefined) {
  const id = raw?.trim() ?? "";
  return /^\d{5,20}$/.test(id) ? id : "";
}

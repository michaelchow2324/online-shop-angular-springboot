/**
 * Carrier tracking links — mirrors backend MailService.trackingUrl (guide 06/07).
 * Canada Post only for now (Chit Chats disabled).
 */
const CANADA_POST_TRACK =
  "https://www.canadapost-postescanada.ca/track-reperage/en#/resultList?searchFor=";

export function trackingUrl(
  _carrier: string | null | undefined,
  trackingNumber: string | null | undefined,
): string | null {
  if (!trackingNumber?.trim()) {
    return null;
  }
  // Always Canada Post — unknown / legacy carriers still get a CP track link.
  return CANADA_POST_TRACK + trackingNumber.trim();
}

export function displayCarrier(carrier: string | null | undefined): string {
  if (!carrier?.trim()) {
    return "";
  }
  switch (carrier.trim().toLowerCase()) {
    case "canada_post":
    case "canadapost":
    case "canada-post":
      return "Canada Post";
    default:
      return carrier.trim();
  }
}

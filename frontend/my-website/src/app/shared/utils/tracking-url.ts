/**
 * Carrier tracking links — mirrors backend MailService.trackingUrl (guide 06/07).
 */
const CANADA_POST_TRACK =
  'https://www.canadapost-postescanada.ca/track-reperage/en#/resultList?searchFor=';
const CHIT_CHATS_TRACK = 'https://chitchats.com/tracking/';

export function trackingUrl(
  carrier: string | null | undefined,
  trackingNumber: string | null | undefined,
): string | null {
  if (!trackingNumber?.trim()) {
    return null;
  }
  const trimmed = trackingNumber.trim();
  const normalized = (carrier ?? '').trim().toLowerCase();
  switch (normalized) {
    case 'canada_post':
    case 'canadapost':
    case 'canada-post':
      return CANADA_POST_TRACK + trimmed;
    case 'chit_chats':
    case 'chitchats':
    case 'chit-chats':
      return CHIT_CHATS_TRACK + trimmed;
    default:
      return CANADA_POST_TRACK + trimmed;
  }
}

export function displayCarrier(carrier: string | null | undefined): string {
  if (!carrier?.trim()) {
    return '';
  }
  switch (carrier.trim().toLowerCase()) {
    case 'canada_post':
    case 'canadapost':
    case 'canada-post':
      return 'Canada Post';
    case 'chit_chats':
    case 'chitchats':
    case 'chit-chats':
      return 'Chit Chats';
    default:
      return carrier.trim();
  }
}

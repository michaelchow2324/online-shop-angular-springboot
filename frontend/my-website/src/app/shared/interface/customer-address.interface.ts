/** GET/POST /api/me/addresses — Spring AddressDTO */
export interface CustomerAddress {
  id: number;
  label: string;
  recipientName: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  province: string;
  postal: string;
  country: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpsertAddressRequest {
  label: string;
  recipientName: string;
  phone?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  province: string;
  postal: string;
  country?: string;
  isDefault?: boolean;
}

/**
 * Contracts for our Spring Boot checkout APIs (not the theme's mock order.json).
 * Field names match Jackson JSON from CreateOrderRequest / OrderDTO / ShippingQuoteDTO.
 */

/** Backend OrderStatus enum names (Jackson default = enum constant name). */
export type ShopOrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'FULFILLING'
  | 'SHIPPED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface ShopOrderItemRequest {
  productId: number;
  quantity: number;
}

/**
 * Body for POST /api/orders and POST /api/checkout/sessions.
 * Never send unit prices — server loads Product rows and computes money.
 */
export interface CreateShopOrderRequest {
  email: string;
  shippingName: string;
  shippingPhone?: string | null;
  shippingLine1: string;
  shippingLine2?: string | null;
  shippingCity: string;
  shippingProvince: string;
  shippingPostal: string;
  shippingCountry?: string;
  items: ShopOrderItemRequest[];
}

export interface ShopOrderItem {
  productId: number;
  sku: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  /** Live catalog image from API; may be null if product/media missing. */
  imageUrl?: string | null;
}

export interface ShopOrder {
  orderNumber: string;
  status: ShopOrderStatus;
  email: string;
  currency: string;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  shippingName: string;
  shippingPhone: string | null;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingProvince: string;
  shippingPostal: string;
  shippingCountry: string;
  shippingZone: string;
  shippingMethod: string;
  carrier: string | null;
  trackingNumber: string | null;
  paidAt: string | null;
  shippedAt: string | null;
  createdAt: string;
  items: ShopOrderItem[];
}

export interface ShippingQuoteRequest {
  shippingProvince: string;
  shippingCountry?: string;
  items: ShopOrderItemRequest[];
}

export interface ShippingQuote {
  zone: string;
  method: string;
  fee: number;
  freeThreshold: number;
  amountToFreeShipping: number;
  estimatedDaysMin: number | null;
  estimatedDaysMax: number | null;
}

/** POST /api/checkout/sessions response — redirect browser to checkoutUrl. */
export interface CheckoutSessionResponse {
  orderNumber: string;
  checkoutUrl: string;
}

/** Spring GlobalExceptionHandler ApiError body. */
export interface ApiErrorBody {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  fieldErrors?: { field: string; message: string }[];
}

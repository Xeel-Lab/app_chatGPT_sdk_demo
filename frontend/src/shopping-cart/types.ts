export type PurchaseSummaryItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type PurchaseSummary = {
  items: PurchaseSummaryItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  buyer: {
    email: string;
    name: string;
    address1: string;
    address2: string;
    city: string;
    postalCode: string;
    country: string;
  };
  deliveryDate: string;
};

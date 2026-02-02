import type { CartItem } from "../types";

export function computeTotals(items: CartItem[]) {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 0),
    0
  );
  const discount = 0;
  const taxableBase = Math.max(0, subtotal - discount);
  const shipping = subtotal < 50 ? 5 : 0;
  const total = Number((taxableBase + shipping).toFixed(2));
  return { subtotal, discount, tax: 0, shipping, total };
}

export function formatCurrency(value: number, currency = "EUR") {
  try {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export function randomDeliveryDate() {
  const daysToAdd = Math.floor(Math.random() * 5) + 3;
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

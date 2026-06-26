export function calculateDiscountedPrice(
  price: number,
  discount?: number | null
): number {
  if (!discount) {
    return price;
  }

  return Math.round(price * (1 - discount / 100) * 100) / 100;
}

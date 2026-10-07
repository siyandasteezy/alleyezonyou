export const LOW_STOCK = 5;

export function StockBadge({ stock, className = "" }: { stock: number; className?: string }) {
  if (stock <= 0) return <p className={`text-xs font-medium text-danger ${className}`}>Out of stock</p>;
  if (stock <= LOW_STOCK) return <p className={`text-xs font-medium text-warning ${className}`}>Only {stock} left</p>;
  return <p className={`text-xs font-medium text-success ${className}`}>In stock</p>;
}

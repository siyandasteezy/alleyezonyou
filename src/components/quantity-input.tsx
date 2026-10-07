"use client";

export function QuantityInput({ value, max, onChange }: { value: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-surface">
      <button
        type="button"
        className="px-3 py-2"
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-medium tabular-nums">{value}</span>
      <button
        type="button"
        className="px-3 py-2"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Increase quantity"
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );
}

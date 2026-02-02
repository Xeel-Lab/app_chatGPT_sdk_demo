import React from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@openai/apps-sdk-ui/components/Button";

type QuantitySelectorProps = {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  maxQuantity: number;
  minQuantity?: number;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

/**
 * Componente per selezionare la quantità di un prodotto
 * Mostra pulsanti +/- e un valore numerico, limitato allo stock disponibile
 */
export default function QuantitySelector({
  quantity,
  onQuantityChange,
  maxQuantity,
  minQuantity = 1,
  disabled = false,
  size = "sm",
  className = "",
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (quantity > minQuantity) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      // Permetti campo vuoto temporaneamente per digitazione
      return;
    }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(minQuantity, Math.min(maxQuantity, numValue));
      onQuantityChange(clampedValue);
    }
  };

  const handleBlur = () => {
    // Se il valore è vuoto o fuori range, ripristina al minimo valido
    if (quantity < minQuantity) {
      onQuantityChange(minQuantity);
    } else if (quantity > maxQuantity) {
      onQuantityChange(maxQuantity);
    }
  };

  const iconSize = size === "sm" ? "h-3 w-3" : size === "md" ? "h-3.5 w-3.5" : "h-4 w-4";
  const buttonSize = size === "sm" ? "xs" : size === "md" ? "sm" : "md";

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Button
        type="button"
        variant="ghost"
        color="secondary"
        size={buttonSize}
        uniform
        onClick={handleDecrease}
        disabled={disabled || quantity <= minQuantity}
        aria-label="Decrease quantity"
        className="flex-shrink-0"
      >
        <Minus strokeWidth={2.5} className={iconSize} aria-hidden="true" />
      </Button>
      <input
        type="number"
        min={minQuantity}
        max={maxQuantity}
        value={quantity}
        onChange={handleInputChange}
        onBlur={handleBlur}
        disabled={disabled}
        className="w-12 text-center text-sm font-medium border-none bg-transparent focus:outline-none focus:ring-1 focus:ring-[#0f766e] rounded px-1 disabled:opacity-50"
        aria-label="Quantity"
      />
      <Button
        type="button"
        variant="ghost"
        color="secondary"
        size={buttonSize}
        uniform
        onClick={handleIncrease}
        disabled={disabled || quantity >= maxQuantity}
        aria-label="Increase quantity"
        className="flex-shrink-0"
      >
        <Plus strokeWidth={2.5} className={iconSize} aria-hidden="true" />
      </Button>
    </div>
  );
}

import { ShoppingBag, Loader2 } from "lucide-react";

interface PurchaseButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  price?: number;
  label?: string;
}

export default function PurchaseButton({
  onClick,
  isLoading = false,
  disabled = false,
  price,
  label = "Buy Now",
}: PurchaseButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="flex items-center justify-center gap-2 w-full bg-earthBrown text-ivoryCream font-poppins font-semibold py-3 px-6 rounded-full hover:bg-earthBrown/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <ShoppingBag size={18} />
      )}
      <span>
        {label}
        {price !== undefined && ` · ₹${price.toLocaleString("en-IN")}`}
      </span>
    </button>
  );
}

import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface PurchaseButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  price?: number;
  label?: string;
}

export default function PurchaseButton({
  onClick,
  disabled = false,
  isLoading = false,
  price,
  label = 'Buy Now',
}: PurchaseButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="btn-primary gap-2"
      style={{
        backgroundColor: disabled ? '#ccc' : '#228B22',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {isLoading ? (
        <div
          className="w-5 h-5 rounded-full border-2 border-white border-t-transparent spinner-cw"
        />
      ) : (
        <>
          <ShoppingBag className="w-5 h-5" />
          <span>
            {price ? `UPI Buy Now — ₹${Number(price).toLocaleString('en-IN')}` : label}
          </span>
        </>
      )}
    </button>
  );
}

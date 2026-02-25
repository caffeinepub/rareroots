import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useCreateOrder } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Product, Producer } from '../backend';
import { Minus, Plus, CheckCircle } from 'lucide-react';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  producer?: Producer;
}

const PAYMENT_METHODS = [
  { id: 'phonepe', label: 'PhonePe', emoji: '📱', color: '#5f259f' },
  { id: 'gpay', label: 'GPay', emoji: '🔵', color: '#1a73e8' },
  { id: 'paytm', label: 'Paytm', emoji: '💙', color: '#00b9f1' },
  { id: 'bank', label: 'Bank', emoji: '🏦', color: '#555' },
];

export default function PurchaseModal({ isOpen, onClose, product, producer }: PurchaseModalProps) {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState('phonepe');
  const createOrder = useCreateOrder();

  const maxQty = Math.min(Number(product.stock), 10);
  const totalPrice = Number(product.price) * quantity;
  const producerShare = Math.round(totalPrice * 0.92);
  const platformFee = totalPrice - producerShare;
  const producerName = producer?.brandName || producer?.name || 'the producer';

  const handleConfirm = async () => {
    try {
      const orderId = await createOrder.mutateAsync({
        productId: product.id,
        quantity: BigInt(quantity),
      });
      onClose();
      navigate({ to: `/order-confirmation/${orderId}` });
    } catch (err) {
      console.error('Order creation failed:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm mx-auto"
        style={{ borderRadius: '16px', backgroundColor: '#FFFFF0' }}
      >
        <DialogHeader>
          <DialogTitle className="font-poppins font-bold" style={{ color: '#8B4513', fontSize: '20px' }}>
            Complete Purchase
          </DialogTitle>
          <DialogDescription className="font-roboto" style={{ color: '#666' }}>
            Review your order before confirming
          </DialogDescription>
        </DialogHeader>

        {/* Order Summary */}
        <div
          className="rounded-card p-4 mb-4"
          style={{ backgroundColor: 'white', boxShadow: '0px 2px 6px rgba(0,0,0,0.08)' }}
        >
          <div className="flex gap-3 mb-3">
            {product.thumbnail && (
              <img
                src={product.thumbnail.getDirectURL()}
                alt={product.title}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/generated/product-placeholder.dim_600x600.png'; }}
              />
            )}
            <div className="flex-1">
              <p className="font-poppins font-semibold text-sm" style={{ color: '#8B4513' }}>
                {product.title}
              </p>
              <p className="font-roboto text-xs mt-1" style={{ color: '#666' }}>
                by {producerName}
              </p>
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center justify-between mb-3">
            <span className="font-roboto text-sm" style={{ color: '#555' }}>Quantity</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full border flex items-center justify-center"
                style={{ borderColor: '#DAA520', color: '#DAA520' }}
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-poppins font-bold w-6 text-center" style={{ color: '#8B4513' }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                className="w-8 h-8 rounded-full border flex items-center justify-center"
                style={{ borderColor: '#DAA520', color: '#DAA520' }}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="border-t pt-3" style={{ borderColor: 'rgba(218,165,32,0.3)' }}>
            <div className="flex justify-between mb-1">
              <span className="font-roboto text-sm" style={{ color: '#555' }}>Total</span>
              <span className="font-poppins font-bold" style={{ color: '#228B22', fontSize: '18px' }}>
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" style={{ color: '#228B22' }} />
              <p className="font-roboto text-xs" style={{ color: '#228B22' }}>
                92% → {producerName} direct (8% platform)
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-4">
          <p className="font-poppins font-semibold text-sm mb-3" style={{ color: '#8B4513' }}>
            Select Payment Method
          </p>
          <div className="grid grid-cols-4 gap-2">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all"
                style={{
                  borderColor: selectedPayment === method.id ? '#DAA520' : '#e5e7eb',
                  backgroundColor: selectedPayment === method.id ? 'rgba(218,165,32,0.08)' : 'white',
                }}
              >
                <span style={{ fontSize: '20px' }}>{method.emoji}</span>
                <span className="font-roboto text-xs" style={{ color: '#555', fontSize: '10px' }}>
                  {method.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={createOrder.isPending}
          className="btn-primary"
        >
          {createOrder.isPending ? (
            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent spinner-cw" />
          ) : (
            `Pay ₹${totalPrice.toLocaleString('en-IN')}`
          )}
        </button>

        {createOrder.isError && (
          <p className="text-center text-sm mt-2" style={{ color: '#FF4500' }}>
            Failed to place order. Please try again.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

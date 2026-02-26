import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Minus, Plus, AlertCircle, CreditCard, Smartphone } from "lucide-react";
import { useCreateOrder } from "../hooks/useQueries";
import { useRazorpay } from "../hooks/useRazorpay";
import type { Product } from "../hooks/useQueries";
import { toast } from "sonner";

interface PurchaseModalProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  producerName?: string;
}

export default function PurchaseModal({ open, onClose, product, producerName }: PurchaseModalProps) {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const createOrder = useCreateOrder();
  const { openPayment, isAvailable: razorpayAvailable } = useRazorpay();

  const maxQty = Math.min(Number(product.stock), 10);
  const totalPrice = Number(product.price) * quantity;
  const producerCut = Math.round(totalPrice * 0.92);
  const platformFee = totalPrice - producerCut;

  const handlePayWithRazorpay = async () => {
    setPaymentError(null);
    setIsProcessing(true);

    try {
      // Open Razorpay payment sheet
      const paymentResponse = await openPayment({
        amount: totalPrice,
        name: producerName || "SamriddhiSrot",
        description: `${product.title} × ${quantity}`,
        prefillName: "",
        prefillContact: "",
      });

      // On payment success, create order in backend
      const orderId = await createOrder.mutateAsync({
        productId: product.id,
        quantity: BigInt(quantity),
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
      });

      toast.success("Payment successful! Order placed.");
      onClose();
      navigate({ to: "/order-confirmation/$orderId", params: { orderId } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Payment failed";
      if (message === "Payment cancelled by user") {
        setPaymentError("Payment was cancelled. Please try again.");
      } else {
        setPaymentError(message);
        toast.error(message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setPaymentError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="font-poppins text-earthBrown">Confirm Purchase</DialogTitle>
          <DialogDescription className="font-roboto text-earthBrown/60">
            {product.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Quantity */}
          <div>
            <p className="font-poppins text-sm font-medium text-earthBrown mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={isProcessing}
                className="w-8 h-8 rounded-full border border-earthBrown/30 flex items-center justify-center hover:bg-earthBrown/5 disabled:opacity-50"
              >
                <Minus size={14} />
              </button>
              <span className="font-poppins font-semibold text-earthBrown w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                disabled={isProcessing}
                className="w-8 h-8 rounded-full border border-earthBrown/30 flex items-center justify-center hover:bg-earthBrown/5 disabled:opacity-50"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Payment Method Info */}
          <div>
            <p className="font-poppins text-sm font-medium text-earthBrown mb-2">Payment</p>
            <div className="flex items-center gap-2 p-3 rounded-lg border border-earthBrown/20 bg-ivoryCream/50">
              <div className="flex gap-1.5">
                <Smartphone size={16} className="text-earthBrown" />
                <CreditCard size={16} className="text-earthBrown" />
              </div>
              <div className="flex-1">
                <p className="font-poppins text-xs font-medium text-earthBrown">
                  UPI / Cards / Net Banking
                </p>
                <p className="font-roboto text-xs text-earthBrown/50">
                  PhonePe · GPay · Paytm · Bank
                </p>
              </div>
              <span className="text-xs font-poppins font-semibold text-forestGreen bg-forestGreen/10 px-2 py-0.5 rounded-full">
                Secure
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-ivoryCream rounded-lg p-3 space-y-1">
            <div className="flex justify-between text-xs font-roboto text-earthBrown/70">
              <span>Price × {quantity}</span>
              <span>₹{totalPrice.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-xs font-roboto text-forestGreen">
              <span>Direct to artisan (92%)</span>
              <span>₹{producerCut.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-xs font-roboto text-earthBrown/50">
              <span>Platform fee (8%)</span>
              <span>₹{platformFee.toLocaleString("en-IN")}</span>
            </div>
            <div className="border-t border-earthBrown/10 pt-1 flex justify-between font-poppins font-bold text-earthBrown">
              <span>Total</span>
              <span>₹{totalPrice.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Payment Error */}
          {paymentError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="font-roboto text-xs text-red-600">{paymentError}</p>
            </div>
          )}

          {/* Razorpay not available warning */}
          {!razorpayAvailable && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="font-roboto text-xs text-amber-700">
                Payment gateway is loading. Please ensure you have an internet connection.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayWithRazorpay}
            disabled={isProcessing || !razorpayAvailable}
            className="flex-1 bg-earthBrown hover:bg-earthBrown/90 text-ivoryCream"
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Processing…
              </>
            ) : (
              `Pay ₹${totalPrice.toLocaleString("en-IN")}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

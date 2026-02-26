import { useParams, useNavigate } from "@tanstack/react-router";
import Layout from "../components/Layout";
import { useGetOrder, useGetProduct, useGetProducer } from "../hooks/useQueries";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, MessageCircle, Home, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderConfirmation() {
  const { orderId } = useParams({ from: "/order-confirmation/$orderId" });
  const navigate = useNavigate();

  const { data: order, isLoading: orderLoading } = useGetOrder(orderId);
  const { data: product, isLoading: productLoading } = useGetProduct(
    order?.productId ?? null
  );
  const { data: producer } = useGetProducer(
    product ? product.producerId.toString() : null
  );

  const isLoading = orderLoading || productLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="px-4 py-8 space-y-4">
          <Skeleton className="h-20 w-20 rounded-full mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (!order || !product) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <p className="font-poppins text-earthBrown/60">Order not found</p>
          <Button
            onClick={() => navigate({ to: "/home" })}
            className="mt-4 bg-earthBrown text-ivoryCream"
          >
            Go Home
          </Button>
        </div>
      </Layout>
    );
  }

  const producerName = producer?.brandName || producer?.name || "the artisan";
  const whatsAppNumber = producer?.whatsApp?.replace(/\D/g, "") || "";
  const trackingMessage = `Hi, I placed an order for ${product.title}. Order ID: ${order.id.slice(-8)}${order.razorpayPaymentId ? `. Payment Ref: ${order.razorpayPaymentId}` : ""}`;
  const whatsAppLink = whatsAppNumber
    ? `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(trackingMessage)}`
    : null;

  const thumbnailUrl = product.thumbnail
    ? product.thumbnail.getDirectURL()
    : "/assets/generated/product-placeholder.dim_600x600.png";

  const totalAmount = Number(product.price) * Number(order.quantity);
  const producerCut = Math.round(totalAmount * 0.92);

  return (
    <Layout>
      <div className="px-4 py-8 flex flex-col items-center">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-forestGreen/10 flex items-center justify-center mb-4">
          <CheckCircle size={40} className="text-forestGreen" />
        </div>

        <h1 className="font-poppins font-bold text-2xl text-earthBrown mb-1">
          Order Placed!
        </h1>
        <p className="font-roboto text-earthBrown/60 text-sm mb-6 text-center">
          Your order has been confirmed. The artisan will contact you soon.
        </p>

        {/* Order Summary */}
        <div className="w-full bg-white rounded-xl p-4 shadow-sm border border-earthBrown/10 mb-4">
          <div className="flex gap-3">
            <img
              src={thumbnailUrl}
              alt={product.title}
              className="w-16 h-16 rounded-lg object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-poppins font-semibold text-earthBrown text-sm truncate">
                {product.title}
              </p>
              <p className="font-roboto text-xs text-earthBrown/60 mt-0.5">
                by {producerName}
              </p>
              <p className="font-roboto text-xs text-earthBrown/60 mt-0.5">
                Qty: {Number(order.quantity)} · ₹{totalAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-earthBrown/10 space-y-1.5">
            <div className="flex justify-between text-xs font-roboto text-earthBrown/60">
              <span>Order ID</span>
              <span className="font-mono">#{order.id.slice(-8)}</span>
            </div>
            <div className="flex justify-between text-xs font-roboto text-earthBrown/60">
              <span>Status</span>
              <span className="capitalize text-sandGold font-medium">{order.status}</span>
            </div>
            <div className="flex justify-between text-xs font-roboto text-forestGreen">
              <span>Direct to artisan (92%)</span>
              <span>₹{producerCut.toLocaleString("en-IN")}</span>
            </div>
            {order.razorpayPaymentId && (
              <div className="flex justify-between text-xs font-roboto text-earthBrown/60">
                <span className="flex items-center gap-1">
                  <Receipt size={11} />
                  Payment Ref
                </span>
                <span className="font-mono text-earthBrown/80">{order.razorpayPaymentId}</span>
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp Tracking Prompt */}
        {whatsAppLink && (
          <div className="w-full bg-forestGreen/5 border border-forestGreen/20 rounded-xl p-4 mb-4">
            <p className="font-poppins text-sm font-semibold text-earthBrown mb-1">
              Track your order via WhatsApp
            </p>
            <p className="font-roboto text-xs text-earthBrown/60 mb-3">
              Message {producerName} directly to get real-time updates on your order.
            </p>
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-forestGreen text-white font-poppins font-semibold py-3 rounded-full hover:bg-forestGreen/90 transition-colors no-underline"
            >
              <MessageCircle size={18} />
              Track via WhatsApp
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="w-full space-y-3">
          <Button
            onClick={() => navigate({ to: "/orders" })}
            variant="outline"
            className="w-full border-earthBrown/30 text-earthBrown font-poppins"
          >
            View My Orders
          </Button>
          <Button
            onClick={() => navigate({ to: "/home" })}
            variant="ghost"
            className="w-full text-earthBrown/60 font-poppins"
          >
            <Home size={16} className="mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </Layout>
  );
}

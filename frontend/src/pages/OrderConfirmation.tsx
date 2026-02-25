import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import Layout from '../components/Layout';
import { useGetOrder, useGetProduct, useGetProducer } from '../hooks/useQueries';
import { CheckCircle, MessageCircle, Home, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrderConfirmation() {
  // Use the param name matching the route: /order-confirmation/$orderId
  const { orderId } = useParams({ from: '/order-confirmation/$orderId' });
  const navigate = useNavigate();

  const { data: order, isLoading: orderLoading } = useGetOrder(orderId);
  const { data: product } = useGetProduct(order?.productId ?? null);
  // producerId is a Principal; convert to string for the hook
  const producerIdStr = product ? product.producerId.toString() : null;
  const { data: producer } = useGetProducer(producerIdStr);

  if (orderLoading) {
    return (
      <Layout>
        <div className="px-4 py-8 space-y-4">
          <Skeleton className="h-32 rounded-card" />
          <Skeleton className="h-24 rounded-card" />
          <Skeleton className="h-14 rounded-button" />
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <Package className="w-16 h-16 mb-4" style={{ color: '#DAA520' }} />
          <p className="font-poppins font-semibold" style={{ color: '#8B4513' }}>Order not found</p>
        </div>
      </Layout>
    );
  }

  const producerName = producer?.brandName || producer?.name || 'the producer';
  const whatsappMsg = `Hi ${producerName}! I just placed an order on SamriddhiSrot. Order ID: ${order.id}. Product: ${product?.title || ''}. Please confirm my order!`;
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <Layout>
      <div className="px-4 py-8 flex flex-col items-center">
        {/* Success Icon */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: 'rgba(34,139,34,0.1)' }}
        >
          <CheckCircle className="w-14 h-14" style={{ color: '#228B22' }} />
        </div>

        <h1 className="font-poppins font-bold text-2xl mb-2 text-center" style={{ color: '#8B4513' }}>
          Order Placed! 🎉
        </h1>
        <p className="font-roboto text-center mb-6" style={{ color: '#666' }}>
          Your rare find is on its way
        </p>

        {/* Order Details */}
        <div
          className="w-full rounded-card p-5 mb-5"
          style={{ backgroundColor: 'white', boxShadow: '0px 4px 8px rgba(0,0,0,0.1)' }}
        >
          <h2 className="font-poppins font-bold mb-4" style={{ color: '#8B4513', fontSize: '16px' }}>
            Order Summary
          </h2>

          {product && (
            <div className="flex gap-3 mb-4">
              {product.thumbnail && (
                <img
                  src={product.thumbnail.getDirectURL()}
                  alt={product.title}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/generated/product-placeholder.dim_600x600.png';
                  }}
                />
              )}
              <div>
                <p className="font-poppins font-semibold text-sm" style={{ color: '#8B4513' }}>
                  {product.title}
                </p>
                <p className="font-roboto text-xs mt-1" style={{ color: '#666' }}>
                  by {producerName}
                </p>
                <p className="font-poppins font-bold mt-1" style={{ color: '#228B22' }}>
                  ₹{Number(product.price) * Number(order.quantity)}
                </p>
              </div>
            </div>
          )}

          <div className="border-t pt-3 space-y-2" style={{ borderColor: 'rgba(218,165,32,0.3)' }}>
            <div className="flex justify-between">
              <span className="font-roboto text-sm" style={{ color: '#666' }}>Order ID</span>
              <span className="font-roboto text-sm font-medium" style={{ color: '#555' }}>
                #{order.id.slice(-8)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-roboto text-sm" style={{ color: '#666' }}>Quantity</span>
              <span className="font-roboto text-sm font-medium" style={{ color: '#555' }}>
                {Number(order.quantity)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-roboto text-sm" style={{ color: '#666' }}>Status</span>
              <span className="font-roboto text-sm font-medium capitalize" style={{ color: '#DAA520' }}>
                {order.status as string}
              </span>
            </div>
            <div className="flex items-center gap-1 pt-1">
              <CheckCircle className="w-3 h-3" style={{ color: '#228B22' }} />
              <span className="font-roboto text-xs" style={{ color: '#228B22' }}>
                92% goes directly to {producerName}
              </span>
            </div>
          </div>
        </div>

        {/* WhatsApp Tracking */}
        <div
          className="w-full rounded-card p-4 mb-5"
          style={{ backgroundColor: 'rgba(34,139,34,0.06)', border: '1px solid rgba(34,139,34,0.2)' }}
        >
          <p className="font-poppins font-semibold text-sm mb-2" style={{ color: '#228B22' }}>
            💬 Track via WhatsApp
          </p>
          <p className="font-roboto text-xs mb-3" style={{ color: '#555' }}>
            Message {producerName} directly for order updates and delivery tracking
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-12 rounded-button font-poppins font-semibold text-sm text-white no-underline"
            style={{ backgroundColor: '#228B22' }}
          >
            <MessageCircle className="w-5 h-5" />
            Message {producerName} on WhatsApp
          </a>
        </div>

        {/* Navigation Buttons */}
        <div className="w-full space-y-3">
          <button
            onClick={() => navigate({ to: '/orders' })}
            className="btn-outline-gold"
          >
            View My Collection
          </button>
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center justify-center gap-2 w-full font-roboto text-sm"
            style={{ color: '#8B4513' }}
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    </Layout>
  );
}

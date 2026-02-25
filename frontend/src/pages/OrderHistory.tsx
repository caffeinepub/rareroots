import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import Layout from '../components/Layout';
import { useGetOrdersByBuyer, useGetAllProducts, useGetAllProducers } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, RotateCcw, Package, CheckCircle, Truck, Clock, XCircle } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Pending', icon: <Clock className="w-4 h-4" />, color: '#DAA520' },
  confirmed: { label: 'Confirmed', icon: <CheckCircle className="w-4 h-4" />, color: '#4B0082' },
  shipped: { label: 'Shipped', icon: <Truck className="w-4 h-4" />, color: '#1a73e8' },
  delivered: { label: 'Delivered ✓', icon: <CheckCircle className="w-4 h-4" />, color: '#228B22' },
  cancelled: { label: 'Cancelled', icon: <XCircle className="w-4 h-4" />, color: '#FF4500' },
};

export default function OrderHistory() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [filter, setFilter] = useState<string>('all');

  const { data: orders, isLoading: ordersLoading } = useGetOrdersByBuyer();
  const { data: products } = useGetAllProducts();
  const { data: producers } = useGetAllProducers();

  if (!identity) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <Package className="w-16 h-16 mb-4" style={{ color: '#DAA520' }} />
          <h2 className="font-poppins font-bold text-xl mb-2" style={{ color: '#8B4513' }}>
            Login Required
          </h2>
          <p className="font-roboto text-center mb-6" style={{ color: '#666' }}>
            Please login to view your rare collection
          </p>
          <button
            onClick={() => navigate({ to: '/dashboard' })}
            className="btn-primary"
            style={{ width: 'auto', paddingLeft: '32px', paddingRight: '32px' }}
          >
            Login
          </button>
        </div>
      </Layout>
    );
  }

  const getProduct = (productId: string) => products?.find(p => p.id === productId);
  const getProducer = (producerId: string) => producers?.find(p => p.id.toString() === producerId);

  const filteredOrders = orders?.filter(o => {
    if (filter === 'all') return true;
    return (o.status as string) === filter;
  }) ?? [];

  const followedCount = producers?.length ?? 0;

  return (
    <Layout>
      <div className="px-4 py-4">
        {/* Header */}
        <h1 className="font-poppins font-bold mb-2" style={{ fontSize: '24px', color: '#8B4513' }}>
          My Rare Collection
        </h1>

        {/* Stats */}
        <div
          className="rounded-card p-4 mb-5 flex items-center justify-around"
          style={{ backgroundColor: 'white', boxShadow: '0px 4px 8px rgba(0,0,0,0.1)' }}
        >
          <div className="text-center">
            <p className="font-poppins font-bold text-2xl" style={{ color: '#8B4513' }}>
              {orders?.length ?? 0}
            </p>
            <p className="font-roboto text-xs" style={{ color: '#666' }}>Rare Finds</p>
          </div>
          <div className="w-px h-10" style={{ backgroundColor: 'rgba(218,165,32,0.3)' }} />
          <div className="text-center">
            <p className="font-poppins font-bold text-2xl" style={{ color: '#4B0082' }}>
              {followedCount}
            </p>
            <p className="font-roboto text-xs" style={{ color: '#666' }}>Following</p>
          </div>
          <div className="w-px h-10" style={{ backgroundColor: 'rgba(218,165,32,0.3)' }} />
          <div className="text-center">
            <p className="font-poppins font-bold text-2xl" style={{ color: '#228B22' }}>
              {orders?.filter(o => (o.status as string) === 'delivered').length ?? 0}
            </p>
            <p className="font-roboto text-xs" style={{ color: '#666' }}>Delivered</p>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4" style={{ scrollbarWidth: 'none' }}>
          {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`region-chip flex-shrink-0 capitalize ${filter === s ? 'active' : ''}`}
            >
              {s === 'all' ? 'All Orders' : s}
            </button>
          ))}
        </div>

        {/* Orders */}
        {ordersLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-card" />)}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto mb-4" style={{ color: '#DAA520' }} />
            <p className="font-poppins font-semibold text-lg" style={{ color: '#8B4513' }}>
              No orders yet
            </p>
            <p className="font-roboto text-sm mt-2 mb-6" style={{ color: '#666' }}>
              Discover rare artisan products
            </p>
            <button
              onClick={() => navigate({ to: '/' })}
              className="btn-primary"
              style={{ width: 'auto', paddingLeft: '32px', paddingRight: '32px' }}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const product = getProduct(order.productId);
              const producer = product ? getProducer(product.producerId.toString()) : null;
              const thumbnailUrl = product?.thumbnail
                ? product.thumbnail.getDirectURL()
                : '/assets/generated/product-placeholder.dim_600x600.png';
              const statusKey = order.status as string;
              const statusInfo = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
              const isDelivered = (order.status as string) === 'delivered';

              return (
                <div
                  key={order.id}
                  className="rounded-card p-4 flex gap-3"
                  style={{ backgroundColor: 'white', boxShadow: '0px 4px 8px rgba(0,0,0,0.1)' }}
                >
                  {/* Thumbnail */}
                  <img
                    src={thumbnailUrl}
                    alt={product?.title || 'Product'}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/generated/product-placeholder.dim_600x600.png';
                    }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-poppins font-semibold text-sm leading-tight truncate"
                      style={{ color: '#8B4513' }}
                    >
                      {product?.title || 'Unknown Product'}
                    </h3>
                    <p className="font-roboto text-xs mt-0.5" style={{ color: '#666' }}>
                      {producer?.brandName || producer?.name || 'Unknown Producer'}
                    </p>

                    {/* Stars */}
                    {isDelivered && (
                      <div className="flex gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className="w-3 h-3"
                            style={{
                              color: star <= 4 ? '#DAA520' : '#ddd',
                              fill: star <= 4 ? '#DAA520' : 'none',
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Status */}
                    <div
                      className="flex items-center gap-1 mt-1"
                      style={{ color: statusInfo.color }}
                    >
                      {statusInfo.icon}
                      <span className="font-roboto text-xs font-medium">{statusInfo.label}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-2">
                      {product && (
                        <button
                          onClick={() => navigate({ to: `/products/${product.id}` })}
                          className="flex items-center gap-1 font-roboto text-xs"
                          style={{ color: '#DAA520' }}
                        >
                          <RotateCcw className="w-3 h-3" />
                          Re-order
                        </button>
                      )}
                      {isDelivered && producer && (
                        <button
                          className="font-roboto text-xs"
                          style={{ color: '#4B0082' }}
                          onClick={() => navigate({ to: `/producers/${producer.id.toString()}` })}
                        >
                          Rate {producer.brandName || producer.name}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex-shrink-0 text-right">
                    <p className="font-poppins font-bold text-sm" style={{ color: '#228B22' }}>
                      ₹{product ? Number(product.price) * Number(order.quantity) : 0}
                    </p>
                    <p className="font-roboto text-xs mt-0.5" style={{ color: '#666' }}>
                      Qty: {Number(order.quantity)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

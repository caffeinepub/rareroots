import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllProducts, useGetAllProducers } from '../hooks/useQueries';
import BadgePill from './BadgePill';
import { Skeleton } from '@/components/ui/skeleton';

export default function FeaturedProducers() {
  const navigate = useNavigate();
  const { data: products, isLoading: productsLoading } = useGetAllProducts();
  const { data: producers } = useGetAllProducers();

  const featuredProducts = products?.filter(p => p.rarityBadge && Number(p.stock) > 0).slice(0, 8) ?? [];

  const getProducerName = (producerId: string) => {
    const producer = producers?.find(p => p.id.toString() === producerId);
    return producer?.brandName || producer?.name || 'Unknown Producer';
  };

  if (productsLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="flex-shrink-0 w-36 h-52 rounded-card" />
        ))}
      </div>
    );
  }

  if (featuredProducts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 font-roboto">
        No featured products yet
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
      {featuredProducts.map((product) => {
        const thumbnailUrl = product.thumbnail
          ? product.thumbnail.getDirectURL()
          : '/assets/generated/product-placeholder.dim_600x600.png';
        const isLowStock = Number(product.stock) <= 5;

        return (
          <div
            key={product.id}
            className="flex-shrink-0 cursor-pointer hover:shadow-lg transition-shadow"
            style={{
              width: '140px',
              borderRadius: '12px',
              backgroundColor: 'white',
              boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
            onClick={() => navigate({ to: `/products/${product.id}` })}
          >
            {/* Image */}
            <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
              <img
                src={thumbnailUrl}
                alt={product.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/generated/product-placeholder.dim_600x600.png';
                }}
              />
              {isLowStock && (
                <div className="absolute top-2 left-2">
                  <BadgePill text={`🏔️ Only ${Number(product.stock)} Left`} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-2">
              <p
                className="font-poppins font-semibold text-xs leading-tight line-clamp-2 mb-1"
                style={{ color: '#8B4513' }}
              >
                {product.title}
              </p>
              <p className="font-roboto text-xs" style={{ color: '#666' }}>
                {getProducerName(product.producerId.toString())}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

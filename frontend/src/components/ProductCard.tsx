import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Product } from '../backend';
import BadgePill from './BadgePill';

interface ProductCardProps {
  product: Product;
  accentColor?: string;
}

export default function ProductCard({ product, accentColor }: ProductCardProps) {
  const navigate = useNavigate();
  const thumbnailUrl = product.thumbnail ? product.thumbnail.getDirectURL() : '/assets/generated/product-placeholder.dim_600x600.png';
  const isLowStock = Number(product.stock) > 0 && Number(product.stock) <= 5;
  const isOutOfStock = Number(product.stock) === 0;

  return (
    <div
      className="product-card cursor-pointer hover:shadow-lg transition-shadow"
      style={{ borderRadius: '12px', overflow: 'hidden' }}
      onClick={() => navigate({ to: `/products/${product.id}` })}
    >
      {/* Product Image */}
      <div className="relative" style={{ height: '140px', overflow: 'hidden' }}>
        <img
          src={thumbnailUrl}
          alt={product.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/generated/product-placeholder.dim_600x600.png';
          }}
        />
        {product.rarityBadge && (
          <div className="absolute top-2 left-2">
            <BadgePill text={`🏷️ ${product.rarityBadge}`} />
          </div>
        )}
        {isLowStock && (
          <div className="absolute top-2 right-2">
            <span
              className="badge-pill animate-blink"
              style={{ backgroundColor: '#FF4500', fontSize: '11px', height: '28px', padding: '0 8px' }}
            >
              ⏳ Only {Number(product.stock)} Left
            </span>
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="text-white font-poppins font-bold text-sm">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3
          className="font-poppins font-bold text-sm leading-tight mb-1 line-clamp-2"
          style={{ color: '#8B4513' }}
        >
          {product.title}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span
            className="font-poppins font-bold text-base"
            style={{ color: '#228B22' }}
          >
            ₹{Number(product.price).toLocaleString('en-IN')}
          </span>
          {accentColor && (
            <div
              className="w-3 h-3 rounded-full border border-gray-200"
              style={{ backgroundColor: accentColor }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

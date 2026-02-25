import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import Layout from '../components/Layout';
import BadgePill from '../components/BadgePill';
import VoiceNotePlayer from '../components/VoiceNotePlayer';
import PurchaseModal from '../components/PurchaseModal';
import PurchaseButton from '../components/PurchaseButton';
import { useGetProduct, useGetProducer } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetail() {
  // Use the old param name that matches the route definition
  const { productId } = useParams({ from: '/products/$productId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);

  const { data: product, isLoading: productLoading } = useGetProduct(productId);
  // producerId is a Principal; convert to string for the hook
  const producerIdStr = product ? product.producerId.toString() : null;
  const { data: producer } = useGetProducer(producerIdStr);

  if (productLoading) {
    return (
      <Layout>
        <div className="px-4 py-4 space-y-4">
          <Skeleton className="h-72 rounded-card" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-12 rounded-card" />
          <Skeleton className="h-14 rounded-button" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="font-poppins font-semibold" style={{ color: '#8B4513' }}>Product not found</p>
          <button onClick={() => navigate({ to: '/' })} className="mt-4" style={{ color: '#DAA520' }}>
            Back to Home
          </button>
        </div>
      </Layout>
    );
  }

  const thumbnailUrl = product.thumbnail
    ? product.thumbnail.getDirectURL()
    : '/assets/generated/product-placeholder.dim_600x600.png';
  const isLowStock = Number(product.stock) > 0 && Number(product.stock) <= 5;
  const isOutOfStock = Number(product.stock) === 0;
  const producerName = producer?.brandName || producer?.name || 'Unknown Producer';

  const whatsappLink = `https://wa.me/?text=Hi%20${encodeURIComponent(producerName)}%2C%20I%27m%20interested%20in%20a%20custom%20order%20for%20${encodeURIComponent(product.title)}%20from%20SamriddhiSrot!`;

  return (
    <Layout>
      <div>
        {/* Back Button */}
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={() => navigate({ to: '/products' })}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(139,69,19,0.1)' }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: '#8B4513' }} />
          </button>
        </div>

        {/* Product Image */}
        <div className="relative mx-4 rounded-card overflow-hidden" style={{ height: '300px' }}>
          <img
            src={thumbnailUrl}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/generated/product-placeholder.dim_600x600.png';
            }}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="font-poppins font-bold text-white text-xl">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="px-4 pt-4 space-y-4">
          {/* Title */}
          <h1
            className="font-poppins font-bold leading-tight"
            style={{ fontSize: '22px', color: '#8B4513' }}
          >
            {product.title}
            {producer && (
              <span className="font-roboto font-normal text-base" style={{ color: '#666' }}>
                {' '}by {producerName}
              </span>
            )}
          </h1>

          {/* Badges Row */}
          <div className="flex flex-wrap gap-2 items-center">
            {product.rarityBadge && (
              <BadgePill text={`🏷️ ${product.rarityBadge}`} />
            )}
            {isLowStock && (
              <span
                className="animate-blink inline-flex items-center font-poppins font-semibold whitespace-nowrap"
                style={{
                  height: '32px',
                  padding: '0 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  backgroundColor: '#FF4500',
                  color: 'white',
                }}
              >
                ⏳ Only {Number(product.stock)} Left
              </span>
            )}
            {product.region && (
              <BadgePill text={product.region} variant="indigo" />
            )}
          </div>

          {/* Price */}
          <div>
            <span
              className="font-poppins font-bold"
              style={{ fontSize: '28px', color: '#228B22' }}
            >
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <p
              className="font-playfair italic"
              style={{ fontSize: '16px', color: '#555', lineHeight: '1.6' }}
            >
              {product.description}
            </p>
          )}

          {/* Voice Story */}
          {product.voiceNote && (
            <div>
              <p className="font-poppins font-semibold text-sm mb-2" style={{ color: '#8B4513' }}>
                🎙️ Origin Story
              </p>
              <VoiceNotePlayer blob={product.voiceNote} label="Product Story" />
            </div>
          )}

          {/* Producer Link */}
          {producer && (
            <button
              onClick={() => navigate({ to: `/producers/${producer.id.toString()}` })}
              className="flex items-center gap-2 font-roboto text-sm"
              style={{ color: '#4B0082' }}
            >
              <ExternalLink className="w-4 h-4" />
              View {producerName}'s full profile
            </button>
          )}

          {/* Buy Buttons */}
          <div className="space-y-3 pb-4">
            <PurchaseButton
              onClick={() => {
                if (!identity) {
                  navigate({ to: '/orders' });
                  return;
                }
                setIsPurchaseOpen(true);
              }}
              disabled={isOutOfStock}
              price={Number(product.price)}
            />

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-gold no-underline"
            >
              💬 Custom Request via WhatsApp
            </a>
          </div>
        </div>
      </div>

      {product && (
        <PurchaseModal
          isOpen={isPurchaseOpen}
          onClose={() => setIsPurchaseOpen(false)}
          product={product}
          producer={producer ?? undefined}
        />
      )}
    </Layout>
  );
}

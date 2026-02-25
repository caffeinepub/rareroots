import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import Layout from '../components/Layout';
import BadgePill from '../components/BadgePill';
import VoiceNotePlayer from '../components/VoiceNotePlayer';
import ProductCard from '../components/ProductCard';
import { useGetProducer, useGetProductsByProducer, useFollowProducer, useUnfollowProducer, useIsFollowing } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { ArrowLeft, Phone, MessageCircle, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProducerProfile() {
  // Use the param name matching the route: /producers/$producerId
  const { producerId } = useParams({ from: '/producers/$producerId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  // Hooks expect string IDs
  const { data: producer, isLoading: producerLoading } = useGetProducer(producerId);
  const { data: products, isLoading: productsLoading } = useGetProductsByProducer(producerId);

  const userPrincipalStr = identity?.getPrincipal().toString() ?? null;
  const { data: isFollowing } = useIsFollowing(producerId, userPrincipalStr);

  const followMutation = useFollowProducer();
  const unfollowMutation = useUnfollowProducer();

  const handleFollowToggle = async () => {
    if (!identity) return;
    if (isFollowing) {
      await unfollowMutation.mutateAsync(producerId);
    } else {
      await followMutation.mutateAsync(producerId);
    }
  };

  const formatFollowers = (count: bigint) => {
    const n = Number(count);
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  if (producerLoading) {
    return (
      <Layout>
        <div className="px-4 py-4 space-y-4">
          <Skeleton className="h-48 rounded-card" />
          <Skeleton className="h-32 rounded-card" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 rounded-card" />)}
          </div>
        </div>
      </Layout>
    );
  }

  if (!producer) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="font-poppins font-semibold" style={{ color: '#8B4513' }}>Producer not found</p>
          <button
            onClick={() => navigate({ to: '/discover' })}
            className="mt-4 underline"
            style={{ color: '#DAA520' }}
          >
            Back to Discover
          </button>
        </div>
      </Layout>
    );
  }

  const photoUrl = producer.profilePhoto
    ? producer.profilePhoto.getDirectURL()
    : '/assets/generated/producer-avatar-placeholder.dim_200x200.png';
  const logoUrl = producer.brandLogoBlob
    ? producer.brandLogoBlob.getDirectURL()
    : photoUrl;

  const whatsappLink = `https://wa.me/?text=Hi%20${encodeURIComponent(producer.brandName || producer.name)}%2C%20I%20found%20you%20on%20SamriddhiSrot!`;

  return (
    <Layout>
      <div>
        {/* Header Section */}
        <div
          className="relative px-4 pt-4 pb-6"
          style={{
            background: producer.brandColor
              ? `linear-gradient(180deg, ${producer.brandColor}22 0%, #FFFFF0 100%)`
              : 'linear-gradient(180deg, rgba(75,0,130,0.08) 0%, #FFFFF0 100%)',
          }}
        >
          {/* Back + Follow row */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate({ to: '/discover' })}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(139,69,19,0.1)' }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: '#8B4513' }} />
            </button>
            {identity && (
              <button
                onClick={handleFollowToggle}
                disabled={followMutation.isPending || unfollowMutation.isPending}
                className="px-5 py-2 rounded-button font-poppins font-semibold text-sm transition-all"
                style={{
                  backgroundColor: isFollowing ? 'transparent' : '#DAA520',
                  color: isFollowing ? '#DAA520' : 'white',
                  border: `2px solid #DAA520`,
                }}
              >
                {followMutation.isPending || unfollowMutation.isPending
                  ? '...'
                  : isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          {/* Producer Info */}
          <div className="flex items-center gap-4">
            <img
              src={logoUrl}
              alt={producer.name}
              className="w-20 h-20 rounded-full object-cover"
              style={{ boxShadow: '0px 4px 8px rgba(0,0,0,0.15)', border: '3px solid white' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/generated/producer-avatar-placeholder.dim_200x200.png';
              }}
            />
            <div>
              <h1
                className="font-poppins font-bold leading-tight"
                style={{ fontSize: '26px', color: '#8B4513' }}
              >
                {producer.brandName || producer.name}
              </h1>
              <div className="flex items-center gap-1 mt-1">
                <Users className="w-4 h-4" style={{ color: '#666' }} />
                <span className="font-roboto text-sm" style={{ color: '#666' }}>
                  {formatFollowers(producer.followerCount)} Followers
                </span>
              </div>
              {producer.region && (
                <BadgePill text={producer.region} className="mt-2" />
              )}
            </div>
          </div>
        </div>

        <div className="px-4 space-y-5 pb-4">
          {/* Brand Story */}
          <div
            className="rounded-card p-4"
            style={{ backgroundColor: 'white', boxShadow: '0px 4px 8px rgba(0,0,0,0.1)' }}
          >
            <h2 className="font-poppins font-bold mb-3" style={{ color: '#8B4513', fontSize: '16px' }}>
              🖼️ Brand Story
            </h2>
            {producer.bio && (
              <p className="font-playfair italic mb-3" style={{ fontSize: '15px', color: '#444' }}>
                {producer.bio}
              </p>
            )}
            {producer.brandTagline && (
              <p className="font-roboto text-sm mb-3" style={{ color: '#666' }}>
                {producer.brandTagline}
              </p>
            )}
            {producer.voiceStoryBlob && (
              <VoiceNotePlayer blob={producer.voiceStoryBlob} label="Brand Story" />
            )}
          </div>

          {/* Products */}
          <div>
            <h2 className="font-poppins font-bold mb-3" style={{ color: '#8B4513', fontSize: '18px' }}>
              🛍️ Products
            </h2>
            {productsLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 rounded-card" />)}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    accentColor={producer.brandColor || undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 font-roboto">
                No products yet
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-14 rounded-button font-poppins font-semibold text-sm text-white no-underline"
              style={{ backgroundColor: '#228B22' }}
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp Chat
            </a>
            <button
              className="flex items-center justify-center gap-2 h-14 rounded-button font-poppins font-semibold text-sm"
              style={{ backgroundColor: '#DAA520', color: 'white' }}
              onClick={() => alert('Live call feature coming soon!')}
            >
              <Phone className="w-5 h-5" />
              Live Call
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import VoiceNotePlayer from "../components/VoiceNotePlayer";
import BadgePill from "../components/BadgePill";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Heart, Phone, MessageCircle, ArrowLeft } from "lucide-react";
import {
  useGetProducer,
  useGetProductsByProducer,
  useFollowProducer,
  useUnfollowProducer,
  useIsFollowing,
} from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { toast } from "sonner";

export default function ProducerProfile() {
  const { producerId } = useParams({ from: "/producers/$producerId" });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  const { data: producer, isLoading: producerLoading } = useGetProducer(producerId);
  const { data: products = [], isLoading: productsLoading } =
    useGetProductsByProducer(producerId);

  const userPrincipal = identity?.getPrincipal().toString() || null;
  const { data: isFollowing = false } = useIsFollowing(producerId, userPrincipal);

  const followMutation = useFollowProducer();
  const unfollowMutation = useUnfollowProducer();

  const handleFollowToggle = async () => {
    if (!identity) {
      toast.error("Please login to follow producers");
      return;
    }
    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync(producerId);
        toast.success("Unfollowed");
      } else {
        await followMutation.mutateAsync(producerId);
        toast.success("Following!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed";
      toast.error(msg);
    }
  };

  const avatarUrl = producer?.profilePhoto
    ? producer.profilePhoto.getDirectURL()
    : "/assets/generated/producer-avatar-placeholder.dim_200x200.png";

  const logoUrl = producer?.brandLogoBlob
    ? producer.brandLogoBlob.getDirectURL()
    : null;

  if (producerLoading) {
    return (
      <Layout>
        <div className="px-4 py-4 space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-full" />
        </div>
      </Layout>
    );
  }

  if (!producer) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <p className="font-poppins text-earthBrown/60">Producer not found</p>
          <Button
            onClick={() => navigate({ to: "/discover" })}
            className="mt-4 bg-earthBrown text-ivoryCream"
          >
            Back to Discover
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Back button */}
      <div className="px-4 pt-4">
        <button
          onClick={() => navigate({ to: "/discover" })}
          className="flex items-center gap-1 text-earthBrown/60 hover:text-earthBrown text-sm font-roboto"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* Profile Header */}
      <div className="px-4 py-4">
        <div className="flex gap-4 items-start">
          <img
            src={avatarUrl}
            alt={producer.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-earthBrown/20 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-poppins font-bold text-earthBrown text-lg">
                {producer.name}
              </h1>
              {producer.rarityBadge && (
                <BadgePill variant="gold" size="sm">
                  {producer.rarityBadge}
                </BadgePill>
              )}
            </div>
            <p className="font-roboto text-sm text-earthBrown/60 mt-0.5">
              {producer.region}
            </p>
            <p className="font-roboto text-xs text-earthBrown/50 mt-0.5">
              {Number(producer.followerCount)} followers
            </p>
          </div>
        </div>

        {/* Follow button */}
        <Button
          onClick={handleFollowToggle}
          disabled={followMutation.isPending || unfollowMutation.isPending}
          variant={isFollowing ? "outline" : "default"}
          className={`mt-3 w-full font-poppins ${
            isFollowing
              ? "border-earthBrown/30 text-earthBrown"
              : "bg-earthBrown text-ivoryCream hover:bg-earthBrown/90"
          }`}
        >
          <Heart size={16} className={`mr-2 ${isFollowing ? "fill-earthBrown" : ""}`} />
          {isFollowing ? "Following" : "Follow"}
        </Button>
      </div>

      {/* Brand Section */}
      {(producer.brandName || producer.brandTagline) && (
        <div
          className="mx-4 rounded-xl p-4 mb-4"
          style={{ backgroundColor: producer.brandColor || "#FFF8E7" }}
        >
          <div className="flex items-center gap-3">
            {logoUrl && (
              <img
                src={logoUrl}
                alt={producer.brandName}
                className="w-12 h-12 rounded-lg object-contain"
              />
            )}
            <div>
              <p className="font-poppins font-bold text-earthBrown">
                {producer.brandName}
              </p>
              {producer.brandTagline && (
                <p className="font-roboto text-xs text-earthBrown/70 italic">
                  {producer.brandTagline}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bio */}
      {producer.bio && (
        <div className="px-4 mb-4">
          <p className="font-roboto text-sm text-earthBrown/80 leading-relaxed">
            {producer.bio}
          </p>
        </div>
      )}

      {/* Voice Story */}
      {producer.voiceStoryBlob && (
        <div className="px-4 mb-4">
          <VoiceNotePlayer blob={producer.voiceStoryBlob} label="Artisan's Voice Story" />
        </div>
      )}

      {/* Contact */}
      {producer.whatsApp && (
        <div className="px-4 mb-4 flex gap-2">
          <a
            href={`https://wa.me/${producer.whatsApp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-forestGreen text-white font-poppins text-sm py-2 rounded-full hover:bg-forestGreen/90 transition-colors"
          >
            <MessageCircle size={16} /> WhatsApp
          </a>
          <a
            href={`tel:${producer.whatsApp}`}
            className="flex-1 flex items-center justify-center gap-2 border border-earthBrown/30 text-earthBrown font-poppins text-sm py-2 rounded-full hover:bg-earthBrown/5 transition-colors"
          >
            <Phone size={16} /> Call
          </a>
        </div>
      )}

      {/* Products */}
      <div className="px-4 pb-4">
        <h2 className="font-poppins font-semibold text-earthBrown mb-3">
          Products ({products.length})
        </h2>
        {productsLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-earthBrown/50 font-roboto text-sm py-4">
            No products available
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import Layout from "../components/Layout";
import BadgePill from "../components/BadgePill";
import VoiceNotePlayer from "../components/VoiceNotePlayer";
import PurchaseModal from "../components/PurchaseModal";
import PurchaseButton from "../components/PurchaseButton";
import LiveVideoModal from "../components/LiveVideoModal";
import { useGetProduct, useGetProducer } from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { ArrowLeft, ExternalLink, Video } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ProductDetail() {
  const { productId } = useParams({ from: "/products/$productId" });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const { data: product, isLoading: productLoading } = useGetProduct(productId);
  const producerIdStr = product ? product.producerId.toString() : null;
  const { data: producer } = useGetProducer(producerIdStr);

  if (productLoading) {
    return (
      <Layout>
        <div className="px-4 py-4 space-y-4">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-14 rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="font-poppins font-semibold text-earthBrown">
            Product not found
          </p>
          <button
            onClick={() => navigate({ to: "/home" })}
            className="mt-4 text-sandGold font-roboto"
          >
            Back to Home
          </button>
        </div>
      </Layout>
    );
  }

  const thumbnailUrl = product.thumbnail
    ? product.thumbnail.getDirectURL()
    : "/assets/generated/product-placeholder.dim_600x600.png";
  const stockNum = Number(product.stock);
  const isLowStock = stockNum > 0 && stockNum < 5;
  const isOutOfStock = stockNum === 0;
  const producerName = producer?.brandName || producer?.name || "Unknown Producer";
  const hasLiveVideo = !!(product.liveVideoURL && product.liveVideoURL.trim() !== "");

  const whatsAppNumber = producer?.whatsApp?.replace(/\D/g, "") || "";
  const customizeMessage = `Hi, I want to customize ${product.title} from ${producerName}`;
  const liveCustomizeLink = whatsAppNumber
    ? `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(customizeMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(customizeMessage)}`;

  return (
    <TooltipProvider>
      <Layout>
        <div>
          {/* Back Button */}
          <div className="px-4 pt-4 pb-2">
            <button
              onClick={() => navigate({ to: "/products" })}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(139,69,19,0.1)" }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: "#8B4513" }} />
            </button>
          </div>

          {/* Product Image */}
          <div
            className="relative mx-4 rounded-xl overflow-hidden"
            style={{ height: "300px" }}
          >
            <img
              src={thumbnailUrl}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/assets/generated/product-placeholder.dim_600x600.png";
              }}
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="font-poppins font-bold text-white text-xl">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="px-4 pt-4 space-y-4">
            {/* Title */}
            <h1
              className="font-poppins font-bold leading-tight"
              style={{ fontSize: "22px", color: "#8B4513" }}
            >
              {product.title}
              {producer && (
                <span
                  className="font-roboto font-normal text-base"
                  style={{ color: "#666" }}
                >
                  {" "}
                  by {producerName}
                </span>
              )}
            </h1>

            {/* Badges Row */}
            <div className="flex flex-wrap gap-2 items-center">
              {product.rarityBadge && (
                <BadgePill variant="gold">
                  🏷️ {product.rarityBadge}
                </BadgePill>
              )}
              {isLowStock && (
                <span
                  className="animate-stock-alert inline-flex items-center font-poppins font-semibold whitespace-nowrap"
                  style={{
                    height: "32px",
                    padding: "0 12px",
                    borderRadius: "16px",
                    fontSize: "12px",
                    backgroundColor: "#FF4500",
                    color: "white",
                  }}
                >
                  ⏳ Only {stockNum} Left
                </span>
              )}
              {product.region && (
                <BadgePill variant="indigo">{product.region}</BadgePill>
              )}
            </div>

            {/* Price */}
            <div>
              <span
                className="font-poppins font-bold"
                style={{ fontSize: "28px", color: "#228B22" }}
              >
                ₹{Number(product.price).toLocaleString("en-IN")}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p
                className="font-playfair italic"
                style={{ fontSize: "16px", color: "#555", lineHeight: "1.6" }}
              >
                {product.description}
              </p>
            )}

            {/* Voice Story + Live Snap row */}
            <div className="space-y-3">
              {product.voiceNote && (
                <div>
                  <p
                    className="font-poppins font-semibold text-sm mb-2"
                    style={{ color: "#8B4513" }}
                  >
                    🎙️ Origin Story
                  </p>
                  <VoiceNotePlayer blob={product.voiceNote} label="Product Story" />
                </div>
              )}

              {/* LIVE SNAP button */}
              {hasLiveVideo ? (
                <button
                  onClick={() => setIsVideoOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 font-poppins font-bold text-sm"
                  style={{
                    border: "2px solid #DAA520",
                    borderRadius: "12px",
                    color: "#8B4513",
                    backgroundColor: "transparent",
                  }}
                >
                  <Video className="w-4 h-4" style={{ color: "#DAA520" }} />
                  ▶️ LIVE SNAP
                  <span
                    className="text-xs font-roboto font-normal"
                    style={{ color: "#DAA520" }}
                  >
                    15s making video
                  </span>
                </button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      disabled
                      className="flex items-center gap-2 px-4 py-2 font-poppins font-bold text-sm opacity-40 cursor-not-allowed"
                      style={{
                        border: "2px solid #DAA520",
                        borderRadius: "12px",
                        color: "#8B4513",
                        backgroundColor: "transparent",
                      }}
                    >
                      <Video className="w-4 h-4" style={{ color: "#DAA520" }} />
                      ▶️ LIVE SNAP
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>No video yet</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Producer Link */}
            {producer && (
              <button
                onClick={() =>
                  navigate({
                    to: "/producers/$producerId",
                    params: { producerId: producer.id.toString() },
                  })
                }
                className="flex items-center gap-2 font-roboto text-sm"
                style={{ color: "#4B0082" }}
              >
                <ExternalLink className="w-4 h-4" />
                View {producerName}'s full profile
              </button>
            )}

            {/* Buy Buttons */}
            <div className="space-y-3 pb-4">
              {isOutOfStock ? (
                <div
                  className="w-full h-14 flex items-center justify-center rounded-xl font-poppins font-bold text-lg"
                  style={{
                    backgroundColor: "#f3f4f6",
                    color: "#9ca3af",
                    border: "2px solid #e5e7eb",
                  }}
                >
                  😔 Out of Stock
                </div>
              ) : (
                <PurchaseButton
                  onClick={() => {
                    if (!identity) {
                      navigate({ to: "/orders" });
                      return;
                    }
                    setIsPurchaseOpen(true);
                  }}
                  disabled={false}
                  price={Number(product.price)}
                />
              )}

              {/* Live Customize button */}
              <a
                href={liveCustomizeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 font-poppins font-bold no-underline"
                style={{
                  width: "100%",
                  height: "56px",
                  borderRadius: "12px",
                  border: "2px solid #DAA520",
                  color: "#DAA520",
                  backgroundColor: "transparent",
                  fontSize: "16px",
                  textDecoration: "none",
                }}
              >
                💬 Live Customize
              </a>
            </div>
          </div>
        </div>

        {product && (
          <PurchaseModal
            open={isPurchaseOpen}
            onClose={() => setIsPurchaseOpen(false)}
            product={product}
          />
        )}

        {hasLiveVideo && (
          <LiveVideoModal
            open={isVideoOpen}
            onClose={() => setIsVideoOpen(false)}
            videoUrl={product.liveVideoURL!}
            title={product.title}
          />
        )}
      </Layout>
    </TooltipProvider>
  );
}

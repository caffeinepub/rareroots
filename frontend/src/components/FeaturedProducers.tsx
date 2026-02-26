import { useNavigate } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import BadgePill from "./BadgePill";
import type { Product, Producer } from "../hooks/useQueries";

interface FeaturedProducersProps {
  products: Product[];
  producers: Producer[];
  isLoading: boolean;
  selectedRegion: string;
}

export default function FeaturedProducers({
  products,
  producers,
  isLoading,
  selectedRegion,
}: FeaturedProducersProps) {
  const navigate = useNavigate();

  const verifiedProducerIds = new Set(producers.map((p) => p.id.toString()));

  const featured = products
    .filter((product) => {
      const inStock = Number(product.stock) > 0;
      const hasRarity = product.rarityBadge && product.rarityBadge.trim() !== "";
      const regionMatch =
        selectedRegion === "All" || product.region === selectedRegion;
      const isVerified = verifiedProducerIds.has(product.producerId.toString());
      return inStock && hasRarity && regionMatch && isVerified;
    })
    .slice(0, 8);

  if (!isLoading && featured.length === 0) return null;

  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-poppins font-semibold text-earthBrown text-base">
          ✨ Featured Rarities
        </h2>
        <button
          onClick={() => navigate({ to: "/products" })}
          className="text-xs text-sandGold font-poppins hover:underline"
        >
          View all
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="shrink-0 w-36">
                <Skeleton className="w-36 h-36 rounded-xl mb-2" />
                <Skeleton className="h-3 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))
          : featured.map((product) => {
              const producer = producers.find(
                (p) => p.id.toString() === product.producerId.toString()
              );
              const thumbnailUrl = product.thumbnail
                ? product.thumbnail.getDirectURL()
                : "/assets/generated/product-placeholder.dim_600x600.png";
              const isLowStock = Number(product.stock) <= 3 && Number(product.stock) > 0;

              return (
                <button
                  key={product.id}
                  onClick={() =>
                    navigate({ to: "/products/$productId", params: { productId: product.id } })
                  }
                  className="shrink-0 w-36 text-left group"
                >
                  <div className="relative w-36 h-36 rounded-xl overflow-hidden mb-2 shadow-sm">
                    <img
                      src={thumbnailUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.rarityBadge && (
                      <div className="absolute top-1.5 left-1.5">
                        <BadgePill variant="gold" size="sm">
                          {product.rarityBadge}
                        </BadgePill>
                      </div>
                    )}
                    {isLowStock && (
                      <div className="absolute bottom-1.5 right-1.5">
                        <BadgePill variant="red" size="sm">
                          Only {Number(product.stock)} left
                        </BadgePill>
                      </div>
                    )}
                  </div>
                  <p className="font-poppins text-xs font-semibold text-earthBrown truncate">
                    {product.title}
                  </p>
                  {producer && (
                    <p className="font-roboto text-xs text-earthBrown/60 truncate">
                      {producer.name}
                    </p>
                  )}
                  <p className="font-poppins text-xs font-bold text-forestGreen mt-0.5">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </p>
                </button>
              );
            })}
      </div>
    </section>
  );
}

import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import Layout from "../components/Layout";
import RegionFilter from "../components/RegionFilter";
import SearchBar from "../components/SearchBar";
import VoiceNotePlayer from "../components/VoiceNotePlayer";
import BadgePill from "../components/BadgePill";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetVerifiedProducers, useGetVerifiedProducts } from "../hooks/useQueries";

export default function ProducerDiscovery() {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: producers = [], isLoading: producersLoading } = useGetVerifiedProducers();
  const { data: products = [], isLoading: productsLoading } = useGetVerifiedProducts();

  const isLoading = producersLoading || productsLoading;

  const filteredProducers = useMemo(() => {
    return producers.filter((producer) => {
      const regionMatch =
        selectedRegion === "All" || producer.region === selectedRegion;
      const searchMatch =
        !searchQuery ||
        producer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        producer.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        producer.region.toLowerCase().includes(searchQuery.toLowerCase());
      const hasProducts = products.some(
        (p) => p.producerId.toString() === producer.id.toString() && Number(p.stock) > 0
      );
      return regionMatch && searchMatch && hasProducts;
    });
  }, [producers, products, selectedRegion, searchQuery]);

  return (
    <Layout>
      {/* Hero */}
      <div className="relative w-full overflow-hidden" style={{ height: "160px" }}>
        <img
          src="/assets/generated/discover-hero.dim_1200x400.png"
          alt="Discover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-earthBrown/60" />
        <div className="absolute inset-0 flex flex-col justify-center px-6">
          <h1 className="font-playfair text-ivoryCream text-xl font-bold">
            Discover Artisans
          </h1>
          <p className="font-roboto text-ivoryCream/80 text-sm mt-1">
            {filteredProducers.length} verified producers
          </p>
        </div>
      </div>

      <div className="px-4 pt-4 pb-2">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search artisans..." />
      </div>

      <div className="px-4 py-2">
        <RegionFilter selected={selectedRegion} onSelect={setSelectedRegion} />
      </div>

      <div className="px-4 py-2 space-y-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 flex gap-3">
                <Skeleton className="w-16 h-16 rounded-full shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))
          : filteredProducers.map((producer) => {
              const avatarUrl = producer.profilePhoto
                ? producer.profilePhoto.getDirectURL()
                : "/assets/generated/producer-avatar-placeholder.dim_200x200.png";

              const producerProducts = products.filter(
                (p) =>
                  p.producerId.toString() === producer.id.toString() &&
                  Number(p.stock) > 0
              );

              return (
                <button
                  key={producer.id.toString()}
                  onClick={() =>
                    navigate({
                      to: "/producers/$producerId",
                      params: { producerId: producer.id.toString() },
                    })
                  }
                  className="w-full text-left bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-earthBrown/10"
                >
                  <div className="flex gap-3">
                    <img
                      src={avatarUrl}
                      alt={producer.name}
                      className="w-16 h-16 rounded-full object-cover shrink-0 border-2 border-earthBrown/20"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-poppins font-semibold text-earthBrown text-sm">
                          {producer.name}
                        </p>
                        {producer.rarityBadge && (
                          <BadgePill variant="gold" size="sm">
                            {producer.rarityBadge}
                          </BadgePill>
                        )}
                      </div>
                      <p className="font-roboto text-xs text-earthBrown/60 mt-0.5">
                        {producer.region} · {producerProducts.length} products
                      </p>
                      {producer.bio && (
                        <p className="font-roboto text-xs text-earthBrown/70 mt-1 line-clamp-2">
                          {producer.bio}
                        </p>
                      )}
                      {producer.brandName && (
                        <p className="font-poppins text-xs text-sandGold font-medium mt-1">
                          {producer.brandName}
                        </p>
                      )}
                    </div>
                  </div>
                  {producer.voiceStoryBlob && (
                    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                      <VoiceNotePlayer
                        blob={producer.voiceStoryBlob}
                        label="Voice Story"
                      />
                    </div>
                  )}
                </button>
              );
            })}

        {!isLoading && filteredProducers.length === 0 && (
          <div className="text-center py-12 text-earthBrown/50 font-roboto">
            No artisans found for this filter.
          </div>
        )}
      </div>
    </Layout>
  );
}

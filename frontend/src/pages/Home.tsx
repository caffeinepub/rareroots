import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import Layout from "../components/Layout";
import SearchBar from "../components/SearchBar";
import RegionFilter from "../components/RegionFilter";
import HeroSection from "../components/HeroSection";
import FeaturedProducers from "../components/FeaturedProducers";
import LiveNowSection from "../components/LiveNowSection";
import { useGetVerifiedProducts, useGetVerifiedProducers } from "../hooks/useQueries";

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { data: products = [], isLoading: productsLoading } = useGetVerifiedProducts();
  const { data: producers = [], isLoading: producersLoading } = useGetVerifiedProducers();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      navigate({ to: "/products" });
    }
  };

  return (
    <Layout>
      <HeroSection />

      <div className="px-4 pt-4 pb-2">
        <SearchBar value={searchQuery} onChange={handleSearch} />
      </div>

      <div className="px-4 py-2">
        <RegionFilter selected={selectedRegion} onSelect={setSelectedRegion} />
      </div>

      <LiveNowSection />

      <FeaturedProducers
        products={products}
        producers={producers}
        isLoading={productsLoading || producersLoading}
        selectedRegion={selectedRegion}
      />

      <div className="h-6" />
    </Layout>
  );
}

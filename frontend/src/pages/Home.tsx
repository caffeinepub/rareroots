import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import RegionFilter from '../components/RegionFilter';
import FeaturedProducers from '../components/FeaturedProducers';
import ProductCard from '../components/ProductCard';
import { useGetAllProducts, useGetAllProducers } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');

  const { data: products, isLoading: productsLoading } = useGetAllProducts();
  const { data: producers } = useGetAllProducers();

  const filteredProducts = products?.filter(p => {
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesRegion =
      selectedRegion === 'All' || p.region === selectedRegion;
    return matchesSearch && matchesRegion && Number(p.stock) > 0;
  }) ?? [];

  const getProducerColor = (producerId: string) => {
    const producer = producers?.find(p => p.id.toString() === producerId);
    return producer?.brandColor || undefined;
  };

  return (
    <Layout>
      <div className="px-4 py-4 space-y-5">
        {/* Hero Banner */}
        <div
          className="relative rounded-card overflow-hidden"
          style={{ height: '160px' }}
        >
          <img
            src="/assets/generated/hero-banner.dim_1440x600.png"
            alt="SamriddhiSrot"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div
            className="absolute inset-0 flex flex-col justify-center px-5"
            style={{ background: 'linear-gradient(90deg, rgba(139,69,19,0.85) 0%, rgba(139,69,19,0.3) 100%)' }}
          >
            <h1
              className="font-poppins font-bold text-white leading-tight"
              style={{ fontSize: '22px' }}
            >
              Rare Artisan Products
            </h1>
            <p
              className="font-playfair italic text-white mt-1"
              style={{ fontSize: '14px', opacity: 0.9 }}
            >
              Direct from the source
            </p>
            <button
              onClick={() => navigate({ to: '/discover' })}
              className="mt-3 self-start px-4 py-2 rounded-button font-poppins font-semibold text-sm"
              style={{ backgroundColor: '#DAA520', color: 'white' }}
            >
              Explore Producers
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar value={search} onChange={setSearch} />

        {/* Region Filter */}
        <RegionFilter selected={selectedRegion} onSelect={setSelectedRegion} />

        {/* Featured Products */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-poppins font-bold text-lg" style={{ color: '#8B4513' }}>
              🌟 Featured Rarities
            </h2>
            <button
              onClick={() => navigate({ to: '/products' })}
              className="font-roboto text-sm"
              style={{ color: '#DAA520' }}
            >
              See all
            </button>
          </div>
          <FeaturedProducers />
        </section>

        {/* Live Now */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5" style={{ color: '#FF4500' }} />
            <h2 className="font-poppins font-bold text-lg" style={{ color: '#8B4513' }}>
              Live Now
            </h2>
          </div>
          <div
            className="rounded-card p-4 flex items-center gap-3 cursor-pointer"
            style={{ backgroundColor: 'white', boxShadow: '0px 4px 8px rgba(0,0,0,0.1)' }}
            onClick={() => navigate({ to: '/live' })}
          >
            <div
              className="w-3 h-3 rounded-full animate-pulse flex-shrink-0"
              style={{ backgroundColor: '#FF4500' }}
            />
            <div>
              <p className="font-poppins font-semibold text-sm" style={{ color: '#8B4513' }}>
                Watch artisans at work
              </p>
              <p className="font-roboto text-xs" style={{ color: '#666' }}>
                Live sessions from Himalayan & Kutch producers
              </p>
            </div>
          </div>
        </section>

        {/* All Products Grid */}
        <section>
          <h2 className="font-poppins font-bold text-lg mb-3" style={{ color: '#8B4513' }}>
            {selectedRegion === 'All' ? '🛍️ All Products' : `🗺️ ${selectedRegion} Products`}
          </h2>

          {productsLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-52 rounded-card" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-roboto text-gray-400">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  accentColor={getProducerColor(product.producerId.toString())}
                />
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="pt-4 pb-2 text-center border-t" style={{ borderColor: 'rgba(218,165,32,0.2)' }}>
          <p className="font-roboto text-xs" style={{ color: '#888' }}>
            © {new Date().getFullYear()} SamriddhiSrot. Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'samriddhisrot')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#DAA520' }}
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </Layout>
  );
}

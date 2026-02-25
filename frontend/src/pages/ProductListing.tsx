import React, { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import RegionFilter from '../components/RegionFilter';
import ProductCard from '../components/ProductCard';
import { useGetAllProducts, useGetAllProducers } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

export default function ProductListing() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');

  const { data: products = [], isLoading: productsLoading } = useGetAllProducts();
  const { data: producers = [] } = useGetAllProducers();

  const getProducerColor = (producerId: string) => {
    const producer = producers.find(p => p.id.toString() === producerId);
    return producer?.brandColor || undefined;
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchesRegion = selectedRegion === 'All' || p.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [products, search, selectedRegion]);

  return (
    <Layout>
      <div className="px-4 py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate({ to: '/' })}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(139,69,19,0.1)' }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: '#8B4513' }} />
          </button>
          <h1 className="font-poppins font-bold" style={{ fontSize: '22px', color: '#8B4513' }}>
            All Products
          </h1>
        </div>

        {/* Search */}
        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {/* Region Filter */}
        <div className="mb-5">
          <RegionFilter selected={selectedRegion} onSelect={setSelectedRegion} />
        </div>

        {/* Results count */}
        <p className="font-roboto text-sm mb-4" style={{ color: '#666' }}>
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </p>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-52 rounded-card" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-poppins font-semibold text-lg" style={{ color: '#8B4513' }}>
              No products found
            </p>
            <p className="font-roboto text-sm mt-2" style={{ color: '#666' }}>
              Try adjusting your search or filter
            </p>
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
      </div>
    </Layout>
  );
}

import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import Layout from '../components/Layout';
import BadgePill from '../components/BadgePill';
import VoiceNotePlayer from '../components/VoiceNotePlayer';
import { useGetAllProducers } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';

const FILTER_CHIPS = ['All', 'Banarasi', 'Kutch', 'Tribal', 'Himalayan', 'Northeast'];

export default function ProducerDiscovery() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const { data: producers, isLoading } = useGetAllProducers();

  const filteredProducers = producers?.filter(p => {
    if (activeFilter === 'All') return true;
    return p.region?.toLowerCase().includes(activeFilter.toLowerCase());
  }) ?? [];

  return (
    <Layout>
      <div className="px-4 py-4">
        {/* Hero */}
        <div className="relative rounded-card overflow-hidden mb-4" style={{ height: '120px' }}>
          <img
            src="/assets/generated/discover-hero.dim_1200x400.png"
            alt="Discover Producers"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div
            className="absolute inset-0 flex flex-col justify-center px-5"
            style={{ background: 'linear-gradient(90deg, rgba(75,0,130,0.8) 0%, rgba(75,0,130,0.3) 100%)' }}
          >
            <h1 className="font-poppins font-bold text-white" style={{ fontSize: '22px' }}>
              🔍 Discover Producers
            </h1>
            <p className="font-playfair italic text-white text-sm opacity-90">
              Rare artisans, direct connection
            </p>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4" style={{ scrollbarWidth: 'none' }}>
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => setActiveFilter(chip)}
              className={`region-chip flex-shrink-0 ${activeFilter === chip ? 'active' : ''}`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Producer Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-52 rounded-card" />
            ))}
          </div>
        ) : filteredProducers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 mx-auto mb-3" style={{ color: '#DAA520' }} />
            <p className="font-poppins font-semibold" style={{ color: '#8B4513' }}>
              No producers found
            </p>
            <p className="font-roboto text-sm mt-1" style={{ color: '#666' }}>
              Try a different filter
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducers.map(producer => {
              const photoUrl = producer.profilePhoto
                ? producer.profilePhoto.getDirectURL()
                : '/assets/generated/producer-avatar-placeholder.dim_200x200.png';
              const logoUrl = producer.brandLogoBlob
                ? producer.brandLogoBlob.getDirectURL()
                : null;

              return (
                <div
                  key={producer.id.toString()}
                  className="product-card cursor-pointer hover:shadow-lg transition-shadow"
                  style={{ minHeight: '200px' }}
                  onClick={() => navigate({ to: `/producers/${producer.id.toString()}` })}
                >
                  {/* Top section with photo */}
                  <div
                    className="relative flex items-center justify-center"
                    style={{
                      height: '80px',
                      background: producer.brandColor
                        ? `linear-gradient(135deg, ${producer.brandColor}33, ${producer.brandColor}66)`
                        : 'linear-gradient(135deg, rgba(139,69,19,0.1), rgba(218,165,32,0.2))',
                    }}
                  >
                    <img
                      src={logoUrl || photoUrl}
                      alt={producer.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white"
                      style={{ boxShadow: '0px 2px 6px rgba(0,0,0,0.15)' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/generated/producer-avatar-placeholder.dim_200x200.png';
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3
                      className="font-poppins font-bold text-center leading-tight mb-1"
                      style={{ color: '#8B4513', fontSize: '16px' }}
                    >
                      {producer.brandName || producer.name}
                    </h3>
                    <p className="font-roboto text-xs text-center mb-2" style={{ color: '#666' }}>
                      {producer.region}
                    </p>

                    {/* Voice Story button */}
                    {producer.voiceStoryBlob ? (
                      <div onClick={e => e.stopPropagation()}>
                        <VoiceNotePlayer blob={producer.voiceStoryBlob} label="Voice Story" />
                      </div>
                    ) : (
                      <div
                        className="flex items-center justify-center gap-1 py-1"
                        style={{ color: '#DAA520', fontSize: '12px' }}
                      >
                        <span>🎙️</span>
                        <span className="font-roboto">Voice Story</span>
                        <span>▶️</span>
                      </div>
                    )}

                    {/* Badge */}
                    {producer.brandTagline && (
                      <div className="flex justify-center mt-2">
                        <BadgePill text={`🏷️ ${producer.brandTagline.slice(0, 15)}`} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

import React from 'react';
import { Link } from '@tanstack/react-router';
import { Radio, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { LiveStream, Producer } from '../backend';
import LiveSessionCard from './LiveSessionCard';

interface LiveNowSectionProps {
  streams: LiveStream[];
  producers: Producer[];
  isLoading: boolean;
}

export default function LiveNowSection({ streams, producers, isLoading }: LiveNowSectionProps) {
  const producerMap = new Map(producers.map((p) => [p.id.toString(), p]));

  if (!isLoading && streams.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Radio className="h-4 w-4 text-terracotta animate-live-pulse" />
              <p className="text-sm text-terracotta font-medium uppercase tracking-widest">Happening Now</p>
            </div>
            <h2 className="font-serif text-3xl font-bold text-foreground">Live Sessions</h2>
          </div>
          <Link to="/live-sessions" className="text-sm text-forest hover:text-terracotta transition-colors flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-5">
                  <Skeleton className="h-11 w-11 rounded-full mb-3" />
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))
            : streams.slice(0, 3).map((stream) => (
                <LiveSessionCard
                  key={stream.id}
                  stream={stream}
                  producer={producerMap.get(stream.producerId.toString())}
                />
              ))}
        </div>
      </div>
    </section>
  );
}

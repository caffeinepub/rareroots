import React, { useState } from 'react';
import { Radio } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import LiveSessionCard from '../components/LiveSessionCard';
import { useGetAllLiveStreams, useGetAllProducers } from '../hooks/useQueries';
import { LiveStreamStatus } from '../backend';
import type { LiveStream } from '../backend';

type FilterStatus = 'all' | 'active' | 'scheduled' | 'ended';

export default function LiveSessions() {
  const [filter, setFilter] = useState<FilterStatus>('all');

  const { data: streams = [], isLoading: streamsLoading } = useGetAllLiveStreams();
  const { data: producers = [], isLoading: producersLoading } = useGetAllProducers();

  const producerMap = new Map(producers.map((p) => [p.id.toString(), p]));

  const filteredStreams = streams.filter((s) => {
    if (filter === 'all') return true;
    if (filter === 'active') return s.status === LiveStreamStatus.active;
    if (filter === 'scheduled') return s.status === LiveStreamStatus.scheduled;
    if (filter === 'ended') return s.status === LiveStreamStatus.ended;
    return true;
  });

  // Sort: active first, then scheduled, then ended
  const sortedStreams = [...filteredStreams].sort((a, b) => {
    const order = { active: 0, scheduled: 1, ended: 2 };
    const aOrder = order[a.status as keyof typeof order] ?? 3;
    const bOrder = order[b.status as keyof typeof order] ?? 3;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return Number(b.startTime) - Number(a.startTime);
  });

  const isLoading = streamsLoading || producersLoading;

  const filterButtons: { label: string; value: FilterStatus; count: number }[] = [
    { label: 'All', value: 'all', count: streams.length },
    { label: 'Live Now', value: 'active', count: streams.filter((s) => s.status === LiveStreamStatus.active).length },
    { label: 'Upcoming', value: 'scheduled', count: streams.filter((s) => s.status === LiveStreamStatus.scheduled).length },
    { label: 'Ended', value: 'ended', count: streams.filter((s) => s.status === LiveStreamStatus.ended).length },
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-forest text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="h-5 w-5 opacity-80 animate-live-pulse" />
            <p className="text-sm font-medium uppercase tracking-widest opacity-70">Artisan Stories</p>
          </div>
          <h1 className="font-serif text-4xl font-bold mb-2">Live Sessions</h1>
          <p className="opacity-80 text-lg">
            Watch producers craft their products and hear the stories behind them.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                filter === btn.value
                  ? 'bg-terracotta text-primary-foreground border-terracotta'
                  : 'bg-card text-foreground border-border hover:border-terracotta hover:text-terracotta'
              }`}
            >
              {btn.label}
              {btn.count > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  filter === btn.value ? 'bg-white/20' : 'bg-muted'
                }`}>
                  {btn.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Sessions Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : sortedStreams.length === 0 ? (
          <div className="text-center py-20">
            <Radio className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
            <p className="font-serif text-2xl text-foreground mb-2">No sessions found</p>
            <p className="text-muted-foreground">
              {filter === 'active'
                ? 'No producers are live right now. Check back soon!'
                : filter === 'scheduled'
                ? 'No upcoming sessions scheduled yet.'
                : 'No live sessions available.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedStreams.map((stream) => (
              <LiveSessionCard
                key={stream.id}
                stream={stream}
                producer={producerMap.get(stream.producerId.toString())}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

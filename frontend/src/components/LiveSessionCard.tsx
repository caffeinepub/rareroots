import React from 'react';
import { MapPin, Clock, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { LiveStream, Producer } from '../backend';
import { LiveStreamStatus } from '../backend';
import LiveBadge from './LiveBadge';

interface LiveSessionCardProps {
  stream: LiveStream;
  producer?: Producer | null;
}

export default function LiveSessionCard({ stream, producer }: LiveSessionCardProps) {
  const avatarUrl = producer?.profilePhoto?.getDirectURL();
  const isActive = stream.status === LiveStreamStatus.active;
  const isScheduled = stream.status === LiveStreamStatus.scheduled;

  const formatTime = (time: bigint) => {
    const date = new Date(Number(time) / 1_000_000);
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className={`bg-card rounded-xl border overflow-hidden shadow-xs hover:shadow-artisan transition-all duration-300 ${
      isActive ? 'border-terracotta' : 'border-border'
    }`}>
      {isActive && (
        <div className="h-1 bg-terracotta" />
      )}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <img
              src={avatarUrl || '/assets/generated/producer-avatar-placeholder.dim_200x200.png'}
              alt={producer?.name || 'Producer'}
              className="h-11 w-11 rounded-full object-cover border-2 border-border shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/generated/producer-avatar-placeholder.dim_200x200.png';
              }}
            />
            <div>
              <p className="font-semibold text-sm text-foreground">{producer?.name || 'Unknown Producer'}</p>
              {producer?.region && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {producer.region}
                </p>
              )}
            </div>
          </div>
          <div className="shrink-0">
            {isActive ? (
              <LiveBadge />
            ) : isScheduled ? (
              <Badge variant="secondary" className="text-xs">Upcoming</Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-muted-foreground">Ended</Badge>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-serif font-semibold text-foreground mb-2">{stream.title}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{stream.description}</p>

        {/* Story */}
        {stream.story && (
          <div className="bg-accent rounded-lg p-3 mb-3">
            <p className="text-xs font-medium text-forest flex items-center gap-1 mb-1">
              <BookOpen className="h-3 w-3" /> Producer's Story
            </p>
            <p className="text-sm text-foreground/80 italic line-clamp-3">"{stream.story}"</p>
          </div>
        )}

        {/* Time */}
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {isActive ? 'Started' : 'Scheduled for'}: {formatTime(stream.startTime)}
        </p>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Radio, Play, Square, BookOpen } from 'lucide-react';
import type { LiveStream } from '../backend';
import { LiveStreamStatus } from '../backend';
import { useCreateLiveStream, useUpdateLiveStreamStatus, useUpdateLiveStreamStory } from '../hooks/useQueries';
import { toast } from 'sonner';

interface LiveSessionFormProps {
  existingStreams: LiveStream[];
  onSuccess?: () => void;
}

export default function LiveSessionForm({ existingStreams, onSuccess }: LiveSessionFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [storyUpdates, setStoryUpdates] = useState<Record<string, string>>({});
  const createStream = useCreateLiveStream();
  const updateStatus = useUpdateLiveStreamStatus();
  const updateStory = useUpdateLiveStreamStory();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Title is required.'); return; }
    const startTimestamp = startTime
      ? BigInt(new Date(startTime).getTime()) * BigInt(1_000_000)
      : BigInt(Date.now()) * BigInt(1_000_000);
    try {
      await createStream.mutateAsync({ title: title.trim(), description: description.trim(), startTime: startTimestamp });
      toast.success('Live session created!');
      setTitle(''); setDescription(''); setStartTime('');
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create session.');
    }
  };

  const handleStatusChange = async (id: string, status: LiveStreamStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success(`Session marked as ${status}.`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update status.');
    }
  };

  const handleStoryUpdate = async (id: string) => {
    const story = storyUpdates[id] || '';
    try {
      await updateStory.mutateAsync({ id, story });
      toast.success('Story updated!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update story.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Create New Session */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
          <Radio className="h-4 w-4 text-terracotta" />
          Schedule a Live Session
        </h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="stream-title" className="text-forest font-medium">Session Title *</Label>
            <Input
              id="stream-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weaving a Traditional Rug Live"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stream-desc" className="text-forest font-medium">Description</Label>
            <Textarea
              id="stream-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will you be doing? What story will you share?"
              rows={2}
              className="resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stream-time" className="text-forest font-medium">Scheduled Start Time</Label>
            <Input
              id="stream-time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={createStream.isPending}
            className="bg-terracotta hover:bg-terracotta-dark text-primary-foreground border-0"
          >
            {createStream.isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Creating...
              </span>
            ) : 'Schedule Session'}
          </Button>
        </form>
      </div>

      {/* Existing Sessions */}
      {existingStreams.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-serif text-lg font-semibold">Your Sessions</h3>
          {existingStreams.map((stream) => (
            <div key={stream.id} className="bg-card rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h4 className="font-serif font-semibold text-foreground">{stream.title}</h4>
                  <p className="text-sm text-muted-foreground">{stream.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {stream.status === LiveStreamStatus.scheduled && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(stream.id, LiveStreamStatus.active)}
                      disabled={updateStatus.isPending}
                      className="bg-terracotta hover:bg-terracotta-dark text-primary-foreground border-0"
                    >
                      <Play className="h-3.5 w-3.5 mr-1.5" />
                      Go Live
                    </Button>
                  )}
                  {stream.status === LiveStreamStatus.active && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(stream.id, LiveStreamStatus.ended)}
                      disabled={updateStatus.isPending}
                    >
                      <Square className="h-3.5 w-3.5 mr-1.5" />
                      End Session
                    </Button>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    stream.status === LiveStreamStatus.active
                      ? 'bg-terracotta text-primary-foreground'
                      : stream.status === LiveStreamStatus.scheduled
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {stream.status === LiveStreamStatus.active ? '● LIVE' : stream.status}
                  </span>
                </div>
              </div>

              {/* Story Update */}
              {stream.status !== LiveStreamStatus.ended && (
                <div className="space-y-2">
                  <Label className="text-xs text-forest font-medium flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> Update Your Story
                  </Label>
                  <div className="flex gap-2">
                    <Textarea
                      value={storyUpdates[stream.id] ?? stream.story}
                      onChange={(e) => setStoryUpdates((prev) => ({ ...prev, [stream.id]: e.target.value }))}
                      placeholder="Share what you're doing right now..."
                      rows={2}
                      className="resize-none text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStoryUpdate(stream.id)}
                      disabled={updateStory.isPending}
                      className="shrink-0 self-end"
                    >
                      Update
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

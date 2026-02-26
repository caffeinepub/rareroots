import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import {
  useCreateLiveStream,
  useUpdateLiveStreamStatus,
  useUpdateLiveStreamStory,
} from "../hooks/useQueries";
import type { LiveStream } from "../hooks/useQueries";
import { LiveStreamStatus } from "../backend";
import LiveBadge from "./LiveBadge";
import { toast } from "sonner";

interface LiveSessionFormProps {
  existingStreams: LiveStream[];
}

export default function LiveSessionForm({ existingStreams }: LiveSessionFormProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");

  const createStream = useCreateLiveStream();
  const updateStatus = useUpdateLiveStreamStatus();
  const updateStory = useUpdateLiveStreamStory();

  const handleCreate = async () => {
    if (!title.trim() || !startTime) {
      toast.error("Title and start time are required");
      return;
    }
    try {
      await createStream.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        startTime: BigInt(new Date(startTime).getTime()) * 1_000_000n,
      });
      toast.success("Live session scheduled!");
      setTitle("");
      setDescription("");
      setStartTime("");
      setShowCreate(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create session";
      toast.error(msg);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: status as LiveStreamStatus });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleStoryUpdate = async (id: string, story: string) => {
    try {
      await updateStory.mutateAsync({ id, story });
      toast.success("Story updated");
    } catch {
      toast.error("Failed to update story");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-poppins font-semibold text-earthBrown">
          Live Sessions ({existingStreams.length})
        </h3>
        <Button
          onClick={() => setShowCreate(!showCreate)}
          size="sm"
          className="bg-earthBrown hover:bg-earthBrown/90 text-ivoryCream font-poppins"
        >
          <Plus size={14} className="mr-1" /> Schedule
        </Button>
      </div>

      {showCreate && (
        <div className="bg-ivoryCream rounded-xl p-4 space-y-3 border border-earthBrown/20">
          <div>
            <Label className="font-poppins text-sm text-earthBrown">Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Session title"
              className="mt-1 border-earthBrown/30"
            />
          </div>
          <div>
            <Label className="font-poppins text-sm text-earthBrown">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will you show?"
              rows={2}
              className="mt-1 border-earthBrown/30 resize-none"
            />
          </div>
          <div>
            <Label className="font-poppins text-sm text-earthBrown">Start Time *</Label>
            <Input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 border-earthBrown/30"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreate(false)}
              className="flex-1 border-earthBrown/30 text-earthBrown"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createStream.isPending}
              className="flex-1 bg-earthBrown hover:bg-earthBrown/90 text-ivoryCream font-poppins"
            >
              {createStream.isPending ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : null}
              Schedule
            </Button>
          </div>
        </div>
      )}

      {existingStreams.length === 0 ? (
        <div className="text-center py-6 text-earthBrown/50 font-roboto text-sm">
          No live sessions yet. Schedule your first one!
        </div>
      ) : (
        <div className="space-y-3">
          {existingStreams.map((stream) => (
            <StreamCard
              key={stream.id}
              stream={stream}
              onStatusChange={handleStatusChange}
              onStoryUpdate={handleStoryUpdate}
              isUpdating={updateStatus.isPending || updateStory.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface StreamCardProps {
  stream: LiveStream;
  onStatusChange: (id: string, status: string) => void;
  onStoryUpdate: (id: string, story: string) => void;
  isUpdating: boolean;
}

function StreamCard({ stream, onStatusChange, onStoryUpdate, isUpdating }: StreamCardProps) {
  const [story, setStory] = useState(stream.story);
  const [editingStory, setEditingStory] = useState(false);

  return (
    <div className="bg-white rounded-xl p-3 border border-earthBrown/10 shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {stream.status === LiveStreamStatus.active && <LiveBadge size="sm" />}
          <p className="font-poppins text-sm font-semibold text-earthBrown truncate">
            {stream.title}
          </p>
        </div>
        <Select
          value={stream.status}
          onValueChange={(v) => onStatusChange(stream.id, v)}
          disabled={isUpdating}
        >
          <SelectTrigger className="w-28 h-7 text-xs border-earthBrown/20 shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(LiveStreamStatus).map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {editingStory ? (
        <div className="space-y-2">
          <Textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Share your story..."
            rows={2}
            className="text-xs border-earthBrown/30 resize-none"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingStory(false)}
              className="flex-1 h-7 text-xs border-earthBrown/30"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onStoryUpdate(stream.id, story);
                setEditingStory(false);
              }}
              disabled={isUpdating}
              className="flex-1 h-7 text-xs bg-earthBrown text-ivoryCream"
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setEditingStory(true)}
          className="text-xs text-earthBrown/50 hover:text-earthBrown font-roboto text-left w-full"
        >
          {stream.story || "Add story..."}
        </button>
      )}
    </div>
  );
}

import { useNavigate } from "@tanstack/react-router";
import type { LiveStream } from "../hooks/useQueries";
import { LiveStreamStatus } from "../backend";
import { useGetProducer } from "../hooks/useQueries";
import LiveBadge from "./LiveBadge";
import BadgePill from "./BadgePill";

interface LiveSessionCardProps {
  stream: LiveStream;
}

export default function LiveSessionCard({ stream }: LiveSessionCardProps) {
  const navigate = useNavigate();
  const { data: producer } = useGetProducer(stream.producerId.toString());

  const avatarUrl = producer?.profilePhoto
    ? producer.profilePhoto.getDirectURL()
    : "/assets/generated/producer-avatar-placeholder.dim_200x200.png";

  const formatTime = (time: bigint) => {
    const date = new Date(Number(time) / 1_000_000);
    return date.toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="flex gap-3 p-3 bg-white rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate({ to: "/live-sessions" })}
    >
      <img
        src={avatarUrl}
        alt={producer?.name || "Producer"}
        className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-earthBrown/20"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {stream.status === LiveStreamStatus.active && <LiveBadge size="sm" />}
          {stream.status === LiveStreamStatus.scheduled && (
            <BadgePill variant="indigo" size="sm">Scheduled</BadgePill>
          )}
          {stream.status === LiveStreamStatus.ended && (
            <BadgePill variant="green" size="sm">Ended</BadgePill>
          )}
        </div>
        <p className="font-poppins text-sm font-semibold text-earthBrown truncate">
          {stream.title}
        </p>
        {producer && (
          <p className="font-roboto text-xs text-earthBrown/60 truncate">
            {producer.name} · {producer.region}
          </p>
        )}
        <p className="font-roboto text-xs text-earthBrown/50 mt-0.5">
          {formatTime(stream.startTime)}
        </p>
        {stream.story && (
          <p className="font-roboto text-xs text-earthBrown/70 mt-1 line-clamp-2">
            {stream.story}
          </p>
        )}
      </div>
    </div>
  );
}

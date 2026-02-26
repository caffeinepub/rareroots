import { useNavigate } from "@tanstack/react-router";
import { useGetAllLiveStreams } from "../hooks/useQueries";
import { LiveStreamStatus } from "../backend";
import LiveSessionCard from "./LiveSessionCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function LiveNowSection() {
  const navigate = useNavigate();
  const { data: streams = [], isLoading } = useGetAllLiveStreams();

  const activeStreams = streams
    .filter((s) => s.status === LiveStreamStatus.active)
    .slice(0, 3);

  if (!isLoading && activeStreams.length === 0) return null;

  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-poppins font-semibold text-earthBrown text-base flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Live Now
        </h2>
        <button
          onClick={() => navigate({ to: "/live-sessions" })}
          className="text-xs text-sandGold font-poppins hover:underline"
        >
          View all
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-3 bg-white rounded-xl">
                <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))
          : activeStreams.map((stream) => (
              <LiveSessionCard key={stream.id} stream={stream} />
            ))}
      </div>
    </section>
  );
}

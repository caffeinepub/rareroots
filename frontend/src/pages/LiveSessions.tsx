import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Radio, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Layout from "../components/Layout";
import LiveSessionCard from "../components/LiveSessionCard";
import LiveBadge from "../components/LiveBadge";
import { useGetAllLiveStreams } from "../hooks/useQueries";
import { LiveStreamStatus } from "../backend";

type FilterStatus = "all" | "active" | "scheduled" | "ended";

export default function LiveSessions() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterStatus>("all");

  const { data: streams = [], isLoading } = useGetAllLiveStreams();

  const filteredStreams = streams.filter((s) => {
    if (filter === "all") return true;
    if (filter === "active") return s.status === LiveStreamStatus.active;
    if (filter === "scheduled") return s.status === LiveStreamStatus.scheduled;
    if (filter === "ended") return s.status === LiveStreamStatus.ended;
    return true;
  });

  // Sort: active first, then scheduled, then ended
  const sortedStreams = [...filteredStreams].sort((a, b) => {
    const order: Record<string, number> = { active: 0, scheduled: 1, ended: 2 };
    const aOrder = order[a.status] ?? 3;
    const bOrder = order[b.status] ?? 3;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return Number(b.startTime) - Number(a.startTime);
  });

  const filterButtons: { label: string; value: FilterStatus; count: number }[] = [
    { label: "All", value: "all", count: streams.length },
    {
      label: "Live Now",
      value: "active",
      count: streams.filter((s) => s.status === LiveStreamStatus.active).length,
    },
    {
      label: "Upcoming",
      value: "scheduled",
      count: streams.filter((s) => s.status === LiveStreamStatus.scheduled).length,
    },
    {
      label: "Ended",
      value: "ended",
      count: streams.filter((s) => s.status === LiveStreamStatus.ended).length,
    },
  ];

  return (
    <Layout>
      {/* Hero */}
      <div className="relative w-full overflow-hidden" style={{ height: "160px" }}>
        <img
          src="/assets/generated/discover-hero.dim_1200x400.png"
          alt="Live Sessions"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-earthBrown/70" />
        <div className="absolute inset-0 flex flex-col justify-center px-6">
          <div className="flex items-center gap-2 mb-1">
            <Radio size={16} className="text-ivoryCream animate-pulse" />
            <p className="font-roboto text-xs text-ivoryCream/80 uppercase tracking-widest">
              Artisan Stories
            </p>
          </div>
          <h1 className="font-playfair text-ivoryCream text-2xl font-bold">
            Live Sessions
          </h1>
          <p className="font-roboto text-ivoryCream/80 text-sm mt-1">
            Watch producers craft their products
          </p>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Back */}
        <button
          onClick={() => navigate({ to: "/home" })}
          className="flex items-center gap-1 text-earthBrown/60 hover:text-earthBrown text-sm font-roboto mb-4"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-poppins font-medium transition-colors border ${
                filter === btn.value
                  ? "bg-earthBrown text-ivoryCream border-earthBrown"
                  : "bg-white text-earthBrown border-earthBrown/20 hover:border-earthBrown/50"
              }`}
            >
              {btn.value === "active" && <LiveBadge size="sm" />}
              {btn.label}
              {btn.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    filter === btn.value
                      ? "bg-ivoryCream/20 text-ivoryCream"
                      : "bg-earthBrown/10 text-earthBrown"
                  }`}
                >
                  {btn.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Stream List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-3 bg-white rounded-xl">
                <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedStreams.length === 0 ? (
          <div className="text-center py-12 text-earthBrown/50 font-roboto text-sm">
            No sessions found for this filter.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedStreams.map((stream) => (
              <LiveSessionCard key={stream.id} stream={stream} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

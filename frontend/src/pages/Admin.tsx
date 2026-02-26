import { useNavigate } from "@tanstack/react-router";
import Layout from "../components/Layout";
import {
  useGetAllProducers,
  useIsCallerAdmin,
  useAdminApproveProducer,
  useAdminRejectProducer,
} from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: producers, isLoading: producersLoading } = useGetAllProducers();
  const approveMutation = useAdminApproveProducer();
  const rejectMutation = useAdminRejectProducer();

  const handleApprove = async (producerId: string, displayName: string) => {
    try {
      await approveMutation.mutateAsync(producerId);
      toast.success(`✅ ${displayName} approved and now visible in marketplace`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to approve producer";
      toast.error(msg);
    }
  };

  const handleReject = async (producerId: string, displayName: string) => {
    try {
      await rejectMutation.mutateAsync(producerId);
      toast.success(`❌ ${displayName} rejected and hidden from marketplace`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reject producer";
      toast.error(msg);
    }
  };

  if (adminLoading) {
    return (
      <Layout>
        <div className="px-4 py-6 space-y-4">
          <Skeleton className="h-10 w-48" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </Layout>
    );
  }

  if (!identity) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <ShieldAlert className="w-16 h-16 mb-4" style={{ color: "#DAA520" }} />
          <h2
            className="font-poppins font-bold text-xl mb-2"
            style={{ color: "#8B4513" }}
          >
            Login Required
          </h2>
          <p className="font-roboto text-sm" style={{ color: "#666" }}>
            Please log in to access the admin panel.
          </p>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <ShieldAlert className="w-16 h-16 mb-4" style={{ color: "#FF4500" }} />
          <h2
            className="font-poppins font-bold text-xl mb-2"
            style={{ color: "#8B4513" }}
          >
            Access Denied
          </h2>
          <p className="font-roboto text-sm" style={{ color: "#666" }}>
            You do not have admin privileges to access this page.
          </p>
          <button
            onClick={() => navigate({ to: "/home" })}
            className="mt-6 px-6 py-2 rounded-full font-poppins font-semibold text-white"
            style={{ backgroundColor: "#8B4513" }}
          >
            Back to Home
          </button>
        </div>
      </Layout>
    );
  }

  const sortedProducers = [...(producers ?? [])].sort((a, b) => {
    if (!a.verified && b.verified) return -1;
    if (a.verified && !b.verified) return 1;
    return 0;
  });

  return (
    <Layout>
      <div className="px-4 py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate({ to: "/home" })}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(139,69,19,0.1)" }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "#8B4513" }} />
          </button>
          <div>
            <h1
              className="font-poppins font-bold"
              style={{ fontSize: "22px", color: "#8B4513" }}
            >
              🛡️ Admin Panel
            </h1>
            <p className="font-roboto text-xs" style={{ color: "#666" }}>
              Manual producer curation
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div
            className="rounded-xl p-3 text-center"
            style={{ backgroundColor: "white", boxShadow: "0px 4px 8px rgba(0,0,0,0.1)" }}
          >
            <p
              className="font-poppins font-bold text-2xl"
              style={{ color: "#228B22" }}
            >
              {producers?.filter((p) => p.verified).length ?? 0}
            </p>
            <p className="font-roboto text-xs" style={{ color: "#666" }}>
              Approved
            </p>
          </div>
          <div
            className="rounded-xl p-3 text-center"
            style={{ backgroundColor: "white", boxShadow: "0px 4px 8px rgba(0,0,0,0.1)" }}
          >
            <p
              className="font-poppins font-bold text-2xl"
              style={{ color: "#FF4500" }}
            >
              {producers?.filter((p) => !p.verified).length ?? 0}
            </p>
            <p className="font-roboto text-xs" style={{ color: "#666" }}>
              Pending Review
            </p>
          </div>
        </div>

        {/* Producer List */}
        {producersLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : sortedProducers.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-poppins font-semibold" style={{ color: "#8B4513" }}>
              No producers registered yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedProducers.map((producer) => {
              const pid = producer.id.toString();
              const displayName =
                producer.brandName || producer.name || "Unnamed Producer";
              const isApproving =
                approveMutation.isPending && approveMutation.variables === pid;
              const isRejecting =
                rejectMutation.isPending && rejectMutation.variables === pid;
              const isBusy = isApproving || isRejecting;

              return (
                <div
                  key={pid}
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: "white",
                    boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
                    borderLeft: producer.verified
                      ? "4px solid #228B22"
                      : "4px solid #FF4500",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className="font-poppins font-bold"
                          style={{ color: "#8B4513", fontSize: "15px" }}
                        >
                          {displayName}
                        </h3>
                        <Badge
                          variant={producer.verified ? "default" : "outline"}
                          className={
                            producer.verified
                              ? "bg-forestGreen text-white border-0"
                              : "border-sandGold text-sandGold"
                          }
                        >
                          {producer.verified ? "✅ Verified" : "⏳ Pending"}
                        </Badge>
                      </div>
                      <p
                        className="font-roboto text-xs mt-1"
                        style={{ color: "#666" }}
                      >
                        {producer.region} · {Number(producer.followerCount)} followers
                      </p>
                      {producer.bio && (
                        <p
                          className="font-roboto text-xs mt-1 line-clamp-2"
                          style={{ color: "#888" }}
                        >
                          {producer.bio}
                        </p>
                      )}
                      <p
                        className="font-mono text-xs mt-1"
                        style={{ color: "#aaa" }}
                      >
                        {pid.slice(0, 20)}...
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => handleApprove(pid, displayName)}
                        disabled={isBusy || producer.verified}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-poppins font-semibold text-white disabled:opacity-40"
                        style={{ backgroundColor: "#228B22" }}
                      >
                        {isApproving ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <CheckCircle size={12} />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(pid, displayName)}
                        disabled={isBusy || !producer.verified}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-poppins font-semibold text-white disabled:opacity-40"
                        style={{ backgroundColor: "#FF4500" }}
                      >
                        {isRejecting ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <XCircle size={12} />
                        )}
                        Reject
                      </button>
                    </div>
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

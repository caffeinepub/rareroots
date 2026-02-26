import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import Layout from "../components/Layout";
import { useGetOrdersByBuyer, useGetAllProducts, useGetAllProducers } from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { Skeleton } from "@/components/ui/skeleton";
import BadgePill from "../components/BadgePill";
import { ShoppingBag, Star, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatus } from "../backend";

type FilterStatus = "all" | "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

const STATUS_VARIANT: Record<string, "gold" | "green" | "indigo" | "red"> = {
  pending: "gold",
  confirmed: "indigo",
  shipped: "indigo",
  delivered: "green",
  cancelled: "red",
};

export default function OrderHistory() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [filter, setFilter] = useState<FilterStatus>("all");

  const { data: orders = [], isLoading: ordersLoading } = useGetOrdersByBuyer();
  const { data: products = [] } = useGetAllProducts();
  const { data: producers = [] } = useGetAllProducers();

  if (!identity) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <ShoppingBag size={48} className="text-earthBrown/30 mb-4" />
          <h2 className="font-poppins font-bold text-xl text-earthBrown mb-2">
            Login to View Orders
          </h2>
          <p className="font-roboto text-sm text-earthBrown/60 mb-6">
            Sign in to see your rare collection
          </p>
          <Button
            onClick={() => navigate({ to: "/home" })}
            className="bg-earthBrown text-ivoryCream font-poppins"
          >
            Go Home
          </Button>
        </div>
      </Layout>
    );
  }

  const filteredOrders = orders.filter((o) => {
    if (filter === "all") return true;
    return o.status === filter;
  });

  const stats = {
    total: orders.length,
    delivered: orders.filter((o) => o.status === OrderStatus.delivered).length,
    pending: orders.filter(
      (o) => o.status === OrderStatus.pending || o.status === OrderStatus.confirmed
    ).length,
  };

  return (
    <Layout>
      <div className="px-4 py-4">
        <h1 className="font-poppins font-bold text-xl text-earthBrown mb-4">
          🛍️ My Rare Collection
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Total", value: stats.total, color: "#8B4513" },
            { label: "Delivered", value: stats.delivered, color: "#228B22" },
            { label: "In Progress", value: stats.pending, color: "#DAA520" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-white rounded-xl p-3 text-center shadow-sm border border-earthBrown/10"
            >
              <p className="font-poppins font-bold text-xl" style={{ color }}>
                {value}
              </p>
              <p className="font-roboto text-xs text-earthBrown/60">{label}</p>
            </div>
          ))}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {(["all", "pending", "confirmed", "shipped", "delivered", "cancelled"] as FilterStatus[]).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-poppins font-medium transition-colors border capitalize ${
                  filter === status
                    ? "bg-earthBrown text-ivoryCream border-earthBrown"
                    : "bg-white text-earthBrown border-earthBrown/20 hover:border-earthBrown/50"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        {/* Orders */}
        {ordersLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-3 bg-white rounded-xl">
                <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag size={40} className="text-earthBrown/20 mx-auto mb-3" />
            <p className="font-poppins text-earthBrown/50 text-sm">
              {filter === "all" ? "No orders yet" : `No ${filter} orders`}
            </p>
            {filter === "all" && (
              <Button
                onClick={() => navigate({ to: "/products" })}
                className="mt-4 bg-earthBrown text-ivoryCream font-poppins"
              >
                Start Shopping
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const product = products.find((p) => p.id === order.productId);
              const producer = product
                ? producers.find(
                    (pr) => pr.id.toString() === product.producerId.toString()
                  )
                : undefined;

              const thumbnailUrl = product?.thumbnail
                ? product.thumbnail.getDirectURL()
                : "/assets/generated/product-placeholder.dim_600x600.png";

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl p-3 shadow-sm border border-earthBrown/10"
                >
                  <div className="flex gap-3">
                    <img
                      src={thumbnailUrl}
                      alt={product?.title || "Product"}
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-poppins text-sm font-semibold text-earthBrown truncate">
                        {product?.title || "Unknown Product"}
                      </p>
                      {producer && (
                        <p className="font-roboto text-xs text-earthBrown/60 mt-0.5">
                          by {producer.name}
                        </p>
                      )}
                      <p className="font-roboto text-xs text-earthBrown/50 mt-0.5">
                        Qty: {Number(order.quantity)} ·{" "}
                        {new Date(
                          Number(order.timestamp) / 1_000_000
                        ).toLocaleDateString("en-IN")}
                      </p>
                      <div className="mt-1">
                        <BadgePill
                          variant={STATUS_VARIANT[order.status] || "gold"}
                          size="sm"
                        >
                          {order.status}
                        </BadgePill>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-earthBrown/10">
                    <button
                      onClick={() =>
                        navigate({
                          to: "/order-confirmation/$orderId",
                          params: { orderId: order.id },
                        })
                      }
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-full text-xs font-poppins border border-earthBrown/20 text-earthBrown hover:bg-earthBrown/5"
                    >
                      <RotateCcw size={12} /> View Details
                    </button>
                    {order.status === OrderStatus.delivered && (
                      <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-full text-xs font-poppins border border-sandGold/40 text-sandGold hover:bg-sandGold/5">
                        <Star size={12} /> Rate
                      </button>
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

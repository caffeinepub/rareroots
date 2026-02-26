import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetOrdersByProduct, useUpdateOrderStatus } from "../hooks/useQueries";
import type { Product, Order } from "../hooks/useQueries";
import { OrderStatus } from "../backend";
import BadgePill from "./BadgePill";
import { toast } from "sonner";

interface ProducerOrderListProps {
  products: Product[];
}

const STATUS_COLORS: Record<string, "gold" | "green" | "indigo" | "red"> = {
  pending: "gold",
  confirmed: "indigo",
  shipped: "indigo",
  delivered: "green",
  cancelled: "red",
};

function OrderRow({ order }: { order: Order }) {
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (status: string) => {
    try {
      await updateStatus.mutateAsync({
        id: order.id,
        status: status as OrderStatus,
      });
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-earthBrown/10 shadow-sm">
      <div className="flex-1 min-w-0">
        <p className="font-poppins text-xs font-semibold text-earthBrown truncate">
          Order #{order.id.slice(-8)}
        </p>
        <p className="font-roboto text-xs text-earthBrown/60">
          Qty: {Number(order.quantity)} ·{" "}
          {new Date(Number(order.timestamp) / 1_000_000).toLocaleDateString("en-IN")}
        </p>
      </div>
      <BadgePill variant={STATUS_COLORS[order.status] || "gold"} size="sm">
        {order.status}
      </BadgePill>
      <Select value={order.status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-28 h-7 text-xs border-earthBrown/20 shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.values(OrderStatus).map((s) => (
            <SelectItem key={s} value={s} className="text-xs">
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ProductOrders({ product }: { product: Product }) {
  const { data: orders = [], isLoading } = useGetOrdersByProduct(product.id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 size={18} className="animate-spin text-earthBrown" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <p className="text-xs text-earthBrown/50 font-roboto py-2 text-center">
        No orders for this product
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {orders.map((order) => (
        <OrderRow key={order.id} order={order} />
      ))}
    </div>
  );
}

export default function ProducerOrderList({ products }: ProducerOrderListProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ""
  );

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-earthBrown/50 font-roboto text-sm">
        No products yet. Add products to see orders.
      </div>
    );
  }

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="space-y-4">
      <div>
        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
          <SelectTrigger className="border-earthBrown/30">
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProduct && <ProductOrders product={selectedProduct} />}
    </div>
  );
}

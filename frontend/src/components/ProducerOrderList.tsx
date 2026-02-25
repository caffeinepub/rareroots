import React, { useState } from 'react';
import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Order, Product } from '../backend';
import { OrderStatus } from '../backend';
import { useUpdateOrderStatus } from '../hooks/useQueries';
import { toast } from 'sonner';

interface ProducerOrderListProps {
  orders: Order[];
  products: Product[];
  isLoading: boolean;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800', icon: <Clock className="h-3 w-3" /> },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="h-3 w-3" /> },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: <Truck className="h-3 w-3" /> },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
};

export default function ProducerOrderList({ orders, products, isLoading }: ProducerOrderListProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const updateStatus = useUpdateOrderStatus();
  const productMap = new Map(products.map((p) => [p.id, p]));

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status });
      toast.success('Order status updated.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update status.');
    }
  };

  const formatDate = (time: bigint) => {
    return new Date(Number(time) / 1_000_000).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}</p>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-serif text-lg text-foreground mb-1">No orders yet</p>
          <p className="text-sm text-muted-foreground">Orders from consumers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const product = productMap.get(order.productId);
            const cfg = statusConfig[order.status] || statusConfig.pending;
            return (
              <div key={order.id} className="p-4 bg-card rounded-lg border border-border">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    {product?.thumbnail && (
                      <img
                        src={product.thumbnail.getDirectURL()}
                        alt={product?.title}
                        className="h-12 w-12 rounded-lg object-cover shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/assets/generated/product-placeholder.dim_600x600.png'; }}
                      />
                    )}
                    <div>
                      <p className="font-semibold text-sm text-foreground">{product?.title || 'Unknown Product'}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {Number(order.quantity)} · {formatDate(order.timestamp)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        Buyer: {order.buyer.toString().slice(0, 12)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <Select
                        value={order.status}
                        onValueChange={(val) => handleStatusUpdate(order.id, val as OrderStatus)}
                        disabled={updateStatus.isPending}
                      >
                        <SelectTrigger className="h-7 text-xs w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

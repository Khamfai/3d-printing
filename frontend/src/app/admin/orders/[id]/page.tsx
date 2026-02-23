"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { OrderStatusTracker } from "@/components/order/OrderStatusTracker";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { ordersAPI } from "@/services/orders.service";
import { formatCurrency, formatDateTime, QUALITY_OPTIONS } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const TRANSITIONS: Record<string, Array<{ value: string; label: string }>> = {
  PENDING: [{ value: "PAID", label: "Mark as Paid" }, { value: "CANCELLED", label: "Cancel" }],
  PAID: [{ value: "PRINTING", label: "Start Printing" }, { value: "CANCELLED", label: "Cancel" }],
  PRINTING: [{ value: "FINISHED", label: "Mark as Finished" }, { value: "CANCELLED", label: "Cancel" }],
  FINISHED: [{ value: "SHIPPED", label: "Mark as Shipped" }],
  SHIPPED: [{ value: "COMPLETED", label: "Mark as Completed" }],
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [nextStatus, setNextStatus] = useState("");

  useEffect(() => {
    ordersAPI.getById(id).then((res) => {
      if (res.data) {
        setOrder(res.data);
        const transitions = TRANSITIONS[res.data.status];
        if (transitions?.length) setNextStatus(transitions[0].value);
      }
    }).catch(console.error).finally(() => setIsLoading(false));
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!nextStatus) return;
    setIsUpdating(true);
    try {
      const res = await ordersAPI.updateStatus(id, nextStatus);
      if (res.data) {
        setOrder(res.data);
        const transitions = TRANSITIONS[res.data.status];
        if (transitions?.length) setNextStatus(transitions[0].value);
        else setNextStatus("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Order Not Found</h1>
        <Link href="/admin/orders"><Button className="mt-4">Back to Orders</Button></Link>
      </div>
    );
  }

  const transitions = TRANSITIONS[order.status] || [];

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={`Order #${order.id.slice(0, 8)}`}
        description={`${order.user?.name} (${order.user?.email}) &middot; ${formatDateTime(order.createdAt)}`}
      />

      {/* Status */}
      <Card className="mb-6">
        <CardContent className="py-6">
          <OrderStatusTracker currentStatus={order.status} />
        </CardContent>
      </Card>

      {/* Status Update */}
      {transitions.length > 0 && (
        <Card className="mb-6">
          <CardContent className="flex items-center gap-4">
            <Select
              options={transitions}
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value)}
              className="w-48"
            />
            <Button onClick={handleUpdateStatus} isLoading={isUpdating}>
              Update Status
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Items */}
      <Card className="mb-6">
        <CardContent>
          <h3 className="text-lg font-semibold mb-4">Items</h3>
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-3 border-b last:border-0">
              <div className="w-10 h-10 rounded" style={{ backgroundColor: item.colorHex }} />
              <div className="flex-1">
                <p className="font-medium">{item.model?.name || "Model"}</p>
                <p className="text-xs text-gray-500">
                  {item.material?.name} &middot; {QUALITY_OPTIONS.find((q) => q.value === item.quality)?.label} &middot; {item.infillPercent}% &middot; x{item.quantity}
                </p>
              </div>
              <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
            </div>
          ))}
          <div className="flex justify-between pt-4 text-lg font-bold">
            <span>Total</span>
            <span className="text-brand-600">{formatCurrency(order.totalAmount)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

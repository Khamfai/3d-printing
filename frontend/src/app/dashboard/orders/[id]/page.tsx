"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { OrderStatusTracker } from "@/components/order/OrderStatusTracker";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ordersAPI } from "@/services/orders.service";
import { formatCurrency, formatDateTime, QUALITY_OPTIONS } from "@/lib/utils";
import type { Order } from "@/types";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getById(id).then((res) => {
      if (res.data) setOrder(res.data);
    }).catch(console.error).finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="container-page">
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-16 w-full mb-8 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page text-center py-20">
        <h1 className="text-2xl font-bold text-gray-900">Order Not Found</h1>
        <Link href="/dashboard/orders"><Button className="mt-4">Back to Orders</Button></Link>
      </div>
    );
  }

  return (
    <div className="container-page max-w-4xl">
      <PageHeader
        title={`Order #${order.id.slice(0, 8)}`}
        description={`Placed on ${formatDateTime(order.createdAt)}`}
      />

      {/* Status Tracker */}
      <Card className="mb-8">
        <CardContent className="py-6">
          <OrderStatusTracker currentStatus={order.status} />
        </CardContent>
      </Card>

      {/* Items */}
      <Card className="mb-6">
        <CardContent>
          <h3 className="text-lg font-semibold mb-4">Order Items</h3>
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-4 border-b last:border-0">
              <div className="w-12 h-12 rounded-lg shrink-0" style={{ backgroundColor: item.colorHex }} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{item.model?.name || "Model"}</p>
                <p className="text-xs text-gray-500">
                  {item.material?.name} &middot; {QUALITY_OPTIONS.find((q) => q.value === item.quality)?.label || item.quality} &middot; {item.infillPercent}% infill &middot; Qty: {item.quantity}
                </p>
              </div>
              <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge status={order.status} className="mt-1" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-brand-600">{formatCurrency(order.totalAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

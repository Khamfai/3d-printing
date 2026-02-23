"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { OrderCard } from "@/components/order/OrderCard";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ordersAPI } from "@/services/orders.service";
import type { Order } from "@/types";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    ordersAPI.getMyOrders({ page: String(page), limit: "10" }).then((res) => {
      setOrders(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    }).catch(console.error).finally(() => setIsLoading(false));
  }, [page]);

  return (
    <div className="container-page">
      <PageHeader title="My Orders" description="View and track all your orders" />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Your order history will appear here" />
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

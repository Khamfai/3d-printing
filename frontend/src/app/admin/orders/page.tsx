"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { OrderCard } from "@/components/order/OrderCard";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { ordersAPI } from "@/services/orders.service";
import type { Order } from "@/types";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "PRINTING", label: "Printing" },
  { value: "FINISHED", label: "Finished" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const params: Record<string, string> = { page: String(page), limit: "20" };
    if (status) params.status = status;
    ordersAPI.getAll(params).then((res) => {
      setOrders(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    }).catch(console.error).finally(() => setIsLoading(false));
  }, [page, status]);

  return (
    <div>
      <PageHeader title="Order Management" description="View and manage all customer orders" />

      <div className="mb-6">
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="w-48"
          aria-label="Filter by status"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} isAdmin />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

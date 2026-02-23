"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsCard } from "@/components/admin/StatsCard";
import { OrderCard } from "@/components/order/OrderCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { adminAPI } from "@/services/admin.service";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard().then((res) => {
      if (res.data) setStats(res.data);
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Admin Dashboard" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Overview of your 3D printing service" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard label="Total Orders" value={stats?.totalOrders || 0} icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        <StatsCard label="Pending Orders" value={stats?.pendingOrders || 0} icon="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        <StatsCard label="Total Revenue" value={formatCurrency(stats?.totalRevenue || 0)} icon="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
      <div className="space-y-3">
        {stats?.recentOrders?.map((order) => (
          <OrderCard key={order.id} order={order} isAdmin />
        )) || <p className="text-gray-500">No orders yet</p>}
      </div>
    </div>
  );
}

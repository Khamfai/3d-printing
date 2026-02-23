"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OrderCard } from "@/components/order/OrderCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuthStore } from "@/store/auth-store";
import { ordersAPI } from "@/services/orders.service";
import type { Order } from "@/types";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getMyOrders({ limit: "5" }).then((res) => {
      setOrders(res.data || []);
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="container-page">
      <PageHeader
        title={`Welcome back, ${user?.name || "User"}`}
        description="Manage your orders and uploaded models"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/upload">
          <Card hover className="h-full">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Upload Model</p>
                <p className="text-sm text-gray-500">Upload a new 3D model</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/gallery">
          <Card hover className="h-full">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Browse Gallery</p>
                <p className="text-sm text-gray-500">Explore sample models</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/orders">
          <Card hover className="h-full">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">My Orders</p>
                <p className="text-sm text-gray-500">View order history</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Place your first order to get started"
          action={<Link href="/gallery"><Button>Browse Gallery</Button></Link>}
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

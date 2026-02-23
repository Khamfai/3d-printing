import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types";

interface OrderCardProps {
  order: Order;
  isAdmin?: boolean;
}

export function OrderCard({ order, isAdmin }: OrderCardProps) {
  const href = isAdmin ? `/admin/orders/${order.id}` : `/dashboard/orders/${order.id}`;

  return (
    <Link href={href}>
      <Card hover className="transition-all">
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <p className="font-medium text-gray-900">#{order.id.slice(0, 8)}</p>
              <Badge status={order.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {order.items.length} item{order.items.length > 1 ? "s" : ""} &middot; {formatDate(order.createdAt)}
            </p>
            {isAdmin && order.user && (
              <p className="text-xs text-gray-400 mt-1">{order.user.name} ({order.user.email})</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { useCartStore, selectCartTotal } from "@/store/cart-store";
import { CartItem } from "@/components/cart/CartItem";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items } = useCartStore();
  const total = useCartStore(selectCartTotal);

  if (items.length === 0) {
    return (
      <div className="container-page">
        <PageHeader title="Shopping Cart" />
        <EmptyState
          title="Your cart is empty"
          description="Add some 3D models to get started"
          action={<Link href="/gallery"><Button>Browse Gallery</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="container-page">
      <PageHeader title="Shopping Cart" description={`${items.length} item${items.length > 1 ? "s" : ""} in your cart`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent>
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Order Summary</h3>

              <div className="space-y-2 text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-gray-500 truncate flex-1 mr-2">{item.modelName} x{item.quantity}</span>
                    <span className="text-gray-900">{formatCurrency(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <hr />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-brand-600">{formatCurrency(total)}</span>
              </div>

              <Link href="/checkout" className="block">
                <Button className="w-full" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { useCartStore, selectCartTotal } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { ordersAPI } from "@/services/orders.service";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const total = useCartStore(selectCartTotal);
  const { isAuthenticated } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const orderItems = items.map((item) => ({
        modelId: item.modelId,
        materialId: item.materialId,
        colorHex: item.colorHex,
        quality: item.quality,
        infillPercent: item.infillPercent,
        quantity: item.quantity,
      }));

      const res = await ordersAPI.create({
        items: orderItems,
        shippingAddress: address.street ? address : undefined,
        notes: notes || undefined,
      });

      if (res.success) {
        clearCart();
        router.push(`/checkout/success?orderId=${res.data?.id}`);
      } else {
        setError(res.message || "Order failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="container-page max-w-4xl">
      <PageHeader title="Checkout" />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping */}
          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-4">
                <h3 className="text-lg font-semibold">Shipping Address</h3>
                <Input label="Street" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} required />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required />
                  <Input label="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Postal Code" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} required />
                  <Input label="Country" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} required />
                </div>
                <Input
                  label="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Order summary */}
          <div>
            <Card>
              <CardContent className="space-y-4">
                <h3 className="text-lg font-semibold">Order Summary</h3>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-2 border-b">
                    <div>
                      <p className="font-medium">{item.modelName}</p>
                      <p className="text-xs text-gray-500">{item.materialName} &middot; Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{formatCurrency(item.unitPrice * item.quantity)}</p>
                  </div>
                ))}
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total</span>
                  <span className="text-brand-600">{formatCurrency(total)}</span>
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
                )}

                <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
                  Place Order - {formatCurrency(total)}
                </Button>

                <p className="text-xs text-gray-400 text-center">
                  Payment will be processed via Stripe after order confirmation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

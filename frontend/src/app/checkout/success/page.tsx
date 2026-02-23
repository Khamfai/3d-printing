"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="container-page max-w-lg">
      <Card>
        <CardContent className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Order Placed!</h1>
          <p className="text-gray-500 mt-2">
            Thank you for your order. We&apos;ll start processing it soon.
          </p>

          {orderId && (
            <p className="mt-4 font-mono text-sm bg-gray-50 rounded-lg px-4 py-2 inline-block">
              Order #{orderId.slice(0, 8)}
            </p>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            {orderId && (
              <Link href={`/dashboard/orders/${orderId}`}>
                <Button>View Order</Button>
              </Link>
            )}
            <Link href="/gallery">
              <Button variant="outline">Continue Browsing</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container-page max-w-lg text-center py-12">Loading...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

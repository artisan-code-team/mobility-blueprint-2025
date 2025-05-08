"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount");

  return (
    <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
      <div className="text-green-600 text-6xl mb-4">✓</div>
      <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
      <p className="text-gray-600">Thank you for your payment of ${amount}.</p>
      <div className="mt-6">
        <Link
          href="/dashboard"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <Suspense
        fallback={
          <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
            <div className="animate-pulse h-10 w-10 mx-auto bg-gray-200 rounded-full"></div>
            <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
          </div>
        }
      >
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}

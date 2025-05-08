"use client";

import React, { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import convertToSubcurrency from "@/app/functions/convertToSubcurrency";

const CheckoutPage = ({ amount }: { amount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: convertToSubcurrency(amount) }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [amount]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      return;
    }

    const { error: submitError } = await elements.submit();

    if (submitError) {
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `http://www.localhost:3000/payment-success?amount=${amount}`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      // The payment UI automatically closes with a success animation.
      // Your customer is redirected to your `return_url`.
    }

    setLoading(false);
  };

  if (!clientSecret || !stripe || !elements) {
    return (
      <div className="flex items-center justify-center min-h-[200px] w-full">
        <div
          className="inline-block h-10 w-10 md:h-12 md:w-12 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 sm:p-6 md:p-8 rounded-md shadow-md"
      >
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">
            Payment Details
          </h2>
          {clientSecret && <PaymentElement className="mb-4" />}

          {errorMessage && (
            <div className="p-3 my-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {errorMessage}
            </div>
          )}
        </div>

        <button
          disabled={!stripe || loading}
          className="text-white w-full p-3 sm:p-4 md:p-5 bg-black mt-2 rounded-md font-bold text-sm md:text-base disabled:opacity-50 disabled:animate-pulse transition-all hover:bg-gray-800"
          type="submit"
        >
          {!loading ? `Pay $${amount}` : "Processing..."}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;

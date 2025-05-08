import CheckoutPage from "../components/CheckoutPage";
import convertToSubcurrency from "@/app/functions/convertToSubcurrency";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY === undefined) {
  throw new Error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
}
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

interface StripePaymentProps {
  onCancel: () => void;
}

export default function StripePayment({ onCancel }: StripePaymentProps) {
  const amount = 1;

  return (
    <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div className="sm:flex sm:items-start">
          <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Complete Your Subscription
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Please complete your payment to finish setting up your account.
              </p>
              <div className="mt-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm font-semibold">Subscription Details:</p>
                  <p className="mt-2 text-md font-semibold">
                    Monthly Subscription: ${amount}/month
                  </p>
                </div>

                {/* Stripe Elements */}
                <div className="mt-4">
                  <Elements
                    stripe={stripePromise}
                    options={{
                      mode: "payment",
                      amount: convertToSubcurrency(amount),
                      currency: "usd",
                    }}
                  >
                    <CheckoutPage amount={amount} />
                  </Elements>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-gray-500 w-full text-center"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

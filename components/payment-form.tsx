/**
 * TEMPORARILY DISABLED: This component is part of the Stripe integration that has been paused.
 * Do not use this component until the Stripe integration is re-enabled.
 */

"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement, AddressElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function PaymentForm({
  onSuccess,
  onError,
  total,
}: {
  onSuccess: (paymentIntent: any) => void;
  onError: (error: Error) => void;
  total: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsProcessing(true);
    setErrorMessage(undefined);

    try {
      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
        },
        redirect: "if_required",
      });

      if (error) {
        // Show error to your customer
        setErrorMessage(error.message);
        onError(new Error(error.message || "An unexpected error occurred"));
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded
        onSuccess(paymentIntent);
      } else {
        // Unexpected state
        setErrorMessage("An unexpected error occurred during payment processing");
        onError(new Error("An unexpected error occurred during payment processing"));
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
      onError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment element will automatically collect card details */}
      <PaymentElement />
      
      {/* Show any error or success messages */}
      {errorMessage && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {errorMessage}
        </div>
      )}

      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total / 100)}`
        )}
      </Button>
    </form>
  );

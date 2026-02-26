// Razorpay window type declaration
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  config?: {
    display?: {
      blocks?: Record<string, { name: string; instruments: Array<{ method: string }> }>;
      sequence?: string[];
      preferences?: { show_default_blocks?: boolean };
    };
  };
  handler?: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface RazorpayInstance {
  open(): void;
  on(event: string, callback: (response: unknown) => void): void;
}

export interface UseRazorpayResult {
  openPayment: (params: {
    amount: number; // in rupees
    name: string;
    description?: string;
    prefillName?: string;
    prefillContact?: string;
  }) => Promise<RazorpaySuccessResponse>;
  isAvailable: boolean;
}

export function useRazorpay(): UseRazorpayResult {
  const isAvailable = typeof window !== "undefined" && typeof window.Razorpay === "function";

  const openPayment = (params: {
    amount: number;
    name: string;
    description?: string;
    prefillName?: string;
    prefillContact?: string;
  }): Promise<RazorpaySuccessResponse> => {
    return new Promise((resolve, reject) => {
      if (!isAvailable) {
        reject(new Error("Razorpay SDK not loaded. Please check your internet connection."));
        return;
      }

      const amountInPaise = Math.round(params.amount * 100);

      const options: RazorpayOptions = {
        key: "rzp_test_YourKeyHere", // Replace with actual Razorpay key
        amount: amountInPaise,
        currency: "INR",
        name: params.name,
        description: params.description || "Purchase",
        theme: {
          color: "#5C3D2E", // earthBrown
        },
        config: {
          display: {
            blocks: {
              utib: {
                name: "Pay via UPI",
                instruments: [
                  { method: "upi" },
                ],
              },
              other: {
                name: "Other Payment Methods",
                instruments: [
                  { method: "card" },
                  { method: "netbanking" },
                  { method: "wallet" },
                ],
              },
            },
            sequence: ["block.utib", "block.other"],
            preferences: {
              show_default_blocks: false,
            },
          },
        },
        prefill: {
          name: params.prefillName || "",
          contact: params.prefillContact || "",
        },
        handler: (response: RazorpaySuccessResponse) => {
          resolve(response);
        },
        modal: {
          ondismiss: () => {
            reject(new Error("Payment cancelled by user"));
          },
          escape: true,
          backdropclose: false,
        },
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response: unknown) => {
          const err = response as { error?: { description?: string } };
          reject(new Error(err?.error?.description || "Payment failed"));
        });
        rzp.open();
      } catch (err) {
        reject(err);
      }
    });
  };

  return { openPayment, isAvailable };
}

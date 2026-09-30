import { apiRequest } from "../lib/api";

export function createRazorpayOrder(amount, token) {
  return apiRequest("/payments/razorpay/order", {
    method: "POST",
    body: { amount },
    token,
  });
}

export function verifyRazorpayPayment(paymentData, token) {
  return apiRequest("/payments/razorpay/verify", {
    method: "POST",
    body: paymentData,
    token,
  });
}
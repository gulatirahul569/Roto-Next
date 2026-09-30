import { apiRequest } from "../lib/api";

export function createOrder(orderData, token) {
  return apiRequest("/orders", {
    method: "POST",
    body: orderData,
    token,
  });
}

export function getMyOrders(token) {
  return apiRequest("/orders/myorders", {
    token,
  });
}

export function getAllOrders(token) {
  return apiRequest("/orders", {
    token,
  });
}

export function updateOrderStatus(orderId, status, token) {
  return apiRequest(`/orders/${orderId}`, {
    method: "PUT",
    body: { status },
    token,
  });
}
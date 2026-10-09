// Happy Heart Cakes - API Helper
const API_BASE = 'https://happy-heart-cakes-api.onrender.com/api';

function getToken() {
  const user = JSON.parse(localStorage.getItem('hhc_user') || 'null');
  return user?.token || null;
}

function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function apiRequest(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// Auth
async function apiRegister({ name, email, phone, password }) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, phone, password })
  });
}

async function apiLogin({ email, password }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

// Orders
async function apiCreateOrder(orderData) {
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
}

async function apiGetMyOrders() {
  return apiRequest('/orders/myorders');
}

async function apiGetAllOrders() {
  return apiRequest('/orders');
}

async function apiUpdateOrderStatus(id, status) {
  return apiRequest(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
}

async function apiDeleteOrder(id) {
  return apiRequest(`/orders/${id}`, {
    method: 'DELETE'
  });
}

// Custom Requests
async function apiCreateCustomRequest(data) {
  return apiRequest('/custom-requests', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

async function apiGetCustomRequests() {
  return apiRequest('/custom-requests');
}

// Reviews
async function apiCreateReview(data) {
  return apiRequest('/reviews', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

async function apiGetApprovedReviews() {
  return apiRequest('/reviews');
}

async function apiGetAllReviews() {
  return apiRequest('/reviews/all');
}

async function apiApproveReview(id) {
  return apiRequest(`/reviews/${id}/approve`, {
    method: 'PUT'
  });
}

async function apiDeleteReview(id) {
  return apiRequest(`/reviews/${id}`, {
    method: 'DELETE'
  });
}
// M-Pesa STK Push
async function apiMpesaStkPush({ phone, amount, orderId, accountReference, description }) {
  return apiRequest('/payments/mpesa/stkpush', {
    method: 'POST',
    body: JSON.stringify({
      phone,
      amount,
      orderId,
      accountReference,
      description
    })
  });
}
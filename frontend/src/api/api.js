const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const register = (data) =>
  fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handleResponse);

export const login = (data) =>
  fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handleResponse);

export const getHoardings = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetch(`${API_URL}/hoardings?${query}`).then(handleResponse);
};

export const getHoardingById = (id) =>
  fetch(`${API_URL}/hoardings/${id}`).then(handleResponse);

export const getHoardingReviews = (hoardingId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetch(`${API_URL}/reviews/hoarding/${hoardingId}?${query}`).then(handleResponse);
};

export const createBooking = (data, token) =>
  fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  }).then(handleResponse);

export const getMyBookings = (token) =>
  fetch(`${API_URL}/bookings/me`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(handleResponse);

export const getHoardingBookings = (hoardingId) =>
  fetch(`${API_URL}/bookings/hoarding/${hoardingId}`).then(handleResponse);

export const getVendorHoardings = (token) => {
  console.log('Making vendor hoardings request with token:', token); // Debug token
  return fetch(`${API_URL}/hoardings/myhoardings`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(async (res) => {
    console.log('Vendor hoardings response status:', res.status); // Debug response status
    const data = await res.json();
    console.log('Vendor hoardings response data:', data); // Debug response data
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch vendor hoardings');
    }
    return data;
  });
};

export const getVendorBookings = (token) => {
  console.log('Making vendor bookings request with token:', token); // Debug token
  return fetch(`${API_URL}/bookings/me`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(async (res) => {
    console.log('Vendor bookings response status:', res.status); // Debug response status
    const data = await res.json();
    console.log('Vendor bookings response data:', data); // Debug response data
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch vendor bookings');
    }
    return data;
  });
};

export const getVendorAnalytics = (token) =>
  fetch(`${API_URL}/analytics/vendor`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(handleResponse);
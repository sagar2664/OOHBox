const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const register = (data) =>
  fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(res => res.json());

export const login = (data) =>
  fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(res => res.json());

export const getHoardings = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetch(`${API_URL}/hoardings?${query}`).then(res => res.json());
};

export const getHoardingById = (id) =>
  fetch(`${API_URL}/hoardings/${id}`).then(res => res.json());

export const getHoardingReviews = (hoardingId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetch(`${API_URL}/reviews/hoarding/${hoardingId}?${query}`).then(res => res.json());
};

export const createBooking = (data, token) =>
  fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  }).then(res => res.json());

export const getMyBookings = (token) =>
  fetch(`${API_URL}/bookings/me`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(res => res.json());
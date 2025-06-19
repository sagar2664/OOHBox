const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    // Create an error with the response data
    const error = new Error(data.message || 'Something went wrong');
    error.response = { data };
    throw error;
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

export const createBooking = async (bookingData, token) => {
  const response = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bookingData)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create booking');
  }
  return response.json();
};

export const getMyBookings = async (token) => {
  const response = await fetch(`${API_URL}/bookings/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch bookings');
  }
  return response.json();
};

export const getHoardingBookings = (hoardingId) =>
  fetch(`${API_URL}/bookings/hoarding/${hoardingId}`).then(handleResponse);

export const getVendorHoardings = (token, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetch(`${API_URL}/hoardings/me?${query}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch vendor hoardings');
    }
    return data;
  });
};

export const getVendorBookings = (token, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetch(`${API_URL}/bookings/me?${query}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(handleResponse);
};

export const getVendorAnalytics = (token) =>
  fetch(`${API_URL}/analytics/vendor`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(handleResponse);

export const createHoarding = (data, mediaFiles, token) => {
  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  if (mediaFiles && mediaFiles.length > 0) {
    mediaFiles.forEach((file, index) => {
      formData.append(`media`, file);
    });
  }
  return fetch(`${API_URL}/hoardings`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: formData,
  }).then(async (res) => {
    const responseData = await res.json();
    if (!res.ok) {
      throw new Error(responseData.message || 'Failed to create hoarding');
    }
    return responseData;
  });
};

export const updateHoarding = (id, data, mediaFiles, token) => {
  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  if (mediaFiles && mediaFiles.length > 0) {
    mediaFiles.forEach((file, index) => {
      formData.append(`media`, file);
    });
  }
  return fetch(`${API_URL}/hoardings/${id}`, {
    method: 'PATCH',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: formData,
  }).then(async (res) => {
    const responseData = await res.json();
    if (!res.ok) {
      throw new Error(responseData.message || 'Failed to update hoarding');
    }
    return responseData;
  });
};

export const deleteHoarding = (id, token) =>
  fetch(`${API_URL}/hoardings/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(handleResponse);

export const getBookingById = async (id, token) => {
  const response = await fetch(`${API_URL}/bookings/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch booking');
  }
  return response.json();
};

export const updateBookingStatus = async (id, status, token, proofFile = null) => {
  const formData = new FormData();
  formData.append('status', status);
  
  if (proofFile) {
    formData.append('proofImages', proofFile);
  }

  const response = await fetch(`${API_URL}/bookings/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update booking status');
  }
  return response.json();
};

export const updateInstallation = async (id, installationData, token) => {
  const response = await fetch(`${API_URL}/bookings/${id}/installation`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(installationData)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update installation');
  }
  return response.json();
};

export const uploadBookingProof = async (id, proofFile, token) => {
  const formData = new FormData();
  formData.append('proofImages', proofFile);

  const response = await fetch(`${API_URL}/bookings/${id}/proof`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload proof');
  }
  return response.json();
};

export const updateVerification = async (id, verificationData, token) => {
  const response = await fetch(`${API_URL}/bookings/${id}/verification`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(verificationData)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update verification');
  }
  return response.json();
};

export const createReview = (data, token) =>
  fetch(`${API_URL}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  }).then(handleResponse);

export const updateReview = (id, data, token) =>
  fetch(`${API_URL}/reviews/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  }).then(handleResponse);

export const getReviewByBookingId = async (hoardingId, bookingId) => {
  const res = await fetch(`${API_URL}/reviews/hoarding/${hoardingId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch reviews');
  return (data.reviews || []).find(r => r.bookingId === bookingId);
};

export const getAdminAnalytics = (token) =>
  fetch(`${API_URL}/analytics/admin`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(handleResponse);

export const getUsers = ({ page = 1, search = '' } = {}, token) => {
  const query = new URLSearchParams({ page, search }).toString();
  return fetch(`${API_URL}/users?${query}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(handleResponse);
};

export const updateUser = (id, data, token) =>
  fetch(`${API_URL}/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }).then(handleResponse);

export const deleteUser = (id, token) =>
  fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(handleResponse);

export const getPendingHoardings = ({ page = 1, search = '' } = {}, token) => {
  const params = new URLSearchParams();
  params.append('status', 'pending');
  if (page) params.append('page', page);
  if (search) params.append('search', search);
  return fetch(`${API_URL}/hoardings?${params.toString()}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(handleResponse);
};

export const updateHoardingStatus = (id, status, token) =>
  fetch(`${API_URL}/hoardings/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ status }),
  }).then(handleResponse);

export const getProfile = (token) =>
  fetch(`${API_URL}/users/profile`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(handleResponse);

export const updateProfile = (data, token) =>
  fetch(`${API_URL}/users/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  }).then(handleResponse);
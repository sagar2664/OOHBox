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

export const getVendorHoardings = (token, params = {}) => {
  console.log('Making vendor hoardings request with token:', token); // Debug token
  const query = new URLSearchParams(params).toString();
  return fetch(`${API_URL}/hoardings/myhoardings?${query}`, {
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

export const getVendorBookings = (token, params = {}) => {
  console.log('Making vendor bookings request with token:', token); // Debug token
  const query = new URLSearchParams(params).toString();
  return fetch(`${API_URL}/bookings/me?${query}`, {
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

export const createHoarding = (data, imageFile, token) => {
  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  if (imageFile) {
    formData.append('image', imageFile);
  }
  return fetch(`${API_URL}/hoardings`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
      // Do not set Content-Type, browser will set it for FormData
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

export const updateHoarding = (id, data, imageFile, token) => {
  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  if (imageFile) {
    formData.append('image', imageFile);
  }
  return fetch(`${API_URL}/hoardings/${id}`, {
    method: 'PATCH',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
      // Do not set Content-Type, browser will set it for FormData
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

export const getBookingById = (id, token) =>
  fetch(`${API_URL}/bookings/${id}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(handleResponse);

export const updateBookingStatus = (id, status, token, proofFile = null) => {
  if (status === 'completed' && proofFile) {
    // If completing booking with proof, use FormData
    const formData = new FormData();
    formData.append('status', status);
    formData.append('proofImage', proofFile);

    return fetch(`${API_URL}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // Do not set Content-Type, browser will set it for FormData
      },
      body: formData,
    }).then(handleResponse);
  } else {
    // For other status updates, use JSON
    return fetch(`${API_URL}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status }),
    }).then(handleResponse);
  }
};

export const uploadBookingProof = (id, file, token) => {
  console.log('API: Starting proof upload...');
  console.log('API: File details:', {
    name: file.name,
    type: file.type,
    size: file.size
  });

  const formData = new FormData();
  formData.append('proofImage', file);
  
  console.log('API: FormData created with file');
  console.log('API: FormData entries:', Array.from(formData.entries()));

  return fetch(`${API_URL}/bookings/${id}/proof`, {
    method: 'PATCH',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Do not set Content-Type, browser will set it for FormData
    },
    body: formData,
  }).then(async (res) => {
    console.log('API: Upload response status:', res.status);
    const data = await res.json();
    console.log('API: Upload response data:', data);
    
    if (!res.ok) {
      throw new Error(data.message || 'Failed to upload proof');
    }
    return data;
  });
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

// Helper: get review for a booking (fetch all reviews for hoarding, filter by bookingId)
export const getReviewByBookingId = async (hoardingId, bookingId) => {
  const res = await fetch(`${API_URL}/reviews/hoarding/${hoardingId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch reviews');
  return (data.reviews || []).find(r => r.bookingId === bookingId);
};

// ADMIN: Get platform-wide analytics
export const getAdminAnalytics = (token) =>
  fetch(`${API_URL}/analytics/admin`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(handleResponse);

// ADMIN: Get all users (with pagination/search)
export const getUsers = ({ page = 1, search = '' } = {}, token) => {
  const query = new URLSearchParams({ page, search }).toString();
  return fetch(`${API_URL}/users?${query}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(handleResponse);
};

// ADMIN: Update user
export const updateUser = (id, data, token) =>
  fetch(`${API_URL}/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }).then(handleResponse);

// ADMIN: Delete user
export const deleteUser = (id, token) =>
  fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(handleResponse);

// ADMIN: Get pending hoardings (with pagination/search)
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

// ADMIN: Approve/Reject hoarding
export const updateHoardingStatus = (id, status, token) =>
  fetch(`${API_URL}/hoardings/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ status }),
  }).then(handleResponse);
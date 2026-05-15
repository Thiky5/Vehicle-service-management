
const BASE_URL = "/api/data"; // Always use our internal bridge to avoid console errors

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${BASE_URL}?collection=${endpoint.split('/')[0]}&id=${endpoint.split('/')[1] || ''}`;

  try {
    const response = await fetch(url, {
      ...options,
      cache: 'no-store',
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `Fetch failed with status ${response.status}`;
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch (e) {
        // Fallback if response is not JSON
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    throw error; // Rethrow so the caller can handle it
  }
};

export const endpoints = {
  VEHICLES: "vehicles",
  CUSTOMERS: "customers",
  SERVICE_ADVISORS: "serviceAdvisors",
  WORK_ITEMS: "workItems",
  USERS: "users",
};

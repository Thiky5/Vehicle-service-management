
const BASE_URL = "/api/data"; // Always use our internal bridge to avoid console errors

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${BASE_URL}?collection=${endpoint.split('/')[0]}&id=${endpoint.split('/')[1] || ''}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "An error occurred" }));
      throw new Error(error.message || `Fetch failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Silently handle errors to prevent UI crash
    return endpoint.includes("/") ? {} : [];
  }
};

export const endpoints = {
  VEHICLES: "vehicles",
  CUSTOMERS: "customers",
  SERVICE_ADVISORS: "serviceAdvisors",
  WORK_ITEMS: "workItems",
};

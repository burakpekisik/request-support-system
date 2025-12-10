const API_URL = "http://localhost:8080";

// Check if running on client-side
const isClient = typeof window !== 'undefined';

// ----------------- REGISTER -----------------
export async function register(tcNumber: string, firstName: string, lastName: string, email: string, password: string, phoneNumber: string) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tcNumber, firstName, lastName, email, password, phoneNumber }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Register failed");
  }

  const data = await response.json();
  
  // Token response body'de geliyor
  if (isClient && data.token) {
    localStorage.setItem("jwt_token", data.token);
    localStorage.setItem("user_id", data.userId);
    localStorage.setItem("user_role", data.role);
    localStorage.setItem("user_data", JSON.stringify(data));
  }

  return data;
}

// ----------------- LOGIN -----------------
export async function login(tcNumber: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tcNumber, password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Login failed");
  }

  const data = await response.json();

  // Token response body'de geliyor
  if (isClient && data.token) {
    localStorage.setItem("user_data", JSON.stringify(data));
  }

  return data;
}

// ----------------- AUTH HEADER -----------------
export function getAuthHeaders() {
  const token = isClient ? localStorage.getItem("jwt_token") : null;
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

// ----------------- LOGOUT -----------------
export function logout() {
  if (isClient) {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_role");
  }
}

// ----------------- GET STORED USER -----------------
export function getStoredUser() {
  if (!isClient) return null;
  
  const userDataStr = localStorage.getItem("user_data");
  return userDataStr ? JSON.parse(userDataStr) : null;
}

// ----------------- CHECK IF AUTHENTICATED -----------------
export function isAuthenticated(): boolean {
  if (!isClient) return false;
  return !!localStorage.getItem("jwt_token");
}
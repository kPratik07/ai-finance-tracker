const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const BASE_URL = `${API_BASE_URL}/api`;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const api = {
  auth: {
    login: async (credentials) => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      return data;
    },

    register: async (userData) => {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");
      return data;
    },

    logout: () => {
      localStorage.removeItem("token");
    },

    forgotPassword: async (email) => {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send reset link");
      return data;
    },

    resetPassword: async (token, password) => {
      const response = await fetch(`${BASE_URL}/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to reset password");
      return data;
    },
  },

  transactions: {
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/transactions`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch transactions");
      return data;
    },

    create: async (data) => {
      const response = await fetch(`${BASE_URL}/transactions`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to create transaction");
      return result;
    },

    delete: async (id) => {
      const response = await fetch(`${BASE_URL}/transactions/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to delete transaction");
      return data;
    },

    update: async (id, data) => {
      const response = await fetch(`${BASE_URL}/transactions/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to update transaction");
      return result;
    },
  },

  statements: {
    upload: async (file) => {
      const formData = new FormData();
      formData.append("statement", file);

      const response = await fetch(`${BASE_URL}/statements/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to process statement");
      return data;
    },
  },
};

export const { deleteTransaction } = api.transactions;
export const { upload: uploadStatement } = api.statements;

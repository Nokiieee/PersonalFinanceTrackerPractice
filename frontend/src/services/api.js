import axios from "axios";

// Set VITE_API_URL in your .env file, e.g.:
//   VITE_API_URL=http://localhost:5000/api
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

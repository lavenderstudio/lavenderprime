// client/src/lib/api.js
// ----------------------------------------------------
// Axios instance for API calls.
// Keeps baseURL in one place.
// ----------------------------------------------------

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // your Express server
  withCredentials: true,
});

export default api;

// client/src/lib/api.js
// ----------------------------------------------------
// Axios instance for API calls.
// - Dev: hits local Express server
// - Prod: hits same-origin (/api) on Render
// ----------------------------------------------------

import axios from "axios";

const isProd = import.meta.env.PROD;

const api = axios.create({
  baseURL: isProd ? "/api" : "http://localhost:5000/api",
  withCredentials: true,
});

export default api;

import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const api = axios.create({
  baseURL: process.env.API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    config.headers["Authorization"] = `bearer ${process.env.STRAPI_API_TOKEN}`;
    console.log("[AXIOS REQUEST]", config.method?.toUpperCase(), config.url, config.data || config.params);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("[AXIOS RESPONSE]", response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error(
      "[AXIOS ERROR]",
      error.config?.method?.toUpperCase(),
      error.config?.url,
      error.response?.status,
      error.response?.data
    );
    return Promise.reject(error);
  }
);

export { api };

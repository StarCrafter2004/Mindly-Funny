import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const api = axios.create({
  baseURL: process.env.API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    config.headers["Authorization"] = `bearer ${process.env.STRAPI_API_TOKEN}`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { api };

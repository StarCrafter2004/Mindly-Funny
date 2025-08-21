"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const api = axios_1.default.create({
    baseURL: process.env.API_BASE_URL,
});
exports.api = api;
api.interceptors.request.use((config) => {
    config.headers["Authorization"] = `bearer ${process.env.STRAPI_API_TOKEN}`;
    console.log("[AXIOS REQUEST]", config.method?.toUpperCase(), config.url, config.data || config.params);
    return config;
}, (error) => {
    return Promise.reject(error);
});
api.interceptors.response.use((response) => {
    console.log("[AXIOS RESPONSE]", response.status, response.config.url, response.data);
    return response;
}, (error) => {
    console.error("[AXIOS ERROR]", error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.response?.data);
    return Promise.reject(error);
});

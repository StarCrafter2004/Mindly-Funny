import { useUserStore } from "@/entities/user";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const { user, initDataRaw } = useUserStore.getState();
    if (user && initDataRaw) {
      config.headers["Authorization"] = `tma ${initDataRaw}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  // (error) => {
  //   if (isAxiosError(error)) {
  //     if (error.response) {
  //       // Попытка взять понятное сообщение из тела ответа (можно подстроить под API)
  //       const data = error.response.data;
  //       const message =
  //         (data && (data.message || data.error || data.detail)) ||
  //         `Ошибка сервера: ${error.response.status}`;
  //       return Promise.reject(new Error(message));
  //     } else {
  //       // Нет ответа от сервера — сетевая ошибка, таймаут и т.п.
  //       return Promise.reject(new Error(`Сетевая ошибка: ${error.message}`));
  //     }
  //   }
  //   // Ошибка не из axios, прокидываем как Error

  //   return Promise.reject(new Error(error?.message || "Неизвестная ошибка"));
  // },
);

export { api };

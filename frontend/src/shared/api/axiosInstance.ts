import { useUserStore } from "@/entities/user";
import { useProfileStore } from "@/entities/user/model/fillProfileStore";
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
  (res) => {
    const setPremium = useProfileStore.getState().setPremium;
    console.log("premium", res.data);
    console.log("premium", res.data?._userStatus?.premiumStatus);
    if (res.data?._userStatus?.premiumStatus) {
      setPremium(res.data?._userStatus?.premiumStatus);
    }
    return res;
  },
  (err) => Promise.reject(err),
);

export { api };

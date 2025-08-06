import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import { api } from "../api/axiosInstance";

// Тип ответа от API Strapi
interface LocaleApiResponse {
  data: Array<{
    id: number;
    AppTranslation: Record<string, any>; // Или уточни тип, если хочешь строже
    code: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    name: string;
    documentId: string;
  }>;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: import.meta.env.DEV,
    ns: ["translation"],
    defaultNS: "translation",
    backend: {
      loadPath: "{{lng}}|{{ns}}",

      request: (
        _options: unknown,
        url: string,
        _payload: unknown,
        callback: (error: any, result: { status: number; data: any }) => void,
      ) => {
        const [lng] = url.split("|");

        api
          .get<LocaleApiResponse>("/api/custom-locales", {
            params: {
              filters: {
                code: {
                  $eq: lng,
                },
              },
              fields: ["AppTranslation"],
            },
          })
          .then((res) => {
            const json = res.data.data?.[0]?.AppTranslation;

            if (json) {
              callback(null, { status: 200, data: json });
            } else {
              callback(new Error("No translation data found"), {
                status: 404,
                data: {},
              });
            }
          })
          .catch((err) => {
            console.error("Ошибка загрузки переводов:", err);
            callback(err, { status: 500, data: {} });
          });
      },
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

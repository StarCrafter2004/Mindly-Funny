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
      request: async (
        _options: unknown,
        url: string,
        _payload: unknown,
        callback: (error: any, result: { status: number; data: any }) => void,
      ) => {
        const [lng] = url.split("|");

        const MAX_RETRIES = 3;
        const RETRY_DELAY = 500; // мс
        let attempt = 0;

        const fetchTranslations = async (): Promise<void> => {
          try {
            const res = await api.get<LocaleApiResponse>(
              "/api/custom-locales",
              {
                params: {
                  filters: { code: { $eq: lng } },
                  fields: ["AppTranslation"],
                },
              },
            );

            const json = res.data.data?.[0]?.AppTranslation;
            if (json) {
              console.log(`[i18n] Loaded translations for "${lng}"`);
              callback(null, { status: 200, data: json });
            } else {
              throw new Error("No translation data found");
            }
          } catch (err) {
            attempt++;
            console.warn(`[i18n] Attempt ${attempt} failed for "${lng}":`, err);
            if (attempt < MAX_RETRIES) {
              const delay = RETRY_DELAY * attempt;
              console.log(`[i18n] Retrying in ${delay}ms...`);
              setTimeout(fetchTranslations, delay);
            } else {
              console.error(
                `[i18n] Failed to load translations for "${lng}" after ${MAX_RETRIES} attempts`,
              );
              callback(err, { status: 500, data: {} });
            }
          }
        };

        fetchTranslations();
      },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

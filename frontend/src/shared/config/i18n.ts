import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import { api } from "../api/axiosInstance";

interface LocaleApiResponse {
  data: Array<{
    id: number;
    AppTranslation: Record<string, any>;
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

function safePreview(obj: any, max = 2000) {
  try {
    const s = JSON.stringify(obj, null, 2);
    return s.length > max ? s.slice(0, max) + "\n...[truncated]" : s;
  } catch (e) {
    return "[unserializable]";
  }
}

function formatErrorForLog(err: any) {
  const out: any = {
    time: new Date().toISOString(),
    message: err?.message,
    name: err?.name,
    stack: err?.stack?.toString?.(),
  };

  // Axios-style error details
  if (err?.isAxiosError) {
    out.isAxiosError = true;
    out.axios = {};
    if (err.response) {
      out.axios.response = {
        status: err.response.status,
        statusText: err.response.statusText,
        headers: err.response.headers,
        dataPreview: safePreview(err.response.data),
      };
    }
    if (err.request) {
      // request can be huge, avoid serializing; provide presence and key info
      out.axios.request = {
        hasRequest: true,
        // some adapters store method/url in config
        method: err.config?.method,
        url: err.config?.url,
      };
    }
    if (err.config) {
      out.axios.config = {
        url: err.config.url,
        method: err.config.method,
        params: safePreview(err.config.params),
        headers: err.config.headers ? "[headers present]" : undefined,
      };
    }
    // toJSON is available on axios errors
    if (typeof err.toJSON === "function") {
      try {
        out.axios.toJSON = err.toJSON();
      } catch {
        out.axios.toJSON = "[toJSON failed]";
      }
    }
  } else {
    // generic object
    out.raw = safePreview(err);
  }

  return out;
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
        const RETRY_DELAY = 500; // ms
        let attempt = 0;

        const params = {
          filters: { code: { $eq: lng } },
          fields: ["AppTranslation"],
        };

        const fetchTranslations = async (): Promise<void> => {
          attempt++;
          const attemptTime = new Date().toISOString();
          console.groupCollapsed(
            `[i18n] Attempt ${attempt} to load "${lng}" — ${attemptTime}`,
          );
          try {
            console.log("[i18n] Request:", {
              endpoint: "/api/custom-locales",
              params,
            });

            const res = await api.get<LocaleApiResponse>(
              "/api/custom-locales",
              { params },
            );

            console.log("[i18n] Response status:", res.status);
            // headers can be large — show presence and some keys
            console.log(
              "[i18n] Response headers keys:",
              Object.keys(res.headers || {}),
            );
            console.debug("[i18n] Response preview:", safePreview(res.data));

            const json = res.data?.data?.[0]?.AppTranslation;
            if (json) {
              console.log(
                `[i18n] Loaded translations for "${lng}" (attempt ${attempt})`,
              );
              console.groupEnd();
              callback(null, { status: 200, data: json });
              return;
            } else {
              // no translation found — log the exact shape we received
              const info = {
                reason: "No translation data found",
                receivedDataPreview: safePreview(res.data?.data?.[0]),
              };
              console.error(`[i18n] No translation data for "${lng}"`, info);
              console.groupEnd();
              // Treat as error so retry logic can apply
              throw new Error(`No translation data found for locale "${lng}"`);
            }
          } catch (err) {
            const details = formatErrorForLog(err);
            console.error(
              `[i18n] Error loading "${lng}" (attempt ${attempt}):`,
              details,
            );

            if (attempt < MAX_RETRIES) {
              const delay = RETRY_DELAY * attempt;
              console.log(
                `[i18n] Retrying in ${delay}ms (attempt ${attempt + 1} of ${MAX_RETRIES})`,
              );
              console.groupEnd();
              setTimeout(fetchTranslations, delay);
            } else {
              console.error(
                `[i18n] Failed to load translations for "${lng}" after ${MAX_RETRIES} attempts. Final error:`,
                details,
              );
              console.groupEnd();
              // Call callback with error — include status if available
              console.log(err);
              callback(err, { status: 500, data: {} });
            }
          }
        };

        // Запускаем первую попытку
        try {
          fetchTranslations();
        } catch (outerErr) {
          // Защита от синхронных ошибок (хотя fetchTranslations всегда асинхронен)
          const details = formatErrorForLog(outerErr);
          console.error(
            "[i18n] Unexpected synchronous error starting fetchTranslations:",
            details,
          );
          callback(outerErr, { status: 500, data: {} });
        }
      },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

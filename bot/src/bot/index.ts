// src/bot/index.ts
import { api } from "../api/axiosInstance";
import { bot } from "../lib/bot";
import { registerStartCommand } from "./handlers/start";

interface Payment {
  id: number;
  documentId: string;
  userId: number;
  payload: string;
  type: "premium" | "test" | "lives";
  extra: string;
  amount: number;
  currency: string;
  payment_status: "pending" | "completed" | "expired" | string;
  invoiceUrl: string;
  telegramChargeId: string | null;
  createdAt: string; // ISO‑строка
  updatedAt: string;
  publishedAt?: string; // может быть отсутствовать
}

// Интерфейс обёртки ответа от Strapi с пагинацией
export interface PaymentCollectionResponse {
  data: Payment[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export function startBot() {
  registerStartCommand(bot);
  bot.on("pre_checkout_query", async (ctx) => {
    console.log("pre_checkout_query");
    const query = ctx.update.pre_checkout_query;

    try {
      const payload = query.invoice_payload;
      const [userId, type, extra] = payload.split("-");

      if (!userId || !type || !extra) {
        return ctx.answerPreCheckoutQuery(false, "Некорректный payload");
      }

      const [paymentRes, userRes, testRes, purchaseRes, premiumRes] = await Promise.all([
        api
          .get<PaymentCollectionResponse>("/api/payments", {
            params: {
              "filters[userId][$eq]": userId,
              "filters[payload][$eq]": payload,
              "sort[0]": "createdAt:desc",
              "pagination[pageSize]": 1,
            },
          })
          .catch((err) => null),

        api
          .get("/api/t-users", {
            params: {
              "filters[telegram_id][$eq]": userId,
            },
          })

          .catch((err) => null),

        // Только если это test или result — проверяем наличие объекта
        type === "test" || type === "result"
          ? api.get(`/api/bot-tests/${extra}`).catch((err) => console.log(err))
          : Promise.resolve(true),

        type === "test" || type === "result"
          ? api
              .get(`/api/purchases`, {
                params: {
                  "filters[userId][$eq]": userId,
                  "filters[extra][$eq]": extra,
                },
              })
              .then((res) => res.data)
              .catch((err) => console.log(err))
          : Promise.resolve(true),

        type === "premium"
          ? api
              .get(`/api/purchases?filters[userId][$eq]=${userId}&filters[extra][$eq]=1`)
              .then((res) => res.data)
              .catch((err) => console.log(err))
          : Promise.resolve(true),
      ]);

      // Проверки
      if (!paymentRes || paymentRes.data.data.length === 0) {
        return ctx.answerPreCheckoutQuery(false, "Платёж не найден");
      }

      if (!userRes || userRes.data.data.length === 0) {
        return ctx.answerPreCheckoutQuery(false, "Пользователь не найден");
      }

      if ((type === "test" || type === "result") && !testRes) {
        return ctx.answerPreCheckoutQuery(false, "Тест не найден");
      }

      if ((type === "test" || type === "result") && purchaseRes.data.length > 0) {
        return ctx.answerPreCheckoutQuery(false, "тест уже куплен");
      }

      if (type === "premium") {
        const user = userRes?.data?.data?.[0];
        if (!user) {
          return ctx.answerPreCheckoutQuery(false, "Пользователь не найден");
        }

        const premiumUntil = user.attributes?.premiumUntil;
        if (premiumUntil && new Date(premiumUntil) > new Date()) {
          return ctx.answerPreCheckoutQuery(false, "Премиум ещё действует");
        }
      }

      return await ctx.answerPreCheckoutQuery(true);
    } catch (err) {
      console.error("Ошибка pre_checkout_query:", err);
      return ctx.answerPreCheckoutQuery(false, "Ошибка обработки платежа");
    }
  });
  bot.on("message", async (ctx) => {
    const message = ctx.message as any;

    if (message.successful_payment) {
      const payment = message.successful_payment;

      const payload = payment.invoice_payload; // ты сам его передавал при создании инвойса

      setPurchase(payload);
      // Пример: обновить статус в базе, выдать доступ, записать лог и т.п.
    }
  });

  const domain = process.env.PUBLIC_URL;
  const port = 4001;
  const webhookPath = "/telegraf"; // если используете секретный путь, логируйте его тоже

  console.log("=== Запуск Telegram-бота с вебхуком ===");
  console.log(`[LOG] PUBLIC_URL: ${domain}`);
  console.log(`[LOG] PORT: ${port}`);
  console.log(`[LOG] WEBHOOK PATH: ${webhookPath}`);
  console.log(`[LOG] TELEGRAM_BOT_TOKEN: ${process.env.TELEGRAM_BOT_TOKEN ? "OK" : "NOT SET"}`);
  if (!domain) throw new Error("PUBLIC_URL is not set");

  bot.use(async (ctx, next) => {
    console.log(
      `[WEBHOOK] update_id: ${ctx.update.update_id} type: ${Object.keys(ctx.update)
        .filter((k) => k !== "update_id")
        .join(", ")} time: ${new Date().toISOString()}`
    );
    await next();
  });

  bot
    .launch({ webhook: { domain: domain, port: 4001 } })
    .then(() => {
      console.log("[LOG] Сервер Telegram-бота успешно запущен.");
      console.log(`[LOG] Вебхук ожидает запросы по адресу: ${domain}${webhookPath} (порт ${port})`);
    })
    .catch((err) => {
      console.error("[LOG] Ошибка при запуске бота:", err);
    });
}

async function setPurchase(payload: string) {
  const [userId, type, extra, time] = payload.split("-");
  console.log("extra", extra);
  console.log(userId, type, extra);

  try {
    if (type === "premium") {
      const now = new Date();
      const premiumUntil = new Date(now.setMonth(now.getMonth() + 1));

      try {
        await api.put(`/api/t-users/update-premium/${userId}`, {
          data: {
            isPremium: true,
            premiumUntil: premiumUntil.toISOString(),
          },
        });
      } catch (err) {
        console.error("[ERROR] update-premium failed:", err);
      }
    }

    if (type === "lives") {
      try {
        await api.post(`/api/increment-life`, {
          userId,
          quantity: extra,
        });
      } catch (err) {
        console.error("[ERROR] increment-life failed:", err);
      }
    }

    try {
      await api.put(`/api/payment/update-payment`, {
        payload,
        payment_status: "payd",
      });
    } catch (err) {
      console.error("[ERROR] update-payment failed:", err);
    }

    try {
      const res = await api.post("/api/purchases", {
        data: {
          userId,
          type,
          extra,
          time,
        },
      });
      console.log("[PURCHASE SAVED]", res.data);
    } catch (err) {
      console.error("[ERROR] save purchase failed:", err);
    }
  } catch (err) {
    console.error("[CRITICAL] setPurchase crashed:", err);
  }
}

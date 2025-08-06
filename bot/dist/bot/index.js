"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBot = startBot;
// src/bot/index.ts
const axiosInstance_1 = require("../api/axiosInstance");
const bot_1 = require("../lib/bot");
const start_1 = require("./handlers/start");
function startBot() {
  (0, start_1.registerStartCommand)(bot_1.bot);
  bot_1.bot.on("pre_checkout_query", async (ctx) => {
    const query = ctx.update.pre_checkout_query;
    try {
      const payload = query.invoice_payload;
      const [userId, type, extra] = payload.split("-");
      if (!userId || !type || !extra) {
        return ctx.answerPreCheckoutQuery(false, "Некорректный payload");
      }
      const [paymentRes, userRes, testRes] = await Promise.all([
        axiosInstance_1.api
          .get("/api/payments", {
            params: {
              "filters[userId][$eq]": userId,
              "filters[payload][$eq]": payload,
              "sort[0]": "createdAt:desc",
              "pagination[pageSize]": 1,
            },
          })
          .catch((err) => null),
        axiosInstance_1.api
          .get("/api/t-users", {
            params: {
              "filters[telegram_id][$eq]": userId,
            },
          })
          .catch((err) => null),
        // Только если это test или result — проверяем наличие объекта
        type === "test" || type === "result"
          ? axiosInstance_1.api.get(`/api/tests/${extra}`).catch((err) => console.log(err))
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
      setPurchase(payload);
      console.log("всё заебись брат");
      // return await ctx.answerPreCheckoutQuery(false);
    } catch (err) {
      console.error("Ошибка pre_checkout_query:", err);
      return ctx.answerPreCheckoutQuery(false, "Ошибка обработки платежа");
    }
  });
  bot_1.bot.on("message", async (ctx) => {
    const message = ctx.message;
    console.log("оплата записана");
    if (message.successful_payment) {
      const payment = message.successful_payment;
      console.log("✅ Оплата прошла успешно:", payment);
      const payload = payment.invoice_payload; // ты сам его передавал при создании инвойса
      // Пример: обновить статус в базе, выдать доступ, записать лог и т.п.
      console.log("оплата записана"); // своя функция
    }
  });
  bot_1.bot.launch().catch((err) => {
    console.error("Ошибка при запуске бота:", err);
  });
}
async function setPurchase(payload) {
  const [userId, type, extra] = payload.split("-");
  console.log("purchases");
  const res = await axiosInstance_1.api.post("/api/purchases", {
    data: {
      userId,
      type,
      extra,
    },
  });
  console.log("purchases", res);
}

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
        console.log("pre_checkout_query");
        const query = ctx.update.pre_checkout_query;
        try {
            const payload = query.invoice_payload;
            const [userId, type, extra] = payload.split("-");
            if (!userId || !type || !extra) {
                return ctx.answerPreCheckoutQuery(false, "Некорректный payload");
            }
            const [paymentRes, userRes, testRes, purchaseRes, premiumRes] = await Promise.all([
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
                    ? axiosInstance_1.api.get(`/api/bot-tests/${extra}`).catch((err) => console.log(err))
                    : Promise.resolve(true),
                type === "test" || type === "result"
                    ? axiosInstance_1.api
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
                    ? axiosInstance_1.api
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
        }
        catch (err) {
            console.error("Ошибка pre_checkout_query:", err);
            return ctx.answerPreCheckoutQuery(false, "Ошибка обработки платежа");
        }
    });
    bot_1.bot.on("message", async (ctx) => {
        const message = ctx.message;
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
    if (!domain)
        throw new Error("PUBLIC_URL is not set");
    bot_1.bot.use(async (ctx, next) => {
        console.log(`[WEBHOOK] update_id: ${ctx.update.update_id} type: ${Object.keys(ctx.update)
            .filter((k) => k !== "update_id")
            .join(", ")} time: ${new Date().toISOString()}`);
        await next();
    });
    bot_1.bot
        .launch({ webhook: { domain: domain, port: 4001 } })
        .then(() => {
        console.log("[LOG] Сервер Telegram-бота успешно запущен.");
        console.log(`[LOG] Вебхук ожидает запросы по адресу: ${domain}${webhookPath} (порт ${port})`);
    })
        .catch((err) => {
        console.error("[LOG] Ошибка при запуске бота:", err);
    });
}
async function setPurchase(payload) {
    const [userId, type, extra] = payload.split("-");
    console.log("extra", extra);
    console.log(userId, type, extra);
    try {
        if (type === "premium") {
            const now = new Date();
            const premiumUntil = new Date(now.setMonth(now.getMonth() + 1));
            try {
                await axiosInstance_1.api.put(`/api/t-users/update-premium/${userId}`, {
                    data: {
                        isPremium: true,
                        premiumUntil: premiumUntil.toISOString(),
                    },
                });
            }
            catch (err) {
                console.error("[ERROR] update-premium failed:", err);
            }
        }
        if (type === "lives") {
            try {
                await axiosInstance_1.api.post(`/api/increment-life`, {
                    userId,
                    quantity: extra,
                });
            }
            catch (err) {
                console.error("[ERROR] increment-life failed:", err);
            }
        }
        try {
            await axiosInstance_1.api.put(`/api/payment/update-payment`, {
                payload,
                payment_status: "payd",
            });
        }
        catch (err) {
            console.error("[ERROR] update-payment failed:", err);
        }
        try {
            const res = await axiosInstance_1.api.post("/api/purchases", {
                data: {
                    userId,
                    type,
                    extra,
                },
            });
            console.log("[PURCHASE SAVED]", res.data);
        }
        catch (err) {
            console.error("[ERROR] save purchase failed:", err);
        }
    }
    catch (err) {
        console.error("[CRITICAL] setPurchase crashed:", err);
    }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bot_1 = require("../../lib/bot");
const axiosInstance_1 = require("../../api/axiosInstance");
const ton_1 = require("@ton/ton");
const ton_utils_1 = require("./ton-utils");
const core_1 = require("@ton/core");
const invoiceRoutes = (0, express_1.Router)();
invoiceRoutes.options("/create-invoice", (req, res) => {
    res.sendStatus(200);
});
invoiceRoutes.post("/create-invoice", async (req, res) => {
    console.log("POST /create-invoice called", req.body);
    try {
        const { title, description, amount, type, testId, duration, quantity } = req.body;
        if (type === "premium" && !duration)
            return res.status(400).json({ error: "duration обязателен для premium" });
        if (type === "test" && !testId)
            return res.status(400).json({ error: "testId обязателен для test" });
        if (type === "lives" && !quantity)
            return res.status(400).json({ error: "quantity обязателен для lives" });
        const userId = res.locals.userId;
        let extra;
        if (type === "premium") {
            extra = duration;
        }
        else if (type === "lives") {
            extra = quantity;
        }
        else {
            extra = testId;
        }
        const label = type === "premium" ? `Premium ${extra} days` : type === "test" ? `Test #${extra}` : `Result #${extra}`;
        const timestamp = Date.now();
        const payload = `${userId}-${type}-${extra}-${timestamp}`;
        let invoiceUrl;
        try {
            invoiceUrl = await bot_1.bot.telegram.createInvoiceLink({
                title,
                description,
                payload,
                provider_token: "",
                currency: "XTR",
                prices: [{ label, amount }],
            });
            console.log("Invoice link created:", invoiceUrl);
        }
        catch (err) {
            console.error("Ошибка создания invoiceLink:", err);
            return res.status(502).json({
                error: "Ошибка связи с Telegram",
                details: err instanceof Error ? err.message : err,
            });
        }
        try {
            await axiosInstance_1.api.post("/api/payments", {
                data: {
                    userId: Number(userId),
                    payload,
                    type,
                    extra: String(extra),
                    amount,
                    currency: "XTR",
                    payment_status: "pending",
                    invoiceUrl,
                },
            }, { headers: { Authorization: `bearer ${process.env.STRAPI_API_TOKEN}` } });
            console.log("Payment saved in Strapi");
        }
        catch (err) {
            console.error("Ошибка записи в Strapi:", err);
            return res.status(err.response?.status || 502).json({
                error: "Не удалось сохранить платёж",
                details: err.response?.data || err.message || err,
            });
        }
        return res.json({ invoiceUrl });
    }
    catch (err) {
        console.error("Необработанная ошибка в /create-invoice:", err);
        return res.status(500).json({
            error: "Внутренняя ошибка сервера",
            details: err.message || err,
        });
    }
});
invoiceRoutes.post("/create-invoice-ton", async (req, res) => {
    try {
        const { amount, type, testId, duration, wallet, quantity } = req.body;
        if (type === "premium" && !duration)
            return res.status(400).json({ error: "duration обязателен для premium" });
        if (type === "test" && !testId)
            return res.status(400).json({ error: "testId обязателен для test" });
        const userId = res.locals.userId;
        let extra;
        if (type === "premium") {
            extra = duration;
        }
        else if (type === "lives") {
            extra = quantity;
        }
        else {
            extra = testId;
        }
        console.log("type", type);
        const timestamp = Date.now(); // число, вроде 1721507665123
        const payload = `${userId}-${type}-${extra}-${timestamp}`;
        const [userRes, testRes, premiumRes] = await Promise.all([
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
            type === "premium"
                ? axiosInstance_1.api
                    .get(`/api/purchases?filters[userId][$eq]=${userId}&filters[extra][$eq]=1`)
                    .then((res) => res.data)
                    .catch((err) => console.log(err))
                : Promise.resolve(true),
        ]);
        // Проверяем пользователя
        if (!userRes || userRes.data.data.length === 0) {
            return res.status(400).json({ error: "user_not_found" });
        }
        // Проверяем тестовый ресурс
        if ((type === "test" || type === "result") && !testRes) {
            return res.status(400).json({ error: "test_not_found" });
        }
        // Проверяем премиум-контент
        if (type === "premium" && premiumRes.data.length > 0) {
            return res.status(400).json({ error: "premium_already_purchased" });
        }
        console.log("ton2");
        // 2️⃣ Сохранение в Strapi
        try {
            await axiosInstance_1.api.post("/api/payments", {
                data: {
                    userId: Number(userId),
                    payload,
                    type,
                    extra: String(extra),
                    amount,
                    currency: "TON",
                    payment_status: "pending",
                    wallet,
                },
            }, {
                headers: {
                    Authorization: `bearer ${process.env.STRAPI_API_TOKEN}`,
                },
            });
        }
        catch (err) {
            console.error("Ошибка записи в Strapi:", err);
            return res.status(502).json({ error: "Не удалось сохранить платёж" });
        }
        const cell = (0, core_1.beginCell)().storeStringTail(payload).endCell();
        console.log("cell", cell);
        // Получи base64 строку
        const payloadBOC = Buffer.from(cell.toBoc()).toString("base64");
        console.log("payloadBOC", payloadBOC);
        // 3️⃣ Возврат успешного результата
        return res.json({ payload: payload, boc: payloadBOC });
    }
    catch (err) {
        console.error("Необработанная ошибка в /create-invoice:", err);
        return res.status(500).json({ error: "Внутренняя ошибка сервера", ok: false });
    }
});
invoiceRoutes.post("/verify-ton-boc", async (req, res) => {
    const { boc, payload } = req.body;
    console.log("boc", boc);
    if (!boc || typeof boc !== "string") {
        return res.status(400).json({ error: "Missing BOC" });
    }
    const endpoint = await axiosInstance_1.api.get("/api/ton-config").then((res) => res.data.data.url);
    console.log("endpoint", endpoint);
    try {
        // 1. Настраиваем клиента TON
        const client = new ton_1.TonClient({ endpoint: endpoint });
        // 2. Ждём подтверждения транзакции
        const tx = await (0, ton_utils_1.waitForTransaction)(boc, client, 15, 1000);
        if (!tx) {
            return res.status(404).json({ status: "not_found" });
        }
        setPurchase(payload);
        // 3. Вернём информацию о транзакции
        return res.json({
            status: "paid",
        });
    }
    catch (err) {
        console.error("Ошибка при проверке BOC:", err);
        return res.status(500).json({ error: "server_error" });
    }
});
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
exports.default = invoiceRoutes;

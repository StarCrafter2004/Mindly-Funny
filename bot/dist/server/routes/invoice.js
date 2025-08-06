"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bot_1 = require("../../lib/bot");
const axiosInstance_1 = require("../../api/axiosInstance");
const invoiceRoutes = (0, express_1.Router)();
invoiceRoutes.options("/create-invoice", (req, res) => {
    res.sendStatus(200);
});
invoiceRoutes.post("/create-invoice", async (req, res) => {
    try {
        const { title, description, amount, type, testId, duration } = req.body;
        if (type === "premium" && !duration)
            return res.status(400).json({ error: "duration обязателен для premium" });
        if (type === "test" && !testId)
            return res.status(400).json({ error: "testId обязателен для test" });
        const userId = res.locals.userId;
        const extra = type === "premium" ? duration : testId;
        const label = type === "premium" ? `Premium ${extra} days` : type === "test" ? `Test #${extra}` : `Result #${extra}`;
        const timestamp = Date.now(); // число, вроде 1721507665123
        const payload = `${userId}-${type}-${extra}-${timestamp}`;
        // 1️⃣ Генерация ссылки (возможно, сюда попадёт ошибка)
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
        }
        catch (err) {
            console.error("Ошибка создания invoiceLink:", err);
            return res.status(502).json({ error: "Ошибка связи с Telegram" });
        }
        // 2️⃣ Сохранение в Strapi
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
        // 3️⃣ Возврат успешного результата
        return res.json({ invoiceUrl });
    }
    catch (err) {
        console.error("Необработанная ошибка в /create-invoice:", err);
        return res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});
exports.default = invoiceRoutes;

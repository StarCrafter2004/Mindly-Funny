import { Router, Request, Response } from "express";
import { bot } from "../../lib/bot";
import { api } from "../../api/axiosInstance";
import { TonClient } from "@ton/ton";
import { waitForTransaction } from "./ton-utils";

import { beginCell, Cell, loadMessage, Transaction, storeMessage, Slice, Message } from "@ton/core";

const invoiceRoutes = Router();

invoiceRoutes.options("/create-invoice", (req, res) => {
  res.sendStatus(200);
});
invoiceRoutes.post("/create-invoice", async (req: Request, res: Response) => {
  console.log("star");
  try {
    const { title, description, amount, type, testId, duration } = req.body;
    if (type === "premium" && !duration) return res.status(400).json({ error: "duration обязателен для premium" });
    if (type === "test" && !testId) return res.status(400).json({ error: "testId обязателен для test" });

    const userId = res.locals.userId;
    const extra = type === "premium" ? duration! : testId!;
    const label =
      type === "premium" ? `Premium ${extra} days` : type === "test" ? `Test #${extra}` : `Result #${extra}`;
    const timestamp = Date.now(); // число, вроде 1721507665123

    const payload = `${userId}-${type}-${extra}-${timestamp}`;

    // 1️⃣ Генерация ссылки (возможно, сюда попадёт ошибка)
    let invoiceUrl: string;
    try {
      invoiceUrl = await bot.telegram.createInvoiceLink({
        title,
        description,
        payload,
        provider_token: "",
        currency: "XTR",
        prices: [{ label, amount }],
      });
    } catch (err) {
      console.error("Ошибка создания invoiceLink:", err);
      return res.status(502).json({ error: "Ошибка связи с Telegram" });
    }

    // 2️⃣ Сохранение в Strapi
    try {
      await api.post(
        "/api/payments",
        {
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
        },
        {
          headers: {
            Authorization: `bearer ${process.env.STRAPI_API_TOKEN}`,
          },
        }
      );
    } catch (err) {
      console.error("Ошибка записи в Strapi:", err);
      return res.status(502).json({ error: "Не удалось сохранить платёж" });
    }

    // 3️⃣ Возврат успешного результата
    return res.json({ invoiceUrl });
  } catch (err) {
    console.error("Необработанная ошибка в /create-invoice:", err);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

invoiceRoutes.post("/create-invoice-ton", async (req: Request, res: Response) => {
  try {
    const { amount, type, testId, duration, wallet } = req.body;
    if (type === "premium" && !duration) return res.status(400).json({ error: "duration обязателен для premium" });
    if (type === "test" && !testId) return res.status(400).json({ error: "testId обязателен для test" });

    const userId = res.locals.userId;
    const extra = type === "premium" ? duration! : testId!;
    console.log("type", type);
    const timestamp = Date.now(); // число, вроде 1721507665123

    const payload = `${userId}-${type}-${extra}-${timestamp}`;

    const [userRes, testRes, premiumRes] = await Promise.all([
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

      type === "premium"
        ? api
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
      await api.post(
        "/api/payments",
        {
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
        },
        {
          headers: {
            Authorization: `bearer ${process.env.STRAPI_API_TOKEN}`,
          },
        }
      );
    } catch (err) {
      console.error("Ошибка записи в Strapi:", err);
      return res.status(502).json({ error: "Не удалось сохранить платёж" });
    }

    const cell = beginCell().storeStringTail(payload).endCell();
    console.log("cell", cell);
    // Получи base64 строку
    const payloadBOC = Buffer.from(cell.toBoc()).toString("base64");
    console.log("payloadBOC", payloadBOC);
    // 3️⃣ Возврат успешного результата
    return res.json({ payload: payload, boc: payloadBOC });
  } catch (err) {
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
  const endpoint = await api.get<{ data: { url: string } }>("/api/ton-config").then((res) => res.data.data.url);
  console.log("endpoint", endpoint);
  try {
    // 1. Настраиваем клиента TON
    const client = new TonClient({ endpoint: endpoint });

    // 2. Ждём подтверждения транзакции
    const tx = await waitForTransaction(boc, client, 15, 1000);

    if (!tx) {
      return res.status(404).json({ status: "not_found" });
    }
    setPurchase(payload);
    // 3. Вернём информацию о транзакции
    return res.json({
      status: "paid",
    });
  } catch (err: any) {
    console.error("Ошибка при проверке BOC:", err);
    return res.status(500).json({ error: "server_error" });
  }
});

async function setPurchase(payload: string) {
  const [userId, type, extra] = payload.split("-");
  if (type === "premium") {
    api.put(`/api/t-users/update-premium/${userId}`, {
      data: {
        isPremium: true,
      },
    });
  }
  const res = await api.post("/api/purchases", {
    data: {
      userId,
      type,
      extra,
    },
  });
}

export default invoiceRoutes;

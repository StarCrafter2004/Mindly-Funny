// src/server/middleware/authTg.ts
import { Request, Response, NextFunction } from "express";
import { validate, parse, type InitData } from "@telegram-apps/init-data-node";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

export function authTgMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.header("Authorization") || "";
  const [method, initDataRaw = ""] = auth.split(" ");

  if (method !== "tma" || !initDataRaw) {
    res.status(401).json({ error: "Unauthorized: missing initData" });
  } else {
    try {
      validate(initDataRaw, BOT_TOKEN, { expiresIn: 86400 });
      const initData: InitData = parse(initDataRaw);
      res.locals.initData = initData;
      res.locals.userId = String(initData?.user?.id);

      next();
    } catch (err: any) {
      res.status(403).json({ error: `Unauthorized: ${err.message}` });
    }
  }
}

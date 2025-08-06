import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

export const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

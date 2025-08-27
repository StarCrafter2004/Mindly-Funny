import { Context } from "telegraf";
import { Telegraf } from "telegraf";
import { api } from "../../api/axiosInstance";
import fs from "fs";
import path from "path";

export function registerStartCommand(bot: Telegraf<Context>) {
  bot.start(async (ctx) => {
    const telegram_id = Number(ctx.from.id);
    const firstName = ctx.from.first_name;
    const lastName = ctx.from.last_name;
    const username = ctx.from.username;
    const parts = ctx.message.text.split(" ");
    const param = parts[1]; // теперь тут может быть ref-123 или promo-someApp

    let referrer_id: number | null = null;
    let promo: string | null = null;

    if (param) {
      const [key, value] = param.split("-");

      if (key === "ref" && value) {
        referrer_id = Number(value);
      } else if (key === "promo" && value) {
        promo = value;
      }
    }
    let documentId: string | null = null;

    try {
      // Проверяем пользователя
      const userRes = await api.get("/api/t-users/info", {
        params: { "filters[telegram_id][$eq]": telegram_id },
      });

      if (!userRes.data.data || userRes.data.data.length === 0) {
        // создаем пользователя
        const createRes = await api.post("/api/t-users/bot", {
          data: { telegram_id, firstName, lastName, username },
        });
        documentId = createRes.data.data.documentId;
        console.log("Пользователь создан, documentId:", documentId);
      } else {
        documentId = userRes.data.data[0].documentId;
        console.log("Пользователь уже существует, documentId:", documentId);
      }
    } catch (err) {
      console.error("Ошибка проверки/создания пользователя:", err);
    }

    // Если есть реферал
    if (referrer_id) {
      if (telegram_id === referrer_id) {
        await ctx.reply("Нельзя использовать свою же реферальную ссылку.");
      } else {
        try {
          await api.post(`/api/referrals`, {
            data: {
              user_id: telegram_id,
              referrer_id,
            },
          });
          await ctx.reply("Вы были успешно зарегистрированы по реферальной ссылке!");
        } catch (err: any) {
          if (err.response?.status === 400) {
            await ctx.reply("Вы уже зарегистрированы или ссылка недействительна.");
          } else {
            await ctx.reply("Произошла ошибка при обработке реферала.");
            console.error(err.message);
          }
        }
      }
    }

    // Если есть промо
    // Если есть промо
    if (promo && documentId) {
      try {
        await api.put(`/api/t-users/bot/${documentId}`, {
          data: { promo },
        });
      } catch (err) {
        console.error("Ошибка при обработке промо:", err);
      }
    }

    // Всегда отправляем сообщение с изображением, кнопкой и текстом
    const imagePath = path.join(__dirname, "../../assets/image.png");
    const imageBuffer = fs.readFileSync(imagePath);

    await ctx.replyWithPhoto(
      { source: imageBuffer },
      {
        caption:
          "🎭 Open the app where every quiz feels like a mini-show!\n\n" +
          "In just 3 minutes you’ll get your personal meme-diagnosis 🤯\n" +
          "and the perfect reason for a story 📱✨\n\n" +
          "Quizzes on all kinds of topics: anime 🎌, movies 🎬,\n" +
          "relationships ❤️ and more 🌍\n\n" +
          "Open it — and find out who you are today 🔮",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Open miniapp",
                web_app: { url: `${process.env.PUBLIC_URL}` },
              },
            ],
          ],
        },
      }
    );
  });
}

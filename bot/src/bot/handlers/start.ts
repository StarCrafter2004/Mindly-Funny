import { Context } from "telegraf";
import { Telegraf, Markup } from "telegraf";
import { api } from "../../api/axiosInstance";
import fs from "fs";
import path from "path";

export function registerStartCommand(bot: Telegraf<Context>) {
  bot.start(async (ctx) => {
    const parts = ctx.message.text.split(" ");
    const telegram_id = Number(ctx.from.id);
    const refParam = parts[1];
    const referrer_id = Number(refParam);
    console.log("referrer_id", referrer_id);
    if (refParam) {
      if (isNaN(referrer_id)) {
        await ctx.reply("Недопустимая реферальная ссылка.");
      } else if (telegram_id === referrer_id) {
        await ctx.reply("Нельзя использовать свою же реферальную ссылку.");
      } else {
        try {
          console.log("telegram_id", telegram_id);
          console.log("referrer_id", referrer_id);
          await api.post(`/api/referrals`, {
            data: {
              user_id: telegram_id,
              referrer_id,
            },
          });
          console.log("успех");

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

    // Всегда отправляем сообщение с изображением, кнопкой и текстом
    const imagePath = path.join(__dirname, "../../assets/image.png"); // путь к картинке
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

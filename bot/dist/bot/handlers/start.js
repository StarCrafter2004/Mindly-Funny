"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerStartCommand = registerStartCommand;
const axiosInstance_1 = require("../../api/axiosInstance");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function registerStartCommand(bot) {
    bot.start(async (ctx) => {
        const parts = ctx.message.text.split(" ");
        const telegram_id = Number(ctx.from.id);
        const refParam = parts[1];
        const referrer_id = Number(refParam);
        console.log("referrer_id", referrer_id);
        if (refParam) {
            if (isNaN(referrer_id)) {
                await ctx.reply("Недопустимая реферальная ссылка.");
            }
            else if (telegram_id === referrer_id) {
                await ctx.reply("Нельзя использовать свою же реферальную ссылку.");
            }
            else {
                try {
                    console.log("telegram_id", telegram_id);
                    console.log("referrer_id", referrer_id);
                    await axiosInstance_1.api.post(`/api/referrals`, {
                        data: {
                            user_id: telegram_id,
                            referrer_id,
                        },
                    });
                    console.log("успех");
                    await ctx.reply("Вы были успешно зарегистрированы по реферальной ссылке!");
                }
                catch (err) {
                    if (err.response?.status === 400) {
                        await ctx.reply("Вы уже зарегистрированы или ссылка недействительна.");
                    }
                    else {
                        await ctx.reply("Произошла ошибка при обработке реферала.");
                        console.error(err.message);
                    }
                }
            }
        }
        // Всегда отправляем сообщение с изображением, кнопкой и текстом
        const imagePath = path_1.default.join(__dirname, "../../assets/image.png"); // путь к картинке
        const imageBuffer = fs_1.default.readFileSync(imagePath);
        await ctx.replyWithPhoto({ source: imageBuffer }, {
            caption: "Добро пожаловать! Нажмите кнопку ниже для запуска миниапы 👇",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Открыть миниапу",
                            web_app: { url: `${process.env.PUBLIC_URL}` },
                        },
                    ],
                ],
            },
        });
    });
}

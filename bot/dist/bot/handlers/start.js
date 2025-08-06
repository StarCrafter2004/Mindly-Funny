"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerStartCommand = registerStartCommand;
const axiosInstance_1 = require("../../api/axiosInstance");
function registerStartCommand(bot) {
    bot.start(async (ctx) => {
        const parts = ctx.message.text.split(" ");
        const telegram_id = ctx.from.id;
        const refParam = parts[1]; // параметр после /start
        const API_URL = process.env.API_BASE_URL;
        if (!refParam) {
            ctx.reply("Добро пожаловать!");
            return;
        }
        const referrer_id = ctx.payload;
        if (isNaN(referrer_id)) {
            ctx.reply("Недопустимая реферальная ссылка.");
            return;
        }
        if (telegram_id === referrer_id) {
            ctx.reply("Нельзя использовать свою же реферальную ссылку.");
            return;
        }
        try {
            await axiosInstance_1.api.post(`/api/referrals`, {
                data: {
                    user_id: telegram_id,
                    referrer_id,
                },
            });
            ctx.reply("Вы были успешно зарегистрированы по реферальной ссылке!");
        }
        catch (err) {
            if (err.response?.status === 400) {
                ctx.reply("Вы уже зарегистрированы или ссылка недействительна.");
            }
            else {
                ctx.reply("Произошла ошибка при обработке реферала.");
                console.error(err.message);
            }
        }
    });
}

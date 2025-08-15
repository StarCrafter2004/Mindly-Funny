"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * t-user controller
 */
const date_fns_1 = require("date-fns");
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController("api::t-user.t-user", ({ strapi }) => ({
    async updatePremium(ctx) {
        var _a;
        const { id } = ctx.params;
        const { isPremium, premiumUntil } = ((_a = ctx.request.body) === null || _a === void 0 ? void 0 : _a.data) || {};
        if (typeof isPremium !== "boolean" && !premiumUntil) {
            return ctx.badRequest("Нужно передать хотя бы одно из полей: isPremium или premiumUntil");
        }
        const dataToUpdate = {};
        if (typeof isPremium === "boolean") {
            dataToUpdate.isPremium = isPremium;
        }
        if (premiumUntil) {
            dataToUpdate.premiumUntil = premiumUntil;
        }
        try {
            const user = await strapi.documents("api::t-user.t-user").findMany({
                fields: [],
                filters: {
                    telegram_id: {
                        $eq: id,
                    },
                },
            });
            const documentId = user[0].documentId;
            const updatedUser = await strapi.documents("api::t-user.t-user").update({
                documentId: documentId,
                fields: [],
                data: dataToUpdate,
            });
            return { data: updatedUser };
        }
        catch (err) {
            console.error("Ошибка при обновлении премиума:", err);
            return ctx.internalServerError("Не удалось обновить пользователя");
        }
    },
    async updateFreePremium(ctx) {
        var _a;
        const userId = ctx.state.userId;
        const user = await strapi.documents("api::t-user.t-user").findFirst({
            fields: ["freePremiumCounter", "premiumUntil", "FreePremActivated"],
            filters: {
                telegram_id: {
                    $eq: userId,
                },
            },
        });
        if (user.FreePremActivated) {
            return { data: { text: "Premium already was activated" } };
        }
        const points = user.freePremiumCounter;
        const premiumUntil = user.premiumUntil;
        const cost = (_a = (await strapi
            .documents("api::gift-config.gift-config")
            .findFirst()
            .then((res) => res.FreePremiumCost))) !== null && _a !== void 0 ? _a : 1;
        const now = new Date();
        let newPremiumUntilDate;
        let FreePremActivated = user.FreePremActivated;
        if (points >= cost) {
            if (user.premiumUntil) {
                // Преобразуем строку в Date
                const current = new Date(premiumUntil);
                // Если премиум ещё действителен
                if ((0, date_fns_1.isAfter)(current, now)) {
                    newPremiumUntilDate = (0, date_fns_1.addMonths)(current, 1);
                }
                else {
                    newPremiumUntilDate = (0, date_fns_1.addMonths)(now, 1);
                }
            }
            else {
                newPremiumUntilDate = (0, date_fns_1.addMonths)(now, 1);
            }
        }
        const updatedUser = await strapi.documents("api::t-user.t-user").update({
            documentId: user.documentId,
            fields: ["FreePremActivated"],
            data: { FreePremActivated: true, premiumUntil: newPremiumUntilDate },
        });
        return { data: { FreePremActivated: updatedUser.FreePremActivated } };
    },
    async updateFreeLivesCounter(ctx) {
        var _a;
        const userId = ctx.state.userId;
        const lives = await strapi
            .documents("api::t-user.t-user")
            .findFirst({
            fields: ["freeLivesCounter"], // заменили на tests
            filters: {
                telegram_id: {
                    $eq: userId,
                },
            },
        })
            .then((res) => res.freeLivesCounter);
        const cost = (_a = (await strapi
            .documents("api::gift-config.gift-config")
            .findFirst()
            .then((res) => res.FreeLivesCost))) !== null && _a !== void 0 ? _a : 1;
        const maxCount = Math.floor(lives / cost);
        const totalCost = maxCount * cost;
        const knex = strapi.db.connection;
        await strapi.db.transaction(async ({ trx }) => {
            await knex("t_users")
                .where("telegram_id", userId)
                .decrement("free_lives_counter", totalCost)
                .increment("lives", maxCount) // замены test/test
                .transacting(trx);
        });
        return { data: { text: "success" } };
    },
    async decrementLife(ctx) {
        const userId = ctx.state.userId;
        try {
            // Получаем текущие жизни
            const user = await strapi.documents("api::t-user.t-user").findFirst({
                fields: ["lives"],
                filters: {
                    telegram_id: { $eq: userId },
                },
            });
            if (!user) {
                return ctx.notFound("Пользователь не найден");
            }
            if (user.lives <= 0) {
                return ctx.badRequest("Нет жизней для списания");
            }
            // Декремент на 1
            const updatedUser = await strapi.documents("api::t-user.t-user").update({
                documentId: user.documentId,
                fields: ["lives"],
                data: { lives: user.lives - 1 },
            });
            return { data: { lives: updatedUser.lives } };
        }
        catch (err) {
            console.error("Ошибка при декременте жизней:", err);
            return ctx.internalServerError("Не удалось уменьшить жизни");
        }
    },
    async incrementLife(ctx) {
        try {
            const { userId, quantity } = ctx.request.body; // берём из body
            const qty = Number(quantity);
            if (!userId || isNaN(qty) || qty <= 0) {
                return ctx.badRequest("Некорректный userId или quantity");
            }
            // Находим пользователя
            const user = await strapi.documents("api::t-user.t-user").findFirst({
                filters: { telegram_id: { $eq: userId } },
                fields: ["lives"],
            });
            if (!user) {
                return ctx.notFound("Пользователь не найден");
            }
            // Увеличиваем жизни
            const updatedUser = await strapi.documents("api::t-user.t-user").update({
                documentId: user.documentId,
                data: {
                    lives: (user.lives || 0) + qty,
                },
                fields: ["lives"],
            });
            return { data: updatedUser };
        }
        catch (err) {
            console.error("Ошибка при увеличении жизней:", err);
            return ctx.internalServerError("Не удалось увеличить жизни");
        }
    },
}));

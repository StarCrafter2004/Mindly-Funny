"use strict";
/**
 * t-user controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController("api::t-user.t-user", ({ strapi }) => ({
    async updatePremium(ctx) {
        var _a;
        console.log("🔥 updatePremium CALLED");
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
        console.log(dataToUpdate);
        console.log;
        try {
            const user = await strapi.documents("api::t-user.t-user").findMany({
                fields: [],
                filters: {
                    telegram_id: {
                        $eq: id,
                    },
                },
            });
            console.log(user);
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
    async updateFreeReportCounter(ctx) {
        var _a;
        const userId = ctx.state.userId;
        const points = await strapi
            .documents("api::t-user.t-user")
            .findFirst({
            fields: ["freeReportsCounter"],
            filters: {
                telegram_id: {
                    $eq: userId,
                },
            },
        })
            .then((res) => res.freeReportsCounter);
        const cost = (_a = (await strapi
            .documents("api::gift-config.gift-config")
            .findFirst()
            .then((res) => res.FreeReportCost))) !== null && _a !== void 0 ? _a : 1;
        const maxCount = Math.floor(points / cost);
        const totalCost = maxCount * cost;
        const knex = strapi.db.connection;
        await strapi.db.transaction(async ({ trx, rollback, commit }) => {
            await knex("t_users")
                .where("telegram_id", userId)
                .decrement("free_reports_counter", totalCost)
                .increment("free_reports", maxCount)
                .transacting(trx);
        });
        console.log("updatefree");
        return { data: { text: "success" } };
    },
    async updateFreeTestCounter(ctx) {
        var _a;
        const userId = ctx.state.userId;
        const tests = await strapi
            .documents("api::t-user.t-user")
            .findFirst({
            fields: ["freeTestsCounter"], // заменили на tests
            filters: {
                telegram_id: {
                    $eq: userId,
                },
            },
        })
            .then((res) => res.freeTestsCounter);
        const cost = (_a = (await strapi
            .documents("api::gift-config.gift-config")
            .findFirst()
            .then((res) => res.FreeTestCost))) !== null && _a !== void 0 ? _a : 1; // замена поля на FreeTestCost
        const maxCount = Math.floor(tests / cost);
        const totalCost = maxCount * cost;
        const knex = strapi.db.connection;
        await strapi.db.transaction(async ({ trx }) => {
            await knex("t_users")
                .where("telegram_id", userId)
                .decrement("free_tests_counter", totalCost)
                .increment("free_tests", maxCount) // замены test/test
                .transacting(trx);
        });
        console.log("updatefreeTests");
        return { data: { text: "success" } };
    },
}));

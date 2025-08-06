"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController("api::test-result.test-result", ({ strapi }) => ({
    async countByRegion(ctx) {
        const { testId, iq, country } = ctx.query;
        if (!testId || !iq || !country) {
            return ctx.badRequest("Missing testId, iq or country");
        }
        const users = await strapi.entityService.findMany("api::t-user.t-user", {
            filters: { country },
            fields: ["telegram_id"],
            limit: 1000,
        });
        const telegramIds = users.map((u) => u.telegram_id);
        const total = await strapi.entityService.count("api::test-result.test-result", {
            filters: { testId, telegram_id: { $in: telegramIds } },
        });
        const lowerCount = await strapi.entityService.count("api::test-result.test-result", {
            filters: { testId, iq: { $lt: Number(iq) }, telegram_id: { $in: telegramIds } },
        });
        let percent = total === 0 ? 0 : Math.round((lowerCount / total) * 100);
        percent = total === 1 ? 100 : percent;
        return { total, lowerCount, percent };
    },
    async countByAge(ctx) {
        const { testId, iq, age } = ctx.query;
        if (!testId || !iq || !age) {
            return ctx.badRequest("Missing testId, iq or age");
        }
        const users = await strapi.entityService.findMany("api::t-user.t-user", {
            filters: { age },
            fields: ["telegram_id"],
            limit: 1000,
        });
        const telegramIds = users.map((u) => u.telegram_id);
        const total = await strapi.entityService.count("api::test-result.test-result", {
            filters: { testId, telegram_id: { $in: telegramIds } },
        });
        const lowerCount = await strapi.entityService.count("api::test-result.test-result", {
            filters: { testId, iq: { $lt: Number(iq) }, telegram_id: { $in: telegramIds } },
        });
        let percent = total === 0 ? 0 : Math.round((lowerCount / total) * 100);
        percent = total === 1 ? 100 : percent;
        return { total, lowerCount, percent };
    },
    async countByProfession(ctx) {
        const { testId, iq, profession } = ctx.query;
        if (!testId || !iq || !profession) {
            return ctx.badRequest("Missing testId, iq or profession");
        }
        const users = await strapi.entityService.findMany("api::t-user.t-user", {
            filters: { profession },
            fields: ["telegram_id"],
            limit: 1000,
        });
        const telegramIds = users.map((u) => u.telegram_id);
        const total = await strapi.entityService.count("api::test-result.test-result", {
            filters: { testId, telegram_id: { $in: telegramIds } },
        });
        const lowerCount = await strapi.entityService.count("api::test-result.test-result", {
            filters: { testId, iq: { $lt: Number(iq) }, telegram_id: { $in: telegramIds } },
        });
        let percent = total === 0 ? 0 : Math.round((lowerCount / total) * 100);
        percent = total === 1 ? 100 : percent;
        return { total, lowerCount, percent };
    },
    async countByCelebrity(ctx) {
        const { iq } = ctx.query;
        if (!iq) {
            return ctx.badRequest("Missing testId, iq or profession");
        }
        const result = await strapi.documents("api::celebrity.celebrity").findFirst();
        console.log("result1", result);
        const celebrites = result.iqs;
        const celebrity = findMaxBelow(celebrites, iq);
        console.log(celebrity);
        return { data: celebrity };
    },
}));
function findMaxBelow(arr, threshold) {
    // Фильтруем тех, у кого maxIQ < threshold
    const filtered = arr.filter((o) => o.iq < threshold);
    console.log("filtered", filtered);
    if (filtered.length === 0)
        return null;
    // Находим максимальный maxIQ среди отфильтрованных
    const maxVal = Math.max(...filtered.map((o) => o.iq));
    // Возвращаем первую запись с этим maxIQ
    return filtered.find((o) => o.iq === maxVal);
}

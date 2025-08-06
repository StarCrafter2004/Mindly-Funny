"use strict";
/**
 * test controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController("api::test.test", ({ strapi }) => ({
    async getUserTests(ctx) {
        const userId = ctx.state.userId;
        const page = Number(ctx.query.page) || 1;
        const pageSize = Number(ctx.query.pageSize) || 10;
        const sort = ctx.query.sort || "createdAt:desc";
        const locale = ctx.query.locale || "en";
        const filter = ctx.query.filter || "all";
        console.log("filter", filter);
        const filtersMap = {
            all: {},
            free: {
                isTestFree: true,
            },
            paid: {
                isTestFree: false,
            },
            gift: {},
        };
        const additional = {
            isGift: false,
        };
        let maxGiftTests;
        if (filter === "gift") {
            additional.isGift = true;
            maxGiftTests = await strapi
                .documents("api::t-user.t-user")
                .findFirst({
                filters: {
                    telegram_id: userId,
                },
                fields: ["freeTests"],
            })
                .then((res) => res.freeTests);
        }
        const startIndex = (page - 1) * pageSize;
        let finalLimit = pageSize;
        if (filter === "gift") {
            // Обрезаем лимит так, чтобы не выйти за предел maxGiftTests
            const remaining = Math.max(maxGiftTests - startIndex, 0);
            finalLimit = Math.min(pageSize, remaining);
        }
        console.log(finalLimit);
        const finalFilters = { ...filtersMap[filter], ...additional };
        console.log(finalFilters);
        const testsResponse = await strapi.documents("api::test.test").findMany({
            sort: ["createdAt:desc"],
            limit: finalLimit,
            start: (page - 1) * pageSize,
            locale: locale,
            filters: finalFilters, // любые фильтры
        });
        const tests = testsResponse;
        const isPremium = await strapi
            .documents("api::t-user.t-user")
            .findFirst({
            filters: {
                telegram_id: userId,
            },
            fields: ["isPremium"],
        })
            .then((res) => res.isPremium);
        const paidTestIds = tests.filter((t) => !t.isTestFree).map((t) => t.documentId);
        console.log("userId", userId);
        const purchases = await strapi.db.query("api::purchase.purchase").findMany({
            where: {
                userId: userId,
                extra: { $in: paidTestIds },
            },
        });
        const purchasedIds = new Set(purchases.map((p) => p.extra));
        // Шаг 4: Добавляем флаг isPurchased к каждому тесту
        const mappedTests = tests.map((test) => ({
            ...test,
            isPurchased: test.isTestFree ? true : purchasedIds.has(test.documentId) || isPremium,
        }));
        // const base = await super.find(ctx); // включает data + meta
        const total = await strapi.documents("api::test.test").count({
            filters: finalFilters,
            locale,
        });
        console.log();
        /* 3. Считаем, сколько всего страниц */
        const pageCount = Math.ceil(total / pageSize);
        // Возвращаем данные с пагинацией
        return {
            data: finalLimit === 0 ? [] : mappedTests,
            pagination: {
                page,
                pageSize,
                total, // всего записей
                pageCount, // всего страниц
                hasNext: page < pageCount, // ← клиент сразу знает, подгружать ли дальше
            },
        };
    },
    async getPurchasedTests(ctx) {
        const userId = ctx.state.userId;
        const page = Number(ctx.query.page) || 1;
        const pageSize = Number(ctx.query.pageSize) || 10;
        const sort = ctx.query.sort || "createdAt:desc";
        const locale = ctx.query.locale || "en";
        const filter = ctx.query.filter || "all";
        console.log("filter", filter);
        const additional = {
            isGift: false,
        };
        const purchases = await strapi.documents("api::purchase.purchase").findMany({
            filters: { userId: userId, type: "test" },
            sort: ["createdAt:desc"],
            limit: pageSize,
            start: (page - 1) * pageSize,
        });
        console.log(purchases);
        const purchasesIds = purchases.filter((purchase) => purchase.type === "test").map((p) => p.extra);
        const finalFilters = { ...{ documentId: { $in: purchasesIds } }, ...additional };
        console.log("purchasesIds", purchasesIds);
        const testsResponse = await strapi.documents("api::test.test").findMany({
            sort: ["createdAt:desc"],
            locale: locale,
            filters: finalFilters,
        });
        const tests = testsResponse;
        console.log("userId", userId);
        // Шаг 4: Добавляем флаг isPurchased к каждому тесту
        const mappedTests = tests.map((test) => ({
            ...test,
            isPurchased: true,
        }));
        // const base = await super.find(ctx); // включает data + meta
        const total = await strapi.documents("api::purchase.purchase").count({
            filters: { userId: userId, type: "test" },
            locale,
        });
        /* 3. Считаем, сколько всего страниц */
        const pageCount = Math.ceil(total / pageSize);
        // Возвращаем данные с пагинацией
        return {
            data: mappedTests,
            pagination: {
                page,
                pageSize,
                total, // всего записей
                pageCount, // всего страниц
                hasNext: page < pageCount, // ← клиент сразу знает, подгружать ли дальше
            },
        };
    },
    async findOne(ctx) {
        // 1. Получаем documentId из route params
        const { id: documentId } = ctx.params;
        const userId = ctx.state.userId;
        // 2. Вызов базового метода findOne
        const { data, meta } = await super.findOne(ctx);
        console.log("data", data);
        console.log("documentId", documentId);
        console.log("userId", userId);
        // 3. Проверка покупки: ищем запись в таблице purchase
        const purchase = await strapi.documents("api::purchase.purchase").findMany({
            filters: {
                userId: { $eq: userId },
                extra: { $eq: documentId },
            },
        });
        console.log("super");
        const isResultPurchased = purchase.length > 0 || data.isReportFree;
        // 4. Добавляем поле isPurchased в attributes
        if (data && data) {
            data.isResultPurchased = isResultPurchased;
        }
        return { data, meta };
    },
    async botFindOne(ctx) {
        const { data, meta } = await super.findOne(ctx);
        return { data, meta };
    },
}));

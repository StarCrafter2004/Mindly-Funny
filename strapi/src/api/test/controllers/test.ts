/**
 * test controller
 */

import { factories } from "@strapi/strapi";
import { startOfDay, isBefore } from "date-fns";

async function restoreDailyLives(user) {
  const todayStart = startOfDay(new Date());

  if (!user.lastDailyCheck || isBefore(new Date(user.lastDailyCheck), todayStart)) {
    const minLives = await strapi
      .documents("api::app-config.app-config")
      .findFirst({ fields: ["minLives"] })
      .then((res) => res.minLives);

    // Восстанавливаем жизни до минимального уровня, если меньше
    const livesToSet = Math.max(user.lives, minLives);

    const updatedUser = await strapi.documents("api::t-user.t-user").update({
      documentId: user.documentId,
      data: {
        lives: livesToSet,
        lastDailyCheck: new Date().toISOString(),
      },
      fields: ["lives", "lastDailyCheck"],
    });

    return updatedUser;
  }

  return user;
}

export default factories.createCoreController("api::test.test", ({ strapi }) => ({
  async findInfo(ctx) {
    const { data, meta } = await super.find(ctx);

    return { data, meta };
  },
  async getUserTests(ctx) {
    const userId = ctx.state.userId;
    const page = Number(ctx.query.page) || 1;
    const pageSize = Number(ctx.query.pageSize) || 10;
    const locale = (ctx.query.locale as string) || "en";
    const filter = (ctx.query.filter as string) || "all";

    const filtersMap = {
      all: {},
      free: { isTestFree: { $eq: true } },
      paid: { isTestFree: { $eq: false } },
    };

    const finalFilters = { ...filtersMap[filter] };

    // 1. Получаем все ID с правильной сортировкой
    const allTests = await strapi.documents("api::test.test").findMany({
      fields: ["id"],

      sort: ["pinned:desc", "createdAt:desc"],
      locale,
      filters: finalFilters,
    });

    const total = allTests.length;
    const pageCount = Math.ceil(total / pageSize);

    // 2. Считаем границы страницы
    const startIndex = (page - 1) * pageSize;
    const pageIds = allTests.slice(startIndex, startIndex + pageSize).map((t) => t.documentId);

    if (pageIds.length === 0) {
      return {
        data: [],
        pagination: { page, pageSize, total, pageCount, hasNext: page < pageCount },
        lives: 0,
      };
    }

    // 3. Достаём тесты только по этим ID, сохраняя сортировку
    const tests = await strapi.documents("api::test.test").findMany({
      filters: { documentId: { $in: pageIds } },
      sort: ["pinned:desc", "createdAt:desc"],
      locale,
    });

    // 4. Достаём пользователя и обновляем жизни
    let user = await strapi.documents("api::t-user.t-user").findFirst({
      filters: { telegram_id: userId },
      fields: ["isPremium", "lives", "lastDailyCheck"],
    });

    user = await restoreDailyLives(user);

    const { isPremium, lives } = user;

    // 5. Находим покупки
    const paidTestIds = tests.filter((t) => !t.isTestFree).map((t) => t.documentId);
    const purchases = await strapi.db.query("api::purchase.purchase").findMany({
      where: { userId, extra: { $in: paidTestIds } },
    });

    const purchasedIds = new Set(purchases.map((p) => p.extra));

    // 6. Проставляем isPurchased
    const mappedTests = tests.map((test) => ({
      ...test,
      isPurchased: test.isTestFree ? true : purchasedIds.has(test.documentId) || isPremium,
    }));

    // 7. Возвращаем результат
    return {
      data: mappedTests,
      pagination: {
        page,
        pageSize,
        total,
        pageCount,
        hasNext: page < pageCount,
      },
      lives,
    };
  },
  async getPurchasedTests(ctx) {
    const userId = ctx.state.userId;
    const page = Number(ctx.query.page) || 1;
    const pageSize = Number(ctx.query.pageSize) || 10;
    const sort = ctx.query.sort || "createdAt:desc";
    const locale = (ctx.query.locale as string) || "en";
    const filter = (ctx.query.filter as string) || "all";

    const purchases = await strapi.documents("api::purchase.purchase").findMany({
      filters: { userId: userId, type: "test" },
      sort: ["createdAt:desc"],
      limit: pageSize,
      start: (page - 1) * pageSize,
    });

    const purchasesIds = purchases.filter((purchase) => purchase.type === "test").map((p) => p.extra);

    const finalFilters = { ...{ documentId: { $in: purchasesIds } } };

    const testsResponse = await strapi.documents("api::test.test").findMany({
      sort: ["createdAt:desc"],
      locale: locale,
      filters: finalFilters,
    });

    const tests = testsResponse;

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

    let user = await strapi.documents("api::t-user.t-user").findFirst({
      filters: {
        telegram_id: userId,
      },
      fields: ["lives", "lastDailyCheck"],
    });
    user = await restoreDailyLives(user);

    const lives = user.lives;

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
      lives,
    };
  },

  async findOne(ctx) {
    // 1. Получаем documentId из route params
    const { id: documentId } = ctx.params;

    const userId = ctx.state.userId;

    // 2. Вызов базового метода findOne
    const { data, meta } = await super.findOne(ctx);

    // 3. Проверка покупки: ищем запись в таблице purchase
    const purchase = await strapi.documents("api::purchase.purchase").findMany({
      filters: {
        userId: { $eq: userId },
        extra: { $eq: documentId },
      },
    });

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
  async clientfindMany(ctx) {
    const userId = ctx.state.userId;
    const { data: tests, meta } = await super.find(ctx);

    // Получаем информацию о пользователе и восстанавливаем жизни
    let user = await strapi.documents("api::t-user.t-user").findFirst({
      fields: ["isPremium", "lives", "lastDailyCheck"],
      filters: {
        telegram_id: userId,
      },
    });
    user = await restoreDailyLives(user);

    const isPremium = user.isPremium;

    // Получаем ID всех платных тестов
    const paidTestIds = tests.filter((t) => !t.isTestFree).map((t) => t.documentId);

    // Получаем покупки пользователя по этим тестам
    const purchases = await strapi.db.query("api::purchase.purchase").findMany({
      where: {
        userId: userId,
        extra: { $in: paidTestIds },
      },
    });
    const purchasedIds = new Set(purchases.map((p) => p.extra));

    // Добавляем поле isPurchased
    const mappedTests = tests.map((test) => ({
      ...test,
      isPurchased: test.isTestFree ? true : purchasedIds.has(test.documentId) || isPremium,
    }));

    return { data: mappedTests, meta, lives: user.lives };
  },
}));

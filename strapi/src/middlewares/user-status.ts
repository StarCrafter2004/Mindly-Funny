import { validate, parse, type InitData } from "@telegram-apps/init-data-node";
const EXCLUDE_PATHS = ["/api/tests", "/api/payments", "/api/purchases", "/api/ton-config"];
const EXCLUDE_POST_PATHS = ["/api/tests", "/api/payments", "/api/purchases", "/api/referrals"];
const EXCLUDE_GET_PATHS = ["/api/t-users", "/api/bot-tests"];
const EXCLUDE_PUT_PATHS = ["/api/t-users/update-premium/", "/api/tests"];

export default (config, { strapi }) => {
  return async (ctx, next) => {
    const path = ctx.request.path;
    if (!ctx.request.url.startsWith("/api")) return next();
    const isExcludedGetPath = EXCLUDE_GET_PATHS.some((prefix) => ctx.request.path.startsWith(prefix));
    if (ctx.method === "GET" && isExcludedGetPath && ctx.request.path != "/api/tests/user-tests") {
      console.log("⚡ GET request — пропускаем middleware:", ctx.request.path);
      return await next();
    }

    const isExcludedPutPath = ctx.method === "PUT" && EXCLUDE_PUT_PATHS.some((p) => path.startsWith(p));

    if (isExcludedPutPath) {
      console.log("⚡ Excluded PUT path:", ctx.request.path);
      return await next();
    }

    // игнорируем исключения
    if (EXCLUDE_PATHS.includes(ctx.request.path)) {
      console.log("⚡ Excluded path:", ctx.request.path);
      return await next();
    }

    if ((ctx.method === "POST" || ctx.method === "PUT") && EXCLUDE_POST_PATHS.includes(ctx.request.path)) {
      console.log("⚡ Excluded POST path:", ctx.request.path);
      return await next();
    }

    await next();

    // Проверяем токен (ctx.state.user доступен, если auth middleware уже отработал)
    const userId = ctx.state.userId;
    if (!userId) {
      return; // гость → ничего не добавляем
    }

    const fullUser = await strapi.documents("api::t-user.t-user").findFirst({
      fields: ["isPremium", "premiumUntil"],
      filters: {
        telegram_id: userId,
      },
    });

    let premiumUntil = fullUser.premiumUntil;

    const now = new Date();
    if (fullUser.isPremium && premiumUntil && new Date(premiumUntil) <= now) {
      await strapi.documents("api::t-user.t-user").update({
        documentId: fullUser.documentId,
        data: { isPremium: false },
      });
    }

    // Если ответ был объектом — встраиваем данные в него
    if (ctx.body && typeof ctx.body === "object") {
      ctx.body = {
        ...ctx.body,
        _userStatus: {
          premiumStatus: fullUser.isPremium,
          premiumUntil,
        },
      };
    }
  };
};

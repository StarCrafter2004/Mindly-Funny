import { validate, parse, type InitData } from "@telegram-apps/init-data-node";
const EXCLUDE_PATHS = ["/api/tests", "/api/payments", "/api/purchases", "/api/ton-config", "/api/increment-life"];
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

    const auth = ctx.request.headers["authorization"] || "";
    const [method, initDataRaw = ""] = auth.split(" ");

    if (method !== "tma" || !initDataRaw) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized: missing initData" };
      return;
    }

    try {
      validate(initDataRaw, process.env.TELEGRAM_BOT_TOKEN!, { expiresIn: 86400 });
      const initData = parse(initDataRaw);

      ctx.state.userId = String(initData.user.id);
      ctx.state.initData = initData;
    } catch (err: any) {
      ctx.status = 403;
      ctx.body = { error: `Unauthorized: ${err.message}` };
      return;
    }

    await next();
  };
};

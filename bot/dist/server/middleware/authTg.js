"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authTgMiddleware = authTgMiddleware;
const init_data_node_1 = require("@telegram-apps/init-data-node");
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
function authTgMiddleware(req, res, next) {
    const auth = req.header("Authorization") || "";
    const [method, initDataRaw = ""] = auth.split(" ");
    if (method !== "tma" || !initDataRaw) {
        res.status(401).json({ error: "Unauthorized: missing initData" });
    }
    else {
        try {
            (0, init_data_node_1.validate)(initDataRaw, BOT_TOKEN, { expiresIn: 86400 });
            const initData = (0, init_data_node_1.parse)(initDataRaw);
            res.locals.initData = initData;
            res.locals.userId = String(initData?.user?.id);
            next();
        }
        catch (err) {
            res.status(403).json({ error: `Unauthorized: ${err.message}` });
        }
    }
}

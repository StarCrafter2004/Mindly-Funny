"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const express_1 = __importDefault(require("express"));
const invoice_1 = __importDefault(require("./routes/invoice"));
const authTg_1 = require("./middleware/authTg");
const cors_1 = __importDefault(require("cors"));
async function startServer() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((0, cors_1.default)({
        origin: "*", // или какой у тебя фронт
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true, // если используешь куки или авторизацию
    })); // обязательно для preflight
    app.use(authTg_1.authTgMiddleware);
    app.use("/bot", invoice_1.default);
    const port = process.env.PORT ? +process.env.PORT : 4000;
    app.listen(port, () => {
        console.log(`✅ Express server запущен на http://localhost:${port}`);
    });
}

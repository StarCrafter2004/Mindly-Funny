import express from "express";
import invoiceRoutes from "./routes/invoice";
import { authTgMiddleware } from "./middleware/authTg";
import cors from "cors";

export async function startServer() {
  const app = express();
  app.use(express.json());

  app.use(
    cors({
      origin: "*", // или какой у тебя фронт
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true, // если используешь куки или авторизацию
    })
  ); // обязательно для preflight

  app.use("/bot", authTgMiddleware, invoiceRoutes);

  const port = process.env.PORT ? +process.env.PORT : 4000;
  app.listen(port, () => {
    console.log(`✅ Express server запущен на http://localhost:${port}`);
  });
}

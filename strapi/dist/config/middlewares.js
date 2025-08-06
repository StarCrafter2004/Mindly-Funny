"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [
    "strapi::logger",
    "strapi::errors",
    "strapi::security",
    "strapi::cors",
    "strapi::poweredBy",
    "strapi::query",
    "strapi::body",
    "strapi::session",
    "strapi::favicon",
    "strapi::public",
    {
        name: "global::auth-tg-middleware", // 👈 имя по пути src/middlewares/auth-tg-middleware
        config: {}, // можно передавать настройки при необходимости
    },
];

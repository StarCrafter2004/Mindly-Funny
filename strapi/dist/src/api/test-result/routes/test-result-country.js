"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: "GET",
            path: "/test-results/count-by-region",
            handler: "test-result.countByRegion",
            config: {
                auth: false, // если не нужна авторизация, иначе поставь true
            },
        },
        {
            method: "GET",
            path: "/test-results/count-by-age",
            handler: "test-result.countByAge",
            config: {
                auth: false, // если не нужна авторизация, иначе поставь true
            },
        },
        {
            method: "GET",
            path: "/test-results/count-by-profession",
            handler: "test-result.countByProfession",
            config: {
                auth: false, // если не нужна авторизация, иначе поставь true
            },
        },
        {
            method: "GET",
            path: "/test-results/count-by-celebrity",
            handler: "test-result.countByCelebrity",
            config: {
                auth: false, // если не нужна авторизация, иначе поставь true
            },
        },
    ],
};

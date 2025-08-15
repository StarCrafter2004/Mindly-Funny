"use strict";
/**
 * payment controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController("api::payment.payment", ({ strapi }) => ({
    async updateStatus(ctx) {
        const { payload, payment_status } = ctx.params;
        const documentId = await strapi
            .documents("api::payment.payment")
            .findFirst({
            filters: {
                payload,
            },
        })
            .then((res) => res.documentId);
        const res = await strapi.documents("api::payment.payment").update({
            documentId,
            data: {
                payment_status,
            },
        });
    },
}));

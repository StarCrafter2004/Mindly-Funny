"use strict";
/**
 * purchase controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController("api::purchase.purchase", ({ strapi }) => ({
    async createClient(ctx) {
        // Calling the default core action
        const userId = ctx.state.userId;
        const { data, meta } = await super.create(ctx);
        const knex = strapi.db.connection;
        await strapi.db.transaction(async ({ trx, rollback, commit }) => {
            await knex("t_users").where("telegram_id", userId).decrement("free_reports", 1).transacting(trx);
        });
        return { data, meta };
    },
}));

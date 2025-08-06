"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * referral controller
 */
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController("api::referral.referral", ({ strapi }) => ({
    async create(ctx) {
        var _a;
        const { user_id, referrer_id } = ((_a = ctx.request.body) === null || _a === void 0 ? void 0 : _a.data) || {};
        const knex = strapi.db.connection;
        console.log("start");
        await strapi.db.transaction(async ({ trx, rollback, commit }) => {
            await knex("t_users").where({ telegram_id: referrer_id }).increment("free_reports_counter", 1).transacting(trx);
            await knex("t_users").where({ telegram_id: referrer_id }).increment("free_tests_counter", 1).transacting(trx);
        });
        console.log("stop");
        const { data, meta } = await super.create(ctx);
        return { data, meta };
    },
}));

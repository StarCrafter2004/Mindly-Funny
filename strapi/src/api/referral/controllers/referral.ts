/**
 * referral controller
 */
import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::referral.referral", ({ strapi }) => ({
  async create(ctx) {
    const { user_id, referrer_id } = ctx.request.body?.data || {};
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

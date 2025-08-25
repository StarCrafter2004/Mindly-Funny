/**
 * referral controller
 */
import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::referral.referral", ({ strapi }) => ({
  async findInfo(ctx) {
    const { data, meta } = await super.find(ctx);

    return { data, meta };
  },
  async create(ctx) {
    const { data, meta } = await super.create(ctx);
    return { data, meta };
  },
  async incrementGiftCounter(ctx) {
    const userId = ctx.state.userId;

    const refer = await strapi.documents("api::referral.referral").findFirst({
      filters: {
        user_id: userId,
      },
    });

    const referId = refer.referrer_id;

    const user = await strapi.documents("api::t-user.t-user").findFirst({
      filters: {
        telegram_id: userId,
      },
    });
    const isTestPassed = user.isTestPassed;

    const knex = strapi.db.connection;
    console.log("isTestPassed", isTestPassed);

    if (!isTestPassed) {
      await strapi.db.transaction(async ({ trx, rollback, commit }) => {
        await knex("t_users").where({ telegram_id: referId }).increment("free_premium_counter", 1).transacting(trx);
        await knex("t_users").where({ telegram_id: referId }).increment("free_lives_counter", 1).transacting(trx);
        await knex("t_users").where({ telegram_id: userId }).update({ is_test_passed: true }).transacting(trx);
      });
    }

    return { data: { referId } };
  },
}));

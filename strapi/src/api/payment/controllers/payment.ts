/**
 * payment controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::payment.payment", ({ strapi }) => ({
  async findInfo(ctx) {
    const { data, meta } = await super.find(ctx);

    return { data, meta };
  },
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

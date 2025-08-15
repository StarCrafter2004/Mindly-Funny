export default {
  routes: [
    {
      method: "PUT",
      path: "/payment/update-payment",
      handler: "payment.updateStatus",
      config: {
        auth: false, // если не нужна авторизация, иначе поставь true
      },
    },
  ],
};

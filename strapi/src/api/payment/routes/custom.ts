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
    {
      method: "GET",
      path: "/payments/info",
      handler: "payment.findInfo",
      config: {
        auth: false, // если не нужна авторизация, иначе поставь true
      },
    },
  ],
};

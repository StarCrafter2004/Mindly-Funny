export default {
  routes: [
    {
      method: "POST",
      path: "/purchases/client",
      handler: "purchase.createClient",
      config: {
        auth: false, // если не нужна авторизация, иначе поставь true
      },
    },
    {
      method: "GET",
      path: "/purchases/info",
      handler: "purchase.findInfo",
      config: {
        auth: false, // если не нужна авторизация, иначе поставь true
      },
    },
  ],
};

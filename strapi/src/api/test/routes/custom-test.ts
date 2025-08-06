export default {
  routes: [
    {
      method: "GET",
      path: "/tests/user-tests",
      handler: "test.getUserTests",
      config: {
        auth: false, // если не нужна авторизация, иначе поставь true
      },
    },
    {
      method: "GET",
      path: "/tests/purchased-tests",
      handler: "test.getPurchasedTests",
      config: {
        auth: false, // если не нужна авторизация, иначе поставь true
      },
    },
    {
      method: "GET",
      path: "/bot-tests/:id",
      handler: "test.botFindOne",
      config: {
        auth: false, // если не нужна авторизация, иначе поставь true
      },
    },
  ],
};

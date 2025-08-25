export default {
  routes: [
    {
      method: "GET",
      path: "/test-results/stats/:id",
      handler: "test-result.getTestResultWithStats",
      config: {
        auth: false, // если не нужна авторизация, иначе поставь true
      },
    },
    {
      method: "GET",
      path: "/test-results/info",
      handler: "test-result.findInfo",
      config: {
        auth: false, // если не нужна авторизация, иначе поставь true
      },
    },
  ],
};

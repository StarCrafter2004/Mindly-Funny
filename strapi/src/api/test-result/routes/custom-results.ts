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
  ],
};

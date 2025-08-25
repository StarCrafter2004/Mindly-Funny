export default {
  routes: [
    {
      method: "PUT",
      path: "/t-users/update-premium/:id",
      handler: "t-user.updatePremium",
    },
    {
      method: "POST",
      path: "/free-prem",
      handler: "t-user.updateFreePremium",
    },
    {
      method: "POST",
      path: "/free-lives",
      handler: "t-user.updateFreeLivesCounter",
    },
    {
      method: "POST",
      path: "/decrement-life",
      handler: "t-user.decrementLife",
    },
    {
      method: "POST",
      path: "/increment-life",
      handler: "t-user.incrementLife",
    },
    {
      method: "GET",
      path: "/t-users/info",
      handler: "t-user.findInfo",
      config: {
        auth: false, // если не нужна авторизация, иначе поставь true
      },
    },
  ],
};

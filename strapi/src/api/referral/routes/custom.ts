export default {
  routes: [
    {
      method: "POST",
      path: "/referrals/increment",
      handler: "referral.incrementGiftCounter",
    },
    {
      method: "GET",
      path: "/referrals/info",
      handler: "referral.findInfo",
      config: {
        auth: false, // если не нужна авторизация, иначе поставь true
      },
    },
  ],
};
